export function initApiClient() {
    async function loadMarkdown() {
        try {
            const response = await fetch('/api/markdown');
            if (!response.ok) throw new Error('Failed to load markdown content');
            const data = await response.json();
            return data.content;
        } catch (error) {
            console.error('Error loading markdown:', error);
            return '# Error Loading Content\n\nThere was an error loading your content. Please try again.';
        }
    }

    async function saveMarkdown(markdown) {
        try {
            const response = await fetch('/api/markdown', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ markdown })
            });
            
            if (!response.ok) throw new Error('Failed to save markdown content');
            
            return true;
        } catch (error) {
            console.error('Error saving markdown:', error);
            throw error;
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
            
            return templates;
        } catch (error) {
            console.error('Error loading templates:', error);
            return [];
        }
    }

    async function uploadImage(file, altText) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('alt_text', altText || '');
        
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/images/upload', true);
            
            xhr.upload.onprogress = function(e) {
                if (e.lengthComputable) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100);
                    const progressBar = document.getElementById('progress-bar');
                    const progressText = document.getElementById('progress-text');
                    
                    if (progressBar && progressText) {
                        progressBar.style.width = percentComplete + '%';
                        progressText.textContent = percentComplete + '%';
                    }
                }
            };
            
            xhr.onload = function() {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response);
                } else {
                    reject(new Error('Upload failed: ' + xhr.statusText));
                }
            };
            
            xhr.onerror = function() {
                reject(new Error('Upload failed. Please try again.'));
            };
            
            xhr.send(formData);
        });
    }

    async function generatePdf(templateId, paperSize) {
        window.location.href = `/api/pdf?template_id=${templateId}&paper_size=${paperSize}`;
    }

    return {
        loadMarkdown,
        saveMarkdown,
        loadTemplates,
        uploadImage,
        generatePdf
    };
}