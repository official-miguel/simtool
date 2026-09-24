/* M-PESA message-card renderer matching the supplied reference. */
(function (window, document) {
  'use strict';

  var STYLE_ID = 'mpesa-reference-styles';
  var messageScale = 1;
  var pinchStartDistance = 0;
  var pinchStartScale = 1;

  function decode(value) {
    var text = String(value == null ? '' : value);
    var textarea = document.createElement('textarea');
    for (var i = 0; i < 3; i += 1) {
      textarea.innerHTML = text;
      var decoded = textarea.value;
      if (decoded === text) break;
      text = decoded;
    }
    return text;
  }

  function removeTransactionCode(value) {
    return String(value == null ? '' : value)
      .replace(/^\s*[A-Z0-9]{8,14}\s+(?=Confirmed\b)/i, '')
      .replace(/^\s*Confirmed\s+/i, 'Confirmed. ')
      .trim();
  }

  function clean(value) {
    return removeTransactionCode(decode(value)
      .replace(/<br\s*\/?\s*>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n'));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #conversationBaby { background: #101b18 !important; }
      #conversationBaby .navbar {
        background: #13251a !important;
        border: 0 !important;
        padding: 14px 18px 10px !important;
        min-height: 84px !important;
      }
      #conversationBaby .navbar .back { width: 42px !important; height: 42px !important; }
      #conversationBaby .navbar .back span { font-size: 44px !important; line-height: 1 !important; }
      #conversationBaby .navbar .nav-title {
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        color: #edf5f0 !important;
        font-size: 16px !important;
        font-weight: 700 !important;
      }
      #conversationBaby .profile-avatar {
        width: 42px !important;
        height: 42px !important;
        margin-right: 0 !important;
        background: #f0c74d !important;
        border-radius: 50% !important;
      }
      #conversationBaby .profile-avatar svg { width: 28px !important; height: 28px !important; stroke: #fff !important; }
      #conversationBaby > div:nth-of-type(2) { height: calc(100% - 84px) !important; padding: 0 !important; }
      #chatWindow {
        padding: 12px 14px 130px !important;
        gap: 0 !important;
        touch-action: pan-y;
      }
      .mpesa-card-item { width: min(100%, 560px); margin: 0 auto 10px 0; }
      .mpesa-message {
        background: rgba(26, 48, 37, 0.78) !important;
        border: 0 !important;
        border-radius: 18px !important;
        overflow: hidden;
        zoom: var(--message-scale, 1);
      }
      .mpesa-copy {
        background: rgba(20, 40, 28, 0.9) !important;
        padding: 18px 18px 14px !important;
        color: #eaf2ed !important;
        font-size: 15px !important;
        line-height: 1.4 !important;
        overflow-wrap: anywhere;
        letter-spacing: -0.01em;
      }
      .mpesa-copy a { color: #eef5ef !important; text-decoration: underline !important; }
      .mpesa-promo { background: #2aaa49; overflow: hidden; }
      .mpesa-graphic { position: relative; height: 214px; background: #2aaa49; overflow: hidden; }
      .mpesa-graphic:before {
        content: '';
        position: absolute;
        left: 12%; top: 20%; width: 78%; height: 48%;
        border: 18px solid #ef213b;
        border-radius: 50%; transform: rotate(-18deg);
      }
      .mpesa-letter {
        position: absolute; inset: 0; display: grid; place-items: center;
        color: #ffffff; font-family: Arial, Helvetica, sans-serif;
        font-weight: 900; font-size: 132px; line-height: 1;
      }
      .mpesa-brandbar {
        min-height: 88px; display: flex; align-items: center; justify-content: center;
        gap: 12px; background: #f2f2f2; padding: 12px 16px;
        font-family: Arial, Helvetica, sans-serif; font-weight: 900;
        font-size: 28px; white-space: nowrap;
      }
      .mpesa-saf { color: #ef1d2d; font-style: italic; }
      .mpesa-divider { width: 2px; height: 34px; background: rgba(22, 58, 39, 0.35); }
      .mpesa-mini { display: inline-flex; align-items: center; gap: 4px; color: #2aa94d; }
      .mpesa-mini .box { width: 14px; height: 22px; display: inline-block; border-radius: 3px; background: #ffffff; border: 2px solid #2aa94d; }
      .mpesa-app { margin: 0 !important; padding: 14px 18px 0 !important; color: #e4ece6 !important; font-size: 18px !important; font-weight: 600 !important; }
      .mpesa-link { margin: 0 !important; padding: 8px 18px 0 !important; color: #dbe7df !important; font-size: 12px !important; }
      .mpesa-time { margin: 0 !important; padding: 14px 18px 0 !important; color: #d9e3db !important; font-size: 12px !important; }
      .mpesa-time strong { color: #f7b05b !important; font-weight: 700 !important; }
      #conversationBaby .dont-reply-footer {
        position: fixed !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
        min-height: 66px; padding: 12px 18px !important; background: #edf0ee !important;
        color: #4d4d4d !important; border: 0 !important; border-radius: 0 !important;
        text-align: left !important; font-size: 13px !important; line-height: 1.3 !important; z-index: 1000;
      }
      #conversationBaby .dont-reply-footer a { color: #0c8ef4 !important; text-decoration: underline !important; }
    `;
    document.head.appendChild(style);
  }

  function distance(first, second) {
    return Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY);
  }

  function applyMessageScale() {
    var chat = document.getElementById('chatWindow');
    if (chat) chat.style.setProperty('--message-scale', messageScale);
  }

  function enablePinchZoom() {
    var chat = document.getElementById('chatWindow');
    if (!chat || chat.dataset.pinchZoomEnabled) return;
    chat.dataset.pinchZoomEnabled = 'true';

    chat.addEventListener('touchstart', function (event) {
      if (event.touches.length === 2) {
        pinchStartDistance = distance(event.touches[0], event.touches[1]);
        pinchStartScale = messageScale;
      }
    }, { passive: true });

    chat.addEventListener('touchmove', function (event) {
      if (event.touches.length !== 2 || !pinchStartDistance) return;
      event.preventDefault();
      messageScale = Math.max(0.8, Math.min(1.4, pinchStartScale * distance(event.touches[0], event.touches[1]) / pinchStartDistance));
      applyMessageScale();
    }, { passive: false });

    chat.addEventListener('touchend', function (event) {
      if (event.touches.length < 2) pinchStartDistance = 0;
    }, { passive: true });
  }

  function renderMpesaCard(container, entry) {
    if (!container) return null;
    injectStyles();
    enablePinchZoom();
    applyMessageScale();

    var text = escapeHtml(clean(entry && entry.text))
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
    var time = new Date(entry && entry.ts ? entry.ts : Date.now()).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    var wrapper = document.createElement('div');
    wrapper.className = 'mpesa-card-item';
    wrapper.innerHTML = [
      '<article class="mpesa-message">',
      '  <div class="mpesa-copy">' + text + '</div>',
      '  <div class="mpesa-promo">',
      '    <div class="mpesa-graphic"><div class="mpesa-letter">S</div></div>',
      '    <div class="mpesa-brandbar">',
      '      <span class="mpesa-saf">Safaricom</span><span class="mpesa-divider"></span>',
      '      <span class="mpesa-mini"><span>m</span><span class="box"></span><span>pesa</span></span>',
      '    </div>',
      '  </div>',
      '</article>',
      '<div class="mpesa-app">Fintech App</div>',
      '<div class="mpesa-link">saf.cx</div>',
      '<div class="mpesa-time"><strong>' + escapeHtml(time) + '</strong> • Safaricom</div>'
    ].join('');
    container.appendChild(wrapper);
    return wrapper;
  }

  window.renderMpesaCard = renderMpesaCard;
  window.removeMpesaTransactionCode = removeTransactionCode;
}(window, document));
