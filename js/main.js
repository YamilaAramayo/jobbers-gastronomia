/* ==========================================================================
   JOBBERS ARGENTINA - LÓGICA INTERACTIVA, TALENTO Y CONEXIÓN WHATSAPP
   ========================================================================== */

const WHATSAPP_JOBBERS_DEFAULT = "5493513080197";

// Estado global
let vacantesGastronomia = [];
let talentoDestacado = [];
let elementoPrevioFoco = null;

// Helpers de sanitización y formateo
const escapeHTML = (str) => {
    if (str === null || str === undefined) return "";
    return String(str).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
};

const limpiarNumeroWA = (num) => String(num || "").replace(/\D/g, "");

const debounce = (fn, delay = 300) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
};

const getElBusqueda = () => document.getElementById('input-busqueda') || document.getElementById('job-search-input');

/* ==========================================================================
   1. EXPOSICIÓN GLOBAL Y NAVEGACIÓN
   ========================================================================== */
function abrirWhatsApp(numero, mensaje) {
    const urlWA = `https://wa.me/${limpiarNumeroWA(numero)}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWA, '_blank', 'noopener,noreferrer');
}

function toggleDropdown(event) {
    event?.stopPropagation();
    const btn = document.getElementById('dropdown-recursos');
    const menu = document.getElementById('menu-recursos');

    if (menu) {
        const isOpen = menu.classList.toggle('show');
        btn?.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
}

function cerrarDropdown() {
    const btn = document.getElementById('dropdown-recursos');
    const menu = document.getElementById('menu-recursos');

    if (menu?.classList.contains('show')) {
        menu.classList.remove('show');
        btn?.setAttribute('aria-expanded', 'false');
    }
}

function cerrarModal() {
    const modal = document.getElementById('modal-jobbers');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        elementoPrevioFoco?.focus();
        elementoPrevioFoco = null;
    }
}

function solicitarContactoTalento(nombre, puesto) {
    const mensaje = `¡Hola Jobbers! 👋 Quisiera solicitar el contacto/CV del perfil destacado: *${nombre}* (${puesto}).`;
    abrirWhatsApp(WHATSAPP_JOBBERS_DEFAULT, mensaje);
}

function unirseAComunidad() {
    const mensaje = `¡Hola Jobbers! 👋 Quisiera formar parte de la Comunidad Jobbers para destacar mi perfil profesional.`;
    abrirWhatsApp(WHATSAPP_JOBBERS_DEFAULT, mensaje);
}

/* ==========================================================================
   2. SISTEMA DE CAMBIO DE PERFIL (POSTULANTE / EMPRESA)
   ========================================================================== */
function asegurarEstructuraModalPerfil() {
    let modal = document.getElementById('modal-cambiar-perfil');
    if (modal) return modal;

    modal = document.createElement('div');
    modal.id = 'modal-cambiar-perfil';
    modal.className = 'modal-overlay jobbers-modal';
    
    // Estilos inline de resguardo para garantizar visibilidad total
    modal.style.cssText = `
        display: none;
        position: fixed;
        inset: 0;
        z-index: 99999;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(6px);
        align-items: center;
        justify-content: center;
        padding: 1rem;
    `;
    
    modal.innerHTML = `
        <div class="modal-card jobbers-modal-card" style="background: var(--card-bg, #141619); border: 1px solid var(--border-color, #26292E); width: 100%; max-width: 440px; border-radius: 24px; padding: 2rem; position: relative; color: #fff;">
            <button type="button" class="modal-close" onclick="cerrarModalPerfil()" aria-label="Cerrar modal" style="position:absolute; right:18px; top:18px; background:transparent; border:none; color:#fff; font-size:1.5rem; cursor:pointer;">&times;</button>
            
            <h2 class="modal-title" style="font-size:1.4rem; font-weight:800; margin-bottom: 8px; text-align:center;">SELECCIONÁ TU PERFIL</h2>
            <p class="modal-subtitle" style="color:var(--text-muted, #94a3b8); font-size:0.9rem; text-align:center; margin-bottom:1.5rem;">Elegí cómo querés navegar Jobbers Argentina</p>
            
            <div class="role-options" style="display:flex; flex-direction:column; gap:12px;">
                <div class="role-card" onclick="cambiarPerfil('postulante')" style="padding:14px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); background:#1e2227; color:#fff; cursor:pointer; display:flex; align-items:center; gap:12px;">
                    <span class="role-icon" style="font-size:1.5rem;">👤</span>
                    <div class="role-info">
                        <h3 style="font-size:1rem; margin:0; font-weight:bold;">Modo Postulante</h3>
                        <p style="font-size:0.75rem; color:#aaa; margin:0;">Buscar empleo y postularme por WhatsApp</p>
                    </div>
                </div>
                <div class="role-card" onclick="cambiarPerfil('empresa')" style="padding:14px; border-radius:16px; border:1px solid rgba(255,255,255,0.1); background:#1e2227; color:#fff; cursor:pointer; display:flex; align-items:center; gap:12px;">
                    <span class="role-icon" style="font-size:1.5rem;">🏢</span>
                    <div class="role-info">
                        <h3 style="font-size:1rem; margin:0; font-weight:bold;">Modo Empresa</h3>
                        <p style="font-size:0.75rem; color:#aaa; margin:0;">Publicar búsquedas y contactar talento</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModalPerfil();
    });

    return modal;
}

function abrirModalPerfil() {
    const modal = asegurarEstructuraModalPerfil();
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModalPerfil() {
    const modal = document.getElementById('modal-cambiar-perfil');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function cambiarPerfil(rol) {
    const esEmpresa = rol === 'empresa';
    const rolNombre = esEmpresa ? 'Empresa' : 'Postulante';

    ['jobbers_user_role', 'jobbers_role', 'jobbers_rol'].forEach(k => localStorage.setItem(k, rol));
    aplicarRol(rol);
    cerrarModalPerfil();
    mostrarToast(`Perfil activo: ${rolNombre.toUpperCase()}`, 'success');

    window.dispatchEvent(new CustomEvent('jobbers:perfilCambiado', { detail: { rol } }));
}

function aplicarRol(rol) {
    const labelModoActual = document.getElementById('label-modo-actual');
    const esEmpresa = rol === 'empresa';

    document.body.classList.toggle('role-empresa', esEmpresa);
    document.body.classList.toggle('role-postulante', !esEmpresa);

    if (labelModoActual) {
        labelModoActual.textContent = esEmpresa ? 'Modo Empresa' : 'Modo Postulante';
    }
}

function inicializarModoPerfil() {
    const rolGuardado = localStorage.getItem('jobbers_user_role') || localStorage.getItem('jobbers_role') || localStorage.getItem('jobbers_rol') || 'postulante';
    aplicarRol(rolGuardado);
}

/* ==========================================================================
   3. INICIALIZACIÓN Y EVENT LISTENERS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    asegurarEstructuraModal();
    asegurarEstructuraModalPerfil();
    cargarVacantesDesdeJSON();
    cargarTalentoDestacado();
    inicializarModoPerfil();
    inicializarEventListeners();
});

function inicializarEventListeners() {
    document.addEventListener('click', (e) => {
        // Selector ampliado para capturar el botón independientemente del ID o clase exacta
        const btnCambiarRol = e.target.closest('.btn-cambiar-rol, #btn-cambiar-perfil, .trigger-cambio-perfil, .btn-perfil, [onclick*="abrirModalPerfil"]');
        if (btnCambiarRol) {
            e.preventDefault();
            abrirModalPerfil();
            return;
        }

        const btnPostular = e.target.closest('.btn-postularme');
        if (btnPostular) {
            e.preventDefault();
            const { puesto, empresa, contacto } = btnPostular.dataset;
            abrirModalPostulacion(puesto, empresa, contacto);
            return;
        }

        const btnTalento = e.target.closest('.btn-contactar-perfil');
        if (btnTalento) {
            e.preventDefault();
            const { nombre, puesto } = btnTalento.dataset;
            solicitarContactoTalento(nombre, puesto);
            return;
        }

        const btnExpress = e.target.closest('.btn-trigger-express');
        if (btnExpress) {
            e.preventDefault();
            const cardExpress = document.getElementById('formulario-express');
            if (!cardExpress) return;

            const estaVisible = cardExpress.classList.toggle('is-visible');
            cardExpress.style.display = estaVisible ? 'block' : 'none';
            btnExpress.setAttribute('aria-expanded', estaVisible ? 'true' : 'false');

            if (estaVisible) {
                cardExpress.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => document.getElementById('nombre-empresa')?.focus(), 300);
            }
            return;
        }

        if (!e.target.closest('.dropdown')) {
            cerrarDropdown();
        }
    });

    document.getElementById('form-publicar-express')?.addEventListener('submit', enviarAWhatsApp);

    const inputBusqueda = getElBusqueda();
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', debounce(filtrarVacantes, 300));
        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                filtrarVacantes();
            }
        });
    }

    const btnSearch = document.querySelector('.btn-search') || document.getElementById('btn-ejecutar-busqueda');
    btnSearch?.addEventListener('click', (e) => {
        e.preventDefault();
        filtrarVacantes();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modalJobbers = document.getElementById('modal-jobbers');
            const modalPerfil = document.getElementById('modal-cambiar-perfil');

            if (modalJobbers && modalJobbers.style.display !== 'none') cerrarModal();
            if (modalPerfil && modalPerfil.style.display !== 'none') cerrarModalPerfil();
            cerrarDropdown();
        }
    });
}
/* ==========================================================================
   4. CARGA DE DATOS (JSON) Y FALLBACK
   ========================================================================== */
async function cargarVacantesDesdeJSON() {
    const rutasPosibles = ['base_de_datos.json', './base_de_datos.json', '../base_de_datos.json'];

    for (const ruta of rutasPosibles) {
        try {
            const response = await fetch(ruta);
            if (response.ok) {
                vacantesGastronomia = await response.json();
                renderizarOfertas(vacantesGastronomia);
                return;
            }
        } catch {}
    }

    vacantesGastronomia = [
        { puesto: "Bartender / Mozo", empresa: "SpeakEasy Club", zona: "Güemes", jornada: "Fines de semana", turno: "Turno Noche", tiempo: "Hace 12 horas", contacto_wa: WHATSAPP_JOBBERS_DEFAULT },
        { puesto: "Pizzero / Cocinero", empresa: "Pizzas & Fuegos", zona: "Centro", jornada: "Full Time", turno: "Turno Tarde/Noche", tiempo: "Hace 1 día", urgente: true, contacto_wa: WHATSAPP_JOBBERS_DEFAULT },
        { puesto: "Mozo / Garzón", empresa: "Bistró Italia", zona: "Cerro de las Rosas", jornada: "Full Time", turno: "Turno Noche", tiempo: "Hace 2 días", contacto_wa: WHATSAPP_JOBBERS_DEFAULT }
    ];
    renderizarOfertas(vacantesGastronomia);
}

/* ==========================================================================
   5. TALENTO DESTACADO
   ========================================================================== */
function cargarTalentoDestacado() {
    talentoDestacado = [
        { nombre: "Mateo R.", puesto: "Cocinero / Jefe de Partida", experiencia: "5 años de exp.", zona: "Nueva Córdoba / Centro", disponibilidad: "Inmediata (Full Time)" },
        { nombre: "Sofía M.", puesto: "Barista & Encargada de Caja", experiencia: "3 años de exp.", zona: "General Paz / Güemes", disponibilidad: "Turno Mañana" },
        { nombre: "Lucas G.", puesto: "Bartender / Coctelería de Autor", experiencia: "4 años de exp.", zona: "Cerro de las Rosas", disponibilidad: "Turno Noche" }
    ];

    renderizarTalentoDestacado();
}

function renderizarTalentoDestacado() {
    const contenedor = document.getElementById('grid-talento-destacado') || document.querySelector('.talento-grid');
    if (!contenedor) return;

    contenedor.innerHTML = talentoDestacado.map(t => `
        <article class="talento-card">
            <div>
                <div class="talento-card-header">
                    <h3 class="talento-nombre">${escapeHTML(t.nombre)}</h3>
                    <span class="badge-disponible">Disponible</span>
                </div>
                <div class="talento-info">
                    <div class="talento-puesto">${escapeHTML(t.puesto)}</div>
                    <div class="talento-exp">${escapeHTML(t.experiencia)}</div>
                </div>
            </div>
            <div class="talento-detalles">
                <span><i class="fas fa-map-marker-alt"></i> ${escapeHTML(t.zona)}</span>
                <span><i class="fas fa-user-clock"></i> ${escapeHTML(t.disponibilidad)}</span>
            </div>
            <button type="button" 
                    class="btn-contactar-perfil" 
                    data-nombre="${escapeHTML(t.nombre)}" 
                    data-puesto="${escapeHTML(t.puesto)}">
                <i class="fab fa-whatsapp"></i> CONTACTAR PERFIL
            </button>
        </article>
    `).join('');
}

/* ==========================================================================
   6. RENDERIZADO Y BÚSQUEDA DE OFERTAS
   ========================================================================== */
function crearCardVacante(item) {
    const puesto = item.puesto || item.titulo || "Puesto Gastronómico";
    const empresa = item.empresa || "Establecimiento Gastronómico";
    const contacto = limpiarNumeroWA(item.contacto_wa) || WHATSAPP_JOBBERS_DEFAULT;

    return `
        <article class="job-offer-card" data-categoria="${escapeHTML(item.categoria || '')}">
            <div>
                <div class="job-header-row">
                    <h4>${escapeHTML(puesto)}</h4>
                    ${item.urgente ? '<span class="badge-urgente">⚡ URGENTE</span>' : ''}
                </div>
                <div class="job-company">${escapeHTML(empresa)}</div>
                <div class="job-details-row">
                    <span><i class="fas fa-map-marker-alt"></i> ${escapeHTML(item.zona || item.ubicacion || 'Córdoba')}</span>
                    <span><i class="fas fa-briefcase"></i> ${escapeHTML(item.jornada || 'A convenir')}</span>
                    <span><i class="fas fa-clock"></i> ${escapeHTML(item.turno || 'A convenir')}</span>
                </div>
            </div>

            <div class="job-action-col">
                <span class="job-time">${escapeHTML(item.tiempo || 'Reciente')}</span>
                <button type="button" 
                        class="btn-postularme" 
                        data-puesto="${escapeHTML(puesto)}" 
                        data-empresa="${escapeHTML(empresa)}" 
                        data-contacto="${contacto}">
                    POSTULARME
                </button>
            </div>
        </article>
    `;
}

function renderizarOfertas(lista) {
    const contenedor = document.getElementById('lista-vacantes') || document.querySelector('.vacantes-list');
    const contador = document.getElementById('vacantes-count');

    if (!contenedor) return;

    if (contador) {
        const total = lista?.length || 0;
        contador.textContent = `${total} ${total === 1 ? 'vacante encontrada' : 'vacantes encontradas'}`;
    }

    if (!lista?.length) {
        contenedor.innerHTML = `
            <div style="text-align:center; padding: 3rem 1rem; color: var(--text-muted);">
                <p style="font-size:2rem; margin-bottom:10px;">🔎</p>
                <p>No encontramos búsquedas que coincidan con tu criterio.</p>
                <button type="button" onclick="filtrarPorCategoria('')" class="btn-primary" style="margin-top:12px;">
                    Ver todas las ofertas
                </button>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = lista.map(crearCardVacante).join('');
}

function filtrarVacantes() {
    const input = getElBusqueda();
    if (!input) return;
    const termino = input.value.toLowerCase().trim();

    const resultado = vacantesGastronomia.filter(v => {
        const texto = `${v.puesto || v.titulo || ''} ${v.empresa || ''} ${v.zona || v.ubicacion || ''} ${v.categoria || ''}`.toLowerCase();
        return texto.includes(termino);
    });

    renderizarOfertas(resultado);
}

function filtrarPorCategoria(categoria) {
    const input = getElBusqueda();
    if (input) input.value = categoria;

    filtrarVacantes();

    const seccionVacantes = document.getElementById('vacantes') || document.getElementById('lista-vacantes');
    seccionVacantes?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ==========================================================================
   7. FORMULARIO EXPRESS
   ========================================================================== */
function enviarAWhatsApp(event) {
    event?.preventDefault();

    const getVal = (id) => document.getElementById(id)?.value || "";

    const mensaje = `¡Hola Jobbers! 👋 Necesito contratar personal urgente:\n\n` +
                    `🏢 *Empresa/Local:* ${getVal('nombre-empresa')}\n` +
                    `📌 *Puesto:* ${getVal('puesto-requerido')}\n` +
                    `📍 *Zona:* ${getVal('zona-local')}\n` +
                    `⏰ *Turno:* ${getVal('turno-puesto')}\n` +
                    `💼 *Jornada:* ${getVal('jornada-puesto')}\n` +
                    `📱 *Contacto Directo:* ${getVal('telefono-contacto')}\n\n` +
                    `Quedo a la espera de la publicación. ¡Muchas gracias!`;

    mostrarToast("Redirigiendo a WhatsApp...", "success");
    abrirWhatsApp(WHATSAPP_JOBBERS_DEFAULT, mensaje);
    document.getElementById('form-publicar-express')?.reset();
}

/* ==========================================================================
   8. MODAL DE POSTULACIÓN
   ========================================================================== */
function asegurarEstructuraModal() {
    if (document.getElementById('modal-jobbers')) return;

    const modal = document.createElement('div');
    modal.id = 'modal-jobbers';
    modal.className = 'jobbers-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'modal-title-postulacion');

    modal.style.cssText = `
        display: none; position: fixed; inset: 0; z-index: 99999;
        background: var(--modal-overlay-bg, rgba(0,0,0,0.8)); backdrop-filter: blur(6px);
        align-items: center; justify-content: center; padding: 1rem;
    `;
    modal.innerHTML = `
        <div class="jobbers-modal-card" tabindex="-1" style="background: var(--card-bg, #141619); border: 1px solid var(--border-color, #26292E); width: 100%; max-width: 480px; border-radius: 28px; padding: 1.8rem; position: relative; box-shadow: var(--shadow-lg); color: var(--text-main, #fff);">
            <button type="button" onclick="cerrarModal()" class="jobbers-close-btn" aria-label="Cerrar modal" style="position:absolute; right:18px; top:18px; background:transparent; border:none; color:#fff; font-size:1.5rem; cursor:pointer;">&times;</button>
            <div id="modal-body"></div>
        </div>
    `;
    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });

    modal.addEventListener('keydown', (e) => {
        if (e.key !== 'Tab') return;
        const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
        }
    });
}

function abrirModalPostulacion(puesto, empresa, contactoWA) {
    elementoPrevioFoco = document.activeElement;
    asegurarEstructuraModal();
    
    const body = document.getElementById('modal-body');
    if (!body) return;

    const numLimpio = limpiarNumeroWA(contactoWA) || WHATSAPP_JOBBERS_DEFAULT;

    body.innerHTML = `
        <div style="margin-bottom: 1.2rem;">
            <h2 id="modal-title-postulacion" style="font-size:1.35rem; font-weight:800; color:var(--text-main); margin:0 0 4px 0;">POSTULARME</h2>
            <p style="color:var(--primary, #F59E0B); font-size:0.95rem; font-weight:700; margin:0;">${escapeHTML(puesto)} — ${escapeHTML(empresa)}</p>
        </div>

        <div style="background: rgba(245, 158, 11, 0.1); border-left: 4px solid var(--primary, #F59E0B); padding: 12px 14px; border-radius: 14px; margin-bottom: 1.2rem;">
            <p style="font-size: 0.85rem; color: #fde68a; margin: 0; line-height: 1.4;">
                📎 <strong>Recordatorio:</strong> Al abrirse WhatsApp, <u>adjuntá tu CV (PDF)</u> en el chat.
            </p>
        </div>

        <form id="form-postulacion-modal" class="express-form">
            <div class="form-group" style="margin-bottom: 12px;">
                <input type="text" id="post-nombre" placeholder="Nombre y Apellido" required style="width:100%; padding:12px 16px; border-radius:14px; border:1px solid rgba(255,255,255,0.1); background:#0D1117; color:#fff;">
            </div>
            <div class="form-group" style="margin-bottom: 14px;">
                <input type="tel" id="post-telefono" placeholder="Tu número de WhatsApp (ej: 3511234567)" required style="width:100%; padding:12px 16px; border-radius:14px; border:1px solid rgba(255,255,255,0.1); background:#0D1117; color:#fff;">
            </div>
            <button type="submit" class="btn-accent" style="width:100%; margin-top:6px; padding:14px; font-weight:bold; cursor:pointer;">
                CONTACTAR AL EMPLEADOR
            </button>
        </form>
    `;

    const formModal = document.getElementById('form-postulacion-modal');
    formModal?.addEventListener('submit', (e) => {
        e.preventDefault();
        procesarPostulacion(puesto, empresa, numLimpio);
    }, { once: true });

    const modal = document.getElementById('modal-jobbers');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    setTimeout(() => document.getElementById('post-nombre')?.focus(), 50);
}

function procesarPostulacion(puesto, empresa, contactoWA) {
    const nombre = document.getElementById('post-nombre')?.value || "Candidato";
    const telefono = document.getElementById('post-telefono')?.value || "";

    const mensaje = `¡Hola! 👋 Vi la propuesta para el puesto de *${puesto}* en *${empresa}* a través de Jobbers.\n\n` +
                    `Me interesa postularme:\n` +
                    `👤 *Nombre:* ${nombre}\n` +
                    `📱 *Contacto:* ${telefono}\n\n` +
                    `📎 Te adjunto mi CV en formato PDF a continuación. ¡Quedo a disposición!`;

    cerrarModal();
    mostrarToast("Abriendo WhatsApp del empleador...", "success");
    abrirWhatsApp(contactoWA, mensaje);
}

/* ==========================================================================
   9. TOASTS Y NOTIFICACIONES
   ========================================================================== */
function mostrarToast(mensaje, tipo = "success") {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = "position: fixed; bottom: 25px; right: 25px; z-index: 999999;";
        document.body.appendChild(container);
    }

    const esSuccess = tipo === 'success';
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${esSuccess ? 'var(--primary, #F59E0B)' : '#EF4444'};
        color: #000000;
        padding: 12px 24px; border-radius: 999px; margin-top: 10px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.3); font-weight: 800; font-size: 0.9rem;
        transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.3s ease; opacity: 1;
    `;
    toast.innerText = mensaje;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ==========================================================================
   10. EXPOSICIÓN GLOBAL DE MÉTODOS
   ========================================================================== */
Object.assign(window, {
    cambiarPerfil,
    abrirModalPerfil,
    cerrarModalPerfil,
    enviarAWhatsApp,
    abrirModalPostulacion,
    cerrarModal,
    filtrarVacantes,
    filtrarPorCategoria,
    toggleDropdown,
    cerrarDropdown,
    solicitarContactoTalento,
    unirseAComunidad,
    abrirWhatsApp
});
