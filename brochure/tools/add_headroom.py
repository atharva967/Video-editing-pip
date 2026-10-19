# Add headroom above a portrait whose head touches the top edge: pad the top with the
# wall colour and inpaint the band so it blends. Usage: add_headroom.py in.jpg out.jpg FRACTION
import sys, cv2, numpy as np
src, dst, frac = sys.argv[1], sys.argv[2], float(sys.argv[3])
im = cv2.imread(src); h, w = im.shape[:2]; pad = int(round(h * frac))
wall = np.median(np.concatenate([im[:12, :w // 5].reshape(-1, 3), im[:12, -w // 5:].reshape(-1, 3)]), axis=0)
out = np.vstack([np.tile(wall.astype(np.uint8), (pad, w, 1)), im])
mask = np.zeros(out.shape[:2], np.uint8); mask[: pad + 2] = 255
out = cv2.inpaint(out, mask, 9, cv2.INPAINT_TELEA)
# keep the far band flat wall colour (inpaint only shapes the seam), with a soft blend
blend = np.clip((np.arange(pad + 2)[:, None, None] - (pad - 14)) / 16.0, 0, 1)
out[: pad + 2] = (out[: pad + 2] * blend + wall * (1 - blend)).astype(np.uint8)
cv2.imwrite(dst, out, [cv2.IMWRITE_JPEG_QUALITY, 95])
print(dst, out.shape[1], "x", out.shape[0])
