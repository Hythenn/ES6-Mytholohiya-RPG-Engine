/**
 * Systems.js
 * ECS Systems governing Vitality (HP), Remnants, and the granular
 * 14-Slot Equipment & Folklore Inventory System for "Mytholohiya".
 * Item definitions live in their dedicated directory: js/data/items/
 */

import { System, Component } from '../core/ECS.js';
import { computeNextLevelXp, ITEM_FLAGS } from '../core/Constants.js';
import {
  EQUIPMENT_SLOTS,
  ITEM_TEMPLATES,
  ItemRegistry,
  createItemInstance
} from '../data/items/index.js';
import { StatResolver } from './StatResolver.js';

export { EQUIPMENT_SLOTS, ITEM_TEMPLATES, ItemRegistry, createItemInstance };

export const SURVIVAL_CONDITION_TEMPLATES = Object.freeze({
  bleeding_wound: {
    id: 'bleeding_wound',
    name: 'Bleeding Laceration',
    bodyPart: 'Torso / Limbs',
    desc: 'Deep laceration leaks warm blood onto the trail. Causes -1 HP every 2 nodes and adds +4 Spirit Scent until bandaged with Ripped Cloth Sheets.',
    remedyItemIds: ['ripped_sheets', 'herbal_poultice'],
    remedyAction: 'Bandage with Cloth Sheet'
  },
  infected_aswang_bite: {
    id: 'infected_aswang_bite',
    name: 'Septic Aswang Bite',
    bodyPart: 'Neck / Shoulder',
    desc: 'Necrotic Aswang saliva seeps into blood vessels. Imposes -2 CON and attracts nocturnal predators until cleansed with Bayabas Leaves or Herbal Poultice.',
    remedyItemIds: ['bayabas_herbs', 'herbal_poultice'],
    remedyAction: 'Apply Bayabas / Herbal Poultice'
  },
  bangungot_paralysis: {
    id: 'bangungot_paralysis',
    name: 'Bangungot (Batibat Sleep Paralysis)',
    bodyPart: 'Full Body / Chest',
    desc: 'The colossal weight of a Batibat sits upon your ribs. Physical STR and DEX actions are locked until you pass a CON DC 12 check or successfully wiggle your toes.',
    remedyAction: 'Wiggle Great Toes (CON DC 12)'
  },
  soaked_hypothermia: {
    id: 'soaked_hypothermia',
    name: 'Soaked / Hypothermia',
    bodyPart: 'Full Body',
    desc: 'Monsoon saturation chills bones and deadens reflexes. Imposes -2 DEX in mud and wilderness until dried by a campfire, hearth, or resin torch.',
    remedyItemIds: ['bamboo_resin_torch', 'bamboo_torch'],
    remedyAction: 'Warm at Fire / Torch'
  }
});

export const ANSTRAL_BOONS = Object.freeze({
  boon_haliya_shield: {
    id: 'boon_haliya_shield',
    name: "Haliya's Lunar Shield",
    desc: 'The masked moon goddess wards your spirit. Negates the next source of lethal damage or curse, granting +2 WIS.',
    charges: 1
  },
  boon_kapre_stealth: {
    id: 'boon_kapre_stealth',
    name: "Kapre's Fog Stealth",
    desc: 'Sweet, pungent cigar smoke cloaks your trail. Reduces Panganib Spirit Scent by -30 and grants +2 DEX to evasion.',
    charges: 3
  },
  boon_apo_anito: {
    id: 'boon_apo_anito',
    name: "Apo Anito's Vitality Grace",
    desc: 'Ancestral blessings knit torn muscles. Restores +6 HP, immediately stopping bleeding and purging rot.',
    charges: 1
  },
  boon_tala_guidance: {
    id: 'boon_tala_guidance',
    name: "Tala's Star Guidance",
    desc: 'The morning and evening star lights hidden trails. Grants +2 to WIS and INT checks and reveals perception clues.',
    charges: 3
  }
});

export class SurvivalStatusSystem extends System {
  init() {
    this.subscribe('status:applyCondition', ({ id, bodyPart, source = 'Hazard' }) => {
      const player = this.world.getEntity('player');
      if (!player) return;

      let condComp = player.getComponent('Conditions');
      if (!condComp) {
        condComp = { active: {} };
        player.addComponent(new Component('Conditions', condComp));
      }

      const tmpl = SURVIVAL_CONDITION_TEMPLATES[id] || {
        id,
        name: id.replace(/_/g, ' ').toUpperCase(),
        bodyPart: bodyPart || 'Body',
        desc: 'Physical impairment requiring survival treatment.'
      };

      condComp.active[id] = {
        ...tmpl,
        bodyPart: bodyPart || tmpl.bodyPart,
        appliedTurn: 0
      };

      this.world.setFlag(`condition_${id}`);
      this.world.setFlag('has_survival_condition');
      if (id === 'bleeding_wound') {
        this.world.setFlag('wounded');
        this.world.setFlag('blood_scent');
      }

      this.eventBus.emit('ui:updateConditions', { entity: player });
      this.eventBus.emit('ui:updateStats', { entity: player });
      this.eventBus.emit('log:mechanical', {
        type: 'damage',
        text: `Afflicted with ${tmpl.name} (${tmpl.bodyPart}) from ${source}!`
      });
    });

    this.subscribe('status:cureCondition', ({ id, remedy = 'First Aid' }) => {
      const player = this.world.getEntity('player');
      if (!player) return;

      const condComp = player.getComponent('Conditions');
      if (!condComp || !condComp.active[id]) return;

      const curedName = condComp.active[id].name;
      delete condComp.active[id];

      this.world.removeFlag(`condition_${id}`);
      if (id === 'bleeding_wound') {
        this.world.removeFlag('wounded');
      }

      if (Object.keys(condComp.active).length === 0) {
        this.world.removeFlag('has_survival_condition');
      }

      this.eventBus.emit('ui:updateConditions', { entity: player });
      this.eventBus.emit('ui:updateStats', { entity: player });
      this.eventBus.emit('log:mechanical', {
        type: 'heal',
        text: `Cured ${curedName} using ${remedy}. Status cleared.`
      });
    });

    this.subscribe('status:wiggleToes', () => {
      const player = this.world.getEntity('player');
      if (!player) return;

      const condComp = player.getComponent('Conditions');
      if (!condComp || !condComp.active.bangungot_paralysis) return;

      const check = StatResolver.resolveCheck(player, 'CON', 12);
      this.eventBus.emit('check:resolved', check);

      if (check.success) {
        delete condComp.active.bangungot_paralysis;
        this.world.removeFlag('condition_bangungot_paralysis');
        this.eventBus.emit('ui:updateConditions', { entity: player });
        this.eventBus.emit('ui:updateStats', { entity: player });
        this.eventBus.emit('log:mechanical', {
          type: 'heal',
          text: 'Gasping for air, you violently twitch your toes and shatter the Batibat sleep paralysis!'
        });
      } else {
        this.eventBus.emit('player:modifyVitality', {
          amount: -1,
          source: 'Batibat Suffocation'
        });
        this.eventBus.emit('log:mechanical', {
          type: 'damage',
          text: 'The suffocating bulk presses harder on your lungs! Your toes twitch weakly. Still paralyzed.'
        });
      }
    });

    this.subscribe('status:dryOff', () => {
      this.eventBus.emit('status:cureCondition', {
        id: 'soaked_hypothermia',
        remedy: 'Warm Campfire Hearth'
      });
    });

    this.subscribe('dambana:offerAtang', ({ boonId, costType = 'remnants', costAmount = 2 }) => {
      const player = this.world.getEntity('player');
      if (!player) return;

      const remnants = player.getComponent('Remnants');
      const inv = player.getComponent('Inventory');

      if (costType === 'remnants' || costType === 'piloncitos') {
        if (!remnants || remnants.count < costAmount) {
          this.eventBus.emit('log:mechanical', {
            type: 'damage',
            text: `Insufficient Piloncitos (Requires ${costAmount}).`
          });
          return;
        }
        this.eventBus.emit('player:modifyRemnants', {
          amount: -costAmount,
          source: 'Dambana Atang Offering'
        });
      } else if (costType === 'item') {
        if (!inv) return;
        const idx = inv.items.findIndex((i) => i.id === costAmount || (i.tags && i.tags.includes(costAmount)));
        if (idx === -1) {
          this.eventBus.emit('log:mechanical', {
            type: 'damage',
            text: 'Missing required offering item in pack.'
          });
          return;
        }
        const [consumed] = inv.items.splice(idx, 1);
        this.eventBus.emit('ui:updateInventory', { entity: player });
        this.eventBus.emit('inventory:remove', { item: consumed });
        this.eventBus.emit('log:mechanical', {
          type: 'item_loss',
          text: `Offered ${consumed.name} on the sacred Dambana stone altar.`
        });
      }

      let boonsComp = player.getComponent('Boons');
      if (!boonsComp) {
        boonsComp = { active: {} };
        player.addComponent(new Component('Boons', boonsComp));
      }

      const boonTmpl = ANSTRAL_BOONS[boonId];
      if (boonTmpl) {
        boonsComp.active[boonId] = { ...boonTmpl };
        this.world.setFlag(boonId);

        if (boonId === 'boon_apo_anito') {
          this.eventBus.emit('player:modifyVitality', {
            amount: 6,
            source: "Apo Anito's Blessing"
          });
          this.eventBus.emit('status:cureCondition', { id: 'bleeding_wound', remedy: 'Ancestral Blessing' });
          this.eventBus.emit('status:cureCondition', { id: 'infected_aswang_bite', remedy: 'Ancestral Blessing' });
        } else if (boonId === 'boon_kapre_stealth') {
          this.eventBus.emit('danger:modifyHeat', {
            delta: -30,
            source: 'Kapre Cigar Smoke Veil'
          });
        }

        this.eventBus.emit('ui:updateStats', { entity: player });
        this.eventBus.emit('log:mechanical', {
          type: 'status_apply',
          text: `❖ ANCESTRAL BOON GRANTED: ${boonTmpl.name} (${boonTmpl.desc})`
        });
      }
    });

    this.subscribe('narrative:nodeEntered', () => {
      const player = this.world.getEntity('player');
      if (!player) return;

      const condComp = player.getComponent('Conditions');
      if (!condComp || !condComp.active) return;

      if (condComp.active.bleeding_wound) {
        condComp.active.bleeding_wound.appliedTurn = (condComp.active.bleeding_wound.appliedTurn || 0) + 1;
        if (condComp.active.bleeding_wound.appliedTurn % 2 === 0) {
          this.eventBus.emit('player:modifyVitality', {
            amount: -1,
            source: 'Bleeding Wound'
          });
        }
      }
    });
  }
}

export class PanganibSystem extends System {
  init() {
    this.subscribe('danger:modifyHeat', ({ delta, source = 'Environment', reason = '' }) => {
      const player = this.world.getEntity('player');
      if (!player) return;

      let panganib = player.getComponent('Panganib');
      if (!panganib) {
        panganib = { heat: 10, max: 100, tier: 'CALM', tierLabel: 'Serene' };
        player.addComponent(new Component('Panganib', panganib));
      }

      panganib.heat = Math.max(0, Math.min(panganib.max || 100, (panganib.heat || 0) + delta));

      if (panganib.heat >= 75) {
        panganib.tier = 'PANGANIB';
        panganib.tierLabel = 'Hunted';
      } else if (panganib.heat >= 50) {
        panganib.tier = 'AMOY_DUGO';
        panganib.tierLabel = 'Blood Scent';
      } else if (panganib.heat >= 25) {
        panganib.tier = 'LIGAW';
        panganib.tierLabel = 'Unsettled';
      } else {
        panganib.tier = 'CALM';
        panganib.tierLabel = 'Serene';
      }

      const tierFlags = ['heat_calm', 'heat_ligaw', 'heat_amoy_dugo', 'heat_panganib'];
      for (const tf of tierFlags) {
        this.world.removeFlag(tf);
      }
      this.world.setFlag(`heat_${panganib.tier.toLowerCase()}`);

      if (panganib.heat >= 70) {
        this.world.setFlag('spirit_scent_high');
        this.world.removeFlag('spirit_scent_low');
      } else if (panganib.heat < 30) {
        this.world.setFlag('spirit_scent_low');
        this.world.removeFlag('spirit_scent_high');
      } else {
        this.world.removeFlag('spirit_scent_high');
        this.world.removeFlag('spirit_scent_low');
      }

      this.eventBus.emit('danger:updated', {
        heat: panganib.heat,
        max: panganib.max || 100,
        tier: panganib.tier,
        tierLabel: panganib.tierLabel,
        delta,
        source,
        reason
      });

      this.eventBus.emit('ui:updateStats', { entity: player });

      if (delta !== 0) {
        this.eventBus.emit('log:mechanical', {
          type: delta > 0 ? 'status_apply' : 'heal',
          stat: 'PANGANIB',
          delta,
          text: `Spirit Threat: ${delta > 0 ? `+${delta}` : delta} [${panganib.heat}/100 : ${panganib.tierLabel}] (${source})`
        });
      }
    });

    this.subscribe('narrative:nodeEntered', () => {
      const player = this.world.getEntity('player');
      if (!player) return;

      let stepDelta = 3;
      const inv = player.getComponent('Inventory');
      let bloodiedCount = 0;
      if (inv && Array.isArray(inv.items)) {
        bloodiedCount = inv.items.filter(
          (i) => i.isBloodied || (i.tags && i.tags.includes('bloodied'))
        ).length;
      }

      if (bloodiedCount > 0) {
        stepDelta += bloodiedCount * 4;
        this.world.setFlag('blood_scent');
      }

      if (this.world.hasFlag('wounded')) {
        stepDelta += 2;
      }

      this.eventBus.emit('danger:modifyHeat', {
        delta: stepDelta,
        source: bloodiedCount > 0 ? `Wilderness Trail (Blood Scent +${bloodiedCount * 4})` : 'Wilderness Trail'
      });
    });

    this.subscribe('danger:reset', () => {
      const player = this.world.getEntity('player');
      if (!player) return;
      const panganib = player.getComponent('Panganib');
      if (panganib) {
        panganib.heat = 10;
        panganib.tier = 'CALM';
        panganib.tierLabel = 'Serene';
        this.eventBus.emit('danger:updated', {
          heat: 10,
          max: 100,
          tier: 'CALM',
          tierLabel: 'Serene',
          delta: 0,
          source: 'Reset'
        });
        this.eventBus.emit('ui:updateStats', { entity: player });
      }
    });
  }
}

export class VitalitySystem extends System {
  init() {
    this.subscribe('player:modifyVitality', ({ amount, source = 'Encounter' }) => {
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
    this.subscribe('player:modifyPiloncitos', (payload) => {
      this.eventBus.emit('player:modifyRemnants', payload);
    });

    this.subscribe('player:modifyRemnants', ({ amount, source = 'Encounter' }) => {
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
        text: `Piloncitos: ${amount >= 0 ? `+${amount}` : amount} (Total: ${pouch.count}) [${source}]`
      });
    });
  }
}

export const PiloncitosSystem = RemnantSystem;

export class ExperienceSystem extends System {
  init() {
    this.subscribe('player:gainXp', ({ amount = 0, source = 'Scenario Outcome' }) => {
      const player = this.world.getEntity('player');
      if (!player) return;

      let xpComp = player.getComponent('Experience');
      if (!xpComp) {
        xpComp = { level: 1, currentXp: 0, nextLevelXp: computeNextLevelXp(1) };
        player.addComponent(new Component('Experience', xpComp));
      }

      if (amount <= 0) return;

      xpComp.currentXp += amount;

      while (xpComp.currentXp >= xpComp.nextLevelXp) {
        xpComp.currentXp -= xpComp.nextLevelXp;
        xpComp.level += 1;
        xpComp.nextLevelXp = computeNextLevelXp(xpComp.level);

        const vitality = player.getComponent('Vitality');
        if (vitality) {
          vitality.max += 2;
          vitality.current = Math.min(vitality.max, vitality.current + 2);
        }

        this.eventBus.emit('player:levelUp', {
          entity: player,
          level: xpComp.level
        });

        this.eventBus.emit('log:mechanical', {
          type: 'status_apply',
          text: `✦ LEVEL UP: Reached Level ${xpComp.level} (+2 Max Vitality).`
        });
      }

      this.eventBus.emit('ui:updateStats', { entity: player });
    });
  }
}

export class InventorySystem extends System {
  init() {
    this.subscribe('inventory:add', ({ templateId, item, autoEquip = false }) => {
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

    this.subscribe('inventory:equipToggle', ({ uid }) => {
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

    this.subscribe('inventory:flipInsideOut', ({ uid }) => {
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

    this.subscribe('inventory:ripItem', ({ uid }) => {
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
      this.eventBus.emit('inventory:remove', { item });

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

    this.subscribe('inventory:wringItem', ({ uid }) => {
      const player = this.world.getEntity('player');
      if (!player) return;
      const inv = player.getComponent('Inventory');
      if (!inv) return;
      const item = inv.items.find((i) => i.uid === uid);
      if (!item) return;

      item.isWet = false;
      if (typeof item.flags === 'number') {
        item.flags &= ~(ITEM_FLAGS.Wet | ITEM_FLAGS.Soaked);
      }
      this._syncEquipmentState(player);
      this.eventBus.emit('log:mechanical', {
        type: 'status_cure',
        text: `Wrung dry ${item.name}, squeezing out damp moisture.`
      });
    });

    this.subscribe('inventory:combineWithSheet', ({ uid }) => {
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
        const [removed] = inv.items.splice(removeIdx, 1);
        this.eventBus.emit('inventory:remove', { item: removed });
      }

      inv.items.push(createItemInstance('herbal_poultice'));
      this._syncEquipmentState(player);
      this.eventBus.emit('log:mechanical', {
        type: 'item_gain',
        text: `Combined ${reagent.name} + Cloth Sheet into a Sterilized Bayabas Poultice!`
      });
    });

    this.subscribe('inventory:useItem', ({ uid }) => {
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
        this.eventBus.emit('inventory:remove', { item });
      }

      if (item.id === 'ripped_sheets') {
        this.world.removeFlag('wounded');
        this.eventBus.emit('status:cureCondition', { id: 'bleeding_wound', remedy: 'Ripped Cloth Sheet' });
        this.eventBus.emit('player:modifyVitality', {
          amount: 2,
          source: 'Bandaged with Cloth Sheet'
        });
      } else if (item.id === 'herbal_poultice') {
        this.world.removeFlag('wounded');
        this.world.removeFlag('spirit_hexed');
        this.eventBus.emit('status:cureCondition', { id: 'bleeding_wound', remedy: 'Herbal Poultice' });
        this.eventBus.emit('status:cureCondition', { id: 'infected_aswang_bite', remedy: 'Herbal Poultice' });
        this.eventBus.emit('player:modifyVitality', {
          amount: 5,
          source: 'Bayabas & Lana Herbal Poultice'
        });
      } else if (item.id === 'bayabas_herbs') {
        this.world.removeFlag('wounded');
        this.eventBus.emit('status:cureCondition', { id: 'infected_aswang_bite', remedy: 'Bayabas Antiseptic' });
        this.eventBus.emit('player:modifyVitality', {
          amount: 2,
          source: 'Applied Guava (Bayabas) Antiseptic'
        });
      } else if (item.id === 'blessed_lana_vial') {
        this.world.removeFlag('spirit_hexed');
        this.world.removeFlag('wounded');
        this.world.setFlag('aswang_ward');
        this.world.setFlag('spirit_ward_item');
        this.eventBus.emit('status:cureCondition', { id: 'infected_aswang_bite', remedy: 'Sacred Lana' });
        this.eventBus.emit('status:cureCondition', { id: 'bleeding_wound', remedy: 'Sacred Lana' });
        this.eventBus.emit('player:modifyVitality', {
          amount: 3,
          source: 'Anointed with Sacred Coconut Oil (Lana)'
        });
        this.eventBus.emit('danger:modifyHeat', {
          delta: -20,
          source: 'Sacred Lana Anointing'
        });
      } else if (item.id === 'coarse_salt_pouch') {
        this.world.setFlag('salt_ward');
        this.world.setFlag('aswang_counter');
        this.eventBus.emit('danger:modifyHeat', {
          delta: -15,
          source: 'Scattered Sea Salt Ward'
        });
        this.eventBus.emit('log:mechanical', {
          type: 'status_apply',
          text: 'Scattered Coarse Sea Salt! Aswang and Wakwak wards active.'
        });
      } else if (item.id === 'bamboo_torch' || item.id === 'bamboo_resin_torch') {
        this.world.setFlag('has_light_source');
        this.world.setFlag('light_source');
        this.eventBus.emit('status:cureCondition', { id: 'soaked_hypothermia', remedy: 'Resin Torch Warmth' });
        this.eventBus.emit('log:mechanical', {
          type: 'status_apply',
          text: 'Ignited Resin-Soaked Bamboo Torch! Dark jungle paths illuminated and damp chill repelled.'
        });
      } else if (item.id === 'brass_agung_gong') {
        this.world.setFlag('acoustic_shock');
        this.world.setFlag('bakunawa_ward');
        this.world.setFlag('drums_secured');
        this.eventBus.emit('danger:modifyHeat', {
          delta: 20,
          source: 'Resounding Bronze Agung Strike'
        });
        this.eventBus.emit('log:mechanical', {
          type: 'status_apply',
          text: 'Struck Bronze Agung Gong! Acoustic shockwave reverberates across the field (+20 Panganib Heat).'
        });
      }

      this._syncEquipmentState(player);
    });

    this.subscribe('inventory:washBloodied', () => {
      const player = this.world.getEntity('player');
      if (!player) return;
      const inv = player.getComponent('Inventory');
      if (!inv) return;

      let washedCount = 0;
      for (const item of inv.items) {
        if (item.isBloodied || (item.tags && item.tags.includes('bloodied'))) {
          item.isBloodied = false;
          if (item.tags) {
            item.tags = item.tags.filter((t) => t !== 'bloodied');
          }
          washedCount += 1;
        }
      }
      this.world.removeFlag('blood_scent');
      this.eventBus.emit('danger:modifyHeat', {
        delta: -25,
        source: 'Washed Bloodied Gear in River'
      });
      this._syncEquipmentState(player);
      this.eventBus.emit('log:mechanical', {
        type: 'status_apply',
        text: `River water washed ${washedCount} bloodied garments and blades. Spirit scent dispersed.`
      });
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

      // Propagate utility flags from inventory items to satisfy scenario tag requirements
      if (Array.isArray(item.tags)) {
        for (const t of item.tags) {
          if (trackedItemFlags.includes(t)) {
            this.world.setFlag(t);
          }
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
