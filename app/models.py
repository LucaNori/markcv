from pydantic import BaseModel
from typing import List, Optional

class MarkdownContent(BaseModel):
    markdown: str

class TemplateSettings(BaseModel):
    template_id: str
    paper_size: str = "a4"
    theme_color: str = "blue"

class ImageData(BaseModel):
    id: str
    url: str
    alt_text: str
    created_at: str
    x_offset: Optional[int] = 0
    y_offset: Optional[int] = 0

class ImageUploadResponse(BaseModel):
    id: str
    url: str
    alt_text: str