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

/* ==========================================================================
   1. EXPOSICIÓN GLOBAL PREVIA (Para evitar errores de ReferenceError)
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

function abrirModalPerfil() {
    const modal = document.getElementById('modal-cambiar-perfil');
    if (modal) modal.style.display = 'flex';
}

function cerrarModalPerfil() {
    const modal = document.getElementById('modal-cambiar-perfil');
    if (modal) modal.style.display = 'none';
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
   2. INICIALIZACIÓN Y EVENT LISTENERS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    asegurarEstructuraModal();
    cargarVacantesDesdeJSON();
    cargarTalentoDestacado();
    inicializarModoPerfil();
    inicializarEventListeners();
});

function inicializarEventListeners() {
    // Delegación global para botones interactivos y triggers dinámicos
    document.addEventListener('click', (e) => {
        // Botones de postularme
        const btnPostular = e.target.closest('.btn-postularme');
        if (btnPostular) {
            e.preventDefault();
            const { puesto, empresa, contacto } = btnPostular.dataset;
            abrirModalPostulacion(puesto, empresa, contacto);
            return;
        }

        // Botones para solicitar contacto de talento destacado (Manejo limpio sin inline JS)
        const btnTalento = e.target.closest('.btn-contactar-perfil');
        if (btnTalento) {
            e.preventDefault();
            const { nombre, puesto } = btnTalento.dataset;
            solicitarContactoTalento(nombre, puesto);
            return;
        }

        // Toggle para Formulario Express
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

        // Cierre de dropdowns
        if (!e.target.closest('.dropdown')) {
            cerrarDropdown();
        }
    });

    // Formulario Express Submit
    document.getElementById('form-publicar-express')?.addEventListener('submit', enviarAWhatsApp);

    // Búsqueda en tiempo real
    const inputBusqueda = document.getElementById('input-busqueda') || document.getElementById('job-search-input');
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

    // Cierre global con Escape
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modalJobbers = document.getElementById('modal-jobbers');
            const modalPerfil = document.getElementById('modal-cambiar-perfil');

            if (modalJobbers && getComputedStyle(modalJobbers).display !== 'none') cerrarModal();
            if (modalPerfil && getComputedStyle(modalPerfil).display !== 'none') cerrarModalPerfil();
            cerrarDropdown();
        }
    });
}

/* ==========================================================================
   3. SECCIÓN MODO Y CAMBIO DE PERFIL
   ========================================================================== */
function inicializarModoPerfil() {
    const btnsCambiarPerfil = document.querySelectorAll('.btn-cambiar-rol, #btn-cambiar-perfil');
    const modalPerfil = document.getElementById('modal-cambiar-perfil');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    
    const stepSelect = document.getElementById('rol-step-select');
    const stepConfirm = document.getElementById('rol-step-confirm');
    const labelConfirmar = document.getElementById('rol-nombre-confirmar');
    const btnVolverRol = document.getElementById('btn-volver-rol');
    const btnConfirmarRol = document.getElementById('btn-confirmar-rol');

    let rolSeleccionado = { key: '', nombre: '' };

    const rolGuardado = localStorage.getItem('jobbers_user_role') || localStorage.getItem('jobbers_role') || localStorage.getItem('jobbers_rol');
    if (rolGuardado) {
        aplicarRol(rolGuardado);
    }

    const resetearModalPerfil = () => {
        if (stepSelect) stepSelect.style.display = 'block';
        if (stepConfirm) stepConfirm.style.display = 'none';
        rolSeleccionado = { key: '', nombre: '' };
    };

    btnsCambiarPerfil.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            resetearModalPerfil();
            abrirModalPerfil();
        });
    });

    btnCerrarModal?.addEventListener('click', cerrarModalPerfil);

    window.addEventListener('click', (e) => {
        if (e.target === modalPerfil) cerrarModalPerfil();
    });

    document.querySelectorAll('.btn-rol').forEach(btn => {
        btn.addEventListener('click', () => {
            const rolKey = btn.getAttribute('data-rol');
            const rolNombre = btn.getAttribute('data-nombre') || btn.querySelector('.rol-title')?.textContent || rolKey;

            rolSeleccionado = { key: rolKey, nombre: rolNombre };

            if (stepSelect && stepConfirm) {
                if (labelConfirmar) labelConfirmar.textContent = rolNombre;
                stepSelect.style.display = 'none';
                stepConfirm.style.display = 'block';
            } else {
                confirmarYGuardarRol(rolKey, rolNombre);
            }
        });
    });

    btnVolverRol?.addEventListener('click', resetearModalPerfil);
    btnConfirmarRol?.addEventListener('click', () => {
        if (rolSeleccionado.key) {
            confirmarYGuardarRol(rolSeleccionado.key, rolSeleccionado.nombre);
        }
    });
}

function confirmarYGuardarRol(key, nombre) {
    aplicarRol(key);
    ['jobbers_user_role', 'jobbers_role', 'jobbers_rol'].forEach(k => localStorage.setItem(k, key));
    cerrarModalPerfil();
    mostrarToast(`Perfil cambiado a: ${(nombre || key).toUpperCase()}`, 'success');
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
        } catch {
            // Sigue a la siguiente ruta si falla
        }
    }

    // Fallback de contingencia
    vacantesGastronomia = [
        { puesto: "Bartender / Mozo", empresa: "SpeakEasy Club", zona: "Güemes", jornada: "Fines de semana", turno: "Turno Noche", tiempo: "Hace 12 horas", contacto_wa: WHATSAPP_JOBBERS_DEFAULT },
        { puesto: "Pizzero / Cocinero", empresa: "Pizzas & Fuegos", zona: "Centro", jornada: "Full Time", turno: "Turno Tarde/Noche", tiempo: "Hace 1 día", urgente: true, contacto_wa: WHATSAPP_JOBBERS_DEFAULT },
        { puesto: "Mozo / Garzón", empresa: "Bistró Italia", zona: "Cerro de las Rosas", jornada: "Full Time", turno: "Turno Noche", tiempo: "Hace 2 días", contacto_wa: WHATSAPP_JOBBERS_DEFAULT }
    ];
    renderizarOfertas(vacantesGastronomia);
}

/* ==========================================================================
   5. SECCIÓN TALENTO DESTACADO
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
    const input = document.getElementById('input-busqueda') || document.getElementById('job-search-input');
    if (!input) return;
    const termino = input.value.toLowerCase().trim();

    const resultado = vacantesGastronomia.filter(v => {
        const texto = `${v.puesto || v.titulo || ''} ${v.empresa || ''} ${v.zona || v.ubicacion || ''} ${v.categoria || ''}`.toLowerCase();
        return texto.includes(termino);
    });

    renderizarOfertas(resultado);
}

function filtrarPorCategoria(categoria) {
    const input = document.getElementById('input-busqueda') || document.getElementById('job-search-input');
    if (input) input.value = categoria;

    // Reutiliza el filtro global existente
    filtrarVacantes();

    const seccionVacantes = document.getElementById('vacantes') || document.getElementById('lista-vacantes');
    seccionVacantes?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ==========================================================================
   7. ENVÍO DE FORMULARIO EXPRESS A WHATSAPP
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
        display: none; position: fixed; inset: 0; z-index: var(--z-modal, 1000);
        background: var(--modal-overlay-bg, rgba(0,0,0,0.8)); backdrop-filter: blur(4px);
        align-items: center; justify-content: center; padding: 1rem;
    `;
    modal.innerHTML = `
        <div class="jobbers-modal-card" tabindex="-1" style="background: var(--card-bg, #141619); border: 1px solid var(--border-color, #26292E); width: 100%; max-width: 480px; border-radius: 12px; padding: 1.5rem; position: relative; box-shadow: var(--shadow-lg); color: var(--text-main, #fff);">
            <button type="button" onclick="cerrarModal()" class="jobbers-close-btn" aria-label="Cerrar modal" style="position:absolute; right:15px; top:15px; background:transparent; border:none; color:#fff; font-size:1.5rem; cursor:pointer;">&times;</button>
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
        <div style="margin-bottom: 1rem;">
            <h2 id="modal-title-postulacion" style="font-size:1.25rem; font-weight:800; color:var(--text-main); margin:0 0 4px 0;">POSTULARME</h2>
            <p style="color:var(--primary, #e74c3c); font-size:0.95rem; font-weight:700; margin:0;">${escapeHTML(puesto)} — ${escapeHTML(empresa)}</p>
        </div>

        <div style="background: rgba(231, 76, 60, 0.1); border-left: 4px solid var(--danger-badge, #e74c3c); padding: 10px 12px; border-radius: 4px; margin-bottom: 1rem;">
            <p style="font-size: 0.85rem; color: #fca5a5; margin: 0; line-height: 1.4;">
                📎 <strong>Recordatorio:</strong> Al abrirse WhatsApp, <u>adjuntá tu CV (PDF)</u> en el chat.
            </p>
        </div>

        <form id="form-postulacion-modal" class="express-form">
            <div class="form-group" style="margin-bottom: 12px;">
                <input type="text" id="post-nombre" placeholder="Nombre y Apellido" required style="width:100%; padding:10px; border-radius:6px; border:1px solid #333; background:#222; color:#fff;">
            </div>
            <div class="form-group" style="margin-bottom: 12px;">
                <input type="tel" id="post-telefono" placeholder="Tu número de WhatsApp (ej: 3511234567)" required style="width:100%; padding:10px; border-radius:6px; border:1px solid #333; background:#222; color:#fff;">
            </div>
            <button type="submit" class="btn-primary" style="width:100%; margin-top:4px; padding:12px; background:var(--primary, #e74c3c); border:none; border-radius:6px; color:#fff; font-weight:bold; cursor:pointer;">
                CONTACTAR AL EMPLEADOR
            </button>
        </form>
    `;

    document.getElementById('form-postulacion-modal')?.addEventListener('submit', (e) => {
        e.preventDefault();
        procesarPostulacion(puesto, empresa, numLimpio);
    });

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
        container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: var(--z-toast, 2000);";
        document.body.appendChild(container);
    }

    const esSuccess = tipo === 'success';
    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${esSuccess ? 'var(--salary-green, #2ecc71)' : 'var(--danger-badge, #e74c3c)'};
        color: ${esSuccess ? '#000000' : '#ffffff'};
        padding: 12px 20px; border-radius: 8px; margin-top: 10px;
        box-shadow: var(--shadow-md, 0 4px 12px rgba(0,0,0,0.3)); font-weight: 700; font-size: 0.9rem;
        transition: opacity 0.3s ease; opacity: 1;
    `;
    toast.innerText = mensaje;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ==========================================================================
   10. BINDING GLOBAL COMPLETO
   ========================================================================== */
Object.assign(window, {
    enviarAWhatsApp,
    abrirModalPostulacion,
    cerrarModal,
    abrirModalPerfil,
    cerrarModalPerfil,
    filtrarVacantes,
    filtrarPorCategoria,
    toggleDropdown,
    cerrarDropdown,
    solicitarContactoTalento,
    unirseAComunidad,
    abrirWhatsApp
});
