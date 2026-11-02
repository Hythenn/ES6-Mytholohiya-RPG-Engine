/**
 * js/mechanics/FactionManager.js
 *
 * Core Faction and Moral Alignment System for Mytholohiya.
 * Tracks the 5 Core Human Factions of the Archipelago:
 * 1. The Kota Rajahnate (Coastal Palisade Forts & Datus)
 * 2. The Sisterhood of the Baliana / Babaylan (Priestesses & Spirit Wardens)
 * 3. The Karakoa Sea-Raider Brotherhood (Timawa Pirates)
 * 4. The Secret Lineage of the Night (Aswang-Infiltrated Settlements)
 * 5. The Mountain Headhunters (Cordillera & Inland Braves)
 *
 * Provides standing evaluations, moral consequence tracking, and narrative tag helpers.
 */

export const FACTION_DEFINITIONS = {
  rajahnate: {
    id: 'rajahnate',
    name: 'The Kota Rajahnate',
    subtitle: 'Coastal Palisade Forts & Datus',
    icon: '🏰',
    profile:
      'Fortified coastal trading hubs dealing in Chinese porcelain, brass cannons (Lantaka), iron weapons, and gold ingots.',
    allyTag: 'rep_rajahnate_ally',
    enemyTag: 'rep_rajahnate_enemy',
    benefits:
      'Free access to Kota blacksmiths, safe haven during nocturnal hunts, Bagani guards helping in combat.',
    penalties:
      'Palisade archers shoot on sight, elite bounty hunters track you down across biomes.'
  },
  babaylan: {
    id: 'babaylan',
    name: 'The Sisterhood of the Baliana / Babaylan',
    subtitle: 'Secluded Priestesses & Spirit Wardens',
    icon: '🌿',
    profile:
      'Secluded herbalists, medium priestesses, and spirit wardens conducting sacred Santigwar cleansing rituals.',
    allyTag: 'rep_babaylan_ally',
    enemyTag: 'rep_babaylan_enemy',
    benefits:
      'Free medical healing, consecrated Blessed items, spirit curse removals.',
    penalties:
      'Refuse to treat InfectedBite or Bangungot paralysis; place ancestral spirit banes on your path.'
  },
  karakoa: {
    id: 'karakoa',
    name: 'The Karakoa Sea-Raider Brotherhood',
    subtitle: 'Timawa Pirates & River Corsairs',
    icon: '⛵',
    profile:
      'Brutal coastal raiders operating swift war-boats (Karakoa). They trade in black-market loot and captured slaves (Alipin).',
    allyTag: 'rep_karakoa_ally',
    enemyTag: 'rep_karakoa_enemy',
    benefits:
      'Smuggling trade routes, high-paying mercenary contracts, rare single-edged Kampilan swords.',
    penalties:
      'River barricades, lethal ambushes by master swordmasters, slave-trap nets.'
  },
  aswang_cult: {
    id: 'aswang_cult',
    name: 'The Secret Lineage of the Night',
    subtitle: 'Aswang-Infiltrated Village',
    icon: '🌑',
    profile:
      'Human villagers and Datus who secretly practice nocturnal transformations. By day, they operate peaceful rice-milling settlements.',
    allyTag: 'rep_aswang_cult_ally',
    enemyTag: 'rep_aswang_cult_enemy',
    benefits:
      'Sacrificial gold, nocturnal immunity, access to dark alchemy (Lana oils).',
    penalties:
      'Nighttime camp raids, poisoned food during village feasts, quiet betrayals in dark huts.'
  },
  headhunters: {
    id: 'headhunters',
    name: 'The Mountain Headhunters',
    subtitle: 'Cordillera & Inland Braves',
    icon: '⛰',
    profile:
      'Territorial inland tribes guarding sacred copper mines and high mountain passes.',
    allyTag: 'rep_headhunters_ally',
    enemyTag: 'rep_headhunters_enemy',
    benefits:
      'Safe mountain passage, rare herbal salves, animal-taming companions.',
    penalties:
      'Punji stick traps, poisoned blowdart ambushes, headhunting trophies.'
  }
};

export const MORAL_MARKS = {
  stole_shrine_gold: {
    tag: 'stole_shrine_gold',
    name: 'Desecrator of the Anito',
    tone: 'hostile',
    desc: 'You plundered gold offerings from a sacred Babaylan altar. Anito spirits mark you with wrath.'
  },
  cursed_by_anito: {
    tag: 'cursed_by_anito',
    name: 'Cursed by Ancestral Spirits',
    tone: 'hostile',
    desc: 'Ancestral nature spirits haunt your steps, increasing spirit fever and nocturnal nightmares.'
  },
  merc_contract_fulfilled: {
    tag: 'merc_contract_fulfilled',
    name: 'Timawa Oath-Bound',
    tone: 'ally',
    desc: 'You executed a high-paying mercenary contract for the Karakoa corsairs. The sea-raiders respect your blade.'
  },
  bounty_on_head: {
    tag: 'bounty_on_head',
    name: 'Rajahnate Bounty Target',
    tone: 'hostile',
    desc: 'Datu Dula has issued an iron bounty decree against you. Armed Bagani trackers pursue you.'
  },
  defied_sea_raiders: {
    tag: 'defied_sea_raiders',
    name: 'Liberator of Slaves',
    tone: 'ally',
    desc: 'You freed captured Alipin slaves and defied the Karakoa pirate captains.'
  },
  mountain_truce: {
    tag: 'mountain_truce',
    name: 'Blood-Truce of the Karst',
    tone: 'ally',
    desc: 'You honored the mountain braves with sacred tobacco and blood rites, earning safe mountain passage.'
  },
  night_lineage_initiate: {
    tag: 'night_lineage_initiate',
    name: 'Initiate of the Dark Lineage',
    tone: 'ally',
    desc: 'You entered a dark pact with the disguised elders of Barrio Silim, gaining dark alchemical access.'
  }
};

export class FactionManager {
  /**
   * Determine the current standing of an entity with a specific faction.
   * @param {import('../core/ECS.js').World} world
   * @param {string} factionId
   * @returns {{ standing: 'ALLIED' | 'HOSTILE' | 'NEUTRAL', statusClass: string, label: string }}
   */
  static getStanding(world, factionId) {
    const faction = FACTION_DEFINITIONS[factionId];
    if (!faction || !world) {
      return { standing: 'NEUTRAL', statusClass: 'neutral', label: 'Neutral' };
    }

    if (world.hasFlag(faction.enemyTag) || (factionId === 'rajahnate' && world.hasFlag('bounty_on_head')) || (factionId === 'babaylan' && world.hasFlag('stole_shrine_gold'))) {
      return { standing: 'HOSTILE', statusClass: 'hostile', label: 'Hostile' };
    }

    if (world.hasFlag(faction.allyTag) || (factionId === 'karakoa' && world.hasFlag('merc_contract_fulfilled')) || (factionId === 'headhunters' && world.hasFlag('mountain_truce')) || (factionId === 'aswang_cult' && world.hasFlag('night_lineage_initiate'))) {
      return { standing: 'ALLIED', statusClass: 'allied', label: 'Allied' };
    }

    return { standing: 'NEUTRAL', statusClass: 'neutral', label: 'Neutral' };
  }

  /**
   * Get standings for all 5 core human factions.
   * @param {import('../core/ECS.js').World} world
   * @returns {Array<Object>}
   */
  static getAllStandings(world) {
    return Object.values(FACTION_DEFINITIONS).map((def) => {
      const standingInfo = FactionManager.getStanding(world, def.id);
      return {
        ...def,
        ...standingInfo
      };
    });
  }

  /**
   * Return any active permanent moral consequence marks on the player.
   * @param {import('../core/ECS.js').World} world
   * @returns {Array<Object>}
   */
  static getActiveMoralMarks(world) {
    if (!world) return [];
    const active = [];
    for (const [tagKey, markDef] of Object.entries(MORAL_MARKS)) {
      if (world.hasFlag(tagKey) || world.hasFlag(markDef.tag)) {
        active.push(markDef);
      }
    }
    return active;
  }
}

