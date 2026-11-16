# Build props/seatview-reel.json: cut list over the 4 presenter clips -> output timeline,
# captions from word timings (with fixes), background scenes per segment.
import json
tr = {k.split("/")[-1][:-4]: v["words"] for k, v in json.load(open("bfdemo/transcript.json")).items()}
FIX = {"ideal": "idea", "Spider-Man": "Spider-Man"}
# clip, from, to, scene
CUTS = [
    ("20261114_013857", 0.00, 5.75, "hook"),
    ("20261114_014012", 0.00, 3.75, "boxes"),
    ("20261114_020018", 0.00, 3.45, "buildify"),
    ("20261114_020018", 4.00, 8.20, "buildify"),
    ("20261114_020309", 0.05, 2.90, "seats"),
    ("20261114_020309", 3.30, 4.20, "seats"),
    ("20261114_020309", 5.15, 6.42, "seats"),
    ("20261114_020309", 7.00, 10.28, "seats"),
    ("20261114_020309", 11.95, 12.60, "end"),
]
segs, at = [], 0.0
for c, a, b, sc in CUTS:
    segs.append(dict(clip=c, **{"from": a}, to=b, at=round(at, 3), scene=sc)); at += b - a
words = []
for g in segs:
    src = tr[g["clip"]]
    for i, (w, t) in enumerate(src):
        if g["from"] <= t < g["to"] - 0.05:
            end = src[i + 1][1] if i + 1 < len(src) else t + 0.5
            words.append(dict(w=FIX.get(w, w), t=round(g["at"] + t - g["from"], 3), end=round(g["at"] + min(end, g["to"]) - g["from"], 3)))
scene_t = {}
for g in segs: scene_t.setdefault(g["scene"], [g["at"], 0]); scene_t[g["scene"]][1] = round(g["at"] + g["to"] - g["from"], 3)
tail = 1.6
props = dict(fps=30, segs=segs, words=words, scenes=scene_t, duration=round(at + tail, 2), speechEnd=round(at, 3))
json.dump(props, open("props/seatview-reel.json", "w"), indent=1)
print(round(at, 2), "s speech +", tail, "tail;", scene_t)
print(" ".join(f'{w["w"]}@{w["t"]}' for w in words))
