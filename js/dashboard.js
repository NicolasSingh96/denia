document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================
    // 1. RECUPERAR DATOS Y CORREGIR FORMATO (SOLUCIÓN DEL BUG)
    // =========================================================
    const userName = localStorage.getItem('deniaUser') || 'Usuario';
    
    // Recuperamos el plan y forzamos minúsculas y sin espacios extra
    const rawPlan = localStorage.getItem('deniaPlan') || 'inicial';
    const userPlan = rawPlan.toLowerCase().trim(); 

    const userAddonPrice = localStorage.getItem('deniaAddonPrice') || '0';

    console.log("Dashboard cargado. Plan detectado:", userPlan); // Para depuración

    // Mostrar nombre del usuario
    const displayEl = document.getElementById('user-display-name');
    if(displayEl) displayEl.innerText = userName;


    // =========================================================
    // 2. CONFIGURACIÓN MAESTRA DE PLANES
    // =========================================================
    const PLAN_CONFIG = {
        'gratis': {
            name: 'Prueba Gratis', limit: 10, color: '#94a3b8',
            features: [], 
            promptRules: "Solo gestionas ventas MINORISTAS. No ofrezcas precios mayoristas."
        },
        'inicial': {
            name: 'Plan Inicial', limit: 2000, color: '#00f0ff',
            features: ['menu-metrics', 'menu-prices', 'menu-tickets'],
            promptRules: "Gestionas ventas minoristas. Puedes derivar a soporte vía tickets si es necesario."
        },
        'desarrollo': {
            name: 'Plan Desarrollo', limit: 7000, color: '#8a2be2',
            features: ['menu-metrics', 'menu-prices', 'menu-tickets', 'menu-wholesale', 'menu-handoff', 'menu-onboarding'],
            promptRules: "Eres capaz de gestionar VENTAS MAYORISTAS y MINORISTAS. Si el cliente pide hablar con un humano, puedes realizar la derivación (Handoff)."
        },
        'medida': {
            name: 'Corporativo', limit: 'Ilimitado', color: '#fff',
            features: ['menu-metrics', 'menu-prices', 'menu-tickets', 'menu-wholesale', 'menu-handoff', 'menu-onboarding', 'menu-custom-ai', 'menu-vip'],
            promptRules: "Gestión integral (Mayorista/Minorista). Tienes entrenamiento personalizado avanzado."
        }
    };

    // Aplicar la configuración del plan actual (o fallback a inicial si falla)
    const currentConfig = PLAN_CONFIG[userPlan] || PLAN_CONFIG['inicial'];
    
    // --- Actualizar UI Sidebar (Badge y Límites) ---
    const badgeEl = document.getElementById('user-plan-badge');
    if(badgeEl) {
        badgeEl.innerText = currentConfig.name;
        badgeEl.style.color = currentConfig.color;
        badgeEl.style.borderColor = currentConfig.color;
    }
    
    const limitEl = document.getElementById('usage-limit');
    if(limitEl) limitEl.innerText = currentConfig.limit;
    
    const progressEl = document.getElementById('usage-progress');
    if(progressEl) progressEl.style.width = '2%'; 


    // --- Activar Menús Ocultos (Feature Flags) ---
    const activeContainer = document.getElementById('active-modules-container');
    if(activeContainer) activeContainer.innerHTML = ''; // Limpiar contenedor

    if (currentConfig.features) {
        currentConfig.features.forEach(featureId => {
            const el = document.getElementById(featureId);
            if (el) {
                el.classList.remove('hidden-feature');
                // Agregar visualmente al resumen de servicios
                addModuleCard(el.innerText.replace(/^[^\s]+\s/, '')); 
            }
        });
    }

    function addModuleCard(text) {
        if(activeContainer) {
            const div = document.createElement('div');
            div.className = 'module-item';
            div.innerText = `✅ ${text}`;
            activeContainer.appendChild(div);
        }
    }


    // =========================================================
    // 3. LÓGICA DE PACK DE FOTOS (ADICIONAL)
    // =========================================================
    const addonPrice = parseInt(userAddonPrice);
    const photosInfoBox = document.getElementById('photos-pack-info');
    const uploadTitle = document.getElementById('upload-title');
    const deliveryTimeSpan = document.getElementById('delivery-time');
    const catalogStatus = document.getElementById('catalog-status');
    const catalogTitle = document.getElementById('catalog-title');

    let extraPromptRules = ""; // Variable para guardar regla del bot

    if (addonPrice > 0) {
        // --- CLIENTE TIENE PACK DE FOTOS ---
        if(photosInfoBox) photosInfoBox.style.display = 'block';
        if(uploadTitle) uploadTitle.innerText = 'Sube tu Lista de Precios (Excel)';
        
        let packName = 'Pack Fotos';
        let delivery = '72hs';

        // Detectar cuál pack es según el precio
        if (addonPrice === 45000) { packName = 'Pack 50'; delivery = '72hs'; }
        else if (addonPrice === 120000) { packName = 'Pack 200'; delivery = '72hs'; }
        else if (addonPrice === 450000) { packName = 'Pack 1000'; delivery = '7 días'; }

        if(deliveryTimeSpan) deliveryTimeSpan.innerText = delivery;
        if(catalogTitle) catalogTitle.innerText = `📂 ${packName} Activo`;
        if(catalogStatus) {
            catalogStatus.innerText = 'Esperando Excel';
            catalogStatus.style.background = '#8a2be2';
        }
        
        addModuleCard('Generación Fotos IA');
        
        // Regla especial para el prompt del bot
        extraPromptRules = `NOTA IMPORTANTE: El catálogo contiene imágenes referenciales generadas por IA. Aclara al cliente que son representaciones de alta calidad si preguntan por fotos reales.`;

    } else {
        // --- CLIENTE SIN PACK ---
        if(photosInfoBox) photosInfoBox.style.display = 'none';
        if(uploadTitle) uploadTitle.innerText = 'Sube tu Catálogo Listo';
        extraPromptRules = "El catálogo utiliza las fotos proporcionadas por el cliente o placeholders.";
    }


    // =========================================================
    // 4. GENERADOR DE PROMPT BOT (LÓGICA CONTEXTUAL)
    // =========================================================
    const generateBtn = document.getElementById('generate-prompt-btn');
    const configForm = document.getElementById('bot-config-form');
    
    if (generateBtn && configForm) {
        
        loadBotConfig(); // Cargar datos previos

        generateBtn.addEventListener('click', () => {
            // Captura de inputs
            const name = document.getElementById('biz-name').value || '[Nombre Negocio]';
            const industry = document.getElementById('biz-industry').value || 'Comercio General';
            const desc = document.getElementById('biz-desc').value || 'Venta de productos.';
            const hours = document.getElementById('biz-hours').value || 'No especificado';
            const location = document.getElementById('biz-location').value || 'Online';
            const payment = document.getElementById('biz-payment').value || 'A convenir';
            const shipping = document.getElementById('biz-shipping').value || 'A convenir';
            const tone = document.getElementById('biz-tone').value;
            const emoji = document.getElementById('biz-emoji').value;
            const policy = document.getElementById('biz-policy').value || 'Consultar';

            // Regla Emojis
            let emojiRule = "";
            if(emoji === 'Nulo') emojiRule = "No uses emojis. Mantén un tono sobrio.";
            if(emoji === 'Moderado') emojiRule = "Usa emojis moderadamente (👌).";
            if(emoji === 'Abundante') emojiRule = "Usa emojis frecuentemente para sonar muy amigable (🚀🔥).";

            // Inyectamos las capacidades del plan actual + reglas de fotos
            const planCapabilities = currentConfig.promptRules; 

            // Construcción del Prompt
            const prompt = `
ACTÚA COMO: Asistente virtual experto en ventas para "${name}".
RUBRO: ${industry}.
PROPUESTA DE VALOR: ${desc}

DATOS OPERATIVOS (Úsalos para responder):
- Horarios: ${hours}
- Ubicación: ${location}
- Pagos: ${payment}
- Envíos: ${shipping}
- Políticas: ${policy}

PERSONALIDAD Y REGLAS:
- Tono: ${tone}.
- ${emojiRule}
- Objetivo Principal: Responder dudas, asesorar y cerrar ventas.

CAPACIDADES DE TU CUENTA (${currentConfig.name.toUpperCase()}):
- ${planCapabilities}
- ${extraPromptRules}

INSTRUCCIÓN FINAL:
Si no sabes un dato específico (ej: stock exacto en tiempo real), pide amablemente verificar manual. Prioriza siempre la buena atención y guía al cierre.
            `.trim();

            // Insertar en textarea
            const textArea = document.getElementById('final-prompt');
            textArea.value = prompt;
            textArea.style.borderColor = '#00f0ff';
            setTimeout(() => textArea.style.borderColor = 'transparent', 500);
        });

        // Guardar configuración
        configForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('deniaBotPrompt', document.getElementById('final-prompt').value);
            
            // Guardar inputs individuales
            const inputs = configForm.querySelectorAll('input, select');
            inputs.forEach(inp => localStorage.setItem('deniaConf_' + inp.id, inp.value));
            
            alert('¡Configuración guardada exitosamente!');
        });
    }

    function loadBotConfig() {
        const inputs = configForm.querySelectorAll('input, select');
        inputs.forEach(inp => {
            const val = localStorage.getItem('deniaConf_' + inp.id);
            if(val) inp.value = val;
        });
        const savedPrompt = localStorage.getItem('deniaBotPrompt');
        if(savedPrompt) document.getElementById('final-prompt').value = savedPrompt;
    }


    // =========================================================
    // 5. DRAG & DROP (SUBIDA DE ARCHIVOS)
    // =========================================================
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');

    if(dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
            dropZone.addEventListener(evt, (e) => { e.preventDefault(); e.stopPropagation(); }, false);
        });
        ['dragenter', 'dragover'].forEach(evt => {
            dropZone.addEventListener(evt, () => dropZone.classList.add('highlight'), false);
        });
        ['dragleave', 'drop'].forEach(evt => {
            dropZone.addEventListener(evt, () => dropZone.classList.remove('highlight'), false);
        });

        dropZone.addEventListener('drop', (e) => handleFiles(e.dataTransfer.files), false);
        fileInput.addEventListener('change', (e) => handleFiles(e.target.files), false);
    }

    function handleFiles(files) {
        [...files].forEach(file => {
            if(fileList) {
                const div = document.createElement('div');
                div.className = 'file-item';
                div.innerHTML = `
                    <div class="file-info">
                        <span style="font-size:1.2rem;">📄</span>
                        <div><div class="file-name">${file.name}</div></div>
                    </div>
                    <span class="file-status">✅ Cargado</span>
                `;
                fileList.appendChild(div);
            }
        });
    }

    // Lógica Menú Hamburguesa
const menuToggle = document.getElementById('menu-toggle');
const sidebar = document.querySelector('.sidebar');

if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('active'); // CSS hace la animación
    });
}

// Cerrar sidebar al hacer click fuera (Opcional, mejora UX)
document.addEventListener('click', (e) => {
    if (window.innerWidth <= 900 && 
        !sidebar.contains(e.target) && 
        !menuToggle.contains(e.target) && 
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});
});