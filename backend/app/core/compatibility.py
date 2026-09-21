from typing import List, Dict, Any
from app.core.geospatial import GeospatialImage, check_spatial_co_registration

class CompatibilityChecker:
    @staticmethod
    def validate_inputs(images: List[GeospatialImage], expected_mode: str = "AUTO") -> Dict[str, Any]:
        """
        Validates input configuration against SIH PS 26167 rules.
        Modes: 'SINGLE', 'BITEMPORAL', 'CROSS_MODAL', or 'AUTO'
        """
        count = len(images)
        if count == 0:
            return {
                "status": "INVALID",
                "mode": "NONE",
                "message": "No input images provided.",
                "details": [],
                "can_proceed": False
            }

        details = []
        is_valid = True
        warnings = []
        
        # Determine actual configuration
        if count == 1:
            detected_mode = "SINGLE"
            img = images[0]
            details.append(f"Single image uploaded: {img.name} ({img.modality}, {img.width}x{img.height})")
            if img.ext not in [".tif", ".tiff", ".png", ".jpg", ".jpeg"]:
                is_valid = False
                details.append(f"Unsupported extension {img.ext}. Must be GeoTIFF (.tif/.tiff) or PNG/JPEG benchmark format.")
        elif count == 2:
            img1, img2 = images[0], images[1]
            coreg = check_spatial_co_registration(img1, img2)
            
            # Modal check
            mods = {img1.modality, img2.modality}
            if "SAR" in mods and ("Optical" in mods or "Multispectral" in mods):
                detected_mode = "CROSS_MODAL"
                details.append(f"Cross-modal pair detected: {img1.name} ({img1.modality}) + {img2.name} ({img2.modality})")
            else:
                detected_mode = "BITEMPORAL"
                details.append(f"Bi-temporal pair detected: {img1.name} ({img1.date_taken}) and {img2.name} ({img2.date_taken})")
            
            if not coreg["crs_matched"]:
                warnings.append(f"CRS Mismatch: Image 1 uses {img1.crs}, Image 2 uses {img2.crs}. Automated co-reprojection applied.")
            if not coreg["dimensions_matched"]:
                warnings.append(f"Dimension Mismatch: Image 1 ({img1.width}x{img1.height}), Image 2 ({img2.width}x{img2.height}). Spatial rescaling applied.")
            if coreg["spatial_overlap_percentage"] < 50.0:
                is_valid = False
                details.append(f"Insufficient spatial overlap between images ({coreg['spatial_overlap_percentage']}%). Must cover the same geographic area.")
        else:
            detected_mode = "MULTIPLE"
            is_valid = False
            details.append(f"Unsupported image count ({count}). SatQuery AI supports 1 image or 2 co-registered images (bi-temporal or optical-SAR pair).")

        status = "VALID" if is_valid else "INVALID"
        if is_valid and len(warnings) > 0:
            status = "WARNING"

        return {
            "status": status,
            "detected_mode": detected_mode,
            "image_count": count,
            "details": details,
            "warnings": warnings,
            "can_proceed": is_valid,
            "execution_metadata": {
                "formats": [img.ext for img in images],
                "modalities": [img.modality for img in images],
                "crs_list": [img.crs for img in images]
            }
        }
