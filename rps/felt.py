"""Generate a 1080x1350 felt-texture background in Buildify blue."""
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter as g
rng = np.random.default_rng(7)
W, H = 1080, 1350
n = lambda: rng.normal(0, 1, (H, W))
mid = g(n(), 2.2); mid /= mid.std()
low = g(n(), 70); low /= low.std()
fib = g((rng.random((H, W)) > 0.9975) * 6.0, 0.7)
base = np.array([46, 98, 222], float)
lum = 1 + 0.03 * n() + 0.045 * mid + 0.03 * low + 0.18 * fib
Image.fromarray(np.clip(base * lum[..., None], 0, 255).astype(np.uint8)).save("felt.png")
