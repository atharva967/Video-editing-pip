---
name: machine-env-gotchas
description: "Samarth's machine: no system ffmpeg on PATH, Remotion's bundled ffmpeg is filter-less, C: drive near-full, faster-whisper needs HF_HOME=E:"
metadata: 
  node_type: memory
  type: project
  originSessionId: 0d004091-ee8f-4f2f-a96a-f1bc0c256144
  modified: 2026-09-28T12:14:26.619Z
---

Environment facts (2026-08-11) for the ember-ad machine:

- **No system ffmpeg/ffprobe on PATH** anymore. Use Remotion's bundled binaries:
  `remotion/node_modules/@remotion/compositor-win32-x64-msvc/ffmpeg.exe` (+ffprobe.exe).
- That bundled ffmpeg is a **trimmed build with NO filters** (no `fps`, `scale`, `tile`,
  `volumedetect`, `loudnorm`, `-af volume`). Frame grabs: use `-ss T ... -frames:v 1 -s WxH`.
  Audio loudness checks: extract wav and compute RMS in Python (`audioop` is gone in
  Python 3.13 — use `struct` + math).
- **C: drive is effectively full** and refills from outside the project (hit 0 bytes
  2026-09-28). Fix applied 2026-09-28: these now LIVE ON E: via junctions, paths unchanged —
  `renders/` → `E:\ember-ad-store\renders`, `remotion/public` → `…\remotion-public`,
  `remotion/out` → `…\remotion-out`, `remotion/node_modules/.cache` → `…\remotion-cache`,
  `~/.cache/hyperframes` (Kokoro/Whisper models) → `…\hyperframes-cache`; npm cache →
  `E:\npm-cache`; `HF_HOME=E:\hf-cache`. Do NOT `rm -rf` these paths (they're junctions
  to E:). If C: fills again it's the user's other files, not ours — tell them.
- **Speech-to-text that works here:** `pip`-installed `faster-whisper` (small.en, int8,
  `HF_HOME=E:\hf-cache`). `whisper.exe` (openai-whisper) is broken (no torch), and
  `npx hyperframes transcribe` shells out to it — also broken.
- Kokoro TTS via `npx hyperframes tts` still works (used by [[reel-pipeline]] VO).
