// Trick World — shared auth + UI helpers. Load after supabase-js and config.js.
(function () {
  const C = window.TW_CONFIG || {};
  const sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
    more: '<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>',
    copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    key: '<circle cx="7.5" cy="15.5" r="4.5"/><path d="m10.7 12.3 9.8-9.8M17 6l3 3M14.5 8.5l2 2"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>',
    message: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
    alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.8 0"/>',
  };
  const icon = (name, size = 16) =>
    `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ""}</svg>`;

  function paint(root = document) {
    root.querySelectorAll("[data-brand]").forEach((el) => {
      if (!el.firstElementChild) el.innerHTML = '<img class="brand-mark" src="icons/tw-mark.png" alt=""><span class="brand-name">Trick <b>World</b></span>';
    });
    root.querySelectorAll("[data-icon]").forEach((el) => {
      if (!el.firstElementChild) el.innerHTML = icon(el.dataset.icon, el.dataset.size || 16);
    });
    root.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
    root.querySelectorAll("[data-support]").forEach((el) => {
      el.href = waLink("Hello, I need help with my Trick World account.");
      el.target = "_blank";
      el.rel = "noopener";
    });
    root.querySelectorAll(".pw-toggle").forEach((btn) => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = "1";
      btn.textContent = "Show";
      btn.addEventListener("click", () => {
        const input = btn.parentElement.querySelector("input");
        const show = input.type === "password";
        input.type = show ? "text" : "password";
        btn.textContent = show ? "Hide" : "Show";
      });
    });
  }

  function toast(msg, type = "info", ms = 3500) {
    let wrap = document.querySelector(".toasts");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "toasts";
      wrap.setAttribute("aria-live", "polite");
      document.body.appendChild(wrap);
    }
    const t = document.createElement("div");
    t.className = "toast toast-" + type;
    t.innerHTML = icon(type === "error" ? "alert" : "check") + "<span>" + esc(msg) + "</span>";
    wrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add("show"));
    setTimeout(() => {
      t.classList.remove("show");
      setTimeout(() => t.remove(), 250);
    }, ms);
  }

  function notice(el, msg, type = "warn") {
    el.className = "notice " + type;
    el.innerHTML = icon(type === "ok" ? "check" : "alert") + "<span>" + esc(msg) + "</span>";
    el.hidden = false;
  }

  function setLoading(btn, on) {
    if (!btn) return;
    btn.disabled = on;
    btn.classList.toggle("loading", on);
  }

  function friendlyError(err) {
    const m = (err && (err.message || err.error_description)) || String(err || "");
    if (/invalid login credentials/i.test(m)) return "Wrong email or password.";
    if (/email not confirmed/i.test(m)) return "Please confirm your email first. Check your inbox.";
    if (/already registered|already been registered|already exists/i.test(m)) return "An account with this email already exists. Log in instead.";
    if (/password should be at least/i.test(m)) return "Password is too short.";
    if (/rate limit|too many/i.test(m)) return "Too many attempts. Wait a minute and try again.";
    if (/failed to fetch|networkerror|network/i.test(m)) return "Network problem. Check your connection and try again.";
    if (/admins only/i.test(m)) return "Only the super admin can do that.";
    return m || "Something went wrong.";
  }

  function toIntl(phone) {
    let d = String(phone || "").replace(/\D/g, "");
    if (d.startsWith("0")) d = "254" + d.slice(1);
    else if (d.length === 9) d = "254" + d;
    return d;
  }
  const waLink = (text, number = C.WHATSAPP_NUMBER) =>
    "https://wa.me/" + toIntl(number) + (text ? "?text=" + encodeURIComponent(text) : "");

  function deviceLabel() {
    const ua = navigator.userAgent;
    let b = "Browser", o = "device";
    if (/Edg\//.test(ua)) b = "Edge";
    else if (/OPR\/|Opera/.test(ua)) b = "Opera";
    else if (/SamsungBrowser/.test(ua)) b = "Samsung Internet";
    else if (/Chrome\//.test(ua)) b = "Chrome";
    else if (/Firefox\//.test(ua)) b = "Firefox";
    else if (/Safari\//.test(ua)) b = "Safari";
    if (/Android/.test(ua)) o = "Android";
    else if (/iPhone|iPad|iPod/.test(ua)) o = "iPhone/iPad";
    else if (/Windows/.test(ua)) o = "Windows";
    else if (/Mac OS X/.test(ua)) o = "Mac";
    else if (/Linux/.test(ua)) o = "Linux";
    return b + " on " + o;
  }

  function go(page, params) {
    const u = new URL(page, location.href);
    if (params) for (const k in params) u.searchParams.set(k, params[k]);
    location.replace(u.href);
  }

  // ---------- auth ----------
  async function claimSession() {
    const { data, error } = await sb.rpc("tw_claim_session", { p_device_info: deviceLabel() });
    if (error) throw error;
    return data;
  }

  async function checkSession() {
    const { data, error } = await sb.rpc("tw_check_session");
    if (error) throw error;
    return data;
  }

  const routeFor = (st) => (st.is_admin ? C.ADMIN_PAGE : st.is_active ? C.HOME_PAGE : C.ACTIVATE_PAGE);

  let leaving = false;
  async function kick(reason) {
    if (leaving) return;
    leaving = true;
    try { await sb.auth.signOut({ scope: "local" }); } catch (e) {}
    go(C.LOGIN_PAGE, reason ? { reason } : null);
  }

  async function logout() {
    leaving = true;
    try { await sb.rpc("tw_release_session"); } catch (e) {}
    try { await sb.auth.signOut({ scope: "local" }); } catch (e) {}
    go(C.LOGIN_PAGE);
  }

  // Returns false (and redirects) if this page shouldn't be shown.
  function allowed(st, need) {
    if (!st || !st.ok) { kick((st && st.reason) || "session_ended"); return false; }
    if (need === "admin" && !st.is_admin) { go(st.is_active ? C.HOME_PAGE : C.ACTIVATE_PAGE); return false; }
    if (need === "active" && !st.is_active) { go(C.ACTIVATE_PAGE); return false; }
    if (need === "inactive" && st.is_active) { go(routeFor(st)); return false; }
    return true;
  }

  function showFatal(msg) {
    document.body.classList.remove("is-loading");
    document.body.innerHTML =
      `<div class="fatal card"><h1>Couldn't connect</h1><p>${esc(msg)}</p><button class="btn btn-primary">Try again</button></div>`;
    document.body.querySelector("button").onclick = () => location.reload();
  }

  // Protect a page. need: "active" (default) | "admin" | "inactive" | "any"
  async function guard(opts = {}) {
    const need = opts.need || "active";
    const { data: { session } } = await sb.auth.getSession();
    if (!session) { go(C.LOGIN_PAGE); return new Promise(() => {}); }

    let st;
    try { st = await checkSession(); }
    catch (e) { showFatal(friendlyError(e)); return new Promise(() => {}); }
    if (!allowed(st, need)) return new Promise(() => {});

    // Keep watching: realtime for instant changes, heartbeat as a fallback.
    let busy = false;
    const recheck = async () => {
      if (busy || leaving) return;
      busy = true;
      try {
        const next = await checkSession();
        if (allowed(next, need) && opts.onChange) opts.onChange(next);
      } catch (e) { /* offline: try again next tick */ }
      finally { busy = false; }
    };
    setInterval(recheck, (C.HEARTBEAT_SECONDS || 20) * 1000);
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") recheck(); });
    window.addEventListener("online", recheck);
    sb.channel("tw-me-" + session.user.id)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles", filter: "id=eq." + session.user.id }, recheck)
      .subscribe();
    sb.auth.onAuthStateChange((event) => { if (event === "SIGNED_OUT" && !leaving) kick("session_ended"); });

    document.body.classList.remove("is-loading");
    return st;
  }

  // For login/signup: if already signed in on this device, skip ahead.
  async function redirectIfSignedIn() {
    const { data: { session } } = await sb.auth.getSession();
    if (!session) return;
    try {
      const st = await checkSession();
      if (st.ok) go(routeFor(st));
      else await sb.auth.signOut({ scope: "local" });
    } catch (e) {}
  }

  document.addEventListener("DOMContentLoaded", () => {
    paint();
    if (/YOUR-PROJECT|YOUR-ANON/.test(C.SUPABASE_URL + C.SUPABASE_ANON_KEY)) {
      console.warn("Trick World: add your Supabase URL and anon key in config.js");
    }
  });

  window.TW = {
    sb, config: C, esc, icon, paint, toast, notice, setLoading, friendlyError,
    toIntl, waLink, deviceLabel, go, routeFor,
    claimSession, checkSession, guard, redirectIfSignedIn, logout,
  };
})();
