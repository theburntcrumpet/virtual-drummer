import { Pattern, GeneratorSettings, DrumHit, TimeSignature } from '../types';
import { generateRockPattern } from './templates/rock';
import { generateJazzPattern } from './templates/jazz';
import { generateElectronicPattern } from './templates/electronic';
import { generateLatinPattern } from './templates/latin';
import { generateLofiPattern } from './templates/lofi';
import { humanizePattern, swingPattern } from './humanize';

export function generatePattern(settings: GeneratorSettings): Pattern {
  const beatsPerBar = getBeatsPerBar(settings.timeSignature);
  const lengthInBeats = settings.bars * beatsPerBar;

  // Generate base pattern from template
  let hits = generateBasePattern(settings);

  // Apply swing for jazz and lofi
  if (settings.kitStyle === 'jazz') {
    hits = swingPattern(hits, 0.6);
  } else if (settings.kitStyle === 'lofi') {
    hits = swingPattern(hits, 0.5); // Moderate swing for lofi
  }

  // Humanize the pattern
  hits = humanizePattern(hits, {
    timingVariation: 0.4,
    velocityVariation: 0.3,
    enabled: true,
  });

  // Sort hits by time
  hits.sort((a, b) => a.time - b.time);

  // Remove duplicate hits (same drum at same time)
  hits = deduplicateHits(hits);

  return {
    hits,
    lengthInBeats,
    timeSignature: settings.timeSignature,
    bpm: settings.bpm,
  };
}

function generateBasePattern(settings: GeneratorSettings): DrumHit[] {
  const { kitStyle, bars, timeSignature, complexity, dynamics } = settings;

  switch (kitStyle) {
    case 'rock':
      return generateRockPattern(bars, timeSignature, complexity, dynamics);
    case 'jazz':
      return generateJazzPattern(bars, timeSignature, complexity, dynamics);
    case 'electronic':
      return generateElectronicPattern(bars, timeSignature, complexity, dynamics);
    case 'latin':
      return generateLatinPattern(bars, timeSignature, complexity, dynamics);
    case 'lofi':
      return generateLofiPattern(bars, timeSignature, complexity, dynamics);
    default:
      return generateRockPattern(bars, timeSignature, complexity, dynamics);
  }
}

function getBeatsPerBar(timeSignature: TimeSignature): number {
  switch (timeSignature) {
    case '3/4': return 3;
    case '4/4': return 4;
    case '5/4': return 5;
    case '6/8': return 6;
    case '7/8': return 3.5;
    default: return 4;
  }
}

function deduplicateHits(hits: DrumHit[]): DrumHit[] {
  const seen = new Map<string, DrumHit>();

  for (const hit of hits) {
    // Round time to avoid floating point comparison issues
    const timeKey = Math.round(hit.time * 1000);
    const key = `${hit.drum}-${timeKey}`;

    // Keep the hit with higher velocity if duplicate
    const existing = seen.get(key);
    if (!existing || hit.velocity > existing.velocity) {
      seen.set(key, hit);
    }
  }

  return Array.from(seen.values()).sort((a, b) => a.time - b.time);
}

// Utility function to get pattern info
export function getPatternInfo(pattern: Pattern) {
  const durationSeconds = (pattern.lengthInBeats / pattern.bpm) * 60;

  const hitCounts: Record<string, number> = {};
  for (const hit of pattern.hits) {
    hitCounts[hit.drum] = (hitCounts[hit.drum] || 0) + 1;
  }

  return {
    durationSeconds,
    totalHits: pattern.hits.length,
    hitCounts,
    bars: pattern.lengthInBeats / getBeatsPerBar(pattern.timeSignature),
  };
}
