"""
Stitch a map's sat/<x>/<y>.png tiles into one image, optionally resized.

Use https://github.com/gruppe-adler/grad_meh to get the sat map tiles.

Usage:
    python stitch_satmap.py bornholm            # -> bornholm/satmap-bornholm.webp
    python stitch_satmap.py bornholm --size 4096
    python stitch_satmap.py bornholm farabad --size 2048x2048 -o out_dir
    python stitch_satmap.py --all --size 4096

Requires Pillow (pip install pillow).
"""

import argparse
import os
import re
import sys

from PIL import Image

# Tiles are huge (e.g. 5632x5632); stitched output is expected to be large.
Image.MAX_IMAGE_PIXELS = None


def find_tiles(sat_dir):
    """Return {(x, y): path}; folder name is X, file name is Y."""
    tiles = {}
    for x_name in os.listdir(sat_dir):
        x_path = os.path.join(sat_dir, x_name)
        if not (x_name.isdigit() and os.path.isdir(x_path)):
            continue
        for f in os.listdir(x_path):
            m = re.fullmatch(r"(\d+)\.(png|jpe?g|bmp)", f, re.IGNORECASE)
            if m:
                tiles[(int(x_name), int(m.group(1)))] = os.path.join(x_path, f)
    return tiles


def parse_size(value):
    m = re.fullmatch(r"(\d+)(?:[xX,](\d+))?", value.strip())
    if not m:
        raise argparse.ArgumentTypeError("size must be N or WxH, e.g. 4096 or 4096x2048")
    w = int(m.group(1))
    h = int(m.group(2)) if m.group(2) else w
    if w < 1 or h < 1:
        raise argparse.ArgumentTypeError("size must be positive")
    return w, h


def stitch(map_dir, output, size=None):
    sat_dir = os.path.join(map_dir, "sat")
    if not os.path.isdir(sat_dir):
        raise FileNotFoundError(f"No sat/ folder in {map_dir}")
    tiles = find_tiles(sat_dir)
    if not tiles:
        raise FileNotFoundError(f"No tiles found in {sat_dir}")

    xs = [k[0] for k in tiles]
    ys = [k[1] for k in tiles]
    min_x, min_y = min(xs), min(ys)
    cols, rows = max(xs) - min_x + 1, max(ys) - min_y + 1

    with Image.open(next(iter(tiles.values()))) as first:
        tile_w, tile_h = first.size
        mode = first.mode
    if mode not in ("RGB", "RGBA"):
        mode = "RGB"

    native_w, native_h = cols * tile_w, rows * tile_h
    out_w, out_h = size or (native_w, native_h)
    if output.lower().endswith(".webp") and max(out_w, out_h) > 16383:
        raise ValueError(f"WebP is limited to 16383 px per side; use --size {16383} or smaller")
    print(f"{map_dir}: {len(tiles)} tiles ({cols}x{rows}), {native_w}x{native_h} -> {out_w}x{out_h}")

    canvas = Image.new(mode, (out_w, out_h))
    for (x, y), path in sorted(tiles.items()):
        col, row = x - min_x, y - min_y
        # Per-tile edges are rounded from the grid so scaled tiles leave no gaps.
        x0, x1 = round(col * out_w / cols), round((col + 1) * out_w / cols)
        y0, y1 = round(row * out_h / rows), round((row + 1) * out_h / rows)
        with Image.open(path) as img:
            img = img.convert(mode)
            if img.size != (x1 - x0, y1 - y0):
                img = img.resize((x1 - x0, y1 - y0), Image.LANCZOS)
            canvas.paste(img, (x0, y0))

    canvas.save(output)
    print(f"Saved {output}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("maps", nargs="*", help="map folder(s) containing a sat/ directory")
    ap.add_argument("--all", action="store_true", help="process every subfolder here that has a sat/ directory")
    ap.add_argument("-s", "--size", type=parse_size, help="output size, N or WxH; omit for no scaling")
    ap.add_argument("-o", "--output", help="output file (single map) or directory (multiple maps); default: <map>/satmap-<map>.webp")
    ap.add_argument("-f", "--format", default="webp", help="output extension when using the default name (default: webp)")
    args = ap.parse_args()

    maps = list(args.maps)
    if args.all:
        base = os.path.dirname(os.path.abspath(__file__))
        maps += [os.path.join(base, d) for d in sorted(os.listdir(base))
                 if os.path.isdir(os.path.join(base, d, "sat"))]
    if not maps:
        ap.error("specify at least one map folder or --all")

    multi = len(maps) > 1
    failed = False
    for m in maps:
        name = os.path.basename(os.path.normpath(m))
        default_name = f"satmap-{name}.{args.format.lstrip('.')}"
        if args.output and not multi and not os.path.isdir(args.output):
            out = args.output
        elif args.output:
            os.makedirs(args.output, exist_ok=True)
            out = os.path.join(args.output, default_name)
        else:
            out = os.path.join(m, default_name)
        try:
            stitch(m, out, args.size)
        except (FileNotFoundError, OSError, MemoryError, ValueError) as e:
            print(f"Skipping {m}: {e}", file=sys.stderr)
            failed = True
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
