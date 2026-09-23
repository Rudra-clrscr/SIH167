import json
import os
from typing import List, Dict, Any, Optional
from app.core.config import BASE_DIR

REGISTRY_PATH = BASE_DIR / "app" / "agent" / "tools_registry.json"

class ParameterWhitelister:
    @staticmethod
    def sanitize_parameters(permitted_schema: Dict[str, Any], raw_params: Dict[str, Any]) -> (Dict[str, Any], List[str]):
        """
        Sanitizes and strictly clamps input parameters against JSON schema definitions.
        Enforces data type coercion, range boundaries [min, max], and enum whitelist checks.
        """
        sanitized = {}
        diagnostic_logs = []

        # If schema is flat default dictionary (legacy support), wrap defaults
        schema_specs = {}
        for k, v in permitted_schema.items():
            if isinstance(v, dict):
                schema_specs[k] = v
            else:
                # Infer simple type spec
                if isinstance(v, float):
                    schema_specs[k] = {"type": "float", "default": v, "min": 0.0, "max": 1.0}
                elif isinstance(v, int):
                    schema_specs[k] = {"type": "int", "default": v, "min": 1, "max": 500}
                elif isinstance(v, bool):
                    schema_specs[k] = {"type": "bool", "default": v}
                else:
                    schema_specs[k] = {"type": "string", "default": str(v)}

        # Evaluate defined parameters
        raw_params = raw_params or {}
        for param_name, spec in schema_specs.items():
            default_val = spec.get("default")
            param_type = spec.get("type", "string")

            if param_name in raw_params:
                user_val = raw_params[param_name]
                try:
                    if param_type == "float":
                        flt_val = float(user_val)
                        min_v = spec.get("min", 0.0)
                        max_v = spec.get("max", 1.0)
                        clamped = max(min_v, min(max_v, flt_val))
                        sanitized[param_name] = clamped
                        if clamped != flt_val:
                            diagnostic_logs.append(f"Clamped '{param_name}' from {flt_val} to range [{min_v}, {max_v}] -> {clamped}")
                    elif param_type == "int":
                        int_val = int(user_val)
                        min_v = spec.get("min", 1)
                        max_v = spec.get("max", 500)
                        clamped = max(min_v, min(max_v, int_val))
                        sanitized[param_name] = clamped
                        if clamped != int_val:
                            diagnostic_logs.append(f"Clamped '{param_name}' from {int_val} to range [{min_v}, {max_v}] -> {clamped}")
                    elif param_type == "bool":
                        sanitized[param_name] = bool(user_val)
                    elif param_type == "enum":
                        allowed = spec.get("allowed", [])
                        if user_val in allowed:
                            sanitized[param_name] = user_val
                        else:
                            sanitized[param_name] = default_val
                            diagnostic_logs.append(f"Invalid enum '{user_val}' for '{param_name}'. Reset to default '{default_val}'")
                    else:
                        sanitized[param_name] = str(user_val)
                except Exception as e:
                    sanitized[param_name] = default_val
                    diagnostic_logs.append(f"Type conversion failed for '{param_name}'. Used default '{default_val}'")
            else:
                sanitized[param_name] = default_val

        # Log stripped non-whitelisted params
        for raw_k in raw_params.keys():
            if raw_k not in schema_specs:
                diagnostic_logs.append(f"Stripped un-whitelisted parameter '{raw_k}'")

        return sanitized, diagnostic_logs


class ToolRegistry:
    def __init__(self):
        self.tools = []
        self._load()

    def _load(self):
        if os.path.exists(REGISTRY_PATH):
            with open(REGISTRY_PATH, "r") as f:
                data = json.load(f)
                self.tools = data.get("tools", [])

    def get_tool(self, tool_id: str) -> Optional[Dict[str, Any]]:
        for tool in self.tools:
            if tool["id"] == tool_id:
                return tool
        return None

    def get_tools_for_input_mode(self, mode: str) -> List[Dict[str, Any]]:
        return [tool for tool in self.tools if mode in tool.get("accepted_inputs", [])]

    def list_all_tools(self) -> List[Dict[str, Any]]:
        return self.tools

