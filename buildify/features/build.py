# Build props/buildify-features/<id>.json for each single-feature video (BuildifyShort layout).
import json, subprocess
PAD = 1.2
dur = lambda k: float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f"public/buildify/features/{k}.wav"], capture_output=True, text=True).stdout)
for v in json.load(open("buildify/features/script.json")):
    plan = [("intro", None, v["intro"], [])] + [(f"s{i+1}", t, txt, r) for i, (t, txt, r) in enumerate(v["steps"])] + [("outro", None, v["outro"], [])]
    segs, t, n = [], 0.0, 0
    for key, title, text, parts in plan:
        k = f"{v['id']}-{key}"; d = round(dur(k) + PAD + (0.4 if key == "intro" else 0.6 if key == "outro" else 0), 2)
        total = sum(b - a for a, b in parts); u = t; subs = []
        for a, b in parts:
            dd = d * (b - a) / total; subs.append(dict(at=round(u, 3), dur=round(dd, 3), a=a, rate=round(max(0.55, (b - a) / dd), 3))); u += dd
        if title: n += 1
        segs.append(dict(key=k, t=round(t, 3), dur=d, n=n if title else None, title=title, rect=[0, 0, 1920] if parts else None, subs=subs, text=text.replace("buildify dot s h", "buildify.sh")))
        t += d
    props = dict(src="buildify/demo.mp4", voDir="buildify/features", duration=round(t, 2), segs=segs, kicker=v["kicker"], introTitle=v["title"], introSub=v["sub"],
                 chips=[s[0] for s in v["steps"]], outroTitle=v["next"] if v["next"] != "Try it free" else "Build. Test. Launch.", outroSub="Buildify · all with AI", cta="Try it free at buildify.sh →")
    json.dump(props, open(f"props/buildify-features/{v['id']}.json", "w"), indent=1)
    print(v["id"], props["duration"], "s;", "rates", [x["rate"] for s in segs for x in s["subs"]])
