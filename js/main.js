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

        const puestoFormateado = puesto.charAt(0).toUpperCase() + puesto.slice(1);
        const zonaFormateada = zona.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        const turnoFormateado = turno.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

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

// 3. EVENTOS GENERALES Y MODAL DE INICIO DE SESIÓN / REGISTRO
function configurarEventosGenerales() {
    const modal = document.getElementById("auth-modal");
    const loginBox = document.getElementById("login-box");
    const registerBox = document.getElementById("register-box");
    
    const btnOpenLogin = document.querySelector(".btn-login");
    const btnOpenRegister = document.querySelector(".btn-register");
    const btnCloseModal = document.getElementById("close-modal");
    
    const goToRegister = document.getElementById("go-to-register");
    const goToLogin = document.getElementById("go-to-login");

    const btnBuscoTrabajo = document.querySelector(".btn-primary");
    if (btnBuscoTrabajo) {
        btnBuscoTrabajo.addEventListener("click", () => {
            document.querySelector(".jobs-section").scrollIntoView({ behavior: "smooth" });
        });
    }

    const btnNecesitoPersonal = document.querySelector(".btn-secondary");
    if (btnNecesitoPersonal) {
        btnNecesitoPersonal.addEventListener("click", () => {
            document.querySelector(".whatsapp-card").scrollIntoView({ behavior: "smooth" });
        });
    }

    // --- FUNCIONALIDAD DEL MODAL ---
    function abrirModal(vista) {
        if (!modal) return;
        modal.classList.add("active");
        
        if (vista === "login") {
            loginBox.classList.add("active");
            registerBox.classList.remove("active");
        } else {
            registerBox.classList.add("active");
            loginBox.classList.remove("active");
        }
    }

    function cerrarModal() {
        if (modal) modal.classList.remove("active");
    }

    if (btnOpenLogin) {
        btnOpenLogin.addEventListener("click", () => abrirModal("login"));
    }
    if (btnOpenRegister) {
        btnOpenRegister.addEventListener("click", () => abrirModal("register"));
    }

    if (btnCloseModal) {
        btnCloseModal.addEventListener("click", cerrarModal);
    }
    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target === modal) cerrarModal();
        });
    }

    if (goToRegister) {
        goToRegister.addEventListener("click", () => {
            loginBox.classList.remove("active");
            registerBox.classList.add("active");
        });
    }
    if (goToLogin) {
        goToLogin.addEventListener("click", () => {
            registerBox.classList.remove("active");
            loginBox.classList.add("active");
        });
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            alert(`¡Bienvenido de nuevo! Has iniciado sesión correctamente con ${email}.`);
            cerrarModal();
        });
    }

    const registerForm = document.getElementById("register-form");
    if (registerForm) {
        registerForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("register-name").value;
            alert(`¡Registro completado! Gracias por unirte a Jobbers, ${name}.`);
            cerrarModal();
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    cargarOfertasDestacadas();
    configurarFormularioWhatsApp();
    configurarEventosGenerales();
});
