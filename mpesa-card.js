/* M-PESA message-card renderer matching the provided reference layout. */
(function (window, document) {
  'use strict';

  var STYLE_ID = 'mpesa-reference-styles';

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

  function clean(value) {
    return decode(value)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
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
      #conversationBaby {
        background: #0d1713 !important;
        color: #edf3ef !important;
      }
      #conversationBaby .navbar {
        background: #11251b !important;
        border: 0 !important;
        padding: 12px 16px 10px !important;
        min-height: 84px !important;
        gap: 0 !important;
      }
      #conversationBaby .navbar .back {
        width: 48px !important;
        height: 48px !important;
      }
      #conversationBaby .navbar .back span {
        font-size: 52px !important;
        line-height: 1 !important;
      }
      #conversationBaby .navbar .nav-title {
        display: flex !important;
        align-items: center !important;
        gap: 14px !important;
        color: #edf3ef !important;
        font-size: 22px !important;
        font-weight: 600 !important;
      }
      #conversationBaby .profile-avatar {
        width: 54px !important;
        height: 54px !important;
        margin-right: 0 !important;
        background: #f0c74d !important;
      }
      #conversationBaby .profile-avatar svg {
        width: 34px !important;
        height: 34px !important;
      }
      #conversationBaby > div:nth-of-type(2) {
        height: calc(100% - 84px) !important;
        padding: 0 !important;
      }
      #chatWindow {
        padding: 20px 14px 150px !important;
        gap: 0 !important;
      }
      .mpesa-card-item {
        width: min(100%, 560px);
        margin: 0 auto 18px;
      }
      .mpesa-message {
        overflow: hidden;
        border: 0 !important;
        border-radius: 0 24px 24px 0 !important;
        background: #1a2e23 !important;
      }
      .mpesa-copy {
        padding: 18px 22px 16px !important;
        background: #1a2e23 !important;
        color: #ecf1ee !important;
        font-size: 17px !important;
        line-height: 1.42 !important;
        letter-spacing: 0 !important;
        overflow-wrap: anywhere;
      }
      .mpesa-copy a {
        color: #ecf1ee !important;
        text-decoration: underline !important;
      }
      .mpesa-promo {
        border-radius: 0 0 24px 0 !important;
        overflow: hidden;
        background: #35ad49;
      }
      .mpesa-graphic {
        position: relative;
        height: 182px;
        background: #35ad49;
        overflow: hidden;
      }
      .mpesa-graphic:before {
        content: '';
        position: absolute;
        left: 10%;
        top: 20%;
        width: 80%;
        height: 52%;
        border: 18px solid #ef1e2d;
        border-radius: 50%;
        transform: rotate(-18deg);
      }
      .mpesa-letter {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        color: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
        font-weight: 900;
        font-size: 126px;
        line-height: 1;
      }
      .mpesa-brandbar {
        min-height: 90px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        background: #f4f4f4;
        color: #2ca54b;
        padding: 12px 16px;
        font-family: Arial, Helvetica, sans-serif;
        font-weight: 900;
        font-size: 28px;
        white-space: nowrap;
      }
      .mpesa-saf {
        font-style: italic;
        color: #e63946;
      }
      .mpesa-divider {
        width: 2px;
        height: 36px;
        background: rgba(10, 80, 35, 0.4);
      }
      .mpesa-mini {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        color: #2ca54b;
      }
      .mpesa-mini .box {
        display: inline-block;
        width: 14px;
        height: 20px;
        border-radius: 3px;
        border: 2px solid #2ca54b;
        background: #ffffff;
      }
      .mpesa-app {
        margin: 0 !important;
        padding: 16px 18px 0 !important;
        color: #dfe9df !important;
        font-size: 17px !important;
        font-weight: 600 !important;
      }
      .mpesa-link {
        margin: 0 !important;
        padding: 10px 18px 0 !important;
        color: #dfe9df !important;
        font-size: 12px !important;
      }
      .mpesa-time {
        margin: 0 !important;
        padding: 18px 18px 0 !important;
        color: #d4ddd5 !important;
        font-size: 11px !important;
      }
      .mpesa-time strong {
        color: #f7b75f !important;
        font-weight: 700 !important;
      }
      #conversationBaby .dont-reply-footer {
        position: fixed !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        min-height: 72px;
        padding: 12px 18px !important;
        background: #f3f3f3 !important;
        color: #444 !important;
        border: 0 !important;
        border-radius: 0 !important;
        text-align: left !important;
        font-size: 14px !important;
        line-height: 1.4 !important;
        z-index: 1000;
      }
      #conversationBaby .dont-reply-footer a {
        color: #0b8aff !important;
        text-decoration: underline;
      }
    `;
    document.head.appendChild(style);
  }

  function renderMpesaCard(container, entry) {
    if (!container) return null;
    injectStyles();

    var text = clean(entry && entry.text);
    var safeText = escapeHtml(text)
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');

    var time = new Date(entry && entry.ts ? entry.ts : Date.now())
      .toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    var wrapper = document.createElement('div');
    wrapper.className = 'mpesa-card-item';
    wrapper.innerHTML = [
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
      '<div class="mpesa-time"><strong>' + escapeHtml(time) + '</strong> • Safaricom</div>'
    ].join('');

    container.appendChild(wrapper);
    return wrapper;
  }

  window.renderMpesaCard = renderMpesaCard;
}(window, document));
