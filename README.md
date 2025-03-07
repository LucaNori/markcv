# MarkCV

MarkCV is a Dockerized Markdown CV to PDF Builder with Live Preview. It allows you to create and edit your CV in Markdown format, see a live preview, and download it as a PDF.

## Features

- Edit your CV in Markdown format
- Live preview of your CV as you edit
- Download your CV as a PDF
- Customizable styling
- Dockerized for easy deployment
- Runs as non-root user for security

## Quick Start

### Using Docker Compose

1. Clone this repository:
   ```bash
   git clone https://github.com/lucanori/markcv.git
   cd markcv
   ```

2. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

3. Access the application at http://localhost:9876

### Using Docker directly

```bash
docker run -d \
  --name markcv \
  -p 9876:9876 \
  -v $(pwd)/data:/app/data \
  -e PUID=$(id -u) \
  -e PGID=$(id -g) \
  ghcr.io/lucanori/markcv:latest
```

## Environment Variables

- `PUID`: User ID to run the container as (default: 1000)
- `PGID`: Group ID to run the container as (default: 1000)

## Volumes

- `/app/data`: Contains your CV markdown file and images

## Project Structure

- `app/`: Backend Python code
- `cv_templates/`: CV templates used for rendering
- `data/`: User content (CV markdown, images)
- `examples/`: Example files for reference
- `static/`: Frontend assets (CSS, JavaScript)
- `templates/`: HTML templates for the web UI

## Customization

### Markdown CV

Edit the `data/cv.md` file to update your CV content. The file uses standard Markdown syntax.

### Print-Friendly HTML Generation

Instead of directly generating a PDF, MarkCV creates a print-friendly HTML document:
1. Pandoc converts the Markdown to HTML with embedded CSS
2. The HTML is enhanced with a print script that automatically opens the print dialog
3. Users can save as PDF using their browser's print functionality

This approach provides reliable PDF creation without requiring complex dependencies.

You can customize the print styling by editing the `static/css/pdf.css` file, which contains styles specifically optimized for printing.

### Web UI Styling

The web UI uses Tailwind CSS for styling. You can customize the appearance by editing the `static/css/custom.css` file.

## Development

### Prerequisites

- Python 3.11+
- pandoc
- LaTeX (for PDF generation)

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/lucanori/markcv.git
   cd markcv
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the application:
   ```bash
   uvicorn app.main:app --reload
   ```

4. Access the application at http://localhost:9876

### Local Development

For local development and testing before pushing changes:

```bash
docker-compose -f docker-compose.local.yml up -d
```

This will:
- Build the image locally
- Mount the app, static, templates, and cv_templates directories as volumes for live code changes
- Tag the image as markcv:local

You can then make changes to the code and see them reflected immediately without rebuilding the container.

> **Note:** For local development, the cv_templates directory is mounted as a volume to allow for live changes to templates. In production, templates are built into the container image.

> **Note:** The initial build may take some time (5-10 minutes) due to the installation of TeX packages required for PDF generation. Subsequent builds will be faster if you use Docker's build cache.

### Building the Docker Image

```bash
docker build -t ghcr.io/lucanori/markcv:latest .
```

## License

See the [LICENSE](LICENSE) file for details.