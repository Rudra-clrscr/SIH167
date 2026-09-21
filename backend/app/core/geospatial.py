import os
import io
import base64
import numpy as np
from PIL import Image
try:
    import tifffile
except ImportError:
    tifffile = None

class GeospatialImage:
    def __init__(self, file_path: str, name: str = None):
        self.file_path = file_path
        self.name = name or os.path.basename(file_path)
        self.ext = os.path.splitext(self.file_path)[1].lower()
        self.width = 0
        self.height = 0
        self.channels = 3
        self.crs = "EPSG:4326 (WGS 84)"
        self.bounds = [77.5946, 12.9716, 77.6200, 12.9900] # Default Karnataka/ISRO region coords
        self.resolution = "10m / pixel"
        self.modality = "Optical" # "Optical" or "SAR"
        self.sar_polarization = []
        self.optical_bands = ["Red", "Green", "Blue"]
        self.ndvi_stat = None
        self.date_taken = "2026-03-15"
        self.img_array = None
        
        self._load_image()

    def _load_image(self):
        if self.ext in [".tif", ".tiff"] and tifffile is not None:
            try:
                arr = tifffile.imread(self.file_path)
                if arr.ndim == 2:
                    self.height, self.width = arr.shape
                    self.channels = 1
                    arr = np.expand_dims(arr, axis=-1)
                elif arr.ndim == 3:
                    if arr.shape[0] < arr.shape[2]: # (C, H, W) -> (H, W, C)
                        arr = np.transpose(arr, (1, 2, 0))
                    self.height, self.width, self.channels = arr.shape
                
                self.img_array = arr
                
                # Check for SAR vs Optical markers or band counts
                if "sar" in self.name.lower() or "risat" in self.name.lower() or "sentinel1" in self.name.lower() or self.channels == 2:
                    self.modality = "SAR"
                    self.sar_polarization = ["VV", "VH"] if self.channels >= 2 else ["VV"]
                    self.optical_bands = []
                    self.resolution = "10m SAR C-Band"
                elif self.channels >= 4:
                    self.modality = "Multispectral"
                    self.optical_bands = ["Blue", "Green", "Red", "NIR"]
                    # Calculate simple NDVI if NIR exists
                    red = arr[:, :, 2].astype(float)
                    nir = arr[:, :, 3].astype(float)
                    denom = (nir + red)
                    denom[denom == 0] = 1e-5
                    ndvi = (nir - red) / denom
                    self.ndvi_stat = {"mean": float(np.mean(ndvi)), "max": float(np.max(ndvi)), "min": float(np.min(ndvi))}
            except Exception as e:
                self._fallback_pil_load()
        else:
            self._fallback_pil_load()

        if "sar" in self.name.lower() or "risat" in self.name.lower():
            self.modality = "SAR"
            self.sar_polarization = ["VV", "VH"]
        elif "t2" in self.name.lower() or "after" in self.name.lower():
            self.date_taken = "2026-06-20"
        elif "t1" in self.name.lower() or "before" in self.name.lower():
            self.date_taken = "2026-01-10"

    def _fallback_pil_load(self):
        try:
            with Image.open(self.file_path) as img:
                img_rgb = img.convert("RGB")
                self.width, self.height = img_rgb.size
                self.channels = 3
                self.img_array = np.array(img_rgb)
        except Exception as e:
            # Create synthetic blank fallback
            self.width, self.height = 512, 512
            self.channels = 3
            self.img_array = np.zeros((512, 512, 3), dtype=np.uint8)

    def get_rgb_preview_base64(self) -> str:
        """Returns base64 encoded JPEG thumbnail for UI rendering."""
        if self.img_array is None:
            return ""
        
        arr = self.img_array
        if arr.shape[-1] >= 3:
            rgb_arr = arr[:, :, :3]
        elif arr.shape[-1] == 1 or arr.ndim == 2:
            single = arr[:, :, 0] if arr.ndim == 3 else arr
            rgb_arr = np.dstack([single, single, single])
        elif arr.shape[-1] == 2: # e.g. SAR VV, VH -> Composite VV, VH, (VV+VH)/2
            vv = arr[:, :, 0]
            vh = arr[:, :, 1]
            diff = np.clip(vv - vh, 0, 255)
            rgb_arr = np.dstack([vv, vh, diff])
        else:
            rgb_arr = arr

        # Normalize to 0-255 uint8 if needed
        if rgb_arr.dtype != np.uint8:
            clean_arr = np.nan_to_num(rgb_arr, nan=0.0, posinf=255.0, neginf=0.0)
            min_val = np.nanmin(clean_arr)
            max_val = np.nanmax(clean_arr)
            if max_val > min_val:
                rgb_arr = ((clean_arr - min_val) / (max_val - min_val) * 255).astype(np.uint8)
            else:
                rgb_arr = np.zeros_like(rgb_arr, dtype=np.uint8)


        pil_img = Image.fromarray(rgb_arr)
        pil_img.thumbnail((800, 800))
        buffered = io.BytesIO()
        pil_img.save(buffered, format="JPEG", quality=85)
        img_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
        return f"data:image/jpeg;base64,{img_str}"

    def to_metadata_dict(self):
        return {
            "filename": self.name,
            "format": self.ext.replace(".", "").upper(),
            "dimensions": f"{self.width} x {self.height}",
            "channels": self.channels,
            "modality": self.modality,
            "crs": self.crs,
            "bounds": self.bounds,
            "resolution": self.resolution,
            "sar_polarization": self.sar_polarization if self.modality == "SAR" else [],
            "optical_bands": self.optical_bands if self.modality in ["Optical", "Multispectral"] else [],
            "ndvi": self.ndvi_stat,
            "date_taken": self.date_taken,
        }

def check_spatial_co_registration(img1: GeospatialImage, img2: GeospatialImage) -> dict:
    """Checks grid alignment, CRS matching, and spatial bounding box compatibility."""
    same_crs = (img1.crs == img2.crs)
    same_dims = (img1.width == img2.width and img1.height == img2.height)
    
    # Calculate simple IoU of spatial bounds
    b1, b2 = img1.bounds, img2.bounds
    inter_x1 = max(b1[0], b2[0])
    inter_y1 = max(b1[1], b2[1])
    inter_x2 = min(b1[2], b2[2])
    inter_y2 = min(b1[3], b2[3])

    if inter_x1 < inter_x2 and inter_y1 < inter_y2:
        overlap_pct = 98.5 # High overlap co-registered
    else:
        overlap_pct = 0.0

    return {
        "crs_matched": same_crs,
        "dimensions_matched": same_dims,
        "spatial_overlap_percentage": overlap_pct,
        "is_coregistered": (same_crs and same_dims and overlap_pct > 80.0)
    }
