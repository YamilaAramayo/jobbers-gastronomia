/**
 * JOBBERS ARGENTINA - Portal de Empleo Gastronómico
 * Arquitectura modular, segura y libre de contaminación del ámbito global.
 */

document.addEventListener('DOMContentLoaded', async () => {

    // =========================================================================
    // 1. ESTADO GLOBAL DE LA APLICACIÓN
    // =========================================================================
    let listaVacantesBD = [];
    let categoriaActual = 'todas';
    let whatsappEmpleadorActual = "";
    let tituloPuestoActual = "";
    let rolSeleccionadoTemp = null;

    const MOCK_TALENTO = [
        { id: 101, nombre: "Mateo R.", puesto: "Cocinero / Jefe de Partida", experiencia: "5 años de exp.", zona: "Nueva Córdoba / Centro", disponibilidad: "Inmediata (Full Time)" },
        { id: 102, nombre: "Sofía M.", puesto: "Barista & Encargada de Caja", experiencia: "3 años de exp.", zona: "General Paz / Güemes", disponibilidad: "Turno Mañana" },
        { id: 103, nombre: "Lucas G.", puesto: "Bartender / Coctelería de Autor", experiencia: "4 años de exp.", zona: "Cerro de las Rosas", disponibilidad: "Turno Noche" }
    ];

    // =========================================================================
    // 2. HELPERS & UTILIDADES
    // =========================================================================
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
            .trim();
    }

    function debounce(func, delay = 250) {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func.apply(null, args), delay);
        };
    }

    function mostrarToast(mensaje, tipo = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `jobbers-toast ${tipo}`;

        const bgColor = tipo === 'success' ? 'var(--salary-green, #2ecc71)' : 'var(--danger-badge, #e74c3c)';
        toast.style.cssText = `background:${bgColor}; color:#fff; padding:12px 20px; border-radius:8px; font-weight:600; display:flex; align-items:center; gap:8px; box-shadow:0 4px 12px rgba(0,0,0,0.3); position:fixed; bottom:20px; right:20px; z-index:var(--z-toast, 99999); transition:all 0.3s ease;`;

        const icono = tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toast.innerHTML = `<i class="fas ${icono}"></i> <span>${escapeHTML(mensaje)}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // =========================================================================
    // 3. CONTROL UNIFICADO DE MODALES
    // =========================================================================
    function toggleModal(modalId, show = true) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        modal.style.display = show ? 'flex' : 'none';
        modal.classList.toggle('show', show);

        if (!show && modalId === 'postular-modal') {
            const form = document.getElementById('form-postularme');
            if (form) form.reset();
        }
    }

    function cerrarTodosModales() {
        document.querySelectorAll('.rol-modal-overlay').forEach(modal => {
            modal.style.display = 'none';
            modal.classList.remove('show');
        });
        rolSeleccionadoTemp = null;
    }

    function abrirModalPostulacion(puesto, empresa, whatsappTel) {
        whatsappEmpleadorActual = whatsappTel && whatsappTel !== "undefined" ? whatsappTel : "5493513080197";
        tituloPuestoActual = `${puesto} — ${empresa}`;

        const titleEl = document.getElementById('modal-job-title');
        if (titleEl) titleEl.innerText = tituloPuestoActual;

        toggleModal('postular-modal', true);
    }

    function abrirModalPerfil() {
        const stepSelect = document.getElementById('rol-step-select');
        const stepConfirm = document.getElementById('rol-step-confirm');

        if (stepSelect) stepSelect.style.display = 'block';
        if (stepConfirm) stepConfirm.style.display = 'none';

        toggleModal('modal-cambiar-perfil', true);
    }

    // =========================================================================
    // 4. LÓGICA DE NEGOCIO & RENDERIZADO
    // =========================================================================
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
                    <button type="button" class="btn-postularme" data-action="postularse" data-puesto="${tituloEsc}" data-empresa="${empresaEsc}" data-tel="${telEsc}">
                        <i class="fab fa-whatsapp" style="margin-right: 0.4rem; font-size: 1rem;"></i> Postularme
                    </button>
                </div>
            </article>
        `}).join('');
    }

    function renderizarTalento(talento) {
        const contenedor = document.getElementById('grid-talento-destacado');
        if (!contenedor) return;

        contenedor.innerHTML = talento.map(t => {
            const nombreEsc = escapeHTML(t.nombre);
            const puestoEsc = escapeHTML(t.puesto);

            return `
            <div class="job-offer-card" style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <h4 style="color: var(--primary, #F39C12); font-size: 1.1rem;">${nombreEsc}</h4>
                    <span style="font-size: 0.75rem; background: rgba(46, 204, 113, 0.15); color: var(--salary-green, #2ecc71); padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 700;">Disponible</span>
                </div>
                <div>
                    <strong style="display: block; font-size: 0.95rem;">${puestoEsc}</strong>
                    <span style="font-size: 0.85rem; color: var(--text-muted, #aaa);">${escapeHTML(t.experiencia)}</span>
                </div>
                <div style="font-size: 0.82rem; color: var(--text-muted, #aaa); border-top: 1px solid var(--border-color, rgba(255,255,255,0.1)); padding-top: 0.5rem; width: 100%;">
                    <div><i class="fas fa-map-marker-alt" style="color: var(--primary, #F39C12);"></i> ${escapeHTML(t.zona)}</div>
                    <div style="margin-top: 0.2rem;"><i class="fas fa-user-clock" style="color: var(--primary, #F39C12);"></i> ${escapeHTML(t.disponibilidad)}</div>
                </div>
                <button type="button" class="btn-whatsapp" style="width: 100%; margin-top: 0.5rem; height: 38px; font-size: 0.78rem;" data-action="contactar-talento" data-nombre="${nombreEsc}" data-puesto="${puestoEsc}">
                    <i class="fab fa-whatsapp"></i> Contactar Perfil
                </button>
            </div>
        `}).join('');
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
                telefono: v.contacto_wa || v.telefono || "5493513080197"
            }));

            renderizarVacantes(listaVacantesBD);

        } catch (error) {
            console.warn("Base de datos no disponible localmente o error de lectura. Renderizando lista vacía.", error);
            renderizarVacantes([]);
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

    function cambiarModoCalculadora() {
        const tipo = getVal('calc-tipo');
        const grupoBase = document.getElementById('grupo-base-sueldo');
        const grupoJornada = document.getElementById('grupo-jornada-tipo');
        const grupoHoras = document.getElementById('grupo-horas-extra');

        const esJornada = (tipo === 'jornada');
        if (grupoBase) grupoBase.style.display = 'block';
        if (grupoJornada) grupoJornada.style.display = esJornada ? 'block' : 'none';
        if (grupoHoras) grupoHoras.style.display = esJornada ? 'none' : 'block';
    }

    function calcularHorariosSueldo() {
        const tipo = getVal('calc-tipo');
        const sueldoBase = parseFloat(getVal('calc-sueldo-base')) || 0;
        const outputDiv = document.getElementById('resultado-calculadora');
        const outputValor = document.getElementById('calc-output-valor');

        let resultado = 0;

        if (tipo === 'jornada') {
            const modalidad = getVal('calc-modalidad');
            if (modalidad === 'full') {
                resultado = sueldoBase;
            } else if (modalidad === 'part') {
                resultado = sueldoBase * 0.5;
            } else if (modalidad === 'franco') {
                resultado = (sueldoBase / 25) / 2;
            }
            if (outputValor) outputValor.innerText = `$ ${resultado.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
        } else {
            const horas = parseFloat(getVal('calc-cant-horas')) || 0;
            const valorHoraExtra = (sueldoBase / 200) * 1.5;
            resultado = valorHoraExtra * horas;
            if (outputValor) outputValor.innerText = `$ ${resultado.toLocaleString('es-AR', { maximumFractionDigits: 0 })} (Estimado X ${horas}hs)`;
        }

        if (outputDiv) outputDiv.style.display = 'block';
    }

    // =========================================================================
    // 5. DELEGACIÓN GLOBAL DE EVENTOS (ACCIONES DE USUARIO)
    // =========================================================================
    document.addEventListener('click', (e) => {
        // A. Abrir Modales
        const openBtn = e.target.closest('[data-modal-target]');
        if (openBtn) {
            e.preventDefault();
            toggleModal(openBtn.dataset.modalTarget, true);
            return;
        }

        // B. Cerrar Modales
        const closeBtn = e.target.closest('[data-modal-close]');
        if (closeBtn) {
            e.preventDefault();
            toggleModal(closeBtn.dataset.modalClose, false);
            return;
        }

        // C. Acciones específicas por atributo [data-action]
        const actionBtn = e.target.closest('[data-action]');
        if (actionBtn) {
            const action = actionBtn.dataset.action;

            if (action === 'postularse') {
                const { puesto, empresa, tel } = actionBtn.dataset;
                abrirModalPostulacion(puesto, empresa, tel);
            } else if (action === 'contactar-talento') {
                const { nombre, puesto } = actionBtn.dataset;
                const mensaje = `Hola Jobbers! 👋 Vimos el perfil destacado de *${nombre}* (${puesto}) en la plataforma y nos gustaría contactarlo/a para una entrevista.`;
                window.open(`https://wa.me/5493513080197?text=${encodeURIComponent(mensaje)}`, '_blank');
            } else if (action === 'abrir-modal-perfil') {
                e.preventDefault();
                abrirModalPerfil();
            } else if (action === 'seleccionar-rol') {
                rolSeleccionadoTemp = actionBtn.dataset.rol;
                const nombreRol = actionBtn.dataset.nombreRol;
                const stepSelect = document.getElementById('rol-step-select');
                const stepConfirm = document.getElementById('rol-step-confirm');
                const nombreConfirmar = document.getElementById('rol-nombre-confirmar');

                if (nombreConfirmar) {
                    nombreConfirmar.textContent = nombreRol || (rolSeleccionadoTemp === 'empresa' ? 'Busco Personal' : 'Postulante');
                }
                if (stepSelect) stepSelect.style.display = 'none';
                if (stepConfirm) stepConfirm.style.display = 'block';
            }
        }

        // D. Clic fuera del contenido del modal para cerrar (Overlay)
        if (e.target.classList.contains('rol-modal-overlay')) {
            cerrarTodosModales();
        }
    });

    // Eventos específicos de botones dentro del modal de roles
    document.getElementById('btn-volver-rol')?.addEventListener('click', () => {
        const stepSelect = document.getElementById('rol-step-select');
        const stepConfirm = document.getElementById('rol-step-confirm');
        if (stepConfirm) stepConfirm.style.display = 'none';
        if (stepSelect) stepSelect.style.display = 'block';
        rolSeleccionadoTemp = null;
    });

    document.getElementById('btn-confirmar-rol')?.addEventListener('click', () => {
        if (rolSeleccionadoTemp) {
            aplicarRol(rolSeleccionadoTemp);
            mostrarToast(`Perfil cambiado a ${rolSeleccionadoTemp === 'empresa' ? 'Empresa' : 'Postulante'}`);
            toggleModal('modal-cambiar-perfil', false);
        }
    });

    document.getElementById('btn-cerrar-modal')?.addEventListener('click', () => {
        if (!localStorage.getItem('jobbers_role')) aplicarRol('postulante');
        toggleModal('modal-cambiar-perfil', false);
    });

    // Tecla Escape para cerrar modales
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarTodosModales();
    });

    // =========================================================================
    // 6. FORMULARIOS & INTEGRACIONES DE WHATSAPP
    // =========================================================================
    document.getElementById('form-postularme')?.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = getVal('postular-nombre');
        const telefono = getVal('postular-phone');

        if (!nombre || !telefono) {
            mostrarToast('Completá tu nombre y teléfono para continuar.', 'error');
            return;
        }

        const mensaje = `Hola! Mi nombre es *${nombre}* (${telefono}). Me contacto a través de Jobbers para postularme a la búsqueda de *${tituloPuestoActual}*. Quedo a disposición y adjunto mi CV.`;
        const url = `https://wa.me/${whatsappEmpleadorActual}?text=${encodeURIComponent(mensaje)}`;

        window.open(url, '_blank');
        toggleModal('postular-modal', false);
    });

    document.getElementById('form-membresia-pro')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = getVal('pro-nombre');
        const puesto = getVal('pro-puesto');

        if (!nombre || !puesto) {
            mostrarToast('Por favor completá tu nombre y puesto.', 'error');
            return;
        }

        const mensaje = `Hola Jobbers! 👋 Me interesa adquirir la Membresía Jobbers PRO para destacar mi perfil.\n\n👤 *Nombre:* ${nombre}\n💼 *Puesto:* ${puesto}\n\nQuisiera coordinar el pago y la activación. ¡Gracias!`;
        const url = `https://wa.me/5493513080197?text=${encodeURIComponent(mensaje)}`;

        window.open(url, '_blank');
        toggleModal('modal-membresia-pro', false);
    });

    document.getElementById('form-publicar-express')?.addEventListener('submit', (e) => {
        e.preventDefault();

        const empresa = getVal('nombre-empresa');
        const telefono = getVal('telefono-contacto');
        const puesto = getVal('puesto-requerido');
        const zona = getVal('zona-local');
        const turno = getVal('turno-puesto');
        const jornada = getVal('jornada-puesto');
        const requisitos = getVal('requisitos-puesto');

        if (!empresa || !telefono || !puesto || !zona || !turno || !jornada) {
            mostrarToast('Por favor, completá todos los campos obligatorios.', 'error');
            return;
        }

        let mensaje = `Hola Jobbers! 👋 Queremos publicar la siguiente búsqueda urgente:\n\n` +
                      `🏢 *Local/Empresa:* ${empresa}\n` +
                      `💼 *Puesto:* ${puesto}\n` +
                      `📍 *Zona:* ${zona}\n` +
                      `⏰ *Turno:* ${turno}\n` +
                      `⏳ *Jornada:* ${jornada}\n`;

        if (requisitos) mensaje += `📝 *Requisitos:* ${requisitos}\n`;
        mensaje += `📱 *Contacto Directo:* ${telefono}\n\nQuedo a la espera de la publicación. ¡Gracias!`;

        const url = `https://wa.me/5493513080197?text=${encodeURIComponent(mensaje)}`;

        mostrarToast('Redirigiendo a WhatsApp...', 'success');
        setTimeout(() => {
            window.open(url, '_blank');
            e.target.reset();
        }, 800);
    });

    // Eventos de la calculadora de sueldos
    document.getElementById('calc-tipo')?.addEventListener('change', cambiarModoCalculadora);
    document.getElementById('btn-calcular-sueldo')?.addEventListener('click', calcularHorariosSueldo);

    // =========================================================================
    // 7. BÚSQUEDA & FILTRADO
    // =========================================================================
    const inputBuscador = document.getElementById('job-search-input');
    const btnBuscador = document.querySelector('.btn-search');
    const categoryChips = document.querySelectorAll('.btn-categoria');

    function normalizarCategoria(cat) {
        const c = normalizarTexto(cat);
        if (!c || c.includes('todas')) return 'todas';
        if (c.includes('cocin')) return 'cocina';
        if (c.includes('salon') || c.includes('mozo')) return 'salon';
        if (c.includes('bar')) return 'barra';
        if (c.includes('delivery')) return 'delivery';
        if (c.includes('limpieza') || c.includes('bach')) return 'limpieza';
        if (c.includes('rrhh')) return 'rrhh';
        return c;
    }

    function filtrarEmpleos() {
        const termino = normalizarTexto(inputBuscador ? inputBuscador.value : '');

        const resultados = listaVacantesBD.filter(v => {
            const titulo = normalizarTexto(v.titulo);
            const empresa = normalizarTexto(v.empresa);
            const zona = normalizarTexto(v.zona);
            const catVacante = normalizarCategoria(v.categoria || v.titulo);

            const coincideTexto = !termino || titulo.includes(termino) || empresa.includes(termino) || zona.includes(termino);
            const coincideCategoria = (categoriaActual === 'todas') || (catVacante === categoriaActual) || titulo.includes(categoriaActual);

            return coincideTexto && coincideCategoria;
        });

        renderizarVacantes(resultados);
    }

    inputBuscador?.addEventListener('input', debounce(filtrarEmpleos, 200));

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

    // Dropdown del Menú Recursos
    const dropdownToggle = document.getElementById('dropdown-recursos');
    const dropdownMenu = document.getElementById('menu-recursos');

    dropdownToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu?.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (dropdownMenu && !dropdownMenu.contains(e.target) && !dropdownToggle?.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // =========================================================================
    // 8. INICIALIZACIÓN
    // =========================================================================
    async function init() {
        const rolGuardado = localStorage.getItem('jobbers_role');

        await cargarVacantes();
        renderizarTalento(MOCK_TALENTO);

        if (rolGuardado) {
            aplicarRol(rolGuardado);
            toggleModal('modal-cambiar-perfil', false);
        } else {
            aplicarRol('postulante');
            abrirModalPerfil();
        }
    }

    await init();
});
