/**
 * EventBus.js
 * Central publish-subscribe event bus for decoupled communication
 * between ECS systems, the NarrativeDirector, and UI components.
 */

export class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event topic.
   * @param {string} eventName
   * @param {Function} callback
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);

    return () => this.off(eventName, callback);
  }

  /**
   * Subscribe to an event topic once.
   * @param {string} eventName
   * @param {Function} callback
   */
  once(eventName, callback) {
    const wrapper = (payload) => {
      this.off(eventName, wrapper);
      callback(payload);
    };
    this.on(eventName, wrapper);
  }

  /**
   * Unsubscribe a callback from an event topic.
   * @param {string} eventName
   * @param {Function} callback
   */
  off(eventName, callback) {
    const set = this.listeners.get(eventName);
    if (!set) return;
    set.delete(callback);
    if (set.size === 0) {
      this.listeners.delete(eventName);
    }
  }

  /**
   * Emit an event with an optional data payload.
   * @param {string} eventName
   * @param {*} payload
   */
  emit(eventName, payload = {}) {
    const set = this.listeners.get(eventName);
    if (!set) return;
    for (const callback of [...set]) {
      callback(payload);
    }
  }

  /**
   * Clear all registered listeners.
   */
  clear() {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();

