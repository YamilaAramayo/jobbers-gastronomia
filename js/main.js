const API_URL = "base_de_datos.json";

// 1. CARGA DINÁMICA DE EMPLEOS (DESDE EL JSON LOCAL)
async function cargarOfertasDestacadas() {
    const contenedor = document.getElementById("jobs-container");
    if (!contenedor) return;

    try {
        const respuesta = await fetch(API_URL);
        
        if (!respuesta.ok) {
            throw new Error("No se pudo leer la base de datos JSON.");
        }

        const ofertas = await respuesta.json();
        contenedor.innerHTML = ""; 

        if (ofertas.length === 0) {
            contenedor.innerHTML = "<p class='no-jobs'>No hay búsquedas de empleo activas en este momento.</p>";
            return;
        }

        ofertas.forEach(oferta => {
            const card = document.createElement("div");
            card.className = "job-card";

            const badgeUrgente = (oferta.urgente === 1) 
                ? `<span class="badge urgente">⚡ Urgente</span>` 
                : '';

            card.innerHTML = `
                <div class="job-info">
                    <h3>${oferta.titulo}</h3>
                    <p><strong>${oferta.empresa}</strong> • 📍 ${oferta.ubicacion}</p>
                    <div class="job-badges">
                        <span class="badge">${oferta.tipo_jornada}</span>
                        <span class="badge">${oferta.turno}</span>
                        ${badgeUrgente}
                    </div>
                </div>
                <div class="job-meta">
                    <span class="badge" style="color: var(--accent-color); font-weight: 700;">${oferta.salario || 'A convenir'}</span>
                </div>
            `;
            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error al cargar las ofertas:", error);
        contenedor.innerHTML = `<p style="color: #ff453a; padding: 10px;">Error al conectar con la base de datos.</p>`;
    }
}

// 2. ENVIAR FORMULARIO FLOTANTE POR WHATSAPP
function configurarFormularioWhatsApp() {
    const formulario = document.getElementById("whatsapp-form");
    if (!formulario) return;

    formulario.addEventListener("submit", function(event) {
        event.preventDefault();

        const puesto = formulario.puesto.value;
        const zona = formulario.zona.value;
        const turno = formulario.turno.value;

        // Formateo de textos para el mensaje de WhatsApp
        const puestoFormateado = puesto.charAt(0).toUpperCase() + puesto.slice(1);
        const zonaFormateada = zona.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const turnoFormateado = turno.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        // Podés cambiar este número por el número real de tu cliente o el tuyo
        const numeroTelefono = "5493541123456"; 

        const mensaje = encodeURIComponent(
            `¡Hola Jobbers! 👋 Necesito contratar personal urgente.\n\n` +
            `💼 *Puesto:* ${puestoFormateado}\n` +
            `📍 *Zona:* ${zonaFormateada}\n` +
            `⏱️ *Turno:* ${turnoFormateado}\n\n` +
            `¿Podrían ayudarme a publicar la búsqueda e iniciar el reclutamiento? ¡Gracias!`
        );

        const urlWhatsApp = `https://api.whatsapp.com/send?phone=${numeroTelefono}&text=${mensaje}`;
        window.open(urlWhatsApp, "_blank");
    });
}

// 3. EVENTOS DE LOS BOTONES Y LINKS DE LA PÁGINA
function configurarEventosGenerales() {
    // Scroll suave para botón "Busco Trabajo"
    const btnBuscoTrabajo = document.querySelector(".btn-primary");
    if (btnBuscoTrabajo) {
        btnBuscoTrabajo.addEventListener("click", () => {
            document.querySelector(".jobs-section").scrollIntoView({ behavior: "smooth" });
        });
    }

    // Scroll suave para botón "Necesito Personal"
    const btnNecesitoPersonal = document.querySelector(".btn-secondary");
    if (btnNecesitoPersonal) {
        btnNecesitoPersonal.addEventListener("click", () => {
            document.querySelector(".whatsapp-card").scrollIntoView({ behavior: "smooth" });
        });
    }

    // Alertas informativas para simular que el backend se activará próximamente
    const btnRegister = document.querySelector(".btn-register");
    if (btnRegister) {
        btnRegister.addEventListener("click", () => {
            alert("¡Hola! La sección de registro de postulantes y carga de CV estará activa próximamente en nuestro nuevo servidor. 😊");
        });
    }

    const btnLogin = document.querySelector(".btn-login");
    if (btnLogin) {
        btnLogin.addEventListener("click", () => {
            alert("El inicio de sesión de usuarios registrados se habilitará en la siguiente fase de desarrollo.");
        });
    }
}

// Inicializar funciones al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    cargarOfertasDestacadas();
    configurarFormularioWhatsApp();
    configurarEventosGenerales();
});
