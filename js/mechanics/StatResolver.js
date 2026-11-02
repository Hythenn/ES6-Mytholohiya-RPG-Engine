/**
 * StatResolver.js
 * Resolves Baldur's Gate style attribute checks (Strength, Dexterity,
 * Constitution, Intelligence, Wisdom, Charisma) behind the scenes while
 * providing diegetic descriptions and evaluating item/gear choice requirements.
 */

import { ItemConditionFlags, ITEM_FLAGS, STATS } from '../core/Constants.js';

export const CheckOutcome = Object.freeze({
  CRITICAL_SUCCESS: 'CRITICAL_SUCCESS',
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  CRITICAL_FAILURE: 'CRITICAL_FAILURE'
});

export const ASPECT_NAMES = Object.freeze({
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma'
});

export class StatResolver {
  /**
   * Roll an N-sided die.
   * @param {number} sides
   * @returns {number}
   */
  static rollDie(sides = 20) {
    return Math.floor(Math.random() * sides) + 1;
  }

  /**
   * Convert a raw ability score into an ability modifier (Baldur's Gate / D&D 5e formula).
   * @param {number} rawValue
   * @returns {number}
   */
  static getModifier(rawValue) {
    if (typeof rawValue !== 'number') return 0;
    if (rawValue >= 6) {
      return Math.floor((rawValue - 10) / 2);
    }
    return rawValue;
  }

  /**
   * Translate a raw stat score into a diegetic mastery tier for the UI.
   * @param {number} rawValue
   * @returns {string}
   */
  static getTraitDescriptor(rawValue) {
    if (rawValue <= 8) return 'Frail';
    if (rawValue <= 10) return 'Average';
    if (rawValue <= 12) return 'Capable';
    if (rawValue <= 14) return 'Seasoned';
    if (rawValue <= 16) return 'Heroic';
    return 'Legendary';
  }

  /**
   * Generate an immersive instinct cue for a choice check without exposing raw DCs.
   * @param {import('../core/ECS.js').Entity} playerEntity
   * @param {string} statKey
   * @param {number} dc
   * @returns {string}
   */
  static getChallengeWhisper(playerEntity, statKey, dc = 13) {
    const key = String(statKey || 'WIS').toUpperCase();
    return ASPECT_NAMES[key] || key;
  }

  /**
   * Translate a check result into atmospheric omen prose for the chronicle log.
   * @param {{ statKey: string, outcome: string, isPassive?: boolean }} result
   * @returns {string}
   */
  static getOutcomeProse(result) {
    const aspect = ASPECT_NAMES[result.statKey] || result.statKey;
    if (result.isPassive) {
      return result.outcome === CheckOutcome.SUCCESS ||
        result.outcome === CheckOutcome.CRITICAL_SUCCESS
        ? `${aspect} stirred: An omen revealed itself in the stillness.`
        : `${aspect} clouded: The shadows kept their counsel.`;
    }

    switch (result.outcome) {
      case CheckOutcome.CRITICAL_SUCCESS:
        return `${aspect} surged: The Anito favored your hand.`;
      case CheckOutcome.SUCCESS:
        return `${aspect} held true against the trial.`;
      case CheckOutcome.CRITICAL_FAILURE:
        return `${aspect} shattered: Fate turned mercilessly against you.`;
      default:
        return `${aspect} faltered under the weight of the hour.`;
    }
  }

  /**
   * Calculate player passive score for an aspect (e.g. Passive Wisdom, Passive Intelligence).
   * Follows standard d20 formula: 10 + ability modifier + situational bonuses.
   * @param {import('../core/ECS.js').Entity} playerEntity
   * @param {string} statKey
   * @returns {number}
   */
  static getPassiveScore(playerEntity, statKey = 'WIS') {
    const key = String(statKey || 'WIS').toUpperCase();
    const statsComp = playerEntity ? playerEntity.getComponent('Stats') : null;
    const rawStat = statsComp && typeof statsComp[key] === 'number' ? statsComp[key] : 10;
    let mod = StatResolver.getModifier(rawStat);

    if (playerEntity && playerEntity.world) {
      if (playerEntity.world.hasFlag('wounded')) {
        mod -= 1;
      }
      if (playerEntity.world.hasFlag('condition_soaked_hypothermia') && key === 'DEX') {
        mod -= 2;
      }
      if (playerEntity.world.hasFlag('condition_infected_aswang_bite') && key === 'CON') {
        mod -= 2;
      }
      if (playerEntity.world.hasFlag('boon_tala_guidance') && (key === 'WIS' || key === 'INT')) {
        mod += 2;
      }
    }
    return 10 + mod;
  }

  /**
   * Produce a detailed breakdown of a d20 check with all contributing bonuses and penalties.
   * @param {import('../core/ECS.js').Entity} playerEntity
   * @param {string} statKey
   * @param {number} [dc=13]
   * @param {number} [prepBonus=0]
   * @param {number} [rushedPenalty=0]
   * @param {number|null} [forcedRoll=null]
   * @param {string} [prepItemName='']
   */
  static getDetailedBreakdown(
    playerEntity,
    statKey,
    dc = 13,
    prepBonus = 0,
    rushedPenalty = 0,
    forcedRoll = null,
    prepItemName = ''
  ) {
    const key = String(statKey || 'WIS').toUpperCase();
    const statsComp = playerEntity ? playerEntity.getComponent('Stats') : null;
    const baseStat =
      statsComp && statsComp.base && typeof statsComp.base[key] === 'number'
        ? statsComp.base[key]
        : statsComp && typeof statsComp[key] === 'number'
        ? statsComp[key]
        : 10;
    const baseMod = StatResolver.getModifier(baseStat);

    // Gear / Inverted Armor bonuses
    const gearBonus =
      statsComp && statsComp.bonuses && typeof statsComp.bonuses[key] === 'number'
        ? statsComp.bonuses[key]
        : 0;

    const hasInvertedArmor = Boolean(
      playerEntity &&
        playerEntity.world &&
        playerEntity.world.hasFlag('clothing_inside_out') &&
        key === 'WIS'
    );

    let conditionPenalty = 0;
    const conditionNames = [];
    let boonBonus = 0;
    let boonName = '';

    if (playerEntity && playerEntity.world) {
      if (playerEntity.world.hasFlag('wounded')) {
        conditionPenalty -= 1;
        conditionNames.push('Wounded (-1)');
      }
      if (playerEntity.world.hasFlag('condition_soaked_hypothermia') && key === 'DEX') {
        conditionPenalty -= 2;
        conditionNames.push('Hypothermia (-2)');
      }
      if (playerEntity.world.hasFlag('condition_infected_aswang_bite') && key === 'CON') {
        conditionPenalty -= 2;
        conditionNames.push('Infected Bite (-2)');
      }
      if (playerEntity.world.hasFlag('boon_tala_guidance') && (key === 'WIS' || key === 'INT')) {
        boonBonus += 2;
        boonName = "Tala's Guidance (+2)";
      }
    }

    const roll =
      typeof forcedRoll === 'number' && forcedRoll >= 1 && forcedRoll <= 20
        ? forcedRoll
        : StatResolver.rollDie(20);

    const total =
      roll + baseMod + gearBonus + conditionPenalty + boonBonus + prepBonus - rushedPenalty;

    let outcome = CheckOutcome.FAILURE;
    if (roll === 20) {
      outcome = CheckOutcome.CRITICAL_SUCCESS;
    } else if (roll === 1) {
      outcome = CheckOutcome.CRITICAL_FAILURE;
    } else if (total >= dc) {
      outcome = CheckOutcome.SUCCESS;
    }

    const success =
      outcome === CheckOutcome.CRITICAL_SUCCESS || outcome === CheckOutcome.SUCCESS;

    return {
      statKey: key,
      statAspect: ASPECT_NAMES[key] || key,
      baseRoll: roll,
      baseStat,
      baseMod,
      gearBonus,
      hasInvertedArmor,
      conditionPenalty,
      conditionNames,
      boonBonus,
      boonName,
      prepBonus,
      prepItemName,
      rushedPenalty,
      rolls: [roll],
      diceSum: roll,
      statValue: baseMod + gearBonus,
      total,
      difficulty: dc,
      dc,
      success,
      outcome,
      prose: StatResolver.getOutcomeProse({ statKey: key, outcome })
    };
  }

  /**
   * Resolve a check against a target DC, incorporating pre-roll tactical bonuses and conditions.
   * @param {import('../core/ECS.js').Entity} playerEntity
   * @param {string} statKey
   * @param {number} dc
   * @param {number} [prepBonus=0]
   * @param {number|null} [forcedRoll=null]
   * @param {number} [rushedPenalty=0]
   * @param {string} [prepItemName='']
   */
  static resolveCheck(
    playerEntity,
    statKey,
    dc = 13,
    prepBonus = 0,
    forcedRoll = null,
    rushedPenalty = 0,
    prepItemName = ''
  ) {
    return StatResolver.getDetailedBreakdown(
      playerEntity,
      statKey,
      dc,
      prepBonus,
      rushedPenalty,
      forcedRoll,
      prepItemName
    );
  }

  /**
   * Check whether the player has a required item, WorldContext tag, or passive perception for a choice.
   * @param {Object} choice
   * @param {import('../core/ECS.js').Entity} playerEntity
   * @param {import('../core/ECS.js').World} world
   * @param {Object} [context]
   */
  static checkChoiceCondition(choice, playerEntity, world, context = {}) {
    // Check if player is paralyzed by Batibat sleep paralysis
    if (world && world.hasFlag('condition_bangungot_paralysis')) {
      const isPhysical =
        choice.physical ||
        (choice.check && (choice.check.stat === 'STR' || choice.check.stat === 'DEX'));
      if (isPhysical) {
        return {
          visible: true,
          allowed: false,
          reason: 'Immobilized by Batibat sleep paralysis! Wiggle your toes or pass a CON check to break free.'
        };
      }
    }

    const playerStats = playerEntity ? playerEntity.getComponent('Stats') : null;
    const playerInt =
      playerStats && typeof playerStats.INT === 'number' ? playerStats.INT : 10;

    // 1. Passive / Hidden Skill Check Requirement (WIS, INT, DEX, STR)
    if (choice.passiveRequirement) {
      const pStat = (choice.passiveRequirement.stat || 'WIS').toUpperCase();
      const pDc =
        typeof choice.passiveRequirement.dc === 'number'
          ? choice.passiveRequirement.dc
          : 12;
      let score = StatResolver.getPassiveScore(playerEntity, pStat);

      // High Intelligence lateral thinking synergy:
      // High-INT characters (INT >= 13) get +1 bonus; INT >= 15 gets +2 bonus to passive perception and lore deduction
      if (playerInt >= 15 && pStat !== 'INT') {
        score += 2;
      } else if (playerInt >= 13 && pStat !== 'INT') {
        score += 1;
      }

      if (score < pDc) {
        return {
          visible: Boolean(choice.showWhenLocked),
          allowed: false,
          isPassiveRevealed: false,
          reason: choice.lockReason || 'Requires keener instinct or senses to perceive'
        };
      }
    }

    // 2. Intelligence Mental Capacity & Tactical Formulation Gating:
    // A character's Intelligence determines how many tactical, clever, and analytical options
    // their mind can formulate in a given situation.
    // - Low Intelligence (INT <= 9): Mind operates impulsively/simply; can only conceive basic actions.
    // - Average Intelligence (INT 10-12): Standard tactical awareness.
    // - High Intelligence (INT >= 13): Sharp intellect conceives advanced, clever, and deductive actions.
    if (typeof choice.minInt === 'number') {
      if (playerInt < choice.minInt) {
        return {
          visible: Boolean(choice.showWhenLocked),
          allowed: false,
          reason:
            choice.lockReason ||
            `Requires keener intellect to conceive this tactical maneuver (INT ${choice.minInt})`
        };
      }
    }

    if (choice.complexity) {
      const complexityMap = {
        basic: 0,
        tactical: 10,
        clever: 11,
        advanced: 13,
        esoteric: 14
      };
      const reqThreshold =
        complexityMap[choice.complexity] !== undefined
          ? complexityMap[choice.complexity]
          : 10;
      if (playerInt < reqThreshold) {
        return {
          visible: Boolean(choice.showWhenLocked),
          allowed: false,
          reason: choice.lockReason || 'Mind cannot formulate this complex plan'
        };
      }
    }

    // Inferred Intelligence gating for intellectual checks:
    // If a choice requires an INT roll, low-INT characters cannot formulate high-DC deductions.
    if (
      choice.check &&
      choice.check.stat === 'INT' &&
      choice.minInt === undefined &&
      !choice.complexity
    ) {
      const inferredMinInt = Math.max(10, (choice.check.dc || 12) - 3);
      if (playerInt < inferredMinInt) {
        return {
          visible: Boolean(choice.showWhenLocked),
          allowed: false,
          reason: 'Mind cannot formulate this complex intellectual deduction'
        };
      }
    }

    // General tactical/clever actions without explicit minInt:
    // If a choice is flagged as tactical or clever, it requires at least average INT (10)
    if ((choice.tactical || choice.clever) && playerInt < 10) {
      return {
        visible: Boolean(choice.showWhenLocked),
        allowed: false,
        reason: 'Requires keener tactical focus to conceive this plan'
      };
    }

    // Check ECS condition flag requirements (e.g. 4: Inverted, 8: Blessed, 1: Bloodied, 2: Soaked)
    const flagRequirement =
      choice.requireFlag !== undefined ? choice.requireFlag : choice.requiredFlag;
    if (flagRequirement !== undefined && flagRequirement !== null) {
      if (flagRequirement === 4 || flagRequirement === ItemConditionFlags.Inverted) {
        const hasInverted = world && world.hasFlag('clothing_inside_out');
        if (!hasInverted) {
          return {
            visible: Boolean(choice.showWhenLocked),
            allowed: false,
            reason:
              choice.lockReason ||
              'Requires garment worn Inside-Out (Baliktad: Flip garment in inventory)'
          };
        }
      } else if (flagRequirement === 8 || flagRequirement === 32 || flagRequirement === ItemConditionFlags.Blessed) {
        const hasBlessed =
          world &&
          (world.hasFlag('item_blessed') ||
            world.hasFlag('boon_tala_guidance') ||
            world.hasFlag('boon_haliya_shield'));
        if (!hasBlessed) {
          return {
            visible: Boolean(choice.showWhenLocked),
            allowed: false,
            reason: choice.lockReason || 'Requires a consecrated or blessed item'
          };
        }
      } else if (flagRequirement === 1 || flagRequirement === 16 || flagRequirement === ItemConditionFlags.Bloodied) {
        const hasBloodied = world && (world.hasFlag('bloodied_blade') || world.hasFlag('bloodied'));
        if (!hasBloodied) {
          return {
            visible: Boolean(choice.showWhenLocked),
            allowed: false,
            reason: choice.lockReason || 'Requires gear bloodied from combat'
          };
        }
      } else if (flagRequirement === 2 || flagRequirement === ItemConditionFlags.Soaked) {
        const hasSoaked =
          world &&
          (world.hasFlag('condition_soaked_hypothermia') || world.hasFlag('soaked_gear'));
        if (!hasSoaked) {
          return {
            visible: Boolean(choice.showWhenLocked),
            allowed: false,
            reason: choice.lockReason || 'Requires soaked garments or gear'
          };
        }
      }
    }

    if (choice.requiresConsumable && Array.isArray(choice.allowedConsumables)) {
      const inv = playerEntity ? playerEntity.getComponent('Inventory') : null;
      const hasAnyAllowed = inv && inv.items.some((i) => choice.allowedConsumables.includes(i.id));
      if (!hasAnyAllowed) {
        return {
          visible: Boolean(choice.showWhenLocked),
          allowed: false,
          reason: choice.lockReason || `Requires one of: ${choice.allowedConsumables.join(', ')}`
        };
      }
    }

    if (choice.blockedByTag && world && world.hasFlag(choice.blockedByTag)) {
      const show = Boolean(choice.showWhenLocked);
      return {
        visible: show,
        allowed: false,
        reason: choice.lockReason || `Barred: Blocked by ${choice.blockedByTag}`
      };
    }

    if (Array.isArray(choice.blockedByTags) && choice.blockedByTags.some((t) => world && world.hasFlag(t))) {
      const show = Boolean(choice.showWhenLocked);
      return {
        visible: show,
        allowed: false,
        reason: choice.lockReason || 'Barred by active enmity or past deeds'
      };
    }

    if (choice.requiredTag) {
      const inv = playerEntity ? playerEntity.getComponent('Inventory') : null;
      const hasTag =
        (world && world.hasFlag(choice.requiredTag)) ||
        (inv && Array.isArray(inv.items) && inv.items.some((i) => i.tags && i.tags.includes(choice.requiredTag)));
      if (!hasTag) {
        const show = Boolean(choice.showWhenLocked);
        return {
          visible: show,
          allowed: false,
          reason: choice.lockReason || 'Requires specific gear or preparation'
        };
      }
    }

    if (Array.isArray(choice.requiredTags) && choice.requiredTags.length > 0) {
      const inv = playerEntity ? playerEntity.getComponent('Inventory') : null;
      const hasAll = choice.requiredTags.every((t) =>
        (world && world.hasFlag(t)) ||
        (inv && Array.isArray(inv.items) && inv.items.some((i) => i.tags && i.tags.includes(t)))
      );
      if (!hasAll) {
        const show = Boolean(choice.showWhenLocked);
        return {
          visible: show,
          allowed: false,
          reason: choice.lockReason || 'Requires specific alliances or preparations'
        };
      }
    }

    if (typeof choice.requiredPiloncitos === 'number' || typeof choice.requiredRemnants === 'number') {
      const requiredAmount = typeof choice.requiredPiloncitos === 'number' ? choice.requiredPiloncitos : choice.requiredRemnants;
      const pouch = playerEntity ? playerEntity.getComponent('Remnants') : null;
      const count = pouch ? pouch.count : 0;
      if (count < requiredAmount) {
        const show = Boolean(choice.showWhenLocked);
        return {
          visible: show,
          allowed: false,
          reason: choice.lockReason || `Requires ${requiredAmount} Piloncitos (Have: ${count})`
        };
      }
    }

    if (choice.requiredItem) {
      const inv = playerEntity ? playerEntity.getComponent('Inventory') : null;
      const hasItem =
        inv &&
        inv.items.some(
          (i) => i.id === choice.requiredItem || (i.tags && i.tags.includes(choice.requiredItem))
        );
      if (!hasItem) {
        return {
          visible: Boolean(choice.showWhenLocked),
          allowed: false,
          reason: choice.lockReason || 'Missing required tool or item'
        };
      }
    }

    return {
      visible: true,
      allowed: true,
      isPassiveRevealed: Boolean(choice.passiveRequirement),
      passiveStat: choice.passiveRequirement ? (choice.passiveRequirement.stat || 'WIS').toUpperCase() : null,
      isIntUnlocked: Boolean(typeof choice.minInt === 'number' && choice.minInt >= 13),
      reason: ''
    };
  }
}
