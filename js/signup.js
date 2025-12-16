document.addEventListener('DOMContentLoaded', () => {
    console.log("🔵 SIGNUP JS: Iniciado correctamente.");

    // --- 1. CONFIGURACIÓN DE PRECIOS ---
    const PLAN_PRICES = { 
        'gratis': 0, 
        'inicial': 15000, 
        'desarrollo': 30000, 
        'medida': 0 
    };
    
    // --- 2. VARIABLES DE ESTADO ---
    let currentStep = 0;
    
    // --- 3. DETECTAR PLAN (CORREGIDO: Lee LocalStorage) ---
    // Antes buscaba en URL, ahora busca en la memoria donde lo guardó el index.html
    const storedPlan = localStorage.getItem('deniaPlan');
    const urlParams = new URLSearchParams(window.location.search);
    
    // Prioridad: 1. Memoria (localStorage), 2. URL (por si acaso), 3. Default 'inicial'
    let rawPlan = storedPlan || urlParams.get('plan') || 'inicial';
    
    // Limpieza de texto
    let planParam = rawPlan.toLowerCase().trim(); 

    // Validamos que el plan exista en nuestra lista de precios
    if (PLAN_PRICES[planParam] === undefined) {
        console.warn(`⚠️ Plan "${planParam}" no reconocido. Usando "inicial" por defecto.`);
        planParam = 'inicial';
    }

    let basePrice = PLAN_PRICES[planParam];

    // Guardamos en variable global y actualizamos localStorage por si venía de URL
    
    window.selectedPlanKey = planParam; 
    localStorage.setItem('deniaPlan', planParam); // Aseguramos persistencia
    
    console.log(`ℹ️ Plan detectado: ${planParam} ($${basePrice})`);

    // --- 4. REFERENCIAS DOM ---
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const progressFill = document.getElementById('progress-fill');
    
    // Elementos donde mostramos el nombre del plan en el HTML
    const nameEl = document.getElementById('selected-plan-name'); // Asegúrate de tener este ID en tu HTML (Paso 2)
    const priceEl = document.getElementById('selected-plan-price'); // Asegúrate de tener este ID en tu HTML (Paso 2)

    if (!nextBtn || !prevBtn || steps.length === 0) {
        console.error("🔴 ERROR CRÍTICO: Faltan elementos en el HTML.");
        return;
    }

    // --- 5. INICIALIZACIÓN UI ---
    
    // Formatear nombre para mostrar (ej: "desarrollo" -> "Plan Desarrollo")
    let displayName = "Plan Inicial";
    if (planParam === 'gratis') displayName = "Prueba Gratis";
    else if (planParam === 'desarrollo') displayName = "Plan Desarrollo";
    else if (planParam === 'medida') displayName = "Plan Corporativo";
    else displayName = "Plan " + planParam.charAt(0).toUpperCase() + planParam.slice(1);

    // Actualizar textos en el paso 2 (Resumen)
    if(nameEl) nameEl.innerText = displayName;
    if(priceEl) priceEl.innerText = `$${basePrice.toLocaleString('es-AR')}`;

    // Función de cálculo global
    window.calculateTotal = function() {
        const radios = document.getElementsByName('addon-pack');
        let addonPrice = 0;
        
        // Si es plan a medida, el precio base es 0 o "A cotizar"
        if(planParam === 'medida') {
            const totalEl = document.getElementById('final-total');
            if(totalEl) totalEl.innerText = "A Cotizar";
            if (currentStep === steps.length - 1) nextBtn.innerText = "Finalizar Solicitud";
            window.selectedAddonPrice = 0;
            return;
        }

        for (const r of radios) {
            if (r.checked) {
                addonPrice = parseInt(r.value) || 0;
                break;
            }
        }
        const total = basePrice + addonPrice;
        window.selectedAddonPrice = addonPrice;

        // Actualizar visuales
        const totalEl = document.getElementById('final-total');
        if(totalEl) totalEl.innerText = `$${total.toLocaleString('es-AR')}`;

        // Actualizar botón pagar en el último paso
        if (currentStep === steps.length - 1) {
            nextBtn.innerText = `Pagar $${total.toLocaleString('es-AR')}`;
        }
    };

    // Ejecutar cálculo inicial
    calculateTotal();
    updateUI();

    // --- 6. EVENTOS DE NAVEGACIÓN ---
    
    nextBtn.addEventListener('click', () => {
        if (validateCurrentStep()) {
            if (currentStep < steps.length - 1) {
                currentStep++;
                updateUI();
                // Recalcular al cambiar de paso por si cambiaron algo
                calculateTotal();
            } else {
                submitForm();
            }
        } else {
            // Efecto Shake de error
            nextBtn.classList.add('shake-btn');
            setTimeout(() => nextBtn.classList.remove('shake-btn'), 300);
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateUI();
        }
    });

    // Event listener para los radio buttons de addons
    const addonRadios = document.getElementsByName('addon-pack');
    addonRadios.forEach(radio => {
        radio.addEventListener('change', window.calculateTotal);
    });

    // --- 7. FUNCIONES LÓGICAS ---

    function updateUI() {
        // Mostrar paso actual
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active');
                step.style.display = 'block'; 
            } else {
                step.classList.remove('active');
                step.style.display = 'none';
            }
        });

        // Barra progreso
        if (progressFill) {
            const percent = (currentStep / (steps.length - 1)) * 100;
            progressFill.style.width = `${percent}%`;
        }

        // Indicadores circulares
        document.querySelectorAll('.step-indicator').forEach((ind, i) => {
            ind.classList.toggle('active', i === currentStep);
            ind.classList.toggle('completed', i < currentStep);
        });

        // Botones
        prevBtn.style.display = currentStep === 0 ? 'none' : 'block';

        if (currentStep === steps.length - 1) {
            // Último paso
            if(planParam === 'medida') {
                nextBtn.innerText = "Enviar Solicitud";
            } else {
                // Forzamos un recálculo para asegurar que el precio esté bien en el botón
                calculateTotal(); 
            }
            nextBtn.style.background = '#00ff88';
            nextBtn.style.color = '#000';
        } else {
            nextBtn.innerText = 'Siguiente';
            nextBtn.style.background = ''; 
            nextBtn.style.color = '#fff';
        }
    }

    function validateCurrentStep() {
        const currentStepEl = steps[currentStep];
        const inputs = currentStepEl.querySelectorAll('input[required], select[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim() || !input.checkValidity()) {
                isValid = false;
                input.classList.add('input-error'); // Clase definida en CSS
                
                input.addEventListener('input', () => {
                    input.classList.remove('input-error');
                }, { once: true });
            }
        });
        
        return isValid;
    }

    function submitForm() {
        nextBtn.innerText = 'Procesando...';
        nextBtn.disabled = true;

        const nombreUser = document.getElementById('nombre')?.value || 'Usuario';
        const finalPlan = window.selectedPlanKey || 'inicial';
        const finalAddon = window.selectedAddonPrice || 0;

        console.log("💾 GUARDANDO:", { nombre: nombreUser, plan: finalPlan, addon: finalAddon });

        // Guardar datos críticos para el Dashboard
        localStorage.setItem('deniaUser', nombreUser);
        localStorage.setItem('deniaPlan', finalPlan);
        localStorage.setItem('deniaAddonPrice', finalAddon.toString());

        // Simular delay de red y redirigir
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    }

    // Formateo tarjeta
    const cardInp = document.getElementById('card-number');
    if(cardInp) {
        cardInp.addEventListener('input', e => {
            e.target.value = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
        });
    }
});