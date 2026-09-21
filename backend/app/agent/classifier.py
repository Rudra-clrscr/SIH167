import re
from typing import Dict, Any, List

class QueryClassifier:
    @staticmethod
    def classify(query: str, detected_input_mode: str, image_count: int) -> Dict[str, Any]:
        q_lower = query.lower()
        
        # 1. Grounding / Localization keywords
        grounding_keywords = ["highlight", "show", "where", "locate", "find", "outline", "box", "detect", "bounding box"]
        # 2. Change / Bi-temporal keywords
        change_keywords = ["changed", "change", "difference", "before and after", "increase", "decrease", "transition", "built-up increased", "loss", "gained", "t1", "t2"]
        # 3. Optical-SAR cross-modal keywords
        fusion_keywords = ["optical and sar", "sar and optical", "combine", "together", "radar", "risat", "sentinel-1", "backscatter", "fused", "cross-modal"]
        # 4. Captioning keywords
        caption_keywords = ["describe", "summary", "overview", "land-cover", "land cover", "scene description", "caption"]

        assigned_task = "SINGLE_VQA"
        primary_tool_id = "rs_vqa_tool"
        rationale = "Defaulting to Remote Sensing Visual Question Answering."

        if detected_input_mode == "BITEMPORAL" or any(kw in q_lower for kw in change_keywords):
            assigned_task = "BITEMPORAL_CHANGE"
            primary_tool_id = "bitemporal_change_tool"
            rationale = "Detected bi-temporal image pair and/or temporal change query keywords."
        elif detected_input_mode == "CROSS_MODAL" or any(kw in q_lower for kw in fusion_keywords):
            assigned_task = "OPTICAL_SAR_FUSION"
            primary_tool_id = "optical_sar_fusion_tool"
            rationale = "Detected cross-modal Optical + SAR pair or fusion query request."
        elif any(kw in q_lower for kw in grounding_keywords):
            assigned_task = "REGION_GROUNDING"
            primary_tool_id = "text_grounding_tool"
            rationale = "Query requests spatial region localization / bounding box grounding."
        elif any(kw in q_lower for kw in caption_keywords):
            assigned_task = "SCENE_CAPTION"
            primary_tool_id = "rs_captioning_tool"
            rationale = "Query requests high-level scene description / land-cover summary."

        return {
            "task_type": assigned_task,
            "primary_tool_id": primary_tool_id,
            "rationale": rationale,
            "confidence": 0.95
        }
