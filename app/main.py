from fastapi import FastAPI, HTTPException, Request, UploadFile, File, Form
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from pydantic import BaseModel
import subprocess
import os
import json
import re
import shutil
import tempfile
import uuid
from datetime import datetime
from pathlib import Path
import logging
from typing import List, Optional

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("markcv")

app = FastAPI(title="MarkCV")

app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/data", StaticFiles(directory="data"), name="data")
app.mount("/cv_templates", StaticFiles(directory="cv_templates"), name="cv_templates")
templates = Jinja2Templates(directory="templates")

DATA_DIR = Path("data")
MARKDOWN_FILE = DATA_DIR / "cv.md"
PDF_FILE = DATA_DIR / "cv.pdf"
TEMPLATE_DIR = Path("cv_templates")
IMAGE_DIR = DATA_DIR / "images"

DATA_DIR.mkdir(exist_ok=True)
IMAGE_DIR.mkdir(exist_ok=True)

if not MARKDOWN_FILE.exists():
    with open(MARKDOWN_FILE, "w") as f:
        f.write("# Your CV\n\nStart editing your CV here!")

class MarkdownContent(BaseModel):
    markdown: str

class TemplateSettings(BaseModel):
    template_id: str
    paper_size: str = "a4"
    theme_color: str = "blue"

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/api/markdown")
async def get_markdown():
    try:
        with open(MARKDOWN_FILE, "r") as f:
            content = f.read()
        return {"content": content}
    except FileNotFoundError:
        logger.error(f"Markdown file not found: {MARKDOWN_FILE}")
        raise HTTPException(status_code=404, detail="Markdown file not found")
    except Exception as e:
        logger.error(f"Error reading markdown file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/markdown")
async def save_markdown(content: MarkdownContent):
    try:
        with open(MARKDOWN_FILE, "w") as f:
            f.write(content.markdown)
        logger.info("Markdown file saved successfully")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Error saving markdown file: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/templates")
async def get_templates():
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

@app.post("/api/images/upload")
async def upload_image(
    file: UploadFile = File(...),
    alt_text: str = Form("")
):
    """Upload an image for the CV"""
    try:
        content_type = file.content_type
        if not content_type.startswith("image/"):
            raise HTTPException(
                status_code=400,
                detail="Only image files are allowed"
            )
            
        file_extension = file.filename.split(".")[-1].lower()
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = IMAGE_DIR / unique_filename
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        image_data = {
            "id": unique_filename,
            "original_name": file.filename,
            "path": str(file_path),
            "alt_text": alt_text,
            "created_at": datetime.now().isoformat()
        }
        
        images_metadata_file = DATA_DIR / "images_metadata.json"
        if images_metadata_file.exists():
            with open(images_metadata_file, "r") as f:
                images_metadata = json.load(f)
        else:
            images_metadata = []
            
        images_metadata.append(image_data)
        
        with open(images_metadata_file, "w") as f:
            json.dump(images_metadata, f, indent=2)
        
        return {
            "id": unique_filename,
            "url": f"/data/images/{unique_filename}",
            "alt_text": alt_text
        }
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/images")
async def list_images():
    """List all uploaded images"""
    images_metadata_file = DATA_DIR / "images_metadata.json"
    if not images_metadata_file.exists():
        return []
        
    with open(images_metadata_file, "r") as f:
        images_metadata = json.load(f)
        
    return [
        {
            "id": img["id"],
            "url": f"/data/images/{img['id']}",
            "alt_text": img["alt_text"],
            "created_at": img["created_at"]
        }
        for img in images_metadata
    ]

@app.get("/api/pdf")
async def generate_printable_html(
    template_id: str = "europass",
    paper_size: str = "a4",
    theme_color: str = "blue"
):
    """Generate a printable HTML version of the CV with the selected template"""
    try:
        template_dir = TEMPLATE_DIR / template_id
        if not template_dir.exists() or not template_dir.is_dir():
            logger.warning(f"Template {template_id} not found, using default")
            template_id = "europass"
            template_dir = TEMPLATE_DIR / template_id
        
        template_html = template_dir / "template.html"
        if not template_html.exists():
            logger.warning(f"Template HTML not found for {template_id}, using default HTML generation")
            return generate_default_html()
        
        html_file = DATA_DIR / "cv.html"
        
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_dir_path = Path(temp_dir)
            
            with open(MARKDOWN_FILE, "r") as f:
                content = f.read()
            
            image_pattern = r"!\[(.*?)\]\(((?:/api/images/|/data/images/)[^)]+)\)"
            images = re.findall(image_pattern, content)
            
            temp_images_dir = temp_dir_path / "images"
            temp_images_dir.mkdir(exist_ok=True)
            
            first_image = None
            first_image_markdown = None
            if images:
                first_alt_text, first_image_url = images[0]
                first_image_id = first_image_url.split("/")[-1]
                first_image = f"images/{first_image_id}"
                
                first_image_markdown_pattern = r"(!\[.*?\]\(" + re.escape(first_image_url) + r"\))"
                first_image_match = re.search(first_image_markdown_pattern, content)
                if first_image_match:
                    first_image_markdown = first_image_match.group(1)
            
            if first_image_markdown:
                lines = content.split('\n')
                for i, line in enumerate(lines):
                    if first_image_markdown in line and i < 5:
                        lines[i] = lines[i].replace(first_image_markdown, '')
                        content = '\n'.join(lines)
                        break
            
            contact_info = []
            lines = content.split("\n")
            for i, line in enumerate(lines):
                if line.startswith("# "):
                    j = i + 1
                    while j < len(lines) and not lines[j].startswith("## "):
                        if lines[j].strip() and not lines[j].startswith("!["):
                            contact_info.append(lines[j])
                        j += 1
                    break
            
            skills = []
            languages = []
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
                    skills.append(line)
                elif in_languages and line.strip() and line.startswith("- "):
                    languages.append(line)
            
            temp_md_file = temp_dir_path / "input.md"
            with open(temp_md_file, "w") as f:
                f.write(content)
            
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
            
            with open(temp_md_file, "w") as f:
                f.write(content)
            
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
            
            if first_image:
                cmd_html.extend(["--variable", f"first_image={first_image}"])
            
            for info in contact_info:
                cmd_html.extend(["--variable", f"contact_info={info}"])
            
            for skill in skills:
                cmd_html.extend(["--variable", f"skills={skill}"])
            
            for language in languages:
                cmd_html.extend(["--variable", f"languages={language}"])
            
            cmd_html.extend(["--resource-path", str(temp_dir_path)])
            
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

def generate_default_html():
    """Generate HTML using the default method (fallback)"""
    try:
        html_file = DATA_DIR / "cv.html"
        
        cmd_html = [
            "pandoc",
            str(MARKDOWN_FILE),
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
        
        logger.info(f"Default print-friendly HTML generated successfully at {html_file}")
        
        return FileResponse(
            path=str(html_file),
            filename="cv.html",
            media_type="text/html"
        )
    except Exception as e:
        logger.error(f"Error generating default HTML: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=9876, reload=True)
