document.addEventListener('DOMContentLoaded', () => {
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

    const header = document.querySelector('header');
    const darkModeToggle = document.createElement('button');
    darkModeToggle.id = 'dark-mode-toggle';
    darkModeToggle.className = 'absolute top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700';
    darkModeToggle.innerHTML = `
        <svg id="sun-icon" class="w-5 h-5 hidden" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"></path>
        </svg>
        <svg id="moon-icon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
        </svg>
    `;
    header.style.position = 'relative';
    header.appendChild(darkModeToggle);

    const sunIcon = document.getElementById('sun-icon');
    const moonIcon = document.getElementById('moon-icon');

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        sunIcon.classList.remove('hidden');
        moonIcon.classList.add('hidden');
    } else {
        document.documentElement.classList.remove('dark');
        moonIcon.classList.remove('hidden');
        sunIcon.classList.add('hidden');
    }

    darkModeToggle.addEventListener('click', () => {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        }
        
        editor.codemirror.refresh();
    });

    editor.codemirror.on('change', () => {
        const markdown = editor.value();
        const html = marked.parse(markdown);
        document.getElementById('preview').innerHTML = html;
    });

    async function loadMarkdown() {
        try {
            const response = await fetch('/api/markdown');
            if (!response.ok) throw new Error('Failed to load markdown content');
            const data = await response.json();
            editor.value(data.content);
            editor.codemirror.refresh();
            const html = marked.parse(data.content);
            document.getElementById('preview').innerHTML = html;
        } catch (error) {
            console.error('Error loading markdown:', error);
        }
    }

    async function loadTemplates() {
        try {
            const response = await fetch('/api/templates');
            if (!response.ok) throw new Error('Failed to load templates');
            const templates = await response.json();
            
            const templateSelect = document.getElementById('template-select');
            templateSelect.innerHTML = '';
            
            templates.forEach(template => {
                const option = document.createElement('option');
                option.value = template.id;
                option.textContent = template.name;
                templateSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading templates:', error);
        }
    }

    document.getElementById('saveBtn').addEventListener('click', async () => {
        try {
            const markdown = editor.value();
            const response = await fetch('/api/markdown', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ markdown })
            });
            
            if (!response.ok) throw new Error('Failed to save markdown content');
            
            const saveBtn = document.getElementById('saveBtn');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saved!';
            saveBtn.classList.remove('bg-blue-500', 'hover:bg-blue-600');
            saveBtn.classList.add('bg-green-500', 'hover:bg-green-600');
            
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
                saveBtn.classList.add('bg-blue-500', 'hover:bg-blue-600');
            }, 2000);
        } catch (error) {
            console.error('Error saving markdown:', error);
            alert('Failed to save: ' + error.message);
        }
    });

    document.getElementById('downloadPdfBtn').addEventListener('click', () => {
        const templateId = document.getElementById('template-select').value;
        const paperSize = document.getElementById('paper-size').value;
        
        window.location.href = `/api/pdf?template_id=${templateId}&paper_size=${paperSize}`;
    });

    const editorPanel = document.getElementById('editor-panel');
    const previewPanel = document.getElementById('preview-panel');
    const mobileEditorBtn = document.getElementById('mobile-editor-btn');
    const mobilePreviewBtn = document.getElementById('mobile-preview-btn');

    mobileEditorBtn.addEventListener('click', () => {
        editorPanel.classList.remove('hidden');
        previewPanel.classList.add('hidden');
        mobileEditorBtn.classList.add('bg-white');
        mobilePreviewBtn.classList.remove('bg-white');
    });

    mobilePreviewBtn.addEventListener('click', () => {
        editorPanel.classList.add('hidden');
        previewPanel.classList.remove('hidden');
        mobilePreviewBtn.classList.add('bg-white');
        mobileEditorBtn.classList.remove('bg-white');
    });

    function checkScreenSize() {
        if (window.innerWidth >= 768) {
            editorPanel.classList.remove('hidden');
            previewPanel.classList.remove('hidden', 'md:block');
            previewPanel.classList.add('block');
        } else {
            mobileEditorBtn.click();
            previewPanel.classList.add('md:block');
            previewPanel.classList.remove('block');
        }
    }

    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();

    const imageModal = document.getElementById('image-upload-modal');
    const closeImageModal = document.getElementById('close-image-modal');
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const selectFileBtn = document.getElementById('select-file-btn');
    const previewImage = document.getElementById('preview-image');
    const uploadPreview = document.getElementById('upload-preview');
    const altText = document.getElementById('alt-text');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadProgress = document.getElementById('upload-progress');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');

    function showImageModal() {
        imageModal.classList.remove('hidden');
    }

    closeImageModal.addEventListener('click', () => {
        imageModal.classList.add('hidden');
        resetUploadForm();
    });

    selectFileBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            previewSelectedImage(file);
        }
    });

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    function highlight() {
        dropArea.classList.add('bg-blue-50', 'border-blue-300');
    }

    function unhighlight() {
        dropArea.classList.remove('bg-blue-50', 'border-blue-300');
    }

    dropArea.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files && files.length) {
            previewSelectedImage(files[0]);
        }
    }

    function previewSelectedImage(file) {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                uploadPreview.classList.remove('hidden');
            }
            reader.readAsDataURL(file);
        }
    }

    function resetUploadForm() {
        fileInput.value = '';
        altText.value = '';
        uploadPreview.classList.add('hidden');
        uploadProgress.classList.add('hidden');
        progressBar.style.width = '0%';
        progressText.textContent = '0%';
    }

    uploadBtn.addEventListener('click', async () => {
        if (!fileInput.files || !fileInput.files[0]) {
            alert('Please select an image file');
            return;
        }
        
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('alt_text', altText.value || '');
        
        uploadPreview.classList.add('hidden');
        uploadProgress.classList.remove('hidden');
        
        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/images/upload', true);
            
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    progressBar.style.width = percentComplete + '%';
                    progressText.textContent = percentComplete + '%';
                }
            };
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    const imagePath = `/data/images/${response.id}`;
                    insertImageToEditor(imagePath, response.alt_text || '');
                    imageModal.classList.add('hidden');
                    resetUploadForm();
                } else {
                    alert('Upload failed: ' + xhr.statusText);
                }
            };
            
            xhr.onerror = function() {
                alert('Upload failed. Please try again.');
            };
            
            xhr.send(formData);
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Upload failed: ' + error.message);
        }
    });

    function insertImageToEditor(url, alt) {
        const imageMarkdown = `![${alt || ''}](${url})`;
        editor.codemirror.replaceSelection(imageMarkdown);
        editor.codemirror.focus();
    }

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

    function updateImageFormat(property, value) {
        const markdown = editor.value();
        const imgSrc = currentImage.src.replace(window.location.origin, '');
        
        const imgRegex = new RegExp(`!\\[(.*?)\\]\\(${escapeRegExp(imgSrc)}\\)`, 'g');
        let match = imgRegex.exec(markdown);
        
        if (match) {
            const fullMatch = match[0];
            const alt = match[1];
            
            let newAlt = alt;
            
            const props = parseImageDimensions(alt);
            
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
            
            editor.value(newMarkdown);
            
            const html = marked.parse(newMarkdown);
            document.getElementById('preview').innerHTML = html;
            
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

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            document.getElementById('saveBtn').click();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !e.shiftKey) {
            e.preventDefault();
            document.getElementById('downloadPdfBtn').click();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
            e.preventDefault();
            if (window.innerWidth < 768) {
                if (previewPanel.classList.contains('hidden')) {
                    mobilePreviewBtn.click();
                } else {
                    mobileEditorBtn.click();
                }
            }
        }
    });

    loadMarkdown();
    loadTemplates();
});