/* ==========================================================================
   JOBBERS ARGENTINA - MÓDULO PRINCIPAL DE INTERACCIÓN Y PERFILES
   ========================================================================== */

const WHATSAPP_JOBBERS_DEFAULT = "5493513080197";

// Estado global de la aplicación
const AppState = {
    userRole: 'postulante', // 'postulante' | 'empresa'
    vacantes: [],
    talentos: [],
    elementoPrevioFoco: null
};

/* ==========================================================================
   1. UTILITIES Y HELPERS
   ========================================================================== */
const escapeHTML = (str) => {
    if (!str && str !== 0) return "";
    return String(str).replace(/[&<>"']/g, (match) => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[match];
    });
};

const limpiarNumeroWA = (num) => String(num || "").replace(/\D/g, "");

function debounce(fn, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

/* ==========================================================================
   2. INICIALIZACIÓN DE LA APLICACIÓN
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    asegurarEstructuraModal();
    initGestionPerfil();
    initNavegacionGlobal();
    
    // Carga inicial de datos
    cargarVacantes();
    cargarTalentos();

    // Handlers específicos por módulo
    initModuloPostulante();
    initModuloEmpresa();
});

/* ==========================================================================
   3. GESTIÓN DE PERFIL (POSTULANTE VS EMPRESA)
   ========================================================================== */
function initGestionPerfil() {
    const savedRole = localStorage.getItem('jobbers_user_role') || 'postulante';
    aplicarPerfil(savedRole);

    const btnsCambiar = document.querySelectorAll('.btn-cambiar-rol, #btn-cambiar-perfil');
    btnsCambiar.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModalPerfil();
        });
    });

    const btnsRolOption = document.querySelectorAll('.btn-rol');
    btnsRolOption.forEach(btn => {
        btn.addEventListener('click', () => {
            const nuevoRol = btn.getAttribute('data-rol');
            const nombreRol = btn.getAttribute('data-nombre') || nuevoRol;
            
            aplicarPerfil(nuevoRol);
            localStorage.setItem('jobbers_user_role', nuevoRol);
            cerrarModalPerfil();
            mostrarToast(`Modo cambiado a: ${nombreRol.toUpperCase()}`, 'success');
        });
    });

    const btnCerrar = document.getElementById('btn-cerrar-modal-perfil');
    if (btnCerrar) btnCerrar.addEventListener('click', cerrarModalPerfil);
}

function aplicarPerfil(rol) {
    AppState.userRole = rol;
    
    // Cambiar clases en el body para control de UI por CSS
    document.body.classList.remove('role-postulante', 'role-empresa');
    document.body.classList.add(`role-${rol}`);

    // Actualizar indicador textual en el header/UI
    const labelModo = document.getElementById('label-modo-actual');
    if (labelModo) {
        labelModo.textContent = rol === 'empresa' ? 'Modo: Empresa' : 'Modo: Postulante';
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

/* ==========================================================================
   4. MÓDULO EXCLUSIVO: POSTULANTE (Buscar ofertas y postularse)
   ========================================================================== */
function initModuloPostulante() {
    // Event delegation para botones de postulación dentro del contenedor de vacantes
    const contenedorVacantes = document.getElementById('lista-vacantes') || document.querySelector('.vacantes-list');
    if (contenedorVacantes) {
        contenedorVacantes.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-postularme');
            if (btn) {
                const puesto = btn.getAttribute('data-puesto');
                const empresa = btn.getAttribute('data-empresa');
                const contacto = btn.getAttribute('data-contacto');
                abrirModalPostulacion(puesto, empresa, contacto);
            }
        });
    }

    // Buscador en tiempo real
    const inputBusqueda = document.getElementById('input-busqueda') || document.getElementById('job-search-input');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', debounce(filtrarVacantes, 300));
    }

    const btnSearch = document.querySelector('.btn-search');
    if (btnSearch) {
        btnSearch.addEventListener('click', (e) => {
            e.preventDefault();
            filtrarVacantes();
        });
    }
}

async function cargarVacantes() {
    try {
        const response = await fetch('data/base_de_datos.json');
        if (response.ok) {
            AppState.vacantes = await response.json();
        } else {
            throw new Error("No se pudo cargar la base de datos remota");
        }
    } catch (e) {
        // Fallback local
        AppState.vacantes = [
            { puesto: "Bartender / Mozo", empresa: "SpeakEasy Club", zona: "Güemes", jornada: "Fines de semana", turno: "Turno Noche", tiempo: "Hace 12hs", contacto_wa: WHATSAPP_JOBBERS_DEFAULT },
            { puesto: "Pizzero / Cocinero", empresa: "Pizzas & Fuegos", zona: "Centro", jornada: "Full Time", turno: "Turno Tarde/Noche", tiempo: "Hace 1 día", urgente: true, contacto_wa: WHATSAPP_JOBBERS_DEFAULT },
            { puesto: "Mozo / Garzón", empresa: "Bistró Italia", zona: "Cerro de las Rosas", jornada: "Full Time", turno: "Turno Noche", tiempo: "Hace 2 días", contacto_wa: WHATSAPP_JOBBERS_DEFAULT }
        ];
    }
    renderizarOfertas(AppState.vacantes);
}

function renderizarOfertas(lista) {
    const contenedor = document.getElementById('lista-vacantes') || document.querySelector('.vacantes-list');
    if (!contenedor) return;

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align:center; padding: 3rem 1rem; color: #94a3b8;">
                <p style="font-size:2rem; margin-bottom:10px;">🔎</p>
                <p>No encontramos búsquedas que coincidan con tu criterio.</p>
            </div>`;
        return;
    }

    contenedor.innerHTML = lista.map(item => {
        const puesto = item.puesto || item.titulo || "Puesto Gastronómico";
        const empresa = item.empresa || "Establecimiento Gastronómico";
        const contacto = limpiarNumeroWA(item.contacto_wa) || WHATSAPP_JOBBERS_DEFAULT;

        return `
            <article class="job-card" style="background: #121824; border: 1px solid #2d3748; border-radius: 10px; padding: 1.25rem; margin-bottom: 1rem; color: #fff;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom: 8px;">
                    <div>
                        <h3 style="font-size:1.1rem; font-weight:700; color:#f59e0b; margin:0 0 4px 0;">${escapeHTML(empresa)}</h3>
                        <p style="font-size:0.95rem; color:#e2e8f0; font-weight:600; margin:0;">${escapeHTML(puesto)}</p>
                    </div>
                    ${item.urgente ? '<span style="background:#ef4444; color:#fff; font-size:0.65rem; font-weight:bold; padding:4px 8px; border-radius:12px;">⚡ URGENTE</span>' : ''}
                </div>
                <div style="display:flex; gap:14px; flex-wrap:wrap; margin:12px 0; font-size:0.85rem; color:#94a3b8;">
                    <span>📍 ${escapeHTML(item.zona || 'Córdoba')}</span>
                    <span>💼 ${escapeHTML(item.jornada || 'A convenir')}</span>
                    <span>⏰ ${escapeHTML(item.turno || 'A convenir')}</span>
                </div>
                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #1e293b; padding-top:12px; margin-top:10px;">
                    <span style="font-size:0.8rem; color:#64748b;">${escapeHTML(item.tiempo || 'Reciente')}</span>
                    <button type="button" class="btn-postularme" data-puesto="${escapeHTML(puesto)}" data-empresa="${escapeHTML(empresa)}" data-contacto="${contacto}" style="background: #f59e0b; color: #000; font-weight: 800; border: none; padding: 8px 24px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
                        POSTULARME
                    </button>
                </div>
            </article>`;
    }).join('');
}

function filtrarVacantes() {
    const input = document.getElementById('input-busqueda') || document.getElementById('job-search-input');
    if (!input) return;
    const termino = input.value.toLowerCase().trim();

    const resultado = AppState.vacantes.filter(v => {
        const puesto = (v.puesto || v.titulo || "").toLowerCase();
        const empresa = (v.empresa || "").toLowerCase();
        const zona = (v.zona || "").toLowerCase();
        return puesto.includes(termino) || empresa.includes(termino) || zona.includes(termino);
    });

    renderizarOfertas(resultado);
}

/* ==========================================================================
   5. MÓDULO EXCLUSIVO: EMPRESA (Publicar búsquedas y buscar talentos)
   ========================================================================== */
function initModuloEmpresa() {
    // Formulario Express para publicar búsquedas
    const formExpress = document.getElementById('form-publicar-express');
    if (formExpress) {
        formExpress.addEventListener('submit', enviarBusquedaExpressWhatsApp);
    }

    // Toggle para mostrar/ocultar el formulario Express
    const triggersExpress = document.querySelectorAll('.btn-trigger-express');
    const cardExpress = document.getElementById('formulario-express');

    triggersExpress.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!cardExpress) return;
            
            const estaVisible = cardExpress.style.display === 'block';
            cardExpress.style.display = estaVisible ? 'none' : 'block';
            btn.setAttribute('aria-expanded', !estaVisible);

            if (!estaVisible) {
                cardExpress.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => document.getElementById('nombre-empresa')?.focus(), 300);
            }
        });
    });
}

function cargarTalentos() {
    AppState.talentos = [
        { iniciales: "LR", nombre: "Lucas R.", puesto: "Cocinero", reviews: 24, experiencia: "5 años de exp.", disponibilidad: "Inmediata", zona: "Nueva Córdoba" },
        { iniciales: "MF", nombre: "María F.", puesto: "Barista", reviews: 18, experiencia: "3 años de exp.", disponibilidad: "Mañana", zona: "Güemes" },
        { iniciales: "SM", nombre: "Santiago M.", puesto: "Mozo", reviews: 31, experiencia: "4 años de exp.", disponibilidad: "Inmediata", zona: "Centro" }
    ];
    renderizarTalentoDestacado();
}

function renderizarTalentoDestacado() {
    const contenedor = document.getElementById('grid-talento-destacado');
    if (!contenedor) return;

    contenedor.innerHTML = AppState.talentos.map(t => `
        <article class="talento-card" style="background: #121824; border: 1px solid #2d3748; border-radius: 12px; padding: 1.5rem; text-align: center; color: #fff;">
            <div style="width: 56px; height: 56px; background: #2a3447; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; margin: 0 auto 8px auto;">
                ${escapeHTML(t.iniciales)}
            </div>
            <h3 style="font-size: 1.1rem; margin: 0; color: #fff;">${escapeHTML(t.nombre)}</h3>
            <p style="color: #f59e0b; font-weight: 600; margin: 2px 0 8px 0;">${escapeHTML(t.puesto)}</p>
            <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">${escapeHTML(t.experiencia)} • 📍 ${escapeHTML(t.zona)}</p>
            <button type="button" onclick="solicitarContactoTalento('${escapeHTML(t.nombre)}', '${escapeHTML(t.puesto)}')" style="width: 100%; background: #f59e0b; color: #000; font-weight: 800; border: none; padding: 10px; border-radius: 8px; cursor: pointer; margin-top: 12px; font-size: 0.8rem;">
                🔒 VER CONTACTO / CV
            </button>
        </article>
    `).join('');
}

function enviarBusquedaExpressWhatsApp(event) {
    if (event) event.preventDefault();

    const empresa = document.getElementById('nombre-empresa')?.value || "";
    const telefono = document.getElementById('telefono-contacto')?.value || "";
    const puesto = document.getElementById('puesto-requerido')?.value || "";
    const zona = document.getElementById('zona-local')?.value || "";
    const turno = document.getElementById('turno-puesto')?.value || "";
    const jornada = document.getElementById('jornada-puesto')?.value || "";

    const mensaje = `¡Hola Jobbers! 👋 Necesito publicar una búsqueda express:\n\n` +
                    `🏢 *Empresa:* ${empresa}\n` +
                    `📌 *Puesto:* ${puesto}\n` +
                    `📍 *Zona:* ${zona}\n` +
                    `⏰ *Turno:* ${turno}\n` +
                    `💼 *Jornada:* ${jornada}\n` +
                    `📱 *Contacto:* ${telefono}`;

    mostrarToast("Redirigiendo a WhatsApp...", "success");
    window.open(`https://wa.me/${WHATSAPP_JOBBERS_DEFAULT}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer');
    document.getElementById('form-publicar-express')?.reset();
}

function solicitarContactoTalento(nombre, puesto) {
    const mensaje = `¡Hola Jobbers! 👋 Soy de una empresa y me interesa solicitar el CV del talento destacado: *${nombre}* (${puesto}).`;
    window.open(`https://wa.me/${WHATSAPP_JOBBERS_DEFAULT}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer');
}

/* ==========================================================================
   6. NAVEGACIÓN Y COMPONENTES GLOBALES (MODAL & TOAST)
   ========================================================================== */
function initNavegacionGlobal() {
    const btnRecursos = document.getElementById('dropdown-recursos');
    if (btnRecursos) {
        btnRecursos.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });
    }

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) cerrarDropdown();
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModal();
            cerrarModalPerfil();
            cerrarDropdown();
        }
    });
}

function toggleDropdown() {
    const menu = document.getElementById('menu-recursos');
    const btn = document.getElementById('dropdown-recursos');
    if (menu) {
        const isOpen = menu.classList.toggle('show');
        if (btn) btn.setAttribute('aria-expanded', isOpen);
    }
}

function cerrarDropdown() {
    const menu = document.getElementById('menu-recursos');
    const btn = document.getElementById('dropdown-recursos');
    if (menu && menu.classList.contains('show')) {
        menu.classList.remove('show');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    }
}

function asegurarEstructuraModal() {
    let modal = document.getElementById('modal-jobbers');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-jobbers';
        modal.style.cssText = `display: none; position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.75); align-items: center; justify-content: center; padding: 1rem;`;
        modal.innerHTML = `
            <div style="background: #121824; border: 1px solid #2d3748; width: 100%; max-width: 480px; border-radius: 12px; padding: 1.5rem; position: relative; color: #fff;">
                <button type="button" onclick="cerrarModal()" style="position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer;">&times;</button>
                <div id="modal-body"></div>
            </div>`;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => { if (e.target === modal) cerrarModal(); });
    }
}

function abrirModalPostulacion(puesto, empresa, contactoWA) {
    AppState.elementoPrevioFoco = document.activeElement;
    asegurarEstructuraModal();
    
    const body = document.getElementById('modal-body');
    if (!body) return;

    body.innerHTML = `
        <h2 style="font-size:1.25rem; font-weight:800; color:#fff; margin:0 0 4px 0;">POSTULARME</h2>
        <p style="color:#f59e0b; font-weight:700; margin:0 0 1rem 0;">${escapeHTML(puesto)} — ${escapeHTML(empresa)}</p>
        <form id="form-postulacion-modal" style="display:flex; flex-direction:column; gap:12px;">
            <input type="text" id="post-nombre" placeholder="Nombre y Apellido" required style="padding:10px; background:#1e293b; border:1px solid #334155; border-radius:6px; color:#fff;">
            <input type="tel" id="post-telefono" placeholder="Tu WhatsApp (ej: 3511234567)" required style="padding:10px; background:#1e293b; border:1px solid #334155; border-radius:6px; color:#fff;">
            <button type="submit" style="padding:12px; background:#f59e0b; color:#000; border:none; font-weight:bold; border-radius:6px; cursor:pointer;">CONTACTAR EMPLEADOR</button>
        </form>`;

    document.getElementById('form-postulacion-modal').addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('post-nombre')?.value || "Candidato";
        const telefono = document.getElementById('post-telefono')?.value || "";
        const mensaje = `¡Hola! 👋 Vi la propuesta para *${puesto}* en *${empresa}* en Jobbers.\n\n👤 *Nombre:* ${nombre}\n📱 *Contacto:* ${telefono}\n\n Te adjunto mi CV en formato PDF.`;
        
        cerrarModal();
        mostrarToast("Abriendo WhatsApp...", "success");
        window.open(`https://wa.me/${contactoWA}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer');
    });

    document.getElementById('modal-jobbers').style.display = 'flex';
}

function cerrarModal() {
    const modal = document.getElementById('modal-jobbers');
    if (modal) modal.style.display = 'none';
    if (AppState.elementoPrevioFoco) {
        AppState.elementoPrevioFoco.focus();
        AppState.elementoPrevioFoco = null;
    }
}

function mostrarToast(mensaje, tipo = "success") {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 10000;";
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `background: ${tipo === 'success' ? '#22c55e' : '#ef4444'}; color: white; padding: 12px 20px; border-radius: 8px; margin-top: 10px; font-weight: 600; font-size: 0.9rem;`;
    toast.innerText = mensaje;

    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

/* Bindings globales requeridos por HTML inline si existiesen */
window.solicitarContactoTalento = solicitarContactoTalento;
window.cerrarModal = cerrarModal;
