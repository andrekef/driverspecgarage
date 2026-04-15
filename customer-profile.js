/**
 * customer-profile.js
 * Driver Spec Garage — Client-side customer profile module.
 *
 * ARCHITECTURE NOTE:
 * All data is stored in the user's own browser via localStorage.
 * Nothing is sent to a server, stored in the repo, or accessible
 * by any other user. Cross-customer lookup is physically impossible.
 *
 * Usage:
 *   1. Include this script: <script src="customer-profile.js"></script>
 *   2. Add a mount point: <div id="profile-widget"></div>
 *   3. On DOMContentLoaded: CustomerProfile.render('profile-widget');
 *   4. In your booking function: CustomerProfile.getCalendlyParams()
 */

const CustomerProfile = (() => {
  const STORAGE_KEY = 'dsg_customer_v1';

  // ── CSS injected once into <head> ─────────────────────────────────
  const STYLES = `
    .cp-panel {
      border: 1px solid #e8e8e8;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 24px;
      background: #fff;
      transition: box-shadow 0.2s;
    }
    .cp-panel:focus-within {
      box-shadow: 0 0 0 2px rgba(231,76,60,0.15);
      border-color: #e74c3c;
    }
    .cp-toggle {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 16px;
      cursor: pointer;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      background: #fafafa;
    }
    .cp-toggle:hover { background: #f5f5f5; }
    .cp-toggle-icon { font-size: 1.1rem; flex-shrink: 0; }
    .cp-toggle-text { flex: 1; font-size: 0.9rem; color: #333; }
    .cp-toggle-text strong { font-weight: 700; }
    .cp-toggle-text .cp-summary-sub { font-size: 0.78rem; color: #999; display: block; margin-top: 1px; }
    .cp-chevron { color: #bbb; font-size: 0.7rem; transition: transform 0.2s; flex-shrink: 0; }
    .cp-chevron.open { transform: rotate(180deg); }
    .cp-saved-dot {
      width: 7px; height: 7px;
      background: #27ae60;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .cp-form {
      padding: 16px;
      border-top: 1px solid #f0f0f0;
      display: none;
    }
    .cp-form.open { display: block; }

    .cp-row {
      display: flex;
      gap: 12px;
      margin-bottom: 12px;
    }
    .cp-field {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .cp-field.full { flex: 100%; }
    .cp-field label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #999;
    }
    .cp-field input {
      padding: 10px 12px;
      font-size: 0.9rem;
      border: 1px solid #ddd;
      border-radius: 5px;
      background: white;
      transition: border-color 0.2s;
      width: 100%;
      box-sizing: border-box;
    }
    .cp-field input:focus {
      outline: none;
      border-color: #e74c3c;
    }

    .cp-actions {
      display: flex;
      gap: 8px;
      margin-top: 4px;
    }
    .cp-btn-save {
      flex: 1;
      padding: 11px;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 5px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: background 0.2s;
      letter-spacing: 0.3px;
    }
    .cp-btn-save:hover { background: #c0392b; }
    .cp-btn-clear {
      padding: 11px 16px;
      background: white;
      color: #999;
      border: 1px solid #ddd;
      border-radius: 5px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cp-btn-clear:hover { border-color: #ccc; color: #666; }

    .cp-privacy {
      margin-top: 10px;
      font-size: 0.75rem;
      color: #bbb;
      text-align: center;
    }

    .cp-toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%) translateY(20px);
      background: #2c3e50;
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      opacity: 0;
      transition: opacity 0.25s, transform 0.25s;
      z-index: 9999;
      pointer-events: none;
    }
    .cp-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    @media (max-width: 500px) {
      .cp-row { flex-direction: column; gap: 8px; }
    }
  `;

  // ── Storage ───────────────────────────────────────────────────────
  function get() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
    } catch {
      return null;
    }
  }

  function save(profile) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
  }

  // ── Calendly integration ──────────────────────────────────────────
  /**
   * Returns an object of URL params to merge into your Calendly URL.
   * Keys: name, email, a1 (phone). Returns {} if no profile saved.
   */
  function getCalendlyParams() {
    const p = get();
    if (!p) return {};
    const params = {};
    const fullName = [p.firstName, p.lastName].filter(Boolean).join(' ');
    if (fullName) params.name = fullName;
    if (p.email)  params.email = p.email;
    // a1 is the phone field in your Calendly setup
    if (p.phone)  params.a1 = p.phone;
    return params;
  }

  // ── UI ─────────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('cp-styles')) return;
    const el = document.createElement('style');
    el.id = 'cp-styles';
    el.textContent = STYLES;
    document.head.appendChild(el);
  }

  function render(containerId) {
    injectStyles();
    const container = document.getElementById(containerId);
    if (!container) return;
    const profile = get();
    container.innerHTML = buildHTML(profile);
  }

  function buildHTML(profile) {
    const hasSaved = profile && profile.firstName;
    const summaryText = hasSaved
      ? `${profile.firstName} ${profile.lastName || ''}`.trim()
      : 'Save your info';
    const subText = hasSaved
      ? (profile.car || (profile.email ? profile.email : 'No vehicle saved'))
      : 'Auto-fill booking next time';

    return `
      <div class="cp-panel" id="cp-panel">
        <div class="cp-toggle" onclick="CustomerProfile._toggle()" role="button" aria-expanded="false" id="cp-toggle-el">
          ${hasSaved ? '<div class="cp-saved-dot"></div>' : '<span class="cp-toggle-icon">👤</span>'}
          <div class="cp-toggle-text">
            <strong>${summaryText}</strong>
            <span class="cp-summary-sub">${subText}</span>
          </div>
          <span class="cp-chevron" id="cp-chevron">▼</span>
        </div>
        <div class="cp-form" id="cp-form">
          <div class="cp-row">
            <div class="cp-field">
              <label>First Name</label>
              <input id="cp-first" type="text" autocomplete="given-name" placeholder="John" value="${esc(profile?.firstName)}">
            </div>
            <div class="cp-field">
              <label>Last Name</label>
              <input id="cp-last" type="text" autocomplete="family-name" placeholder="Smith" value="${esc(profile?.lastName)}">
            </div>
          </div>
          <div class="cp-row">
            <div class="cp-field">
              <label>Email</label>
              <input id="cp-email" type="email" autocomplete="email" placeholder="you@email.com" value="${esc(profile?.email)}">
            </div>
            <div class="cp-field">
              <label>Phone</label>
              <input id="cp-phone" type="tel" autocomplete="tel" placeholder="646-555-0100" value="${esc(profile?.phone)}">
            </div>
          </div>
          <div class="cp-row">
            <div class="cp-field full">
              <label>Your Vehicle</label>
              <input id="cp-car" type="text" placeholder="2019 BMW M4 Competition" value="${esc(profile?.car)}">
            </div>
          </div>
          <div class="cp-actions">
            ${hasSaved ? '<button class="cp-btn-clear" onclick="CustomerProfile._clear()">Clear</button>' : ''}
            <button class="cp-btn-save" onclick="CustomerProfile._saveFromForm()">Save to This Device</button>
          </div>
          <p class="cp-privacy">🔒 Saved locally in your browser only — never uploaded anywhere.</p>
        </div>
      </div>
      <div class="cp-toast" id="cp-toast"></div>
    `;
  }

  function esc(val) {
    if (!val) return '';
    return String(val).replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  function toast(msg) {
    const el = document.getElementById('cp-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }

  // ── Public event handlers (called via inline onclick) ──────────────
  function _toggle() {
    const form    = document.getElementById('cp-form');
    const chevron = document.getElementById('cp-chevron');
    const toggle  = document.getElementById('cp-toggle-el');
    if (!form) return;
    const isOpen = form.classList.contains('open');
    form.classList.toggle('open', !isOpen);
    if (chevron) chevron.classList.toggle('open', !isOpen);
    if (toggle) toggle.setAttribute('aria-expanded', String(!isOpen));
  }

  function _saveFromForm() {
    const profile = {
      firstName: (document.getElementById('cp-first')?.value || '').trim(),
      lastName:  (document.getElementById('cp-last')?.value  || '').trim(),
      email:     (document.getElementById('cp-email')?.value || '').trim(),
      phone:     (document.getElementById('cp-phone')?.value || '').trim(),
      car:       (document.getElementById('cp-car')?.value   || '').trim()
    };

    // Basic validation
    if (!profile.firstName && !profile.email) {
      toast('Add at least a name or email to save.');
      return;
    }

    save(profile);
    // Re-render the widget with updated summary, keep form closed
    const containerId = document.getElementById('cp-panel')?.parentElement?.id;
    if (containerId) render(containerId);
    toast('✓ Info saved to this device');
  }

  function _clear() {
    clear();
    const containerId = document.getElementById('cp-panel')?.parentElement?.id;
    if (containerId) render(containerId);
    toast('Info cleared');
  }

  return {
    get,
    save,
    clear,
    render,
    getCalendlyParams,
    _toggle,
    _saveFromForm,
    _clear
  };
})();
