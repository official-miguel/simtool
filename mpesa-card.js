/* Canonical MPESA message renderer. Loaded by the conversation page when available. */
(function (window, document) {
  'use strict';

  var STYLE_ID = 'mpesa-card-responsive-styles';

  function decodeEntities(value) {
    var text = String(value == null ? '' : value);
    var textarea = document.createElement('textarea');
    // Decode repeatedly because older saved messages may contain &lt;span&gt;.
    for (var i = 0; i < 3; i += 1) {
      textarea.innerHTML = text;
      var decoded = textarea.value;
      if (decoded === text) break;
      text = decoded;
    }
    return text;
  }

  function stripMarkup(value) {
    return decodeEntities(value)
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]*>/g, '')
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
      #conversationBaby { background:#111216 !important; }
      #conversationBaby .navbar { background:#111216 !important; border:0 !important; padding:12px 16px !important; }
      #conversationBaby .profile-avatar { background:#858589 !important; }
      #conversationBaby .navbar .nav-title { color:#f0f1f3 !important; font-size:24px; }
      #conversationBaby > div:nth-of-type(2) { height:calc(100% - 62px) !important; padding:0 !important; }
      #chatWindow { padding:28px 48px 110px !important; gap:0 !important; min-height:0 !important; max-height:none !important; }
      .mpesa-card-item { width:100%; max-width:624px; margin:0 auto 28px; }
      .mpesa-message { background:#cfd0d0 !important; border:2px solid #ededed !important; border-radius:36px !important; overflow:hidden; }
      .mpesa-copy { padding:28px 28px 18px !important; background:#cfd0d0 !important; color:#f4f4f4 !important; font-size:28px !important; line-height:1.38 !important; overflow-wrap:anywhere; }
      .mpesa-copy a { color:#f4f4f4 !important; }
      .mpesa-promo { border-radius:0 !important; }
      .mpesa-graphic { height:250px !important; background:#39bd50 !important; }
      .mpesa-brandbar { min-height:158px !important; background:#f7f7f7 !important; font-size:42px !important; overflow:hidden; }
      .mpesa-app { padding:20px 12px 0 !important; margin:0 !important; font-size:30px !important; font-weight:700 !important; }
      .mpesa-link { padding:12px 12px 0 !important; margin:0 !important; font-size:22px !important; color:#1680ee !important; }
      .mpesa-time { padding:34px 12px 0 !important; margin:0 !important; font-size:21px !important; }
      #conversationBaby .dont-reply-footer { position:fixed !important; left:0 !important; right:0 !important; bottom:0 !important; width:100% !important; min-height:64px; padding:14px 30px !important; display:block !important; text-align:left !important; background:#d6d6d6 !important; color:#555 !important; border:0 !important; border-radius:0 !important; font-size:24px !important; line-height:1.35; z-index:1000; }
      #conversationBaby .dont-reply-footer a { color:#087cf0 !important; font-weight:700; text-decoration:none; }
      @media (max-width:600px) { #chatWindow { padding:28px 48px 100px !important; } .mpesa-copy { font-size:27px !important; } .mpesa-brandbar { font-size:34px !important; } #conversationBaby .dont-reply-footer { font-size:23px !important; } }
    `;
    document.head.appendChild(style);
  }

  function renderMpesaCard(container, entry) {
    if (!container) return null;
    injectStyles();
    var text = stripMarkup(entry && entry.text);
    var safeText = escapeHtml(text).replace(/\n/g, '<br>');
    var date = new Date(entry && entry.ts ? entry.ts : Date.now());
    var time = date.toLocaleTimeString([], { hour:'numeric', minute:'2-digit' });
    var wrapper = document.createElement('div');
    wrapper.className = 'mpesa-card-item';
    wrapper.innerHTML = [
      '<article class="mpesa-message">',
      '<div class="mpesa-copy">' + safeText + '</div>',
      '<div class="mpesa-promo"><div class="mpesa-graphic"><div class="mpesa-letter">S</div></div>',
      '<div class="mpesa-brandbar"><span class="mpesa-saf">Safaricom</span><span class="mpesa-divider"></span><span class="mpesa-mini"><span>m</span><span class="box"></span><span>pesa</span></span></div></div>',
      '</article><div class="mpesa-app">Fintech App</div><div class="mpesa-link">saf.cx</div>',
      '<div class="mpesa-time"><strong>' + escapeHtml(time) + '</strong> • Safaricom</div>'
    ].join('');
    container.appendChild(wrapper);
    return wrapper;
  }

  window.renderMpesaCard = renderMpesaCard;
}(window, document));
