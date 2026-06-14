#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import numpy as np, json

W, H = 1400, 360
img = Image.new("L", (W, H), 0)
d = ImageDraw.Draw(img)
font_path = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"
font = ImageFont.truetype(font_path, 230)

# 文字ごとに字間を指定（I の後ろを広めにとって T と分離）
text = "Photonics"
extra = {}  # 1単語なので特別な字間は不要
default_ls = 14

advances = [d.textbbox((0,0), c, font=font)[2] for c in text]
gaps = [extra.get(i, default_ls) for i in range(len(text))]
total = sum(advances) + sum(gaps[:-1])
x = (W - total) / 2
cy = H / 2
for i, (c, adv) in enumerate(zip(text, advances)):
    d.text((x, cy), c, fill=255, font=font, anchor="lm")
    x += adv + gaps[i]

a = np.array(img) > 110
pts = []
STEP = 12
for yy in range(0, H, STEP):
    for xx in range(0, W, STEP):
        if a[yy, xx]:
            pts.append([round(xx / W, 3), round(yy / H, 3)])
print("points:", len(pts))
xs=[p[0] for p in pts]; ys=[p[1] for p in pts]
print("x", min(xs), max(xs), "y", min(ys), max(ys))
open('textpoints.js','w').write("const TEXT_POINTS = " + json.dumps(pts, separators=(',',':')) + ";")
