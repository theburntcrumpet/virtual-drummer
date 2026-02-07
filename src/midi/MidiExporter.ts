import { Midi } from '@tonejs/midi';
import { Pattern, MIDI_DRUM_MAP } from '../types';

export function exportToMidi(pattern: Pattern): Blob {
  const midi = new Midi();

  // Set tempo
  midi.header.setTempo(pattern.bpm);

  // Set time signature
  const [numerator, denominator] = parseTimeSignature(pattern.timeSignature);
  midi.header.timeSignatures.push({
    ticks: 0,
    timeSignature: [numerator, denominator],
    measures: 0,
  });

  // Create a drum track (channel 10 in MIDI, but 9 in 0-indexed)
  const track = midi.addTrack();
  track.name = 'Virtual Drummer';
  track.channel = 9; // Drum channel

  // Convert beats to seconds for MIDI timing
  const secondsPerBeat = 60 / pattern.bpm;

  // Add all drum hits as notes
  for (const hit of pattern.hits) {
    const midiNote = MIDI_DRUM_MAP[hit.drum];
    const timeInSeconds = hit.time * secondsPerBeat;
    const durationInSeconds = hit.duration * secondsPerBeat;
    const velocity = Math.round(hit.velocity * 127);

    track.addNote({
      midi: midiNote,
      time: timeInSeconds,
      duration: durationInSeconds,
      velocity: velocity / 127, // @tonejs/midi uses 0-1 for velocity
    });
  }

  // Convert to array buffer and create blob
  const arrayBuffer = midi.toArray();
  return new Blob([arrayBuffer], { type: 'audio/midi' });
}

export function downloadMidi(pattern: Pattern, filename: string = 'drum-pattern') {
  const blob = exportToMidi(pattern);
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.mid`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

function parseTimeSignature(ts: string): [number, number] {
  switch (ts) {
    case '3/4': return [3, 4];
    case '4/4': return [4, 4];
    case '5/4': return [5, 4];
    case '6/8': return [6, 8];
    case '7/8': return [7, 8];
    default: return [4, 4];
  }
}

// Generate a descriptive filename
export function generateFilename(pattern: Pattern, kitStyle: string): string {
  const bpm = pattern.bpm;
  const ts = pattern.timeSignature.replace('/', '-');
  const bars = Math.round(pattern.lengthInBeats / getBeatsPerBar(pattern.timeSignature));

  return `${kitStyle}-${bpm}bpm-${ts}-${bars}bars`;
}

function getBeatsPerBar(timeSignature: string): number {
  switch (timeSignature) {
    case '3/4': return 3;
    case '4/4': return 4;
    case '5/4': return 5;
    case '6/8': return 6;
    case '7/8': return 3.5;
    default: return 4;
  }
}
