# Kokoro voiceover, one WAV per line. Usage: make_vo.py MODEL_DIR VOICE script.json out_dir durations.json
import json, sys, soundfile as sf
from kokoro_onnx import Kokoro
d, voice, script, outd, durs = sys.argv[1:6]
k = Kokoro(f"{d}/kokoro-v1.0.onnx", f"{d}/voices-v1.0.bin"); out = {}
for key, text in json.load(open(script)):
    a, sr = k.create(text, voice=voice, speed=float(__import__("os").environ.get("VO_SPEED", "1.0")), lang="en-us"); sf.write(f"{outd}/{key}.wav", a, sr); out[key] = round(len(a) / sr, 2); print(key, out[key])
json.dump(out, open(durs, "w"), indent=1)
