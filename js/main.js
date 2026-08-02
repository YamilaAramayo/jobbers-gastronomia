/**
 * JOBBERS ARGENTINA - Portal de Empleo Gastronómico
 * Lógica principal: Gestión de Roles (Postulante / Empresa), Renderizado Dinámico,
 * Búsqueda/Filtro, Integración WhatsApp, Modales, Dropdowns y Toasts.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------------------
    // 1. DATOS SIMULADOS (MOCK DATA)
    // -------------------------------------------------------------------------
    const MOCK_VACANTES = [
        {
            id: 1,
            titulo: "Cocinero / Cocinera de Minutas y Plancha",
            empresa: "Bar Güemes Resto",
            zona: "Güemes",
            turno: "Noche",
            jornada: "Full Time",
            sueldo: "$450.000 - $550.000",
            urgente: true,
            tiempo: "Publicado hace 2 horas",
            telefono: "5493513080197"
        },
        {
            id: 2,
            titulo: "Mozo / Moza para Salón y Terraza",
            empresa: "Bistró General Paz",
            zona: "General Paz",
            turno: "Tarde/Noche",
            jornada: "Full Time",
            sueldo: "$400.000 + Propinas",
            urgente: false,
            tiempo: "Publicado hace 5 horas",
            telefono: "5493513080197"
        },
        {
            id: 3,
            titulo: "Barista Profesional Especialidad",
            empresa: "Café de Especialidad",
            zona: "Nueva Córdoba",
            turno: "Mañana",
            jornada: "Part Time",
            sueldo: "A convenir",
            urgente: true,
            tiempo: "Publicado hoy",
            telefono: "5493513080197"
        },
        {
            id: 4,
            titulo: "Bachero / Ayudante de Cocina",
            empresa: "Pizzería Tradicional",
            zona: "Centro",
            turno: "Noche",
            jornada: "Franco / Refuerzo",
            sueldo: "$25.000 por turno",
            urgente: false,
            tiempo: "Publicado ayer",
            telefono: "5493513080197"
        }
    ];

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

    // -------------------------------------------------------------------------
    // 2. GESTIÓN Y CAMBIO DE ROLES (POSTULANTE / EMPRESA)
    // -------------------------------------------------------------------------
    let rolSeleccionadoTemp = null;

    // Control de Modales
    const modalPerfil = document.getElementById('modal-cambiar-perfil');
    const stepSelect = document.getElementById('rol-step-select');
    const stepConfirm = document.getElementById('rol-step-confirm');
    const nombreConfirmar = document.getElementById('rol-nombre-confirmar');

    function initRol() {
        const rolGuardado = localStorage.getItem('jobbers_role');
        
        // Renderizamos ambos contenedores al iniciar para garantizar datos al alternar
        renderizarVacantes(MOCK_VACANTES);
        renderizarTalento(MOCK_TALENTO);
        
        if (rolGuardado) {
            // Usuario recurrente: aplicamos su rol guardado y nos aseguramos de cerrar el modal
            aplicarRol(rolGuardado);
            cerrarModalPerfil();
        } else {
            // Primera visita: aplicamos un rol visual base y desplegamos el modal automáticamente
            aplicarRol('postulante');
            abrirModalPerfil();
        }
    }

    function aplicarRol(rol) {
        document.body.classList.remove('role-postulante', 'role-empresa');
        document.body.classList.add(`role-${rol}`);
        localStorage.setItem('jobbers_role', rol);

        // Actualizar etiquetas en pantalla
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
    }

    function cerrarModalPerfil() {
        if (!modalPerfil) return;
        modalPerfil.style.display = 'none';
        rolSeleccionadoTemp = null;
    }

    // Eventos de Cambio de Perfil (Navbar, Footer, etc.)
    document.querySelectorAll('.btn-cambiar-rol, #btn-cambiar-perfil').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            abrirModalPerfil();
        });
    });

    document.getElementById('btn-cerrar-modal')?.addEventListener('click', () => {
        // Si cierra con la 'X' sin elegir rol en primera visita, mantiene 'postulante' por defecto
        if (!localStorage.getItem('jobbers_role')) {
            localStorage.setItem('jobbers_role', 'postulante');
        }
        cerrarModalPerfil();
    });

    modalPerfil?.addEventListener('click', (e) => {
        if (e.target === modalPerfil) {
            if (!localStorage.getItem('jobbers_role')) {
                localStorage.setItem('jobbers_role', 'postulante');
            }
            cerrarModalPerfil();
        }
    });

    document.querySelectorAll('.btn-rol').forEach(btn => {
        btn.addEventListener('click', () => {
            rolSeleccionadoTemp = btn.getAttribute('data-rol');
            const nombreRol = btn.getAttribute('data-nombre');
            
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
            mostrarToast(`Perfil cambiado a ${rolSeleccionadoTemp === 'empresa' ? 'Empresa' : 'Postulante'}`);
            cerrarModalPerfil();
        }
    });

    // -------------------------------------------------------------------------
    // 3. RENDERIZADO DINÁMICO DE VACANTES Y TALENTO
    // -------------------------------------------------------------------------
    function renderizarVacantes(vacantes) {
        const contenedor = document.getElementById('lista-vacantes');
        if (!contenedor) return;

        if (vacantes.length === 0) {
            contenedor.innerHTML = `
                <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted, #888);">
                    <i class="fas fa-search" style="font-size: 2rem; margin-bottom: 1rem; color: var(--primary, #00e676);"></i>
                    <p>No encontramos búsquedas que coincidan con tu criterio.</p>
                </div>`;
            return;
        }

        contenedor.innerHTML = vacantes.map(v => `
            <article class="job-offer-card">
                <div class="job-info-main">
                    <div class="job-header-row">
                        <h4>${v.titulo}</h4>
                        ${v.urgente ? `<span class="badge-urgente"><i class="fas fa-bolt"></i> Urgente</span>` : ''}
                    </div>
                    
                    <span class="job-company">${v.empresa}</span>

                    <div class="job-details-row">
                        <span><i class="fas fa-map-marker-alt"></i> ${v.zona}</span>
                        <span><i class="fas fa-clock"></i> ${v.turno}</span>
                        <span><i class="fas fa-briefcase"></i> ${v.jornada}</span>
                        <span class="job-salary"><i class="fas fa-dollar-sign"></i> ${v.sueldo}</span>
                    </div>
                </div>

                <div class="job-action-col">
                    <span class="job-time">${v.tiempo}</span>
                    <button type="button" class="btn-postularme" onclick="postularmeWhatsApp('${v.titulo}', '${v.empresa}', '${v.telefono}')">
                        <i class="fab fa-whatsapp" style="margin-right: 0.4rem; font-size: 1rem;"></i> Postularme
                    </button>
                </div>
            </article>
        `).join('');
    }

    function renderizarTalento(talento) {
        const contenedor = document.getElementById('grid-talento-destacado');
        if (!contenedor) return;

        contenedor.innerHTML = talento.map(t => `
            <div class="job-offer-card" style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.75rem;">
                <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                    <h4 style="color: var(--primary, #00e676); font-size: 1.1rem;">${t.nombre}</h4>
                    <span style="font-size: 0.75rem; background: rgba(46, 204, 113, 0.15); color: #2ecc71; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 700;">Disponible</span>
                </div>
                <div>
                    <strong style="display: block; font-size: 0.95rem;">${t.puesto}</strong>
                    <span style="font-size: 0.85rem; color: #aaa;">${t.experiencia}</span>
                </div>
                <div style="font-size: 0.82rem; color: #aaa; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.5rem; width: 100%;">
                    <div><i class="fas fa-map-marker-alt" style="color: var(--primary, #00e676);"></i> ${t.zona}</div>
                    <div style="margin-top: 0.2rem;"><i class="fas fa-user-clock" style="color: var(--primary, #00e676);"></i> ${t.disponibilidad}</div>
                </div>
                <button type="button" class="btn-whatsapp" style="width: 100%; margin-top: 0.5rem; height: 38px; font-size: 0.78rem;" onclick="contactarTalento('${t.nombre}', '${t.puesto}')">
                    <i class="fab fa-whatsapp"></i> Contactar Perfil
                </button>
            </div>
        `).join('');
    }

    // -------------------------------------------------------------------------
    // 4. BUSCADOR EN TIEMPO REAL
    // -------------------------------------------------------------------------
    const inputBuscador = document.getElementById('job-search-input');
    const btnBuscador = document.querySelector('.btn-search');

    function filtrarEmpleos() {
        if (!inputBuscador) return;
        const termino = inputBuscador.value.toLowerCase().trim();

        const resultados = MOCK_VACANTES.filter(v => 
            v.titulo.toLowerCase().includes(termino) ||
            v.empresa.toLowerCase().includes(termino) ||
            v.zona.toLowerCase().includes(termino)
        );

        renderizarVacantes(resultados);
    }

    inputBuscador?.addEventListener('input', filtrarEmpleos);
    btnBuscador?.addEventListener('click', filtrarEmpleos);

    // -------------------------------------------------------------------------
    // 5. ENVÍO DE FORMULARIO EXPRESS (EMPRESA -> WHATSAPP)
    // -------------------------------------------------------------------------
    const formExpress = document.getElementById('form-publicar-express');

    formExpress?.addEventListener('submit', (e) => {
        e.preventDefault();

        const empresa = document.getElementById('nombre-empresa').value.trim();
        const telefono = document.getElementById('telefono-contacto').value.trim();
        const puesto = document.getElementById('puesto-requerido').value;
        const zona = document.getElementById('zona-local').value;
        const turno = document.getElementById('turno-puesto').value;
        const jornada = document.getElementById('jornada-puesto').value;

        if (!empresa || !telefono || !puesto || !zona || !turno || !jornada) {
            mostrarToast('Por favor, completá todos los campos.', 'error');
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
        
        mostrarToast('Redirigiendo a WhatsApp...', 'success');
        setTimeout(() => {
            window.open(url, '_blank');
            formExpress.reset();
        }, 1000);
    });

    // -------------------------------------------------------------------------
    // 6. ACCIONES DE WHATSAPP GLOBAL
    // -------------------------------------------------------------------------
    window.postularmeWhatsApp = function(titulo, empresa, telefono) {
        const mensaje = `Hola! 👋 Me interesa postularme a la vacante de *${titulo}* publicada para *${empresa}* a través de Jobbers. ¿Sigue disponible?`;
        const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };

    window.contactarTalento = function(nombre, puesto) {
        const mensaje = `Hola Jobbers! 👋 Vimos el perfil destacado de *${nombre}* (${puesto}) en la plataforma y nos gustaría contactarlo/a para una entrevista.`;
        const url = `https://wa.me/5493513080197?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    };

    // -------------------------------------------------------------------------
    // 7. DROPDOWN DE RECURSOS & INTERACTIVIDAD
    // -------------------------------------------------------------------------
    const dropdownToggle = document.getElementById('dropdown-recursos');
    const dropdownMenu = document.getElementById('menu-recursos');

    dropdownToggle?.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu?.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (dropdownMenu && !dropdownMenu.contains(e.target) && !dropdownToggle.contains(e.target)) {
            dropdownMenu.classList.remove('show');
        }
    });

    // -------------------------------------------------------------------------
    // 8. SISTEMA DE NOTIFICACIONES TOAST
    // -------------------------------------------------------------------------
    function mostrarToast(mensaje, tipo = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `jobbers-toast ${tipo}`;
        
        const icono = tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toast.innerHTML = `<i class="fas ${icono}"></i> <span>${mensaje}</span>`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(50px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Inicializar app
    initRol();
});
