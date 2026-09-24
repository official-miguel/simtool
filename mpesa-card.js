/* MPESA message-card override.
 * Keeps the card close to the provided reference while staying safe for text
 * generated in this app, including HTML-ish M-PESA content.
 */
(function (window, document) {
  'use strict';

  var STYLE_ID = 'mpesa-card-responsive-styles';

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
    if (document.getElementById(STYLE_ID)) return;

    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #conversationBaby { background: #061b15; }
      #conversationBaby .navbar { background: #061b15; border-bottom: 1px solid rgba(146,170,153,.28); padding: 14px 18px 10px !important; min-height: 74px; }
      #conversationBaby .navbar .nav-title { display: flex; align-items: center; font-size: 24px; font-weight: 700; color: #ebf0ec; }
      #conversationBaby .back { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
      #conversationBaby .back span { font-size: 40px; line-height: 1; transform: translateY(-3px); }
      #conversationBaby .profile-avatar { width: 42px; height: 42px; border-radius: 50%; background: #f3c731; display: flex; align-items: center; justify-content: center; margin-right: 10px; }
      #conversationBaby .profile-avatar svg { width: 23px; height: 23px; }
      #chatWindow { display: flex !important; flex-direction: column !important; gap: 14px !important; padding: 14px 14px 120px !important; min-height: 0 !important; max-height: none !important; background: transparent !important; }
      .mpesa-card-item { width: 100%; max-width: 100%; margin: 0 0 12px; }
      .mpesa-card-item .mpesa-message { background: rgba(17,28,25,.55); border-radius: 18px; overflow: hidden; width: 100%; border: 1px solid rgba(255,255,255,.03); }
      .mpesa-card-item .mpesa-copy { padding: 10px 12px 8px; color: #dfe8df; font-size: 15px; line-height: 1.38; letter-spacing: -.02em; overflow-wrap: anywhere; background: rgba(16,25,23,.18); }
      .mpesa-card-item .mpesa-copy a { color: #eff5ef !important; text-decoration: underline; text-underline-offset: 2px; }
      .mpesa-card-item .mpesa-promo { width: 100%; background: linear-gradient(180deg,#45c55c 0%,#1ea956 100%); overflow: hidden; }
      .mpesa-card-item .mpesa-graphic { position: relative; height: clamp(120px,26vw,210px); background: linear-gradient(180deg,#39c95d 0%,#1aa659 100%); overflow: hidden; }
      .mpesa-card-item .mpesa-graphic::before { content: ''; position: absolute; left: 12%; top: 24%; width: 76%; height: 48%; border: clamp(12px,3vw,24px) solid #f73e4a; border-radius: 50%; transform: rotate(-18deg); }
      .mpesa-card-item .mpesa-letter { position: absolute; left: 50%; top: 50%; transform: translate(-50%,-50%); color: rgba(255,255,255,.98); font-size: clamp(90px,19vw,150px); line-height: 1; font-weight: 900; }
      .mpesa-card-item .mpesa-brandbar { min-height: 62px; display: flex; align-items: center; justify-content: center; gap: 10px; background: #f3f3f3; color: #f03f49; font-weight: 900; font-size: clamp(18px,5vw,38px); white-space: nowrap; padding: 10px 12px; }
      .mpesa-card-item .mpesa-saf { font-style: italic; color: #ec3844; }
      .mpesa-card-item .mpesa-divider { width: 2px; height: 34px; background: rgba(19,52,39,.35); }
      .mpesa-card-item .mpesa-mini { display: inline-flex; align-items: center; gap: 4px; color: #0daa55; }
      .mpesa-card-item .mpesa-mini .box { display: inline-block; width: 13px; height: 13px; border-radius: 2px; background: #f03f49; transform: translateY(-1px); }
      .mpesa-card-item .mpesa-app { margin: 0; padding: 16px 0 0 12px; color: rgba(236,245,238,.94); font-size: 16px; font-weight: 600; }
      .mpesa-card-item .mpesa-link { margin: 2px 0 0; padding-left: 12px; color: rgba(236,245,238,.8); font-size: 13px; }
      .mpesa-card-item .mpesa-time { margin: 8px 0 0; padding-left: 12px; color: rgba(236,245,238,.82); font-size: 11px; line-height: 1.2; }
      .mpesa-card-item .mpesa-time strong { font-weight: 600; color: #f6be60; }
      #conversationBaby .dont-reply-footer { position: fixed; left: 0; right: 0; bottom: 0; width: 100%; background: rgba(18,31,27,.96); color: #dde9df; font-size: 15px; line-height: 1.5; padding: 12px 18px 16px; border-top: 1px solid rgba(255,255,255,.08); box-sizing: border-box; z-index: 10; }
      #conversationBaby .dont-reply-footer a { color: #35d594; text-decoration: underline; }
      @media (max-width: 420px) { .mpesa-card-item .mpesa-copy { font-size: 13px; } }
    `;
    document.head.appendChild(style);
  }

  function renderMpesaCard(container, entry) {
    if (!container) return null;
    injectStyles();
    var safeText = escapeHtml(cleanMessageText(entry && entry.text))
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
    var wrapper = document.createElement('div');
    wrapper.className = 'mpesa-card-item';
    wrapper.innerHTML = [
      '<article class="mpesa-message">',
      '<div class="mpesa-copy">' + safeText + '</div>',
      '<div class="mpesa-promo"><div class="mpesa-graphic"><div class="mpesa-letter">S</div></div>',
      '<div class="mpesa-brandbar"><span class="mpesa-saf">Safaricom</span><span class="mpesa-divider"></span><span class="mpesa-mini"><span>m</span><span class="box"></span><span>pesa</span></span></div></div>',
      '</article>',
      '<div class="mpesa-app">Fintech App</div>',
      '<div class="mpesa-link">saf.cx</div>',
      '<div class="mpesa-time"><strong>' + escapeHtml(formatTimestamp(entry && entry.ts)) + '</strong> • Safaricom</div>'
    ].join('');
    container.appendChild(wrapper);
    return wrapper;
  }

  window.renderMpesaCard = renderMpesaCard;
}(window, document));
