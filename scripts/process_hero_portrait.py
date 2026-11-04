#!/usr/bin/env python3
"""
Deterministic script to remove the background from public/FotoGAR.jpeg
and generate transparent PNG and WebP assets for the V2.1 Hero section.
"""
import os
from pathlib import Path
from PIL import Image
from rembg import remove

ROOT = Path(__file__).resolve().parent.parent
INPUT_PATH = ROOT / "public" / "FotoGAR.jpeg"
TMP_DIR = ROOT / ".tmp"
OUT_PNG = ROOT / "public" / "FotoGAR-nobg.png"
OUT_WEBP = ROOT / "public" / "FotoGAR-nobg.webp"
PREVIEW_PATH = TMP_DIR / "hero_cutout_preview.png"


def main():
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    if not INPUT_PATH.exists():
        raise FileNotFoundError(f"Input image not found: {INPUT_PATH}")

    with Image.open(INPUT_PATH) as img:
        img_rgba = img.convert("RGBA")
        # Remove background with alpha matting for clean hair/beard/jacket edges
        cutout = remove(
            img_rgba,
            alpha_matting=True,
            alpha_matting_foreground_threshold=240,
            alpha_matting_background_threshold=10,
            alpha_matting_erode_size=8,
        )

        cutout.save(OUT_PNG, format="PNG", optimize=True)
        cutout.save(OUT_WEBP, format="WEBP", quality=94, method=6)

        # Create a dark-background composite preview in .tmp to verify edge quality
        bg = Image.new("RGBA", cutout.size, (13, 14, 17, 255))
        composite = Image.alpha_composite(bg, cutout)
        composite.save(PREVIEW_PATH, format="PNG")

    print(f"Saved transparent PNG: {OUT_PNG} ({OUT_PNG.stat().st_size} bytes)")
    print(f"Saved transparent WebP: {OUT_WEBP} ({OUT_WEBP.stat().st_size} bytes)")
    print(f"Saved verification preview: {PREVIEW_PATH}")


if __name__ == "__main__":
    main()

