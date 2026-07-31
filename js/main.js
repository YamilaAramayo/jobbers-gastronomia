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
   1. INICIALIZACIÓN Y EVENT LISTENERS
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    asegurarEstructuraModal();
    cargarVacantesDesdeJSON();
    cargarTalentoDestacado();
    inicializarModoPerfil();

    // Event Delegation para botones de postulación
    const contenedorVacantes = document.getElementById('lista-vacantes');
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

    // Bind del Formulario Express (evento Submit directo)
    const formExpress = document.getElementById('form-publicar-express');
    if (formExpress) {
        formExpress.addEventListener('submit', enviarAWhatsApp);
    }

    // Toggle de visibilidad para Formulario Express
    const triggersExpress = document.querySelectorAll('.btn-trigger-express');
    const cardExpress = document.getElementById('formulario-express');

    triggersExpress.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (cardExpress) {
                const estaVisible = cardExpress.classList.contains('is-visible') || cardExpress.style.display === 'block';

                if (estaVisible) {
                    cardExpress.classList.remove('is-visible');
                    cardExpress.style.display = 'none';
                    btn.setAttribute('aria-expanded', 'false');
                } else {
                    cardExpress.style.display = 'block';
                    cardExpress.classList.add('is-visible');
                    btn.setAttribute('aria-expanded', 'true');
                    cardExpress.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    setTimeout(() => {
                        document.getElementById('nombre-empresa')?.focus();
                    }, 300);
                }
            }
        });
    });

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

    const btnSearch = document.querySelector('.btn-search');
    if (btnSearch) {
        btnSearch.addEventListener('click', (e) => {
            e.preventDefault();
            filtrarVacantes();
        });
    }

    // Tecla Escape para modales y dropdowns
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModal();
            cerrarModalPerfil();
            cerrarDropdown();
        }
    });

    // Cierre de dropdowns al hacer clic afuera
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            cerrarDropdown();
        }
    });
});

/* ==========================================================================
   2. SECCIÓN MODO Y CAMBIO DE PERFIL (POSTULANTE / EMPRESA)
   ========================================================================== */
function inicializarModoPerfil() {
    const btnsCambiarPerfil = document.querySelectorAll('.btn-cambiar-rol, #btn-cambiar-perfil');
    const modalPerfil = document.getElementById('modal-cambiar-perfil');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnsRol = document.querySelectorAll('.btn-rol');

    // 1. Obtener o establecer rol inicial
    const rolGuardado = localStorage.getItem('jobbers_role') || 'postulante';
    aplicarRol(rolGuardado);

    // 2. Abrir Modal al hacer clic en "Cambiar Perfil"
    btnsCambiarPerfil.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModalPerfil();
        });
    });

    // 3. Cerrar Modal
    if (btnCerrarModal) {
        btnCerrarModal.addEventListener('click', cerrarModalPerfil);
    }

    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', (e) => {
        if (e.target === modalPerfil) {
            cerrarModalPerfil();
        }
    });

    // 4. Cambiar Rol al seleccionar una opción
    btnsRol.forEach(btn => {
        btn.addEventListener('click', () => {
            const nuevoRol = btn.getAttribute('data-rol');
            aplicarRol(nuevoRol);
            localStorage.setItem('jobbers_role', nuevoRol);
            cerrarModalPerfil();
            mostrarToast(`Perfil cambiado a: ${nuevoRol.toUpperCase()}`, 'success');
        });
    });
}

function abrirModalPerfil() {
    const modalPerfil = document.getElementById('modal-cambiar-perfil');
    if (modalPerfil) modalPerfil.style.display = 'flex';
}

function cerrarModalPerfil() {
    const modalPerfil = document.getElementById('modal-cambiar-perfil');
    if (modalPerfil) modalPerfil.style.display = 'none';
}

function aplicarRol(rol) {
    const labelModoActual = document.getElementById('label-modo-actual');
    document.body.classList.remove('role-postulante', 'role-empresa');

    if (rol === 'empresa') {
        document.body.classList.add('role-empresa');
        if (labelModoActual) labelModoActual.textContent = 'Modo: Empresa';
    } else {
        document.body.classList.add('role-postulante');
        if (labelModoActual) labelModoActual.textContent = 'Modo: Postulante';
    }
}

/* ==========================================================================
   3. CARGA DE DATOS (JSON) Y FALLBACK
   ========================================================================== */
async function cargarVacantesDesdeJSON() {
    const rutasPosibles = ['base_de_datos.json', './base_de_datos.json', 'data/base_de_datos.json'];
    let exito = false;

    for (const ruta of rutasPosibles) {
        try {
            const response = await fetch(ruta);
            if (response.ok) {
                vacantesGastronomia = await response.json();
                renderizarOfertas(vacantesGastronomia);
                exito = true;
                break;
            }
        } catch (e) {
            // Continúa a la siguiente ruta si falla
        }
    }

    if (!exito) {
        // Fallback de respaldo
        vacantesGastronomia = [
            { puesto: "Bartender / Mozo", empresa: "SpeakEasy Club", zona: "Güemes", jornada: "Fines de semana", turno: "Turno Noche", tiempo: "Hace 12 horas", contacto_wa: WHATSAPP_JOBBERS_DEFAULT },
            { puesto: "Pizzero / Cocinero", empresa: "Pizzas & Fuegos", zona: "Centro", jornada: "Full Time", turno: "Turno Tarde/Noche", tiempo: "Hace 1 día", urgente: true, contacto_wa: WHATSAPP_JOBBERS_DEFAULT },
            { puesto: "Mozo / Garzón", empresa: "Bistró Italia", zona: "Cerro de las Rosas", jornada: "Full Time", turno: "Turno Noche", tiempo: "Hace 2 días", contacto_wa: WHATSAPP_JOBBERS_DEFAULT }
        ];
        renderizarOfertas(vacantesGastronomia);
    }
}

/* ==========================================================================
   4. SECCIÓN TALENTO DESTACADO Y COMUNIDAD
   ========================================================================== */
function cargarTalentoDestacado() {
    talentoDestacado = [
        { iniciales: "LR", nombre: "Lucas R.", puesto: "Cocinero", rating: 5, reviews: 24, experiencia: "5 años de experiencia", disponibilidad: "Inmediata", zona: "Nueva Córdoba" },
        { iniciales: "MF", nombre: "María F.", puesto: "Barista", rating: 5, reviews: 18, experiencia: "3 años de experiencia", disponibilidad: "Mañana", zona: "Güemes" },
        { iniciales: "SM", nombre: "Santiago M.", puesto: "Mozo", rating: 5, reviews: 31, experiencia: "4 años de experiencia", disponibilidad: "Inmediata", zona: "Centro" }
    ];

    renderizarTalentoDestacado();
    renderizarBannerComunidad();
}

function renderizarTalentoDestacado() {
    const contenedor = document.getElementById('grid-talento-destacado');
    if (!contenedor) return;

    contenedor.innerHTML = talentoDestacado.map(t => `
        <article class="talento-card" style="background: #121824; border: 1px solid #2d3748; border-radius: 12px; padding: 1.5rem; text-align: center; color: #fff; display: flex; flex-direction: column; align-items: center; gap: 8px;">
            <div style="position: relative; width: 64px; height: 64px; background: #2a3447; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.2rem; color: #e2e8f0;">
                ${escapeHTML(t.iniciales)}
                <span style="position: absolute; bottom: 2px; right: 2px; width: 12px; height: 12px; background: #22c55e; border: 2px solid #121824; border-radius: 50%;"></span>
            </div>
            
            <h3 style="font-size: 1.15rem; font-weight: 700; margin: 4px 0 0 0; color: #fff;">${escapeHTML(t.nombre)}</h3>
            <p style="color: #f59e0b; font-weight: 600; margin: 0; font-size: 0.95rem;">${escapeHTML(t.puesto)}</p>
            
            <div style="color: #f59e0b; font-size: 0.85rem; margin: 2px 0;">
                ★ ★ ★ ★ ★ <span style="color: #94a3b8;">(${t.reviews})</span>
            </div>

            <p style="font-size: 0.85rem; color: #94a3b8; margin: 0;">${escapeHTML(t.experiencia)}</p>
            <p style="font-size: 0.85rem; color: #94a3b8; margin: 0 0 8px 0;">Disponibilidad: ${escapeHTML(t.disponibilidad)}</p>
            <p style="font-size: 0.85rem; color: #cbd5e1; margin: 0 0 12px 0;">📍 ${escapeHTML(t.zona)}</p>

            <button type="button" 
                    onclick="solicitarContactoTalento('${escapeHTML(t.nombre)}', '${escapeHTML(t.puesto)}')" 
                    style="width: 100%; background: #f59e0b; color: #000; font-weight: 800; border: none; padding: 10px 14px; border-radius: 8px; cursor: pointer; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                🔒 VER CONTACTO / CV
            </button>
        </article>
    `).join('');
}

function renderizarBannerComunidad() {
    const contenedor = document.getElementById('banner-comunidad-jobbers');
    if (!contenedor) return;

    contenedor.innerHTML = `
        <div style="background: #121824; border: 1px solid #2d3748; border-radius: 12px; padding: 1.75rem; color: #fff; max-width: 500px; margin: 1.5rem auto; text-align: left;">
            <h3 style="font-size: 1.3rem; font-weight: 800; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 0.5px; color: #fff;">
                FORMÁ PARTE DE LA COMUNIDAD JOBBERS
            </h3>
            <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.25rem;">
                Aparecé en nuestra lista de talentos destacados o accedé a contenido exclusivo.
            </p>
            <button type="button" 
                    onclick="unirseAComunidad()" 
                    style="width: 100%; background: #f59e0b; color: #000; font-weight: 800; border: none; padding: 12px; border-radius: 8px; cursor: pointer; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 0.5px;">
                DESTACÁ TU PERFIL
            </button>
        </div>
    `;
}

function solicitarContactoTalento(nombre, puesto) {
    const mensaje = `¡Hola Jobbers! 👋 Quisiera solicitar el contacto/CV del perfil destacado: *${nombre}* (${puesto}).`;
    window.open(`https://wa.me/${WHATSAPP_JOBBERS_DEFAULT}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer');
}

function unirseAComunidad() {
    const mensaje = `¡Hola Jobbers! 👋 Quisiera formar parte de la Comunidad Jobbers para destacar mi perfil profesional.`;
    window.open(`https://wa.me/${WHATSAPP_JOBBERS_DEFAULT}?text=${encodeURIComponent(mensaje)}`, '_blank', 'noopener,noreferrer');
}

/* ==========================================================================
   5. RENDERIZADO Y BÚSQUEDA DE OFERTAS
   ========================================================================== */
function crearCardVacante(item) {
    const puesto = item.puesto || item.titulo || "Puesto Gastronómico";
    const empresa = item.empresa || "Establecimiento Gastronómico";
    const contacto = limpiarNumeroWA(item.contacto_wa) || WHATSAPP_JOBBERS_DEFAULT;

    return `
        <article class="job-card" style="background: #121824; border: 1px solid #2d3748; border-radius: 10px; padding: 1.25rem; margin-bottom: 1rem; color: #fff;">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom: 8px;">
                <div>
                    <h3 style="font-size:1.1rem; font-weight:700; color:#f59e0b; margin:0 0 4px 0;">${escapeHTML(empresa)}</h3>
                    <p style="font-size:0.95rem; color:#e2e8f0; font-weight:600; margin:0;">${escapeHTML(puesto)}</p>
                </div>
                ${item.urgente ? '<span style="background:#ef4444; color:#fff; font-size:0.65rem; font-weight:bold; padding:4px 8px; border-radius:12px; text-transform:uppercase;">⚡ URGENTE</span>' : ''}
            </div>

            <div style="display:flex; gap:14px; flex-wrap:wrap; margin:12px 0; font-size:0.85rem; color:#94a3b8;">
                <span>📍 ${escapeHTML(item.zona || item.ubicacion || 'Córdoba')}</span>
                <span>💼 ${escapeHTML(item.jornada || 'A convenir')}</span>
                <span>⏰ ${escapeHTML(item.turno || 'A convenir')}</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #1e293b; padding-top:12px; margin-top:10px;">
                <span style="font-size:0.8rem; color:#64748b;">${escapeHTML(item.tiempo || 'Publicado recientemente')}</span>
                <button type="button" 
                        class="btn-postularme" 
                        data-puesto="${escapeHTML(puesto)}" 
                        data-empresa="${escapeHTML(empresa)}" 
                        data-contacto="${contacto}"
                        style="background: #f59e0b; color: #000; font-weight: 800; border: none; padding: 8px 24px; border-radius: 6px; cursor: pointer; text-transform: UPPERCASE; font-size: 0.85rem;">
                    POSTULARME
                </button>
            </div>
        </article>
    `;
}

function renderizarOfertas(lista) {
    const contenedor = document.getElementById('lista-vacantes') || document.querySelector('.vacantes-list');
    if (!contenedor) return;

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align:center; padding: 3rem 1rem; color: #94a3b8;">
                <p style="font-size:2rem; margin-bottom:10px;">🔎</p>
                <p>No encontramos búsquedas que coincidan con tu criterio.</p>
                <button type="button" onclick="filtrarPorCategoria('')" style="background:#f59e0b; color:#000; font-weight:bold; border:none; margin-top:12px; padding:8px 16px; border-radius:6px; cursor:pointer;">
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
        const puesto = (v.puesto || v.titulo || "").toLowerCase();
        const empresa = (v.empresa || "").toLowerCase();
        const zona = (v.zona || v.ubicacion || "").toLowerCase();
        const categoria = (v.categoria || "").toLowerCase();

        return puesto.includes(termino) || empresa.includes(termino) || zona.includes(termino) || categoria.includes(termino);
    });

    renderizarOfertas(resultado);
}

function filtrarPorCategoria(categoria) {
    const input = document.getElementById('input-busqueda') || document.getElementById('job-search-input');
    if (input) input.value = categoria;

    if (!categoria) {
        renderizarOfertas(vacantesGastronomia);
        return;
    }

    const catBuscada = categoria.toLowerCase();
    const resultado = vacantesGastronomia.filter(v => {
        const puesto = (v.puesto || v.titulo || "").toLowerCase();
        const cat = (v.categoria || "").toLowerCase();
        return cat.includes(catBuscada) || puesto.includes(catBuscada);
    });

    renderizarOfertas(resultado);
    document.getElementById('vacantes')?.scrollIntoView({ behavior: 'smooth' });
}

/* ==========================================================================
   6. ENVÍO DE FORMULARIO EXPRESS A WHATSAPP
   ========================================================================== */
function enviarAWhatsApp(event) {
    if (event) event.preventDefault();

    const empresa = document.getElementById('nombre-empresa')?.value || "";
    const telefono = document.getElementById('telefono-contacto')?.value || "";
    const puesto = document.getElementById('puesto-requerido')?.value || "";
    const zona = document.getElementById('zona-local')?.value || "";
    const turno = document.getElementById('turno-puesto')?.value || "";
    const jornada = document.getElementById('jornada-puesto')?.value || "";

    const mensaje = `¡Hola Jobbers! 👋 Necesito contratar personal urgente:\n\n` +
                    `🏢 *Empresa/Local:* ${empresa}\n` +
                    `📌 *Puesto:* ${puesto}\n` +
                    `📍 *Zona:* ${zona}\n` +
                    `⏰ *Turno:* ${turno}\n` +
                    `💼 *Jornada:* ${jornada}\n` +
                    `📱 *Contacto Directo:* ${telefono}\n\n` +
                    `Quedo a la espera de la publicación. ¡Muchas gracias!`;

    const urlWA = `https://wa.me/${WHATSAPP_JOBBERS_DEFAULT}?text=${encodeURIComponent(mensaje)}`;

    mostrarToast("Redirigiendo a WhatsApp...", "success");

    window.open(urlWA, '_blank', 'noopener,noreferrer');
    document.getElementById('form-publicar-express')?.reset();
}

/* ==========================================================================
   7. MODAL DE POSTULACIÓN DE CANDIDATOS (CON FOCUS TRAP)
   ========================================================================== */
function asegurarEstructuraModal() {
    let modal = document.getElementById('modal-jobbers');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-jobbers';
        modal.className = 'jobbers-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'modal-title-postulacion');
        
        modal.style.cssText = `
            display: none; position: fixed; inset: 0; z-index: 9999;
            background: rgba(0, 0, 0, 0.75); backdrop-filter: blur(4px);
            align-items: center; justify-content: center; padding: 1rem;
        `;
        modal.innerHTML = `
            <div class="jobbers-modal-card" tabindex="-1" style="background: #121824; border: 1px solid #2d3748; width: 100%; max-width: 480px; border-radius: 12px; padding: 1.5rem; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.5); color: #fff;">
                <button type="button" onclick="cerrarModal()" style="position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #94a3b8;" aria-label="Cerrar modal">&times;</button>
                <div id="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModal();
        });

        // Focus Trap dentro del modal
        modal.addEventListener('keydown', (e) => {
            if (e.key !== 'Tab') return;

            const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusables.length === 0) return;

            const firstElement = focusables[0];
            const lastElement = focusables[focusables.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        });
    }
}

function abrirModalPostulacion(puesto, empresa, contactoWA) {
    elementoPrevioFoco = document.activeElement;
    asegurarEstructuraModal();
    const body = document.getElementById('modal-body');
    if (!body) return;

    const numLimpio = limpiarNumeroWA(contactoWA) || WHATSAPP_JOBBERS_DEFAULT;

    body.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <h2 id="modal-title-postulacion" style="font-size:1.25rem; font-weight:800; color:#fff; margin:0 0 4px 0;">POSTULARME</h2>
            <p style="color:#f59e0b; font-size:0.95rem; font-weight:700; margin:0;">${escapeHTML(puesto)} — ${escapeHTML(empresa)}</p>
        </div>

        <div style="background: rgba(239, 68, 68, 0.1); border-left: 4px solid #ef4444; padding: 10px 12px; border-radius: 4px; margin-bottom: 1rem;">
            <p style="font-size: 0.85rem; color: #fca5a5; margin: 0; line-height: 1.4;">
                📎 <strong>Recordatorio:</strong> Al abrirse WhatsApp, <u>adjuntá tu CV (PDF)</u> en el chat.
            </p>
        </div>

        <form id="form-postulacion-modal" style="display:flex; flex-direction:column; gap:12px;">
            <div class="form-group">
                <input type="text" id="post-nombre" placeholder="Nombre y Apellido" required style="width:100%; padding:10px; background:#1e293b; border:1px solid #334155; border-radius:6px; color:#fff; box-sizing:border-box;">
            </div>
            <div class="form-group">
                <input type="tel" id="post-telefono" placeholder="Tu número de WhatsApp (ej: 3511234567)" required style="width:100%; padding:10px; background:#1e293b; border:1px solid #334155; border-radius:6px; color:#fff; box-sizing:border-box;">
            </div>
            <button type="submit" style="width:100%; padding:12px; background:#f59e0b; color:#000; border:none; font-weight:bold; border-radius:6px; cursor:pointer; text-transform:uppercase; margin-top:4px;">
                <i class="fab fa-whatsapp"></i> CONTACTAR AL EMPLEADOR
            </button>
        </form>
    `;

    const formModal = document.getElementById('form-postulacion-modal');
    if (formModal) {
        formModal.addEventListener('submit', (e) => {
            e.preventDefault();
            procesarPostulacion(e, puesto, empresa, numLimpio);
        });
    }

    const modal = document.getElementById('modal-jobbers');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
        document.getElementById('post-nombre')?.focus();
    }, 50);
}

function procesarPostulacion(e, puesto, empresa, contactoWA) {
    const nombre = document.getElementById('post-nombre')?.value || "Candidato";
    const telefono = document.getElementById('post-telefono')?.value || "";

    const mensaje = `¡Hola! 👋 Vi la propuesta para el puesto de *${puesto}* en *${empresa}* a través de Jobbers.\n\n` +
                    `Me interesa postularme:\n` +
                    `👤 *Nombre:* ${nombre}\n` +
                    `📱 *Contacto:* ${telefono}\n\n` +
                    `📎 Te adjunto mi CV en formato PDF a continuación. ¡Quedo a disposición!`;

    const urlWA = `https://wa.me/${contactoWA}?text=${encodeURIComponent(mensaje)}`;

    cerrarModal();
    mostrarToast("Abriendo WhatsApp del empleador...", "success");
    window.open(urlWA, '_blank', 'noopener,noreferrer');
}

function cerrarModal() {
    const modal = document.getElementById('modal-jobbers');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
        if (elementoPrevioFoco) {
            elementoPrevioFoco.focus();
            elementoPrevioFoco = null;
        }
    }
}

/* ==========================================================================
   8. MENÚS Y DROPDOWNS
   ========================================================================== */
function toggleDropdown(event) {
    if (event) event.stopPropagation();
    const btn = document.getElementById('dropdown-recursos');
    const menu = document.getElementById('menu-recursos');

    if (menu) {
        const isOpen = menu.classList.toggle('show');
        if (btn) btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
}

function cerrarDropdown() {
    const btn = document.getElementById('dropdown-recursos');
    const menu = document.getElementById('menu-recursos');

    if (menu && menu.classList.contains('show')) {
        menu.classList.remove('show');
        if (btn) btn.setAttribute('aria-expanded', 'false');
    }
}

/* ==========================================================================
   9. TOASTS Y NOTIFICACIONES
   ========================================================================== */
function mostrarToast(mensaje, tipo = "success") {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = "position: fixed; bottom: 20px; right: 20px; z-index: 10000;";
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.style.cssText = `
        background: ${tipo === 'success' ? '#22c55e' : '#ef4444'};
        color: white; padding: 12px 20px; border-radius: 8px; margin-top: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3); font-weight: 600; font-size: 0.9rem;
        transition: opacity 0.3s ease; opacity: 1;
    `;
    toast.innerText = mensaje;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);

   document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos
    const modalPerfil = document.getElementById('modal-cambiar-perfil');
    const stepSelect = document.getElementById('rol-step-select');
    const stepConfirm = document.getElementById('rol-step-confirm');
    const labelConfirmar = document.getElementById('rol-nombre-confirmar');
    
    const btnCerrarModal = document.getElementById('btn-cerrar-modal');
    const btnVolverRol = document.getElementById('btn-volver-rol');
    const btnConfirmarRol = document.getElementById('btn-confirmar-rol');
    const btnsCambiarPerfil = document.querySelectorAll('.btn-cambiar-rol');
    const btnsOpcionRol = document.querySelectorAll('.btn-rol');

    // Variable temporal para el rol seleccionado
    let rolSeleccionado = {
        key: '',
        nombre: ''
    };

    // 1. Verificar si hay un rol guardado apenas carga la página
    const rolGuardado = localStorage.getItem('jobbers_user_role');

    if (!rolGuardado) {
        abrirModalPerfil();
    } else {
        aplicarRol(rolGuardado);
    }

    // 2. Abrir / Cerrar Modal
    function abrirModalPerfil() {
        resetearModal();
        if (modalPerfil) modalPerfil.style.display = 'flex';
    }

    function cerrarModalPerfil() {
        if (modalPerfil) modalPerfil.style.display = 'none';
    }

    function resetearModal() {
        if (stepSelect) stepSelect.style.display = 'block';
        if (stepConfirm) stepConfirm.style.display = 'none';
        rolSeleccionado = { key: '', nombre: '' };
    }

    // 3. Al hacer clic en un perfil (Preselección)
    btnsOpcionRol.forEach(btn => {
        btn.addEventListener('click', () => {
            const rolKey = btn.getAttribute('data-rol');
            const rolNombre = btn.getAttribute('data-nombre') || btn.querySelector('.rol-title')?.textContent;

            rolSeleccionado.key = rolKey;
            rolSeleccionado.nombre = rolNombre;

            if (labelConfirmar) labelConfirmar.textContent = rolNombre;

            // Cambiar a pantalla de confirmación
            stepSelect.style.display = 'none';
            stepConfirm.style.display = 'block';
        });
    });

    // 4. Volver a la selección de perfil
    if (btnVolverRol) {
        btnVolverRol.addEventListener('click', resetearModal);
    }

    // 5. Confirmar selección e ingresar
    if (btnConfirmarRol) {
        btnConfirmarRol.addEventListener('click', () => {
            if (!rolSeleccionado.key) return;

            // Guardar en Storage y aplicar a la app
            localStorage.setItem('jobbers_user_role', rolSeleccionado.key);
            aplicarRol(rolSeleccionado.key);

            cerrarModalPerfil();
        });
    }

    // 6. Aplicar cambios según el rol en el <body> y labels
    function aplicarRol(rol) {
        document.body.classList.remove('role-postulante', 'role-empresa');
        
        const labelModo = document.getElementById('label-modo-actual');
        
        if (rol === 'empresa') {
            document.body.classList.add('role-empresa');
            if (labelModo) labelModo.textContent = 'Modo: Empresa';
        } else {
            document.body.classList.add('role-postulante');
            if (labelModo) labelModo.textContent = 'Modo: Postulante';
        }
    }

    // Eventos de botones
    btnsCambiarPerfil.forEach(btn => btn.addEventListener('click', abrirModalPerfil));
    if (btnCerrarModal) btnCerrarModal.addEventListener('click', cerrarModalPerfil);
});
}

/* ==========================================================================
   10. BINDING GLOBAL
   ========================================================================== */
window.enviarAWhatsApp = enviarAWhatsApp;
window.abrirModalPostulacion = abrirModalPostulacion;
window.cerrarModal = cerrarModal;
window.abrirModalPerfil = abrirModalPerfil;
window.cerrarModalPerfil = cerrarModalPerfil;
window.procesarPostulacion = procesarPostulacion;
window.filtrarVacantes = filtrarVacantes;
window.filtrarPorCategoria = filtrarPorCategoria;
window.toggleDropdown = toggleDropdown;
window.cerrarDropdown = cerrarDropdown;
window.solicitarContactoTalento = solicitarContactoTalento;
window.unirseAComunidad = unirseAComunidad;
