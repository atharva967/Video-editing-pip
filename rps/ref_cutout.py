"""MOCKUP ONLY: cut the reference post's hands (Bright Brain, not ours) off the red felt.
Removes the Instagram carousel arrow buttons by inpainting, keys out the red felt, outputs right-pointing hands."""
import sys
import cv2
import numpy as np

src16, src17, out = sys.argv[1], sys.argv[2], sys.argv[3]

def key(bgr):
    lab = cv2.cvtColor(cv2.GaussianBlur(bgr, (3, 3), 0), cv2.COLOR_BGR2LAB).astype(int)
    red = lab[..., 1] > 170                          # felt a* ~183, skin a* ~145-160
    fg = (~red).astype(np.uint8)
    fg = cv2.morphologyEx(fg, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(fg)
    fg = (lab == 1 + np.argmax(st[1:, cv2.CC_STAT_AREA])).astype(np.uint8)
    cnts, _ = cv2.findContours(fg, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    fg = cv2.drawContours(np.zeros_like(fg), cnts, -1, 1, -1)   # fill holes
    fg = cv2.erode(fg, np.ones((2, 2), np.uint8))
    return cv2.GaussianBlur(fg.astype(np.float32), (3, 3), 0.8)

def arrows(bgr):
    """mask of the white round carousel buttons"""
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)
    m = ((g > 225) & (bgr.std(2) < 10)).astype(np.uint8)
    n, lab, st, cen = cv2.connectedComponentsWithStats(m)
    out = np.zeros_like(m)
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if 18 < w < 45 and 18 < h < 45 and 0.7 < w / h < 1.4:
            cv2.circle(out, (int(cen[i][0]), int(cen[i][1])), int(max(w, h) * 0.62), 1, -1)
    return out

def save(bgr, alpha, path, flip, scale):
    rgba = np.dstack([bgr, (alpha * 255).astype(np.uint8)])
    if flip:
        rgba = rgba[:, ::-1]
    ys, xs = np.where(rgba[..., 3] > 20)
    rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    rgba = cv2.resize(rgba, None, fx=scale, fy=scale, interpolation=cv2.INTER_LANCZOS4)
    cv2.imwrite(path, rgba)
    print(path, rgba.shape[1::-1])

def fix(path, arrows, x0):
    b = cv2.imread(path, cv2.IMREAD_COLOR)
    m = np.zeros(b.shape[:2], np.uint8)
    for (x, y) in arrows:
        cv2.circle(m, (x, y), 19, 1, -1)
    b = cv2.inpaint(b, m, 7, cv2.INPAINT_TELEA)
    keep = b.max(2) >= 40
    return b[:, x0:]

a = fix(src16, [(40, 91), (583, 93)], 10)
a = a[:, : a.shape[1] - 12]                      # right-hand dark frame strip
W = a.shape[1]
l, r = a[:, : W // 2], a[:, W // 2:]
save(l, key(l), f"{out}/scissors.png", False, 2.0)
save(r, key(r), f"{out}/paper.png", True, 2.0)
b = fix(src17, [(50, 135)], 20)[60:, :]
save(b, key(b), f"{out}/rock.png", False, 2.0)
