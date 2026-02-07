import { DrumHit, TimeSignature } from '../../types';

// Electronic patterns - four-on-the-floor, syncopated, programmed feel
export function generateElectronicPattern(
  bars: number,
  timeSignature: TimeSignature,
  complexity: number,
  dynamics: number
): DrumHit[] {
  const hits: DrumHit[] = [];
  const beatsPerBar = getBeatsPerBar(timeSignature);
  const baseVelocity = 0.6 + dynamics * 0.35;

  for (let bar = 0; bar < bars; bar++) {
    const barOffset = bar * beatsPerBar;
    const isBreakdownBar = complexity > 0.6 && (bar + 1) % 8 === 0;

    // Four-on-the-floor kick
    addFourOnFloorKick(hits, barOffset, beatsPerBar, complexity, baseVelocity, isBreakdownBar);

    // Clap/snare on 2 and 4
    addElectronicSnare(hits, barOffset, beatsPerBar, complexity, baseVelocity, isBreakdownBar);

    // Hi-hats - open and closed patterns
    addElectronicHihats(hits, barOffset, beatsPerBar, complexity, dynamics, baseVelocity);

    // Percussion/ride for texture
    if (complexity > 0.5) {
      addElectronicPercussion(hits, barOffset, beatsPerBar, complexity, baseVelocity);
    }

    // Build-up/breakdown fills
    if (isBreakdownBar) {
      addElectronicFill(hits, barOffset, beatsPerBar, baseVelocity);
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

function addFourOnFloorKick(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number,
  isBreakdown: boolean
) {
  if (isBreakdown) return; // No kick during breakdown

  // Kick on every beat
  for (let beat = 0; beat < beatsPerBar; beat++) {
    hits.push({
      drum: 'kick',
      time: barOffset + beat,
      velocity: velocity,
      duration: 0.2,
    });
  }

  // Extra offbeat kicks for complexity
  if (complexity > 0.6) {
    // Add syncopated kicks
    hits.push({
      drum: 'kick',
      time: barOffset + 0.75,
      velocity: velocity * 0.85,
      duration: 0.15,
    });
  }

  if (complexity > 0.8) {
    hits.push({
      drum: 'kick',
      time: barOffset + 2.5,
      velocity: velocity * 0.8,
      duration: 0.15,
    });
    hits.push({
      drum: 'kick',
      time: barOffset + 3.75,
      velocity: velocity * 0.85,
      duration: 0.15,
    });
  }
}

function addElectronicSnare(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number,
  isBreakdown: boolean
) {
  if (isBreakdown) return;

  if (beatsPerBar >= 4) {
    // Clap/snare on 2 and 4
    hits.push({
      drum: 'snare',
      time: barOffset + 1,
      velocity: velocity,
      duration: 0.2,
    });
    hits.push({
      drum: 'snare',
      time: barOffset + 3,
      velocity: velocity,
      duration: 0.2,
    });

    // Offbeat snares for complexity
    if (complexity > 0.7) {
      hits.push({
        drum: 'snare',
        time: barOffset + 1.5,
        velocity: velocity * 0.5,
        duration: 0.1,
      });
    }
  }
}

function addElectronicHihats(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  dynamics: number,
  velocity: number
) {
  // 16th note hi-hats with accents and opens
  const subdivision = 0.25;
  const steps = beatsPerBar / subdivision;

  for (let i = 0; i < steps; i++) {
    const time = barOffset + i * subdivision;
    const isOnBeat = i % 4 === 0;
    const isOffBeat = i % 2 === 1;
    const isEighthOffbeat = i % 4 === 2;

    // Open hi-hat pattern
    const isOpen = dynamics > 0.5 && isEighthOffbeat && Math.random() < 0.4;

    // Skip some notes at low complexity
    if (complexity < 0.5 && !isOnBeat && !isEighthOffbeat) {
      continue;
    }

    if (complexity < 0.3 && !isOnBeat) {
      continue;
    }

    // Velocity variation for groove
    let hitVelocity = velocity * 0.7;
    if (isOnBeat) hitVelocity = velocity * 0.9;
    else if (isEighthOffbeat) hitVelocity = velocity * 0.8;
    else if (isOffBeat) hitVelocity = velocity * 0.5;

    hits.push({
      drum: isOpen ? 'hihat-open' : 'hihat-closed',
      time: time,
      velocity: hitVelocity,
      duration: isOpen ? 0.2 : 0.1,
    });
  }
}

function addElectronicPercussion(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number
) {
  // Ride/percussion on offbeats for texture
  const positions = [0.5, 1.5, 2.5, 3.5];

  for (const pos of positions) {
    if (pos < beatsPerBar && Math.random() < complexity * 0.4) {
      hits.push({
        drum: 'ride',
        time: barOffset + pos,
        velocity: velocity * 0.5,
        duration: 0.15,
      });
    }
  }
}

function addElectronicFill(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  velocity: number
) {
  // Snare roll/build
  const fillStart = barOffset + beatsPerBar - 2;

  // 32nd note snare roll building in velocity
  for (let i = 0; i < 16; i++) {
    const time = fillStart + i * 0.125;
    const buildVelocity = velocity * (0.3 + (i / 16) * 0.7);

    hits.push({
      drum: 'snare',
      time: time,
      velocity: buildVelocity,
      duration: 0.1,
    });
  }

  // Crash on the 1
  hits.push({
    drum: 'crash',
    time: barOffset + beatsPerBar,
    velocity: velocity,
    duration: 0.5,
  });
}
