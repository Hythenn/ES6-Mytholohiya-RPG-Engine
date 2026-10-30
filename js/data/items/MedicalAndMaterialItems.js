/**
 * MedicalAndMaterialItems.js
 * Project Zomboid-inspired medical supplies, ripped cloth sheets, herbs,
 * and crafting materials for "Mytholohiya".
 */

import { ItemRegistry } from './ItemRegistry.js';

ItemRegistry.registerItemPack([
  {
    id: 'ripped_sheets',
    name: 'Ripped Cloth Sheet',
    category: 'material',
    usable: true,
    useActionLabel: 'Bandage Wound (+2 HP, Stops Bleeding)',
    tags: ['has_rope_or_sheets', 'bandage_item'],
    description:
      'Torn strip of fabric obtained from ripping garments. Can bind bleeding wounds, lash rafts, or be infused with herbs/oil.'
  },
  {
    id: 'herbal_poultice',
    name: 'Sterilized Bayabas Poultice',
    category: 'medical',
    usable: true,
    useActionLabel: 'Apply Poultice (+5 HP, Clears Hex & Wound)',
    tags: ['bandage_item'],
    description:
      'Cloth sheet soaked in boiled guava leaf and blessed coconut lana. Rapidly knits torn flesh and purges spirit chill.'
  },
  {
    id: 'bayabas_herbs',
    name: 'Wild Bayabas & Tawa-Tawa Leaves',
    category: 'material',
    canCombineWithSheet: true,
    usable: true,
    useActionLabel: 'Chew Bitter Leaves (+2 HP)',
    tags: ['medicinal_herb'],
    description:
      'Astringent medicinal leaves. Can be chewed raw for minor relief or combined with a Ripped Cloth Sheet to craft a Sterilized Poultice.'
  }
]);

