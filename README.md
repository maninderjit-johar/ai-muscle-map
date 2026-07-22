# AI Muscle Map

An interactive workout intelligence prototype that translates exercises, sets, and reps into estimated muscle activation on selectable male and female 3D anatomy models.

**[Try the live demo](https://ai-muscle-map.vercel.app)**

## Highlights

- Interactive male and female 3D body models
- Front, back, rotate, and zoom controls
- Selectable muscle regions with activation percentages
- Balanced, push, pull, and leg-day samples
- Exercise, set, and rep controls with explicit analysis
- Dynamic push, pull, legs, and core summaries
- Responsive recruiter-ready product interface

## How it works

The current prototype uses deterministic exercise-to-muscle profiles. Users edit a workout and click **Analyze Workout** to update the heatmap, rankings, and training balance. This keeps the experience predictable while the product continues toward richer AI-assisted analysis.

The anatomy overlays are generated from named surface regions on independently centered male and female GLB models. They are intended for training exploration, not clinical measurement.

## Technology

- Next.js and TypeScript
- React Three Fiber and Three.js
- Drei camera and interaction controls
- Vinext and Cloudflare-compatible deployment

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Attribution

“Male and female body base mesh free to download” by [Toadstool022](https://skfb.ly/6QYp6), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
