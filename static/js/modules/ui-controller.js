export function initUIController(editor) {
    const editorPanel = document.getElementById('editor-panel');
    const previewPanel = document.getElementById('preview-panel');
    const mobileEditorBtn = document.getElementById('mobile-editor-btn');
    const mobilePreviewBtn = document.getElementById('mobile-preview-btn');
    const saveBtn = document.getElementById('saveBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');

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

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveBtn.click();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === 'p' && !e.shiftKey) {
            e.preventDefault();
            downloadPdfBtn.click();
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

    saveBtn.addEventListener('click', async () => {
        try {
            const markdown = editor.getValue();
            const response = await fetch('/api/markdown', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ markdown })
            });
            
            if (!response.ok) throw new Error('Failed to save markdown content');
            
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

    downloadPdfBtn.addEventListener('click', () => {
        const templateId = document.getElementById('template-select').value;
        const paperSize = document.getElementById('paper-size').value;
        
        window.location.href = `/api/pdf?template_id=${templateId}&paper_size=${paperSize}`;
    });

    return {
        checkScreenSize,
        showEditorPanel: () => mobileEditorBtn.click(),
        showPreviewPanel: () => mobilePreviewBtn.click()
    };
}