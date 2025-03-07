# Europass CV Template

The Europass template is a professional CV layout with a left sidebar for your photo and contact information, inspired by the European standard CV format.

## Template Features

- Left sidebar for profile photo and contact details
- Clean, professional design suitable for most industries
- Good balance of white space and content
- Optimized for A4, Letter, and Legal paper sizes

## Recommended Structure

This template works best with the following sections in this order:

1. **Header** (required): Your name, photo, and contact information
2. **Skills**: Technical and professional competencies
3. **Languages**: Language proficiency levels
4. **Summary**: Brief professional overview
5. **Experience**: Work history with achievements
6. **Education**: Academic background
7. **Projects**: Notable projects or accomplishments

## Formatting Guidelines

### Profile Photo

The template displays your profile photo in the left sidebar. For best results:

```markdown
![profile|align=center|width=150px](/data/images/your-photo.jpg)
```

- Use a professional headshot with neutral background
- Recommended dimensions: 400x400 pixels (square)
- The `width=150px` parameter ensures proper sizing
- Place this immediately after your name

### Contact Information

Format your contact information as a single line with pipe separators:

```markdown
**Job Title** | email@example.com | (123) 456-7890 | [LinkedIn](https://linkedin.com/in/yourname) | [GitHub](https://github.com/username)
```

This will be displayed in the sidebar below your photo.

### Section Headers

Use level 2 headers (##) for main sections:

```markdown
## Skills
```

### Skills and Languages

Format as bullet lists with bold category names:

```markdown
- **Category**: Skill 1, Skill 2, Skill 3
```

Example:
```markdown
- **Programming Languages**: Python, JavaScript, TypeScript
- **Frameworks**: React, Django, Express
```

### Experience and Education

Use level 3 headers (###) for job titles/degrees with pipe separators for organization and dates:

```markdown
### Job Title | Company Name | Date Range
```

Follow with bullet points for achievements or responsibilities.

## Example CV

See the `example.md` file in this directory for a complete example CV formatted specifically for this template.

## Customization Options

This template supports the following paper sizes:
- A4 (default)
- Letter
- Legal

Recommended fonts:
- Roboto
- Open Sans
- Arial