/* MPESA message-card override.
 * The transaction builder stores some legacy formatting tags in message text.
 * Strip those tags before display so markup never appears as visible message text.
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

  function cleanMessageText(value) {
    return String(value == null ? '' : value)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .trim();
  }

  function renderMpesaCard(container, entry) {
    if (!container) return null;

    var text = cleanMessageText(entry && entry.text);
    var safeText = escapeHtml(text)
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
    var timestamp = new Date(entry && entry.ts ? entry.ts : Date.now())
      .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    var wrapper = document.createElement('div');
    wrapper.className = 'mpesa-body mpesa-card-item';
    wrapper.innerHTML = [
      '<article class="mpesa-message">',
      '  <div class="mpesa-copy">' + safeText + '</div>',
      '  <div class="mpesa-promo">',
      '    <div class="mpesa-graphic"><div class="mpesa-letter">S</div></div>',
      '    <div class="mpesa-brandbar">',
      '      <span class="mpesa-saf">Safaricom</span>',
      '      <span class="mpesa-divider"></span>',
      '      <span class="mpesa-mini">m<span class="box"></span>pesa</span>',
      '    </div>',
      '  </div>',
      '</article>',
      '<div class="mpesa-app">Fintech App</div>',
      '<div class="mpesa-link">saf.cx</div>',
      '<div class="mpesa-time"><strong>' + escapeHtml(timestamp) + '</strong> • Safaricom</div>'
    ].join('');

    container.appendChild(wrapper);
    return wrapper;
  }

  window.renderMpesaCard = renderMpesaCard;
}(window));
