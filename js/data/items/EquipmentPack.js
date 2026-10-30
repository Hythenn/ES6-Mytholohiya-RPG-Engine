import { ItemRegistry } from './ItemRegistry.js';

/**
 * Pre-Colonial Philippine RPG - Equipment & Survival Item Registry
 * Strictly adheres to 14 equipment slots, Project Zomboid-inspired survival flags,
 * D&D 5e stat checks, and inside-out armor stat suppression mechanics.
 */

export const EQUIPMENT_PACK = [
  // =========================================================================
  // 1. TORSO & BODY WEARABLES (slot: 'torso')
  // =========================================================================
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
    tags: ['cloth_garment', 'starter_gear'],
    description: 'Sturdy plant-fiber tunic. Can be worn inside-out (disabling +1 CON to gain +1 WIS vs forest illusions) or ripped into cloth sheets.'
  },
  {
    id: 'carabao_hide_cuirass',
    name: 'Carabao Hide Cuirass',
    category: 'wearable',
    slot: 'torso',
    isArmor: true,
    canFlipInsideOut: true,
    canRip: false,
    insideOut: false,
    statBonuses: { CON: 2, STR: 1 },
    tags: ['leather_armor', 'heavy_wearable'],
    description: 'Thick water buffalo hide armor. Flipping inside-out breaks spirit spatial loops but disables all protective stat bonuses.'
  },
  {
    id: 'batuani_brass_breastplate',
    name: 'Batuani Engraved Brass Breastplate',
    category: 'wearable',
    slot: 'torso',
    isArmor: true,
    canFlipInsideOut: false,
    canRip: false,
    insideOut: false,
    statBonuses: { CON: 3, STR: 1 },
    tags: ['metal_armor', 'noble_gear', 'heavy_wearable'],
    description: 'Heavy cast-brass chestpiece forged by coastal smiths. Provides superior protection against physical and beast strikes.'
  },
  {
    id: 'ceremonial_malong',
    name: 'Sacred Silk-Thread Malong',
    category: 'wearable',
    slot: 'torso',
    canFlipInsideOut: true,
    canRip: true,
    ripYield: 3,
    insideOut: false,
    statBonuses: { CHA: 1, WIS: 1 },
    tags: ['cloth_garment', 'ceremonial', 'sacred_garment'],
    description: 'Multi-functional woven tube skirt worn by nobles and ritualists. Reversible for spiritual warding or tearable into 3 bandages.'
  },

  // =========================================================================
  // 2. HEADGEAR & FACE MASKS (slot: 'helmet', 'mask')
  // =========================================================================
  {
    id: 'salakot_hat',
    name: 'Woven Rattan Salakot',
    category: 'wearable',
    slot: 'helmet',
    canFlipInsideOut: true,
    canRip: false,
    insideOut: false,
    statBonuses: { CON: 1 },
    tags: ['headgear', 'weather_protection', 'rain_gear'],
    description: 'Dome-shaped woven rattan hat protecting against torrential monsoon rain and scorching sun. Inverting the lining wards off canopy spirits.'
  },
  {
    id: 'haliya_golden_mask',
    name: 'Golden Mask of Haliya',
    category: 'wearable',
    slot: 'mask',
    canFlipInsideOut: false,
    canRip: false,
    insideOut: false,
    statBonuses: { WIS: 2, CHA: 1 },
    tags: ['gold_artifact', 'sacred_ward', 'moon_relic', 'spirit_ward_item'],
    description: 'Repoussé golden face mask forged in devotion to Haliya, the masked Bicolano moon goddess who battles the Bakunawa. Repels dark curses and grants spiritual authority.'
  },
  {
    id: 'abaca_face_wrap',
    name: 'Indigo-Dyed Abaca Veil',
    category: 'wearable',
    slot: 'mask',
    canFlipInsideOut: true,
    canRip: true,
    ripYield: 1,
    insideOut: false,
    statBonuses: { DEX: 1 },
    tags: ['cloth_garment', 'stealth_gear'],
    description: 'Light cloth wrap concealing the face during nocturnal hunts. Can be worn inside-out against Tiyanak mimicry or ripped into a sheet.'
  },

  // =========================================================================
  // 3. CLOAKS, RAIN GEAR & FOOTWEAR (slot: 'cape', 'boots', 'leggings')
  // =========================================================================
  {
    id: 'anahaw_rain_cape',
    name: 'Anahaw Palm Leaf Mantle',
    category: 'wearable',
    slot: 'cape',
    canFlipInsideOut: true,
    canRip: true,
    ripYield: 2,
    insideOut: false,
    statBonuses: { CON: 1 },
    tags: ['rain_gear', 'plant_fiber'],
    description: 'Layered palm frond mantle shedding monsoon downpours. Inverting the weave confuses spatial loops in Bamboo Thickets.'
  },
  {
    id: 'woven_bahag_loincloth',
    name: 'Indigo Woven Bahag',
    category: 'wearable',
    slot: 'leggings',
    canFlipInsideOut: true,
    canRip: true,
    ripYield: 1,
    insideOut: false,
    statBonuses: { DEX: 1 },
    tags: ['cloth_garment', 'starter_gear'],
    description: 'Traditional woven loincloth granting high agility in thick jungle brush. Inverting grants illusion resistance.'
  },
  {
    id: 'carabao_leather_sandals',
    name: 'Carabao Leather Sandals',
    category: 'wearable',
    slot: 'boots',
    canFlipInsideOut: false,
    canRip: false,
    insideOut: false,
    statBonuses: { DEX: 1 },
    tags: ['footwear', 'leather'],
    description: 'Tough hide footwear preventing foot wounds from marurugi thorn bushes and sharp coral rocks.'
  },

  // =========================================================================
  // 4. ARMGUARDS, GLOVES & BELTS (slot: 'armguards', 'gloves', 'belt')
  // =========================================================================
  {
    id: 'brass_vambraces',
    name: 'Engraved Brass Vambraces',
    category: 'wearable',
    slot: 'armguards',
    isArmor: true,
    canFlipInsideOut: false,
    canRip: false,
    insideOut: false,
    statBonuses: { STR: 1 },
    tags: ['metal_armor', 'combat_gear'],
    description: 'Protective metal armguards deflecting glancing claw strikes and parrying blade edges.'
  },
  {
    id: 'abaca_hand_wraps',
    name: 'Woven Abaca Grip Wraps',
    category: 'wearable',
    slot: 'gloves',
    canFlipInsideOut: true,
    canRip: true,
    ripYield: 1,
    insideOut: false,
    statBonuses: { DEX: 1 },
    tags: ['cloth_garment', 'weapon_grip'],
    description: 'Textured palm wraps improving weapon hold and arrow draws. Can be unwrapped into emergency bandages.'
  },
  {
    id: 'babaylan_sash',
    name: 'Consecrated Babaylan Sash',
    category: 'wearable',
    slot: 'belt',
    canFlipInsideOut: true,
    canRip: true,
    ripYield: 1,
    insideOut: false,
    statBonuses: { WIS: 1 },
    tags: ['ritual_gear', 'sacred_garment', 'has_rope_or_sheets'],
    description: 'Ritual waist sash woven with sacred motifs and anointed with Lana oil. Enhances spiritual resonance.'
  },

  // =========================================================================
  // 5. AMULETS, RINGS & SACRED NECKLACES (slot: 'necklace', 'ring')
  // =========================================================================
  {
    id: 'mutya_ng_saging',
    name: 'Agimat Mutya ng Saging',
    category: 'wearable',
    slot: 'necklace',
    canFlipInsideOut: false,
    canRip: false,
    statBonuses: { STR: 2, DEX: 1 },
    tags: ['agimat', 'sacred_relic', 'mystic_pendant', 'wearing_agimat'],
    description: 'Luminous pearl captured from the heart of a flowering banana tree at midnight. Bestows supernatural strength and speed.'
  },
  {
    id: 'anting_anting_brass_pendant',
    name: 'Triangle Brass Anting-Anting',
    category: 'wearable',
    slot: 'necklace',
    canFlipInsideOut: false,
    canRip: false,
    statBonuses: { WIS: 2, INT: 1 },
    tags: ['agimat', 'sacred_relic', 'folk_ward', 'wearing_agimat', 'spirit_ward_item'],
    description: 'Engraved bronze talisman inscribed with esoteric script. Wards off dark spellcasting, curses, and spirit trances.'
  },
  {
    id: 'black_coral_ring',
    name: 'Black Coral Ring of Magindara',
    category: 'wearable',
    slot: 'ring',
    canFlipInsideOut: false,
    canRip: false,
    statBonuses: { WIS: 1, CHA: 1 },
    tags: ['ocean_relic', 'coral_jewelry'],
    description: 'Harvested from abyssal reef depths. Grants marine spirit resonance and protection against ocean undertows.'
  },
  {
    id: 'gold_calamansanay_band',
    name: 'Pre-Colonial Cast Gold Signet',
    category: 'wearable',
    slot: 'ring',
    canFlipInsideOut: false,
    canRip: false,
    statBonuses: { CHA: 2 },
    tags: ['gold_artifact', 'noble_gear'],
    description: 'Ornate gold band crafted using the lost-wax technique. Signifies high rank among Kadatoan chieftains.'
  },

  // =========================================================================
  // 6. PRIMARY WEAPONS (slot: 'primary')
  // =========================================================================
  {
    id: 'kampilan_sword',
    name: 'Kampilan Spike-Tip Longsword',
    category: 'weapon',
    slot: 'primary',
    statBonuses: { STR: 2, DEX: 1 },
    tags: ['slashing_weapon', 'iron_blade', 'heavy_primary', 'armed_blade', 'sharp_tool'],
    description: 'Single-edged longsword featuring a carved crocodile-head hilt and bifurcated blade tip. Devastating cleaving strikes.'
  },
  {
    id: 'kris_blade',
    name: 'Wavy Serpent Kris Dagger',
    category: 'weapon',
    slot: 'primary',
    statBonuses: { DEX: 2, STR: 1 },
    tags: ['piercing_weapon', 'serpent_blade', 'noble_weapon', 'armed_blade', 'sharp_tool'],
    description: 'Serpentine waved blade designed for fluid thrusts and parries. Inflicts severe lacerations.'
  },
  {
    id: 'bagacay_bamboo_spear',
    name: 'Fire-Hardened Bagacay Bamboo Spear',
    category: 'weapon',
    slot: 'primary',
    statBonuses: { STR: 1, DEX: 1 },
    tags: ['bamboo_weapon', 'aswang_repellent', 'starter_weapon', 'aswang_bane'],
    description: 'Sharpened bamboo spear tempered in hardwood embers. Emits high-frequency resonance that frightens Aswang stalkers.'
  },

  // =========================================================================
  // 7. OFFHAND TOOLS & SHIELDS (slot: 'offhand')
  // =========================================================================
  {
    id: 'kalasag_wooden_shield',
    name: 'Carved Hardwood Kalasag Shield',
    category: 'tool',
    slot: 'offhand',
    isArmor: true,
    statBonuses: { CON: 2 },
    tags: ['shield', 'wooden_gear', 'shield_guard'],
    description: 'Rectangular hardwood shield reinforced with rattan binding. Deflects incoming arrows and beast lunges.'
  },
  {
    id: 'bamboo_torch',
    name: 'Resin-Soaked Bamboo Torch',
    category: 'tool',
    slot: 'offhand',
    usable: true,
    useActionLabel: 'Ignite Torch',
    statBonuses: {},
    tags: ['light_source', 'fire_tool', 'has_light_source'],
    description: 'Bamboo casing packed with tree resin. Illuminates dark jungle paths and repels nocturnal pests.'
  },
  {
    id: 'brass_agung_gong',
    name: 'Bronze Agung Gong',
    category: 'tool',
    slot: 'offhand',
    usable: true,
    useActionLabel: 'Strike Gong',
    statBonuses: { WIS: 1 },
    tags: ['acoustic_shock', 'bakunawa_ward', 'ritual_instrument'],
    description: 'Heavy wide-rimmed bronze gong. Striking it creates powerful acoustic shockwaves that drive off Bakunawa during eclipses.'
  },

  // =========================================================================
  // 8. PROJECT ZOMBOID SURVIVAL & MEDICAL SUPPLIES
  // =========================================================================
  {
    id: 'ripped_sheets',
    name: 'Ripped Cloth Sheets',
    category: 'material',
    slot: null,
    usable: true,
    useActionLabel: 'Apply Bandage',
    canCombineWithSheet: false,
    tags: ['bandage', 'medical_supply', 'has_rope_or_sheets', 'bandage_item'],
    description: 'Clean cloth strips torn from garments. Stops bleeding wounds and prevents dirt infection.'
  },
  {
    id: 'bayabas_herbs',
    name: 'Crushed Guava (Bayabas) Leaves',
    category: 'material',
    slot: null,
    usable: true,
    useActionLabel: 'Apply Antiseptic',
    canCombineWithSheet: true,
    tags: ['herbal_medicine', 'antiseptic', 'medicinal_herb'],
    description: 'Astringent guava leaves. Can be applied directly or combined with a Ripped Sheet to craft a Herbal Poultice.'
  },
  {
    id: 'blessed_lana_vial',
    name: 'Sacred Coconut Oil (Lana) Vial',
    category: 'medical',
    slot: null,
    usable: true,
    useActionLabel: 'Anoint Self',
    canCombineWithSheet: true,
    tags: ['blessed_oil', 'aswang_ward', 'medical_supply', 'spirit_oil'],
    description: 'Coconut oil infused with medicinal roots and consecrated by a Babaylan. Cures infection and bubbles when near an Aswang.'
  },
  {
    id: 'herbal_poultice',
    name: 'Bayabas & Lana Herbal Poultice',
    category: 'medical',
    slot: null,
    usable: true,
    useActionLabel: 'Apply Poultice',
    canCombineWithSheet: false,
    tags: ['crafted_medical', 'healing_salve', 'bandage_item'],
    description: 'Crafted from guava leaves, blessed Lana oil, and cloth sheets. Rapidly seals deep wounds and cures bloodborne rot.'
  },
  {
    id: 'coarse_salt_pouch',
    name: 'Pouch of Coarse Sea Salt',
    category: 'material',
    slot: null,
    usable: true,
    useActionLabel: 'Scatter Salt',
    canCombineWithSheet: false,
    tags: ['salt_ward', 'aswang_counter', 'aswang_bane'],
    description: 'Unrefined sea salt harvested from coastal flats. Burning or scattering salt destroys Manananggal lower torsos and wards Wakwak birds.'
  }
];

/**
 * Helper to bulk register the equipment pack into the ItemRegistry.
 */
export function registerAllEquipment() {
  if (typeof ItemRegistry !== 'undefined' && ItemRegistry.registerItemPack) {
    ItemRegistry.registerItemPack(EQUIPMENT_PACK);
  }
}

registerAllEquipment();

