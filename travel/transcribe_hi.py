# Speech segments (Silero VAD) + Whisper small (Hindi) per segment, via sherpa-onnx.
# Usage: transcribe_hi.py MODEL_DIR VAD_ONNX in.wav out.json
import sys, json, soundfile as sf, sherpa_onnx
d, vadp, wav, out = sys.argv[1:5]
a, sr = sf.read(wav, dtype="float32")
cfg = sherpa_onnx.VadModelConfig(); cfg.silero_vad.model = vadp; cfg.silero_vad.min_silence_duration = 0.25; cfg.silero_vad.min_speech_duration = 0.2; cfg.sample_rate = sr
vad = sherpa_onnx.VoiceActivityDetector(cfg, buffer_size_in_seconds=120)
rec = sherpa_onnx.OfflineRecognizer.from_whisper(encoder=f"{d}/small-encoder.int8.onnx", decoder=f"{d}/small-decoder.int8.onnx", tokens=f"{d}/small-tokens.txt", language="hi", task="transcribe")
segs = []
win = cfg.silero_vad.window_size
for i in range(0, len(a), win):
    vad.accept_waveform(a[i:i + win])
    while not vad.empty():
        s = vad.front; st = s.start / sr; samples = s.samples
        stream = rec.create_stream(); stream.accept_waveform(sr, samples); rec.decode_stream(stream)
        segs.append({"start": round(st, 2), "end": round(st + len(samples) / sr, 2), "text": stream.result.text.strip()})
        print(f'{st:6.2f}-{st + len(samples)/sr:6.2f}  {stream.result.text.strip()}')
        vad.pop()
vad.flush()
while not vad.empty():
    s = vad.front; st = s.start / sr; stream = rec.create_stream(); stream.accept_waveform(sr, s.samples); rec.decode_stream(stream)
    segs.append({"start": round(st, 2), "end": round(st + len(s.samples) / sr, 2), "text": stream.result.text.strip()}); print(st, stream.result.text); vad.pop()
json.dump(segs, open(out, "w"), ensure_ascii=False, indent=1)
