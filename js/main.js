/**
 * Jobbers Argentina - Módulo Interactivo de Selección y Postulación Gastronómica
 * Versión Mejorada & Optimizada (ES6+)
 */
function setMode(mode) {
    const postulanteView = document.getElementById('view-postulante');
    const empresaView = document.getElementById('view-empresa');
    const btnPostulante = document.getElementById('btn-mode-postulante');
    const btnEmpresa = document.getElementById('btn-mode-empresa');

    if (mode === 'postulante') {
        postulanteView.classList.add('active-view');
        empresaView.classList.remove('active-view');
        btnPostulante.classList.add('active');
        btnEmpresa.classList.remove('active');
    } else {
        empresaView.classList.add('active-view');
        postulanteView.classList.remove('active-view');
        btnEmpresa.classList.add('active');
        btnPostulante.classList.remove('active');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
}
(function () {
  'use strict';

  // ==========================================
  // 1. CONFIGURACIÓN Y ESTADO DE LA APLICACIÓN
  // ==========================================
  const CONFIG = {
    API_URL: '/wp-json/jobbers/v1/vacantes', // O ruta a vacantes.json
    DEBOUNCE_MS: 250,
    SELECTORS: {
      GRID_VACANTES: '#grid-vacantes',
      INPUT_BUSQUEDA: '#input-busqueda-vacantes',
      FILTRO_CATEGORIA: '#filtro-categoria-vacantes',
      CONTADOR_RESULTADOS: '#contador-vacantes'
    },
    // Datos de contingencia en caso de error de red o servidor
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
  // 2. UTILIDADES (XSS, DEBOUNCE)
  // ==========================================
  
  /**
   * Escapa caracteres especiales para prevenir vulnerabilidades XSS
   */
  function escapeHTML(str) {
    if (!str && str !== 0) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Limita la frecuencia de ejecución de una función
   */
  function debounce(func, delay = 250) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  // ==========================================
  // 3. CARGA DE DATOS (API / JSON)
  // ==========================================
  async function cargarVacantes() {
    const grid = document.querySelector(CONFIG.SELECTORS.GRID_VACANTES);
    if (grid) {
      grid.innerHTML = `<div class="jobbers-loading"><p>Cargando ofertas de empleo...</p></div>`;
    }

    try {
      const response = await fetch(CONFIG.API_URL);
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      state.vacantes = Array.isArray(data) && data.length > 0 ? data : CONFIG.FALLBACK_VACANTES;
    } catch (error) {
      console.warn('Jobbers Portal: No se pudo cargar desde la API. Cargando datos de reserva.', error);
      state.vacantes = [...CONFIG.FALLBACK_VACANTES];
    } finally {
      aplicarFiltros();
    }
  }

  // ==========================================
  // 4. LÓGICA DE FILTRADO Y RENDERIZADO
  // ==========================================
  function aplicarFiltros() {
    const query = state.filtroBusqueda.toLowerCase().trim();
    const cat = state.filtroCategoria;

    state.vacantesFiltradas = state.vacantes.filter(item => {
      const coincideQuery = !query || 
        item.puesto?.toLowerCase().includes(query) ||
        item.empresa?.toLowerCase().includes(query) ||
        item.ubicacion?.toLowerCase().includes(query) ||
        item.descripcion?.toLowerCase().includes(query);

      const coincideCat = cat === 'todas' || item.categoria?.toLowerCase() === cat.toLowerCase();

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
        <div class="jobbers-empty-state">
          <p>🔍 No se encontraron vacantes que coincidan con tu búsqueda.</p>
          <button type="button" class="btn-reset-filters" id="btn-reset-filtros">Ver todas las ofertas</button>
        </div>
      `;
      document.getElementById('btn-reset-filtros')?.addEventListener('click', () => {
        state.filtroBusqueda = '';
        state.filtroCategoria = 'todas';
        const inputBuscador = document.querySelector(CONFIG.SELECTORS.INPUT_BUSQUEDA);
        const selectCat = document.querySelector(CONFIG.SELECTORS.FILTRO_CATEGORIA);
        if (inputBuscador) inputBuscador.value = '';
        if (selectCat) selectCat.value = 'todas';
        aplicarFiltros();
      });
      return;
    }

    grid.innerHTML = state.vacantesFiltradas.map(v => `
      <article class="jobbers-card" data-id="${escapeHTML(v.id)}">
        <div class="jobbers-card-header">
          <span class="jobbers-badge">${escapeHTML(v.categoria || 'Gastronomía')}</span>
          <span class="jobbers-location">📍 ${escapeHTML(v.ubicacion || 'Argentina')}</span>
        </div>
        <h3 class="jobbers-card-title">${escapeHTML(v.puesto)}</h3>
        <p class="jobbers-card-company">🏢 ${escapeHTML(v.empresa)}</p>
        <p class="jobbers-card-desc">${escapeHTML(v.descripcion?.substring(0, 110))}${v.descripcion?.length > 110 ? '...' : ''}</p>
        <div class="jobbers-card-footer">
          <button type="button" class="btn-secondary btn-ver-detalle" data-id="${escapeHTML(v.id)}">Ver Detalle</button>
          <button type="button" class="btn-primary btn-postularme" data-id="${escapeHTML(v.id)}">Postularme</button>
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
  // 5. GESTIÓN DE MODALES (SINGLETON Y A11Y)
  // ==========================================
  
  /**
   * Crea las estructuras fijas de los modales en el DOM una sola vez
   */
  function asegurarEstructurasModales() {
    // Modal 1: Detalle de la Vacante
    if (!document.getElementById('modal-jobbers-detalle')) {
      const modalDetalle = document.createElement('div');
      modalDetalle.id = 'modal-jobbers-detalle';
      modalDetalle.className = 'jobbers-modal-overlay';
      modalDetalle.setAttribute('role', 'dialog');
      modalDetalle.setAttribute('aria-modal', 'true');
      modalDetalle.setAttribute('aria-hidden', 'true');

      modalDetalle.innerHTML = `
        <div class="jobbers-modal-card" tabindex="-1">
          <button type="button" class="jobbers-close-btn" aria-label="Cerrar modal">&times;</button>
          <div class="jobbers-modal-header">
            <span id="det-categoria" class="jobbers-badge"></span>
            <h2 id="det-puesto"></h2>
            <p id="det-empresa" class="modal-subtitle-accent"></p>
          </div>
          <div class="jobbers-modal-body">
            <p id="det-modalidad" class="jobbers-meta-info"></p>
            <p id="det-ubicacion" class="jobbers-meta-info"></p>
            <h4>Descripción del Puesto</h4>
            <p id="det-descripcion"></p>
            <h4>Requisitos</h4>
            <ul id="det-requisitos"></ul>
          </div>
          <div class="jobbers-modal-footer">
            <button type="button" class="btn-secondary btn-cerrar-modal">Cerrar</button>
            <button type="button" id="det-btn-postular" class="btn-primary">Postularme Ahora</button>
          </div>
        </div>
      `;
      document.body.appendChild(modalDetalle);
    }

    // Modal 2: Formulario de Postulación por WhatsApp
    if (!document.getElementById('modal-jobbers-postulacion')) {
      const modalPostulacion = document.createElement('div');
      modalPostulacion.id = 'modal-jobbers-postulacion';
      modalPostulacion.className = 'jobbers-modal-overlay';
      modalPostulacion.setAttribute('role', 'dialog');
      modalPostulacion.setAttribute('aria-modal', 'true');
      modalPostulacion.setAttribute('aria-hidden', 'true');

      modalPostulacion.innerHTML = `
        <div class="jobbers-modal-card" tabindex="-1">
          <button type="button" class="jobbers-close-btn" aria-label="Cerrar modal">&times;</button>
          <div class="jobbers-modal-header">
            <h2>POSTULARME AL PUESTO</h2>
            <p id="post-subtitulo" class="modal-subtitle-accent"></p>
          </div>
          <div class="jobbers-modal-body">
            <div class="jobbers-alert-box">
              <p>📎 <strong>Importante:</strong> Al abrirse WhatsApp con tu mensaje formateado, <u>recordá adjuntar tu CV en formato PDF</u>.</p>
            </div>
            <form id="form-postulacion-jobbers" novalidate>
              <input type="hidden" id="post-id-vacante">
              <input type="hidden" id="post-contacto-wa">
              
              <div class="form-group">
                <label for="post-nombre">Nombre y Apellido *</label>
                <input type="text" id="post-nombre" placeholder="Ej: María González" required>
              </div>
              
              <div class="form-group">
                <label for="post-telefono">Número de WhatsApp *</label>
                <input type="tel" id="post-telefono" placeholder="Ej: 3511234567" required>
              </div>

              <div class="form-group">
                <label for="post-experiencia">Breve presentación o experiencia previa</label>
                <textarea id="post-experiencia" rows="3" placeholder="Contanos brevemente tu experiencia en el sector..."></textarea>
              </div>

              <div class="jobbers-form-actions">
                <button type="button" class="btn-secondary btn-cerrar-modal">Cancelar</button>
                <button type="submit" class="btn-primary">Enviar Postulación por WhatsApp 📲</button>
              </div>
            </form>
          </div>
        </div>
      `;
      document.body.appendChild(modalPostulacion);

      // Listener del formulario de postulación
      document.getElementById('form-postulacion-jobbers')?.addEventListener('submit', manejarEnvioPostulacion);
    }

    // Configurar delegación global de cierre de modales
    document.querySelectorAll('.jobbers-modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('jobbers-modal-overlay') || 
            e.target.classList.contains('jobbers-close-btn') || 
            e.target.classList.contains('btn-cerrar-modal')) {
          cerrarModal(modal);
        }
      });
    });
  }

  function abrirModal(modalEl) {
    if (!modalEl) return;
    
    // Guardar foco previo para a11y
    state.elementoPrevioFoco = document.activeElement;

    modalEl.classList.add('is-open');
    modalEl.setAttribute('aria-hidden', 'false');

    const card = modalEl.querySelector('.jobbers-modal-card');
    if (card) {
      card.focus();
    }

    // Registrar eventos temporales de teclado
    document.addEventListener('keydown', manejarTecladoModal);
  }

  function cerrarModal(modalEl = null) {
    const modalActivo = modalEl || document.querySelector('.jobbers-modal-overlay.is-open');
    if (!modalActivo) return;

    modalActivo.classList.remove('is-open');
    modalActivo.setAttribute('aria-hidden', 'true');

    document.removeEventListener('keydown', manejarTecladoModal);

    // Restaurar foco al elemento que activó la acción
    if (state.elementoPrevioFoco && typeof state.elementoPrevioFoco.focus === 'function') {
      state.elementoPrevioFoco.focus();
    }
  }

  function manejarTecladoModal(e) {
    const modalActivo = document.querySelector('.jobbers-modal-overlay.is-open');
    if (!modalActivo) return;

    // Tecla Escape para cerrar
    if (e.key === 'Escape') {
      cerrarModal(modalActivo);
      return;
    }

    // Focus Trapping (Tab / Shift+Tab)
    if (e.key === 'Tab') {
      const elementosFocuseables = modalActivo.querySelectorAll(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (elementosFocuseables.length === 0) return;

      const primerElemento = elementosFocuseables[0];
      const ultimoElemento = elementosFocuseables[elementosFocuseables.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === primerElemento) {
          e.preventDefault();
          ultimoElemento.focus();
        }
      } else {
        if (document.activeElement === ultimoElemento) {
          e.preventDefault();
          primerElemento.focus();
        }
      }
    }
  }

  // ==========================================
  // 6. ACCIONES DE MODAL ESPECÍFICAS
  // ==========================================
  function mostrarDetalleVacante(idVacante) {
    const vacante = state.vacantes.find(v => String(v.id) === String(idVacante));
    if (!vacante) return;

    state.vacanteSeleccionada = vacante;
    const modal = document.getElementById('modal-jobbers-detalle');
    if (!modal) return;

    // Actualización de contenidos dinámicos
    document.getElementById('det-categoria').textContent = vacante.categoria || 'Gastronomía';
    document.getElementById('det-puesto').textContent = vacante.puesto;
    document.getElementById('det-empresa').textContent = `🏢 ${vacante.empresa}`;
    document.getElementById('det-modalidad').textContent = `💼 Modalidad: ${vacante.modalidad || 'A convenir'}`;
    document.getElementById('det-ubicacion').textContent = `📍 Ubicación: ${vacante.ubicacion || 'Córdoba'}`;
    document.getElementById('det-descripcion').textContent = vacante.descripcion;

    const listaReq = document.getElementById('det-requisitos');
    if (listaReq) {
      if (Array.isArray(vacante.requisitos) && vacante.requisitos.length > 0) {
        listaReq.innerHTML = vacante.requisitos.map(r => `<li>${escapeHTML(r)}</li>`).join('');
      } else {
        listaReq.innerHTML = '<li>Sin requisitos específicos expresados.</li>';
      }
    }

    // Vincular acción de postulación desde dentro del modal de detalle
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

    // Limpiar campos previas
    const form = document.getElementById('form-postulacion-jobbers');
    if (form) form.reset();

    abrirModal(modal);
  }

  // ==========================================
  // 7. INTEGRACIÓN CON WHATSAPP
  // ==========================================
  function manejarEnvioPostulacion(e) {
    e.preventDefault();

    const nombreInput = document.getElementById('post-nombre');
    const telefonoInput = document.getElementById('post-telefono');
    const experienciaInput = document.getElementById('post-experiencia');
    const waContacto = document.getElementById('post-contacto-wa').value;

    const nombre = nombreInput ? nombreInput.value.trim() : '';
    const telefono = telefonoInput ? telefonoInput.value.trim() : '';
    const experiencia = experienciaInput ? experienciaInput.value.trim() : '';

    if (!nombre || !telefono) {
      alert('Por favor, completá tu Nombre y WhatsApp para enviar la postulación.');
      if (!nombre && nombreInput) nombreInput.focus();
      else if (telefonoInput) telefonoInput.focus();
      return;
    }

    const vacante = state.vacanteSeleccionada || {};

    // Construcción del mensaje formateado para WhatsApp
    let mensaje = `👋 *Hola! Mi nombre es ${nombre}.*\n\n`;
    mensaje += `Me postulo para la vacante de *${vacante.puesto || 'Puesto Gastronómico'}* en *${vacante.empresa || 'Jobbers Argentina'}*.\n\n`;
    mensaje += `📱 *Mi Teléfono:* ${telefono}\n`;
    if (experiencia) {
      mensaje += `📝 *Mi Presentación:* ${experiencia}\n`;
    }
    mensaje += `\n📎 *Adjunto mi CV en formato PDF a este chat para su evaluación.* Muchas gracias!`;

    const urlWA = `https://wa.me/${waContacto}?text=${encodeURIComponent(mensaje)}`;

    // Cerrar modal y abrir chat de WhatsApp
    cerrarModal(document.querySelector('.jobbers-modal-overlay.is-open'));
    window.open(urlWA, '_blank', 'noopener,noreferrer');
  }

  // ==========================================
  // 8. DELEGACIÓN DE EVENTOS EN LA GRILLA
  // ==========================================
  function inicializarEventosGrid() {
    const grid = document.querySelector(CONFIG.SELECTORS.GRID_VACANTES);
    if (!grid) return;

    grid.addEventListener('click', (e) => {
      const btnDetalle = e.target.closest('.btn-ver-detalle');
      const btnPostularme = e.target.closest('.btn-postularme');

      if (btnDetalle) {
        const id = btnDetalle.dataset.id;
        mostrarDetalleVacante(id);
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

  // ==========================================
  // 9. EVENTOS DE BÚSQUEDA Y FILTROS
  // ==========================================
  function inicializarFiltros() {
    const inputBuscador = document.querySelector(CONFIG.SELECTORS.INPUT_BUSQUEDA);
    const selectCategoria = document.querySelector(CONFIG.SELECTORS.FILTRO_CATEGORIA);

    if (inputBuscador) {
      const handlerDebounced = debounce((e) => {
        state.filtroBusqueda = e.target.value;
        aplicarFiltros();
      }, CONFIG.DEBOUNCE_MS);

      inputBuscador.addEventListener('input', handlerDebounced);
    }

    if (selectCategoria) {
      selectCategoria.addEventListener('change', (e) => {
        state.filtroCategoria = e.target.value;
        aplicarFiltros();
      });
    }
  }

  // ==========================================
  // 10. INICIALIZACIÓN DE LA APLICACIÓN
  // ==========================================
  function init() {
    asegurarEstructurasModales();
    inicializarEventosGrid();
    inicializarFiltros();
    cargarVacantes();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
