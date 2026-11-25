"""Turn the hand cutouts into horizontal, right-pointing hands with a flat left edge (arm enters from the slide edge)."""
import numpy as np
from PIL import Image

SCALE = 0.33      # same scale for all, so the arm is the same size on every slide
LENGTH = 480      # px from slide edge to fingertip
for k in ["rock", "paper", "scissors"]:
    im = Image.open(f"hands/{k}.png").rotate(-40, expand=True, resample=Image.BICUBIC)
    im = im.crop(im.getbbox())
    im = im.resize((round(im.width * SCALE), round(im.height * SCALE)), Image.LANCZOS)
    a = np.asarray(im)[:, :, 3]
    cut = im.width - LENGTH
    col = a[:, cut] > 128
    print(k, im.size, "cut at", cut, "arm thickness at cut", col.sum())
    im = im.crop((cut, 0, im.width, im.height))
    im = im.crop((0, *im.getbbox()[1:2], im.width, im.getbbox()[3]))
    im.save(f"hands/h-{k}.png")
