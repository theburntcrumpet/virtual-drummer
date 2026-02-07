export type DrumType =
  | 'kick'
  | 'snare'
  | 'hihat-closed'
  | 'hihat-open'
  | 'tom-high'
  | 'tom-mid'
  | 'tom-low'
  | 'crash'
  | 'ride';

export type KitStyle = 'rock' | 'jazz' | 'electronic' | 'latin' | 'lofi';

export type TimeSignature = '4/4' | '3/4' | '6/8' | '5/4' | '7/8';

export interface DrumHit {
  drum: DrumType;
  time: number;      // Position in beats (0-based)
  velocity: number;  // 0-1
  duration: number;  // In beats
}

export interface Pattern {
  hits: DrumHit[];
  lengthInBeats: number;
  timeSignature: TimeSignature;
  bpm: number;
}

export interface GeneratorSettings {
  kitStyle: KitStyle;
  timeSignature: TimeSignature;
  bpm: number;
  bars: number;
  complexity: number;  // 0-1
  dynamics: number;    // 0-1 (quiet to loud)
}

// General MIDI drum note mappings
export const MIDI_DRUM_MAP: Record<DrumType, number> = {
  'kick': 36,
  'snare': 38,
  'hihat-closed': 42,
  'hihat-open': 46,
  'tom-high': 50,
  'tom-mid': 47,
  'tom-low': 45,
  'crash': 49,
  'ride': 51,
};

export const DRUM_NAMES: Record<DrumType, string> = {
  'kick': 'Kick',
  'snare': 'Snare',
  'hihat-closed': 'Hi-Hat (Closed)',
  'hihat-open': 'Hi-Hat (Open)',
  'tom-high': 'High Tom',
  'tom-mid': 'Mid Tom',
  'tom-low': 'Low Tom',
  'crash': 'Crash',
  'ride': 'Ride',
};
