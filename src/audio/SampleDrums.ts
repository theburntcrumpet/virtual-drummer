import * as Tone from 'tone';
import { DrumType } from '../types';

// Get the base URL for assets (handles both dev and production)
const BASE_URL = import.meta.env.BASE_URL || '/';

/**
 * Sample-based drum kit using real acoustic recordings
 * Rock kit - punchy, present, moderate room
 */
export class SampleDrumKit {
  private players: Map<DrumType, Tone.Player> = new Map();
  private output: Tone.ToneAudioNode;
  private reverb: Tone.Reverb;
  private loadPromise: Promise<void> | null = null;

  constructor(destination: Tone.ToneAudioNode, kitPath: string = `${BASE_URL}samples/acoustic`) {
    // Add subtle room reverb
    this.reverb = new Tone.Reverb({
      decay: 1.2,
      wet: 0.12,
    }).connect(destination);

    this.output = this.reverb;

    // Start loading samples
    this.loadPromise = this.loadSamples(kitPath);
  }

  private async loadSamples(basePath: string): Promise<void> {
    const sampleFiles: Record<DrumType, string> = {
      'kick': 'kick.wav',
      'snare': 'snare.wav',
      'hihat-closed': 'hihat-closed.wav',
      'hihat-open': 'hihat-open.wav',
      'tom-high': 'tom-high.wav',
      'tom-mid': 'tom-mid.wav',
      'tom-low': 'tom-low.wav',
      'crash': 'crash.wav',
      'ride': 'ride.wav',
    };

    const loadPromises: Promise<void>[] = [];

    for (const [drum, file] of Object.entries(sampleFiles)) {
      const url = `${basePath}/${file}`;
      const player = new Tone.Player({
        url,
        onload: () => {
          console.log(`Loaded ${drum}`);
        },
        onerror: (err) => {
          console.error(`Failed to load ${drum}:`, err);
        }
      }).connect(this.output);

      this.players.set(drum as DrumType, player);
      loadPromises.push(Tone.loaded());
    }

    await Promise.all(loadPromises);
    console.log('All drum samples loaded');
  }

  async waitForLoad(): Promise<void> {
    if (this.loadPromise) {
      await this.loadPromise;
    }
  }

  trigger(drum: DrumType, velocity: number, time?: number) {
    const player = this.players.get(drum);
    if (!player || !player.loaded) {
      console.warn(`Sample not loaded: ${drum}`);
      return;
    }

    const t = time ?? Tone.now();
    const vel = Math.max(0.1, Math.min(1, velocity));

    // Adjust playback rate slightly for velocity variation (subtle)
    const rateVariation = 1 + (vel - 0.5) * 0.02;

    player.playbackRate = rateVariation;
    player.volume.value = Tone.gainToDb(vel);
    player.start(t);
  }

  dispose() {
    for (const player of this.players.values()) {
      player.dispose();
    }
    this.players.clear();
    this.reverb.dispose();
  }
}

/**
 * Jazz kit - warm, soft, brushed feel with bigger room
 * Heavy lowpass to remove harshness, lots of reverb
 */
export class JazzDrumKit {
  private players: Map<DrumType, Tone.Player> = new Map();
  private output: Tone.ToneAudioNode;
  private reverb: Tone.Reverb;
  private eq: Tone.EQ3;
  private lowpass: Tone.Filter;
  private loadPromise: Promise<void> | null = null;

  constructor(destination: Tone.ToneAudioNode) {
    // Large room reverb for jazz club feel
    this.reverb = new Tone.Reverb({
      decay: 2.5,
      wet: 0.3,
    }).connect(destination);

    // Lowpass to cut harsh highs - this is key for jazz softness
    this.lowpass = new Tone.Filter({
      frequency: 6000,
      type: 'lowpass',
      rolloff: -12,
    }).connect(this.reverb);

    // Warm EQ - boost lows, cut mids slightly, cut highs
    this.eq = new Tone.EQ3({
      low: 3,
      mid: -3,
      high: -8,
      lowFrequency: 200,
      highFrequency: 3000,
    }).connect(this.lowpass);

    this.output = this.eq;

    this.loadPromise = this.loadSamples(`${BASE_URL}samples/acoustic`);
  }

  private async loadSamples(basePath: string): Promise<void> {
    const sampleFiles: Record<DrumType, string> = {
      'kick': 'kick.wav',
      'snare': 'snare.wav',
      'hihat-closed': 'hihat-closed.wav',
      'hihat-open': 'hihat-open.wav',
      'tom-high': 'tom-high.wav',
      'tom-mid': 'tom-mid.wav',
      'tom-low': 'tom-low.wav',
      'crash': 'crash.wav',
      'ride': 'ride.wav',
    };

    const loadPromises: Promise<void>[] = [];

    for (const [drum, file] of Object.entries(sampleFiles)) {
      const url = `${basePath}/${file}`;
      const player = new Tone.Player({ url }).connect(this.output);
      this.players.set(drum as DrumType, player);
      loadPromises.push(Tone.loaded());
    }

    await Promise.all(loadPromises);
  }

  async waitForLoad(): Promise<void> {
    if (this.loadPromise) {
      await this.loadPromise;
    }
  }

  trigger(drum: DrumType, velocity: number, time?: number) {
    const player = this.players.get(drum);
    if (!player || !player.loaded) return;

    const t = time ?? Tone.now();
    // Jazz is much softer - reduce velocity significantly
    const vel = Math.max(0.1, Math.min(0.7, velocity * 0.6));

    // Slower playback rate for warmer tone
    player.playbackRate = 0.98 + (vel - 0.5) * 0.01;
    player.volume.value = Tone.gainToDb(vel) - 3; // Extra quiet
    player.start(t);
  }

  dispose() {
    for (const player of this.players.values()) {
      player.dispose();
    }
    this.players.clear();
    this.lowpass.dispose();
    this.eq.dispose();
    this.reverb.dispose();
  }
}

/**
 * Latin kit - warm and punchy, good for salsa/bossa
 * Balanced tone, moderate reverb, no harsh highs
 */
export class LatinDrumKit {
  private players: Map<DrumType, Tone.Player> = new Map();
  private output: Tone.ToneAudioNode;
  private reverb: Tone.Reverb;
  private eq: Tone.EQ3;
  private lowpass: Tone.Filter;
  private loadPromise: Promise<void> | null = null;

  constructor(destination: Tone.ToneAudioNode) {
    // Medium room reverb
    this.reverb = new Tone.Reverb({
      decay: 1.0,
      wet: 0.15,
    }).connect(destination);

    // Gentle lowpass to tame harshness
    this.lowpass = new Tone.Filter({
      frequency: 8000,
      type: 'lowpass',
      rolloff: -12,
    }).connect(this.reverb);

    // Warm but present EQ - slight low boost, flat mids, gentle high cut
    this.eq = new Tone.EQ3({
      low: 2,
      mid: 0,
      high: -3,
      lowFrequency: 150,
      highFrequency: 4000,
    }).connect(this.lowpass);

    this.output = this.eq;

    this.loadPromise = this.loadSamples(`${BASE_URL}samples/acoustic`);
  }

  private async loadSamples(basePath: string): Promise<void> {
    const sampleFiles: Record<DrumType, string> = {
      'kick': 'kick.wav',
      'snare': 'snare.wav',
      'hihat-closed': 'hihat-closed.wav',
      'hihat-open': 'hihat-open.wav',
      'tom-high': 'tom-high.wav',
      'tom-mid': 'tom-mid.wav',
      'tom-low': 'tom-low.wav',
      'crash': 'crash.wav',
      'ride': 'ride.wav',
    };

    const loadPromises: Promise<void>[] = [];

    for (const [drum, file] of Object.entries(sampleFiles)) {
      const url = `${basePath}/${file}`;
      const player = new Tone.Player({ url }).connect(this.output);
      this.players.set(drum as DrumType, player);
      loadPromises.push(Tone.loaded());
    }

    await Promise.all(loadPromises);
  }

  async waitForLoad(): Promise<void> {
    if (this.loadPromise) {
      await this.loadPromise;
    }
  }

  trigger(drum: DrumType, velocity: number, time?: number) {
    const player = this.players.get(drum);
    if (!player || !player.loaded) return;

    const t = time ?? Tone.now();
    // Latin has moderate dynamics
    const vel = Math.max(0.1, Math.min(1, velocity * 0.85));

    player.playbackRate = 1 + (vel - 0.5) * 0.015;
    player.volume.value = Tone.gainToDb(vel);
    player.start(t);
  }

  dispose() {
    for (const player of this.players.values()) {
      player.dispose();
    }
    this.players.clear();
    this.lowpass.dispose();
    this.eq.dispose();
    this.reverb.dispose();
  }
}

/**
 * Lo-Fi kit - warm, muffled, tape-like character
 * Heavy lowpass, saturation, big reverb for that chill/dreamy sound
 */
export class LofiDrumKit {
  private players: Map<DrumType, Tone.Player> = new Map();
  private output: Tone.ToneAudioNode;
  private reverb: Tone.Reverb;
  private eq: Tone.EQ3;
  private lowpass: Tone.Filter;
  private bitcrusher: Tone.BitCrusher;
  private loadPromise: Promise<void> | null = null;

  constructor(destination: Tone.ToneAudioNode) {
    // Large dreamy reverb
    this.reverb = new Tone.Reverb({
      decay: 3.0,
      wet: 0.35,
    }).connect(destination);

    // Heavy lowpass for that muffled tape sound
    this.lowpass = new Tone.Filter({
      frequency: 3000,
      type: 'lowpass',
      rolloff: -24,
    }).connect(this.reverb);

    // Subtle bit reduction for that crunchy lofi texture
    this.bitcrusher = new Tone.BitCrusher({
      bits: 12,
    }).connect(this.lowpass);

    // Warm EQ - boost lows and low-mids, cut highs heavily
    this.eq = new Tone.EQ3({
      low: 4,
      mid: 2,
      high: -12,
      lowFrequency: 250,
      highFrequency: 2500,
    }).connect(this.bitcrusher);

    this.output = this.eq;

    this.loadPromise = this.loadSamples(`${BASE_URL}samples/acoustic`);
  }

  private async loadSamples(basePath: string): Promise<void> {
    const sampleFiles: Record<DrumType, string> = {
      'kick': 'kick.wav',
      'snare': 'snare.wav',
      'hihat-closed': 'hihat-closed.wav',
      'hihat-open': 'hihat-open.wav',
      'tom-high': 'tom-high.wav',
      'tom-mid': 'tom-mid.wav',
      'tom-low': 'tom-low.wav',
      'crash': 'crash.wav',
      'ride': 'ride.wav',
    };

    const loadPromises: Promise<void>[] = [];

    for (const [drum, file] of Object.entries(sampleFiles)) {
      const url = `${basePath}/${file}`;
      const player = new Tone.Player({ url }).connect(this.output);
      this.players.set(drum as DrumType, player);
      loadPromises.push(Tone.loaded());
    }

    await Promise.all(loadPromises);
  }

  async waitForLoad(): Promise<void> {
    if (this.loadPromise) {
      await this.loadPromise;
    }
  }

  trigger(drum: DrumType, velocity: number, time?: number) {
    const player = this.players.get(drum);
    if (!player || !player.loaded) return;

    const t = time ?? Tone.now();
    // Lofi has softer dynamics, less punch
    const vel = Math.max(0.1, Math.min(0.85, velocity * 0.75));

    // Slightly slower playback for warmer tone
    player.playbackRate = 0.96 + (vel - 0.5) * 0.02;
    player.volume.value = Tone.gainToDb(vel) - 2;
    player.start(t);
  }

  dispose() {
    for (const player of this.players.values()) {
      player.dispose();
    }
    this.players.clear();
    this.lowpass.dispose();
    this.bitcrusher.dispose();
    this.eq.dispose();
    this.reverb.dispose();
  }
}
