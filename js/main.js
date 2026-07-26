/* ==========================================================================
   JOBBERS - LÓGICA COMPLETA DE INTERFAZ, OFERTAS Y MODALES
   ========================================================================== */

// 1. OFERTAS DE EJEMPLO GASTRONÓMICAS
const vacantesGlobales = [
    {
        id: 1,
        titulo: "Cocinero / Cocinera de Despacho",
        empresa: "La Caprichosa Resto",
        ubicacion: "Nueva Córdoba",
        tipo_jornada: "Tiempo completo",
        turno: "Turno Noche",
        salario: "$450.000 / mes",
        urgente: 1,
        fecha: "Hace 1h",
        categoria: "Cocina"
    },
    {
        id: 2,
        titulo: "Mozo / Salonero con Experiencia",
        empresa: "Bar de Fuegos",
        ubicacion: "Güemes",
        tipo_jornada: "Part-time",
        turno: "Turno Noche",
        salario: "$280.000 + Propinas",
        urgente: 0,
        fecha: "Hace 3h",
        categoria: "Mozo"
    },
    {
        id: 3,
        titulo: "Barista Profesional",
        empresa: "Café Suburbio",
        ubicacion: "General Paz",
        tipo_jornada: "Tiempo completo",
        turno: "Turno Mañana",
        salario: "$390.000 / mes",
        urgente: 0,
        fecha: "Hace 5h",
        categoria: "Barista"
    },
    {
        id: 4,
        titulo: "Bartender de Coctelería de Autor",
        empresa: "SpeakEasy Club",
        ubicacion: "Güemes",
        tipo_jornada: "Fines de semana",
        turno: "Turno Noche",
        salario: "$320.000 + Propinas",
        urgente: 1,
        fecha: "Hace 12h",
        categoria: "Bartender"
    },
    {
        id: 5,
        titulo: "Cajero / Manejo de Sistemas Posnet",
        empresa: "Pizzería Don Luiggi",
        ubicacion: "Centro",
        tipo_jornada: "Tiempo completo",
        turno: "Turno Tarde",
        salario: "$360.000 / mes",
        urgente: 0,
        fecha: "Hace 1 día",
        categoria: "Cajero"
    },
    {
        id: 6,
        titulo: "Repartidor / Delivery con Moto",
        empresa: "Sushi & Roll",
        ubicacion: "Nueva Córdoba",
        tipo_jornada: "Part-time",
        turno: "Turno Noche",
        salario: "$250.000 + Viáticos",
        urgente: 1,
        fecha: "Hace 1 día",
        categoria: "Delivery"
    }
];

document.addEventListener('DOMContentLoaded', () => {
    actualizarBarraNavegacion();
    renderizarTarjetasVacantes(vacantesGlobales);

    // Formulario de envío express por WhatsApp
    const expressForm = document.getElementById('express-form');
    if (expressForm) {
        expressForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const puesto = document.getElementById('puesto')?.value || "Personal";
            const zona = document.getElementById('zona')?.value || "Córdoba";
            const turno = document.getElementById('turno')?.value || "Indistinto";
            
            const numeroWhatsApp = "5493513080197"; // Cambiar por tu número real
            const mensaje = encodeURIComponent(`Hola Jobbers! Necesito un/a *${puesto}* para la zona de *${zona}* en *${turno}*. ¿Me podrían ayudar a conseguir postulantes?`);
            
            mostrarToast("Redirigiendo a WhatsApp...", "info");
            window.open(`https://wa.me/${numeroWhatsApp}?text=${mensaje}`, '_blank', 'noopener,noreferrer');
        });
    }

    // Scroll suave para enlaces de navegación
    document.querySelectorAll('.nav-link, .bottom-nav-item, a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href && href.startsWith('#') && href.length > 1) {
                const targetElement = document.querySelector(href);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // Eventos para cerrar Modal o Dropdown al hacer clic fuera o apretar ESC
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('modal');
        if (e.target === modal) cerrarModal();

        const dropdownMenu = document.getElementById('recursos-menu');
        if (dropdownMenu && !e.target.closest('.dropdown')) {
            cerrarDropdown();
        }
    });

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModal();
            cerrarDropdown();
        }
    });
});

/* ==========================================================================
   MODAL COMPLETO DE INGRESO / REGISTRO
   ========================================================================== */

function abrirModal(tipo, ofertaId = null) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    if (!modal || !body) return;

    let contenidoHTML = '';

    if (tipo === 'login') {
        contenidoHTML = `
            <div class="modal-header" style="text-align:center; margin-bottom: 1.2rem;">
                <h3 style="font-size:1.4rem; font-weight:800; color:#fff; margin-bottom:0.3rem;">¡Hola! Ingresá a Jobbers</h3>
                <p style="color:var(--text-muted, #aaa); font-size:0.85rem; margin:0;">Iniciá sesión o registrate para continuar</p>
            </div>

            <!-- Selector de Rol -->
            <div style="display:flex; background:#18181b; padding:4px; border-radius:8px; margin-bottom:1.2rem; border:1px solid #27272a;">
                <button type="button" id="tab-postulante" onclick="cambiarTabAuth('postulante')" style="flex:1; padding:8px; border:none; border-radius:6px; background:#f59e0b; color:#000; font-weight:bold; cursor:pointer; font-size:0.85rem;">Soy Postulante</button>
                <button type="button" id="tab-empleador" onclick="cambiarTabAuth('empleador')" style="flex:1; padding:8px; border:none; border-radius:6px; background:transparent; color:#aaa; font-weight:bold; cursor:pointer; font-size:0.85rem;">Soy Empresa</button>
            </div>

            <!-- Formulario de Ingreso -->
            <form id="form-auth" class="express-form" onsubmit="procesarAutenticacion(event)">
                <input type="hidden" id="auth-rol" value="postulante">
                
                <div class="form-group" style="margin-bottom:0.8rem;">
                    <label style="display:block; font-size:0.8rem; color:#aaa; margin-bottom:4px;">Correo electrónico</label>
                    <input type="email" id="auth-email" placeholder="ejemplo@correo.com" required autofocus style="width:100%; padding:10px; border-radius:6px; border:1px solid #3f3f46; background:#18181b; color:#fff;">
                </div>
                
                <div class="form-group" style="margin-bottom:1.2rem;">
                    <label style="display:block; font-size:0.8rem; color:#aaa; margin-bottom:4px;">Contraseña</label>
                    <input type="password" id="auth-password" placeholder="••••••••" required style="width:100%; padding:10px; border-radius:6px; border:1px solid #3f3f46; background:#18181b; color:#fff;">
                </div>

                <button type="submit" class="btn-whatsapp" style="width:100%; padding:12px; font-weight:bold; background:#f59e0b; color:#000; border:none; border-radius:6px; cursor:pointer;">
                    INGRESAR
                </button>
            </form>

            <div style="text-align:center; border-top:1px solid #27272a; margin-top:1.2rem; padding-top:1rem;">
                <p style="font-size:0.8rem; color:#aaa; margin:0;">
                    ¿Buscás personal urgente? <a href="#express-form-section" onclick="cerrarModal()" style="color:#25D366; font-weight:700; text-decoration:none;">Publicá sin registro</a>
                </p>
            </div>
        `;
    } else if (tipo === 'postular') {
        const oferta = vacantesGlobales.find(v => v.id === ofertaId);
        if (oferta) {
            contenidoHTML = `
                <div class="modal-header" style="margin-bottom:1rem;">
                    <h3 style="font-size:1.2rem; color:#fff; margin-bottom:0.2rem;">Postularme a ${escapeHTML(oferta.titulo)}</h3>
                    <p style="color:#aaa; font-size:0.85rem; margin:0;">Empresa: <strong style="color:#f59e0b;">${escapeHTML(oferta.empresa)}</strong> (${escapeHTML(oferta.ubicacion)})</p>
                </div>
                <form id="form-postulacion" class="express-form" onsubmit="procesarPostulacion(event, ${oferta.id})">
                    <div class="form-group" style="margin-bottom:0.8rem;">
                        <input type="text" id="post-nombre" placeholder="Nombre completo" required autofocus style="width:100%; padding:10px; border-radius:6px; border:1px solid #3f3f46; background:#18181b; color:#fff;">
                    </div>
                    <div class="form-group" style="margin-bottom:0.8rem;">
                        <input type="tel" id="post-telefono" placeholder="Número de WhatsApp" required style="width:100%; padding:10px; border-radius:6px; border:1px solid #3f3f46; background:#18181b; color:#fff;">
                    </div>
                    <div class="form-group" style="margin-bottom:0.8rem;">
                        <input type="email" id="post-email" placeholder="Correo electrónico" required style="width:100%; padding:10px; border-radius:6px; border:1px solid #3f3f46; background:#18181b; color:#fff;">
                    </div>
                    <button type="submit" class="btn-whatsapp" style="margin-top:0.5rem; width:100%; padding:12px; font-weight:bold; background:#25D366; color:#fff; border:none; border-radius:6px; cursor:pointer;">
                        ENVIAR MI POSTULACIÓN
                    </button>
                </form>
            `;
        }
    }

    body.innerHTML = contenidoHTML;
    modal.style.display = "flex";
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
}

function cambiarTabAuth(rol) {
    document.getElementById('auth-rol').value = rol;
    const tabPostulante = document.getElementById('tab-postulante');
    const tabEmpleador = document.getElementById('tab-empleador');

    if (rol === 'postulante') {
        tabPostulante.style.background = '#f59e0b';
        tabPostulante.style.color = '#000';
        tabEmpleador.style.background = 'transparent';
        tabEmpleador.style.color = '#aaa';
    } else {
        tabEmpleador.style.background = '#f59e0b';
        tabEmpleador.style.color = '#000';
        tabPostulante.style.background = 'transparent';
        tabPostulante.style.color = '#aaa';
    }
}

function procesarAutenticacion(event) {
    event.preventDefault();
    const email = document.getElementById('auth-email').value;
    const rol = document.getElementById('auth-rol').value;
    
    const nombreExtraido = email.split('@')[0];
    const nombreFormateado = nombreExtraido.charAt(0).toUpperCase() + nombreExtraido.slice(1);

    const usuario = {
        nombre: nombreFormateado,
        email: email,
        rol: rol
    };

    localStorage.setItem('jobbers_user', JSON.stringify(usuario));
    actualizarBarraNavegacion();
    cerrarModal();
    mostrarToast(`¡Bienvenido/a, ${nombreFormateado}!`, 'success');
}

function cerrarModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.style.display = "none";
        modal.classList.remove('show');
        modal.setAttribute('aria-hidden', 'true');
    }
}

function procesarPostulacion(event, ofertaId) {
    event.preventDefault();
    const nombre = document.getElementById('post-nombre').value;
    cerrarModal();
    mostrarToast(`¡Gracias ${nombre}! Tu postulación fue registrada con éxito.`, 'success');
}

function cerrarSesion() {
    localStorage.removeItem('jobbers_user');
    actualizarBarraNavegacion();
    mostrarToast('Sesión cerrada correctamente.', 'info');
}

function actualizarBarraNavegacion() {
    const navActions = document.getElementById('nav-actions');
    if (!navActions) return;
    
    let usuarioSesion = null;
    try {
        usuarioSesion = JSON.parse(localStorage.getItem('jobbers_user'));
    } catch (e) {
        console.error("Error al leer la sesión de localStorage", e);
    }

    if (usuarioSesion && usuarioSesion.nombre) {
        navActions.innerHTML = `
            <div style="display:flex; align-items:center; gap:10px;">
                <span class="user-welcome" style="font-size:0.85rem; color:#aaa;">
                    Hola, <strong style="color:#fff;">${escapeHTML(usuarioSesion.nombre)}</strong>
                </span>
                <button type="button" class="btn-login" onclick="cerrarSesion()" style="padding:6px 12px; font-size:0.8rem; border-radius:4px; cursor:pointer;">Salir</button>
            </div>
        `;
    } else {
        navActions.innerHTML = `
            <button type="button" class="btn-login" onclick="abrirModal('login')">Ingresar</button>
        `;
    }
}

/* ==========================================================================
   RENDERIZADO DE VACANTES & FILTROS DE BÚSQUEDA
   ========================================================================== */

function renderizarTarjetasVacantes(ofertas) {
    const container = document.getElementById('vacantes-container');
    if (!container) return;

    if (!ofertas || ofertas.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; padding:2rem; color:#aaa;">
                <p>No se encontraron vacantes con esa búsqueda.</p>
                <button onclick="document.getElementById('search-filter').value=''; filtrarVacantes();" style="background:#f59e0b; border:none; padding:8px 16px; border-radius:4px; font-weight:bold; cursor:pointer; margin-top:8px;">Ver todas las ofertas</button>
            </div>
        `;
        return;
    }

    container.innerHTML = ofertas.map(o => `
        <div class="vacante-card" style="background:#18181b; border:1px solid #27272a; border-radius:8px; padding:16px; margin-bottom:12px; cursor:pointer;" onclick="abrirModal('postular', ${o.id})">
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:8px;">
                <div>
                    <h3 style="color:#fff; margin:0 0 4px 0; font-size:1.1rem; font-weight:700;">${escapeHTML(o.titulo)}</h3>
                    <p style="color:#aaa; margin:0; font-size:0.85rem;">
                        <strong style="color:#f59e0b;">${escapeHTML(o.empresa)}</strong> • 📍 ${escapeHTML(o.ubicacion)}
                    </p>
                </div>
                ${o.urgente ? '<span style="background:#ef4444; color:#fff; font-size:0.7rem; font-weight:bold; padding:2px 8px; border-radius:12px;">⚡ URGENTE</span>' : ''}
            </div>
            
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin:10px 0;">
                <span style="background:#27272a; color:#ccc; font-size:0.75rem; padding:4px 8px; border-radius:4px;">⏱️ ${escapeHTML(o.tipo_jornada)}</span>
                <span style="background:#27272a; color:#ccc; font-size:0.75rem; padding:4px 8px; border-radius:4px;">🌙 ${escapeHTML(o.turno)}</span>
                <span style="background:#064e3b; color:#10b981; font-size:0.75rem; font-weight:bold; padding:4px 8px; border-radius:4px;">💵 ${escapeHTML(o.salario)}</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:12px; font-size:0.8rem; color:#888;">
                <span>Publicado ${escapeHTML(o.fecha)}</span>
                <span style="color:#f59e0b; font-weight:bold;">Postularme &rarr;</span>
            </div>
        </div>
    `).join('');
}

function filtrarVacantes() {
    const input = document.getElementById('search-filter');
    if (!input) return;
    
    const query = input.value.toLowerCase().trim();
    const filtradas = vacantesGlobales.filter(v => 
        v.titulo.toLowerCase().includes(query) || 
        v.empresa.toLowerCase().includes(query) ||
        v.ubicacion.toLowerCase().includes(query) ||
        (v.categoria && v.categoria.toLowerCase().includes(query))
    );
    renderizarTarjetasVacantes(filtradas);
}

/* ==========================================================================
   HELPERS & DROPDOWNS
   ========================================================================== */

function toggleDropdown(e) {
    if (e) e.preventDefault();
    const dropdownMenu = document.getElementById('recursos-menu');
    if (dropdownMenu) {
        dropdownMenu.classList.toggle('show');
    }
}

function cerrarDropdown() {
    const dropdownMenu = document.getElementById('recursos-menu');
    if (dropdownMenu) dropdownMenu.classList.remove('show');
}

function escapeHTML(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ==========================================================================
   SISTEMA DE TOASTS
   ========================================================================== */

function mostrarToast(mensaje, tipo = 'info') {
    let container = document.getElementById('toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    
    let bg = '#181b20';
    let border = '#27272a';
    if (tipo === 'success') { bg = '#064e3b'; border = '#10b981'; }
    if (tipo === 'info') { bg = '#1e3a8a'; border = '#3b82f6'; }

    toast.style.cssText = `
        background: ${bg};
        border: 1px solid ${border};
        color: #ffffff;
        padding: 0.75rem 1.2rem;
        border-radius: 8px;
        font-size: 0.85rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    `;
    
    toast.innerHTML = `<span>${escapeHTML(mensaje)}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3500);
}
