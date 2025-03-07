export function initImageFormat(editor) {
    const imgFormatToolbar = document.getElementById('image-format-toolbar');
    let currentImage = null;

    document.getElementById('preview').addEventListener('click', (e) => {
        if (e.target.tagName === 'IMG') {
            currentImage = e.target;
            
            const rect = currentImage.getBoundingClientRect();
            imgFormatToolbar.style.top = `${rect.bottom + window.scrollY + 5}px`;
            imgFormatToolbar.style.left = `${rect.left + window.scrollX}px`;
            imgFormatToolbar.classList.remove('hidden');
            
            document.querySelectorAll('.img-align-left, .img-align-center, .img-align-right').forEach(btn => {
                btn.classList.remove('bg-gray-200');
            });
            
            if (currentImage.classList.contains('float-left')) {
                document.querySelector('.img-align-left').classList.add('bg-gray-200');
            } else if (currentImage.classList.contains('float-right')) {
                document.querySelector('.img-align-right').classList.add('bg-gray-200');
            } else if (currentImage.classList.contains('mx-auto')) {
                document.querySelector('.img-align-center').classList.add('bg-gray-200');
            }
            
            const widthStyle = currentImage.style.width;
            if (widthStyle) {
                document.querySelector('.img-width').value = widthStyle;
            } else {
                document.querySelector('.img-width').value = '';
            }
            
            // Set position offset values if this is a profile image
            if (currentImage.classList.contains('profile-image')) {
                const markdown = editor.getValue();
                const imgSrc = currentImage.src.replace(window.location.origin, '');
                
                const imgRegex = new RegExp(`!\\[(.*?)\\]\\(${escapeRegExp(imgSrc)}\\)`, 'g');
                let match = imgRegex.exec(markdown);
                
                if (match) {
                    const alt = match[1];
                    const props = editor.parseImageDimensions(alt);
                    
                    document.querySelector('.img-x-offset').value = props['x-offset'] || 0;
                    document.querySelector('.img-y-offset').value = props['y-offset'] || 0;
                    
                    // Show position controls only for profile images
                    document.querySelector('.position-controls').classList.remove('hidden');
                } else {
                    document.querySelector('.position-controls').classList.add('hidden');
                }
            } else {
                document.querySelector('.position-controls').classList.add('hidden');
            }
        } else if (!imgFormatToolbar.contains(e.target)) {
            imgFormatToolbar.classList.add('hidden');
            currentImage = null;
        }
    });

    document.querySelector('.img-align-left').addEventListener('click', () => {
        if (!currentImage) return;
        updateImageFormat('align', 'left');
    });

    document.querySelector('.img-align-center').addEventListener('click', () => {
        if (!currentImage) return;
        updateImageFormat('align', 'center');
    });

    document.querySelector('.img-align-right').addEventListener('click', () => {
        if (!currentImage) return;
        updateImageFormat('align', 'right');
    });

    document.querySelector('.img-width').addEventListener('change', (e) => {
        if (!currentImage) return;
        let width = e.target.value.trim();
        if (width && !width.includes('px') && !width.includes('%')) {
            width += 'px';
        }
        updateImageFormat('width', width);
    });
    
    // Add event listeners for position offset controls
    document.querySelector('.img-x-offset').addEventListener('change', (e) => {
        if (!currentImage || !currentImage.classList.contains('profile-image')) return;
        updateImageFormat('x-offset', e.target.value);
    });
    
    document.querySelector('.img-y-offset').addEventListener('change', (e) => {
        if (!currentImage || !currentImage.classList.contains('profile-image')) return;
        updateImageFormat('y-offset', e.target.value);
    });

    function updateImageFormat(property, value) {
        const markdown = editor.getValue();
        const imgSrc = currentImage.src.replace(window.location.origin, '');
        
        const imgRegex = new RegExp(`!\\[(.*?)\\]\\(${escapeRegExp(imgSrc)}\\)`, 'g');
        let match = imgRegex.exec(markdown);
        
        if (match) {
            const fullMatch = match[0];
            const alt = match[1];
            
            let newAlt = alt;
            
            const props = editor.parseImageDimensions(alt);
            
            props[property] = value;
            
            if (Object.keys(props).length > 1) {
                newAlt = props.alt || '';
                delete props.alt;
                
                Object.entries(props).forEach(([key, val]) => {
                    if (val) {
                        newAlt += `|${key}=${val}`;
                    }
                });
            }
            
            const newImageMarkdown = `![${newAlt}](${imgSrc})`;
            const newMarkdown = markdown.replace(fullMatch, newImageMarkdown);
            
            editor.setValue(newMarkdown);
            
            setTimeout(() => {
                const images = document.querySelectorAll('#preview img');
                for (let img of images) {
                    if (img.src.includes(imgSrc)) {
                        currentImage = img;
                        break;
                    }
                }
            }, 100);
        }
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    return {
        updateImageFormat,
        escapeRegExp
    };
}