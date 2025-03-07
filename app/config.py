from pathlib import Path

# Application paths
DATA_DIR = Path("data")
MARKDOWN_FILE = DATA_DIR / "cv.md"
PDF_FILE = DATA_DIR / "cv.pdf"
TEMPLATE_DIR = Path("cv_templates")
IMAGE_DIR = DATA_DIR / "images"

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
IMAGE_DIR.mkdir(exist_ok=True)

# Default markdown content
DEFAULT_MARKDOWN = "# Your CV\n\nStart editing your CV here!"

# Server settings
HOST = "0.0.0.0"
PORT = 9876