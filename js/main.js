/* =========================================================================
   JOBBERS ARGENTINA - HOJA DE ESTILOS GENERALES
   ========================================================================= */

/* --- 1. VARIABLES GLOBALES & MODO OSCURO --- */
:root {
    --bg-dark: #0a0c0e;
    --card-bg: #14181d;
    --card-bg-light: #1b2028;
    --border-color: rgba(255, 255, 255, 0.1);
    
    --text-main: #f1f3f5;
    --text-muted: #9ea7b0;
    --text-dark: #0a0c0e;
    
    --primary: #f39c12;
    --primary-hover: #d68910;
    --salary-green: #2ecc71;
    --urgent-red: #e74c3c;
    
    --radius-sm: 6px;
    --radius-md: 12px;
    --radius-lg: 20px;
    
    --transition: all 0.25s ease-in-out;
}

/* --- 2. RESET Y ESTILOS BASE --- */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html {
    scroll-behavior: smooth;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background-color: var(--bg-dark);
    color: var(--text-main);
}

body {
    min-height: 100vh;
    line-height: 1.5;
    overflow-x: hidden;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

/* --- 3. ALTERNANCIA DE VISTAS SEGÚN ROL --- */
body.role-postulante .modo-empresa-only {
    display: none !important;
}

body.role-empresa .modo-postulante-only {
    display: none !important;
}

/* --- 4. HEADER & NAVBAR --- */
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 2rem;
    background: rgba(10, 12, 14, 0.9);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 100;
}

.logo {
    text-decoration: none;
    display: flex;
    flex-direction: column;
}

.logo-title {
    font-size: 1.4rem;
    font-weight: 900;
    color: var(--primary);
    letter-spacing: 1px;
}

.logo-subtitle {
    font-size: 0.65rem;
    color: var(--text-muted);
    letter-spacing: 1.5px;
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 1.2rem;
}

.nav-link {
    color: var(--text-main);
    text-decoration: none;
    font-size: 0.9rem;
    font-weight: 600;
    transition: var(--transition);
}

.nav-link:hover {
    color: var(--primary);
}

/* BOTONES CTAs HEADER */
.btn-cta-postulante, .btn-cta-empresa {
    background: var(--primary);
    color: var(--text-dark) !important;
    padding: 0.5rem 1rem;
    border-radius: var(--radius-sm);
    font-weight: 800;
}

.btn-role-badge {
    background: var(--card-bg-light);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    padding: 0.5rem 0.9rem;
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: var(--transition);
}

.btn-role-badge:hover {
    border-color: var(--primary);
    color: var(--primary);
}

/* DROPDOWN RECURSOS */
.dropdown-container {
    position: relative;
}

.dropdown-btn {
    background: transparent;
    border: none;
    color: var(--text-main);
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    margin-top: 0.5rem;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    display: none;
    flex-direction: column;
    min-width: 220px;
    z-index: 101;
    overflow: hidden;
}

.dropdown-menu.show {
    display: flex;
}

.dropdown-item {
    padding: 0.75rem 1rem;
    color: var(--text-main);
    text-decoration: none;
    font-size: 0.85rem;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    transition: var(--transition);
}

.dropdown-item:hover {
    background: var(--card-bg-light);
    color: var(--primary);
}

/* --- 5. HERO SECTION --- */
.hero-section {
    position: relative;
    padding: 4rem 1.5rem 3rem 1.5rem;
    background: radial-gradient(circle at top, #1c222a 0%, var(--bg-dark) 100%);
    text-align: center;
}

.hero-container-centered {
    max-width: 900px;
    margin: 0 auto;
}

.hero-title {
    font-size: 2.2rem;
    font-weight: 900;
    line-height: 1.2;
    margin-bottom: 1rem;
}

.highlight {
    color: var(--primary);
}

.hero-subtitle {
    font-size: 1rem;
    color: var(--text-muted);
    max-width: 650px;
    margin: 0 auto 1.5rem auto;
}

.hero-features {
    display: flex;
    justify-content: center;
    gap: 1.5rem;
    flex-wrap: wrap;
    font-size: 0.85rem;
    color: var(--text-main);
    margin-bottom: 2rem;
}

.hero-features i {
    color: var(--primary);
    margin-right: 0.3rem;
}

/* BUSCADOR HERO */
.hero-search-bar {
    display: flex;
    gap: 0.5rem;
    max-width: 650px;
    margin: 0 auto 2.5rem auto;
}

.hero-search-bar input {
    flex: 1;
    height: 50px;
    padding: 0 1.2rem;
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    color: var(--text-main);
    font-family: inherit;
}

.hero-search-bar input:focus {
    outline: none;
    border-color: var(--primary);
}

.btn-search {
    background: var(--primary);
    color: var(--text-dark);
    border: none;
    padding: 0 1.5rem;
    border-radius: var(--radius-sm);
    font-weight: 800;
    cursor: pointer;
    transition: var(--transition);
}

.btn-search:hover {
    background: var(--primary-hover);
}

/* --- 6. CATEGORÍAS GRID 3x3 --- */
.categorias-grid-container {
    margin-top: 2rem;
}

.categorias-header-row h3 {
    font-size: 0.85rem;
    letter-spacing: 1px;
    color: var(--text-muted);
    margin-bottom: 1rem;
}

.categorias-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    max-width: 650px;
    margin: 0 auto;
}

.btn-categoria {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 0.85rem 0.5rem;
    color: var(--text-main);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.4rem;
    transition: var(--transition);
}

.btn-categoria span {
    font-size: 0.8rem;
    font-weight: 600;
}

.cat-icon {
    font-size: 1.2rem;
    color: var(--primary);
}

.btn-categoria:hover, .btn-categoria.active {
    border-color: var(--primary);
    background: var(--card-bg-light);
}

/* --- 7. TARJETAS DE VACANTES Y TALENTO --- */
.job-offer-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 1.25rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    transition: var(--transition);
}

.job-offer-card:hover {
    border-color: rgba(243, 156, 18, 0.4);
    transform: translateY(-2px);
}

.job-info-main {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    text-align: left;
}

.job-header-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.job-header-row h4 {
    font-size: 1.1rem;
    font-weight: 800;
    color: var(--text-main);
}

.badge-urgente {
    background: rgba(231, 76, 60, 0.15);
    color: var(--urgent-red);
    font-size: 0.7rem;
    font-weight: 800;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    text-transform: uppercase;
}

.job-company {
    font-size: 0.85rem;
    color: var(--primary);
    font-weight: 700;
}

.job-details-row {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    font-size: 0.8rem;
    color: var(--text-muted);
    margin-top: 0.2rem;
}

.job-salary {
    color: var(--salary-green);
    font-weight: 700;
}

.job-action-col {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0.5rem;
}

.job-time {
    font-size: 0.75rem;
    color: var(--text-muted);
}

.btn-postularme {
    background: #25d366;
    color: #fff;
    border: none;
    padding: 0.6rem 1.2rem;
    border-radius: var(--radius-sm);
    font-weight: 800;
    font-size: 0.85rem;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    transition: var(--transition);
}

.btn-postularme:hover {
    background: #1eb954;
}

/* --- 8. FORMULARIO EXPRESS Y TARJETAS HERO --- */
.width-full-express {
    max-width: 650px;
    margin: 0 auto;
}

.hero-card-express {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 2rem 1.5rem;
    text-align: left;
}

.hero-card-express .card-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.3rem;
}

.hero-card-express h2 {
    font-size: 1.2rem;
    font-weight: 800;
}

.hero-card-express p {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-bottom: 1.5rem;
}

.express-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.form-control {
    width: 100%;
    height: 48px;
    padding: 0 1.1rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    background-color: var(--bg-dark);
    color: var(--text-main);
    font-family: inherit;
    font-size: 0.9rem;
}

.form-control:focus {
    outline: none;
    border-color: var(--primary);
}

.btn-primary {
    background: var(--primary);
    color: var(--text-dark);
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 800;
    transition: var(--transition);
}

.btn-primary:hover {
    background: var(--primary-hover);
}

.btn-whatsapp {
    background: #25d366;
    color: #fff;
    border: none;
    height: 48px;
    border-radius: var(--radius-sm);
    font-weight: 800;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: var(--transition);
}

.btn-whatsapp:hover {
    background: #1eb954;
}

/* --- 9. MODALES OVERLAY --- */
.rol-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(5px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
}

.rol-modal-card, .modal-postular-card {
    background: var(--card-bg);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    width: 100%;
    max-width: 480px;
    padding: 2rem;
    position: relative;
    box-shadow: 0 12px 36px rgba(0,0,0,0.6);
}

.jobbers-close-btn {
    position: absolute;
    top: 1rem;
    right: 1.2rem;
    background: transparent;
    border: none;
    color: var(--text-muted);
    font-size: 1.8rem;
    cursor: pointer;
    line-height: 1;
}

.jobbers-close-btn:hover {
    color: var(--text-main);
}

.rol-options {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-top: 1.5rem;
}

.btn-rol {
    background: var(--card-bg-light);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    padding: 1.25rem 1rem;
    color: var(--text-main);
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
    transition: var(--transition);
}

.btn-rol:hover {
    border-color: var(--primary);
}

.rol-icon {
    font-size: 2rem;
}

.rol-title {
    font-weight: 800;
    font-size: 0.95rem;
}

.rol-desc {
    font-size: 0.75rem;
    color: var(--text-muted);
}

/* PASO CONFIRMACIÓN MODAL */
.rol-confirm-box {
    text-align: center;
}

.confirm-badge-container {
    margin: 1.2rem 0;
}

.confirm-badge-text {
    background: rgba(243, 156, 18, 0.15);
    color: var(--primary);
    padding: 0.5rem 1rem;
    border-radius: var(--radius-sm);
    font-size: 1.1rem;
}

.confirm-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1.5rem;
}

.confirm-actions button {
    flex: 1;
    height: 44px;
}

.btn-secondary {
    background: var(--bg-dark);
    border: 1px solid var(--border-color);
    color: var(--text-main);
    border-radius: var(--radius-sm);
    font-weight: 700;
    cursor: pointer;
}

/* --- 10. TOAST NOTIFICATION CONTAINER --- */
#toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 99999;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

/* --- 11. MEDIA QUERIES --- */
@media (max-width: 768px) {
    .navbar {
        padding: 1rem;
    }
    
    .nav-links {
        gap: 0.75rem;
    }

    .hero-title {
        font-size: 1.7rem;
    }

    .job-offer-card {
        flex-direction: column;
        align-items: flex-start;
    }

    .job-action-col {
        width: 100%;
        align-items: flex-start;
        margin-top: 0.5rem;
    }

    .btn-postularme {
        width: 100%;
        justify-content: center;
    }

    .categorias-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .rol-options {
        grid-template-columns: 1fr;
    }
}
