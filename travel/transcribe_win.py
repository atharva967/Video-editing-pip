# Whisper (sherpa-onnx) over fixed windows. Usage: transcribe_win.py MODEL_DIR in.wav LANG WIN
import sys, soundfile as sf, sherpa_onnx
d, wav, lang, win = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
a, sr = sf.read(wav, dtype="float32")
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/small-encoder.onnx", decoder=f"{d}/small-decoder.onnx", tokens=f"{d}/small-tokens.txt", language=lang, task=sys.argv[5] if len(sys.argv) > 5 else "transcribe", tail_paddings=2000)
t = 0.0
while t < len(a) / sr:
    seg = a[int(t * sr): int((t + win) * sr)]
    s = rec.create_stream(); s.accept_waveform(sr, seg); rec.decode_stream(s)
    print(f"{t:5.1f}-{t+win:5.1f} {s.result.text.strip()}")
    t += win
