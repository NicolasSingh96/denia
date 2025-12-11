document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Mostrar nombre del usuario guardado
    const userName = localStorage.getItem('deniaUser') || 'Usuario';
    document.getElementById('user-display-name').innerText = userName;

    // 2. Lógica de Subida de Archivos (Drag & Drop)
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');

    // Prevenir comportamiento por defecto
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Efecto visual al arrastrar
    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.add('highlight'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => dropZone.classList.remove('highlight'), false);
    });

    // Manejar archivo soltado
    dropZone.addEventListener('drop', handleDrop, false);
    
    // Manejar archivo seleccionado por botón
    fileInput.addEventListener('change', handleFiles, false);

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles({ target: { files: files } });
    }

    function handleFiles(e) {
        const files = [...e.target.files];
        files.forEach(uploadFile);
    }

    function uploadFile(file) {
        // Crear elemento visual del archivo
        const div = document.createElement('div');
        div.className = 'file-item';
        div.innerHTML = `
            <div class="file-info">
                <span style="margin-right:10px;">📄</span>
                <span class="file-name">${file.name}</span>
            </div>
            <span class="file-status">Listo para entrenar</span>
        `;
        fileList.appendChild(div);
        
        // Simular notificación
        alert(`Archivo "${file.name}" cargado correctamente. DenIA comenzará a leerlo.`);
    }
});