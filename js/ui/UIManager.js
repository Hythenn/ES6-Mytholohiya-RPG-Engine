/**
 * UIManager.js
 * Central UI Manager for "Mytholohiya".
 * Encapsulates all DOM queries, modal & drawer toggles, HUD & inventory rendering,
 * tactile d20 dice arena, character creation flows, and EventBus UI listeners.
 */

import { eventBus } from '../core/EventBus.js';
import {
  SURVIVAL_CONDITION_TEMPLATES,
  ANSTRAL_BOONS,
  EQUIPMENT_SLOTS
} from '../mechanics/Systems.js';
import { FactionManager } from '../mechanics/FactionManager.js';
import { StatResolver, ASPECT_NAMES } from '../mechanics/StatResolver.js';
import {
  PlayerBackgrounds,
  STAT_DEFINITIONS,
  EXPERTISE_OPTIONS,
  generateRandomName,
  rollRandomSocialStatus
} from '../data/character/PlayerBackgrounds.js';
import {
  MYTHOLOGY_CODEX,
  getMythologyEntry,
  annotateMythologyTerms,
  isCreature
} from '../data/lore/MythologyCodex.js';
import {
  ENVIRONMENT_DISPLAY_LABELS,
  WEATHER,
  TIME_OF_DAY,
  ENVIRONMENTS
} from '../core/Constants.js';

const ENTITY_ECHO_LABELS = Object.freeze({
  helped_nuno: {
    title: 'Nuno of the Red Clay',
    desc: 'The earth-elder remembers the hand that freed his beard.'
  },
  slighted_nuno: {
    title: 'Wrath of the Punso',
    desc: 'A crooked shadow dogs your heels along the earthen banks.'
  },
  tamaraw_kinship: {
    title: 'Sovereign of the Ridge',
    desc: 'The wild tamaraw freed from iron snares roams nearby.'
  },
  diwata_remembered: {
    title: 'Diwata of Tinago',
    desc: 'A white butterfly of the sacred headwaters lingers on your trail.'
  },
  diwata_displeased: {
    title: 'Chill of the Cataract',
    desc: 'The mountain waters darkened at your intrusion.'
  },
  unbound_mangrove_anito: {
    title: 'Unbound Mangrove Anito',
    desc: 'Bioluminescent tide-spirits owe your blade a debt.'
  },
  ignored_mangrove_anito: {
    title: 'The Blinded Roots',
    desc: 'You left the nailed spirit weeping in the swamp.'
  },
  helped_salt_boy: {
    title: 'The Salt-Boiler Apprentice',
    desc: 'Word of your mercy traveled ahead to the village scouts.'
  },
  abandoned_salt_boy: {
    title: 'Silent Witness on the Flats',
    desc: 'You took the brine-tax and left the survivor trembling.'
  },
  knows_reed_warning: {
    title: 'Scroll of the Hollow Root',
    desc: 'You carry the Baybayin warning against voices in the sedge.'
  },
  weaver_omen: {
    title: 'The Habihan Shuttle',
    desc: 'You completed the final row of the forgotten weaver.'
  },
  bulul_blessed: {
    title: 'Bulul of the Cloud-Terraces',
    desc: 'The wooden granary guardians recognize your respect.'
  },
  mumbaki_blessing: {
    title: 'Chant of the Mumbaki',
    desc: 'The highland gong-priest blessed your descent.'
  },
  outwitted_tambaluslos: {
    title: 'Laughter of the Tambaluslos',
    desc: 'Your reversed seams left the wide-mouthed trickster blinded by its own grin.'
  },
  tamed_tikbalang: {
    title: 'Golden Spine of the Tikbalang',
    desc: 'A plucked golden hair binds the wildwood stallion-spirit to your oath.'
  },
  kapre_boon: {
    title: 'Ember of the Acacia Kapre',
    desc: 'The nine-foot tree giant parted his Hamog smoke for your road.'
  },
  oryol_alliance: {
    title: 'Truce of Oryol',
    desc: 'The half-serpent enchantress of Ibalong respects your strategic resolve.'
  }
});

const OMEN_TAG_LABELS = Object.freeze({
  raining: 'Monsoon Downpour',
  clear_sky: 'Parted Clouds',
  fog_gathering: 'Creeping Spirit-Mist',
  rain_stopping: 'Thinning Drizzle',
  muddy_ground: 'Sunken Mire',
  high_ground: 'Wind-Scoured Ridge',
  wounded: 'Bleeding Wound',
  spirit_hexed: 'Lingering Bati Hex',
  clothing_inside_out: 'Garment Worn Inside-Out',
  salt_ward: 'Warded with Coarse Salt',
  cautious: 'Wary Footsteps',
  steady_nerves: 'Unshaken Resolve',
  spirit_respect: 'Honored the Unseen',
  kapwa_bond: 'Shared Kinship',
  kubo_hearth: 'Warmth of the Kubo Hearth',
  field_tent: 'Wind-Lashed Shelter',
  crowded_settlement: 'Murmur of the Kedatuan'
});

export const ANSTRAL_BOON_OFFERINGS = Object.freeze({
  boon_haliya_shield: {
    id: 'boon_haliya_shield',
    name: "Haliya's Lunar Shield",
    piloncitosCost: 10,
    itemCostId: 'blessed_lana_vial',
    itemTag: 'lana_oil',
    itemLabel: 'Lana Oil'
  },
  boon_kapre_stealth: {
    id: 'boon_kapre_stealth',
    name: "Kapre's Fog Stealth",
    piloncitosCost: 6,
    itemCostId: 'tobacco_leaf',
    itemTag: 'tobacco',
    itemLabel: 'Tobacco Leaf'
  },
  boon_apo_anito: {
    id: 'boon_apo_anito',
    name: "Apo Anito's Vitality Grace",
    piloncitosCost: 7,
    itemCostId: 'ripped_sheets',
    itemTag: 'cloth_sheet',
    itemLabel: 'Cloth Sheet'
  },
  boon_tala_guidance: {
    id: 'boon_tala_guidance',
    name: "Tala's Star Guidance",
    piloncitosCost: 8,
    itemCostId: 'coarse_salt_pouch',
    itemTag: 'salt_item',
    itemLabel: 'Coarse Salt'
  }
});

export class UIManager {
  constructor(app) {
    this.app = app;
    this.expandedItemUid = null;
    this.selectedEquipSlotId = null;
    this.inventoryFilter = 'all';
    this.selectedCodexId = 'bakunawa';
    this.currentCreationMode = 'archetype';
    this.stagedPrep = null;
    this.choiceReadyTimestamp = 0;
    this.ambushTimerId = null;
    this.ambushTimeRemaining = 0;
    this.activeAmbushDuration = 5000;
    this.pendingDiceResolution = null;
    this.diceRollingInterval = null;

    this.presetState = {
      name: generateRandomName(),
      socialStatus: rollRandomSocialStatus()
    };

    this.randomCharState = null;

    this.customState = {
      name: generateRandomName(),
      backgroundId: PlayerBackgrounds[0].id,
      expertiseId: EXPERTISE_OPTIONS[0].id,
      socialStatus: rollRandomSocialStatus(),
      baseStats: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
      allocated: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
      pointsRemaining: 10
    };

    this.dom = {
      screenFadeOverlay: document.getElementById('screen-fade-overlay'),
      launchScreen: document.getElementById('launch-screen'),
      launchMainCard: document.getElementById('launch-main-card'),
      btnLaunchStart: document.getElementById('btn-launch-start'),
      btnLaunchOptions: document.getElementById('btn-launch-options'),
      btnHeaderCodex: document.getElementById('btn-header-codex'),
      btnHeaderOptions: document.getElementById('btn-header-options'),
      optionsModal: document.getElementById('options-modal'),
      btnCloseOptions: document.getElementById('btn-close-options'),
      btnToggleSfx: document.getElementById('btn-toggle-sfx'),
      btnToggleAmbient: document.getElementById('btn-toggle-ambient'),
      optionRowRestart: document.getElementById('option-row-restart'),
      restartConfirmBox: document.getElementById('restart-confirm-box'),
      btnConfirmRestart: document.getElementById('btn-confirm-restart'),
      btnCancelRestart: document.getElementById('btn-cancel-restart'),
      weatherSkyCanvas: document.getElementById('weather-sky-canvas'),
      ambientBleedCanvas: document.getElementById('ambient-bleed-canvas'),
      visTimeLabel: document.getElementById('vis-time-label'),
      visWeatherLabel: document.getElementById('vis-weather-label'),
      visEnvLabel: document.getElementById('vis-env-label'),
      charInfoModal: document.getElementById('char-info-modal'),
      btnOpenCharInfo: document.getElementById('btn-open-char-info'),
      btnCloseCharInfo: document.getElementById('btn-close-char-info'),
      modalCharName: document.getElementById('modal-char-name'),
      modalCharSubtitle: document.getElementById('modal-char-subtitle'),
      equipmentSlotsGrid: document.getElementById('equipment-slots-grid'),
      factionStandingsGrid: document.getElementById('faction-standings-grid'),
      moralMarksList: document.getElementById('moral-marks-list'),
      playerInventoryList: document.getElementById('player-inventory-list'),
      inventoryCountBadge: document.getElementById('inventory-count-badge'),
      invFilterTabs: document.querySelectorAll('.inv-tab'),
      mythHoverTooltip: document.getElementById('myth-hover-tooltip'),
      mythTipName: document.getElementById('myth-tip-name'),
      mythTipCategory: document.getElementById('myth-tip-category'),
      mythTipAttitude: document.getElementById('myth-tip-attitude'),
      mythTipSummary: document.getElementById('myth-tip-summary'),
      mythCodexModal: document.getElementById('myth-codex-modal'),
      btnCloseCodex: document.getElementById('btn-close-codex'),
      codexEntryList: document.getElementById('codex-entry-list'),
      codexEntityCategory: document.getElementById('codex-entity-category'),
      codexEntityName: document.getElementById('codex-entity-name'),
      codexEntitySubtitle: document.getElementById('codex-entity-subtitle'),
      codexEntityOrigin: document.getElementById('codex-entity-origin'),
      codexEntityAttitude: document.getElementById('codex-entity-attitude'),
      codexEntityWards: document.getElementById('codex-entity-wards'),
      codexEntityAttributes: document.getElementById('codex-entity-attributes'),
      codexEntityDescription: document.getElementById('codex-entity-description'),
      backgroundModal: document.getElementById('background-selection-screen'),
      modeTabs: document.querySelectorAll('.mode-tab'),
      panelArchetype: document.getElementById('mode-panel-archetype'),
      panelRandom: document.getElementById('mode-panel-random'),
      panelCustom: document.getElementById('mode-panel-custom'),
      presetRandomName: document.getElementById('preset-random-name'),
      presetRandomStatus: document.getElementById('preset-random-status'),
      btnRerollPresetName: document.getElementById('btn-reroll-preset-name'),
      btnBgScrollLeft: document.getElementById('btn-bg-scroll-left'),
      btnBgScrollRight: document.getElementById('btn-bg-scroll-right'),
      backgroundGrid: document.getElementById('background-cards-grid'),
      randomShowcase: document.getElementById('random-character-showcase'),
      customNameInput: document.getElementById('custom-name-input'),
      btnRandomCustomName: document.getElementById('btn-random-custom-name'),
      customBgSelect: document.getElementById('custom-bg-select'),
      customBgDesc: document.getElementById('custom-bg-desc'),
      customExpSelect: document.getElementById('custom-exp-select'),
      customExpDesc: document.getElementById('custom-exp-desc'),
      customStatusTitle: document.getElementById('custom-status-title'),
      customStatusDesc: document.getElementById('custom-status-desc'),
      btnRerollCustomStatus: document.getElementById('btn-reroll-custom-status'),
      customPointsRemaining: document.getElementById('custom-points-remaining'),
      customStatAllocator: document.getElementById('custom-stat-allocator'),
      customPreviewHp: document.getElementById('custom-preview-hp'),
      customPreviewRemnants: document.getElementById('custom-preview-remnants'),
      btnStartCustomChar: document.getElementById('btn-start-custom-char'),
      gameWorkspace: document.getElementById('game-workspace'),
      narrativeColumn: document.querySelector('.narrative-column'),
      actBanner: document.getElementById('scene-act'),
      sceneTitle: document.getElementById('scene-title'),
      narrativeContainer: document.getElementById('narrative-output'),
      choicesContainer: document.getElementById('choices-container'),
      skipButton: document.getElementById('btn-skip-text'),
      restartButton: document.getElementById('btn-restart'),
      charName: document.getElementById('char-archetype-name'),
      charLevelBadge: document.getElementById('char-level-badge'),
      charTag: document.getElementById('char-archetype-tag'),
      charStatusBadge: document.getElementById('char-status-badge'),
      xpValue: document.getElementById('xp-value'),
      xpBar: document.getElementById('xp-bar'),
      playerInventoryGrid: document.getElementById('player-inventory-grid'),
      inventorySelectedDetails: document.getElementById('inventory-selected-details'),
      chronicleModal: document.getElementById('chronicle-modal'),
      btnCloseChronicle: document.getElementById('btn-close-chronicle'),
      chronicleHeroBanner: document.getElementById('chronicle-hero-banner'),
      chronicleStoryContent: document.getElementById('chronicle-story-content'),
      vitalityValue: document.getElementById('vitality-value'),
      vitalityBar: document.getElementById('vitality-bar-fill'),
      sanityValue: document.getElementById('sanity-value'),
      sanityBar: document.getElementById('sanity-bar-fill'),
      panganibValue: document.getElementById('panganib-value'),
      panganibBar: document.getElementById('panganib-bar-fill'),
      panganibTierBadge: document.getElementById('panganib-tier-badge'),
      survivalConditionsList: document.getElementById('survival-conditions-list'),
      conditionsCountBadge: document.getElementById('conditions-count-badge'),
      btnOpenDambana: document.getElementById('btn-open-dambana'),
      dambanaModal: document.getElementById('dambana-modal'),
      btnCloseDambana: document.getElementById('btn-close-dambana'),
      statsList: document.getElementById('stats-list'),
      statusList: document.getElementById('status-effects-list'),
      inventoryList: document.getElementById('inventory-list'),
      diceLogList: document.getElementById('dice-log-list'),
      pressureTimerContainer: document.getElementById('pressure-timer-container'),
      pressureTimerText: document.getElementById('pressure-timer-text'),
      pressureFill: document.getElementById('pressure-fill'),
      diceRollModal: document.getElementById('dice-roll-modal'),
      diceCheckTag: document.getElementById('dice-check-tag'),
      diceCheckTitle: document.getElementById('dice-check-title'),
      diceDcBadge: document.getElementById('dice-dc-badge'),
      d20Visual: document.getElementById('d20-visual'),
      d20Number: document.getElementById('d20-number'),
      diceStatusLabel: document.getElementById('dice-status-label'),
      diceMathContainer: document.getElementById('dice-math-container'),
      diceMathBreakdown: document.getElementById('dice-math-breakdown'),
      diceVerdictBox: document.getElementById('dice-verdict-box'),
      btnRollDice: document.getElementById('btn-roll-dice'),
      btnContinueRoll: document.getElementById('btn-continue-roll')
    };
  }

  get world() {
    return this.app ? this.app.world : null;
  }

  set world(w) {
    if (this.app) this.app.world = w;
  }

  get director() {
    return this.app ? this.app.director : null;
  }

  set director(d) {
    if (this.app) this.app.director = d;
  }

  get audio() {
    return this.app ? this.app.audio : null;
  }

  get visualizer() {
    return this.app ? this.app.visualizer : null;
  }

  get typewriter() {
    return this.app ? this.app.typewriter : null;
  }

  get eventBus() {
    return this.app ? this.app.eventBus : eventBus;
  }

  init() {
    this._bindGlobalEvents();
    this._initCreationUI();
    this._renderCodexModal(this.selectedCodexId);
    this._initScrollFades();
    this.setScreenState('LAUNCH');
  }

  launchCharacterIntoPrologue(charData) {
    if (this.app && typeof this.app.launchCharacterIntoPrologue === 'function') {
      return this.app.launchCharacterIntoPrologue(charData);
    }
  }

  restartGame() {
    if (this.app && typeof this.app.restartGame === 'function') {
      return this.app.restartGame();
    }
    this.showBackgroundScreen();
  }

  /**
   * Synchronizes #vis-time-label, #vis-weather-label, and #vis-env-label.
   *
   * @param {Object} options
   * @param {string} options.weather
   * @param {string} options.timeOfDay
   * @param {string} options.environment
   * @param {string} options.envLabel
   */
  syncAtmosphereUI({ weather, timeOfDay, environment, envLabel }) {
    if (this.dom.visTimeLabel) this.dom.visTimeLabel.textContent = timeOfDay;
    if (this.dom.visWeatherLabel) this.dom.visWeatherLabel.textContent = weather;
    if (this.dom.visEnvLabel) this.dom.visEnvLabel.textContent = envLabel;
  }

  _initScrollFades() {
    const verticalEls = [
      this.dom.codexEntryList,
      this.dom.playerInventoryList,
      this.dom.inventoryList,
      this.dom.statusList,
      this.dom.diceLogList,
      this.dom.charInfoModal && this.dom.charInfoModal.querySelector('.char-info-box'),
      this.dom.mythCodexModal && this.dom.mythCodexModal.querySelector('#codex-detail-pane')
    ].filter(Boolean);

    for (const el of verticalEls) {
      el.classList.add('scroll-fade-y');
      el.addEventListener('scroll', () => this._updateScrollFade(el, 'y'), { passive: true });
    }

    if (this.dom.backgroundGrid) {
      this.dom.backgroundGrid.addEventListener(
        'scroll',
        () => this._updateScrollFade(this.dom.backgroundGrid, 'x'),
        { passive: true }
      );
    }

    window.addEventListener('resize', () => this._refreshAllScrollFades(), { passive: true });
    this._refreshAllScrollFades();
  }

  _updateScrollFade(el, axis = 'y') {
    if (!el) return;
    const threshold = 6;
    if (axis === 'x') {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const canLeft = el.scrollLeft > threshold;
      const canRight = maxScroll - el.scrollLeft > threshold;
      el.classList.remove('fade-x-left', 'fade-x-right', 'fade-x-both', 'fade-x-none');
      if (maxScroll <= threshold) {
        el.classList.add('fade-x-none');
      } else if (canLeft && canRight) {
        el.classList.add('fade-x-both');
      } else if (canLeft) {
        el.classList.add('fade-x-left');
      } else {
        el.classList.add('fade-x-right');
      }
    } else {
      const maxScroll = el.scrollHeight - el.clientHeight;
      const canUp = el.scrollTop > threshold;
      const canDown = maxScroll - el.scrollTop > threshold;
      el.classList.remove('fade-y-top', 'fade-y-bottom', 'fade-y-both', 'fade-y-none');
      if (maxScroll <= threshold) {
        el.classList.add('fade-y-none');
      } else if (canUp && canDown) {
        el.classList.add('fade-y-both');
      } else if (canUp) {
        el.classList.add('fade-y-top');
      } else {
        el.classList.add('fade-y-bottom');
      }
    }
  }

  _refreshAllScrollFades() {
    window.requestAnimationFrame(() => {
      if (this.dom.backgroundGrid) this._updateScrollFade(this.dom.backgroundGrid, 'x');
      if (this.dom.codexEntryList) this._updateScrollFade(this.dom.codexEntryList, 'y');
      if (this.dom.playerInventoryList) this._updateScrollFade(this.dom.playerInventoryList, 'y');
      if (this.dom.inventoryList) this._updateScrollFade(this.dom.inventoryList, 'y');
      if (this.dom.statusList) this._updateScrollFade(this.dom.statusList, 'y');
      if (this.dom.diceLogList) this._updateScrollFade(this.dom.diceLogList, 'y');
      const charBox =
        this.dom.charInfoModal && this.dom.charInfoModal.querySelector('.char-info-box');
      if (charBox) this._updateScrollFade(charBox, 'y');
      const codexDetail =
        this.dom.mythCodexModal && this.dom.mythCodexModal.querySelector('#codex-detail-pane');
      if (codexDetail) this._updateScrollFade(codexDetail, 'y');
    });
  }

  setScreenState(state) {
    this.currentScreenState = state;
    const isLaunch = state === 'LAUNCH';
    const isSelect = state === 'CHARACTER_SELECT';
    const isGame = state === 'GAMEPLAY';

    if (this.dom.screenFadeOverlay) {
      this.dom.screenFadeOverlay.classList.remove('is-active');
      this.dom.screenFadeOverlay.style.pointerEvents = 'none';
    }

    if (this.visualizer) {
      this.visualizer.setScreenMode(isGame ? 'GAMEPLAY' : 'MAP');
    }

    if (this.dom.launchScreen) {
      this.dom.launchScreen.hidden = !isLaunch;
      this.dom.launchScreen.style.display = isLaunch ? '' : 'none';
    }

    if (this.dom.backgroundModal) {
      this.dom.backgroundModal.hidden = !isSelect;
      this.dom.backgroundModal.style.display = isSelect ? '' : 'none';
    }

    if (this.dom.gameWorkspace) {
      this.dom.gameWorkspace.hidden = !isGame;
      this.dom.gameWorkspace.style.display = isGame ? '' : 'none';
    }

    if (this.dom.optionRowRestart) {
      this.dom.optionRowRestart.hidden = !isGame;
      this.dom.optionRowRestart.style.display = isGame ? 'flex' : 'none';
    }

    if (this.dom.restartButton) {
      this.dom.restartButton.hidden = !isGame;
    }

    document.body.classList.toggle('workspace-active', isGame);

    this.closeOptionsModal();
    this.closeCharInfoModal();
    this.closeCodexModal();
    this.closeChronicleModal();
    this.closeDambanaModal();
    this.closeDiceRollModal();
    this._hideMythTooltip();
    this._clearCinematicTimer();
    this._refreshAllScrollFades();
    window.scrollTo(0, 0);
    if (isGame && this.dom.narrativeColumn) {
      this.dom.narrativeColumn.scrollTop = 0;
    }
  }

  transitionScreenState(targetState, onBlackoutCallback = null, customConfig = null) {
    const overlay = this.dom.screenFadeOverlay;
    if (!overlay) {
      this.setScreenState(targetState);
      if (typeof onBlackoutCallback === 'function') {
        try {
          onBlackoutCallback();
        } catch (err) {
          console.error('[UIManager] Error in onBlackoutCallback:', err);
        }
      }
      return;
    }

    if (this._fadeTimeoutId) {
      window.clearTimeout(this._fadeTimeoutId);
      this._fadeTimeoutId = null;
    }
    if (this._fadePointerTimeoutId) {
      window.clearTimeout(this._fadePointerTimeoutId);
      this._fadePointerTimeoutId = null;
    }
    overlay.classList.remove('is-active');
    overlay.style.pointerEvents = 'none';

    this.closeOptionsModal();
    this.closeCharInfoModal();
    this.closeCodexModal();
    this.closeChronicleModal();
    this.closeDambanaModal();
    this.closeDiceRollModal();
    this._hideMythTooltip();

    const fromState = this.currentScreenState;
    const isCoreGameTransition = targetState === 'GAMEPLAY' || fromState === 'GAMEPLAY';

    // Transition timings:
    // Core game loop transitions (entering or leaving GAMEPLAY):
    // 1600ms fade-out, 600ms pitch-black hold, 1600ms fade-in (~3.8s total)
    // General state transitions (menu to char select):
    // 900ms fade-out, 300ms pitch-black hold, 900ms fade-in (~2.1s total)
    const fadeOutMs =
      customConfig && typeof customConfig.fadeOutMs === 'number'
        ? customConfig.fadeOutMs
        : isCoreGameTransition
        ? 1600
        : 900;

    const blackoutHoldMs =
      customConfig && typeof customConfig.blackoutHoldMs === 'number'
        ? customConfig.blackoutHoldMs
        : isCoreGameTransition
        ? 600
        : 300;

    const fadeInMs =
      customConfig && typeof customConfig.fadeInMs === 'number'
        ? customConfig.fadeInMs
        : isCoreGameTransition
        ? 1600
        : 900;

    overlay.style.transition = `opacity ${fadeOutMs}ms cubic-bezier(0.4, 0, 0.2, 1)`;

    // Force layout reflow to commit transition property before class change
    void overlay.offsetHeight;
    overlay.classList.add('is-active');
    overlay.style.pointerEvents = 'all';

    this._fadeTimeoutId = window.setTimeout(() => {
      try {
        this.setScreenState(targetState);
        if (typeof onBlackoutCallback === 'function') {
          onBlackoutCallback();
        }
      } catch (err) {
        console.error('[UIManager] Error during transition blackout execution:', err);
      } finally {
        overlay.style.transition = `opacity ${fadeInMs}ms cubic-bezier(0.2, 0, 0.2, 1)`;
        overlay.classList.remove('is-active');
        overlay.style.pointerEvents = 'none';

        this._fadePointerTimeoutId = window.setTimeout(() => {
          overlay.classList.remove('is-active');
          overlay.style.pointerEvents = 'none';
          this._fadePointerTimeoutId = null;
        }, fadeInMs + 50);

        this._fadeTimeoutId = null;
      }
    }, fadeOutMs + blackoutHoldMs);
  }

  closeDiceRollModal() {
    if (this.dom.diceRollModal) {
      this.dom.diceRollModal.hidden = true;
      this.dom.diceRollModal.style.display = 'none';
    }
    this.pendingDiceResolution = null;
  }

  openCodexModal(entryId = null) {
    if (entryId && MYTHOLOGY_CODEX[entryId]) {
      this.selectedCodexId = entryId;
    } else if (!this.selectedCodexId) {
      this.selectedCodexId = 'babaylan';
    }
    this._renderCodexModal(this.selectedCodexId);
    this._hideMythTooltip();
    if (this.dom.mythCodexModal) {
      this.dom.mythCodexModal.hidden = false;
      this.dom.mythCodexModal.style.display = 'flex';
      this._refreshAllScrollFades();
    }
  }

  closeCodexModal() {
    if (this.dom.mythCodexModal) {
      this.dom.mythCodexModal.hidden = true;
      this.dom.mythCodexModal.style.display = 'none';
    }
  }

  _isCodexEntryKnown(id) {
    if (!isCreature(id)) return true;
    return Boolean(this.app && this.app.world && this.app.world.hasCreatureKnowledge(id));
  }

  _renderCodexModal(activeId) {
    const targetId = activeId || this.selectedCodexId || 'babaylan';
    const entry = getMythologyEntry(targetId) || MYTHOLOGY_CODEX.babaylan;
    if (!entry) return;
    this.selectedCodexId = entry.id;

    const isCurrentKnown = this._isCodexEntryKnown(entry.id);

    if (this.dom.codexEntryList) {
      this.dom.codexEntryList.innerHTML = '';
      for (const item of Object.values(MYTHOLOGY_CODEX)) {
        const known = this._isCodexEntryKnown(item.id);
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `codex-entry-btn ${item.id === entry.id ? 'active' : ''} ${known ? '' : 'undiscovered-entry'
          }`;
        const displayName = known ? item.name : '??? [UNDISCOVERED]';
        const displayTag = known ? item.category.split(' ')[0] : '???';
        btn.innerHTML = `
          <span>${displayName}</span>
          <span class="card-tag">${displayTag}</span>
        `;
        btn.addEventListener('click', () => {
          try { this.audio.playClick(); } catch (_err) {}
          this._renderCodexModal(item.id);
        });
        li.appendChild(btn);
        this.dom.codexEntryList.appendChild(li);
      }
    }

    if (isCurrentKnown) {
      if (this.dom.codexEntityCategory) this.dom.codexEntityCategory.textContent = entry.category;
      if (this.dom.codexEntityName) this.dom.codexEntityName.textContent = entry.name;
      if (this.dom.codexEntitySubtitle) this.dom.codexEntitySubtitle.textContent = entry.title;
      if (this.dom.codexEntityOrigin) this.dom.codexEntityOrigin.textContent = entry.origin;

      if (this.dom.codexEntityAttitude) {
        this.dom.codexEntityAttitude.textContent = entry.attitude;
        this.dom.codexEntityAttitude.className = `codex-attitude-value tone-${entry.attitudeTone || 'neutral'
          }`;
      }

      if (this.dom.codexEntityWards) {
        this.dom.codexEntityWards.textContent = entry.wards || 'Unknown';
      }

      if (this.dom.codexEntityAttributes) {
        this.dom.codexEntityAttributes.innerHTML = (entry.attributes || [])
          .map((attr) => `<li class="codex-attr-pill">❖ ${attr}</li>`)
          .join('');
      }

      if (this.dom.codexEntityDescription) {
        this.dom.codexEntityDescription.textContent = entry.description;
      }
    } else {
      if (this.dom.codexEntityCategory) this.dom.codexEntityCategory.textContent = 'Unknown Entity';
      if (this.dom.codexEntityName) this.dom.codexEntityName.textContent = '??? [Undiscovered Creature]';
      if (this.dom.codexEntitySubtitle) {
        this.dom.codexEntitySubtitle.textContent = 'Encounter and overcome this entity to unlock its lore.';
      }
      if (this.dom.codexEntityOrigin) this.dom.codexEntityOrigin.textContent = 'Unknown Region';

      if (this.dom.codexEntityAttitude) {
        this.dom.codexEntityAttitude.textContent = 'Unknown';
        this.dom.codexEntityAttitude.className = 'codex-attitude-value tone-neutral';
      }

      if (this.dom.codexEntityWards) {
        this.dom.codexEntityWards.textContent =
          'Knowledge locked. Overcoming this creature or surviving an encounter reveals its folklore wards.';
      }

      if (this.dom.codexEntityAttributes) {
        this.dom.codexEntityAttributes.innerHTML =
          '<li class="codex-attr-pill">❖ Folklore attributes yet unlearned</li>';
      }

      if (this.dom.codexEntityDescription) {
        this.dom.codexEntityDescription.textContent =
          'The true name, habits, and weaknesses of this creature remain veiled in superstition and mist. Overcoming its trials in the archipelago will record its truth within the bamboo codex.';
      }
    }

    const codexDetail =
      this.dom.mythCodexModal && this.dom.mythCodexModal.querySelector('#codex-detail-pane');
    if (codexDetail) {
      codexDetail.scrollTop = 0;
    }
    this._refreshAllScrollFades();
  }

  _showMythTooltip(entry, clientX, clientY) {
    if (!entry || !this.dom.mythHoverTooltip) return;
    if (!this._isCodexEntryKnown(entry.id)) {
      this._hideMythTooltip();
      return;
    }
    if (this.dom.mythTipName) this.dom.mythTipName.textContent = entry.name;
    if (this.dom.mythTipCategory) this.dom.mythTipCategory.textContent = entry.category;
    if (this.dom.mythTipAttitude) {
      this.dom.mythTipAttitude.textContent = `Attitude: ${entry.attitude}`;
    }
    if (this.dom.mythTipSummary) this.dom.mythTipSummary.textContent = entry.shortSummary;

    this.dom.mythHoverTooltip.hidden = false;
    this._positionMythTooltip(clientX, clientY);
  }

  _positionMythTooltip(clientX, clientY) {
    const tip = this.dom.mythHoverTooltip;
    if (!tip || tip.hidden) return;
    const offset = 16;
    const rect = tip.getBoundingClientRect();
    let left = clientX + offset;
    let top = clientY + offset;

    if (left + rect.width > window.innerWidth - 12) {
      left = Math.max(12, clientX - rect.width - offset);
    }
    if (top + rect.height > window.innerHeight - 12) {
      top = Math.max(12, clientY - rect.height - offset);
    }

    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  _hideMythTooltip() {
    if (this.dom.mythHoverTooltip) {
      this.dom.mythHoverTooltip.hidden = true;
    }
  }

  _showInstinctTooltip(badgeEl, clientX, clientY) {
    if (!badgeEl) return;
    let tip = document.getElementById('instinct-hover-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'instinct-hover-tooltip';
      tip.className = 'instinct-tooltip';
      document.body.appendChild(tip);
    }

    const stat = (badgeEl.getAttribute('data-stat') || 'WIS').toUpperCase();
    const score = badgeEl.getAttribute('data-score') || '12';
    const dc = badgeEl.getAttribute('data-dc') || '12';

    const statNames = {
      WIS: 'Wisdom (Instinct & Perception)',
      INT: 'Intelligence (Tactical Deduction)',
      DEX: 'Dexterity (Reflex & Agility)',
      STR: 'Strength (Physical Power)',
      CON: 'Constitution (Fortitude)',
      CHA: 'Charisma (Presence & Resolve)'
    };
    const statName = statNames[stat] || `${stat} (Instinct)`;

    let desc = '';
    if (stat === 'WIS') {
      desc = 'Your heightened senses and ancestral sensitivity pierce through the veil, noticing guarded intentions and hidden movements.';
    } else if (stat === 'INT') {
      desc = 'Your sharp intellect quickly deciphers the tactical layout, piecing together subtle environmental clues and motives.';
    } else if (stat === 'DEX') {
      desc = 'Your honed reflexes and swift instincts allow you to anticipate sudden movement before anyone else reacts.';
    } else if (stat === 'STR') {
      desc = 'Your martial readiness and keen awareness of leverage reveal a direct physical opportunity.';
    } else {
      desc = 'Your innate instincts pierce through the veil of doubt, giving you crucial clarity in this moment.';
    }

    tip.innerHTML = `
      <div class="instinct-tip-header">
        <span class="instinct-tip-title">✦ INSTINCT PERCEPTION</span>
        <span class="instinct-tip-badge">PASSED</span>
      </div>
      <div class="instinct-tip-stat-row">
        <span class="instinct-tip-stat-name">Passive ${stat} Check</span>
        <span class="instinct-tip-stat-score">${score} vs DC ${dc} <span class="instinct-tip-success">(Success)</span></span>
      </div>
      <div class="instinct-tip-desc">${desc}</div>
      <div class="instinct-tip-subtext">Stat: ${statName}</div>
    `;

    tip.hidden = false;
    tip.style.display = 'flex';
    this._positionInstinctTooltip(clientX, clientY, badgeEl);
  }

  _positionInstinctTooltip(clientX, clientY, badgeEl = null) {
    const tip = document.getElementById('instinct-hover-tooltip');
    if (!tip || tip.hidden) return;

    const offset = 16;
    const rect = tip.getBoundingClientRect();
    let left = clientX !== undefined && clientX !== 0 ? clientX + offset : 0;
    let top = clientY !== undefined && clientY !== 0 ? clientY + offset : 0;

    if (badgeEl && (clientX === undefined || clientY === undefined || (clientX === 0 && clientY === 0))) {
      const bRect = badgeEl.getBoundingClientRect();
      left = bRect.left;
      top = bRect.bottom + 8;
    }

    if (left + rect.width > window.innerWidth - 12) {
      left = Math.max(12, (clientX || 100) - rect.width - offset);
    }
    if (top + rect.height > window.innerHeight - 12) {
      top = Math.max(12, (clientY || 100) - rect.height - offset);
    }

    tip.style.left = `${Math.round(left)}px`;
    tip.style.top = `${Math.round(top)}px`;
  }

  _hideInstinctTooltip() {
    const tip = document.getElementById('instinct-hover-tooltip');
    if (tip) {
      tip.hidden = true;
      tip.style.display = 'none';
    }
  }

  _showStatTooltip(statKey, statVal, clientX, clientY, targetEl) {
    if (!statKey) return;
    const key = statKey.toUpperCase();
    const def = STAT_DEFINITIONS[key];
    if (!def) return;

    let tip = document.getElementById('stat-hover-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'stat-hover-tooltip';
      tip.className = 'stat-hover-tooltip';
      document.body.appendChild(tip);
    }

    const score = Number(statVal);
    const hasScore = !isNaN(score) && statVal !== null && statVal !== undefined && statVal !== '';
    const mod = hasScore ? Math.floor((score - 10) / 2) : 0;
    const modSign = mod >= 0 ? `+${mod}` : `${mod}`;
    const valBadgeText = hasScore ? `Score ${score} (${modSign})` : 'Base 10 (+0)';

    tip.innerHTML = `
      <div class="stat-tip-header">
        <div class="stat-tip-title-box">
          <span class="stat-tip-title">${def.icon || '✦'} ${def.name.toUpperCase()} (${def.code})</span>
          <span class="stat-tip-sub">${def.subtitle}</span>
        </div>
        <span class="stat-tip-val-badge">${valBadgeText}</span>
      </div>
      <div class="stat-tip-desc">${def.description}</div>
      <div class="stat-tip-section">
        <span class="stat-tip-section-title">⚡ ACTION FORMULATION & COMPLEXITY</span>
        <div class="stat-tip-section-text">${def.actionImpact}</div>
      </div>
      <div class="stat-tip-section scenario-sec">
        <span class="stat-tip-section-title scenario-title">🧭 SCENARIO ENCOUNTERS & HAZARDS</span>
        <div class="stat-tip-section-text">${def.scenarioImpact}</div>
      </div>
    `;

    tip.hidden = false;
    tip.style.display = 'flex';
    this._positionStatTooltip(clientX, clientY, targetEl);
  }

  _positionStatTooltip(clientX, clientY, targetEl = null) {
    const tip = document.getElementById('stat-hover-tooltip');
    if (!tip || tip.hidden) return;

    const offset = 16;
    const rect = tip.getBoundingClientRect();
    let left = clientX + offset;
    let top = clientY + offset;

    if (targetEl) {
      const bRect = targetEl.getBoundingClientRect();
      left = bRect.left;
      top = bRect.bottom + 8;
    }

    if (left + rect.width > window.innerWidth - 12) {
      left = Math.max(12, (clientX || 100) - rect.width - offset);
    }
    if (top + rect.height > window.innerHeight - 12) {
      left = Math.max(12, left);
      top = Math.max(12, (clientY || 100) - rect.height - offset);
    }

    tip.style.left = `${Math.round(left)}px`;
    tip.style.top = `${Math.round(top)}px`;
  }

  _hideStatTooltip() {
    const tip = document.getElementById('stat-hover-tooltip');
    if (tip) {
      tip.hidden = true;
      tip.style.display = 'none';
    }
  }

  openOptionsModal() {
    this._hideRestartConfirm();
    const isGame = this.currentScreenState === 'GAMEPLAY';
    if (this.dom.optionRowRestart) {
      this.dom.optionRowRestart.hidden = !isGame;
      this.dom.optionRowRestart.style.display = isGame ? 'flex' : 'none';
    }
    if (this.dom.optionsModal) {
      this.dom.optionsModal.hidden = false;
      this.dom.optionsModal.style.display = 'flex';
    }
  }

  closeOptionsModal() {
    this._hideRestartConfirm();
    if (this.dom.optionsModal) {
      this.dom.optionsModal.hidden = true;
      this.dom.optionsModal.style.display = 'none';
    }
  }

  _showRestartConfirm() {
    if (this.dom.restartConfirmBox) {
      this.dom.restartConfirmBox.hidden = false;
      this.dom.restartConfirmBox.style.display = 'flex';
    }
  }

  _hideRestartConfirm() {
    if (this.dom.restartConfirmBox) {
      this.dom.restartConfirmBox.hidden = true;
      this.dom.restartConfirmBox.style.display = 'none';
    }
  }

  openCharInfoModal() {
    if (!this.world) return;
    this.selectedEquipSlotId = null;
    const player = this.world.getEntity('player');
    if (player) {
      this._updateCharacterHUD(player);
      this._renderEquipmentSlotsModal(player);
      this._renderFactionStandings(player);
    }
    if (this.dom.charInfoModal) {
      this.dom.charInfoModal.hidden = false;
      this.dom.charInfoModal.style.display = 'flex';
      this._refreshAllScrollFades();
    }
  }

  closeCharInfoModal() {
    this.selectedEquipSlotId = null;
    if (this.dom.charInfoModal) {
      this.dom.charInfoModal.hidden = true;
      this.dom.charInfoModal.style.display = 'none';
    }
  }

  openDambanaModal() {
    try { this.audio.playClick(); } catch (_err) {}
    if (!this.dom.dambanaModal) return;
    this._updateDambanaModalState();
    this.dom.dambanaModal.hidden = false;
    this.dom.dambanaModal.style.display = 'flex';
  }

  closeDambanaModal() {
    try { this.audio.playClick(); } catch (_err) {}
    if (this.dom.dambanaModal) {
      this.dom.dambanaModal.hidden = true;
      this.dom.dambanaModal.style.display = 'none';
    }
  }

  openChronicleModal() {
    try { this.audio.playClick(); } catch (_err) {}
    if (!this.dom.chronicleModal) return;

    const player = this.world ? this.world.getEntity('player') : null;
    const identity = player ? player.getComponent('Identity') : null;
    const exp = player ? player.getComponent('Experience') : null;
    const charName = (identity && (identity.characterName || identity.name)) || 'The Wanderer';
    const bgName = (identity && identity.backgroundName) || 'Traveler';
    const statusLabel = (identity && identity.socialStatus && identity.socialStatus.label) || 'Unbound';
    const expertiseName = (identity && identity.expertiseName) || 'Survival';
    const level = exp ? exp.level : 1;
    const currentXp = exp ? exp.currentXp : 0;
    const nextXp = exp ? exp.nextLevelXp : 15;

    if (this.dom.chronicleHeroBanner) {
      this.dom.chronicleHeroBanner.innerHTML = `
        <div class="chronicle-hero-details">
          <h4>${charName}</h4>
          <p>${statusLabel} ${bgName} // Discipline: ${expertiseName}</p>
        </div>
        <div class="chronicle-hero-level">
          LEVEL ${level} (${currentXp}/${nextXp} XP)
        </div>
      `;
    }

    if (this.dom.chronicleStoryContent) {
      const director = this.director;
      const paragraphs = (director && typeof director.generateChronicleSummary === 'function')
        ? director.generateChronicleSummary()
        : (this.latestEndingData && this.latestEndingData.summaryParagraphs) || [];

      this.dom.chronicleStoryContent.innerHTML = '';
      for (const p of paragraphs) {
        const pEl = document.createElement('p');
        pEl.textContent = p;
        this.dom.chronicleStoryContent.appendChild(pEl);
      }
    }

    this.dom.chronicleModal.hidden = false;
    this.dom.chronicleModal.style.display = 'flex';
  }

  closeChronicleModal() {
    if (this.dom.chronicleModal && !this.dom.chronicleModal.hidden) {
      try {
        this.audio.playClick();
      } catch (_err) {}
    }
    if (this.dom.chronicleModal) {
      this.dom.chronicleModal.hidden = true;
      this.dom.chronicleModal.style.display = 'none';
    }
  }

  _updateDambanaModalState() {
    if (!this.dom.dambanaModal) return;
    const player = this.world ? this.world.getEntity('player') : null;
    const remnantsComp = player ? player.getComponent('Remnants') : null;
    const piloncitos = remnantsComp ? remnantsComp.count : 0;
    const invComp = player ? player.getComponent('Inventory') : null;
    const invItems = invComp && Array.isArray(invComp.items) ? invComp.items : [];
    const boonsComp = player ? player.getComponent('Boons') : null;
    const activeBoons = boonsComp && boonsComp.active ? boonsComp.active : {};

    const introEl = this.dom.dambanaModal.querySelector('.dambana-intro');
    if (introEl && !this.dom.dambanaModal.querySelector('.dambana-remnants-badge')) {
      const badge = document.createElement('div');
      badge.className = 'dambana-remnants-badge';
      badge.style.marginTop = '0.5rem';
      badge.style.padding = '0.4rem 0.8rem';
      badge.style.backgroundColor = 'rgba(223, 177, 91, 0.12)';
      badge.style.border = '1px solid var(--brass-bright, #dfb15b)';
      badge.style.color = '#ffd700';
      badge.style.fontFamily = 'monospace';
      badge.style.fontSize = '0.85rem';
      introEl.after(badge);
    }
    const badgeEl = this.dom.dambanaModal.querySelector('.dambana-remnants-badge');
    if (badgeEl) {
      badgeEl.innerHTML = `🪙 AVAILABLE PILONCITOS: <strong>${piloncitos}</strong>`;
    }

    this.dom.dambanaModal.querySelectorAll('.boon-card').forEach((card) => {
      const btn = card.querySelector('.btn-claim-boon');
      if (!btn) return;
      const boonId = btn.getAttribute('data-boon') || card.getAttribute('data-boon-id');
      const cfg = ANSTRAL_BOON_OFFERINGS[boonId] || {
        piloncitosCost: 7,
        itemCostId: null
      };

      const isAlreadyActive = Boolean(activeBoons[boonId] || (this.world && this.world.hasFlag(boonId)));
      const hasCoins = piloncitos >= cfg.piloncitosCost;
      const hasItem = Boolean(
        cfg.itemCostId &&
        invItems.some((i) => i.id === cfg.itemCostId || (cfg.itemTag && i.tags && i.tags.includes(cfg.itemTag)))
      );
      const canAfford = hasCoins || hasItem;

      card.classList.remove('unaffordable', 'active-boon');

      if (isAlreadyActive) {
        card.classList.add('active-boon');
        btn.disabled = true;
        btn.textContent = 'ACTIVE BOON';
        btn.style.opacity = '0.6';
      } else if (!canAfford) {
        card.classList.add('unaffordable');
        btn.disabled = true;
        btn.textContent = `NEED ${cfg.piloncitosCost} PILONCITOS`;
        btn.style.opacity = '0.4';
      } else {
        btn.disabled = false;
        btn.textContent = hasCoins ? 'PRAY & OFFER' : `OFFER ${cfg.itemLabel ? cfg.itemLabel.toUpperCase() : 'ITEM'}`;
        btn.style.opacity = '1';
      }
    });
  }

  _enterFullscreen() {
    const docEl = document.documentElement;
    const isFullscreen =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement;
    if (isFullscreen || !docEl) return;

    const req =
      docEl.requestFullscreen ||
      docEl.webkitRequestFullscreen ||
      docEl.msRequestFullscreen;
    if (typeof req === 'function') {
      try {
        const res = req.call(docEl);
        if (res && typeof res.catch === 'function') {
          res.catch(() => { });
        }
      } catch (_err) {
        // Ignore if blocked by browser policy
      }
    }
  }

  _bindGlobalEvents() {
    if (this.dom.btnLaunchStart) {
      this.dom.btnLaunchStart.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      this.dom.btnLaunchStart.addEventListener('click', () => {
        try {
          this._enterFullscreen();
        } catch (_err) {}
        try {
          this.audio.playStartGong();
          try { this.audio.setAmbientEnvironment('DRIZZLE', 'DUSK'); } catch (_err) {}
        } catch (_err) {}
        this.showBackgroundScreen();
      });
    }

    if (this.dom.btnLaunchOptions) {
      this.dom.btnLaunchOptions.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      this.dom.btnLaunchOptions.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        this.openOptionsModal();
      });
    }

    if (this.dom.btnHeaderCodex) {
      this.dom.btnHeaderCodex.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      this.dom.btnHeaderCodex.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        if (this.dom.mythCodexModal && !this.dom.mythCodexModal.hidden) {
          this.closeCodexModal();
        } else {
          this.openCodexModal();
        }
      });
    }

    if (this.dom.btnCloseCodex) {
      this.dom.btnCloseCodex.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      this.dom.btnCloseCodex.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        this.closeCodexModal();
      });
    }

    if (this.dom.btnHeaderOptions) {
      this.dom.btnHeaderOptions.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      this.dom.btnHeaderOptions.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        if (this.dom.optionsModal && !this.dom.optionsModal.hidden) {
          this.closeOptionsModal();
        } else {
          this.openOptionsModal();
        }
      });
    }

    if (this.dom.btnCloseOptions) {
      this.dom.btnCloseOptions.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      this.dom.btnCloseOptions.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        this.closeOptionsModal();
      });
    }

    if (this.dom.btnOpenCharInfo) {
      this.dom.btnOpenCharInfo.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      this.dom.btnOpenCharInfo.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        if (this.dom.charInfoModal && !this.dom.charInfoModal.hidden) {
          this.closeCharInfoModal();
        } else {
          this.openCharInfoModal();
        }
      });
    }

    if (this.dom.btnCloseCharInfo) {
      this.dom.btnCloseCharInfo.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      this.dom.btnCloseCharInfo.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        this.closeCharInfoModal();
      });
    }

    if (this.dom.optionsModal) {
      this.dom.optionsModal.addEventListener('click', (e) => {
        if (e.target === this.dom.optionsModal) {
          try { this.audio.playClick(); } catch (_err) {}
          this.closeOptionsModal();
        }
      });
    }

    if (this.dom.mythCodexModal) {
      this.dom.mythCodexModal.addEventListener('click', (e) => {
        if (e.target === this.dom.mythCodexModal) {
          try { this.audio.playClick(); } catch (_err) {}
          this.closeCodexModal();
        }
      });
    }

    if (this.dom.charInfoModal) {
      this.dom.charInfoModal.addEventListener('click', (e) => {
        if (e.target === this.dom.charInfoModal) {
          try { this.audio.playClick(); } catch (_err) {}
          this.closeCharInfoModal();
        }
      });
    }

    if (this.dom.chronicleModal) {
      this.dom.chronicleModal.addEventListener('click', (e) => {
        if (e.target === this.dom.chronicleModal) {
          try { this.audio.playClick(); } catch (_err) {}
          this.closeChronicleModal();
        }
      });
    }

    if (this.dom.dambanaModal) {
      this.dom.dambanaModal.addEventListener('click', (e) => {
        if (e.target === this.dom.dambanaModal) {
          try { this.audio.playClick(); } catch (_err) {}
          this.closeDambanaModal();
        }
      });
    }

    if (this.dom.btnToggleSfx) {
      this.dom.btnToggleSfx.addEventListener('click', () => {
        const on = this.audio.toggleSfx();
        this.dom.btnToggleSfx.textContent = on ? 'ENABLED' : 'DISABLED';
        this.dom.btnToggleSfx.classList.toggle('is-off', !on);
        if (on) { try { this.audio.playClick(); } catch (_err) {} }
      });
    }

    if (this.dom.btnToggleAmbient) {
      this.dom.btnToggleAmbient.addEventListener('click', () => {
        const on = this.audio.toggleAmbient();
        this.dom.btnToggleAmbient.textContent = on ? 'ENABLED' : 'DISABLED';
        this.dom.btnToggleAmbient.classList.toggle('is-off', !on);
        try { this.audio.playClick(); } catch (_err) {}
      });
    }

    if (this.dom.invFilterTabs) {
      for (const tab of this.dom.invFilterTabs) {
        tab.addEventListener('click', () => {
          try { this.audio.playClick(); } catch (_err) {}
          this.inventoryFilter = tab.getAttribute('data-inv-filter') || 'all';
          for (const t of this.dom.invFilterTabs) {
            t.classList.toggle('active', t === tab);
          }
          if (this.world) {
            const player = this.world.getEntity('player');
            if (player) this._renderInventoryPanel(player);
          }
        });
      }
    }

    // Delegated hover & click events for Philippine Mythology terms (.myth-term), Instinct badges (.instinct-badge), and Stat attributes ([data-stat])
    document.addEventListener('mouseover', (e) => {
      const termEl = e.target.closest('.myth-term');
      if (termEl) {
        const mythId = termEl.getAttribute('data-myth-id');
        const entry = getMythologyEntry(mythId);
        if (entry) {
          try { this.audio.playHover(); } catch (_err) {}
          this._showMythTooltip(entry, e.clientX, e.clientY);
        }
        return;
      }

      const instinctEl = e.target.closest('.instinct-badge');
      if (instinctEl) {
        try { this.audio.playHover(); } catch (_err) {}
        this._showInstinctTooltip(instinctEl, e.clientX, e.clientY);
        return;
      }

      const statEl = e.target.closest('[data-stat]:not(button)');
      if (statEl) {
        try { this.audio.playHover(); } catch (_err) {}
        const statKey = statEl.getAttribute('data-stat');
        const statVal = statEl.getAttribute('data-val');
        this._showStatTooltip(statKey, statVal, e.clientX, e.clientY, statEl);
      }
    });

    document.addEventListener('mousemove', (e) => {
      const termEl = e.target.closest('.myth-term');
      if (termEl) {
        this._positionMythTooltip(e.clientX, e.clientY);
        return;
      }

      const instinctEl = e.target.closest('.instinct-badge');
      if (instinctEl) {
        this._positionInstinctTooltip(e.clientX, e.clientY, instinctEl);
        return;
      }

      const statEl = e.target.closest('[data-stat]:not(button)');
      if (statEl) {
        this._positionStatTooltip(e.clientX, e.clientY, statEl);
        return;
      }

      this._hideMythTooltip();
      this._hideInstinctTooltip();
      this._hideStatTooltip();
    });

    document.addEventListener('mouseout', (e) => {
      const termEl = e.target.closest('.myth-term');
      if (termEl) {
        this._hideMythTooltip();
      }
      const instinctEl = e.target.closest('.instinct-badge');
      if (instinctEl) {
        this._hideInstinctTooltip();
      }
      const statEl = e.target.closest('[data-stat]:not(button)');
      if (statEl) {
        this._hideStatTooltip();
      }
    });

    document.addEventListener('click', (e) => {
      const termEl = e.target.closest('.myth-term');
      if (!termEl) return;
      e.stopPropagation();
      const mythId = termEl.getAttribute('data-myth-id');
      if (mythId) {
        try { this.audio.playClick(); } catch (_err) {}
        this.openCodexModal(mythId);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const termEl = e.target.closest && e.target.closest('.myth-term');
        if (termEl) {
          e.preventDefault();
          const mythId = termEl.getAttribute('data-myth-id');
          if (mythId) {
            try { this.audio.playClick(); } catch (_err) {}
            this.openCodexModal(mythId);
          }
        }
      } else if (e.key === 'Escape') {
        this.closeCodexModal();
        this.closeCharInfoModal();
        this.closeOptionsModal();
        this.closeDambanaModal();
        this.closeChronicleModal();
      }
    });

    for (const tab of this.dom.modeTabs) {
      tab.addEventListener('click', () => {
        const mode = tab.getAttribute('data-mode');
        if (this.currentCreationMode === mode) return;
        try { this.audio.playClick(); } catch (_err) {}
        this._switchCreationMode(mode);
      });
    }

    if (this.dom.btnRerollPresetName) {
      this.dom.btnRerollPresetName.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        this.presetState.name = generateRandomName();
        this.presetState.socialStatus = rollRandomSocialStatus();
        this._updatePresetBanner();
      });
    }

    if (this.dom.btnBgScrollLeft && this.dom.backgroundGrid) {
      this.dom.btnBgScrollLeft.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      this.dom.btnBgScrollLeft.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        this.dom.backgroundGrid.scrollBy({ left: -400, behavior: 'smooth' });
      });
    }

    if (this.dom.btnBgScrollRight && this.dom.backgroundGrid) {
      this.dom.btnBgScrollRight.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      this.dom.btnBgScrollRight.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        this.dom.backgroundGrid.scrollBy({ left: 400, behavior: 'smooth' });
      });
    }

    if (this.dom.backgroundGrid) {
      this.dom.backgroundGrid.addEventListener(
        'wheel',
        (e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            this.dom.backgroundGrid.scrollLeft += e.deltaY;
          }
        },
        { passive: false }
      );

      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      this.dom.backgroundGrid.addEventListener('mousedown', (e) => {
        if (e.target.closest('button') || e.target.closest('.myth-term')) return;
        isDown = true;
        startX = e.pageX - this.dom.backgroundGrid.offsetLeft;
        scrollLeft = this.dom.backgroundGrid.scrollLeft;
      });
      window.addEventListener('mouseup', () => {
        isDown = false;
      });
      this.dom.backgroundGrid.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - this.dom.backgroundGrid.offsetLeft;
        const walk = (x - startX) * 1.4;
        this.dom.backgroundGrid.scrollLeft = scrollLeft - walk;
      });
    }

    if (this.dom.skipButton) {
      this.dom.skipButton.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        if (this.typewriter && typeof this.typewriter.skipToEnd === 'function') {
          this.typewriter.skipToEnd();
        }
      });
    }

    if (this.dom.narrativeContainer) {
      this.dom.narrativeContainer.addEventListener('click', (e) => {
        if (e.target.closest('.myth-term')) return;
        if (this.typewriter && this.typewriter.isTyping) {
          try { this.audio.playClick(); } catch (_err) {}
          if (typeof this.typewriter.skipToEnd === 'function') {
            this.typewriter.skipToEnd();
          }
        }
      });
    }

    if (this.dom.restartButton) {
      this.dom.restartButton.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      this.dom.restartButton.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        this._showRestartConfirm();
      });
    }

    if (this.dom.btnConfirmRestart) {
      this.dom.btnConfirmRestart.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      this.dom.btnConfirmRestart.addEventListener('click', () => {
        try { this.audio.playStartGong(); } catch (_err) {}
        this._hideRestartConfirm();
        this.closeOptionsModal();
        this.showBackgroundScreen();
      });
    }

    if (this.dom.btnCancelRestart) {
      this.dom.btnCancelRestart.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      this.dom.btnCancelRestart.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        this._hideRestartConfirm();
      });
    }

    this.eventBus.on('typewriter:start', () => {
      if (this.dom.skipButton) {
        this.dom.skipButton.hidden = false;
      }
    });

    this.eventBus.on('typewriter:tick', () => {
      try { this.audio.playTypeTick(); } catch (_err) {}
    });

    this.eventBus.on('typewriter:complete', () => {
      if (this.dom.skipButton) {
        this.dom.skipButton.hidden = true;
      }
    });

    this.eventBus.on(
      'narrative:nodeEntered',
      ({
        title,
        location,
        act,
        weather = 'DRIZZLE',
        timeOfDay = 'DUSK',
        environment = 'OUTDOOR'
      }) => {
        const envKey = (environment || 'WILDERNESS').toUpperCase();
        const envLabel = ENVIRONMENT_DISPLAY_LABELS[envKey] || ENVIRONMENT_DISPLAY_LABELS[environment] || environment || 'WILDERNESS';
        const normWeather = weather === 'SPIRIT_FOG' ? 'SPIRIT FOG' : weather;

        this._hideInstinctTooltip();
        this._hideMythTooltip();
        try { this.audio.playSceneTransition(); } catch (_err) {}
        try { this.audio.setAmbientEnvironment(normWeather, timeOfDay, environment); } catch (_err) {}
        if (this.visualizer) {
          this.visualizer.setEnvironment(normWeather, timeOfDay, environment);
        }
        this.syncAtmosphereUI({ weather: normWeather, timeOfDay, environment, envLabel });
        if (this.dom.actBanner) this.dom.actBanner.textContent = act || '';
        if (this.dom.sceneTitle) this.dom.sceneTitle.textContent = title || '';
        if (this.dom.narrativeColumn) {
          this.dom.narrativeColumn.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    );

    this.eventBus.on('choices:clear', () => {
      this._clearAmbushTimer();
      this._clearCinematicTimer();
      if (this.dom.choicesContainer) {
        this.dom.choicesContainer.innerHTML = '';
      }
    });

    this.eventBus.on('choices:render', (payload) => {
      const {
        choices,
        isEnding,
        prepOptions,
        isAmbush,
        reactionTimer,
        nodeId,
        chronicleLog,
        summaryParagraphs,
        isVictory
      } = payload;
      if (isEnding) {
        this.latestEndingData = {
          chronicleLog,
          summaryParagraphs,
          isVictory: Boolean(isVictory)
        };
      }
      this._renderChoices(
        choices,
        isEnding,
        prepOptions,
        isAmbush,
        reactionTimer,
        nodeId,
        payload
      );
    });

    if (this.dom.btnRollDice) {
      this.dom.btnRollDice.addEventListener('click', () => {
        this._executeDiceRoll();
      });
    }

    if (this.dom.btnContinueRoll) {
      this.dom.btnContinueRoll.addEventListener('click', () => {
        this._commitDiceOutcome();
      });
    }

    this.eventBus.on('ui:updateStats', ({ entity }) => {
      this._updateCharacterHUD(entity);
      if (this.dom.dambanaModal && !this.dom.dambanaModal.hidden) {
        this._updateDambanaModalState();
      }
    });

    this.eventBus.on('ui:updateConditions', ({ entity }) => {
      this._renderSurvivalConditions(entity);
    });

    this.eventBus.on('world:eclipseStarted', () => {
      try { this.audio.playStartGong(); } catch (_err) {}
      if (this.visualizer) {
        this.visualizer.timeOfDay = 'ECLIPSE';
      }
    });

    if (this.dom.btnOpenDambana) {
      this.dom.btnOpenDambana.addEventListener('click', () => {
        this.openDambanaModal();
      });
    }

    if (this.dom.btnCloseDambana) {
      this.dom.btnCloseDambana.addEventListener('click', () => {
        this.closeDambanaModal();
      });
    }

    if (this.dom.btnCloseChronicle) {
      this.dom.btnCloseChronicle.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        this.closeChronicleModal();
      });
    }

    this.eventBus.on('ui:openDambana', () => {
      this.openDambanaModal();
    });

    document.querySelectorAll('.btn-claim-boon').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const boonId = e.currentTarget.getAttribute('data-boon');
        const cfg = ANSTRAL_BOON_OFFERINGS[boonId];
        if (!cfg) return;

        const player = this.world ? this.world.getEntity('player') : null;
        const remnantsComp = player ? player.getComponent('Remnants') : null;
        const piloncitos = remnantsComp ? remnantsComp.count : 0;
        const invComp = player ? player.getComponent('Inventory') : null;
        const invItems = invComp && Array.isArray(invComp.items) ? invComp.items : [];

        let costType = 'piloncitos';
        let costAmount = cfg.piloncitosCost;

        if (piloncitos < cfg.piloncitosCost) {
          const itemMatch =
            cfg.itemCostId &&
            invItems.find((i) => i.id === cfg.itemCostId || (cfg.itemTag && i.tags && i.tags.includes(cfg.itemTag)));
          if (itemMatch) {
            costType = 'item';
            costAmount = itemMatch.id;
          } else {
            return;
          }
        }

        try { this.audio.playStartGong(); } catch (_err) {}
        this.eventBus.emit('dambana:offerAtang', {
          boonId,
          costType,
          costAmount
        });
        this._updateDambanaModalState();
      });
    });

    this.eventBus.on('danger:updated', () => {
      const player = this.world ? this.world.getEntity('player') : null;
      if (player) {
        this._updateCharacterHUD(player);
      }
    });

    this.eventBus.on('ui:updateInventory', ({ entity }) => {
      this._renderInventoryPanel(entity);
      this._renderEquipmentSlotsModal(entity);
      if (this.dom.dambanaModal && !this.dom.dambanaModal.hidden) {
        this._updateDambanaModalState();
      }
    });

    this.eventBus.on('world:tagsUpdated', ({ activeTags }) => {
      this._updateTagsHUD(activeTags);
      this._updateEchoesHUD(activeTags);
    });

    this.eventBus.on('check:resolved', (result) => {
      if (!result.isPassive) {
        try { this.audio.playCheckOutcome(result.success); } catch (_err) {}
      }
      this._appendCheckLog(result);
    });

    this.eventBus.on('log:mechanical', (entry) => {
      this._appendMechanicalLog(entry);
    });

    this.eventBus.on('codex:creatureDiscovered', (data) => {
      if (this.audio && typeof this.audio.playLoreDiscovery === 'function') {
        try { this.audio.playLoreDiscovery(); } catch (_err) {}
      } else if (this.audio && typeof this.audio.playCheckOutcome === 'function') {
        try { this.audio.playCheckOutcome(true); } catch (_err) {}
      }
      if (this.dom.mythCodexModal && !this.dom.mythCodexModal.hidden) {
        this._renderCodexModal(data.creatureId);
      }
    });
  }

  showBackgroundScreen() {
    this.transitionScreenState('CHARACTER_SELECT', () => {
      if (this.typewriter && typeof this.typewriter.clear === 'function') {
        this.typewriter.clear();
      }
      this.presetState.name = generateRandomName();
      this.presetState.socialStatus = rollRandomSocialStatus();
      this._updatePresetBanner();
      this._rollRandomizedUniqueCharacter();
      this.customState.socialStatus = rollRandomSocialStatus();
      this._renderCustomCreator();
      this._switchCreationMode('archetype');
    });
  }

  _switchCreationMode(mode) {
    this.currentCreationMode = mode;
    for (const tab of this.dom.modeTabs) {
      const isActive = tab.getAttribute('data-mode') === mode;
      tab.classList.toggle('active', isActive);
      tab.disabled = isActive;
    }
    if (this.dom.panelArchetype) {
      this.dom.panelArchetype.hidden = mode !== 'archetype';
      this.dom.panelArchetype.style.display = mode === 'archetype' ? '' : 'none';
    }
    if (this.dom.panelRandom) {
      this.dom.panelRandom.hidden = mode !== 'random';
      this.dom.panelRandom.style.display = mode === 'random' ? '' : 'none';
    }
    if (this.dom.panelCustom) {
      this.dom.panelCustom.hidden = mode !== 'custom';
      this.dom.panelCustom.style.display = mode === 'custom' ? '' : 'none';
    }
    this._refreshAllScrollFades();
  }

  _initCreationUI() {
    this._updatePresetBanner();
    this._renderBackgroundSelection();
    this._rollRandomizedUniqueCharacter();
    this._setupCustomCreatorControls();
    this._renderCustomCreator();
  }

  _updatePresetBanner() {
    if (this.dom.presetRandomName) {
      this.dom.presetRandomName.textContent = this.presetState.name;
    }
  }

  _renderBackgroundSelection() {
    if (!this.dom.backgroundGrid) return;
    this.dom.backgroundGrid.innerHTML = '';

    for (const bg of PlayerBackgrounds) {
      const exp =
        EXPERTISE_OPTIONS.find((e) => e.id === bg.defaultExpertiseId) || EXPERTISE_OPTIONS[0];
      const card = document.createElement('article');
      card.className = 'background-card pixel-frame';

      const statsRows = Object.entries(bg.stats)
        .map(([key, val]) => {
          const def = STAT_DEFINITIONS[key];
          const label = def ? def.name : key;
          return `<div class="card-stat-line" data-stat="${key}" data-val="${val}"><span class="stat-line-label">${label}</span><span class="stat-line-dots" aria-hidden="true"></span><span class="stat-line-val highlight-gold">${val}</span></div>`;
        })
        .join('');

      card.innerHTML = `
        <div class="card-header">
          <span class="card-tag">${bg.tag}</span>
          <h3>${bg.name}</h3>
        </div>
        <p class="card-quote">${bg.quote}</p>
        <p class="card-desc">${bg.description}</p>
        <p class="field-hint"><strong>Expertise:</strong> ${exp.name}</p>
        <div class="card-stats-list">${statsRows}</div>
        <div class="card-vitals-row">
          <span>VITALITY: <strong>${bg.maxVitality}</strong></span>
          <span>PILONCITOS: <strong>${bg.startingRemnants}</strong></span>
        </div>
        <button type="button" class="pixel-btn full-width" data-bg-id="${bg.id}">
          ▶ START PROLOGUE AS ${bg.name.toUpperCase()}
        </button>
      `;

      const btn = card.querySelector('button');
      btn.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      btn.addEventListener('click', () => {
        try { this.audio.playStartGong(); } catch (_err) {}
        this.launchCharacterIntoPrologue({
          characterName: this.presetState.name,
          background: bg,
          expertise: exp,
          stats: { ...bg.stats },
          socialStatus: this.presetState.socialStatus
        });
      });

      const descEl = card.querySelector('.card-desc');
      const quoteEl = card.querySelector('.card-quote');
      if (descEl) annotateMythologyTerms(descEl);
      if (quoteEl) annotateMythologyTerms(quoteEl);

      this.dom.backgroundGrid.appendChild(card);
    }
  }

  _rollRandomizedUniqueCharacter() {
    const bg = PlayerBackgrounds[Math.floor(Math.random() * PlayerBackgrounds.length)];
    const exp = EXPERTISE_OPTIONS[Math.floor(Math.random() * EXPERTISE_OPTIONS.length)];
    const socialStatus = rollRandomSocialStatus();
    const characterName = generateRandomName();

    const stats = { STR: 9, DEX: 9, CON: 9, INT: 9, WIS: 9, CHA: 9 };
    const keys = Object.keys(stats);
    for (let i = 0; i < 12; i += 1) {
      const k = keys[Math.floor(Math.random() * keys.length)];
      if (stats[k] < 16) {
        stats[k] += 1;
      }
    }
    if (exp.statBonus) {
      for (const [k, bonus] of Object.entries(exp.statBonus)) {
        stats[k] = (stats[k] || 10) + bonus;
      }
    }

    this.randomCharState = {
      characterName,
      background: bg,
      expertise: exp,
      stats,
      socialStatus
    };

    if (!this.dom.randomShowcase) return;

    const statsRows = Object.entries(stats)
      .map(([key, val]) => {
        const def = STAT_DEFINITIONS[key];
        const label = def ? def.name : key;
        return `<div class="card-stat-line" data-stat="${key}" data-val="${val}"><span class="stat-line-label">${label}</span><span class="stat-line-dots" aria-hidden="true"></span><span class="stat-line-val highlight-gold">${val}</span></div>`;
      })
      .join('');

    const baseHp =
      bg.maxVitality + Math.max(0, StatResolver.getModifier(stats.CON));

    this.dom.randomShowcase.innerHTML = `
      <div class="creator-grid">
        <div class="creator-col">
          <span class="card-tag">FATE-FORGED UNIQUE VESSEL</span>
          <h3 class="highlight-gold" style="font-family: var(--font-pixel-header); font-size: 1.05rem;">
            ${characterName}
          </h3>
          <p class="card-desc">
            <strong>Calling:</strong> ${bg.name} (${bg.tag})<br/>
            ${bg.description}
          </p>
          <p class="card-desc">
            <strong>Expertise:</strong> ${exp.name}<br/>
            ${exp.description}
          </p>
        </div>
        <div class="creator-col">
          <div class="stat-pool-header pixel-frame">
            <span>ATTRIBUTES</span>
            <span>FATE-SHAPED</span>
          </div>
          <div class="card-stats-list" style="margin: 0.5rem 0;">
            ${statsRows}
          </div>
          <div class="creator-summary pixel-frame">
            <span>BASE HP: <strong>${baseHp}</strong></span>
            <span>PILONCITOS: <strong>??? (Fated)</strong></span>
          </div>
          <div class="input-row" style="margin-top: auto;">
            <button type="button" id="btn-reroll-random-vessel" class="pixel-btn" style="flex: 1;">
              🎲 REROLL VESSEL
            </button>
            <button type="button" id="btn-start-random-vessel" class="pixel-btn-start" style="flex: 1.3; padding: 0.75rem;">
              ▶ ENTER PROLOGUE
            </button>
          </div>
        </div>
      </div>
    `;

    const rerollBtn = document.getElementById('btn-reroll-random-vessel');
    if (rerollBtn) {
      rerollBtn.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        this._rollRandomizedUniqueCharacter();
      });
    }

    const startBtn = document.getElementById('btn-start-random-vessel');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        try { this.audio.playStartGong(); } catch (_err) {}
        this.launchCharacterIntoPrologue(this.randomCharState);
      });
    }
  }

  _setupCustomCreatorControls() {
    if (this.dom.customBgSelect) {
      this.dom.customBgSelect.innerHTML = PlayerBackgrounds.map(
        (bg) => `<option value="${bg.id}">${bg.name} (${bg.tag})</option>`
      ).join('');

      this.dom.customBgSelect.addEventListener('change', (e) => {
        try { this.audio.playClick(); } catch (_err) {}
        this.customState.backgroundId = e.target.value;
        this._renderCustomCreator();
      });
    }

    if (this.dom.customExpSelect) {
      this.dom.customExpSelect.innerHTML = EXPERTISE_OPTIONS.map(
        (exp) => `<option value="${exp.id}">${exp.name}</option>`
      ).join('');

      this.dom.customExpSelect.addEventListener('change', (e) => {
        try { this.audio.playClick(); } catch (_err) {}
        this.customState.expertiseId = e.target.value;
        this._renderCustomCreator();
      });
    }

    if (this.dom.customNameInput) {
      this.dom.customNameInput.value = this.customState.name;
      this.dom.customNameInput.addEventListener('input', (e) => {
        this.customState.name = e.target.value;
      });
    }

    if (this.dom.btnRandomCustomName) {
      this.dom.btnRandomCustomName.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        this.customState.name = generateRandomName();
        if (this.dom.customNameInput) {
          this.dom.customNameInput.value = this.customState.name;
        }
      });
    }

    if (this.dom.btnStartCustomChar) {
      this.dom.btnStartCustomChar.addEventListener('click', () => {
        try { this.audio.playStartGong(); } catch (_err) {}
        const bg =
          PlayerBackgrounds.find((b) => b.id === this.customState.backgroundId) ||
          PlayerBackgrounds[0];
        const exp =
          EXPERTISE_OPTIONS.find((x) => x.id === this.customState.expertiseId) ||
          EXPERTISE_OPTIONS[0];
        const finalName =
          (this.dom.customNameInput && this.dom.customNameInput.value.trim()) ||
          generateRandomName();

        const finalStats = this._computeCustomFinalStats();
        this.launchCharacterIntoPrologue({
          characterName: finalName,
          background: bg,
          expertise: exp,
          stats: finalStats,
          socialStatus: this.customState.socialStatus
        });
      });
    }
  }

  _computeCustomFinalStats() {
    const exp =
      EXPERTISE_OPTIONS.find((x) => x.id === this.customState.expertiseId) ||
      EXPERTISE_OPTIONS[0];
    const result = {};
    for (const key of Object.keys(STAT_DEFINITIONS)) {
      const base = this.customState.baseStats[key] || 10;
      const alloc = this.customState.allocated[key] || 0;
      const expBonus = exp.statBonus && exp.statBonus[key] ? exp.statBonus[key] : 0;
      result[key] = base + alloc + expBonus;
    }
    return result;
  }

  _renderCustomCreator() {
    const bg =
      PlayerBackgrounds.find((b) => b.id === this.customState.backgroundId) ||
      PlayerBackgrounds[0];
    const exp =
      EXPERTISE_OPTIONS.find((x) => x.id === this.customState.expertiseId) ||
      EXPERTISE_OPTIONS[0];
    const status = this.customState.socialStatus;

    if (this.dom.customBgDesc) {
      this.dom.customBgDesc.textContent = bg.description;
    }
    if (this.dom.customExpDesc) {
      const bonusAspects = Object.keys(exp.statBonus)
        .map((k) => (STAT_DEFINITIONS[k] ? STAT_DEFINITIONS[k].name : k))
        .join(' & ');
      this.dom.customExpDesc.textContent = `${exp.description} (Boosts ${bonusAspects})`;
    }
    if (this.dom.customStatusTitle) {
      this.dom.customStatusTitle.textContent = 'SEALED BY FATE';
      this.dom.customStatusTitle.style.color = 'var(--brass-bright)';
    }
    if (this.dom.customStatusDesc) {
      this.dom.customStatusDesc.textContent =
        'Your birthright, social standing, and wealth will only be revealed once your chronicle begins.';
    }
    if (this.dom.customPointsRemaining) {
      this.dom.customPointsRemaining.textContent = `${this.customState.pointsRemaining} PTS LEFT`;
    }

    const finalStats = this._computeCustomFinalStats();

    if (this.dom.customStatAllocator) {
      this.dom.customStatAllocator.innerHTML = '';
      for (const [key, def] of Object.entries(STAT_DEFINITIONS)) {
        const baseVal = (this.customState.baseStats[key] || 10) + (this.customState.allocated[key] || 0);
        const expBonus = exp.statBonus && exp.statBonus[key] ? exp.statBonus[key] : 0;
        const bonusTag =
          expBonus > 0 ? ` <span class="stat-gear-bonus">(+${expBonus})</span>` : '';
        const li = document.createElement('li');
        li.className = 'allocator-row';
        li.innerHTML = `
          <div class="stat-alloc-info" data-stat="${key}" data-val="${baseVal}" style="cursor: help;">
            <span class="stat-name">${def.name} (${key})</span>
            <span class="stat-sub">${def.subtitle}</span>
          </div>
          <div class="alloc-controls">
            <button type="button" class="pixel-btn btn-small btn-dec" data-stat-btn="${key}">-</button>
            <strong class="alloc-val" data-stat="${key}" data-val="${baseVal}" style="cursor: help;">${baseVal}${bonusTag}</strong>
            <button type="button" class="pixel-btn btn-small btn-inc" data-stat-btn="${key}">+</button>
          </div>
        `;

        const decBtn = li.querySelector('.btn-dec');
        const incBtn = li.querySelector('.btn-inc');

        decBtn.disabled = this.customState.allocated[key] <= -2;
        incBtn.disabled =
          this.customState.pointsRemaining <= 0 || this.customState.allocated[key] >= 6;

        decBtn.addEventListener('click', () => {
          if (this.customState.allocated[key] > -2) {
            try { this.audio.playClick(); } catch (_err) {}
            this.customState.allocated[key] -= 1;
            this.customState.pointsRemaining += 1;
            this._renderCustomCreator();
          }
        });

        incBtn.addEventListener('click', () => {
          if (this.customState.pointsRemaining > 0 && this.customState.allocated[key] < 6) {
            try { this.audio.playClick(); } catch (_err) {}
            this.customState.allocated[key] += 1;
            this.customState.pointsRemaining -= 1;
            this._renderCustomCreator();
          }
        });

        this.dom.customStatAllocator.appendChild(li);
      }
    }

    const baseHp =
      bg.maxVitality + Math.max(0, StatResolver.getModifier(finalStats.CON));

    if (this.dom.customPreviewHp) this.dom.customPreviewHp.textContent = `${baseHp}`;
    if (this.dom.customPreviewRemnants) {
      this.dom.customPreviewRemnants.textContent = '??? (Fated)';
    }
  }


  _updateCharacterHUD(player) {
    if (!player) return;

    const identity = player.getComponent('Identity');
    const vitality = player.getComponent('Vitality');
    const remnants = player.getComponent('Remnants');
    const stats = player.getComponent('Stats');
    const exp = player.getComponent('Experience');

    if (exp) {
      if (this.dom.charLevelBadge) {
        this.dom.charLevelBadge.textContent = `LV ${exp.level || 1}`;
      }
      if (this.dom.xpValue) {
        this.dom.xpValue.textContent = `${exp.currentXp || 0} / ${exp.nextLevelXp || 15} XP`;
      }
      if (this.dom.xpBar) {
        const xpMax = exp.nextLevelXp || 15;
        const xpPct = Math.max(0, Math.min(100, ((exp.currentXp || 0) / xpMax) * 100));
        this.dom.xpBar.style.width = `${xpPct}%`;
      }
    }

    if (identity) {
      if (this.dom.charName) this.dom.charName.textContent = identity.characterName || identity.name;
      if (this.dom.charTag) this.dom.charTag.textContent = identity.tag;
      if (this.dom.charStatusBadge && identity.socialStatus) {
        this.dom.charStatusBadge.textContent = `${identity.socialStatus.label}`;
        this.dom.charStatusBadge.style.color = identity.socialStatus.badgeColor;
      }
      if (this.dom.modalCharName) {
        this.dom.modalCharName.textContent = identity.characterName || identity.name;
      }
      if (this.dom.modalCharSubtitle) {
        const st = identity.socialStatus ? identity.socialStatus.label : '';
        const lvStr = exp ? ` // Level ${exp.level} (${exp.currentXp}/${exp.nextLevelXp} XP)` : '';
        this.dom.modalCharSubtitle.textContent = `${identity.tag} // ${st}${lvStr}`;
      }
    }

    if (vitality) {
      const pct = Math.max(0, Math.min(100, (vitality.current / vitality.max) * 100));
      if (this.dom.vitalityValue) {
        this.dom.vitalityValue.textContent = `${vitality.current} / ${vitality.max}`;
      }
      if (this.dom.vitalityBar) {
        this.dom.vitalityBar.style.width = `${pct}%`;
      }
    }

    if (remnants) {
      if (this.dom.sanityValue) {
        this.dom.sanityValue.textContent = `${remnants.count}`;
      }
    }

    const panganib = player.getComponent('Panganib');
    if (panganib) {
      const heat = typeof panganib.heat === 'number' ? panganib.heat : 10;
      const maxHeat = panganib.max || 100;
      const pct = Math.max(0, Math.min(100, (heat / maxHeat) * 100));

      if (this.dom.panganibValue) {
        this.dom.panganibValue.textContent = `${heat} / ${maxHeat}`;
      }
      if (this.dom.panganibBar) {
        this.dom.panganibBar.style.width = `${pct}%`;
        const tierClass = panganib.tier ? panganib.tier.toLowerCase() : 'calm';
        this.dom.panganibBar.className = `meter-fill panganib-fill tier-${tierClass}`;
      }
      if (this.dom.panganibTierBadge) {
        const tierClass = panganib.tier ? panganib.tier.toLowerCase() : 'calm';
        const tierMap = {
          CALM: 'SERENE',
          TAHIMIK: 'SERENE',
          LIGAW: 'UNSETTLED',
          AMOY_DUGO: 'BLOOD SCENT',
          PANGANIB: 'HUNTED'
        };
        const label = panganib.tierLabel
          ? panganib.tierLabel.toUpperCase()
          : (tierMap[panganib.tier] || panganib.tier || 'SERENE');
        this.dom.panganibTierBadge.textContent = label;
        this.dom.panganibTierBadge.className = `panganib-tier-badge tier-${tierClass}`;
      }
    }

    if (stats && this.dom.statsList) {
      this.dom.statsList.innerHTML = '';
      for (const [key, def] of Object.entries(STAT_DEFINITIONS)) {
        const totalVal = stats[key] ?? 10;
        const gearBonus = stats.bonuses && stats.bonuses[key] ? stats.bonuses[key] : 0;
        const bonusHtml =
          gearBonus > 0 ? `<span class="stat-gear-bonus">(+${gearBonus} Gear)</span>` : '';

        const li = document.createElement('li');
        li.className = 'stat-item';
        li.setAttribute('data-stat', key);
        li.setAttribute('data-val', totalVal);
        li.innerHTML = `
          <span class="stat-name">${def.name} (${key})</span>
          <span class="stat-score">${totalVal}${bonusHtml}</span>
        `;
        this.dom.statsList.appendChild(li);
      }
    }

    this._renderSurvivalConditions(player);
  }

  _formatStatBonusesInline(item) {
    if (item.insideOut) {
      return '+1 WIS (Stats Suppressed)';
    }
    const parts = [];
    if (item.statBonuses) {
      for (const [stat, val] of Object.entries(item.statBonuses)) {
        if (val !== 0) {
          parts.push(`${val > 0 ? '+' : ''}${val} ${stat}`);
        }
      }
    }
    return parts.join(', ');
  }

  _getItemCategoryIcon(item) {
    if (item.category === 'weapon') return '⚔';
    if (item.category === 'tool') return '🔦';
    if (item.category === 'medical') return '✚';
    if (item.category === 'material') return '🧵';
    return '🛡';
  }

  _showItemTooltip(item, targetEl) {
    if (!item) return;
    let tip = document.getElementById('rpg-inv-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'rpg-inv-tooltip';
      tip.className = 'rpg-inv-tooltip';
      document.body.appendChild(tip);
    }
    const icon = this._getItemCategoryIcon(item);
    const statText = this._formatStatBonusesInline(item);
    const slotTag = item.equippedSlot
      ? `EQUIPPED: ${item.equippedSlot.toUpperCase()}`
      : item.slot
        ? item.slot.toUpperCase()
        : (item.category || 'ITEM').toUpperCase();

    tip.innerHTML = `
      <div class="rpg-tip-title">${icon} ${item.name}</div>
      <div class="rpg-tip-category">${slotTag}</div>
      ${statText ? `<div class="rpg-tip-stats">${statText}</div>` : ''}
      <div class="rpg-tip-desc">${item.description || ''}</div>
      <div class="rpg-tip-hint">Click to inspect / Double-click to ${item.slot ? 'equip' : 'use'}</div>
    `;

    const rect = targetEl.getBoundingClientRect();
    tip.style.left = `${Math.max(10, rect.left - 290)}px`;
    tip.style.top = `${Math.min(window.innerHeight - 200, Math.max(10, rect.top))}px`;
    tip.hidden = false;
    tip.style.display = 'flex';
  }

  _hideItemTooltip() {
    const tip = document.getElementById('rpg-inv-tooltip');
    if (tip) {
      tip.hidden = true;
      tip.style.display = 'none';
    }
  }

  _renderInventoryPanel(player) {
    if (!player) return;
    const inv = player.getComponent('Inventory');
    if (!inv) return;

    const totalSlots = Math.max(24, Math.ceil(inv.items.length / 4) * 4);
    if (this.dom.inventoryCountBadge) {
      this.dom.inventoryCountBadge.textContent = `${inv.items.length} / ${totalSlots} SLOTS`;
    }

    const filtered = inv.items.filter((item) => {
      if (this.inventoryFilter === 'equipped') return Boolean(item.equippedSlot);
      if (this.inventoryFilter === 'gear') return Boolean(item.slot);
      if (this.inventoryFilter === 'usable') {
        return Boolean(item.usable || item.canCombineWithSheet || item.category === 'material');
      }
      return true;
    });

    // Verify currently selected item is still in player inventory
    if (this.selectedItemUid) {
      const stillExists = inv.items.some((i) => i.uid === this.selectedItemUid);
      if (!stillExists) {
        this.selectedItemUid = null;
      }
    }
    if (!this.selectedItemUid && filtered.length > 0) {
      this.selectedItemUid = filtered[0].uid;
    }

    // 1. Render RPG Grid (Baldur's Gate / Minecraft style)
    if (this.dom.playerInventoryGrid) {
      this.dom.playerInventoryGrid.innerHTML = '';

      for (let i = 0; i < totalSlots; i++) {
        const slotEl = document.createElement('div');
        const item = filtered[i] || null;

        if (item) {
          slotEl.className = `rpg-inv-slot ${item.equippedSlot ? 'is-equipped' : ''} ${item.usable ? 'is-usable' : ''} ${item.uid === this.selectedItemUid ? 'is-selected' : ''}`;
          slotEl.setAttribute('data-uid', item.uid);
          slotEl.setAttribute('role', 'gridcell');
          slotEl.setAttribute('tabindex', '0');
          slotEl.setAttribute('aria-label', `${item.name}${item.equippedSlot ? ' (Equipped)' : ''}`);

          let badgesHtml = '';
          if (item.equippedSlot) {
            badgesHtml += '<span class="slot-badge-eq">EQ</span>';
          }
          if (item.insideOut) {
            badgesHtml += '<span class="slot-badge-insideout">\u27f2</span>';
          }
          if (item.quantity && item.quantity > 1) {
            badgesHtml += `<span class="slot-badge-count">x${item.quantity}</span>`;
          }

          slotEl.innerHTML = `
            ${badgesHtml}
            <span class="slot-item-icon" aria-hidden="true">${this._getItemCategoryIcon(item)}</span>
          `;

          slotEl.addEventListener('mouseenter', () => {
            try { this.audio.playHover(); } catch (_err) {}
            this._showItemTooltip(item, slotEl);
          });
          slotEl.addEventListener('mouseleave', () => {
            this._hideItemTooltip();
          });

          slotEl.addEventListener('click', () => {
            try { this.audio.playClick(); } catch (_err) {}
            this.selectedItemUid = item.uid;
            this._renderInventoryPanel(player);
          });

          slotEl.addEventListener('dblclick', () => {
            try { this.audio.playClick(); } catch (_err) {}
            this._hideItemTooltip();
            if (item.slot) {
              this.eventBus.emit('inventory:equipToggle', { uid: item.uid });
            } else if (item.usable) {
              this.eventBus.emit('inventory:useItem', { uid: item.uid });
            } else if (item.canFlipInsideOut) {
              this.eventBus.emit('inventory:flipInsideOut', { uid: item.uid });
            }
          });
        } else {
          slotEl.className = 'rpg-inv-slot empty-slot';
          slotEl.setAttribute('role', 'gridcell');
          slotEl.innerHTML = `<span class="slot-empty-num">${i + 1}</span>`;
        }

        this.dom.playerInventoryGrid.appendChild(slotEl);
      }
    }

    // 2. Render Selected Item Inspector Drawer
    if (this.dom.inventorySelectedDetails) {
      const selectedItem = inv.items.find((i) => i.uid === this.selectedItemUid);
      const hasSheet = inv.items.some((i) => i.id === 'ripped_sheets');

      if (selectedItem) {
        const icon = this._getItemCategoryIcon(selectedItem);
        const statSummary = this._formatStatBonusesInline(selectedItem);

        let metaTagsHtml = '';
        if (selectedItem.equippedSlot) {
          metaTagsHtml += `<span class="inv-meta-tag tag-equipped">EQUIPPED: ${selectedItem.equippedSlot.toUpperCase()}</span>`;
        } else if (selectedItem.slot) {
          metaTagsHtml += `<span class="inv-meta-tag">${selectedItem.slot.toUpperCase()}</span>`;
        } else if (selectedItem.category) {
          metaTagsHtml += `<span class="inv-meta-tag">${selectedItem.category.toUpperCase()}</span>`;
        }

        if (statSummary) {
          metaTagsHtml += `<span class="inv-meta-tag tag-bonus">${statSummary}</span>`;
        }

        if (selectedItem.insideOut) {
          metaTagsHtml += '<span class="inv-meta-tag tag-insideout">INSIDE-OUT</span>';
        }

        this.dom.inventorySelectedDetails.innerHTML = `
          <div class="inv-inspector-header">
            <div class="inv-inspector-title">
              <span class="inv-inspector-icon" aria-hidden="true">${icon}</span>
              <span>${selectedItem.name}</span>
            </div>
          </div>
          <div class="inv-inspector-meta">${metaTagsHtml}</div>
          <p class="inv-inspector-desc">${selectedItem.description || ''}</p>
          <div class="inv-inspector-actions"></div>
        `;

        const descEl = this.dom.inventorySelectedDetails.querySelector('.inv-inspector-desc');
        if (descEl) annotateMythologyTerms(descEl);

        const actionsBar = this.dom.inventorySelectedDetails.querySelector('.inv-inspector-actions');

        if (selectedItem.slot) {
          const equipBtn = document.createElement('button');
          equipBtn.type = 'button';
          equipBtn.className = `inv-action-btn ${selectedItem.equippedSlot ? 'btn-equipped-active' : ''}`;
          equipBtn.textContent = selectedItem.equippedSlot ? 'UNEQUIP' : 'EQUIP';
          equipBtn.addEventListener('click', () => {
            try { this.audio.playClick(); } catch (_err) {}
            this.eventBus.emit('inventory:equipToggle', { uid: selectedItem.uid });
          });
          actionsBar.appendChild(equipBtn);
        }

        if (selectedItem.canFlipInsideOut) {
          const flipBtn = document.createElement('button');
          flipBtn.type = 'button';
          flipBtn.className = 'inv-action-btn';
          flipBtn.textContent = selectedItem.insideOut ? 'WEAR NORMALLY' : 'WEAR INSIDE-OUT';
          flipBtn.addEventListener('click', () => {
            try { this.audio.playClick(); } catch (_err) {}
            this.eventBus.emit('inventory:flipInsideOut', { uid: selectedItem.uid });
          });
          actionsBar.appendChild(flipBtn);
        }

        if (selectedItem.canRip) {
          const ripBtn = document.createElement('button');
          ripBtn.type = 'button';
          ripBtn.className = 'inv-action-btn';
          ripBtn.textContent = `RIP INTO ${selectedItem.ripYield || 2} SHEETS`;
          ripBtn.addEventListener('click', () => {
            try { this.audio.playClick(); } catch (_err) {}
            this.eventBus.emit('inventory:ripItem', { uid: selectedItem.uid });
          });
          actionsBar.appendChild(ripBtn);
        }

        const canWringSelected = Boolean(
          selectedItem.canWring ||
          selectedItem.isWet ||
          (selectedItem.category === 'wearable' && (selectedItem.canRip || (selectedItem.tags && selectedItem.tags.includes('cloth_garment'))))
        );
        if (canWringSelected) {
          const wringBtn = document.createElement('button');
          wringBtn.type = 'button';
          wringBtn.className = 'inv-action-btn';
          wringBtn.textContent = 'WRING DRY';
          wringBtn.addEventListener('click', () => {
            try { this.audio.playClick(); } catch (_err) {}
            this.eventBus.emit('inventory:wringItem', { uid: selectedItem.uid });
          });
          actionsBar.appendChild(wringBtn);
        }

        if (selectedItem.usable) {
          const useBtn = document.createElement('button');
          useBtn.type = 'button';
          useBtn.className = 'inv-action-btn';
          useBtn.textContent = (selectedItem.useActionLabel || 'USE').toUpperCase();
          useBtn.addEventListener('click', () => {
            try { this.audio.playClick(); } catch (_err) {}
            this.eventBus.emit('inventory:useItem', { uid: selectedItem.uid });
          });
          actionsBar.appendChild(useBtn);
        }

        if (selectedItem.canCombineWithSheet && hasSheet) {
          const craftBtn = document.createElement('button');
          craftBtn.type = 'button';
          craftBtn.className = 'inv-action-btn';
          craftBtn.textContent = 'CRAFT POULTICE (W/ SHEET)';
          craftBtn.addEventListener('click', () => {
            try { this.audio.playClick(); } catch (_err) {}
            this.eventBus.emit('inventory:combineWithSheet', { uid: selectedItem.uid });
          });
          actionsBar.appendChild(craftBtn);
        }
      } else {
        this.dom.inventorySelectedDetails.innerHTML = `
          <div class="inv-empty-inspector">
            <span class="inv-hint-glyph">✦</span>
            <p>Select an item slot to inspect, equip, or use.</p>
          </div>
        `;
      }
    }

    // 3. Keep hidden legacy list populated for backward compatibility with existing tests
    if (this.dom.playerInventoryList) {
      this.dom.playerInventoryList.innerHTML = '';
      for (const item of filtered) {
        const li = document.createElement('li');
        li.className = `pz-item-card ${item.equippedSlot ? 'is-equipped' : ''}`;
        li.setAttribute('data-uid', item.uid);
        li.innerHTML = `
          <div class="pz-item-header">
            <span class="pz-item-title">${item.name}</span>
          </div>
        `;
        this.dom.playerInventoryList.appendChild(li);
      }
    }
  }

  _renderEquipmentSlotsModal(player) {
    if (!player || !this.dom.equipmentSlotsGrid) return;
    const inv = player.getComponent('Inventory');
    if (!inv) return;

    this.dom.equipmentSlotsGrid.innerHTML = '';

    for (const slotDef of EQUIPMENT_SLOTS) {
      const uid = inv.slots[slotDef.id];
      const equippedItem = uid ? inv.items.find((i) => i.uid === uid) : null;
      const isSelected = Boolean(equippedItem && this.selectedEquipSlotId === slotDef.id);

      const li = document.createElement('li');
      li.className = `equip-slot-row ${equippedItem ? 'occupied' : 'empty'} ${isSelected ? 'selected' : ''}`;
      li.dataset.slotId = slotDef.id;

      if (equippedItem) {
        const insideTag = equippedItem.insideOut ? ' [INSIDE-OUT]' : '';
        const statBonusText = this._formatStatBonusesInline(equippedItem);
        const bonusSpan = statBonusText
          ? `<span class="slot-bonus-tag">${statBonusText}</span>`
          : '';

        let actionsHtml = '';
        if (isSelected) {
          const flipBtnHtml = equippedItem.canFlipInsideOut
            ? `<button type="button" class="pz-action-btn btn-flip-slot">${equippedItem.insideOut ? 'Wear Normally' : 'Wear Inside-Out'}</button>`
            : '';
          const ripBtnHtml = equippedItem.canRip
            ? `<button type="button" class="pz-action-btn btn-rip-slot">Rip into ${equippedItem.ripYield || 2} Sheets</button>`
            : '';
          const canWring = Boolean(
            equippedItem.canWring ||
            equippedItem.isWet ||
            (equippedItem.category === 'wearable' && (equippedItem.canRip || (equippedItem.tags && equippedItem.tags.includes('cloth_garment'))))
          );
          const wringBtnHtml = canWring
            ? `<button type="button" class="pz-action-btn btn-wring-slot">Wring Dry</button>`
            : '';

          actionsHtml = `
            <div class="slot-action-buttons">
              <button type="button" class="pz-action-btn btn-unequip-slot">Unequip</button>
              ${flipBtnHtml}
              ${ripBtnHtml}
              ${wringBtnHtml}
            </div>
          `;
        }

        li.innerHTML = `
          <div class="slot-header-line">
            <span class="slot-name-label">${slotDef.label}</span>
            ${bonusSpan}
          </div>
          <div class="slot-item-name">
            <span>${equippedItem.name}${insideTag}</span>
          </div>
          ${actionsHtml}
        `;

        li.addEventListener('click', (e) => {
          if (e.target.closest('.slot-action-buttons')) return;
          try { this.audio.playHover(); } catch (_err) {}
          this.selectedEquipSlotId = this.selectedEquipSlotId === slotDef.id ? null : slotDef.id;
          this._renderEquipmentSlotsModal(player);
        });

        if (isSelected) {
          const unequipBtn = li.querySelector('.btn-unequip-slot');
          if (unequipBtn) {
            unequipBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              try { this.audio.playClick(); } catch (_err) {}
              this.selectedEquipSlotId = null;
              this.eventBus.emit('inventory:equipToggle', { uid: equippedItem.uid });
            });
          }
          if (equippedItem.canFlipInsideOut) {
            const flipBtn = li.querySelector('.btn-flip-slot');
            if (flipBtn) {
              flipBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                try { this.audio.playClick(); } catch (_err) {}
                this.eventBus.emit('inventory:flipInsideOut', { uid: equippedItem.uid });
              });
            }
          }
          if (equippedItem.canRip) {
            const ripBtn = li.querySelector('.btn-rip-slot');
            if (ripBtn) {
              ripBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                try { this.audio.playClick(); } catch (_err) {}
                this.selectedEquipSlotId = null;
                this.eventBus.emit('inventory:ripItem', { uid: equippedItem.uid });
              });
            }
          }
          const wringBtn = li.querySelector('.btn-wring-slot');
          if (wringBtn) {
            wringBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              try { this.audio.playClick(); } catch (_err) {}
              this.eventBus.emit('inventory:wringItem', { uid: equippedItem.uid });
            });
          }
        }
      } else {
        li.innerHTML = `
          <div class="slot-header-line">
            <span class="slot-name-label">${slotDef.label}</span>
          </div>
          <span class="slot-empty-text">Empty</span>
        `;
        li.addEventListener('click', () => {
          if (this.selectedEquipSlotId) {
            this.selectedEquipSlotId = null;
            this._renderEquipmentSlotsModal(player);
          }
        });
      }

      this.dom.equipmentSlotsGrid.appendChild(li);
    }
  }

  _renderSurvivalConditions(player) {
    if (!this.dom.survivalConditionsList) return;
    this.dom.survivalConditionsList.innerHTML = '';

    const condComp = player ? player.getComponent('Conditions') : null;
    const active = condComp && condComp.active ? Object.values(condComp.active) : [];

    if (this.dom.conditionsCountBadge) {
      if (active.length === 0) {
        this.dom.conditionsCountBadge.textContent = 'HEALTHY';
        this.dom.conditionsCountBadge.className = 'conditions-badge';
      } else {
        this.dom.conditionsCountBadge.textContent = `${active.length} AFFLICTION${active.length > 1 ? 'S' : ''}`;
        this.dom.conditionsCountBadge.className = 'conditions-badge has-afflictions';
      }
    }

    if (active.length === 0) {
      const li = document.createElement('li');
      li.className = 'condition-empty';
      li.textContent = '🌿 Unscathed in body and spirit.';
      this.dom.survivalConditionsList.appendChild(li);
      return;
    }

    for (const cond of active) {
      const li = document.createElement('li');
      li.className = 'condition-item';

      let remedyBtnHtml = '';
      if (cond.id === 'bleeding_wound') {
        remedyBtnHtml = '<button type="button" class="condition-remedy-btn" data-remedy="bandage">🩹 BANDAGE (Ripped Sheet)</button>';
      } else if (cond.id === 'infected_aswang_bite') {
        remedyBtnHtml = '<button type="button" class="condition-remedy-btn" data-remedy="poultice">🌿 CLEANSE (Bayabas / Poultice)</button>';
      } else if (cond.id === 'bangungot_paralysis') {
        remedyBtnHtml = '<button type="button" class="condition-remedy-btn" data-remedy="wiggle">🦶 WIGGLE TOES (CON DC 12)</button>';
      } else if (cond.id === 'soaked_hypothermia') {
        remedyBtnHtml = '<button type="button" class="condition-remedy-btn" data-remedy="dry">🔥 DRY (Campfire / Torch)</button>';
      }

      li.innerHTML = `
        <div class="condition-header">
          <span class="condition-title">${cond.name}</span>
          <span class="condition-part">${cond.bodyPart}</span>
        </div>
        <p class="condition-desc">${cond.desc}</p>
        ${remedyBtnHtml}
      `;

      const btn = li.querySelector('.condition-remedy-btn');
      if (btn) {
        btn.addEventListener('click', () => {
          try { this.audio.playClick(); } catch (_err) {}
          const rType = btn.getAttribute('data-remedy');
          if (rType === 'bandage') {
            const inv = player.getComponent('Inventory');
            const sheet = inv && inv.items.find((i) => i.id === 'ripped_sheets' || i.id === 'herbal_poultice');
            if (sheet) {
              this.eventBus.emit('inventory:useItem', { uid: sheet.uid });
            } else {
              this.eventBus.emit('log:mechanical', {
                type: 'damage',
                text: 'Missing Ripped Cloth Sheet in pack! Rip a garment to bandage.'
              });
            }
          } else if (rType === 'poultice') {
            const inv = player.getComponent('Inventory');
            const herb = inv && inv.items.find((i) => i.id === 'bayabas_herbs' || i.id === 'herbal_poultice');
            if (herb) {
              this.eventBus.emit('inventory:useItem', { uid: herb.uid });
            } else {
              this.eventBus.emit('log:mechanical', {
                type: 'damage',
                text: 'Requires Wild Bayabas Herbs or Herbal Poultice to cleanse septic venom.'
              });
            }
          } else if (rType === 'wiggle') {
            this.eventBus.emit('status:wiggleToes');
          } else if (rType === 'dry') {
            const inv = player.getComponent('Inventory');
            const torch = inv && inv.items.find((i) => i.id === 'bamboo_torch' || i.id === 'bamboo_resin_torch');
            if (torch || (this.world && this.world.hasFlag('rest_hearth'))) {
              this.eventBus.emit('status:dryOff');
            } else {
              this.eventBus.emit('log:mechanical', {
                type: 'damage',
                text: 'Requires a lit torch or campfire hearth to dry soaked clothing.'
              });
            }
          }
        });
      }

      this.dom.survivalConditionsList.appendChild(li);
    }
  }

  _renderFactionStandings(player) {
    if (!this.world) return;
    const standings = FactionManager.getAllStandings(this.world);
    const marks = FactionManager.getActiveMoralMarks(this.world);

    if (this.dom.factionStandingsGrid) {
      this.dom.factionStandingsGrid.innerHTML = '';
      for (const f of standings) {
        const card = document.createElement('div');
        card.className = `faction-card ${f.statusClass}`;

        const perkDesc =
          f.standing === 'ALLIED'
            ? `<div class="faction-perks-text perk-active">❖ Ally Benefit: ${f.benefits}</div>`
            : f.standing === 'HOSTILE'
              ? `<div class="faction-perks-text perk-danger">⚠ Retribution Threat: ${f.penalties}</div>`
              : `<div class="faction-perks-text">${f.profile}</div>`;

        card.innerHTML = `
          <div class="faction-card-header">
            <div class="faction-card-title">
              <span class="faction-icon">${f.icon}</span>
              <span class="faction-name">${f.name}</span>
            </div>
            <span class="faction-standing-badge ${f.statusClass}">${f.label}</span>
          </div>
          ${perkDesc}
        `;
        this.dom.factionStandingsGrid.appendChild(card);
      }
    }

    if (this.dom.moralMarksList) {
      this.dom.moralMarksList.innerHTML = '';
      if (!marks || marks.length === 0) {
        this.dom.moralMarksList.innerHTML = `
          <div class="moral-marks-empty">No notable deeds or faction decrees etched upon your fate yet.</div>
        `;
      } else {
        for (const mark of marks) {
          const item = document.createElement('div');
          item.className = `moral-mark-item ${mark.tone || 'neutral'}`;
          item.innerHTML = `
            <div class="moral-mark-header">
              <span class="moral-mark-name">❖ ${mark.name}</span>
            </div>
            <div class="moral-mark-desc">${mark.desc}</div>
          `;
          this.dom.moralMarksList.appendChild(item);
        }
      }
    }
  }

  _updateTagsHUD(tags = []) {
    if (!this.dom.statusList) return;
    this.dom.statusList.innerHTML = '';
    const displayOmens = tags
      .filter((t) => OMEN_TAG_LABELS[t])
      .map((t) => OMEN_TAG_LABELS[t]);

    if (displayOmens.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-note';
      li.textContent = 'The air hangs still.';
      this.dom.statusList.appendChild(li);
      return;
    }

    for (const label of displayOmens) {
      const li = document.createElement('li');
      li.className = 'status-badge';
      li.textContent = label;
      this.dom.statusList.appendChild(li);
    }
    this._updateScrollFade(this.dom.statusList, 'y');
  }

  _updateEchoesHUD(tags = []) {
    if (!this.dom.inventoryList) return;
    this.dom.inventoryList.innerHTML = '';

    const activeEchoes = tags
      .filter((t) => ENTITY_ECHO_LABELS[t])
      .map((t) => ENTITY_ECHO_LABELS[t]);

    if (activeEchoes.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-note';
      li.textContent = 'No spirits or beasts yet hold your debt.';
      this.dom.inventoryList.appendChild(li);
      return;
    }

    for (const echo of activeEchoes) {
      const li = document.createElement('li');
      li.className = 'inventory-item';
      li.innerHTML = `
        <span class="item-name">${echo.title}</span>
        <span class="item-desc">${echo.desc}</span>
      `;
      const nameEl = li.querySelector('.item-name');
      const descEl = li.querySelector('.item-desc');
      if (nameEl) annotateMythologyTerms(nameEl);
      if (descEl) annotateMythologyTerms(descEl);
      this.dom.inventoryList.appendChild(li);
    }
    this._updateScrollFade(this.dom.inventoryList, 'y');
  }

  _clearAmbushTimer() {
    if (this.ambushTimerId) {
      clearInterval(this.ambushTimerId);
      this.ambushTimerId = null;
    }
    if (this.dom.pressureTimerContainer) {
      this.dom.pressureTimerContainer.hidden = true;
    }
    if (this.dom.pressureFill) {
      this.dom.pressureFill.classList.remove('urgent');
      this.dom.pressureFill.style.width = '100%';
    }
  }

  _startAmbushTimer(durationSeconds = 5) {
    this._clearAmbushTimer();
    if (
      !this.dom.pressureTimerContainer ||
      !this.dom.pressureFill ||
      !this.dom.pressureTimerText
    )
      return;

    const duration = Math.max(1, durationSeconds) * 1000;
    this.activeAmbushDuration = duration;
    this.dom.pressureTimerContainer.hidden = false;
    this.dom.pressureFill.style.width = '100%';
    this.dom.pressureFill.classList.remove('urgent');
    this.dom.pressureTimerText.textContent = (duration / 1000).toFixed(1) + 's';

    const startTime = performance.now();
    this.ambushTimerId = window.setInterval(() => {
      const elapsed = performance.now() - startTime;
      const remaining = Math.max(0, duration - elapsed);
      const pct = (remaining / duration) * 100;

      this.dom.pressureFill.style.width = `${pct}%`;
      this.dom.pressureTimerText.textContent = `${(remaining / 1000).toFixed(1)}s`;

      if (remaining <= 2000) {
        this.dom.pressureFill.classList.add('urgent');
      }

      if (remaining <= 0) {
        this._clearAmbushTimer();
        if (this.dom.choicesContainer) {
          this.dom.choicesContainer.querySelectorAll('button').forEach((b) => {
            b.disabled = true;
          });
        }
        if (this.director) {
          this.director.handleAmbushHesitation();
        }
      }
    }, 40);
  }

  _openDiceRollModal({ choice, prepToApply, rushedPenalty }) {
    if (!this.dom.diceRollModal) return;

    const player = this.world ? this.world.getEntity('player') : null;
    const statKey = choice.check ? choice.check.stat : 'WIS';
    const aspectName = ASPECT_NAMES[statKey] || statKey;
    const dc = choice.check ? choice.check.dc : 13;

    this.pendingDiceResolution = {
      choice,
      prepToApply,
      rushedPenalty,
      statKey,
      aspectName,
      dc,
      breakdown: null
    };

    if (this.dom.diceCheckTag) {
      this.dom.diceCheckTag.textContent = `${aspectName.toUpperCase()} CHECK`;
    }
    if (this.dom.diceCheckTitle) {
      this.dom.diceCheckTitle.textContent = choice.label;
    }
    if (this.dom.diceDcBadge) {
      this.dom.diceDcBadge.textContent = `DC ${dc}`;
    }
    if (this.dom.d20Number) {
      this.dom.d20Number.textContent = '20';
    }
    if (this.dom.d20Visual) {
      this.dom.d20Visual.className = 'd20-visual';
    }
    if (this.dom.diceStatusLabel) {
      this.dom.diceStatusLabel.textContent = 'Tap to roll the twenty-sided bone...';
    }
    if (this.dom.diceMathContainer) {
      this.dom.diceMathContainer.hidden = true;
    }
    if (this.dom.diceMathBreakdown) {
      this.dom.diceMathBreakdown.innerHTML = '';
    }
    if (this.dom.diceVerdictBox) {
      this.dom.diceVerdictBox.innerHTML = '';
    }
    if (this.dom.btnRollDice) {
      this.dom.btnRollDice.hidden = false;
      this.dom.btnRollDice.disabled = false;
    }
    if (this.dom.btnContinueRoll) {
      this.dom.btnContinueRoll.hidden = true;
    }

    this.dom.diceRollModal.hidden = false;
  }

  _executeDiceRoll() {
    if (!this.pendingDiceResolution) return;
    if (this.dom.btnRollDice) {
      this.dom.btnRollDice.disabled = true;
    }

    try { this.audio.playDiceRoll(); } catch (_err) {}

    if (this.dom.d20Visual) {
      this.dom.d20Visual.classList.add('d20-rolling');
    }
    if (this.dom.diceStatusLabel) {
      this.dom.diceStatusLabel.textContent = 'The bone tumbles across the stone...';
    }

    let rollCounter = 0;
    const interval = window.setInterval(() => {
      rollCounter += 1;
      const randNum = Math.floor(Math.random() * 20) + 1;
      if (this.dom.d20Number) {
        this.dom.d20Number.textContent = String(randNum);
      }
      if (rollCounter >= 12) {
        clearInterval(interval);
        this._finalizeDiceRoll();
      }
    }, 50);
  }

  _finalizeDiceRoll() {
    if (!this.pendingDiceResolution) return;
    const { choice, prepToApply, rushedPenalty, statKey, dc } =
      this.pendingDiceResolution;
    const player = this.world ? this.world.getEntity('player') : null;

    const baseRoll = StatResolver.rollDie(20);
    const breakdown = StatResolver.getDetailedBreakdown(
      player,
      statKey,
      dc,
      prepToApply ? prepToApply.bonus : 0,
      rushedPenalty,
      baseRoll,
      prepToApply ? prepToApply.itemName : ''
    );

    this.pendingDiceResolution.breakdown = breakdown;

    if (this.dom.d20Visual) {
      this.dom.d20Visual.classList.remove('d20-rolling');
      if (breakdown.baseRoll === 20) {
        this.dom.d20Visual.classList.add('crit-success');
      } else if (breakdown.baseRoll === 1) {
        this.dom.d20Visual.classList.add('crit-failure');
      }
    }

    if (this.dom.d20Number) {
      this.dom.d20Number.textContent = String(breakdown.baseRoll);
    }

    if (this.dom.diceStatusLabel) {
      if (breakdown.outcome === 'CRITICAL_SUCCESS') {
        this.dom.diceStatusLabel.textContent =
          '★ NATURAL 20! Ancestral spirits guide your hand!';
      } else if (breakdown.outcome === 'CRITICAL_FAILURE') {
        this.dom.diceStatusLabel.textContent =
          '☠ CRITICAL FAILURE! The spirits turn their gaze away...';
      } else if (breakdown.success) {
        this.dom.diceStatusLabel.textContent =
          'Check passed. Fate smiles upon your conviction.';
      } else {
        this.dom.diceStatusLabel.textContent =
          'Check failed. You fall short of the required threshold.';
      }
    }

    if (
      this.dom.diceMathContainer &&
      this.dom.diceMathBreakdown &&
      this.dom.diceVerdictBox
    ) {
      this.dom.diceMathContainer.hidden = false;

      let mathHtml = `
        <span class="math-term">Base Roll <strong class="val-roll">${breakdown.baseRoll}</strong></span>
        <span class="math-op">+</span>
        <span class="math-term">${breakdown.statKey} <strong class="val-stat">${breakdown.baseMod >= 0 ? '+' + breakdown.baseMod : breakdown.baseMod}</strong></span>
      `;

      if (breakdown.hasInvertedArmor) {
        mathHtml += `
          <span class="math-op">+</span>
          <span class="math-term">Inverted Armor <strong class="val-gear">+1</strong></span>
        `;
      } else if (breakdown.gearBonus !== 0) {
        mathHtml += `
          <span class="math-op">+</span>
          <span class="math-term">Gear <strong class="val-gear">${breakdown.gearBonus >= 0 ? '+' + breakdown.gearBonus : breakdown.gearBonus}</strong></span>
        `;
      }

      if (breakdown.boonBonus > 0) {
        mathHtml += `
          <span class="math-op">+</span>
          <span class="math-term">${breakdown.boonName} <strong class="val-boon">+${breakdown.boonBonus}</strong></span>
        `;
      }

      if (breakdown.conditionPenalty < 0) {
        mathHtml += `
          <span class="math-op">-</span>
          <span class="math-term">${breakdown.conditionNames.join(', ')} <strong class="val-cond">${Math.abs(breakdown.conditionPenalty)}</strong></span>
        `;
      }

      if (breakdown.prepBonus > 0) {
        const pName = breakdown.prepItemName || 'Consumable';
        mathHtml += `
          <span class="math-op">+</span>
          <span class="math-term">Prep: ${pName} <strong class="val-prep">+${breakdown.prepBonus}</strong></span>
        `;
      }

      if (breakdown.rushedPenalty > 0) {
        mathHtml += `
          <span class="math-op">-</span>
          <span class="math-term">Rushed Action <strong class="val-rushed">-${breakdown.rushedPenalty}</strong></span>
        `;
      }

      mathHtml += `
        <span class="math-op">=</span>
        <span class="math-total">${breakdown.total} <small>vs DC ${breakdown.dc}</small></span>
      `;

      this.dom.diceMathBreakdown.innerHTML = mathHtml;

      let verdictHtml = '';
      if (breakdown.outcome === 'CRITICAL_SUCCESS') {
        verdictHtml =
          '<div class="verdict-banner verdict-crit-success">★ CRITICAL SUCCESS ★</div>';
      } else if (breakdown.outcome === 'CRITICAL_FAILURE') {
        verdictHtml =
          '<div class="verdict-banner verdict-crit-failure">☠ CRITICAL FAILURE ☠</div>';
      } else if (breakdown.success) {
        verdictHtml = '<div class="verdict-banner verdict-success">✓ SUCCESS</div>';
      } else {
        verdictHtml = '<div class="verdict-banner verdict-failure">✕ FAILURE</div>';
      }

      this.dom.diceVerdictBox.innerHTML = verdictHtml;
    }

    if (this.dom.btnRollDice) {
      this.dom.btnRollDice.hidden = true;
    }
    if (this.dom.btnContinueRoll) {
      this.dom.btnContinueRoll.hidden = false;
    }
  }

  _commitDiceOutcome() {
    if (!this.pendingDiceResolution) return;
    const { choice, prepToApply, breakdown } = this.pendingDiceResolution;
    this.closeDiceRollModal();

    this.director.selectChoice(choice.index, prepToApply, breakdown);
  }

  _clearCinematicTimer() {
    if (this._cinematicTimerId) {
      window.clearTimeout(this._cinematicTimerId);
      this._cinematicTimerId = null;
    }
  }

  _renderChoices(
    choices,
    isEnding,
    prepOptions = {},
    isAmbush = false,
    reactionTimer = 5,
    nodeId = null,
    options = {}
  ) {
    if (!this.dom.choicesContainer) return;
    this.dom.choicesContainer.innerHTML = '';
    this._clearAmbushTimer();
    this._clearCinematicTimer();

    if (isEnding) {
      this.stagedPrep = null;
      const isVictory = Boolean(
        options.isVictory ||
          (this.latestEndingData && this.latestEndingData.isVictory)
      );

      const endBtn = document.createElement('button');
      endBtn.type = 'button';
      endBtn.className = 'choice-btn ending-conclude-btn';
      endBtn.innerHTML = `
        <span class="choice-tag tag-prep">CHRONICLE CONCLUSION</span>
        <strong>✦ END THE ADVENTURE</strong>
        <div class="field-hint" style="margin-top:0.35rem; color:#ebd1be;">
          Proceed with the cinematic recollection of your vessel's journey across the archipelago.
        </div>
      `;
      endBtn.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      endBtn.addEventListener('click', () => {
        try { this.audio.playStartGong(); } catch (_err) {}
        if (
          this.director &&
          typeof this.director.playCinematicSummary === 'function'
        ) {
          this.director.playCinematicSummary(isVictory);
        }
      });
      this.dom.choicesContainer.appendChild(endBtn);
      return;
    }

    if (options.isCinematicAct) {
      const c = (choices && choices[0]) || {
        title: '✦ CONTINUE RECOLLECTION ❯',
        desc: 'Reflect upon the next chapter of your journey.'
      };

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn cinematic-next-btn';
      btn.innerHTML = `
        <span class="choice-tag tag-passive">CHAPTER ${options.actIndex || 1} OF ${options.totalActs || 4}</span>
        <strong>${c.title}</strong>
        <div class="field-hint" style="margin-top:0.35rem; color:#cbe3f2;">${c.desc}</div>
      `;
      btn.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      btn.addEventListener('click', () => {
        this._clearCinematicTimer();
        try { this.audio.playClick(); } catch (_err) {}
        if (
          this.director &&
          typeof this.director.advanceCinematicAct === 'function'
        ) {
          this.director.advanceCinematicAct();
        }
      });
      this.dom.choicesContainer.appendChild(btn);

      this._cinematicTimerId = window.setTimeout(() => {
        if (
          this.director &&
          typeof this.director.advanceCinematicAct === 'function'
        ) {
          this.director.advanceCinematicAct();
        }
      }, 7000);
      return;
    }

    if (options.isCinematicFinished) {
      const restartBtn = document.createElement('button');
      restartBtn.type = 'button';
      restartBtn.className = 'choice-btn ending-restart-btn';
      restartBtn.innerHTML = `
        <span class="choice-tag tag-prep">A NEW BEGINNING</span>
        <strong>✦ FORGE A NEW CHRONICLE</strong>
        <div class="field-hint" style="margin-top:0.35rem; color:#ebd1be;">
          Return to character creation and guide a new vessel into the archipelago.
        </div>
      `;
      restartBtn.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      restartBtn.addEventListener('click', () => {
        try { this.audio.playStartGong(); } catch (_err) {}
        this.showBackgroundScreen();
      });
      this.dom.choicesContainer.appendChild(restartBtn);

      const replayBtn = document.createElement('button');
      replayBtn.type = 'button';
      replayBtn.className = 'choice-btn';
      replayBtn.innerHTML = `
        <span class="choice-tag tag-passive">REVISIT TALE</span>
        <strong>↻ REPLAY CINEMATIC SUMMARY</strong>
        <div class="field-hint" style="margin-top:0.35rem; color:#cbe3f2;">
          Experience the cinematic recollection of this vessel once more.
        </div>
      `;
      replayBtn.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      replayBtn.addEventListener('click', () => {
        try { this.audio.playClick(); } catch (_err) {}
        if (
          this.director &&
          typeof this.director.playCinematicSummary === 'function'
        ) {
          this.director.playCinematicSummary(Boolean(options.isVictory));
        }
      });
      this.dom.choicesContainer.appendChild(replayBtn);
      return;
    }

    // Render Choice Buttons with Fade-In Animation
    for (const choice of choices) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';

      if (choice.isPassiveRevealed || choice.isIntUnlocked) {
        btn.classList.add('passive-revealed');
      }

      let tagsHtml = '';

      if (choice.isPassiveRevealed || choice.isIntUnlocked) {
        const tagText =
          choice.passiveStat === 'INT'
            ? '[Tactical Deduction]'
            : choice.isIntUnlocked
              ? '[Keen Intellect]'
              : '[Instinct]';
        tagsHtml += `<span class="choice-tag tag-passive">${tagText}</span>`;
      }

      if (choice.whisper) {
        let tagClass = 'choice-tag';
        const cleanWhisper = String(choice.whisper).split('//')[0].trim();
        if (cleanWhisper) {
          tagsHtml += `<span class="${tagClass}">[${cleanWhisper}]</span>`;
        }
      }

      if (choice.loud) {
        tagsHtml += '<span class="choice-tag tag-loud">[LOUD]</span>';
      }

      if (
        this.stagedPrep &&
        ((choice.check && choice.check.stat) ||
          (choice.consumableEffect && choice.consumableEffect[this.stagedPrep.itemId]))
      ) {
        btn.classList.add('prep-staged');
        let prepLabel = `+${this.stagedPrep.bonus} PREP: ${this.stagedPrep.itemName}`;
        if (choice.consumableEffect && choice.consumableEffect[this.stagedPrep.itemId]) {
          const cfg = choice.consumableEffect[this.stagedPrep.itemId];
          if (cfg.autoSuccess) {
            prepLabel = `AUTO-SUCCESS: ${this.stagedPrep.itemName}`;
          } else if (typeof cfg.bonusModifier === 'number') {
            prepLabel = `+${cfg.bonusModifier} PREP: ${this.stagedPrep.itemName}`;
          }
        }
        tagsHtml += `<span class="choice-tag tag-prep">[${prepLabel}]</span>`;
      }

      let displayLabel = choice.label || '';
      if (!choice.allowed && choice.abstractLabel) {
        displayLabel = choice.abstractLabel;
      }
      displayLabel = displayLabel
        .replace(/^(?:\[?(?:moral\s+choice|good\s+choice|evil\s+choice|immoral\s+choice|moral|immoral|good|evil)\]?[:\s-]+)/i, '')
        .trim();
      const cleanLabel = (displayLabel || '').replace(/\[([^\]]+)\/\/([^\]]*)\]/g, (m, p1) => `[${p1.trim()}]`);
      if (!choice.allowed) {
        btn.classList.add('choice-btn-locked');
        btn.setAttribute('aria-disabled', 'true');
        const reasonText = choice.lockReason || 'Prerequisite not met';
        tagsHtml = `<span class="choice-tag tag-locked">[LOCKED: ${reasonText}]</span>` + tagsHtml;
      }
      btn.innerHTML = `${tagsHtml}<span class="choice-label">${cleanLabel}</span>`;
      if (!choice.allowed && choice.lockReason) {
        btn.title = choice.lockReason;
      }

      btn.addEventListener('mouseenter', () => {
        try { this.audio.playHover(); } catch (_err) {}
      });
      btn.addEventListener('click', () => {
        if (!choice.allowed) {
          try { this.audio.playHover(); } catch (_err) {}
          btn.classList.add('btn-locked-shake');
          setTimeout(() => btn.classList.remove('btn-locked-shake'), 400);
          this._showActionBlockedNotification(choice.lockReason || 'Prerequisite conditions not met');
          this._appendMechanicalLog({
            type: 'status_loss',
            text: `Action locked: ${choice.lockReason || 'Prerequisite conditions not met'}.`
          });
          return;
        }
        try { this.audio.playClick(); } catch (_err) {}
        this._clearAmbushTimer();

        const prepToApply = this.stagedPrep;
        this.stagedPrep = null;

        const hasAutoSuccess =
          prepToApply &&
          choice.consumableEffect &&
          choice.consumableEffect[prepToApply.itemId] &&
          choice.consumableEffect[prepToApply.itemId].autoSuccess;

        const rawChoice =
          this.director &&
          this.director.currentScenario &&
          this.director.currentScenario.choices &&
          this.director.currentScenario.choices[choice.index];
        const isOpenDambana =
          choice.openModal === 'dambana' ||
          choice.action === 'open_dambana' ||
          choice.openDambana ||
          (rawChoice && (rawChoice.openModal === 'dambana' || rawChoice.openDambana || rawChoice.action === 'open_dambana'));

        if (isOpenDambana) {
          this.openDambanaModal();
          this.director.selectChoice(choice.index, prepToApply);
          return;
        }

        // Tactile d20 Dice Roll Modal: If check required, show tactile overlay (unless auto-success or auto-fail)
        if (choice.check && choice.check.stat && !hasAutoSuccess && !choice.autoFail) {
          this._openDiceRollModal({ choice, prepToApply, rushedPenalty: 0 });
        } else {
          this.director.selectChoice(choice.index, prepToApply);
        }
      });

      this.dom.choicesContainer.appendChild(btn);
    }

    this.lastRenderedNodeId = nodeId;
    this.choiceReadyTimestamp = performance.now();

    // If ambush scenario, launch reaction timer as choices appear
    if (isAmbush) {
      this._startAmbushTimer(reactionTimer || 5);
    }
  }

  _appendCheckLog(result) {
    if (!this.dom.diceLogList) return;
    const li = document.createElement('li');
    const outcomeClass = result.outcome
      ? result.outcome.toLowerCase()
      : result.success
        ? 'success'
        : 'failure';
    li.className = `log-entry outcome-${outcomeClass}`;
    li.textContent = result.prose || StatResolver.getOutcomeProse(result);
    this.dom.diceLogList.prepend(li);
    this._updateScrollFade(this.dom.diceLogList, 'y');
  }

  _appendMechanicalLog(entry) {
    if (!this.dom.diceLogList) return;
    const li = document.createElement('li');
    li.className = `log-entry log-${entry.type}`;
    if (entry.text) {
      li.textContent = entry.text;
    } else if (entry.delta < 0) {
      li.textContent = `Buhay wounded (${entry.delta}) at ${entry.source}.`;
    } else {
      li.textContent = `Buhay restored (+${entry.delta}) at ${entry.source}.`;
    }
    this.dom.diceLogList.prepend(li);
    this._updateScrollFade(this.dom.diceLogList, 'y');
  }

  _showActionBlockedNotification(reasonText) {
    if (!this.dom.choicesContainer) return;
    const parent = this.dom.choicesContainer.parentElement;
    if (!parent) return;

    const existing = parent.querySelector('.action-blocked-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'action-blocked-toast';
    toast.textContent = `[Action Locked] ${reasonText}`;
    parent.insertBefore(toast, this.dom.choicesContainer);

    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 2400);
  }

}
