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
    def answer_general_query(query: str) -> str:
        """Answers general Earth Observation, satellite, GIS, and Remote Sensing questions."""
        user_prompt = (
            f"User Question: '{query}'\n\n"
            f"Instruction: Provide an authoritative, detailed, and professional response as the SatQuery AI Assistant. "
            f"Break down remote sensing concepts, sensor physics, orbital characteristics, spectral indices, or workflows with bold headings, bullet points, and practical satellite examples."
        )
        resp = call_groq_llm(SYSTEM_PROMPT_COPILOT, user_prompt, temperature=0.25, max_tokens=750)
        if resp:
            return resp
        return f"SatQuery AI Copilot: Direct answer for query '{query}'. (Please connect Groq API key or select satellite images for localized spatial analytics)."

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

        # Construct image metadata & numpy image processing analytics context
        image_contexts = []
        for i, img in enumerate(images, start=1):
            meta = img.to_metadata_dict()
            analytics = meta.get("image_analytics", {})
            image_contexts.append(
                f"Image #{i} ({img.name}): Modality={meta.get('modality')}, "
                f"Dimensions={meta.get('dimensions')}, Channels={meta.get('channels')}, "
                f"CRS={meta.get('crs')}, Resolution={meta.get('resolution')}\n"
                f"Computed Array Analytics: Land-Cover Breakdown={analytics.get('land_cover_breakdown')}, "
                f"NDVI Index={analytics.get('ndvi_index')}, NDWI Index={analytics.get('ndwi_index')}, "
                f"SAR Analytics={analytics.get('sar_radar_analytics')}"
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
            f"Satellite Metadata & Computed Image Processing Analytics:\n" + "\n".join(image_contexts) + "\n"
            f"{boxes_summary}\n"
            f"Preliminary Analytical Findings:\n{raw_answer}\n\n"
            f"Instruction: Generate an executive satellite intelligence response that addresses the user's query directly, "
            f"incorporating the computed spectral indices, sensor physics, land cover percentages, and spatial evidence. Keep it professional, crisp, and well-structured."
        )

        llm_response = call_groq_llm(SYSTEM_PROMPT_COPILOT, user_prompt, temperature=0.2, max_tokens=750)
        
        if llm_response:
            return llm_response
        return raw_answer

