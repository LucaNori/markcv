from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import logging
from pathlib import Path

from app.routes import router
from app.config import DATA_DIR, MARKDOWN_FILE, DEFAULT_MARKDOWN, HOST, PORT

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger("markcv")

# Initialize FastAPI app
app = FastAPI(title="MarkCV")

# Mount static directories
app.mount("/static", StaticFiles(directory="static"), name="static")
app.mount("/data", StaticFiles(directory="data"), name="data")
app.mount("/cv_templates", StaticFiles(directory="cv_templates"), name="cv_templates")

# Include API routes
app.include_router(router)

# Initialize default markdown file if it doesn't exist
if not MARKDOWN_FILE.exists():
    with open(MARKDOWN_FILE, "w") as f:
        f.write(DEFAULT_MARKDOWN)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=True)
