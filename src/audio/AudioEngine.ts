import * as Tone from 'tone';
import { Pattern, DrumType, KitStyle } from '../types';
import { SampleDrumKit, JazzDrumKit, LatinDrumKit, LofiDrumKit } from './SampleDrums';

// Electronic/808-style drum sounds (synthesized)
class ElectronicDrums {
  kick: Tone.MembraneSynth;
  snare: Tone.NoiseSynth;
  hihatClosed: Tone.MetalSynth;
  hihatOpen: Tone.MetalSynth;
  clap: Tone.NoiseSynth;
  tomHigh: Tone.MembraneSynth;
  tomMid: Tone.MembraneSynth;
  tomLow: Tone.MembraneSynth;
  crash: Tone.MetalSynth;
  ride: Tone.MetalSynth;

  constructor(output: Tone.ToneAudioNode) {
    // 808-style kick with long decay
    this.kick = new Tone.MembraneSynth({
      pitchDecay: 0.08,
      octaves: 8,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.5,
        sustain: 0,
        release: 0.3,
      },
    }).connect(output);

    this.snare = new Tone.NoiseSynth({
      noise: { type: 'white' },
      envelope: {
        attack: 0.001,
        decay: 0.15,
        sustain: 0,
        release: 0.08,
      },
    }).connect(output);

    this.clap = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
        release: 0.1,
      },
    }).connect(output);

    this.hihatClosed = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.04,
        release: 0.01,
      },
      harmonicity: 5.1,
      modulationIndex: 40,
      resonance: 5000,
      octaves: 1.5,
    }).connect(output);

    this.hihatOpen = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.25,
        release: 0.08,
      },
      harmonicity: 5.1,
      modulationIndex: 40,
      resonance: 5000,
      octaves: 1.5,
    }).connect(output);

    this.tomHigh = new Tone.MembraneSynth({
      pitchDecay: 0.03,
      octaves: 5,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.25,
        sustain: 0,
        release: 0.15,
      },
    }).connect(output);

    this.tomMid = new Tone.MembraneSynth({
      pitchDecay: 0.03,
      octaves: 5,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.3,
        sustain: 0,
        release: 0.2,
      },
    }).connect(output);

    this.tomLow = new Tone.MembraneSynth({
      pitchDecay: 0.03,
      octaves: 5,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.35,
        sustain: 0,
        release: 0.25,
      },
    }).connect(output);

    this.crash = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 1.2,
        release: 0.4,
      },
      harmonicity: 5.1,
      modulationIndex: 45,
      resonance: 6000,
      octaves: 1.5,
    }).connect(output);

    this.ride = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.6,
        release: 0.2,
      },
      harmonicity: 5.1,
      modulationIndex: 25,
      resonance: 7000,
      octaves: 1,
    }).connect(output);
  }

  trigger(drum: DrumType, velocity: number, time?: number) {
    const vel = Math.max(0.01, Math.min(1, velocity));
    const t = time ?? Tone.now();

    switch (drum) {
      case 'kick':
        this.kick.triggerAttackRelease('C1', '8n', t, vel);
        break;
      case 'snare':
        this.snare.triggerAttackRelease('16n', t, vel * 0.7);
        break;
      case 'hihat-closed':
        this.hihatClosed.triggerAttackRelease('C6', '32n', t, vel * 0.25);
        break;
      case 'hihat-open':
        this.hihatOpen.triggerAttackRelease('C6', '16n', t, vel * 0.25);
        break;
      case 'tom-high':
        this.tomHigh.triggerAttackRelease('E3', '8n', t, vel * 0.9);
        break;
      case 'tom-mid':
        this.tomMid.triggerAttackRelease('B2', '8n', t, vel * 0.9);
        break;
      case 'tom-low':
        this.tomLow.triggerAttackRelease('F2', '8n', t, vel * 0.9);
        break;
      case 'crash':
        this.crash.triggerAttackRelease('C5', '2n', t, vel * 0.35);
        break;
      case 'ride':
        this.ride.triggerAttackRelease('C6', '4n', t, vel * 0.25);
        break;
    }
  }

  async waitForLoad(): Promise<void> {
    // Synths don't need loading
    return Promise.resolve();
  }

  dispose() {
    this.kick.dispose();
    this.snare.dispose();
    this.clap.dispose();
    this.hihatClosed.dispose();
    this.hihatOpen.dispose();
    this.tomHigh.dispose();
    this.tomMid.dispose();
    this.tomLow.dispose();
    this.crash.dispose();
    this.ride.dispose();
  }
}

interface DrumKit {
  trigger(drum: DrumType, velocity: number, time?: number): void;
  waitForLoad(): Promise<void>;
  dispose(): void;
}

export class AudioEngine {
  private currentKit: DrumKit | null = null;
  private kitStyle: KitStyle = 'rock';
  private scheduledEvents: number[] = [];
  private isPlaying = false;
  private currentPattern: Pattern | null = null;
  private loopEnabled = true;
  private masterGain: Tone.Gain;

  constructor() {
    this.masterGain = new Tone.Gain(0.8).toDestination();
  }

  async init(kitStyle?: KitStyle) {
    await Tone.start();

    const newStyle = kitStyle ?? this.kitStyle;

    // Only recreate kit if style changed or no kit exists
    if (!this.currentKit || newStyle !== this.kitStyle) {
      this.currentKit?.dispose();
      this.kitStyle = newStyle;

      switch (newStyle) {
        case 'electronic':
          this.currentKit = new ElectronicDrums(this.masterGain);
          break;
        case 'jazz':
          this.currentKit = new JazzDrumKit(this.masterGain);
          break;
        case 'latin':
          this.currentKit = new LatinDrumKit(this.masterGain);
          break;
        case 'lofi':
          this.currentKit = new LofiDrumKit(this.masterGain);
          break;
        case 'rock':
        default:
          this.currentKit = new SampleDrumKit(this.masterGain);
          break;
      }

      // Wait for samples to load
      await this.currentKit.waitForLoad();
    }
  }

  async setKitStyle(style: KitStyle) {
    if (style !== this.kitStyle) {
      const wasPlaying = this.isPlaying;

      // Stop playback while switching
      if (wasPlaying) {
        this.stop();
      }

      // Switch to new kit
      await this.init(style);

      // Restart if was playing
      if (wasPlaying && this.currentPattern) {
        this.play();
      }
    }
  }

  setPattern(pattern: Pattern) {
    this.currentPattern = pattern;
    Tone.getTransport().bpm.value = pattern.bpm;
  }

  play() {
    if (!this.currentPattern || !this.currentKit) return;

    this.stop();
    this.isPlaying = true;

    const pattern = this.currentPattern;
    const transport = Tone.getTransport();
    transport.bpm.value = pattern.bpm;

    this.schedulePattern(pattern);

    if (this.loopEnabled) {
      transport.loop = true;
      transport.loopStart = 0;
      const beatsPerBar = this.getBeatsPerBar(pattern.timeSignature);
      const bars = Math.floor(pattern.lengthInBeats / beatsPerBar);
      const remainingBeats = pattern.lengthInBeats % beatsPerBar;
      transport.loopEnd = `${bars}:${remainingBeats}:0`;
    }

    transport.start();
  }

  private schedulePattern(pattern: Pattern) {
    if (!this.currentKit) return;

    const transport = Tone.getTransport();
    const beatsPerBar = this.getBeatsPerBar(pattern.timeSignature);

    for (const hit of pattern.hits) {
      const bars = Math.floor(hit.time / beatsPerBar);
      const beats = Math.floor(hit.time % beatsPerBar);
      const sixteenths = (hit.time % 1) * 4;
      const timeStr = `${bars}:${beats}:${sixteenths}`;

      const eventId = transport.schedule((time) => {
        this.currentKit?.trigger(hit.drum, hit.velocity, time);
      }, timeStr);

      this.scheduledEvents.push(eventId);
    }
  }

  stop() {
    const transport = Tone.getTransport();
    transport.stop();
    transport.position = 0;

    for (const eventId of this.scheduledEvents) {
      transport.clear(eventId);
    }
    this.scheduledEvents = [];
    this.isPlaying = false;
  }

  pause() {
    Tone.getTransport().pause();
    this.isPlaying = false;
  }

  resume() {
    Tone.getTransport().start();
    this.isPlaying = true;
  }

  setLoop(enabled: boolean) {
    this.loopEnabled = enabled;
    Tone.getTransport().loop = enabled;
  }

  setVolume(volume: number) {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  setBpm(bpm: number) {
    Tone.getTransport().bpm.value = bpm;
    if (this.currentPattern) {
      this.currentPattern.bpm = bpm;
    }
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  getCurrentPosition(): number {
    const transport = Tone.getTransport();
    return transport.seconds;
  }

  private getBeatsPerBar(timeSignature: string): number {
    switch (timeSignature) {
      case '3/4': return 3;
      case '4/4': return 4;
      case '5/4': return 5;
      case '6/8': return 6;
      case '7/8': return 3.5;
      default: return 4;
    }
  }

  async previewDrum(drum: DrumType) {
    await this.init();
    this.currentKit?.trigger(drum, 0.8);
  }

  dispose() {
    this.stop();
    this.currentKit?.dispose();
    this.currentKit = null;
    this.masterGain.dispose();
  }
}

export const audioEngine = new AudioEngine();
