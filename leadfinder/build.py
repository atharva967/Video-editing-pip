# Build props/leadfinder-demo.json from leadfinder/script.py + voiceover lengths.
import json, re, subprocess, sys
sys.path.insert(0, "leadfinder")
import importlib, os
MOD = os.environ.get("LF_SCRIPT", "script"); VODIR = os.environ.get("LF_VODIR", "leadfinder/vo"); OUT = os.environ.get("LF_OUT", "props/leadfinder-demo.json")
CHAPTERS = importlib.import_module(MOD).CHAPTERS
GAP, LEAD_IN = float(os.environ.get("LF_GAP", "1.0")), 1.5
VO_DELAY = 0.15
dur = lambda k: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"public/{VODIR}/{k}.wav"], capture_output=True, text=True).stdout)
SIZES = {"ss-overview": [1887, 967], "ss-overview2": [1877, 965], "ss-leads": [1582, 956], "ss-leads2": [1585, 970], "ss-runs": [1576, 957]}
t = 0.0; lines, shots, chapters, subs = [], [], [], []
for cid, title, ls in CHAPTERS:
    if title:
        chapters.append(dict(id=cid, title=title, t=round(t, 3), n=len([c for c in chapters if c["title"]]) + 1)); t += LEAD_IN
    elif chapters:  # untitled section after the chapters (wrap-up): marks where the last chapter ends
        chapters.append(dict(id=cid, title=None, t=round(t, 3), n=0))
    for i, (text, sh) in enumerate(ls):
        key = f"{cid}{i + 1}"; vo = dur(key)
        extra = 1.2 if (cid == "intro" and i == 0) else 2.5 if (cid == "wrap" and i == len(ls) - 1) else 0
        d = vo + GAP + extra
        lines.append(dict(key=key, t=round(t + VO_DELAY, 3)))
        # subtitles: sentences, time shared by length
        parts = [p for p in re.split(r"(?<=[.?!:])\s+", text) if p]
        tot = sum(len(p) for p in parts); u = t + VO_DELAY
        for p in parts:
            pd = vo * len(p) / tot; subs.append(dict(t=round(u, 3), until=round(u + pd + 0.25, 3), text=p)); u += pd
        # shots
        ws = [s.get("w", 1.0) for s in sh]; W = sum(ws); u = t
        if title and i == 0: u -= LEAD_IN; d_first_extra = LEAD_IN
        else: d_first_extra = 0
        for j, s in enumerate(sh):
            sd = d * ws[j] / W + (d_first_extra if j == 0 else 0)
            o = dict(t=round(u, 3), dur=round(sd, 3), cam=s.get("cam"), spots=s.get("spots", []))
            if "v" in s:
                a, b = s["v"]; o.update(kind="video", a=a, b=b, rate=round(max(0.5, (b - a) / sd), 3))
            elif "img" in s:
                o.update(kind="image", src=f"leadfinder/{s['img']}.png", size=SIZES[s["img"]])
            else:
                o.update(kind="card", card=s["card"])
            shots.append(o); u += sd
        t += d
props = dict(src="leadfinder/recording.mp4", voDir=VODIR, duration=round(t + 0.5, 2), lines=lines, shots=shots, chapters=chapters, subs=subs)
json.dump(props, open(OUT, "w"), indent=1)
print(f"{props['duration']:.1f} s = {props['duration']/60:.2f} min; {len(shots)} shots; {len(chapters)} chapters")
