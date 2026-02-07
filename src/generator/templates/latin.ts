import { DrumHit, TimeSignature } from '../../types';

// Latin patterns - clave-based, syncopated, tom-heavy
export function generateLatinPattern(
  bars: number,
  timeSignature: TimeSignature,
  complexity: number,
  dynamics: number
): DrumHit[] {
  const hits: DrumHit[] = [];
  const beatsPerBar = getBeatsPerBar(timeSignature);
  const baseVelocity = 0.55 + dynamics * 0.35;

  for (let bar = 0; bar < bars; bar++) {
    const barOffset = bar * beatsPerBar;
    const claveBar = bar % 2; // Alternates between 3-side and 2-side

    // Kick pattern (tumbao-inspired)
    addLatinKick(hits, barOffset, beatsPerBar, claveBar, complexity, baseVelocity);

    // Cross-stick/snare pattern
    addLatinSnare(hits, barOffset, beatsPerBar, claveBar, complexity, baseVelocity);

    // Hi-hat/ride pattern
    addLatinCymbal(hits, barOffset, beatsPerBar, complexity, dynamics, baseVelocity);

    // Toms (cascara-inspired pattern)
    if (complexity > 0.4) {
      addCascaraPattern(hits, barOffset, beatsPerBar, claveBar, complexity, baseVelocity);
    }

    // Cowbell/ride bell accents
    if (complexity > 0.3) {
      addBellPattern(hits, barOffset, beatsPerBar, complexity, baseVelocity);
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

function addLatinKick(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  claveBar: number,
  complexity: number,
  velocity: number
) {
  if (beatsPerBar >= 4) {
    // Tumbao pattern - syncopated bass drum
    if (claveBar === 0) {
      // 3-side of clave
      hits.push({ drum: 'kick', time: barOffset + 0, velocity, duration: 0.2 });
      hits.push({ drum: 'kick', time: barOffset + 2.5, velocity: velocity * 0.9, duration: 0.2 });

      if (complexity > 0.5) {
        hits.push({ drum: 'kick', time: barOffset + 3.5, velocity: velocity * 0.85, duration: 0.2 });
      }
    } else {
      // 2-side of clave
      hits.push({ drum: 'kick', time: barOffset + 0.5, velocity: velocity * 0.9, duration: 0.2 });
      hits.push({ drum: 'kick', time: barOffset + 2, velocity, duration: 0.2 });

      if (complexity > 0.5) {
        hits.push({ drum: 'kick', time: barOffset + 3, velocity: velocity * 0.85, duration: 0.2 });
      }
    }
  } else if (beatsPerBar === 3) {
    // Simplified for 3/4
    hits.push({ drum: 'kick', time: barOffset, velocity, duration: 0.2 });
    hits.push({ drum: 'kick', time: barOffset + 1.5, velocity: velocity * 0.85, duration: 0.2 });
  }
}

function addLatinSnare(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  claveBar: number,
  complexity: number,
  velocity: number
) {
  // Cross-stick pattern
  const crossVelocity = velocity * 0.7;

  if (beatsPerBar >= 4) {
    if (claveBar === 0) {
      // Matches clave 3-side
      hits.push({ drum: 'snare', time: barOffset + 1, velocity: crossVelocity, duration: 0.15 });
      hits.push({ drum: 'snare', time: barOffset + 2, velocity: crossVelocity * 0.9, duration: 0.15 });
      hits.push({ drum: 'snare', time: barOffset + 3, velocity: crossVelocity, duration: 0.15 });
    } else {
      // Matches clave 2-side
      hits.push({ drum: 'snare', time: barOffset + 1, velocity: crossVelocity, duration: 0.15 });
      hits.push({ drum: 'snare', time: barOffset + 3, velocity: crossVelocity, duration: 0.15 });
    }

    // Ghost notes for complexity
    if (complexity > 0.6) {
      hits.push({ drum: 'snare', time: barOffset + 0.5, velocity: velocity * 0.3, duration: 0.1 });
      hits.push({ drum: 'snare', time: barOffset + 2.5, velocity: velocity * 0.3, duration: 0.1 });
    }
  }
}

function addLatinCymbal(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  _complexity: number,
  dynamics: number,
  velocity: number
) {
  // Steady 8th notes on ride or hi-hat
  const useRide = dynamics > 0.5;
  const drum = useRide ? 'ride' : 'hihat-closed';

  for (let i = 0; i < beatsPerBar * 2; i++) {
    const time = barOffset + i * 0.5;
    const isOnBeat = i % 2 === 0;

    hits.push({
      drum: drum,
      time: time,
      velocity: velocity * (isOnBeat ? 0.8 : 0.6),
      duration: 0.2,
    });
  }

  // Add open hi-hats for dynamics
  if (dynamics > 0.6 && !useRide) {
    hits.push({
      drum: 'hihat-open',
      time: barOffset + 1.5,
      velocity: velocity * 0.7,
      duration: 0.25,
    });
    hits.push({
      drum: 'hihat-open',
      time: barOffset + 3.5,
      velocity: velocity * 0.7,
      duration: 0.25,
    });
  }
}

function addCascaraPattern(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  claveBar: number,
  _complexity: number,
  velocity: number
) {
  // Cascara on toms/side of floor tom
  const tomVelocity = velocity * 0.6;

  if (beatsPerBar >= 4) {
    // Classic cascara pattern
    const pattern = claveBar === 0
      ? [0, 0.5, 1, 1.5, 2.5, 3, 3.5]  // 3-side
      : [0, 0.5, 1.5, 2, 2.5, 3.5];      // 2-side

    for (const pos of pattern) {
      const useTomHigh = pos % 1 === 0;
      hits.push({
        drum: useTomHigh ? 'tom-high' : 'tom-mid',
        time: barOffset + pos,
        velocity: tomVelocity,
        duration: 0.15,
      });
    }
  }
}

function addBellPattern(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number
) {
  // Bell accents (using crash at low velocity as substitute for cowbell)
  const bellPositions = [0, 1.5, 2, 3.5];
  const bellVelocity = velocity * 0.5;

  for (const pos of bellPositions) {
    if (pos < beatsPerBar && Math.random() < 0.5 + complexity * 0.3) {
      hits.push({
        drum: 'crash',
        time: barOffset + pos,
        velocity: bellVelocity,
        duration: 0.2,
      });
    }
  }
}
