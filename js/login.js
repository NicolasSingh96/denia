// Lógica para mostrar/ocultar contraseña
function togglePass() {
    const passwordInput = document.getElementById('login-password');
    const eyeIcon = document.getElementById('eye-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        eyeIcon.style.stroke = '#00f0ff'; // Cian al activar
    } else {
        passwordInput.type = 'password';
        eyeIcon.style.stroke = '#94a3b8'; // Gris al desactivar
    }
}

// Lógica de Login
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Evita recarga
    
    const btn = document.getElementById('loginBtn');
    const email = document.getElementById('login-usuario').value;
    const pass = document.getElementById('login-password').value;

    if(email && pass) {
        // 1. Efecto de carga visual
        const originalText = btn.innerText;
        btn.innerText = 'Verificando credenciales...';
        btn.style.opacity = '0.8';
        
        setTimeout(() => {
            // 2. Simulación de éxito
            btn.innerText = '¡Acceso Correcto!';
            btn.style.background = '#00ff88'; // Verde éxito
            btn.style.color = '#000';
            btn.style.border = 'none';
            
            // 3. Guardar datos simulados para el Dashboard
            // Tomamos la parte antes del @ como "Nombre" (ej: juan de juan@gmail.com)
            const simulatedName = email.split('@')[0];
            // Capitalizar primera letra (juan -> Juan)
            const displayName = simulatedName.charAt(0).toUpperCase() + simulatedName.slice(1);
            
            localStorage.setItem('deniaUser', displayName);
            
            // 4. Redirección al Dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
            
        }, 1500); // 1.5 segundos de espera simulada
    }
});