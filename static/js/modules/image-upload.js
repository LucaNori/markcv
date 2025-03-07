export function initImageUpload(editor, apiClient) {
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

    function showModal() {
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
        
        uploadPreview.classList.add('hidden');
        uploadProgress.classList.remove('hidden');
        
        try {
            const response = await apiClient.uploadImage(file, altText.value);
            const imagePath = `/data/images/${response.id}`;
            insertImageToEditor(imagePath, response.alt_text || '');
            imageModal.classList.add('hidden');
            resetUploadForm();
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Upload failed: ' + error.message);
        }
    });

    function insertImageToEditor(url, alt) {
        const imageMarkdown = `![${alt || ''}](${url})`;
        editor.getEditor().codemirror.replaceSelection(imageMarkdown);
        editor.getEditor().codemirror.focus();
    }

    return {
        showModal,
        resetUploadForm,
        insertImageToEditor
    };
}