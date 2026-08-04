/**
 * JOBBERS ARGENTINA - Portal de Empleo Gastronómico
 * Lógica principal optimizada, reactiva y blindada contra fallos de DOM.
 */

// =========================================================================
// 1. FUNCIONES GLOBALES & HELPERS
// =========================================================================
let whatsappEmpleadorActual = "5493513080197";
let tituloPuestoActual = "";

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

window.abrirModalPostulacion = function(puesto, empresa, whatsappTel) {
    whatsappEmpleadorActual = (whatsappTel && whatsappTel !== "undefined" && whatsappTel !== "") 
        ? whatsappTel 
        : "5493513080197";
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
    const url = `https://wa.me/5493513080197?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
};

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
    toast.style.cssText = `background:${bgColor}; color:#fff; padding:12px 20px; border-radius:8px; font-weight:600; display:flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3); transition:all 0.3s ease; margin-bottom: 8px;`;
    
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
// 2. LÓGICA PRINCIPAL AL CARGAR EL DOM
// =========================================================================
document.addEventListener('DOMContentLoaded', () => {

    let listaVacantesBD = [];
    let categoriaActual = 'todas';

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

    // --- RENDERIZADO DE VACANTES Y TALENTO ---
    function renderizarVacantes(vacantes) {
        const contenedor = document.getElementById('lista-vacantes');
        if (!contenedor) return;

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

    // --- CARGA ASÍNCRONA DESDE JSON ---
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
                telefono: v.contacto_wa || v.telefono || "5493513080197"
            }));

            renderizarVacantes(listaVacantesBD);

        } catch (error) {
            console.error("Error al cargar base_de_datos.json:", error);
            window.mostrarToast('No se pudieron cargar las ofertas de empleo.', 'error');
        }
    }

    // --- GESTIÓN DE ROLES ---
    let rolSeleccionadoTemp = null;
    const modalPerfil = document.getElementById('modal-cambiar-perfil');
    const stepSelect = document.getElementById('rol-step-select');
    const stepConfirm = document.getElementById('rol-step-confirm');
    const nombreConfirmar = document.getElementById('rol-nombre-confirmar');

    function aplicarRol(rol) {
        document.body.classList.remove('role-postulante', 'role-empresa');
        document.body.classList.add(`role-${rol}`);
        localStorage.setItem('jobbers_role', rol);

        const labelModo = document.getElementById('label-modo-actual');
        if (labelModo) {
            labelModo.textContent = rol === 'empresa' ? 'Modo Empresa' : 'Modo Postulante';
        }
    }

    function abrirModalPerfil() {
        if (!modalPerfil) return;
        if (stepSelect) stepSelect.style.display = 'block';
        if (stepConfirm) stepConfirm.style.display = 'none';
        modalPerfil.style.display = 'flex';
        modalPerfil.setAttribute('aria-hidden', 'false');
    }

    function cerrarModalPerfil() {
        if (!modalPerfil) return;
        modalPerfil.style.display = 'none';
        modalPerfil.setAttribute('aria-hidden', 'true');
        rolSeleccionadoTemp = null;
    }

    function initRol() {
        const rolGuardado = localStorage.getItem('jobbers_role');
        
        cargarVacantes();
        renderizarTalento(MOCK_TALENTO);
        
        if (rolGuardado) {
            aplicarRol(rolGuardado);
            cerrarModalPerfil();
        } else {
            aplicarRol('postulante');
            abrirModalPerfil();
        }
    }

    // Eventos Modal Perfil
    document.querySelectorAll('.btn-cambiar-rol, #btn-cambiar-perfil, .btn-bottom-perfil').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModalPerfil();
        });
    });

    document.getElementById('btn-cerrar-modal')?.addEventListener('click', () => {
        if (!localStorage.getItem('jobbers_role')) localStorage.setItem('jobbers_role', 'postulante');
        cerrarModalPerfil();
    });

    modalPerfil?.addEventListener('click', (e) => {
        if (e.target === modalPerfil) {
            if (!localStorage.getItem('jobbers_role')) localStorage.setItem('jobbers_role', 'postulante');
            cerrarModalPerfil();
        }
    });

    document.querySelectorAll('.btn-rol').forEach(btn => {
        btn.addEventListener('click', () => {
            rolSeleccionadoTemp = btn.dataset.rol || btn.getAttribute('data-rol');
            const nombreRol = btn.dataset.nombre || btn.getAttribute('data-nombre') || rolSeleccionadoTemp;
            
            if (nombreConfirmar) nombreConfirmar.textContent = nombreRol;
            if (stepSelect) stepSelect.style.display = 'none';
            if (stepConfirm) stepConfirm.style.display = 'block';
        });
    });

    document.getElementById('btn-volver-rol')?.addEventListener('click', () => {
        if (stepConfirm) stepConfirm.style.display = 'none';
        if (stepSelect) stepSelect.style.display = 'block';
        rolSeleccionadoTemp = null;
    });

    document.getElementById('btn-confirmar-rol')?.addEventListener('click', () => {
        if (rolSeleccionadoTemp) {
            aplicarRol(rolSeleccionadoTemp);
            window.mostrarToast(`Perfil cambiado a ${rolSeleccionadoTemp === 'empresa' ? 'Empresa' : 'Postulante'}`);
            cerrarModalPerfil();
        }
    });

    // --- BUSCADOR Y FILTRADO POR CATEGORÍA ---
    const inputBuscador = document.getElementById('job-search-input');
    const btnBuscador = document.querySelector('.btn-search');
    const categoryChips = document.querySelectorAll('.category-chips .chip, .hero-chips .chip, .chip');

    function normalizarCategoria(cat) {
        if (!cat) return '';
        const c = cat.toLowerCase().trim();
        if (c.includes('todas') || c === 'all') return 'todas';
        if (c.includes('cocina')) return 'cocina';
        if (c.includes('salón') || c.includes('salon')) return 'salon';
        if (c.includes('barismo') || c.includes('barra') || c.includes('bar')) return 'barra';
        if (c.includes('delivery')) return 'delivery';
        if (c.includes('limpieza') || c.includes('bachero')) return 'limpieza';
        if (c.includes('rrhh') || c.includes('recursos')) return 'rrhh';
        return c;
    }

    function filtrarEmpleos() {
        const termino = inputBuscador ? inputBuscador.value.toLowerCase().trim() : '';

        const resultados = listaVacantesBD.filter(v => {
            const titulo = (v.titulo || '').toLowerCase();
            const empresa = (v.empresa || '').toLowerCase();
            const zona = (v.zona || '').toLowerCase();
            const categoria = normalizarCategoria(v.categoria || v.titulo);

            const coincideTexto = !termino || 
                titulo.includes(termino) || 
                empresa.includes(termino) || 
                zona.includes(termino);

            let coincideCategoria = true;
            if (categoriaActual !== 'todas') {
                coincideCategoria = (categoria === categoriaActual) || 
                                   categoria.includes(categoriaActual) || 
                                   titulo.includes(categoriaActual);
            }

            return coincideTexto && coincideCategoria;
        });

        renderizarVacantes(resultados);
    }

    // LISTENER EN VIVO EN EL INPUT DE BÚSQUEDA
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
            const rawCategory = catAttr || chip.textContent;
            
            categoriaActual = normalizarCategoria(rawCategory);

            filtrarEmpleos();
        });
    });

    // --- FORMULARIO EXPRESS EMPRESAS ---
    const formExpress = document.getElementById('form-publicar-express');

    formExpress?.addEventListener('submit', (e) => {
        e.preventDefault();

        const empresa = getVal('nombre-empresa');
        const telefono = getVal('telefono-contacto');
        const puesto = getVal('puesto-requerido');
        const zona = getVal('zona-local');
        const turno = getVal('turno-puesto');
        const jornada = getVal('jornada-puesto');

        if (!empresa || !telefono || !puesto || !zona || !turno || !jornada) {
            window.mostrarToast('Por favor, completá todos los campos.', 'error');
            return;
        }

        const mensaje = `Hola Jobbers! 👋 Queremos publicar la siguiente búsqueda urgente:\n\n` +
                        `🏢 *Local/Empresa:* ${empresa}\n` +
                        `💼 *Puesto:* ${puesto}\n` +
                        `📍 *Zona:* ${zona}\n` +
                        `⏰ *Turno:* ${turno}\n` +
                        `⏳ *Jornada:* ${jornada}\n` +
                        `📱 *Contacto Directo:* ${telefono}\n\n` +
                        `Quedo a la espera de la publicación. ¡Gracias!`;

        const url = `https://wa.me/5493513080197?text=${encodeURIComponent(mensaje)}`;
        
        window.mostrarToast('Redirigiendo a WhatsApp...', 'success');
        setTimeout(() => {
            window.open(url, '_blank');
            formExpress.reset();
        }, 1000);
    });

    // --- ESCUCHADORES EXTRA DE MODALES Y BINDINGS ---
    document.getElementById('form-postularme')?.addEventListener('submit', window.enviarPostulacionWhatsApp);

    document.querySelectorAll('.btn-cerrar-postular, .modal-close-btn').forEach(btn => {
        btn.addEventListener('click', window.cerrarModalPostulacion);
    });

    const modalPostularme = document.getElementById('postular-modal');
    modalPostularme?.addEventListener('click', (e) => {
        if (e.target === modalPostularme) window.cerrarModalPostulacion();
    });

    // Cierre de modales con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            window.cerrarModalPostulacion();
            cerrarModalPerfil();
        }
    });

    // --- DROPDOWN RECURSOS CON ACCESIBILIDAD ---
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

    // Arrancar la app
    initRol();
});
    initRol();
});
