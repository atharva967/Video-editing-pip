# Build props/buildify-reels/p1..p4.json from buildify/reels/script.json + voiceover lengths.
# Each line: footage ranges from the narrated rough cut (sped/slowed to fit the line) and a focus
# x (source px) for a 1:1 crop; null = show the whole screen.
import json, subprocess, os
sc = json.load(open("buildify/reels/script.json")); PAD = 0.7
os.makedirs("props/buildify-reels", exist_ok=True)
dur = lambda k: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"public/buildify/reels/{k}.wav"], capture_output=True, text=True).stdout)
for i, (part, d) in enumerate(sc.items()):
    t, lines = 0.3, []
    for key, text, ranges, fx in d["lines"]:
        ln = round(dur(part + key) + PAD, 2); total = sum(b - a for a, b in ranges); u = t; subs = []
        for a, b in ranges:
            dd = ln * (b - a) / total; subs.append(dict(at=round(u, 3), dur=round(dd, 3), a=a, rate=round(max(0.5, (b - a) / dd), 3))); u += dd
        lines.append(dict(key=part + key, t=round(t, 3), dur=ln, text=text.replace("buildify dot s h", "buildify.sh"), fx=fx, subs=subs)); t += ln
    props = dict(src="buildify/demo.mp4", part=i + 1, parts=len(sc), title=d["title"], duration=round(t + 0.4, 2), lines=lines)
    json.dump(props, open(f"props/buildify-reels/{part}.json", "w"), indent=1)
    print(part, props["duration"], "s")
