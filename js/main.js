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
            
            const mensaje = encodeURIComponent(`Hola Jobbers! Necesito un/a *${puesto}* para la zona de *${zona}* en *${turno}*. ¿Me podrían ayudar a conseguir postulantes?`);
            window.open(`https://wa.me/5493510000000?text=${mensaje}`, '_blank');
        });
    }

    // Scroll suave para links de navegación
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

    // Cerrar modal o dropdowns al hacer clic afuera
    window.onclick = (e) => {
        const modal = document.getElementById('modal');
        if (e.target === modal) cerrarModal();

        const dropdownMenu = document.getElementById('recursos-menu');
        if (dropdownMenu && !e.target.closest('.dropdown')) {
            dropdownMenu.classList.remove('show');
        }
    };
});

// Desplegable de Recursos
function toggleDropdown(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropdownMenu = document.getElementById('recursos-menu');
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('show');
    }
}

function cerrarDropdown() {
    const dropdownMenu = document.getElementById('recursos-menu');
    if (dropdownMenu) dropdownMenu.classList.remove('show');
}

// Renderizado de la barra de usuario / login
function actualizarBarraNavegacion() {
    const navActions = document.getElementById('nav-actions');
    if (!navActions) return;
    
    const usuarioSesion = JSON.parse(localStorage.getItem('jobbers_user'));

    if (usuarioSesion) {
        navActions.innerHTML = `
            <span class="user-welcome" style="margin-right: 8px; font-size: 0.85rem; color: var(--text-white);">Hola, <strong>${usuarioSesion.nombre}</strong></span>
            <button class="btn-login" onclick="cerrarSesion()">Cerrar Sesión</button>
        `;
    } else {
        navActions.innerHTML = `
            <button class="btn-login" onclick="abrirModal('login')">Iniciar sesión</button>
            <button class="btn-register" onclick="abrirModal('registro')">Registrarme</button>
        `;
    }
}

// Modal Dinámico (Sincronizado con CSS modal.show)
function abrirModal(tipo, ofertaId = null) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    if (!modal || !body) return;

    let contenidoHTML = `<span class="close-btn" onclick="cerrarModal()">&times;</span>`;

    if (tipo === 'login') {
        contenidoHTML += `
            <div class="modal-header">
                <h3>Iniciar Sesión</h3>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 1rem;">Ingresá tus credenciales para acceder</p>
            </div>
            <form id="form-auth" class="express-form" onsubmit="procesarAutenticacion(event, 'login')">
                <div class="form-group">
                    <input type="email" id="auth-email" placeholder="Correo electrónico" required>
                </div>
                <div class="form-group">
                    <input type="password" id="auth-password" placeholder="Contraseña" required>
                </div>
                <button type="submit" class="btn-whatsapp" style="width:100%; margin-top:0.5rem;">Entrar</button>
            </form>
            <div class="modal-footer" style="margin-top: 1rem; text-align: center;">
                <p style="font-size:0.8rem; color: var(--text-muted);">¿No tenés cuenta? <a href="#" onclick="abrirModal('registro')" style="color:var(--accent-orange);">Registrate acá</a></p>
            </div>
        `;
    } else if (tipo === 'registro') {
        contenidoHTML += `
            <div class="modal-header">
                <h3>Crear una Cuenta</h3>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 1rem;">Sumate a la red de Jobbers</p>
            </div>
            <form id="form-auth" class="express-form" onsubmit="procesarAutenticacion(event, 'registro')">
                <div class="form-group">
                    <input type="text" id="auth-nombre" placeholder="Nombre completo o Empresa" required>
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
                <button type="submit" class="btn-whatsapp" style="width:100%; margin-top:0.5rem;">Registrarme</button>
            </form>
            <div class="modal-footer" style="margin-top: 1rem; text-align: center;">
                <p style="font-size:0.8rem; color: var(--text-muted);">¿Ya tenés cuenta? <a href="#" onclick="abrirModal('login')" style="color:var(--accent-orange);">Iniciá sesión</a></p>
            </div>
        `;
    } else if (tipo === 'postular') {
        const oferta = vacantesGlobales.find(v => v.id === ofertaId);
        const titulo = oferta ? oferta.titulo : 'la vacante';

        contenidoHTML += `
            <div class="modal-header">
                <h3>Postulación para ${titulo}</h3>
                <p style="font-size:0.85rem; color:var(--text-muted); margin-bottom: 1rem;">Completá tus datos de contacto</p>
            </div>
            <form id="form-postular" class="express-form" onsubmit="procesarPostulacion(event, ${ofertaId})">
                <div class="form-group">
                    <input type="number" id="post-experiencia" min="0" placeholder="Años de experiencia" required>
                </div>
                <div class="form-group">
                    <select id="post-disponibilidad" required>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="rotativo">Turnos Rotativos</option>
                    </select>
                </div>
                <button type="submit" class="btn-whatsapp" style="width:100%; margin-top:0.5rem;">Enviar Postulación</button>
            </form>
        `;
    }

    body.innerHTML = contenidoHTML;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
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

// Renderizado de tarjetas integrado con estilos
function renderizarTarjetasVacantes(ofertas) {
    const container = document.getElementById('vacantes-container');
    if (!container) return;

    if (!ofertas || ofertas.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem; padding: 1rem 0;">No se encontraron vacantes con esa búsqueda.</p>';
        return;
    }

    container.innerHTML = ofertas.map(o => `
        <div class="oferta-card" onclick="abrirModal('postular', ${o.id})" style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 8px; padding: 1rem; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: border-color 0.2s;">
            <div class="oferta-info">
                <h4 style="font-size: 1rem; color: var(--text-white); font-weight: 700;">${o.titulo}</h4>
                <p style="font-size:0.85rem; color:var(--text-muted); margin: 0.2rem 0 0.5rem 0;">
                    <strong>${o.empresa}</strong> • 📍 ${o.ubicacion}
                </p>
                <div class="badges-container" style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
                    ${o.urgente ? '<span style="background: rgba(239, 68, 68, 0.15); color: var(--red-badge); font-size: 0.7rem; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid rgba(239, 68, 68, 0.3);">Urgente ⚡</span>' : ''}
                    <span style="background: #1a202c; color: var(--text-muted); font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-color);">${o.tipo_jornada}</span>
                    <span style="background: #1a202c; color: var(--text-muted); font-size: 0.7rem; padding: 0.2rem 0.5rem; border-radius: 4px; border: 1px solid var(--border-color);">${o.turno}</span>
                </div>
            </div>
            <div style="text-align: right;">
                <span style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-bottom: 0.5rem;">${o.fecha || 'Reciente'}</span>
                <span style="color: var(--accent-orange); font-weight: bold; font-size: 1.1rem;">&#8250;</span>
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
    toast.innerHTML = `<span>${mensaje}</span>`;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
