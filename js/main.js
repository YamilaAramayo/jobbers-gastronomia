/**
 * JOBBERS ARGENTINA - Portal de Empleo Gastronómico
 * Archivo: js/main.js
 */

// =========================================================================
// 1. ESTADO GLOBAL & HELPERS
// =========================================================================
let whatsappEmpleadorActual = "5493513080197";
let tituloPuestoActual = "";
window.rolSeleccionadoTemp = null;
let listaVacantesBD = [];
let categoriaActual = "todas";

function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
}

function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function normalizarTexto(str) {
    if (!str) return "";
    return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^\w\s]/gi, "")
        .trim();
}

function normalizarCategoria(cat) {
    const c = normalizarTexto(cat);
    if (!c || c.includes("todas") || c === "all") return "todas";
    if (c.includes("cocin")) return "cocina";
    if (c.includes("salon") || c.includes("mozo") || c.includes("camarer")) return "salon";
    if (c.includes("barist")) return "barismo";
    if (c.includes("bar") || c.includes("coctel") || c.includes("bartender")) return "barra";
    if (c.includes("delivery") || c.includes("repart")) return "delivery";
    if (c.includes("limpieza") || c.includes("bach")) return "limpieza";
    if (c.includes("rrhh") || c.includes("recurs") || c.includes("gestion")) return "rrhh";
    if (c.includes("admin")) return "administracion";
    return c;
}

// =========================================================================
// 2. MODALES & NOTIFICACIONES
// =========================================================================

// --- MODAL POSTULACIÓN ---
window.abrirModalPostulacion = function(puesto, empresa, whatsappTel) {
    whatsappEmpleadorActual = whatsappTel && whatsappTel !== "undefined" ? whatsappTel : "5493513080197";
    tituloPuestoActual = `${puesto} — ${empresa}`;

    const titleEl = document.getElementById('modal-job-title');
    const modalEl = document.getElementById('postular-modal');

    if (titleEl) titleEl.innerText = tituloPuestoActual;
    if (modalEl) {
        modalEl.style.display = 'flex';
        modalEl.classList.add('show');
        modalEl.setAttribute('aria-hidden', 'false');
    }
};

window.cerrarModalPostulacion = function() {
    const modalEl = document.getElementById('postular-modal');
    const formEl = document.getElementById('form-postularme');
    if (modalEl) {
        modalEl.style.display = 'none';
        modalEl.classList.remove('show');
        modalEl.setAttribute('aria-hidden', 'true');
    }
    if (formEl) formEl.reset();
};

// --- MODAL MEMBRESÍA PRO ---
window.abrirModalMembresia = function() {
    const modal = document.getElementById('modal-membresia-pro');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
    }
};

window.cerrarModalMembresia = function() {
    const modal = document.getElementById('modal-membresia-pro');
    const form = document.getElementById('form-membresia-pro');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }
    if (form) form.reset();
};

window.enviarMembresiaWhatsApp = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const nombre = getVal('pro-nombre');
    const puesto = getVal('pro-puesto');

    if (!nombre || !puesto) {
        window.mostrarToast('Por favor completá tu nombre y puesto.', 'error');
        return;
    }

    const mensaje = `Hola Jobbers! 👋 Mi nombre es *${nombre}* (${puesto}). Me gustaría solicitar el Pase *JOBBERS PRO* para destacar mi perfil en la plataforma.`;
    const url = `https://wa.me/5493513080197?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
    window.cerrarModalMembresia();
};

// --- MODAL CALCULADORA DE SALARIOS ---
window.abrirModalCalculadora = function(e) {
    if (e) e.preventDefault();
    const modal = document.getElementById('modal-calculadora');
    if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('show');
        modal.setAttribute('aria-hidden', 'false');
    }
};

window.cerrarModalCalculadora = function() {
    const modal = document.getElementById('modal-calculadora');
    if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }
};

window.cambiarModoCalculadora = function() {
    const tipo = getVal('calc-tipo');
    const grupoBase = document.getElementById('grupo-base-sueldo');
    const grupoJornada = document.getElementById('grupo-jornada-tipo');
    const grupoHoras = document.getElementById('grupo-horas-extra');

    if (tipo === 'jornada') {
        if (grupoBase) grupoBase.style.display = 'block';
        if (grupoJornada) grupoJornada.style.display = 'block';
        if (grupoHoras) grupoHoras.style.display = 'none';
    } else {
        if (grupoBase) grupoBase.style.display = 'block';
        if (grupoJornada) grupoJornada.style.display = 'none';
        if (grupoHoras) grupoHoras.style.display = 'block';
    }
};

window.calcularHorariosSueldo = function() {
    const tipo = getVal('calc-tipo');
    const sueldoBase = parseFloat(getVal('calc-sueldo-base')) || 0;
    const outputDiv = document.getElementById('resultado-calculadora');
    const outputValor = document.getElementById('calc-output-valor');

    let resultado = 0;

    if (tipo === 'jornada') {
        const modalidad = getVal('calc-modalidad');
        if (modalidad === 'full') resultado = sueldoBase;
        else if (modalidad === 'part') resultado = sueldoBase * 0.5;
        else if (modalidad === 'franco') resultado = (sueldoBase / 25) / 2;

        if (outputValor) outputValor.innerText = `$ ${resultado.toLocaleString('es-AR', {maximumFractionDigits: 0})}`;
    } else {
        const horas = parseFloat(getVal('calc-cant-horas')) || 0;
        const valorHoraExtra = (sueldoBase / 200) * 1.5;
        resultado = valorHoraExtra * horas;

        if (outputValor) outputValor.innerText = `$ ${resultado.toLocaleString('es-AR', {maximumFractionDigits: 0})} (Estimado X ${horas}hs)`;
    }

    if (outputDiv) outputDiv.style.display = 'block';
};

// --- MODAL SELECCIÓN DE PERFIL ---
window.abrirModalPerfil = function() {
    const modalPerfil = document.getElementById('modal-cambiar-perfil');
    const stepSelect = document.getElementById('rol-step-select');
    const stepConfirm = document.getElementById('rol-step-confirm');

    if (!modalPerfil) return;
    if (stepSelect) stepSelect.style.display = 'block';
    if (stepConfirm) stepConfirm.style.display = 'none';

    modalPerfil.style.display = 'flex';
    modalPerfil.classList.add('show');
    modalPerfil.setAttribute('aria-hidden', 'false');
};

window.cerrarModalPerfil = function() {
    const modalPerfil = document.getElementById('modal-cambiar-perfil');
    if (!modalPerfil) return;

    modalPerfil.style.display = 'none';
    modalPerfil.classList.remove('show');
    modalPerfil.setAttribute('aria-hidden', 'true');
    window.rolSeleccionadoTemp = null;
};

window.seleccionarRol = function(rol, nombreRol) {
    window.rolSeleccionadoTemp = rol;

    const stepSelect = document.getElementById('rol-step-select');
    const stepConfirm = document.getElementById('rol-step-confirm');
    const nombreConfirmar = document.getElementById('rol-nombre-confirmar');

    if (nombreConfirmar) {
        nombreConfirmar.textContent = nombreRol || (rol === 'empresa' ? 'Busco Personal' : 'Postulante');
    }

    if (stepSelect) stepSelect.style.display = 'none';
    if (stepConfirm) stepConfirm.style.display = 'block';
};

// --- ENVÍOS DE FORMULARIOS A WHATSAPP ---
window.enviarPostulacionWhatsApp = function(e) {
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const nombre = getVal('postular-nombre');
    const telefono = getVal('postular-phone');

    if (!nombre || !telefono) {
        window.mostrarToast('Completá tu nombre y teléfono para continuar.', 'error');
        return;
    }

    const mensaje = `Hola! Mi nombre es *${nombre}* (${telefono}). Me contacto a través de Jobbers para postularme a la búsqueda de *${tituloPuestoActual}*. Quedo a disposición y adjunto mi CV.`;
    const url = `https://wa.me/${whatsappEmpleadorActual}?text=${encodeURIComponent(mensaje)}`;

    window.open(url, '_blank');
    window.cerrarModalPostulacion();
};

window.contactarTalento = function(nombre, puesto) {
    const mensaje = `Hola Jobbers! 👋 Vimos el perfil destacado de *${nombre}* (${puesto}) en la plataforma y nos gustaría contactarlo/a para una entrevista.`;
    const url = `https://wa.me/5493541582448?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
};

// --- TOAST NOTIFICATIONS ---
window.mostrarToast = function(mensaje, tipo = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `jobbers-toast ${tipo}`;

    const bgColor = tipo === 'success' ? '#2ecc71' : '#e74c3c';
    toast.style.cssText = `background:${bgColor}; color:#fff; padding:12px 20px; border-radius:8px; font-weight:600; display:flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3); position:fixed; bottom:20px; right:20px; z-index:99999; transition:all 0.3s ease;`;

    const icono = tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icono}"></i> <span>${escapeHTML(mensaje)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(50px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
};

// =========================================================================
// 3. CARGA DE DOM & LÓGICA DE NEGOCIO
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {

    const MOCK_TALENTO = [
        {
            id: 101,
            nombre: "Mateo R.",
            puesto: "Cocinero / Jefe de Partida",
            experiencia: "5 años de exp.",
            zona: "Nueva Córdoba / Centro",
            disponibilidad: "Inmediata (Full Time)"
        },
        {
            id: 102,
            nombre: "Sofía M.",
            puesto: "Barista & Encargada de Caja",
            experiencia: "3 años de exp.",
            zona: "General Paz / Güemes",
            disponibilidad: "Turno Mañana"
        },
        {
            id: 103,
            nombre: "Lucas G.",
            puesto: "Bartender / Coctelería de Autor",
            experiencia: "4 años de exp.",
            zona: "Cerro de las Rosas",
            disponibilidad: "Turno Noche"
        }
    ];

    function actualizarContador(cantidad) {
        const contadorEl = document.getElementById('contador-vacantes');
        if (contadorEl) {
            contadorEl.textContent = `Mostrando ${cantidad} ${cantidad === 1 ? 'vacante disponible' : 'vacantes disponibles'}`;
        }
    }

    function renderizarVacantes(vacantes) {
        const contenedor = document.getElementById('lista-vacantes');
        if (!contenedor) return;

        actualizarContador(vacantes.length);

        if (!vacantes || vacantes.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted, #888);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; color: var(--primary, #F39C12);"></i>
                    <p>No encontramos búsquedas que coincidan con tu criterio.</p>
                </div>`;
            return;
        }

        contenedor.innerHTML = vacantes.map(v => {
            const tituloEsc = escapeHTML(v.titulo);
            const empresaEsc = escapeHTML(v.empresa);
            const telEsc = escapeHTML(v.telefono);

            return `
            <article class="job-offer-card">
                <div class="job-info-main">
                    <div class="job-header-row">
                        <h4>${tituloEsc}</h4>
                        ${v.urgente ? `<span class="badge-urgente"><i class="fas fa-bolt"></i> Urgente</span>` : ''}
                    </div>
                    
                    <span class="job-company">${empresaEsc}</span>

                    <div class="job-details-row">
                        <span><i class="fas fa-map-marker-alt"></i> ${escapeHTML(v.zona)}</span>
                        <span><i class="fas fa-clock"></i> ${escapeHTML(v.turno)}</span>
                        <span><i class="fas fa-briefcase"></i> ${escapeHTML(v.jornada)}</span>
                        <span class="job-salary"><i class="fas fa-dollar-sign"></i> ${escapeHTML(v.sueldo)}</span>
                    </div>
                </div>

                <div class="job-action-col">
                    <span class="job-time">${escapeHTML(v.tiempo)}</span>
                    <button type="button" class="btn-postularme" onclick="window.abrirModalPostulacion('${tituloEsc}', '${empresaEsc}', '${telEsc}')">
                        <i class="fab fa-whatsapp" style="margin-right: 0.4rem; font-size: 1rem;"></i> Postularme
                    </button>
                </div>
            </article>
        `}).join('');
    }

    function renderizarTalento(talento) {
        const contenedor = document.getElementById('grid-talento-destacado');
        if (!contenedor) return;

        contenedor.innerHTML = talento.map(t => `
            <div class="job-offer-card" style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <h4 style="color: var(--primary, #F39C12); font-size: 1.1rem;">${escapeHTML(t.nombre)}</h4>
                    <span style="font-size: 0.75rem; background: rgba(46, 204, 113, 0.15); color: var(--salary-green, #2ecc71); padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 700;">Disponible</span>
                </div>
                <div>
                    <strong style="display: block; font-size: 0.95rem;">${escapeHTML(t.puesto)}</strong>
                    <span style="font-size: 0.85rem; color: var(--text-muted, #aaa);">${escapeHTML(t.experiencia)}</span>
                </div>
                <div style="font-size: 0.82rem; color: var(--text-muted, #aaa); border-top: 1px solid var(--border-color, rgba(255,255,255,0.1)); padding-top: 0.5rem; width: 100%;">
                    <div><i class="fas fa-map-marker-alt" style="color: var(--primary, #F39C12);"></i> ${escapeHTML(t.zona)}</div>
                    <div style="margin-top: 0.2rem;"><i class="fas fa-user-clock" style="color: var(--primary, #F39C12);"></i> ${escapeHTML(t.disponibilidad)}</div>
                </div>
                <button type="button" class="btn-whatsapp" style="width: 100%; margin-top: 0.5rem; height: 38px; font-size: 0.78rem;" onclick="window.contactarTalento('${escapeHTML(t.nombre)}', '${escapeHTML(t.puesto)}')">
                    <i class="fab fa-whatsapp"></i> Contactar Perfil
                </button>
            </div>
        `).join('');
    }

    async function cargarVacantes() {
        try {
            const respuesta = await fetch('./base_de_datos.json');
            if (!respuesta.ok) throw new Error(`Status: ${respuesta.status}`);

            const datos = await respuesta.json();

            listaVacantesBD = datos.map(v => ({
                id: v.id,
                titulo: v.puesto || v.titulo || "Puesto Gastronómico",
                categoria: (v.categoria || v.puesto || v.titulo || "").toLowerCase(),
                empresa: v.empresa || "Confidencial",
                zona: v.zona || "Córdoba",
                turno: v.turno || "A convenir",
                jornada: v.jornada || "Completa",
                sueldo: v.sueldo || "A convenir",
                urgente: Boolean(v.urgente),
                tiempo: v.tiempo || "Reciente",
                telefono: v.contacto_wa || v.telefono || "5493541582448"
            }));

            renderizarVacantes(listaVacantesBD);

        } catch (error) {
            console.error("Error al cargar base_de_datos.json:", error);
            window.mostrarToast('No se pudieron cargar las ofertas de empleo.', 'error');
        }
    }

    function aplicarRol(rol) {
        document.body.classList.remove('role-postulante', 'role-empresa');
        document.body.classList.add(`role-${rol}`);
        localStorage.setItem('jobbers_role', rol);

        const labelModo = document.getElementById('label-modo-actual');
        if (labelModo) {
            labelModo.textContent = rol === 'empresa' ? 'Modo Empresa' : 'Modo Postulante';
        }
    }

    async function initRol() {
        const rolGuardado = localStorage.getItem('jobbers_role');

        await cargarVacantes();
        renderizarTalento(MOCK_TALENTO);

        if (rolGuardado) {
            aplicarRol(rolGuardado);
            window.cerrarModalPerfil();
        } else {
            aplicarRol('postulante');
            window.abrirModalPerfil();
        }
    }

    // --- FILTRADO DE BÚSQUEDA Y CATEGORÍAS ---
    const inputBuscador = document.getElementById('job-search-input');
    const btnBuscador = document.querySelector('.btn-search');
    const categoryChips = document.querySelectorAll('.btn-categoria');

    function filtrarEmpleos() {
        const termino = normalizarTexto(inputBuscador ? inputBuscador.value : '');

        const resultados = listaVacantesBD.filter(v => {
            const titulo = normalizarTexto(v.titulo);
            const empresa = normalizarTexto(v.empresa);
            const zona = normalizarTexto(v.zona);
            const catVacante = normalizarCategoria(v.categoria || v.titulo);

            const coincideTexto = !termino || 
                titulo.includes(termino) || 
                empresa.includes(termino) || 
                zona.includes(termino);

            let coincideCategoria = true;
            if (categoriaActual !== 'todas') {
                coincideCategoria = (catVacante === categoriaActual) || titulo.includes(categoriaActual);
            }

            return coincideTexto && coincideCategoria;
        });

        renderizarVacantes(resultados);
    }

    inputBuscador?.addEventListener('input', filtrarEmpleos);
    btnBuscador?.addEventListener('click', (e) => {
        e.preventDefault();
        filtrarEmpleos();
    });

    categoryChips.forEach(chip => {
        chip.addEventListener('click', () => {
            categoryChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            const catAttr = chip.dataset.cat || chip.getAttribute('data-cat');
            categoriaActual = normalizarCategoria(catAttr || chip.textContent);

            filtrarEmpleos();
        });
    });

    // --- EVENTOS DEL MODAL DE SELECCIÓN DE ROL ---
    document.querySelectorAll('.btn-trigger-modal-perfil, .btn-cambiar-rol').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.abrirModalPerfil();
        });
    });

    document.addEventListener('click', (e) => {
        const btnRol = e.target.closest('.btn-rol');
        if (btnRol) {
            e.preventDefault();
            const rol = btnRol.dataset.rol || btnRol.getAttribute('data-rol');
            const nombre = btnRol.dataset.nombre || btnRol.getAttribute('data-nombre');
            window.seleccionarRol(rol, nombre);
        }
    });

    document.getElementById('btn-volver-rol')?.addEventListener('click', () => {
        const stepSelect = document.getElementById('rol-step-select');
        const stepConfirm = document.getElementById('rol-step-confirm');
        if (stepConfirm) stepConfirm.style.display = 'none';
        if (stepSelect) stepSelect.style.display = 'block';
        window.rolSeleccionadoTemp = null;
    });

    document.getElementById('btn-confirmar-rol')?.addEventListener('click', () => {
        if (window.rolSeleccionadoTemp) {
            aplicarRol(window.rolSeleccionadoTemp);
            window.mostrarToast(`Perfil cambiado a ${window.rolSeleccionadoTemp === 'empresa' ? 'Empresa' : 'Postulante'}`);
            window.cerrarModalPerfil();
        }
    });

    document.getElementById('btn-cerrar-modal')?.addEventListener('click', () => {
        if (!localStorage.getItem('jobbers_role')) aplicarRol('postulante');
        window.cerrarModalPerfil();
    });

    // --- FORMULARIO EXPRESS PARA EMPRESAS ---
    const formExpress = document.getElementById('form-publicar-express');
    formExpress?.addEventListener('submit', (e) => {
        e.preventDefault();

        const empresa = getVal('nombre-empresa');
        const telefono = getVal('telefono-contacto');
        const puesto = getVal('puesto-requerido');
        const zona = getVal('zona-local');
        const turno = getVal('turno-puesto');
        const jornada = getVal('jornada-puesto');
        const requisitos = getVal('requisitos-puesto');

        if (!empresa || !telefono || !puesto || !zona || !turno || !jornada) {
            window.mostrarToast('Por favor, completá todos los campos obligatorios.', 'error');
            return;
        }

        let mensaje = `Hola Jobbers! 👋 Queremos publicar la siguiente búsqueda urgente:\n\n` +
                      `🏢 *Local/Empresa:* ${empresa}\n` +
                      `💼 *Puesto:* ${puesto}\n` +
                      `📍 *Zona:* ${zona}\n` +
                      `⏰ *Turno:* ${turno}\n` +
                      `⏳ *Jornada:* ${jornada}\n`;

        if (requisitos) {
            mensaje += `📝 *Requisitos:* ${requisitos}\n`;
        }

        mensaje += `📱 *Contacto Directo:* ${telefono}\n\nQuedo a la espera de la publicación. ¡Gracias!`;

        const url = `https://wa.me/5493541582448?text=${encodeURIComponent(mensaje)}`;

        window.mostrarToast('Redirigiendo a WhatsApp...', 'success');
        setTimeout(() => {
            window.open(url, '_blank');
            formExpress.reset();
        }, 1000);
    });

    // --- MANEJO DE TECLA ESC Y CIERRE DE MODALES ---
    document.getElementById('form-postularme')?.addEventListener('submit', window.enviarPostulacionWhatsApp);

    document.querySelectorAll('.btn-cerrar-postular').forEach(btn => {
        btn.addEventListener('click', window.cerrarModalPostulacion);
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.cerrarModalPostulacion();
            window.cerrarModalPerfil();
            window.cerrarModalCalculadora();
            window.cerrarModalMembresia();
        }
    });

    // --- DROPDOWN RECURSOS ---
    const dropdownToggle = document.getElementById('dropdown-recursos');
    const dropdownMenu = document.getElementById('menu-recursos');

    dropdownToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        const estaAbierto = dropdownMenu?.classList.toggle('show');
        dropdownToggle.setAttribute('aria-expanded', Boolean(estaAbierto));
    });

    document.addEventListener('click', (e) => {
        if (dropdownMenu && !dropdownMenu.contains(e.target) && !dropdownToggle?.contains(e.target)) {
            dropdownMenu.classList.remove('show');
            dropdownToggle?.setAttribute('aria-expanded', 'false');
        }
    });

    // Iniciar aplicación
    initRol();
});
