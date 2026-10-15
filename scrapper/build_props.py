# Build props/lead-engine-demo.json from the scene plan + measured voiceover lengths.
import json
vo = json.load(open("scrapper/vo-durations.json"))
V = lambda r: [0, [0, 0, 1280]] if r is None else r
scenes = [
  dict(key="intro", kind="title"),
  dict(key="overview", kind="video", from_=0.3, to=2.6, rate=0.45, caption="One live dashboard for your whole pipeline",
       cam=[[0, [0, 0, 1280]], [1.2, [55, 190, 880], 1.4]]),
  dict(key="search", kind="video", from_=3.0, to=9.0, rate=0.8, caption="Describe your ideal lead in plain words",
       cam=[[0, [0, 0, 1280]], [0.6, [40, 150, 1000], 1.2]]),
  dict(key="credits", kind="image", src="scrapper/shot1.png", w=2000, h=1552, caption="Provider credits tracked automatically",
       cam=[[0, [0, 60, 1500]], [3.2, [0, 420, 2000], 1.6]]),
  dict(key="leads", kind="image", src="scrapper/shot3.png", w=2000, h=1230, caption="Qualified leads with verified decision makers",
       cam=[[0, [0, 0, 2000]], [1.6, [0, 170, 1300], 1.3], [4.4, [700, 170, 1300], 1.5]]),
  dict(key="detail", kind="image", src="scrapper/shot2.png", w=1933, h=2000, caption="Evidence, contact and company profile per lead",
       cam=[[0, [0, 0, 1933]], [1.4, [0, 330, 960], 1.3], [4.4, [950, 60, 960], 1.4], [7.2, [950, 780, 960], 1.3]]),
  dict(key="ai", kind="image", src="scrapper/shot2.png", w=1933, h=2000, caption="AI picks the best offer for each lead",
       cam=[[0, [950, 780, 960]], [0.1, [930, 1290, 960], 1.4]]),
  dict(key="review", kind="video", from_=21.6, to=24.2, rate=0.6, caption="Human review with a full audit trail",
       cam=[[0, [0, 0, 1280]], [0.5, [40, 155, 1000], 1.2]]),
  dict(key="outro", kind="outro"),
]
for s in scenes:
    s["vo"] = vo[s["key"]]
    if "from_" in s: s["from"] = s.pop("from_")
props = dict(
  fps=30, pad=0.55,
  video=dict(src="scrapper/recording.mp4", w=1280, h=720),
  title=dict(tag="AI Lead Intelligence Engine", title="From a one-line brief to qualified leads", steps=["Discover", "Verify", "Qualify", "Reach out"]),
  outro=dict(title="Less research. More conversations.", sub="AI Lead Intelligence Engine"),
  scenes=scenes,
  musicSrc="music/pumpupthemind-creative-technology-showreel-241274.mp3", musicVolume=0.09, musicStart=11,
)
json.dump(props, open("props/lead-engine-demo.json", "w"), indent=1)
print("total s:", round(sum(s["vo"] + props["pad"] for s in scenes), 2))
