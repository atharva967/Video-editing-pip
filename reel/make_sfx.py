# Synthesize the reel's sound effects (48 kHz mono WAV) into public/reel/sfx.
import numpy as np, soundfile as sf
SR = 48000
t = lambda d: np.arange(int(SR * d)) / SR
def env(x, a=0.005, r=0.2):
    n = len(x); e = np.ones(n); ai = int(SR * a); e[:ai] = np.linspace(0, 1, ai)
    e *= np.exp(-np.arange(n) / (SR * r)); return x * e
def save(name, x, peak=0.8): sf.write(f"public/reel/sfx/{name}.wav", (x / np.abs(x).max() * peak).astype(np.float32), SR)
# notification: two bright tones
d1, d2 = t(0.14), t(0.32)
ding = np.concatenate([env(np.sin(2*np.pi*1320*d1) + 0.3*np.sin(2*np.pi*2640*d1), r=0.08), env(np.sin(2*np.pi*1760*d2) + 0.3*np.sin(2*np.pi*3520*d2), r=0.12)])
save("ding", ding, 0.6)
# whoosh: noise through a moving band, swelling in and out
rng = np.random.default_rng(1); n = rng.standard_normal(int(SR*0.45)); tt = t(0.45)
spec = np.fft.rfft(n); f = np.fft.rfftfreq(len(n), 1/SR)
w = np.fft.irfft(spec * np.exp(-((f-2500)/1800)**2), len(n)) * np.sin(np.pi*tt/0.45)**2
save("whoosh", w, 0.5)
# impact: low sine drop + noise burst
d = t(0.6); boom = np.sin(2*np.pi*(90*d - 40*d**2)) * np.exp(-d/0.18) + 0.25*rng.standard_normal(len(d))*np.exp(-d/0.03)
save("impact", boom, 0.85)
# pop: short pitched blip
d = t(0.09); save("pop", env(np.sin(2*np.pi*(700 + 900*d/0.09)*d), r=0.03), 0.5)
# typing: soft clicks
clicks = np.zeros(int(SR*0.9))
for i in range(9):
    s = int(SR*(0.03 + i*0.095 + rng.uniform(0, 0.02))); b = rng.standard_normal(500)*np.exp(-np.arange(500)/60); clicks[s:s+500] += b
save("typing", clicks, 0.3)
