# Rekroots outreach demos: instructions for Claude

Read `HANDOFF.md` first. It holds the history, the user's decisions, and open items.
`docs/memory/` has the original working notes (`screen-demo-format.md` is the main one).
They were written against the old repo layout, where this code lived under `remotion/`.

## Rules from the user
- Videos are ~30 s (`intro.sec 1.5`, `app.fit 26.3`, `outro.sec 2.2`). A 49 s version was too long.
- Put both of the lead's priority roles in ONE video.
- Use the native replica (`RekrootsApp.tsx`). Never go back to screen recordings, upscaling or text
  patches: the user rejected those as blurry.
- If a lead brief has no clear company name, ASK before rendering.
- If only role names are given, draft short JD text grounded in the lead's real careers page and
  flag it as a draft.
- No em dashes in captions or on-screen copy.

## Workflow
1. Copy the newest props file in `props/`, edit company, intro, and jobs.
2. Render 4-6 stills (intro ~f20, dashboard ~f130, form ~f330, board ~f700) and look at them.
3. Full render with `--jpeg-quality=100 --crf=16 --x264-preset=slow --timeout=180000`.
4. Report what's a guess (JD text, work mode, stats, dates) so the user can confirm.
