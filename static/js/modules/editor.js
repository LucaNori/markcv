export function initEditor() {
    const editor = new EasyMDE({
        element: document.getElementById('editor'),
        spellChecker: false,
        autosave: {
            enabled: true,
            delay: 1000,
            uniqueId: 'markCV-editor'
        },
        toolbar: [
            'bold', 'italic', 'heading', '|',
            'unordered-list', 'ordered-list', '|',
            'link', {
                name: "custom-image",
                action: showImageModal,
                className: "fa fa-picture-o",
                title: "Insert Image",
            }, '|',
            'preview', 'side-by-side', 'fullscreen'
        ]
    });

    marked.setOptions({
        gfm: true,
        breaks: true
    });

    const renderer = new marked.Renderer();
    renderer.image = function(href, title, text) {
        const dimensions = parseImageDimensions(text);
        const altText = dimensions.alt || '';
        
        let imgClass = 'cv-image';
        let style = '';
        
        if (dimensions.width) {
            style += `width: ${dimensions.width};`;
        }
        
        if (dimensions.align) {
            switch (dimensions.align) {
                case 'left':
                    imgClass += ' float-left mr-4 mb-2';
                    break;
                case 'right':
                    imgClass += ' float-right ml-4 mb-2';
                    break;
                case 'center':
                    imgClass += ' mx-auto block';
                    break;
            }
        }
        
        return `<img src="${href}" alt="${altText}" title="${title || ''}" class="${imgClass}" style="${style}">`;
    };

    marked.setOptions({
        renderer: renderer
    });

    editor.codemirror.on('change', () => {
        const markdown = editor.value();
        const html = marked.parse(markdown);
        document.getElementById('preview').innerHTML = html;
    });

    function parseImageDimensions(alt) {
        if (!alt || !alt.includes('|')) {
            return { alt };
        }
        
        const parts = alt.split('|');
        const result = {
            alt: parts[0].trim()
        };
        
        parts.slice(1).forEach(part => {
            if (part && part.includes('=')) {
                const [key, value] = part.split('=').map(s => s.trim());
                if (key && value) {
                    result[key] = value;
                }
            }
        });
        
        return result;
    }

    function showImageModal() {
        document.getElementById('image-upload-modal').classList.remove('hidden');
    }

    return {
        setValue: (content) => {
            editor.value(content);
            editor.codemirror.refresh();
            const html = marked.parse(content);
            document.getElementById('preview').innerHTML = html;
        },
        getValue: () => editor.value(),
        refreshPreview: () => {
            const markdown = editor.value();
            const html = marked.parse(markdown);
            document.getElementById('preview').innerHTML = html;
        },
        getEditor: () => editor,
        parseImageDimensions
    };
}