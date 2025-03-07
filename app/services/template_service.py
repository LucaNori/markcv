import json
from pathlib import Path
from typing import List, Dict, Any
import logging

from app.config import TEMPLATE_DIR

logger = logging.getLogger("markcv")

class TemplateService:
    def get_templates(self) -> List[Dict[str, Any]]:
        """Get list of available templates"""
        templates = []
        
        for template_dir in TEMPLATE_DIR.iterdir():
            if template_dir.is_dir():
                metadata_file = template_dir / "metadata.json"
                if metadata_file.exists():
                    try:
                        with open(metadata_file, "r") as f:
                            metadata = json.load(f)
                            templates.append(metadata)
                    except Exception as e:
                        logger.error(f"Error reading template metadata: {e}")
        
        if not templates:
            templates.append({
                "id": "default",
                "name": "Default",
                "description": "Default CV template",
                "paperSizes": ["a4", "letter"],
                "recommendedFonts": ["DejaVu Sans", "Helvetica", "Arial"]
            })
        
        return templates
    
    def get_template_path(self, template_id: str) -> Path:
        """Get the path to a template's HTML file"""
        template_dir = TEMPLATE_DIR / template_id
        if not template_dir.exists() or not template_dir.is_dir():
            logger.warning(f"Template {template_id} not found, using default")
            template_id = "europass"
            template_dir = TEMPLATE_DIR / template_id
        
        template_html = template_dir / "template.html"
        if not template_html.exists():
            logger.warning(f"Template HTML not found for {template_id}")
            raise FileNotFoundError(f"Template HTML not found for {template_id}")
            
        return template_html