/**
 * app.js
 * Application entry point and lightweight bootstrapper for "Mytholohiya".
 * Features:
 * - Initializes equipment and scenario registries
 * - Instantiates core subsystems (Audio, Visualizer, Typewriter, ECS World, NarrativeDirector)
 * - Instantiates and connects UIManager
 * - Bootstraps character prologue creation and game lifecycle
 */

import { eventBus } from './core/EventBus.js';
import { World, Component } from './core/ECS.js';
import { TypewriterEngine } from './core/TypewriterEngine.js';
import {
  VitalitySystem,
  RemnantSystem,
  InventorySystem,
  PanganibSystem,
  SurvivalStatusSystem,
  ExperienceSystem,
  EQUIPMENT_SLOTS
} from './mechanics/Systems.js';
import { ItemRegistry, createItemInstance } from './mechanics/ItemRegistry.js';
import { registerAllEquipment } from './data/items/index.js';
import { StatResolver } from './mechanics/StatResolver.js';
import {
  NarrativeRegistry,
  HierarchicalProbabilisticNarrativeDirector
} from './narrative/NarrativeDirector.js';
import './data/scenarios/index.js?v=2.4';
import { DarkReverbAudioEngine } from './audio/DarkReverbAudioEngine.js';
import { AtmosphereVisualizer } from './ui/AtmosphereVisualizer.js';
import { UIManager } from './ui/UIManager.js?v=2.4';
import { resolveAtmosphere, isSeamlessHookCompatible } from './core/AtmosphereResolver.js';
import { setGlobalCodexKnowledgeChecker } from './data/lore/MythologyCodex.js';

export { resolveAtmosphere, isSeamlessHookCompatible };

export class MythosRPGApp {
  constructor() {
    this.eventBus = eventBus;
    this.audio = new DarkReverbAudioEngine();
    this.visualizer = null;
    this.world = null;
    this.typewriter = null;
    this.director = null;
    this.ui = null;
  }

  get dom() {
    return this.ui ? this.ui.dom : null;
  }

  init() {
    // 1. Initialize item registry and pack definitions
    registerAllEquipment();

    // 2. Instantiate UI Manager (caching DOM elements)
    this.ui = new UIManager(this);

    // 3. Initialize visualizer and typewriter engines
    this.visualizer = new AtmosphereVisualizer(
      this.ui.dom.weatherSkyCanvas,
      this.ui.dom.ambientBleedCanvas
    );

    this.typewriter = new TypewriterEngine(
      this.ui.dom.narrativeContainer,
      this.eventBus,
      { charDelay: 12 }
    );

    setGlobalCodexKnowledgeChecker((id) =>
      this.world ? this.world.hasCreatureKnowledge(id) : false
    );

    // 4. Initialize UI bindings and view states
    this.ui.init();

    // 5. Start ambient visualizer animation loop
    if (this.visualizer && typeof this.visualizer.startLoop === 'function') {
      this.visualizer.startLoop();
    }
  }

  _enterFullscreen() {
    if (this.ui && typeof this.ui._enterFullscreen === 'function') {
      this.ui._enterFullscreen();
    }
  }

  /**
   * Unified Atmosphere Resolver:
   * Resolves weather, timeOfDay, and environment for a scenario with 3-tier priority.
   *
   * @param {Object} scenario
   * @returns {{ weather: string, timeOfDay: string, environment: string, envLabel: string }}
   */
  resolveAtmosphere(scenario) {
    const director = this.director;
    return resolveAtmosphere(scenario, {
      world: this.world,
      currentWeather: director ? director.currentWeather : 'DRIZZLE',
      currentTimeOfDay: director ? director.currentTimeOfDay : 'DUSK',
      currentEnvironment: director ? director.currentEnvironment : 'WILDERNESS'
    });
  }

  /**
   * Synchronizes visualizers, audio, labels, and CSS variables with the given atmosphere.
   *
   * @param {Object} atmosphere
   */
  syncAtmosphere(atmosphere) {
    if (!atmosphere) return;
    const { weather, timeOfDay, environment, envLabel } = atmosphere;
    const normWeather = weather === 'SPIRIT_FOG' ? 'SPIRIT FOG' : weather;

    if (this.audio) {
      this.audio.setAmbientEnvironment(normWeather, timeOfDay, environment);
    }
    if (this.visualizer) {
      this.visualizer.setEnvironment(normWeather, timeOfDay, environment);
    }
    if (this.ui) {
      this.ui.syncAtmosphereUI({
        weather: normWeather,
        timeOfDay,
        environment,
        envLabel
      });
    }
  }

  launchCharacterIntoPrologue({ characterName, background, expertise, stats, socialStatus }) {
    this._enterFullscreen();
    if (this.world && typeof this.world.destroy === 'function') {
      this.world.destroy();
    }
    if (this.director && typeof this.director.destroy === 'function') {
      this.director.destroy();
    }
    this.world = new World(this.eventBus);
    if (this.typewriter) {
      this.typewriter.setIsKnownChecker((id) =>
        this.world ? this.world.hasCreatureKnowledge(id) : false
      );
    }
    this.world
      .registerSystem(new VitalitySystem(this.world, this.eventBus))
      .registerSystem(new RemnantSystem(this.world, this.eventBus))
      .registerSystem(new InventorySystem(this.world, this.eventBus))
      .registerSystem(new PanganibSystem(this.world, this.eventBus))
      .registerSystem(new SurvivalStatusSystem(this.world, this.eventBus))
      .registerSystem(new ExperienceSystem(this.world, this.eventBus));

    const maxHp =
      background.maxVitality +
      socialStatus.hpMod +
      Math.max(0, StatResolver.getModifier(stats.CON) * 2);
    const startRemnants = Math.max(0, background.startingRemnants + socialStatus.remnantsBonus);

    const emptySlots = {};
    for (const s of EQUIPMENT_SLOTS) {
      emptySlots[s.id] = null;
    }

    const player = this.world.createEntity('player', characterName);
    player.world = this.world;
    player
      .addComponent(
        new Component('Identity', {
          characterName,
          backgroundId: background.id,
          backgroundName: background.name,
          name: characterName,
          tag: `${background.name} // ${expertise.name}`,
          expertiseId: expertise.id,
          expertiseName: expertise.name,
          socialStatus
        })
      )
      .addComponent(
        new Component('Stats', {
          ...stats,
          base: { ...stats },
          bonuses: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 }
        })
      )
      .addComponent(
        new Component('Vitality', {
          current: maxHp,
          max: maxHp
        })
      )
      .addComponent(
        new Component('Remnants', {
          count: startRemnants
        })
      )
      .addComponent(
        new Component('Inventory', {
          items: [],
          slots: emptySlots
        })
      )
      .addComponent(
        new Component('Panganib', {
          heat: 10,
          max: 100,
          tier: 'CALM',
          tierLabel: 'Serene'
        })
      )
      .addComponent(
        new Component('Conditions', {
          active: {}
        })
      )
      .addComponent(
        new Component('Boons', {
          active: {}
        })
      )
      .addComponent(
        new Component('Experience', {
          level: 1,
          currentXp: 0,
          nextLevelXp: 15
        })
      );

    if (Array.isArray(background.startingFlags)) {
      for (const flag of background.startingFlags) {
        this.world.setFlag(flag);
      }
    }
    if (socialStatus && socialStatus.tag) {
      this.world.setFlag(socialStatus.tag);
    }
    if (expertise && expertise.tag) {
      this.world.setFlag(expertise.tag);
    }

    const starterList = [
      ...(background.startingEquipment || []),
      ...(socialStatus.bonusItems || []),
      ...(expertise.bonusItems || [])
    ];
    for (const templateId of starterList) {
      this.eventBus.emit('inventory:add', { templateId, autoEquip: true });
    }

    if (this.ui.dom.diceLogList) {
      this.ui.dom.diceLogList.innerHTML = '';
    }

    if (socialStatus) {
      this.ui._appendMechanicalLog({
        type: 'status_apply',
        text: `Fate Revealed: ${socialStatus.label} (${socialStatus.wealthLabel} Wealth).`
      });
    }

    this.ui.transitionScreenState('GAMEPLAY', () => {
      this.ui._updateCharacterHUD(player);
      this.ui._renderInventoryPanel(player);
      this.ui._renderEquipmentSlotsModal(player);
      this.ui._updateTagsHUD([...this.world.flags]);
      this.ui._updateEchoesHUD([...this.world.flags]);

      this.director = new HierarchicalProbabilisticNarrativeDirector({
        world: this.world,
        eventBus: this.eventBus,
        typewriter: this.typewriter,
        registry: NarrativeRegistry
      });

      this.director.startScenario();
    });
  }

  restartGame() {
    if (this.world && typeof this.world.destroy === 'function') {
      this.world.destroy();
    }
    if (this.director && typeof this.director.destroy === 'function') {
      this.director.destroy();
    }
    if (this.ui) {
      this.ui.showBackgroundScreen();
    }
  }
}

function bootMythosApp() {
  if (window.__mythosAppInitialized) return;
  window.__mythosAppInitialized = true;
  const app = new MythosRPGApp();
  window.app = app;
  app.init();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootMythosApp);
} else {
  bootMythosApp();
}
