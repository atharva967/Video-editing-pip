# Build props/client-said-what-ep1.json: cut list (source seconds) -> output timeline,
# captions from the word timings in reel/transcript.json, overlays placed on spoken words.
import json
tr = json.load(open("reel/transcript.json"))
WORDS = {"clipA": tr["out/reel/clipA.wav"]["words"], "clipB": tr["out/reel/clipB.wav"]["words"]}
FIX = {"cli": "client", "technotypes.": "TechnoTribes.", "What?": "what?!"}
FIX_AT = {("clipA", 13.6): "at"}  # heard as "as"

# clip, from, to, base zoom, punch-ins [(source second, zoom)]
CUTS = [
    ("clipB", 1.20, 5.10, 1.00, []),                      # a client asked us ... whole business?
    ("clipB", 5.40, 9.20, 1.10, [(8.20, 1.28)]),           # so we replied yes, but AI also wants the weekend off
    ("clipA", 0.00, 2.72, 1.00, [(1.44, 1.10)]),           # honestly, the client was not wrong about their problems
    ("clipA", 2.80, 6.90, 1.14, [(4.08, 1.24)]),           # same ten questions daily ...
    ("clipA", 7.22, 9.55, 1.00, []),                       # so we automated those ten questions
    ("clipA", 9.55, 11.00, 1.30, []),                      # and the client said what?!
    ("clipA", 11.62, 15.00, 1.06, [(12.96, 1.14)]),        # got a request like this? reach out ...
]
segs, at = [], 0.0
for clip, a, b, z, punch in CUTS:
    segs.append(dict(clip=clip, **{"from": a}, to=b, zoom=z, at=round(at, 3), punch=[[round(at + s - a, 3), k] for s, k in punch]))
    at += b - a
def out(clip, s):  # source second -> output second (first cut containing it)
    for g in segs:
        if g["clip"] == clip and g["from"] <= s < g["to"]: return round(g["at"] + s - g["from"], 3)
    raise ValueError((clip, s))

words = []
for g in segs:
    src = WORDS[g["clip"]]
    for i, (w, t) in enumerate(src):
        if g["from"] <= t < g["to"]:
            end = src[i + 1][1] if i + 1 < len(src) else t + 0.5
            words.append(dict(w=FIX_AT.get((g["clip"], t), FIX.get(w, w)), t=out(g["clip"], t), end=round(g["at"] + min(end, g["to"]) - g["from"], 3)))
end_of = lambda i: round(segs[i]["at"] + segs[i]["to"] - segs[i]["from"], 3)

props = dict(
    fps=30, segs=segs, words=words,
    badge="CLIENT SAID WHAT?! · EP. 1",
    chat=dict(t=out("clipB", 1.44), until=end_of(0), name="Client",
              text="Can you build an AI that runs my whole business? I want zero staff."),
    sticker=dict(t=out("clipB", 8.24), until=end_of(1), text="ZERO STAFF 💀"),
    chips=dict(t=out("clipA", 2.88), until=end_of(3), items=[
        dict(t=out("clipA", 2.88), text="3 PEOPLE"), dict(t=out("clipA", 3.92), text="HALF A DAY"), dict(t=out("clipA", 4.64), text="SAME 10 QUESTIONS")]),
    bot=dict(t=segs[4]["at"], until=end_of(4), question="Do you deliver on Sundays?",
             answer="Yes! Sunday deliveries run 10am to 6pm. Want me to book a slot?",
             footer=["KEPT THE TEAM ✅", "GOT THE AFTERNOONS BACK ☀️"]),
    slam=dict(t=out("clipA", 9.84), until=end_of(5), text="CLIENT SAID WHAT?!"),
    cta=dict(t=out("clipA", 11.68), until=end_of(6), text="Send it to us", brand="TechnoTribes"),
    hideCaptions=[[out("clipA", 9.84), end_of(5)]],
    end=dict(sec=2.0, title="CLIENT SAID WHAT?!", ep="EP. 1", line="Got a request like this? | Send it to us 📩", brand="TechnoTribes"),
    sfx=[
        dict(t=out("clipB", 1.44) + 0.55, src="ding", vol=0.7),
        dict(t=out("clipB", 1.44), src="typing", vol=0.5),
        dict(t=segs[1]["at"] - 0.12, src="whoosh", vol=0.5),
        dict(t=out("clipB", 8.24), src="impact", vol=0.55),
        dict(t=out("clipA", 2.88), src="pop", vol=0.6), dict(t=out("clipA", 3.92), src="pop", vol=0.6), dict(t=out("clipA", 4.64), src="pop", vol=0.6),
        dict(t=segs[4]["at"] - 0.12, src="whoosh", vol=0.5),
        dict(t=segs[4]["at"] + 0.75, src="typing", vol=0.4),
        dict(t=out("clipA", 9.84) - 0.1, src="impact", vol=0.7),
        dict(t=out("clipA", 11.68), src="pop", vol=0.6),
        dict(t=end_of(6), src="whoosh", vol=0.5), dict(t=end_of(6) + 0.1, src="impact", vol=0.5),
    ],
    musicSrc=None, musicVolume=0,  # music is mixed in afterwards by reel/mix.sh (ducked under the voice)
)
json.dump(props, open("props/client-said-what-ep1.json", "w"), indent=1, ensure_ascii=False)
print("speech s:", end_of(6), "total s:", end_of(6) + props["end"]["sec"])
print(" ".join(f'{w["w"]}@{w["t"]}' for w in words))
