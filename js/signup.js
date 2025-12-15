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
    
    // --- 3. DETECTAR PLAN (URL) - CORRECCIÓN APLICADA ---
    const urlParams = new URLSearchParams(window.location.search);
    let rawPlan = urlParams.get('plan') || 'inicial';
    
    // Forzamos minúsculas para evitar errores (Ej: "Desarrollo" -> "desarrollo")
    let planParam = rawPlan.toLowerCase(); 

    // Validamos que el plan exista, si no, usamos 'inicial'
    if (PLAN_PRICES[planParam] === undefined) {
        console.warn(`⚠️ Plan "${planParam}" no reconocido. Usando "inicial" por defecto.`);
        planParam = 'inicial';
    }

    let basePrice = PLAN_PRICES[planParam];

    // Guardamos en variable global para el guardado final
    window.selectedPlanKey = planParam; 
    console.log(`ℹ️ Plan detectado: ${planParam} ($${basePrice})`);

    // --- 4. REFERENCIAS DOM ---
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const progressFill = document.getElementById('progress-fill');
    const nameEl = document.getElementById('selected-plan-name');
    const priceEl = document.getElementById('selected-plan-price');

    // Verificar que todo exista para evitar errores
    if (!nextBtn || !prevBtn || steps.length === 0) {
        console.error("🔴 ERROR CRÍTICO: Faltan elementos en el HTML.");
        return;
    }

    // --- 5. INICIALIZACIÓN UI ---
    // Poner nombre y precio base en el paso 2
    if(nameEl) nameEl.innerText = `Plan ${planParam.charAt(0).toUpperCase() + planParam.slice(1)}`;
    if(priceEl) priceEl.innerText = `$${basePrice.toLocaleString('es-AR')}`;

    // Función de cálculo global (para los radio buttons)
    window.calculateTotal = function() {
        const radios = document.getElementsByName('addon-pack');
        let addonPrice = 0;
        for (const r of radios) {
            if (r.checked) {
                addonPrice = parseInt(r.value) || 0;
                break;
            }
        }
        const total = basePrice + addonPrice;
        window.selectedAddonPrice = addonPrice; // Guardar para submit

        // Actualizar visuales
        const totalEl = document.getElementById('final-total');
        if(totalEl) totalEl.innerText = `$${total.toLocaleString('es-AR')}`;

        // Si estamos en el último paso, actualizar botón pagar
        if (currentStep === steps.length - 1) {
            nextBtn.innerText = `Pagar $${total.toLocaleString('es-AR')}`;
        }
    };

    // Ejecutar cálculo inicial y UI
    calculateTotal();
    updateUI();

    // --- 6. EVENTOS DE NAVEGACIÓN ---
    
    // BOTÓN SIGUIENTE
    nextBtn.addEventListener('click', () => {
        console.log(`👉 Click en Siguiente. Paso actual: ${currentStep}`);

        if (validateCurrentStep()) {
            console.log("✅ Validación exitosa.");
            
            if (currentStep < steps.length - 1) {
                // Avanzar
                currentStep++;
                updateUI();
            } else {
                // Finalizar (Submit)
                submitForm();
            }
        } else {
            console.warn("❌ Validación fallida.");
            // Efecto visual de error
            nextBtn.classList.add('shake-btn');
            setTimeout(() => nextBtn.classList.remove('shake-btn'), 300);
        }
    });

    // BOTÓN ATRÁS
    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateUI();
        }
    });

    // --- 7. FUNCIONES LÓGICAS ---

    function updateUI() {
        // Mostrar/Ocultar Pasos
        steps.forEach((step, index) => {
            if (index === currentStep) {
                step.classList.add('active');
                step.style.display = 'block'; 
            } else {
                step.classList.remove('active');
                step.style.display = 'none';
            }
        });

        // Barra de progreso
        if (progressFill) {
            const percent = (currentStep / (steps.length - 1)) * 100;
            progressFill.style.width = `${percent}%`;
        }

        // Indicadores (Bolitas)
        document.querySelectorAll('.step-indicator').forEach((ind, i) => {
            ind.classList.toggle('active', i === currentStep);
            ind.classList.toggle('completed', i < currentStep);
        });

        // Visibilidad Botones
        prevBtn.style.display = currentStep === 0 ? 'none' : 'block';

        if (currentStep === steps.length - 1) {
            // Último paso
            const currentTotal = document.getElementById('final-total')?.innerText || '$0';
            nextBtn.innerText = `Pagar ${currentTotal}`;
            nextBtn.style.background = '#00ff88';
            nextBtn.style.color = '#000';
        } else {
            // Pasos normales
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
            // Chequeamos si está vacío o formato inválido
            if (!input.value.trim() || !input.checkValidity()) {
                isValid = false;
                input.style.borderColor = '#ff4757'; // Rojo error
                input.style.boxShadow = '0 0 5px rgba(255, 71, 87, 0.5)';
                
                // Limpiar error al escribir
                input.addEventListener('input', () => {
                    input.style.borderColor = '';
                    input.style.boxShadow = '';
                }, { once: true });
            } else {
                input.style.borderColor = '';
                input.style.boxShadow = '';
            }
        });
        
        return isValid;
    }

    function submitForm() {
        console.log("💾 Guardando datos y redirigiendo...");
        nextBtn.innerText = 'Procesando...';
        nextBtn.disabled = true;

        // Capturar datos finales
        const nombreUser = document.getElementById('nombre')?.value || 'Usuario';
        const finalPlan = window.selectedPlanKey || 'inicial';
        const finalAddon = window.selectedAddonPrice || '0';

        // Log de seguridad para ver qué estamos guardando
        console.log("Datos a guardar:", { nombre: nombreUser, plan: finalPlan, addon: finalAddon });

        // Guardar en LocalStorage
        localStorage.setItem('deniaUser', nombreUser);
        localStorage.setItem('deniaPlan', finalPlan);
        localStorage.setItem('deniaAddonPrice', finalAddon.toString());

        // Redirigir
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1000);
    }

    // Formateo tarjeta de crédito (espacios cada 4 números)
    const cardInp = document.getElementById('card-number');
    if(cardInp) {
        cardInp.addEventListener('input', e => {
            e.target.value = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
        });
    }
});