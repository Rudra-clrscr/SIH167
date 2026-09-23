import time
from typing import List, Dict, Any
from app.core.geospatial import GeospatialImage
from app.core.compatibility import CompatibilityChecker
from app.agent.classifier import QueryClassifier
from app.agent.registry import ToolRegistry, ParameterWhitelister
from app.models.vqa_caption import RSVQACaptionModel
from app.models.grounding import RSGroundingModel
from app.models.change_detection import RSBiTemporalChangeModel
from app.models.optical_sar_fusion import RSOpticalSARFusionModel
from app.services.llm_assistant import SatQueryLLMAssistant
from app.core.config import HF_VLM_MODEL_ID

class AgenticOrchestrator:
    def __init__(self):
        self.registry = ToolRegistry()
        # Instantiate model instances
        self.models = {
            "rs_vqa_tool": RSVQACaptionModel(),
            "rs_captioning_tool": RSVQACaptionModel(),
            "text_grounding_tool": RSGroundingModel(),
            "bitemporal_change_tool": RSBiTemporalChangeModel(),
            "optical_sar_fusion_tool": RSOpticalSARFusionModel()
        }

    def process_request(self, images: List[GeospatialImage], query: str) -> Dict[str, Any]:
        start_time = time.time()
        trace_log = []

        # Step 1: Input Compatibility Check
        step1_start = time.time()
        comp_res = CompatibilityChecker.validate_inputs(images)
        step1_latency = round((time.time() - step1_start) * 1000, 2)
        
        trace_log.append({
            "step": 1,
            "action": "INPUT_COMPATIBILITY_CHECK",
            "status": comp_res["status"],
            "details": f"Mode: {comp_res['detected_mode']}, Count: {comp_res['image_count']}",
            "diagnostics": comp_res["details"] + comp_res.get("warnings", []),
            "latency_ms": step1_latency
        })

        if not comp_res["can_proceed"]:
            return {
                "success": False,
                "error": "Input compatibility check failed.",
                "trace_log": trace_log,
                "compatibility": comp_res
            }

        # Step 2: Task Classification
        step2_start = time.time()
        classification = QueryClassifier.classify(query, comp_res["detected_mode"], comp_res["image_count"])
        step2_latency = round((time.time() - step2_start) * 1000, 2)

        trace_log.append({
            "step": 2,
            "action": "TASK_CLASSIFICATION",
            "task_type": classification["task_type"],
            "selected_tool_id": classification["primary_tool_id"],
            "rationale": classification["rationale"],
            "latency_ms": step2_latency
        })

        # Step 3: Tool Selection & Registry Parameter Whitelisting
        step3_start = time.time()
        tool_meta = self.registry.get_tool(classification["primary_tool_id"])
        schema_params = tool_meta["permitted_parameters"] if tool_meta else {}
        
        # Rigorous parameter whitelisting and range clamping
        sanitized_params, param_diagnostics = ParameterWhitelister.sanitize_parameters(schema_params, {})
        step3_latency = round((time.time() - step3_start) * 1000, 2)

        trace_log.append({
            "step": 3,
            "action": "TOOL_REGISTRY_SELECTION",
            "tool_name": tool_meta["name"] if tool_meta else classification["primary_tool_id"],
            "adapted_backbone": tool_meta.get("adapted_backbone", "RS VLM") if tool_meta else "RS VLM",
            "permitted_parameters": schema_params,
            "clamped_parameters": sanitized_params,
            "parameter_diagnostics": param_diagnostics or ["All parameters strictly validated against schema whitelist."],
            "latency_ms": step3_latency
        })

        # Step 4: Specialist Model Execution
        step4_start = time.time()
        model_instance = self.models.get(classification["primary_tool_id"], self.models["rs_vqa_tool"])
        model_output = model_instance.run(images, query, sanitized_params)
        step4_latency = round((time.time() - step4_start) * 1000, 2)

        trace_log.append({
            "step": 4,
            "action": "SPECIALIST_MODEL_INFERENCE",
            "model_name": model_instance.name,
            "confidence_score": model_output.get("confidence", 0.90),
            "latency_ms": step4_latency
        })

        # Step 5: Open-Source HuggingFace Transformers VLM Synthesis
        llm_start = time.time()
        final_answer = SatQueryLLMAssistant.synthesize_analysis(
            query=query,
            task_type=classification["task_type"],
            tool_name=tool_meta["name"] if tool_meta else model_instance.name,
            images=images,
            raw_answer=model_output.get("answer", ""),
            grounding_boxes=model_output.get("grounding_boxes", [])
        )
        llm_latency = round((time.time() - llm_start) * 1000, 2)

        from app.core.config import HF_VLM_MODEL_ID, HF_TRANSFORMERS_ENGINE
        trace_log.append({
            "step": 5,
            "action": f"HUGGINGFACE_OPEN_SOURCE_VLM_SYNTHESIS ({HF_VLM_MODEL_ID})",
            "details": "Framed executive response using local Open-Source HuggingFace Transformers VLM Engine",
            "latency_ms": llm_latency
        })

        # Step 6: Output Integration & Evidence Assembly
        total_latency = round((time.time() - start_time) * 1000, 2)
        trace_log.append({
            "step": 6,
            "action": "OUTPUT_INTEGRATION",
            "total_execution_time_ms": total_latency,
            "status": "SUCCESS"
        })

        return {
            "success": True,
            "query": query,
            "task_type": classification["task_type"],
            "selected_tool": tool_meta,
            "answer": final_answer,
            "grounding_boxes": model_output.get("grounding_boxes", []),
            "confidence": model_output.get("confidence", 0.90),
            "image_previews": [img.get_rgb_preview_base64() for img in images],
            "image_metadata": [img.to_metadata_dict() for img in images],
            "trace_log": trace_log,
            "total_latency_ms": total_latency,
            "llm_engine": f"HuggingFace {HF_VLM_MODEL_ID}"
        }

