# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-03-07

### Added
- Dark mode support for better user experience
- Image upload functionality with drag-and-drop support
- Image formatting options (alignment, width) in the editor
- Multiple CV templates with customization options
- Keyboard shortcuts for common actions
- Comprehensive CV setup guide documentation
- Example files for easy getting started
- Per-template documentation with formatting guidelines
- Template-specific example CVs for reference
- Detailed template creation guide for developers
- Enhanced metadata structure for templates with sections and special features
- Template comparison in the root README

### Fixed
- Fixed image path handling to use data directory
- Fixed fullscreen and preview toggle in the editor
- Fixed sidebar layout in exported PDFs
- Fixed duplicate profile image in exported CVs
- Improved mobile responsiveness

### Changed
- Reorganized data directory with examples folder
- Enhanced template system with better variable support
- Improved error handling for image uploads
- Updated documentation with detailed setup instructions
- Moved templates from data/templates to cv_templates at the root level
- Restructured project to separate user content from application code
- Removed empty placeholder directories (api, services, utils)
- Simplified .gitignore to properly exclude data directory

## [1.0.0] - 2025-03-07

### Added
- Initial release of MarkCV
- FastAPI backend for handling API requests
- Markdown editor with live preview using EasyMDE
- Print-friendly HTML generation for easy PDF creation
- Docker containerization with Alpine Linux base image
- Non-root user execution with PUID/PGID support
- Default CV template and styling
- Responsive UI with Tailwind CSS
- Comprehensive documentation and development plan
- Optimized Docker image with minimal dependencies
- Local development setup with docker-compose.local.yml
- Non-standard port 9876 to avoid conflicts
- Print-specific styling for professional output