// La ruta ahora apunta al archivo local dentro del repositorio
const API_URL = "base_de_datos.json";

async function cargarOfertasDestacadas() {
    const contenedor = document.getElementById("jobs-container");

    try {
        const respuesta = await fetch(API_URL);
        
        if (!respuesta.ok) {
            throw new Error("No se pudo leer el archivo de base de datos.");
        }

        const ofertas = await respuesta.json();
        contenedor.innerHTML = ""; // Limpiamos el texto de carga

        if (ofertas.length === 0) {
            contenedor.innerHTML = "<p class='no-jobs'>No hay ofertas disponibles en este momento.</p>";
            return;
        }

        // Renderizado dinámico de la lista de empleos simulando MySQL
        ofertas.forEach(oferta => {
            const card = document.createElement("div");
            card.className = "job-card";

            const badgeUrgente = (oferta.urgente === 1) 
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
        console.error("Error al procesar los datos:", error);
        contenedor.innerHTML = `<p style="color: red;">Error al cargar las ofertas.</p>`;
    }
}

document.addEventListener("DOMContentLoaded", cargarOfertasDestacadas);