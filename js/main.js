/* ==========================================================================
   JOBBERS - SISTEMA INTEGRAL DE INTERACCIÓN Y OFERTAS (POSTULACIÓN DIRECTA)
   ========================================================================== */

// HELPER: Sanitización rápida contra XSS
const escapeHTML = (str) => {
    if (!str && str !== 0) return "";
    return String(str).replace(/[&<>"']/g, (match) => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[match];
    });
};

// HELPER: Debounce para limitar frecuencia de filtrado en tiempo real
function debounce(fn, delay = 300) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
}

// NÚMERO POR DEFECTO EN CASO DE QUE LA OFERTA NO TENGA UNO ASIGNADO (JOBBERS SOPORTE)
const WHATSAPP_JOBBERS_DEFAULT = "5493513080197";

// Variable global para almacenar las vacantes cargadas desde el JSON
let vacantesGastronomia = [];

// Variable global para restaurar el foco accesible al cerrar modales
let elementoPrevioFoco = null;

// 1. CARGA DE DATOS DESDE EL ARCHIVO JSON CON FALLBACK DE RUTA
async function cargarVacantesDesdeJSON() {
    const rutasPosibles = ['base_de_datos.json', './base_de_datos.json', '../base_de_datos.json', 'data/base_de_datos.json'];
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
            // Intenta la siguiente ruta si esta falla
        }
    }

    if (!exito) {
        console.error("Error: No se pudo localizar o parsear el archivo base_de_datos.json");
        mostrarToast("No se pudieron cargar las ofertas de empleo", "error");
        
        const contenedor = document.getElementById('lista-vacantes') || document.getElementById('vacantes-container');
        if (contenedor) {
            contenedor.innerHTML = `
                <div style="text-align:center; grid-column: 1 / -1; padding:3rem 1rem; color:var(--text-muted, #666);">
                    <p style="font-size:2rem; margin-bottom:10px;">⚠️</p>
                    <p>Error al cargar las ofertas. Verificá la ubicación de <strong>base_de_datos.json</strong> o ejecutá la app mediante un servidor local (Live Server).</p>
                </div>
            `;
        }
    }
}

// 2. CARGA E INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    asegurarEstructuraModal();
    cargarVacantesDesdeJSON();

    // Event listener para desplegar/ocultar tarjeta express en Hero
    const btnToggleExpress = document.getElementById('btn-necesito-personal');
    const cardExpress = document.querySelector('.hero-card-express');

    if (btnToggleExpress && cardExpress) {
        btnToggleExpress.addEventListener('click', (e) => {
            e.preventDefault();
            const isExpanded = cardExpress.classList.toggle('is-visible');

            if (isExpanded) {
                cardExpress.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        });
    }

    // Event listener para el buscador en tiempo real con Debounce (300ms)
    const inputBusqueda = document.getElementById('input-busqueda') || document.getElementById('search-filter');
    if (inputBusqueda) {
        inputBusqueda.addEventListener('input', debounce(filtrarVacantes, 300));
    }

    // Event listener para el filtro por zona
    const selectZona = document.getElementById('select-zona');
    if (selectZona) {
        selectZona.addEventListener('change', (e) => {
            filtrarPorCategoria(e.target.value);
        });
    }

    // Formulario para Empleadores ("Publicar Búsqueda")
    const formPublicar = document.getElementById('form-publicar') || document.getElementById('express-form');
    if (formPublicar) {
        formPublicar.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const rawLocal = document.getElementById('nombre-empresa')?.value || document.getElementById('nombre-local')?.value || "Establecimiento";
            const rawPuesto = document.getElementById('puesto-requerido')?.value || document.getElementById('puesto')?.value || "Personal Gastronómico";
            const rawTelefono = document.getElementById('telefono-contacto')?.value || "Sin teléfono";
            const rawDetalles = document.getElementById('detalles-busqueda')?.value || "Sin detalles adicionales";

            // Sanitización previa a armar la cadena
            const local = escapeHTML(rawLocal);
            const puesto = escapeHTML(rawPuesto);
            const telefono = escapeHTML(rawTelefono);
            const detalles = escapeHTML(rawDetalles);

            const texto = `¡Hola Jobbers! 👋 Necesito contratar personal urgente:\n\n` +
                          `🏢 *Local/Empresa:* ${local}\n` +
                          `📌 *Puesto:* ${puesto}\n` +
                          `📱 *Contacto:* ${telefono}\n` +
                          `📝 *Detalles:* ${detalles}\n\n` +
                          `Aguardando respuesta.`;

            const urlWA = `https://wa.me/${WHATSAPP_JOBBERS_DEFAULT}?text=${encodeURIComponent(texto)}`;
            
            mostrarToast("Redirigiendo a WhatsApp...", "success");
            
            setTimeout(() => {
                window.open(urlWA, '_blank');
            }, 500);

            formPublicar.reset();
        });
    }

    // Tecla Escape para cerrar modales y dropdowns
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModal();
            cerrarDropdown();
        }
    });
});

// 3. DELEGACIÓN GLOBAL DE CLICS Y NAVEGACIÓN POR TECLADO ACCESIBLE
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        cerrarDropdown();
    }
});

document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('role') === 'button') {
        e.preventDefault();
        e.target.click();
    }
});

// 4. RENDERIZADO DE OFERTAS
function crearCardVacante(item) {
    const nombrePuesto = item.puesto || item.titulo || "Puesto Gastronómico";
    const nombreEmpresa = item.empresa || "Empresa Gastronómica";
    const numeroEmpleador = item.contacto_wa || WHATSAPP_JOBBERS_DEFAULT;

    const attrPuesto = escapeHTML(nombrePuesto).replace(/'/g, "\\'");
    const attrEmpresa = escapeHTML(nombreEmpresa).replace(/'/g, "\\'");
    const attrNumero = escapeHTML(numeroEmpleador).replace(/'/g, "\\'");

    return `
        <article class="job-offer-card">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                <div>
                    <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-main, #222); margin-bottom:4px;">${escapeHTML(nombrePuesto)}</h3>
                    <p style="font-size:0.85rem; color:var(--primary, #e67e22); font-weight:700; margin:0;">${escapeHTML(nombreEmpresa)}</p>
                </div>
                ${item.urgente ? '<span style="background:#EF4444; color:#fff; font-size:0.65rem; font-weight:bold; padding:3px 8px; border-radius:12px;">⚡ URGENTE</span>' : ''}
            </div>

            <div style="display:flex; gap:12px; flex-wrap:wrap; margin:12px 0; font-size:0.75rem; color:var(--text-muted, #666);">
                <span>📍 ${escapeHTML(item.zona || item.ubicacion || 'Córdoba')}</span>
                <span>💼 ${escapeHTML(item.jornada || item.tipo_jornada || 'A convenir')}</span>
                <span>⏰ ${escapeHTML(item.turno || 'A convenir')}</span>
                <span style="color:#2ECC71; font-weight:bold;">${escapeHTML(item.salario || 'A convenir')}</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color, #eee); padding-top:10px; margin-top:8px;">
                <span style="font-size:0.75rem; color:var(--text-muted, #888);">${escapeHTML(item.tiempo || '')}</span>
                <button type="button" onclick="abrirModalPostulacion('${attrPuesto}', '${attrEmpresa}', '${attrNumero}')" class="btn btn-primary" style="padding:6px 14px; font-size:0.8rem;">
                    Postularme
                </button>
            </div>
        </article>
    `;
}

function renderizarOfertas(lista) {
    const contenedor = document.getElementById('lista-vacantes') || document.getElementById('vacantes-container');
    if (!contenedor) return;

    if (!lista || lista.length === 0) {
        contenedor.innerHTML = `
            <div style="text-align:center; grid-column: 1 / -1; padding:3rem 1rem; color:var(--text-muted, #666);">
                <p style="font-size:2rem; margin-bottom:10px;">📂</p>
                <p>No se encontraron búsquedas activas para este criterio.</p>
                <button type="button" onclick="filtrarPorCategoria('')" class="btn btn-primary" style="margin-top:12px;">
                    Mostrar todas las ofertas
                </button>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = lista.map(crearCardVacante).join('');
}

// 5. BUSCADOR Y FILTROS EN TIEMPO REAL
function filtrarVacantes() {
    const input = document.getElementById('input-busqueda') || document.getElementById('search-filter');
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
    const input = document.getElementById('input-busqueda') || document.getElementById('search-filter');
    if (input) input.value = categoria;

    if (!categoria) {
        renderizarOfertas(vacantesGastronomia);
        return;
    }

    const resultado = vacantesGastronomia.filter(v => {
        const puesto = (v.puesto || v.titulo || "").toLowerCase();
        const cat = (v.categoria || "").toLowerCase();
        const zona = (v.zona || v.ubicacion || "").toLowerCase();
        const catBuscada = categoria.toLowerCase();

        return cat.includes(catBuscada) || puesto.includes(catBuscada) || zona.includes(catBuscada);
    });

    renderizarOfertas(resultado);
    const contenedor = document.getElementById('vacantes') || document.getElementById('lista-vacantes');
    contenedor?.scrollIntoView({ behavior: 'smooth' });
}

// 6. SISTEMA DE MODALES Y RECURSOS
function asegurarEstructuraModal() {
    let modal = document.getElementById('modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal';
        modal.className = 'jobbers-modal';
        modal.innerHTML = `
            <div class="jobbers-modal-card">
                <button type="button" class="jobbers-close-btn" onclick="cerrarModal()" aria-label="Cerrar modal">&times;</button>
                <div id="modal-body"></div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    modal.addEventListener('click', (e) => {
        if (e.target === modal) cerrarModal();
    });
}

function abrirModalPostulacion(puesto, empresa, numeroEmpleador) {
    elementoPrevioFoco = document.activeElement;
    asegurarEstructuraModal();
    const body = document.getElementById('modal-body');
    if (!body) return;

    body.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <h2 style="font-size:1.2rem; font-weight:900; color:var(--text-main, #222); margin-bottom:2px;">POSTULARME</h2>
            <p style="color:var(--primary, #e67e22); font-size:0.85rem; font-weight:700; margin:0;">${puesto} — ${empresa}</p>
        </div>

        <div style="background: rgba(239, 68, 68, 0.1); border-left: 3px solid #EF4444; padding: 10px; border-radius: 4px; margin-bottom: 1rem;">
            <p style="font-size: 0.78rem; color: var(--text-main, #222); margin: 0;">
                📎 <strong>Importante:</strong> Al abrirse WhatsApp, recordá <u>adjuntar tu Currículum Vitae (PDF)</u> junto al mensaje.
            </p>
        </div>

        <form onsubmit="procesarPostulacion(event, '${puesto.replace(/'/g, "\\'")}', '${empresa.replace(/'/g, "\\'")}', '${numeroEmpleador}')" class="express-form">
            <div class="form-group" style="margin-bottom:0.8rem;">
                <input type="text" id="post-nombre" placeholder="Nombre y Apellido" required style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
            </div>
            <div class="form-group" style="margin-bottom:1.2rem;">
                <input type="tel" id="post-telefono" placeholder="Tu WhatsApp de contacto" pattern="[0-9]{10,13}" required style="width:100%; padding:8px; border:1px solid #ccc; border-radius:4px;">
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%;">
                CONTACTAR AL EMPLEADOR
            </button>
        </form>
    `;

    const modal = document.getElementById('modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Foco automático en el primer input para mejor UX/Accesibilidad
    setTimeout(() => {
        document.getElementById('post-nombre')?.focus();
    }, 50);
}

function procesarPostulacion(e, puesto, empresa, numeroEmpleador) {
    e.preventDefault();
    e.stopPropagation();

    const nombre = document.getElementById('post-nombre')?.value || "Candidato";
    const telefonoContacto = document.getElementById('post-telefono')?.value || "";

    const texto = `¡Hola! 👋 Vi la publicación de la vacante para el puesto de *${puesto}* en *${empresa}* a través de Jobbers.\n\n` +
                  `Me interesa postularme:\n` +
                  `👤 *Nombre:* ${nombre}\n` +
                  `📱 *Contacto:* ${telefonoContacto}\n\n` +
                  `📎 Te adjunto mi CV en formato PDF a continuación para que puedas revisarlo. ¡Quedo a disposición!`;

    const urlWA = `https://wa.me/${numeroEmpleador}?text=${encodeURIComponent(texto)}`;

    cerrarModal();
    mostrarToast(`Abriendo WhatsApp de ${empresa}...`, "success");
    
    setTimeout(() => {
        window.open(urlWA, '_blank');
    }, 500);
}

// Modal informativo para la sección Recursos del Nav
function abrirModalRecursos(tipo) {
    elementoPrevioFoco = document.activeElement;
    asegurarEstructuraModal();
    const body = document.getElementById('modal-body');
    if (!body) return;

    let titulo = "";
    let contenido = "";

    if (tipo === 'soporte') {
        titulo = "Soporte Técnico";
        contenido = `
            <p style="font-size:0.9rem; color:var(--text-muted, #666); margin-bottom:1rem;">¿Tuviste algún inconveniente publicando o postulándote? Escribinos directamente por WhatsApp y nuestro equipo te ayuda al instante.</p>
            <a href="https://wa.me/${WHATSAPP_JOBBERS_DEFAULT}?text=${encodeURIComponent('Hola Jobbers, necesito soporte técnico con la plataforma.')}" class="btn btn-primary" target="_blank" style="display:block; text-align:center; text-decoration:none;">
                HABLAR CON SOPORTE
            </a>
        `;
    } else if (tipo === 'guias') {
        titulo = "Guías de Contratación";
        contenido = `
            <p style="font-size:0.9rem; color:var(--text-muted, #666); margin-bottom:1rem;">Descargá de forma gratuita nuestras recomendaciones para armar perfiles gastronómicos competitivos y realizar entrevistas efectivas.</p>
            <button type="button" class="btn btn-primary" onclick="mostrarToast('Descarga de guía iniciada...', 'success'); cerrarModal();" style="width:100%;">
                DESCARGAR GUÍA (PDF)
            </button>
        `;
    } else if (tipo === 'plantillas') {
        titulo = "Plantillas de CV Gastronómico";
        contenido = `
            <p style="font-size:0.9rem; color:var(--text-muted, #666); margin-bottom:1rem;">Optimizá tu resumen curricular con nuestros formatos adaptados a cocina, barra y servicio de salón.</p>
            <button type="button" class="btn btn-primary" onclick="mostrarToast('Descargando plantilla de CV...', 'success'); cerrarModal();" style="width:100%;">
                DESCARGAR PLANTILLA
            </button>
        `;
    }

    body.innerHTML = `
        <div style="margin-bottom: 1rem; text-align: center;">
            <h2 style="font-size:1.2rem; font-weight:900; color:var(--text-main, #222); margin-bottom:4px;">${titulo}</h2>
        </div>
        ${contenido}
    `;

    const modal = document.getElementById('modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        if (elementoPrevioFoco) {
            elementoPrevioFoco.focus();
            elementoPrevioFoco = null;
        }
    }
}

function toggleDropdown(event) {
    if (event) event.stopPropagation();
    const btn = document.getElementById('dropdown-recursos');
    const menu = btn?.nextElementSibling;
    
    if (menu) {
        const isOpen = menu.classList.toggle('show');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }
}

function cerrarDropdown() {
    const btn = document.getElementById('dropdown-recursos');
    const menu = btn?.nextElementSibling;
    
    if (menu && menu.classList.contains('show')) {
        menu.classList.remove('show');
        btn?.setAttribute('aria-expanded', 'false');
    }
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
    toast.style.cssText = `
        background: ${tipo === 'success' ? '#2ECC71' : '#EF4444'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        margin-top: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        font-size: 0.9rem;
        font-weight: 600;
        transition: opacity 0.3s ease;
    `;
    toast.innerHTML = `<span>${escapeHTML(mensaje)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// 8. BINDING GLOBAL WINDOW
window.abrirModalPostulacion = abrirModalPostulacion;
window.abrirModalRecursos = abrirModalRecursos;
window.cerrarModal = cerrarModal;
window.procesarPostulacion = procesarPostulacion;
window.filtrarVacantes = filtrarVacantes;
window.filtrarPorCategoria = filtrarPorCategoria;
window.toggleDropdown = toggleDropdown;
window.cerrarDropdown = cerrarDropdown;
