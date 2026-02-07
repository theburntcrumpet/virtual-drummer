import { useState, useCallback, useRef, useEffect } from 'react';
import { XYPad } from './components/XYPad';
import { PatternDisplay } from './components/PatternDisplay';
import { generatePattern } from './generator/PatternGenerator';
import { audioEngine } from './audio/AudioEngine';
import { downloadMidi, generateFilename } from './midi/MidiExporter';
import { renderToWav, downloadWav } from './audio/Renderer';
import type { Pattern, KitStyle, TimeSignature, GeneratorSettings } from './types';
import './App.css';

const KIT_STYLES: { value: KitStyle; label: string }[] = [
  { value: 'rock', label: 'Rock' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'electronic', label: 'Electronic' },
  { value: 'latin', label: 'Latin' },
  { value: 'lofi', label: 'Lo-Fi' },
];

const TIME_SIGNATURES: { value: TimeSignature; label: string }[] = [
  { value: '4/4', label: '4/4' },
  { value: '3/4', label: '3/4' },
  { value: '6/8', label: '6/8' },
  { value: '5/4', label: '5/4' },
  { value: '7/8', label: '7/8' },
];

const BAR_OPTIONS = [1, 2, 4, 8];

function App() {
  const [kitStyle, setKitStyle] = useState<KitStyle>('rock');
  const [timeSignature, setTimeSignature] = useState<TimeSignature>('4/4');
  const [bpm, setBpm] = useState(120);
  const [bars, setBars] = useState(4);
  const [complexity, setComplexity] = useState(0.5);
  const [dynamics, setDynamics] = useState(0.5);
  const [pattern, setPattern] = useState<Pattern | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [currentBeat, setCurrentBeat] = useState(0);
  const animationRef = useRef<number>();

  const handleGenerate = useCallback(async () => {
    // Stop playback first
    audioEngine.stop();
    setIsPlaying(false);

    const settings: GeneratorSettings = {
      kitStyle,
      timeSignature,
      bpm,
      bars,
      complexity,
      dynamics,
    };

    const newPattern = generatePattern(settings);
    setPattern(newPattern);
    audioEngine.setPattern(newPattern);
  }, [kitStyle, timeSignature, bpm, bars, complexity, dynamics]);

  const handlePlay = useCallback(async () => {
    if (!pattern) {
      await handleGenerate();
    }

    await audioEngine.init(kitStyle);

    if (isPlaying) {
      audioEngine.stop();
      setIsPlaying(false);
      setCurrentBeat(0);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    } else {
      audioEngine.play();
      setIsPlaying(true);

      // Update current position for display
      const updatePosition = () => {
        const pos = audioEngine.getCurrentPosition();
        const beatPos = (pos / 60) * bpm;
        setCurrentBeat(beatPos);
        animationRef.current = requestAnimationFrame(updatePosition);
      };
      updatePosition();
    }
  }, [pattern, isPlaying, bpm, kitStyle, handleGenerate]);

  const handleStop = useCallback(() => {
    audioEngine.stop();
    setIsPlaying(false);
    setCurrentBeat(0);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, []);

  const handleDownloadMidi = useCallback(() => {
    if (!pattern) return;
    const filename = generateFilename(pattern, kitStyle);
    downloadMidi(pattern, filename);
  }, [pattern, kitStyle]);

  const handleDownloadWav = useCallback(async () => {
    if (!pattern) return;
    setIsRendering(true);
    try {
      const blob = await renderToWav(pattern);
      const filename = generateFilename(pattern, kitStyle);
      downloadWav(blob, filename);
    } finally {
      setIsRendering(false);
    }
  }, [pattern, kitStyle]);

  const handleXYChange = useCallback((x: number, y: number) => {
    setComplexity(x);
    setDynamics(y);
  }, []);

  const handleBpmChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newBpm = parseInt(e.target.value, 10);
    setBpm(newBpm);
    audioEngine.setBpm(newBpm);
  }, []);

  const handleKitChange = useCallback(async (newKit: KitStyle) => {
    setKitStyle(newKit);
    await audioEngine.setKitStyle(newKit);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngine.stop();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Virtual Drummer</h1>
        <p className="app-subtitle">AI-powered drum pattern generator</p>
      </header>

      <main className="app-main">
        <div className="controls-section">
          <div className="controls-row">
            <div className="control-group">
              <label htmlFor="kit-select">Kit Style</label>
              <select
                id="kit-select"
                value={kitStyle}
                onChange={(e) => handleKitChange(e.target.value as KitStyle)}
              >
                {KIT_STYLES.map((kit) => (
                  <option key={kit.value} value={kit.value}>
                    {kit.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="time-sig-select">Time Signature</label>
              <select
                id="time-sig-select"
                value={timeSignature}
                onChange={(e) => setTimeSignature(e.target.value as TimeSignature)}
              >
                {TIME_SIGNATURES.map((ts) => (
                  <option key={ts.value} value={ts.value}>
                    {ts.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group">
              <label htmlFor="bars-select">Bars</label>
              <select
                id="bars-select"
                value={bars}
                onChange={(e) => setBars(parseInt(e.target.value, 10))}
              >
                {BAR_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="control-group bpm-control">
              <label htmlFor="bpm-slider">
                BPM: <span className="bpm-value">{bpm}</span>
              </label>
              <input
                id="bpm-slider"
                type="range"
                min="60"
                max="200"
                value={bpm}
                onChange={handleBpmChange}
              />
            </div>
          </div>
        </div>

        <div className="main-content">
          <div className="xy-section">
            <XYPad x={complexity} y={dynamics} onChange={handleXYChange} />
            <div className="xy-values">
              <span>Complexity: {Math.round(complexity * 100)}%</span>
              <span>Dynamics: {Math.round(dynamics * 100)}%</span>
            </div>
          </div>

          <div className="pattern-section">
            <PatternDisplay pattern={pattern} currentBeat={currentBeat} />
          </div>
        </div>

        <div className="transport-section">
          <div className="transport-buttons">
            <button
              className="btn btn-primary btn-large"
              onClick={handleGenerate}
            >
              Generate
            </button>

            <button
              className={`btn btn-secondary ${isPlaying ? 'btn-active' : ''}`}
              onClick={handlePlay}
              disabled={!pattern && !isPlaying}
            >
              {isPlaying ? 'Stop' : 'Play'}
            </button>

            {isPlaying && (
              <button className="btn btn-secondary" onClick={handleStop}>
                Reset
              </button>
            )}
          </div>

          <div className="download-buttons">
            <button
              className="btn btn-download"
              onClick={handleDownloadMidi}
              disabled={!pattern}
            >
              Download MIDI
            </button>

            <button
              className="btn btn-download"
              onClick={handleDownloadWav}
              disabled={!pattern || isRendering}
            >
              {isRendering ? 'Rendering...' : 'Download WAV'}
            </button>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>
          Move the pad to adjust complexity and dynamics, then click Generate.
          Export to MIDI or WAV for use in your DAW.
        </p>
      </footer>
    </div>
  );
}

export default App;
