/**
 * NarrativeDirector.js
 * Implements NarrativeRegistry and HierarchicalProbabilisticNarrativeDirector
 * for "Mytholohiya". Supports multi-substory phase progression (EARLY_GAME ->
 * MID_GAME -> LATE_GAME), weather & time-of-day tracking for ambient audio
 * and visualizers, item-unlocked actions, and entity memory callbacks.
 */

import { StatResolver } from '../mechanics/StatResolver.js';
import { buildPrologueScenarios } from '../data/PlayerBackgrounds.js';

const TIME_OF_DAY_CYCLE = ['DUSK', 'NIGHT', 'MIDNIGHT', 'PRE-DAWN', 'DAY'];
const PHASE_ORDER = ['EARLY_GAME', 'MID_GAME', 'LATE_GAME'];

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
    this.currentTimeOfDay = 'DUSK';
    this.currentEnvironment = 'OUTDOOR';
    this.timeCycleIndex = 0;
    this.scenariosInCurrentTime = 0;
    this.scenariosUntilNextTime = this._rollStepDuration(2, 4);
    this.scenariosInCurrentWeather = 0;
    this.scenariosUntilNextWeather = this._rollStepDuration(2, 4);
    this.prologueQueue = [];
    this.visitedScenarioIds = new Set();
    this.visitedMiscIds = new Set();
    this.activeTags = new Set(['raining']);
    this.lastEmittedTags = ['raining'];
    this.turnCount = 0;
    this.isGameOver = false;
    this.awaitingContinue = false;

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

    return Math.max(0.0001, weight);
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

  _resolveScenarioEnvironment(scenario) {
    if (!scenario) return 'OUTDOOR';
    if (scenario.environment) {
      const explicit = String(scenario.environment).toUpperCase();
      if (['CABIN', 'KUBO', 'ESTABLISHMENT'].includes(explicit)) return 'CABIN';
      if (['TENT', 'CAMP', 'SHELTER'].includes(explicit)) return 'TENT';
      if (['CITY', 'KINGDOM', 'SETTLEMENT', 'PORT'].includes(explicit)) return 'CITY';
      if (explicit === 'OUTDOOR' || explicit === 'WILDERNESS') return 'OUTDOOR';
    }

    const label = String(scenario.locationLabel || '').toLowerCase();
    const promptText = Array.isArray(scenario.prompt)
      ? scenario.prompt.join(' ').toLowerCase()
      : String(scenario.prompt || '').toLowerCase();
    const combined = `${label} ${promptText}`;

    if (
      /\b(kubo|cabin|nipa house|nipa shack|hovel|tapahan|tavern|establishment|war-hall|pine-shrine|inside the dimly lit hut)\b/.test(
        combined
      )
    ) {
      return 'CABIN';
    }
    if (/\b(tent|bivouac|habihan shelter|lean-to|oilskin flaps)\b/.test(combined)) {
      return 'TENT';
    }
    if (
      /\b(kedatuan|kingdom|palace|torogan|wharf|bazaar|feast-circle|city|crowded boardwalks)\b/.test(
        combined
      )
    ) {
      return 'CITY';
    }

    return 'OUTDOOR';
  }

  presentScenario(scenario, prependResolutionParagraphs = []) {
    if (!scenario) return;

    this.awaitingContinue = false;
    this.currentScenario = scenario;
    this.turnCount += 1;

    if (scenario.isMisc) {
      this.visitedMiscIds.add(scenario.id);
    } else if (!scenario.isPrologue) {
      this.visitedScenarioIds.add(scenario.id);
    }

    if (this.turnCount === 1) {
      if (scenario.weather && scenario.weather !== 'ANY') {
        this.currentWeather = scenario.weather;
      }
      if (scenario.timeOfDay) {
        this.currentTimeOfDay = scenario.timeOfDay;
        const idx = TIME_OF_DAY_CYCLE.indexOf(this.currentTimeOfDay);
        this.timeCycleIndex = idx >= 0 ? idx : 0;
      } else {
        this.timeCycleIndex = 0;
        this.currentTimeOfDay = TIME_OF_DAY_CYCLE[0];
      }
      this.scenariosInCurrentTime = 1;
      this.scenariosInCurrentWeather = 1;
    } else {
      // Progress Time of Day only after 2 to 4 scenarios
      this.scenariosInCurrentTime += 1;
      if (this.scenariosInCurrentTime > this.scenariosUntilNextTime) {
        this.timeCycleIndex = (this.timeCycleIndex + 1) % TIME_OF_DAY_CYCLE.length;
        this.currentTimeOfDay = TIME_OF_DAY_CYCLE[this.timeCycleIndex];
        this.scenariosInCurrentTime = 1;
        this.scenariosUntilNextTime = this._rollStepDuration(2, 4);
      }

      // Progress Weather only after 2 to 4 scenarios (unless a choice explicitly forced a weather tag)
      this.scenariosInCurrentWeather += 1;
      let forcedWeather = null;
      if (this.lastEmittedTags.includes('clear_sky')) forcedWeather = 'CLEAR';
      else if (this.lastEmittedTags.includes('fog_gathering')) forcedWeather = 'SPIRIT FOG';
      else if (this.lastEmittedTags.includes('rain_stopping')) forcedWeather = 'DRIZZLE';
      else if (this.lastEmittedTags.includes('raining')) forcedWeather = 'MONSOON';

      if (forcedWeather && forcedWeather !== this.currentWeather) {
        this.currentWeather = this._stepGradualWeather(forcedWeather);
        this.scenariosInCurrentWeather = 1;
        this.scenariosUntilNextWeather = this._rollStepDuration(2, 4);
      } else if (this.scenariosInCurrentWeather > this.scenariosUntilNextWeather) {
        if (
          scenario.weather &&
          scenario.weather !== 'ANY' &&
          scenario.weather !== this.currentWeather
        ) {
          this.currentWeather = this._stepGradualWeather(scenario.weather);
        } else {
          this.currentWeather = this._nextNaturalWeather();
        }
        this.scenariosInCurrentWeather = 1;
        this.scenariosUntilNextWeather = this._rollStepDuration(2, 4);
      }
    }

    if (Array.isArray(scenario.intrinsicTags)) {
      for (const tag of scenario.intrinsicTags) {
        this.activeTags.add(tag);
        this.world.setFlag(tag);
      }
    }

    const paragraphs = [...prependResolutionParagraphs];

    if (scenario.seamlessHooks) {
      let selectedHook = null;
      for (const tag of this.lastEmittedTags) {
        if (scenario.seamlessHooks[tag]) {
          selectedHook = scenario.seamlessHooks[tag];
          break;
        }
      }
      if (!selectedHook) {
        for (const tag of this.activeTags) {
          if (scenario.seamlessHooks[tag]) {
            selectedHook = scenario.seamlessHooks[tag];
            break;
          }
        }
      }
      if (!selectedHook && scenario.seamlessHooks.default) {
        selectedHook = scenario.seamlessHooks.default;
      }
      if (selectedHook) {
        paragraphs.push(selectedHook);
      }
    }

    if (Array.isArray(scenario.prompt)) {
      paragraphs.push(...scenario.prompt);
    } else if (typeof scenario.prompt === 'string') {
      paragraphs.push(scenario.prompt);
    }

    const player = this.world.getEntity('player');
    if (scenario.passive && player) {
      const passiveResult = StatResolver.resolveCheck(
        player,
        scenario.passive.stat,
        scenario.passive.dc
      );
      this.eventBus.emit('check:resolved', {
        ...passiveResult,
        isPassive: true,
        prose: StatResolver.getOutcomeProse({
          statKey: passiveResult.statKey,
          outcome: passiveResult.outcome,
          isPassive: true
        })
      });
      const passiveText = passiveResult.success
        ? scenario.passive.success
        : scenario.passive.fail;
      if (passiveText) {
        paragraphs.push(passiveText);
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

    this.currentEnvironment = this._resolveScenarioEnvironment(scenario);

    this.eventBus.emit('narrative:nodeEntered', {
      nodeId: scenario.id,
      title: scenario.locationLabel || scenario.id,
      location: `${this.currentTimeOfDay} // ${this.currentWeather}`,
      weather: this.currentWeather,
      timeOfDay: this.currentTimeOfDay,
      environment: this.currentEnvironment,
      act: actLabel
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
    const rawChoices = Array.isArray(scenario.choices) ? scenario.choices : [];
    const evaluated = [];

    rawChoices.forEach((choice, index) => {
      const cond = StatResolver.checkChoiceCondition(choice, player, this.world);
      if (!cond.visible) return;

      let whisper = '';
      if (choice.itemActionTag) {
        whisper = choice.itemActionTag;
      } else if (choice.check && choice.check.stat) {
        whisper = StatResolver.getChallengeWhisper(
          player,
          choice.check.stat,
          choice.check.dc
        );
      }

      evaluated.push({
        index,
        label: choice.text || choice.label,
        whisper,
        allowed: cond.allowed,
        lockReason: cond.reason
      });
    });

    this.eventBus.emit('choices:render', {
      nodeId: scenario.id,
      isEnding: false,
      choices: evaluated
    });
  }

  _presentContinuePrompt() {
    this.eventBus.emit('choices:render', {
      nodeId: this.currentScenario ? this.currentScenario.id : 'continue',
      isEnding: false,
      choices: [
        {
          index: 'CONTINUE',
          label: '▶ CONTINUE TO NEXT SCENARIO',
          whisper: 'Proceed onward along your path',
          allowed: true
        }
      ]
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

  selectChoice(choiceIndex) {
    if (!this.currentScenario || this.isGameOver) return;

    if (choiceIndex === 'CONTINUE' || this.awaitingContinue) {
      this.continueToNextScenario();
      return;
    }

    const choice = this.currentScenario.choices[choiceIndex];
    if (!choice) return;

    const player = this.world.getEntity('player');
    const cond = StatResolver.checkChoiceCondition(choice, player, this.world);
    if (!cond.allowed) return;

    let isSuccess = true;
    let checkSummaryText = '';

    if (choice.check && choice.check.stat) {
      const checkResult = StatResolver.resolveCheck(
        player,
        choice.check.stat,
        choice.check.dc
      );
      this.eventBus.emit('check:resolved', checkResult);
      isSuccess = checkResult.success;
      const statusWord = checkResult.success ? 'SUCCESS' : 'FAILED';
      checkSummaryText = ` // ${checkResult.statKey} CHECK ${statusWord} (${checkResult.total} vs DC ${checkResult.dc})`;
    } else if (choice.itemActionTag) {
      checkSummaryText = ` // ${choice.itemActionTag.toUpperCase()}`;
    }

    const resolutionStory = isSuccess
      ? choice.successStory || []
      : choice.failStory || choice.successStory || [];

    const outcomeEffects = isSuccess
      ? choice.onSuccess
      : choice.onFail || choice.onSuccess;

    this.applyEffects(outcomeEffects);
    if (this.isGameOver) return;

    this.awaitingContinue = true;
    this.eventBus.emit('choices:clear');

    if (this.typewriter && this.typewriter.container) {
      const divider = document.createElement('div');
      divider.className = `narrative-outcome-header ${isSuccess ? 'outcome-pass' : 'outcome-fail'}`;
      divider.textContent = `❖ OUTCOME${checkSummaryText}`;
      this.typewriter.container.appendChild(divider);
    }

    const storyLines =
      Array.isArray(resolutionStory) && resolutionStory.length > 0
        ? resolutionStory
        : ['You carry out your decision and prepare to move on.'];

    this.typewriter.typeParagraphs(storyLines, () => {
      if (!this.isGameOver) {
        this._presentContinuePrompt();
      }
    });
  }

  applyEffects(effects) {
    if (!effects) return;

    if (typeof effects.hp === 'number' && effects.hp !== 0) {
      this.eventBus.emit('player:modifyVitality', {
        amount: effects.hp,
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
      const player = this.world.getEntity('player');
      const inv = player ? player.getComponent('Inventory') : null;
      if (inv) {
        const idx = inv.items.findIndex((i) => i.id === effects.removeItem);
        if (idx !== -1) {
          const [removed] = inv.items.splice(idx, 1);
          this.eventBus.emit('ui:updateInventory', { entity: player });
          this.eventBus.emit('log:mechanical', {
            type: 'item_loss',
            text: `Used ${removed.name}.`
          });
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

  _presentSubstoryCompletion(prependParagraphs = []) {
    const paragraphs = [
      ...prependParagraphs,
      'With the jaws of the Bakunawa uncoiled and the silver moon restored to the heavens, the long night over the archipelago finally breaks into golden dawn. Your name is etched forever into the bamboo chronicles of Mytholohiya.'
    ];
    this.eventBus.emit('narrative:nodeEntered', {
      nodeId: 'substory_complete',
      title: 'Dawn Over the Archipelago',
      location: 'DAY // CLEAR',
      weather: 'CLEAR',
      timeOfDay: 'DAY',
      act: 'CHRONICLE COMPLETE'
    });
    this.eventBus.emit('choices:clear');
    this.typewriter.clear();
    this.typewriter.typeParagraphs(paragraphs, () => {
      this.eventBus.emit('choices:render', {
        nodeId: 'substory_complete',
        isEnding: true,
        choices: []
      });
    });
  }

  _presentDefeatScreen() {
    this.eventBus.emit('narrative:nodeEntered', {
      nodeId: 'player_defeated',
      title: 'Claimed by the Mist',
      location: `${this.currentTimeOfDay} // ${this.currentWeather}`,
      weather: this.currentWeather,
      timeOfDay: this.currentTimeOfDay,
      act: 'CHRONICLE ENDED'
    });
    this.eventBus.emit('choices:clear');
    this.typewriter.clear();
    this.typewriter.typeParagraphs(
      [
        'Your strength gives out along the sodden trail. As the ancestral spirits gather in the mist, your name fades into the murmur of the monsoon.'
      ],
      () => {
        this.eventBus.emit('choices:render', {
          nodeId: 'player_defeated',
          isEnding: true,
          choices: []
        });
      }
    );
  }
}

export { HierarchicalProbabilisticNarrativeDirector as NarrativeDirector };
