from abc import ABC, abstractmethod
from typing import Dict, Any, List
from app.core.geospatial import GeospatialImage

class BaseRSModel(ABC):
    def __init__(self, name: str, backbone: str):
        self.name = name
        self.backbone = backbone

    @abstractmethod
    def run(self, images: List[GeospatialImage], query: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
        pass
