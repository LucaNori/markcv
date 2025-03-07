# MarkCV Developer Guide

This guide provides detailed information for developers working on the MarkCV project. It covers the project structure, architecture, development workflow, and best practices.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Development Environment Setup](#development-environment-setup)
4. [Project Structure](#project-structure)
5. [Key Components](#key-components)
6. [Development Workflow](#development-workflow)
7. [Testing](#testing)
8. [Docker Configuration](#docker-configuration)
9. [Deployment](#deployment)
10. [Common Tasks](#common-tasks)
11. [Troubleshooting](#troubleshooting)

## Project Overview

MarkCV is a Dockerized Markdown CV to PDF Builder with Live Preview. It allows users to:
- Edit a CV in Markdown format
- See a live preview of the rendered CV
- Generate a print-friendly version that can be saved as PDF

The application is containerized using Docker and designed to run with non-root user permissions for security.

## Architecture

MarkCV follows a simple client-server architecture:

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│             │      │             │      │             │
│  Frontend   │◄────►│   Backend   │◄────►│   Pandoc    │
│  (Browser)  │      │  (FastAPI)  │      │             │
│             │      │             │      │             │
└─────────────┘      └─────────────┘      └─────────────┘
```

- **Frontend**: HTML, CSS (Tailwind), and vanilla JavaScript
- **Backend**: Python FastAPI application
- **PDF Generation**: Two-step process using pandoc to convert Markdown to HTML

## Development Environment Setup

### Prerequisites

- Docker and Docker Compose
- Git
- A code editor (VS Code recommended)

### Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/lucanori/markcv.git
   cd markcv
   ```

2. For local development, use the local Docker Compose file:
   ```bash
   docker-compose -f docker-compose.local.yml up -d
   ```

3. Access the application at http://localhost:9876

4. For development without Docker:
   ```bash
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 9876
   ```

## Project Structure

```
markCV/
├── app/                  # Backend Python code
│   └── main.py           # FastAPI application entry point
├── cv_templates/         # CV templates
│   └── europass/         # Europass template
│       ├── metadata.json # Template metadata
│       ├── README.md     # Template documentation
│       ├── example.md    # Example CV for this template
│       └── template.html # Template HTML
├── data/                 # User data (not in repo)
│   ├── cv.md             # User's CV content
│   ├── cv.html           # Generated HTML
│   └── images/           # User's images
├── example-data/         # Example files for the data folder
│   ├── cv.md.example     # Example CV
│   └── images/           # Example images
├── static/               # Static assets
│   ├── css/              # CSS stylesheets
│   │   ├── custom.css    # Custom styles for the UI
│   │   ├── pdf.css       # Styles for print/PDF output
│   │   └── themes/       # Template-specific CSS files
│   ├── js/               # JavaScript files
│   │   └── main.js       # Main application logic
│   └── lib/              # Third-party libraries (future expansion)
├── templates/            # HTML templates
│   ├── index.html        # Main page template
│   └── components/       # Reusable components (future expansion)
├── .gitignore            # Git ignore file
├── CHANGELOG.md          # Project changelog
├── Dockerfile            # Docker image definition
├── entrypoint.sh         # Container entrypoint script
├── docker-compose.yml    # Production Docker Compose configuration
├── docker-compose.local.yml # Local development Docker Compose
├── LICENSE               # Project license
├── README.md             # Project readme
└── requirements.txt      # Python dependencies
```

## Key Components

### Backend (app/main.py)

The backend is built with FastAPI and provides these key endpoints:

- `GET /`: Serves the main application page
- `GET /api/markdown`: Retrieves the current markdown content
- `POST /api/markdown`: Saves updated markdown content
- `GET /api/pdf`: Generates a print-friendly HTML version for PDF creation
- `GET /api/templates`: Lists available CV templates
- `GET /api/images`: Lists uploaded images
- `POST /api/images/upload`: Uploads an image for the CV

The backend uses pandoc to convert Markdown to HTML with embedded CSS.

### Frontend (templates/index.html, static/js/main.js)

The frontend consists of:

- A Markdown editor (using EasyMDE)
- A live preview pane
- Save and Print/PDF buttons
- Image upload functionality
- Template selection

The JavaScript in `main.js` handles:
- Editor initialization
- Live preview updates
- API communication
- Save and print functionality
- Image uploads and formatting

### Styling (static/css/)

Two main CSS files:
- `custom.css`: Styles for the web UI
- `pdf.css`: Styles optimized for printing/PDF output
- `themes/`: Template-specific CSS files

### Docker Configuration

- `Dockerfile`: Defines the container image based on Alpine Linux
- `entrypoint.sh`: Sets up permissions and starts the application
- `docker-compose.yml`: Production configuration
- `docker-compose.local.yml`: Development configuration with volume mounts

## Development Workflow

### Making Changes

1. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Run the application in development mode:
   ```bash
   docker-compose -f docker-compose.local.yml up -d
   ```

3. Make your changes. The local Docker setup mounts these directories as volumes:
   - `./app:/app/app`
   - `./static:/app/static`
   - `./templates:/app/templates`
   - `./cv_templates:/app/cv_templates`
   
   Changes to these files will be reflected immediately without rebuilding.

4. For changes to other files (Dockerfile, requirements.txt), rebuild:
   ```bash
   docker-compose -f docker-compose.local.yml up -d --build
   ```

5. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

6. Push your branch and create a pull request.

### Version Control

- Follow semantic versioning (MAJOR.MINOR.PATCH)
- Update CHANGELOG.md with each significant change
- Tag releases with version numbers:
  ```bash
  git tag -a vX.Y.Z -m "Version X.Y.Z - Description"
  ```

## Testing

Currently, the project doesn't have automated tests. When implementing tests:

- Use pytest for backend testing
- Place tests in a `tests/` directory
- Test API endpoints, Markdown conversion, and HTML generation

## Docker Configuration

### Production Image

The production Docker image:
- Uses Python 3.11 Alpine as the base
- Runs as a non-root user (UID/GID configurable via environment variables)
- Installs minimal dependencies (pandoc, fontconfig, ttf-dejavu)
- Exposes port 9876

### Environment Variables

- `PUID`: User ID to run the container as (default: 1000)
- `PGID`: Group ID to run the container as (default: 1000)

### Volumes

- `/app/data`: Contains the CV markdown file and user images

## Deployment

### GitHub Container Registry

The container is deployed to GitHub Container Registry:

```bash
# Build and tag
docker build -t ghcr.io/lucanori/markcv:latest .

# Push to registry
docker push ghcr.io/lucanori/markcv:latest
```

### Running in Production

```bash
docker-compose up -d
```

## Common Tasks

### Adding a New Dependency

1. Add to `requirements.txt`
2. Rebuild the Docker image:
   ```bash
   docker-compose -f docker-compose.local.yml up -d --build
   ```

### Adding a New CV Template

1. Create a new directory in `cv_templates/` with your template name
2. Add a `metadata.json` file with template information
3. Add a `template.html` file with the template structure
4. Add a corresponding CSS file in `static/css/themes/`

### Modifying the UI

1. Edit files in `templates/` or `static/`
2. Refresh the browser to see changes

### Changing PDF/Print Styling

1. Edit `static/css/pdf.css` or template-specific CSS
2. Test by clicking the "Print / Save as PDF" button

### Adding a New API Endpoint

1. Add the endpoint to `app/main.py`
2. Follow the existing pattern for error handling and logging

## Troubleshooting

### Common Issues

#### Container fails to start

Check logs:
```bash
docker logs markcv
```

Common causes:
- Permission issues with mounted volumes
- Port conflicts (change the port in docker-compose.yml)

#### PDF generation fails

- Ensure pandoc is installed correctly
- Check HTML generation in the logs
- Verify CSS paths are correct

#### Changes not reflecting

For local development:
- Ensure you're using docker-compose.local.yml
- Check that volumes are mounted correctly
- Restart the container if necessary

### Debugging

- Enable debug logging in `app/main.py` by changing the logging level
- Use browser developer tools to debug frontend issues
- For container issues, exec into the container:
  ```bash
  docker exec -it markcv /bin/sh
  ```

## Future Development

Key areas for future development:
- Additional CV templates
- User authentication
- Template gallery
- Additional export formats
- Advanced customization options