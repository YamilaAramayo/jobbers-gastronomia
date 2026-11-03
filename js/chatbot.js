/**
 * Jobbers Argentina - Chatbot Asistente Gastronómico (Tacua 🐦)
 */
(function () {
  'use strict';

  const BOT_CONFIG = {
    nombre: 'Tacua 🐦 (Asistente Jobbers)',
    // Podés cambiar la URL por una imagen local como 'img/tacua-avatar.png'
    avatarUrl: 'https://img.freepik.com/vector-premium/lindo-pajarito-azul-estilo-animado-ilustracion-vectorial_969863-1282.jpg',
    mensajesInicio: '¡Hola! Soy Tacua, la asistente de Jobbers Gastronomía. ¿En qué te puedo ayudar hoy?'
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

    // Mensaje inicial
    agregarMensaje(BOT_CONFIG.mensajesInicio, 'bot');

    const btnToggle = document.getElementById('jobbers-chatbot-btn');
    const chatBox = document.getElementById('jobbers-chatbot-box');
    const btnClose = document.getElementById('chat-close-btn');

    btnToggle.addEventListener('click', () => {
      const visible = chatBox.style.display !== 'none';
      chatBox.style.display = visible ? 'none' : 'flex';
      btnToggle.setAttribute('aria-expanded', !visible);
      chatBox.setAttribute('aria-hidden', visible);

      if (!visible && document.querySelectorAll('.chat-options').length === 0) {
        mostrarOpcionesIniciales();
      }
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

  function mostrarOpcionesIniciales() {
    const chatMsgContainer = document.getElementById('chat-messages');
    if (!chatMsgContainer) return;

    const optContainer = document.createElement('div');
    optContainer.className = 'chat-options';
    optContainer.innerHTML = `
      <button type="button" class="btn-opt" data-opt="postulante">🧑‍🍳 Soy Postulante</button>
      <button type="button" class="btn-opt" data-opt="empresa">🏢 Soy Empresa / Local</button>
      <button type="button" class="btn-opt" data-opt="soporte">❓ Ayuda / Contacto</button>
    `;

    chatMsgContainer.appendChild(optContainer);
    chatMsgContainer.scrollTop = chatMsgContainer.scrollHeight;

    optContainer.querySelectorAll('.btn-opt').forEach(btn => {
      btn.addEventListener('click', (e) => manejarOpcion(e.target.dataset.opt, e.target.textContent));
    });
  }

  function manejarOpcion(opcion, labelTexto) {
    agregarMensaje(labelTexto, 'user');

    setTimeout(() => {
      switch (opcion) {
        case 'postulante':
          agregarMensaje('Para postularte a una vacante, solo tenés que hacer clic en "Postularme 📲" en cualquiera de las ofertas de la pantalla principal.');
          agregarMensaje('¿Te gustaría conocer la Membresía Jobbers Pro para destacar tu CV en Córdoba?');
          break;

        case 'empresa':
          agregarMensaje('Publicar avisos en Jobbers es 100% GRATUITO. Podés completar el formulario de "Publicación Rápida" en la pestaña de Empresas.');
          agregarMensaje('También contamos con vacantes fijadas en portada y planes B2B.');
          break;

        case 'soporte':
          agregarMensaje('Nuestra atención es 100% digital. Podés dejarnos tu consulta o escribirnos para soporte de CV o publicaciones.');
          break;
      }
    }, 400);
  }

  document.addEventListener('DOMContentLoaded', inicializarChatbot);
})();
