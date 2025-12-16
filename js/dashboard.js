document.addEventListener('DOMContentLoaded', () => {
    
    // =========================================================
    // 1. RECUPERAR DATOS Y NORMALIZAR (CORREGIDO)
    // =========================================================
    const userName = localStorage.getItem('deniaUser') || 'Usuario';
    
    // Recuperamos lo que haya guardado el registro (ej: "Plan Desarrollo", "Desarrollo", "plan-desarrollo")
    let rawPlan = localStorage.getItem('deniaPlan') || 'inicial';
    rawPlan = rawPlan.toLowerCase(); // Convertimos todo a minúsculas

    // LÓGICA DE DETECCIÓN INTELIGENTE
    // Asignamos la "clave interna" correcta basándonos en palabras clave
    let userPlan = 'inicial'; // Valor por defecto

    if (rawPlan.includes('gratis') || rawPlan.includes('prueba')) {
        userPlan = 'gratis';
    } else if (rawPlan.includes('desarrollo')) {
        userPlan = 'desarrollo';
    } else if (rawPlan.includes('medida') || rawPlan.includes('corporativo')) {
        userPlan = 'medida';
    } else {
        // Si no detecta nada especial, o dice 'inicial', se queda en inicial
        userPlan = 'inicial';
    }

    const userAddonPrice = localStorage.getItem('deniaAddonPrice') || '0';

    console.log("Plan detectado (Raw):", rawPlan);
    console.log("Plan asignado (Key):", userPlan);

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
            labels: [],
            promptRules: "Solo gestionas ventas MINORISTAS. No ofrezcas precios mayoristas."
        },
        'inicial': {
            name: 'Plan Inicial', limit: 2000, color: '#00f0ff',
            features: ['menu-metrics', 'menu-prices', 'menu-tickets'],
            labels: ['label-gestion'],
            promptRules: "Gestionas ventas minoristas. Puedes derivar a soporte vía tickets si es necesario."
        },
        'desarrollo': {
            name: 'Plan Desarrollo', limit: 7000, color: '#8a2be2',
            features: [
                'menu-metrics', 'menu-prices', 'menu-tickets', 
                'menu-wholesale', 'menu-handoff', 'menu-onboarding'
            ],
            labels: ['label-gestion', 'label-avanzado'],
            promptRules: "Eres capaz de gestionar VENTAS MAYORISTAS y MINORISTAS. Si el cliente pide hablar con un humano, puedes realizar la derivación (Handoff)."
        },
        'medida': {
            name: 'Corporativo', limit: 'Ilimitado', color: '#fff',
            features: [
                'menu-metrics', 'menu-prices', 'menu-tickets', 
                'menu-wholesale', 'menu-handoff', 'menu-onboarding',
                'menu-custom-ai', 'menu-vip'
            ],
            labels: ['label-gestion', 'label-avanzado', 'label-corp'],
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
    if(progressEl) progressEl.style.width = '5%'; 

    // --- DESBLOQUEAR MENÚS Y ETIQUETAS ---
    if (currentConfig.features) {
        currentConfig.features.forEach(featureId => {
            const el = document.getElementById(featureId);
            if (el) el.classList.remove('hidden-feature');
        });
    }

    if (currentConfig.labels) {
        currentConfig.labels.forEach(labelId => {
            const el = document.getElementById(labelId);
            if (el) el.classList.remove('hidden-feature');
        });
    }

    // =========================================================
    // 3. NAVEGACIÓN SPA (Single Page Application)
    // =========================================================
    const navMapping = {
        'menu-general': 'panel-general',
        'menu-metrics': 'panel-metrics',
        'menu-prices': 'panel-list',
        'menu-tickets': 'panel-tickets',
        'menu-wholesale': 'panel-wholesale',
        'menu-handoff': 'panel-handoff',
        'menu-onboarding': 'panel-general', // Redirige al general o crea uno nuevo
        'menu-custom-ai': 'panel-custom-ai',
        'menu-vip': 'panel-vip'
    };

    const menuLinks = document.querySelectorAll('.menu-item');
    const sectionTitle = document.getElementById('section-title');

    menuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Ignorar el botón de cerrar sesión
            if(link.classList.contains('logout-btn')) return;

            e.preventDefault();

            // 1. UI Menú: Activar link
            menuLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // 2. Ocultar todos los paneles
            document.querySelectorAll('.panel-section').forEach(panel => {
                panel.classList.add('hidden-panel');
            });

            // 3. Mostrar el panel destino
            const targetPanelId = navMapping[link.id];
            if(targetPanelId) {
                const targetPanel = document.getElementById(targetPanelId);
                if (targetPanel) {
                    targetPanel.classList.remove('hidden-panel');
                    // Actualizar Título
                    if(sectionTitle) sectionTitle.innerText = link.innerText.trim();
                }
            }

            // 4. Cerrar menú en móvil
            const sidebar = document.querySelector('.sidebar');
            if(window.innerWidth <= 900 && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        });
    });

    // =========================================================
    // 4. LÓGICA DE PACK DE FOTOS (ADICIONAL)
    // =========================================================
    const addonPrice = parseInt(userAddonPrice);
    const photosInfoBox = document.getElementById('photos-pack-info');
    const uploadTitle = document.getElementById('upload-title');
    const deliveryTimeSpan = document.getElementById('delivery-time');
    const catalogStatus = document.getElementById('catalog-status');
    const catalogTitle = document.getElementById('catalog-title');

    let extraPromptRules = "";

    if (addonPrice > 0) {
        if(photosInfoBox) photosInfoBox.style.display = 'block';
        if(uploadTitle) uploadTitle.innerText = 'Sube tu Lista de Precios (Excel)';
        
        let packName = 'Pack Fotos';
        let delivery = '72hs';

        if (addonPrice === 45000) { packName = 'Pack 50'; delivery = '72hs'; }
        else if (addonPrice === 120000) { packName = 'Pack 200'; delivery = '72hs'; }
        else if (addonPrice === 450000) { packName = 'Pack 1000'; delivery = '7 días'; }

        if(deliveryTimeSpan) deliveryTimeSpan.innerText = delivery;
        if(catalogTitle) catalogTitle.innerText = `📂 ${packName} Activo`;
        if(catalogStatus) {
            catalogStatus.innerText = 'Esperando Excel';
            catalogStatus.style.background = '#8a2be2';
        }
        
        extraPromptRules = `NOTA IMPORTANTE: El catálogo contiene imágenes referenciales generadas por IA. Aclara al cliente que son representaciones de alta calidad.`;

    } else {
        if(photosInfoBox) photosInfoBox.style.display = 'none';
        if(uploadTitle) uploadTitle.innerText = 'Sube tu Catálogo Listo';
        extraPromptRules = "El catálogo utiliza las fotos proporcionadas por el cliente o placeholders.";
    }

    // =========================================================
    // 5. GENERADOR DE PROMPT BOT
    // =========================================================
    const generateBtn = document.getElementById('generate-prompt-btn');
    const configForm = document.getElementById('bot-config-form');
    
    if (generateBtn && configForm) {
        loadBotConfig(); 

        generateBtn.addEventListener('click', (e) => {
            e.preventDefault(); // Evitar submit del form
            
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

            let emojiRule = "";
            if(emoji === 'Nulo') emojiRule = "No uses emojis. Mantén un tono sobrio.";
            if(emoji === 'Moderado') emojiRule = "Usa emojis moderadamente (👌).";
            if(emoji === 'Abundante') emojiRule = "Usa emojis frecuentemente (🚀🔥).";

            const planCapabilities = currentConfig.promptRules; 

            const prompt = `
ACTÚA COMO: Asistente virtual experto en ventas para "${name}".
RUBRO: ${industry}.
PROPUESTA DE VALOR: ${desc}

DATOS OPERATIVOS:
- Horarios: ${hours}
- Ubicación: ${location}
- Pagos: ${payment}
- Envíos: ${shipping}
- Políticas: ${policy}

PERSONALIDAD:
- Tono: ${tone}.
- ${emojiRule}

CAPACIDADES DE TU CUENTA (${currentConfig.name.toUpperCase()}):
- ${planCapabilities}
- ${extraPromptRules}

INSTRUCCIÓN:
Responde dudas, asesora y cierra ventas. Si no sabes un dato, pide verificar manual.
            `.trim();

            const textArea = document.getElementById('final-prompt');
            textArea.value = prompt;
            textArea.style.borderColor = '#00f0ff';
            setTimeout(() => textArea.style.borderColor = 'transparent', 500);
        });

        configForm.addEventListener('submit', (e) => {
            e.preventDefault();
            localStorage.setItem('deniaBotPrompt', document.getElementById('final-prompt').value);
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
    // 6. DRAG & DROP
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

    // =========================================================
    // 7. MENÚ MÓVIL (HAMBURGUESA)
    // =========================================================
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
        });
    }

    // Cerrar sidebar al hacer click fuera
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 900 && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target) && 
            sidebar.classList.contains('active')) {
            sidebar.classList.remove('active');
        }
    });
});