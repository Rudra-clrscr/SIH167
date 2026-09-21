import json
import os
from typing import List, Dict, Any, Optional
from app.core.config import BASE_DIR

REGISTRY_PATH = BASE_DIR / "app" / "agent" / "tools_registry.json"

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
