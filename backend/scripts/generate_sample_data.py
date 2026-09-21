import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import numpy as np
from PIL import Image, ImageDraw, ImageFont
try:
    import tifffile
except ImportError:
    tifffile = None

from app.core.config import SAMPLE_DATA_DIR

def create_synthetic_optical(filename: str, has_change: bool = False):
    w, h = 512, 512
    # Create RGB array
    arr = np.zeros((h, w, 4), dtype=np.uint8)
    
    # 1. Agricultural land (Green peak, NIR high)
    arr[0:256, 0:256, 0] = 30   # R
    arr[0:256, 0:256, 1] = 160  # G
    arr[0:256, 0:256, 2] = 40   # B
    arr[0:256, 0:256, 3] = 220  # NIR

    # 2. Water river (Blue peak, low NIR)
    rr, cc = np.ogrid[:h, :w]
    water_mask = (cc >= (rr * 0.8 + 50)) & (cc <= (rr * 0.8 + 120))
    arr[water_mask, 0] = 20
    arr[water_mask, 1] = 80
    arr[water_mask, 2] = 200
    arr[water_mask, 3] = 15

    # 3. Built-up area (High R, G, B, medium NIR)
    built_mask = (rr > 256) & (cc > 256)
    arr[built_mask, 0] = 180
    arr[built_mask, 1] = 175
    arr[built_mask, 2] = 170
    arr[built_mask, 3] = 120

    if has_change:
        # Add new urban expansion in T2
        change_mask = (rr > 200) & (rr < 320) & (cc > 180) & (cc < 350)
        arr[change_mask, 0] = 220
        arr[change_mask, 1] = 70
        arr[change_mask, 2] = 70
        arr[change_mask, 3] = 90

    out_path = SAMPLE_DATA_DIR / filename
    if filename.endswith(".tif") and tifffile is not None:
        tifffile.imwrite(out_path, arr)
    else:
        # Save as PNG
        img = Image.fromarray(arr[:, :, :3])
        img.save(out_path)

    print(f"Generated sample optical image: {out_path}")

def create_synthetic_sar(filename: str):
    w, h = 512, 512
    # 2-channel SAR (VV, VH)
    vv = np.random.normal(120, 25, (h, w)).astype(np.uint8)
    vh = np.random.normal(80, 20, (h, w)).astype(np.uint8)

    # Water has very low backscatter (specular reflection)
    rr, cc = np.ogrid[:h, :w]
    water_mask = (cc >= (rr * 0.8 + 50)) & (cc <= (rr * 0.8 + 120))
    vv[water_mask] = 15
    vh[water_mask] = 8

    # Built-up has strong double-bounce backscatter
    built_mask = (rr > 256) & (cc > 256)
    vv[built_mask] = 240
    vh[built_mask] = 190

    sar_arr = np.dstack([vv, vh])
    out_path = SAMPLE_DATA_DIR / filename
    if filename.endswith(".tif") and tifffile is not None:
        tifffile.imwrite(out_path, sar_arr)
    else:
        # Convert to 3-channel composite PNG
        composite = np.dstack([vv, vh, np.clip(vv - vh, 0, 255).astype(np.uint8)])
        img = Image.fromarray(composite)
        img.save(out_path)

    print(f"Generated sample SAR image: {out_path}")

def main():
    os.makedirs(SAMPLE_DATA_DIR, exist_ok=True)
    create_synthetic_optical("optical_sentinel2_bangalore.tif")
    create_synthetic_sar("sar_risat1_bangalore.tif")
    create_synthetic_optical("optical_t1_jan2026.tif", has_change=False)
    create_synthetic_optical("optical_t2_jun2026.tif", has_change=True)
    create_synthetic_optical("vrsbench_sample_01.png", has_change=False)
    print("All sample datasets generated successfully!")

if __name__ == "__main__":
    main()
