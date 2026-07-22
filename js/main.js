
// Datos locales de prueba (Vacantes activas)
let vacantesGlobales = [
    { id: 1, titulo: "Bartender Principal", empresa: "Casa Norte", ubicacion: "Nueva Córdoba", tipo_jornada: "Full Time", turno: "Turno Noche", urgente: 1 },
    { id: 2, titulo: "Mozo / Moza de Salón", empresa: "Café Central", ubicacion: "Güemes", tipo_jornada: "Part Time", turno: "Turno Tarde", urgente: 0 },
    { id: 3, titulo: "Cocinero/a Minutero", empresa: "El Rincón Gastronómico", ubicacion: "Centro", tipo_jornada: "Full Time", turno: "Turno Rotativo", urgente: 1 },
    { id: 4, titulo: "Bachero / Auxiliar de Limpieza", empresa: "Bar Resto", ubicacion: "Alta Córdoba", tipo_jornada: "Full Time", turno: "Turno Noche", urgente: 0 }
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
    document.querySelectorAll('.nav-link').forEach(link => {
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

                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
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
            <span class="user-welcome" style="margin-right: 5px; font-size: 0.85rem;">Hola, <strong>${usuarioSesion.nombre}</strong></span>
            <button class="btn-login" onclick="cerrarSesion()">Cerrar Sesión</button>
        `;
    } else {
        navActions.innerHTML = `
            <button class="btn-login" onclick="abrirModal('login')">Iniciar Sesión</button>
            <button class="btn-register" onclick="abrirModal('registro')">Registrarme</button>
        `;
    }
}

// Modal Dinámico
function abrirModal(tipo, ofertaId = null) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');

    if (tipo === 'login') {
        body.innerHTML = `
            <div class="modal-header">
                <h3>Iniciar Sesión</h3>
                <p style="font-size:0.85rem; color:var(--text-muted);">Ingresá tus credenciales para acceder</p>
            </div>
            <form id="form-auth" onsubmit="procesarAutenticacion(event, 'login')">
                <div class="form-group" style="margin-top:1rem;">
                    <label>Correo Electrónico</label>
                    <input type="email" id="auth-email" placeholder="ejemplo@mail.com" required>
                </div>
                <div class="form-group" style="margin-top:1rem;">
                    <label>Contraseña</label>
                    <input type="password" id="auth-password" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn-express-submit" style="width:100%; margin-top:1.5rem;">Entrar</button>
            </form>
            <div class="modal-footer" style="margin-top: 1rem; text-align: center;">
                <p style="font-size:0.8rem; color: var(--text-muted);">¿No tenés cuenta? <a href="#" onclick="abrirModal('registro')" style="color:var(--accent-orange);">Registrate acá</a></p>
            </div>
        `;
    } else if (tipo === 'registro') {
        body.innerHTML = `
            <div class="modal-header">
                <h3>Crear una Cuenta</h3>
                <p style="font-size:0.85rem; color:var(--text-muted);">Sumate a la red de Jobbers</p>
            </div>
            <form id="form-auth" onsubmit="procesarAutenticacion(event, 'registro')">
                <div class="form-group" style="margin-top:1rem;">
                    <label>Nombre / Empresa</label>
                    <input type="text" id="auth-nombre" placeholder="Ej: Juan Pérez / Bar Centro" required>
                </div>
                <div class="form-group" style="margin-top:0.8rem;">
                    <label>Correo Electrónico</label>
                    <input type="email" id="auth-email" placeholder="ejemplo@mail.com" required>
                </div>
                <div class="form-group" style="margin-top:0.8rem;">
                    <label>Tipo de Usuario</label>
                    <select id="auth-rol" required>
                        <option value="postulante">Soy Postulante</option>
                        <option value="empleador">Soy Empleador</option>
                    </select>
                </div>
                <button type="submit" class="btn-express-submit" style="width:100%; margin-top:1.5rem;">Registrarme</button>
            </form>
            <div class="modal-footer" style="margin-top: 1rem; text-align: center;">
                <p style="font-size:0.8rem; color: var(--text-muted);">¿Ya tenés cuenta? <a href="#" onclick="abrirModal('login')" style="color:var(--accent-orange);">Iniciá sesión</a></p>
            </div>
        `;
    } else if (tipo === 'postular') {
        const oferta = vacantesGlobales.find(v => v.id === ofertaId);
        const titulo = oferta ? oferta.titulo : 'la vacante';

        body.innerHTML = `
            <div class="modal-header">
                <h3>Postulación para ${titulo}</h3>
                <p style="font-size:0.85rem; color:var(--text-muted);">Completá tus datos para el puesto</p>
            </div>
            <form id="form-postular" onsubmit="procesarPostulacion(event, ${ofertaId})">
                <div class="form-group" style="margin-top:1rem;">
                    <label>Años de Experiencia</label>
                    <input type="number" id="post-experiencia" min="0" placeholder="Ej: 2" required>
                </div>
                <div class="form-group" style="margin-top:1rem;">
                    <label>Disponibilidad</label>
                    <select id="post-disponibilidad" required>
                        <option value="full_time">Full Time</option>
                        <option value="part_time">Part Time</option>
                        <option value="rotativo">Turnos Rotativos</option>
                    </select>
                </div>
                <button type="submit" class="btn-express-submit" style="width:100%; margin-top:1.5rem;">Enviar Postulación</button>
            </form>
        `;
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
}

function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = 'none';
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

// Renderizado de tarjetas
function renderizarTarjetasVacantes(ofertas) {
    const container = document.getElementById('vacantes-container');
    if (!container) return;

    if (!ofertas || ofertas.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">No hay búsquedas activas con ese criterio.</p>';
        return;
    }

    container.innerHTML = ofertas.map(o => `
        <div class="oferta-card">
            <div class="oferta-info">
                <h4>${o.titulo}</h4>
                <p style="font-size:0.9rem;"><strong>${o.empresa}</strong> • 📍 ${o.ubicacion}</p>
                <div class="badges-container">
                    ${o.urgente ? '<span class="badge-urgente">URGENTE ⚡</span>' : ''}
                    <span class="badge-tag">${o.tipo_jornada}</span>
                    <span class="badge-tag">${o.turno}</span>
                </div>
            </div>
            <div>
                <button class="btn-register" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="abrirModal('postular', ${o.id})">
                    Postularme
                </button>
            </div>
        </div>
    `).join('');
}

// Filtro en tiempo real
function filtrarVacantes() {
    const input = document.getElementById('search-filter');
    if (!input) return;
    
    const query = input.value.toLowerCase();
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
    toast.className = `toast toast-${tipo}`;
    toast.innerText = mensaje;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
