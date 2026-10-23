# Auto camera for a screen recording: find where the picture changes over time and emit eased
# zoom keyframes [t, x, y, w] (source px, 16:9) that follow small areas of action and pull back
# to the full frame for page-level changes. Usage: autocam.py in.mp4 out.json [fps]
import sys, json, cv2, numpy as np
src, out = sys.argv[1], sys.argv[2]
FPS = float(sys.argv[3]) if len(sys.argv) > 3 else 5
cap = cv2.VideoCapture(src); W = int(cap.get(3)); H = int(cap.get(4)); vfps = cap.get(5)
step = max(1, round(vfps / FPS)); S = 4  # analyse at 1/4 scale
prev, boxes, i = None, [], 0
while True:
    ok, f = cap.read()
    if not ok: break
    if i % step == 0:
        g = cv2.GaussianBlur(cv2.cvtColor(cv2.resize(f, (W // S, H // S)), cv2.COLOR_BGR2GRAY), (3, 3), 0)
        if prev is not None:
            d = cv2.threshold(cv2.absdiff(g, prev), 18, 255, cv2.THRESH_BINARY)[1]
            d = cv2.dilate(d, np.ones((5, 5), np.uint8))
            pts = cv2.findNonZero(d)
            if pts is None: boxes.append((i / vfps, None, 0.0))
            else:
                x, y, w, h = cv2.boundingRect(pts); frac = float((d > 0).mean())
                boxes.append((i / vfps, (x * S, y * S, w * S, h * S), frac))
        prev = g
    i += 1
MINW, MARGIN, HOLD = 1000, 150, 2.6
def rect_for(b):
    x, y, w, h = b
    w2 = max(MINW, w + 2 * MARGIN, (h + 2 * MARGIN) * 16 / 9); w2 = min(W, w2); h2 = w2 * 9 / 16
    cx, cy = x + w / 2, y + h / 2
    return [round(min(max(cx - w2 / 2, 0), W - w2)), round(min(max(cy - h2 / 2, 0), H - h2)), round(w2)]
full = [0, 0, W]
keys, cur, last_change = [[0.0, *full]], full, 0.0
win = []
for t, b, frac in boxes:
    win = [(tt, bb, ff) for tt, bb, ff in win if t - tt < 1.0] + [(t, b, frac)]
    act = [(bb, ff) for tt, bb, ff in win if bb is not None]
    if not act: continue
    big = max(ff for _, ff in act) > 0.12
    xs = [bb[0] for bb, _ in act]; ys = [bb[1] for bb, _ in act]
    xe = [bb[0] + bb[2] for bb, _ in act]; ye = [bb[1] + bb[3] for bb, _ in act]
    target = full if big else rect_for((min(xs), min(ys), max(xe) - min(xs), max(ye) - min(ys)))
    if target[2] > W * 0.82: target = full
    cx0, cy0, cw = cur; inside = target[0] >= cx0 and target[1] >= cy0 and target[0] + target[2] <= cx0 + cw and target[1] + target[2] * 9 / 16 <= cy0 + cw * 9 / 16
    if target == cur or (inside and target != full and cur != full and target[2] > cw * 0.6): continue
    if t - last_change < HOLD: continue
    keys.append([round(t - 0.3, 2), *target]); cur = target; last_change = t
json.dump({"W": W, "H": H, "keys": keys}, open(out, "w"))
print(len(keys), "keyframes;", sum(1 for k in keys if k[3] < W), "zoomed")
# drop zoom-ins that return to full view within 2 s (they read as jitter)
k2 = [keys[0]]
for j in range(1, len(keys)):
    k = keys[j]; nxt = keys[j + 1] if j + 1 < len(keys) else None
    if k[3] < W and nxt and nxt[3] == W and nxt[0] - k[0] < 2.0: continue
    if k[1:] == k2[-1][1:]: continue
    k2.append(k)
json.dump({"W": W, "H": H, "keys": k2}, open(out, "w"))
print(len(k2), "keyframes after cleanup")
