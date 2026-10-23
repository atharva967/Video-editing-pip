# Build props/buildify-short.json: per voiceover line, source ranges from the rough cut
# (jump-cut, sped up to fit the line) and a framing rect [x, y, w] (w >= 1600: never upscaled).
import json
vo = json.load(open("buildify/vo-short-durations.json"))
text = dict(json.load(open("buildify/vo-short.json")))
PAD = 1.95
plan = [  # key, chapter title, [(src_a, src_b), ...], rect
    ("intro", None, [], None),
    ("prompt", "Describe your app", [(23.5, 31.0)], [0, 0, 1920]),
    ("build", "Build & live preview", [(37.0, 45.0), (47.0, 56.0)], [0, 0, 1920]),
    ("refine", "Refine by chatting", [(63.5, 69.0), (76.0, 81.5)], [0, 0, 1920]),
    ("export", "Export your code", [(82.0, 88.0)], [0, 0, 1920]),
    ("studio", "Buildify Studio", [(91.0, 100.0), (101.0, 107.0), (113.0, 118.0)], [0, 0, 1920]),
    ("publish", "Preview & publish", [(121.5, 127.0), (129.0, 135.0)], [0, 0, 1920]),
    ("chat", "AI Chat", [(146.0, 157.0)], [0, 0, 1920]),
    ("access", "Accessibility Tester", [(159.5, 166.0), (171.0, 183.0)], [0, 0, 1920]),
    ("agents", "AI agents", [(185.0, 197.5)], [0, 0, 1920]),
    ("outro", None, [], None),
]
segs, t, n = [], 0.0, 0
for key, title, parts, rect in plan:
    dur = round(vo[key] + PAD + (0.4 if key == "intro" else 0), 2)
    total_src = sum(b - a for a, b in parts)
    subs, u = [], t
    for a, b in parts:
        d = dur * (b - a) / total_src
        subs.append(dict(at=round(u, 3), dur=round(d, 3), a=a, rate=round((b - a) / d, 3))); u += d
    if title: n += 1
    segs.append(dict(key=key, t=round(t, 3), dur=dur, n=n if title else None, title=title, rect=rect, subs=subs, text=text[key]))
    t += dur
json.dump(dict(src="buildify/demo.mp4", duration=round(t, 2), segs=segs), open("props/buildify-short.json", "w"), indent=1)
print("total", round(t, 2), "s;", [(s["key"], s["dur"], [x["rate"] for x in s["subs"]]) for s in segs])
