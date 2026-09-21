import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from app.core.config import UPLOAD_DIR, SAMPLE_DATA_DIR, REPORTS_DIR
from app.core.geospatial import GeospatialImage
from app.core.compatibility import CompatibilityChecker
from app.agent.orchestrator import AgenticOrchestrator
from app.services.report_generator import ReportGenerator
from app.services.benchmark_runner import BenchmarkRunner

router = APIRouter(prefix="/api")
orchestrator = AgenticOrchestrator()

# In-memory storage for active uploaded geospatial images
ACTIVE_IMAGES: dict[str, GeospatialImage] = {}

class AnalyzeRequest(BaseModel):
    image_ids: List[str]
    query: str

class BenchmarkRequest(BaseModel):
    dataset_name: str

@router.post("/upload")
async def upload_images(files: List[UploadFile] = File(...)):
    uploaded = []
    for file in files:
        ext = os.path.splitext(file.filename)[1].lower()
        save_path = UPLOAD_DIR / file.filename
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        geo_img = GeospatialImage(str(save_path), name=file.filename)
        ACTIVE_IMAGES[file.filename] = geo_img
        
        uploaded.append({
            "image_id": file.filename,
            "filename": file.filename,
            "metadata": geo_img.to_metadata_dict(),
            "preview_base64": geo_img.get_rgb_preview_base64()
        })
    return {"status": "SUCCESS", "uploaded_images": uploaded}

@router.post("/compatibility")
async def check_compatibility(image_ids: List[str]):
    images = [ACTIVE_IMAGES[img_id] for img_id in image_ids if img_id in ACTIVE_IMAGES]
    if not images:
        raise HTTPException(status_code=400, detail="Images not found in active session.")
    res = CompatibilityChecker.validate_inputs(images)
    return res

@router.post("/analyze")
async def analyze_query(req: AnalyzeRequest):
    images = [ACTIVE_IMAGES[img_id] for img_id in req.image_ids if img_id in ACTIVE_IMAGES]
    if not images:
        raise HTTPException(status_code=400, detail="Invalid image selection. Please upload images first.")
    
    result = orchestrator.process_request(images, req.query)
    
    # Generate HTML report
    if result.get("success"):
        report_path = ReportGenerator.generate_html_report(result)
        result["report_filename"] = os.path.basename(report_path)

    return result

@router.get("/sample-datasets")
async def get_sample_datasets():
    samples = []
    if os.path.exists(SAMPLE_DATA_DIR):
        for fname in os.listdir(SAMPLE_DATA_DIR):
            fpath = SAMPLE_DATA_DIR / fname
            if os.path.isfile(fpath) and fname.lower().endswith((".tif", ".tiff", ".png", ".jpg", ".jpeg")):
                geo_img = GeospatialImage(str(fpath), name=fname)
                ACTIVE_IMAGES[fname] = geo_img
                samples.append({
                    "image_id": fname,
                    "filename": fname,
                    "metadata": geo_img.to_metadata_dict(),
                    "preview_base64": geo_img.get_rgb_preview_base64()
                })
    return {"samples": samples}

@router.get("/download-report/{filename}")
async def download_report(filename: str):
    file_path = REPORTS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Report file not found.")
    return FileResponse(path=file_path, filename=filename, media_type="text/html")

@router.post("/run-benchmark")
async def run_benchmark(req: BenchmarkRequest):
    res = BenchmarkRunner.run_benchmark_suite(req.dataset_name)
    return res
