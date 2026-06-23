"""
Drop your portrait as images/ouss_orig.png, then run:
  python3 remove_bg.py
Output: images/ouss.png (transparent background)

Uses a simple flood-fill from the corners to remove the background.
Works best on images with a light, distinct background.
"""
from PIL import Image
import sys

SRC  = "images/ouss_orig.png"
DEST = "images/ouss.png"
THRESHOLD = 60   # increase if background patches remain; decrease if figure is cut

img = Image.open(SRC).convert("RGBA")
w, h = img.size
pixels = img.load()

def color_distance(c1, c2):
    return sum((a - b) ** 2 for a, b in zip(c1[:3], c2[:3])) ** 0.5

def flood_fill(x, y, bg_color):
    stack = [(x, y)]
    visited = set()
    while stack:
        cx, cy = stack.pop()
        if (cx, cy) in visited or not (0 <= cx < w and 0 <= cy < h):
            continue
        visited.add((cx, cy))
        r, g, b, a = pixels[cx, cy]
        if color_distance((r, g, b), bg_color) < THRESHOLD:
            pixels[cx, cy] = (r, g, b, 0)
            stack += [(cx+1,cy),(cx-1,cy),(cx,cy+1),(cx,cy-1)]

# Sample background color from each corner
corners = [(0,0), (w-1,0), (0,h-1), (w-1,h-1)]
for cx, cy in corners:
    r, g, b, a = pixels[cx, cy]
    flood_fill(cx, cy, (r, g, b))

img.save(DEST)
print(f"Saved {DEST}")
