// Datos locales de prueba (Vacantes activas)
let vacantesGlobales = [
    { id: 1, titulo: "Cocinero/a", empresa: "Casa Norte", ubicacion: "Nueva Córdoba", tipo_jornada: "Tiempo completo", turno: "Turno Noche", urgente: 1, fecha: "Hace 1h" },
    { id: 2, titulo: "Barista", empresa: "Café Central", ubicacion: "Güemes", tipo_jornada: "Part-time", turno: "Turno Mañana", urgente: 0, fecha: "Hace 2h" },
    { id: 3, titulo: "Bartender", empresa: "Barra Sur", ubicacion: "Centro", tipo_jornada: "Turno noche", turno: "Full Time", urgente: 0, fecha: "Hace 3h" },
    { id: 4, titulo: "Mozo / Salonero", empresa: "El Rincón", ubicacion: "General Paz", tipo_jornada: "Tiempo completo", turno: "Turno Tarde", urgente: 1, fecha: "Hace 4h" }
];

document.addEventListener('DOMContentLoaded', () => {
    actualizarBarraNavegacion();
    renderizarTarjetasVacantes(vacantesGlobales);

    // Formulario de envío express por WhatsApp
    const expressForm = document.getElementById('express-form');
    if (expressForm) {
        expressForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const puesto = document.getElementById('puesto').value;
            const zona = document.getElementById('zona').value;
            const turno = document.getElementById('turno').value;
            
            const numeroWhatsApp = "5493513080197";
            const mensaje = encodeURIComponent(`Hola Jobbers! Necesito un/a *${puesto}* para la zona de *${zona}* en *${turno}*. ¿Me podrían ayudar a conseguir postulantes?`);
            
            window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, '_blank', 'noopener,noreferrer');
        });
    }

    // Scroll suave para enlaces de navegación
    document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && href.startsWith('#') && href.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(href);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }

                document.querySelectorAll('.nav-link, .bottom-nav-item').forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    // Cerrar modal o dropdowns al hacer clic afuera o con Escape
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('modal');
        if (e.target === modal) cerrarModal();

        const dropdownMenu = document.getElementById('recursos-menu');
        if (dropdownMenu && !e.target.closest('.dropdown')) {
            cerrarDropdown();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModal();
            cerrarDropdown();
        }
    });
});

// Helper simple para prevenir XSS
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Desplegable de Recursos
function toggleDropdown(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropdownMenu = document.getElementById('recursos-menu');
    const toggleBtn = document.getElementById('dropdown-recursos');

    if (dropdownMenu) {
        const isShown = dropdownMenu.classList.toggle('show');
        if (toggleBtn) {
            toggleBtn.setAttribute('aria-expanded', isShown ? 'true' : 'false');
        }
    }
}

function cerrarDropdown() {
    const dropdownMenu = document.getElementById('recursos-menu');
    const toggleBtn = document.getElementById('dropdown-recursos');

    if (dropdownMenu) dropdownMenu.classList.remove('show');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
}

// Renderizado de la barra de usuario / login
function actualizarBarraNavegacion() {
    const navActions = document.getElementById('nav-actions');
    if (!navActions) return;
    
    let usuarioSesion = null;
    try {
        usuarioSesion = JSON.parse(localStorage.getItem('jobbers_user'));
    } catch (e) {
        console.error("Error al leer la sesión de localStorage", e);
    }

    if (usuarioSesion && usuarioSesion.nombre) {
        navActions.innerHTML = `
            <span class="user-welcome">Hola, <strong>${escapeHTML(usuarioSesion.nombre)}</strong></span>
            <button type="button" class="btn-login" onclick="cerrarSesion()">Cerrar Sesión</button>
        `;
    } else {
        navActions.innerHTML = `
            <button type="button" class="btn-login" onclick="abrirModal('login')">Iniciar sesión</button>
            <button type="button" class="btn-register" onclick="abrirModal('registro')">Registrarme</button>
        `;
    }
}

// Modal Dinámico
function abrirModal(tipo, ofertaId = null) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    if (!modal || !body) return;

    let contenidoHTML = '';

    if (tipo === 'login') {
        contenidoHTML = `
            <div class="modal-header">
                <h3>Iniciar Sesión</h3>
                <p class="subtitle">Ingresá tus credenciales para acceder</p>
            </div>
            <form id="form-auth" class="express-form" onsubmit="procesarAutenticacion(event, 'login')">
                <div class="form-group">
                    <input type="email" id="auth-email" placeholder="Correo electrónico" required autofocus>
                </div>
                <div class="form-group">
                    <input type="password" id="auth-password" placeholder="Contraseña" required>
                </div>
                <button type="submit" class="btn-whatsapp w-100 mt-1">Entrar</button>
            </form>
            <div class="modal-footer text-center mt-2">
                <p class="text-muted text-sm">¿No tenés cuenta? <a href="#" onclick="abrirModal('registro')" class="text-accent fw-600">Registrate acá</a></p>
            </div>
        `;
    } else if (tipo === 'registro') {
        contenidoHTML = `
            <div class="modal-header">
                <h3>Crear una Cuenta</h3>
                <p class="subtitle">Sumate a la red de Jobbers</p>
            </div>
            <form id="form-auth" class="express-form" onsubmit="procesarAutenticacion(event, 'registro')">
                <div class="form-group">
                    <input type="text" id="auth-nombre" placeholder="Nombre completo o Empresa" required autofocus>
                </div>
                <div class="form-group">
                    <input type="email" id="auth-email" placeholder="Correo electrónico" required>
                </div>
                <div class="form-group">
                    <select id="auth-rol" required>
                        <option value="postulante">Soy Postulante</option>
                        <option value="empleador">Soy Empleador</option>
                    </select>
                </div>
                <button type="submit" class="btn-whatsapp w-100 mt-1">Registrarme</button>
            </form>
            <div class="modal-footer text-center mt-2">
                <p class="text-muted text-sm">¿Ya tenés cuenta? <a href="#" onclick="abrirModal('login')" class="text-accent fw-600">Iniciá sesión</a></p>
            </div>
        `;
    } else if (tipo === 'postular') {
        const oferta = vacantesGlobales.find(v => v.id === ofertaId);
        const titulo = oferta ? escapeHTML(oferta.titulo) : 'la vacante';

        contenidoHTML = `
            <div class="modal-header">
                <h3>Postulación para ${titulo}</h3>
                <p class="subtitle">Completá tus datos de contacto</p>
            </div>
            <form id="form-postular" class="express-form" onsubmit="procesarPostulacion(event, ${ofertaId})">
                <div class="form-group">
                    <input type="number" id="post-experiencia" min="0" placeholder="Años de experiencia" required autofocus>
                </div>
                <div class="form-group">
                    <select id="post-disponibilidad" required>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="rotativo">Turnos Rotativos</option>
                    </select>
                </div>
                <button type="submit" class="btn-whatsapp w-100 mt-1">Enviar Postulación</button>
            </form>
        `;
    }

    body.innerHTML = contenidoHTML;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

    // Foco en el primer input del modal
    const firstInput = body.querySelector('input, select');
    if (firstInput) firstInput.focus();
}

function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function procesarAutenticacion(e, accion) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const nombre = document.getElementById('auth-nombre')?.value || email.split('@')[0];
    const rol = document.getElementById('auth-rol')?.value || 'postulante';

    localStorage.setItem('jobbers_user', JSON.stringify({ nombre, email, rol }));
    
    mostrarToast(accion === 'registro' ? '¡Cuenta creada con éxito!' : '¡Bienvenido de nuevo!', 'success');
    actualizarBarraNavegacion();
    cerrarModal();
}

function procesarPostulacion(e, ofertaId) {
    e.preventDefault();
    mostrarToast('¡Postulación enviada correctamente!', 'success');
    cerrarModal();
}

function cerrarSesion() {
    localStorage.removeItem('jobbers_user');
    actualizarBarraNavegacion();
    mostrarToast('Has cerrado sesión correctamente', 'info');
}

// Renderizado de tarjetas usando clases CSS en lugar de inline styles
function renderizarTarjetasVacantes(ofertas) {
    const container = document.getElementById('vacantes-container');
    if (!container) return;

    if (!ofertas || ofertas.length === 0) {
        container.innerHTML = '<p class="empty-state-msg">No se encontraron vacantes con esa búsqueda.</p>';
        return;
    }

    container.innerHTML = ofertas.map(o => `
        <div class="oferta-card" onclick="abrirModal('postular', ${o.id})">
            <div class="oferta-info">
                <h4>${escapeHTML(o.titulo)}</h4>
                <p class="oferta-meta">
                    <strong>${escapeHTML(o.empresa)}</strong> • 📍 ${escapeHTML(o.ubicacion)}
                </p>
                <div class="badges-container">
                    ${o.urgente ? '<span class="badge badge-urgent">Urgente ⚡</span>' : ''}
                    <span class="badge">${escapeHTML(o.tipo_jornada)}</span>
                    <span class="badge">${escapeHTML(o.turno)}</span>
                </div>
            </div>
            <div class="oferta-action">
                <span class="oferta-fecha">${escapeHTML(o.fecha || 'Reciente')}</span>
                <span class="oferta-arrow">&#8250;</span>
            </div>
        </div>
    `).join('');
}

// Filtro en tiempo real
function filtrarVacantes() {
    const input = document.getElementById('search-filter');
    if (!input) return;
    
    const query = input.value.toLowerCase().trim();
    const filtradas = vacantesGlobales.filter(v => 
        v.titulo.toLowerCase().includes(query) || 
        v.empresa.toLowerCase().includes(query) ||
        v.ubicacion.toLowerCase().includes(query)
    );
    renderizarTarjetasVacantes(filtradas);
}

// Sistema de Notificaciones Toast
function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg toast-${tipo}`;
    toast.innerHTML = `<span>${escapeHTML(mensaje)}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
