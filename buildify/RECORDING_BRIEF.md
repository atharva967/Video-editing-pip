# Buildify walkthrough: recording brief (for a Claude session on the user's computer)

Goal: sharp raw screen recordings of Buildify (https://www.buildify.sh) for an onboarding
walkthrough and a 30 s marketing cut. Editing happens in the cloud session; this machine only records.

## Setup
- Use the user's Chrome profile that is already logged in to buildify.sh. Close Chrome first, then
  launch it with Playwright `chromium.launchPersistentContext(<Chrome user-data dir>, { channel: "chrome",
  headless: false, viewport: { width: 1920, height: 1080 }, recordVideo: { dir: "clips", size: { width: 1920, height: 1080 } } })`.
  Never print, copy or commit cookies, tokens or passwords.
- Keep temp files on E: if C: is short on space (set TEMP/TMP to E:\tmp).
- Move the mouse with `page.mouse.move(x, y, { steps: 25 })` so motion is visible; wait ~1 s after each click.
- Use demo content only (no personal data on screen). If a step costs credits, ask the user before running it.

## Clips (one video file each, name them exactly)
1. `01-dashboard.webm`  Dashboard overview: credits badge, where each tool lives.
2. `02-builder.webm`  Builder: prompt "A habit tracker with streaks" -> wait for live preview ->
   refine "Add dark mode" -> show Push to GitHub / Download code (hover, do not push).
3. `03-studio.webm`  Buildify Studio: pick a template -> drag in an element -> edit a heading's text and
   typography -> Preview -> Publish (only if the user agrees to a public URL).
4. `04-ai-chat.webm`  AI Chat: pick a free model -> ask "Build a pomodoro timer" -> click Run for the preview.
5. `05-accessibility.webm`  Accessibility Tester: URL https://www.buildify.sh -> Start Test -> logs -> score ->
   hover Download report.
6. `06-video-gen.webm`  AI Video Generator: prompt "A 30s launch video for a habit tracker app", 30s, English ->
   Generate -> scene plan streaming -> result.
7. `07-agents.webm` (optional)  PRD / Spec Builder: answer two questions -> spec appears.

Also write `clips/notes.md`: for each clip, the second marks of key moments (click, result appears) and
anything that differed from this brief.

## Hand-off
Convert each clip to MP4 (H.264, CRF 18) if ffmpeg is available, then commit `clips/` to branch
`buildify-raw` of github.com/atharva967/Video-editing-pip and push. Reply with the branch and commit.
