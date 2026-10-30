/**
 * StatResolver.js
 * Resolves Baldur's Gate style attribute checks (Strength, Dexterity,
 * Constitution, Intelligence, Wisdom, Charisma) behind the scenes while
 * providing diegetic descriptions and evaluating item/gear choice requirements.
 */

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
    const aspect = ASPECT_NAMES[key] || key;
    const statsComp = playerEntity ? playerEntity.getComponent('Stats') : null;
    const rawStat = statsComp && typeof statsComp[key] === 'number' ? statsComp[key] : 10;
    const mod = StatResolver.getModifier(rawStat);

    const needed = dc - mod;

    if (needed <= 8) {
      return `${aspect} // Favored`;
    }
    if (needed <= 11) {
      return `${aspect} // Measured test`;
    }
    if (needed <= 14) {
      return `${aspect} // Perilous`;
    }
    return `${aspect} // Courting ruin`;
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
   * Resolve a check against a target DC.
   * @param {import('../core/ECS.js').Entity} playerEntity
   * @param {string} statKey
   * @param {number} dc
   */
  static resolveCheck(playerEntity, statKey, dc = 13) {
    const key = String(statKey || 'WIS').toUpperCase();
    const statsComp = playerEntity ? playerEntity.getComponent('Stats') : null;
    const rawStat = statsComp && typeof statsComp[key] === 'number' ? statsComp[key] : 10;
    let statMod = StatResolver.getModifier(rawStat);

    if (playerEntity && playerEntity.world && playerEntity.world.hasFlag('wounded')) {
      statMod -= 1;
    }

    const roll = StatResolver.rollDie(20);
    const total = roll + statMod;

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
      statValue: statMod,
      rolls: [roll],
      diceSum: roll,
      total,
      difficulty: dc,
      success,
      outcome,
      prose: StatResolver.getOutcomeProse({ statKey: key, outcome })
    };
  }

  /**
   * Check whether the player has a required item or WorldContext tag for a special choice.
   * @param {Object} choice
   * @param {import('../core/ECS.js').Entity} playerEntity
   * @param {import('../core/ECS.js').World} world
   */
  static checkChoiceCondition(choice, playerEntity, world) {
    if (choice.requiredTag) {
      const hasTag = world && world.hasFlag(choice.requiredTag);
      if (!hasTag) {
        return {
          visible: Boolean(choice.showWhenLocked),
          allowed: false,
          reason: choice.lockReason || 'Requires specific gear or preparation'
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

    return { visible: true, allowed: true, reason: '' };
  }
}
