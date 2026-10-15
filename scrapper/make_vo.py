# Generate one voiceover WAV per scene with Kokoro (ONNX). Usage: python make_vo.py MODEL_DIR VOICE
import json, sys, soundfile as sf
from kokoro_onnx import Kokoro
d, voice = sys.argv[1], sys.argv[2]
k = Kokoro(f"{d}/kokoro-v1.0.onnx", f"{d}/voices-v1.0.bin")
out = {}
for key, text in json.load(open("scrapper/vo-script.json")):
    audio, sr = k.create(text, voice=voice, speed=1.0, lang="en-us")
    sf.write(f"public/scrapper/vo/{key}.wav", audio, sr)
    out[key] = round(len(audio) / sr, 2)
    print(key, out[key])
json.dump(out, open("scrapper/vo-durations.json", "w"), indent=1)
