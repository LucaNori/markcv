import subprocess
import tempfile
import shutil
from pathlib import Path
from typing import Dict, List, Any, Optional
import logging

from fastapi import HTTPException
from fastapi.responses import FileResponse

from app.config import DATA_DIR, IMAGE_DIR
from app.services.template_service import TemplateService
from app.services.markdown_service import MarkdownService

logger = logging.getLogger("markcv")

class HTMLService:
    def __init__(self, template_service: TemplateService, markdown_service: MarkdownService):
        self.template_service = template_service
        self.markdown_service = markdown_service
    
    def generate_printable_html(
        self,
        template_id: str = "europass",
        paper_size: str = "a4",
        theme_color: str = "blue"
    ) -> FileResponse:
        """Generate a printable HTML version of the CV with the selected template"""
        try:
            # Get template path
            try:
                template_html = self.template_service.get_template_path(template_id)
            except FileNotFoundError:
                logger.warning(f"Template HTML not found for {template_id}, using default HTML generation")
                return self.generate_default_html()
            
            html_file = DATA_DIR / "cv.html"
            
            with tempfile.TemporaryDirectory() as temp_dir:
                temp_dir_path = Path(temp_dir)
                
                # Get markdown content
                content = self.markdown_service.get_markdown()
                
                # Extract profile image
                first_image, first_image_id, content = self.markdown_service.extract_profile_image(content)
                
                # Extract image attributes for positioning
                image_attributes = self.markdown_service.extract_image_attributes(content)
                
                # Extract and process sections
                sections = self.markdown_service.extract_sections(content)
                processed_sections = self.markdown_service.process_sections(sections)
                
                # Set up temporary directory for images
                temp_images_dir = temp_dir_path / "images"
                temp_images_dir.mkdir(exist_ok=True)
                
                # Process image paths in markdown
                self._process_images(content, temp_images_dir)
                
                # Write processed markdown to temp file
                temp_md_file = temp_dir_path / "input.md"
                with open(temp_md_file, "w") as f:
                    f.write(content)
                
                # Build pandoc command
                css_file = f"/app/static/css/themes/{template_id}.css"
                
                cmd_html = [
                    "pandoc",
                    str(temp_md_file),
                    "-o", str(html_file),
                    "--template", str(template_html),
                    "--standalone",
                    "--self-contained",
                    "--css", css_file,
                    "--variable", f"papersize={paper_size}",
                    "--variable", f"themecolor={theme_color}"
                ]
                
                # Add profile image if available
                if first_image:
                    cmd_html.extend(["--variable", f"first_image={first_image}"])
                    
                    # Add image positioning if available
                    if first_image_id and first_image_id in image_attributes:
                        x_offset = image_attributes[first_image_id]["x_offset"]
                        y_offset = image_attributes[first_image_id]["y_offset"]
                        cmd_html.extend(["--variable", f"image_x_offset={x_offset}"])
                        cmd_html.extend(["--variable", f"image_y_offset={y_offset}"])
                
                # Add processed sections
                for info in processed_sections["contact_info"]:
                    cmd_html.extend(["--variable", f"contact_info={info}"])
                
                for skill in processed_sections["skills"]:
                    cmd_html.extend(["--variable", f"skills={skill}"])
                
                for language in processed_sections["languages"]:
                    cmd_html.extend(["--variable", f"languages={language}"])
                
                cmd_html.extend(["--resource-path", str(temp_dir_path)])
                
                # Run pandoc
                logger.info(f"Generating print-friendly HTML: {' '.join(cmd_html)}")
                result_html = subprocess.run(
                    cmd_html,
                    check=True,
                    capture_output=True,
                    text=True
                )
                
                if not html_file.exists():
                    logger.error("HTML file was not generated")
                    raise HTTPException(status_code=500, detail="HTML generation failed")
                
                # Add print script
                self._add_print_script(html_file)
                
                logger.info(f"Print-friendly HTML generated successfully at {html_file}")
                
                return FileResponse(
                    path=str(html_file),
                    filename="cv.html",
                    media_type="text/html"
                )
        except subprocess.CalledProcessError as e:
            logger.error(f"HTML generation failed: {e.stderr}")
            raise HTTPException(status_code=500, detail=f"HTML generation failed: {e.stderr}")
        except Exception as e:
            logger.error(f"Error generating HTML: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def generate_default_html(self) -> FileResponse:
        """Generate HTML using the default method (fallback)"""
        try:
            html_file = DATA_DIR / "cv.html"
            
            cmd_html = [
                "pandoc",
                str(DATA_DIR / "cv.md"),
                "-o", str(html_file),
                "--standalone",
                "--self-contained",
                "--css=/app/static/css/pdf.css",
            ]
            
            logger.info(f"Generating default print-friendly HTML: {' '.join(cmd_html)}")
            result_html = subprocess.run(
                cmd_html,
                check=True,
                capture_output=True,
                text=True
            )
            
            if not html_file.exists():
                logger.error("HTML file was not generated")
                raise HTTPException(status_code=500, detail="HTML generation failed")
            
            self._add_print_script(html_file)
            
            logger.info(f"Default print-friendly HTML generated successfully at {html_file}")
            
            return FileResponse(
                path=str(html_file),
                filename="cv.html",
                media_type="text/html"
            )
        except Exception as e:
            logger.error(f"Error generating default HTML: {e}")
            raise HTTPException(status_code=500, detail=str(e))
    
    def _process_images(self, content: str, temp_images_dir: Path) -> str:
        """Copy images to temp directory and update paths in markdown"""
        import re
        
        image_pattern = r"!\[(.*?)\]\(((?:/api/images/|/data/images/)[^)]+)\)"
        images = re.findall(image_pattern, content)
        
        for alt_text, image_url in images:
            image_id = image_url.split("/")[-1]
            source_path = IMAGE_DIR / image_id
            
            if source_path.exists():
                dest_path = temp_images_dir / image_id
                shutil.copy(source_path, dest_path)
                
                content = content.replace(
                    f"![{alt_text}]({image_url})",
                    f"![{alt_text}](images/{image_id})"
                )
        
        return content
    
    def _add_print_script(self, html_file: Path) -> None:
        """Add print script to HTML file"""
        with open(html_file, 'r') as f:
            html_content = f.read()
        
        print_script = """
        <script>
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        }
        </script>
        """
        
        html_content = html_content.replace('</body>', f'{print_script}</body>')
        
        with open(html_file, 'w') as f:
            f.write(html_content)