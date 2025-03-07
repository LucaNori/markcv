# MarkCV Setup Guide

This guide will help you set up and customize your CV using MarkCV.

## Getting Started

1. **Access the Application**: Navigate to http://localhost:9876 after starting the container.
2. **Edit Your CV**: Use the Markdown editor on the left side to create or edit your CV.
3. **Live Preview**: See your changes in real-time in the preview pane on the right.
4. **Save Your Work**: Click the "Save" button to store your changes.
5. **Generate PDF**: Click "Print / Save as PDF" to create a printable version that you can save as PDF.

## CV Structure

A well-structured CV typically includes these sections:

```markdown
# Your Name

![profile|align=center|width=150px](/data/images/your-photo.jpg)

**Your Title** | email@example.com | (123) 456-7890 | [LinkedIn](https://linkedin.com/in/yourname) | [GitHub](https://github.com/yourusername)

## Skills

- **Category**: Skill 1, Skill 2, Skill 3
- **Another Category**: Skill 4, Skill 5, Skill 6

## Languages

- **Language 1**: Proficiency Level
- **Language 2**: Proficiency Level

## Summary

A brief paragraph about yourself and your professional background.

## Experience

### Job Title | Company Name | Date Range

- Achievement 1
- Achievement 2
- Achievement 3

### Previous Job Title | Previous Company | Previous Date Range

- Achievement 1
- Achievement 2
- Achievement 3

## Education

### Degree | Institution | Year

- Notable achievement or detail
- GPA, honors, or relevant coursework

## Projects

### Project Name

Brief description of the project, technologies used, and outcomes.

## Certifications

- **Certification Name**: Issuing Organization, Year
- **Another Certification**: Issuing Organization, Year
```

## Adding and Formatting Images

### Upload an Image

1. Click the image icon in the editor toolbar
2. Drag and drop an image or click to select a file
3. Add optional alt text and click "Upload and Insert"

### Image Formatting

You can format images using special syntax in the alt text:

```markdown
![alt text|width=150px|align=center](/path/to/image.jpg)
```

- **width**: Set the image width (e.g., `width=150px` or `width=50%`)
- **align**: Set alignment (`align=left`, `align=center`, or `align=right`)

You can also click on an image in the preview to access formatting options.

## Template Selection

MarkCV supports different templates for your CV:

1. Select a template from the dropdown menu below the editor
2. Choose a paper size (A4, Letter, etc.)
3. Click "Print / Save as PDF" to generate your CV with the selected template

## Dark Mode

Toggle between light and dark mode using the button in the top-right corner of the application.

## Keyboard Shortcuts

- **Ctrl/Cmd + S**: Save your CV
- **Ctrl/Cmd + P**: Generate printable version
- **Ctrl/Cmd + E**: Toggle between editor and preview on mobile devices