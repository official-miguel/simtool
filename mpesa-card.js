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
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/\u00a0/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function formatTimestamp(timestamp) {
    var date = new Date(timestamp || Date.now());
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function injectStyles() {
    if (document.getElementById('mpesa-card-responsive-styles')) return;

    var style = document.createElement('style');
    style.id = 'mpesa-card-responsive-styles';
    style.textContent = `
      .mpesa-card-item {
        --mpesa-scale: 1;
        width: 100%;
        max-width: 100%;
        margin: 0 0 14px;
      }
      .mpesa-card-item .mpesa-message {
        background: rgba(12, 28, 21, 0.45);
        border-radius: 18px;
        overflow: hidden;
      }
      .mpesa-card-item .mpesa-copy {
        padding: calc(10px * var(--mpesa-scale)) calc(12px * var(--mpesa-scale));
        color: rgb(226, 236, 228);
        font-size: calc(15px * var(--mpesa-scale));
        line-height: 1.32;
        overflow-wrap: anywhere;
        white-space: normal;
      }
      .mpesa-card-item .mpesa-promo {
        width: 100%;
        background: linear-gradient(180deg, #42bf58 0%, #1fb85c 100%);
        border-radius: 16px 16px 0 0;
        overflow: hidden;
      }
      .mpesa-card-item .mpesa-graphic {
        position: relative;
        height: clamp(120px, 26vw, 205px);
        background: linear-gradient(180deg, #32c765 0%, #1bb75d 100%);
        overflow: hidden;
      }
      .mpesa-card-item .mpesa-graphic::before {
        content: '';
        position: absolute;
        left: 12%;
        top: 22%;
        width: 78%;
        height: 48%;
        border: clamp(12px, 3vw, 24px) solid #f53a42;
        border-radius: 50%;
        transform: rotate(-18deg);
      }
      .mpesa-card-item .mpesa-letter {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        color: rgba(255,255,255,0.96);
        font-size: clamp(90px, 19vw, 170px);
        line-height: 1;
        font-weight: 900;
        letter-spacing: -0.08em;
      }
      .mpesa-card-item .mpesa-brandbar {
        min-height: 66px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        background: #f3f3f3;
        color: #f03f49;
        font-weight: 900;
        font-size: clamp(18px, 5vw, 30px);
        white-space: nowrap;
        padding: 8px 12px;
      }
      .mpesa-card-item .mpesa-saf { font-style: italic; }
      .mpesa-card-item .mpesa-divider { width: 2px; height: 34px; background: rgba(19, 52, 39, 0.35); }
      .mpesa-card-item .mpesa-mini {
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }
      .mpesa-card-item .mpesa-mini .box {
        display: inline-block;
        width: 13px;
        height: 13px;
        border-radius: 2px;
        background: #f03f49;
        transform: translateY(-1px);
      }
      .mpesa-card-item .mpesa-app {
        margin-top: 10px;
        color: rgba(236, 245, 238, 0.94);
        font-size: 18px;
        font-weight: 600;
      }
      .mpesa-card-item .mpesa-link {
        margin-top: 2px;
        color: rgba(236, 245, 238, 0.8);
        font-size: 13px;
      }
      .mpesa-card-item .mpesa-time {
        margin-top: 8px;
        color: rgba(236, 245, 238, 0.82);
        font-size: 12px;
        line-height: 1.2;
      }
      .mpesa-card-item .mpesa-time strong {
        font-weight: 600;
        color: #f1b061;
      }
      .mpesa-card-item .mpesa-zoom-controls {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 6px;
        margin-bottom: 6px;
      }
      .mpesa-card-item .mpesa-zoom-controls button {
        width: 24px;
        height: 24px;
        border: 1px solid rgba(255,255,255,0.2);
        background: rgba(255,255,255,0.03);
        color: #eaf2ec;
        border-radius: 999px;
        padding: 0;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
      }
      @media (max-width: 420px) {
        .mpesa-card-item .mpesa-copy { font-size: 13px; }
      }
    `;
    document.head.appendChild(style);
  }

  function renderMpesaCard(container, entry) {
    if (!container) return null;
    injectStyles();

    var text = cleanMessageText(entry && entry.text);
    var safeText = escapeHtml(text)
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
    var timestamp = formatTimestamp(entry && entry.ts);

    var wrapper = document.createElement('div');
    wrapper.className = 'mpesa-card-item';
    wrapper.dataset.scale = '1';
    wrapper.innerHTML = [
      '<div class="mpesa-zoom-controls">',
      '  <button type="button" data-action="zoom-out">−</button>',
      '  <button type="button" data-action="zoom-in">+</button>',
      '</div>',
      '<article class="mpesa-message">',
      '  <div class="mpesa-copy">' + safeText + '</div>',
      '  <div class="mpesa-promo">',
      '    <div class="mpesa-graphic"><div class="mpesa-letter">S</div></div>',
      '    <div class="mpesa-brandbar">',
      '      <span class="mpesa-saf">Safaricom</span>',
      '      <span class="mpesa-divider"></span>',
      '      <span class="mpesa-mini"><span>m</span><span class="box"></span><span>pesa</span></span>',
      '    </div>',
      '  </div>',
      '</article>',
      '<div class="mpesa-app">Fintech App</div>',
      '<div class="mpesa-link">saf.cx</div>',
      '<div class="mpesa-time"><strong>' + escapeHtml(timestamp) + '</strong> • Safaricom</div>'
    ].join('');

    var setScale = function (nextScale) {
      var clamped = Math.max(0.8, Math.min(1.3, Number(nextScale.toFixed(1))));
      wrapper.dataset.scale = String(clamped);
      wrapper.style.setProperty('--mpesa-scale', clamped);
    };

    wrapper.addEventListener('click', function (event) {
      var button = event.target.closest('[data-action]');
      if (!button) return;
      var currentScale = Number(wrapper.dataset.scale || '1');
      var nextScale = button.dataset.action === 'zoom-in' ? currentScale + 0.1 : currentScale - 0.1;
      setScale(nextScale);
    });

    container.appendChild(wrapper);
    return wrapper;
  }

  window.renderMpesaCard = renderMpesaCard;
}(window));
