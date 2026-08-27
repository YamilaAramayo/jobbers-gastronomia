/**
 * Jobbers Argentina - Módulo Interactivo de Selección y Postulación Gastronómica
 * Versión Final Unificada con Filtros Visuales
 */

// ==========================================
// 1. CAMBIO DE MODO GLOBAL (Postulante / Empresa)
// ==========================================
function setMode(mode) {
  const postulanteView = document.getElementById('view-postulante');
  const empresaView = document.getElementById('view-empresa');
  const btnPostulante = document.getElementById('btn-mode-postulante');
  const btnEmpresa = document.getElementById('btn-mode-empresa');

  if (postulanteView && empresaView) {
    if (mode === 'postulante') {
      postulanteView.classList.add('active-view');
      empresaView.classList.remove('active-view');
      btnPostulante?.classList.add('active');
      btnEmpresa?.classList.remove('active');
    } else {
      empresaView.classList.add('active-view');
      postulanteView.classList.remove('active-view');
      btnEmpresa?.classList.add('active');
      btnPostulante?.classList.remove('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

(function () {
  'use strict';

  // ==========================================
  // 2. CONFIGURACIÓN Y ESTADO DE LA APLICACIÓN
  // ==========================================
  const CONFIG = {
    API_URL: '/wp-json/jobbers/v1/vacantes',
    DEBOUNCE_MS: 250,
    SELECTORS: {
      GRID_VACANTES: '#grid-vacantes',
      INPUT_BUSQUEDA: '#input-busqueda-vacantes',
      FILTRO_CATEGORIA: '#filtro-categoria-vacantes',
      CONTADOR_RESULTADOS: '#contador-vacantes'
    },
    FALLBACK_VACANTES: [
      {
        id: 101,
        puesto: 'Cocinero / Chef de Partida',
        empresa: 'Bistro Gourmet',
        ubicacion: 'Córdoba Capital',
        categoria: 'Cocina',
        modalidad: 'Presencial - Turno Tarde/Noche',
        descripcion: 'Buscamos cocinero con experiencia previa en despacho, elaboración de carta y manejo de stock.',
        requisitos: ['Experiencia previa mínima de 2 años', 'Libreta sanitaria al día', 'Trabajo en equipo'],
        contactoWA: '5493510000000'
      },
      {
        id: 102,
        puesto: 'Mozo / Camarera',
        empresa: 'Café Central',
        ubicacion: 'Carlos Paz',
        categoria: 'Salón',
        modalidad: 'Presencial - Full Time',
        descripcion: 'Atención al cliente en salón, manejo de bandeja, comanda digital y cobro.',
        requisitos: ['Excelente presencia y dicción', 'Disponibilidad fines de semana'],
        contactoWA: '5493510000001'
      },
      {
        id: 103,
        puesto: 'Bartender',
        empresa: 'Bar & Speakeasy',
        ubicacion: 'Nueva Córdoba',
        categoria: 'Barra',
        modalidad: 'Presencial - Nocturno',
        descripcion: 'Elaboración de coctelería clásica y de autor, control de insumos de barra.',
        requisitos: ['Curso de coctelería finalizado', 'Manejo de ritmo de trabajo en volumen'],
        contactoWA: '5493510000002'
      }
    ]
  };

  const state = {
    vacantes: [],
    vacantesFiltradas: [],
    filtroBusqueda: '',
    filtroCategoria: 'todas',
    elementoPrevioFoco: null,
    vacanteSeleccionada: null
  };

  // ==========================================
  // 3. UTILIDADES
  // ==========================================
  function escapeHTML(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function debounce(func, delay = 250) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // ==========================================
  // 4. CARGA DE DATOS
  // ==========================================
  async function cargarVacantes() {
    const grid = document.querySelector(CONFIG.SELECTORS.GRID_VACANTES);
    if (grid) {
      grid.innerHTML = `<div class="jobbers-loading"><p>Cargando ofertas de empleo...</p></div>`;
    }

    try {
      const response = await fetch(CONFIG.API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      state.vacantes = Array.isArray(data) && data.length > 0 ? data : CONFIG.FALLBACK_VACANTES;
    } catch (error) {
      state.vacantes = [...CONFIG.FALLBACK_VACANTES];
    } finally {
      aplicarFiltros();
    }
  }

  // ==========================================
  // 5. FILTRADO Y RENDERIZADO DE GRILLA
  // ==========================================
  function aplicarFiltros() {
    const query = state.filtroBusqueda.toLowerCase().trim();
    const cat = state.filtroCategoria.toLowerCase().trim();

    state.vacantesFiltradas = state.vacantes.filter(item => {
      const coincideQuery = !query || 
        item.puesto?.toLowerCase().includes(query) ||
        item.empresa?.toLowerCase().includes(query) ||
        item.ubicacion?.toLowerCase().includes(query) ||
        item.descripcion?.toLowerCase().includes(query);

      const coincideCat = cat === 'todas' || cat === 'todos' || item.categoria?.toLowerCase() === cat;

      return coincideQuery && coincideCat;
    });

    renderizarGrid();
    actualizarContador();
  }

  function renderizarGrid() {
    const grid = document.querySelector(CONFIG.SELECTORS.GRID_VACANTES);
    if (!grid) return;

    if (state.vacantesFiltradas.length === 0) {
      grid.innerHTML = `
        <div class="jobbers-empty-state" style="padding: 2rem; text-align: center;">
          <p>🔍 No se encontraron vacantes que coincidan con tu búsqueda.</p>
          <button type="button" class="btn-amber" id="btn-reset-filtros" style="margin-top: 1rem;">Ver todas las ofertas</button>
        </div>
      `;
      document.getElementById('btn-reset-filtros')?.addEventListener('click', () => {
        state.filtroBusqueda = '';
        state.filtroCategoria = 'todas';

        const inputBuscador = document.querySelector(CONFIG.SELECTORS.INPUT_BUSQUEDA);
        const selectCat = document.querySelector(CONFIG.SELECTORS.FILTRO_CATEGORIA);
        if (inputBuscador) inputBuscador.value = '';
        if (selectCat) selectCat.value = 'todas';

        // Restablecer clase active en tarjetas y chips
        document.querySelectorAll('.category-card, .chip-item').forEach(el => {
          const val = (el.dataset.category || el.querySelector('span')?.textContent || el.textContent).toLowerCase().trim();
          if (val === 'todas' || val === 'todos') {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        });

        aplicarFiltros();
      });
      return;
    }

    grid.innerHTML = state.vacantesFiltradas.map(v => `
      <article class="job-card" data-id="${escapeHTML(v.id)}">
        <div>
          <span class="badge-salary">${escapeHTML(v.categoria || 'Gastronomía')}</span>
          <h3 class="job-title" style="margin-top: 0.5rem;">${escapeHTML(v.puesto)}</h3>
          <p class="job-meta">🏢 ${escapeHTML(v.empresa)} | 📍 ${escapeHTML(v.ubicacion || 'Argentina')}</p>
          <p class="job-meta" style="margin-top: 0.4rem;">${escapeHTML(v.descripcion?.substring(0, 110))}${v.descripcion?.length > 110 ? '...' : ''}</p>
        </div>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
          <button type="button" class="btn-amber btn-ver-detalle" data-id="${escapeHTML(v.id)}" style="background: transparent; border: 1px solid var(--accent-amber); color: var(--accent-amber);">Ver Detalle</button>
          <button type="button" class="btn-green btn-postularme" data-id="${escapeHTML(v.id)}">Postularme 📲</button>
        </div>
      </article>
    `).join('');
  }

  function actualizarContador() {
    const contador = document.querySelector(CONFIG.SELECTORS.CONTADOR_RESULTADOS);
    if (!contador) return;
    const total = state.vacantesFiltradas.length;
    contador.textContent = `${total} ${total === 1 ? 'oferta encontrada' : 'ofertas encontradas'}`;
  }

  // ==========================================
  // 6. MODALES Y NAVEGACIÓN
  // ==========================================
  function asegurarEstructurasModales() {
    if (!document.getElementById('modal-jobbers-detalle')) {
      const modalDetalle = document.createElement('div');
      modalDetalle.id = 'modal-jobbers-detalle';
      modalDetalle.className = 'modal-overlay';
      modalDetalle.innerHTML = `
        <div class="modal-card">
          <button type="button" class="jobbers-close-btn" style="position:absolute; right:15px; top:15px; background:none; color:#fff; font-size:1.5rem;">&times;</button>
          <span id="det-categoria" class="badge-salary"></span>
          <h2 id="det-puesto" style="margin-top: 0.5rem;"></h2>
          <p id="det-empresa" style="color: var(--accent-amber); margin-bottom: 1rem;"></p>
          <div style="text-align: left; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
            <p id="det-modalidad"></p>
            <p id="det-ubicacion"></p>
            <h4 style="color:#fff; margin-top:1rem;">Descripción</h4>
            <p id="det-descripcion"></p>
            <h4 style="color:#fff; margin-top:1rem;">Requisitos</h4>
            <ul id="det-requisitos" style="padding-left: 1.2rem;"></ul>
          </div>
          <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
            <button type="button" class="btn-amber btn-cerrar-modal" style="background:transparent; border:1px solid var(--border-color); color:#fff;">Cerrar</button>
            <button type="button" id="det-btn-postular" class="btn-green">Postularme Ahora</button>
          </div>
        </div>
      `;
      document.body.appendChild(modalDetalle);
    }

    if (!document.getElementById('modal-jobbers-postulacion')) {
      const modalPostulacion = document.createElement('div');
      modalPostulacion.id = 'modal-jobbers-postulacion';
      modalPostulacion.className = 'modal-overlay';
      modalPostulacion.innerHTML = `
        <div class="modal-card">
          <button type="button" class="jobbers-close-btn" style="position:absolute; right:15px; top:15px; background:none; color:#fff; font-size:1.5rem;">&times;</button>
          <h2>Postulación Express</h2>
          <p id="post-subtitulo" style="color: var(--accent-amber); margin-bottom: 1rem;"></p>
          <form id="form-postulacion-jobbers" style="display:flex; flex-direction:column; gap:0.75rem; text-align:left;">
            <input type="hidden" id="post-id-vacante">
            <input type="hidden" id="post-contacto-wa">
            
            <div>
              <label style="font-size:0.8rem;">Nombre y Apellido *</label>
              <input type="text" id="post-nombre" class="input-dark" placeholder="Ej: María González" required>
            </div>
            <div>
              <label style="font-size:0.8rem;">Número de WhatsApp *</label>
              <input type="tel" id="post-telefono" class="input-dark" placeholder="Ej: 3511234567" required>
            </div>
            <div>
              <label style="font-size:0.8rem;">Experiencia previa (Breve)</label>
              <textarea id="post-experiencia" class="input-dark" rows="3" placeholder="Contanos tu experiencia en el rubro..."></textarea>
            </div>
            
            <p style="font-size:0.75rem; color: var(--text-secondary);">📎 Al abrirse WhatsApp, recordá adjuntar tu CV en PDF.</p>

            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
              <button type="button" class="btn-amber btn-cerrar-modal" style="flex:1; background:transparent; border:1px solid var(--border-color); color:#fff;">Cancelar</button>
              <button type="submit" class="btn-green" style="flex:2;">Enviar WhatsApp 📲</button>
            </div>
          </form>
        </div>
      `;
      document.body.appendChild(modalPostulacion);
      document.getElementById('form-postulacion-jobbers')?.addEventListener('submit', manejarEnvioPostulacion);
    }

    // Cierre de modales global
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay') || 
            e.target.classList.contains('jobbers-close-btn') || 
            e.target.classList.contains('btn-cerrar-modal')) {
          cerrarModal(modal);
        }
      });
    });
  }

  function abrirModal(modalEl) {
    if (!modalEl) return;
    state.elementoPrevioFoco = document.activeElement;
    modalEl.classList.add('active');
  }

  function cerrarModal(modalEl = null) {
    const modalActivo = modalEl || document.querySelector('.modal-overlay.active');
    if (!modalActivo) return;
    modalActivo.classList.remove('active');
    if (state.elementoPrevioFoco?.focus) state.elementoPrevioFoco.focus();
  }

  function mostrarDetalleVacante(idVacante) {
    const vacante = state.vacantes.find(v => String(v.id) === String(idVacante));
    if (!vacante) return;

    state.vacanteSeleccionada = vacante;
    const modal = document.getElementById('modal-jobbers-detalle');
    if (!modal) return;

    document.getElementById('det-categoria').textContent = vacante.categoria || 'Gastronomía';
    document.getElementById('det-puesto').textContent = vacante.puesto;
    document.getElementById('det-empresa').textContent = `🏢 ${vacante.empresa}`;
    document.getElementById('det-modalidad').textContent = `💼 Modalidad: ${vacante.modalidad || 'A convenir'}`;
    document.getElementById('det-ubicacion').textContent = `📍 Ubicación: ${vacante.ubicacion || 'Córdoba'}`;
    document.getElementById('det-descripcion').textContent = vacante.descripcion;

    const listaReq = document.getElementById('det-requisitos');
    if (listaReq) {
      listaReq.innerHTML = Array.isArray(vacante.requisitos) && vacante.requisitos.length > 0
        ? vacante.requisitos.map(r => `<li>${escapeHTML(r)}</li>`).join('')
        : '<li>Sin requisitos específicos expresados.</li>';
    }

    const btnPostular = document.getElementById('det-btn-postular');
    if (btnPostular) {
      btnPostular.onclick = () => {
        cerrarModal(modal);
        abrirFormularioPostulacion(vacante);
      };
    }
    abrirModal(modal);
  }

  function abrirFormularioPostulacion(vacante) {
    if (!vacante) return;
    const modal = document.getElementById('modal-jobbers-postulacion');
    if (!modal) return;

    document.getElementById('post-subtitulo').textContent = `${vacante.puesto} - ${vacante.empresa}`;
    document.getElementById('post-id-vacante').value = vacante.id;
    document.getElementById('post-contacto-wa').value = vacante.contactoWA || '5493510000000';

    const form = document.getElementById('form-postulacion-jobbers');
    if (form) form.reset();
    abrirModal(modal);
  }

  function manejarEnvioPostulacion(e) {
    e.preventDefault();
    const nombre = document.getElementById('post-nombre')?.value.trim();
    const telefono = document.getElementById('post-telefono')?.value.trim();
    const experiencia = document.getElementById('post-experiencia')?.value.trim();
    const waContacto = document.getElementById('post-contacto-wa')?.value;

    if (!nombre || !telefono) {
      alert('Por favor completá tu nombre y teléfono.');
      return;
    }

    const vacante = state.vacanteSeleccionada || {};
    let mensaje = `👋 *Hola! Mi nombre es ${nombre}.*\n\n`;
    mensaje += `Me postulo para la vacante de *${vacante.puesto || 'Puesto Gastronómico'}* en *${vacante.empresa || 'Jobbers Argentina'}*.\n\n`;
    mensaje += `📱 *Mi Teléfono:* ${telefono}\n`;
    if (experiencia) mensaje += `📝 *Mi Presentación:* ${experiencia}\n`;
    mensaje += `\n📎 *Adjunto mi CV en formato PDF a este chat para su evaluación.* Muchas gracias!`;

    const urlWA = `https://wa.me/${waContacto}?text=${encodeURIComponent(mensaje)}`;
    cerrarModal(document.querySelector('.modal-overlay.active'));
    window.open(urlWA, '_blank', 'noopener,noreferrer');
  }

  // ==========================================
  // 7. LISTENERS DE BOTONES, TARJETAS Y CHIPS
  // ==========================================
  function inicializarEventosGrid() {
    const grid = document.querySelector(CONFIG.SELECTORS.GRID_VACANTES);
    if (!grid) return;

    grid.addEventListener('click', (e) => {
      const btnDetalle = e.target.closest('.btn-ver-detalle');
      const btnPostularme = e.target.closest('.btn-postularme');

      if (btnDetalle) {
        mostrarDetalleVacante(btnDetalle.dataset.id);
      } else if (btnPostularme) {
        const id = btnPostularme.dataset.id;
        const vacante = state.vacantes.find(v => String(v.id) === String(id));
        if (vacante) {
          state.vacanteSeleccionada = vacante;
          abrirFormularioPostulacion(vacante);
        }
      }
    });
  }

  function inicializarFiltrosYBotones() {
    // Buscador de texto
    const inputBuscador = document.querySelector(CONFIG.SELECTORS.INPUT_BUSQUEDA);
    if (inputBuscador) {
      inputBuscador.addEventListener('input', debounce((e) => {
        state.filtroBusqueda = e.target.value;
        aplicarFiltros();
      }, CONFIG.DEBOUNCE_MS));
    }

    // Tarjetas (.category-card) y Chips (.chip-item) de Categoría
    const categoryElements = document.querySelectorAll('.category-card, .chip-item');
    categoryElements.forEach(item => {
      item.addEventListener('click', () => {
        categoryElements.forEach(c => c.classList.remove('active'));
        item.classList.add('active');

        const cat = item.dataset.category || item.querySelector('span')?.textContent.trim() || item.textContent.trim();
        state.filtroCategoria = cat;

        // Sincronizar el select flotante/desplegable si existe
        const selectCat = document.querySelector(CONFIG.SELECTORS.FILTRO_CATEGORIA);
        if (selectCat) {
          selectCat.value = cat.toLowerCase();
        }

        aplicarFiltros();
      });
    });

    // Select Categorías (sincroniza hacia las tarjetas)
    const selectCategoria = document.querySelector(CONFIG.SELECTORS.FILTRO_CATEGORIA);
    if (selectCategoria) {
      selectCategoria.addEventListener('change', (e) => {
        const val = e.target.value.toLowerCase().trim();
        state.filtroCategoria = val;

        categoryElements.forEach(c => {
          const cCat = (c.dataset.category || c.querySelector('span')?.textContent || c.textContent).toLowerCase().trim();
          if (cCat === val) {
            c.classList.add('active');
          } else {
            c.classList.remove('active');
          }
        });

        aplicarFiltros();
      });
    }

    // Switches de Vista (Header y Mobile Nav)
    document.getElementById('btn-mode-postulante')?.addEventListener('click', () => setMode('postulante'));
    document.getElementById('btn-mode-empresa')?.addEventListener('click', () => setMode('empresa'));

    document.querySelectorAll('.bottom-nav-item').forEach(item => {
      item.addEventListener('click', () => {
        const mode = item.dataset.mode || (item.textContent.includes('Empresa') ? 'empresa' : 'postulante');
        document.querySelectorAll('.bottom-nav-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        setMode(mode);
      });
    });

    // Formulario Publicar Express (Modo Empresa)
    const formExpress = document.querySelector('.express-form-card form');
    if (formExpress) {
      formExpress.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('¡Oferta express recibida! Nos pondremos en contacto para activarla.');
        formExpress.reset();
      });
    }
  }

  // ==========================================
  // 8. INICIALIZACIÓN
  // ==========================================
  function init() {
    asegurarEstructurasModales();
    inicializarEventosGrid();
    inicializarFiltrosYBotones();
    cargarVacantes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
