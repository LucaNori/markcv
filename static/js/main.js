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
            'link', 'image', '|',
            'preview', 'side-by-side', 'fullscreen'
        ]
    });

    marked.setOptions({
        gfm: true,
        breaks: true
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

    document.getElementById('downloadPdfBtn').textContent = 'Print / Save as PDF';
    document.getElementById('downloadPdfBtn').addEventListener('click', () => {
        window.location.href = '/api/pdf';
    });

    loadMarkdown();
});