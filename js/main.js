/* ==========================================================================
   JOBBERS ARGENTINA - LÓGICA INTERACTIVA Y CONEXIÓN A WHATSAPP (OPTIMIZADO)
   ========================================================================== */

const WHATSAPP_JOBBERS_DEFAULT = "5493513080197";

let vacantesGastronomia = [];
let elementoPrevioFoco = null;

// Helpers sanitización y formateo
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

    // Event Delegation para botones de postulación (Evita inyección inline en onclick)
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

    // Bind Formulario Express
    const triggersExpress = document.querySelectorAll('.btn-trigger-express');
    const cardExpress = document.getElementById('formulario-express');

    triggersExpress.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (cardExpress) {
                cardExpress.classList.add('is-visible');
                cardExpress.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                setTimeout(() => {
                    document.getElementById('nombre-empresa')?.focus();
                }, 400);
            }
        });
    });

    // Búsqueda en tiempo real
    const inputBusqueda = document.getElementById('input-busqueda');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', debounce(filtrarVacantes, 300));
        inputBusqueda.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') filtrarVacantes();
        });
    }

    const btnSearch = document.querySelector('.btn-search');
    if (btnSearch) {
        btnSearch.addEventListener('click', filtrarVacantes);
    }

    // Tecla Escape para modales y dropdowns
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModal();
            cerrarDropdown();
        }
    });

    // Cierre de dropdowns fuera de área
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown')) {
            cerrarDropdown();
        }
    });
});

/* ==========================================================================
   2. CARGA DE DATOS (JSON)
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
            // Ignorar y probar siguiente ruta
        }
    }

    if (!exito) {
        console.warn("Jobbers: No se encontró base_de_datos.json localmente.");
        const contenedor = document.getElementById('lista-vacantes');
        if (contenedor) {
            contenedor.innerHTML = `
                <div style="text-align:center; padding: 2.5rem 1rem; color: var(--text-muted, #666);">
                    <p style="font-size: 1.8rem; margin-bottom: 8px;">📋</p>
                    <p>No se pudieron cargar las ofertas automáticas.</p>
                    <small>Asegurate de servir la web a través de un servidor HTTP/HTTPS local.</small>
                </div>
            `;
        }
    }
}

/* ==========================================================================
   3. RENDERIZADO Y FILTRADO DE VACANTES
   ========================================================================== */
function crearCardVacante(item) {
    const puesto = item.puesto || item.titulo || "Puesto Gastronómico";
    const empresa = item.empresa || "Establecimiento Gastronómico";
    const contacto = limpiarNumeroWA(item.contacto_wa) || WHATSAPP_JOBBERS_DEFAULT;

    return `
        <article class="job-card" style="background: #fff; border: 1px solid var(--border-color, #e2e8f0); border-radius: 8px; padding: 1.25rem; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; margin-bottom: 8px;">
                <div>
                    <h3 style="font-size:1.1rem; font-weight:700; color:var(--text-main, #1a202c); margin:0 0 4px 0;">${escapeHTML(puesto)}</h3>
                    <p style="font-size:0.9rem; color:var(--primary, #e67e22); font-weight:600; margin:0;">${escapeHTML(empresa)}</p>
                </div>
                ${item.urgente ? '<span style="background:#EF4444; color:#fff; font-size:0.65rem; font-weight:bold; padding:3px 8px; border-radius:12px;">⚡ URGENTE</span>' : ''}
            </div>

            <div style="display:flex; gap:12px; flex-wrap:wrap; margin:12px 0; font-size:0.8rem; color:#4a5568;">
                <span>📍 ${escapeHTML(item.zona || item.ubicacion || 'Córdoba')}</span>
                <span>💼 ${escapeHTML(item.jornada || 'A convenir')}</span>
                <span>⏰ ${escapeHTML(item.turno || 'A convenir')}</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #edf2f7; padding-top:10px; margin-top:10px;">
                <span style="font-size:0.75rem; color:#a0aec0;">${escapeHTML(item.tiempo || 'Publicado recientemente')}</span>
                <button type="button" 
                        class="btn-primary btn-postularme" 
                        data-puesto="${escapeHTML(puesto)}" 
                        data-empresa="${escapeHTML(empresa)}" 
                        data-contacto="${contacto}"
                        style="padding: 6px 16px; font-size: 0.85rem; border-radius: 4px; cursor: pointer;">
                    Postularme
                </button>
            </div>
        </article>
    `;
}

function renderizarOfertas(lista) {
    const contenedor = document.getElementById('lista-vacantes');
    if (!contenedor) return;

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align:center; padding: 3rem 1rem; color: #718096;">
                <p style="font-size:2rem; margin-bottom:10px;">🔎</p>
                <p>No encontramos búsquedas que coincidan con tu criterio.</p>
                <button type="button" onclick="filtrarPorCategoria('')" class="btn-primary" style="margin-top:12px; padding:8px 16px;">
                    Ver todas las ofertas
                </button>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = lista.map(crearCardVacante).join('');
}

function filtrarVacantes() {
    const input = document.getElementById('input-busqueda');
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
    const input = document.getElementById('input-busqueda');
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
   4. ENVÍO DE FORMULARIO EXPRESS A WHATSAPP
   ========================================================================== */
function enviarAWhatsApp(event) {
    event.preventDefault();

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

    setTimeout(() => {
        window.open(urlWA, '_blank');
    }, 400);

    document.getElementById('form-publicar-express')?.reset();
}

/* ==========================================================================
   5. MODAL DE POSTULACIÓN DE CANDIDATOS
   ========================================================================== */
function asegurarEstructuraModal() {
    let modal = document.getElementById('modal-jobbers');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-jobbers';
        modal.className = 'jobbers-modal';
        modal.style.cssText = `
            display: none; position: fixed; inset: 0; z-index: 9999;
            background: rgba(0, 0, 0, 0.65); backdrop-filter: blur(3px);
            align-items: center; justify-content: center; padding: 1rem;
        `;
        modal.innerHTML = `
            <div class="jobbers-modal-card" style="background: #fff; width: 100%; max-width: 480px; border-radius: 8px; padding: 1.5rem; position: relative; box-shadow: 0 10px 25px rgba(0,0,0,0.2);">
                <button type="button" onclick="cerrarModal()" style="position: absolute; top: 12px; right: 16px; background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #718096;" aria-label="Cerrar modal">&times;</button>
                <div id="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) cerrarModal();
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
            <h2 style="font-size:1.25rem; font-weight:800; color:#1a202c; margin:0 0 4px 0;">POSTULARME</h2>
            <p style="color:#e67e22; font-size:0.9rem; font-weight:700; margin:0;">${escapeHTML(puesto)} — ${escapeHTML(empresa)}</p>
        </div>

        <div style="background: #fff5f5; border-left: 4px solid #ef4444; padding: 10px 12px; border-radius: 4px; margin-bottom: 1rem;">
            <p style="font-size: 0.8rem; color: #c53030; margin: 0; line-height: 1.4;">
                📎 <strong>Recordatorio:</strong> Al abrirse WhatsApp, <u>adjuntá tu Currículum Vitae (PDF)</u> en el chat.
            </p>
        </div>

        <form id="form-postulacion-modal" style="display:flex; flex-direction:column; gap:10px;">
            <div class="form-group">
                <input type="text" id="post-nombre" placeholder="Nombre y Apellido" required style="width:100%; padding:10px; border:1px solid #cbd5e0; border-radius:4px; box-sizing:border-box;">
            </div>
            <div class="form-group">
                <input type="tel" id="post-telefono" placeholder="Tu número de WhatsApp (ej: 3511234567)" required style="width:100%; padding:10px; border:1px solid #cbd5e0; border-radius:4px; box-sizing:border-box;">
            </div>
            <button type="submit" class="btn-primary" style="width:100%; padding:12px; margin-top:6px; font-weight:bold; cursor:pointer;">
                <i class="fab fa-whatsapp"></i> CONTACTAR AL EMPLEADOR
            </button>
        </form>
    `;

    const formModal = document.getElementById('form-postulacion-modal');
    if (formModal) {
        formModal.addEventListener('submit', (e) => {
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
    e.preventDefault();

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

    setTimeout(() => {
        window.open(urlWA, '_blank');
    }, 400);
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
   6. NAVEGACIÓN Y MENÚS DESPLEGABLES
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
   7. TOASTS / NOTIFICACIONES FLOTANTES
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
        background: ${tipo === 'success' ? '#2ecc71' : '#e74c3c'};
        color: white; padding: 12px 20px; border-radius: 6px; margin-top: 10px;
        box-shadow: 0 4px 10px rgba(0,0,0,0.15); font-weight: 600; font-size: 0.9rem;
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
   8. BINDING GLOBAL
   ========================================================================== */
window.enviarAWhatsApp = enviarAWhatsApp;
window.abrirModalPostulacion = abrirModalPostulacion;
window.cerrarModal = cerrarModal;
window.procesarPostulacion = procesarPostulacion;
window.filtrarVacantes = filtrarVacantes;
window.filtrarPorCategoria = filtrarPorCategoria;
window.toggleDropdown = toggleDropdown;
window.cerrarDropdown = cerrarDropdown;
