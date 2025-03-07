import { initEditor } from './modules/editor.js';
import { initTheme } from './modules/theme.js';
import { initApiClient } from './modules/api-client.js';
import { initImageHandler } from './modules/image-handler.js';
import { initUIController } from './modules/ui-controller.js';

document.addEventListener('DOMContentLoaded', () => {
    const editor = initEditor();
    const apiClient = initApiClient();
    
    initTheme(editor);
    initImageHandler(editor, apiClient);
    initUIController(editor);
    
    apiClient.loadMarkdown().then(content => {
        editor.setValue(content);
    });
    
    apiClient.loadTemplates();
});