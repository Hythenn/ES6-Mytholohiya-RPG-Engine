/**
 * ItemRegistry.js
 * Central registry and factory for all equipment, weapons, tools, wearables,
 * and Project Zomboid-inspired crafting/medical items in "Mytholohiya".
 */

export const EQUIPMENT_SLOTS = Object.freeze([
  { id: 'helmet', label: 'Helmet' },
  { id: 'mask', label: 'Mask' },
  { id: 'cape', label: 'Cape' },
  { id: 'torso', label: 'Torso' },
  { id: 'armguards', label: 'Armguards' },
  { id: 'gloves', label: 'Gloves' },
  { id: 'belt', label: 'Belt' },
  { id: 'leggings', label: 'Leggings' },
  { id: 'boots', label: 'Boots' },
  { id: 'ring1', label: 'Ring 1' },
  { id: 'ring2', label: 'Ring 2' },
  { id: 'necklace', label: 'Necklace' },
  { id: 'primary', label: 'Primary' },
  { id: 'offhand', label: 'Off-Hand' }
]);

export const ITEM_TEMPLATES = {};

let uniqueInstanceCounter = 1;

class ItemRegistryStore {
  constructor() {
    this.templates = ITEM_TEMPLATES;
  }

  /**
   * Register a single item definition into the global item pool.
   * @param {Object} itemDef
   */
  registerItem(itemDef) {
    if (!itemDef || !itemDef.id) return;
    this.templates[itemDef.id] = {
      ...itemDef,
      statBonuses: { ...(itemDef.statBonuses || {}) },
      tags: [...(itemDef.tags || [])]
    };
  }

  /**
   * Register an array of item definitions.
   * @param {Object[]} itemsArray
   */
  registerItemPack(itemsArray) {
    if (!Array.isArray(itemsArray)) return;
    for (const itemDef of itemsArray) {
      this.registerItem(itemDef);
    }
  }

  /**
   * Retrieve an item template by ID.
   * @param {string} templateId
   * @returns {Object|null}
   */
  getTemplate(templateId) {
    return this.templates[templateId] || null;
  }

  /**
   * Retrieve all registered item templates.
   * @returns {Object[]}
   */
  getAllTemplates() {
    return Object.values(this.templates);
  }

  /**
   * Instantiate a unique inventory item from a registered template ID.
   * @param {string} templateId
   * @param {Object} [overrides]
   * @returns {Object}
   */
  createItemInstance(templateId, overrides = {}) {
    const tpl = this.getTemplate(templateId);
    if (!tpl) {
      return {
        uid: `item_${uniqueInstanceCounter++}`,
        id: templateId,
        name: overrides.name || templateId,
        category: 'material',
        equippedSlot: null,
        insideOut: false,
        statBonuses: {},
        tags: [],
        ...overrides
      };
    }

    return {
      ...tpl,
      uid: `item_${uniqueInstanceCounter++}`,
      statBonuses: { ...(tpl.statBonuses || {}) },
      tags: [...(tpl.tags || [])],
      equippedSlot: null,
      insideOut: Boolean(tpl.insideOut),
      ...overrides
    };
  }
}

export const ItemRegistry = new ItemRegistryStore();

export function createItemInstance(templateId, overrides = {}) {
  return ItemRegistry.createItemInstance(templateId, overrides);
}

if (typeof globalThis !== 'undefined') {
  globalThis.ItemRegistry = ItemRegistry;
}

