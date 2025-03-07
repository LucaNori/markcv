import { initImageUpload } from './image-upload.js';
import { initImageFormat } from './image-format.js';

export function initImageHandler(editor, apiClient) {
    const imageUpload = initImageUpload(editor, apiClient);
    const imageFormat = initImageFormat(editor);
    
    function showImageModal() {
        imageUpload.showModal();
    }
    
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    
    return {
        showImageModal,
        escapeRegExp,
        getImageUpload: () => imageUpload,
        getImageFormat: () => imageFormat
    };
}