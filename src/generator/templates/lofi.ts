import { DrumHit, TimeSignature } from '../../types';

// Lo-fi hip hop patterns - jazz-influenced, sparse, dreamy
export function generateLofiPattern(
  bars: number,
  timeSignature: TimeSignature,
  complexity: number,
  dynamics: number
): DrumHit[] {
  const hits: DrumHit[] = [];
  const beatsPerBar = getBeatsPerBar(timeSignature);
  const baseVelocity = 0.45 + dynamics * 0.3; // Lofi is soft and chill

  for (let bar = 0; bar < bars; bar++) {
    const barOffset = bar * beatsPerBar;

    // Ride cymbal - jazz-style time keeping
    addLofiRide(hits, barOffset, beatsPerBar, complexity, baseVelocity);

    // Sparse, feathered kick
    addLofiKick(hits, barOffset, beatsPerBar, complexity, baseVelocity);

    // Snare with lots of ghost notes
    addLofiSnare(hits, barOffset, beatsPerBar, complexity, baseVelocity);

    // Sparse hi-hat accents (not the main time keeper)
    addLofiHihat(hits, barOffset, beatsPerBar, complexity, baseVelocity);
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

function addLofiRide(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number
) {
  // Jazz-style ride pattern with swing - the heart of lofi
  const rideVel = velocity * 0.6;

  for (let beat = 0; beat < beatsPerBar; beat++) {
    // Main beat - soft ride hit
    hits.push({
      drum: 'ride',
      time: barOffset + beat,
      velocity: rideVel * (0.85 + Math.random() * 0.15),
      duration: 0.3,
    });

    // Swung upbeat (triplet feel) - not on every beat for variety
    if (complexity > 0.2 || beat % 2 === 0) {
      if (Math.random() < 0.85) { // Some randomness
        hits.push({
          drum: 'ride',
          time: barOffset + beat + 0.67, // Triplet swing position
          velocity: rideVel * 0.65,
          duration: 0.2,
        });
      }
    }
  }
}

function addLofiKick(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number
) {
  // Sparse, feathered kick like jazz - soft and supportive
  const kickVel = velocity * 0.7;

  if (beatsPerBar >= 4) {
    // Beat 1 - usually present but soft
    hits.push({
      drum: 'kick',
      time: barOffset,
      velocity: kickVel * 0.8,
      duration: 0.25,
    });

    if (complexity < 0.4) {
      // Very sparse - maybe just beat 1 and a light 3
      if (Math.random() < 0.6) {
        hits.push({
          drum: 'kick',
          time: barOffset + 2,
          velocity: kickVel * 0.5,
          duration: 0.2,
        });
      }
    } else if (complexity < 0.7) {
      // Add syncopated kick on the "and" of 2
      hits.push({
        drum: 'kick',
        time: barOffset + 1.67, // Swung position
        velocity: kickVel * 0.6,
        duration: 0.2,
      });
    } else {
      // More movement but still sparse
      hits.push({
        drum: 'kick',
        time: barOffset + 1.67,
        velocity: kickVel * 0.55,
        duration: 0.2,
      });
      if (Math.random() < 0.5) {
        hits.push({
          drum: 'kick',
          time: barOffset + 3.33,
          velocity: kickVel * 0.5,
          duration: 0.2,
        });
      }
    }
  } else if (beatsPerBar === 3) {
    hits.push({
      drum: 'kick',
      time: barOffset,
      velocity: kickVel * 0.7,
      duration: 0.25,
    });
  }
}

function addLofiSnare(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number
) {
  // Snare with emphasis on ghost notes - conversational like jazz
  const snareVel = velocity * 0.75;

  if (beatsPerBar >= 4) {
    // Backbeat on 2 and 4, but softer than typical hip hop
    hits.push({
      drum: 'snare',
      time: barOffset + 1,
      velocity: snareVel * 0.7,
      duration: 0.15,
    });
    hits.push({
      drum: 'snare',
      time: barOffset + 3,
      velocity: snareVel * 0.75,
      duration: 0.15,
    });

    // Ghost notes - the soul of lofi drums
    const ghostPositions = [
      { time: 0.67, prob: 0.4, vel: 0.25 },  // Swung upbeat of 1
      { time: 1.67, prob: 0.5, vel: 0.3 },   // Swung upbeat of 2
      { time: 2.33, prob: 0.35, vel: 0.22 }, // Before beat 3
      { time: 2.67, prob: 0.45, vel: 0.28 }, // Swung upbeat of 3
      { time: 3.67, prob: 0.4, vel: 0.25 },  // Swung upbeat of 4
    ];

    for (const ghost of ghostPositions) {
      if (ghost.time < beatsPerBar && Math.random() < ghost.prob * (0.5 + complexity * 0.8)) {
        hits.push({
          drum: 'snare',
          time: barOffset + ghost.time,
          velocity: snareVel * ghost.vel,
          duration: 0.08,
        });
      }
    }
  } else if (beatsPerBar === 3) {
    // 3/4 - snare on beat 2
    hits.push({
      drum: 'snare',
      time: barOffset + 1,
      velocity: snareVel * 0.7,
      duration: 0.15,
    });
    // Ghost note
    if (Math.random() < 0.4) {
      hits.push({
        drum: 'snare',
        time: barOffset + 0.67,
        velocity: snareVel * 0.25,
        duration: 0.08,
      });
    }
  }
}

function addLofiHihat(
  hits: DrumHit[],
  barOffset: number,
  beatsPerBar: number,
  complexity: number,
  velocity: number
) {
  // Sparse hi-hat - just accents, not the main time keeper
  // This differentiates lofi from typical hip hop
  const hihatVel = velocity * 0.5;

  if (beatsPerBar >= 4) {
    // Hi-hat foot on 2 and 4 (like jazz)
    hits.push({
      drum: 'hihat-closed',
      time: barOffset + 1,
      velocity: hihatVel * 0.5,
      duration: 0.08,
    });
    hits.push({
      drum: 'hihat-closed',
      time: barOffset + 3,
      velocity: hihatVel * 0.5,
      duration: 0.08,
    });

    // Occasional open hi-hat for texture at higher complexity
    if (complexity > 0.5 && Math.random() < 0.25) {
      const openPos = Math.random() < 0.5 ? 3.67 : 1.67;
      hits.push({
        drum: 'hihat-open',
        time: barOffset + openPos,
        velocity: hihatVel * 0.4,
        duration: 0.12,
      });
    }
  }
}
