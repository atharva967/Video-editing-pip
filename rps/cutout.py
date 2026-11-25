"""Cut the Wikimedia RPS hand photos (Media Viewer captures, checkerboard bg) into transparent PNGs.
Source: Rock-paper-scissors (rock|paper|scissors).png, photo by Fluff, modified by Sertion, CC BY-SA 3.0."""
import sys
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

def cut(src, dst):
    a = np.asarray(Image.open(src).convert("RGB")).astype(np.int16)
    h, w, _ = a.shape
    # image area = columns/rows that are not the viewer's black frame or the caption bar
    dark = a.max(2) < 30
    cols = np.where(dark[: h // 2].mean(0) < 0.5)[0]
    x0, x1 = cols.min(), cols.max() + 1
    rows = np.where((a[:, x0:x1].min(2) > 200).mean(1) > 0.02)[0]
    y1 = rows.max() + 1
    rgb = a[:y1, x0:x1]
    # caption bar is white too: stop at first fully-white row band near bottom with no skin
    mx, mn = rgb.max(2), rgb.min(2)
    bgc = (mn > 175) & ((mx - mn) < 14)            # light, grey: checkerboard
    lab, _ = ndimage.label(bgc)
    edge = np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))
    bg = np.isin(lab, edge[edge > 0])
    fg = ~bg
    fg = ndimage.binary_opening(fg, iterations=2)
    keep, n = ndimage.label(fg)
    if n > 1:
        sizes = ndimage.sum(fg, keep, range(1, n + 1))
        fg = keep == (1 + int(np.argmax(sizes)))
    fg = ndimage.binary_fill_holes(fg)
    fg = ndimage.binary_erosion(fg, iterations=2)
    alpha = Image.fromarray((fg * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6))
    im = Image.fromarray(rgb.astype(np.uint8)).convert("RGBA")
    im.putalpha(alpha)
    im = im.crop(im.getbbox())
    im.save(dst)
    print(dst, im.size)

for k in sys.argv[1:]:
    cut(f"hands/mv-{k}.png", f"hands/{k}.png")
