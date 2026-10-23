# Build props/buildify-walkthrough.json: auto camera + chapters + subtitles (from the SRT, split
# into sentence-sized pieces with time shared by character count).
import json, re
cam = json.load(open("buildify/autocam.json"))
def ts(s):
    h, m, rest = s.split(":"); sec, ms = rest.split(","); return int(h) * 3600 + int(m) * 60 + int(sec) + int(ms) / 1000
subs = []
for block in open("buildify/src/buildify-demo.srt", encoding="utf-8").read().strip().split("\n\n"):
    lines = block.strip().split("\n"); a, b = [ts(x.strip()) for x in lines[1].split("-->")]; text = " ".join(lines[2:])
    parts = [p.strip() for p in re.split(r"(?<=[.?!:])\s+", text) if p.strip()]
    pieces = []
    for p in parts:  # split long sentences at commas
        if len(p) > 80:
            chunks, cur = [], ""
            for w in re.split(r"(?<=,)\s+", p):
                if cur and len(cur) + len(w) > 70: chunks.append(cur); cur = w
                else: cur = (cur + " " + w).strip()
            chunks.append(cur); pieces += chunks
        else: pieces.append(p)
    total = sum(len(p) for p in pieces); t = a
    for p in pieces:
        d = (b - a) * len(p) / total; subs.append({"t": round(t, 2), "until": round(t + d, 2), "text": p}); t += d
chapters = [
    [7.3, 23.6, "Find your way around"],
    [23.6, 38.0, "Builder: describe your app"],
    [38.0, 62.8, "Build and live preview"],
    [62.8, 81.6, "Refine by chatting"],
    [81.6, 89.6, "Export your code"],
    [89.6, 100.9, "Studio: pick a template"],
    [100.9, 112.2, "Drag in elements"],
    [112.2, 120.8, "Edit text and style"],
    [120.8, 137.5, "Preview and publish"],
    [137.5, 159.6, "AI Chat"],
    [159.6, 185.8, "Accessibility Tester"],
    [185.8, 199.8, "AI agents"],
]
props = dict(src="buildify/demo.mp4", duration=207.9, intro=[0, 7.0], outro=[199.6, 207.9], W=cam["W"], H=cam["H"], cam=cam["keys"],
             chapters=[dict(t=a, until=b, n=i + 1, title=c) for i, (a, b, c) in enumerate(chapters)], subs=subs)
json.dump(props, open("props/buildify-walkthrough.json", "w"), indent=1)
print(len(subs), "subtitle pieces;", len(chapters), "chapters")
