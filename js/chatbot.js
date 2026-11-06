/**
 * Jobbers Argentina - Chatbot Asistente Gastronómico (Tacua 🐦)
 * Versión Unificada: Canal de Soporte a Empresas y Asistencia General
 */
(function () {
  'use strict';

  const BOT_CONFIG = {
    nombre: 'Tacua 🐦 (Soporte Jobbers)',
    avatarUrl: 'https://img.freepik.com/vector-premium/lindo-pajarito-azul-estilo-animado-ilustracion-vectorial_969863-1282.jpg',
    mensajesInicio: '¡Hola! Soy Tacua 🐦. Asisto en la coordinación y soporte técnico de Jobbers Gastronomía. ¿En qué te podemos ayudar hoy?'
  };

  function inicializarChatbot() {
    if (document.getElementById('jobbers-chatbot-container')) return;

    const container = document.createElement('div');
    container.id = 'jobbers-chatbot-container';
    container.innerHTML = `
      <button id="jobbers-chatbot-btn" type="button" aria-expanded="false">
        <span>🐦</span> Soporte Jobbers
      </button>

      <div id="jobbers-chatbot-box" style="display: none;" aria-hidden="true">
        <div class="chat-header">
          <div class="chat-header-info">
            <img src="${BOT_CONFIG.avatarUrl}" alt="Tacua" class="chat-header-avatar">
            <div>
              <strong>Tacua 🐦</strong>
              <span class="chat-header-status">Soporte a Empresas • Córdoba</span>
            </div>
          </div>
          <button id="chat-close-btn" aria-label="Cerrar chat">&times;</button>
        </div>
        <div class="chat-messages" id="chat-messages"></div>
      </div>
    `;

    document.body.appendChild(container);

    // Mensaje inicial y opciones base unificadas
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
    // Menú unificado apuntando al canal corporativo requerido
    optContainer.innerHTML = `
      <button type="button" class="btn-opt" data-opt="soporte-empresas">💬 Contactar Soporte a Empresas</button>
      <button type="button" class="btn-opt" data-opt="info-publicacion">📢 Consultar sobre Publicar Vacantes</button>
      <button type="button" class="btn-opt" data-opt="consulta-general">❓ Dejar Consulta General</button>
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

  function guardarConsultaEnAdmin(nombre, contacto, mensaje) {
    try {
      const actualData = JSON.parse(localStorage.getItem('jobbers_admin_requests')) || [];
      const fechaHoy = new Date().toLocaleDateString('es-AR');
      
      const nuevoTicket = {
        id: Date.now(),
        fecha: fechaHoy,
        empresa: nombre,
        whatsapp: contacto,
        puesto: "Soporte Unificado Chatbot",
        zona: "Chatbot Web",
        turno: "Soporte",
        detalles: mensaje,
        urgente: false,
        estado: "pendiente",
        tipo: "chatbot"
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
        case 'soporte-empresas':
          agregarMensaje('Derivando al canal unificado corporativo...');
          setTimeout(() => {
            window.open('https://wa.me/5493513080197?text=Hola%2C%20necesito%20asistencia%20en%20el%20canal%20de%20Soporte%20a%20Empresas%20de%20Jobbers.', '_blank');
            agregarMensaje('Se abrió el WhatsApp de Soporte a Empresas en otra pestaña. ¿Te puedo ayudar en algo más?');
            mostrarOpcionesPrincipales();
          }, 600);
          break;

        case 'info-publicacion':
          agregarMensaje('Para publicar avisos y conectar con talento gastronómico, podés usar el formulario de publicación rápida o comunicarte directamente con nuestro canal de Soporte a Empresas.');
          setTimeout(() => {
            mostrarOpcionesPrincipales();
          }, 1000);
          break;

        case 'consulta-general':
          agregarMensaje('Completá este breve formulario para registrar tu consulta directamente en nuestro sistema interno:');
          
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
                alert('Por favor, completá todos los campos.');
                return;
              }

              guardarConsultaEnAdmin(nombre, contacto, mensaje);

              formDiv.remove();
              agregarMensaje(`Consulta enviada por: ${nombre} (${contacto})`, 'user');
              
              setTimeout(() => {
                agregarMensaje(`¡Listo ${nombre}! Recibimos tu consulta. Te contactaremos a la brevedad.`);
                mostrarOpcionesPrincipales();
              }, 400);
            });
          }
          break;
      }
    }, 400);
  }

  document.addEventListener('DOMContentLoaded', inicializarChatbot);
})();
