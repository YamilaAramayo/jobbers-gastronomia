// Datos locales de prueba
let vacantesGlobales = [
    { id: 1, titulo: "Bartender Principal", empresa: "Casa Norte", ubicacion: "Nueva Córdoba", tipo_jornada: "Full Time", turno: "Turno Noche", urgente: 1 },
    { id: 2, titulo: "Mozo / Moza de Salón", empresa: "Café Central", ubicacion: "Güemes", tipo_jornada: "Part Time", turno: "Turno Tarde", urgente: 0 },
    { id: 3, titulo: "Cocinero/a Minutero", empresa: "El Rincón Gastronómico", ubicacion: "Centro", tipo_jornada: "Full Time", turno: "Turno Rotativo", urgente: 1 },
    { id: 4, titulo: "Bachero / Auxiliar de Limpieza", empresa: "Bar Resto", ubicacion: "Alta Córdoba", tipo_jornada: "Full Time", turno: "Turno Noche", urgente: 0 }
];

document.addEventListener('DOMContentLoaded', () => {
    actualizarBarraNavegacion();
    renderizarTarjetasVacantes(vacantesGlobales);

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

    window.onclick = (e) => {
        const modal = document.getElementById('modal');
        if (e.target === modal) cerrarModal();
    };
});

function actualizarBarraNavegacion() {
    const navActions = document.getElementById('nav-actions');
    const usuarioSesion = JSON.parse(localStorage.getItem('jobbers_user'));

    if (usuarioSesion) {
        navActions.innerHTML = `
            <span class="user-welcome">Hola, <strong>${usuarioSesion.nombre}</strong> (${usuarioSesion.rol})</span>
            <button class="btn-secundary" onclick="cerrarSesion()">Cerrar Sesión</button>
        `;
    } else {
        navActions.innerHTML = `
            <button class="btn-secundary" onclick="abrirModal('login')">Iniciar Sesión</button>
            <button class="btn-primary" onclick="abrirModal('registro')">Registrarme</button>
        `;
    }
}

function abrirModal(tipo, ofertaId = null) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');

    if (tipo === 'login') {
        body.innerHTML = `
            <div class="modal-header">
                <h3>Iniciar Sesión</h3>
                <p>Ingresá tus credenciales para acceder al portal</p>
            </div>
            <form id="form-auth" onsubmit="procesarAutenticacion(event, 'login')">
                <div class="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" id="auth-email" placeholder="ejemplo@mail.com" required>
                </div>
                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" id="auth-password" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn-primary full-width">Entrar</button>
            </form>
            <div class="modal-footer">
                <p>¿No tenés cuenta? <a href="#" onclick="abrirModal('registro')">Registrate acá</a></p>
            </div>
        `;
    } else if (tipo === 'registro') {
        body.innerHTML = `
            <div class="modal-header">
                <h3>Crear una Cuenta</h3>
                <p>Seleccioná tu rol y formate parte de Jobbers</p>
            </div>
            <form id="form-auth" onsubmit="procesarAutenticacion(event, 'registro')">
                <div class="form-group">
                    <label>Nombre Completo / Razón Social</label>
                    <input type="text" id="auth-nombre" placeholder="Ej: Juan Pérez / Café Güemes" required>
                </div>
                <div class="form-group">
                    <label>Correo Electrónico</label>
                    <input type="email" id="auth-email" placeholder="ejemplo@mail.com" required>
                </div>
                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" id="auth-password" placeholder="••••••••" required>
                </div>
                <div class="form-group">
                    <label>Tipo de Usuario (Rol)</label>
                    <select id="auth-rol" required>
                        <option value="postulante">Soy Postulante (Busco Trabajo)</option>
                        <option value="empleador">Soy Empleador (Busco Personal)</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary full-width">Registrarme</button>
            </form>
            <div class="modal-footer">
                <p>¿Ya tenés cuenta? <a href="#" onclick="abrirModal('login')">Iniciá sesión</a></p>
            </div>
        `;
    } else if (tipo === 'postular') {
        body.innerHTML = `
            <div class="modal-header">
                <h3>Postulación para Vacante</h3>
                <p>Completá los datos clave para evaluar tu perfil calificado</p>
            </div>
            <form id="form-postular" onsubmit="procesarPostulacion(event, ${ofertaId})">
                <div class="form-group">
                    <label>Años de Experiencia en Gastronomía</label>
                    <input type="number" id="post-experiencia" min="0" placeholder="Ej: 2" required>
                </div>
                <div class="form-group checkbox-group">
                    <input type="checkbox" id="post-movilidad">
                    <label for="post-movilidad">Cuento con movilidad propia (Auto/Moto)</label>
                </div>
                <div class="form-group">
                    <label>Disponibilidad Horaria</label>
                    <select id="post-disponibilidad" required>
                        <option value="full_time">Full Time</option>
                        <option value="turnos_rotativos">Turnos Rotativos / Cortado</option>
                        <option value="part_time">Part Time</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary full-width">Enviar Postulación</button>
            </form>
        `;
    }

    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden', 'false');
}

function cerrarModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden', 'true');
}

function procesarAutenticacion(e, accion) {
    e.preventDefault();
    const email = document.getElementById('auth-email').value;
    const nombre = document.getElementById('auth-nombre')?.value || email.split('@')[0];
    const rol = document.getElementById('auth-rol')?.value || 'postulante';

    // Guardado local simulado
    localStorage.setItem('jobbers_user', JSON.stringify({ nombre, email, rol }));
    
    mostrarToast(accion === 'registro' ? '¡Cuenta creada con éxito!' : '¡Bienvenido/a de nuevo!', 'success');
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

function renderizarTarjetasVacantes(ofertas) {
    const container = document.getElementById('vacantes-container');
    if (!ofertas || ofertas.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted);">No hay búsquedas activas con ese criterio.</p>';
        return;
    }

    container.innerHTML = ofertas.map(o => `
        <div class="vacante-card">
            ${o.urgente ? '<span class="badge-urgente">⚡ Urgente</span>' : ''}
            <h4>${o.titulo}</h4>
            <p class="empresa-info"><strong>${o.empresa}</strong> — 📍 ${o.ubicacion}</p>
            <div class="tags-container">
                <span class="tag">${o.tipo_jornada}</span>
                <span class="tag">${o.turno}</span>
            </div>
            <button class="btn-primary full-width" onclick="abrirModal('postular', ${o.id})">Postularme</button>
        </div>
    `).join('');
}

function filtrarVacantes() {
    const query = document.getElementById('search-filter').value.toLowerCase();
    const filtradas = vacantesGlobales.filter(v => 
        v.titulo.toLowerCase().includes(query) || 
        v.empresa.toLowerCase().includes(query) ||
        v.ubicacion.toLowerCase().includes(query)
    );
    renderizarTarjetasVacantes(filtradas);
}

function mostrarToast(mensaje, tipo = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${tipo}`;
    toast.innerText = mensaje;
    
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Datos simulados de ofertas
const ofertasData = [
    { id: 1, empresa: "Casa Norte", puesto: "Cocinero/a", ubicacion: "Nueva Córdoba", jornada: "Tiempo completo", tiempo: "Hace 1h", urgente: true },
    { id: 2, empresa: "Café Central", puesto: "Barista", ubicacion: "Güemes", jornada: "Part-time", tiempo: "Hace 2h", urgente: false },
    { id: 3, empresa: "Barra Sur", puesto: "Bartender", ubicacion: "Centro", jornada: "Turno noche", tiempo: "Hace 3h", urgente: false }
];

document.addEventListener('DOMContentLoaded', () => {
    renderizarOfertas();

    const expressForm = document.getElementById('express-form');
    if (expressForm) {
        expressForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const puesto = document.getElementById('puesto').value;
            const zona = document.getElementById('zona').value;
            const turno = document.getElementById('turno').value;
            
            const mensaje = encodeURIComponent(`Hola Jobbers! Necesito un/a *${puesto}* para la zona de *${zona}* en *${turno}*. ¿Tienen candidatos disponibles?`);
            window.open(`https://wa.me/5493510000000?text=${mensaje}`, '_blank');
        });
    }
});

function renderizarOfertas() {
    const container = document.getElementById('vacantes-container');
    if (!container) return;

    container.innerHTML = ofertasData.map(o => `
        <div class="oferta-card">
            <div class="oferta-info">
                <h4>${o.puesto}</h4>
                <p><strong>${o.empresa}</strong> • 📍 ${o.ubicacion}</p>
                <div class="badges-container">
                    ${o.urgente ? '<span class="badge-urgente">URGENTE ⚡</span>' : ''}
                    <span class="badge-tag">${o.jornada}</span>
                </div>
            </div>
            <div style="text-align: right;">
                <span style="font-size: 0.75rem; color: var(--text-muted);">${o.tiempo}</span>
                <br>
                <i class="fa-solid fa-chevron-right" style="color: var(--accent-orange); margin-top: 10px; cursor: pointer;"></i>
            </div>
        </div>
    `).join('');
}
