/**
 * Jobbers Argentina - Módulo Interactivo de Selección y Postulación Gastronómica
 * Versión Final Unificada, Optimizada y Sincronizada con base_de_datos.json
 */

(function () {
  'use strict';

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

  // Exposición explícita en window para compatibilidad con handlers inline HTML (ej: onclick="setMode(...)")
  window.setMode = setMode;

  // ==========================================
  // 2. CONFIGURACIÓN Y ESTADO DE LA APLICACIÓN
  // ==========================================
  const CONFIG = {
    API_URL: 'base_de_datos.json',
    DEBOUNCE_MS: 200,
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
        zona: 'Córdoba Capital',
        categoria: 'cocina',
        jornada: 'Full Time',
        turno: 'Turno Tarde/Noche',
        sueldo: '$500.000',
        descripcion: 'Buscamos cocinero con experiencia previa en despacho, elaboración de carta y manejo de stock.',
        requisitos: ['Experiencia previa mínima de 2 años', 'Libreta sanitaria al día'],
        contacto_wa: '5493513080197'
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

  // Mapeo entre etiquetas del HTML / Tarjetas y categorías de la Base de Datos
  const MAPEO_CATEGORIAS = {
    'barismo': 'barra',
    'bartender': 'barra',
    'salón': 'salon',
    'salon': 'salon',
    'mozo': 'salon',
    'bacha': 'limpieza'
  };

  // Función auxiliar para normalizar categorías usando el mapeo
  function normalizarCategoria(cat) {
    if (!cat) return 'todas';
    const c = cat.toLowerCase().trim();
    return MAPEO_CATEGORIAS[c] || c;
  }

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

  function debounce(func, delay = 200) {
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
      grid.innerHTML = `<div class="jobbers-loading" style="grid-column: 1/-1; text-align: center; padding: 2rem;"><p>Cargando ofertas de empleo...</p></div>`;
    }

    try {
      const response = await fetch(CONFIG.API_URL);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      state.vacantes = Array.isArray(data) && data.length > 0 ? data : CONFIG.FALLBACK_VACANTES;
    } catch (error) {
      console.warn('Cargando datos de respaldo (Fallback):', error);
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
    const catBuscada = normalizarCategoria(state.filtroCategoria);

    state.vacantesFiltradas = state.vacantes.filter(item => {
      const ubicacion = (item.zona || item.ubicacion || '').toLowerCase();
      const puesto = (item.puesto || '').toLowerCase();
      const empresa = (item.empresa || '').toLowerCase();
      const descripcion = (item.descripcion || '').toLowerCase();
      const itemCat = normalizarCategoria(item.categoria || '');

      const coincideQuery = !query || 
        puesto.includes(query) ||
        empresa.includes(query) ||
        ubicacion.includes(query) ||
        descripcion.includes(query);

      const coincideCat = catBuscada === 'todas' || catBuscada === 'todos' || itemCat === catBuscada;

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
        <div class="jobbers-empty-state" style="grid-column: 1/-1; padding: 2rem; text-align: center;">
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

        document.querySelectorAll('.category-card, .chip-item').forEach(el => {
          const rawVal = (el.dataset.category || el.querySelector('span')?.textContent || el.textContent).trim();
          const normVal = normalizarCategoria(rawVal);
          if (normVal === 'todas' || normVal === 'todos') {
            el.classList.add('active');
          } else {
            el.classList.remove('active');
          }
        });

        aplicarFiltros();
      });
      return;
    }

    grid.innerHTML = state.vacantesFiltradas.map(v => {
      const ubicacion = escapeHTML(v.zona || v.ubicacion || 'Córdoba');
      const sueldo = escapeHTML(v.sueldo || 'A convenir');
      const tiempo = escapeHTML(v.tiempo || v.haceCuanto || 'Reciente');
      const esUrgente = Boolean(v.urgente);

      return `
        <article class="job-card ${esUrgente ? 'urgente' : ''}" data-id="${escapeHTML(v.id)}">
          ${esUrgente ? '<span class="badge-urgente">Urgente</span>' : ''}
          <div class="job-card-header">
            <div>
              <h3 class="job-title">${escapeHTML(v.puesto)}</h3>
              <p class="job-company">${escapeHTML(v.empresa)} • <span class="job-location">${ubicacion}</span></p>
            </div>
            <span class="job-time">${tiempo}</span>
          </div>
          <div class="job-details">
            ${v.jornada ? `<span class="badge">${escapeHTML(v.jornada)}</span>` : ''}
            ${v.turno ? `<span class="badge">${escapeHTML(v.turno)}</span>` : ''}
            <span class="badge badge-salary">${sueldo}</span>
          </div>
          <div class="job-card-footer">
            <button type="button" class="btn-ver-detalle" data-id="${escapeHTML(v.id)}">Ver Detalle</button>
            <button type="button" class="btn-postularme" data-id="${escapeHTML(v.id)}">Postularme 📲</button>
          </div>
        </article>
      `;
    }).join('');
  }

  function actualizarContador() {
    const contador = document.querySelector(CONFIG.SELECTORS.CONTADOR_RESULTADOS) || document.getElementById('cant-vacantes');
    if (!contador) return;
    const total = state.vacantesFiltradas.length;
    contador.textContent = `${total} ${total === 1 ? 'oferta encontrada' : 'ofertas encontradas'}`;
  }

  // ==========================================
  // 6. MODALES Y POSTULACIÓN
  // ==========================================
  function asegurarEstructurasModales() {
    if (!document.getElementById('modal-jobbers-detalle')) {
      const modalDetalle = document.createElement('div');
      modalDetalle.id = 'modal-jobbers-detalle';
      modalDetalle.className = 'modal-overlay';
      modalDetalle.innerHTML = `
        <div class="modal-card">
          <button type="button" class="jobbers-close-btn" style="position:absolute; right:15px; top:15px; background:none; border:none; color:#fff; font-size:1.5rem; cursor:pointer;">&times;</button>
          <span id="det-categoria" class="badge-salary"></span>
          <h2 id="det-puesto" style="margin-top: 0.5rem;"></h2>
          <p id="det-empresa" style="color: var(--accent-amber); margin-bottom: 1rem;"></p>
          <div style="text-align: left; font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 1.5rem;">
            <p id="det-modalidad"></p>
            <p id="det-ubicacion"></p>
            <p id="det-sueldo" style="color: var(--accent-green); font-weight: 600; margin-top: 0.4rem;"></p>
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
          <button type="button" class="jobbers-close-btn" style="position:absolute; right:15px; top:15px; background:none; border:none; color:#fff; font-size:1.5rem; cursor:pointer;">&times;</button>
          <h2>Postulación Express</h2>
          <p id="post-subtitulo" style="color: var(--accent-amber); margin-bottom: 1rem;"></p>
          <form id="form-postulacion-jobbers" style="display:flex; flex-direction:column; gap:0.75rem; text-align:left;">
            <input type="hidden" id="post-id-vacante">
            <input type="hidden" id="post-contacto-wa">
            
            <div>
              <label style="font-size:0.8rem; display:block; margin-bottom:0.2rem;">Nombre y Apellido *</label>
              <input type="text" id="post-nombre" class="input-dark" placeholder="Ej: María González" required style="width:100%;">
            </div>
            <div>
              <label style="font-size:0.8rem; display:block; margin-bottom:0.2rem;">Número de WhatsApp *</label>
              <input type="tel" id="post-telefono" class="input-dark" placeholder="Ej: 3511234567" required style="width:100%;">
            </div>
            <div>
              <label style="font-size:0.8rem; display:block; margin-bottom:0.2rem;">Experiencia previa (Breve)</label>
              <textarea id="post-experiencia" class="input-dark" rows="3" placeholder="Contanos tu experiencia en el rubro..." style="width:100%;"></textarea>
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

    // Listener de cierre por clic en backdrop o botones de cierre
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay') || 
            e.target.classList.contains('jobbers-close-btn') || 
            e.target.classList.contains('btn-cerrar-modal')) {
          cerrarModal(modal);
        }
      });
    });

    // Cierre accesible de modales con la tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        cerrarModal();
      }
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

    const jornadaTurno = [vacante.jornada, vacante.turno].filter(Boolean).join(' • ') || vacante.modalidad || 'Presencial';

    document.getElementById('det-categoria').textContent = (vacante.categoria || 'Gastronomía').toUpperCase();
    document.getElementById('det-puesto').textContent = vacante.puesto;
    document.getElementById('det-empresa').textContent = `🏢 ${vacante.empresa}`;
    document.getElementById('det-modalidad').textContent = `💼 Modalidad: ${jornadaTurno}`;
    document.getElementById('det-ubicacion').textContent = `📍 Ubicación: ${vacante.zona || vacante.ubicacion || 'Córdoba'}`;
    document.getElementById('det-sueldo').textContent = `💰 Sueldo: ${vacante.sueldo || 'A convenir'}`;
    document.getElementById('det-descripcion').textContent = vacante.descripcion || `Se busca ${vacante.puesto} para sumarse al equipo de ${vacante.empresa}. Postulate enviando tu CV directamente por WhatsApp.`;

    const listaReq = document.getElementById('det-requisitos');
    if (listaReq) {
      listaReq.innerHTML = Array.isArray(vacante.requisitos) && vacante.requisitos.length > 0
        ? vacante.requisitos.map(r => `<li>${escapeHTML(r)}</li>`).join('')
        : '<li>Experiencia previa comprobable en el puesto.</li><li>Disponibilidad horaria indicada.</li>';
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
    document.getElementById('post-contacto-wa').value = vacante.contacto_wa || vacante.contactoWA || '5493513080197';

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
  // 7. LISTENERS DE BOTONES Y FILTROS
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
    const inputBuscador = document.querySelector(CONFIG.SELECTORS.INPUT_BUSQUEDA);
    if (inputBuscador) {
      inputBuscador.addEventListener('input', debounce((e) => {
        state.filtroBusqueda = e.target.value;
        aplicarFiltros();
      }, CONFIG.DEBOUNCE_MS));
    }

    const categoryElements = document.querySelectorAll('.category-card, .chip-item');
    categoryElements.forEach(item => {
      item.addEventListener('click', () => {
        const rawCat = item.dataset.category || item.querySelector('span')?.textContent.trim() || item.textContent.trim();
        state.filtroCategoria = rawCat;

        // Normalización cruzada para activar elementos equivalentes
        const catTargetNorm = normalizarCategoria(rawCat);
        categoryElements.forEach(c => {
          const cRaw = c.dataset.category || c.querySelector('span')?.textContent.trim() || c.textContent.trim();
          if (normalizarCategoria(cRaw) === catTargetNorm) {
            c.classList.add('active');
          } else {
            c.classList.remove('active');
          }
        });

        const selectCat = document.querySelector(CONFIG.SELECTORS.FILTRO_CATEGORIA);
        if (selectCat) {
          selectCat.value = rawCat.toLowerCase();
        }

        aplicarFiltros();
      });
    });

    const selectCategoria = document.querySelector(CONFIG.SELECTORS.FILTRO_CATEGORIA);
    if (selectCategoria) {
      selectCategoria.addEventListener('change', (e) => {
        const val = e.target.value.toLowerCase().trim();
        state.filtroCategoria = val;

        const catTargetNorm = normalizarCategoria(val);
        categoryElements.forEach(c => {
          const cRaw = (c.dataset.category || c.querySelector('span')?.textContent || c.textContent).toLowerCase().trim();
          if (normalizarCategoria(cRaw) === catTargetNorm) {
            c.classList.add('active');
          } else {
            c.classList.remove('active');
          }
        });

        aplicarFiltros();
      });
    }

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
