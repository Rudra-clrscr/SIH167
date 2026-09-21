from typing import List, Dict, Any
from app.core.config import call_groq_llm, GROQ_MODEL, GROQ_API_KEY
from app.core.geospatial import GeospatialImage

SYSTEM_PROMPT_COPILOT = (
    "You are SatQuery AI, an expert Remote Sensing and Earth Observation Intelligence Copilot powered by ultra-fast LLM inference. "
    "Your objective is to provide authoritative, rigorous, and highly contextual satellite imagery insights. "
    "You analyze multi-spectral sensors (Sentinel-2, Landsat-9, PlanetScope), SAR radar backscatter (RISAT-1, Sentinel-1 C-Band), "
    "bi-temporal change detection, land-cover classification, spectral vegetation/water indices (NDVI, NDWI), and spatial region grounding. "
    "Structure your responses cleanly with concise bullet points, bold key technical terms, and actionable executive summaries."
)

class SatQueryLLMAssistant:
    @staticmethod
    def is_available() -> bool:
        return bool(GROQ_API_KEY)

    @staticmethod
    def synthesize_analysis(
        query: str,
        task_type: str,
        tool_name: str,
        images: List[GeospatialImage],
        raw_answer: str,
        grounding_boxes: List[Dict[str, Any]] = None
    ) -> str:
        """Uses Groq LLM to synthesize high-level satellite intelligence based on raw model outputs and image metadata."""
        if not SatQueryLLMAssistant.is_available():
            return raw_answer

        # Construct image metadata context
        image_contexts = []
        for i, img in enumerate(images, start=1):
            meta = img.to_metadata_dict()
            image_contexts.append(
                f"Image #{i} ({img.name}): Modality={meta.get('modality')}, "
                f"Dimensions={meta.get('dimensions')}, Channels={meta.get('channels')}, "
                f"CRS={meta.get('crs')}, Resolution={meta.get('resolution')}"
            )
        
        boxes_summary = ""
        if grounding_boxes:
            boxes_summary = "Spatial Grounding Detections: " + ", ".join(
                [f"{b.get('label', 'Region')} (bbox: {b.get('bbox')}, confidence: {b.get('confidence', 0.9):.2f})" for b in grounding_boxes]
            )

        user_prompt = (
            f"User Query: '{query}'\n"
            f"Assigned Task Type: {task_type}\n"
            f"Specialist Backbone/Tool: {tool_name}\n"
            f"Satellite Metadata:\n" + "\n".join(image_contexts) + "\n"
            f"{boxes_summary}\n"
            f"Preliminary Analytical Findings:\n{raw_answer}\n\n"
            f"Instruction: Generate an executive satellite intelligence response that addresses the user's query directly, "
            f"incorporating the spectral, sensor, and spatial evidence. Keep it professional, crisp, and well-structured."
        )

        llm_response = call_groq_llm(SYSTEM_PROMPT_COPILOT, user_prompt, temperature=0.2, max_tokens=700)
        
        if llm_response:
            return llm_response
        return raw_answer
