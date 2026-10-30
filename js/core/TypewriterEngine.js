/**
 * TypewriterEngine.js
 * Streams narrative paragraphs character-by-character into a container,
 * supporting instant skip and emitting lifecycle events via EventBus.
 */

import { annotateMythologyTerms } from '../data/MythologyCodex.js';

export class TypewriterEngine {
  /**
   * @param {HTMLElement} containerElement
   * @param {import('./EventBus.js').EventBus} eventBus
   * @param {Object} options
   */
  constructor(containerElement, eventBus, options = {}) {
    this.container = containerElement;
    this.eventBus = eventBus;
    this.charDelay = options.charDelay ?? 14;
    this.isTyping = false;
    this.timerId = null;
    this.currentParagraph = null;
    this.fullTextQueue = [];
    this.currentFullText = '';
    this.charIndex = 0;
    this.onCompleteCallback = null;
  }

  /**
   * Clear the narrative container and stop any active typing.
   */
  clear() {
    this.stop();
    if (this.container) {
      this.container.innerHTML = '';
    }
  }

  /**
   * Queue one or more paragraphs to be typed sequentially.
   * @param {string|string[]} paragraphs
   * @param {Function} [onComplete]
   */
  typeParagraphs(paragraphs, onComplete = null) {
    this.stop();
    const list = Array.isArray(paragraphs) ? paragraphs : [paragraphs];
    this.fullTextQueue = [...list];
    this.onCompleteCallback = onComplete;
    this.isTyping = true;

    if (this.eventBus) {
      this.eventBus.emit('typewriter:start');
    }

    this._nextParagraph();
  }

  _nextParagraph() {
    if (this.fullTextQueue.length === 0) {
      this._finishAll();
      return;
    }

    this.currentFullText = this.fullTextQueue.shift();
    this.charIndex = 0;

    this.currentParagraph = document.createElement('p');
    this.currentParagraph.className = 'narrative-paragraph typing-active';
    this.container.appendChild(this.currentParagraph);

    this._step();
  }

  _step() {
    if (!this.isTyping) return;

    if (this.charIndex < this.currentFullText.length) {
      const ch = this.currentFullText.charAt(this.charIndex);
      this.currentParagraph.textContent += ch;
      this.charIndex += 1;

      if (this.eventBus && this.charIndex % 3 === 0 && ch.trim() !== '') {
        this.eventBus.emit('typewriter:tick');
      }

      this.timerId = window.setTimeout(() => this._step(), this.charDelay);
    } else {
      this.currentParagraph.classList.remove('typing-active');
      annotateMythologyTerms(this.currentParagraph);
      this.timerId = window.setTimeout(() => this._nextParagraph(), 100);
    }
  }

  /**
   * Immediately finish typing all remaining text in the queue.
   */
  skipToEnd() {
    if (!this.isTyping) return;

    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }

    if (this.currentParagraph) {
      this.currentParagraph.textContent = this.currentFullText;
      this.currentParagraph.classList.remove('typing-active');
      annotateMythologyTerms(this.currentParagraph);
    }

    while (this.fullTextQueue.length > 0) {
      const text = this.fullTextQueue.shift();
      const p = document.createElement('p');
      p.className = 'narrative-paragraph';
      p.textContent = text;
      annotateMythologyTerms(p);
      this.container.appendChild(p);
    }

    this._finishAll();
  }

  stop() {
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.isTyping = false;
    this.fullTextQueue = [];
  }

  _finishAll() {
    this.isTyping = false;
    this.currentParagraph = null;
    if (this.eventBus) {
      this.eventBus.emit('typewriter:complete');
    }
    if (typeof this.onCompleteCallback === 'function') {
      const cb = this.onCompleteCallback;
      this.onCompleteCallback = null;
      cb();
    }
  }
}
