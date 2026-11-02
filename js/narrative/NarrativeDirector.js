/**
 * NarrativeDirector.js
 * Implements NarrativeRegistry and HierarchicalProbabilisticNarrativeDirector
 * for "Mytholohiya". Supports multi-substory phase progression (EARLY_GAME ->
 * MID_GAME -> LATE_GAME), weather & time-of-day tracking for ambient audio
 * and visualizers, item-unlocked actions, and entity memory callbacks.
 */

import { StatResolver, CheckOutcome } from '../mechanics/StatResolver.js';
import { buildPrologueScenarios } from '../data/character/PlayerBackgrounds.js';
import { obscureCreatureReferences } from '../data/lore/MythologyCodex.js';
import { getCreatureTaleData, buildTaleResolutionStory } from '../data/lore/CreatureTales.js';
import {
  PHASES,
  PHASE_ORDER,
  VALID_WEATHERS,
  TIME_OF_DAY_CYCLE,
  STATUS_CONDITIONS,
  ItemConditionFlags
} from '../core/Constants.js';
import { resolveAtmosphere, isSeamlessHookCompatible } from '../core/AtmosphereResolver.js';
import { ItemRegistry } from '../mechanics/ItemRegistry.js';

function formatItemName(id) {
  if (!id) return 'Unknown Item';
  if (typeof id === 'object' && id.name) return id.name;
  const tpl = ItemRegistry.getTemplate(id);
  if (tpl && tpl.name) return tpl.name;
  return String(id)
    .replace(/^item_/, '')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Narrative weather tags and the actual weather states each one is consistent with.
const WEATHER_TAGS = ['raining', 'clear_sky', 'fog_gathering', 'rain_stopping'];
const WEATHER_TO_TAG = {
  CLEAR: 'clear_sky',
  DRIZZLE: 'raining',
  MONSOON: 'raining',
  'SPIRIT FOG': 'fog_gathering'
};
const WEATHER_COMPATIBLE_TAGS = {
  CLEAR: ['clear_sky'],
  DRIZZLE: ['raining', 'rain_stopping'],
  MONSOON: ['raining'],
  'SPIRIT FOG': ['fog_gathering']
};

class NarrativeRegistryStore {
  constructor() {
    this.substories = new Map();
    this.miscScenarios = [];
  }

  registerSubstory(substory) {
    if (!substory || !substory.substoryId) return;
    this.substories.set(substory.substoryId, substory);
  }

  registerMiscScenario(scenario) {
    if (!scenario || !scenario.id) return;
    const exists = this.miscScenarios.some((s) => s.id === scenario.id);
    if (!exists) {
      this.miscScenarios.push({
        ...scenario,
        isMisc: true
      });
    }
  }

  getSubstory(substoryId) {
    return this.substories.get(substoryId) || null;
  }

  getSubstoriesByPhase(phase) {
    return [...this.substories.values()].filter((s) => s.phase === phase);
  }

  getAllSubstories() {
    return [...this.substories.values()];
  }

  getMiscScenarios() {
    return [...this.miscScenarios];
  }
}

export const NarrativeRegistry = new NarrativeRegistryStore();

if (typeof globalThis !== 'undefined') {
  globalThis.NarrativeRegistry = NarrativeRegistry;
}

export class HierarchicalProbabilisticNarrativeDirector {
  /**
   * @param {Object} params
   * @param {import('../core/ECS.js').World} params.world
   * @param {import('../core/EventBus.js').EventBus} params.eventBus
   * @param {import('../core/TypewriterEngine.js').TypewriterEngine} params.typewriter
   * @param {NarrativeRegistryStore} [params.registry]
   */
  constructor({ world, eventBus, typewriter, registry = NarrativeRegistry }) {
    this.world = world;
    this.eventBus = eventBus;
    this.typewriter = typewriter;
    this.registry = registry;

    this.currentPhase = 'EARLY_GAME';
    this.activeSubstory = null;
    this.completedSubstoryIds = new Set();
    this.currentScenario = null;
    this.currentWeather = 'DRIZZLE';
    this.currentTimeOfDay = 'DAWN';
    this.currentEnvironment = 'OUTDOOR';
    this.timeCycleIndex = 0;
    this.scenariosInCurrentTime = 0;
    this.scenariosUntilNextTime = this._rollStepDuration(2, 4);
    this.scenariosInCurrentWeather = 0;
    this.scenariosUntilNextWeather = this._rollStepDuration(2, 4);
    this.eclipseActive = false;
    this.scenariosInEclipse = 0;
    this.prologueQueue = [];
    this.visitedScenarioIds = new Set();
    this.visitedMiscIds = new Set();
    this.activeTags = new Set(['raining']);
    this.lastEmittedTags = ['raining'];
    this.turnCount = 0;
    this.isGameOver = false;
    this.awaitingContinue = false;
    this.currentScenarioDeltas = [];
    this.trackingDeltas = false;
    this.chronicleLog = [];
    this.currentPassiveList = [];
    this.instinctCheckIndex = 0;

    if (this.typewriter && typeof this.typewriter.setInstinctAnnotator === 'function') {
      this.typewriter.setInstinctAnnotator((paragraphEl) => {
        this._annotateInstinctInParagraph(paragraphEl);
      });
    }

    this.eventBus.on('inventory:add', ({ templateId, item }) => {
      if (this.currentScenario && this.trackingDeltas) {
        let name = '';
        if (item && item.name) {
          name = item.name;
        } else if (templateId) {
          name = formatItemName(templateId);
        }
        if (name) {
          this.currentScenarioDeltas.push({
            type: 'item',
            change: 1,
            name
          });
        }
      }
    });

    this.eventBus.on('inventory:remove', ({ item, name }) => {
      if (this.currentScenario && this.trackingDeltas) {
        const itemName = (item && item.name) || (name ? formatItemName(name) : '');
        if (itemName) {
          this.currentScenarioDeltas.push({
            type: 'item',
            change: -1,
            name: itemName
          });
        }
      }
    });

    this.eventBus.on('player:modifyRemnants', ({ amount }) => {
      if (this.currentScenario && this.trackingDeltas && typeof amount === 'number' && amount !== 0) {
        this.currentScenarioDeltas.push({
          type: 'currency',
          change: amount,
          name: 'Piloncitos'
        });
      }
    });

    this.eventBus.on('player:modifyVitality', ({ amount }) => {
      if (this.currentScenario && this.trackingDeltas && typeof amount === 'number' && amount !== 0) {
        this.currentScenarioDeltas.push({
          type: 'health',
          change: amount,
          name: 'HP'
        });
      }
    });

    this.eventBus.on('player:defeated', () => {
      this.isGameOver = true;
      this.awaitingContinue = false;
      this._presentDefeatScreen();
    });

    this.eventBus.on('ui:updateInventory', () => {
      if (this.currentScenario && !this.typewriter.isTyping && !this.isGameOver) {
        if (this.awaitingContinue) {
          this._presentContinuePrompt();
        } else {
          this._presentChoices(this.currentScenario);
        }
      }
    });
  }

  startScenario(substoryId) {
    this.isGameOver = false;
    this.awaitingContinue = false;
    this.chronicleLog = [];
    this.visitedScenarioIds.clear();
    this.visitedMiscIds.clear();
    this.completedSubstoryIds.clear();
    this.currentPhase = 'EARLY_GAME';
    this.turnCount = 0;
    this.timeCycleIndex = 0;
    this.scenariosInCurrentTime = 0;
    this.scenariosUntilNextTime = this._rollStepDuration(2, 4);
    this.scenariosInCurrentWeather = 0;
    this.scenariosUntilNextWeather = this._rollStepDuration(2, 4);

    if (substoryId) {
      this.activeSubstory = this.registry.getSubstory(substoryId);
    } else {
      const earlyPool = this.registry.getSubstoriesByPhase(this.currentPhase);
      this.activeSubstory = earlyPool[0] || this.registry.getAllSubstories()[0] || null;
    }

    const player = this.world.getEntity('player');
    const identity = player ? player.getComponent('Identity') : null;

    if (identity) {
      this.prologueQueue = buildPrologueScenarios(identity);
    } else {
      this.prologueQueue = [];
    }

    const next = this.drawNextScenario();
    if (next) {
      this.presentScenario(next);
    }
  }

  /**
   * Advance to the next uncompleted substory in the current phase, or advance
   * to the next phase (EARLY_GAME -> MID_GAME -> LATE_GAME).
   * @returns {boolean} True if a new substory was activated
   */
  _advanceSubstoryOrPhase() {
    if (this.activeSubstory) {
      this.completedSubstoryIds.add(this.activeSubstory.substoryId);
    }

    // Check remaining substories in current phase
    const samePhaseSubstories = this.registry
      .getSubstoriesByPhase(this.currentPhase)
      .filter((s) => !this.completedSubstoryIds.has(s.substoryId));

    if (samePhaseSubstories.length > 0) {
      this.activeSubstory = samePhaseSubstories[0];
      return true;
    }

    // Advance through subsequent phases
    const currentPhaseIdx = PHASE_ORDER.indexOf(this.currentPhase);
    for (let i = currentPhaseIdx + 1; i < PHASE_ORDER.length; i += 1) {
      const nextPhase = PHASE_ORDER[i];
      const nextPool = this.registry
        .getSubstoriesByPhase(nextPhase)
        .filter((s) => !this.completedSubstoryIds.has(s.substoryId));
      if (nextPool.length > 0) {
        this.currentPhase = nextPhase;
        this.activeSubstory = nextPool[0];
        return true;
      }
    }

    return false;
  }

  isScenarioEligible(scenario) {
    if (scenario.phase && scenario.phase !== 'ANY' && scenario.phase !== this.currentPhase) {
      return false;
    }

    if (typeof scenario.minLevel === 'number' && scenario.minLevel > 1) {
      const player = this.world.getEntity('player');
      const exp = player ? player.getComponent('Experience') : null;
      const playerLevel = exp ? exp.level : 1;
      if (playerLevel < scenario.minLevel) {
        return false;
      }
    }

    if (Array.isArray(scenario.requiredTags) && scenario.requiredTags.length > 0) {
      for (const reqTag of scenario.requiredTags) {
        if (!this.activeTags.has(reqTag) && !this.world.hasFlag(reqTag)) {
          return false;
        }
      }
    }

    if (Array.isArray(scenario.blockedByTags) && scenario.blockedByTags.length > 0) {
      for (const blockTag of scenario.blockedByTags) {
        if (this.activeTags.has(blockTag) || this.world.hasFlag(blockTag)) {
          return false;
        }
      }
    }

    return true;
  }

  calculateScenarioWeight(scenario) {
    let weight = typeof scenario.baseWeight === 'number' ? scenario.baseWeight : 1.0;

    if (scenario.affinityWeights && typeof scenario.affinityWeights === 'object') {
      for (const [tag, bonus] of Object.entries(scenario.affinityWeights)) {
        if (this.activeTags.has(tag) || this.world.hasFlag(tag)) {
          weight += Number(bonus) || 0;
        }
      }
    }

    // Dynamic Shifts based on Panganib (Danger / Spirit Scent) Heat
    const player = this.world.getEntity('player');
    const panganib = player ? player.getComponent('Panganib') : null;
    const heat = panganib ? panganib.heat : 10;

    const stalkerTags = [
      'aswang_complex',
      'nocturnal_stalker',
      'sigbin_pack',
      'tiyanak_ambush',
      'wakwak_scout',
      'predator_encounter',
      'danger_encounter'
    ];
    const isStalkerScenario =
      scenario.intrinsicTags && scenario.intrinsicTags.some((t) => stalkerTags.includes(t));

    const isPeacefulScenario =
      scenario.intrinsicTags &&
      scenario.intrinsicTags.some((t) =>
        ['chill_story', 'rest_hearth', 'peaceful_trade', 'anito_shrine'].includes(t)
      );

    if (heat >= 75) {
      if (isStalkerScenario) weight += 1.8;
      if (isPeacefulScenario) weight = Math.max(0.01, weight * 0.3);
    } else if (heat >= 50) {
      if (isStalkerScenario) weight += 0.8;
      if (isPeacefulScenario) weight = Math.max(0.01, weight * 0.6);
    } else if (heat < 25) {
      if (isPeacefulScenario) weight += 0.5;
      if (isStalkerScenario) weight = Math.max(0.01, weight * 0.5);
    }

    // Dynamic Shifts based on Day/Night & Lunar Bakunawa Cycle
    if (this.currentTimeOfDay === 'DAY' || this.currentTimeOfDay === 'DAWN') {
      if (isPeacefulScenario || (scenario.intrinsicTags && scenario.intrinsicTags.includes('people_in_need'))) {
        weight += 0.6;
      }
    } else if (this.currentTimeOfDay === 'NIGHT') {
      if (isStalkerScenario) {
        weight += 0.8;
      }
    } else if (this.currentTimeOfDay === 'ECLIPSE') {
      const isEclipseRite =
        scenario.intrinsicTags &&
        scenario.intrinsicTags.some((t) =>
          ['bakunawa_maw', 'acoustic_shock', 'eclipse_omen', 'aswang_complex'].includes(t)
        );
      if (isEclipseRite) {
        weight += 2.0;
      }
    }

    // Hidden Wealth Attraction Mechanic:
    // Carrying excessive piloncitos increases the unseen risk of getting mugged by bandits,
    // challenge-seeking warriors, highwaymen, and creatures drawn to gold and shiny treasures.
    const remnantsComp = player ? player.getComponent('Remnants') : null;
    const coins = remnantsComp ? remnantsComp.count : 0;

    const goldSeekerTags = [
      'bandit_ambush',
      'outlaw',
      'highwayman',
      'thief_encounter',
      'bagani_challenge',
      'mercenary_warrior',
      'warrior_mugger',
      'duwende_trick',
      'treasure_coveter',
      'toll_encounter',
      'pirate_raider',
      'pickpocket'
    ];

    const isValuableSeeker =
      (scenario.intrinsicTags && scenario.intrinsicTags.some((t) => goldSeekerTags.includes(t))) ||
      (scenario.id && (
        scenario.id.includes('bandit') ||
        scenario.id.includes('pickpocket') ||
        scenario.id.includes('outlaw') ||
        scenario.id.includes('toll') ||
        scenario.id.includes('thief') ||
        scenario.id.includes('raider') ||
        scenario.id.includes('bagani')
      ));

    if (coins >= 25) {
      if (isValuableSeeker) weight += 2.2;
    } else if (coins >= 15) {
      if (isValuableSeeker) weight += 1.4;
    } else if (coins >= 8) {
      if (isValuableSeeker) weight += 0.7;
    }

    // Dynamic Faction Retribution and Alliance Weighting
    if (this.world) {
      if (this.world.hasFlag('rep_rajahnate_enemy') || this.world.hasFlag('bounty_on_head')) {
        if (scenario.intrinsicTags && scenario.intrinsicTags.includes('bounty_hunter')) {
          weight += 2.5;
        }
      }
      if (this.world.hasFlag('cursed_by_anito') || this.world.hasFlag('stole_shrine_gold')) {
        if (scenario.intrinsicTags && scenario.intrinsicTags.includes('anito_curse')) {
          weight += 3.0;
        }
      }
      if (this.world.hasFlag('rep_karakoa_enemy') || this.world.hasFlag('defied_sea_raiders')) {
        if (scenario.intrinsicTags && scenario.intrinsicTags.includes('pirate_ambush')) {
          weight += 2.5;
        }
      }
      if (this.world.hasFlag('rep_aswang_cult_enemy')) {
        if (scenario.intrinsicTags && scenario.intrinsicTags.includes('cult_night_raid')) {
          weight += 2.5;
        }
      }
      if (this.world.hasFlag('rep_headhunters_enemy')) {
        if (scenario.intrinsicTags && scenario.intrinsicTags.includes('headhunter_ambush')) {
          weight += 2.5;
        }
      }

      // Dynamic boost for chill/hearth scenarios when player carries unresolved creature memories
      if (this.world.hasFlag('has_pending_creature_tales')) {
        if (this.isChillOrSocialScenario(scenario)) {
          weight += 2.8;
        }
      }
    }

    return Math.max(0.0001, weight);
  }

  isChillOrSocialScenario(scenario) {
    if (!scenario) return false;
    const tags = scenario.intrinsicTags || [];
    return (
      tags.some((t) =>
        [
          'chill_story',
          'rest_hearth',
          'social_encounter',
          'sanctuary_rest',
          'campfire',
          'peaceful_trade',
          'anito_shrine',
          'settlement_edge',
          'blacksmith_forge'
        ].includes(t)
      ) ||
      ['CABIN', 'VILLAGE'].includes(scenario.environment) ||
      (scenario.id &&
        (scenario.id.includes('campfire') ||
          scenario.id.includes('potter') ||
          scenario.id.includes('hearth') ||
          scenario.id.includes('stargazer') ||
          scenario.id.includes('taboan') ||
          scenario.id.includes('grove')))
    );
  }

  triggerEclipse(reason = 'Bakunawa') {
    this.eclipseActive = true;
    this.currentTimeOfDay = 'ECLIPSE';
    this.scenariosInEclipse = 1;
    this.world.setFlag('lunar_eclipse_active');
    this.world.setFlag('bakunawa_swallowing_moon');
    this.eventBus.emit('world:eclipseStarted', { reason });
    this.eventBus.emit('log:mechanical', {
      type: 'status_apply',
      text: '❖ COSMIC ECLIPSE: The giant serpent Bakunawa coils around the moon! Sound acoustic gongs and light wards before darkness devours the sky.'
    });
  }

  drawNextScenario() {
    if (this.prologueQueue.length > 0) {
      return this.prologueQueue.shift();
    }

    let substoryCandidates =
      this.activeSubstory && Array.isArray(this.activeSubstory.scenarios)
        ? this.activeSubstory.scenarios.filter(
          (s) => !this.visitedScenarioIds.has(s.id) && this.isScenarioEligible(s)
        )
        : [];

    if (substoryCandidates.length === 0) {
      const advanced = this._advanceSubstoryOrPhase();
      if (!advanced) {
        return null;
      }
      substoryCandidates = this.activeSubstory.scenarios.filter(
        (s) => !this.visitedScenarioIds.has(s.id) && this.isScenarioEligible(s)
      );
      if (substoryCandidates.length === 0) {
        return null;
      }
    }

    const miscCandidates = this.registry
      .getMiscScenarios()
      .filter((s) => !this.visitedMiscIds.has(s.id) && this.isScenarioEligible(s));

    const combinedPool = [...substoryCandidates, ...miscCandidates];

    const weightedPool = combinedPool.map((scenario) => ({
      scenario,
      weight: this.calculateScenarioWeight(scenario)
    }));

    const totalWeight = weightedPool.reduce((sum, entry) => sum + entry.weight, 0);
    let roll = Math.random() * totalWeight;

    for (const entry of weightedPool) {
      roll -= entry.weight;
      if (roll <= 0) {
        return entry.scenario;
      }
    }

    return weightedPool[weightedPool.length - 1].scenario;
  }

  _rollStepDuration(min = 2, max = 4) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  _stepGradualWeather(desiredWeather) {
    const cur = this.currentWeather;
    if (desiredWeather === cur) return cur;

    // Gradual rain build-up and calm-down transitions
    if (cur === 'CLEAR' && desiredWeather === 'MONSOON') return 'DRIZZLE';
    if (cur === 'SPIRIT FOG' && desiredWeather === 'MONSOON') return 'DRIZZLE';
    if (cur === 'MONSOON' && (desiredWeather === 'CLEAR' || desiredWeather === 'SPIRIT FOG')) {
      return 'DRIZZLE';
    }
    return desiredWeather;
  }

  _nextNaturalWeather() {
    const adjacentMap = {
      CLEAR: ['SPIRIT FOG', 'DRIZZLE'],
      'SPIRIT FOG': ['CLEAR', 'DRIZZLE'],
      DRIZZLE: ['MONSOON', 'SPIRIT FOG', 'CLEAR'],
      MONSOON: ['DRIZZLE']
    };
    const options = adjacentMap[this.currentWeather] || ['DRIZZLE'];
    return options[Math.floor(Math.random() * options.length)];
  }

  /**
   * Normalizes a scenario `weather` / `timeOfDay` field into a list of allowed values.
   * Accepts a single string or an array. Returns null for 'ANY' or missing values.
   */
  _getAllowedValues(field, validValues) {
    if (!field) return null;
    const list = (Array.isArray(field) ? field : [field])
      .map((v) => String(v).toUpperCase())
      .filter((v) => validValues.includes(v));
    return list.length > 0 ? list : null;
  }

  _syncWeatherTags() {
    for (const wt of WEATHER_TAGS) {
      this.activeTags.delete(wt);
      this.world.removeFlag(wt);
    }
    const tag = WEATHER_TO_TAG[this.currentWeather];
    if (tag) {
      this.activeTags.add(tag);
      this.world.setFlag(tag);
    }
  }

  /**
   * Picks a transitional hook that never contradicts the weather on screen.
   * - Scenarios with a fixed weather author their weather hooks as transitions
   *   INTO that weather, keyed by the weather the player is arriving from.
   * - Scenarios with 'ANY' weather describe the present sky, so only hooks that
   *   match the current weather are allowed.
   */
  _selectSeamlessHook(scenario, previousWeather, allowedWeathers) {
    const hooks = scenario.seamlessHooks;
    if (!hooks) return null;

    const checkHook = (text) => {
      if (!text) return null;
      return isSeamlessHookCompatible(text, this.currentTimeOfDay, this.currentWeather) ? text : null;
    };

    const currentCompatible = WEATHER_COMPATIBLE_TAGS[this.currentWeather] || [];
    const previousCompatible = WEATHER_COMPATIBLE_TAGS[previousWeather] || [];

    // Prioritize hook matching the active resolved weather on screen
    for (const tag of currentCompatible) {
      const match = checkHook(hooks[tag]);
      if (match) return match;
    }

    if (allowedWeathers && previousWeather && previousWeather !== this.currentWeather) {
      for (const tag of previousCompatible) {
        const match = checkHook(hooks[tag]);
        if (match) return match;
      }
    }

    const nonWeatherTags = [...this.lastEmittedTags, ...this.activeTags].filter(
      (t) => !WEATHER_TAGS.includes(t)
    );
    for (const tag of nonWeatherTags) {
      const match = checkHook(hooks[tag]);
      if (match) return match;
    }

    return checkHook(hooks.default) || null;
  }

  _resolveScenarioEnvironment(scenario) {
    const res = resolveAtmosphere(scenario, {
      world: this.world,
      currentWeather: this.currentWeather,
      currentTimeOfDay: this.currentTimeOfDay,
      currentEnvironment: this.currentEnvironment
    });
    return res.environment;
  }

  _sanitizeCreatureText(text) {
    if (!text || typeof text !== 'string') return text;
    const isKnown = (id) => this.world && this.world.hasCreatureKnowledge(id);
    return obscureCreatureReferences(text, isKnown);
  }

  _getDefaultPassiveFailHint(statKey) {
    switch ((statKey || '').toUpperCase()) {
      case 'DEX':
        return 'You glimpse a fleeting opening in the unfolding scene, but deep inside you know you aren\'t agile enough to exploit it before the chance slips away.';
      case 'WIS':
        return 'A fleeting whisper stirs the hairs on the back of your neck, but your instincts fail to piece together what hidden omen lurks nearby.';
      case 'INT':
        return 'A subtle pattern lingers in the back of your thoughts, but the tactical riddle remains unsolved for now.';
      case 'STR':
        return 'You survey the physical obstacle before you, but deep inside you know your raw power falls short of forcing a way through.';
      case 'CON':
        return 'The stifling air and creeping chill weigh heavily upon you, dulling your stamina before you can push deeper.';
      case 'CHA':
        return 'A delicate silence settles over the encounter, though the right words to steer fate escape your tongue.';
      default:
        return 'A subtle intuition tugs at your senses, but the opportunity remains just beyond your grasp.';
    }
  }

  _annotateInstinctInParagraph(paragraphEl) {
    if (!paragraphEl) return;
    const raw = paragraphEl.innerHTML || '';
    if (!raw.includes('[Instinct]')) return;

    const successfulChecks = (this.currentPassiveList || []).filter((c) => c.success);
    const check = successfulChecks[this.instinctCheckIndex] || successfulChecks[0] || {
      stat: 'WIS',
      score: 12,
      dc: 12
    };
    this.instinctCheckIndex++;

    const stat = check.stat || 'WIS';
    const score = check.score !== undefined ? check.score : 12;
    const dc = check.dc !== undefined ? check.dc : 12;

    const badgeHtml = `<span class="instinct-badge" role="button" tabindex="0" data-stat="${stat}" data-score="${score}" data-dc="${dc}">[Instinct]</span>`;

    if (paragraphEl.innerHTML.includes('[Instinct]\n')) {
      paragraphEl.innerHTML = paragraphEl.innerHTML.replace('[Instinct]\n', `${badgeHtml}\n`);
    } else {
      paragraphEl.innerHTML = paragraphEl.innerHTML.replace('[Instinct]', badgeHtml);
    }
  }

  presentScenario(scenario, prependResolutionParagraphs = []) {
    if (!scenario) return;

    this.awaitingContinue = false;
    this.currentScenario = scenario;
    this.currentScenarioDeltas = [];
    this.trackingDeltas = true;
    this.turnCount += 1;

    if (scenario.isMisc) {
      if (!scenario.repeatable) {
        this.visitedMiscIds.add(scenario.id);
      }
    } else if (!scenario.isPrologue) {
      this.visitedScenarioIds.add(scenario.id);
    }

    const previousWeather = this.currentWeather;

    // 1. Resolve Unified Atmosphere (Weather, Time of Day, Environment) with 3-tier priority
    const atmosphere = resolveAtmosphere(scenario, {
      world: this.world,
      currentWeather: this.currentWeather,
      currentTimeOfDay: this.currentTimeOfDay,
      currentEnvironment: this.currentEnvironment
    });

    this.currentWeather = atmosphere.weather;
    this.currentTimeOfDay = atmosphere.timeOfDay;
    this.currentEnvironment = atmosphere.environment;
    this.timeCycleIndex = TIME_OF_DAY_CYCLE.indexOf(this.currentTimeOfDay);
    if (this.timeCycleIndex < 0) this.timeCycleIndex = 0;

    // Check Bakunawa Eclipse state and transitions
    if (this.currentTimeOfDay === 'ECLIPSE' || (scenario.intrinsicTags && scenario.intrinsicTags.includes('eclipse'))) {
      this.eclipseActive = true;
      this.world.setFlag('lunar_eclipse_active');
      this.world.setFlag('bakunawa_swallowing_moon');
    } else if (this.eclipseActive) {
      if (
        this.world.hasFlag('acoustic_shock') ||
        this.world.hasFlag('bakunawa_ward') ||
        this.scenariosInEclipse >= 2
      ) {
        this.eclipseActive = false;
        this.world.removeFlag('lunar_eclipse_active');
        this.world.removeFlag('bakunawa_swallowing_moon');
        this.currentTimeOfDay = 'DAWN';
        this.timeCycleIndex = 0;
        this.scenariosInEclipse = 0;
        this.eventBus.emit('log:mechanical', {
          type: 'heal',
          text: '❖ ECLIPSE VANQUISHED: Acoustic clamor drove the Bakunawa back into the sea! Dawn breaks over the islands.'
        });
      } else {
        this.scenariosInEclipse = (this.scenariosInEclipse || 0) + 1;
      }
    } else if (this.turnCount > 6 && this.currentTimeOfDay === 'NIGHT' && !scenario.isPrologue) {
      const player = this.world.getEntity('player');
      const heat = player && player.getComponent('Panganib') ? player.getComponent('Panganib').heat : 10;
      if (heat >= 75 || Math.random() < 0.12) {
        this.triggerEclipse('Bakunawa');
      }
    }

    // Bloodied gear scent increases Spirit Scent by +5 per node (scenario_format.md)
    if (this.world.hasFlag('bloodied') || this.world.hasFlag('bloodied_blade')) {
      this.eventBus.emit('danger:modifyHeat', {
        delta: 5,
        source: 'Bloodied Gear Scent'
      });
    }

    // Keep narrative weather tags in lockstep with the real weather BEFORE selecting hooks
    this._syncWeatherTags();

    if (Array.isArray(scenario.intrinsicTags)) {
      const currentCompatible = WEATHER_COMPATIBLE_TAGS[this.currentWeather] || [];
      for (const tag of scenario.intrinsicTags) {
        // Never let a scenario's flavor tags contradict the weather on screen.
        if (WEATHER_TAGS.includes(tag) && !currentCompatible.includes(tag)) continue;
        this.activeTags.add(tag);
        this.world.setFlag(tag);
      }
    }

    const paragraphs = [...prependResolutionParagraphs];

    const allowedWeathers = this._getAllowedValues(scenario.weather, VALID_WEATHERS);
    const selectedHook = this._selectSeamlessHook(scenario, previousWeather, allowedWeathers);
    if (selectedHook) {
      paragraphs.push(this._sanitizeCreatureText(selectedHook));
    }

    if (Array.isArray(scenario.prompt)) {
      paragraphs.push(...scenario.prompt.map((p) => this._sanitizeCreatureText(p)));
    } else if (typeof scenario.prompt === 'string') {
      paragraphs.push(this._sanitizeCreatureText(scenario.prompt));
    }

    const player = this.world.getEntity('player');
    this.currentPassiveResult = null;
    this.currentPassiveResults = {};
    this.currentPassiveList = [];
    this.instinctCheckIndex = 0;

    const playerStats = player ? player.getComponent('Stats') : null;
    const pInt = playerStats && typeof playerStats.INT === 'number' ? playerStats.INT : 10;
    let hasPassiveCheck = false;

    if (scenario.passive && player) {
      hasPassiveCheck = true;
      const passiveChecks = Array.isArray(scenario.passive)
        ? scenario.passive
        : [scenario.passive];

      for (const pCheck of passiveChecks) {
        const statKey = (pCheck.stat || 'WIS').toUpperCase();
        const dc = typeof pCheck.dc === 'number' ? pCheck.dc : 12;
        let passiveScore = StatResolver.getPassiveScore(player, statKey);

        if (pInt >= 15 && statKey !== 'INT') {
          passiveScore += 2;
        } else if (pInt >= 13 && statKey !== 'INT') {
          passiveScore += 1;
        }

        const isSuccess = passiveScore >= dc;
        const outcome = isSuccess ? CheckOutcome.SUCCESS : CheckOutcome.FAILURE;

        const checkRes = {
          success: isSuccess,
          stat: statKey,
          score: passiveScore,
          dc
        };
        this.currentPassiveResults[statKey] = checkRes;
        this.currentPassiveList.push(checkRes);
        if (!this.currentPassiveResult) {
          this.currentPassiveResult = checkRes;
        }

        this.eventBus.emit('check:resolved', {
          statKey,
          total: passiveScore,
          difficulty: dc,
          success: isSuccess,
          outcome,
          isPassive: true,
          prose: StatResolver.getOutcomeProse({
            statKey,
            outcome,
            isPassive: true
          })
        });

        if (isSuccess) {
          const rawPassiveText = pCheck.success;
          if (rawPassiveText) {
            const passiveText = this._sanitizeCreatureText(rawPassiveText);
            paragraphs.push(`[Instinct]\n${passiveText}`);
          }
        } else {
          if (pCheck.fail) {
            paragraphs.push(this._sanitizeCreatureText(pCheck.fail));
          } else {
            const failHint = this._getDefaultPassiveFailHint(statKey);
            if (failHint) {
              paragraphs.push(failHint);
            }
          }
        }
      }
    }

    // Subtle narrative hints for choices locked behind hidden skill or stat requirements
    if (player && Array.isArray(scenario.choices)) {
      const hintedStats = new Set();
      for (const choice of scenario.choices) {
        if (choice.passiveRequirement) {
          const pStat = (choice.passiveRequirement.stat || 'WIS').toUpperCase();
          const pDc =
            typeof choice.passiveRequirement.dc === 'number'
              ? choice.passiveRequirement.dc
              : 12;
          let pScore = StatResolver.getPassiveScore(player, pStat);
          if (pInt >= 15 && pStat !== 'INT') pScore += 2;
          else if (pInt >= 13 && pStat !== 'INT') pScore += 1;

          if (pScore < pDc && !hintedStats.has(pStat)) {
            hintedStats.add(pStat);
            if (choice.hiddenFailNarrative) {
              paragraphs.push(this._sanitizeCreatureText(choice.hiddenFailNarrative));
            } else if (!hasPassiveCheck || !this.currentPassiveResults[pStat]) {
              const defaultHint = this._getDefaultPassiveFailHint(pStat);
              if (defaultHint) paragraphs.push(defaultHint);
            }
          }
        }
      }
    }

    let actLabel = '';
    if (scenario.isPrologue) {
      const identity = player ? player.getComponent('Identity') : null;
      const statusText =
        identity && identity.socialStatus ? identity.socialStatus.label : 'Origin';
      actLabel = `PROLOGUE // ${statusText}`;
    } else if (scenario.isMisc) {
      actLabel = 'WANDERING OMEN // TALES OF THE ROAD';
    } else {
      actLabel = `${this.activeSubstory ? this.activeSubstory.internalName : 'CHRONICLE'}`;
    }

    this.eventBus.emit('narrative:nodeEntered', {
      nodeId: scenario.id,
      title: this._sanitizeCreatureText(scenario.locationLabel || scenario.id),
      location: `${this.currentTimeOfDay} // ${this.currentWeather}`,
      weather: this.currentWeather,
      timeOfDay: this.currentTimeOfDay,
      environment: this.currentEnvironment,
      envLabel: atmosphere.envLabel,
      act: actLabel,
      passiveResults: this.currentPassiveResults,
      passiveList: this.currentPassiveList
    });

    this.eventBus.emit('world:tagsUpdated', {
      activeTags: [...this.activeTags]
    });

    this.eventBus.emit('choices:clear');
    this.typewriter.clear();
    this.typewriter.typeParagraphs(paragraphs, () => {
      this._presentChoices(scenario);
    });
  }

  _presentChoices(scenario) {
    const player = this.world.getEntity('player');
    const rawChoices = Array.isArray(scenario.choices) ? [...scenario.choices] : [];

    // Inject storytelling choices during chill/social moments if player carries pending creature tales
    if (this.isChillOrSocialScenario(scenario) && this.world && this.world.hasPendingCreatureTales()) {
      const pendingTales = this.world.getPendingCreatureTales();
      for (const creatureId of pendingTales) {
        const taleData = getCreatureTaleData(creatureId);
        const topicText = taleData.topic.startsWith('the ') ? taleData.topic : `the ${taleData.topic}`;
        rawChoices.push({
          isDynamicTaleChoice: true,
          creatureId,
          text: `Recount your encounter with ${topicText} and ask what manner of creature it was`,
          itemActionTag: 'Tale of the Road',
          whisperTag: taleData.whisperTag || 'Folklore // Tale of the Road',
          complexity: 'folklore',
          check: null,
          successStory: buildTaleResolutionStory(creatureId, scenario),
          onSuccess: {
            resolveCreatureTale: creatureId,
            heatDelta: -25,
            hp: 3,
            emitTags: ['well_rested', 'kapwa_bond', `shared_tale_${creatureId}`]
          }
        });
      }
    }

    this.currentScenarioActiveChoices = rawChoices;
    const evaluated = [];

    rawChoices.forEach((choice, index) => {
      const cond = StatResolver.checkChoiceCondition(choice, player, this.world, {
        passiveResult: this.currentPassiveResult
      });
      if (!cond.visible) return;

      let whisper = '';
      if (choice.itemActionTag) {
        whisper = String(choice.itemActionTag).split('//')[0].trim();
      } else if (choice.whisperTag) {
        whisper = String(choice.whisperTag).split('//')[0].trim();
      } else if (choice.folkloreTag) {
        whisper = String(choice.folkloreTag).split('//')[0].trim();
      } else if (choice.check && choice.check.stat) {
        whisper = StatResolver.getChallengeWhisper(
          player,
          choice.check.stat,
          choice.check.dc
        );
      }

      evaluated.push({
        index,
        label: this._sanitizeCreatureText(choice.text || choice.label),
        whisper,
        allowed: cond.allowed,
        lockReason: cond.reason,
        isPassiveRevealed: Boolean(cond.isPassiveRevealed),
        passiveStat: cond.passiveStat || null,
        isIntUnlocked: Boolean(cond.isIntUnlocked),
        check: choice.check || null,
        autoFail: Boolean(choice.autoFail),
        loud: Boolean(choice.loud || choice.noise === 'loud'),
        allowedConsumables: choice.allowedConsumables || choice.applicableItems || null,
        consumableEffect: choice.consumableEffect || null,
        openModal: choice.openModal || null,
        action: choice.action || null,
        openDambana: Boolean(choice.openDambana)
      });
    });

    const prepOptions = {
      reversibleGarments: [],
      applicableConsumables: []
    };

    if (player) {
      const inv = player.getComponent('Inventory');
      if (inv && Array.isArray(inv.items)) {
        prepOptions.reversibleGarments = inv.items.filter(
          (i) => i.equippedSlot && i.canFlipInsideOut
        );

        const consumableTemplates = [
          'coarse_salt_pouch',
          'blessed_lana_vial',
          'bamboo_torch',
          'bamboo_resin_torch',
          'brass_agung_gong',
          'bayabas_herbs'
        ];
        prepOptions.applicableConsumables = inv.items.filter(
          (i) => consumableTemplates.includes(i.id) || (i.category === 'material' && i.usable)
        );
      }
    }

    const isAmbush = Boolean(
      scenario.ambush ||
      scenario.isAmbush ||
      scenario.reactionTimer ||
      (typeof scenario.pressureTimer === 'number' && scenario.pressureTimer > 0)
    );
    const reactionTimer =
      scenario.reactionTimer ||
      (typeof scenario.pressureTimer === 'number'
        ? scenario.pressureTimer / 1000
        : isAmbush
          ? 5
          : null);

    this.eventBus.emit('choices:render', {
      nodeId: scenario.id,
      isEnding: false,
      choices: evaluated,
      prepOptions,
      isAmbush,
      reactionTimer
    });
  }

  _consolidateDeltas(deltas) {
    if (!Array.isArray(deltas)) return [];
    const map = new Map();
    for (const d of deltas) {
      const key = `${d.type}_${d.name}`;
      if (!map.has(key)) {
        map.set(key, { ...d });
      } else {
        map.get(key).change += d.change;
      }
    }
    const consolidated = Array.from(map.values()).filter((d) => d.change !== 0);

    const typePriority = {
      xp: 1,
      health: 2,
      currency: 3,
      item: 4,
      lore: 5
    };

    consolidated.sort((a, b) => {
      const pA = typePriority[a.type] || 99;
      const pB = typePriority[b.type] || 99;
      return pA - pB;
    });

    return consolidated;
  }

  _renderScenarioDeltas() {
    if (!this.typewriter || !this.typewriter.container) return;
    if (this.typewriter.container.querySelector('.scenario-rewards-container')) return;

    const deltas = this._consolidateDeltas(this.currentScenarioDeltas);
    if (deltas.length === 0) return;

    this.trackingDeltas = false;

    const container = document.createElement('div');
    container.className = 'scenario-rewards-container';

    for (const d of deltas) {
      const el = document.createElement('div');
      const isGain = d.change > 0;
      el.className = `scenario-reward-item ${isGain ? 'reward-gain' : 'reward-loss'}`;
      const sign = isGain ? '+' : '-';
      const count = Math.abs(d.change);
      el.textContent = `${sign}${count} ${d.name}`;
      container.appendChild(el);
    }

    this.typewriter.container.appendChild(container);
    this.typewriter.container.scrollTop = this.typewriter.container.scrollHeight;
  }

  _presentContinuePrompt() {
    this.awaitingContinue = true;
    this.eventBus.emit('choices:render', {
      nodeId: this.currentScenario ? this.currentScenario.id : 'continue',
      isEnding: false,
      choices: [
        {
          index: 'CONTINUE',
          label: 'Proceed onward along your path',
          whisper: null,
          allowed: true
        }
      ],
      prepOptions: { reversibleGarments: [], applicableConsumables: [] },
      isAmbush: false,
      reactionTimer: null
    });
  }

  continueToNextScenario() {
    if (this.isGameOver) return;
    this.awaitingContinue = false;

    const nextScenario = this.drawNextScenario();
    if (!nextScenario) {
      this._presentSubstoryCompletion([]);
      return;
    }

    this.presentScenario(nextScenario);
  }

  handleAmbushHesitation() {
    if (!this.currentScenario || this.isGameOver) return;
    const scenario = this.currentScenario;

    const outcome = scenario.hesitationOutcome || {
      story: [
        '⚠️ HESITATED IN FEAR! Paralyzed by primal shock, precious seconds slip away while the threat strikes unobstructed!',
        'The ambush hits home before your mind can command your limbs to defend!'
      ],
      effects: {
        hp: -3,
        spiritScent: 15,
        emitTags: ['wounded']
      }
    };

    this.eventBus.emit('log:mechanical', {
      type: 'panic',
      text: '⚠️ Ambush Reaction Failed: You froze in terror. Default hesitation penalty suffered (-3 HP, +15 Spirit Scent).'
    });

    this.applyEffects(outcome.effects);
    if (this.isGameOver) return;

    this.eventBus.emit('player:gainXp', {
      amount: 1,
      source: 'Ambush Survival'
    });
    this.currentScenarioDeltas.push({
      type: 'xp',
      change: 1,
      name: 'XP'
    });
    this._recordChronicleEntry(scenario, null, false, false, 'ambush_hesitation');

    this.awaitingContinue = true;
    this.eventBus.emit('choices:clear');

    if (this.typewriter && this.typewriter.container) {
      this.typewriter.typeParagraphs(outcome.story, () => {
        this._renderScenarioDeltas();
        this._presentContinuePrompt();
      });
    }
  }

  selectChoice(choiceIndex, stagedPrep = null, checkResolutionOverride = null) {
    if (!this.currentScenario || this.isGameOver) return;

    if (choiceIndex === 'CONTINUE' || this.awaitingContinue) {
      this.continueToNextScenario();
      return;
    }

    const choice =
      (this.currentScenarioActiveChoices && this.currentScenarioActiveChoices[choiceIndex]) ||
      (this.currentScenario.choices && this.currentScenario.choices[choiceIndex]);
    if (!choice) return;

    const player = this.world.getEntity('player');
    const cond = StatResolver.checkChoiceCondition(choice, player, this.world, {
      passiveResult: this.currentPassiveResult
    });
    if (!cond.allowed) return;

    let isSuccess = true;
    let checkSummaryText = '';
    let prepBonus = 0;
    let autoSuccessFromConsumable = false;
    let consumableNarrative = '';

    // Apply consumable prep if staged
    if (stagedPrep && stagedPrep.itemId) {
      prepBonus = stagedPrep.bonus || 3;
      if (choice.consumableEffect && choice.consumableEffect[stagedPrep.itemId]) {
        const effectConfig = choice.consumableEffect[stagedPrep.itemId];
        if (typeof effectConfig.bonusModifier === 'number') {
          prepBonus = effectConfig.bonusModifier;
        }
        if (effectConfig.autoSuccess) {
          autoSuccessFromConsumable = true;
        }
        if (effectConfig.narrative) {
          consumableNarrative = effectConfig.narrative;
        }
      }

      const inv = player ? player.getComponent('Inventory') : null;
      if (inv) {
        const itemIdx = inv.items.findIndex(
          (i) => i.id === stagedPrep.itemId || i.uid === stagedPrep.itemUid
        );
        if (itemIdx !== -1) {
          const [consumed] = inv.items.splice(itemIdx, 1);
          this.eventBus.emit('ui:updateInventory', { entity: player });
          this.eventBus.emit('inventory:remove', { item: consumed });
          this.eventBus.emit('log:mechanical', {
            type: 'item_loss',
            text:
              consumableNarrative ||
              `Prepared ${consumed.name} (+${prepBonus} Tactical Bonus).`
          });
        }
      }
    }

    let checkResult = null;
    if (choice.autoFail) {
      isSuccess = false;
      const failTag = choice.failureTag ? choice.failureTag.toUpperCase() : 'INEFFECTIVE FOLKLORE';
      checkSummaryText = ` // ${failTag}`;
    } else if (autoSuccessFromConsumable) {
      isSuccess = true;
      checkSummaryText = ` // ${stagedPrep.itemName.toUpperCase()} AUTO-SUCCESS`;
    } else if (choice.check && choice.check.stat) {
      checkResult =
        checkResolutionOverride ||
        StatResolver.resolveCheck(
          player,
          choice.check.stat,
          choice.check.dc,
          prepBonus
        );
      this.eventBus.emit('check:resolved', checkResult);
      isSuccess = checkResult.success;
      const statusWord = checkResult.success ? 'SUCCESS' : 'FAILED';
      const prepNote = prepBonus > 0 ? ` [Prep +${prepBonus}]` : '';
      const rushedNote =
        checkResult.rushedPenalty > 0 ? ` [Rushed -${checkResult.rushedPenalty}]` : '';
      checkSummaryText = ` // ${checkResult.statKey} CHECK ${statusWord} (${checkResult.total} vs DC ${checkResult.dc}${prepNote}${rushedNote})`;
    } else if (choice.itemActionTag) {
      checkSummaryText = ` // ${choice.itemActionTag.toUpperCase()}`;
    }

    // Heat modification for loud choices or specific scenario choices
    if (choice.loud || choice.noise === 'loud') {
      this.eventBus.emit('danger:modifyHeat', {
        delta: 20,
        source: choice.text || 'Loud Action'
      });
    }
    if (typeof choice.heatDelta === 'number' && choice.heatDelta !== 0) {
      this.eventBus.emit('danger:modifyHeat', {
        delta: choice.heatDelta,
        source: choice.text || 'Action Outcome'
      });
    }

    let dynamicOutcome = null;
    if (typeof choice.resolve === 'function') {
      try {
        dynamicOutcome = choice.resolve(this.world, player, this);
      } catch (err) {
        console.warn('[NarrativeDirector] choice.resolve error:', err);
      }
    }

    let resolutionStory = dynamicOutcome && dynamicOutcome.story
      ? dynamicOutcome.story
      : (isSuccess
        ? choice.successStory || []
        : choice.failStory || choice.successStory || []);

    if (typeof resolutionStory === 'function') {
      resolutionStory = resolutionStory(this.world, player, this);
    }

    let outcomeEffects = dynamicOutcome && dynamicOutcome.effects
      ? dynamicOutcome.effects
      : (isSuccess
        ? choice.onSuccess
        : choice.onFail || choice.onSuccess);

    if (typeof outcomeEffects === 'function') {
      outcomeEffects = outcomeEffects(this.world, player, this);
    }

    this.applyEffects(outcomeEffects);
    if (this.isGameOver) return;

    const isAvoided = Boolean(choice.isAvoidance || choice.avoidance);
    if (!isAvoided) {
      const xpAmount = isSuccess ? 2 : 1;
      this.eventBus.emit('player:gainXp', {
        amount: xpAmount,
        source: this.currentScenario ? this.currentScenario.locationLabel : 'Scenario Outcome'
      });
      this.currentScenarioDeltas.push({
        type: 'xp',
        change: xpAmount,
        name: 'XP'
      });
    }

    this._recordChronicleEntry(this.currentScenario, choice, isSuccess, isAvoided);

    if (
      isSuccess &&
      this.currentScenario &&
      this.currentScenario.creatureId &&
      !choice.isAvoidance &&
      !choice.preventCreatureDiscovery
    ) {
      if (this.world && !this.world.hasCreatureKnowledge(this.currentScenario.creatureId)) {
        this.world.recordPendingCreatureTale(this.currentScenario.creatureId);
        this.currentScenarioDeltas.push({
          type: 'lore',
          change: 1,
          name: 'Tale of the Trail'
        });
        this.eventBus.emit('log:mechanical', {
          type: 'status_apply',
          text: '❖ TALE ETCHED IN MEMORY: You survived an encounter with an enigmatic entity. Recounting the experience with elders, travelers, or priestesses in chill moments may reveal its true nature.'
        });
      }
    }

    this.awaitingContinue = true;
    this.eventBus.emit('choices:clear');



    const rawStoryLines =
      Array.isArray(resolutionStory) && resolutionStory.length > 0
        ? resolutionStory
        : ['You carry out your decision and prepare to move on.'];
    const storyLines = rawStoryLines.map((line) => this._sanitizeCreatureText(line));

    this.typewriter.typeParagraphs(storyLines, () => {
      if (!this.isGameOver) {
        this._renderScenarioDeltas();
        this._presentContinuePrompt();
      }
    });
  }

  applyEffects(effects) {
    if (!effects) return;

    if (effects.resolveCreatureTale && this.world) {
      this.world.resolveCreatureTale(effects.resolveCreatureTale);
    }

    if (effects.discoverCreature && this.world) {
      if (effects.directLearning || this.isChillOrSocialScenario(this.currentScenario)) {
        this.world.unlockCreatureKnowledge(effects.discoverCreature);
      } else {
        this.world.recordPendingCreatureTale(effects.discoverCreature);
      }
    }

    if (effects.discoverLocation && this.world) {
      const locList = Array.isArray(effects.discoverLocation)
        ? effects.discoverLocation
        : [effects.discoverLocation];
      for (const loc of locList) {
        this.world.setFlag(`unlocked_${loc}`);
        this.eventBus.emit('log:mechanical', {
          type: 'lore',
          text: `❖ NEW LOCATION DISCOVERED: ${loc}`
        });
      }
    }

    if (typeof effects.hp === 'number' && effects.hp < 0) {
      if (this.world.hasFlag('boon_haliya_shield')) {
        this.world.removeFlag('boon_haliya_shield');
        const player = this.world.getEntity('player');
        const boonsComp = player ? player.getComponent('Boons') : null;
        if (boonsComp && boonsComp.active) delete boonsComp.active.boon_haliya_shield;
        this.eventBus.emit('log:mechanical', {
          type: 'heal',
          text: "❖ HALIYA'S LUNAR SHIELD: The golden lunar shield absorbed the strike! Damage negated."
        });
        effects.hp = 0;
      }
    }

    const hpChange =
      typeof effects.hp === 'number'
        ? effects.hp
        : typeof effects.health === 'number'
          ? effects.health
          : null;
    if (typeof hpChange === 'number' && hpChange !== 0) {
      this.eventBus.emit('player:modifyVitality', {
        amount: hpChange,
        source: this.currentScenario ? this.currentScenario.locationLabel : 'Encounter'
      });
    }

    if (effects.applyCondition) {
      const conds = Array.isArray(effects.applyCondition)
        ? effects.applyCondition
        : [effects.applyCondition];
      for (const cond of conds) {
        this.eventBus.emit(
          'status:applyCondition',
          typeof cond === 'string' ? { id: cond } : cond
        );
      }
    }

    // Support applyStatus schema from scenario_format.md (e.g. Bleeding, InfectedBite, Bangungot, Soaked)
    if (effects.applyStatus) {
      const statusList = Array.isArray(effects.applyStatus)
        ? effects.applyStatus
        : [effects.applyStatus];
      const statusMap = {
        bleeding: 'bleeding_wound',
        infectedbite: 'infected_aswang_bite',
        bangungot: 'bangungot_paralysis',
        soaked: 'soaked_hypothermia'
      };
      for (const s of statusList) {
        const key = String(s).toLowerCase().replace(/[^a-z]/g, '');
        const conditionId = statusMap[key] || s;
        this.eventBus.emit('status:applyCondition', { id: conditionId });
      }
    }

    if (effects.cureCondition) {
      const cures = Array.isArray(effects.cureCondition)
        ? effects.cureCondition
        : [effects.cureCondition];
      for (const c of cures) {
        this.eventBus.emit(
          'status:cureCondition',
          typeof c === 'string' ? { id: c } : c
        );
      }
    }

    // Support spiritScent / heat modification from scenario_format.md
    if (typeof effects.spiritScent === 'number' && effects.spiritScent !== 0) {
      this.eventBus.emit('danger:modifyHeat', {
        delta: effects.spiritScent,
        source: this.currentScenario
          ? this.currentScenario.locationLabel
          : 'Scenario Spirit Scent'
      });
    }

    const heatDelta =
      typeof effects.heatDelta === 'number'
        ? effects.heatDelta
        : typeof effects.heat === 'number'
          ? effects.heat
          : null;
    if (typeof heatDelta === 'number' && heatDelta !== 0) {
      this.eventBus.emit('danger:modifyHeat', {
        delta: heatDelta,
        source: this.currentScenario
          ? this.currentScenario.locationLabel
          : 'Scenario Danger Heat'
      });
    }

    // Support offerings / piloncitos / remnants modification from scenario effects
    if (typeof effects.offerings === 'number' && effects.offerings !== 0) {
      this.eventBus.emit('player:modifyRemnants', {
        amount: effects.offerings,
        source: this.currentScenario
          ? this.currentScenario.locationLabel
          : 'Atang Offering'
      });
    }

    if (typeof effects.piloncitos === 'number' && effects.piloncitos !== 0) {
      this.eventBus.emit('player:modifyRemnants', {
        amount: effects.piloncitos,
        source: this.currentScenario ? this.currentScenario.locationLabel : 'Encounter'
      });
    }

    if (typeof effects.remnants === 'number' && effects.remnants !== 0) {
      this.eventBus.emit('player:modifyRemnants', {
        amount: effects.remnants,
        source: this.currentScenario ? this.currentScenario.locationLabel : 'Encounter'
      });
    }

    if (effects.addItem) {
      const items = Array.isArray(effects.addItem) ? effects.addItem : [effects.addItem];
      for (const templateId of items) {
        this.eventBus.emit('inventory:add', { templateId });
      }
    }

    if (effects.removeItem) {
      const items = Array.isArray(effects.removeItem) ? effects.removeItem : [effects.removeItem];
      const player = this.world.getEntity('player');
      const inv = player ? player.getComponent('Inventory') : null;
      for (const itemKey of items) {
        if (inv) {
          const idx = inv.items.findIndex((i) => i.id === itemKey || (i.tags && i.tags.includes(itemKey)));
          if (idx !== -1) {
            const [removed] = inv.items.splice(idx, 1);
            this.eventBus.emit('ui:updateInventory', { entity: player });
            this.eventBus.emit('inventory:remove', { item: removed });
            this.eventBus.emit('log:mechanical', {
              type: 'item_loss',
              text: `Used ${removed.name}.`
            });
          } else {
            this.eventBus.emit('inventory:remove', { name: itemKey });
          }
        } else {
          this.eventBus.emit('inventory:remove', { name: itemKey });
        }
      }
    }

    if (Array.isArray(effects.emitTags) && effects.emitTags.length > 0) {
      const weatherTags = ['raining', 'clear_sky', 'fog_gathering', 'rain_stopping'];
      if (effects.emitTags.some((t) => weatherTags.includes(t))) {
        for (const wt of weatherTags) {
          this.activeTags.delete(wt);
          this.world.removeFlag(wt);
        }
      }

      this.lastEmittedTags = [...effects.emitTags];
      for (const tag of effects.emitTags) {
        this.activeTags.add(tag);
        this.world.setFlag(tag);
      }

      this.eventBus.emit('world:tagsUpdated', {
        activeTags: [...this.activeTags]
      });
    }
  }

  _recordChronicleEntry(scenario, choice, isSuccess, isAvoided, specialType = null) {
    if (!scenario) return;

    let text = '';
    const location = scenario.locationLabel || scenario.title || 'the winding trail';

    if (choice && choice.chronicle) {
      if (typeof choice.chronicle === 'object') {
        text = isSuccess
          ? choice.chronicle.success || choice.chronicle.text
          : choice.chronicle.fail || choice.chronicle.text;
      } else if (typeof choice.chronicle === 'string') {
        text = choice.chronicle;
      }
    } else if (scenario.chronicle) {
      if (typeof scenario.chronicle === 'object') {
        text = isSuccess
          ? scenario.chronicle.success || scenario.chronicle.text
          : scenario.chronicle.fail || scenario.chronicle.text;
      } else if (typeof scenario.chronicle === 'string') {
        text = scenario.chronicle;
      }
    }

    if (!text) {
      const creature = scenario.creatureId
        ? scenario.creatureId.replace(/_/g, ' ')
        : null;
      const actionText =
        choice && choice.text ? choice.text.replace(/\.$/, '') : '';

      if (specialType === 'ambush_hesitation') {
        text = `Caught off guard by sudden ambush near ${location}, you froze in fear and took bitter wounds before fighting your way clear.`;
      } else if (isAvoided) {
        text = `At ${location}, you chose wisdom over reckless courage, giving wide berth to impending danger and preserving your vital strength.`;
      } else if (creature) {
        if (isSuccess) {
          text = `Confronting the terrors of ${creature} near ${location}, you triumphed by resolving to ${actionText.toLowerCase() || 'stand your ground'}.`;
        } else {
          text = `Locked in a desperate struggle with ${creature} near ${location}, you suffered bitter wounds attempting to ${actionText.toLowerCase() || 'fight back'}, yet lived to tell the tale.`;
        }
      } else if (
        scenario.tags &&
        (scenario.tags.includes('person') ||
          scenario.tags.includes('social') ||
          scenario.tags.includes('villagers') ||
          scenario.tags.includes('elder'))
      ) {
        if (isSuccess) {
          text = `Encountering troubled travelers near ${location}, you extended aid and compassion, forging bonds of goodwill on the road.`;
        } else {
          text = `Encountering travelers near ${location}, your efforts went awry despite your intentions, leaving a bitter lesson on the road.`;
        }
      } else {
        if (isSuccess) {
          text = `Traversing ${location}, you overcame the trials of the path through decisive action.`;
        } else {
          text = `The treacherous conditions around ${location} tested your endurance to the limit.`;
        }
      }
    }

    this.chronicleLog.push({
      scenarioId: scenario.id,
      title: scenario.title,
      location,
      outcome: isSuccess ? 'success' : 'failure',
      isAvoided,
      text
    });
  }

  generateChronicleSummary() {
    const player = this.world ? this.world.getEntity('player') : null;
    const identity = player ? player.getComponent('Identity') : null;
    const exp = player ? player.getComponent('Experience') : null;
    const charName =
      (identity && (identity.characterName || identity.name)) || 'The Wanderer';
    const bgName = (identity && identity.backgroundName) || 'Traveler';
    const statusLabel =
      (identity && identity.socialStatus && identity.socialStatus.label) ||
      'Unbound';
    const expertiseName = (identity && identity.expertiseName) || 'Survival';
    const finalLevel = exp ? exp.level : 1;

    const opening = `From the misty shores of the archipelago, ${charName} the ${statusLabel} ${bgName} ventured into the primordial wilderness, guided by the arts of ${expertiseName}. Through ritual trials and relentless perseverance, they achieved Level ${finalLevel}.`;

    const deeds = [];
    if (this.chronicleLog.length > 0) {
      const sample = this.chronicleLog.slice(-3);
      for (const entry of sample) {
        deeds.push(entry.text);
      }
    } else {
      deeds.push(
        'Your footprints marked countless trails across the spirit-haunted valleys and forgotten shrines of the islands.'
      );
    }

    const codex =
      this.world && this.world.knownCreatures
        ? Array.from(this.world.knownCreatures)
        : [];
    let loreNote = '';
    if (codex.length > 0) {
      loreNote = `Through keen sight and deep respect, you unlocked the sacred lore of ${codex.length} mythical entities of the islands, immortalizing their truths in the archipelagic codex.`;
    }

    const epilogue =
      'With the long journey finished, your deeds are carved upon bamboo tablets, sung by the babaylan around village campfires for generations to come.';

    const paragraphs = [opening];
    if (deeds.length > 0) {
      paragraphs.push(deeds.join(' '));
    }
    if (loreNote) {
      paragraphs.push(loreNote);
    }
    paragraphs.push(epilogue);

    return paragraphs;
  }

  _presentSubstoryCompletion(prependParagraphs = []) {
    const paragraphs =
      prependParagraphs.length > 0
        ? prependParagraphs
        : [
            'Dawn breaks over the jagged peaks of the archipelago. The ancient terrors that stirred beneath the balete trees and across the moonlit tides recede into the spirit realm.',
            'Your vessel has survived the ultimate trials of the wilderness. The great adventure has reached its completion.'
          ];

    this.eventBus.emit('narrative:nodeEntered', {
      nodeId: 'substory_complete',
      title: 'Dawn Over the Archipelago',
      location: 'BARANGAY SETTLEMENT // DAY',
      weather: 'CLEAR',
      timeOfDay: 'DAY',
      environment: 'VILLAGE',
      act: 'CHRONICLE COMPLETE'
    });
    this.eventBus.emit('choices:clear');
    this.typewriter.clear();
    this.typewriter.typeParagraphs(paragraphs, () => {
      this.eventBus.emit('choices:render', {
        nodeId: 'substory_complete',
        isEnding: true,
        isVictory: true,
        choices: []
      });
    });
  }

  _presentDefeatScreen() {
    this.eventBus.emit('narrative:nodeEntered', {
      nodeId: 'player_defeated',
      title: 'Claimed by the Mist',
      location: 'ANCIENT RUINS // PRE-DAWN',
      weather: 'SPIRIT_FOG',
      timeOfDay: 'MIDNIGHT',
      environment: 'RUINS',
      act: 'CHRONICLE ENDED'
    });
    this.eventBus.emit('choices:clear');
    this.typewriter.clear();
    this.typewriter.typeParagraphs(
      [
        'Your strength gives out along the sodden trail. As the ancestral spirits gather in the mist, your eyes grow heavy.',
        'The wilderness has claimed your mortal vessel. Your journey has reached its end.'
      ],
      () => {
        this.eventBus.emit('choices:render', {
          nodeId: 'player_defeated',
          isEnding: true,
          isVictory: false,
          choices: []
        });
      }
    );
  }

  buildCinematicActs(isVictory) {
    const player = this.world ? this.world.getEntity('player') : null;
    const identity = player ? player.getComponent('Identity') : null;
    const exp = player ? player.getComponent('Experience') : null;
    const boonsComp = player ? player.getComponent('Boons') : null;
    const charName =
      (identity && (identity.characterName || identity.name)) || 'The Wanderer';
    const bgName = (identity && identity.backgroundName) || 'Traveler';
    const statusLabel =
      (identity && identity.socialStatus && identity.socialStatus.label) ||
      'Unbound';
    const expertiseName = (identity && identity.expertiseName) || 'Survival';
    const finalLevel = exp ? exp.level : 1;
    const totalXp = exp ? exp.xp : 0;

    const codex =
      this.world && this.world.knownCreatures
        ? Array.from(this.world.knownCreatures)
        : [];
    const hasBoons = Boolean(
      boonsComp && boonsComp.active && Object.keys(boonsComp.active).length > 0
    );

    return [
      {
        actLabel: '✦ CINEMATIC CHRONICLE // ACT I: THE THRESHOLD',
        title: 'Departure from the Tidal Shores',
        atmosphere: {
          weather: 'DRIZZLE',
          timeOfDay: 'DAWN',
          environment: 'COAST',
          envLabel: 'COAST & REEF // PALE DAWN'
        },
        paragraphs: [
          `From the mist-veiled shores of the western seas, ${charName} the ${statusLabel} ${bgName} set forth into the primordial wild. Guided by the rites of ${expertiseName}, your feet left the salt-crusted tidal flats behind as dawn broke over the restless waves, crossing the threshold between the realm of men and the spirit-haunted deep.`
        ]
      },
      {
        actLabel: '✦ CINEMATIC CHRONICLE // ACT II: WHISPERS OF THE WILD',
        title: 'Shadows of the Balete and Punso',
        atmosphere: {
          weather: 'SPIRIT_FOG',
          timeOfDay: 'DUSK',
          environment: 'BALETE',
          envLabel: 'BALETE GROVE // SPIRIT FOG'
        },
        paragraphs: [
          codex.length > 0
            ? `Treading softly past mossy punso mounds and through the shadows of ancient balete trees, you heeded the warnings of the unseen elders. Your patience and respect rewarded you with the sacred truths of ${codex.length} mythical entities, lifting the veil of fear that blinds lesser mortals to the spirit realm.`
            : `Treading softly past mossy punso mounds and through the shadows of ancient balete trees, you navigated the tangled spirit-paths of the lowlands. By instinct and caution, you learned the sacred protocols of the wilderness, evading the trickery of tree giants and phantom whispers.`,
          hasBoons
            ? 'At the ancient stone altars of the anito, your atang offerings were received with divine favor, cloaking your steps in ancestral boons that shielded your spirit from mortal harm.'
            : 'Though strange eyes followed your trail through the damp leaves, your resolve never faltered against the unseen watchers of the woods.'
        ]
      },
      {
        actLabel: '✦ CINEMATIC CHRONICLE // ACT III: TEMPEST OF THE HIGHLANDS',
        title: 'The Crucible of the Ridge',
        atmosphere: {
          weather: 'DOWNPOUR',
          timeOfDay: 'NIGHT',
          environment: 'TERRACES',
          envLabel: 'HIGHLAND TERRACES // NIGHT'
        },
        paragraphs: [
          `Ascending into rain-lashed bamboo forests and jagged highland terraces, the true weight of the archipelago tested your spirit. Through howling squalls, venomous creeping hazards, and close-fought trials of wit and steel, your vessel persevered, achieving Level ${finalLevel} with ${totalXp} accrued experience.`
        ]
      },
      {
        actLabel: '✦ CINEMATIC CHRONICLE // ACT IV: THE LEGACY',
        title: isVictory ? 'The Dawning Horizon' : 'Rest Among the Ancestors',
        atmosphere: isVictory
          ? {
              weather: 'CLEAR',
              timeOfDay: 'DAY',
              environment: 'VILLAGE',
              envLabel: 'BARANGAY SETTLEMENT // DAY'
            }
          : {
              weather: 'CLEAR',
              timeOfDay: 'PRE_DAWN',
              environment: 'RUINS',
              envLabel: 'ANCIENT RUINS // PRE-DAWN'
            },
        paragraphs: [
          isVictory
            ? 'When the ancient eclipse threatened to swallow the celestial moon, your will stood unbroken against the dark. With the cosmic peril repelled and the long night shattered, golden sunlight floods the islands once more. Your name is etched onto bamboo tablets and sung by babaylan around village hearths for generations to come.'
            : 'Though your mortal strength gave out beneath the monsoon canopy, your courage was not in vain. The ancestral anito and mountain guardians bore witness to your struggle, taking your spirit into their sacred fold. As morning stars rise above the quiet volcanic peaks, your legend becomes part of the timeless breath of the archipelago.'
        ]
      }
    ];
  }

  playCinematicSummary(isVictory) {
    const acts = this.buildCinematicActs(isVictory);
    let currentActIndex = 0;

    const presentAct = () => {
      if (currentActIndex >= acts.length) {
        this.eventBus.emit('choices:render', {
          nodeId: 'cinematic_finished',
          isEnding: false,
          isCinematicFinished: true,
          isVictory,
          choices: []
        });
        return;
      }

      const act = acts[currentActIndex];
      const actNumber = currentActIndex + 1;
      const isLastAct = actNumber === acts.length;

      this.eventBus.emit('narrative:nodeEntered', {
        nodeId: `cinematic_act_${actNumber}`,
        title: act.title,
        act: act.actLabel,
        location: act.atmosphere.envLabel,
        weather: act.atmosphere.weather,
        timeOfDay: act.atmosphere.timeOfDay,
        environment: act.atmosphere.environment
      });

      this.eventBus.emit('choices:clear');
      this.typewriter.clear();
      this.typewriter.typeParagraphs(act.paragraphs, () => {
        this.eventBus.emit('choices:render', {
          nodeId: `cinematic_act_${actNumber}`,
          isEnding: false,
          isCinematicAct: true,
          actIndex: actNumber,
          totalActs: acts.length,
          isVictory,
          choices: [
            {
              index: 'NEXT_CINEMATIC_ACT',
              action: 'next_cinematic_act',
              title: isLastAct ? '✦ CONCLUDE CHRONICLE ❯' : '✦ CONTINUE RECOLLECTION ❯',
              desc: isLastAct
                ? "Seal your vessel's eternal legacy in the archipelago."
                : 'Reflect upon the next chapter of your journey.'
            }
          ]
        });
      });

      currentActIndex += 1;
    };

    this._nextCinematicActHandler = presentAct;
    presentAct();
  }

  advanceCinematicAct() {
    if (typeof this._nextCinematicActHandler === 'function') {
      this._nextCinematicActHandler();
    }
  }
}

export { HierarchicalProbabilisticNarrativeDirector as NarrativeDirector };
