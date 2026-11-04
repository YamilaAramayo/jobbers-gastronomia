/**
 * Jobbers Argentina - Chatbot Asistente Gastronómico (Tacua 🐦)
 * Versión Pro con Sistema Interno de Consultas y Captura de Contacto
 */
(function () {
  'use strict';

  const BOT_CONFIG = {
    nombre: 'Tacua 🐦 (Asistente Jobbers)',
    avatarUrl: 'https://img.freepik.com/vector-premium/lindo-pajarito-azul-estilo-animado-ilustracion-vectorial_969863-1282.jpg',
    mensajesInicio: '¡Hola! Soy Tacua 🐦, tu asistente en Jobbers Gastronomía. ¿En qué te puedo echar una pata hoy?'
  };

  function inicializarChatbot() {
    if (document.getElementById('jobbers-chatbot-container')) return;

    const container = document.createElement('div');
    container.id = 'jobbers-chatbot-container';
    container.innerHTML = `
      <button id="jobbers-chatbot-btn" type="button" aria-expanded="false">
        <span>🐦</span> Asistente Jobbers
      </button>

      <div id="jobbers-chatbot-box" style="display: none;" aria-hidden="true">
        <div class="chat-header">
          <div class="chat-header-info">
            <img src="${BOT_CONFIG.avatarUrl}" alt="Tacua" class="chat-header-avatar">
            <div>
              <strong>Tacua 🐦</strong>
              <span class="chat-header-status">En línea • Córdoba</span>
            </div>
          </div>
          <button id="chat-close-btn" aria-label="Cerrar chat">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
      </div>
    `;

    document.body.appendChild(container);

    // Mensaje inicial y opciones base
    agregarMensaje(BOT_CONFIG.mensajesInicio, 'bot');
    mostrarOpcionesPrincipales();

    const btnToggle = document.getElementById('jobbers-chatbot-btn');
    const chatBox = document.getElementById('jobbers-chatbot-box');
    const btnClose = document.getElementById('chat-close-btn');

    btnToggle.addEventListener('click', () => {
      const visible = chatBox.style.display !== 'none';
      chatBox.style.display = visible ? 'none' : 'flex';
      btnToggle.setAttribute('aria-expanded', !visible);
      chatBox.setAttribute('aria-hidden', visible);
    });

    btnClose.addEventListener('click', () => {
      chatBox.style.display = 'none';
      btnToggle.setAttribute('aria-expanded', 'false');
      chatBox.setAttribute('aria-hidden', 'true');
    });
  }

  function agregarMensaje(texto, tipo = 'bot') {
    const chatMsgContainer = document.getElementById('chat-messages');
    if (!chatMsgContainer) return;

    if (tipo === 'bot') {
      const wrapper = document.createElement('div');
      wrapper.className = 'message-wrapper';
      wrapper.innerHTML = `
        <div class="msg-bot-author">
          <img src="${BOT_CONFIG.avatarUrl}" alt="Tacua" class="msg-bot-avatar">
          <span class="msg-bot-title">Tacua</span>
        </div>
        <div class="msg-bot">${texto}</div>
      `;
      chatMsgContainer.appendChild(wrapper);
    } else {
      const div = document.createElement('div');
      div.className = 'msg-user';
      div.textContent = texto;
      chatMsgContainer.appendChild(div);
    }

    chatMsgContainer.scrollTop = chatMsgContainer.scrollHeight;
  }

  function mostrarOpcionesPrincipales() {
    const chatMsgContainer = document.getElementById('chat-messages');
    if (!chatMsgContainer) return;

    const optContainer = document.createElement('div');
    optContainer.className = 'chat-options';
    optContainer.innerHTML = `
      <button type="button" class="btn-opt" data-opt="postulante">🧑‍🍳 Soy Postulante</button>
      <button type="button" class="btn-opt" data-opt="empresa">🏢 Soy Empresa / Local</button>
      <button type="button" class="btn-opt" data-opt="soporte">❓ Ayuda / Dejar Consulta</button>
    `;

    chatMsgContainer.appendChild(optContainer);
    chatMsgContainer.scrollTop = chatMsgContainer.scrollHeight;

    optContainer.querySelectorAll('.btn-opt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        optContainer.remove();
        manejarOpcion(e.target.dataset.opt, e.target.textContent);
      });
    });
  }

  function mostrarOpcionesSecundarias(tipoMenu) {
    const chatMsgContainer = document.getElementById('chat-messages');
    if (!chatMsgContainer) return;

    const optContainer = document.createElement('div');
    optContainer.className = 'chat-options';

    if (tipoMenu === 'postulante') {
      optContainer.innerHTML = `
        <button type="button" class="btn-opt" data-action="pro">⭐ Ver Membresía Pro</button>
        <button type="button" class="btn-opt" data-action="consejos">💡 Tips para armar mi CV</button>
        <button type="button" class="btn-opt" data-action="reiniciar">🔄 Volver al menú principal</button>
      `;
    } else if (tipoMenu === 'empresa') {
      optContainer.innerHTML = `
        <button type="button" class="btn-opt" data-action="publicar">🚀 ¿Cómo publicar gratis?</button>
        <button type="button" class="btn-opt" data-action="planesb2b">👑 Ver Planes Premium B2B</button>
        <button type="button" class="btn-opt" data-action="reiniciar">🔄 Volver al menú principal</button>
      `;
    } else {
      optContainer.innerHTML = `
        <button type="button" class="btn-opt" data-action="reiniciar">🔄 Volver al menú principal</button>
      `;
    }

    chatMsgContainer.appendChild(optContainer);
    chatMsgContainer.scrollTop = chatMsgContainer.scrollHeight;

    optContainer.querySelectorAll('.btn-opt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const accion = e.target.dataset.action;
        optContainer.remove();
        
        if (accion === 'reiniciar') {
          agregarMensaje('¿En qué otra cosa te puedo ayudar?', 'bot');
          mostrarOpcionesPrincipales();
        } else if (accion === 'pro') {
          agregarMensaje('La Membresía Jobbers Pro te otorga ubicación prioritaria en la grilla y herramientas exclusivas para acelerar tu contratación en Córdoba.');
          mostrarOpcionesSecundarias('postulante');
        } else if (accion === 'consejos') {
          agregarMensaje('Destacá tus experiencias clave en cocina, barra o salón, poné tus datos de contacto claros y subí tu archivo en formato PDF.');
          mostrarOpcionesSecundarias('postulante');
        } else if (accion === 'publicar') {
          agregarMensaje('Entrá a la sección de "Empresas" en la barra superior de la web y completá el formulario de Publicación Rápida en menos de 2 minutos.');
          mostrarOpcionesSecundarias('empresa');
        } else if (accion === 'planesb2b') {
          agregarMensaje('Los planes B2B incluyen vacantes fijadas en portada y difusión prioritaria para captar al mejor personal gastronómico al instante.');
          mostrarOpcionesSecundarias('empresa');
        }
      });
    });
  }

  function guardarConsultaEnAdmin(nombre, contacto, mensaje) {
    try {
      const actualData = JSON.parse(localStorage.getItem('jobbers_admin_requests')) || [];
      const fechaHoy = new Date().toLocaleDateString('es-AR');
      
      const nuevoTicket = {
        id: Date.now(),
        fecha: fechaHoy,
        empresa: `${nombre} (Ticket Soporte)`,
        whatsapp: contacto,
        puesto: "Consulta de Soporte",
        zona: "Chatbot Web",
        turno: "Soporte General",
        jornada: "-",
        detalles: mensaje,
        urgente: false,
        estado: "pendiente"
      };

      actualData.unshift(nuevoTicket);
      localStorage.setItem('jobbers_admin_requests', JSON.stringify(actualData));
    } catch (err) {
      console.error('Error al guardar la consulta en el storage local:', err);
    }
  }

  function manejarOpcion(opcion, labelTexto) {
    agregarMensaje(labelTexto, 'user');

    setTimeout(() => {
      switch (opcion) {
        case 'postulante':
          agregarMensaje('Para postularte, solo tenés que hacer clic en el botón "Postularme 📲" que figura en cada oferta de la pantalla principal.');
          mostrarOpcionesSecundarias('postulante');
          break;

        case 'empresa':
          agregarMensaje('Publicar avisos en Jobbers es 100% gratuito mediante el formulario express en la pestaña de Empresas de la plataforma.');
          mostrarOpcionesSecundarias('empresa');
          break;

        case 'soporte':
          agregarMensaje('Completá este breve formulario interno con tu medio de contacto para derivar tu consulta directamente al panel de administración.');
          
          const chatMsgContainer = document.getElementById('chat-messages');
          if (chatMsgContainer) {
            const formDiv = document.createElement('div');
            formDiv.className = 'chat-options';
            formDiv.innerHTML = `
              <div style="display: flex; flex-direction: column; gap: 8px; background: var(--bg-card-hover); padding: 10px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <input type="text" id="ticket-nombre" placeholder="Tu Nombre / Local" style="padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                <input type="text" id="ticket-contacto" placeholder="WhatsApp o Correo de contacto" style="padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem;">
                <textarea id="ticket-mensaje" placeholder="Escribí tu consulta aquí..." rows="2" style="padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-input); color: var(--text-primary); font-size: 0.85rem; resize: none;"></textarea>
                <button type="button" id="enviar-ticket-btn" class="btn-opt" style="justify-content: center; background: var(--accent-amber); color: #000; font-weight: 700; text-align: center;">
                  📤 Enviar Consulta al Admin
                </button>
              </div>
            `;
            chatMsgContainer.appendChild(formDiv);
            chatMsgContainer.scrollTop = chatMsgContainer.scrollHeight;

            document.getElementById('enviar-ticket-btn').addEventListener('click', () => {
              const nombre = document.getElementById('ticket-nombre').value.trim();
              const contacto = document.getElementById('ticket-contacto').value.trim();
              const mensaje = document.getElementById('ticket-mensaje').value.trim();

              if (!nombre || !contacto || !mensaje) {
                alert('Por favor, completá todos los campos para poder responderte.');
                return;
              }

              guardarConsultaEnAdmin(nombre, contacto, mensaje);

              formDiv.remove();
              agregarMensaje(`Nombre: ${nombre} (${contacto}) - Consulta: ${mensaje}`, 'user');
              
              setTimeout(() => {
                agregarMensaje(`¡Listo ${nombre}! Recibimos tu consulta junto con tu contacto. Te responderemos a la brevedad.`);
                mostrarOpcionesSecundarias('soporte');
              }, 400);
            });
          }
          break;
      }
    }, 400);
  }

  document.addEventListener('DOMContentLoaded', inicializarChatbot);
})();
