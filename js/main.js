/* ==========================================================================
   JOBBERS - LOGICA DE INTERFAZ Y MANEJO DE ESTADOS
   ========================================================================== */

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
            const puesto = document.getElementById('puesto')?.value || "Personal";
            const zona = document.getElementById('zona')?.value || "Córdoba";
            const turno = document.getElementById('turno')?.value || "Indistinto";
            
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

/* ==========================================================================
   HELPERS & VALIDACIONES
   ========================================================================== */

// Prevenir XSS en texto inyectado
function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Validar fortaleza y coincidencia de contraseña
function validarSeguridadPassword(password, confirmPassword) {
    if (password !== confirmPassword) {
        return "Las contraseñas no coinciden.";
    }
    if (password.length < 8) {
        return "La contraseña debe tener al menos 8 caracteres.";
    }
    if (!/[A-Z]/.test(password)) {
        return "La contraseña debe incluir al menos una letra mayúscula.";
    }
    if (!/[0-9]/.test(password)) {
        return "La contraseña debe incluir al menos un número.";
    }
    return null;
}

/* ==========================================================================
   DROPDOWNS & NAVEGACIÓN
   ========================================================================== */

function toggleDropdown(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
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
            <span class="user-welcome" style="font-size:0.85rem; color: var(--text-muted); align-self:center;">
                Hola, <strong style="color:var(--text-white);">${escapeHTML(usuarioSesion.nombre)}</strong>
            </span>
            <button type="button" class="btn-login" onclick="cerrarSesion()">Cerrar Sesión</button>
        `;
    } else {
        navActions.innerHTML = `
            <button type="button" class="btn-login" onclick="abrirModal('login')">Iniciar sesión</button>
            <button type="button" class="btn-register" onclick="abrirModal('registro')">Registrarme</button>
        `;
    }
}

/* ==========================================================================
   MODAL DINÁMICO & AUTENTICACIÓN
   ========================================================================== */

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
                <button type="submit" class="btn-whatsapp" style="margin-top:1rem;">Entrar</button>
            </form>
            <div class="modal-footer" style="text-align:center; margin-top:1.2rem;">
                <p style="font-size:0.8rem; color:var(--text-muted);">
                    ¿No tenés cuenta? <a href="#" onclick="abrirModal('registro')" style="color:var(--accent-orange); font-weight:600;">Registrate acá</a>
                </p>
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
                    <input type="password" id="auth-password" placeholder="Contraseña (mín. 8 caract., 1 mayúscula, 1 número)" required>
                </div>
                <div class="form-group">
                    <input type="password" id="auth-confirm-password" placeholder="Repetir contraseña" required>
                </div>
                <div class="form-group">
                    <select id="auth-rol" required>
                        <option value="postulante">Soy Postulante</option>
                        <option value="empleador">Soy Empleador</option>
                    </select>
                </div>
                <button type="submit" class="btn-whatsapp" style="margin-top:1rem;">REGISTRARME</button>
            </form>
            <div class="modal-footer" style="text-align:center; margin-top:1.2rem;">
                <p style="font-size:0.8rem; color:var(--text-muted);">
                    ¿Ya tenés cuenta? <a href="#" onclick="abrirModal('login')" style="color:var(--accent-orange); font-weight:600;">Iniciá sesión</a>
                </p>
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
                <button type="submit" class="btn-whatsapp" style="margin-top:1rem;">Enviar Postulación</button>
            </form>
        `;
    }

    body.innerHTML = contenidoHTML;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');

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
    const password = document.getElementById('auth-password')?.value;
    const nombre = document.getElementById('auth-nombre')?.value || email.split('@')[0];
    const rol = document.getElementById('auth-rol')?.value || 'postulante';

    if (accion === 'registro') {
        const confirmPassword = document.getElementById('auth-confirm-password')?.value;
        const errorValidacion = validarSeguridadPassword(password, confirmPassword);

        if (errorValidacion) {
            mostrarToast(errorValidacion, 'warning');
            return;
        }
    }

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

/* ==========================================================================
   RENDERIZADO DE VACANTES & FILTROS
   ========================================================================== */

function renderizarTarjetasVacantes(ofertas) {
    const container = document.getElementById('vacantes-container');
    if (!container) return;

    if (!ofertas || ofertas.length === 0) {
        container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; padding:1rem 0;">No se encontraron vacantes con esa búsqueda.</p>';
        return;
    }

    container.innerHTML = ofertas.map(o => `
        <div class="vacante-card" onclick="abrirModal('postular', ${o.id})">
            <div class="vacante-header">
                <div>
                    <h3 class="vacante-title">${escapeHTML(o.titulo)}</h3>
                    <p class="vacante-company">${escapeHTML(o.empresa)} • <span class="location">${escapeHTML(o.ubicacion)}</span></p>
                </div>
            </div>
            
            <div class="badges-container">
                ${o.urgente ? '<span class="badge badge-urgente">⚡ URGENTE</span>' : ''}
                <span class="badge">${escapeHTML(o.tipo_jornada)}</span>
                <span class="badge">${escapeHTML(o.turno)}</span>
            </div>

            <div class="vacante-footer">
                <span>${escapeHTML(o.fecha || 'Reciente')}</span>
                <span class="link-more">Postularme &rarr;</span>
            </div>
        </div>
    `).join('');
}

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

/* ==========================================================================
   NOTIFICACIONES TOAST (Manejo dinámico)
   ========================================================================== */

function mostrarToast(mensaje, tipo = 'info') {
    let container = document.getElementById('toast-container');
    
    // Si no existe el contenedor de toasts en el DOM, lo crea dinámicamente
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    
    // Color según tipo
    let bg = '#181b20';
    let border = 'var(--border-color)';
    if (tipo === 'success') { bg = '#064e3b'; border = '#10b981'; }
    if (tipo === 'warning') { bg = '#78350f'; border = '#f59e0b'; }
    if (tipo === 'info') { bg = '#1e3a8a'; border = '#3b82f6'; }

    toast.style.cssText = `
        background: ${bg};
        border: 1px solid ${border};
        color: #ffffff;
        padding: 0.75rem 1.2rem;
        border-radius: 8px;
        font-size: 0.85rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        transition: opacity 0.3s ease, transform 0.3s ease;
        opacity: 1;
    `;
    
    toast.innerHTML = `<span>${escapeHTML(mensaje)}</span>`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
