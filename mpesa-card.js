/* Reusable MPESA message-bubble renderer for simtool.
 * Call renderMpesaSendBubble(container, message) after a send.
 */
(function (window) {
  'use strict';

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatTime(timestamp) {
    return new Date(timestamp || Date.now()).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  function renderMpesaSendBubble(container, message) {
    if (!container) return null;

    var text = message && message.text ? message.text : '';
    var safeText = escapeHtml(text)
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
    var time = formatTime(message && message.ts);

    var bubble = document.createElement('div');
    bubble.className = 'mpesa-body mpesa-send-bubble';
    bubble.innerHTML = '\n' +
      '  <article class="mpesa-message">' +
      '    <div class="mpesa-copy">' + safeText + '</div>' +
      '    <div class="mpesa-promo">' +
      '      <div class="mpesa-graphic"><div class="mpesa-letter">S</div></div>' +
      '      <div class="mpesa-brandbar">' +
      '        <span class="mpesa-saf">Safaricom</span>' +
      '        <span class="mpesa-divider"></span>' +
      '        <span class="mpesa-mini">m<span class="box"></span>pesa</span>' +
      '      </div>' +
      '    </div>' +
      '  </article>' +
      '  <div class="mpesa-app">Fintech App</div>' +
      '  <div class="mpesa-link">saf.cx</div>' +
      '  <div class="mpesa-time"><strong>' + escapeHtml(time) + '</strong> • <strong>Safaricom</strong></div>';

    container.appendChild(bubble);
    return bubble;
  }

  window.renderMpesaSendBubble = renderMpesaSendBubble;
}(window));
