/* ==========================================================================
   JOBBERS - SISTEMA INTEGRAL DE INTERACCIÓN, OFERTAS Y MODALES
   ========================================================================== */

// HELPER: Sanitización rápida contra XSS
const escapeHTML = (str) => {
    return String(str).replace(/[&<>"']/g, (match) => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[match];
    });
};

// 1. BANCO DE DATOS DE OFERTAS DE EJEMPLO
const vacantesGastronomia = [
    {
        id: 1,
        puesto: "Cocinero / Cocinera de Despacho",
        empresa: "La Caprichosa Resto",
        zona: "Nueva Córdoba",
        jornada: "Full Time",
        turno: "Turno Noche",
        salario: "$450.000 / mes",
        urgente: true,
        categoria: "Cocina",
        tiempo: "Hace 1 hora"
    },
    {
        id: 2,
        puesto: "Mozo / Salonero de Salón",
        empresa: "Bar de Fuegos",
        zona: "Güemes",
        jornada: "Part Time",
        turno: "Turno Noche",
        salario: "$280.000 + Propinas",
        urgente: false,
        categoria: "Mozo",
        tiempo: "Hace 3 horas"
    },
    {
        id: 3,
        puesto: "Barista Especializado",
        empresa: "Café Suburbio",
        zona: "General Paz",
        jornada: "Full Time",
        turno: "Turno Mañana",
        salario: "$390.000 / mes",
        urgente: false,
        categoria: "Barista",
        tiempo: "Hace 5 horas"
    },
    {
        id: 4,
        puesto: "Bartender Coctelería de Autor",
        empresa: "SpeakEasy Club",
        zona: "Güemes",
        jornada: "Fines de semana",
        turno: "Turno Noche",
        salario: "$320.000 + Propinas",
        urgente: true,
        categoria: "Bartender",
        tiempo: "Hace 12 horas"
    },
    {
        id: 5,
        puesto: "Cajero / Facturación POSNET",
        empresa: "Pizzería Don Luiggi",
        zona: "Centro",
        jornada: "Full Time",
        turno: "Turno Tarde",
        salario: "$360.000 / mes",
        urgente: false,
        categoria: "Cajero",
        tiempo: "Hace 1 día"
    },
    {
        id: 6,
        puesto: "Delivery / Repartidor con Moto",
        empresa: "Sushi & Roll",
        zona: "Nueva Córdoba",
        jornada: "Part Time",
        turno: "Turno Noche",
        salario: "$250.000 + Envíos",
        urgente: true,
        categoria: "Delivery",
        tiempo: "Hace 1 día"
    }
];

// 2. CARGA E INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    asegurarEstructuraModal();
    actualizarBarraUsuario();
    renderizarOfertas(vacantesGastronomia);

    // Conectar el Formulario Express de WhatsApp (Búsqueda de Personal)
    const formExpress = document.getElementById('express-form');
    if (formExpress) {
        formExpress.addEventListener('submit', (e) => {
            e.preventDefault();
            const puesto = document.getElementById('puesto')?.value || "Personal Gastronómico";
            const zona = document.getElementById('zona')?.value || "Córdoba";
            const turno = document.getElementById('turno')?.value || "A convenir";

            const telefono = "5493510000000"; // Reemplazar por número de recepción real
            const texto = `¡Hola Jobbers! 👋 Necesito contratar personal urgente:\n\n` +
                          `📌 *Puesto:* ${puesto}\n` +
                          `📍 *Zona:* ${zona}\n` +
                          `⏰ *Turno:* ${turno}\n\n` +
                          `Aguardando respuesta.`;
            
            mostrarToast("Redirigiendo a WhatsApp...", "success");
            window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`, '_blank');
            formExpress.reset();
        });
    }

    // Tecla Escape para cerrar modales y dropdowns
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModal();
            document.getElementById('recursos-menu')?.classList.remove('show');
        }
    });
});

// 3. DELEGACIÓN GLOBAL DE CLICS
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        document.getElementById('recursos-menu')?.classList.remove('show');
    }
});

// 4. RENDERIZADO DE OFERTAS
function renderizarOfertas(lista) {
    const contenedor = document.getElementById('vacantes-container');
    if (!contenedor) return;

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
                <i class="fa-solid fa-folder-open" style="font-size:2rem; margin-bottom:10px;"></i>
                <p>No se encontraron búsquedas activas para este criterio.</p>
                <button onclick="filtrarPorCategoria('')" style="margin-top:12px; background:var(--primary); color:var(--text-dark); border:none; padding:8px 16px; border-radius:var(--radius-sm); font-weight:bold; cursor:pointer;">
                    Mostrar todas las ofertas
                </button>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = lista.map(item => `
        <article style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:1.2rem; margin-bottom:1rem; transition:var(--transition);" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                <div>
                    <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin-bottom:4px;">${escapeHTML(item.puesto)}</h3>
                    <p style="font-size:0.85rem; color:var(--primary); font-weight:700; margin:0;">${escapeHTML(item.empresa)}</p>
                </div>
                ${item.urgente ? '<span style="background:#EF4444; color:#fff; font-size:0.65rem; font-weight:bold; padding:3px 8px; border-radius:12px;">⚡ URGENTE</span>' : ''}
            </div>

            <div style="display:flex; gap:12px; flex-wrap:wrap; margin:12px 0; font-size:0.75rem; color:var(--text-muted);">
                <span><i class="fa-solid fa-location-dot" style="color:var(--primary);"></i> ${escapeHTML(item.zona)}</span>
                <span><i class="fa-solid fa-briefcase"></i> ${escapeHTML(item.jornada)}</span>
                <span><i class="fa-regular fa-clock"></i> ${escapeHTML(item.turno)}</span>
                <span style="color:#2ECC71; font-weight:bold;">${escapeHTML(item.salario)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:10px; margin-top:8px;">
                <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHTML(item.tiempo)}</span>
                <button type="button" onclick="abrirModalPostulacion('${escapeHTML(item.puesto)}', '${escapeHTML(item.empresa)}')" style="background:var(--primary); color:var(--text-dark); border:none; padding:6px 14px; border-radius:var(--radius-sm); font-weight:800; font-size:0.8rem; cursor:pointer; transition:var(--transition);">
                    Postularme
                </button>
            </div>
        </article>
    `).join('');
}

// 5. BUSCADOR Y FILTROS EN TIEMPO REAL
function filtrarVacantes() {
    const input = document.getElementById('search-filter');
    if (!input) return;
    const termino = input.value.toLowerCase().trim();

    const resultado = vacantesGastronomia.filter(v =>
        v.puesto.toLowerCase().includes(termino) ||
        v.empresa.toLowerCase().includes(termino) ||
        v.zona.toLowerCase().includes(termino) ||
        v.categoria.toLowerCase().includes(termino)
    );

    renderizarOfertas(resultado);
}

function filtrarPorCategoria(categoria) {
    const input = document.getElementById('search-filter');
    if (input) input.value = categoria;

    if (!categoria) {
        renderizarOfertas(vacantesGastronomia);
        return;
    }

    const resultado = vacantesGastronomia.filter(v => 
        v.categoria.toLowerCase().includes(categoria.toLowerCase()) ||
        v.puesto.toLowerCase().includes(categoria.toLowerCase())
    );

    renderizarOfertas(resultado);
    document.getElementById('vacantes-container')?.scrollIntoView({ behavior: 'smooth' });
}

// 6. SISTEMA MÓDULO DE MODALES Y ACCIONES GLOBALIZADAS
function asegurarEstructuraModal() {
    let modal = document.getElementById('modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'jobbers-modal';
        modal.innerHTML = `
            <div class="jobbers-modal-card">
                <button type="button" class="jobbers-close-btn" onclick="cerrarModal()">&times;</button>
                <div id="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });
}

function abrirModal(tipo) {
    if (tipo === 'login' || !tipo) {
        abrirModalLogin();
    }
}

function abrirModalLogin() {
    asegurarEstructuraModal();
    const body = document.getElementById('modal-body');
    if (!body) return;

    body.innerHTML = `
        <div style="text-align:center; margin-bottom: 1.2rem;">
            <h2 style="font-size:1.3rem; font-weight:900; color:var(--text-main); margin-bottom:4px;">¡Hola! Ingresá a Jobbers</h2>
            <p style="color:var(--text-muted); font-size:0.8rem; margin:0;">Iniciá sesión para postularte a empleos</p>
        </div>

        <form onsubmit="completarLogin(event)" class="express-form">
            <div class="form-group" style="margin-bottom:0.8rem;">
                <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Email</label>
                <input type="email" id="login-email" placeholder="tu@correo.com" required style="width:100%; padding:10px; background:var(--bg-dark); border:1px solid var(--border-color); border-radius:var(--radius-sm); color:var(--text-main); font-size:0.85rem; box-sizing:border-box;">
            </div>
            <div class="form-group" style="margin-bottom:1.2rem;">
                <label style="font-size:0.75rem; color:var(--text-muted); display:block; margin-bottom:4px;">Contraseña</label>
                <input type="password" required placeholder="••••••••" style="width:100%; padding:10px; background:var(--bg-dark); border:1px solid var(--border-color); border-radius:var(--radius-sm); color:var(--text-main); font-size:0.85rem; box-sizing:border-box;">
            </div>
            <button type="submit" class="btn-whatsapp" style="width:100%; font-weight:bold; cursor:pointer;">
                INGRESAR
            </button>
        </form>
    `;

    const modal = document.getElementById('modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function abrirModalPostulacion(puesto, empresa) {
    asegurarEstructuraModal();
    const body = document.getElementById('modal-body');
    if (!body) return;

    body.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <h2 style="font-size:1.2rem; font-weight:900; color:var(--text-main); margin-bottom:2px;">POSTULARME</h2>
            <p style="color:var(--primary); font-size:0.85rem; font-weight:700; margin:0;">${puesto} — ${empresa}</p>
        </div>

        <form onsubmit="procesarPostulacion(event, '${puesto}')" class="express-form">
            <div class="form-group" style="margin-bottom:0.8rem;">
                <input type="text" placeholder="Nombre y Apellido" required style="width:100%; padding:10px; background:var(--bg-dark); border:1px solid var(--border-color); border-radius:var(--radius-sm); color:var(--text-main); font-size:0.85rem; box-sizing:border-box;">
            </div>
            <div class="form-group" style="margin-bottom:0.8rem;">
                <input type="tel" placeholder="WhatsApp de contacto" required style="width:100%; padding:10px; background:var(--bg-dark); border:1px solid var(--border-color); border-radius:var(--radius-sm); color:var(--text-main); font-size:0.85rem; box-sizing:border-box;">
            </div>
            <div class="form-group" style="margin-bottom:1.2rem;">
                <input type="url" placeholder="Link a tu CV / LinkedIn / Drive" required style="width:100%; padding:10px; background:var(--bg-dark); border:1px solid var(--border-color); border-radius:var(--radius-sm); color:var(--text-main); font-size:0.85rem; box-sizing:border-box;">
            </div>
            <button type="submit" class="btn-whatsapp" style="width:100%; font-weight:bold; cursor:pointer;">
                ENVIAR POSTULACIÓN
            </button>
        </form>
    `;

    const modal = document.getElementById('modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function completarLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email')?.value || "Usuario";
    const nombre = email.split('@')[0];

    localStorage.setItem('jobbers_usuario', JSON.stringify({ nombre }));
    actualizarBarraUsuario();
    cerrarModal();
    mostrarToast(`¡Sesión iniciada como ${escapeHTML(nombre)}!`, "success");
}

function procesarPostulacion(e, puesto) {
    e.preventDefault();
    cerrarModal();
    mostrarToast(`¡Postulación enviada con éxito para ${puesto}!`, "success");
}

function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function cerrarSesion() {
    localStorage.removeItem('jobbers_usuario');
    actualizarBarraUsuario();
    mostrarToast("Sesión cerrada correctamente", "error");
}

function actualizarBarraUsuario() {
    const contenedorAcciones = document.getElementById('nav-actions');
    if (!contenedorAcciones) return;

    const sesion = JSON.parse(localStorage.getItem('jobbers_usuario') || 'null');

    if (sesion && sesion.nombre) {
        contenedorAcciones.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span style="font-size:0.8rem; color:var(--text-muted);">Hola, <strong style="color:var(--text-main);">${escapeHTML(sesion.nombre)}</strong></span>
                <button type="button" class="btn-login" onclick="cerrarSesion()" style="padding:4px 10px; font-size:0.75rem;">Salir</button>
            </div>
        `;
    } else {
        contenedorAcciones.innerHTML = `
            <button type="button" class="btn-login" onclick="abrirModal('login')">Ingresar</button>
        `;
    }
}

function toggleDropdown(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('recursos-menu');
    if (menu) menu.classList.toggle('show');
}

function cerrarDropdown() {
    document.getElementById('recursos-menu')?.classList.remove('show');
}

// 7. NOTIFICACIONES TOAST
function mostrarToast(mensaje, tipo = "success") {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `jobbers-toast ${tipo}`;
    toast.innerHTML = `
        <i class="${tipo === 'success' ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation'}"></i>
        <span>${escapeHTML(mensaje)}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 8. BINDING GLOBAL WINDOW
window.abrirModal = abrirModal;
window.abrirModalLogin = abrirModalLogin;
window.abrirModalPostulacion = abrirModalPostulacion;
window.cerrarModal = cerrarModal;
window.completarLogin = completarLogin;
window.procesarPostulacion = procesarPostulacion;
window.cerrarSesion = cerrarSesion;
window.filtrarVacantes = filtrarVacantes;
window.filtrarPorCategoria = filtrarPorCategoria;
window.toggleDropdown = toggleDropdown;
window.cerrarDropdown = cerrarDropdown;
