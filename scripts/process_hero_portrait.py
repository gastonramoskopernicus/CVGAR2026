#!/usr/bin/env python3
"""
Script determinista para corregir quirúrgicamente el contorno pixelado/escalonado
del hombro izquierdo (visible a la izquierda de la imagen) en public/FotoGAR-nobg.png
y public/FotoGAR-nobg.webp, preservando intactos el rostro, barba, vestimenta y
el hombro derecho.
"""
from pathlib import Path
import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
ORIG_JPEG = ROOT / "public" / "FotoGAR.jpeg"
CUTOUT_PNG = ROOT / "public" / "FotoGAR-nobg.png"
CUTOUT_WEBP = ROOT / "public" / "FotoGAR-nobg.webp"
TMP_DIR = ROOT / ".tmp"


def build_smooth_left_shoulder_curve(alpha_channel: np.ndarray, x_end: int = 318) -> np.ndarray:
    """
    Extrae el contorno medio del hombro izquierdo entre x=0 y x=x_end y reconstruye
    una curva continua sin escalones de 8x8 px mediante ajuste suave con continuidad C2
    y anclaje exacto en x=x_end para empalmar sin costura con el cuello/solapa.
    """
    raw_y = np.zeros(x_end + 1, dtype=np.float64)
    for x in range(x_end + 1):
        ys = np.where(alpha_channel[585:830, x] >= 160)[0]
        if len(ys) > 0:
            raw_y[x] = float(ys[0] + 585)
        else:
            raw_y[x] = raw_y[x - 1] if x > 0 else 783.5

    ctrl_x = np.array([0, 35, 75, 120, 165, 210, 248, 275, 300, x_end], dtype=np.float64)
    ctrl_y = np.array(
        [
            783.5,  # Borde izquierdo limpio (elimina el escalón plano de 784->770)
            773.8,
            762.5,
            745.0,
            726.5,
            706.5,
            688.0,  # Inicio de la curvatura hacia el cuello/solapa
            657.0,
            625.5,
            raw_y[x_end],  # Empalme exacto al píxel con el cuello en x_end=318
        ],
        dtype=np.float64,
    )

    dense_x = np.arange(x_end + 1, dtype=np.float64)
    interp_y = np.interp(dense_x, ctrl_x, ctrl_y)

    sigma = 9.0
    smooth_y = np.zeros_like(interp_y)
    for i, x in enumerate(dense_x):
        weights = np.exp(-0.5 * ((dense_x - x) / sigma) ** 2)
        smooth_y[i] = np.sum(interp_y * weights) / np.sum(weights)

    # Anclar suavemente los últimos 10 píxeles al valor exacto en x_end
    blend_len = 10
    for i in range(blend_len):
        idx = x_end - i
        w = (blend_len - i) / blend_len
        smooth_y[idx] = w * raw_y[idx] + (1.0 - w) * smooth_y[idx]

    return smooth_y


def main():
    TMP_DIR.mkdir(parents=True, exist_ok=True)

    backup_png = TMP_DIR / "FotoGAR-nobg.before_shoulder_fix.png"
    if not backup_png.exists() and CUTOUT_PNG.exists():
        Image.open(CUTOUT_PNG).save(backup_png, format="PNG")

    orig_rgb = np.array(Image.open(ORIG_JPEG).convert("RGB"), dtype=np.uint8)
    cut_rgba = np.array(
        Image.open(backup_png if backup_png.exists() else CUTOUT_PNG).convert("RGBA"),
        dtype=np.uint8,
    )

    h, w, _ = cut_rgba.shape
    assert orig_rgb.shape[:2] == (h, w), "Dimensiones de FotoGAR.jpeg y FotoGAR-nobg.png deben coincidir"

    out_rgba = cut_rgba.copy()
    alpha_orig = cut_rgba[:, :, 3].astype(np.float64)

    x_end = 318
    smooth_contour_y = build_smooth_left_shoulder_curve(alpha_orig, x_end=x_end)
    aa_half_width = 1.35

    # Aplicar reconstrucción siguiendo una banda local alrededor de la curva del hombro
    # [-32 px hacia arriba para limpiar pelusa/escalones, +20 px hacia abajo para restaurar borde sólido]
    for x in range(x_end + 1):
        cy = smooth_contour_y[x]
        y0 = max(585, int(np.floor(cy - 32)))
        y1 = min(830, int(np.ceil(cy + 20)))

        ys = np.arange(y0, y1, dtype=np.float64)
        signed_dist = ys - cy
        t = np.clip((signed_dist + aa_half_width) / (2.0 * aa_half_width), 0.0, 1.0)
        col_alpha = (t * t * (3.0 - 2.0 * t)) * 255.0

        # En los últimos 8 px (x = 310..318), fundir suavemente con el canal alfa original del cuello
        if x >= x_end - 8:
            blend = (x - (x_end - 8)) / 8.0
            col_alpha = (1.0 - blend) * col_alpha + blend * alpha_orig[y0:y1, x]

        out_rgba[y0:y1, x, 3] = np.round(col_alpha).astype(np.uint8)
        out_rgba[y0:y1, x, :3] = orig_rgb[y0:y1, x, :3]

    # Verificar que fuera de la ventana del hombro izquierdo (rostro, barba, hombro derecho) el cambio sea 0
    diff_outside = np.abs(out_rgba[:, x_end + 1 :, :].astype(int) - cut_rgba[:, x_end + 1 :, :].astype(int)).max()
    diff_head = np.abs(out_rgba[:585, :, :].astype(int) - cut_rgba[:585, :, :].astype(int)).max()
    assert diff_outside == 0 and diff_head == 0, "Garantía quirúrgica violada: se modificaron píxeles fuera del hombro izquierdo"

    out_img = Image.fromarray(out_rgba, mode="RGBA")
    out_img.save(CUTOUT_PNG, format="PNG", optimize=True)
    out_img.save(CUTOUT_WEBP, format="WEBP", quality=95, method=6)

    bg_white = Image.new("RGBA", out_img.size, (255, 255, 255, 255))
    comp_white = Image.alpha_composite(bg_white, out_img)
    comp_white.crop((0, 560, 360, 840)).save(TMP_DIR / "crop_left_shoulder_after_white.png")

    bg_dark = Image.new("RGBA", out_img.size, (13, 14, 17, 255))
    comp_dark = Image.alpha_composite(bg_dark, out_img)
    comp_dark.crop((0, 560, 360, 840)).save(TMP_DIR / "crop_left_shoulder_after_dark.png")
    comp_dark.save(TMP_DIR / "hero_cutout_preview_after.png")

    print("OK: Hombro izquierdo corregido quirúrgicamente.")
    print(f" - PNG actualizado:  {CUTOUT_PNG} ({CUTOUT_PNG.stat().st_size} bytes)")
    print(f" - WebP actualizado: {CUTOUT_WEBP} ({CUTOUT_WEBP.stat().st_size} bytes)")
    print(f" - Diferencia máxima en cabeza/rostro/hombro derecho: {max(diff_outside, diff_head)}")


if __name__ == "__main__":
    main()
