(() => {
  const demoContacts = [
    { name: 'John Mwangi', preview: 'Message unavailable', unread: 3 },
    { name: 'Aisha Wanjiku', preview: 'This contact is unavailable', unread: 1 },
    { name: 'Brian Otieno', preview: 'Unable to load messages', unread: 2 }
  ];

  function renderDemoContacts() {
    const list = document.querySelector('#inboxList');
    if (!list) return;

    const existing = list.querySelector('[data-demo-contacts]');
    if (existing) existing.remove();

    const group = document.createElement('div');
    group.dataset.demoContacts = 'true';
    group.className = 'demo-contact-group';
    group.innerHTML = demoContacts.map(contact => `
      <div class="list-item demo-contact" aria-disabled="true">
        <div class="demo-contact-info">
          <strong>${contact.name}</strong>
          <div class="small muted">${contact.preview}</div>
        </div>
        <span class="unread-badge" aria-label="${contact.unread} unread messages">${contact.unread}</span>
      </div>
    `).join('');

    list.appendChild(group);
  }

  function installDemoInbox() {
    if (typeof window.renderInbox !== 'function') return;
    const originalRenderInbox = window.renderInbox;
    window.renderInbox = function renderInboxWithDemoContacts() {
      originalRenderInbox();
      renderDemoContacts();
    };
    renderDemoContacts();
  }

  const style = document.createElement('style');
  style.textContent = `
    .demo-contact-group { margin-top: 8px; }
    .demo-contact { cursor: default; opacity: .82; }
    .demo-contact:active { background: rgba(255,255,255,.02); }
    .demo-contact-info { min-width: 0; }
    .demo-contact-info .small { font-size: 13px; margin-top: 4px; }
    .unread-badge {
      min-width: 24px; height: 24px; padding: 0 7px; border-radius: 999px;
      display: inline-flex; align-items: center; justify-content: center;
      background: #327acd; color: white; font-size: 12px; font-weight: 700;
    }
  `;
  document.head.appendChild(style);
  installDemoInbox();
})();
