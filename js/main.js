// ==========================================
// 1. DATOS DE EJEMPLO (OFERTAS DE EMPLEO)
// ==========================================
const vacantesEjemplo = [
    {
        id: 1,
        puesto: "Cocinero / Cocinera de Despacho",
        empresa: "La Caprichosa Resto",
        zona: "Nueva Córdoba",
        modalidad: "Full Time",
        turno: "Noche",
        salario: "$450.000 / mes",
        tiempo: "Hace 2 horas",
        descripcion: "Buscamos cocinero con experiencia comprobable en minuta y despacho rápido. Excelente ambiente laboral.",
        categoria: "Cocina"
    },
    {
        id: 2,
        puesto: "Mozo / Salonero",
        empresa: "Bar de Fuegos",
        zona: "Güemes",
        modalidad: "Part Time",
        turno: "Noche",
        salario: "$280.000 + Propinas",
        tiempo: "Hace 5 horas",
        descripcion: "Atención al cliente, manejo de bandeja y sistema Posnet. Buenas relaciones interpersonales.",
        categoria: "Mozo"
    },
    {
        id: 3,
        puesto: "Barista Profesional",
        empresa: "Café de Especialidad Suburbio",
        zona: "General Paz",
        modalidad: "Full Time",
        turno: "Mañana",
        salario: "$390.000 / mes",
        tiempo: "Hace 1 día",
        descripcion: "Experiencia en calibración de molino, arte latte y manejo de máquina espresso. Pasión por el café.",
        categoria: "Barista"
    },
    {
        id: 4,
        puesto: "Bartender Principal",
        empresa: "SpeakEasy Club",
        zona: "Güemes",
        modalidad: "Turno Noche",
        turno: "Fin de Semana",
        salario: "$320.000 + Propinas",
        tiempo: "Hace 1 día",
        descripcion: "Coctelería de autor y clásica. Control de stock de barra y excelente predisposición.",
        categoria: "Bartender"
    },
    {
        id: 5,
        puesto: "Cajero / Manejo de Caja",
        empresa: "Pizzería Don Luiggi",
        zona: "Centro",
        modalidad: "Full Time",
        turno: "Tarde/Noche",
        salario: "$360.000 / mes",
        tiempo: "Hace 2 días",
        descripcion: "Arqueo de caja, cobranza en efectivo/tarjetas y atención a apps de delivery (Pedidostya/Rappi).",
        categoria: "Cajero"
    },
    {
        id: 6,
        puesto: "Repartidor con Moto",
        empresa: "Sushi & Roll",
        zona: "Nueva Córdoba",
        modalidad: "Por Horas",
        turno: "Noche",
        salario: "$250.000 + Envíos",
        tiempo: "Hace 3 días",
        descripcion: "Se requiere moto propia con documentación al día. Zona de cobertura reducida.",
        categoria: "Delivery"
    }
];

let vacantesActuales = [...vacantesEjemplo];

// ==========================================
// 2. RENDEREIZAR VACANTES EN EL HTML
// ==========================================
function renderizarVacantes(lista) {
    const contenedor = document.getElementById("vacantes-container");
    if (!contenedor) return;

    if (lista.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 2rem; color: #aaa;">
                <i class="fa-solid fa-magnifying-glass-minus" style="font-size: 2rem; margin-bottom: 10px;"></i>
                <p>No se encontraron ofertas que coincidan con tu búsqueda.</p>
            </div>
        `;
        return;
    }

    contenedor.innerHTML = lista.map(v => `
        <article class="job-card" style="background: #1e1e1e; border: 1px solid #333; border-radius: 8px; padding: 16px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 10px;">
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <h3 style="color: #fff; margin: 0 0 4px 0; font-size: 1.1rem;">${v.puesto}</h3>
                    <p style="color: #ff9900; font-weight: bold; margin: 0; font-size: 0.9rem;">${v.empresa}</p>
                </div>
                <span style="font-size: 0.8rem; color: #888;">${v.tiempo}</span>
            </div>
            
            <p style="color: #ccc; font-size: 0.85rem; margin: 0;">${v.descripcion}</p>
            
            <div style="display: flex; gap: 10px; flex-wrap: wrap; font-size: 0.8rem; color: #aaa;">
                <span><i class="fa-solid fa-location-dot"></i> ${v.zona}</span>
                <span><i class="fa-solid fa-briefcase"></i> ${v.modalidad}</span>
                <span><i class="fa-regular fa-clock"></i> ${v.turno}</span>
                <span style="color: #2eb85c; font-weight: bold;">${v.salario}</span>
            </div>

            <div style="margin-top: 5px; display: flex; justify-content: flex-end;">
                <button type="button" class="btn-primary" style="padding: 6px 16px; font-size: 0.85rem;" onclick="postularse('${v.puesto}', '${v.empresa}')">
                    Postularme
                </button>
            </div>
        </article>
    `).join('');
}

// ==========================================
// 3. BUSCADOR Y FILTRADO
// ==========================================
function filtrarVacantes() {
    const input = document.getElementById("search-filter");
    if (!input) return;
    
    const texto = input.value.toLowerCase().trim();

    const filtradas = vacantesEjemplo.filter(v => 
        v.puesto.toLowerCase().includes(texto) ||
        v.empresa.toLowerCase().includes(texto) ||
        v.zona.toLowerCase().includes(texto) ||
        v.categoria.toLowerCase().includes(texto)
    );

    renderizarVacantes(filtradas);
}

// ==========================================
// 4. FORMULARIO EXPRESS (ENVIAR A WHATSAPP)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Render inicial
    renderizarVacantes(vacantesEjemplo);

    const expressForm = document.getElementById("express-form");
    if (expressForm) {
        expressForm.addEventListener("submit", (e) => {
            e.preventDefault();

            const puesto = document.getElementById("puesto").value;
            const zona = document.getElementById("zona").value;
            const turno = document.getElementById("turno").value;

            if (!puesto || !zona || !turno) {
                mostrarToast("Por favor completá todos los campos", "error");
                return;
            }

            // Mensaje formateado para WhatsApp
            const numeroTelefono = "5493510000000"; // Reemplazar por tu número real
            const mensaje = `¡Hola Jobbers! Necesito contratar personal urgente:%0A` +
                            `• *Puesto:* ${puesto}%0A` +
                            `• *Zona:* ${zona}%0A` +
                            `• *Turno:* ${turno}`;

            const urlWhatsapp = `https://wa.me/${numeroTelefono}?text=${mensaje}`;
            window.open(urlWhatsapp, "_blank");
            mostrarToast("Redirigiendo a WhatsApp...", "exito");
        });
    }
});

// ==========================================
// 5. MANEJO DE MODALES Y ACCIONES
// ==========================================
function abrirModal(tipo) {
    const modal = document.getElementById("modal");
    const modalBody = document.getElementById("modal-body");
    if (!modal || !modalBody) return;

    if (tipo === 'login') {
        modalBody.innerHTML = `
            <h2 style="color: #fff; margin-bottom: 15px;">Ingresar a Jobbers</h2>
            <form onsubmit="cerrarModal(); mostrarToast('¡Sesión iniciada correctamente!', 'exito'); return false;">
                <div style="margin-bottom: 12px;">
                    <input type="email" placeholder="Correo electrónico" required style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #444; background: #222; color: #fff;">
                </div>
                <div style="margin-bottom: 15px;">
                    <input type="password" placeholder="Contraseña" required style="width: 100%; padding: 10px; border-radius: 4px; border: 1px solid #444; background: #222; color: #fff;">
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; padding: 10px;">Ingresar</button>
            </form>
        `;
    }

    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
}

function cerrarModal() {
    const modal = document.getElementById("modal");
    if (modal) {
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
    }
}

function postularse(puesto, empresa) {
    mostrarToast(`¡Postulación enviada a "${puesto}" en ${empresa}!`, "exito");
}

// Dropdown Menú
function toggleDropdown(event) {
    event.stopPropagation();
    const menu = document.getElementById("recursos-menu");
    if (menu) {
        menu.classList.toggle("show");
    }
}

function cerrarDropdown() {
    const menu = document.getElementById("recursos-menu");
    if (menu) menu.classList.remove("show");
}

window.addEventListener("click", () => cerrarDropdown());

// ==========================================
// 6. NOTIFICACIONES TOAST
// ==========================================
function mostrarToast(mensaje, tipo = "exito") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${tipo}`;
    toast.style.cssText = `
        background: ${tipo === 'exito' ? '#2eb85c' : '#e55353'};
        color: #fff;
        padding: 12px 20px;
        border-radius: 4px;
        margin-top: 8px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.3);
        font-size: 0.9rem;
        animation: fadeIn 0.3s forwards;
    `;
    toast.innerText = mensaje;

    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
