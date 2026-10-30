/**
 * app.js
 * Application entry point for "Mytholohiya".
 * Features:
 * - Procedural Web Audio API Dark Reverb SFX + Continuous Ambient Weather/Time Soundscape Engine
 * - Real-time Pixel-Art Weather, Time-of-Day & Audio Spectrum Visualizers
 * - Launch "START" & "OPTIONS" Screen
 * - 3 Character Creation Flows (Preset Backgrounds w/ Random Name, Randomized Unique, Custom Creator)
 * - Baldur's Gate Attributes (Strength, Dexterity, Constitution, Intelligence, Wisdom, Charisma)
 * - Project Zomboid-inspired Interactive Inventory & 14-Slot Equipment System
 * - Dedicated Character Info & Equipment Modal
 * - Dynamic Floating Action Choices Dock following the screen on scroll
 */

import { eventBus } from './core/EventBus.js';
import { World, Component } from './core/ECS.js';
import { TypewriterEngine } from './core/TypewriterEngine.js';
import {
  VitalitySystem,
  RemnantSystem,
  InventorySystem,
  EQUIPMENT_SLOTS
} from './mechanics/Systems.js';
import { StatResolver } from './mechanics/StatResolver.js';
import {
  NarrativeRegistry,
  HierarchicalProbabilisticNarrativeDirector
} from './narrative/NarrativeDirector.js';
import {
  PlayerBackgrounds,
  STAT_DEFINITIONS,
  EXPERTISE_OPTIONS,
  generateRandomName,
  rollRandomSocialStatus
} from './data/PlayerBackgrounds.js';
import {
  MYTHOLOGY_CODEX,
  getMythologyEntry,
  annotateMythologyTerms
} from './data/MythologyCodex.js';
import './data/ScenarioData.js';
import './data/MiscScenarios.js';

const ENTITY_ECHO_LABELS = Object.freeze({
  helped_nuno: {
    title: 'Nuno of the Red Clay',
    desc: 'The earth-elder remembers the hand that freed his beard.'
  },
  slighted_nuno: {
    title: 'Wrath of the Punso',
    desc: 'A crooked shadow dogs your heels along the earthen banks.'
  },
  tamaraw_kinship: {
    title: 'Sovereign of the Ridge',
    desc: 'The wild tamaraw freed from iron snares roams nearby.'
  },
  diwata_remembered: {
    title: 'Diwata of Tinago',
    desc: 'A white butterfly of the sacred headwaters lingers on your trail.'
  },
  diwata_displeased: {
    title: 'Chill of the Cataract',
    desc: 'The mountain waters darkened at your intrusion.'
  },
  unbound_mangrove_anito: {
    title: 'Unbound Mangrove Anito',
    desc: 'Bioluminescent tide-spirits owe your blade a debt.'
  },
  ignored_mangrove_anito: {
    title: 'The Blinded Roots',
    desc: 'You left the nailed spirit weeping in the swamp.'
  },
  helped_salt_boy: {
    title: 'The Salt-Boiler Apprentice',
    desc: 'Word of your mercy traveled ahead to the village scouts.'
  },
  abandoned_salt_boy: {
    title: 'Silent Witness on the Flats',
    desc: 'You took the brine-tax and left the survivor trembling.'
  },
  knows_reed_warning: {
    title: 'Scroll of the Hollow Root',
    desc: 'You carry the Baybayin warning against voices in the sedge.'
  },
  weaver_omen: {
    title: 'The Habihan Shuttle',
    desc: 'You completed the final row of the forgotten weaver.'
  },
  bulul_blessed: {
    title: 'Bulul of the Cloud-Terraces',
    desc: 'The wooden granary guardians recognize your respect.'
  },
  mumbaki_blessing: {
    title: 'Chant of the Mumbaki',
    desc: 'The highland gong-priest blessed your descent.'
  },
  outwitted_tambaluslos: {
    title: 'Laughter of the Tambaluslos',
    desc: 'Your reversed seams left the wide-mouthed trickster blinded by its own grin.'
  },
  tamed_tikbalang: {
    title: 'Golden Spine of the Tikbalang',
    desc: 'A plucked golden hair binds the wildwood stallion-spirit to your oath.'
  },
  kapre_boon: {
    title: 'Ember of the Acacia Kapre',
    desc: 'The nine-foot tree giant parted his Hamog smoke for your road.'
  },
  oryol_alliance: {
    title: 'Truce of Oryol',
    desc: 'The half-serpent enchantress of Ibalong respects your strategic resolve.'
  }
});

const OMEN_TAG_LABELS = Object.freeze({
  raining: 'Monsoon Downpour',
  clear_sky: 'Parted Clouds',
  fog_gathering: 'Creeping Spirit-Mist',
  rain_stopping: 'Thinning Drizzle',
  muddy_ground: 'Sunken Mire',
  high_ground: 'Wind-Scoured Ridge',
  wounded: 'Bleeding Wound',
  spirit_hexed: 'Lingering Bati Hex',
  clothing_inside_out: 'Garment Worn Inside-Out',
  salt_ward: 'Warded with Coarse Salt',
  cautious: 'Wary Footsteps',
  steady_nerves: 'Unshaken Resolve',
  spirit_respect: 'Honored the Unseen',
  kapwa_bond: 'Shared Kinship',
  kubo_hearth: 'Warmth of the Kubo Hearth',
  field_tent: 'Wind-Lashed Shelter',
  crowded_settlement: 'Murmur of the Kedatuan'
});

/**
 * Procedural Dark Fantasy Reverb Sound & Continuous Weather/Time Ambient Engine.
 */
class DarkReverbAudioEngine {
  constructor() {
    this.ctx = null;
    this.convolver = null;
    this.masterGain = null;
    this.analyser = null;
    this.freqData = null;

    this.sfxEnabled = true;
    this.ambientEnabled = true;

    // Continuous Ambient Nodes
    this.ambientGain = null;
    this.noiseBuffer = null;
    this.noiseSource = null;
    this.noiseFilter = null;
    this.droneOsc1 = null;
    this.droneOsc2 = null;
    this.droneGain = null;
    this.ambientIntervalId = null;
    this.currentWeather = 'DRIZZLE';
    this.currentTimeOfDay = 'DUSK';
    this.currentEnvironment = 'OUTDOOR';
  }

  _ensureContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return false;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.48;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.78;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // 2.4s Dark Cavern Reverb Impulse
      this.convolver = this.ctx.createConvolver();
      const rate = this.ctx.sampleRate;
      const length = Math.floor(rate * 2.4);
      const impulse = this.ctx.createBuffer(2, length, rate);
      for (let ch = 0; ch < 2; ch += 1) {
        const data = impulse.getChannelData(ch);
        for (let i = 0; i < length; i += 1) {
          const decay = Math.pow(1 - i / length, 2.8);
          data[i] = (Math.random() * 2 - 1) * decay * 0.45;
        }
      }
      this.convolver.buffer = impulse;

      const reverbFilter = this.ctx.createBiquadFilter();
      reverbFilter.type = 'lowpass';
      reverbFilter.frequency.value = 950;

      this.convolver.connect(reverbFilter);
      reverbFilter.connect(this.masterGain);

      this._initAmbientGraph();
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return true;
  }

  _initAmbientGraph() {
    if (!this.ctx || this.ambientGain) return;

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.value = this.ambientEnabled ? 0.28 : 0.0001;
    this.ambientGain.connect(this.masterGain);

    // Looping Pink-ish Noise Buffer for Rain / Wind / Surf
    const bufferSize = this.ctx.sampleRate * 4;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    for (let i = 0; i < bufferSize; i += 1) {
      const white = Math.random() * 2 - 1;
      b0 = 0.997 * b0 + white * 0.029;
      b1 = 0.985 * b1 + white * 0.032;
      b2 = 0.950 * b2 + white * 0.048;
      output[i] = (b0 + b1 + b2 + white * 0.015) * 0.35;
    }

    this.noiseBuffer = noiseBuffer;
    this.noiseSource = this.ctx.createBufferSource();
    this.noiseSource.buffer = noiseBuffer;
    this.noiseSource.loop = true;

    this.noiseFilter = this.ctx.createBiquadFilter();
    this.noiseFilter.type = 'bandpass';
    this.noiseFilter.frequency.value = 650;
    this.noiseFilter.Q.value = 0.9;

    this.noiseSource.connect(this.noiseFilter);
    this.noiseFilter.connect(this.ambientGain);
    this.noiseSource.start(0);

    // Subtle Atmospheric Drone Oscillators for Spirit Fog & Night Depth
    this.droneGain = this.ctx.createGain();
    this.droneGain.gain.value = 0.04;
    this.droneGain.connect(this.ambientGain);

    this.droneOsc1 = this.ctx.createOscillator();
    this.droneOsc2 = this.ctx.createOscillator();
    this.droneOsc1.type = 'sine';
    this.droneOsc2.type = 'triangle';
    this.droneOsc1.frequency.value = 73.42; // D2
    this.droneOsc2.frequency.value = 110.0; // A2

    const droneFilter = this.ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 260;

    this.droneOsc1.connect(droneFilter);
    this.droneOsc2.connect(droneFilter);
    droneFilter.connect(this.droneGain);

    this.droneOsc1.start(0);
    this.droneOsc2.start(0);

    // Periodic ambient detail generator (hearth fire, tent wind gusts, crowd chatter, thunder, crickets)
    this.ambientIntervalId = window.setInterval(() => {
      if (!this.ambientEnabled || !this.ctx || this.ctx.state !== 'running') return;
      this._triggerAmbientDetail();
    }, 1150);
  }

  /**
   * Morph continuous ambient soundscape based on scenario Weather, Time of Day, and Environment.
   * @param {string} weather - 'DRIZZLE' | 'MONSOON' | 'SPIRIT FOG' | 'CLEAR'
   * @param {string} timeOfDay - 'DUSK' | 'NIGHT' | 'MIDNIGHT' | 'PRE-DAWN' | 'DAY'
   * @param {string} [environment='OUTDOOR'] - 'OUTDOOR' | 'CABIN' | 'TENT' | 'CITY'
   */
  setAmbientEnvironment(weather = 'DRIZZLE', timeOfDay = 'DUSK', environment = 'OUTDOOR') {
    this.currentWeather = weather;
    this.currentTimeOfDay = timeOfDay;
    this.currentEnvironment = environment || 'OUTDOOR';
    if (!this._ensureContext() || !this.noiseFilter || !this.droneGain) return;

    const now = this.ctx.currentTime;

    // Time-of-day pitch root for the subtle atmospheric undertone
    const rootByTime = {
      DAY: 98.0, // G2
      DUSK: 73.42, // D2
      NIGHT: 65.41, // C2
      MIDNIGHT: 55.0, // A1 (Deep Eclipse drone)
      'PRE-DAWN': 82.41 // E2
    };
    let baseFreq = rootByTime[timeOfDay] || 73.42;
    if (this.currentEnvironment === 'CABIN') {
      baseFreq = 110.0; // Warm wooden kubo resonance (A2)
    } else if (this.currentEnvironment === 'CITY') {
      baseFreq = 87.31; // Bustling settlement undertone (F2)
    }
    this.droneOsc1.frequency.setTargetAtTime(baseFreq, now, 2.2);
    this.droneOsc2.frequency.setTargetAtTime(baseFreq * 1.5, now, 2.2);

    if (this.currentEnvironment === 'CABIN') {
      // Muffled indoor kubo warmth with gentle hearth bed
      this.noiseFilter.type = 'lowpass';
      const muffledCutoff = weather === 'MONSOON' ? 390 : weather === 'DRIZZLE' ? 310 : 250;
      this.noiseFilter.frequency.setTargetAtTime(muffledCutoff, now, 2.2);
      this.noiseFilter.Q.setTargetAtTime(1.25, now, 2.2);
      this.droneGain.gain.setTargetAtTime(0.055, now, 2.2);
    } else if (this.currentEnvironment === 'TENT') {
      // Windy canvas shelter resonance
      this.noiseFilter.type = 'bandpass';
      const windCenter = weather === 'MONSOON' ? 680 : weather === 'DRIZZLE' ? 560 : 470;
      this.noiseFilter.frequency.setTargetAtTime(windCenter, now, 2.2);
      this.noiseFilter.Q.setTargetAtTime(1.65, now, 2.2);
      this.droneGain.gain.setTargetAtTime(0.05, now, 2.2);
    } else if (this.currentEnvironment === 'CITY') {
      // Warm settlement hubbub bed
      this.noiseFilter.type = 'bandpass';
      const cityCenter = weather === 'MONSOON' ? 620 : weather === 'DRIZZLE' ? 520 : 440;
      this.noiseFilter.frequency.setTargetAtTime(cityCenter, now, 2.2);
      this.noiseFilter.Q.setTargetAtTime(0.85, now, 2.2);
      this.droneGain.gain.setTargetAtTime(0.045, now, 2.2);
    } else if (weather === 'MONSOON') {
      // Heavy driving rain + strong wind resonance (gradually builds up)
      this.noiseFilter.type = 'bandpass';
      this.noiseFilter.frequency.setTargetAtTime(880, now, 2.2);
      this.noiseFilter.Q.setTargetAtTime(0.55, now, 2.2);
      this.droneGain.gain.setTargetAtTime(0.06, now, 2.2);
    } else if (weather === 'DRIZZLE') {
      // Gentle rain patter on foliage (gradually builds up or calms down)
      this.noiseFilter.type = 'bandpass';
      this.noiseFilter.frequency.setTargetAtTime(1150, now, 2.2);
      this.noiseFilter.Q.setTargetAtTime(1.4, now, 2.2);
      this.droneGain.gain.setTargetAtTime(0.04, now, 2.2);
    } else if (weather === 'SPIRIT FOG') {
      // Hollow, eerie low wind + prominent spirit drone
      this.noiseFilter.type = 'lowpass';
      this.noiseFilter.frequency.setTargetAtTime(340, now, 2.2);
      this.noiseFilter.Q.setTargetAtTime(3.2, now, 2.2);
      this.droneGain.gain.setTargetAtTime(0.11, now, 2.2);
    } else {
      // CLEAR sky gentle breeze (gradually calms down)
      this.noiseFilter.type = 'lowpass';
      this.noiseFilter.frequency.setTargetAtTime(240, now, 2.2);
      this.noiseFilter.Q.setTargetAtTime(1.1, now, 2.2);
      this.droneGain.gain.setTargetAtTime(0.03, now, 2.2);
    }
  }

  _playFireCrackle() {
    if (!this.ctx || !this.noiseBuffer || !this.ambientGain) return;
    const now = this.ctx.currentTime;

    // 1. Soft rustling flame swell (warm licking fire sound)
    const rustleSrc = this.ctx.createBufferSource();
    rustleSrc.buffer = this.noiseBuffer;
    const rustleFilter = this.ctx.createBiquadFilter();
    rustleFilter.type = 'bandpass';
    rustleFilter.frequency.setValueAtTime(310 + Math.random() * 90, now);
    rustleFilter.frequency.linearRampToValueAtTime(480 + Math.random() * 140, now + 0.55);
    rustleFilter.Q.value = 1.2;

    const rustleEnv = this.ctx.createGain();
    rustleEnv.gain.setValueAtTime(0.001, now);
    rustleEnv.gain.linearRampToValueAtTime(0.11, now + 0.32);
    rustleEnv.gain.exponentialRampToValueAtTime(0.002, now + 0.98);

    rustleSrc.connect(rustleFilter);
    rustleFilter.connect(rustleEnv);
    rustleEnv.connect(this.ambientGain);
    rustleSrc.start(now, Math.random() * 2.5, 1.0);

    // 2. Staggered dry bamboo / firewood ember crackles & pops
    const snapCount = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < snapCount; i += 1) {
      const offset = Math.random() * 0.95;
      const t0 = now + offset;
      const snapDur = 0.022 + Math.random() * 0.028;

      const snapSrc = this.ctx.createBufferSource();
      snapSrc.buffer = this.noiseBuffer;

      const snapFilter = this.ctx.createBiquadFilter();
      snapFilter.type = 'bandpass';
      snapFilter.frequency.setValueAtTime(1450 + Math.random() * 1650, t0);
      snapFilter.Q.value = 3.4;

      const snapEnv = this.ctx.createGain();
      const peak = 0.09 + Math.random() * 0.11;
      snapEnv.gain.setValueAtTime(0.001, t0);
      snapEnv.gain.linearRampToValueAtTime(peak, t0 + 0.004);
      snapEnv.gain.exponentialRampToValueAtTime(0.001, t0 + snapDur);

      snapSrc.connect(snapFilter);
      snapFilter.connect(snapEnv);
      snapEnv.connect(this.ambientGain);
      snapSrc.start(t0, Math.random() * 3.0, snapDur + 0.01);
    }
  }

  _playTentWindGust() {
    if (!this.ctx || !this.noiseBuffer || !this.ambientGain) return;
    const now = this.ctx.currentTime;

    // 1. Howling wind gust sweeping over taut tent canvas
    const gustSrc = this.ctx.createBufferSource();
    gustSrc.buffer = this.noiseBuffer;

    const gustFilter = this.ctx.createBiquadFilter();
    gustFilter.type = 'bandpass';
    const startFreq = 260 + Math.random() * 110;
    const peakFreq = 580 + Math.random() * 240;
    gustFilter.frequency.setValueAtTime(startFreq, now);
    gustFilter.frequency.exponentialRampToValueAtTime(peakFreq, now + 0.52);
    gustFilter.frequency.exponentialRampToValueAtTime(startFreq * 0.9, now + 1.12);
    gustFilter.Q.value = 2.4;

    const gustEnv = this.ctx.createGain();
    gustEnv.gain.setValueAtTime(0.002, now);
    gustEnv.gain.linearRampToValueAtTime(0.16, now + 0.45);
    gustEnv.gain.exponentialRampToValueAtTime(0.003, now + 1.12);

    gustSrc.connect(gustFilter);
    gustFilter.connect(gustEnv);
    gustEnv.connect(this.ambientGain);
    gustSrc.start(now, Math.random() * 2.2, 1.15);

    // 2. Subtle canvas / woven-mat flap thrum
    if (Math.random() < 0.75) {
      const flapTime = now + 0.18 + Math.random() * 0.45;
      this.playTone({
        freq: 68 + Math.random() * 22,
        slideTo: 38,
        type: 'triangle',
        duration: 0.16,
        gain: 0.065,
        wet: false,
        isAmbient: true
      });
    }
  }

  _playCrowdChatter() {
    if (!this.ctx || !this.noiseBuffer || !this.ambientGain) return;
    const now = this.ctx.currentTime;

    // Synthesize 3 to 5 overlapping soft vocal-formant murmur phrases
    const voices = 3 + Math.floor(Math.random() * 3);
    for (let v = 0; v < voices; v += 1) {
      const startOffset = Math.random() * 0.75;
      const syllables = 2 + Math.floor(Math.random() * 3);
      const sylDur = 0.08 + Math.random() * 0.055;
      const totalDur = syllables * sylDur + 0.06;
      const t0 = now + startOffset;

      const voiceSrc = this.ctx.createBufferSource();
      voiceSrc.buffer = this.noiseBuffer;

      // Vocal formant filter (human speech chest/vowel band 340Hz - 880Hz)
      const formant = this.ctx.createBiquadFilter();
      formant.type = 'bandpass';
      const baseVowel = 360 + Math.random() * 420;
      formant.frequency.setValueAtTime(baseVowel, t0);
      formant.Q.value = 4.2;

      const voiceEnv = this.ctx.createGain();
      voiceEnv.gain.setValueAtTime(0.001, t0);

      for (let s = 0; s < syllables; s += 1) {
        const st = t0 + s * sylDur;
        const sylPeak = 0.045 + Math.random() * 0.035;
        formant.frequency.linearRampToValueAtTime(
          baseVowel * (0.85 + Math.random() * 0.34),
          st + sylDur * 0.5
        );
        voiceEnv.gain.linearRampToValueAtTime(sylPeak, st + sylDur * 0.35);
        voiceEnv.gain.linearRampToValueAtTime(0.008, st + sylDur * 0.92);
      }
      voiceEnv.gain.exponentialRampToValueAtTime(0.0008, t0 + totalDur);

      voiceSrc.connect(formant);
      formant.connect(voiceEnv);
      voiceEnv.connect(this.ambientGain);
      if (this.convolver) {
        voiceEnv.connect(this.convolver);
      }
      voiceSrc.start(t0, Math.random() * 2.5, totalDur + 0.02);

      // Soft voiced larynx murmur undertone
      const pitchOsc = this.ctx.createOscillator();
      const pitchGain = this.ctx.createGain();
      pitchOsc.type = 'triangle';
      const fundFreq = 115 + Math.random() * 115;
      pitchOsc.frequency.setValueAtTime(fundFreq, t0);
      pitchOsc.frequency.linearRampToValueAtTime(
        fundFreq * (0.92 + Math.random() * 0.16),
        t0 + totalDur
      );
      pitchGain.gain.setValueAtTime(0.0005, t0);
      pitchGain.gain.linearRampToValueAtTime(0.012, t0 + totalDur * 0.4);
      pitchGain.gain.exponentialRampToValueAtTime(0.0005, t0 + totalDur);

      pitchOsc.connect(formant);
      pitchOsc.start(t0);
      pitchOsc.stop(t0 + totalDur + 0.02);
    }

    // Occasional distant merchant scale chime or wooden cart tap
    if (Math.random() < 0.25) {
      const notes = [523.25, 587.33, 659.25];
      const pick = notes[Math.floor(Math.random() * notes.length)];
      this.playTone({
        freq: pick,
        type: 'sine',
        duration: 0.45,
        gain: 0.022,
        wet: true,
        isAmbient: true
      });
    }
  }

  _triggerAmbientDetail() {
    const w = this.currentWeather;
    const t = this.currentTimeOfDay;
    const env = this.currentEnvironment || 'OUTDOOR';

    if (env === 'CABIN') {
      this._playFireCrackle();
      if (w === 'MONSOON' && Math.random() < 0.22) {
        // Muffled distant outdoor thunder
        this.playTone({
          freq: 46,
          slideTo: 30,
          type: 'triangle',
          duration: 1.4,
          gain: 0.065,
          wet: true,
          isAmbient: true
        });
      }
      return;
    }

    if (env === 'TENT') {
      this._playTentWindGust();
      if (w === 'MONSOON' && Math.random() < 0.3) {
        this.playTone({
          freq: 50,
          slideTo: 33,
          type: 'sawtooth',
          duration: 1.5,
          gain: 0.09,
          wet: true,
          isAmbient: true
        });
      }
      return;
    }

    if (env === 'CITY') {
      this._playCrowdChatter();
      return;
    }

    if (w === 'MONSOON' && Math.random() < 0.35) {
      // Distant rolling thunder rumble
      this.playTone({
        freq: 52,
        slideTo: 34,
        type: 'sawtooth',
        duration: 1.6,
        gain: 0.14,
        wet: true,
        isAmbient: true
      });
    } else if (w === 'SPIRIT FOG' && Math.random() < 0.45) {
      // Hollow bamboo / spirit chime overtone
      const notes = [293.66, 329.63, 392.0, 440.0];
      const pick = notes[Math.floor(Math.random() * notes.length)];
      this.playTone({
        freq: pick,
        type: 'sine',
        duration: 1.2,
        gain: 0.045,
        wet: true,
        isAmbient: true
      });
    } else if ((t === 'DUSK' || t === 'NIGHT' || t === 'MIDNIGHT') && w !== 'MONSOON' && Math.random() < 0.5) {
      // Night cricket stridulation pulse
      this.playTone({
        freq: 2400,
        slideTo: 2550,
        type: 'sine',
        duration: 0.08,
        gain: 0.02,
        wet: true,
        isAmbient: true
      });
    }
  }

  toggleSfx() {
    this.sfxEnabled = !this.sfxEnabled;
    return this.sfxEnabled;
  }

  toggleAmbient() {
    this.ambientEnabled = !this.ambientEnabled;
    if (this._ensureContext() && this.ambientGain) {
      this.ambientGain.gain.setTargetAtTime(
        this.ambientEnabled ? 0.28 : 0.0001,
        this.ctx.currentTime,
        0.25
      );
    }
    return this.ambientEnabled;
  }

  getFrequencyData() {
    if (!this.analyser || !this.freqData) return null;
    this.analyser.getByteFrequencyData(this.freqData);
    return this.freqData;
  }

  playTone({
    freq = 140,
    type = 'triangle',
    duration = 0.25,
    gain = 0.22,
    wet = true,
    slideTo = null,
    isAmbient = false
  }) {
    if (isAmbient && !this.ambientEnabled) return;
    if (!isAmbient && !this.sfxEnabled) return;
    if (!this._ensureContext()) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }

    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(gain, now + 0.015);
    env.gain.exponentialRampToValueAtTime(0.0008, now + duration);

    osc.connect(env);
    env.connect(this.masterGain);
    if (wet && this.convolver) {
      env.connect(this.convolver);
    }

    osc.start(now);
    osc.stop(now + duration + 0.04);
  }

  playClick() {
    this.playTone({ freq: 165, slideTo: 82, type: 'square', duration: 0.14, gain: 0.15, wet: true });
  }

  playHover() {
    this.playTone({ freq: 110, slideTo: 125, type: 'sine', duration: 0.09, gain: 0.06, wet: true });
  }

  playTypeTick() {
    this.playTone({ freq: 210 + Math.random() * 35, type: 'triangle', duration: 0.032, gain: 0.04, wet: false });
  }

  playStartGong() {
    this.playTone({ freq: 73.42, slideTo: 55.0, type: 'sawtooth', duration: 1.4, gain: 0.22, wet: true });
    this.playTone({ freq: 110.0, type: 'triangle', duration: 1.8, gain: 0.16, wet: true });
    this.playTone({ freq: 164.81, type: 'sine', duration: 2.1, gain: 0.11, wet: true });
  }

  playSceneTransition() {
    this.playTone({ freq: 98.0, slideTo: 73.42, type: 'triangle', duration: 0.9, gain: 0.16, wet: true });
  }

  playCheckOutcome(success) {
    if (success) {
      this.playTone({ freq: 196.0, type: 'triangle', duration: 0.55, gain: 0.2, wet: true });
      setTimeout(() => {
        this.playTone({ freq: 293.66, type: 'sine', duration: 0.85, gain: 0.2, wet: true });
      }, 90);
    } else {
      this.playTone({ freq: 116.54, slideTo: 65.41, type: 'sawtooth', duration: 0.85, gain: 0.2, wet: true });
    }
  }
}

/**
 * Expanded Pixel-Art Weather & Time-of-Day Visualizer with Full-UI Bleeding Glow
 * and Full-Viewport Ambient Background Visualizer (`#ambient-bleed-canvas`).
 */
class AtmosphereVisualizer {
  constructor(skyCanvas, bleedCanvas) {
    this.skyCanvas = skyCanvas;
    this.bleedCanvas = bleedCanvas;
    this.screenMode = 'MAP';
    this.weather = 'DRIZZLE';
    this.timeOfDay = 'DUSK';
    this.environment = 'OUTDOOR';
    this.particles = [];
    this.bgParticles = [];
    this.mapRipples = [];
    this.tick = 0;

    for (let i = 0; i < 76; i += 1) {
      this.particles.push({
        x: Math.random() * 640,
        y: Math.random() * 132,
        speedX: -0.6 - Math.random() * 1.4,
        speedY: 1.4 + Math.random() * 2.4,
        size: Math.random() > 0.45 ? 2 : 1,
        phase: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < 110; i += 1) {
      this.bgParticles.push({
        x: Math.random() * 480,
        y: Math.random() * 270,
        speedX: -0.4 - Math.random() * 1.1,
        speedY: 0.9 + Math.random() * 1.8,
        size: Math.random() > 0.5 ? 2 : 1,
        phase: Math.random() * Math.PI * 2
      });
    }

    for (let i = 0; i < 18; i += 1) {
      this.mapRipples.push({
        x: 40 + Math.random() * 400,
        y: 25 + Math.random() * 220,
        r: Math.random() * 7,
        maxR: 5 + Math.random() * 5
      });
    }

    this._initArchipelagoGeometry();
    this.targetColorState = this._computeTargetColorState();
    this.currentColorState = this._cloneColorState(this.targetColorState);
    this.targetWeatherState = this._computeTargetWeatherState();
    this.currentWeatherState = { ...this.targetWeatherState };
    this._applyCssVariablesFromState(this.currentColorState);
    this._animate = this._animate.bind(this);
    requestAnimationFrame(this._animate);
  }

  setScreenMode(mode) {
    this.screenMode = mode === 'GAMEPLAY' ? 'GAMEPLAY' : 'MAP';
    this._syncBleedingGlow();
  }

  _initArchipelagoGeometry() {
    // Comprehensive pixel-art polygon silhouettes for the Philippine Archipelago
    // and surrounding Western, Northern, Southern, and Eastern sea island chains
    // spanning the entire 480x270 canvas.
    this.archipelagoIslands = [
      // --- FAR NORTH & BATANES / BABUYAN CHAINS ---
      {
        name: 'NORTH_CAPE_ISLE',
        pts: [[204, 4], [224, 4], [228, 12], [212, 14], [202, 9]],
        peaks: [[214, 8]]
      },
      {
        name: 'ITBAYAT',
        pts: [[222, 16], [228, 16], [227, 21], [221, 20]],
        peaks: []
      },
      {
        name: 'BATAN_SABTANG',
        pts: [[231, 20], [237, 20], [236, 25], [230, 24]],
        peaks: []
      },
      {
        name: 'CALAYAN',
        pts: [[214, 24], [222, 24], [221, 29], [213, 28]],
        peaks: []
      },
      {
        name: 'BABUYAN_CLARO',
        pts: [[228, 26], [235, 26], [234, 31], [227, 30]],
        peaks: []
      },
      {
        name: 'CAMIGUIN_NORTE',
        pts: [[222, 30], [228, 30], [227, 34], [221, 34]],
        peaks: []
      },

      // --- LUZON & SURROUNDING ISLANDS ---
      {
        name: 'LUZON',
        pts: [
          [206, 34], [236, 34], [244, 48], [242, 70], [236, 84],
          [250, 94], [270, 104], [280, 116], [264, 120], [248, 108],
          [230, 104], [220, 94], [210, 88], [214, 78], [204, 68],
          [200, 48]
        ],
        peaks: [[218, 44], [226, 54], [234, 66], [216, 82], [264, 110]]
      },
      {
        name: 'POLILLO',
        pts: [[246, 78], [254, 78], [255, 86], [247, 86]],
        peaks: []
      },
      {
        name: 'CATANDUANES',
        pts: [[278, 96], [288, 98], [288, 108], [278, 106]],
        peaks: [[283, 102]]
      },
      {
        name: 'LUBANG',
        pts: [[192, 96], [200, 96], [199, 101], [191, 100]],
        peaks: []
      },
      {
        name: 'MARINDUQUE',
        pts: [[228, 104], [235, 104], [235, 111], [228, 111]],
        peaks: []
      },
      {
        name: 'MINDORO',
        pts: [
          [198, 104], [214, 104], [220, 120], [210, 130], [196, 118]
        ],
        peaks: [[208, 116], [212, 122]]
      },
      {
        name: 'TABLAS_ROMBLON',
        pts: [[224, 116], [230, 116], [230, 126], [224, 126]],
        peaks: []
      },
      {
        name: 'SIBUYAN',
        pts: [[233, 118], [241, 118], [241, 125], [233, 125]],
        peaks: [[237, 121]]
      },
      {
        name: 'BURIAS_TICAO',
        pts: [[244, 110], [252, 112], [250, 118], [242, 116]],
        peaks: []
      },
      {
        name: 'MASBATE',
        pts: [
          [246, 120], [258, 122], [256, 132], [245, 128]
        ],
        peaks: [[251, 125]]
      },

      // --- PALAWAN, CALAMIAN, CUYO & BALABAC ---
      {
        name: 'BUSUANGA_CORON',
        pts: [[184, 122], [195, 124], [193, 132], [182, 129]],
        peaks: [[188, 127]]
      },
      {
        name: 'CUYO_ISLES',
        pts: [[202, 136], [210, 136], [209, 142], [201, 142]],
        peaks: []
      },
      {
        name: 'CAGAYANCILLO',
        pts: [[206, 156], [213, 156], [212, 162], [205, 161]],
        peaks: []
      },
      {
        name: 'PALAWAN',
        pts: [
          [184, 134], [192, 138], [168, 170], [142, 198], [134, 192], [160, 164]
        ],
        peaks: [[176, 150], [164, 166], [148, 184]]
      },
      {
        name: 'BALABAC',
        pts: [[126, 202], [134, 202], [132, 210], [124, 209]],
        peaks: []
      },

      // --- VISAYAS ARCHIPELAGO ---
      {
        name: 'PANAY',
        pts: [
          [218, 132], [236, 132], [236, 150], [222, 154], [216, 142]
        ],
        peaks: [[224, 142], [228, 138]]
      },
      {
        name: 'GUIMARAS',
        pts: [[231, 150], [236, 150], [235, 155], [230, 154]],
        peaks: []
      },
      {
        name: 'NEGROS',
        pts: [
          [238, 140], [248, 140], [248, 166], [236, 168], [234, 156]
        ],
        peaks: [[242, 148], [241, 160]]
      },
      {
        name: 'BANTAYAN',
        pts: [[246, 132], [251, 132], [251, 137], [246, 137]],
        peaks: []
      },
      {
        name: 'CEBU',
        pts: [
          [250, 138], [256, 138], [253, 168], [248, 166]
        ],
        peaks: [[252, 152]]
      },
      {
        name: 'CAMOTES',
        pts: [[258, 146], [263, 146], [263, 151], [258, 151]],
        peaks: []
      },
      {
        name: 'BOHOL',
        pts: [
          [256, 156], [267, 156], [267, 165], [256, 165]
        ],
        peaks: [[261, 160]]
      },
      {
        name: 'SIQUIJOR',
        pts: [[248, 168], [254, 168], [254, 172], [248, 172]],
        peaks: []
      },
      {
        name: 'SAMAR',
        pts: [
          [268, 120], [286, 124], [290, 144], [276, 146], [266, 132]
        ],
        peaks: [[276, 130], [282, 138]]
      },
      {
        name: 'BILIRAN',
        pts: [[263, 133], [269, 133], [269, 138], [263, 138]],
        peaks: []
      },
      {
        name: 'LEYTE',
        pts: [
          [264, 139], [275, 141], [276, 162], [265, 160]
        ],
        peaks: [[269, 148], [271, 155]]
      },
      {
        name: 'HOMONHON_DINAGAT',
        pts: [[282, 148], [289, 148], [290, 162], [283, 160]],
        peaks: [[286, 155]]
      },
      {
        name: 'SIARGAO',
        pts: [[292, 156], [300, 156], [300, 165], [292, 164]],
        peaks: []
      },

      // --- MINDANAO, SULU & SOUTHERN SEAS ---
      {
        name: 'CAMIGUIN_SUR',
        pts: [[266, 167], [272, 167], [272, 172], [266, 172]],
        peaks: [[269, 169]]
      },
      {
        name: 'MINDANAO',
        pts: [
          [266, 172], [292, 170], [304, 184], [306, 214], [292, 228],
          [276, 236], [260, 228], [250, 212], [238, 206], [218, 214],
          [212, 206], [228, 194], [248, 192], [254, 180]
        ],
        peaks: [[276, 184], [288, 198], [270, 214], [256, 196], [294, 212]]
      },
      {
        name: 'SAMAL',
        pts: [[286, 206], [291, 206], [291, 213], [286, 213]],
        peaks: []
      },
      {
        name: 'SARANGANI_ISLES',
        pts: [[274, 239], [282, 239], [281, 245], [273, 245]],
        peaks: []
      },
      {
        name: 'BASILAN',
        pts: [[210, 215], [220, 215], [219, 222], [209, 222]],
        peaks: [[214, 218]]
      },
      {
        name: 'SULU_JOLO',
        pts: [[196, 223], [207, 223], [205, 230], [194, 230]],
        peaks: [[201, 226]]
      },
      {
        name: 'PANGUTARAN',
        pts: [[184, 216], [192, 216], [191, 222], [183, 221]],
        peaks: []
      },
      {
        name: 'TAWITAWI',
        pts: [[178, 231], [190, 231], [188, 238], [176, 238]],
        peaks: []
      },
      {
        name: 'SIBUTU',
        pts: [[166, 238], [173, 238], [172, 246], [165, 246]],
        peaks: []
      },
      {
        name: 'MAPUN_CAGAYAN_SULU',
        pts: [[156, 198], [164, 198], [163, 204], [155, 204]],
        peaks: []
      },

      // --- SOUTHWESTERN BORNEO / SABAH & KARIMATA CHAIN (LEFT/BOTTOM-LEFT SCREEN) ---
      {
        name: 'NORTH_BORNEO_CAPE',
        pts: [
          [56, 264], [78, 242], [104, 232], [126, 218], [146, 224],
          [158, 242], [152, 264]
        ],
        peaks: [[96, 248], [122, 236], [138, 248]]
      },
      {
        name: 'BANGGI_BALAMBANGAN',
        pts: [[118, 210], [126, 210], [125, 216], [117, 216]],
        peaks: []
      },
      {
        name: 'LABUAN_BRUNEI_ISLES',
        pts: [[64, 234], [74, 232], [72, 239], [62, 239]],
        peaks: []
      },
      {
        name: 'NATUNA_NORTH',
        pts: [[24, 204], [38, 202], [42, 214], [28, 218], [20, 210]],
        peaks: [[31, 210]]
      },
      {
        name: 'ANAMBAS_ISLES',
        pts: [[14, 232], [26, 230], [28, 240], [16, 242]],
        peaks: []
      },

      // --- WEST PHILIPPINE SEA / KALAYAAN / BAJO DE MASINLOC CHAINS (LEFT SCREEN) ---
      {
        name: 'BAJO_DE_MASINLOC',
        pts: [[164, 68], [174, 68], [176, 76], [162, 76]],
        peaks: []
      },
      {
        name: 'PAGASA_THITU',
        pts: [[108, 134], [118, 132], [120, 140], [106, 142]],
        peaks: []
      },
      {
        name: 'LIKAS_PAROLA',
        pts: [[122, 122], [131, 122], [130, 129], [121, 128]],
        peaks: []
      },
      {
        name: 'PATAG_LAWAAN',
        pts: [[134, 138], [144, 138], [142, 146], [132, 145]],
        peaks: []
      },
      {
        name: 'RIZAL_AYUNGIN_REEF',
        pts: [[138, 154], [148, 154], [146, 162], [136, 160]],
        peaks: []
      },
      {
        name: 'LAGOS_WEST_ATOLL',
        pts: [[82, 152], [94, 150], [98, 160], [86, 164], [78, 158]],
        peaks: [[88, 157]]
      },
      {
        name: 'WESTERN_SHOAL_01',
        pts: [[52, 118], [66, 116], [70, 126], [56, 130], [48, 124]],
        peaks: [[59, 122]]
      },
      {
        name: 'WESTERN_SHOAL_02',
        pts: [[32, 78], [46, 76], [50, 88], [36, 92], [28, 84]],
        peaks: [[39, 84]]
      },
      {
        name: 'NORTHWEST_ARCHIPELAGO_01',
        pts: [[64, 34], [82, 30], [88, 44], [72, 50], [58, 42]],
        peaks: [[73, 39]]
      },
      {
        name: 'NORTHWEST_ARCHIPELAGO_02',
        pts: [[118, 22], [132, 20], [136, 30], [122, 34]],
        peaks: [[127, 27]]
      },
      {
        name: 'PRATAS_DONGSHA_ATOLL',
        pts: [[154, 18], [166, 18], [168, 26], [152, 26]],
        peaks: []
      },
      {
        name: 'WEST_MARGIN_ISLE_01',
        pts: [[18, 44], [30, 42], [32, 54], [20, 56]],
        peaks: []
      },
      {
        name: 'WEST_MARGIN_ISLE_02',
        pts: [[22, 148], [36, 146], [40, 158], [26, 162]],
        peaks: [[31, 154]]
      },
      {
        name: 'WEST_MARGIN_ISLE_03',
        pts: [[54, 178], [68, 176], [72, 188], [58, 190]],
        peaks: []
      },

      // --- SANGIHE, TALAUD, MIANGAS & CELEBES SEA ISLANDS (SOUTH / SOUTHEAST) ---
      {
        name: 'MIANGAS_PALMAS',
        pts: [[296, 244], [304, 244], [303, 250], [295, 250]],
        peaks: []
      },
      {
        name: 'TALAUD_ISLANDS',
        pts: [[306, 250], [318, 248], [322, 260], [308, 262]],
        peaks: [[314, 255]]
      },
      {
        name: 'SANGIHE_CHAIN',
        pts: [[272, 252], [284, 250], [286, 262], [274, 264]],
        peaks: [[279, 257]]
      },
      {
        name: 'MOROTAI_HALMAHERA_NORTH',
        pts: [[336, 246], [354, 242], [362, 256], [346, 264], [332, 258]],
        peaks: [[346, 252], [352, 258]]
      },

      // --- PHILIPPINE RISE, PALAU, YAP & PACIFIC VOLCANIC ARCS (RIGHT SCREEN) ---
      {
        name: 'BENHAM_RISE_SEAMOUNT_01',
        pts: [[292, 58], [306, 56], [310, 66], [296, 70], [288, 64]],
        peaks: [[299, 62]]
      },
      {
        name: 'BENHAM_RISE_SEAMOUNT_02',
        pts: [[316, 72], [328, 70], [330, 80], [318, 82]],
        peaks: []
      },
      {
        name: 'EASTERN_ATOLL_01',
        pts: [[334, 34], [348, 32], [352, 42], [338, 46]],
        peaks: [[343, 39]]
      },
      {
        name: 'EASTERN_ATOLL_02',
        pts: [[376, 22], [392, 20], [398, 32], [382, 36], [372, 28]],
        peaks: [[384, 28]]
      },
      {
        name: 'MARIANA_ARC_01',
        pts: [[422, 16], [436, 14], [440, 26], [426, 28]],
        peaks: [[431, 21]]
      },
      {
        name: 'MARIANA_ARC_02',
        pts: [[438, 42], [452, 40], [456, 54], [442, 58], [434, 50]],
        peaks: [[445, 48]]
      },
      {
        name: 'MARIANA_ARC_03',
        pts: [[444, 76], [458, 74], [462, 88], [448, 92]],
        peaks: [[453, 83]]
      },
      {
        name: 'MARIANA_ARC_04',
        pts: [[432, 110], [448, 108], [452, 122], [436, 126]],
        peaks: [[442, 117]]
      },
      {
        name: 'PALAU_BABELDAOB',
        pts: [
          [364, 186], [380, 182], [386, 198], [376, 212], [362, 206], [358, 194]
        ],
        peaks: [[372, 194], [375, 202]]
      },
      {
        name: 'KOROR_PELELIU',
        pts: [[354, 214], [364, 214], [362, 224], [352, 222]],
        peaks: []
      },
      {
        name: 'SONSOROL_TOBI',
        pts: [[336, 226], [344, 226], [343, 233], [335, 232]],
        peaks: []
      },
      {
        name: 'YAP_ISLANDS',
        pts: [[398, 152], [414, 148], [418, 160], [404, 166], [394, 158]],
        peaks: [[406, 156]]
      },
      {
        name: 'ULITHI_ATOLL',
        pts: [[418, 136], [428, 134], [430, 142], [420, 144]],
        peaks: []
      },
      {
        name: 'NGULU_ATOLL',
        pts: [[384, 168], [392, 168], [391, 175], [383, 174]],
        peaks: []
      },
      {
        name: 'CAROLINE_WEST_01',
        pts: [[434, 174], [450, 170], [456, 184], [440, 188]],
        peaks: [[445, 179]]
      },
      {
        name: 'CAROLINE_WEST_02',
        pts: [[412, 212], [428, 208], [434, 222], [418, 226]],
        peaks: [[423, 217]]
      },
      {
        name: 'CAROLINE_SOUTH_03',
        pts: [[388, 240], [404, 238], [408, 250], [392, 254]],
        peaks: []
      },
      {
        name: 'PACIFIC_OUTER_ISLE',
        pts: [[442, 232], [458, 228], [464, 244], [448, 250]],
        peaks: [[453, 239]]
      }
    ];

    // Dense scatter of smaller pixel-art islets, coral atolls, and volcanic rocks
    // across every quadrant of the 480x270 map canvas.
    this.scatteredIslets = [
      // Northwest & West Sea Islets
      [42, 24, 4, 3], [50, 28, 3, 2], [96, 18, 4, 3], [104, 24, 3, 3],
      [142, 42, 4, 3], [148, 48, 3, 2], [178, 36, 4, 3], [186, 44, 3, 3],
      [84, 68, 4, 3], [92, 74, 3, 2], [116, 62, 5, 3], [126, 68, 3, 3],
      [144, 88, 4, 3], [152, 94, 3, 3], [72, 98, 4, 3], [80, 104, 3, 2],
      [104, 108, 4, 3], [162, 112, 4, 3], [172, 118, 3, 2],
      // Southwest & Sulu Sea Islets
      [44, 168, 4, 3], [52, 172, 3, 2], [96, 182, 4, 3], [106, 188, 3, 3],
      [118, 174, 4, 3], [154, 178, 3, 3], [188, 172, 4, 3], [196, 178, 3, 2],
      [176, 192, 4, 3], [184, 198, 3, 3], [142, 212, 4, 3], [150, 218, 3, 2],
      [88, 216, 4, 3], [96, 222, 3, 3], [46, 246, 5, 3], [54, 252, 3, 2],
      // Central & Visayan / Sibuyan / Bohol Sea Islets
      [218, 112, 3, 2], [238, 112, 3, 2], [242, 132, 3, 2], [258, 132, 3, 2],
      [226, 162, 4, 2], [232, 168, 3, 2], [242, 178, 4, 3], [256, 174, 3, 2],
      [224, 184, 3, 2], [202, 206, 4, 3], [232, 222, 4, 3], [244, 228, 3, 2],
      [254, 242, 4, 3], [262, 248, 3, 2],
      // Northeast & Philippine Sea Islets
      [256, 22, 4, 3], [264, 28, 3, 2], [278, 42, 4, 3], [286, 48, 3, 2],
      [262, 64, 4, 3], [270, 70, 3, 3], [312, 24, 4, 3], [320, 30, 3, 2],
      [356, 54, 4, 3], [364, 60, 3, 3], [398, 52, 4, 3], [406, 58, 3, 2],
      [344, 88, 4, 3], [352, 94, 3, 3], [378, 82, 5, 3], [388, 88, 3, 2],
      [414, 86, 4, 3], [422, 92, 3, 2],
      // East & Southeast Pacific / Caroline Islets
      [304, 108, 4, 3], [312, 114, 3, 2], [336, 118, 4, 3], [344, 124, 3, 3],
      [368, 114, 4, 3], [376, 120, 3, 2], [398, 122, 4, 3], [318, 142, 4, 3],
      [326, 148, 3, 2], [352, 146, 4, 3], [360, 152, 3, 3], [374, 142, 3, 2],
      [322, 176, 4, 3], [330, 182, 3, 2], [344, 172, 4, 3], [318, 204, 4, 3],
      [326, 210, 3, 3], [374, 228, 4, 3], [382, 234, 3, 2], [432, 198, 4, 3],
      [440, 204, 3, 2], [456, 152, 4, 3], [462, 158, 3, 2]
    ];

    this.mapLoreBeacons = [
      { x: 222, y: 48, label: 'CORDILLERA' },
      { x: 224, y: 88, label: 'MAYON / TUNDO' },
      { x: 266, y: 108, label: 'IBALONG' },
      { x: 226, y: 142, label: 'MADJA-AS' },
      { x: 278, y: 196, label: 'MINDANAO' },
      { x: 162, y: 168, label: 'PALAWAN' },
      { x: 200, y: 226, label: 'SULU' }
    ];
  }

  _getSkyPalette() {
    const palettes = {
      DUSK: {
        bands: ['#180b16', '#331618', '#5c281b', '#8c4326'],
        rgbBands: [
          [24, 11, 22],
          [51, 22, 24],
          [92, 40, 27],
          [140, 67, 38]
        ],
        rgbHorizon: [140, 67, 38],
        rgbMid: [92, 40, 27],
        rgbTop: [51, 22, 24]
      },
      NIGHT: {
        bands: ['#05070d', '#0b101e', '#131d31', '#1d2c45'],
        rgbBands: [
          [5, 7, 13],
          [11, 16, 30],
          [19, 29, 49],
          [29, 44, 69]
        ],
        rgbHorizon: [29, 44, 69],
        rgbMid: [19, 29, 49],
        rgbTop: [11, 16, 30]
      },
      MIDNIGHT: {
        bands: ['#090305', '#1a060a', '#320b12', '#52141d'],
        rgbBands: [
          [9, 3, 5],
          [26, 6, 10],
          [50, 11, 18],
          [82, 20, 29]
        ],
        rgbHorizon: [142, 28, 36],
        rgbMid: [82, 20, 29],
        rgbTop: [26, 6, 10]
      },
      'PRE-DAWN': {
        bands: ['#0e0a18', '#211630', '#3d2642', '#633d52'],
        rgbBands: [
          [14, 10, 24],
          [33, 22, 48],
          [61, 38, 66],
          [99, 61, 82]
        ],
        rgbHorizon: [99, 61, 82],
        rgbMid: [61, 38, 66],
        rgbTop: [33, 22, 48]
      },
      DAY: {
        bands: ['#172630', '#263e4d', '#3b5b6b', '#587c8c'],
        rgbBands: [
          [23, 38, 48],
          [38, 62, 77],
          [59, 91, 107],
          [88, 124, 140]
        ],
        rgbHorizon: [88, 124, 140],
        rgbMid: [59, 91, 107],
        rgbTop: [38, 62, 77]
      }
    };
    return palettes[this.timeOfDay] || palettes.DUSK;
  }

  setEnvironment(weather, timeOfDay, environment = 'OUTDOOR') {
    if (weather) this.weather = weather;
    if (timeOfDay) this.timeOfDay = timeOfDay;
    if (environment) this.environment = environment;
    this._syncBleedingGlow();
  }

  _cloneColorState(st) {
    return {
      band0: [...st.band0],
      band1: [...st.band1],
      band2: [...st.band2],
      band3: [...st.band3],
      rgbTop: [...st.rgbTop],
      rgbMid: [...st.rgbMid],
      rgbHor: [...st.rgbHor],
      bgDeep: [...st.bgDeep],
      bgMid: [...st.bgMid],
      borderRgb: [...st.borderRgb]
    };
  }

  _computeTargetColorState() {
    if (this.screenMode === 'MAP') {
      return {
        band0: [9, 9, 8],
        band1: [15, 14, 13],
        band2: [22, 20, 18],
        band3: [30, 28, 25],
        rgbTop: [14, 13, 12],
        rgbMid: [28, 26, 23],
        rgbHor: [52, 48, 42],
        bgDeep: [7, 7, 6],
        bgMid: [13, 12, 11],
        borderRgb: [92, 86, 76]
      };
    }

    const pal = this._getSkyPalette();
    let [rTop, gTop, bTop] = pal.rgbTop;
    let [rMid, gMid, bMid] = pal.rgbMid;
    let [rHor, gHor, bHor] = pal.rgbHorizon;
    let b0 = [...pal.rgbBands[0]];
    let b1 = [...pal.rgbBands[1]];
    let b2 = [...pal.rgbBands[2]];
    let b3 = [...pal.rgbBands[3]];

    if (this.environment === 'CABIN') {
      // Warm wooden Bahay Kubo & crackling hearth-fire palette
      b0 = [28, 14, 8];
      b1 = [54, 26, 12];
      b2 = [94, 45, 18];
      b3 = [152, 74, 26];
      rTop = 58;
      gTop = 28;
      bTop = 13;
      rMid = 118;
      gMid = 56;
      bMid = 22;
      rHor = 186;
      gHor = 96;
      bHor = 38;
    } else if (this.environment === 'TENT') {
      // Wind-lashed woven canvas & storm-lantern palette
      b0 = [18, 21, 16];
      b1 = [36, 40, 28];
      b2 = [64, 62, 42];
      b3 = [104, 92, 56];
      rTop = Math.round(rTop * 0.45 + 38 * 0.55);
      gTop = Math.round(gTop * 0.45 + 42 * 0.55);
      bTop = Math.round(bTop * 0.45 + 28 * 0.55);
      rMid = Math.round(rMid * 0.45 + 76 * 0.55);
      gMid = Math.round(gMid * 0.45 + 70 * 0.55);
      bMid = Math.round(bMid * 0.45 + 44 * 0.55);
      rHor = Math.round(rHor * 0.45 + 138 * 0.55);
      gHor = Math.round(gHor * 0.45 + 112 * 0.55);
      bHor = Math.round(bHor * 0.45 + 62 * 0.55);
    } else if (this.environment === 'CITY') {
      // Bustling Philippine Kingdom / Kedatuan lantern-lit night market palette
      b0 = [18, 13, 26];
      b1 = [40, 25, 44];
      b2 = [84, 46, 38];
      b3 = [148, 92, 42];
      rTop = 44;
      gTop = 26;
      bTop = 46;
      rMid = 106;
      gMid = 62;
      bMid = 38;
      rHor = 184;
      gHor = 122;
      bHor = 52;
    } else if (this.weather === 'SPIRIT FOG') {
      rTop = Math.round(rTop * 0.72 + 24 * 0.28);
      gTop = Math.round(gTop * 0.72 + 54 * 0.28);
      bTop = Math.round(bTop * 0.72 + 44 * 0.28);
      rMid = Math.round(rMid * 0.65 + 38 * 0.35);
      gMid = Math.round(gMid * 0.65 + 88 * 0.35);
      bMid = Math.round(bMid * 0.65 + 68 * 0.35);
      rHor = Math.round(rHor * 0.6 + 72 * 0.4);
      gHor = Math.round(gHor * 0.6 + 150 * 0.4);
      bHor = Math.round(bHor * 0.6 + 116 * 0.4);
    } else if (this.weather === 'MONSOON') {
      rTop = Math.round(rTop * 0.75 + 16 * 0.25);
      gTop = Math.round(gTop * 0.75 + 26 * 0.25);
      bTop = Math.round(bTop * 0.75 + 38 * 0.25);
      rMid = Math.round(rMid * 0.7 + 34 * 0.3);
      gMid = Math.round(gMid * 0.7 + 52 * 0.3);
      bMid = Math.round(bMid * 0.7 + 72 * 0.3);
    }

    const bgDeep = [
      Math.max(8, Math.round(rTop * 0.58)),
      Math.max(6, Math.round(gTop * 0.58)),
      Math.max(9, Math.round(bTop * 0.58))
    ];
    const bgMid = [
      Math.max(12, Math.round(rMid * 0.52)),
      Math.max(9, Math.round(gMid * 0.52)),
      Math.max(13, Math.round(bMid * 0.52))
    ];
    const borderRgb = [
      Math.min(255, rHor + 18),
      Math.min(255, gHor + 18),
      Math.min(255, bHor + 16)
    ];

    return {
      band0: b0,
      band1: b1,
      band2: b2,
      band3: b3,
      rgbTop: [rTop, gTop, bTop],
      rgbMid: [rMid, gMid, bMid],
      rgbHor: [rHor, gHor, bHor],
      bgDeep,
      bgMid,
      borderRgb
    };
  }

  _computeTargetWeatherState() {
    if (this.weather === 'MONSOON') {
      return {
        rainIntensity: 1.0,
        fogIntensity: 0.08,
        clearIntensity: 0.0,
        stormIntensity: 1.0
      };
    }
    if (this.weather === 'DRIZZLE') {
      return {
        rainIntensity: 0.44,
        fogIntensity: 0.14,
        clearIntensity: 0.0,
        stormIntensity: 0.0
      };
    }
    if (this.weather === 'SPIRIT FOG') {
      return {
        rainIntensity: 0.0,
        fogIntensity: 1.0,
        clearIntensity: 0.16,
        stormIntensity: 0.0
      };
    }
    return {
      rainIntensity: 0.0,
      fogIntensity: 0.0,
      clearIntensity: 1.0,
      stormIntensity: 0.0
    };
  }

  _stepWeatherTransition() {
    if (!this.currentWeatherState || !this.targetWeatherState) return;
    const rate = 0.009;
    const keys = ['rainIntensity', 'fogIntensity', 'clearIntensity', 'stormIntensity'];
    for (const k of keys) {
      const cur = this.currentWeatherState[k];
      const tgt = this.targetWeatherState[k];
      const diff = tgt - cur;
      if (Math.abs(diff) > 0.002) {
        this.currentWeatherState[k] += diff * rate;
      } else {
        this.currentWeatherState[k] = tgt;
      }
    }
  }

  _syncBleedingGlow() {
    this.targetColorState = this._computeTargetColorState();
    this.targetWeatherState = this._computeTargetWeatherState();
    if (!this.currentColorState) {
      this.currentColorState = this._cloneColorState(this.targetColorState);
      this._applyCssVariablesFromState(this.currentColorState);
    }
    if (!this.currentWeatherState) {
      this.currentWeatherState = { ...this.targetWeatherState };
    }
  }

  _rgbStr(arr) {
    return `rgb(${Math.round(arr[0])}, ${Math.round(arr[1])}, ${Math.round(arr[2])})`;
  }

  _applyCssVariablesFromState(st) {
    const root = document.documentElement;
    if (!root || !root.style || !st) return;
    const rTop = Math.round(st.rgbTop[0]);
    const gTop = Math.round(st.rgbTop[1]);
    const bTop = Math.round(st.rgbTop[2]);
    const rMid = Math.round(st.rgbMid[0]);
    const gMid = Math.round(st.rgbMid[1]);
    const bMid = Math.round(st.rgbMid[2]);
    const rBrd = Math.round(st.borderRgb[0]);
    const gBrd = Math.round(st.borderRgb[1]);
    const bBrd = Math.round(st.borderRgb[2]);

    root.style.setProperty('--ambient-sky-top', this._rgbStr(st.band0));
    root.style.setProperty('--ambient-sky-mid', this._rgbStr(st.band1));
    root.style.setProperty('--ambient-sky-horizon', this._rgbStr(st.band3));
    root.style.setProperty('--ambient-bg-deep', this._rgbStr(st.bgDeep));
    root.style.setProperty('--ambient-bg-mid', this._rgbStr(st.bgMid));
    root.style.setProperty('--ambient-glow-primary', `rgba(${rMid}, ${gMid}, ${bMid}, 0.42)`);
    root.style.setProperty('--ambient-glow-secondary', `rgba(${rTop}, ${gTop}, ${bTop}, 0.52)`);
    root.style.setProperty('--ambient-glow-border', `rgba(${rBrd}, ${gBrd}, ${bBrd}, 0.52)`);
  }

  _stepColorTransition() {
    if (!this.currentColorState || !this.targetColorState) return;
    const rate = 0.024;
    let changed = false;
    const keys = [
      'band0',
      'band1',
      'band2',
      'band3',
      'rgbTop',
      'rgbMid',
      'rgbHor',
      'bgDeep',
      'bgMid',
      'borderRgb'
    ];
    for (const k of keys) {
      const cur = this.currentColorState[k];
      const tgt = this.targetColorState[k];
      for (let i = 0; i < 3; i += 1) {
        const diff = tgt[i] - cur[i];
        if (Math.abs(diff) > 0.15) {
          cur[i] += diff * rate;
          changed = true;
        } else if (cur[i] !== tgt[i]) {
          cur[i] = tgt[i];
          changed = true;
        }
      }
    }
    if (changed && this.tick % 2 === 0) {
      this._applyCssVariablesFromState(this.currentColorState);
    }
  }

  _animate() {
    this.tick += 1;
    this._stepColorTransition();
    this._stepWeatherTransition();
    this._drawSky();
    this._drawAmbientBleed();
    requestAnimationFrame(this._animate);
  }

  _drawAncientArchipelagoMap(ctx, w, h) {
    // 1. Deep, Desaturated Ash-Parchment / Dark Slate-Umber Carta Base (darker and less warm)
    const paperGrad = ctx.createRadialGradient(
      w * 0.5,
      h * 0.5,
      18,
      w * 0.5,
      h * 0.5,
      w * 0.68
    );
    paperGrad.addColorStop(0, '#191714');
    paperGrad.addColorStop(0.45, '#13120f');
    paperGrad.addColorStop(0.78, '#0c0b0a');
    paperGrad.addColorStop(1, '#060605');
    ctx.fillStyle = paperGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Subtle Weathered Paper Fiber Grain & Fold Creases
    ctx.fillStyle = 'rgba(6, 6, 5, 0.34)';
    for (let y = 0; y < h; y += 6) {
      ctx.fillRect(0, y, w, 1);
    }
    ctx.fillStyle = 'rgba(54, 50, 44, 0.11)';
    for (let x = 0; x < w; x += 16) {
      ctx.fillRect(x, 0, 1, h);
    }
    // Fold lines
    ctx.fillStyle = 'rgba(4, 4, 3, 0.48)';
    ctx.fillRect(Math.floor(w * 0.5), 8, 1, h - 16);
    ctx.fillRect(10, Math.floor(h * 0.5), w - 20, 1);

    // 3. Cartographic Latitude / Longitude Grid & Rhumb Lines (desaturated, cool-ash tint)
    ctx.strokeStyle = 'rgba(92, 86, 76, 0.13)';
    ctx.lineWidth = 1;
    for (let gx = 60; gx < w; gx += 60) {
      ctx.beginPath();
      ctx.moveTo(gx, 10);
      ctx.lineTo(gx, h - 10);
      ctx.stroke();
    }
    for (let gy = 45; gy < h; gy += 45) {
      ctx.beginPath();
      ctx.moveTo(10, gy);
      ctx.lineTo(w - 10, gy);
      ctx.stroke();
    }

    // Radiating Rhumb Lines from West Philippine Sea Compass Rose (x: 108, y: 112)
    const compassX = 108;
    const compassY = 112;
    ctx.strokeStyle = 'rgba(104, 96, 84, 0.14)';
    for (let a = 0; a < 16; a += 1) {
      const angle = (a * Math.PI) / 8;
      ctx.beginPath();
      ctx.moveTo(compassX, compassY);
      ctx.lineTo(compassX + Math.cos(angle) * 440, compassY + Math.sin(angle) * 440);
      ctx.stroke();
    }

    // 4. Compass Rose Ornament (muted antique pewter-brass)
    ctx.strokeStyle = 'rgba(128, 118, 102, 0.38)';
    ctx.beginPath();
    ctx.arc(compassX, compassY, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(compassX, compassY, 12, 0, Math.PI * 2);
    ctx.stroke();

    const needleSpin = Math.sin(this.tick * 0.012) * 0.08;
    ctx.strokeStyle = 'rgba(154, 142, 122, 0.52)';
    ctx.beginPath();
    ctx.moveTo(compassX, compassY - 22);
    ctx.lineTo(compassX, compassY + 22);
    ctx.moveTo(compassX - 22, compassY);
    ctx.lineTo(compassX + 22, compassY);
    ctx.stroke();

    ctx.fillStyle = 'rgba(148, 108, 78, 0.58)';
    ctx.fillRect(
      Math.floor(compassX + Math.sin(needleSpin) * 3) - 1,
      compassY - 16,
      3,
      7
    );

    // 5. Animated Coastal Wave Rings & Archipelago Islands Across the Entire Screen
    const wavePulse = (Math.sin(this.tick * 0.035) + 1) * 0.5;
    for (const isl of this.archipelagoIslands) {
      if (!isl.pts || isl.pts.length < 3) continue;

      // Outer shallow-water cartographic contour ring
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(isl.pts[0][0], isl.pts[0][1]);
      for (let i = 1; i < isl.pts.length; i += 1) {
        ctx.lineTo(isl.pts[i][0], isl.pts[i][1]);
      }
      ctx.closePath();
      ctx.lineJoin = 'round';
      ctx.lineWidth = 5;
      ctx.strokeStyle = `rgba(92, 86, 74, ${0.11 + wavePulse * 0.06})`;
      ctx.stroke();

      // Dark, cool-toned weathered stone-umber island landmass fill
      ctx.fillStyle = '#25221d';
      ctx.fill();

      // Inner highland tint
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#36312a';
      ctx.stroke();

      // Dark charcoal inked coastline
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#0c0a08';
      ctx.stroke();
      ctx.restore();

      // Cartographic mountain ridge chevrons (^)
      if (isl.peaks && isl.peaks.length > 0) {
        ctx.strokeStyle = '#14110e';
        ctx.lineWidth = 1;
        for (const [px, py] of isl.peaks) {
          ctx.beginPath();
          ctx.moveTo(px - 3, py + 2);
          ctx.lineTo(px, py - 2);
          ctx.lineTo(px + 3, py + 2);
          ctx.stroke();
        }
      }
    }

    // 5b. Scattered Islets, Coral Atolls & Volcanic Rocks Across All Quadrants
    if (this.scatteredIslets) {
      for (const [ix, iy, iw, ih] of this.scatteredIslets) {
        // Shallow reef halo
        ctx.fillStyle = `rgba(88, 82, 72, ${0.12 + wavePulse * 0.05})`;
        ctx.fillRect(ix - 1, iy - 1, iw + 2, ih + 2);
        // Islet fill
        ctx.fillStyle = '#28241e';
        ctx.fillRect(ix, iy, iw, ih);
        // Dark ink rim on top/left
        ctx.fillStyle = '#0d0b09';
        ctx.fillRect(ix, iy, iw, 1);
      }
    }

    // 6. Dotted Ancient Sea-Trade / Spirit Routes & Subtle Lore Beacons
    ctx.save();
    ctx.setLineDash([2, 3]);
    ctx.strokeStyle = 'rgba(128, 116, 98, 0.26)';
    ctx.beginPath();
    ctx.moveTo(222, 48);
    ctx.lineTo(224, 88);
    ctx.lineTo(266, 108);
    ctx.lineTo(226, 142);
    ctx.lineTo(278, 196);
    ctx.moveTo(226, 142);
    ctx.lineTo(162, 168);
    ctx.lineTo(200, 226);
    ctx.lineTo(278, 196);
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i < this.mapLoreBeacons.length; i += 1) {
      const b = this.mapLoreBeacons[i];
      const glow = 0.35 + 0.25 * Math.sin(this.tick * 0.05 + i * 1.4);
      ctx.fillStyle = `rgba(142, 118, 88, ${glow * 0.36})`;
      ctx.fillRect(b.x - 3, b.y - 3, 7, 7);
      ctx.fillStyle = `rgba(188, 172, 142, ${glow})`;
      ctx.fillRect(b.x - 1, b.y - 1, 3, 3);
    }

    // 7. Coiled Bakunawa Sea-Serpent Cartographic Illustration in the Eastern Philippine Sea
    const serpX = 338;
    const serpY = 98 + Math.floor(Math.sin(this.tick * 0.025) * 2);
    ctx.strokeStyle = 'rgba(112, 102, 88, 0.32)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(serpX, serpY, 9, Math.PI, 0);
    ctx.arc(serpX + 16, serpY, 8, Math.PI, 0);
    ctx.arc(serpX + 30, serpY, 6, Math.PI, 0);
    ctx.stroke();

    // 8. Drifting Dark Storm-Cloud Shadows Across the Map
    const cloudShift = (this.tick * 0.25) % (w + 180);
    const cloudGrad = ctx.createRadialGradient(
      w - cloudShift + 60,
      h * 0.42,
      10,
      w - cloudShift + 60,
      h * 0.42,
      125
    );
    cloudGrad.addColorStop(0, 'rgba(4, 4, 3, 0.52)');
    cloudGrad.addColorStop(1, 'rgba(4, 4, 3, 0)');
    ctx.fillStyle = cloudGrad;
    ctx.fillRect(0, 0, w, h);

    // 9. Raindrop Impact Ripples on the Ancient Map
    ctx.lineWidth = 1;
    for (const rip of this.mapRipples) {
      rip.r += 0.14;
      if (rip.r > rip.maxR) {
        rip.r = 0.5;
        rip.x = 20 + Math.random() * (w - 40);
        rip.y = 16 + Math.random() * (h - 32);
      }
      const alpha = Math.max(0, (1 - rip.r / rip.maxR) * 0.28);
      ctx.strokeStyle = `rgba(164, 158, 146, ${alpha})`;
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 10. Continuous Falling Rain Streaks Across the Parchment Map
    ctx.fillStyle = 'rgba(168, 166, 158, 0.28)';
    for (const p of this.bgParticles) {
      p.x -= 1.15;
      p.y += 2.65;
      if (p.y > h) {
        p.y = -6;
        p.x = Math.random() * w;
      }
      if (p.x < 0) p.x = w;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, 6);
    }

    // 11. Antique Double-Line Map Border & Stronger Dark Vignette
    ctx.strokeStyle = 'rgba(104, 96, 82, 0.34)';
    ctx.strokeRect(8, 8, w - 16, h - 16);
    ctx.strokeStyle = 'rgba(72, 66, 56, 0.26)';
    ctx.strokeRect(12, 12, w - 24, h - 24);

    const vignette = ctx.createRadialGradient(
      w * 0.5,
      h * 0.5,
      w * 0.2,
      w * 0.5,
      h * 0.5,
      w * 0.65
    );
    vignette.addColorStop(0, 'rgba(6, 6, 5, 0.24)');
    vignette.addColorStop(0.6, 'rgba(5, 5, 4, 0.56)');
    vignette.addColorStop(1, 'rgba(3, 3, 2, 0.86)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  _drawAmbientBleed() {
    if (!this.bleedCanvas) return;
    const ctx = this.bleedCanvas.getContext('2d');
    const w = this.bleedCanvas.width;
    const h = this.bleedCanvas.height;

    if (this.screenMode === 'MAP') {
      this._drawAncientArchipelagoMap(ctx, w, h);
      return;
    }

    const st = this.currentColorState || this._computeTargetColorState();
    const b0 = this._rgbStr(st.band0);
    const b1 = this._rgbStr(st.band1);
    const rTop = Math.round(st.rgbTop[0]);
    const gTop = Math.round(st.rgbTop[1]);
    const bTop = Math.round(st.rgbTop[2]);
    const rMid = Math.round(st.rgbMid[0]);
    const gMid = Math.round(st.rgbMid[1]);
    const bMid = Math.round(st.rgbMid[2]);

    ctx.clearRect(0, 0, w, h);

    // 1. Utilize the smoothly interpolated darker color bands from the ambience visualizer
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, b0);
    grad.addColorStop(0.38, b1);
    grad.addColorStop(
      0.72,
      `rgb(${Math.max(10, Math.round(rMid * 0.55))}, ${Math.max(8, Math.round(gMid * 0.55))}, ${Math.max(11, Math.round(bMid * 0.55))})`
    );
    grad.addColorStop(1, b0);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // 2. Darkening wash so the environment stays moody while preserving visualizer hue
    ctx.fillStyle = 'rgba(6, 4, 5, 0.38)';
    ctx.fillRect(0, 0, w, h);

    // 3. Subtle radial bloom centered behind the centered main narrative panel
    const rad = ctx.createRadialGradient(w * 0.5, h * 0.22, 8, w * 0.5, h * 0.38, w * 0.58);
    rad.addColorStop(0, `rgba(${rMid}, ${gMid}, ${bMid}, 0.34)`);
    rad.addColorStop(0.55, `rgba(${rTop}, ${gTop}, ${bTop}, 0.22)`);
    rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);

    const ws = this.currentWeatherState || this._computeTargetWeatherState();

    // Synchronized lightning pulse across the whole UI background in MONSOON (scaled by stormIntensity)
    if (this.environment !== 'CABIN' && ws.stormIntensity > 0.35 && this.tick % 190 < 3) {
      ctx.fillStyle = `rgba(220, 232, 245, ${(0.26 * ws.stormIntensity).toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 4. Environment-Specific Full-Viewport Ambient Background Portrayal
    if (this.environment === 'CABIN') {
      // Warm woven sawali bamboo texture in dark margins + flickering hearth-fire bloom from bottom
      ctx.fillStyle = 'rgba(42, 20, 9, 0.22)';
      for (let y = 0; y < h; y += 8) {
        ctx.fillRect(0, y, w, 2);
      }
      ctx.fillStyle = 'rgba(68, 32, 14, 0.16)';
      for (let x = 0; x < w; x += 12) {
        ctx.fillRect(x, 0, 2, h);
      }

      const flicker = 0.28 + Math.sin(this.tick * 0.11) * 0.05 + Math.cos(this.tick * 0.19) * 0.04;
      const hearthGlow = ctx.createRadialGradient(w * 0.5, h * 0.92, 6, w * 0.5, h * 0.85, w * 0.52);
      hearthGlow.addColorStop(0, `rgba(235, 118, 42, ${flicker})`);
      hearthGlow.addColorStop(0.5, `rgba(168, 64, 22, ${flicker * 0.55})`);
      hearthGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = hearthGlow;
      ctx.fillRect(0, 0, w, h);

      // Rising warm hearth embers across the background
      for (let i = 0; i < 42; i += 1) {
        const p = this.bgParticles[i];
        p.x += Math.sin(this.tick * 0.03 + p.phase) * 0.45;
        p.y -= 0.45 + (i % 3) * 0.18;
        if (p.y < 0) {
          p.y = h;
          p.x = w * 0.2 + Math.random() * (w * 0.6);
        }
        ctx.fillStyle = i % 2 === 0 ? 'rgba(242, 148, 58, 0.48)' : 'rgba(223, 192, 98, 0.38)';
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
      }
      return;
    }

    if (this.environment === 'TENT') {
      // Billowing tent canvas upper-corner shadows + fast wind-whipped streaks across the viewport
      const flapSway = Math.sin(this.tick * 0.07) * 8;
      ctx.fillStyle = 'rgba(12, 11, 8, 0.46)';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w * 0.34 + flapSway, 0);
      ctx.lineTo(0, h * 0.48);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(w, 0);
      ctx.lineTo(w * 0.66 + flapSway, 0);
      ctx.lineTo(w, h * 0.48);
      ctx.closePath();
      ctx.fill();

      // Fast horizontal wind streaks & blown rain/debris scaled by rainIntensity
      const streakR = Math.round(210 * (1 - ws.rainIntensity) + 195 * ws.rainIntensity);
      const streakG = Math.round(198 * (1 - ws.rainIntensity) + 220 * ws.rainIntensity);
      const streakB = Math.round(165 * (1 - ws.rainIntensity) + 238 * ws.rainIntensity);
      ctx.fillStyle = `rgba(${streakR}, ${streakG}, ${streakB}, ${(0.22 + ws.rainIntensity * 0.12).toFixed(3)})`;
      for (let i = 0; i < 55; i += 1) {
        const p = this.bgParticles[i];
        p.x -= 2.8 + ws.rainIntensity * 1.4 + (i % 3) * 0.8;
        p.y += Math.sin(this.tick * 0.05 + p.phase) * 0.4 + 0.35 + ws.rainIntensity * 0.9;
        if (p.x < -12) {
          p.x = w + 8;
          p.y = Math.random() * h;
        }
        if (p.y > h) p.y = 0;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 7 + (i % 5), 1);
      }
      return;
    }

    if (this.environment === 'CITY') {
      // Golden lantern bloom from the bustling settlement below + distant glowing windows & rising lantern sparks
      const cityBloom = ctx.createLinearGradient(0, h * 0.45, 0, h);
      cityBloom.addColorStop(0, 'rgba(0, 0, 0, 0)');
      cityBloom.addColorStop(0.65, 'rgba(168, 96, 36, 0.18)');
      cityBloom.addColorStop(1, 'rgba(218, 138, 52, 0.32)');
      ctx.fillStyle = cityBloom;
      ctx.fillRect(0, 0, w, h);

      // Soft bokeh-like distant market lanterns along the lower background
      for (let i = 0; i < 24; i += 1) {
        const lx = (i * 47 + 18) % w;
        const ly = h - 18 - ((i * 23) % 48);
        const pulse = 0.25 + 0.15 * Math.sin(this.tick * 0.04 + i);
        ctx.fillStyle = `rgba(238, 182, 84, ${pulse})`;
        ctx.fillRect(lx, ly, 3, 3);
      }

      // Drifting market smoke & lantern sparks
      for (let i = 0; i < 32; i += 1) {
        const p = this.bgParticles[i];
        p.x += Math.cos(this.tick * 0.02 + p.phase) * 0.35;
        p.y -= 0.28;
        if (p.y < 0) p.y = h;
        ctx.fillStyle = i % 2 === 0 ? 'rgba(238, 185, 92, 0.38)' : 'rgba(217, 114, 54, 0.32)';
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
      }
    }

    // 5. Smoothly Interpolated Full-Screen Weather Layers (Gradual Rain Build-Up / Calm-Down, Fog, and Clear Embers)
    if (ws.rainIntensity > 0.015) {
      const floatCount = ws.rainIntensity * this.bgParticles.length;
      const maxIdx = Math.min(this.bgParticles.length, Math.ceil(floatCount));
      const vx = -(0.45 + ws.rainIntensity * 1.35);
      const vy = 1.15 + ws.rainIntensity * 2.25;
      const streakLen = Math.max(2, Math.round(3 + ws.rainIntensity * 4));
      const baseAlpha = 0.14 + ws.rainIntensity * 0.2;

      for (let i = 0; i < maxIdx; i += 1) {
        const p = this.bgParticles[i];
        p.x += vx;
        p.y += vy;
        if (p.y > h) {
          p.y = -6;
          p.x = Math.random() * w;
        }
        if (p.x < 0) p.x = w;
        const dropWeight = Math.min(1, Math.max(0, floatCount - i));
        const alpha = (baseAlpha * dropWeight).toFixed(3);
        ctx.fillStyle = `rgba(190, 215, 235, ${alpha})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 1, streakLen);
      }
    }

    if (ws.fogIntensity > 0.02) {
      const fogAlpha = (0.08 * ws.fogIntensity).toFixed(3);
      ctx.fillStyle = `rgba(140, 224, 184, ${fogAlpha})`;
      const wave1 = Math.floor(Math.sin(this.tick * 0.018) * 30);
      const wave2 = Math.floor(Math.cos(this.tick * 0.014) * 35);
      ctx.fillRect(wave1, Math.floor(h * 0.28), w, 26);
      ctx.fillRect(wave2, Math.floor(h * 0.62), w, 32);

      const moteFloat = ws.fogIntensity * 40;
      const moteMax = Math.ceil(moteFloat);
      for (let i = 0; i < moteMax; i += 1) {
        const p = this.bgParticles[i];
        p.x += Math.sin(this.tick * 0.018 + p.phase) * 0.35;
        p.y -= 0.22;
        if (p.y < 0) p.y = h;
        const wgt = Math.min(1, Math.max(0, moteFloat - i)) * ws.fogIntensity;
        ctx.fillStyle =
          i % 2 === 0
            ? `rgba(140, 224, 184, ${(0.45 * wgt).toFixed(3)})`
            : `rgba(223, 177, 91, ${(0.38 * wgt).toFixed(3)})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
      }
    }

    if (this.environment !== 'CITY' && ws.clearIntensity > 0.02) {
      const emberFloat = ws.clearIntensity * 36;
      const emberMax = Math.ceil(emberFloat);
      for (let i = 0; i < emberMax; i += 1) {
        const p = this.bgParticles[i];
        p.x += Math.cos(this.tick * 0.016 + p.phase) * 0.3;
        p.y += Math.sin(this.tick * 0.022 + p.phase) * 0.22;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        const wgt = Math.min(1, Math.max(0, emberFloat - i)) * ws.clearIntensity;
        ctx.fillStyle =
          i % 3 === 0
            ? `rgba(217, 114, 54, ${(0.42 * wgt).toFixed(3)})`
            : `rgba(223, 177, 91, ${(0.36 * wgt).toFixed(3)})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
      }
    }
  }

  _drawCabinScene(ctx, w, h) {
    // 1. Warm Woven Sawali (Bamboo Weave) Interior Wall Background
    ctx.fillStyle = '#241209';
    ctx.fillRect(0, 0, w, h);

    for (let y = 0; y < h; y += 8) {
      for (let x = 0; x < w; x += 16) {
        const shift = (y / 8) % 2 === 0 ? 0 : 8;
        ctx.fillStyle = '#331a0d';
        ctx.fillRect(x + shift, y, 8, 4);
        ctx.fillStyle = '#2b150a';
        ctx.fillRect(x + shift, y + 4, 8, 4);
      }
    }

    // 2. Warm Radial Hearth Firelight Glow on the Wooden Walls
    const firePulse = 0.42 + Math.sin(this.tick * 0.14) * 0.07 + Math.cos(this.tick * 0.23) * 0.05;
    const hearthX = Math.floor(w * 0.5);
    const hearthY = h - 14;
    const rad = ctx.createRadialGradient(hearthX, hearthY, 8, hearthX, hearthY - 20, 240);
    rad.addColorStop(0, `rgba(245, 148, 56, ${firePulse})`);
    rad.addColorStop(0.5, `rgba(186, 74, 24, ${firePulse * 0.6})`);
    rad.addColorStop(1, 'rgba(18, 8, 4, 0.45)');
    ctx.fillStyle = rad;
    ctx.fillRect(0, 0, w, h);

    // 3. Capiz & Bamboo-Slat Window on the Right Looking Out at Outdoor Sky/Weather
    const winX = w - 168;
    const winY = 20;
    const winW = 112;
    const winH = 58;
    const skyPal = this._getSkyPalette();
    ctx.fillStyle = skyPal.bands[1];
    ctx.fillRect(winX, winY, winW, Math.floor(winH * 0.55));
    ctx.fillStyle = skyPal.bands[3];
    ctx.fillRect(winX, winY + Math.floor(winH * 0.55), winW, Math.ceil(winH * 0.45));

    // Outdoor weather visible through the cabin window (gradually builds up or calms down)
    const ws = this.currentWeatherState || this._computeTargetWeatherState();
    if (ws.rainIntensity < 0.85) {
      // Moon/stars outside window fade smoothly as rain intensifies
      ctx.fillStyle = `rgba(223, 211, 190, ${(1 - ws.rainIntensity * 0.85).toFixed(3)})`;
      ctx.fillRect(winX + winW - 26, winY + 10, 10, 10);
    }
    if (ws.rainIntensity > 0.02) {
      const floatDrops = ws.rainIntensity * 18;
      const maxDrops = Math.ceil(floatDrops);
      const dropLen = Math.round(3 + ws.rainIntensity * 4);
      const speedY = 1.6 + ws.rainIntensity * 2.4;
      for (let i = 0; i < maxDrops; i += 1) {
        const wgt = Math.min(1, Math.max(0, floatDrops - i));
        ctx.fillStyle = `rgba(195, 220, 238, ${(0.68 * ws.rainIntensity * wgt).toFixed(3)})`;
        const rx = winX + (((i * 19 - this.tick * (1 + ws.rainIntensity * 1.5)) % winW) + winW) % winW;
        const ry = winY + ((i * 13 + this.tick * speedY) % winH);
        ctx.fillRect(Math.floor(rx), Math.floor(ry), 1, dropLen);
      }
    }

    // Window lattice frame & propped nipa shutter
    ctx.strokeStyle = '#4a2612';
    ctx.lineWidth = 3;
    ctx.strokeRect(winX, winY, winW, winH);
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(235, 198, 138, 0.28)';
    for (let gx = winX + 28; gx < winX + winW; gx += 28) {
      ctx.beginPath();
      ctx.moveTo(gx, winY);
      ctx.lineTo(gx, winY + winH);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(winX, winY + Math.floor(winH * 0.5));
    ctx.lineTo(winX + winW, winY + Math.floor(winH * 0.5));
    ctx.stroke();

    // 4. Heavy Narra & Bamboo Rafters, Pillars, and Floorboards
    ctx.fillStyle = '#1a0c06';
    ctx.fillRect(0, 0, w, 14);
    ctx.fillRect(0, h - 14, w, 14);
    ctx.fillRect(36, 0, 16, h);
    ctx.fillRect(w - 36, 0, 16, h);
    // Bamboo tie-lashed beam joints
    ctx.fillStyle = '#6e3c1b';
    for (let bx = 64; bx < w - 40; bx += 96) {
      ctx.fillRect(bx, 0, 8, 18);
    }

    // Hanging braided garlic & dried bayabas herb bundles from rafters
    ctx.fillStyle = '#cbb78c';
    ctx.fillRect(148, 14, 4, 16);
    ctx.fillRect(146, 26, 8, 8);
    ctx.fillStyle = '#4e6b3a';
    ctx.fillRect(184, 14, 6, 18);

    // 5. Clay Dapugan Hearth & Crackling Fire in Center-Left Foreground
    ctx.fillStyle = '#3b2316';
    ctx.fillRect(hearthX - 54, h - 20, 108, 10);
    ctx.fillStyle = '#1f1009';
    ctx.fillRect(hearthX - 42, h - 24, 84, 6);
    // Glowing red-orange coals
    ctx.fillStyle = '#c9382c';
    ctx.fillRect(hearthX - 34, h - 24, 68, 5);

    // Animated flickering pixel-art flame tongues
    for (let f = -30; f <= 30; f += 6) {
      const centerWeight = 1 - Math.abs(f) / 36;
      const flameH = Math.floor(
        (14 + Math.sin(this.tick * 0.22 + f) * 7 + Math.cos(this.tick * 0.31 - f * 0.5) * 5) *
          centerWeight
      );
      ctx.fillStyle = '#e05326';
      ctx.fillRect(hearthX + f - 3, h - 22 - flameH, 6, flameH);
      ctx.fillStyle = '#f29f38';
      ctx.fillRect(hearthX + f - 2, h - 22 - Math.floor(flameH * 0.72), 4, Math.floor(flameH * 0.72));
      ctx.fillStyle = '#fae17c';
      ctx.fillRect(hearthX + f - 1, h - 22 - Math.floor(flameH * 0.38), 2, Math.floor(flameH * 0.38));
    }

    // Rising crackling fire sparks & embers inside the kubo
    for (let i = 0; i < 26; i += 1) {
      const p = this.particles[i];
      p.x += Math.sin(this.tick * 0.08 + p.phase) * 0.8;
      p.y -= 0.9 + (i % 3) * 0.35;
      if (p.y < 14 || Math.abs(p.x - hearthX) > 140) {
        p.x = hearthX - 28 + Math.random() * 56;
        p.y = h - 24;
      }
      ctx.fillStyle = i % 2 === 0 ? '#f7b94a' : '#e85d2a';
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
    }
  }

  _drawTentScene(ctx, w, h, st) {
    // 1. Outdoor Wind-Swept Sky Visible Through the Parted Tent Opening
    const pal0 = this._rgbStr(st.band0);
    const pal1 = this._rgbStr(st.band1);
    const pal2 = this._rgbStr(st.band2);
    const pal3 = this._rgbStr(st.band3);

    ctx.fillStyle = pal0;
    ctx.fillRect(0, 0, w, Math.floor(h * 0.3));
    ctx.fillStyle = pal1;
    ctx.fillRect(0, Math.floor(h * 0.3), w, Math.floor(h * 0.28));
    ctx.fillStyle = pal2;
    ctx.fillRect(0, Math.floor(h * 0.58), w, Math.floor(h * 0.22));
    ctx.fillStyle = pal3;
    ctx.fillRect(0, Math.floor(h * 0.8), w, h);

    // Distant wind-lashed ridge & bending cogon grass outside tent opening
    ctx.fillStyle = '#120e09';
    for (let x = 140; x < w - 140; x += 18) {
      const hillH = 12 + ((x * 9) % 16);
      ctx.fillRect(x, h - 12 - hillH, 20, hillH + 12);
    }

    // 2. Fast Wind-Whipped Streaks & Rain Blowing Across the Tent Opening (gradually scales with rainIntensity)
    const ws = this.currentWeatherState || this._computeTargetWeatherState();
    const rCol = Math.round(222 * (1 - ws.rainIntensity) + 200 * ws.rainIntensity);
    const gCol = Math.round(206 * (1 - ws.rainIntensity) + 220 * ws.rainIntensity);
    const bCol = Math.round(172 * (1 - ws.rainIntensity) + 235 * ws.rainIntensity);
    const alphaCol = (0.42 + ws.rainIntensity * 0.32).toFixed(3);
    ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${alphaCol})`;
    for (const p of this.particles) {
      p.x -= 3.6 + ws.rainIntensity * 1.8;
      p.y += 0.8 + ws.rainIntensity * 1.4 + Math.sin(this.tick * 0.06 + p.phase) * 0.4;
      if (p.x < 0) {
        p.x = w;
        p.y = Math.random() * h;
      }
      if (p.y > h) p.y = 0;
      ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.round(7 + ws.rainIntensity * 4), 1);
    }

    // 3. Pitched Abaca-Canvas Tent Flaps Billowing in the Wind (Left & Right)
    const windBillowL = Math.sin(this.tick * 0.095) * 9 + Math.cos(this.tick * 0.17) * 4;
    const windBillowR = Math.sin(this.tick * 0.095 + 0.8) * 9 + Math.sin(this.tick * 0.15) * 4;

    // Left Tent Canvas Wall & Flap
    ctx.fillStyle = '#292216';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.floor(w * 0.46), 0);
    ctx.quadraticCurveTo(
      Math.floor(w * 0.34 + windBillowL),
      Math.floor(h * 0.52),
      Math.floor(w * 0.22 + windBillowL * 1.2),
      h
    );
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    // Right Tent Canvas Wall & Flap
    ctx.beginPath();
    ctx.moveTo(w, 0);
    ctx.lineTo(Math.floor(w * 0.54), 0);
    ctx.quadraticCurveTo(
      Math.floor(w * 0.66 + windBillowR),
      Math.floor(h * 0.52),
      Math.floor(w * 0.78 + windBillowR * 1.2),
      h
    );
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();

    // Woven canvas seam lines & guy-ropes
    ctx.strokeStyle = '#4a3d28';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Math.floor(w * 0.46), 0);
    ctx.quadraticCurveTo(
      Math.floor(w * 0.34 + windBillowL),
      Math.floor(h * 0.52),
      Math.floor(w * 0.22 + windBillowL * 1.2),
      h
    );
    ctx.moveTo(Math.floor(w * 0.54), 0);
    ctx.quadraticCurveTo(
      Math.floor(w * 0.66 + windBillowR),
      Math.floor(h * 0.52),
      Math.floor(w * 0.78 + windBillowR * 1.2),
      h
    );
    ctx.stroke();

    // 4. Bamboo Ridgepole & Swaying Brass Storm-Lantern Inside Tent Peak
    const lanternSway = Math.sin(this.tick * 0.08) * 7;
    const lanX = Math.floor(w * 0.5 + lanternSway);
    const lanY = 26;
    ctx.strokeStyle = '#6e5636';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(Math.floor(w * 0.5), 0);
    ctx.lineTo(lanX, lanY);
    ctx.stroke();

    const lanGlow = ctx.createRadialGradient(lanX, lanY + 6, 2, lanX, lanY + 6, 48);
    lanGlow.addColorStop(0, 'rgba(245, 196, 98, 0.55)');
    lanGlow.addColorStop(1, 'rgba(245, 196, 98, 0)');
    ctx.fillStyle = lanGlow;
    ctx.fillRect(lanX - 48, 0, 96, 84);

    ctx.fillStyle = '#dfb15b';
    ctx.fillRect(lanX - 4, lanY, 8, 10);
    ctx.fillStyle = '#fff1b5';
    ctx.fillRect(lanX - 2, lanY + 2, 4, 6);

    // Tent groundsheet & staked pegs at bottom
    ctx.fillStyle = '#14100a';
    ctx.fillRect(0, h - 10, w, 10);
  }

  _drawCityScene(ctx, w, h, st) {
    // 1. Kingdom / Port Sky Gradient
    const pal0 = this._rgbStr(st.band0);
    const pal1 = this._rgbStr(st.band1);
    const pal2 = this._rgbStr(st.band2);
    const pal3 = this._rgbStr(st.band3);

    ctx.fillStyle = pal0;
    ctx.fillRect(0, 0, w, Math.floor(h * 0.28));
    ctx.fillStyle = pal1;
    ctx.fillRect(0, Math.floor(h * 0.28), w, Math.floor(h * 0.26));
    ctx.fillStyle = pal2;
    ctx.fillRect(0, Math.floor(h * 0.54), w, Math.floor(h * 0.24));
    ctx.fillStyle = pal3;
    ctx.fillRect(0, Math.floor(h * 0.78), w, h);

    // 2. Pre-Colonial Philippine Kingdom Skyline (Stepped Torogan & Kota Roofs + Balangay Masts)
    const buildings = [
      { x: 18, w: 68, h: 46, roofH: 18 },
      { x: 96, w: 88, h: 58, roofH: 22 },
      { x: 196, w: 116, h: 68, roofH: 26 }, // Grand Royal Torogan
      { x: 324, w: 82, h: 52, roofH: 18 },
      { x: 416, w: 74, h: 48, roofH: 16 }
    ];

    for (const b of buildings) {
      const baseY = h - 16;
      const topY = baseY - b.h;
      // Building timber body
      ctx.fillStyle = '#170d09';
      ctx.fillRect(b.x, topY + b.roofH, b.w, b.h - b.roofH);

      // Sweeping Torogan pitched roof with upturned panolong wing-tips
      ctx.fillStyle = '#24130c';
      ctx.beginPath();
      ctx.moveTo(b.x - 10, topY + b.roofH + 2);
      ctx.lineTo(b.x + Math.floor(b.w * 0.5), topY);
      ctx.lineTo(b.x + b.w + 10, topY + b.roofH + 2);
      ctx.closePath();
      ctx.fill();

      // Warm glowing palace & market-house windows
      for (let wx = b.x + 10; wx < b.x + b.w - 12; wx += 16) {
        for (let wy = topY + b.roofH + 8; wy < baseY - 14; wy += 14) {
          const flicker = 0.65 + 0.25 * Math.sin(this.tick * 0.05 + wx * 0.2 + wy);
          ctx.fillStyle = `rgba(242, 184, 82, ${flicker})`;
          ctx.fillRect(wx, wy, 6, 7);
        }
      }
    }

    // Tall Balangay Ship Masts & Rigging at the Right Harbor Wharf
    for (let mx = 516; mx <= 596; mx += 38) {
      const sway = Math.sin(this.tick * 0.03 + mx) * 2;
      ctx.fillStyle = '#1c100a';
      ctx.fillRect(Math.floor(mx + sway), 24, 3, h - 38);
      ctx.fillRect(Math.floor(mx - 16 + sway), 42, 34, 2);
      ctx.fillStyle = 'rgba(72, 44, 28, 0.78)';
      ctx.fillRect(Math.floor(mx - 14 + sway), 44, 30, 18);
    }

    // 3. Overhead Festive Market Lantern Strings Swaying Across the Plaza
    ctx.strokeStyle = 'rgba(42, 24, 14, 0.75)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, 14);
    ctx.quadraticCurveTo(Math.floor(w * 0.5), 32, w, 16);
    ctx.stroke();

    for (let lx = 44; lx < w - 30; lx += 52) {
      const tNorm = lx / w;
      const ly = Math.floor(14 + Math.sin(tNorm * Math.PI) * 14 + Math.sin(this.tick * 0.06 + lx) * 1.5);
      ctx.fillStyle = 'rgba(235, 134, 52, 0.35)';
      ctx.fillRect(lx - 4, ly - 2, 10, 12);
      ctx.fillStyle = '#f5c25b';
      ctx.fillRect(lx - 1, ly, 4, 7);
    }

    // 4. Bustling Crowd of Townsfolk & Merchants Moving Along the Lower Boardwalk
    ctx.fillStyle = '#0d0705';
    ctx.fillRect(0, h - 16, w, 16);

    for (let c = 0; c < 28; c += 1) {
      const dir = c % 2 === 0 ? 1 : -1;
      const speed = 0.25 + (c % 4) * 0.08;
      const rawX = (c * 29 + this.tick * speed * dir) % (w + 20);
      const cx = rawX < -10 ? rawX + w + 20 : rawX;
      const bob = Math.abs(Math.sin(this.tick * 0.12 + c)) * 2;
      const cy = Math.floor(h - 15 - bob);

      // Silhouette head (some wearing conical salakot hats or carrying shoulder poles)
      ctx.fillStyle = '#090403';
      ctx.fillRect(Math.floor(cx), cy - 9, 4, 4);
      if (c % 3 === 0) {
        // Woven Salakot hat brim
        ctx.fillRect(Math.floor(cx) - 2, cy - 10, 8, 2);
      }
      // Silhouette torso/cloak
      ctx.fillRect(Math.floor(cx) - 1, cy - 5, 6, 8);
    }

    // 5. Smooth Weather Overlay (Rain / Spirit Mist) Across the Kingdom Skyline
    this._drawWeatherParticlesOnSky(ctx, w, h);
  }

  _drawWeatherParticlesOnSky(ctx, w, h) {
    const ws = this.currentWeatherState || this._computeTargetWeatherState();

    // 1. Gradual Rain Build-Up & Calm-Down
    if (ws.rainIntensity > 0.015) {
      const floatDrops = ws.rainIntensity * this.particles.length;
      const maxDrops = Math.min(this.particles.length, Math.ceil(floatDrops));
      const vx = -(0.65 + ws.rainIntensity * 2.15);
      const vy = 1.65 + ws.rainIntensity * 3.15;
      const dropW = ws.rainIntensity > 0.72 ? 2 : 1;
      const dropH = Math.max(3, Math.round(3 + ws.rainIntensity * 6));
      const baseAlpha = 0.25 + ws.rainIntensity * 0.55;

      for (let i = 0; i < maxDrops; i += 1) {
        const p = this.particles[i];
        p.x += vx;
        p.y += vy;
        if (p.y > h) {
          p.y = -4;
          p.x = Math.random() * w;
        }
        if (p.x < 0) p.x = w;
        const dropWeight = Math.min(1, Math.max(0, floatDrops - i));
        ctx.fillStyle = `rgba(195, 218, 236, ${(baseAlpha * dropWeight).toFixed(3)})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), dropW, dropH);
      }
    }

    // 2. Gradual Spirit Fog Bands & Bioluminescent Motes
    if (ws.fogIntensity > 0.02) {
      ctx.fillStyle = `rgba(140, 224, 184, ${(0.16 * ws.fogIntensity).toFixed(3)})`;
      const bandOffset = Math.floor(Math.sin(this.tick * 0.025) * 24);
      ctx.fillRect(0, Math.floor(h * 0.42), w, 16);
      ctx.fillRect(bandOffset, Math.floor(h * 0.65), w, 20);

      const moteFloat = ws.fogIntensity * 28;
      const moteMax = Math.ceil(moteFloat);
      for (let i = 0; i < moteMax; i += 1) {
        const p = this.particles[i];
        p.x += Math.sin(this.tick * 0.02 + p.phase) * 0.55;
        p.y -= 0.35;
        if (p.y < 4) p.y = h - 12;
        const wgt = Math.min(1, Math.max(0, moteFloat - i)) * ws.fogIntensity;
        ctx.fillStyle =
          i % 2 === 0
            ? `rgba(140, 224, 184, ${wgt.toFixed(3)})`
            : `rgba(223, 177, 91, ${wgt.toFixed(3)})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 3, 3);
      }
    }

    // 3. Gradual Clear Sky Fireflies / Drifting Embers
    if (ws.clearIntensity > 0.02 && this.environment !== 'CITY') {
      const fireflyFloat = ws.clearIntensity * 24;
      const fireflyMax = Math.ceil(fireflyFloat);
      for (let i = 0; i < fireflyMax; i += 1) {
        const p = this.particles[i];
        p.x += Math.cos(this.tick * 0.02 + p.phase) * 0.4;
        p.y += Math.sin(this.tick * 0.03 + p.phase) * 0.3;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        const wgt = Math.min(1, Math.max(0, fireflyFloat - i)) * ws.clearIntensity;
        ctx.fillStyle =
          i % 3 === 0
            ? `rgba(217, 114, 54, ${wgt.toFixed(3)})`
            : `rgba(223, 177, 91, ${wgt.toFixed(3)})`;
        ctx.fillRect(Math.floor(p.x), Math.floor(p.y), 2, 2);
      }
    }
  }

  _drawSky() {
    if (!this.skyCanvas) return;
    const ctx = this.skyCanvas.getContext('2d');
    const w = this.skyCanvas.width;
    const h = this.skyCanvas.height;

    const st = this.currentColorState || this._computeTargetColorState();

    if (this.environment === 'CABIN') {
      this._drawCabinScene(ctx, w, h, st);
      return;
    }
    if (this.environment === 'TENT') {
      this._drawTentScene(ctx, w, h, st);
      return;
    }
    if (this.environment === 'CITY') {
      this._drawCityScene(ctx, w, h, st);
      return;
    }

    const pal0 = this._rgbStr(st.band0);
    const pal1 = this._rgbStr(st.band1);
    const pal2 = this._rgbStr(st.band2);
    const pal3 = this._rgbStr(st.band3);

    ctx.fillStyle = pal0;
    ctx.fillRect(0, 0, w, Math.floor(h * 0.28));
    ctx.fillStyle = pal1;
    ctx.fillRect(0, Math.floor(h * 0.28), w, Math.floor(h * 0.26));
    ctx.fillStyle = pal2;
    ctx.fillRect(0, Math.floor(h * 0.54), w, Math.floor(h * 0.24));
    ctx.fillStyle = pal3;
    ctx.fillRect(0, Math.floor(h * 0.78), w, h);

    // Subtle stars at NIGHT / MIDNIGHT / PRE-DAWN (fade smoothly as stormIntensity rises)
    const ws = this.currentWeatherState || this._computeTargetWeatherState();
    if (this.timeOfDay !== 'DAY' && ws.stormIntensity < 0.92) {
      const starAlpha = 0.55 * (1 - ws.stormIntensity * 0.9);
      ctx.fillStyle = `rgba(245, 234, 216, ${starAlpha.toFixed(3)})`;
      for (let s = 0; s < 22; s += 1) {
        const sx = (s * 73 + 19) % w;
        const sy = (s * 29 + 7) % Math.floor(h * 0.52);
        if ((this.tick + s * 13) % 60 < 45) {
          ctx.fillRect(sx, sy, 2, 2);
        }
      }
    }

    // Occasional lightning flash in MONSOON (scaled by stormIntensity)
    if (ws.stormIntensity > 0.35 && this.tick % 190 < 3) {
      ctx.fillStyle = `rgba(245, 234, 216, ${(0.5 * ws.stormIntensity).toFixed(3)})`;
      ctx.fillRect(0, 0, w, h);
    }

    // 2. Celestial Body (Sun / Crescent Moon / Bleeding Bakunawa Eclipse)
    const celestialX = w - 96;
    const celestialY = 18;
    if (this.timeOfDay === 'MIDNIGHT') {
      // Outer crimson corona
      ctx.fillStyle = 'rgba(217, 68, 54, 0.28)';
      ctx.fillRect(celestialX - 6, celestialY - 6, 36, 36);
      ctx.fillStyle = '#c9382c';
      ctx.fillRect(celestialX, celestialY, 24, 24);
      ctx.fillStyle = '#0c0507';
      ctx.fillRect(celestialX + 5, celestialY + 3, 16, 16);
    } else if (this.timeOfDay === 'DAY') {
      ctx.fillStyle = 'rgba(235, 183, 107, 0.24)';
      ctx.fillRect(celestialX - 5, celestialY - 5, 32, 32);
      ctx.fillStyle = '#e6b968';
      ctx.fillRect(celestialX, celestialY, 22, 22);
    } else {
      ctx.fillStyle = 'rgba(223, 211, 190, 0.2)';
      ctx.fillRect(celestialX - 4, celestialY - 4, 28, 28);
      ctx.fillStyle = '#dfd3be';
      ctx.fillRect(celestialX, celestialY, 20, 20);
      ctx.fillStyle = pal0;
      ctx.fillRect(celestialX + 6, celestialY + 2, 12, 12);
    }

    // 3. Distant Cordillera Ridges & Balete Canopy Silhouette
    ctx.fillStyle = '#140b08';
    for (let x = 0; x < w; x += 24) {
      const farPeak = 14 + ((x * 11) % 22);
      ctx.fillRect(x, h - 12 - farPeak, 26, farPeak + 12);
    }

    ctx.fillStyle = '#0a0604';
    ctx.fillRect(0, h - 14, w, 14);
    for (let x = 0; x < w; x += 18) {
      const hillH = 8 + ((x * 7) % 16);
      ctx.fillRect(x, h - 14 - hillH, 18, hillH);
    }

    // 4. Smoothly Interpolated Weather Particles (Rain Build-Up / Calm-Down, Spirit Fog, Clear Embers)
    this._drawWeatherParticlesOnSky(ctx, w, h);
  }
}

class MythosRPGApp {
  constructor() {
    this.eventBus = eventBus;
    this.audio = new DarkReverbAudioEngine();
    this.visualizer = null;
    this.world = null;
    this.typewriter = null;
    this.director = null;
    this.expandedItemUid = null;
    this.inventoryFilter = 'all';
    this.selectedCodexId = 'bakunawa';
    this.currentCreationMode = 'archetype';

    this.presetState = {
      name: generateRandomName(),
      socialStatus: rollRandomSocialStatus()
    };

    this.randomCharState = null;

    this.customState = {
      name: generateRandomName(),
      backgroundId: PlayerBackgrounds[0].id,
      expertiseId: EXPERTISE_OPTIONS[0].id,
      socialStatus: rollRandomSocialStatus(),
      baseStats: { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 },
      allocated: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 },
      pointsRemaining: 10
    };

    this.dom = {
      screenFadeOverlay: document.getElementById('screen-fade-overlay'),
      launchScreen: document.getElementById('launch-screen'),
      launchMainCard: document.getElementById('launch-main-card'),
      btnLaunchStart: document.getElementById('btn-launch-start'),
      btnLaunchOptions: document.getElementById('btn-launch-options'),
      btnHeaderCodex: document.getElementById('btn-header-codex'),
      btnHeaderOptions: document.getElementById('btn-header-options'),
      optionsModal: document.getElementById('options-modal'),
      btnCloseOptions: document.getElementById('btn-close-options'),
      btnToggleSfx: document.getElementById('btn-toggle-sfx'),
      btnToggleAmbient: document.getElementById('btn-toggle-ambient'),
      optionRowRestart: document.getElementById('option-row-restart'),
      restartConfirmBox: document.getElementById('restart-confirm-box'),
      btnConfirmRestart: document.getElementById('btn-confirm-restart'),
      btnCancelRestart: document.getElementById('btn-cancel-restart'),
      weatherSkyCanvas: document.getElementById('weather-sky-canvas'),
      ambientBleedCanvas: document.getElementById('ambient-bleed-canvas'),
      visTimeLabel: document.getElementById('vis-time-label'),
      visWeatherLabel: document.getElementById('vis-weather-label'),
      visEnvLabel: document.getElementById('vis-env-label'),
      charInfoModal: document.getElementById('char-info-modal'),
      btnOpenCharInfo: document.getElementById('btn-open-char-info'),
      btnCloseCharInfo: document.getElementById('btn-close-char-info'),
      modalCharName: document.getElementById('modal-char-name'),
      modalCharSubtitle: document.getElementById('modal-char-subtitle'),
      equipmentSlotsGrid: document.getElementById('equipment-slots-grid'),
      playerInventoryList: document.getElementById('player-inventory-list'),
      inventoryCountBadge: document.getElementById('inventory-count-badge'),
      invFilterTabs: document.querySelectorAll('.inv-tab'),
      mythHoverTooltip: document.getElementById('myth-hover-tooltip'),
      mythTipName: document.getElementById('myth-tip-name'),
      mythTipCategory: document.getElementById('myth-tip-category'),
      mythTipAttitude: document.getElementById('myth-tip-attitude'),
      mythTipSummary: document.getElementById('myth-tip-summary'),
      mythCodexModal: document.getElementById('myth-codex-modal'),
      btnCloseCodex: document.getElementById('btn-close-codex'),
      codexEntryList: document.getElementById('codex-entry-list'),
      codexEntityCategory: document.getElementById('codex-entity-category'),
      codexEntityName: document.getElementById('codex-entity-name'),
      codexEntitySubtitle: document.getElementById('codex-entity-subtitle'),
      codexEntityOrigin: document.getElementById('codex-entity-origin'),
      codexEntityAttitude: document.getElementById('codex-entity-attitude'),
      codexEntityWards: document.getElementById('codex-entity-wards'),
      codexEntityAttributes: document.getElementById('codex-entity-attributes'),
      codexEntityDescription: document.getElementById('codex-entity-description'),
      backgroundModal: document.getElementById('background-selection-screen'),
      modeTabs: document.querySelectorAll('.mode-tab'),
      panelArchetype: document.getElementById('mode-panel-archetype'),
      panelRandom: document.getElementById('mode-panel-random'),
      panelCustom: document.getElementById('mode-panel-custom'),
      presetRandomName: document.getElementById('preset-random-name'),
      presetRandomStatus: document.getElementById('preset-random-status'),
      btnRerollPresetName: document.getElementById('btn-reroll-preset-name'),
      btnBgScrollLeft: document.getElementById('btn-bg-scroll-left'),
      btnBgScrollRight: document.getElementById('btn-bg-scroll-right'),
      backgroundGrid: document.getElementById('background-cards-grid'),
      randomShowcase: document.getElementById('random-character-showcase'),
      customNameInput: document.getElementById('custom-name-input'),
      btnRandomCustomName: document.getElementById('btn-random-custom-name'),
      customBgSelect: document.getElementById('custom-bg-select'),
      customBgDesc: document.getElementById('custom-bg-desc'),
      customExpSelect: document.getElementById('custom-exp-select'),
      customExpDesc: document.getElementById('custom-exp-desc'),
      customStatusTitle: document.getElementById('custom-status-title'),
      customStatusDesc: document.getElementById('custom-status-desc'),
      btnRerollCustomStatus: document.getElementById('btn-reroll-custom-status'),
      customPointsRemaining: document.getElementById('custom-points-remaining'),
      customStatAllocator: document.getElementById('custom-stat-allocator'),
      customPreviewHp: document.getElementById('custom-preview-hp'),
      customPreviewRemnants: document.getElementById('custom-preview-remnants'),
      btnStartCustomChar: document.getElementById('btn-start-custom-char'),
      gameWorkspace: document.getElementById('game-workspace'),
      actBanner: document.getElementById('scene-act'),
      sceneTitle: document.getElementById('scene-title'),
      sceneLocation: document.getElementById('scene-location'),
      narrativeContainer: document.getElementById('narrative-output'),
      choicesContainer: document.getElementById('choices-container'),
      skipButton: document.getElementById('btn-skip-text'),
      restartButton: document.getElementById('btn-restart'),
      charName: document.getElementById('char-archetype-name'),
      charTag: document.getElementById('char-archetype-tag'),
      charStatusBadge: document.getElementById('char-status-badge'),
      vitalityValue: document.getElementById('vitality-value'),
      vitalityBar: document.getElementById('vitality-bar-fill'),
      sanityValue: document.getElementById('sanity-value'),
      sanityBar: document.getElementById('sanity-bar-fill'),
      statsList: document.getElementById('stats-list'),
      statusList: document.getElementById('status-effects-list'),
      inventoryList: document.getElementById('inventory-list'),
      diceLogList: document.getElementById('dice-log-list')
    };
  }

  init() {
    this.typewriter = new TypewriterEngine(this.dom.narrativeContainer, this.eventBus, {
      charDelay: 12
    });

    this.visualizer = new AtmosphereVisualizer(
      this.dom.weatherSkyCanvas,
      this.dom.ambientBleedCanvas
    );

    this._bindGlobalEvents();
    this._initCreationUI();
    this._renderCodexModal(this.selectedCodexId);
    this._initScrollFades();
    this.setScreenState('LAUNCH');
  }

  _initScrollFades() {
    const verticalEls = [
      this.dom.codexEntryList,
      this.dom.playerInventoryList,
      this.dom.inventoryList,
      this.dom.statusList,
      this.dom.diceLogList,
      this.dom.charInfoModal && this.dom.charInfoModal.querySelector('.char-info-box'),
      this.dom.mythCodexModal && this.dom.mythCodexModal.querySelector('#codex-detail-pane')
    ].filter(Boolean);

    for (const el of verticalEls) {
      el.classList.add('scroll-fade-y');
      el.addEventListener('scroll', () => this._updateScrollFade(el, 'y'), { passive: true });
    }

    if (this.dom.backgroundGrid) {
      this.dom.backgroundGrid.addEventListener(
        'scroll',
        () => this._updateScrollFade(this.dom.backgroundGrid, 'x'),
        { passive: true }
      );
    }

    window.addEventListener('resize', () => this._refreshAllScrollFades(), { passive: true });
    this._refreshAllScrollFades();
  }

  _updateScrollFade(el, axis = 'y') {
    if (!el) return;
    const threshold = 6;
    if (axis === 'x') {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const canLeft = el.scrollLeft > threshold;
      const canRight = maxScroll - el.scrollLeft > threshold;
      el.classList.remove('fade-x-left', 'fade-x-right', 'fade-x-both', 'fade-x-none');
      if (maxScroll <= threshold) {
        el.classList.add('fade-x-none');
      } else if (canLeft && canRight) {
        el.classList.add('fade-x-both');
      } else if (canLeft) {
        el.classList.add('fade-x-left');
      } else {
        el.classList.add('fade-x-right');
      }
    } else {
      const maxScroll = el.scrollHeight - el.clientHeight;
      const canUp = el.scrollTop > threshold;
      const canDown = maxScroll - el.scrollTop > threshold;
      el.classList.remove('fade-y-top', 'fade-y-bottom', 'fade-y-both', 'fade-y-none');
      if (maxScroll <= threshold) {
        el.classList.add('fade-y-none');
      } else if (canUp && canDown) {
        el.classList.add('fade-y-both');
      } else if (canUp) {
        el.classList.add('fade-y-top');
      } else {
        el.classList.add('fade-y-bottom');
      }
    }
  }

  _refreshAllScrollFades() {
    window.requestAnimationFrame(() => {
      if (this.dom.backgroundGrid) this._updateScrollFade(this.dom.backgroundGrid, 'x');
      if (this.dom.codexEntryList) this._updateScrollFade(this.dom.codexEntryList, 'y');
      if (this.dom.playerInventoryList) this._updateScrollFade(this.dom.playerInventoryList, 'y');
      if (this.dom.inventoryList) this._updateScrollFade(this.dom.inventoryList, 'y');
      if (this.dom.statusList) this._updateScrollFade(this.dom.statusList, 'y');
      if (this.dom.diceLogList) this._updateScrollFade(this.dom.diceLogList, 'y');
      const charBox =
        this.dom.charInfoModal && this.dom.charInfoModal.querySelector('.char-info-box');
      if (charBox) this._updateScrollFade(charBox, 'y');
      const codexDetail =
        this.dom.mythCodexModal && this.dom.mythCodexModal.querySelector('#codex-detail-pane');
      if (codexDetail) this._updateScrollFade(codexDetail, 'y');
    });
  }

  setScreenState(state) {
    this.currentScreenState = state;
    const isLaunch = state === 'LAUNCH';
    const isSelect = state === 'CHARACTER_SELECT';
    const isGame = state === 'GAMEPLAY';

    if (this.visualizer) {
      this.visualizer.setScreenMode(isGame ? 'GAMEPLAY' : 'MAP');
    }

    if (this.dom.launchScreen) {
      this.dom.launchScreen.hidden = !isLaunch;
      this.dom.launchScreen.style.display = isLaunch ? '' : 'none';
    }

    if (this.dom.backgroundModal) {
      this.dom.backgroundModal.hidden = !isSelect;
      this.dom.backgroundModal.style.display = isSelect ? '' : 'none';
    }

    if (this.dom.gameWorkspace) {
      this.dom.gameWorkspace.hidden = !isGame;
      this.dom.gameWorkspace.style.display = isGame ? '' : 'none';
    }

    if (this.dom.optionRowRestart) {
      this.dom.optionRowRestart.hidden = !isGame;
      this.dom.optionRowRestart.style.display = isGame ? 'flex' : 'none';
    }

    if (this.dom.restartButton) {
      this.dom.restartButton.hidden = !isGame;
    }

    this.closeOptionsModal();
    this.closeCharInfoModal();
    this.closeCodexModal();
    this._hideMythTooltip();
    this._refreshAllScrollFades();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  transitionScreenState(targetState, onBlackoutCallback = null) {
    const overlay = this.dom.screenFadeOverlay;
    if (!overlay) {
      this.setScreenState(targetState);
      if (typeof onBlackoutCallback === 'function') {
        onBlackoutCallback();
      }
      return;
    }

    if (this._fadeTimeoutId) {
      window.clearTimeout(this._fadeTimeoutId);
      this._fadeTimeoutId = null;
    }

    this.closeOptionsModal();
    this.closeCharInfoModal();
    this.closeCodexModal();
    this._hideMythTooltip();

    overlay.classList.add('is-active');

    this._fadeTimeoutId = window.setTimeout(() => {
      this.setScreenState(targetState);
      if (typeof onBlackoutCallback === 'function') {
        onBlackoutCallback();
      }
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          overlay.classList.remove('is-active');
        });
      });
      this._fadeTimeoutId = null;
    }, 460);
  }

  openCodexModal(entryId = null) {
    if (entryId && MYTHOLOGY_CODEX[entryId]) {
      this.selectedCodexId = entryId;
    }
    this._renderCodexModal(this.selectedCodexId);
    this._hideMythTooltip();
    if (this.dom.mythCodexModal) {
      this.dom.mythCodexModal.hidden = false;
      this.dom.mythCodexModal.style.display = 'flex';
      this._refreshAllScrollFades();
    }
  }

  closeCodexModal() {
    if (this.dom.mythCodexModal) {
      this.dom.mythCodexModal.hidden = true;
      this.dom.mythCodexModal.style.display = 'none';
    }
  }

  _renderCodexModal(activeId) {
    const entry = getMythologyEntry(activeId) || MYTHOLOGY_CODEX.bakunawa;
    if (!entry) return;
    this.selectedCodexId = entry.id;

    if (this.dom.codexEntryList) {
      this.dom.codexEntryList.innerHTML = '';
      for (const item of Object.values(MYTHOLOGY_CODEX)) {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `codex-entry-btn ${item.id === entry.id ? 'active' : ''}`;
        btn.innerHTML = `
          <span>${item.name}</span>
          <span class="card-tag">${item.category.split(' ')[0]}</span>
        `;
        btn.addEventListener('click', () => {
          this.audio.playClick();
          this._renderCodexModal(item.id);
        });
        li.appendChild(btn);
        this.dom.codexEntryList.appendChild(li);
      }
    }

    if (this.dom.codexEntityCategory) this.dom.codexEntityCategory.textContent = entry.category;
    if (this.dom.codexEntityName) this.dom.codexEntityName.textContent = entry.name;
    if (this.dom.codexEntitySubtitle) this.dom.codexEntitySubtitle.textContent = entry.title;
    if (this.dom.codexEntityOrigin) this.dom.codexEntityOrigin.textContent = entry.origin;

    if (this.dom.codexEntityAttitude) {
      this.dom.codexEntityAttitude.textContent = entry.attitude;
      this.dom.codexEntityAttitude.className = `codex-attitude-value tone-${
        entry.attitudeTone || 'neutral'
      }`;
    }

    if (this.dom.codexEntityWards) {
      this.dom.codexEntityWards.textContent = entry.wards || 'Unknown';
    }

    if (this.dom.codexEntityAttributes) {
      this.dom.codexEntityAttributes.innerHTML = (entry.attributes || [])
        .map((attr) => `<li class="codex-attr-pill">❖ ${attr}</li>`)
        .join('');
    }

    if (this.dom.codexEntityDescription) {
      this.dom.codexEntityDescription.textContent = entry.description;
    }
    const codexDetail =
      this.dom.mythCodexModal && this.dom.mythCodexModal.querySelector('#codex-detail-pane');
    if (codexDetail) {
      codexDetail.scrollTop = 0;
    }
    this._refreshAllScrollFades();
  }

  _showMythTooltip(entry, clientX, clientY) {
    if (!entry || !this.dom.mythHoverTooltip) return;
    if (this.dom.mythTipName) this.dom.mythTipName.textContent = entry.name;
    if (this.dom.mythTipCategory) this.dom.mythTipCategory.textContent = entry.category;
    if (this.dom.mythTipAttitude) {
      this.dom.mythTipAttitude.textContent = `Attitude: ${entry.attitude}`;
    }
    if (this.dom.mythTipSummary) this.dom.mythTipSummary.textContent = entry.shortSummary;

    this.dom.mythHoverTooltip.hidden = false;
    this._positionMythTooltip(clientX, clientY);
  }

  _positionMythTooltip(clientX, clientY) {
    const tip = this.dom.mythHoverTooltip;
    if (!tip || tip.hidden) return;
    const offset = 16;
    const rect = tip.getBoundingClientRect();
    let left = clientX + offset;
    let top = clientY + offset;

    if (left + rect.width > window.innerWidth - 12) {
      left = Math.max(12, clientX - rect.width - offset);
    }
    if (top + rect.height > window.innerHeight - 12) {
      top = Math.max(12, clientY - rect.height - offset);
    }

    tip.style.left = `${left}px`;
    tip.style.top = `${top}px`;
  }

  _hideMythTooltip() {
    if (this.dom.mythHoverTooltip) {
      this.dom.mythHoverTooltip.hidden = true;
    }
  }

  openOptionsModal() {
    this._hideRestartConfirm();
    const isGame = this.currentScreenState === 'GAMEPLAY';
    if (this.dom.optionRowRestart) {
      this.dom.optionRowRestart.hidden = !isGame;
      this.dom.optionRowRestart.style.display = isGame ? 'flex' : 'none';
    }
    if (this.dom.optionsModal) {
      this.dom.optionsModal.hidden = false;
      this.dom.optionsModal.style.display = 'flex';
    }
  }

  closeOptionsModal() {
    this._hideRestartConfirm();
    if (this.dom.optionsModal) {
      this.dom.optionsModal.hidden = true;
      this.dom.optionsModal.style.display = 'none';
    }
  }

  _showRestartConfirm() {
    if (this.dom.restartConfirmBox) {
      this.dom.restartConfirmBox.hidden = false;
      this.dom.restartConfirmBox.style.display = 'flex';
    }
  }

  _hideRestartConfirm() {
    if (this.dom.restartConfirmBox) {
      this.dom.restartConfirmBox.hidden = true;
      this.dom.restartConfirmBox.style.display = 'none';
    }
  }

  openCharInfoModal() {
    if (!this.world) return;
    const player = this.world.getEntity('player');
    if (player) {
      this._updateCharacterHUD(player);
      this._renderEquipmentSlotsModal(player);
    }
    if (this.dom.charInfoModal) {
      this.dom.charInfoModal.hidden = false;
      this.dom.charInfoModal.style.display = 'flex';
      this._refreshAllScrollFades();
    }
  }

  closeCharInfoModal() {
    if (this.dom.charInfoModal) {
      this.dom.charInfoModal.hidden = true;
      this.dom.charInfoModal.style.display = 'none';
    }
  }

  _enterFullscreen() {
    const docEl = document.documentElement;
    const isFullscreen =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement;
    if (isFullscreen || !docEl) return;

    const req =
      docEl.requestFullscreen ||
      docEl.webkitRequestFullscreen ||
      docEl.msRequestFullscreen;
    if (typeof req === 'function') {
      try {
        const res = req.call(docEl);
        if (res && typeof res.catch === 'function') {
          res.catch(() => {});
        }
      } catch (_err) {
        // Ignore if blocked by browser policy
      }
    }
  }

  _bindGlobalEvents() {
    if (this.dom.btnLaunchStart) {
      this.dom.btnLaunchStart.addEventListener('mouseenter', () => this.audio.playHover());
      this.dom.btnLaunchStart.addEventListener('click', () => {
        this._enterFullscreen();
        this.audio.playStartGong();
        this.audio.setAmbientEnvironment('DRIZZLE', 'DUSK');
        this.showBackgroundScreen();
      });
    }

    if (this.dom.btnLaunchOptions) {
      this.dom.btnLaunchOptions.addEventListener('mouseenter', () => this.audio.playHover());
      this.dom.btnLaunchOptions.addEventListener('click', () => {
        this.audio.playClick();
        this.openOptionsModal();
      });
    }

    if (this.dom.btnHeaderCodex) {
      this.dom.btnHeaderCodex.addEventListener('mouseenter', () => this.audio.playHover());
      this.dom.btnHeaderCodex.addEventListener('click', () => {
        this.audio.playClick();
        this.openCodexModal();
      });
    }

    if (this.dom.btnCloseCodex) {
      this.dom.btnCloseCodex.addEventListener('mouseenter', () => this.audio.playHover());
      this.dom.btnCloseCodex.addEventListener('click', () => {
        this.audio.playClick();
        this.closeCodexModal();
      });
    }

    if (this.dom.btnHeaderOptions) {
      this.dom.btnHeaderOptions.addEventListener('mouseenter', () => this.audio.playHover());
      this.dom.btnHeaderOptions.addEventListener('click', () => {
        this.audio.playClick();
        this.openOptionsModal();
      });
    }

    if (this.dom.btnCloseOptions) {
      this.dom.btnCloseOptions.addEventListener('mouseenter', () => this.audio.playHover());
      this.dom.btnCloseOptions.addEventListener('click', () => {
        this.audio.playClick();
        this.closeOptionsModal();
      });
    }

    if (this.dom.btnOpenCharInfo) {
      this.dom.btnOpenCharInfo.addEventListener('mouseenter', () => this.audio.playHover());
      this.dom.btnOpenCharInfo.addEventListener('click', () => {
        this.audio.playClick();
        this.openCharInfoModal();
      });
    }

    if (this.dom.btnCloseCharInfo) {
      this.dom.btnCloseCharInfo.addEventListener('mouseenter', () => this.audio.playHover());
      this.dom.btnCloseCharInfo.addEventListener('click', () => {
        this.audio.playClick();
        this.closeCharInfoModal();
      });
    }

    if (this.dom.btnToggleSfx) {
      this.dom.btnToggleSfx.addEventListener('click', () => {
        const on = this.audio.toggleSfx();
        this.dom.btnToggleSfx.textContent = on ? 'ENABLED' : 'DISABLED';
        this.dom.btnToggleSfx.classList.toggle('is-off', !on);
        if (on) this.audio.playClick();
      });
    }

    if (this.dom.btnToggleAmbient) {
      this.dom.btnToggleAmbient.addEventListener('click', () => {
        const on = this.audio.toggleAmbient();
        this.dom.btnToggleAmbient.textContent = on ? 'ENABLED' : 'DISABLED';
        this.dom.btnToggleAmbient.classList.toggle('is-off', !on);
        this.audio.playClick();
      });
    }

    if (this.dom.invFilterTabs) {
      for (const tab of this.dom.invFilterTabs) {
        tab.addEventListener('click', () => {
          this.audio.playClick();
          this.inventoryFilter = tab.getAttribute('data-inv-filter') || 'all';
          for (const t of this.dom.invFilterTabs) {
            t.classList.toggle('active', t === tab);
          }
          if (this.world) {
            const player = this.world.getEntity('player');
            if (player) this._renderInventoryPanel(player);
          }
        });
      }
    }

    // Delegated hover & click events for Philippine Mythology terms (.myth-term)
    document.addEventListener('mouseover', (e) => {
      const termEl = e.target.closest('.myth-term');
      if (!termEl) return;
      const mythId = termEl.getAttribute('data-myth-id');
      const entry = getMythologyEntry(mythId);
      if (entry) {
        this.audio.playHover();
        this._showMythTooltip(entry, e.clientX, e.clientY);
      }
    });

    document.addEventListener('mousemove', (e) => {
      const termEl = e.target.closest('.myth-term');
      if (!termEl) {
        this._hideMythTooltip();
        return;
      }
      this._positionMythTooltip(e.clientX, e.clientY);
    });

    document.addEventListener('mouseout', (e) => {
      const termEl = e.target.closest('.myth-term');
      if (termEl) {
        this._hideMythTooltip();
      }
    });

    document.addEventListener('click', (e) => {
      const termEl = e.target.closest('.myth-term');
      if (!termEl) return;
      e.stopPropagation();
      const mythId = termEl.getAttribute('data-myth-id');
      if (mythId) {
        this.audio.playClick();
        this.openCodexModal(mythId);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const termEl = e.target.closest && e.target.closest('.myth-term');
        if (termEl) {
          e.preventDefault();
          const mythId = termEl.getAttribute('data-myth-id');
          if (mythId) {
            this.audio.playClick();
            this.openCodexModal(mythId);
          }
        }
      } else if (e.key === 'Escape') {
        this.closeCodexModal();
        this.closeCharInfoModal();
        this.closeOptionsModal();
      }
    });

    for (const tab of this.dom.modeTabs) {
      tab.addEventListener('click', () => {
        const mode = tab.getAttribute('data-mode');
        if (this.currentCreationMode === mode) return;
        this.audio.playClick();
        this._switchCreationMode(mode);
      });
    }

    if (this.dom.btnRerollPresetName) {
      this.dom.btnRerollPresetName.addEventListener('click', () => {
        this.audio.playClick();
        this.presetState.name = generateRandomName();
        this.presetState.socialStatus = rollRandomSocialStatus();
        this._updatePresetBanner();
      });
    }

    if (this.dom.btnBgScrollLeft && this.dom.backgroundGrid) {
      this.dom.btnBgScrollLeft.addEventListener('mouseenter', () => this.audio.playHover());
      this.dom.btnBgScrollLeft.addEventListener('click', () => {
        this.audio.playClick();
        this.dom.backgroundGrid.scrollBy({ left: -360, behavior: 'smooth' });
      });
    }

    if (this.dom.btnBgScrollRight && this.dom.backgroundGrid) {
      this.dom.btnBgScrollRight.addEventListener('mouseenter', () => this.audio.playHover());
      this.dom.btnBgScrollRight.addEventListener('click', () => {
        this.audio.playClick();
        this.dom.backgroundGrid.scrollBy({ left: 360, behavior: 'smooth' });
      });
    }

    if (this.dom.backgroundGrid) {
      this.dom.backgroundGrid.addEventListener(
        'wheel',
        (e) => {
          if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
            e.preventDefault();
            this.dom.backgroundGrid.scrollLeft += e.deltaY;
          }
        },
        { passive: false }
      );

      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;
      this.dom.backgroundGrid.addEventListener('mousedown', (e) => {
        if (e.target.closest('button') || e.target.closest('.myth-term')) return;
        isDown = true;
        startX = e.pageX - this.dom.backgroundGrid.offsetLeft;
        scrollLeft = this.dom.backgroundGrid.scrollLeft;
      });
      window.addEventListener('mouseup', () => {
        isDown = false;
      });
      this.dom.backgroundGrid.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - this.dom.backgroundGrid.offsetLeft;
        const walk = (x - startX) * 1.4;
        this.dom.backgroundGrid.scrollLeft = scrollLeft - walk;
      });
    }

    if (this.dom.skipButton) {
      this.dom.skipButton.addEventListener('click', () => {
        this.audio.playClick();
        this.typewriter.skipToEnd();
      });
    }

    if (this.dom.narrativeContainer) {
      this.dom.narrativeContainer.addEventListener('click', (e) => {
        if (e.target.closest('.myth-term')) return;
        if (this.typewriter.isTyping) {
          this.audio.playClick();
          this.typewriter.skipToEnd();
        }
      });
    }

    if (this.dom.restartButton) {
      this.dom.restartButton.addEventListener('mouseenter', () => this.audio.playHover());
      this.dom.restartButton.addEventListener('click', () => {
        this.audio.playClick();
        this._showRestartConfirm();
      });
    }

    if (this.dom.btnConfirmRestart) {
      this.dom.btnConfirmRestart.addEventListener('mouseenter', () => this.audio.playHover());
      this.dom.btnConfirmRestart.addEventListener('click', () => {
        this.audio.playStartGong();
        this._hideRestartConfirm();
        this.closeOptionsModal();
        this.showBackgroundScreen();
      });
    }

    if (this.dom.btnCancelRestart) {
      this.dom.btnCancelRestart.addEventListener('mouseenter', () => this.audio.playHover());
      this.dom.btnCancelRestart.addEventListener('click', () => {
        this.audio.playClick();
        this._hideRestartConfirm();
      });
    }

    this.eventBus.on('typewriter:start', () => {
      if (this.dom.skipButton) {
        this.dom.skipButton.hidden = false;
      }
    });

    this.eventBus.on('typewriter:tick', () => {
      this.audio.playTypeTick();
    });

    this.eventBus.on('typewriter:complete', () => {
      if (this.dom.skipButton) {
        this.dom.skipButton.hidden = true;
      }
    });

    this.eventBus.on(
      'narrative:nodeEntered',
      ({
        title,
        location,
        act,
        weather = 'DRIZZLE',
        timeOfDay = 'DUSK',
        environment = 'OUTDOOR'
      }) => {
        const envDisplayLabels = {
          CABIN: 'BAHAY KUBO',
          TENT: 'FIELD TENT',
          CITY: 'KINGDOM & PORT',
          OUTDOOR: 'WILDERNESS'
        };
        const envLabel = envDisplayLabels[environment] || 'WILDERNESS';

        this.audio.playSceneTransition();
        this.audio.setAmbientEnvironment(weather, timeOfDay, environment);
        if (this.visualizer) {
          this.visualizer.setEnvironment(weather, timeOfDay, environment);
        }
        if (this.dom.visTimeLabel) this.dom.visTimeLabel.textContent = timeOfDay;
        if (this.dom.visWeatherLabel) this.dom.visWeatherLabel.textContent = weather;
        if (this.dom.visEnvLabel) this.dom.visEnvLabel.textContent = envLabel;
        if (this.dom.actBanner) this.dom.actBanner.textContent = act || '';
        if (this.dom.sceneTitle) this.dom.sceneTitle.textContent = title || '';
        if (this.dom.sceneLocation) {
          this.dom.sceneLocation.textContent = `${location || ''} // ${envLabel}`;
        }
      }
    );

    this.eventBus.on('choices:clear', () => {
      if (this.dom.choicesContainer) {
        this.dom.choicesContainer.innerHTML = '';
      }
    });

    this.eventBus.on('choices:render', ({ choices, isEnding }) => {
      this._renderChoices(choices, isEnding);
    });

    this.eventBus.on('ui:updateStats', ({ entity }) => {
      this._updateCharacterHUD(entity);
    });

    this.eventBus.on('ui:updateInventory', ({ entity }) => {
      this._renderInventoryPanel(entity);
      this._renderEquipmentSlotsModal(entity);
    });

    this.eventBus.on('world:tagsUpdated', ({ activeTags }) => {
      this._updateTagsHUD(activeTags);
      this._updateEchoesHUD(activeTags);
    });

    this.eventBus.on('check:resolved', (result) => {
      if (!result.isPassive) {
        this.audio.playCheckOutcome(result.success);
      }
      this._appendCheckLog(result);
    });

    this.eventBus.on('log:mechanical', (entry) => {
      this._appendMechanicalLog(entry);
    });
  }

  showBackgroundScreen() {
    this.transitionScreenState('CHARACTER_SELECT', () => {
      this.typewriter.clear();
      this.presetState.name = generateRandomName();
      this.presetState.socialStatus = rollRandomSocialStatus();
      this._updatePresetBanner();
      this._rollRandomizedUniqueCharacter();
      this.customState.socialStatus = rollRandomSocialStatus();
      this._renderCustomCreator();
      this._switchCreationMode('archetype');
    });
  }

  _switchCreationMode(mode) {
    this.currentCreationMode = mode;
    for (const tab of this.dom.modeTabs) {
      const isActive = tab.getAttribute('data-mode') === mode;
      tab.classList.toggle('active', isActive);
      tab.disabled = isActive;
    }
    if (this.dom.panelArchetype) {
      this.dom.panelArchetype.hidden = mode !== 'archetype';
      this.dom.panelArchetype.style.display = mode === 'archetype' ? '' : 'none';
    }
    if (this.dom.panelRandom) {
      this.dom.panelRandom.hidden = mode !== 'random';
      this.dom.panelRandom.style.display = mode === 'random' ? '' : 'none';
    }
    if (this.dom.panelCustom) {
      this.dom.panelCustom.hidden = mode !== 'custom';
      this.dom.panelCustom.style.display = mode === 'custom' ? '' : 'none';
    }
    this._refreshAllScrollFades();
  }

  _initCreationUI() {
    this._updatePresetBanner();
    this._renderBackgroundSelection();
    this._rollRandomizedUniqueCharacter();
    this._setupCustomCreatorControls();
    this._renderCustomCreator();
  }

  _updatePresetBanner() {
    if (this.dom.presetRandomName) {
      this.dom.presetRandomName.textContent = this.presetState.name;
    }
  }

  _renderBackgroundSelection() {
    if (!this.dom.backgroundGrid) return;
    this.dom.backgroundGrid.innerHTML = '';

    for (const bg of PlayerBackgrounds) {
      const exp =
        EXPERTISE_OPTIONS.find((e) => e.id === bg.defaultExpertiseId) || EXPERTISE_OPTIONS[0];
      const card = document.createElement('article');
      card.className = 'background-card pixel-frame';

      const statsBadges = Object.entries(bg.stats)
        .map(([key, val]) => {
          const def = STAT_DEFINITIONS[key];
          const label = def ? def.name : key;
          return `<span class="stat-pill"><strong>${label}:</strong> ${val}</span>`;
        })
        .join('');

      card.innerHTML = `
        <div class="card-header">
          <span class="card-tag">${bg.tag}</span>
          <h3>${bg.name}</h3>
        </div>
        <p class="card-quote">${bg.quote}</p>
        <p class="card-desc">${bg.description}</p>
        <p class="field-hint"><strong>Expertise:</strong> ${exp.name}</p>
        <div class="card-stats-row">${statsBadges}</div>
        <div class="card-vitals-row">
          <span>VITALITY: <strong>${bg.maxVitality}</strong></span>
          <span>REMNANTS: <strong>${bg.startingRemnants}</strong></span>
        </div>
        <button type="button" class="pixel-btn full-width" data-bg-id="${bg.id}">
          ▶ START PROLOGUE AS ${bg.name.toUpperCase()}
        </button>
      `;

      const btn = card.querySelector('button');
      btn.addEventListener('mouseenter', () => this.audio.playHover());
      btn.addEventListener('click', () => {
        this.audio.playStartGong();
        this.launchCharacterIntoPrologue({
          characterName: this.presetState.name,
          background: bg,
          expertise: exp,
          stats: { ...bg.stats },
          socialStatus: this.presetState.socialStatus
        });
      });

      const descEl = card.querySelector('.card-desc');
      const quoteEl = card.querySelector('.card-quote');
      if (descEl) annotateMythologyTerms(descEl);
      if (quoteEl) annotateMythologyTerms(quoteEl);

      this.dom.backgroundGrid.appendChild(card);
    }
  }

  _rollRandomizedUniqueCharacter() {
    const bg = PlayerBackgrounds[Math.floor(Math.random() * PlayerBackgrounds.length)];
    const exp = EXPERTISE_OPTIONS[Math.floor(Math.random() * EXPERTISE_OPTIONS.length)];
    const socialStatus = rollRandomSocialStatus();
    const characterName = generateRandomName();

    const stats = { STR: 9, DEX: 9, CON: 9, INT: 9, WIS: 9, CHA: 9 };
    const keys = Object.keys(stats);
    for (let i = 0; i < 12; i += 1) {
      const k = keys[Math.floor(Math.random() * keys.length)];
      if (stats[k] < 16) {
        stats[k] += 1;
      }
    }
    if (exp.statBonus) {
      for (const [k, bonus] of Object.entries(exp.statBonus)) {
        stats[k] = (stats[k] || 10) + bonus;
      }
    }

    this.randomCharState = {
      characterName,
      background: bg,
      expertise: exp,
      stats,
      socialStatus
    };

    if (!this.dom.randomShowcase) return;

    const statsBadges = Object.entries(stats)
      .map(([key, val]) => {
        const def = STAT_DEFINITIONS[key];
        const label = def ? def.name : key;
        return `<span class="stat-pill"><strong>${label}:</strong> ${val}</span>`;
      })
      .join('');

    const baseHp =
      bg.maxVitality + Math.max(0, StatResolver.getModifier(stats.CON) * 2);

    this.dom.randomShowcase.innerHTML = `
      <div class="creator-grid">
        <div class="creator-col">
          <span class="card-tag">FATE-FORGED UNIQUE VESSEL</span>
          <h3 class="highlight-gold" style="font-family: var(--font-pixel-header); font-size: 1.05rem;">
            ${characterName}
          </h3>
          <p class="card-desc">
            <strong>Calling:</strong> ${bg.name} (${bg.tag})<br/>
            ${bg.description}
          </p>
          <p class="card-desc">
            <strong>Expertise:</strong> ${exp.name}<br/>
            ${exp.description}
          </p>
        </div>
        <div class="creator-col">
          <div class="stat-pool-header pixel-frame">
            <span>ATTRIBUTES</span>
            <span>FATE-SHAPED</span>
          </div>
          <div class="card-stats-row" style="gap: 0.6rem; margin: 0.5rem 0;">
            ${statsBadges}
          </div>
          <div class="creator-summary pixel-frame">
            <span>BASE HP: <strong>${baseHp}</strong></span>
            <span>REMNANTS: <strong>??? (Fated)</strong></span>
          </div>
          <div class="input-row" style="margin-top: auto;">
            <button type="button" id="btn-reroll-random-vessel" class="pixel-btn" style="flex: 1;">
              🎲 REROLL VESSEL
            </button>
            <button type="button" id="btn-start-random-vessel" class="pixel-btn-start" style="flex: 1.3; padding: 0.75rem;">
              ▶ ENTER PROLOGUE
            </button>
          </div>
        </div>
      </div>
    `;

    const rerollBtn = document.getElementById('btn-reroll-random-vessel');
    if (rerollBtn) {
      rerollBtn.addEventListener('click', () => {
        this.audio.playClick();
        this._rollRandomizedUniqueCharacter();
      });
    }

    const startBtn = document.getElementById('btn-start-random-vessel');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.audio.playStartGong();
        this.launchCharacterIntoPrologue(this.randomCharState);
      });
    }
  }

  _setupCustomCreatorControls() {
    if (this.dom.customBgSelect) {
      this.dom.customBgSelect.innerHTML = PlayerBackgrounds.map(
        (bg) => `<option value="${bg.id}">${bg.name} (${bg.tag})</option>`
      ).join('');

      this.dom.customBgSelect.addEventListener('change', (e) => {
        this.audio.playClick();
        this.customState.backgroundId = e.target.value;
        this._renderCustomCreator();
      });
    }

    if (this.dom.customExpSelect) {
      this.dom.customExpSelect.innerHTML = EXPERTISE_OPTIONS.map(
        (exp) => `<option value="${exp.id}">${exp.name}</option>`
      ).join('');

      this.dom.customExpSelect.addEventListener('change', (e) => {
        this.audio.playClick();
        this.customState.expertiseId = e.target.value;
        this._renderCustomCreator();
      });
    }

    if (this.dom.customNameInput) {
      this.dom.customNameInput.value = this.customState.name;
      this.dom.customNameInput.addEventListener('input', (e) => {
        this.customState.name = e.target.value;
      });
    }

    if (this.dom.btnRandomCustomName) {
      this.dom.btnRandomCustomName.addEventListener('click', () => {
        this.audio.playClick();
        this.customState.name = generateRandomName();
        if (this.dom.customNameInput) {
          this.dom.customNameInput.value = this.customState.name;
        }
      });
    }

    if (this.dom.btnStartCustomChar) {
      this.dom.btnStartCustomChar.addEventListener('click', () => {
        this.audio.playStartGong();
        const bg =
          PlayerBackgrounds.find((b) => b.id === this.customState.backgroundId) ||
          PlayerBackgrounds[0];
        const exp =
          EXPERTISE_OPTIONS.find((x) => x.id === this.customState.expertiseId) ||
          EXPERTISE_OPTIONS[0];
        const finalName =
          (this.dom.customNameInput && this.dom.customNameInput.value.trim()) ||
          generateRandomName();

        const finalStats = this._computeCustomFinalStats();
        this.launchCharacterIntoPrologue({
          characterName: finalName,
          background: bg,
          expertise: exp,
          stats: finalStats,
          socialStatus: this.customState.socialStatus
        });
      });
    }
  }

  _computeCustomFinalStats() {
    const exp =
      EXPERTISE_OPTIONS.find((x) => x.id === this.customState.expertiseId) ||
      EXPERTISE_OPTIONS[0];
    const result = {};
    for (const key of Object.keys(STAT_DEFINITIONS)) {
      const base = this.customState.baseStats[key] || 10;
      const alloc = this.customState.allocated[key] || 0;
      const expBonus = exp.statBonus && exp.statBonus[key] ? exp.statBonus[key] : 0;
      result[key] = base + alloc + expBonus;
    }
    return result;
  }

  _renderCustomCreator() {
    const bg =
      PlayerBackgrounds.find((b) => b.id === this.customState.backgroundId) ||
      PlayerBackgrounds[0];
    const exp =
      EXPERTISE_OPTIONS.find((x) => x.id === this.customState.expertiseId) ||
      EXPERTISE_OPTIONS[0];
    const status = this.customState.socialStatus;

    if (this.dom.customBgDesc) {
      this.dom.customBgDesc.textContent = bg.description;
    }
    if (this.dom.customExpDesc) {
      const bonusAspects = Object.keys(exp.statBonus)
        .map((k) => (STAT_DEFINITIONS[k] ? STAT_DEFINITIONS[k].name : k))
        .join(' & ');
      this.dom.customExpDesc.textContent = `${exp.description} (Boosts ${bonusAspects})`;
    }
    if (this.dom.customStatusTitle) {
      this.dom.customStatusTitle.textContent = 'SEALED BY FATE';
      this.dom.customStatusTitle.style.color = 'var(--brass-bright)';
    }
    if (this.dom.customStatusDesc) {
      this.dom.customStatusDesc.textContent =
        'Your birthright, social standing, and wealth will only be revealed once your chronicle begins.';
    }
    if (this.dom.customPointsRemaining) {
      this.dom.customPointsRemaining.textContent = `${this.customState.pointsRemaining} PTS LEFT`;
    }

    const finalStats = this._computeCustomFinalStats();

    if (this.dom.customStatAllocator) {
      this.dom.customStatAllocator.innerHTML = '';
      for (const [key, def] of Object.entries(STAT_DEFINITIONS)) {
        const baseVal = (this.customState.baseStats[key] || 10) + (this.customState.allocated[key] || 0);
        const expBonus = exp.statBonus && exp.statBonus[key] ? exp.statBonus[key] : 0;
        const bonusTag =
          expBonus > 0 ? ` <span class="stat-gear-bonus">(+${expBonus})</span>` : '';
        const li = document.createElement('li');
        li.className = 'allocator-row';
        li.innerHTML = `
          <div>
            <span class="stat-name">${def.name} (${key})</span>
            <span class="stat-sub">${def.subtitle}</span>
          </div>
          <div class="alloc-controls">
            <button type="button" class="pixel-btn btn-small btn-dec" data-stat="${key}">-</button>
            <strong class="alloc-val">${baseVal}${bonusTag}</strong>
            <button type="button" class="pixel-btn btn-small btn-inc" data-stat="${key}">+</button>
          </div>
        `;

        const decBtn = li.querySelector('.btn-dec');
        const incBtn = li.querySelector('.btn-inc');

        decBtn.disabled = this.customState.allocated[key] <= -2;
        incBtn.disabled =
          this.customState.pointsRemaining <= 0 || this.customState.allocated[key] >= 6;

        decBtn.addEventListener('click', () => {
          if (this.customState.allocated[key] > -2) {
            this.audio.playClick();
            this.customState.allocated[key] -= 1;
            this.customState.pointsRemaining += 1;
            this._renderCustomCreator();
          }
        });

        incBtn.addEventListener('click', () => {
          if (this.customState.pointsRemaining > 0 && this.customState.allocated[key] < 6) {
            this.audio.playClick();
            this.customState.allocated[key] += 1;
            this.customState.pointsRemaining -= 1;
            this._renderCustomCreator();
          }
        });

        this.dom.customStatAllocator.appendChild(li);
      }
    }

    const baseHp =
      bg.maxVitality + Math.max(0, StatResolver.getModifier(finalStats.CON) * 2);

    if (this.dom.customPreviewHp) this.dom.customPreviewHp.textContent = `${baseHp}`;
    if (this.dom.customPreviewRemnants) {
      this.dom.customPreviewRemnants.textContent = '??? (Fated)';
    }
  }

  launchCharacterIntoPrologue({ characterName, background, expertise, stats, socialStatus }) {
    this._enterFullscreen();
    this.world = new World(this.eventBus);
    this.world
      .registerSystem(new VitalitySystem(this.world, this.eventBus))
      .registerSystem(new RemnantSystem(this.world, this.eventBus))
      .registerSystem(new InventorySystem(this.world, this.eventBus));

    const maxHp =
      background.maxVitality +
      socialStatus.hpMod +
      Math.max(0, StatResolver.getModifier(stats.CON) * 2);
    const startRemnants = Math.max(0, background.startingRemnants + socialStatus.remnantsBonus);

    const emptySlots = {};
    for (const s of EQUIPMENT_SLOTS) {
      emptySlots[s.id] = null;
    }

    const player = this.world.createEntity('player', characterName);
    player.world = this.world;
    player
      .addComponent(
        new Component('Identity', {
          characterName,
          backgroundId: background.id,
          backgroundName: background.name,
          name: characterName,
          tag: `${background.name} // ${expertise.name}`,
          expertiseId: expertise.id,
          expertiseName: expertise.name,
          socialStatus
        })
      )
      .addComponent(
        new Component('Stats', {
          ...stats,
          base: { ...stats },
          bonuses: { STR: 0, DEX: 0, CON: 0, INT: 0, WIS: 0, CHA: 0 }
        })
      )
      .addComponent(
        new Component('Vitality', {
          current: maxHp,
          max: maxHp
        })
      )
      .addComponent(
        new Component('Remnants', {
          count: startRemnants
        })
      )
      .addComponent(
        new Component('Inventory', {
          items: [],
          slots: emptySlots
        })
      );

    if (Array.isArray(background.startingFlags)) {
      for (const flag of background.startingFlags) {
        this.world.setFlag(flag);
      }
    }
    if (socialStatus && socialStatus.tag) {
      this.world.setFlag(socialStatus.tag);
    }
    if (expertise && expertise.tag) {
      this.world.setFlag(expertise.tag);
    }

    const starterList = [
      ...(background.startingEquipment || []),
      ...(socialStatus.bonusItems || []),
      ...(expertise.bonusItems || [])
    ];
    for (const templateId of starterList) {
      this.eventBus.emit('inventory:add', { templateId, autoEquip: true });
    }

    if (this.dom.diceLogList) {
      this.dom.diceLogList.innerHTML = '';
    }

    if (socialStatus) {
      this._appendMechanicalLog({
        type: 'status_apply',
        text: `Fate Revealed: ${socialStatus.label} (${socialStatus.wealthLabel} Wealth).`
      });
    }

    this.transitionScreenState('GAMEPLAY', () => {
      this._updateCharacterHUD(player);
      this._renderInventoryPanel(player);
      this._renderEquipmentSlotsModal(player);
      this._updateTagsHUD([...this.world.flags]);
      this._updateEchoesHUD([...this.world.flags]);

      this.director = new HierarchicalProbabilisticNarrativeDirector({
        world: this.world,
        eventBus: this.eventBus,
        typewriter: this.typewriter,
        registry: NarrativeRegistry
      });

      this.director.startScenario();
    });
  }

  _updateCharacterHUD(player) {
    if (!player) return;

    const identity = player.getComponent('Identity');
    const vitality = player.getComponent('Vitality');
    const remnants = player.getComponent('Remnants');
    const stats = player.getComponent('Stats');

    if (identity) {
      if (this.dom.charName) this.dom.charName.textContent = identity.characterName || identity.name;
      if (this.dom.charTag) this.dom.charTag.textContent = identity.tag;
      if (this.dom.charStatusBadge && identity.socialStatus) {
        this.dom.charStatusBadge.textContent = `${identity.socialStatus.label}`;
        this.dom.charStatusBadge.style.color = identity.socialStatus.badgeColor;
      }
      if (this.dom.modalCharName) {
        this.dom.modalCharName.textContent = identity.characterName || identity.name;
      }
      if (this.dom.modalCharSubtitle) {
        const st = identity.socialStatus ? identity.socialStatus.label : '';
        this.dom.modalCharSubtitle.textContent = `${identity.tag} // ${st}`;
      }
    }

    if (vitality) {
      const pct = Math.max(0, Math.min(100, (vitality.current / vitality.max) * 100));
      if (this.dom.vitalityValue) {
        this.dom.vitalityValue.textContent = `${vitality.current} / ${vitality.max}`;
      }
      if (this.dom.vitalityBar) {
        this.dom.vitalityBar.style.width = `${pct}%`;
      }
    }

    if (remnants) {
      if (this.dom.sanityValue) {
        this.dom.sanityValue.textContent = `${remnants.count}`;
      }
      if (this.dom.sanityBar) {
        const pct = Math.max(5, Math.min(100, (remnants.count / 30) * 100));
        this.dom.sanityBar.style.width = `${pct}%`;
      }
    }

    if ( stats && this.dom.statsList ) {
      this.dom.statsList.innerHTML = '';
      for (const [key, def] of Object.entries(STAT_DEFINITIONS)) {
        const totalVal = stats[key] ?? 10;
        const gearBonus = stats.bonuses && stats.bonuses[key] ? stats.bonuses[key] : 0;
        const bonusHtml =
          gearBonus > 0 ? `<span class="stat-gear-bonus">(+${gearBonus} Gear)</span>` : '';

        const li = document.createElement('li');
        li.className = 'stat-item';
        li.title = `${def.subtitle}: ${def.description}`;
        li.innerHTML = `
          <span class="stat-name">${def.name} (${key})</span>
          <span class="stat-score">${totalVal}${bonusHtml}</span>
        `;
        this.dom.statsList.appendChild(li);
      }
    }
  }

  _formatStatBonusesInline(item) {
    if (item.insideOut) {
      return '+1 WIS (Stats Suppressed)';
    }
    const parts = [];
    if (item.statBonuses) {
      for (const [stat, val] of Object.entries(item.statBonuses)) {
        if (val !== 0) {
          parts.push(`${val > 0 ? '+' : ''}${val} ${stat}`);
        }
      }
    }
    return parts.join(', ');
  }

  _getItemCategoryIcon(item) {
    if (item.category === 'weapon') return '⚔';
    if (item.category === 'tool') return '🔦';
    if (item.category === 'medical') return '✚';
    if (item.category === 'material') return '🧵';
    return '🛡';
  }

  _renderInventoryPanel(player) {
    if (!player || !this.dom.playerInventoryList) return;
    const inv = player.getComponent('Inventory');
    if (!inv) return;

    const equippedCount = inv.items.filter((i) => Boolean(i.equippedSlot)).length;
    if (this.dom.inventoryCountBadge) {
      this.dom.inventoryCountBadge.textContent = `${equippedCount} EQ / ${inv.items.length} TOTAL`;
    }

    this.dom.playerInventoryList.innerHTML = '';

    const filtered = inv.items.filter((item) => {
      if (this.inventoryFilter === 'equipped') return Boolean(item.equippedSlot);
      if (this.inventoryFilter === 'gear') return Boolean(item.slot);
      if (this.inventoryFilter === 'usable') {
        return Boolean(item.usable || item.canCombineWithSheet || item.category === 'material');
      }
      return true;
    });

    if (filtered.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-note';
      li.textContent =
        inv.items.length === 0 ? 'Your pack is empty.' : 'No items in this category.';
      this.dom.playerInventoryList.appendChild(li);
      return;
    }

    const sorted = [...filtered].sort((a, b) => {
      if (Boolean(a.equippedSlot) !== Boolean(b.equippedSlot)) {
        return a.equippedSlot ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });

    const hasSheet = inv.items.some((i) => i.id === 'ripped_sheets');

    for (const item of sorted) {
      const isExpanded = this.expandedItemUid === item.uid;
      const li = document.createElement('li');
      li.className = `pz-item-card ${item.equippedSlot ? 'is-equipped' : ''} ${
        isExpanded ? 'expanded' : ''
      }`;

      const icon = this._getItemCategoryIcon(item);
      const statSummary = this._formatStatBonusesInline(item);

      let subrowHtml = '';
      if (item.equippedSlot) {
        subrowHtml += `<span class="pz-badge">EQUIPPED: ${item.equippedSlot.toUpperCase()}</span>`;
      } else if (item.slot) {
        subrowHtml += `<span class="pz-badge" style="opacity:0.7;">${item.slot.toUpperCase()}</span>`;
      }
      if (statSummary) {
        subrowHtml += `<span class="pz-stat-pill">${statSummary}</span>`;
      }
      if (item.insideOut) {
        subrowHtml += `<span class="pz-badge badge-inside-out">INSIDE-OUT</span>`;
      }

      let quickActionLabel = '';
      let quickActionType = '';
      if (item.slot) {
        quickActionLabel = item.equippedSlot ? 'UNEQUIP' : 'EQUIP';
        quickActionType = 'equip';
      } else if (item.usable) {
        quickActionLabel = 'USE';
        quickActionType = 'use';
      }

      const quickBtnHtml = quickActionLabel
        ? `<button type="button" class="pz-quick-btn ${
            item.equippedSlot ? 'is-equipped-btn' : ''
          }" data-quick="${quickActionType}">${quickActionLabel}</button>`
        : '';

      li.innerHTML = `
        <div class="pz-item-header">
          <div class="pz-item-main">
            <div class="pz-item-title-row">
              <span class="pz-item-icon" aria-hidden="true">${icon}</span>
              <span class="pz-item-title">${item.name}</span>
            </div>
            <div class="pz-item-subrow">${subrowHtml}</div>
          </div>
          ${quickBtnHtml}
        </div>
        <div class="pz-item-details" ${isExpanded ? '' : 'hidden'}>
          <p class="pz-item-desc">${item.description || ''}</p>
          <div class="pz-item-actions"></div>
        </div>
      `;

      const descEl = li.querySelector('.pz-item-desc');
      if (descEl) annotateMythologyTerms(descEl);

      const quickBtn = li.querySelector('.pz-quick-btn');
      if (quickBtn) {
        quickBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.audio.playClick();
          if (quickActionType === 'equip') {
            this.eventBus.emit('inventory:equipToggle', { uid: item.uid });
          } else if (quickActionType === 'use') {
            this.eventBus.emit('inventory:useItem', { uid: item.uid });
          }
        });
      }

      const header = li.querySelector('.pz-item-header');
      header.addEventListener('click', () => {
        this.audio.playClick();
        this.expandedItemUid = this.expandedItemUid === item.uid ? null : item.uid;
        this._renderInventoryPanel(player);
      });

      const actionsBar = li.querySelector('.pz-item-actions');

      if (item.slot) {
        const eqBtn = document.createElement('button');
        eqBtn.type = 'button';
        eqBtn.className = 'pz-action-btn';
        eqBtn.textContent = item.equippedSlot ? 'Unequip' : 'Equip';
        eqBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.audio.playClick();
          this.eventBus.emit('inventory:equipToggle', { uid: item.uid });
        });
        actionsBar.appendChild(eqBtn);
      }

      if (item.canFlipInsideOut) {
        const flipBtn = document.createElement('button');
        flipBtn.type = 'button';
        flipBtn.className = 'pz-action-btn';
        flipBtn.textContent = item.insideOut ? 'Wear Normally' : 'Wear Inside-Out';
        flipBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.audio.playClick();
          this.eventBus.emit('inventory:flipInsideOut', { uid: item.uid });
        });
        actionsBar.appendChild(flipBtn);
      }

      if (item.canRip) {
        const ripBtn = document.createElement('button');
        ripBtn.type = 'button';
        ripBtn.className = 'pz-action-btn';
        ripBtn.textContent = `Rip into ${item.ripYield || 2} Sheets`;
        ripBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.audio.playClick();
          this.eventBus.emit('inventory:ripItem', { uid: item.uid });
        });
        actionsBar.appendChild(ripBtn);
      }

      if (item.usable) {
        const useBtn = document.createElement('button');
        useBtn.type = 'button';
        useBtn.className = 'pz-action-btn';
        useBtn.textContent = item.useActionLabel || 'Use';
        useBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.audio.playClick();
          this.eventBus.emit('inventory:useItem', { uid: item.uid });
        });
        actionsBar.appendChild(useBtn);
      }

      if (item.canCombineWithSheet && hasSheet) {
        const craftBtn = document.createElement('button');
        craftBtn.type = 'button';
        craftBtn.className = 'pz-action-btn';
        craftBtn.textContent = 'Craft Poultice (w/ Sheet)';
        craftBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.audio.playClick();
          this.eventBus.emit('inventory:combineWithSheet', { uid: item.uid });
        });
        actionsBar.appendChild(craftBtn);
      }

      this.dom.playerInventoryList.appendChild(li);
    }
    this._updateScrollFade(this.dom.playerInventoryList, 'y');
  }

  _renderEquipmentSlotsModal(player) {
    if (!player || !this.dom.equipmentSlotsGrid) return;
    const inv = player.getComponent('Inventory');
    if (!inv) return;

    this.dom.equipmentSlotsGrid.innerHTML = '';

    for (const slotDef of EQUIPMENT_SLOTS) {
      const uid = inv.slots[slotDef.id];
      const equippedItem = uid ? inv.items.find((i) => i.uid === uid) : null;

      const li = document.createElement('li');
      li.className = `equip-slot-row ${equippedItem ? 'occupied' : ''}`;

      if (equippedItem) {
        const insideTag = equippedItem.insideOut ? ' [INSIDE-OUT]' : '';
        const statBonusText = this._formatStatBonusesInline(equippedItem);
        const bonusSpan = statBonusText
          ? `<span class="slot-bonus-tag">${statBonusText}</span>`
          : '';

        li.innerHTML = `
          <div class="slot-header-line">
            <span class="slot-name-label">${slotDef.label}</span>
            ${bonusSpan}
          </div>
          <div class="slot-item-name">
            <span>${equippedItem.name}${insideTag}</span>
            <button type="button" class="pz-action-btn btn-unequip-slot">Unequip</button>
          </div>
        `;
        const unequipBtn = li.querySelector('.btn-unequip-slot');
        unequipBtn.addEventListener('click', () => {
          this.audio.playClick();
          this.eventBus.emit('inventory:equipToggle', { uid: equippedItem.uid });
        });
      } else {
        li.innerHTML = `
          <div class="slot-header-line">
            <span class="slot-name-label">${slotDef.label}</span>
          </div>
          <span class="slot-empty-text">Empty</span>
        `;
      }

      this.dom.equipmentSlotsGrid.appendChild(li);
    }
  }

  _updateTagsHUD(tags = []) {
    if (!this.dom.statusList) return;
    this.dom.statusList.innerHTML = '';
    const displayOmens = tags
      .filter((t) => OMEN_TAG_LABELS[t])
      .map((t) => OMEN_TAG_LABELS[t]);

    if (displayOmens.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-note';
      li.textContent = 'The air hangs still.';
      this.dom.statusList.appendChild(li);
      return;
    }

    for (const label of displayOmens) {
      const li = document.createElement('li');
      li.className = 'status-badge';
      li.textContent = label;
      this.dom.statusList.appendChild(li);
    }
    this._updateScrollFade(this.dom.statusList, 'y');
  }

  _updateEchoesHUD(tags = []) {
    if (!this.dom.inventoryList) return;
    this.dom.inventoryList.innerHTML = '';

    const activeEchoes = tags
      .filter((t) => ENTITY_ECHO_LABELS[t])
      .map((t) => ENTITY_ECHO_LABELS[t]);

    if (activeEchoes.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-note';
      li.textContent = 'No spirits or beasts yet hold your debt.';
      this.dom.inventoryList.appendChild(li);
      return;
    }

    for (const echo of activeEchoes) {
      const li = document.createElement('li');
      li.className = 'inventory-item';
      li.innerHTML = `
        <span class="item-name">${echo.title}</span>
        <span class="item-desc">${echo.desc}</span>
      `;
      const nameEl = li.querySelector('.item-name');
      const descEl = li.querySelector('.item-desc');
      if (nameEl) annotateMythologyTerms(nameEl);
      if (descEl) annotateMythologyTerms(descEl);
      this.dom.inventoryList.appendChild(li);
    }
    this._updateScrollFade(this.dom.inventoryList, 'y');
  }

  _renderChoices(choices, isEnding) {
    if (!this.dom.choicesContainer) return;
    this.dom.choicesContainer.innerHTML = '';

    if (isEnding) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn ending-restart-btn';
      btn.textContent = 'FORGE A NEW CHRONICLE';
      btn.addEventListener('mouseenter', () => this.audio.playHover());
      btn.addEventListener('click', () => {
        this.audio.playStartGong();
        this.showBackgroundScreen();
      });
      this.dom.choicesContainer.appendChild(btn);
      return;
    }

    for (const choice of choices) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'choice-btn';

      const badgeHtml = choice.whisper
        ? `<span class="choice-tag">[${choice.whisper}]</span>`
        : '';

      btn.innerHTML = `${badgeHtml}<span class="choice-label">${choice.label}</span>`;
      btn.addEventListener('mouseenter', () => this.audio.playHover());
      btn.addEventListener('click', () => {
        this.audio.playClick();
        this.director.selectChoice(choice.index);
      });

      this.dom.choicesContainer.appendChild(btn);
    }
  }

  _appendCheckLog(result) {
    if (!this.dom.diceLogList) return;
    const li = document.createElement('li');
    li.className = `log-entry outcome-${result.outcome.toLowerCase()}`;
    li.textContent = result.prose || StatResolver.getOutcomeProse(result);
    this.dom.diceLogList.prepend(li);
    this._updateScrollFade(this.dom.diceLogList, 'y');
  }

  _appendMechanicalLog(entry) {
    if (!this.dom.diceLogList) return;
    const li = document.createElement('li');
    li.className = `log-entry log-${entry.type}`;
    if (entry.text) {
      li.textContent = entry.text;
    } else if (entry.delta < 0) {
      li.textContent = `Buhay wounded (${entry.delta}) at ${entry.source}.`;
    } else {
      li.textContent = `Buhay restored (+${entry.delta}) at ${entry.source}.`;
    }
    this.dom.diceLogList.prepend(li);
    this._updateScrollFade(this.dom.diceLogList, 'y');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new MythosRPGApp();
  app.init();
});
