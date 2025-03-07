# MarkCV Templates Directory

This directory contains CV templates used by MarkCV for rendering different CV styles.

## Directory Structure

Each template has its own subdirectory with the following structure:

```
template_name/
├── metadata.json    # Template metadata and configuration
├── template.html    # HTML template for pandoc
├── README.md        # Documentation for this template
└── example.md       # Example CV formatted for this template
```

## Available Templates

| Template | Description | Best For | Special Features |
|----------|-------------|----------|-----------------|
| `europass` | Professional CV template with a left sidebar for photo and contact information | Formal job applications, especially in Europe | Profile photo in sidebar, skills and languages sections |

## Template Documentation

Each template includes its own documentation:

- **README.md**: Detailed guide on how to format your CV for this template
- **example.md**: Complete example CV showing optimal formatting
- **metadata.json**: Template configuration including supported sections and features

## Template Comparison

### Europass
- **Style**: Professional, formal
- **Layout**: Left sidebar with main content area
- **Best for**: Traditional industries, European job market
- **Key features**: Profile photo in sidebar, skills and languages sections

## Creating a New Template

For detailed instructions on creating a new template, see the [Template Creation Guide](template_guide.md).

Quick steps:

1. Create a new directory with your template name
2. Add the required files:
   - `metadata.json`: Template configuration
   - `template.html`: HTML structure
   - `README.md`: Documentation
   - `example.md`: Example CV
3. Add a corresponding CSS file in `static/css/themes/your-template-id.css`

## Template Variables

Templates can use the following variables:

- `$title$`: The CV title (first h1 heading)
- `$body$`: The main content of the CV
- `$first_image$`: The first image in the CV (typically a profile photo)
- `$contact_info$`: Contact information from the CV
- `$skills$`: Skills section content
- `$languages$`: Languages section content
- `$papersize$`: Selected paper size (a4, letter, etc.)
- `$themecolor$`: Selected theme color

## Contributing Templates

To contribute a new template to the project:

1. Create your template following the structure described in the [Template Creation Guide](template_guide.md)
2. Test it thoroughly with different CV content
3. Submit a pull request with your template

## Future Template Ideas

Some template styles we'd like to add:

- Modern/Minimalist: Clean design with subtle use of color
- Creative: For design and creative industry professionals
- Academic: Focused on publications, research, and teaching experience
- Technical: Highlighting technical skills and projects for IT professionals