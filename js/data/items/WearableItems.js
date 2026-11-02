/**
 * WearableItems.js
 * Headgear, masks, capes, torso garments, armguards, gloves, belts,
 * leggings, boots, rings, and necklaces for the 14 equipment slots.
 * Includes Project Zomboid-style cloth ripping and Philippine folklore
 * "Baliktad" (wear inside-out) garment mechanics.
 */

import { ItemRegistry } from '../../mechanics/ItemRegistry.js';

ItemRegistry.registerItemPack([
  // 1. HELMET SLOT
  {
    id: 'salakot_hat',
    name: 'Woven Nipa Salakot',
    category: 'wearable',
    slot: 'helmet',
    statBonuses: { WIS: 1 },
    tags: ['rain_gear'],
    description:
      'Wide-brimmed bamboo and nipa palm hat that sheds monsoon downpours and shades the eyes.'
  },
  {
    id: 'carabao_horn_helm',
    name: 'Carabao-Horn War Cap',
    category: 'wearable',
    slot: 'helmet',
    statBonuses: { CON: 1, STR: 1 },
    tags: ['armor_heavy'],
    description:
      'Boiled rawhide skullcap reinforced with curved water-buffalo horn plates.'
  },

  // 2. MASK SLOT
  {
    id: 'anito_wood_mask',
    name: 'Carved Anito Visage',
    category: 'wearable',
    slot: 'mask',
    statBonuses: { CHA: 1, WIS: 1 },
    tags: ['spirit_ward_item'],
    description:
      'Charred kamagong mask painted with white lime to hide mortal breath from wandering spirits.'
  },
  {
    id: 'ash_cloth_wrap',
    name: 'Ash-Dusted Face Wrap',
    category: 'wearable',
    slot: 'mask',
    canRip: true,
    ripYield: 1,
    statBonuses: { CON: 1 },
    tags: ['cloth_garment'],
    description:
      'Strip of dyed abaca tied across the nose and mouth to filter swamp miasma. Can be ripped into a cloth sheet.'
  },

  // 3. CAPE SLOT
  {
    id: 'waxed_rain_cape',
    name: 'Beeswaxed Taro-Fiber Cape',
    category: 'wearable',
    slot: 'cape',
    canFlipInsideOut: true,
    canRip: true,
    ripYield: 2,
    insideOut: false,
    statBonuses: { CON: 1 },
    tags: ['cloth_garment', 'rain_gear'],
    description:
      'Heavy weatherproof shoulder mantle woven from taro fiber and sealed with beeswax.'
  },
  {
    id: 'cogon_stalker_cloak',
    name: 'Braided Cogon Camouflage Cloak',
    category: 'wearable',
    slot: 'cape',
    canFlipInsideOut: true,
    canRip: true,
    ripYield: 2,
    insideOut: false,
    statBonuses: { DEX: 1 },
    tags: ['cloth_garment'],
    description:
      'Layered marsh-grass mantle that blends into tall reeds.'
  },

  // 4. TORSO SLOT
  {
    id: 'abaca_tunic',
    name: 'Woven Abaca Baro Tunic',
    category: 'wearable',
    slot: 'torso',
    canFlipInsideOut: true,
    canRip: true,
    ripYield: 2,
    insideOut: false,
    statBonuses: { CON: 1 },
    tags: ['cloth_garment'],
    description:
      'Sturdy plant-fiber shirt with traditional woven seams.'
  },
  {
    id: 'patched_sack_shirt',
    name: 'Patched Hemp Rag-Tunic',
    category: 'wearable',
    slot: 'torso',
    canFlipInsideOut: true,
    canRip: true,
    ripYield: 2,
    insideOut: false,
    statBonuses: {},
    tags: ['cloth_garment'],
    description:
      'Threadbare hemp tunic salvaged from the outer ditches.'
  },
  {
    id: 'royal_silk_malong',
    name: 'Gilded Torogan Silk Malong',
    category: 'wearable',
    slot: 'torso',
    canFlipInsideOut: true,
    canRip: true,
    ripYield: 3,
    insideOut: false,
    statBonuses: { CHA: 2 },
    tags: ['cloth_garment', 'royal_garb'],
    description:
      'Heirloom tubular silk wrap threaded with Maranao gold leaf.'
  },

  // 5. ARMGUARDS SLOT
  {
    id: 'rattan_armguards',
    name: 'Braided Rattan Vambraces',
    category: 'wearable',
    slot: 'armguards',
    statBonuses: { DEX: 1 },
    tags: ['armor_light'],
    description:
      'Hardened rattan cuffs that deflect fangs and blade slashes along the forearms.'
  },

  // 6. GLOVES SLOT
  {
    id: 'boar_hide_gloves',
    name: 'Boar-Hide Grip Wraps',
    category: 'wearable',
    slot: 'gloves',
    statBonuses: { STR: 1 },
    tags: ['grip_gear'],
    description:
      'Coarse leather wraps that protect palms from thorns, rope burn, and wet steel.'
  },

  // 7. BELT SLOT
  {
    id: 'hemp_utility_belt',
    name: 'Braided Hemp Tool-Sash',
    category: 'wearable',
    slot: 'belt',
    canRip: true,
    ripYield: 1,
    statBonuses: { CON: 1 },
    tags: ['has_rope_or_sheets'],
    description:
      'Thick waist-cord knotted to carry pouches or serve as emergency lashing in river crossings.'
  },

  // 8. LEGGINGS SLOT
  {
    id: 'cotton_bahag_leggings',
    name: 'Indigo-Dyed Travel Trousers',
    category: 'wearable',
    slot: 'leggings',
    canFlipInsideOut: true,
    canRip: true,
    ripYield: 2,
    insideOut: false,
    statBonuses: { DEX: 1 },
    tags: ['cloth_garment'],
    description:
      'Flexible woven trousers stained with wild indigo.'
  },

  // 9. BOOTS SLOT
  {
    id: 'rawhide_sandals',
    name: 'Carabao-Hide Trail Sandals',
    category: 'wearable',
    slot: 'boots',
    statBonuses: { DEX: 1 },
    tags: ['foot_gear'],
    description:
      'Thick soles lashed with sinew to guard against sharp coral, mud-spines, and barnacles.'
  },

  // 10 & 11. RING SLOTS (ring1 / ring2)
  {
    id: 'iron_nail_ring',
    name: 'Bent Coffin-Iron Ring',
    category: 'wearable',
    slot: 'ring',
    statBonuses: { STR: 1 },
    tags: ['cold_iron'],
    description:
      'Forged from a rusted ship spike; cold iron burns shapeshifter flesh on contact.'
  },
  {
    id: 'dugong_bone_ring',
    name: 'Carved Dugong-Rib Ring',
    category: 'wearable',
    slot: 'ring',
    statBonuses: { INT: 1 },
    tags: ['sea_charm'],
    description:
      'Etched with tidal Baybayin script by coastal navigators.'
  },

  // 12. NECKLACE SLOT
  {
    id: 'tanso_agimat',
    name: 'Tanso Agimat Amulet',
    category: 'wearable',
    slot: 'necklace',
    statBonuses: { WIS: 2 },
    tags: ['wearing_agimat'],
    description:
      'Inscribed bronze talisman on a red cord; hums faintly when unseen spirits draw near.'
  },
  {
    id: 'gold_linglingo',
    name: 'Heirloom Gold Lingling-o',
    category: 'wearable',
    slot: 'necklace',
    statBonuses: { CHA: 2, WIS: 1 },
    tags: ['wearing_agimat', 'royal_garb'],
    description:
      'Ancient penannular gold pendant of dynastic blood.'
  },

  // 13. TEMPORAL RELICS
  {
    id: 'spanish_morion_helmet',
    name: 'Spanish Morion Steel Helmet',
    category: 'wearable',
    slot: 'head',
    statBonuses: { CON: 1, CHA: 1 },
    tags: ['armor_heavy', 'steel_forged', 'temporal_relic'],
    description:
      'A high-crested comb morion forged of 16th-century Toledo steel, gifted by the displaced guard Gil Perez.'
  },
  {
    id: 'spanish_steel_cuirass',
    name: 'Spanish Steel Breastplate',
    category: 'wearable',
    slot: 'body',
    statBonuses: { CON: 2, STR: 1 },
    tags: ['armor_heavy', 'steel_forged', 'temporal_relic'],
    description:
      'Polished steel cuirass of the Manila Governor Palace Guard, impenetrable to primitive arrows and animal claws.'
  }
]);

