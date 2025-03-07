import json
import shutil
import uuid
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any
import logging

from fastapi import UploadFile, HTTPException
from app.config import DATA_DIR, IMAGE_DIR
from app.models import ImageData

logger = logging.getLogger("markcv")

class ImageService:
    def upload_image(self, file: UploadFile, alt_text: str) -> Dict[str, str]:
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
                "created_at": datetime.now().isoformat(),
                "x_offset": 0,
                "y_offset": 0
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
    
    def list_images(self) -> List[ImageData]:
        """List all uploaded images"""
        images_metadata_file = DATA_DIR / "images_metadata.json"
        if not images_metadata_file.exists():
            return []
            
        with open(images_metadata_file, "r") as f:
            images_metadata = json.load(f)
            
        return [
            ImageData(
                id=img["id"],
                url=f"/data/images/{img['id']}",
                alt_text=img["alt_text"],
                created_at=img["created_at"],
                x_offset=img.get("x_offset", 0),
                y_offset=img.get("y_offset", 0)
            )
            for img in images_metadata
        ]
    
    def update_image_position(self, image_id: str, x_offset: int, y_offset: int) -> bool:
        """Update the position offsets for an image"""
        images_metadata_file = DATA_DIR / "images_metadata.json"
        if not images_metadata_file.exists():
            return False
            
        with open(images_metadata_file, "r") as f:
            images_metadata = json.load(f)
        
        updated = False
        for img in images_metadata:
            if img["id"] == image_id:
                img["x_offset"] = x_offset
                img["y_offset"] = y_offset
                updated = True
                break
                
        if updated:
            with open(images_metadata_file, "w") as f:
                json.dump(images_metadata, f, indent=2)
                
        return updated