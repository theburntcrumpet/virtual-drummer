import { Pattern, DrumType } from '../types';

/**
 * Render a pattern to a WAV file using offline audio context
 * Uses layered synthesis for more natural drum sounds
 */
export async function renderToWav(pattern: Pattern): Promise<Blob> {
  const secondsPerBeat = 60 / pattern.bpm;
  const durationSeconds = pattern.lengthInBeats * secondsPerBeat + 2;

  const offlineContext = new OfflineAudioContext(
    2,
    Math.ceil(durationSeconds * 44100),
    44100
  );

  // Master chain: compressor -> reverb -> output
  const masterGain = offlineContext.createGain();
  masterGain.gain.value = 0.7;

  const compressor = offlineContext.createDynamicsCompressor();
  compressor.threshold.value = -12;
  compressor.knee.value = 10;
  compressor.ratio.value = 4;
  compressor.attack.value = 0.003;
  compressor.release.value = 0.25;

  masterGain.connect(compressor);
  compressor.connect(offlineContext.destination);

  // Schedule all drum hits
  for (const hit of pattern.hits) {
    const timeInSeconds = hit.time * secondsPerBeat;
    renderDrumHit(offlineContext, masterGain, hit.drum, hit.velocity, timeInSeconds);
  }

  const audioBuffer = await offlineContext.startRendering();
  return audioBufferToWav(audioBuffer);
}

function renderDrumHit(
  ctx: OfflineAudioContext,
  dest: AudioNode,
  drum: DrumType,
  velocity: number,
  time: number
) {
  const vel = Math.max(0.1, Math.min(1, velocity));

  switch (drum) {
    case 'kick':
      renderKick(ctx, dest, vel, time);
      break;
    case 'snare':
      renderSnare(ctx, dest, vel, time);
      break;
    case 'hihat-closed':
      renderHihat(ctx, dest, vel, time, false);
      break;
    case 'hihat-open':
      renderHihat(ctx, dest, vel, time, true);
      break;
    case 'tom-high':
      renderTom(ctx, dest, vel, time, 180);
      break;
    case 'tom-mid':
      renderTom(ctx, dest, vel, time, 130);
      break;
    case 'tom-low':
      renderTom(ctx, dest, vel, time, 90);
      break;
    case 'crash':
      renderCymbal(ctx, dest, vel, time, 1.8);
      break;
    case 'ride':
      renderRide(ctx, dest, vel, time);
      break;
  }
}

function renderKick(ctx: OfflineAudioContext, dest: AudioNode, vel: number, time: number) {
  // Sub layer
  const sub = ctx.createOscillator();
  sub.type = 'sine';
  sub.frequency.setValueAtTime(55, time);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(vel * 0.9, time);
  subGain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
  sub.connect(subGain);
  subGain.connect(dest);
  sub.start(time);
  sub.stop(time + 0.3);

  // Body with pitch sweep
  const body = ctx.createOscillator();
  body.type = 'sine';
  body.frequency.setValueAtTime(120, time);
  body.frequency.exponentialRampToValueAtTime(45, time + 0.08);
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(vel * 0.8, time);
  bodyGain.gain.exponentialRampToValueAtTime(0.01, time + 0.25);
  body.connect(bodyGain);
  bodyGain.connect(dest);
  body.start(time);
  body.stop(time + 0.35);

  // Click transient
  const click = ctx.createOscillator();
  click.type = 'triangle';
  click.frequency.value = 150;
  const clickGain = ctx.createGain();
  clickGain.gain.setValueAtTime(vel * 0.6, time);
  clickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.02);
  click.connect(clickGain);
  clickGain.connect(dest);
  click.start(time);
  click.stop(time + 0.05);
}

function renderSnare(ctx: OfflineAudioContext, dest: AudioNode, vel: number, time: number) {
  // Shell tone
  const shell = ctx.createOscillator();
  shell.type = 'triangle';
  shell.frequency.setValueAtTime(220, time);
  shell.frequency.exponentialRampToValueAtTime(150, time + 0.03);
  const shellGain = ctx.createGain();
  shellGain.gain.setValueAtTime(vel * 0.5, time);
  shellGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  shell.connect(shellGain);
  shellGain.connect(dest);
  shell.start(time);
  shell.stop(time + 0.15);

  // Snare wires (noise)
  const noiseLength = ctx.sampleRate * 0.2;
  const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseLength; i++) {
    noiseData[i] = (Math.random() * 2 - 1) * 0.5;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = 3500;
  noiseFilter.Q.value = 0.8;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(vel * 0.55, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(dest);
  noise.start(time);

  // Body resonance
  const body = ctx.createOscillator();
  body.type = 'sine';
  body.frequency.value = 130;
  const bodyGain = ctx.createGain();
  bodyGain.gain.setValueAtTime(vel * 0.3, time);
  bodyGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
  body.connect(bodyGain);
  bodyGain.connect(dest);
  body.start(time);
  body.stop(time + 0.15);
}

function renderHihat(ctx: OfflineAudioContext, dest: AudioNode, vel: number, time: number, open: boolean) {
  const decay = open ? 0.4 : 0.04;

  // Metallic noise
  const noiseLength = ctx.sampleRate * (decay * 2);
  const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseLength; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 7000;

  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 10000;
  bandpass.Q.value = 1.5;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(vel * 0.25, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + decay);

  noise.connect(highpass);
  highpass.connect(bandpass);
  bandpass.connect(noiseGain);
  noiseGain.connect(dest);
  noise.start(time);

  // Shimmer
  const shimmer = ctx.createOscillator();
  shimmer.type = 'sine';
  shimmer.frequency.value = 6500;
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.setValueAtTime(vel * 0.08, time);
  shimmerGain.gain.exponentialRampToValueAtTime(0.01, time + decay * 0.8);
  shimmer.connect(shimmerGain);
  shimmerGain.connect(dest);
  shimmer.start(time);
  shimmer.stop(time + decay);
}

function renderTom(ctx: OfflineAudioContext, dest: AudioNode, vel: number, time: number, pitch: number) {
  const decay = pitch < 120 ? 0.5 : pitch < 160 ? 0.4 : 0.3;

  // Shell fundamental
  const shell = ctx.createOscillator();
  shell.type = 'sine';
  shell.frequency.setValueAtTime(pitch * 1.4, time);
  shell.frequency.exponentialRampToValueAtTime(pitch, time + 0.05);
  const shellGain = ctx.createGain();
  shellGain.gain.setValueAtTime(vel * 0.7, time);
  shellGain.gain.exponentialRampToValueAtTime(0.01, time + decay);
  shell.connect(shellGain);
  shellGain.connect(dest);
  shell.start(time);
  shell.stop(time + decay + 0.1);

  // Overtone
  const overtone = ctx.createOscillator();
  overtone.type = 'triangle';
  overtone.frequency.value = pitch * 1.5;
  const overtoneGain = ctx.createGain();
  overtoneGain.gain.setValueAtTime(vel * 0.25, time);
  overtoneGain.gain.exponentialRampToValueAtTime(0.01, time + decay * 0.7);
  overtone.connect(overtoneGain);
  overtoneGain.connect(dest);
  overtone.start(time);
  overtone.stop(time + decay);

  // Attack transient (noise)
  const noiseLength = ctx.sampleRate * 0.05;
  const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseLength; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = noiseBuffer;

  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value = pitch * 4;
  noiseFilter.Q.value = 0.5;

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(vel * 0.4, time);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(dest);
  noise.start(time);
}

function renderCymbal(ctx: OfflineAudioContext, dest: AudioNode, vel: number, time: number, decay: number) {
  const noiseLength = ctx.sampleRate * (decay * 2);
  const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseLength; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }

  // Low wash
  const wash = ctx.createBufferSource();
  wash.buffer = noiseBuffer;
  const washFilter = ctx.createBiquadFilter();
  washFilter.type = 'bandpass';
  washFilter.frequency.value = 4000;
  washFilter.Q.value = 0.3;
  const washGain = ctx.createGain();
  washGain.gain.setValueAtTime(vel * 0.35, time);
  washGain.gain.exponentialRampToValueAtTime(0.01, time + decay);
  wash.connect(washFilter);
  washFilter.connect(washGain);
  washGain.connect(dest);
  wash.start(time);

  // High shimmer
  const shimmer = ctx.createBufferSource();
  shimmer.buffer = noiseBuffer;
  const shimmerFilter = ctx.createBiquadFilter();
  shimmerFilter.type = 'highpass';
  shimmerFilter.frequency.value = 8000;
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.setValueAtTime(vel * 0.2, time);
  shimmerGain.gain.exponentialRampToValueAtTime(0.01, time + decay * 0.6);
  shimmer.connect(shimmerFilter);
  shimmerFilter.connect(shimmerGain);
  shimmerGain.connect(dest);
  shimmer.start(time);

  // Attack transient
  const attack = ctx.createBufferSource();
  attack.buffer = noiseBuffer;
  const attackFilter = ctx.createBiquadFilter();
  attackFilter.type = 'bandpass';
  attackFilter.frequency.value = 6000;
  attackFilter.Q.value = 2;
  const attackGain = ctx.createGain();
  attackGain.gain.setValueAtTime(vel * 0.5, time);
  attackGain.gain.exponentialRampToValueAtTime(0.01, time + 0.05);
  attack.connect(attackFilter);
  attackFilter.connect(attackGain);
  attackGain.connect(dest);
  attack.start(time);
}

function renderRide(ctx: OfflineAudioContext, dest: AudioNode, vel: number, time: number) {
  const decay = 1.2;

  // Bell/ping
  const bell = ctx.createOscillator();
  bell.type = 'sine';
  bell.frequency.value = 880;
  const bellGain = ctx.createGain();
  bellGain.gain.setValueAtTime(vel * 0.2, time);
  bellGain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
  bell.connect(bellGain);
  bellGain.connect(dest);
  bell.start(time);
  bell.stop(time + 0.5);

  // Wash
  const noiseLength = ctx.sampleRate * (decay * 2);
  const noiseBuffer = ctx.createBuffer(1, noiseLength, ctx.sampleRate);
  const noiseData = noiseBuffer.getChannelData(0);
  for (let i = 0; i < noiseLength; i++) {
    noiseData[i] = Math.random() * 2 - 1;
  }
  const wash = ctx.createBufferSource();
  wash.buffer = noiseBuffer;
  const washFilter = ctx.createBiquadFilter();
  washFilter.type = 'bandpass';
  washFilter.frequency.value = 5500;
  washFilter.Q.value = 0.5;
  const washGain = ctx.createGain();
  washGain.gain.setValueAtTime(vel * 0.18, time);
  washGain.gain.exponentialRampToValueAtTime(0.01, time + decay);
  wash.connect(washFilter);
  washFilter.connect(washGain);
  washGain.connect(dest);
  wash.start(time);

  // Stick attack
  const stick = ctx.createBufferSource();
  stick.buffer = noiseBuffer;
  const stickFilter = ctx.createBiquadFilter();
  stickFilter.type = 'highpass';
  stickFilter.frequency.value = 10000;
  const stickGain = ctx.createGain();
  stickGain.gain.setValueAtTime(vel * 0.35, time);
  stickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.015);
  stick.connect(stickFilter);
  stickFilter.connect(stickGain);
  stickGain.connect(dest);
  stick.start(time);
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1;
  const bitDepth = 16;

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const dataLength = buffer.length * blockAlign;
  const headerLength = 44;
  const totalLength = headerLength + dataLength;

  const arrayBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(arrayBuffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalLength - 8, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  let offset = 44;
  for (let i = 0; i < buffer.length; i++) {
    for (let channel = 0; channel < numChannels; channel++) {
      const sample = Math.max(-1, Math.min(1, channels[channel][i]));
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export function downloadWav(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.wav`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
