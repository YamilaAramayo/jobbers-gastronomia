/* ==========================================================================
   JOBBERS - SISTEMA INTEGRAL DE INTERACCIÓN Y OFERTAS (OPCIÓN A - EXPRESS)
   ========================================================================== */

// HELPER: Sanitización rápida contra XSS
const escapeHTML = (str) => {
    return String(str).replace(/[&<>"']/g, (match) => {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
        return map[match];
    });
};

// NÚMERO CENTRAL DE WHATSAPP JOBBERS
const WHATSAPP_NUMERO = "5493513080197";

// Variable global para almacenar las vacantes cargadas desde el JSON
let vacantesGastronomia = [];

// 1. CARGA DE DATOS DESDE EL ARCHIVO JSON
async function cargarVacantesDesdeJSON() {
    try {
        const response = await fetch('./base_de_datos.json');
        if (!response.ok) {
            throw new Error(`Error al cargar el JSON: ${response.statusText}`);
        }
        vacantesGastronomia = await response.json();
        renderizarOfertas(vacantesGastronomia);
    } catch (error) {
        console.error("Error cargando la base de datos:", error);
        mostrarToast("No se pudieron cargar las ofertas de empleo", "error");
        
        const contenedor = document.getElementById('vacantes-container');
        if (contenedor) {
            contenedor.innerHTML = `
                <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
                    <i class="fa-solid fa-triangle-exclamation" style="font-size:2rem; color:#EF4444; margin-bottom:10px;"></i>
                    <p>Error al cargar las ofertas. Asegurate de estar ejecutando el proyecto con un servidor local (Live Server).</p>
                </div>
            `;
        }
    }
}

// 2. CARGA E INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    asegurarEstructuraModal();
    cargarVacantesDesdeJSON();

    // Conectar el Formulario Express de WhatsApp (Búsqueda de Personal)
    const formExpress = document.getElementById('express-form');
    if (formExpress) {
        formExpress.addEventListener('submit', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const local = document.getElementById('nombre-local')?.value || "Establecimiento";
            const telefono = document.getElementById('telefono-contacto')?.value || "Sin teléfono";
            const puesto = document.getElementById('puesto')?.value || "Personal Gastronómico";
            const zona = document.getElementById('zona')?.value || "Córdoba";
            const turno = document.getElementById('turno')?.value || "A convenir";

            const texto = `¡Hola Jobbers! 👋 Necesito contratar personal urgente:\n\n` +
                          `🏢 *Local/Empresa:* ${local}\n` +
                          `📱 *Contacto:* ${telefono}\n` +
                          `📌 *Puesto:* ${puesto}\n` +
                          `📍 *Zona:* ${zona}\n` +
                          `⏰ *Turno:* ${turno}\n\n` +
                          `Aguardando respuesta.`;

            const urlWA = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;
            
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

// 3. DELEGACIÓN GLOBAL DE CLICS
document.addEventListener('click', (e) => {
    if (!e.target.closest('.dropdown')) {
        cerrarDropdown();
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

    contenedor.innerHTML = lista.map(item => `
        <article class="job-offer-card">
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
                <button type="button" onclick="abrirModalPostulacion('${escapeHTML(item.puesto)}', '${escapeHTML(item.empresa)}')" class="btn-primary" style="padding:6px 14px; font-size:0.8rem;">
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

// 6. SISTEMA DE MODAL Y POSTULACIÓN DIRECTA
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

function abrirModalPostulacion(puesto, empresa) {
    asegurarEstructuraModal();
    const body = document.getElementById('modal-body');
    if (!body) return;

    body.innerHTML = `
        <div style="margin-bottom: 1rem;">
            <h2 style="font-size:1.2rem; font-weight:900; color:var(--text-main); margin-bottom:2px;">POSTULARME</h2>
            <p style="color:var(--primary); font-size:0.85rem; font-weight:700; margin:0;">${puesto} — ${empresa}</p>
        </div>

        <form onsubmit="procesarPostulacion(event, '${puesto}', '${empresa}')" class="express-form">
            <div class="form-group" style="margin-bottom:0.8rem;">
                <input type="text" id="post-nombre" placeholder="Nombre y Apellido" required>
            </div>
            <div class="form-group" style="margin-bottom:1.2rem;">
                <input type="tel" id="post-telefono" placeholder="WhatsApp de contacto" required>
            </div>
            <button type="submit" class="btn-whatsapp">
                <i class="fa-brands fa-whatsapp"></i> ENVIAR POSTULACIÓN
            </button>
        </form>
    `;

    const modal = document.getElementById('modal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function procesarPostulacion(e, puesto, empresa) {
    e.preventDefault();
    e.stopPropagation();

    const nombre = document.getElementById('post-nombre')?.value || "Candidato";
    const telefonoContacto = document.getElementById('post-telefono')?.value || "";

    const texto = `¡Hola Jobbers! 👋 Quisiera postularme al puesto de *${puesto}* en *${empresa}*.\n\n` +
                  `👤 *Nombre:* ${nombre}\n` +
                  `📱 *Contacto:* ${telefonoContacto}`;

    const urlWA = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(texto)}`;

    cerrarModal();
    mostrarToast(`Redirigiendo a WhatsApp...`, "success");
    
    setTimeout(() => {
        window.location.href = urlWA;
    }, 500);
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
window.cerrarModal = cerrarModal;
window.procesarPostulacion = procesarPostulacion;
window.filtrarVacantes = filtrarVacantes;
window.filtrarPorCategoria = filtrarPorCategoria;
window.toggleDropdown = toggleDropdown;
window.cerrarDropdown = cerrarDropdown;
