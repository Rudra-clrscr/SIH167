import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.core.config import APP_TITLE, VERSION, REPORTS_DIR, BASE_DIR
from app.api.router import router as api_router

app = FastAPI(title=APP_TITLE, version=VERSION)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

# Serve generated reports as static files
if not os.path.exists(REPORTS_DIR):
    os.makedirs(REPORTS_DIR, exist_ok=True)

app.mount("/reports", StaticFiles(directory=str(REPORTS_DIR)), name="reports")

@app.get("/")
async def root():
    return {
        "app": APP_TITLE,
        "version": VERSION,
        "status": "OPERATIONAL",
        "problem_statement": "ISRO SIH 2026 PS 26167 - SatQuery AI",
        "docs": "/docs"
    }

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)

