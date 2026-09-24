"""Render the four lab typing modes (T1-T4) as looping GIFs.

The scene is pure axis-aligned pixel rects, so the crop around the hands and
keyboard is redrawn here with Pillow instead of screenshotting a browser. The
phrase scheduler mirrors the TYPING table in avatar.js one-to-one.
"""

import pathlib
import random

from PIL import Image, ImageDraw

BASE = pathlib.Path(__file__).resolve().parent.parent
OUT = BASE / "assets"

# crop window in avatar viewBox units
CROP_X, CROP_Y, CROP_W, CROP_H = 128, 396, 128, 42
SCALE = 4
FRAME_MS = 50

FINGER_REST = -5
FINGER_DOWN = 1
KEY_DOWN = 2
KEY_FILL = "#6b7a96"
KEY_HIT_FILL = "#c3d2ec"

# --- scene geometry, in draw order -----------------------------------------

BACKDROP = [
    (0, 0, 384, 412, "#151d2b"),
    (144, 0, 12, 412, "#1d2739"),
    (176, 0, 12, 412, "#1d2739"),
    (208, 0, 12, 412, "#1d2739"),
    (240, 0, 12, 412, "#1d2739"),
    (164, 0, 4, 412, "#232f45"),
    (228, 0, 4, 412, "#232f45"),
    (0, 398, 384, 14, "#111825"),
    # monitor stand + foot
    (184, 360, 16, 36, "#334155"),
    (180, 356, 24, 8, "#475569"),
    (168, 392, 48, 20, "#1e293b"),
    # desk
    (0, 412, 384, 36, "#2b3446"),
    (0, 412, 384, 6, "#46536c"),
    (0, 418, 384, 4, "#37425a"),
    (0, 440, 384, 4, "#252d3d"),
    # keyboard shell
    (88, 416, 208, 18, "#4a566c"),
    (88, 416, 208, 4, "#5d6a84"),
    (96, 420, 192, 10, "#3f4a5e"),
]

BACKDROP += [(x, 421, 8, 4, "#6b7a96") for x in range(104, 265, 16)]
BACKDROP += [(140, 426, 80, 3, "#6b7a96")]

KEY_X = [148, 156, 164, 172, 204, 212, 220, 228]
KEYBOARD_LIP = [(88, 430, 208, 4, "#2a323f")]

ARMS = [
    # left forearm
    (100, 404, 56, 16, "#eec3a1"),
    (100, 404, 56, 4, "#f7dcc3"),
    (100, 416, 56, 4, "#d8a683"),
    (120, 410, 24, 2, "#e0b491"),
    # right forearm
    (228, 404, 56, 16, "#eec3a1"),
    (228, 404, 56, 4, "#f7dcc3"),
    (228, 416, 56, 4, "#d8a683"),
    (240, 410, 24, 2, "#e0b491"),
    # left hand
    (148, 402, 28, 18, "#eec3a1"),
    (148, 402, 28, 4, "#f7dcc3"),
    (148, 416, 28, 4, "#d8a683"),
    (140, 408, 10, 8, "#eec3a1"),
    (136, 412, 10, 12, "#eec3a1"),
    (136, 412, 10, 3, "#f7dcc3"),
    # right hand
    (208, 402, 28, 18, "#eec3a1"),
    (208, 402, 28, 4, "#f7dcc3"),
    (208, 416, 28, 4, "#d8a683"),
    (234, 408, 10, 8, "#eec3a1"),
    (238, 412, 10, 12, "#eec3a1"),
    (238, 412, 10, 3, "#f7dcc3"),
]

# index -> (x, y, w, h); 0..3 left hand, 4..7 right hand, ordered left to right
FINGERS = {
    0: (150, 415, 5, 14),
    1: (158, 413, 5, 16),
    2: (166, 415, 5, 14),
    3: (174, 417, 5, 11),
    4: (206, 417, 5, 11),
    5: (214, 415, 5, 14),
    6: (222, 413, 5, 16),
    7: (230, 415, 5, 14),
}
FINGER_FILL = "#eec3a1"

# --- the same four moods as TYPING in avatar.js -----------------------------

TYPING = {
    "T1": {
        "label": "T1 Спокойный",
        "press": 220,
        "beat": 210,
        "gap": (640, 1080),
        "phrases": ["single", "single", "single", "single", "single", "pair", "runR3"],
        "loop": 3600,
    },
    "T2": {
        "label": "T2 Офисный",
        "press": 150,
        "beat": 125,
        "gap": (260, 520),
        "phrases": ["single", "single", "single", "pair", "pair", "triple", "runR3", "runL3"],
        "loop": 3000,
    },
    "T3": {
        "label": "T3 Быстрый набор",
        "press": 95,
        "beat": 70,
        "gap": (80, 190),
        "phrases": ["single", "single", "pair", "pair", "triple", "runR4", "runL4", "sweepR", "sweepL"],
        "loop": 2400,
    },
    "T4": {
        "label": "T4 Ритмичный",
        "press": 130,
        "beat": 95,
        "gap": (240, 340),
        "script": ["sweepR", "sweepL", "single", "single", "pair", "single"],
        "loop": 4200,
    },
}


def build_phrase(kind, beat, rng):
    count = len(FINGERS)
    out = []
    if kind == "single":
        out.append((rng.randrange(count), 0))
    elif kind in ("pair", "triple"):
        want = 2 if kind == "pair" else 3
        pool = []
        while len(pool) < want:
            i = rng.randrange(count)
            if i not in pool:
                pool.append(i)
        out = [(i, n * beat) for n, i in enumerate(pool)]
    elif kind in ("sweepR", "sweepL"):
        order = range(count) if kind == "sweepR" else range(count - 1, -1, -1)
        out = [(i, n * beat) for n, i in enumerate(order)]
    elif kind.startswith("runR") or kind.startswith("runL"):
        length = min(int(kind[4:] or 3), count)
        start = rng.randrange(count - length + 1)
        for n in range(length):
            i = start + n if kind.startswith("runR") else start + length - 1 - n
            out.append((i, n * beat))
    return out


def schedule(name):
    """Return [(finger, down_ms, up_ms)] filling one loop of the variant."""
    spec = TYPING[name]
    rng = random.Random(name)
    events = []
    now = 0.0
    step = 0
    # stop early enough that the loop ends on a quiet beat
    while now < spec["loop"] - 400:
        if "script" in spec:
            kind = spec["script"][step % len(spec["script"])]
            step += 1
        else:
            kind = rng.choice(spec["phrases"])
        phrase = build_phrase(kind, spec["beat"], rng)
        last = 0
        for finger, at in phrase:
            events.append((finger, now + at, now + at + spec["press"]))
            last = max(last, at)
        now += last + spec["press"] + rng.uniform(*spec["gap"])
    return events


def draw_rect(img, x, y, w, h, color):
    x0 = (x - CROP_X) * SCALE
    y0 = (y - CROP_Y) * SCALE
    if x0 + w * SCALE <= 0 or y0 + h * SCALE <= 0:
        return
    if x0 >= img.width or y0 >= img.height:
        return
    ImageDraw.Draw(img).rectangle(
        [x0, y0, x0 + w * SCALE - 1, y0 + h * SCALE - 1], fill=color
    )


def render_frame(down):
    img = Image.new("RGB", (CROP_W * SCALE, CROP_H * SCALE), "#151d2b")
    for rect in BACKDROP:
        draw_rect(img, *rect)
    for i, x in enumerate(KEY_X):
        hit = i in down
        draw_rect(img, x, 420 + (KEY_DOWN if hit else 0), 8, 6,
                  KEY_HIT_FILL if hit else KEY_FILL)
    for rect in KEYBOARD_LIP:
        draw_rect(img, *rect)
    for rect in ARMS:
        draw_rect(img, *rect)
    for i, (x, y, w, h) in FINGERS.items():
        draw_rect(img, x, y + (FINGER_DOWN if i in down else FINGER_REST), w, h, FINGER_FILL)
    return img


def make_gif(name):
    spec = TYPING[name]
    events = schedule(name)
    frames = []
    for t in range(0, spec["loop"], FRAME_MS):
        down = {f for f, a, b in events if a <= t < b}
        frames.append(render_frame(down))

    OUT.mkdir(exist_ok=True)
    path = OUT / ("typing-%s.gif" % name)
    frames[0].save(
        path,
        save_all=True,
        append_images=frames[1:],
        duration=FRAME_MS,
        loop=0,
        optimize=True,
        disposal=2,
    )
    return path, len(frames)


if __name__ == "__main__":
    for key in TYPING:
        path, count = make_gif(key)
        print("%s  %-18s %3d frames  %6.1f KB" % (
            key, TYPING[key]["label"], count, path.stat().st_size / 1024))
