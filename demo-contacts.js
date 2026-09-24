(() => {
  'use strict';

  // These are clearly marked demo contacts. They do not pretend to be real
  // device contacts and are intentionally read-only.
  const demoContacts = [
    { name: 'John Mwangi', preview: 'Message unavailable', unread: 3 },
    { name: 'Aisha Wanjiku', preview: 'This contact is unavailable', unread: 1 },
    { name: 'Brian Otieno', preview: 'Unable to load messages', unread: 2 }
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, char => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[char]));
  }

  function renderDemoContacts() {
    const list = document.querySelector('#inboxList');
    if (!list) return;

    const existing = list.querySelector('[data-demo-contacts]');
    if (existing) existing.remove();

    const group = document.createElement('div');
    group.dataset.demoContacts = 'true';
    group.className = 'demo-contact-group';
    group.setAttribute('aria-label', 'Demo contacts');
    group.innerHTML = demoContacts.map(contact => `
      <div class="list-item demo-contact" aria-disabled="true">
        <div class="demo-contact-info">
          <strong>${escapeHtml(contact.name)}</strong>
          <div class="small muted">${escapeHtml(contact.preview)}</div>
        </div>
        <span class="unread-badge" aria-label="${contact.unread} unread messages">${contact.unread}</span>
      </div>
    `).join('');

    // Appending after renderInbox places demo contacts below the M-PESA row.
    list.appendChild(group);
  }

  function installDemoInbox() {
    if (typeof window.renderInbox === 'function' && !window.renderInboxWithDemoContacts) {
      const originalRenderInbox = window.renderInbox;
      window.renderInbox = function renderInboxWithDemoContacts() {
        originalRenderInbox();
        renderDemoContacts();
      };
      window.renderInboxWithDemoContacts = true;
    }
    renderDemoContacts();
  }

  const style = document.createElement('style');
  style.textContent = `
    .demo-contact-group { margin-top: 8px; }
    .demo-contact { cursor: default; opacity: .9; }
    .demo-contact-info { min-width: 0; overflow: hidden; }
    .demo-contact-info strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .demo-contact-info .small { font-size: 13px; margin-top: 4px; }
    .unread-badge {
      min-width: 24px; height: 24px; padding: 0 7px; border-radius: 999px;
      display: inline-flex; align-items: center; justify-content: center;
      background: #327acd; color: white; font-size: 12px; font-weight: 700;
      flex: 0 0 auto;
    }
  `;
  document.head.appendChild(style);

  // The main inline script is loaded before this file in the repaired app.
  // The retry also prevents a blank messages screen if script timing changes.
  let attempts = 0;
  const timer = setInterval(() => {
    installDemoInbox();
    if (++attempts >= 40 || window.renderInboxWithDemoContacts) clearInterval(timer);
  }, 50);
  installDemoInbox();
})();
