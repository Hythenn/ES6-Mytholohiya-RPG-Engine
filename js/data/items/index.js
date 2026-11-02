/**
 * js/data/items/index.js
 * Barrel module that loads all item packs into ItemRegistry and exports
 * the registry, slots, and helper functions.
 */

import {
  EQUIPMENT_SLOTS,
  ITEM_TEMPLATES,
  ItemRegistry,
  createItemInstance
} from '../../mechanics/ItemRegistry.js';

import './WearableItems.js';
import './WeaponAndToolItems.js';
import './MedicalAndMaterialItems.js';
import { EQUIPMENT_PACK, registerAllEquipment } from './EquipmentPack.js';

export {
  EQUIPMENT_SLOTS,
  ITEM_TEMPLATES,
  ItemRegistry,
  createItemInstance,
  EQUIPMENT_PACK,
  registerAllEquipment
};

