from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse
from pydantic import BaseModel
import subprocess
import os
from pathlib import Path
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("markcv")

app = FastAPI(title="MarkCV")

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

DATA_DIR = Path("data")
MARKDOWN_FILE = DATA_DIR / "cv.md"
PDF_FILE = DATA_DIR / "cv.pdf"
TEMPLATE_FILE = DATA_DIR / "template.tex"

DATA_DIR.mkdir(exist_ok=True)

if not MARKDOWN_FILE.exists():
    with open(MARKDOWN_FILE, "w") as f:
        f.write("# Your CV\n\nStart editing your CV here!")

class MarkdownContent(BaseModel):
    markdown: str

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

@app.get("/api/pdf")
async def generate_printable_html():
    try:
        # Generate HTML file
        html_file = DATA_DIR / "cv.html"
        
        # Generate HTML with pandoc
        cmd_html = [
            "pandoc",
            str(MARKDOWN_FILE),
            "-o", str(html_file),
            "--standalone",
            "--self-contained",
            "--css=/app/static/css/pdf.css",
        ]
        
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
        
        # Add print script to HTML file
        with open(html_file, 'r') as f:
            html_content = f.read()
        
        # Add print script before </body>
        print_script = """
        <script>
        window.onload = function() {
            // Add a small delay to ensure everything is loaded
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
        
        # Return the HTML file
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=9876, reload=True)