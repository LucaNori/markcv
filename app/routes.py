from fastapi import APIRouter, HTTPException, Request, UploadFile, File, Form, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, FileResponse, RedirectResponse

from app.models import MarkdownContent, TemplateSettings, ImageData
from app.services.template_service import TemplateService
from app.services.markdown_service import MarkdownService
from app.services.image_service import ImageService
from app.services.html_service import HTMLService

router = APIRouter()
templates = Jinja2Templates(directory="templates")

# Service instances
template_service = TemplateService()
markdown_service = MarkdownService()
image_service = ImageService()
html_service = HTMLService(template_service, markdown_service)

@router.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/api/markdown")
async def get_markdown():
    content = markdown_service.get_markdown()
    return {"content": content}

@router.post("/api/markdown")
async def save_markdown(content: MarkdownContent):
    success = markdown_service.save_markdown(content.markdown)
    return {"status": "success" if success else "error"}

@router.get("/api/templates")
async def get_templates():
    templates = template_service.get_templates()
    return templates

@router.post("/api/images/upload")
async def upload_image(
    file: UploadFile = File(...),
    alt_text: str = Form("")
):
    result = image_service.upload_image(file, alt_text)
    return result

@router.get("/api/images")
async def list_images():
    images = image_service.list_images()
    return images

@router.post("/api/images/{image_id}/position")
async def update_image_position(image_id: str, x_offset: int = 0, y_offset: int = 0):
    success = image_service.update_image_position(image_id, x_offset, y_offset)
    if not success:
        raise HTTPException(status_code=404, detail="Image not found")
    return {"status": "success"}

@router.get("/api/pdf")
async def generate_printable_html(
    template_id: str = "europass",
    paper_size: str = "a4",
    theme_color: str = "blue"
):
    return html_service.generate_printable_html(
        template_id=template_id,
        paper_size=paper_size,
        theme_color=theme_color
    )