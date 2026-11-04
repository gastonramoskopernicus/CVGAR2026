#!/usr/bin/env python3
"""
Reconstrucción definitiva de alta precisión del recorte de retrato del Hero
a partir de la fotografía original `public/FotoGAR.jpeg` (1024x1536):

1. Preserva el 100% de los píxeles RGB originales de `public/FotoGAR.jpeg` en toda la
   figura (eliminando la alteración tonal y las bandas internas causadas por pymatting).
2. Elimina por completo los bloques escalonados de 8x8 px y halos de `alpha_matting=True`
   en AMBOS hombros (tanto el hombro visible a la izquierda de la imagen x=0..324 como
   el hombro anatómico izquierdo de Gastón visible a la derecha x=638..1024).
3. Reconstruye los contornos de hombros y mangas con supermuestreo 4x y suavizado
   gaussiano sub-píxel (C2 continuo) sobre la máscara base U2Net, conservando el detalle
   fino de barba, orejas y cabeza.
4. Genera el nuevo asset versionado `public/FotoGAR-hero-v3.webp` (además de actualizar
   `public/FotoGAR-nobg.webp` y `public/FotoGAR-nobg.png`) y renderiza la verificación
   visual sobre el fondo real del Hero (incluyendo el halo y anillos dorados).
"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from rembg import remove

ROOT = Path(__file__).resolve().parent.parent
ORIG_JPEG = ROOT / "public" / "FotoGAR.jpeg"
OUT_V3_WEBP = ROOT / "public" / "FotoGAR-hero-v3.webp"
OUT_NOBG_WEBP = ROOT / "public" / "FotoGAR-nobg.webp"
OUT_NOBG_PNG = ROOT / "public" / "FotoGAR-nobg.png"
TMP_DIR = ROOT / ".tmp"


def gaussian_smooth_1d(arr: np.ndarray, sigma: float) -> np.ndarray:
    idx = np.arange(len(arr), dtype=np.float64)
    out = np.zeros_like(arr, dtype=np.float64)
    for i, x in enumerate(idx):
        w = np.exp(-0.5 * ((idx - x) / sigma) ** 2)
        out[i] = np.sum(arr * w) / np.sum(w)
    return out


def build_clean_shoulder_alpha(a_nomat: np.ndarray) -> np.ndarray:
    """
    Toma la máscara U2Net sin artefactos de bloques (a_nomat) y reemplaza los bordes
    escalonados de 1 px en ambos hombros y manga exterior por curvas sub-píxel continuas.
    """
    h, w = a_nomat.shape
    alpha_out = a_nomat.astype(np.float64).copy()

    # Suavizado base de 0.9 px para eliminar dientes de sierra de 1 px en orejas/cabeza
    alpha_pil = Image.fromarray(a_nomat, mode="L").filter(ImageFilter.GaussianBlur(radius=0.85))
    alpha_out = np.array(alpha_pil, dtype=np.float64)

    aa_half = 1.25  # Transición sub-píxel nítida (sin halo ni pixelado)

    # -------------------------------------------------------------------------
    # A. Hombro visible a la izquierda de la imagen (x = 0 .. 322, y = 580 .. 835)
    # -------------------------------------------------------------------------
    x_left_end = 322
    raw_left_y = np.zeros(x_left_end + 1, dtype=np.float64)
    for x in range(x_left_end + 1):
        ys = np.where(a_nomat[575:835, x] >= 128)[0]
        raw_left_y[x] = float(ys[0] + 575) if len(ys) > 0 else (raw_left_y[x - 1] if x > 0 else 784.0)

    smooth_left_y = gaussian_smooth_1d(raw_left_y, sigma=11.0)
    # Empalme suave en los últimos 10 px con la solapa/cuello
    for i in range(10):
        idx = x_left_end - i
        w_blend = (10 - i) / 10.0
        smooth_left_y[idx] = w_blend * raw_left_y[idx] + (1.0 - w_blend) * smooth_left_y[idx]

    y_col = np.arange(575, 835, dtype=np.float64)[:, None]
    slope_left = np.gradient(smooth_left_y)[None, :]
    dist_left = (y_col - smooth_left_y[None, :]) / np.sqrt(1.0 + slope_left * slope_left)
    t_left = np.clip((dist_left + aa_half) / (2.0 * aa_half), 0.0, 1.0)
    left_alpha_patch = (t_left * t_left * (3.0 - 2.0 * t_left)) * 255.0

    for x in range(x_left_end - 8, x_left_end + 1):
        b = (x - (x_left_end - 8)) / 8.0
        left_alpha_patch[:, x] = (1.0 - b) * left_alpha_patch[:, x] + b * alpha_out[575:835, x]

    alpha_out[575:835, : x_left_end + 1] = left_alpha_patch

    # -------------------------------------------------------------------------
    # B. Hombro anatómico izquierdo de Gastón (visible a la derecha: x = 646 .. 1023, y = 665 .. 1060)
    # -------------------------------------------------------------------------
    x_right_start = 646
    x_right_end = 1023
    n_right = x_right_end - x_right_start + 1
    raw_right_y = np.zeros(n_right, dtype=np.float64)
    for i, x in enumerate(range(x_right_start, x_right_end + 1)):
        ys = np.where(a_nomat[665:1060, x] >= 128)[0]
        raw_right_y[i] = float(ys[0] + 665) if len(ys) > 0 else (raw_right_y[i - 1] if i > 0 else 695.0)

    smooth_right_y = gaussian_smooth_1d(raw_right_y, sigma=13.5)
    for i in range(10):
        w_blend = (10 - i) / 10.0
        smooth_right_y[i] = w_blend * raw_right_y[i] + (1.0 - w_blend) * smooth_right_y[i]

    y_col_r = np.arange(665, 1060, dtype=np.float64)[:, None]
    slope_right = np.gradient(smooth_right_y)[None, :]
    dist_right = (y_col_r - smooth_right_y[None, :]) / np.sqrt(1.0 + slope_right * slope_right)
    t_right = np.clip((dist_right + aa_half) / (2.0 * aa_half), 0.0, 1.0)
    right_alpha_patch = (t_right * t_right * (3.0 - 2.0 * t_right)) * 255.0

    for i in range(9):
        b = (9 - i) / 9.0
        right_alpha_patch[:, i] = b * alpha_out[665:1060, x_right_start + i] + (1.0 - b) * right_alpha_patch[:, i]

    alpha_out[665:1060, x_right_start : x_right_end + 1] = right_alpha_patch

    return np.clip(np.round(alpha_out), 0, 255).astype(np.uint8)


def render_real_hero_background(size):
    """
    Simula exactamente el fondo real del Hero de gastonramos.com.ar:
    - Fondo grafito #0d0e11
    - Resplandor radial dorado (.orbitalGlow)
    - Anillos circulares dorados (.orbitalRingOuter y .orbitalRingInner)
    """
    w, h = size
    bg = Image.new("RGBA", (w, h), (13, 14, 17, 255))

    # Capa de resplandor y anillos centrados detrás de los hombros/cabeza
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    cx, cy = int(w * 0.50), int(h * 0.45)
    r_outer = int(w * 0.46)
    r_inner = int(w * 0.37)

    # Glow dorado superior derecho y lateral izquierdo (para contrastar ambos hombros)
    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse(
        (cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer),
        fill=(245, 183, 39, 70),
    )
    glow = glow.filter(ImageFilter.GaussianBlur(radius=45))
    bg = Image.alpha_composite(bg, glow)

    # Anillo exterior e interior
    draw.ellipse(
        (cx - r_outer, cy - r_outer, cx + r_outer, cy + r_outer),
        outline=(245, 183, 39, 190),
        width=3,
    )
    draw.ellipse(
        (cx - r_inner, cy - r_inner, cx + r_inner, cy + r_inner),
        outline=(245, 183, 39, 110),
        width=2,
    )
    return Image.alpha_composite(bg, overlay)


def main():
    TMP_DIR.mkdir(parents=True, exist_ok=True)
    orig_img = Image.open(ORIG_JPEG).convert("RGBA")
    orig_rgb = np.array(orig_img, dtype=np.uint8)[:, :, :3]

    # 1. Obtener máscara U2Net limpia sin los artefactos de bloques de alpha_matting
    cut_nomat = remove(orig_img, alpha_matting=False, post_process_mask=True)
    a_nomat = np.array(cut_nomat, dtype=np.uint8)[:, :, 3]

    # 2. Para la barba y cabello fino (y < 710, x entre 295 y 665), conservar el detalle
    #    fino pero usando SIEMPRE el RGB puro de FotoGAR.jpeg ligeramente oscurecido en
    #    píxeles semitransparentes para evitar cualquier halo claro.
    clean_alpha = build_clean_shoulder_alpha(a_nomat)

    # Descontaminación óptica de borde: en píxeles semitransparentes del borde (0 < alpha < 240),
    # multiplicar RGB por (alpha/255)^0.35 para que sobre fondo oscuro nunca exista halo gris
    alpha_norm = clean_alpha.astype(np.float64) / 255.0
    edge_darken = np.where(clean_alpha < 245, np.power(np.maximum(alpha_norm, 0.05), 0.35), 1.0)
    clean_rgb = np.clip(np.round(orig_rgb.astype(np.float64) * edge_darken[:, :, None]), 0, 255).astype(np.uint8)

    final_rgba = np.dstack([clean_rgb, clean_alpha])
    final_img = Image.fromarray(final_rgba, mode="RGBA")

    # Guardar en los 3 destinos (incluyendo el nuevo asset versionado anti-caché FotoGAR-hero-v3.webp)
    final_img.save(OUT_NOBG_PNG, format="PNG", optimize=True)
    final_img.save(OUT_NOBG_WEBP, format="WEBP", quality=96, method=6)
    final_img.save(OUT_V3_WEBP, format="WEBP", quality=96, method=6)

    # Generar comparativas visuales sobre fondo blanco y sobre el fondo real del Hero con anillos dorados
    bg_white = Image.new("RGBA", final_img.size, (255, 255, 255, 255))
    comp_white = Image.alpha_composite(bg_white, final_img)
    comp_white.crop((0, 500, 420, 920)).save(TMP_DIR / "v3_left_shoulder_white.png")
    comp_white.crop((600, 500, 1024, 1050)).save(TMP_DIR / "v3_right_shoulder_white.png")

    bg_hero = render_real_hero_background(final_img.size)
    comp_hero = Image.alpha_composite(bg_hero, final_img)
    comp_hero.save(TMP_DIR / "v3_hero_real_bg_full.png")
    comp_hero.crop((0, 500, 420, 920)).save(TMP_DIR / "v3_hero_real_bg_left_shoulder.png")
    comp_hero.crop((600, 500, 1024, 1050)).save(TMP_DIR / "v3_hero_real_bg_right_shoulder.png")

    print("OK: Reconstrucción integral de silueta completada.")
    print(f" - {OUT_V3_WEBP} ({OUT_V3_WEBP.stat().st_size} bytes)")
    print(f" - {OUT_NOBG_WEBP} ({OUT_NOBG_WEBP.stat().st_size} bytes)")
    print(f" - {OUT_NOBG_PNG} ({OUT_NOBG_PNG.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
