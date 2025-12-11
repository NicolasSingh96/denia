document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');
    
    let width, height;

    // Ajustar tamaño del canvas
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resize);
    resize();

    // Configuración
    const particles = [];
    const particleCount = 80; // Cantidad de nodos
    const connectionDist = 140; // Distancia para conectar líneas
    const codeDrops = [];
    const codeSymbols = "01{}<>/;var";

    // --- CLASE PARTÍCULA (Puntos Cian / Red Neuronal) ---
    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.8; // Velocidad X
            this.vy = (Math.random() - 0.5) * 0.8; // Velocidad Y
            this.size = Math.random() * 2 + 1.5;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            // Rebotar en bordes
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = '#00f0ff'; // Color Cian Brillante
            ctx.fill();
        }
    }

    // --- CLASE CÓDIGO (Lluvia Matrix) ---
    class CodeDrop {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.text = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
            this.speed = Math.random() * 1.5 + 0.5;
            this.opacity = Math.random() * 0.4 + 0.1;
        }
        update() {
            this.y += this.speed;
            if (this.y > height) {
                this.y = -20;
                this.x = Math.random() * width;
            }
        }
        draw() {
            ctx.fillStyle = `rgba(0, 240, 255, ${this.opacity})`;
            ctx.font = '14px "Space Grotesk"';
            ctx.fillText(this.text, this.x, this.y);
        }
    }

    // Inicializar
    function init() {
        for (let i = 0; i < particleCount; i++) particles.push(new Particle());
        for (let i = 0; i < 50; i++) codeDrops.push(new CodeDrop());
    }

    // Bucle de Animación Principal
    function animate() {
        // Limpiar el canvas 
        ctx.clearRect(0, 0, width, height);

        // 1. Dibujar Lluvia de Código
        codeDrops.forEach(drop => {
            drop.update();
            drop.draw();
        });

        // 2. Dibujar Red Neuronal
        particles.forEach((p, index) => {
            p.update();
            p.draw();

            // Dibujar líneas entre puntos cercanos
            for (let j = index + 1; j < particles.length; j++) {
                const p2 = particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDist) {
                    ctx.beginPath();
                    // Opacidad basada en distancia (más lejos = más transparente)
                    const opacity = 1 - (distance / connectionDist);
                    ctx.strokeStyle = `rgba(138, 43, 226, ${opacity})`; // Violeta
                    ctx.lineWidth = 1;
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(animate);
    }

    init();
    animate();
});

// --- LÓGICA TYPEWRITER  ---
    
    const textElement = document.getElementById('typewriter-text');
    // El símbolo '^' representará el salto de línea <br>
    const phrases = ["Convertí tu catálogo o una simple lista de productos en un asistente de ventas por WhatsApp."]; 
    
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100; // Velocidad de escritura normal

    function typeWriterEffect() {
        const currentPhrase = phrases[phraseIndex];
        
        // Determinar qué mostrar en pantalla (manejando el salto de línea)
        let displayText = currentPhrase.substring(0, charIndex);
        
        // Si el texto incluye el símbolo especial '^', lo reemplazamos por <br>
        if (displayText.includes('^')) {
            displayText = displayText.replace('^', '<br>');
        }

        textElement.innerHTML = displayText;

        // Lógica de Velocidad
        typeSpeed = isDeleting ? 50 : 100; // Borra más rápido que escribe

        if (!isDeleting && charIndex < currentPhrase.length) {
            // ESTADO: Escribiendo
            charIndex++;
            setTimeout(typeWriterEffect, typeSpeed);
        } 
        else if (isDeleting && charIndex > 0) {
            // ESTADO: Borrando
            charIndex--;
            setTimeout(typeWriterEffect, typeSpeed);
        } 
        else if (!isDeleting && charIndex === currentPhrase.length) {
            // ESTADO: Frase completa (Pausa antes de borrar)
            isDeleting = true;
            setTimeout(typeWriterEffect, 3000); // Espera 2 segundos antes de borrar
        } 
        else if (isDeleting && charIndex === 0) {
            // ESTADO: Borrado completo (Pausa antes de volver a escribir)
            isDeleting = false;
            // Si tuvieras más frases, aquí cambiaría de frase:
            // phraseIndex = (phraseIndex + 1) % phrases.length;
            setTimeout(typeWriterEffect, 500); // Espera medio segundo
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
    // --- 1. FONDO ANIMADO (CANVAS) --- 
    // (Mantenemos tu código del fondo intacto aquí arriba)
    const canvas = document.getElementById('bg-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resize);
        resize();

        const particles = [];
        const particleCount = 60; 
        const connectionDist = 140; 
        const codeDrops = [];
        const codeSymbols = "01{}<>/;var";

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.8;
                this.vy = (Math.random() - 0.5) * 0.8;
                this.size = Math.random() * 2 + 1.5;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = '#00f0ff';
                ctx.fill();
            }
        }

        class CodeDrop {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.text = codeSymbols[Math.floor(Math.random() * codeSymbols.length)];
                this.speed = Math.random() * 1.5 + 0.5;
                this.opacity = Math.random() * 0.4 + 0.1;
            }
            update() {
                this.y += this.speed;
                if (this.y > height) {
                    this.y = -20;
                    this.x = Math.random() * width;
                }
            }
            draw() {
                ctx.fillStyle = `rgba(0, 240, 255, ${this.opacity})`;
                ctx.font = '14px "Space Grotesk"';
                ctx.fillText(this.text, this.x, this.y);
            }
        }

        function init() {
            for (let i = 0; i < particleCount; i++) particles.push(new Particle());
            for (let i = 0; i < 50; i++) codeDrops.push(new CodeDrop());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);
            codeDrops.forEach(drop => { drop.update(); drop.draw(); });
            particles.forEach((p, index) => {
                p.update(); p.draw();
                for (let j = index + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < connectionDist) {
                        const opacity = 1 - (distance / connectionDist);
                        ctx.strokeStyle = `rgba(138, 43, 226, ${opacity})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });
            requestAnimationFrame(animate);
        }
        init();
        animate();
    }

    // --- 2. EFECTO MÁQUINA DE ESCRIBIR (H1 HERO) ---
    const textElement = document.getElementById('typewriter-text');
    if (textElement) {
        const phrases = ["Convertí tu catálogo o simple lista de productos en un asistente de ventas por WhatsApp."]; 
        let phraseIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeWriterEffect() {
            const currentPhrase = phrases[phraseIndex];
            let displayText = currentPhrase.substring(0, charIndex);
            if (displayText.includes('^')) displayText = displayText.replace('^', '<br>');
            textElement.innerHTML = displayText;

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex < currentPhrase.length) {
                charIndex++;
                setTimeout(typeWriterEffect, typeSpeed);
            } else if (isDeleting && charIndex > 0) {
                charIndex--;
                setTimeout(typeWriterEffect, typeSpeed);
            } else if (!isDeleting && charIndex === currentPhrase.length) {
                isDeleting = true;
                setTimeout(typeWriterEffect, 2000);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                setTimeout(typeWriterEffect, 500);
            }
        }
        typeWriterEffect();
    }

    // --- 3. CHAT DINÁMICO (6 ESCENARIOS CON IMÁGENES REALES) ---
    const chatContainer = document.getElementById('dynamic-chat');
    if (chatContainer) {
        const scenarios = [
            // --- 1. PRODUCTO (Tecnología) ---
            [
                { type: 'user', text: 'Hola, busco auriculares con cancelación de ruido' },
                { type: 'bot', text: '¡Tengo justo lo que buscas! Mira este modelo:' },
                { 
                    type: 'product', 
                    name: 'Sony WH-1000XM5', 
                    desc: 'Batería 30hs, Noise Cancelling líder.',
                    price: '$349', 
                    // IMAGEN REAL (Unsplash)
                    img: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=60' 
                }
            ],

            // --- 2. PRODUCTO (Zapatillas) ---
            [
                { type: 'user', text: 'Me gustan las Jordan retro, tenés?' },
                { type: 'bot', text: '¡Recién llegadas! Últimos pares:' },
                { 
                    type: 'product', 
                    name: 'Air Jordan 1 High', 
                    desc: 'Edición limitada Chicago. Cuero premium.',
                    price: '$180', 
                    // IMAGEN REAL (Unsplash)
                    img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=60' 
                }
            ],

            // --- 3. CONSULTA (Envíos) ---
            [
                { type: 'user', text: '¿Hacen envíos a Córdoba Capital?' },
                { type: 'bot', text: '¡Sí! Enviamos a todo el país' },
                { type: 'bot', text: 'Es GRATIS superando los $50.000 y llega en 48hs.' }
            ],

            // --- 4. CONSULTA (Pagos) ---
            [
                { type: 'user', text: '¿Qué medios de pago aceptan?' },
                { type: 'bot', text: 'Aceptamos todas las tarjetas de crédito 💳' },
                { type: 'bot', text: 'Tenés 3 y 6 cuotas sin interés con Visa y Master.' }
            ],

            // --- 5. TURNOS (Barbería) ---
            [
                { type: 'user', text: 'Quiero un turno para corte de pelo' },
                { type: 'bot', text: 'Genial. Tengo disponibilidad mañana:' },
                { type: 'bot', text: '📅 Jueves: 16:00hs o 17:30hs' },
                { type: 'user', text: 'A las 16:00 por favor' },
                { type: 'bot', text: '¡Listo! Turno reservado. Te esperamos. ✂️' }
            ],
        
    
            // --- 6. TURNOS (Médico) ---
            [
                { type: 'user', text: 'Hola, necesito reprogramar mi turno' },
                { type: 'bot', text: 'Entendido. ¿Para qué día prefieres?' },
                { type: 'user', text: 'Para el lunes por la mañana' },
                { type: 'bot', text: 'Agendado: Lunes 24 a las 09:30hs ✅' }
            ]
        ];

        let scenarioIndex = 0;
        const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        async function runChatSimulation() {
            while (true) {
                const conversation = scenarios[scenarioIndex];
                chatContainer.innerHTML = ''; // Limpiar chat
                await wait(1000); 

                for (let msg of conversation) {
                    if (msg.type === 'user') {
                        addMessage('msg-user', msg.text);
                    } else if (msg.type === 'bot') {
                        await wait(500);
                        addMessage('msg-bot', msg.text);
                    } else if (msg.type === 'product') {
                        await wait(400);
                        addProductV2(msg);
                    }
                    await wait(1800);
                }
                await wait(3000);
                scenarioIndex = (scenarioIndex + 1) % scenarios.length;
            }
        }

        function addMessage(className, text) {
            const div = document.createElement('div');
            div.className = `msg ${className} msg-enter`;
            div.innerText = text;
            chatContainer.appendChild(div);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function addProductV2(data) {
            const div = document.createElement('div');
            div.className = 'product-card msg-enter';
            
            // Detecta si es URL web o local
            const bgStyle = data.img.includes('http') || data.img.includes('assets') 
                ? `url('${data.img}')` 
                : data.img;

            div.innerHTML = `
                <div class="prod-img-container" style="background-image: ${bgStyle};"></div>
                <div class="prod-title">${data.name}</div>
                <div class="prod-desc">${data.desc}</div>
                <div class="prod-footer">
                    <div class="prod-price">${data.price}</div>
                    <div class="buy-btn">COMPRAR</div>
                </div>
            `;
            chatContainer.appendChild(div);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        runChatSimulation();
    }
});

// --- EFECTO STICKY DEL CHAT ---
document.addEventListener('scroll', () => {
    const wrapper = document.getElementById('chat-wrapper');
    const marquee = document.querySelector('.tech-marquee');
    
    if (wrapper && marquee) {
        const scrollY = window.scrollY;
        const marqueeTop = marquee.getBoundingClientRect().top + scrollY;
        const wrapperHeight = wrapper.offsetHeight;
        
        // Ajuste de "tope": Para que frene un poco antes de tocar el marquee (ej: 50px)
        const stopPoint = marqueeTop - wrapperHeight - 50;
        
        // Si estamos scrolleando pero aún no llegamos al tope...
        if (scrollY < stopPoint) {
            // Mover el chat hacia abajo siguiendo el scroll (Efecto Sticky)
            // Multiplicamos por 0.9 para que tenga un efecto "parallax" sutil (se mueve un pelín más lento que tú)
            // O usa scrollY * 1 para que sea totalmente fijo.
            wrapper.style.transform = `translateY(${scrollY * 0.85}px)`; 
        } else {
            // Si llegamos al tope, lo dejamos quieto en esa posición final
            wrapper.style.transform = `translateY(${stopPoint * 0.85}px)`;
        }
    }
});
    