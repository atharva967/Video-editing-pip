# Handoff: Rekroots outreach demo videos (as of 2026-10-14)

> Repo layout note: paths below refer to the original project, where this code lived under
> `ember-ad/remotion/`. In this repo, `remotion/props/...` is `props/...`,
> `remotion/src/screendemo/...` is `src/screendemo/...`, and renders go to `renders/`. Render
> MP4s are not included (git-ignored). The Windows-specific E: drive and TEMP notes only apply
> to the original machine.

> Note on sources: this handoff was written from the visible part of the chat plus the project's
> memory files and files on disk. Earlier parts of the chat were summarized out of context, so
> exact user wording from those parts is not available. Anything marked **[USER]** is confirmed as
> the user's own statement or decision (from memory notes recorded at the time). **[CLAUDE]** marks
> things Claude suggested or chose on its own.

---

## 1. CONTEXT

- **Project:** `ember-ad`, a video/content production workspace at `C:\Users\Samarth\Documents\ember-ad`
  (HyperFrames reels + a Remotion project in `remotion/`). Brands handled: Rekroots, Prism, Buildify.
- **This chat's work stream:** personalised **Rekroots outreach demo videos** for sales leads.
  Each video is a ~30 s Screen Studio-style product walkthrough showing a lead's own company name and
  their open roles being posted on Rekroots (rekroots.com, a hiring platform with AI first-round
  interviews).
- **Goal:** for each lead, produce a video "Made for <Company>" that shows their dashboard, posts
  their 1-2 priority roles (with job descriptions), shows them live on the postings board, then the
  applicant pipeline. Used for cold outreach.
- **Latest lead:** **GalaxEye Space** (Bengaluru space-tech company building SAR + EO satellites).

## 2. BACKGROUND FACTS

### Tooling and files
- Composition: `remotion/src/screendemo/ScreenDemo.tsx` (shell: window on wallpaper, camera, clicks,
  spotlights, captions, intro/outro, music).
- Native app replica: `remotion/src/screendemo/RekrootsApp.tsx`. Redraws the Rekroots employer flow
  as DOM in a 1260×684 coordinate space: landing → dashboard → chooser ("Generate with AI" / "Write it
  yourself") → post-a-role form (typed title, location, description, requirements, skill chips, AI
  interview checkbox) → publish → postings board + "Posting published." toast → applicant pipeline.
- `rekrootsScript()` in RekrootsApp.tsx auto-generates timeline, camera, pointer path, clicks,
  spotlights and captions from the number of roles. Props `camera`/`captions` are ignored in app mode.
- Props data shape (`app` object):
  - `company`, `greeting?`
  - `stats?`: `[label, value, sub][]` (5 dashboard tiles)
  - `recent?`: `[title, meta][]` (dashboard "Recent postings")
  - `others?`: `[title, line1, publishedDate, applicants][]` (pre-existing rows on postings board;
    board shows max 4 rows total)
  - `job?` or `jobs?: Job[]` where Job = `{title, type, mode, location?, description,
    requirements[], skills[], date}`. First role typed at full pace, later roles in a faster pass.
  - `fit?`: target seconds for the product part; all beats scale to match.
- Defaults if `stats/recent/others` omitted: placeholder values (Active postings 21, Total applicants
  64, etc.; recent = Senior AI Engineer, Data Scientist; others = Senior AI Engineer, Data Scientist,
  Business Development Manager...). The Instead props uses these defaults.
- 30 s formula: `intro.sec 1.5` + `app.fit 26.3` + `outro.sec 2.2` = ~30 s.
- Shared props values: fps 30, srcW 1260, srcH 684, win `{w:1440,h:860,bar:44,url:"rekroots.com"}`,
  brand `{name:"Rekroots", logoSrc:"brand/rekroots-mark.svg", accent:"#DC2626", ink:"#1A0B0B",
  paper:"#F6F1EC"}`, music `music/pumpupthemind-creative-technology-showreel-241274.mp3`,
  musicVolume 0.3, musicStart 11, outro title "Less screening. Better hires.", sub "Post your first
  role today", url "rekroots.com".
- Output: 1920×1080 MP4 with music.

### Render commands (PowerShell; TEMP must be on E:)
Stills check:
```powershell
$env:TEMP='E:\tmp'; $env:TMP='E:\tmp'; Set-Location C:\Users\Samarth\Documents\ember-ad\remotion
npx remotion still ScreenDemo "E:\tmp\<lead>\f130.png" --props=props/<id>.json --frame=130 --timeout=180000 --log=error
```
Full render (~8 min):
```powershell
$env:TEMP='E:\tmp'; $env:TMP='E:\tmp'; Set-Location C:\Users\Samarth\Documents\ember-ad\remotion
npx remotion render ScreenDemo ../renders/<id>.mp4 --props=props/<id>.json --jpeg-quality=100 --crf=16 --x264-preset=slow --timeout=180000 --log=error
```
Duration check: `remotion/node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe`
(no system ffmpeg on PATH; bundled ffmpeg has no filters).

### Machine constraints
- **C: drive is full (0 GB free as of 2026-10-14).** `renders/`, `remotion/public`,
  `remotion/out`, `remotion/node_modules/.cache` are junctions to `E:\ember-ad-store\...`. Do not
  `rm -rf` those paths. Keep temp files on E:.
- `--timeout=180000` needed (headless browser setup timed out once at default 30 s).

### Leads and videos so far
| Lead | Roles | Props | Render | Notes |
|---|---|---|---|---|
| (generic) | 1 | `props/rekroots-demo.json` | `renders/rekroots-demo.mp4` | Recording-based, 35.8 s, rejected as blurry |
| Hinge Health | 1 | `props/rekroots-native-hinge-health.json` | `renders/rekroots-demo-hinge-health.mp4` | First native replica |
| Hinge Health | 2 | `props/rekroots-hinge-health-2roles.json` | `renders/rekroots-demo-hinge-health-2roles.mp4` | Misread of user's message; wrong lead |
| Instead (AI tax platform) | 2 | `props/rekroots-instead-2roles.json` | `renders/rekroots-demo-instead-2roles.mp4` | 49 s, too long |
| Instead | 2 | `props/rekroots-instead-2roles-30s.json` | `renders/rekroots-demo-instead-2roles-30s.mp4` | 30 s version |
| **GalaxEye Space** | 2 | `props/rekroots-galaxeye-2roles-30s.json` | `renders/rekroots-galaxeye-2roles-30s.mp4` | **Latest**, 30.06 s, 8.97 MB, rendered 2026-10-14 10:32 |

### GalaxEye open roles referenced (8 total)
Satellite Systems Engineer (E&E); Full Stack Developer; PCB Design Engineer; Space Optical Payload
AIT Lead; Senior Hardware Design Engineer; Lead Camera Electronics Engineer (Embedded); Product QA
Engineer (SAR & EO Image Validation); Opto-Mechanical Engineer.
(Where this list came from is in the summarized-out part of the chat; not verified here.)

## 3. DECISIONS MADE

**[USER] decisions (recorded in memory at the time):**
1. Style should match reference reel https://www.instagram.com/reel/DdL_g4yT7R_/ (@divyam.explains,
   Screen Studio-type: rounded browser window on wallpaper, eased zooms, sped-up dead time). (2026-10-09)
2. Recording-based video rejected twice for blur; job description must change per opening, so the
   native DOM replica (RekrootsApp.tsx) is the default. (2026-10-09)
3. Leads often have 2 priority roles; user wants both in ONE video. (2026-10-13)
4. 49 s two-role video too long; user asked for 30 s. Default new outreach videos to ~30 s. (2026-10-13)
5. Outreach demos get the lead's company + role on screen (personalisation). (2026-10-09)

**[CLAUDE] choices for GalaxEye (not user-confirmed):**
- Typed roles: Satellite Systems Engineer (E&E) first (full pace), Full Stack Developer second (fast
  pass). Reason: one hardware + one software role shows range.
- Postings board shows the 2 new roles + PCB Design Engineer + Space Optical Payload AIT Lead.
- Dashboard "Recent postings": Product QA Engineer (SAR & EO Image Validation), Opto-Mechanical Engineer.
- Senior Hardware Design Engineer and Lead Camera Electronics Engineer are in props `others` but not
  visible (board only shows 4 rows).
- Same 30 s timing as the Instead video (fit 26.3).

## 4. WORK PRODUCED

### Final deliverable
`C:\Users\Samarth\Documents\ember-ad\renders\rekroots-galaxeye-2roles-30s.mp4`
(physically on `E:\ember-ad-store\renders\`). 30.06 s, 1920×1080, video + audio. Stills of intro,
dashboard, form and postings board were checked before render; final file was checked for
duration/format only, not watched end to end.

### Final props: `remotion/props/rekroots-galaxeye-2roles-30s.json`
```json
{
  "fps": 30,
  "srcW": 1260,
  "srcH": 684,
  "win": { "w": 1440, "h": 860, "bar": 44, "url": "rekroots.com" },
  "outro": { "sec": 2.2, "title": "Less screening. Better hires.", "sub": "Post your first role today", "url": "rekroots.com" },
  "brand": { "name": "Rekroots", "logoSrc": "brand/rekroots-mark.svg", "accent": "#DC2626", "ink": "#1A0B0B", "paper": "#F6F1EC" },
  "musicSrc": "music/pumpupthemind-creative-technology-showreel-241274.mp3",
  "musicVolume": 0.3,
  "musicStart": 11,
  "id": "rekroots-galaxeye-2roles-30s",
  "src": "",
  "segs": [{ "a": 0, "b": 1 }],
  "camera": [{ "o": 0, "rect": [182, 42, 1075] }],
  "clicks": [],
  "spots": [],
  "captions": [],
  "intro": {
    "sec": 1.5,
    "tag": "Made for GalaxEye Space",
    "title": "Post your open roles in minutes",
    "sub": "Satellite Systems Engineer + Full Stack Developer, live on Rekroots"
  },
  "app": {
    "company": "GalaxEye Space",
    "greeting": "Welcome back",
    "stats": [
      ["Active postings", "6", "· 2 in draft"],
      ["Total applicants", "64", ""],
      ["Upcoming interviews", "0", ""],
      ["Drafts", "2", ""],
      ["Verified", "No", ""]
    ],
    "recent": [
      ["Product QA Engineer (SAR & EO Image Validation)", "0 applicants · 10/12/2026"],
      ["Opto-Mechanical Engineer", "0 applicants · 10/12/2026"]
    ],
    "others": [
      ["PCB Design Engineer", "Bengaluru · full-time · onsite", "10/12/2026", 0],
      ["Space Optical Payload AIT Lead", "Bengaluru · full-time · onsite", "10/12/2026", 0],
      ["Senior Hardware Design Engineer", "Bengaluru · full-time · onsite", "10/12/2026", 0],
      ["Lead Camera Electronics Engineer (Embedded)", "Bengaluru · full-time · onsite", "10/12/2026", 0]
    ],
    "jobs": [
      {
        "title": "Satellite Systems Engineer (E&E)",
        "type": "Full-time",
        "mode": "Onsite",
        "location": "Bengaluru, India",
        "date": "10/14/2026",
        "description": "Own the electrical and electronics architecture of our SAR + EO satellites. Define power, harness and avionics interfaces, and take subsystems from design reviews through integration, testing and launch.",
        "requirements": [
          "4+ years in spacecraft or avionics E&E systems",
          "Power, harness and interface design (ICDs)",
          "Hands-on integration and environmental testing",
          "Familiar with ECSS or NASA standards"
        ],
        "skills": ["Systems Engineering", "Power Systems", "Harness Design", "Avionics", "AIT", "ECSS"]
      },
      {
        "title": "Full Stack Developer",
        "type": "Full-time",
        "mode": "Onsite",
        "location": "Bengaluru, India",
        "date": "10/14/2026",
        "description": "Build the platform that delivers our SAR and optical satellite imagery to customers. Ship web apps, APIs and data pipelines for tasking, ordering and viewing Earth observation data.",
        "requirements": [
          "3+ years building production web apps",
          "Strong in React and a modern backend stack",
          "Experience with cloud services and APIs",
          "Bonus: geospatial or map-based products"
        ],
        "skills": ["React", "TypeScript", "Python", "PostgreSQL", "AWS", "GIS"]
      }
    ],
    "fit": 26.3
  }
}
```

### On-screen captions generated (GalaxEye)
1 "Start at rekroots.com" · 2 "GalaxEye Space's hiring dashboard at a glance" · then "Role 1:
Satellite Systems Engineer (E&E)", "Describe the role and what you need", "Add skills. AI interviews
are one checkbox away", "Publish in one click", "Satellite Systems Engineer (E&E) is live instantly",
"Role 2: Full Stack Developer, posted the same way", "Both roles are live on your postings board",
"Track every applicant through your pipeline". (Exact numbering/wording is generated by
`rekrootsScript()`; verified on stills: #2, #5, #10.)

### Template for previous lead (Instead, 30 s)
`remotion/props/rekroots-instead-2roles-30s.json`: same shell values; intro tag "Made for Instead",
sub "Watch Software Engineer and Product Designer go live on Rekroots"; roles Software Engineer +
Product Designer, Hybrid, Bengaluru, India, dated 10/13/2026; no stats/recent/others (uses defaults).

## 5. REJECTED OPTIONS (do not re-suggest)
- **Recording-based demo** (`rekroots-demo.json`, raw 1260×684 screen recording + Screen Studio
  edit): rejected by user, blurry.
- **Upscaling the recording** (`pipeline/enhance_screen.py`, 2x temporal denoise + Lanczos) and
  **patching text over the recording** (`patches` prop): superseded; user still found it unusable and
  needed JD text to change per role. Don't go back to it.
- **49 s two-role length**: too long per user; use ~30 s.
- **Hinge Health 2-role render**: built from a misread of the user's message (wrong company). Lesson:
  if a lead brief has no clear company name, ASK before rendering.

## 6. MY PREFERENCES (user)
- Short, ~30 s outreach videos; both priority roles in one video.
- Sharp visuals (blur is a dealbreaker).
- Lead's company name and real roles on screen.
- When only role names are given, Claude drafts short JD text grounded in the lead's real careers
  page and **flags it as a draft**.
- No em dashes in captions or on-screen copy (use periods, commas, colons).
- Communication mode active in this session: terse ("caveman") replies.
- Don't render for an ambiguous lead; ask first.

## 7. CURRENT STATUS
- GalaxEye video rendered and delivered: `renders/rekroots-galaxeye-2roles-30s.mp4`.
- Awaiting user review. No feedback received yet on the GalaxEye video.
- Memory file `screen-demo-format.md` does not yet mention GalaxEye or the `stats/recent/others`
  props.

## 8. OPEN ITEMS & NEXT STEPS
1. **JD text is a Claude draft**, based on GalaxEye's SAR + EO satellite work, not their careers
   page. User to paste real JDs if wanted, then re-render.
2. **"Total applicants 64"** is a template placeholder. User to give a number, or blank it.
3. **Both new roles set to Onsite, Bengaluru**: a guess. User to confirm.
4. **Dates** (existing roles 10/12/2026, new roles 10/14/2026) and dashboard stats (6 active, 2
   drafts) are Claude's placeholders. Confirm or change.
5. **Choice of which 2 roles to feature** was Claude's; user may want different ones.
6. **C: drive at 0 GB free**: user should free space; other tools may fail.
7. Unknown from visible context: exact original GalaxEye request wording and where the 8-role
   list came from; whether more leads are queued.
8. Next lead workflow: copy `props/rekroots-galaxeye-2roles-30s.json` → edit `intro.tag/sub`,
   `app.company`, `app.jobs`, optional `stats/recent/others` → stills check → full render → deliver
   with flagged assumptions.
