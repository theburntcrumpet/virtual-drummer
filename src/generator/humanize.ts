import { DrumHit } from '../types';

export interface HumanizeOptions {
  timingVariation: number;  // 0-1, amount of timing randomness
  velocityVariation: number; // 0-1, amount of velocity randomness
  enabled: boolean;
}

const DEFAULT_OPTIONS: HumanizeOptions = {
  timingVariation: 0.5,
  velocityVariation: 0.5,
  enabled: true,
};

/**
 * Add human-like variations to a drum pattern
 */
export function humanizePattern(
  hits: DrumHit[],
  options: Partial<HumanizeOptions> = {}
): DrumHit[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  if (!opts.enabled) {
    return hits;
  }

  return hits.map(hit => humanizeHit(hit, opts));
}

function humanizeHit(hit: DrumHit, options: HumanizeOptions): DrumHit {
  // Timing variation: ±15ms at max (converted to beats at 120bpm as reference)
  // 15ms at 120bpm = 0.03 beats
  const maxTimingOffset = 0.03 * options.timingVariation;
  const timingOffset = (Math.random() - 0.5) * 2 * maxTimingOffset;

  // Velocity variation: ±15% at max
  const maxVelocityOffset = 0.15 * options.velocityVariation;
  const velocityOffset = (Math.random() - 0.5) * 2 * maxVelocityOffset;

  // Don't let timing go negative
  const newTime = Math.max(0, hit.time + timingOffset);

  // Keep velocity in valid range
  const newVelocity = Math.max(0.1, Math.min(1, hit.velocity + velocityOffset));

  return {
    ...hit,
    time: newTime,
    velocity: newVelocity,
  };
}

/**
 * Add swing feel to a pattern
 */
export function swingPattern(
  hits: DrumHit[],
  swingAmount: number = 0.5 // 0 = straight, 1 = full triplet swing
): DrumHit[] {
  return hits.map(hit => {
    // Swing affects notes on the "and" (offbeat 8th notes)
    const beatPosition = hit.time % 1;

    // If it's on the offbeat (0.5)
    if (Math.abs(beatPosition - 0.5) < 0.1) {
      // Push it towards triplet position (0.67)
      const swingOffset = 0.17 * swingAmount; // 0.67 - 0.5 = 0.17
      return {
        ...hit,
        time: hit.time + swingOffset,
      };
    }

    return hit;
  });
}

/**
 * Quantize hits to a grid (useful after humanization if needed)
 */
export function quantizePattern(
  hits: DrumHit[],
  gridSize: number = 0.25 // 16th notes by default
): DrumHit[] {
  return hits.map(hit => ({
    ...hit,
    time: Math.round(hit.time / gridSize) * gridSize,
  }));
}
