import { DrumHit, TimeSignature } from '../../types';

// Rock patterns - straightforward, driving beats
export function generateRockPattern(
  bars: number,
  timeSignature: TimeSignature,
  complexity: number,
  dynamics: number
): DrumHit[] {
  const hits: DrumHit[] = [];
  const beatsPerBar = getBeatsPerBar(timeSignature);
  const baseVelocity = 0.5 + dynamics * 0.4;

  for (let bar = 0; bar < bars; bar++) {
    const barOffset = bar * beatsPerBar;
    const isFillBar = complexity > 0.6 && (bar + 1) % 4 === 0;

    // Kick drum pattern
    addKickPattern(hits, barOffset, beatsPerBar, complexity, baseVelocity);

    // Snare pattern
    addSnarePattern(hits, barOffset, beatsPerBar, complexity, baseVelocity, isFillBar);

    // Hi-hat pattern
    if (!isFillBar) {
      addHihatPattern(hits, barOffset, beatsPerBar, complexity, dynamics, baseVelocity);
    }

    // Crash on beat 1 of first bar and after fills
    if (bar === 0 || (bar > 0 && complexity > 0.5 && bar % 4 === 0)) {
      hits.push({
        drum: 'crash',
        time: barOffset,
        velocity: baseVelocity * 0.9,
        duration: 0.5,
      });
    }

    // Add fill on last beat of fill bars
    if (isFillBar) {
      addRockFill(hits, barOffset, beatsPerBar, complexity, baseVelocity);
    }

    // Ride instead of hi-hat in quieter sections
    if (dynamics < 0.3 && complexity > 0.4) {
      addRidePattern(hits, barOffset, beatsPerBar, baseVelocity * 0.7);
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

function addKickPattern(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number
) {
  // Basic kick on 1
  hits.push({
    drum: 'kick',
    time: barOffset,
    velocity: velocity,
    duration: 0.25,
  });

  if (beatsPerBar >= 4) {
    // Kick on 3 in 4/4
    hits.push({
      drum: 'kick',
      time: barOffset + 2,
      velocity: velocity * 0.95,
      duration: 0.25,
    });

    // Additional kicks for complexity
    if (complexity > 0.5) {
      // Syncopated kick on "and" of 2
      hits.push({
        drum: 'kick',
        time: barOffset + 1.5,
        velocity: velocity * 0.8,
        duration: 0.25,
      });
    }

    if (complexity > 0.7) {
      // Extra kick on "and" of 4
      hits.push({
        drum: 'kick',
        time: barOffset + 3.5,
        velocity: velocity * 0.75,
        duration: 0.25,
      });
    }
  }
}

function addSnarePattern(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number,
  isFillBar: boolean
) {
  if (beatsPerBar >= 4) {
    // Backbeat on 2 and 4
    hits.push({
      drum: 'snare',
      time: barOffset + 1,
      velocity: velocity,
      duration: 0.25,
    });

    if (!isFillBar) {
      hits.push({
        drum: 'snare',
        time: barOffset + 3,
        velocity: velocity,
        duration: 0.25,
      });
    }

    // Ghost notes for complexity
    if (complexity > 0.6) {
      hits.push({
        drum: 'snare',
        time: barOffset + 0.5,
        velocity: velocity * 0.3,
        duration: 0.125,
      });
      hits.push({
        drum: 'snare',
        time: barOffset + 2.5,
        velocity: velocity * 0.3,
        duration: 0.125,
      });
    }
  } else if (beatsPerBar === 3) {
    // 3/4 time - snare on 2
    hits.push({
      drum: 'snare',
      time: barOffset + 1,
      velocity: velocity,
      duration: 0.25,
    });
  }
}

function addHihatPattern(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  dynamics: number,
  velocity: number
) {
  const subdivision = complexity < 0.3 ? 1 : complexity < 0.6 ? 0.5 : 0.25;
  const steps = beatsPerBar / subdivision;

  for (let i = 0; i < steps; i++) {
    const time = barOffset + i * subdivision;
    const isOnBeat = time % 1 === 0;
    const isOffBeat = (time * 2) % 1 === 0 && !isOnBeat;

    // Open hi-hat on off-beats when loud
    const isOpen = dynamics > 0.7 && isOffBeat && Math.random() < 0.3;

    hits.push({
      drum: isOpen ? 'hihat-open' : 'hihat-closed',
      time: time,
      velocity: velocity * (isOnBeat ? 1 : 0.7),
      duration: isOpen ? 0.25 : 0.125,
    });
  }
}

function addRidePattern(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  velocity: number
) {
  for (let beat = 0; beat < beatsPerBar; beat++) {
    hits.push({
      drum: 'ride',
      time: barOffset + beat,
      velocity: velocity,
      duration: 0.5,
    });
  }
}

function addRockFill(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number
) {
  const fillStart = barOffset + beatsPerBar - 1;

  // 16th note fill on toms and snare
  const fillNotes: Array<{ drum: 'snare' | 'tom-high' | 'tom-mid' | 'tom-low'; offset: number }> = [
    { drum: 'snare', offset: 0 },
    { drum: 'tom-high', offset: 0.25 },
    { drum: 'tom-mid', offset: 0.5 },
    { drum: 'tom-low', offset: 0.75 },
  ];

  if (complexity > 0.8) {
    // Extended fill starting from beat 3
    hits.push({ drum: 'snare', time: fillStart - 1, velocity, duration: 0.25 });
    hits.push({ drum: 'snare', time: fillStart - 0.75, velocity: velocity * 0.9, duration: 0.25 });
    hits.push({ drum: 'tom-high', time: fillStart - 0.5, velocity, duration: 0.25 });
    hits.push({ drum: 'tom-high', time: fillStart - 0.25, velocity: velocity * 0.9, duration: 0.25 });
  }

  for (const note of fillNotes) {
    hits.push({
      drum: note.drum,
      time: fillStart + note.offset,
      velocity: velocity * (1 - note.offset * 0.1),
      duration: 0.25,
    });
  }
}
