/**
 * DarkReverbAudioEngine.js
 * Procedural Web Audio API Dark Reverb SFX and continuous ambient audio engine.
 * Procedural Dark Fantasy Reverb Sound & Continuous Weather/Time Ambient Engine.
 */
export class DarkReverbAudioEngine {
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
    try {
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

      if (this.ctx && this.ctx.state === 'suspended') {
        const resumePromise = this.ctx.resume();
        if (resumePromise && typeof resumePromise.catch === 'function') {
          resumePromise.catch(() => {});
        }
      }
      return Boolean(this.ctx);
    } catch (_err) {
      return false;
    }
  }

  _initAmbientGraph() {
    try {
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
        try {
          if (!this.ambientEnabled || !this.ctx || this.ctx.state !== 'running') return;
          this._triggerAmbientDetail();
        } catch (_err) {}
      }, 1150);
    } catch (_err) {
      // Ambient graph failure should not crash application
    }
  }

  /**
   * Morph continuous ambient soundscape based on scenario Weather, Time of Day, and Environment.
   * @param {string} weather - 'DRIZZLE' | 'MONSOON' | 'SPIRIT FOG' | 'CLEAR'
   * @param {string} timeOfDay - 'DUSK' | 'NIGHT' | 'MIDNIGHT' | 'PRE-DAWN' | 'DAY'
   * @param {string} [environment='OUTDOOR'] - 'OUTDOOR' | 'CABIN' | 'TENT' | 'CITY'
   */
  setAmbientEnvironment(weather = 'DRIZZLE', timeOfDay = 'DUSK', environment = 'OUTDOOR') {
    try {
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
    } catch (_err) {
      // Audio atmosphere adjustment should never crash execution
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
    try {
      if (this._ensureContext() && this.ambientGain && this.ctx) {
        this.ambientGain.gain.setTargetAtTime(
          this.ambientEnabled ? 0.28 : 0.0001,
          this.ctx.currentTime,
          0.25
        );
      }
    } catch (_err) {}
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
    try {
      if (isAmbient && !this.ambientEnabled) return;
      if (!isAmbient && !this.sfxEnabled) return;
      if (!this._ensureContext() || !this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const env = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (typeof slideTo === 'number' && slideTo > 0) {
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
    } catch (_err) {
      // Audio tone generation should never throw or disrupt game logic
    }
  }

  playClick() {
    try {
      this.playTone({ freq: 165, slideTo: 82, type: 'square', duration: 0.14, gain: 0.15, wet: true });
    } catch (_err) {}
  }

  playHover() {
    try {
      this.playTone({ freq: 110, slideTo: 125, type: 'sine', duration: 0.09, gain: 0.06, wet: true });
    } catch (_err) {}
  }

  playTypeTick() {
    try {
      this.playTone({ freq: 210 + Math.random() * 35, type: 'triangle', duration: 0.032, gain: 0.04, wet: false });
    } catch (_err) {}
  }

  playStartGong() {
    try {
      this.playTone({ freq: 73.42, slideTo: 55.0, type: 'sawtooth', duration: 1.4, gain: 0.22, wet: true });
      this.playTone({ freq: 110.0, type: 'triangle', duration: 1.8, gain: 0.16, wet: true });
      this.playTone({ freq: 164.81, type: 'sine', duration: 2.1, gain: 0.11, wet: true });
    } catch (_err) {}
  }

  playSceneTransition() {
    try {
      this.playTone({ freq: 98.0, slideTo: 73.42, type: 'triangle', duration: 0.9, gain: 0.16, wet: true });
    } catch (_err) {}
  }

  playCheckOutcome(success) {
    try {
      if (success) {
        this.playTone({ freq: 196.0, type: 'triangle', duration: 0.55, gain: 0.2, wet: true });
        setTimeout(() => {
          try {
            this.playTone({ freq: 293.66, type: 'sine', duration: 0.85, gain: 0.2, wet: true });
          } catch (_err) {}
        }, 90);
      } else {
        this.playTone({ freq: 116.54, slideTo: 65.41, type: 'sawtooth', duration: 0.85, gain: 0.2, wet: true });
      }
    } catch (_err) {}
  }

  playDiceRoll() {
    try {
      // Rapid rhythmic tumble clicks mimicking ivory or bone dice against stone
      const clackTones = [280, 320, 240, 310, 190];
      clackTones.forEach((freq, idx) => {
        setTimeout(() => {
          try {
            this.playTone({
              freq: freq + Math.random() * 30,
              slideTo: freq * 0.7,
              type: 'triangle',
              duration: 0.05,
              gain: 0.12 - idx * 0.015,
              wet: true
            });
          } catch (_err) {}
        }, idx * 105);
      });
      setTimeout(() => {
        try {
          this.playTone({
            freq: 95,
            slideTo: 60,
            type: 'sawtooth',
            duration: 0.22,
            gain: 0.18,
            wet: true
          });
        } catch (_err) {}
      }, clackTones.length * 105);
    } catch (_err) {}
  }

  playLoreDiscovery() {
    try {
      // Reverent pentatonic chime for codex and lore unlocks
      const tones = [261.63, 329.63, 392.0, 523.25];
      tones.forEach((freq, idx) => {
        setTimeout(() => {
          try {
            this.playTone({
              freq,
              type: 'sine',
              duration: 0.65,
              gain: 0.16,
              wet: true
            });
          } catch (_err) {}
        }, idx * 110);
      });
    } catch (_err) {}
  }
}
