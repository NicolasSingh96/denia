document.addEventListener('DOMContentLoaded', () => {
    const steps = Array.from(document.querySelectorAll('.form-step'));
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const indicators = document.querySelectorAll('.step-indicator');
    const progressFill = document.getElementById('progress-fill');

    let currentStep = 0;
    updateUI();

    // BOTÓN SIGUIENTE
    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            if (currentStep < steps.length - 1) {
                currentStep++;
                updateUI();
            } else {
                handleFinalSubmit();
            }
        }
    });

    // BOTÓN ATRÁS
    prevBtn.addEventListener('click', () => {
        if (currentStep > 0) {
            currentStep--;
            updateUI();
        }
    });

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

        // Actualizar indicadores
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentStep);
            indicator.classList.toggle('completed', index < currentStep);
        });

        // Barra de progreso
        const progressPercent = (currentStep / (steps.length - 1)) * 100;
        progressFill.style.width = `${progressPercent}%`;

        // Botones
        prevBtn.style.display = currentStep === 0 ? 'none' : 'block';
        
        if (currentStep === steps.length - 1) {
            nextBtn.innerText = 'Pagar y Finalizar';
            nextBtn.style.background = '#00f0ff'; // Cian
            nextBtn.style.color = '#000';
        } else {
            nextBtn.innerText = 'Siguiente';
            nextBtn.style.background = ''; // Default
            nextBtn.style.color = '';
        }
    }

    function validateStep(stepIndex) {
        const currentFormStep = steps[stepIndex];
        const inputs = currentFormStep.querySelectorAll('input, select');
        let isValid = true;
        inputs.forEach(input => {
            if (!input.checkValidity() || input.value.trim() === '') {
                isValid = false;
                input.style.borderColor = '#ff4757'; // Marcar error
            } else {
                input.style.borderColor = ''; // Limpiar error
            }
        });
        return isValid;
    }

    function handleFinalSubmit() {
        nextBtn.innerText = 'Procesando...';
        nextBtn.disabled = true;
        
        // Simular envío de datos
        setTimeout(() => {
            // Guardar nombre para mostrar en Dashboard (Simulación)
            const nombre = document.getElementById('nombre').value;
            localStorage.setItem('deniaUser', nombre);

            window.location.href = 'dashboard.html';
        }, 2000);
    }
});