import re
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import logging

from fastapi import HTTPException
from app.config import MARKDOWN_FILE, DEFAULT_MARKDOWN

logger = logging.getLogger("markcv")

class MarkdownService:
    def get_markdown(self) -> str:
        """Get the current markdown content"""
        try:
            with open(MARKDOWN_FILE, "r") as f:
                content = f.read()
            return content
        except FileNotFoundError:
            logger.error(f"Markdown file not found: {MARKDOWN_FILE}")
            with open(MARKDOWN_FILE, "w") as f:
                f.write(DEFAULT_MARKDOWN)
            return DEFAULT_MARKDOWN
        except Exception as e:
            logger.error(f"Error reading markdown file: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def save_markdown(self, content: str) -> bool:
        """Save markdown content to file"""
        try:
            with open(MARKDOWN_FILE, "w") as f:
                f.write(content)
            logger.info("Markdown file saved successfully")
            return True
        except Exception as e:
            logger.error(f"Error saving markdown file: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def extract_profile_image(self, content: str) -> Tuple[Optional[str], Optional[str], str]:
        """Extract the first image from markdown content and return image info and updated content"""
        image_pattern = r"!\[(.*?)\]\(((?:/api/images/|/data/images/)[^)]+)(?:\{[^}]*\})?\)"
        images = re.findall(image_pattern, content)
        
        first_image = None
        first_image_id = None
        first_image_markdown = None
        
        if images:
            first_alt_text, first_image_url = images[0]
            first_image_id = first_image_url.split("/")[-1]
            first_image = f"images/{first_image_id}"
            
            # Look for the full markdown including any attributes
            first_image_markdown_pattern = r"(!\[.*?\]\(" + re.escape(first_image_url) + r"\)(?:\{[^}]*\})?)"
            first_image_match = re.search(first_image_markdown_pattern, content)
            if first_image_match:
                first_image_markdown = first_image_match.group(1)
        
        # Remove the first image from content if it's near the top
        if first_image_markdown:
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if first_image_markdown in line and i < 5:
                    lines[i] = lines[i].replace(first_image_markdown, '')
                    content = '\n'.join(lines)
                    break
        
        return first_image, first_image_id, content
    
    def extract_image_attributes(self, markdown: str) -> Dict[str, Dict[str, int]]:
        """Extract custom attributes from image markdown"""
        image_pattern = r"!\[(.*?)\]\(((?:/api/images/|/data/images/)[^)]+)\)(?:\{([^}]*)\})?"
        images = re.findall(image_pattern, markdown)
        
        image_attributes = {}
        
        for alt_text, image_url, attrs_str in images:
            image_id = image_url.split("/")[-1]
            attrs = {"x_offset": 0, "y_offset": 0}
            
            if attrs_str:
                x_offset_match = re.search(r'\.x-offset=(-?\d+)', attrs_str)
                if x_offset_match:
                    attrs["x_offset"] = int(x_offset_match.group(1))
                
                y_offset_match = re.search(r'\.y-offset=(-?\d+)', attrs_str)
                if y_offset_match:
                    attrs["y_offset"] = int(y_offset_match.group(1))
            
            image_attributes[image_id] = attrs
        
        return image_attributes
    
    def extract_sections(self, content: str) -> Dict[str, List[str]]:
        """Extract contact info, skills, and languages sections from markdown"""
        sections = {
            "contact_info": [],
            "skills": [],
            "languages": []
        }
        
        lines = content.split("\n")
        
        # Extract contact info (lines after the main heading)
        for i, line in enumerate(lines):
            if line.startswith("# "):
                j = i + 1
                while j < len(lines) and not lines[j].startswith("## "):
                    if lines[j].strip() and not lines[j].startswith("!["):
                        sections["contact_info"].append(lines[j])
                    j += 1
                break
        
        # Extract skills and languages
        in_skills = False
        in_languages = False
        
        for line in lines:
            if line.startswith("## Skills"):
                in_skills = True
                in_languages = False
                continue
            elif line.startswith("## Languages"):
                in_skills = False
                in_languages = True
                continue
            elif line.startswith("## ") and line != "## Skills" and line != "## Languages":
                in_skills = False
                in_languages = False
                continue
            
            if in_skills and line.strip() and line.startswith("- "):
                sections["skills"].append(line)
            elif in_languages and line.strip() and line.startswith("- "):
                sections["languages"].append(line)
        
        return sections
    
    def process_markdown_text(self, text: str) -> str:
        """Process markdown text to HTML using pandoc"""
        try:
            with tempfile.NamedTemporaryFile(suffix=".md", mode="w+", delete=False) as temp_file:
                temp_file.write(text)
                temp_file_path = temp_file.name
            
            cmd = [
                "pandoc",
                temp_file_path,
                "-f", "markdown",
                "-t", "html"
            ]
            
            result = subprocess.run(
                cmd,
                check=True,
                capture_output=True,
                text=True
            )
            
            Path(temp_file_path).unlink()  # Delete the temp file
            
            # Remove wrapping <p> tags if it's a simple line
            html = result.stdout.strip()
            if html.startswith("<p>") and html.endswith("</p>") and html.count("<p>") == 1:
                html = html[3:-4]
            
            return html
        except Exception as e:
            logger.error(f"Error processing markdown: {e}")
            return text  # Return original text if processing fails
    
    def process_sections(self, sections: Dict[str, List[str]]) -> Dict[str, List[str]]:
        """Process each section item through pandoc to convert markdown to HTML"""
        processed_sections = {}
        
        for section_name, items in sections.items():
            processed_items = []
            for item in items:
                processed_item = self.process_markdown_text(item)
                processed_items.append(processed_item)
            
            processed_sections[section_name] = processed_items
        
        return processed_sections