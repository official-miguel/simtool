/* M-PESA message-card renderer. The transaction builder stores the sent message in entry.text. */
(function (window, document) {
  'use strict';

  var STYLE_ID = 'mpesa-reference-styles';

  function decode(value) {
    var textarea = document.createElement('textarea');
    var text = String(value == null ? '' : value);
    for (var i = 0; i < 3; i += 1) {
      textarea.innerHTML = text;
      if (textarea.value === text) break;
      text = textarea.value;
    }
    return text;
  }

  function clean(value) {
    return decode(value)
      .replace(/<br\s*\/?>(\s*)/gi, '\n$1')
      .replace(/<[^>]*>/g, '')
      .replace(/\u00a0/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #conversationBaby { background:#091509 !important; color:#dce8df; }
      #conversationBaby .navbar { height:104px; padding:20px 28px !important; background:#152218 !important; border:0 !important; }
      #conversationBaby .navbar .back { width:64px; height:64px; }
      #conversationBaby .navbar .back span { font-size:54px; }
      #conversationBaby .navbar .nav-title { gap:24px !important; color:#dce8df !important; font-size:32px !important; font-weight:400 !important; }
      #conversationBaby .profile-avatar { width:80px; height:80px; border-radius:50%; margin-right:0; background:#ffc326 !important; }
      #conversationBaby .profile-avatar svg { width:54px; height:54px; stroke:#fff; }
      #conversationBaby > div:nth-of-type(2) { height:calc(100% - 104px) !important; padding:0 !important; }
      #chatWindow { padding:0 16px 150px !important; gap:0 !important; }
      .mpesa-card-item { width:min(100%, 548px); margin:0 0 28px; }
      .mpesa-message { overflow:hidden; width:100%; border-radius:0 48px 48px 0; background:#19231b !important; border:0 !important; }
      .mpesa-copy { padding:18px 32px 22px !important; color:#d9e3db !important; background:#19231b !important; font-size:29px !important; line-height:1.45 !important; overflow-wrap:anywhere; }
      .mpesa-copy a { color:#d9e3db !important; text-decoration:underline !important; }
      .mpesa-promo { overflow:hidden; border-radius:0 0 48px 0; background:#40b94e; }
      .mpesa-graphic { position:relative; height:346px; background:#40b94e; overflow:hidden; }
      .mpesa-graphic:before { content:''; position:absolute; left:12%; top:20%; width:76%; height:48%; border:26px solid #fa163c; border-radius:50%; transform:rotate(-20deg); }
      .mpesa-letter { position:absolute; inset:0; display:grid; place-items:center; color:#fff; font:bold 176px Arial,sans-serif; text-shadow:2px 3px 2px #777; }
      .mpesa-brandbar { min-height:184px; display:flex; align-items:center; justify-content:center; gap:18px; padding:20px 12px; background:#fff; color:#2c9f49; font:bold 40px Arial,sans-serif; white-space:nowrap; }
      .mpesa-saf { color:#349e49; font-style:italic; }
      .mpesa-divider { width:3px; height:65px; background:#43a653; }
      .mpesa-mini { display:inline-flex; align-items:center; color:#349e49; }
      .mpesa-mini .box { width:27px; height:42px; margin:0 2px; border:3px solid #349e49; border-radius:3px; background:#eee; }
      .mpesa-app { margin:0 !important; padding:22px 32px 0 !important; color:#cbe7d1 !important; font-size:28px !important; font-weight:600 !important; }
      .mpesa-link { margin:0 !important; padding:18px 32px 0 !important; color:#cbe7d1 !important; font-size:21px !important; }
      .mpesa-time { margin:0 !important; padding:32px 32px 0 !important; color:#b7c7ba !important; font-size:20px !important; }
      .mpesa-time strong { color:#ff9f59 !important; font-weight:400 !important; }
      #conversationBaby .dont-reply-footer { position:fixed !important; left:0 !important; right:0 !important; bottom:0 !important; min-height:120px; padding:28px 60px !important; background:#19231b !important; color:#dce8df !important; border:0 !important; border-radius:56px 56px 0 0 !important; text-align:left !important; font-size:27px !important; line-height:1.45; z-index:1000; }
      #conversationBaby .dont-reply-footer a { color:#00d984 !important; text-decoration:underline; }
      @media (max-width:600px) {
        #conversationBaby .navbar { height:104px; padding:18px 20px !important; }
        #conversationBaby .navbar .nav-title { font-size:30px !important; }
        .mpesa-card-item { width:calc(100% - 0px); }
        .mpesa-copy { font-size:28px !important; padding-left:32px !important; padding-right:24px !important; }
        .mpesa-graphic { height:345px; }
        .mpesa-brandbar { min-height:184px; font-size:35px; gap:12px; }
        .mpesa-app { font-size:25px !important; }
        #conversationBaby .dont-reply-footer { font-size:25px !important; padding-left:60px !important; }
      }
    `;
    document.head.appendChild(style);
  }

  function renderMpesaCard(container, entry) {
    if (!container) return null;
    injectStyles();
    var text = escapeHtml(clean(entry && entry.text))
      .replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
      .replace(/\n/g, '<br>');
    var time = new Date(entry && entry.ts ? entry.ts : Date.now())
      .toLocaleTimeString([], { hour:'numeric', minute:'2-digit' });
    var wrapper = document.createElement('div');
    wrapper.className = 'mpesa-card-item';
    wrapper.innerHTML = '<article class="mpesa-message">' +
      '<div class="mpesa-copy">' + text + '</div>' +
      '<div class="mpesa-promo"><div class="mpesa-graphic"><div class="mpesa-letter">S</div></div>' +
      '<div class="mpesa-brandbar"><span class="mpesa-saf">Safaricom</span><span class="mpesa-divider"></span><span class="mpesa-mini"><span>m</span><span class="box"></span><span>pesa</span></span></div></div>' +
      '</article><div class="mpesa-app">Fintech App</div><div class="mpesa-link">saf.cx</div>' +
      '<div class="mpesa-time"><strong>' + escapeHtml(time) + '</strong> • Safaricom</div>';
    container.appendChild(wrapper);
    return wrapper;
  }

  window.renderMpesaCard = renderMpesaCard;
}(window, document));
