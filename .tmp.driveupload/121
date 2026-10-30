# Mytholohiya: Item & Equipment Generation Rules

All items, weapons, wearables, tools, and tactical medical/crafting supplies live in `js/data/items/` and register via `ItemRegistry.registerItem(...)` or `ItemRegistry.registerItemPack([...])`.

## 1. The 14 Equipment Slots
Wearables, weapons, and off-hand tools may target one of the following `slot` values:
* `helmet` (Headgear)
* `mask` (Face masks & wraps)
* `cape` (Cloaks & rain mantles)
* `torso` (Tunics, baro, malong, armor)
* `armguards` (Vambraces & cuffs)
* `gloves` (Hand wraps & grips)
* `belt` (Sashes & utility belts)
* `leggings` (Trousers, bahag, greaves)
* `boots` (Sandals & footwear)
* `ring` (Automatically equips into `ring1` or `ring2`)
* `necklace` (Agimat amulets & pendants)
* `primary` (Main-hand melee/ranged weapons & staves)
* `offhand` (Shields, torches, lanterns, prybars)

## 2. Realistic Survival & Philippine Folklore Item Flags
* `canFlipInsideOut: true`: Allows fabric garments and armor (`torso`, `cape`, `leggings`, `helmet`) to be flipped **Inside-Out** (`Baliktad`).
  * **Folkloric Benefit:** Grants the `clothing_inside_out` WorldContext tag (`ItemConditionFlags.Inverted`) and `+1 WIS` against forest spirit illusions (Tikbalang, Tambal, Engkanto).
  * **Armor & Stat Trade-Off (Stat Suppression):** Whenever gear or armor is worn inside-out (`insideOut: true`), **all of its positive stat bonuses (e.g., `+1 CON`, `+2 STR`, armor/defense bonuses) are disabled**. The inverted lining compromises structural padding, plates, or physical alignment, sacrificing physical stat benefits in exchange for spiritual illusion warding.
* `canRip: true` & `ripYield: 2`: Allows fabric garments to be torn into `ripped_sheets` (**Ripped Cloth Sheets**) for bandaging wounds or crafting poultices.
* `usable: true` & `useActionLabel`: Allows medical or consumable items to be used directly from the inventory panel.
* `canCombineWithSheet: true`: Allows herbs or blessed oils (`blessed_lana_vial`, `bayabas_herbs`) to be combined with a `ripped_sheets` item to craft a `herbal_poultice`.

## 3. Stat Calculation Logic for Inverted Gear & Armor

When calculating effective equipment stats in `EquipmentSystem.js` or `ItemRegistry.js`:

```javascript
/**
 * Calculates effective stat bonuses for an item, accounting for inside-out state.
 * @param {Object} item - The item instance from inventory/equipment slot.
 * @returns {Object} Effective stat bonuses object.
 */
function getEffectiveStatBonuses(item) {
  if (!item.statBonuses) return {};

  const effectiveStats = {};
  const isInverted = item.canFlipInsideOut && item.insideOut;

  for (const [stat, value] of Object.entries(item.statBonuses)) {
    if (isInverted && value > 0) {
      // Disables all positive stat bonuses when flipped inside-out
      effectiveStats[stat] = 0;
    } else {
      effectiveStats[stat] = value;
    }
  }

  // Grant spiritual illusion warding bonus when inverted
  if (isInverted) {
    effectiveStats.WIS_vs_illusions = (effectiveStats.WIS_vs_illusions || 0) + 1;
  }

  return effectiveStats;
}
```

## 4. Item Schema Examples

### Example A: Basic Garment (Abaca Baro Tunic)
```javascript
import { ItemRegistry } from './ItemRegistry.js';

ItemRegistry.registerItem({
  id: 'abaca_tunic',
  name: 'Woven Abaca Baro Tunic',
  category: 'wearable', // 'wearable' | 'weapon' | 'tool' | 'medical' | 'material'
  slot: 'torso',
  canFlipInsideOut: true,
  canRip: true,
  ripYield: 2,
  insideOut: false,
  statBonuses: { CON: 1 }, // Standard: +1 CON. Inverted: 0 CON, +1 WIS vs illusions
  tags: ['cloth_garment'],
  description: 'Sturdy plant-fiber shirt. Can be worn inside-out (disabling +1 CON for illusion warding) or ripped into cloth sheets.'
});
```

### Example B: Heavy Armor (Carabao Hide Cuirass)
```javascript
import { ItemRegistry } from './ItemRegistry.js';

ItemRegistry.registerItem({
  id: 'carabao_hide_cuirass',
  name: 'Carabao Hide Cuirass',
  category: 'wearable',
  slot: 'torso',
  isArmor: true,
  canFlipInsideOut: true,
  canRip: false,
  insideOut: false,
  statBonuses: { CON: 2, STR: 1 }, // Standard: +2 CON, +1 STR. Inverted: 0 CON, 0 STR (+1 WIS vs illusions)
  tags: ['leather_armor', 'heavy_wearable'],
  description: 'Thick water buffalo hide armor. Flipping inside-out breaks spirit loops but disables all protective stat bonuses.'
});
```
