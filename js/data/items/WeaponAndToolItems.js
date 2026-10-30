/**
 * WeaponAndToolItems.js
 * Primary weapons, off-hand shields, lanterns, torches, and utility tools
 * that unlock unique scenario actions in "Mytholohiya".
 */

import { ItemRegistry } from './ItemRegistry.js';

ItemRegistry.registerItemPack([
  // 13. PRIMARY WEAPON SLOT
  {
    id: 'bolo_machete',
    name: 'Heavy Jungle Bolo',
    category: 'weapon',
    slot: 'primary',
    statBonuses: { STR: 2 },
    tags: ['armed_blade', 'sharp_tool'],
    description:
      'Leaf-shaped steel blade equally suited for hacking bamboo, slicing snares, or splitting skulls.'
  },
  {
    id: 'kampilan_sword',
    name: 'Carved Kampilan Greatsword',
    category: 'weapon',
    slot: 'primary',
    statBonuses: { STR: 3 },
    tags: ['armed_blade', 'sharp_tool'],
    description:
      'Long, tapered warrior blade with a bifurcate hilt shaped like a gaping crocodile jaw.'
  },
  {
    id: 'buntot_pagi',
    name: 'Buntot Pagi (Stingray Whip)',
    category: 'weapon',
    slot: 'primary',
    statBonuses: { DEX: 2, WIS: 1 },
    tags: ['aswang_bane'],
    description:
      'Barbed stingray tail cured in vinegar and ash; dreaded by night-stalkers and shapeshifters.'
  },
  {
    id: 'rattan_staff',
    name: 'Fire-Hardened Rattan Staff',
    category: 'weapon',
    slot: 'primary',
    statBonuses: { DEX: 1, WIS: 1 },
    tags: ['walking_pole'],
    description:
      'Six-foot pole etched with protective prayers; tests sinkholes and keeps beasts at bay.'
  },

  // 14. OFF-HAND & UTILITY TOOLS
  {
    id: 'bamboo_resin_torch',
    name: 'Manila-Elemi Resin Torch',
    category: 'tool',
    slot: 'offhand',
    statBonuses: { WIS: 1 },
    tags: ['has_light_source'],
    description:
      'Bamboo cylinder packed with fragrant sahing resin that burns through fog and drizzle.'
  },
  {
    id: 'kalasag_shield',
    name: 'Carved Kalasag Buckler',
    category: 'wearable',
    slot: 'offhand',
    statBonuses: { CON: 2 },
    tags: ['shield_guard'],
    description:
      'Hardwood shield reinforced with rattan bindings and painted with lightning motifs.'
  },
  {
    id: 'iron_prybar',
    name: 'Rusted Shipwright Prybar',
    category: 'tool',
    slot: 'offhand',
    statBonuses: { STR: 2 },
    tags: ['pry_tool', 'cold_iron'],
    description:
      'Heavy iron lever salvaged from a wrecked junk. Forces jammed sluices, chests, and nails without risk.'
  },
  {
    id: 'blessed_lana_vial',
    name: 'Vial of Blessed Lana Oil',
    category: 'tool',
    canCombineWithSheet: true,
    tags: ['spirit_oil'],
    description:
      'Virgin coconut oil prepared on Good Friday. Combine with a Ripped Cloth Sheet to craft a Sterilized Poultice.'
  }
]);

