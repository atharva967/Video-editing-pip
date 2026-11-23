# #BuildWithManjot reels: Google Flow pipeline

Reels for Manjot Singh's Instagram (AI Builder), in the style of his own reels:
- `instagram.com/reel/Df80dZKITLl` (client red flags)
- `instagram.com/reel/Df_fyu0M2I2` (Lovey Aunty cartoon skit)

That style: a relatable hook in line 1, a short founder story, one Hinglish punchline, a question
to the audience, a "Comment X and I'll send you…" CTA, #BuildWithManjot.

## Who does what

| Step | Where | What |
|---|---|---|
| 1. Trending topics | this repo (done below) | topics + 3 reel scripts |
| 2. Generate clips | **local Claude session with Chrome** (Claude in Chrome, logged in to Google Flow) | paste each scene prompt into Flow, generate, download |
| 3. Hand back | Google Drive folder `flow-clips/<reel-id>/` or upload to the cloud session | MP4s named `<reel-id>-s<scene>.mp4` |
| 4. Edit | cloud session (Remotion) | Manjot's real face clips + Flow B-roll, captions, music, CTA end card |

**Consent first:** use Manjot's face only with his OK, and only as he approves. Prefer his *real*
talking-head clips for every line he speaks; use Flow for B-roll (scenes, skits, objects). If a scene
needs an AI version of him, give Flow his reference photo as an ingredient and label the reel
"AI-generated scenes" in the caption.

## Step 2 brief (paste into the local Claude session)

> Open Google Flow (labs.google/flow) in my Chrome. Create a project per reel below (`bwm-01`,
> `bwm-02`, `bwm-03`). For each scene: new clip, aspect 9:16, 8 s, highest quality model available,
> paste the scene prompt exactly. Generate 2 takes per scene; keep the better one (no warped hands,
> no garbled text, consistent character). Download each kept clip as MP4 at the highest resolution
> offered, named `<reel>-s<scene>.mp4`, into Drive folder `flow-clips/<reel>/`. Do not post anything.
> Before spending credits on more than the scenes listed, ask me. When done, list what you
> downloaded and any scene that failed.

## Trending topics (week of 23 Nov 2026)

1. **AI agents that do real work, "AI coworkers"**: agents executing tasks, not just chatting.
2. **Instant app builders**: idea to working app in minutes (Buildify's lane).
3. **Enterprise agent platforms / companies rushing to build agents**: one report says 53% plan to
   build an automation or agent within 90 days, while 9% use an automation platform today
   (Lead with AI, AI Transformation Pulse Q3 2026). Check the source before quoting it on screen.

---

## Reel bwm-01: "Client wanted an AI employee" (topic 1)

**Hook (Manjot, real clip):** "Client bola: mujhe ek AI employee chahiye. Salary nahi, chai nahi, leave nahi."

| Scene | Flow prompt (9:16, 8 s) |
|---|---|
| s1 | Cinematic office in Indian startup, warm evening light. A sleek humanoid robot in a crisp white shirt and ID badge sits at a desk with a laptop, typing fast. Coworkers glance over, amused. Handheld camera, shallow depth of field, realistic. |
| s2 | Same office. The robot at the desk is handed a steaming cup of masala chai by a colleague; it pauses, tilts its head, politely pushes the cup away and keeps typing. Comedic timing, realistic, 35mm film look. |
| s3 | Close-up of a laptop screen showing a clean dashboard where tasks tick from "pending" to "done" one after another in green; soft office background blur. No readable brand names. |
| s4 | Wide shot: the office empties at night, lights off one by one, only the robot's desk lamp still on, robot still working. Moody blue tones, slow push-in. |

**Lines (Manjot, real clips):** "Sach bataun? AI employee nahi hota. AI *workflow* hota hai. Ek kaam, poora automate." → "Us client ke liye humne support ke 10 sawaal automate kiye. Team wahi, kaam aadha."
**Question:** "Tumhare office mein kaunsa kaam roz repeat hota hai?"
**CTA:** "Comment WORKFLOW and I'll send you the checklist we use to pick what to automate."
**Caption tags:** #BuildWithManjot #AIAgents #AIAutomation #FounderLife #AgencyLife

## Reel bwm-02: "App ready before the chai" (topic 2, Buildify)

**Hook (Manjot, real clip):** "Chai banne mein 4 minute lagte hain. Maine utne mein ek app bana diya."

| Scene | Flow prompt (9:16, 8 s) |
|---|---|
| s1 | Macro shot of masala chai boiling in a steel pan on a gas stove, milk rising, cardamom and ginger, steam swirling, warm kitchen light. Slow motion. |
| s2 | Over-the-shoulder shot of a young Indian founder at a laptop at night, screen glow on face, typing quickly; the screen shows abstract app wireframes assembling themselves. No readable text. |
| s3 | Chai being poured from height into a glass cup in slow motion, steam rising, kitchen window light. |
| s4 | A phone on a wooden table lights up; a colourful habit-tracker app scrolls by itself on screen; a hand picks up the phone and the cup of chai next to it. Realistic, shallow depth of field. |

**Middle (screen recording, not Flow):** real Buildify footage: prompt → plan → live preview (from the Buildify recordings).
**Lines:** "Prompt likha, plan approve kiya, app live. Ye hai Buildify." → "Coding seekhna band mat karo. Bas ab shuruaat yahin se karo."
**Question:** "Agar 10 minute mein app ban sakta, tum kya banate?"
**CTA:** "Comment BUILD and I'll send you the prompt I used."
**Caption tags:** #BuildWithManjot #Buildify #AIAppBuilder #NoCode #BuildInPublic

## Reel bwm-03: "53% want AI agents. Most will fail." (topic 3)

**Hook (Manjot, real clip):** "Har company ko 90 din mein AI agent chahiye. Zyada tar fail honge. Kyun?"

| Scene | Flow prompt (9:16, 8 s) |
|---|---|
| s1 | Boardroom in a glass office tower, executives around a table nodding at a big screen with an abstract glowing AI orb; confident mood; cinematic, cool tones. |
| s2 | Same team weeks later: messy whiteboard full of crossed-out sticky notes, tired faces, cold coffee cups, a stalled progress bar on a screen. Realistic, muted colours. |
| s3 | Top-down shot of a hand drawing one simple flowchart with three boxes and arrows on a clean whiteboard, marker squeaking. Bright, clean light. |
| s4 | The team from s2 now relaxed, watching a screen where a single workflow runs smoothly with green checkmarks; one person high-fives another. Warm light. |

**Lines:** "Wo AI se shuru karte hain. Shuru karna chahiye ek workflow se." → "Ek kaam chuno, 30 din mein pilot, phir scale. Bas."
**Question:** "Tumhari company ne AI try kiya? Chala ya ruk gaya?"
**CTA:** "Comment PILOT and I'll send you our 30-day pilot plan."
**On-screen stat (if verified):** "53% plan to build an AI agent in 90 days · Lead with AI, Q3 2026"
**Caption tags:** #BuildWithManjot #EnterpriseAI #AIAgents #TechnoTribes #FounderLife

---

## Step 4: what the edit adds

- Manjot's real lines as the A-roll (face in front), Flow clips as B-roll behind and between.
- Word-by-word captions, punch-in zooms, sound effects, quiet background music ducked under his voice.
- End card: "#BuildWithManjot" + the comment keyword.
- 1080x1920, 25–40 s, -14 LUFS.

Needed from you for step 4: Manjot's talking-head clips for each reel's lines (phone, vertical, quiet room).
