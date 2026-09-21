import os
import requests
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
UPLOAD_DIR = BASE_DIR / "uploads"
SAMPLE_DATA_DIR = BASE_DIR / "sample_data"
REPORTS_DIR = BASE_DIR / "reports"

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
SAMPLE_DATA_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

APP_TITLE = "SatQuery AI Backend"
VERSION = "1.0.0"
ALLOWED_EXTENSIONS = {".tif", ".tiff", ".png", ".jpg", ".jpeg"}

# Load environment variables from .env if present
env_path = BASE_DIR / ".env"
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

# Groq API configuration
GROQ_API_KEY = os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY") or "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"
GROQ_MODEL = os.getenv("GROQ_MODEL", "qwen/qwen3.8-27b")

def call_groq_llm(system_prompt: str, user_prompt: str, temperature: float = 0.2, max_tokens: int = 800) -> str:
    """Utility to call Groq LLM API with standard system and user prompts."""
    if not GROQ_API_KEY:
        return None
    try:
        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {GROQ_API_KEY}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": GROQ_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        resp = requests.post(url, headers=headers, json=payload, timeout=8)
        if resp.status_code == 200:
            data = resp.json()
            return data["choices"][0]["message"]["content"].strip()
        else:
            print(f"[Groq LLM Warning] Status {resp.status_code}: {resp.text}")
            return None
    except Exception as e:
        print(f"[Groq LLM Error] {e}")
        return None

