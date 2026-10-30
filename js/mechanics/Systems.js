/**
 * Systems.js
 * ECS Systems governing Vitality (HP), Remnants, and the granular
 * 14-Slot Equipment & Folklore Inventory System for "Mytholohiya".
 * Item definitions live in their dedicated directory: js/data/items/
 */

import { System } from '../core/ECS.js';
import {
  EQUIPMENT_SLOTS,
  ITEM_TEMPLATES,
  ItemRegistry,
  createItemInstance
} from '../data/items/index.js';

export { EQUIPMENT_SLOTS, ITEM_TEMPLATES, ItemRegistry, createItemInstance };

export class VitalitySystem extends System {
  init() {
    this.eventBus.on('player:modifyVitality', ({ amount, source = 'Encounter' }) => {
      const player = this.world.getEntity('player');
      if (!player) return;

      const vitality = player.getComponent('Vitality');
      if (!vitality) return;

      const previous = vitality.current;
      vitality.current = Math.max(0, Math.min(vitality.max, vitality.current + amount));

      this.eventBus.emit('ui:updateStats', { entity: player });
      this.eventBus.emit('log:mechanical', {
        type: amount < 0 ? 'damage' : 'heal',
        stat: 'HP',
        delta: amount,
        current: vitality.current,
        max: vitality.max,
        source
      });

      if (vitality.current <= 0 && previous > 0) {
        this.eventBus.emit('player:defeated', { reason: 'vitality', source });
      }
    });
  }
}

export class RemnantSystem extends System {
  init() {
    this.eventBus.on('player:modifyRemnants', ({ amount, source = 'Encounter' }) => {
      const player = this.world.getEntity('player');
      if (!player) return;

      const pouch = player.getComponent('Remnants');
      if (!pouch) return;

      pouch.count = Math.max(0, pouch.count + amount);

      if (pouch.count >= 12) {
        this.world.setFlag('status_rich');
        this.world.removeFlag('status_poor');
      } else if (pouch.count <= 3) {
        this.world.setFlag('status_poor');
        this.world.removeFlag('status_rich');
      }

      this.eventBus.emit('ui:updateStats', { entity: player });
      this.eventBus.emit('log:mechanical', {
        type: amount < 0 ? 'item_loss' : 'item_gain',
        text: `Remnants: ${amount >= 0 ? `+${amount}` : amount} (Total: ${pouch.count}) [${source}]`
      });
    });
  }
}

export class InventorySystem extends System {
  init() {
    this.eventBus.on('inventory:add', ({ templateId, item, autoEquip = false }) => {
      const player = this.world.getEntity('player');
      if (!player) return;
      const inv = player.getComponent('Inventory');
      if (!inv) return;

      const instance = item || createItemInstance(templateId);
      inv.items.push(instance);

      if (autoEquip && instance.slot) {
        this._equipItemInternal(player, instance.uid, true);
      } else {
        this._syncEquipmentState(player);
      }

      if (!autoEquip) {
        this.eventBus.emit('log:mechanical', {
          type: 'item_gain',
          text: `Obtained: ${instance.name}`
        });
      }
    });

    this.eventBus.on('inventory:equipToggle', ({ uid }) => {
      const player = this.world.getEntity('player');
      if (!player) return;
      const inv = player.getComponent('Inventory');
      if (!inv) return;
      const item = inv.items.find((i) => i.uid === uid);
      if (!item) return;

      if (item.equippedSlot) {
        this._unequipItemInternal(player, uid);
      } else {
        this._equipItemInternal(player, uid, false);
      }
    });

    this.eventBus.on('inventory:flipInsideOut', ({ uid }) => {
      const player = this.world.getEntity('player');
      if (!player) return;
      const inv = player.getComponent('Inventory');
      if (!inv) return;
      const item = inv.items.find((i) => i.uid === uid);
      if (!item || !item.canFlipInsideOut) return;

      item.insideOut = !item.insideOut;
      this._syncEquipmentState(player);

      this.eventBus.emit('log:mechanical', {
        type: 'status_apply',
        text: item.insideOut
          ? `Turned ${item.name} inside-out (protective bonuses suppressed; +1 WIS & spirit ward active).`
          : `Turned ${item.name} right-side out (protective stat bonuses restored).`
      });
    });

    this.eventBus.on('inventory:ripItem', ({ uid }) => {
      const player = this.world.getEntity('player');
      if (!player) return;
      const inv = player.getComponent('Inventory');
      if (!inv) return;
      const idx = inv.items.findIndex((i) => i.uid === uid);
      if (idx === -1) return;

      const item = inv.items[idx];
      if (!item.canRip) return;

      if (item.equippedSlot) {
        inv.slots[item.equippedSlot] = null;
      }
      inv.items.splice(idx, 1);

      const count = item.ripYield || 2;
      for (let i = 0; i < count; i += 1) {
        inv.items.push(createItemInstance('ripped_sheets'));
      }

      this._syncEquipmentState(player);
      this.eventBus.emit('log:mechanical', {
        type: 'item_gain',
        text: `Ripped ${item.name} into ${count}x Ripped Cloth Sheets.`
      });
    });

    this.eventBus.on('inventory:combineWithSheet', ({ uid }) => {
      const player = this.world.getEntity('player');
      if (!player) return;
      const inv = player.getComponent('Inventory');
      if (!inv) return;

      const reagentIdx = inv.items.findIndex((i) => i.uid === uid);
      const sheetIdx = inv.items.findIndex((i) => i.id === 'ripped_sheets');
      if (reagentIdx === -1 || sheetIdx === -1) {
        this.eventBus.emit('log:mechanical', {
          type: 'damage',
          text: 'Requires a Ripped Cloth Sheet in inventory to craft a poultice.'
        });
        return;
      }

      const reagent = inv.items[reagentIdx];
      const indices = [reagentIdx, sheetIdx].sort((a, b) => b - a);
      for (const removeIdx of indices) {
        inv.items.splice(removeIdx, 1);
      }

      inv.items.push(createItemInstance('herbal_poultice'));
      this._syncEquipmentState(player);
      this.eventBus.emit('log:mechanical', {
        type: 'item_gain',
        text: `Combined ${reagent.name} + Cloth Sheet into a Sterilized Bayabas Poultice!`
      });
    });

    this.eventBus.on('inventory:useItem', ({ uid }) => {
      const player = this.world.getEntity('player');
      if (!player) return;
      const inv = player.getComponent('Inventory');
      if (!inv) return;

      const idx = inv.items.findIndex((i) => i.uid === uid);
      if (idx === -1) return;
      const item = inv.items[idx];
      if (!item.usable) return;

      const isReusableTool = item.category === 'tool' && Boolean(item.slot);
      if (!isReusableTool) {
        if (item.equippedSlot) {
          inv.slots[item.equippedSlot] = null;
        }
        inv.items.splice(idx, 1);
      }

      if (item.id === 'ripped_sheets') {
        this.world.removeFlag('wounded');
        this.eventBus.emit('player:modifyVitality', {
          amount: 2,
          source: 'Bandaged with Cloth Sheet'
        });
      } else if (item.id === 'herbal_poultice') {
        this.world.removeFlag('wounded');
        this.world.removeFlag('spirit_hexed');
        this.eventBus.emit('player:modifyVitality', {
          amount: 5,
          source: 'Bayabas & Lana Herbal Poultice'
        });
      } else if (item.id === 'bayabas_herbs') {
        this.world.removeFlag('wounded');
        this.eventBus.emit('player:modifyVitality', {
          amount: 2,
          source: 'Applied Guava (Bayabas) Antiseptic'
        });
      } else if (item.id === 'blessed_lana_vial') {
        this.world.removeFlag('spirit_hexed');
        this.world.removeFlag('wounded');
        this.world.setFlag('aswang_ward');
        this.world.setFlag('spirit_ward_item');
        this.eventBus.emit('player:modifyVitality', {
          amount: 3,
          source: 'Anointed with Sacred Coconut Oil (Lana)'
        });
      } else if (item.id === 'coarse_salt_pouch') {
        this.world.setFlag('salt_ward');
        this.world.setFlag('aswang_counter');
        this.eventBus.emit('log:mechanical', {
          type: 'status_apply',
          text: 'Scattered Coarse Sea Salt! Aswang and Wakwak wards active.'
        });
      } else if (item.id === 'bamboo_torch') {
        this.world.setFlag('has_light_source');
        this.world.setFlag('light_source');
        this.eventBus.emit('log:mechanical', {
          type: 'status_apply',
          text: 'Ignited Resin-Soaked Bamboo Torch! Dark jungle paths illuminated.'
        });
      } else if (item.id === 'brass_agung_gong') {
        this.world.setFlag('acoustic_shock');
        this.world.setFlag('bakunawa_ward');
        this.world.setFlag('drums_secured');
        this.eventBus.emit('log:mechanical', {
          type: 'status_apply',
          text: 'Struck Bronze Agung Gong! Acoustic shockwave reverberates across the field.'
        });
      }

      this._syncEquipmentState(player);
    });
  }

  _equipItemInternal(player, uid, silent = false) {
    const inv = player.getComponent('Inventory');
    if (!inv) return;
    const item = inv.items.find((i) => i.uid === uid);
    if (!item || !item.slot) return;

    let targetSlot = item.slot;
    if (targetSlot === 'ring') {
      targetSlot = !inv.slots.ring1 ? 'ring1' : !inv.slots.ring2 ? 'ring2' : 'ring1';
    }

    const currentUid = inv.slots[targetSlot];
    if (currentUid && currentUid !== uid) {
      const prevItem = inv.items.find((i) => i.uid === currentUid);
      if (prevItem) prevItem.equippedSlot = null;
    }

    inv.slots[targetSlot] = item.uid;
    item.equippedSlot = targetSlot;

    this._syncEquipmentState(player);

    if (!silent) {
      this.eventBus.emit('log:mechanical', {
        type: 'item_gain',
        text: `Equipped ${item.name} [${targetSlot.toUpperCase()}].`
      });
    }
  }

  _unequipItemInternal(player, uid) {
    const inv = player.getComponent('Inventory');
    if (!inv) return;
    const item = inv.items.find((i) => i.uid === uid);
    if (!item || !item.equippedSlot) return;

    const oldSlot = item.equippedSlot;
    inv.slots[oldSlot] = null;
    item.equippedSlot = null;

    this._syncEquipmentState(player);
    this.eventBus.emit('log:mechanical', {
      type: 'item_loss',
      text: `Unequipped ${item.name}.`
    });
  }

  _syncEquipmentState(player) {
    const inv = player.getComponent('Inventory');
    const stats = player.getComponent('Stats');
    if (!inv || !stats) return;

    if (!stats.base) {
      stats.base = {
        STR: stats.STR,
        DEX: stats.DEX,
        CON: stats.CON,
        INT: stats.INT,
        WIS: stats.WIS,
        CHA: stats.CHA
      };
    }

    const bonuses = { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 };
    let anyInsideOut = false;

    const trackedItemFlags = [
      'clothing_inside_out',
      'armed_blade',
      'has_light_source',
      'wearing_agimat',
      'has_rope_or_sheets',
      'pry_tool',
      'aswang_bane',
      'cold_iron',
      'spirit_ward_item'
    ];
    for (const flag of trackedItemFlags) {
      this.world.removeFlag(flag);
    }

    for (const item of inv.items) {
      if (item.category === 'tool' || item.category === 'material') {
        for (const t of item.tags || []) {
          this.world.setFlag(t);
        }
      }

      if (item.equippedSlot) {
        if (item.insideOut) {
          // Inside-out armor/garment stat suppression mechanic:
          // Disables protective stat bonuses while inverted, granting +1 WIS & spirit warding instead
          anyInsideOut = true;
          bonuses.WIS += 1;
        } else if (item.statBonuses) {
          for (const [k, val] of Object.entries(item.statBonuses)) {
            bonuses[k] = (bonuses[k] || 0) + val;
          }
        }
        for (const t of item.tags || []) {
          this.world.setFlag(t);
        }
      }
    }

    if (anyInsideOut) {
      this.world.setFlag('clothing_inside_out');
    }

    stats.bonuses = bonuses;
    for (const k of Object.keys(stats.base)) {
      stats[k] = stats.base[k] + (bonuses[k] || 0);
    }

    this.eventBus.emit('ui:updateStats', { entity: player });
    this.eventBus.emit('ui:updateInventory', { entity: player });
    this.eventBus.emit('world:tagsUpdated', { activeTags: [...this.world.flags] });
  }
}
