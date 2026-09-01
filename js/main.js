/**
 * Jobbers Argentina - Módulo Interactivo Gastronómico
 * Versión Consolidada, Accesible (A11y) y Optimizada
 */

(function () {
  'use strict';

  // ==========================================
  // 1. CONFIGURACIÓN Y ESTADO DE LA APLICACIÓN
  // ==========================================
  const CONFIG = Object.freeze({
    API_URL: 'base_de_datos.json',
    DEBOUNCE_MS: 200,
    STORAGE_KEY: 'jobbers_user_mode',
    WA_DEFAULT: '5493541582448',
    SELECTORS: {
      GRID_VACANTES: '#grid-vacantes',
      INPUT_PUESTO: '#input-busqueda-vacantes',
      INPUT_UBICACION: '#input-busqueda-ubicacion',
      FILTRO_CATEGORIA: '#filtro-categoria-vacantes',
      CONTADOR_RESULTADOS: '#cant-vacantes',
      FORM_EXPRESS: '#form-publicacion-express',
      MODAL_BIENVENIDA: '#modal-bienvenida'
    },
    FALLBACK_VACANTES: [
      {
        id: 101,
        puesto: 'Cocinero / Chef de Partida',
        empresa: 'Bistro Gourmet',
        zona: 'Centro / Alberdi',
        categoria: 'cocina',
        jornada: 'Full Time',
        turno: 'Turno Tarde/Noche',
        sueldo: '$500.000',
        urgente: true,
        descripcion: 'Buscamos cocinero con experiencia previa en despacho, elaboración de carta y manejo de stock.',
        requisitos: ['Experiencia previa mínima de 2 años', 'Libreta sanitaria al día'],
        contacto_wa: '5493541582448'
      },
      {
        id: 102,
        puesto: 'Barista Profesional',
        empresa: 'Café de Especialidad',
        zona: 'Nueva Córdoba / Güemes',
        categoria: 'barismo',
        jornada: 'Part Time',
        turno: 'Turno Mañana',
        sueldo: '$380.000',
        urgente: false,
        descripcion: 'Atención al público, calibración de molino, arte latte y despacho de pastelería.',
        requisitos: ['Curso de Barismo comprobable', 'Excelente presencia y trato'],
        contacto_wa: '5493541582448'
      }
    ]
  });

  const state = {
    vacantes: [],
    vacantesFiltradas: [],
    filtroPuesto: '',
    filtroUbicacion: '',
    filtroCategoria: 'todas',
    elementoPrevioFoco: null,
    vacanteSeleccionada: null
  };

  const MAPEO_CATEGORIAS = Object.freeze({
    'barismo': 'barismo',
    'bartender': 'bartender',
    'salón / mozo': 'salón',
    'salón': 'salón',
    'salon': 'salón',
    'mozo': 'salón',
    'bacha / limpieza': 'limpieza',
    'limpieza': 'limpieza',
    'rrhh / gestión': 'rrhh',
    'rrhh': 'rrhh',
    'administración': 'administración',
    'cocina': 'cocina',
    'delivery': 'delivery'
  });

  function normalizarCategoria(cat) {
    if (!cat) return 'todas';
    const c = String(cat).toLowerCase().trim();
    return MAPEO_CATEGORIAS[c] || c;
  }

  // ==========================================
  // 2. UTILIDADES Y ACCESIBILIDAD (A11Y)
  // ==========================================
  function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function debounce(func, delay = CONFIG.DEBOUNCE_MS) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  function normalizarWhatsApp(num) {
    if (!num) return CONFIG.WA_DEFAULT;
    let limpio = String(num).replace(/\D/g, '');
    if (!limpio) return CONFIG.WA_DEFAULT;
    if (limpio.length === 10 && !limpio.startsWith('54')) {
      limpio = `549${limpio}`;
    }
    return limpio;
  }

  function mostrarNotificacion(mensaje, tipo = 'info') {
    let toast = document.getElementById('jobbers-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'jobbers-toast';
      toast.setAttribute('aria-live', 'polite');
      toast.style.cssText = `
        position: fixed; bottom: 20px; right: 20px; z-index: 10000;
        padding: 12px 20px; border-radius: 8px; font-weight: 600;
        color: #fff; box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        transition: opacity 0.3s ease, transform 0.3s ease;
        opacity: 0; transform: translateY(20px); pointer-events: none;
      `;
      document.body.appendChild(toast);
    }

    toast.style.backgroundColor = tipo === 'error' ? '#e74c3c' : tipo === 'exito' ? '#2ecc71' : '#f39c12';
    toast.textContent = mensaje;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
    }, 3500);
  }

  function manejarTrampaDeFoco(e, modal) {
    if (e.key !== 'Tab') return;
    const focusables = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;

    const primero = focusables[0];
    const ultimo = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === primero) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primero.focus();
    }
  }

  // ==========================================
  // 3. CAMBIO DE MODO GLOBAL Y MODAL INICIAL
  // ==========================================
  function setMode(mode) {
    const postulanteView = document.getElementById('view-postulante');
    const empresaView = document.getElementById('view-empresa');
    const btnPostulante = document.getElementById('btn-mode-postulante');
    const btnEmpresa = document.getElementById('btn-mode-empresa');

    if (postulanteView && empresaView) {
      const esPostulante = mode === 'postulante';
      postulanteView.classList.toggle('active-view', esPostulante);
      empresaView.classList.toggle('active-view', !esPostulante);

      btnPostulante?.classList.toggle('active', esPostulante);
      btnEmpresa?.classList.toggle('active', !esPostulante);

      btnPostulante?.setAttribute('aria-selected', esPostulante);
      btnEmpresa?.setAttribute('aria-selected', !esPostulante);

      localStorage.setItem(CONFIG.STORAGE_KEY, mode);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  window.cambiarModoConConfirmacion = function (mode) {
    const textoModo = mode === 'empresa' ? 'Empresas / Reclutadores' : 'Postulantes / Búsqueda de empleo';
    if (confirm(`¿Estás seguro de que deseas cambiar al perfil de ${textoModo}?`)) {
      setMode(mode);
    }
  };

  window.seleccionarModoInicial = function (mode) {
    setMode(mode);
    const modalBienvenida = document.querySelector(CONFIG.SELECTORS.MODAL_BIENVENIDA);
    if (modalBienvenida) cerrarModal(modalBienvenida);
  };

  function verificarPerfilInicial() {
    const perfilGuardado = localStorage.getItem(CONFIG.STORAGE_KEY);
    const modalBienvenida = document.querySelector(CONFIG.SELECTORS.MODAL_BIENVENIDA);

    if (!perfilGuardado && modalBienvenida) {
      abrirModal(modalBienvenida);
    } else if (modalBienvenida) {
      cerrarModal(modalBienvenida);
    }

    setMode(perfilGuardado || 'postulante');
  }

  // ==========================================
  // 4. CARGA DE DATOS Y CONEXIÓN
  // ==========================================
  async function cargarVacantes() {
    const grid = document.querySelector(CONFIG.SELECTORS.GRID_VACANTES);
    if (grid) {
      grid.innerHTML = `<div class="jobbers-loading" style="grid-column: 1/-1; text-align: center; padding: 2rem;"><p>⌛ Cargando ofertas de empleo...</p></div>`;
    }

    try {
      const response = await fetch(CONFIG.API_URL);
      if (!response.ok) throw new Error(`Error de red: ${response.statusText} (${response.status})`);
      const data = await response.json();
      state.vacantes = Array.isArray(data) && data.length > 0 ? data : CONFIG.FALLBACK_VACANTES;
    } catch (error) {
      console.warn('[Jobbers] Servidor no disponible. Usando datos de respaldo.', error);
      state.vacantes = [...CONFIG.FALLBACK_VACANTES];
    } finally {
      aplicarFiltros();
    }
  }

  // ==========================================
  // 5. FILTRADO Y RENDERIZADO DE GRILLA
  // ==========================================
  function aplicarFiltros() {
    const qPuesto = state.filtroPuesto.toLowerCase().trim();
    const qUbicacion = state.filtroUbicacion.toLowerCase().trim();
    const catBuscada = normalizarCategoria(state.filtroCategoria);

    state.vacantesFiltradas = state.vacantes.filter(item => {
      const ubicacion = (item.zona || item.ubicacion || '').toLowerCase();
      const puesto = (item.puesto || '').toLowerCase();
      const empresa = (item.empresa || '').toLowerCase();
      const descripcion = (item.descripcion || '').toLowerCase();
      const itemCat = normalizarCategoria(item.categoria || '');

      const coincidePuesto = !qPuesto || puesto.includes(qPuesto) || empresa.includes(qPuesto) || descripcion.includes(qPuesto);
      const coincideUbicacion = !qUbicacion || ubicacion.includes(qUbicacion);
      const coincideCat = catBuscada === 'todas' || catBuscada === 'todos' || itemCat === catBuscada;

      return coincidePuesto && coincideUbicacion && coincideCat;
    });

    renderizarGrid();
    actualizarContador();
  }

  function renderizarGrid() {
    const grid = document.querySelector(CONFIG.SELECTORS.GRID_VACANTES);
    if (!grid) return;

    if (state.vacantesFiltradas.length === 0) {
      grid.innerHTML = `
        <div class="jobbers-empty-state" style="grid-column: 1/-1; padding: 2.5rem; text-align: center;">
          <p style="font-size: 1.1rem;">🔍 No se encontraron vacantes que coincidan con tu búsqueda.</p>
          <button type="button" class="btn-amber" id="btn-reset-filtros" style="margin-top: 1rem; cursor: pointer;">Ver todas las ofertas</button>
        </div>
      `;

      document.getElementById('btn-reset-filtros')?.addEventListener('click', () => {
        state.filtroPuesto = '';
        state.filtroUbicacion = '';
        state.filtroCategoria = 'todas';

        const inputPuesto = document.querySelector(CONFIG.SELECTORS.INPUT_PUESTO);
        const inputUbicacion = document.querySelector(CONFIG.SELECTORS.INPUT_UBICACION);
        if (inputPuesto) inputPuesto.value = '';
        if (inputUbicacion) inputUbicacion.value = '';

        document.querySelectorAll('.category-card').forEach(el => {
          const rawVal = el.dataset.category || el.textContent.trim();
          const normVal = normalizarCategoria(rawVal);
          el.classList.toggle('active', normVal === 'todas' || normVal === 'todos');
        });

        aplicarFiltros();
      }, { once: true });
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
    const contador = document.querySelector(CONFIG.SELECTORS.CONTADOR_RESULTADOS);
    if (contador) {
      contador.textContent = String(state.vacantesFiltradas.length);
    }
  }

  // ==========================================
  // 6. MODALES Y POSTULACIÓN EXPRESS
  // ==========================================
  function asegurarEstructurasModales() {
    if (!document.getElementById('modal-jobbers-detalle')) {
      const modalDetalle = document.createElement('div');
      modalDetalle.id = 'modal-jobbers-detalle';
      modalDetalle.className = 'modal-overlay';
      modalDetalle.setAttribute('role', 'dialog');
      modalDetalle.setAttribute('aria-modal', 'true');
      modalDetalle.setAttribute('aria-hidden', 'true');
      modalDetalle.innerHTML = `
        <div class="modal-card">
          <button type="button" class="jobbers-close-btn" style="position:absolute; right:15px; top:15px; background:none; border:none; color:#fff; font-size:1.5rem; cursor:pointer;" aria-label="Cerrar ventana">&times;</button>
          <span id="det-categoria" class="badge badge-salary"></span>
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
      modalPostulacion.setAttribute('role', 'dialog');
      modalPostulacion.setAttribute('aria-modal', 'true');
      modalPostulacion.setAttribute('aria-hidden', 'true');
      modalPostulacion.innerHTML = `
        <div class="modal-card">
          <button type="button" class="jobbers-close-btn" style="position:absolute; right:15px; top:15px; background:none; border:none; color:#fff; font-size:1.5rem; cursor:pointer;" aria-label="Cerrar ventana">&times;</button>
          <h2>Postulación Express</h2>
          <p id="post-subtitulo" style="color: var(--accent-amber); margin-bottom: 1rem;"></p>
          <form id="form-postulacion-jobbers" style="display:flex; flex-direction:column; gap:0.75rem; text-align:left;">
            <input type="hidden" id="post-id-vacante">
            <input type="hidden" id="post-contacto-wa">
            
            <div>
              <label for="post-nombre" style="font-size:0.8rem; display:block; margin-bottom:0.2rem;">Nombre y Apellido *</label>
              <input type="text" id="post-nombre" class="input-dark" placeholder="Ej: María González" required style="width:100%;">
            </div>
            <div>
              <label for="post-telefono" style="font-size:0.8rem; display:block; margin-bottom:0.2rem;">Número de WhatsApp *</label>
              <input type="tel" id="post-telefono" class="input-dark" placeholder="Ej: 3511234567" required style="width:100%;">
            </div>
            <div>
              <label for="post-experiencia" style="font-size:0.8rem; display:block; margin-bottom:0.2rem;">Experiencia previa (Breve)</label>
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

    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay') || 
            e.target.classList.contains('jobbers-close-btn') || 
            e.target.classList.contains('btn-cerrar-modal')) {
          cerrarModal(modal);
        }
      });

      modal.addEventListener('keydown', (e) => manejarTrampaDeFoco(e, modal));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') cerrarModal();
    });
  }

  function abrirModal(modalEl) {
    if (!modalEl) return;
    if (!modalEl.classList.contains('active')) {
      state.elementoPrevioFoco = document.activeElement;
    }

    requestAnimationFrame(() => {
      modalEl.classList.add('active');
      modalEl.setAttribute('aria-hidden', 'false');
      const primerInput = modalEl.querySelector('input, textarea, button:not(.jobbers-close-btn)');
      primerInput?.focus();
    });
  }

  function cerrarModal(modalEl = null) {
    const modalActivo = modalEl || document.querySelector('.modal-overlay.active');
    if (!modalActivo) return;

    modalActivo.classList.remove('active');
    modalActivo.setAttribute('aria-hidden', 'true');
    if (state.elementoPrevioFoco?.focus) {
      state.elementoPrevioFoco.focus();
    }
  }

  function mostrarDetalleVacante(idVacante) {
    const vacante = state.vacantes.find(v => String(v.id) === String(idVacante));
    if (!vacante) return;

    state.vacanteSeleccionada = vacante;
    const modal = document.getElementById('modal-jobbers-detalle');
    if (!modal) return;

    const jornadaTurno = [vacante.jornada, vacante.turno].filter(Boolean).join(' • ') || 'Presencial';

    document.getElementById('det-categoria').textContent = (vacante.categoria || 'Gastronomía').toUpperCase();
    document.getElementById('det-puesto').textContent = vacante.puesto;
    document.getElementById('det-empresa').textContent = `🏢 ${vacante.empresa}`;
    document.getElementById('det-modalidad').textContent = `💼 Modalidad: ${jornadaTurno}`;
    document.getElementById('det-ubicacion').textContent = `📍 Ubicación: ${vacante.zona || vacante.ubicacion || 'Córdoba'}`;
    document.getElementById('det-sueldo').textContent = `💰 Sueldo: ${vacante.sueldo || 'A convenir'}`;
    document.getElementById('det-descripcion').textContent = vacante.descripcion || `Se busca ${vacante.puesto} para sumarse al equipo. Postulate enviando tu CV por WhatsApp.`;

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

    state.vacanteSeleccionada = vacante;
    document.getElementById('post-subtitulo').textContent = `${vacante.puesto} - ${vacante.empresa}`;
    document.getElementById('post-id-vacante').value = vacante.id;
    document.getElementById('post-contacto-wa').value = vacante.contacto_wa || vacante.contactoWA || CONFIG.WA_DEFAULT;

    const form = document.getElementById('form-postulacion-jobbers');
    if (form) form.reset();
    abrirModal(modal);
  }

  function manejarEnvioPostulacion(e) {
    e.preventDefault();
    const idVacante = document.getElementById('post-id-vacante')?.value;
    const vacante = state.vacantes.find(v => String(v.id) === String(idVacante)) || state.vacanteSeleccionada || {};

    const nombre = document.getElementById('post-nombre')?.value.trim();
    const telefono = document.getElementById('post-telefono')?.value.trim();
    const experiencia = document.getElementById('post-experiencia')?.value.trim();
    const rawWA = document.getElementById('post-contacto-wa')?.value || CONFIG.WA_DEFAULT;
    const waContacto = normalizarWhatsApp(rawWA);

    if (!nombre || !telefono) {
      mostrarNotificacion('Por favor completá tu nombre y teléfono.', 'error');
      return;
    }

    let mensaje = `👋 *Hola! Mi nombre es ${nombre}.*\n\n`;
    mensaje += `Me postulo para la vacante de *${vacante.puesto || 'Puesto Gastronómico'}* en *${vacante.empresa || 'Jobbers Argentina'}*.\n\n`;
    mensaje += `📱 *Mi Teléfono:* ${telefono}\n`;
    if (experiencia) mensaje += `📝 *Mi Presentación:* ${experiencia}\n`;
    mensaje += `\n📎 *Adjunto mi CV en formato PDF a este chat para su evaluación.* Muchas gracias!`;

    const urlWA = `https://wa.me/${waContacto}?text=${encodeURIComponent(mensaje)}`;
    cerrarModal(document.querySelector('.modal-overlay.active'));
    mostrarNotificacion('Redirigiendo a WhatsApp...', 'exito');
    window.open(urlWA, '_blank', 'noopener,noreferrer');
  }

  // ==========================================
  // 7. LISTENERS DE EVENTOS Y FORMULARIO EXPRESS
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
        const vacante = state.vacantes.find(v => String(v.id) === String(btnPostularme.dataset.id));
        if (vacante) abrirFormularioPostulacion(vacante);
      }
    });
  }

  function inicializarFiltrosYBotones() {
    // 1. Botones de Modo en Cabecera
    const btnPostulante = document.getElementById('btn-mode-postulante');
    const btnEmpresa = document.getElementById('btn-mode-empresa');

    if (btnPostulante) {
      btnPostulante.addEventListener('click', () => setMode('postulante'));
    }
    if (btnEmpresa) {
      btnEmpresa.addEventListener('click', () => cambiarModoConConfirmacion('empresa'));
    }

    // 2. Delegación Global para Modal de Bienvenida
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-mode], [data-action]');
      if (!btn) return;

      const mode = btn.dataset.mode;
      const action = btn.dataset.action;

      if (action === 'init-mode' || action === 'switch-mode') {
        seleccionarModoInicial(mode);
      } else if (mode && !btn.id) {
        setMode(mode);
      }
    });

    // 3. Inputs de Búsqueda
    const inputPuesto = document.querySelector(CONFIG.SELECTORS.INPUT_PUESTO);
    if (inputPuesto) {
      inputPuesto.addEventListener('input', debounce((e) => {
        state.filtroPuesto = e.target.value;
        aplicarFiltros();
      }));
    }

    const inputUbicacion = document.querySelector(CONFIG.SELECTORS.INPUT_UBICACION);
    if (inputUbicacion) {
      inputUbicacion.addEventListener('input', debounce((e) => {
        state.filtroUbicacion = e.target.value;
        aplicarFiltros();
      }));
    }

    const formBusquedaHero = document.getElementById('form-busqueda-postulante');
    if (formBusquedaHero) {
      formBusquedaHero.addEventListener('submit', (e) => {
        e.preventDefault();
        aplicarFiltros();
      });
    }

    // 4. Tarjetas de Categorías
    const categoryCards = document.querySelectorAll('.category-card');
    categoryCards.forEach(card => {
      card.addEventListener('click', () => {
        const rawCat = card.dataset.category || card.textContent.trim();
        state.filtroCategoria = rawCat;

        const catTargetNorm = normalizarCategoria(rawCat);
        categoryCards.forEach(c => {
          const cRaw = c.dataset.category || c.textContent.trim();
          c.classList.toggle('active', normalizarCategoria(cRaw) === catTargetNorm);
        });

        aplicarFiltros();
      });
    });

    // 5. Publicación Express Empresas a WhatsApp
    const formExpress = document.querySelector(CONFIG.SELECTORS.FORM_EXPRESS);
    if (formExpress) {
      formExpress.addEventListener('submit', (e) => {
        e.preventDefault();
        const empresa = document.getElementById('exp-empresa')?.value.trim();
        const telefono = document.getElementById('exp-telefono')?.value.trim();
        const puesto = document.getElementById('exp-puesto')?.value;
        const zona = document.getElementById('exp-zona')?.value;
        const turno = document.getElementById('exp-turno')?.value;
        const jornada = document.getElementById('exp-jornada')?.value;

        if (!empresa || !telefono) {
          mostrarNotificacion('Completá al menos el nombre de la empresa y el teléfono.', 'error');
          return;
        }

        let mensaje = `📢 *NUEVA BÚSQUEDA EXPRESS (EMPRESA)*\n\n`;
        mensaje += `🏢 *Local/Empresa:* ${empresa}\n`;
        mensaje += `💼 *Puesto:* ${puesto}\n`;
        mensaje += `📍 *Zona:* ${zona}\n`;
        mensaje += `⏰ *Turno/Jornada:* ${turno} - ${jornada}\n`;
        mensaje += `📱 *WhatsApp de Contacto:* ${telefono}\n\n`;
        mensaje += `Solicito la activación y difusión de esta oferta en Jobbers Argentina.`;

        const urlWA = `https://wa.me/${CONFIG.WA_DEFAULT}?text=${encodeURIComponent(mensaje)}`;
        mostrarNotificacion('Generando anuncio Express...', 'exito');
        window.open(urlWA, '_blank', 'noopener,noreferrer');
        formExpress.reset();
      });
    }
  }

  // ==========================================
  // 8. INICIALIZACIÓN
  // ==========================================
  function init() {
    verificarPerfilInicial();
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
