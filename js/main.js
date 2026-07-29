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

// NÚMERO POR DEFECTO EN CASO DE QUE LA OFERTA NO TENGA UNO ASIGNADO (JOBBERS SOPORTE)
const WHATSAPP_JOBBERS_DEFAULT = "5493513080197";

// Variable global para almacenar las vacantes cargadas desde el JSON
let vacantesGastronomia = [];

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
        
        const contenedor = document.getElementById('vacantes-container');
        if (contenedor) {
            contenedor.innerHTML = `
                <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem; color:#EF4444; margin-bottom:10px;"></i>
                    <p>Error al cargar las ofertas. Asegúrate de verificar la ubicación de base_de_datos.json y ejecutar el proyecto con Live Server.</p>
                </div>
            `;
        }
    }
}

// 2. CARGA E INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    asegurarEstructuraModal();
    cargarVacantesDesdeJSON();

    // Formulario Express para Empleadores ("Necesito Personal YA")
    const formExpress = document.getElementById('express-form');
    if (formExpress) {
        formExpress.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const local = document.getElementById('nombre-local')?.value || "Establecimiento";
            const telefono = document.getElementById('telefono-contacto')?.value || "Sin teléfono";
            const puesto = document.getElementById('puesto')?.value || "Personal Gastronómico";
            const zona = document.getElementById('zona')?.value || "Córdoba";
            
            // Captura de Turno y Jornada
            const horarioTurno = document.getElementById('horario-turno')?.value || "A convenir";
            const tipoJornada = document.getElementById('tipo-jornada')?.value || "A convenir";

            const texto = `¡Hola Jobbers! 👋 Necesito contratar personal urgente:\n\n` +
                          `🏢 *Local/Empresa:* ${local}\n` +
                          `📱 *Contacto:* ${telefono}\n` +
                          `📌 *Puesto:* ${puesto}\n` +
                          `📍 *Zona:* ${zona}\n` +
                          `⏰ *Turno:* ${horarioTurno}\n` +
                          `💼 *Jornada:* ${tipoJornada}\n\n` +
                          `Aguardando respuesta.`;

            const urlWA = `https://wa.me/${WHATSAPP_JOBBERS_DEFAULT}?text=${encodeURIComponent(texto)}`;
            
            mostrarToast("Redirigiendo a WhatsApp...", "success");
            
            setTimeout(() => {
                window.location.href = urlWA;
            }, 500);

            formExpress.reset();
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

// Activar botones/tarjetas accesibles con Enter o Espacio
document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.getAttribute('role') === 'button') {
        e.preventDefault();
        e.target.click();
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
                <button type="button" onclick="filtrarPorCategoria('')" style="margin-top:12px; background:var(--primary); color:var(--text-dark); border:none; padding:8px 16px; border-radius:var(--radius-sm); font-weight:bold; cursor:pointer;">
                    Mostrar todas las ofertas
                </button>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = lista.map(item => {
        const nombrePuesto = item.puesto || item.titulo || "Puesto Gastronómico";
        const nombreEmpresa = item.empresa || "Empresa Gastronómica";
        const numeroEmpleador = item.contacto_wa || WHATSAPP_JOBBERS_DEFAULT;

        // Escapado especial para evitar romper los atributos de evento onclick
        const attrPuesto = escapeHTML(nombrePuesto).replace(/'/g, "\\'");
        const attrEmpresa = escapeHTML(nombreEmpresa).replace(/'/g, "\\'");
        const attrNumero = escapeHTML(numeroEmpleador).replace(/'/g, "\\'");

        return `
            <article class="job-offer-card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                    <div>
                        <h3 style="font-size:1.05rem; font-weight:800; color:var(--text-main); margin-bottom:4px;">${escapeHTML(nombrePuesto)}</h3>
                        <p style="font-size:0.85rem; color:var(--primary); font-weight:700; margin:0;">${escapeHTML(nombreEmpresa)}</p>
                    </div>
                    ${item.urgente ? '<span style="background:#EF4444; color:#fff; font-size:0.65rem; font-weight:bold; padding:3px 8px; border-radius:12px;">⚡ URGENTE</span>' : ''}
                </div>

                <div style="display:flex; gap:12px; flex-wrap:wrap; margin:12px 0; font-size:0.75rem; color:var(--text-muted);">
                    <span><i class="fa-solid fa-location-dot" style="color:var(--primary);"></i> ${escapeHTML(item.zona || item.ubicacion || 'Córdoba')}</span>
                    <span><i class="fa-solid fa-briefcase"></i> ${escapeHTML(item.jornada || item.tipo_jornada || 'A convenir')}</span>
                    <span><i class="fa-regular fa-clock"></i> ${escapeHTML(item.turno || 'A convenir')}</span>
                    <span style="color:#2ECC71; font-weight:bold;">${escapeHTML(item.salario || 'A convenir')}</span>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:10px; margin-top:8px;">
                    <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHTML(item.tiempo || '')}</span>
                    <button type="button" onclick="abrirModalPostulacion('${attrPuesto}', '${attrEmpresa}', '${attrNumero}')" class="btn-primary" style="padding:6px 14px; font-size:0.8rem;">
                        Postularme
                    </button>
                </div>
            </article>
        `;
    }).join('');
}

// 5. BUSCADOR Y FILTROS EN TIEMPO REAL
function filtrarVacantes() {
    const input = document.getElementById('search-filter');
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
    const input = document.getElementById('search-filter');
    if (input) input.value = categoria;

    if (!categoria) {
        renderizarOfertas(vacantesGastronomia);
        return;
    }

    const resultado = vacantesGastronomia.filter(v => {
        const puesto = (v.puesto || v.titulo || "").toLowerCase();
        const cat = (v.categoria || "").toLowerCase();
        const catBuscada = categoria.toLowerCase();

        return cat.includes(catBuscada) || puesto.includes(catBuscada);
    });

    renderizarOfertas(resultado);
    document.getElementById('vacantes-container')?.scrollIntoView({ behavior: 'smooth' });
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

function abrirModalPostulacion(puesto, empresa, numeroEmpleador) {
    asegurarEstructuraModal();
    const body = document.getElementById('modal-body');
    if (!body) return;

    body.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <h2 style="font-size:1.2rem; font-weight:900; color:var(--text-main); margin-bottom:2px;">POSTULARME</h2>
            <p style="color:var(--primary); font-size:0.85rem; font-weight:700; margin:0;">${puesto} — ${empresa}</p>
        </div>

        <div style="background: rgba(239, 68, 68, 0.1); border-left: 3px solid #EF4444; padding: 10px; border-radius: 4px; margin-bottom: 1rem;">
            <p style="font-size: 0.78rem; color: var(--text-main); margin: 0;">
                <i class="fa-solid fa-paperclip" style="color:#EF4444; margin-right: 4px;"></i>
                <strong>Importante:</strong> Al abrirse WhatsApp, recordá <u>adjuntar tu Currículum Vitae (PDF)</u> junto al mensaje.
            </p>
        </div>

        <form onsubmit="procesarPostulacion(event, '${puesto.replace(/'/g, "\\'")}', '${empresa.replace(/'/g, "\\'")}', '${numeroEmpleador}')" class="express-form">
            <div class="form-group" style="margin-bottom:0.8rem;">
                <input type="text" id="post-nombre" placeholder="Nombre y Apellido" required>
            </div>
            <div class="form-group" style="margin-bottom:1.2rem;">
                <input type="tel" id="post-telefono" placeholder="Tu WhatsApp de contacto" required>
            </div>
            <button type="submit" class="btn-whatsapp">
                <i class="fa-brands fa-whatsapp"></i> CONTACTAR AL EMPLEADOR
            </button>
        </form>
    `;

    const modal = document.getElementById('modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
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
        window.location.href = urlWA;
    }, 500);
}

// Función para solicitar el perfil/CV de un Talento Destacado
function desbloquearContacto(nombreCandidato) {
    asegurarEstructuraModal();
    const body = document.getElementById('modal-body');
    if (!body) return;

    body.innerHTML = `
        <div style="margin-bottom: 1rem; text-align: center;">
            <i class="fa-solid fa-id-card" style="font-size: 2.5rem; color: var(--primary); margin-bottom: 8px;"></i>
            <h2 style="font-size:1.2rem; font-weight:900; color:var(--text-main); margin-bottom:2px;">ACCEDER A FICHA DE PERFIL</h2>
            <p style="color:var(--primary); font-size:0.85rem; font-weight:700; margin:0;">Candidato: ${escapeHTML(nombreCandidato)}</p>
        </div>

        <div style="background: rgba(255, 193, 7, 0.1); border-left: 3px solid #FFC107; padding: 10px; border-radius: 4px; margin-bottom: 1rem;">
            <p style="font-size: 0.78rem; color: var(--text-main); margin: 0;">
                <i class="fa-solid fa-shield-halved" style="color:#FFC107; margin-right: 4px;"></i>
                Solicitá el contacto directo y CV completo verificando tu empresa o local gastronómico.
            </p>
        </div>

        <form onsubmit="procesarDesbloqueoTalento(event, '${escapeHTML(nombreCandidato).replace(/'/g, "\\'")}')" class="express-form">
            <div class="form-group" style="margin-bottom:0.8rem;">
                <input type="text" id="empresa-solicitante" placeholder="Nombre de tu local / empresa" required>
            </div>
            <div class="form-group" style="margin-bottom:1.2rem;">
                <input type="tel" id="telefono-solicitante" placeholder="Tu WhatsApp de contacto" required>
            </div>
            <button type="submit" class="btn-whatsapp">
                <i class="fa-brands fa-whatsapp"></i> SOLICITAR CV POR WHATSAPP
            </button>
        </form>
    `;

    const modal = document.getElementById('modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function procesarDesbloqueoTalento(e, nombreCandidato) {
    e.preventDefault();
    e.stopPropagation();

    const empresa = document.getElementById('empresa-solicitante')?.value || "Empresa";
    const telefono = document.getElementById('telefono-solicitante')?.value || "Sin especificar";

    const texto = `¡Hola Jobbers! 👋 Me interesa contratar / ver el CV del talento destacado:\n\n` +
                  `👤 *Candidato de interés:* ${nombreCandidato}\n` +
                  `🏢 *Mi Local/Empresa:* ${empresa}\n` +
                  `📱 *Mi Contacto:* ${telefono}\n\n` +
                  `¿Me comparten su contacto o currículum vitae?`;

    const urlWA = `https://wa.me/${WHATSAPP_JOBBERS_DEFAULT}?text=${encodeURIComponent(texto)}`;

    cerrarModal();
    mostrarToast("Conectando con Soporte Jobbers...", "success");

    setTimeout(() => {
        window.location.href = urlWA;
    }, 500);
}

// Modal informativo para la sección Recursos del Nav
function abrirModalRecursos(tipo) {
    asegurarEstructuraModal();
    const body = document.getElementById('modal-body');
    if (!body) return;

    let titulo = "";
    let contenido = "";

    if (tipo === 'soporte') {
        titulo = "Soporte Técnico";
        contenido = `
            <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1rem;">¿Tuviste algún inconveniente publicando o postulándote? Escribinos directamente por WhatsApp y nuestro equipo te ayuda al instante.</p>
            <a href="https://wa.me/${WHATSAPP_JOBBERS_DEFAULT}?text=${encodeURIComponent('Hola Jobbers, necesito soporte técnico con la plataforma.')}" class="btn-whatsapp" target="_blank">
                <i class="fa-brands fa-whatsapp"></i> HABLAR CON SOPORTE
            </a>
        `;
    } else if (tipo === 'guias') {
        titulo = "Guías de Contratación";
        contenido = `
            <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1rem;">Descargá de forma gratuita nuestras recomendaciones para armar perfiles gastronómicos competitivos y realizar entrevistas efectivas.</p>
            <button class="btn-primary" onclick="mostrarToast('Descarga de guía iniciada...', 'success'); cerrarModal();" style="width:100%;">
                <i class="fa-solid fa-file-pdf"></i> DESCARGAR GUÍA (PDF)
            </button>
        `;
    } else if (tipo === 'plantillas') {
        titulo = "Plantillas de CV Gastronómico";
        contenido = `
            <p style="font-size:0.9rem; color:var(--text-muted); margin-bottom:1rem;">Optimizá tu resumen curricular con nuestros formatos adaptados a cocina, barra y servicio de salón.</p>
            <button class="btn-primary" onclick="mostrarToast('Descargando plantilla de CV...', 'success'); cerrarModal();" style="width:100%;">
                <i class="fa-solid fa-download"></i> DESCARGAR PLANTILLA
            </button>
        `;
    }

    body.innerHTML = `
        <div style="margin-bottom: 1rem; text-align: center;">
            <h2 style="font-size:1.2rem; font-weight:900; color:var(--text-main); margin-bottom:4px;">${titulo}</h2>
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
    }
}

function irAExpress() {
    cerrarModal();
    const secExpress = document.getElementById('express-form-section');
    if (secExpress) {
        secExpress.scrollIntoView({ behavior: 'smooth' });
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
window.irAExpress = irAExpress;
window.abrirModalPostulacion = abrirModalPostulacion;
window.desbloquearContacto = desbloquearContacto;
window.procesarDesbloqueoTalento = procesarDesbloqueoTalento;
window.abrirModalRecursos = abrirModalRecursos;
window.cerrarModal = cerrarModal;
window.procesarPostulacion = procesarPostulacion;
window.filtrarVacantes = filtrarVacantes;
window.filtrarPorCategoria = filtrarPorCategoria;
window.toggleDropdown = toggleDropdown;
window.cerrarDropdown = cerrarDropdown;
