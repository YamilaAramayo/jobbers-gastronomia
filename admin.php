!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="robots" content="noindex, nofollow">
    <title>Panel de Administración | Jobbers Argentina</title>

    <!-- Fonts & Icons -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="css/styles.css">

    <style>
        body {
            background-color: var(--bg-main, #0b0f19);
            color: var(--text-primary, #f8fafc);
            font-family: var(--font-main, 'Plus Jakarta Sans', sans-serif);
            min-height: 100vh;
            margin: 0;
        }

        .admin-navbar {
            background: var(--bg-card, #131822);
            border-bottom: 1px solid var(--border-color, #222c3d);
            padding: 1rem 2rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 1rem;
        }

        .admin-badge {
            background: rgba(255, 183, 3, 0.1);
            color: var(--accent-amber, #ffb703);
            padding: 0.35rem 0.9rem;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 800;
            letter-spacing: 0.5px;
            border: 1px solid rgba(255, 183, 3, 0.25);
            display: inline-flex;
            align-items: center;
        }

        /* PESTAÑAS PRINCIPALES (SECCIÓN ADMIN / CHATBOT) */
        .main-tabs-container {
            display: flex;
            gap: 0.8rem;
            margin-bottom: 1.5rem;
            border-bottom: 1px solid var(--border-color, #222c3d);
            padding-bottom: 1rem;
        }

        .main-tab-btn {
            background: var(--bg-card, #131822);
            border: 1px solid var(--border-color, #222c3d);
            color: var(--text-secondary, #94a3b8);
            padding: 0.7rem 1.2rem;
            border-radius: 10px;
            font-size: 0.9rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.2s;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        .main-tab-btn:hover {
            color: #fff;
            border-color: rgba(255, 183, 3, 0.4);
        }

        .main-tab-btn.active {
            background: var(--accent-amber, #ffb703);
            color: #000;
            border-color: var(--accent-amber, #ffb703);
        }

        /* MÉTRICAS */
        .admin-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
            gap: 1.25rem;
            margin-bottom: 1.5rem;
        }

        .metric-card {
            background: var(--bg-card, #131822);
            border: 1px solid var(--border-color, #222c3d);
            border-radius: 12px;
            padding: 1.25rem;
            display: flex;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }

        .metric-icon {
            width: 46px;
            height: 46px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
        }

        .metric-icon.amber { background: rgba(255, 183, 3, 0.15); color: var(--accent-amber, #ffb703); }
        .metric-icon.green { background: rgba(0, 230, 118, 0.15); color: var(--accent-green, #00e676); }
        .metric-icon.blue { background: rgba(56, 189, 248, 0.15); color: #38bdf8; }
        .metric-icon.red { background: rgba(239, 68, 68, 0.15); color: #ef4444; }

        .metric-data h4 { font-size: 1.5rem; font-weight: 800; color: #fff; margin: 0; }
        .metric-data p { font-size: 0.8rem; color: #94a3b8; margin: 0; }

        /* FILTROS */
        .filters-toolbar {
            background: var(--bg-card, #131822);
            border: 1px solid var(--border-color, #222c3d);
            border-radius: 12px 12px 0 0;
            padding: 1.25rem;
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            justify-content: space-between;
            align-items: center;
        }

        .tab-btn-group {
            display: flex;
            gap: 0.4rem;
            background: #0b0f19;
            padding: 0.3rem;
            border-radius: 8px;
            border: 1px solid var(--border-color, #222c3d);
        }

        .tab-btn {
            background: transparent;
            border: none;
            color: #94a3b8;
            padding: 0.45rem 0.9rem;
            border-radius: 6px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .tab-btn.active {
            background: var(--accent-amber, #ffb703);
            color: #000;
            font-weight: 700;
        }

        .search-box {
            position: relative;
            flex: 1;
            min-width: 240px;
        }

        .search-box input {
            width: 100%;
            padding: 0.6rem 0.8rem 0.6rem 2.3rem;
            background: #0b0f19;
            border: 1px solid var(--border-color, #222c3d);
            border-radius: 8px;
            color: #fff;
            font-size: 0.85rem;
            font-family: inherit;
        }

        .search-box i {
            position: absolute;
            left: 0.8rem;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
        }

        .admin-table-container {
            background: var(--bg-card, #131822);
            border: 1px solid var(--border-color, #222c3d);
            border-top: none;
            border-radius: 0 0 12px 12px;
            overflow: hidden;
        }

        .admin-table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.85rem;
        }

        .admin-table th {
            background: #0b0f19;
            color: #94a3b8;
            padding: 1rem;
            font-weight: 700;
            border-bottom: 1px solid var(--border-color, #222c3d);
            white-space: nowrap;
        }

        .admin-table td {
            padding: 1rem;
            border-bottom: 1px solid var(--border-color, #222c3d);
            color: #f8fafc;
            vertical-align: middle;
        }

        .status-pill {
            display: inline-block;
            padding: 0.3rem 0.7rem;
            border-radius: 6px;
            font-size: 0.72rem;
            font-weight: 700;
            text-transform: uppercase;
        }

        .status-pendiente { background: rgba(255, 183, 3, 0.15); color: #ffb703; border: 1px solid rgba(255, 183, 3, 0.3); }
        .status-aprobado { background: rgba(0, 230, 118, 0.15); color: #00e676; border: 1px solid rgba(0, 230, 118, 0.3); }
        .status-rechazado { background: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

        .badge-urgente {
            background: #ffb703;
            color: #000;
            font-size: 0.65rem;
            font-weight: 800;
            padding: 0.15rem 0.4rem;
            border-radius: 6px;
            margin-top: 0.2rem;
            display: inline-block;
        }

        .btn-act {
            padding: 0.4rem 0.7rem;
            border-radius: 6px;
            border: none;
            font-weight: 700;
            font-size: 0.75rem;
            cursor: pointer;
            transition: all 0.2s;
            margin-right: 0.25rem;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
        }

        .btn-act-view { background: #38bdf8; color: #000; }
        .btn-act-ok { background: #00e676; color: #000; }
        .btn-act-no { background: #ef4444; color: #fff; }

        .login-overlay {
            position: fixed;
            top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(11, 15, 25, 0.92);
            backdrop-filter: blur(8px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
        }

        .modal-card {
            background: #131822;
            border: 1px solid var(--border-color, #222c3d);
            border-radius: 16px;
            padding: 2rem;
            max-width: 480px;
            width: 90%;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
        }

        .btn-amber {
            background: var(--accent-amber, #ffb703);
            color: #000;
            border: none;
            border-radius: 8px;
            font-weight: 700;
            cursor: pointer;
        }
    </style>
</head>
<body>

    <!-- MODAL AUTENTICACIÓN -->
    <div id="login-modal" class="login-overlay">
        <div class="modal-card" style="text-align: center;">
            <div style="font-size: 2.5rem; color: #ffb703; margin-bottom: 1rem;">
                <i class="fas fa-shield-halved"></i>
            </div>
            <h2 style="margin-bottom: 0.5rem; color: #fff; font-size: 1.5rem;">Panel Interno Jobbers</h2>
            <p style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1.5rem;">Ingresá la clave de administrador para gestionar solicitudes y consultas.</p>
            <form id="admin-login-form">
                <input type="password" id="admin-pass" placeholder="Clave de acceso (admin2026)" required style="padding: 0.8rem; margin-bottom: 1rem; border-radius: 8px; border: 1px solid #222c3d; background: #0b0f19; color: #fff; width: 100%; box-sizing: border-box;">
                <p id="login-error" style="color: #ef4444; font-size: 0.8rem; display: none; margin-bottom: 0.8rem;">Clave incorrecta. Intentá de nuevo.</p>
                <button type="submit" class="btn-amber" style="padding: 0.8rem; width: 100%;">Ingresar al Panel</button>
            </form>
        </div>
    </div>

    <!-- MODAL DETALLE -->
    <div id="modal-detalle" class="login-overlay" style="display: none;">
        <div class="modal-card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; border-bottom:1px solid #222c3d; padding-bottom:0.75rem;">
                <h3 style="color:#ffb703; margin:0; font-size: 1.1rem;" id="m-titulo">Detalle</h3>
                <button onclick="cerrarModalDetalle()" style="background:transparent; border:none; color:#94a3b8; font-size:1.4rem; cursor:pointer;">&times;</button>
            </div>
            <div style="font-size:0.9rem; line-height:1.6; color:#e2e8f0;">
                <p><strong><span id="label-campo1">Empresa</span>:</strong> <span id="m-val1" style="color:#fff;"></span></p>
                <p><strong><span id="label-campo2">Puesto</span>:</strong> <span id="m-val2"></span></p>
                <p><strong><span id="label-campo3">Zona</span>:</strong> <span id="m-val3"></span></p>
                <p><strong>Contacto:</strong> <span id="m-wa"></span></p>
                <div style="margin-top:1rem; background:#0b0f19; padding:1rem; border-radius:8px; border:1px solid #222c3d;">
                    <strong style="color:#94a3b8; font-size:0.75rem; display:block; margin-bottom:0.4rem;">MENSAJE / REQUISITOS:</strong>
                    <p id="m-detalles" style="white-space:pre-wrap; font-size:0.85rem; color:#cbd5e1; margin:0;"></p>
                </div>
            </div>
            <button onclick="cerrarModalDetalle()" class="btn-amber" style="margin-top:1.5rem; padding:0.7rem; width:100%;">Cerrar Ficha</button>
        </div>
    </div>

    <!-- NAVBAR ADMIN -->
    <header class="admin-navbar">
        <div style="display: flex; align-items: center; gap: 1rem;">
            <a href="index.html" style="text-decoration: none; color: #fff; font-weight: 800; font-size: 1.4rem;">Jobbers<span style="color:#ffb703;">.</span></a>
            <span class="admin-badge"><i class="fas fa-shield-alt" style="margin-right: 0.4rem;"></i> MÓDULO ADMINISTRADOR</span>
        </div>
        <div>
            <a href="index.html" class="btn-amber" style="padding: 0.5rem 1rem; text-decoration: none; font-size: 0.85rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.4rem;">
                <i class="fas fa-external-link-alt"></i> Ver Web Pública
            </a>
        </div>
    </header>

    <main class="container" style="max-width: 1200px; padding: 2rem 1rem 4rem; margin: 0 auto;">

        <!-- PESTAÑAS PRINCIPALES (SECCIONES) -->
        <div class="main-tabs-container">
            <button class="main-tab-btn active" id="tab-empresas-btn" onclick="cambiarSeccion('empresas')">
                <i class="fas fa-building"></i> 🏢 Solicitudes de Empresas (Vacantes)
            </button>
            <button class="main-tab-btn" id="tab-chatbot-btn" onclick="cambiarSeccion('chatbot')">
                <i class="fas fa-comments"></i> 💬 Consultas del Chatbot (Soporte)
            </button>
        </div>

        <!-- MÉTRICAS DINÁMICAS -->
        <section class="admin-metrics" id="container-metrics">
            <!-- Se actualiza por JS -->
        </section>

        <!-- FILTROS -->
        <div class="filters-toolbar">
            <div class="tab-btn-group">
                <button class="tab-btn active" onclick="filtrarEstado('todas', this)">Todas</button>
                <button class="tab-btn" onclick="filtrarEstado('pendiente', this)">Pendientes</button>
                <button class="tab-btn" onclick="filtrarEstado('aprobado', this)">Atendidas / Aprobadas</button>
                <button class="tab-btn" onclick="filtrarEstado('rechazado', this)">Rechazadas</button>
            </div>

            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="input-buscar" oninput="renderTabla()" placeholder="Buscar por nombre, puesto o contacto...">
            </div>

            <button onclick="resetDemoData()" style="background: transparent; color: #94a3b8; border: 1px dashed #222c3d; padding: 0.5rem 0.8rem; border-radius: 8px; font-size: 0.8rem; cursor: pointer;">
                <i class="fas fa-sync-alt"></i> Reset Demo
            </button>
        </div>

        <!-- TABLA DINÁMICA -->
        <section class="admin-table-container">
            <div style="overflow-x: auto;">
                <table class="admin-table">
                    <thead id="tabla-head">
                        <!-- Cabecera dinámica -->
                    </thead>
                    <tbody id="admin-table-body">
                        <!-- Contenido dinámico -->
                    </tbody>
                </table>
            </div>
        </section>

    </main>

    <script>
        const ADMIN_PASS = "Polioptilidae";
        let seccionActual = "empresas"; // 'empresas' o 'chatbot'
        let filtroEstadoActual = "todas";

        document.getElementById("admin-login-form").addEventListener("submit", function(e) {
            e.preventDefault();
            if (document.getElementById("admin-pass").value === ADMIN_PASS) {
                document.getElementById("login-modal").style.display = "none";
                sessionStorage.setItem("jobbers_admin_auth", "true");
                initAdmin();
            } else {
                document.getElementById("login-error").style.display = "block";
            }
        });

        if (sessionStorage.getItem("jobbers_admin_auth") === "true") {
            document.getElementById("login-modal").style.display = "none";
            document.addEventListener("DOMContentLoaded", initAdmin);
        }

        const defaultData = [
            { 
                id: 101, 
                fecha: "07/10/2026", 
                empresa: "María Gómez", 
                whatsapp: "3541582448", 
                puesto: "Consulta de Soporte", 
                zona: "Chatbot Web", 
                turno: "Soporte General", 
                detalles: "Hola, quiero saber cómo destacar mi perfil de cocinera en la plataforma.", 
                urgente: false, 
                estado: "pendiente",
                tipo: "chatbot" 
            },
            { 
                id: 201, 
                fecha: "07/10/2026", 
                empresa: "Brunch & Coffee Güemes", 
                whatsapp: "3513080197", 
                puesto: "Barista Profesional", 
                zona: "Güemes", 
                turno: "Turno Mañana", 
                jornada: "Full Time", 
                detalles: "Experiencia mínima de 1 año en arte latte.", 
                urgente: true, 
                estado: "pendiente",
                tipo: "empresa" 
            }
        ];

        function getItems() {
            return JSON.parse(localStorage.getItem("jobbers_admin_requests")) || defaultData;
        }

        function setItems(data) {
            localStorage.setItem("jobbers_admin_requests", JSON.stringify(data));
            initAdmin();
        }

        function initAdmin() {
            actualizarMetricas();
            renderTabla();
        }

        function cambiarSeccion(seccion) {
            seccionActual = seccion;
            document.getElementById("tab-empresas-btn").classList.toggle("active", seccion === "empresas");
            document.getElementById("tab-chatbot-btn").classList.toggle("active", seccion === "chatbot");
            filtroEstadoActual = "todas";
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            document.querySelector(".tab-btn-group button").classList.add("active");
            initAdmin();
        }

        function actualizarMetricas() {
            const items = getItems();
            const filtradosSeccion = items.filter(i => (i.tipo || 'empresa') === seccionActual);

            let p = 0, a = 0, r = 0, u = 0;
            filtradosSeccion.forEach(item => {
                if (item.estado === "pendiente") p++;
                if (item.estado === "aprobado") a++;
                if (item.estado === "rechazado") r++;
                if (item.urgente) u++;
            });

            const metricsContainer = document.getElementById("container-metrics");
            if (seccionActual === "empresas") {
                metricsContainer.innerHTML = `
                    <div class="metric-card"><div class="metric-icon amber"><i class="fas fa-clock"></i></div><div class="metric-data"><h4>${p}</h4><p>Pendientes de Revisión</p></div></div>
                    <div class="metric-card"><div class="metric-icon green"><i class="fas fa-check-circle"></i></div><div class="metric-data"><h4>${a}</h4><p>Aprobadas / Publicadas</p></div></div>
                    <div class="metric-card"><div class="metric-icon blue"><i class="fas fa-bolt"></i></div><div class="metric-data"><h4>${u}</h4><p>Solicitudes Urgentes Pro</p></div></div>
                    <div class="metric-card"><div class="metric-icon red"><i class="fas fa-times-circle"></i></div><div class="metric-data"><h4>${r}</h4><p>Rechazadas</p></div></div>
                `;
            } else {
                metricsContainer.innerHTML = `
                    <div class="metric-card"><div class="metric-icon amber"><i class="fas fa-clock"></i></div><div class="metric-data"><h4>${p}</h4><p>Consultas Nuevas</p></div></div>
                    <div class="metric-card"><div class="metric-icon green"><i class="fas fa-check-circle"></i></div><div class="metric-data"><h4>${a}</h4><p>Consultas Atendidas</p></div></div>
                    <div class="metric-card"><div class="metric-icon red"><i class="fas fa-times-circle"></i></div><div class="metric-data"><h4>${r}</h4><p>Archivadas</p></div></div>
                `;
            }
        }

        function renderTabla() {
            const items = getItems();
            const busqueda = document.getElementById("input-buscar").value.toLowerCase();
            const thead = document.getElementById("tabla-head");
            const tbody = document.getElementById("admin-table-body");
            tbody.innerHTML = "";

            const filtrados = items.filter(item => {
                const tipoItem = item.tipo || 'empresa';
                if (tipoItem !== seccionActual) return false;

                const matchEstado = (filtroEstadoActual === "todas") || (item.estado === filtroEstadoActual);
                const matchTexto = item.empresa.toLowerCase().includes(busqueda) ||
                                   (item.puesto && item.puesto.toLowerCase().includes(busqueda)) ||
                                   item.whatsapp.toLowerCase().includes(busqueda) ||
                                   (item.detalles && item.detalles.toLowerCase().includes(busqueda));
                return matchEstado && matchTexto;
            });

            if (seccionActual === "empresas") {
                thead.innerHTML = `
                    <tr>
                        <th>Fecha</th>
                        <th>Local / Empresa</th>
                        <th>Puesto Requerido</th>
                        <th>Zona / Barrio</th>
                        <th>Turno / Jornada</th>
                        <th>WhatsApp</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                `;
            } else {
                thead.innerHTML = `
                    <tr>
                        <th>Fecha</th>
                        <th>Solicitante</th>
                        <th>Asunto / Consulta</th>
                        <th>Canal</th>
                        <th>Contacto (Wpp / Correo)</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                `;
            }

            if (filtrados.length === 0) {
                const cols = seccionActual === "empresas" ? 8 : 7;
                tbody.innerHTML = `<tr><td colspan="${cols}" style="text-align:center; padding:2rem; color:#94a3b8;">No se encontraron registros en esta sección.</td></tr>`;
                return;
            }

            filtrados.forEach(item => {
                const tr = document.createElement("tr");
                if (seccionActual === "empresas") {
                    tr.innerHTML = `
                        <td style="color: #94a3b8; font-size: 0.78rem;">${item.fecha}</td>
                        <td>
                            <strong>${item.empresa}</strong>
                            ${item.urgente ? '<br><span class="badge-urgente">⚡ URGENTE PRO</span>' : ''}
                        </td>
                        <td style="color: #ffb703; font-weight: 600;">${item.puesto}</td>
                        <td>${item.zona}</td>
                        <td style="font-size:0.8rem; color:#94a3b8;">${item.turno}<br><em>${item.jornada || ''}</em></td>
                        <td>
                            <a href="https://wa.me/549${item.whatsapp.replace(/\D/g,'')}" target="_blank" style="color: #00e676; font-size: 0.8rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fab fa-whatsapp"></i> ${item.whatsapp}
                            </a>
                        </td>
                        <td><span class="status-pill status-${item.estado}">${item.estado}</span></td>
                        <td>
                            <button class="btn-act btn-act-view" onclick="verDetalle(${item.id})" title="Ver detalles"><i class="fas fa-eye"></i></button>
                            ${item.estado === 'pendiente' ? `
                                <button class="btn-act btn-act-ok" onclick="aprobarYNotificarEmpresa(${item.id})" title="Aprobar"><i class="fas fa-check"></i> Aprobar</button>
                                <button class="btn-act btn-act-no" onclick="cambiarEstado(${item.id}, 'rechazado')" title="Rechazar"><i class="fas fa-times"></i></button>
                            ` : `<small style="color:#94a3b8;">Procesado</small>`}
                        </td>
                    `;
                } else {
                    tr.innerHTML = `
                        <td style="color: #94a3b8; font-size: 0.78rem;">${item.fecha}</td>
                        <td><strong>${item.empresa}</strong></td>
                        <td style="color: #38bdf8; font-weight: 600;">${item.puesto}</td>
                        <td>${item.zona}</td>
                        <td>
                            <a href="https://wa.me/549${item.whatsapp.replace(/\D/g,'')}" target="_blank" style="color: #00e676; font-size: 0.8rem; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                                <i class="fab fa-whatsapp"></i> ${item.whatsapp}
                            </a>
                        </td>
                        <td><span class="status-pill status-${item.estado}">${item.estado}</span></td>
                        <td>
                            <button class="btn-act btn-act-view" onclick="verDetalle(${item.id})" title="Ver consulta"><i class="fas fa-eye"></i></button>
                            ${item.estado === 'pendiente' ? `
                                <button class="btn-act btn-act-ok" onclick="cambiarEstado(${item.id}, 'aprobado')" title="Marcar atendido"><i class="fas fa-check"></i> Atender</button>
                                <button class="btn-act btn-act-no" onclick="cambiarEstado(${item.id}, 'rechazado')" title="Archivar"><i class="fas fa-times"></i></button>
                            ` : `<small style="color:#94a3b8;">Atendido</small>`}
                        </td>
                    `;
                }
                tbody.appendChild(tr);
            });
        }

        function filtrarEstado(estado, btn) {
            filtroEstadoActual = estado;
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderTabla();
        }

        function verDetalle(id) {
            const item = getItems().find(x => x.id === id);
            if (!item) return;

            if (seccionActual === "empresas") {
                document.getElementById("m-titulo").innerText = "Detalle de Vacante";
                document.getElementById("label-campo1").innerText = "Empresa";
                document.getElementById("label-campo2").innerText = "Puesto";
                document.getElementById("label-campo3").innerText = "Zona";
                document.getElementById("m-val1").innerText = item.empresa;
                document.getElementById("m-val2").innerText = item.puesto;
                document.getElementById("m-val3").innerText = `${item.zona} (${item.turno} - ${item.jornada})`;
            } else {
                document.getElementById("m-titulo").innerText = "Detalle de Consulta de Chatbot";
                document.getElementById("label-campo1").innerText = "Solicitante";
                document.getElementById("label-campo2").innerText = "Asunto";
                document.getElementById("label-campo3").innerText = "Canal";
                document.getElementById("m-val1").innerText = item.empresa;
                document.getElementById("m-val2").innerText = item.puesto;
                document.getElementById("m-val3").innerText = item.zona;
            }

            document.getElementById("m-wa").innerText = item.whatsapp;
            document.getElementById("m-detalles").innerText = item.detalles || "Sin detalles adicionales.";
            document.getElementById("modal-detalle").style.display = "flex";
        }

        function cerrarModalDetalle() {
            document.getElementById("modal-detalle").style.display = "none";
        }

        function cambiarEstado(id, nuevoEstado) {
            let items = getItems();
            items = items.map(item => {
                if (item.id === id) item.estado = nuevoEstado;
                return item;
            });
            setItems(items);
        }

        function aprobarYNotificarEmpresa(id) {
            const items = getItems();
            const item = items.find(x => x.id === id);
            if (!item) return;

            cambiarEstado(id, 'aprobado');
            const msg = encodeURIComponent(`¡Hola ${item.empresa}! 👋 Te avisamos desde Jobbers Argentina que tu búsqueda para el puesto de "${item.puesto}" ya fue aprobada y se encuentra publicada en el portal.`);
            window.open(`https://wa.me/549${item.whatsapp.replace(/\D/g,'')}`, '_blank');
        }

        function resetDemoData() {
            localStorage.removeItem("jobbers_admin_requests");
            initAdmin();
        }
    </script>
</body>
</html>
