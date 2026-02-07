import { Pattern, DrumType, DRUM_NAMES } from '../types';
import './PatternDisplay.css';

interface PatternDisplayProps {
  pattern: Pattern | null;
  currentBeat?: number;
}

const DISPLAY_DRUMS: DrumType[] = [
  'crash',
  'ride',
  'hihat-open',
  'hihat-closed',
  'tom-high',
  'tom-mid',
  'tom-low',
  'snare',
  'kick',
];

const DRUM_COLORS: Record<DrumType, string> = {
  'kick': '#e53935',
  'snare': '#fb8c00',
  'hihat-closed': '#43a047',
  'hihat-open': '#66bb6a',
  'tom-high': '#8e24aa',
  'tom-mid': '#7b1fa2',
  'tom-low': '#6a1b9a',
  'crash': '#fdd835',
  'ride': '#ffee58',
};

export function PatternDisplay({ pattern, currentBeat }: PatternDisplayProps) {
  if (!pattern) {
    return (
      <div className="pattern-display pattern-display-empty">
        <p>Click "Generate" to create a pattern</p>
      </div>
    );
  }

  const beatsPerBar = getBeatsPerBar(pattern.timeSignature);
  const totalBeats = pattern.lengthInBeats;
  const gridResolution = 0.25; // 16th notes
  const totalSteps = Math.ceil(totalBeats / gridResolution);

  // Build a grid of hits
  const grid = new Map<string, { velocity: number }>();
  for (const hit of pattern.hits) {
    const step = Math.round(hit.time / gridResolution);
    const key = `${hit.drum}-${step}`;
    const existing = grid.get(key);
    if (!existing || hit.velocity > existing.velocity) {
      grid.set(key, { velocity: hit.velocity });
    }
  }

  const currentStep = currentBeat !== undefined
    ? Math.floor(currentBeat / gridResolution)
    : -1;

  return (
    <div className="pattern-display">
      <div className="pattern-grid">
        {/* Header with beat numbers */}
        <div className="pattern-row pattern-header">
          <div className="pattern-drum-label" />
          {Array.from({ length: totalSteps }).map((_, i) => {
            const beat = i * gridResolution;
            const isDownbeat = beat % beatsPerBar === 0;
            const isBeat = beat % 1 === 0;
            return (
              <div
                key={i}
                className={`pattern-step-header ${isDownbeat ? 'downbeat' : isBeat ? 'beat' : ''}`}
              >
                {isBeat ? Math.floor(beat) + 1 : ''}
              </div>
            );
          })}
        </div>

        {/* Drum rows */}
        {DISPLAY_DRUMS.map(drum => {
          const hasHits = pattern.hits.some(h => h.drum === drum);
          if (!hasHits) return null;

          return (
            <div key={drum} className="pattern-row">
              <div className="pattern-drum-label" title={DRUM_NAMES[drum]}>
                {getShortName(drum)}
              </div>
              {Array.from({ length: totalSteps }).map((_, i) => {
                const key = `${drum}-${i}`;
                const hit = grid.get(key);
                const beat = i * gridResolution;
                const isDownbeat = beat % beatsPerBar === 0;
                const isBeat = beat % 1 === 0;
                const isCurrentStep = i === currentStep;

                return (
                  <div
                    key={i}
                    className={`pattern-step ${isDownbeat ? 'downbeat' : isBeat ? 'beat' : ''} ${isCurrentStep ? 'current' : ''}`}
                  >
                    {hit && (
                      <div
                        className="pattern-hit"
                        style={{
                          backgroundColor: DRUM_COLORS[drum],
                          opacity: 0.4 + hit.velocity * 0.6,
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
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

function getShortName(drum: DrumType): string {
  switch (drum) {
    case 'kick': return 'KK';
    case 'snare': return 'SN';
    case 'hihat-closed': return 'HH';
    case 'hihat-open': return 'OH';
    case 'tom-high': return 'TH';
    case 'tom-mid': return 'TM';
    case 'tom-low': return 'TL';
    case 'crash': return 'CR';
    case 'ride': return 'RD';
  }
}
