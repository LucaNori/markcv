# MarkCV Template Creation Guide

This guide provides detailed instructions for creating new CV templates for the MarkCV application.

## Template Directory Structure

Each template must be placed in its own directory under `cv_templates/` with the following structure:

```
template_name/
├── metadata.json    # Template metadata and configuration
├── template.html    # HTML template for pandoc
├── README.md        # Documentation for this template
└── example.md       # Example CV formatted for this template
```

## Required Files

### 1. metadata.json

This file defines the template's properties, supported features, and section structure.

```json
{
  "id": "your-template-id",
  "name": "Your Template Name",
  "description": "Brief description of your template",
  "paperSizes": ["a4", "letter", "legal"],
  "recommendedFonts": ["Font1", "Font2", "Font3"],
  "sections": [
    {
      "name": "Header",
      "description": "Name, photo, and contact information",
      "required": true
    },
    {
      "name": "Skills",
      "description": "Technical and professional skills",
      "required": false
    }
  ],
  "specialFeatures": [
    {
      "name": "Feature Name",
      "description": "How to use this feature in markdown"
    }
  ]
}
```

### 2. template.html

This is a pandoc template file that defines the HTML structure of your CV. It uses pandoc's template variables to insert content from the markdown file.

Key template variables:

- `$title$`: The CV title (first h1 heading)
- `$body$`: The main content of the CV
- `$first_image$`: The first image in the CV (typically a profile photo)
- `$contact_info$`: Contact information from the CV
- `$skills$`: Skills section content
- `$languages$`: Languages section content
- `$papersize$`: Selected paper size (a4, letter, etc.)
- `$themecolor$`: Selected theme color

Example template structure:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>$title$</title>
  <style>
    /* You can include basic styles here, but main styling should be in the CSS file */
  </style>
</head>
<body class="$papersize$">
  <div class="container">
    <header>
      <h1>$title$</h1>
      $if(first_image)$
      <div class="profile-image">
        <img src="$first_image$" alt="Profile Photo">
      </div>
      $endif$
      <div class="contact-info">
        $for(contact_info)$
        <p>$contact_info$</p>
        $endfor$
      </div>
    </header>
    
    <main>
      $body$
    </main>
  </div>
</body>
</html>
```

### 3. README.md

Documentation for your template, including:

- Description of the template's style and purpose
- Recommended sections and their order
- Special features and how to use them
- Markdown formatting tips specific to this template
- Visual example of the rendered template

### 4. example.md

A complete example CV formatted specifically for your template. This helps users understand how to structure their content.

## CSS Styling

Each template must have a corresponding CSS file in `static/css/themes/` with the same name as the template ID:

```
static/css/themes/your-template-id.css
```

This CSS file should define all styles needed for your template, including:

- Layout (grid, flexbox, etc.)
- Typography
- Colors
- Print-specific styles
- Responsive design for different screen sizes

## Template Variables

Your template can use the following variables extracted from the markdown:

1. **Title**: The first h1 heading in the markdown
2. **Contact Info**: Lines following the title that don't start with ## (section headers)
3. **Profile Image**: The first image in the document
4. **Skills**: Content under the ## Skills heading
5. **Languages**: Content under the ## Languages heading
6. **Body**: All content in the markdown file

## Best Practices

1. **Responsive Design**
   - Ensure your template looks good on different screen sizes
   - Use relative units (%, em, rem) instead of fixed pixels where appropriate
   - Test on mobile, tablet, and desktop views

2. **Print Optimization**
   - Optimize for printing to PDF
   - Consider page breaks and margins
   - Use print media queries for print-specific styling

3. **Accessibility**
   - Use semantic HTML elements
   - Ensure sufficient color contrast
   - Include alt text for images

4. **Cross-Browser Compatibility**
   - Test in multiple browsers
   - Avoid browser-specific features without fallbacks

5. **Documentation**
   - Provide clear instructions for users
   - Document any special markdown formatting required
   - Include a complete example CV

## Testing Your Template

1. Place your template directory in `cv_templates/`
2. Add your CSS file to `static/css/themes/`
3. Restart the application
4. Create a CV using your template
5. Test the print/PDF generation
6. Verify all sections display correctly

## Submitting Your Template

To contribute your template to the MarkCV project:

1. Fork the repository
2. Add your template following the structure above
3. Test thoroughly
4. Submit a pull request with a description of your template