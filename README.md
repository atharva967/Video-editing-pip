# Rekroots outreach demo videos

Personalised ~30 s Screen Studio-style walkthroughs of Rekroots (rekroots.com) for sales leads:
"Made for <Company>" intro, the lead's dashboard, their 1-2 priority roles typed into the
post-a-role form, both roles live on the postings board, applicant pipeline, outro.

Built with Remotion. The Rekroots UI is redrawn natively as DOM (`src/screendemo/RekrootsApp.tsx`),
so every frame is sharp and the job text changes per lead from a props JSON.

Start with [HANDOFF.md](HANDOFF.md) for the full history, decisions and open items.

## Setup

```bash
npm ci
```

Requires Node 18+. First render downloads a headless Chrome.

## Make a video for a new lead

1. Copy the latest template: `props/rekroots-galaxeye-2roles-30s.json` → `props/rekroots-<lead>-2roles-30s.json`.
2. Edit `id`, `intro.tag` / `intro.sub`, `app.company`, `app.jobs` (title, type, mode, location,
   description, requirements[], skills[], date). Optional: `app.stats`, `app.recent`, `app.others`.
3. Check a few stills:
   ```bash
   npx remotion still ScreenDemo out/f130.png --props=props/<id>.json --frame=130 --timeout=180000
   ```
4. Render (~8 min):
   ```bash
   npx remotion render ScreenDemo renders/<id>.mp4 --props=props/<id>.json --jpeg-quality=100 --crf=16 --x264-preset=slow --timeout=180000
   ```

Preview interactively with `npx remotion studio`.

## Layout

| Path | What |
|---|---|
| `src/screendemo/ScreenDemo.tsx` | Shell: browser window on wallpaper, camera, clicks, spotlights, captions, intro/outro, music |
| `src/screendemo/RekrootsApp.tsx` | Native Rekroots replica + `rekrootsScript()` that generates all timing from the roles |
| `props/` | One JSON per lead video |
| `public/` | Logo, music track, click sfx |
| `docs/memory/` | Working notes carried over from the original Claude setup |
| `renders/` | Output MP4s (git-ignored) |

## Timing

Total ≈ `intro.sec` (1.5) + `app.fit` (26.3) + `outro.sec` (2.2) = 30 s. `app.fit` scales every
beat of the product part to that length.
