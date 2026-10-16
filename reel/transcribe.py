# Transcribe 16 kHz mono WAVs with word timings (sherpa-onnx Parakeet). Usage: transcribe.py MODEL_DIR wav...
import sys, json, soundfile as sf, sherpa_onnx
d = sys.argv[1]
r = sherpa_onnx.OfflineRecognizer.from_transducer(encoder=f"{d}/encoder.int8.onnx", decoder=f"{d}/decoder.int8.onnx",
    joiner=f"{d}/joiner.int8.onnx", tokens=f"{d}/tokens.txt", model_type="nemo_transducer")
out = {}
for w in sys.argv[2:]:
    a, sr = sf.read(w, dtype="float32")
    s = r.create_stream(); s.accept_waveform(sr, a); r.decode_stream(s)
    res = s.result
    # merge sub-word tokens into words (a token starting with a space begins a new word)
    words = []
    for tok, t in zip(res.tokens, res.timestamps):
        if tok.startswith(" ") or not words: words.append([tok.strip(), round(t, 2)])
        else: words[-1][0] += tok
    out[w] = {"text": res.text, "words": words}
    print(w, "\n ", res.text)
json.dump(out, open("reel/transcript.json", "w"), indent=1)
