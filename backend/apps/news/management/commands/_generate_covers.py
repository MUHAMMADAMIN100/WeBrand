"""Generate the news cover images (1200x675) into _covers/.

Seven tasteful per-category covers in the brand's blue family (abstract
geometry, NO logo) + one brand cover with the real WeBrand lockup — used only
for articles that are about WeBrand itself. Run from backend/:

    .venv/Scripts/python.exe apps/news/management/commands/_generate_covers.py
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

W, H = 1200, 675
OUT = Path(__file__).parent / "_covers"
OUT.mkdir(exist_ok=True)

# Brand scale (tailwind config)
BRAND = {
    400: (93, 134, 229),
    500: (64, 111, 219),
    600: (43, 94, 211),
    700: (34, 78, 180),
    800: (25, 61, 143),
    900: (18, 44, 104),
    950: (10, 24, 58),
}


def gradient(c1, c2, diagonal=False):
    """Smooth two-stop gradient via tiny-image upscale."""
    if diagonal:
        tiny = Image.new("RGB", (2, 2))
        tiny.putpixel((0, 0), c1)
        tiny.putpixel((1, 0), tuple((a + b) // 2 for a, b in zip(c1, c2)))
        tiny.putpixel((0, 1), tuple((a + b) // 2 for a, b in zip(c1, c2)))
        tiny.putpixel((1, 1), c2)
    else:
        tiny = Image.new("RGB", (1, 2))
        tiny.putpixel((0, 0), c1)
        tiny.putpixel((0, 1), c2)
    return tiny.resize((W, H), Image.BICUBIC).convert("RGBA")


def glow(img, xy, radius, color, alpha):
    """Soft radial glow blended onto img."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x, y = xy
    d.ellipse([x - radius, y - radius, x + radius, y + radius], fill=color + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(radius / 2))
    img.alpha_composite(layer)


def white(alpha):
    return (255, 255, 255, alpha)


def base(c1, c2, glow_at=(900, 140), glow_color=400):
    img = gradient(c1, c2, diagonal=True)
    glow(img, glow_at, 320, BRAND[glow_color], 70)
    glow(img, (180, H - 80), 260, BRAND[900], 90)
    return img


def vignette(img):
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    d.rectangle([0, 0, W, H], outline=(0, 0, 0, 60), width=60)
    layer = layer.filter(ImageFilter.GaussianBlur(60))
    img.alpha_composite(layer)
    return img


def save(img, name):
    vignette(img).convert("RGB").save(OUT / name, quality=92)
    print("saved", name)


def rr(d, box, rad, **kw):
    d.rounded_rectangle(box, radius=rad, **kw)


# --- web: browser window ------------------------------------------------------
img = base(BRAND[600], BRAND[900])
d = ImageDraw.Draw(img)
bx, by, bw, bh = 330, 150, 540, 380
rr(d, [bx, by, bx + bw, by + bh], 22, fill=white(26), outline=white(70), width=3)
rr(d, [bx, by, bx + bw, by + 56], 22, fill=white(34))
d.rectangle([bx, by + 34, bx + bw, by + 56], fill=white(0))
for i, cx in enumerate((bx + 30, bx + 62, bx + 94)):
    d.ellipse([cx - 8, by + 20, cx + 8, by + 36], fill=white(120 if i == 0 else 80))
rr(d, [bx + 36, by + 96, bx + 300, by + 128], 10, fill=white(110))
rr(d, [bx + 36, by + 156, bx + bw - 36, by + 186], 8, fill=white(56))
rr(d, [bx + 36, by + 206, bx + bw - 120, by + 236], 8, fill=white(44))
rr(d, [bx + 36, by + 276, bx + 210, by + 330], 14, fill=(255, 255, 255, 200))
save(img, "web.png")

# --- seo: ascending bars + rising line ---------------------------------------
img = base(BRAND[700], BRAND[950], glow_at=(950, 500), glow_color=500)
d = ImageDraw.Draw(img)
bars = [(420, 150), (540, 220), (660, 300), (780, 390)]
for x, h in bars:
    rr(d, [x, 520 - h, x + 76, 520], 14, fill=white(38 if h < 380 else 60))
rr(d, [780, 520 - 390, 856, 520], 14, fill=(255, 255, 255, 190))
pts = [(400, 420), (560, 360), (700, 280), (860, 170)]
d.line(pts, fill=white(160), width=7, joint="curve")
d.ellipse([860 - 12, 170 - 12, 860 + 12, 170 + 12], fill=(255, 255, 255, 230))
save(img, "seo.png")

# --- smm: chat bubbles --------------------------------------------------------
img = base(BRAND[500], BRAND[800], glow_at=(260, 160), glow_color=400)
d = ImageDraw.Draw(img)
rr(d, [340, 180, 700, 330], 40, fill=white(40))
d.polygon([(395, 325), (430, 325), (390, 372)], fill=white(40))
rr(d, [500, 370, 880, 520], 40, fill=(255, 255, 255, 190))
d.polygon([(815, 515), (850, 515), (842, 560)], fill=(255, 255, 255, 190))
for cx in (565, 660, 755):
    d.ellipse([cx, 430, cx + 26, 456], fill=BRAND[600] + (255,))
d.ellipse([660, 130, 760, 230], outline=white(110), width=6)
d.ellipse([695, 165, 725, 195], fill=white(150))
save(img, "smm.png")

# --- design: palette circles --------------------------------------------------
img = base(BRAND[600], BRAND[950], glow_at=(300, 520), glow_color=500)
d = ImageDraw.Draw(img)
d.ellipse([380, 170, 660, 450], fill=BRAND[400] + (150,))
d.ellipse([540, 220, 820, 500], fill=white(60))
d.ellipse([470, 320, 690, 540], outline=white(140), width=6)
d.ellipse([700, 150, 780, 230], fill=(255, 255, 255, 200))
d.rectangle([820, 380, 900, 460], fill=white(90))
d.polygon([(860, 250), (910, 330), (810, 330)], fill=white(130))
save(img, "design.png")

# --- animation: play + motion trails -----------------------------------------
img = base(BRAND[800], BRAND[950], glow_at=(620, 340), glow_color=500)
d = ImageDraw.Draw(img)
for i, r in enumerate((210, 160, 115)):
    d.ellipse([600 - r, 337 - r, 600 + r, 337 + r], outline=white(40 + i * 30), width=5)
d.ellipse([600 - 78, 337 - 78, 600 + 78, 337 + 78], fill=(255, 255, 255, 205))
d.polygon([(575, 295), (575, 380), (650, 337)], fill=BRAND[700] + (255,))
for arc_box, st, en in (
    ([260, 120, 940, 560], 200, 250),
    ([200, 80, 1000, 600], 320, 355),
):
    d.arc(arc_box, start=st, end=en, fill=white(90), width=6)
save(img, "animation.png")

# --- ai: connected nodes ------------------------------------------------------
img = base(BRAND[900], BRAND[950], glow_at=(640, 300), glow_color=500)
d = ImageDraw.Draw(img)
nodes = [(420, 220), (640, 150), (840, 250), (520, 400), (760, 430), (640, 300)]
edges = [(0, 1), (1, 2), (0, 3), (2, 4), (3, 4), (0, 5), (1, 5), (2, 5), (3, 5), (4, 5)]
for a, b in edges:
    d.line([nodes[a], nodes[b]], fill=white(60), width=4)
for i, (x, y) in enumerate(nodes):
    r = 30 if i == 5 else 18
    fill = (255, 255, 255, 210) if i == 5 else white(120)
    d.ellipse([x - r, y - r, x + r, y + r], fill=fill)
d.ellipse([640 - 14, 300 - 14, 640 + 14, 300 + 14], fill=BRAND[600] + (255,))
save(img, "ai.png")

# --- local: map pin + route ---------------------------------------------------
img = base(BRAND[600], BRAND[900], glow_at=(840, 200), glow_color=400)
d = ImageDraw.Draw(img)
for i in range(9):
    x = 240 + i * 60
    y = 470 - (i % 3) * 26 - i * 8
    d.ellipse([x, y, x + 12, y + 12], fill=white(90))
px, py = 760, 250
d.ellipse([px - 95, py - 95, px + 95, py + 95], fill=white(40))
d.polygon([(px - 62, py + 30), (px + 62, py + 30), (px, py + 150)], fill=(255, 255, 255, 200))
d.ellipse([px - 62, py - 62, px + 62, py + 62], fill=(255, 255, 255, 215))
d.ellipse([px - 26, py - 26, px + 26, py + 26], fill=BRAND[600] + (255,))
save(img, "local.png")

# --- brand cover: real lockup on deep navy ------------------------------------
img = gradient(BRAND[950], (6, 10, 22), diagonal=True)
glow(img, (600, 300), 380, BRAND[600], 80)
glow(img, (980, 560), 260, BRAND[800], 80)
d = ImageDraw.Draw(img)
# faint grid
for gx in range(0, W, 60):
    d.line([(gx, 0), (gx, H)], fill=white(7), width=1)
for gy in range(0, H, 60):
    d.line([(0, gy), (W, gy)], fill=white(7), width=1)
logo = Image.open(Path(__file__).parents[4].parent / "admin-panel" / "public" / "logos" / "main-logo-dark.png").convert("RGBA")
scale = 620 / logo.width
logo = logo.resize((620, int(logo.height * scale)), Image.LANCZOS)
img.alpha_composite(logo, ((W - logo.width) // 2, (H - logo.height) // 2))
save(img, "webrand.png")

print("done:", sorted(p.name for p in OUT.glob("*.png")))
