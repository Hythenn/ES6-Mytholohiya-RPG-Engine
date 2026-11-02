/**
 * ECS.js
 * Lightweight Entity-Component-System architecture for managing
 * character state, attributes, inventory, and world flags.
 */

import { isCreature, getMythologyEntry } from '../data/lore/MythologyCodex.js';

export class Component {
  constructor(type, data = {}) {
    this.type = type;
    Object.assign(this, data);
  }
}

export class Entity {
  constructor(id, name = 'Entity') {
    this.id = id;
    this.name = name;
    this.components = new Map();
  }

  addComponent(component) {
    this.components.set(component.type, component);
    return this;
  }

  getComponent(type) {
    return this.components.get(type) || null;
  }

  hasComponent(type) {
    return this.components.has(type);
  }

  removeComponent(type) {
    this.components.delete(type);
    return this;
  }
}

export class System {
  constructor(world, eventBus) {
    this.world = world;
    this.eventBus = eventBus;
  }

  init() {}

  update(_dt) {}
}

export class World {
  constructor(eventBus) {
    this.eventBus = eventBus;
    this.entities = new Map();
    this.systems = [];
    this.flags = new Set();
    this.knownCreatures = new Set();
    this.pendingCreatureTales = new Set();
  }

  createEntity(id, name) {
    const entity = new Entity(id, name);
    this.entities.set(id, entity);
    return entity;
  }

  getEntity(id) {
    return this.entities.get(id) || null;
  }

  registerSystem(system) {
    this.systems.push(system);
    system.init();
    return this;
  }

  update(dt = 0) {
    for (const system of this.systems) {
      system.update(dt);
    }
  }

  setFlag(flag) {
    this.flags.add(flag);
    if (this.eventBus) {
      this.eventBus.emit('world:flagAdded', { flag, flags: [...this.flags] });
    }
  }

  removeFlag(flag) {
    this.flags.delete(flag);
    if (this.eventBus) {
      this.eventBus.emit('world:flagRemoved', { flag, flags: [...this.flags] });
    }
  }

  hasFlag(flag) {
    return this.flags.has(flag);
  }

  unlockCreatureKnowledge(creatureId) {
    if (!creatureId) return;
    const ids = Array.isArray(creatureId) ? creatureId : [creatureId];
    for (const id of ids) {
      if (!this.knownCreatures.has(id)) {
        this.knownCreatures.add(id);
        this.setFlag(`known_creature_${id}`);
        const entry = getMythologyEntry(id);
        const name = entry ? entry.name : id;
        if (this.eventBus) {
          this.eventBus.emit('codex:creatureDiscovered', {
            creatureId: id,
            name,
            entry,
            knownCount: this.knownCreatures.size
          });
          this.eventBus.emit('log:mechanical', {
            type: 'creature_discovery',
            text: `❖ CODEX DISCOVERY: Knowledge of the ${name} unlocked in your Codex!`
          });
        }
      }
    }
  }

  hasCreatureKnowledge(creatureId) {
    if (!creatureId) return true;
    if (!isCreature(creatureId)) return true;
    return this.knownCreatures.has(creatureId);
  }

  recordPendingCreatureTale(creatureId) {
    if (!creatureId) return;
    const ids = Array.isArray(creatureId) ? creatureId : [creatureId];
    for (const id of ids) {
      if (!this.knownCreatures.has(id)) {
        this.pendingCreatureTales.add(id);
        this.setFlag(`has_unidentified_tale_${id}`);
        this.setFlag('has_pending_creature_tales');
      }
    }
  }

  hasPendingCreatureTales() {
    return this.pendingCreatureTales.size > 0;
  }

  getPendingCreatureTales() {
    return Array.from(this.pendingCreatureTales);
  }

  resolveCreatureTale(creatureId) {
    if (!creatureId) return;
    const ids = Array.isArray(creatureId) ? creatureId : [creatureId];
    for (const id of ids) {
      this.pendingCreatureTales.delete(id);
      this.removeFlag(`has_unidentified_tale_${id}`);
      this.unlockCreatureKnowledge(id);
    }
    if (this.pendingCreatureTales.size === 0) {
      this.removeFlag('has_pending_creature_tales');
    }
  }
}

