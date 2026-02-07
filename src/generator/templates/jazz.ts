import { DrumHit, TimeSignature } from '../../types';

// Jazz patterns - swing feel, ride-based, brush work
export function generateJazzPattern(
  bars: number,
  timeSignature: TimeSignature,
  complexity: number,
  dynamics: number
): DrumHit[] {
  const hits: DrumHit[] = [];
  const beatsPerBar = getBeatsPerBar(timeSignature);
  const baseVelocity = 0.4 + dynamics * 0.4; // Jazz is generally quieter

  for (let bar = 0; bar < bars; bar++) {
    const barOffset = bar * beatsPerBar;
    const isFourBarPhrase = (bar + 1) % 4 === 0;

    // Ride cymbal - the backbone of jazz
    addSwingRidePattern(hits, barOffset, beatsPerBar, complexity, baseVelocity);

    // Hi-hat on 2 and 4 with foot
    addJazzHihatPattern(hits, barOffset, beatsPerBar, baseVelocity);

    // Sparse kick - "feathering"
    addFeatheredKick(hits, barOffset, beatsPerBar, complexity, dynamics, baseVelocity);

    // Snare comping
    addJazzSnareComping(hits, barOffset, beatsPerBar, complexity, baseVelocity);

    // Add fills/accents at phrase endings
    if (isFourBarPhrase && complexity > 0.5) {
      addJazzFill(hits, barOffset, beatsPerBar, complexity, baseVelocity);
    }
  }

  return hits;
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

function addSwingRidePattern(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number
) {
  // Classic jazz ride pattern with swing triplet feel
  for (let beat = 0; beat < beatsPerBar; beat++) {
    // Main beat
    hits.push({
      drum: 'ride',
      time: barOffset + beat,
      velocity: velocity,
      duration: 0.3,
    });

    // Swing note (triplet feel - 2/3 of the way through the beat)
    if (complexity > 0.2 || beat % 2 === 0) {
      hits.push({
        drum: 'ride',
        time: barOffset + beat + 0.67,
        velocity: velocity * 0.75,
        duration: 0.2,
      });
    }

    // Bell accent on beat 1 occasionally
    if (beat === 0 && Math.random() < complexity * 0.3) {
      hits.push({
        drum: 'ride',
        time: barOffset + beat,
        velocity: velocity * 1.1,
        duration: 0.3,
      });
    }
  }
}

function addJazzHihatPattern(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  velocity: number
) {
  // Hi-hat with foot on 2 and 4
  if (beatsPerBar >= 4) {
    hits.push({
      drum: 'hihat-closed',
      time: barOffset + 1,
      velocity: velocity * 0.6,
      duration: 0.1,
    });
    hits.push({
      drum: 'hihat-closed',
      time: barOffset + 3,
      velocity: velocity * 0.6,
      duration: 0.1,
    });
  } else if (beatsPerBar === 3) {
    hits.push({
      drum: 'hihat-closed',
      time: barOffset + 1,
      velocity: velocity * 0.6,
      duration: 0.1,
    });
  }
}

function addFeatheredKick(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  dynamics: number,
  velocity: number
) {
  // Feathered kick - very light, on all 4 beats
  const featherVelocity = velocity * 0.3;

  for (let beat = 0; beat < beatsPerBar; beat++) {
    // Basic feathering
    if (dynamics > 0.3) {
      hits.push({
        drum: 'kick',
        time: barOffset + beat,
        velocity: featherVelocity,
        duration: 0.2,
      });
    }
  }

  // Accent kicks for higher complexity
  if (complexity > 0.5) {
    // Random accent on beat 1 or 3
    const accentBeat = Math.random() < 0.5 ? 0 : 2;
    if (accentBeat < beatsPerBar) {
      hits.push({
        drum: 'kick',
        time: barOffset + accentBeat,
        velocity: velocity * 0.6,
        duration: 0.25,
      });
    }
  }
}

function addJazzSnareComping(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number
) {
  // Jazz snare comping - irregular, conversational
  if (complexity < 0.3) return; // Very simple = no comping

  // Random comping hits
  const compingPositions = [
    { beat: 0.67, prob: 0.2 },   // Swing upbeat of 1
    { beat: 1.67, prob: 0.3 },   // Swing upbeat of 2
    { beat: 2, prob: 0.15 },     // Beat 3
    { beat: 2.67, prob: 0.25 },  // Swing upbeat of 3
    { beat: 3.5, prob: 0.2 },    // Anticipation of next bar
  ];

  for (const pos of compingPositions) {
    if (pos.beat < beatsPerBar && Math.random() < pos.prob * complexity) {
      hits.push({
        drum: 'snare',
        time: barOffset + pos.beat,
        velocity: velocity * (0.4 + Math.random() * 0.3),
        duration: 0.15,
      });
    }
  }
}

function addJazzFill(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number
) {
  // Jazz fills are typically subtle
  const fillStart = barOffset + beatsPerBar - 1;

  // Snare press roll or tom phrase
  if (complexity > 0.7) {
    // Triplet fill
    hits.push({ drum: 'snare', time: fillStart, velocity: velocity * 0.7, duration: 0.15 });
    hits.push({ drum: 'snare', time: fillStart + 0.33, velocity: velocity * 0.8, duration: 0.15 });
    hits.push({ drum: 'snare', time: fillStart + 0.67, velocity: velocity * 0.9, duration: 0.15 });
  } else {
    // Simple accent
    hits.push({ drum: 'snare', time: fillStart + 0.5, velocity: velocity * 0.8, duration: 0.2 });
  }

  // Crash on next beat 1 (handled by main loop typically)
  hits.push({
    drum: 'crash',
    time: barOffset + beatsPerBar,
    velocity: velocity * 0.7,
    duration: 0.5,
  });
}
