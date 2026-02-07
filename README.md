# Virtual Drummer

**[Try it out!](https://theburntcrumpet.github.io/virtual-drummer/)**

A web-based drum pattern generator inspired by GarageBand/Logic Pro's Drummer feature. Generate intelligent drum patterns with an intuitive XY pad interface and export them to your DAW.

## Features

- **5 Kit Styles**: Rock, Jazz, Electronic, Latin, Lo-Fi
- **XY Pad Control**: Adjust complexity (X) and dynamics (Y) in real-time
- **Multiple Time Signatures**: 4/4, 3/4, 6/8, 5/4, 7/8
- **Variable Length**: 1, 2, 4, or 8 bars
- **Tempo Control**: 60-200 BPM
- **Export Options**: Download as MIDI or WAV
- **Real-time Playback**: Preview patterns before exporting

## Kit Styles

| Style | Character |
|-------|-----------|
| Rock | Punchy acoustic kit with moderate room |
| Jazz | Warm, soft brushed feel with big reverb |
| Electronic | 808-style synthesized drums |
| Latin | Tumbao-inspired patterns with clave feel |
| Lo-Fi | Jazz-influenced, muffled tape character |

## Usage

1. Select a kit style and time signature
2. Adjust BPM with the slider
3. Move the XY pad to set complexity and dynamics
4. Click **Generate** to create a pattern
5. Click **Play** to preview
6. Download as **MIDI** for your DAW or **WAV** for direct use

## Running Locally

```bash
npm install
npm run dev
```

## Building for Production

```bash
npm run build
```

Output goes to `dist/` folder.

## Deploying to GitHub Pages

The project is configured for GitHub Pages deployment. Push to main and GitHub Actions will automatically build and deploy.

Manual deploy:
```bash
npm run build
# Push dist/ contents to gh-pages branch
```

## Tech Stack

- React + TypeScript
- Vite
- Tone.js (audio engine)
- @tonejs/midi (MIDI export)
- Web Audio API (WAV rendering)

## License

MIT
