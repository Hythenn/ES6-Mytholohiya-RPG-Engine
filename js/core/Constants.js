/**
 * js/core/Constants.js
 * Central architecture constants, phases, weather states, time of day,
 * environment biomes, equipment slots, item categories, and ECS condition flags.
 */

export const PHASES = Object.freeze({
  EARLY_GAME: 'EARLY_GAME',
  MID_GAME: 'MID_GAME',
  LATE_GAME: 'LATE_GAME'
});

export const PHASE_ORDER = Object.freeze([
  PHASES.EARLY_GAME,
  PHASES.MID_GAME,
  PHASES.LATE_GAME
]);

export const STATS = Object.freeze({
  STR: 'STR',
  DEX: 'DEX',
  CON: 'CON',
  INT: 'INT',
  WIS: 'WIS',
  CHA: 'CHA'
});

export const STAT_LIST = Object.freeze([
  STATS.STR,
  STATS.DEX,
  STATS.CON,
  STATS.INT,
  STATS.WIS,
  STATS.CHA
]);

export const WEATHER = Object.freeze({
  CLEAR: 'CLEAR',
  DRIZZLE: 'DRIZZLE',
  MONSOON: 'MONSOON',
  SPIRIT_FOG: 'SPIRIT FOG',
  'SPIRIT FOG': 'SPIRIT FOG',
  // Lowercase aliases for direct lookup
  clear: 'CLEAR',
  drizzle: 'DRIZZLE',
  monsoon: 'MONSOON',
  spirit_fog: 'SPIRIT FOG'
});

export const VALID_WEATHERS = Object.freeze([
  WEATHER.CLEAR,
  WEATHER.DRIZZLE,
  WEATHER.MONSOON,
  WEATHER.SPIRIT_FOG
]);

export const TIME_OF_DAY = Object.freeze({
  DAWN: 'DAWN',
  DAY: 'DAY',
  DUSK: 'DUSK',
  NIGHT: 'NIGHT',
  ECLIPSE: 'ECLIPSE',
  // Lowercase and semantic aliases
  dawn: 'DAWN',
  day: 'DAY',
  dusk: 'DUSK',
  night: 'NIGHT',
  eclipse: 'ECLIPSE',
  midnight: 'NIGHT',
  MIDNIGHT: 'NIGHT',
  'pre-dawn': 'DAWN',
  'PRE-DAWN': 'DAWN',
  pre_dawn: 'DAWN',
  PRE_DAWN: 'DAWN'
});

export const TIME_OF_DAY_CYCLE = Object.freeze([
  TIME_OF_DAY.DAWN,
  TIME_OF_DAY.DAY,
  TIME_OF_DAY.DUSK,
  TIME_OF_DAY.NIGHT
]);

export const ENVIRONMENTS = Object.freeze({
  WILDERNESS: 'WILDERNESS',
  COAST: 'COAST',
  MANGROVE: 'MANGROVE',
  BALETE: 'BALETE',
  TERRACES: 'TERRACES',
  RUINS: 'RUINS',
  MAW: 'MAW',
  VILLAGE: 'VILLAGE',
  CABIN: 'CABIN',
  TENT: 'TENT',
  CITY: 'CITY',
  OUTDOOR: 'WILDERNESS',
  // Lowercase aliases for direct lookup
  wilderness: 'WILDERNESS',
  coast: 'COAST',
  mangrove: 'MANGROVE',
  balete: 'BALETE',
  terraces: 'TERRACES',
  ruins: 'RUINS',
  maw: 'MAW',
  village: 'VILLAGE',
  cabin: 'CABIN',
  tent: 'TENT',
  city: 'CITY',
  outdoor: 'WILDERNESS'
});

export const ENVIRONMENT_DISPLAY_LABELS = Object.freeze({
  WILDERNESS: 'WILDERNESS',
  COAST: 'COAST & REEF',
  MANGROVE: 'MANGROVE SWAMP',
  BALETE: 'BALETE GROVE',
  TERRACES: 'HIGHLAND TERRACES',
  RUINS: 'ANCIENT RUINS',
  MAW: 'ABYSSAL MAW',
  VILLAGE: 'BARANGAY SETTLEMENT',
  CABIN: 'BAHAY KUBO',
  TENT: 'FIELD TENT',
  CITY: 'KINGDOM & PORT',
  OUTDOOR: 'WILDERNESS'
});

export const VALID_ENVIRONMENTS = Object.freeze([
  ENVIRONMENTS.WILDERNESS,
  ENVIRONMENTS.COAST,
  ENVIRONMENTS.MANGROVE,
  ENVIRONMENTS.BALETE,
  ENVIRONMENTS.TERRACES,
  ENVIRONMENTS.RUINS,
  ENVIRONMENTS.MAW,
  ENVIRONMENTS.VILLAGE,
  ENVIRONMENTS.CABIN,
  ENVIRONMENTS.TENT,
  ENVIRONMENTS.CITY
]);

export const EQUIP_SLOTS = Object.freeze({
  HELMET: 'helmet',
  MASK: 'mask',
  CAPE: 'cape',
  TORSO: 'torso',
  ARMGUARDS: 'armguards',
  GLOVES: 'gloves',
  BELT: 'belt',
  LEGGINGS: 'leggings',
  BOOTS: 'boots',
  RING: 'ring',
  NECKLACE: 'necklace',
  PRIMARY: 'primary',
  OFFHAND: 'offhand',
  // Lowercase aliases for direct string lookup
  helmet: 'helmet',
  mask: 'mask',
  cape: 'cape',
  torso: 'torso',
  armguards: 'armguards',
  gloves: 'gloves',
  belt: 'belt',
  leggings: 'leggings',
  boots: 'boots',
  ring: 'ring',
  necklace: 'necklace',
  primary: 'primary',
  offhand: 'offhand'
});

export const EQUIP_SLOT_LIST = Object.freeze([
  'helmet',
  'mask',
  'cape',
  'torso',
  'armguards',
  'gloves',
  'belt',
  'leggings',
  'boots',
  'ring',
  'necklace',
  'primary',
  'offhand'
]);

export const ITEM_CATEGORIES = Object.freeze({
  WEARABLE: 'wearable',
  WEAPON: 'weapon',
  TOOL: 'tool',
  MEDICAL: 'medical',
  MATERIAL: 'material',
  // Lowercase aliases for direct string lookup
  wearable: 'wearable',
  weapon: 'weapon',
  tool: 'tool',
  medical: 'medical',
  material: 'material'
});

export const ITEM_CATEGORY_LIST = Object.freeze([
  'wearable',
  'weapon',
  'tool',
  'medical',
  'material'
]);

/**
 * ECS Item Condition bitmask flags.
 * Used for requireFlag checks in scenarios and dynamic equipment status.
 */
export const ITEM_FLAGS = Object.freeze({
  None: 0,
  Wet: 1 << 0,       // 1: Dampened by drizzle/monsoon; reduces fire damage, minor DEX penalty in mud
  Soaked: 1 << 1,    // 2: -1 DEX in mud; extinguishes fire attacks; risk of hypothermia
  Inverted: 1 << 2,  // 4: Inside-out garment; +1 WIS vs spirit disorientation/loops
  Torn: 1 << 3,      // 8: Damaged fabric or leather; reduced defense until patched
  Bloodied: 1 << 4,  // 16: Increases Spirit Scent / Danger Heat by +5 per node
  Blessed: 1 << 5,   // 32: Consecrated via Babaylan Atang ritual; wards curses and shadows
  Cursed: 1 << 6     // 64: Spirit-afflicted item; drains willpower or attracts malevolent anito
});

// Backward-compatible alias for existing imports
export const ItemConditionFlags = ITEM_FLAGS;

/**
 * Standard Project Zomboid-inspired survival status condition identifiers.
 */
export const STATUS_CONDITIONS = Object.freeze({
  Bleeding: 'bleeding_wound',
  InfectedBite: 'infected_aswang_bite',
  Bangungot: 'bangungot_paralysis',
  Soaked: 'soaked_hypothermia'
});

/**
 * Global Danger Heat (Spirit Scent / Panganib) meter thresholds.
 */
export const DANGER_TIERS = Object.freeze({
  TAHIMIK: { min: 0, max: 24, label: 'Serene', color: '#4ade80' },
  LIGAW: { min: 25, max: 49, label: 'Unsettled', color: '#facc15' },
  AMOY_DUGO: { min: 50, max: 74, label: 'Blood Scent', color: '#fb923c' },
  PANGANIB: { min: 75, max: 100, label: 'Hunted', color: '#ef4444' }
});

/**
 * XP Cap progression: starts at 15 for Level 1, incrementing by 1.8x per level (rounded up).
 */
export const BASE_XP_CAP = 15;
export const XP_GROWTH_FACTOR = 1.8;

export function computeNextLevelXp(level = 1) {
  if (level <= 1) return BASE_XP_CAP;
  let cap = BASE_XP_CAP;
  for (let l = 2; l <= level; l += 1) {
    cap = Math.ceil(cap * XP_GROWTH_FACTOR);
  }
  return cap;
}
