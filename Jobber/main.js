// Reemplazá este enlace por la URL real donde subas tus scripts PHP
const API_URL = "https://tu-dominio-remoto.com/get_ofertas.php";

async function cargarOfertasDestacadas() {
    const contenedor = document.getElementById("jobs-container");

    try {
        const respuesta = await fetch(API_URL);
        
        if (!respuesta.ok) {
            throw new Error("No se pudo conectar con el servidor remoto.");
        }

        const ofertas = await respuesta.json();
        contenedor.innerHTML = ""; // Limpiar el indicador de carga

        if (ofertas.length === 0) {
            contenedor.innerHTML = "<p class='no-jobs'>No hay ofertas disponibles en este momento.</p>";
            return;
        }

        // Renderizar dinámicamente cada oferta que viene de la base de datos MySQL
        ofertas.forEach(oferta => {
            const card = document.createElement("div");
            card.className = "job-card";

            // Verificar si es una búsqueda urgente
            const badgeUrgente = (oferta.urgente == 1) 
                ? `<span class="badge urgente">⚠️ URGENTE</span>` 
                : '';

            card.innerHTML = `
                <div class="job-info">
                    <h3>${oferta.titulo}</h3>
                    <p>${oferta.empresa} • ${oferta.ubicacion}</p>
                    <div class="job-badges">
                        <span class="badge">${oferta.tipo_jornada}</span>
                        <span class="badge">${oferta.turno}</span>
                        ${badgeUrgente}
                    </div>
                </div>
                <div class="job-meta">
                    <span class="badge">${oferta.salario}</span>
                </div>
            `;
            contenedor.appendChild(card);
        });

    } catch (error) {
        console.error("Error cargando los datos de la base de datos:", error);
        contenedor.innerHTML = `
            <p class="error-msg" style="color: #ff3b30;">
                ⚠️ Error al conectar con el servidor remoto. Mostrando datos locales de respaldo...
            </p>
        `;
        // Backup de prueba por si el servidor backend está caído
        cargarDatosLocalesBackup();
    }
}

// Función de respaldo local (Mockup) por si el servidor remoto de base de datos tarda en responder
function cargarDatosLocalesBackup() {
    const contenedor = document.getElementById("jobs-container");
    const mockData = [
        { titulo: "Cocinero/a", empresa: "Casa Norte", ubicacion: "Nueva Córdoba", tipo_jornada: "Tiempo completo", turno: "Turno Noche", urgente: 1, salario: "A convenir" },
        { titulo: "Barista", empresa: "Café Central", ubicacion: "Güemes", tipo_jornada: "Part-time", turno: "Turno Mañana", urgente: 0, salario: "A convenir" }
    ];
    
    // Evitamos pisar el mensaje de error pero agregamos la simulación para que la web siga viéndose excelente
    mockData.forEach(oferta => {
        const card = document.createElement("div");
        card.className = "job-card";
        card.innerHTML = `
            <div class="job-info">
                <h3>${oferta.titulo} (Offline)</h3>
                <p>${oferta.empresa} • ${oferta.ubicacion}</p>
                <div class="job-badges">
                    <span class="badge">${oferta.tipo_jornada}</span>
                    <span class="badge">${oferta.turno}</span>
                    <span class="badge urgente">⚠️ URGENTE</span>
                </div>
            </div>
            <div class="job-meta">
                <span class="badge">${oferta.salario}</span>
            </div>
        `;
        contenedor.appendChild(card);
    });
}

// Iniciar la carga al abrir el sitio web
document.addEventListener("DOMContentLoaded", cargarOfertasDestacadas);