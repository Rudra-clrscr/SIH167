import os
import sys

# Add the backend directory to the sys path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.geospatial import GeospatialImage
from app.models.change_detection import RSBiTemporalChangeModel

def evaluate():
    print("="*60)
    print("Evaluating SatQuery AI on ISRO Multisensor Test Datasets")
    print("="*60)
    
    sample_dir = os.path.join(os.path.dirname(__file__), '..', 'sample_data')
    
    # 1. Optical + SAR Cross-Modal
    print("\n[Test 1] Optical + SAR Feature Extraction")
    optical_path = os.path.join(sample_dir, 'optical_sentinel2_bangalore.tif')
    sar_path = os.path.join(sample_dir, 'sar_risat1_bangalore.tif')
    
    if os.path.exists(optical_path) and os.path.exists(sar_path):
        opt_img = GeospatialImage(optical_path)
        sar_img = GeospatialImage(sar_path)
        
        opt_stats = opt_img.perform_image_analytics()
        sar_stats = sar_img.perform_image_analytics()
        
        print("  - Optical Bangalore Scene:")
        print(f"    - Vegetation: {opt_stats['land_cover_breakdown'].get('vegetation_pct', 0):.2f}%")
        print(f"    - Built-up: {opt_stats['land_cover_breakdown'].get('builtup_pct', 0):.2f}%")
        print(f"    - NDVI: {opt_stats.get('ndvi_index')}")
        
        print("  - SAR Bangalore Scene (Cloud-penetrating):")
        print(f"    - Estimated Built-up from Backscatter: {sar_stats['sar_radar_analytics'].get('estimated_builtup_pct', 0):.2f}%")
    else:
        print("  - Missing Bangalore datasets.")

    # 2. Bi-Temporal Change Detection
    print("\n[Test 2] Bi-Temporal Change Detection")
    t1_path = os.path.join(sample_dir, 'optical_t1_jan2026.tif')
    t2_path = os.path.join(sample_dir, 'optical_t2_jun2026.tif')
    
    if os.path.exists(t1_path) and os.path.exists(t2_path):
        t1_img = GeospatialImage(t1_path)
        t2_img = GeospatialImage(t2_path)
        engine = RSBiTemporalChangeModel()
        result = engine.run([t1_img, t2_img], "detect changes between these dates", {})
        
        print("  - Change Analysis Results:")
        print(f"    - Answer: {result.get('answer', '')}")
        print(f"    - Change Metrics: {result.get('change_metrics', {})}")
        
        if 'grounding_boxes' in result and len(result['grounding_boxes']) > 0:
            print("    - Top Detected Change Regions (Geospatial):")
            for idx, cluster in enumerate(result['grounding_boxes'][:3]):
                print(f"      [{idx+1}] Engine: {cluster['geo_coordinates']['engine']}")
                bbox = cluster['geo_coordinates'].get('geo_bbox', [])
                if bbox:
                    print(f"          BBox (Lon/Lat): {bbox}")
    else:
        print("  - Missing bi-temporal datasets.")

    print("\n============================================================")
    print("Evaluation Complete.")
    print("============================================================")

if __name__ == "__main__":
    evaluate()
