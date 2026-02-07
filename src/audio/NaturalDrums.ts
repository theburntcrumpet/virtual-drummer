import * as Tone from 'tone';
import { DrumType } from '../types';

/**
 * More natural-sounding drum synthesis using layered sounds
 */
export class NaturalDrumKit {
  private output: Tone.ToneAudioNode;
  private reverb: Tone.Reverb;
  private compressor: Tone.Compressor;

  constructor(destination: Tone.ToneAudioNode) {
    // Room ambience
    this.reverb = new Tone.Reverb({
      decay: 0.8,
      wet: 0.15,
    }).connect(destination);

    // Glue compressor
    this.compressor = new Tone.Compressor({
      threshold: -12,
      ratio: 4,
      attack: 0.003,
      release: 0.25,
    }).connect(this.reverb);

    this.output = this.compressor;
  }

  trigger(drum: DrumType, velocity: number, time?: number) {
    const t = time ?? Tone.now();
    const vel = Math.max(0.1, Math.min(1, velocity));

    switch (drum) {
      case 'kick':
        this.triggerKick(vel, t);
        break;
      case 'snare':
        this.triggerSnare(vel, t);
        break;
      case 'hihat-closed':
        this.triggerHihat(vel, t, false);
        break;
      case 'hihat-open':
        this.triggerHihat(vel, t, true);
        break;
      case 'tom-high':
        this.triggerTom(vel, t, 'high');
        break;
      case 'tom-mid':
        this.triggerTom(vel, t, 'mid');
        break;
      case 'tom-low':
        this.triggerTom(vel, t, 'low');
        break;
      case 'crash':
        this.triggerCrash(vel, t);
        break;
      case 'ride':
        this.triggerRide(vel, t);
        break;
    }
  }

  private triggerKick(velocity: number, time: number) {
    // Layer 1: Sub bass (the thump)
    const sub = new Tone.Oscillator({
      type: 'sine',
      frequency: 55,
    }).connect(this.output);

    const subEnv = new Tone.AmplitudeEnvelope({
      attack: 0.005,
      decay: 0.15,
      sustain: 0,
      release: 0.1,
    }).connect(this.output);

    sub.connect(subEnv);
    sub.start(time);
    subEnv.triggerAttackRelease(0.2, time, velocity * 0.9);
    sub.stop(time + 0.3);

    // Layer 2: Click/beater transient
    const click = new Tone.Oscillator({
      type: 'triangle',
      frequency: 150,
    });

    const clickEnv = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: 0.02,
      sustain: 0,
      release: 0.01,
    }).connect(this.output);

    click.connect(clickEnv);
    click.start(time);
    clickEnv.triggerAttackRelease(0.03, time, velocity * 0.7);
    click.stop(time + 0.05);

    // Layer 3: Body (pitch sweep)
    const body = new Tone.Oscillator({
      type: 'sine',
      frequency: 80,
    });

    const bodyEnv = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: 0.25,
      sustain: 0,
      release: 0.15,
    }).connect(this.output);

    body.connect(bodyEnv);
    body.frequency.setValueAtTime(120, time);
    body.frequency.exponentialRampToValueAtTime(45, time + 0.08);
    body.start(time);
    bodyEnv.triggerAttackRelease(0.3, time, velocity * 0.8);
    body.stop(time + 0.4);

    // Cleanup
    setTimeout(() => {
      sub.dispose();
      subEnv.dispose();
      click.dispose();
      clickEnv.dispose();
      body.dispose();
      bodyEnv.dispose();
    }, 500);
  }

  private triggerSnare(velocity: number, time: number) {
    // Layer 1: Shell tone
    const shell = new Tone.Oscillator({
      type: 'triangle',
      frequency: 185,
    });

    const shellEnv = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: 0.08,
      sustain: 0.02,
      release: 0.1,
    }).connect(this.output);

    shell.connect(shellEnv);
    shell.frequency.setValueAtTime(220, time);
    shell.frequency.exponentialRampToValueAtTime(150, time + 0.03);
    shell.start(time);
    shellEnv.triggerAttackRelease(0.15, time, velocity * 0.5);
    shell.stop(time + 0.25);

    // Layer 2: Snare wires (filtered noise)
    const noise = new Tone.Noise('white');
    const noiseFilter = new Tone.Filter({
      type: 'bandpass',
      frequency: 3500,
      Q: 0.8,
    });

    const noiseEnv = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: 0.12,
      sustain: 0.02,
      release: 0.08,
    }).connect(this.output);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseEnv);
    noise.start(time);
    noiseEnv.triggerAttackRelease(0.18, time, velocity * 0.55);
    noise.stop(time + 0.25);

    // Layer 3: Body resonance
    const body = new Tone.Oscillator({
      type: 'sine',
      frequency: 130,
    });

    const bodyEnv = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: 0.1,
      sustain: 0,
      release: 0.05,
    }).connect(this.output);

    body.connect(bodyEnv);
    body.start(time);
    bodyEnv.triggerAttackRelease(0.12, time, velocity * 0.3);
    body.stop(time + 0.2);

    setTimeout(() => {
      shell.dispose();
      shellEnv.dispose();
      noise.dispose();
      noiseFilter.dispose();
      noiseEnv.dispose();
      body.dispose();
      bodyEnv.dispose();
    }, 400);
  }

  private triggerHihat(velocity: number, time: number, open: boolean) {
    const decay = open ? 0.4 : 0.04;
    const release = open ? 0.2 : 0.02;

    // Layer 1: High metallic component
    const metal1 = new Tone.Oscillator({
      type: 'square',
      frequency: 320,
    });

    const metal1Filter = new Tone.Filter({
      type: 'highpass',
      frequency: 8000,
    });

    const metal1Env = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: decay,
      sustain: open ? 0.1 : 0,
      release: release,
    }).connect(this.output);

    metal1.connect(metal1Filter);
    metal1Filter.connect(metal1Env);
    metal1.start(time);
    metal1Env.triggerAttackRelease(decay + 0.05, time, velocity * 0.15);
    metal1.stop(time + decay + release + 0.1);

    // Layer 2: Noise component
    const noise = new Tone.Noise('white');
    const noiseFilter = new Tone.Filter({
      type: 'highpass',
      frequency: 7000,
    });
    const noiseBand = new Tone.Filter({
      type: 'bandpass',
      frequency: 10000,
      Q: 1.5,
    });

    const noiseEnv = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: decay,
      sustain: open ? 0.08 : 0,
      release: release,
    }).connect(this.output);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseBand);
    noiseBand.connect(noiseEnv);
    noise.start(time);
    noiseEnv.triggerAttackRelease(decay + 0.05, time, velocity * 0.25);
    noise.stop(time + decay + release + 0.1);

    // Layer 3: Shimmer (ring mod effect)
    const shimmer = new Tone.Oscillator({
      type: 'sine',
      frequency: 6500,
    });

    const shimmerEnv = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: decay * 0.8,
      sustain: 0,
      release: release,
    }).connect(this.output);

    shimmer.connect(shimmerEnv);
    shimmer.start(time);
    shimmerEnv.triggerAttackRelease(decay, time, velocity * 0.08);
    shimmer.stop(time + decay + release + 0.1);

    const cleanupTime = (decay + release + 0.2) * 1000;
    setTimeout(() => {
      metal1.dispose();
      metal1Filter.dispose();
      metal1Env.dispose();
      noise.dispose();
      noiseFilter.dispose();
      noiseBand.dispose();
      noiseEnv.dispose();
      shimmer.dispose();
      shimmerEnv.dispose();
    }, cleanupTime);
  }

  private triggerTom(velocity: number, time: number, size: 'high' | 'mid' | 'low') {
    const pitchMap = { high: 180, mid: 130, low: 90 };
    const basePitch = pitchMap[size];
    const decayMap = { high: 0.3, mid: 0.4, low: 0.5 };
    const decay = decayMap[size];

    // Layer 1: Shell fundamental
    const shell = new Tone.Oscillator({
      type: 'sine',
      frequency: basePitch,
    });

    const shellEnv = new Tone.AmplitudeEnvelope({
      attack: 0.002,
      decay: decay,
      sustain: 0,
      release: decay * 0.5,
    }).connect(this.output);

    shell.connect(shellEnv);
    shell.frequency.setValueAtTime(basePitch * 1.4, time);
    shell.frequency.exponentialRampToValueAtTime(basePitch, time + 0.05);
    shell.start(time);
    shellEnv.triggerAttackRelease(decay + 0.1, time, velocity * 0.7);
    shell.stop(time + decay + 0.2);

    // Layer 2: Attack transient
    const attack = new Tone.Noise('pink');
    const attackFilter = new Tone.Filter({
      type: 'bandpass',
      frequency: basePitch * 4,
      Q: 0.5,
    });

    const attackEnv = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: 0.03,
      sustain: 0,
      release: 0.02,
    }).connect(this.output);

    attack.connect(attackFilter);
    attackFilter.connect(attackEnv);
    attack.start(time);
    attackEnv.triggerAttackRelease(0.04, time, velocity * 0.4);
    attack.stop(time + 0.06);

    // Layer 3: Overtone
    const overtone = new Tone.Oscillator({
      type: 'triangle',
      frequency: basePitch * 1.5,
    });

    const overtoneEnv = new Tone.AmplitudeEnvelope({
      attack: 0.002,
      decay: decay * 0.7,
      sustain: 0,
      release: decay * 0.3,
    }).connect(this.output);

    overtone.connect(overtoneEnv);
    overtone.start(time);
    overtoneEnv.triggerAttackRelease(decay, time, velocity * 0.25);
    overtone.stop(time + decay + 0.1);

    setTimeout(() => {
      shell.dispose();
      shellEnv.dispose();
      attack.dispose();
      attackFilter.dispose();
      attackEnv.dispose();
      overtone.dispose();
      overtoneEnv.dispose();
    }, (decay + 0.3) * 1000);
  }

  private triggerCrash(velocity: number, time: number) {
    const decay = 1.8;

    // Layer 1: Low wash
    const wash = new Tone.Noise('white');
    const washFilter = new Tone.Filter({
      type: 'bandpass',
      frequency: 4000,
      Q: 0.3,
    });

    const washEnv = new Tone.AmplitudeEnvelope({
      attack: 0.005,
      decay: decay,
      sustain: 0.05,
      release: 0.5,
    }).connect(this.output);

    wash.connect(washFilter);
    washFilter.connect(washEnv);
    wash.start(time);
    washEnv.triggerAttackRelease(decay, time, velocity * 0.35);
    wash.stop(time + decay + 0.6);

    // Layer 2: High shimmer
    const shimmer = new Tone.Noise('white');
    const shimmerFilter = new Tone.Filter({
      type: 'highpass',
      frequency: 8000,
    });

    const shimmerEnv = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: decay * 0.6,
      sustain: 0.02,
      release: 0.4,
    }).connect(this.output);

    shimmer.connect(shimmerFilter);
    shimmerFilter.connect(shimmerEnv);
    shimmer.start(time);
    shimmerEnv.triggerAttackRelease(decay * 0.7, time, velocity * 0.2);
    shimmer.stop(time + decay + 0.5);

    // Layer 3: Attack transient
    const attack = new Tone.Noise('white');
    const attackFilter = new Tone.Filter({
      type: 'bandpass',
      frequency: 6000,
      Q: 2,
    });

    const attackEnv = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: 0.05,
      sustain: 0,
      release: 0.02,
    }).connect(this.output);

    attack.connect(attackFilter);
    attackFilter.connect(attackEnv);
    attack.start(time);
    attackEnv.triggerAttackRelease(0.06, time, velocity * 0.5);
    attack.stop(time + 0.1);

    setTimeout(() => {
      wash.dispose();
      washFilter.dispose();
      washEnv.dispose();
      shimmer.dispose();
      shimmerFilter.dispose();
      shimmerEnv.dispose();
      attack.dispose();
      attackFilter.dispose();
      attackEnv.dispose();
    }, (decay + 1) * 1000);
  }

  private triggerRide(velocity: number, time: number) {
    const decay = 1.2;

    // Layer 1: Bell/ping
    const bell = new Tone.Oscillator({
      type: 'sine',
      frequency: 880,
    });

    const bellEnv = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: 0.08,
      sustain: 0.05,
      release: 0.3,
    }).connect(this.output);

    bell.connect(bellEnv);
    bell.start(time);
    bellEnv.triggerAttackRelease(0.4, time, velocity * 0.2);
    bell.stop(time + 0.5);

    // Layer 2: Wash
    const wash = new Tone.Noise('white');
    const washFilter = new Tone.Filter({
      type: 'bandpass',
      frequency: 5500,
      Q: 0.5,
    });

    const washEnv = new Tone.AmplitudeEnvelope({
      attack: 0.002,
      decay: decay,
      sustain: 0.02,
      release: 0.3,
    }).connect(this.output);

    wash.connect(washFilter);
    washFilter.connect(washEnv);
    wash.start(time);
    washEnv.triggerAttackRelease(decay, time, velocity * 0.18);
    wash.stop(time + decay + 0.4);

    // Layer 3: Stick attack
    const stick = new Tone.Noise('white');
    const stickFilter = new Tone.Filter({
      type: 'highpass',
      frequency: 10000,
    });

    const stickEnv = new Tone.AmplitudeEnvelope({
      attack: 0.001,
      decay: 0.015,
      sustain: 0,
      release: 0.01,
    }).connect(this.output);

    stick.connect(stickFilter);
    stickFilter.connect(stickEnv);
    stick.start(time);
    stickEnv.triggerAttackRelease(0.02, time, velocity * 0.35);
    stick.stop(time + 0.03);

    setTimeout(() => {
      bell.dispose();
      bellEnv.dispose();
      wash.dispose();
      washFilter.dispose();
      washEnv.dispose();
      stick.dispose();
      stickFilter.dispose();
      stickEnv.dispose();
    }, (decay + 0.5) * 1000);
  }

  dispose() {
    this.reverb.dispose();
    this.compressor.dispose();
  }
}
