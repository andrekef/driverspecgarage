/**
 * Driver Spec Garage — Customer Database
 * customers.js
 *
 * Fetches customer list from a Google Apps Script Web App (your private Sheet).
 * Falls back to an empty list if the fetch fails — no customer data in this file.
 *
 * SETUP: Replace the WEB_APP_URL below with your deployed Apps Script URL.
 */

const DSGCustomers = (() => {

    // ── PASTE YOUR WEB APP URL HERE ────────────────────────────────────────
    const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxnl4XXZnBD91o67nFFXy9A10dIs84OIhkiueflOP6Mtige7Dzga5fkJ3fQ8a7f5zo/exec';
    // ───────────────────────────────────────────────────────────────────────

    const LS_CACHE_KEY    = 'dsg_customers_cache_v1';   // fetched list cache
    const LS_CACHE_TS_KEY = 'dsg_customers_cache_ts_v1'; // timestamp of last fetch
    const LS_CUSTOM_KEY   = 'dsg_customers_custom_v1';  // locally added contacts
    const CACHE_TTL_MS    = 5 * 60 * 1000;              // re-fetch after 5 minutes

    // Fallback — empty. Customer data lives only in your private Google Sheet.
    // If the Sheet fetch fails and no cache exists, the dropdown shows nothing
    // until connectivity is restored or the user manually adds someone via +.
    const FALLBACK = [];

    // ── Cache helpers ──────────────────────────────────────────────────────
    function getCached() {
        try {
            const ts   = parseInt(localStorage.getItem(LS_CACHE_TS_KEY) || '0');
            const data = JSON.parse(localStorage.getItem(LS_CACHE_KEY));
            if (data && (Date.now() - ts) < CACHE_TTL_MS) return data;
        } catch {}
        return null;
    }

    function setCache(list) {
        try {
            localStorage.setItem(LS_CACHE_KEY,    JSON.stringify(list));
            localStorage.setItem(LS_CACHE_TS_KEY, String(Date.now()));
        } catch {}
    }

    function getCustom() {
        try { return JSON.parse(localStorage.getItem(LS_CUSTOM_KEY)) || []; }
        catch { return []; }
    }

    function saveCustom(list) {
        localStorage.setItem(LS_CUSTOM_KEY, JSON.stringify(list));
    }

    // ── Fetch from Apps Script ─────────────────────────────────────────────
    async function fetchFromSheet() {
        if (!WEB_APP_URL || WEB_APP_URL === 'YOUR_WEB_APP_URL_HERE') return null;
        try {
            const res  = await fetch(WEB_APP_URL);
            const json = await res.json();
            if (json.ok && Array.isArray(json.customers)) {
                setCache(json.customers);
                return json.customers;
            }
        } catch {}
        return null;
    }

    // ── Post new customer to Sheet ─────────────────────────────────────────
    async function postToSheet(contact) {
        if (!WEB_APP_URL || WEB_APP_URL === 'YOUR_WEB_APP_URL_HERE') return false;
        try {
            const res  = await fetch(WEB_APP_URL, {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify(contact),
            });
            const json = await res.json();
            return json.ok === true;
        } catch { return false; }
    }

    // ── Build full contact list (custom first, then sheet/fallback) ────────
    function buildList(sheetContacts) {
        const custom = getCustom();
        const base   = sheetContacts || getCached() || FALLBACK;
        return [...custom, ...base];
    }

    // ── Normalize phone ────────────────────────────────────────────────────
    function normalizePhone(raw) {
        if (!raw) return '+1';
        const digits = raw.replace(/\D/g, '');
        if (digits.length === 10) return '+1' + digits;
        if (digits.length === 11 && digits.startsWith('1')) return '+' + digits;
        return raw || '+1';
    }

    // ── State ──────────────────────────────────────────────────────────────
    let _sheetContacts    = null;
    let _selectedContact  = null;
    let _onSelectCallback = null;

    // ── Render ─────────────────────────────────────────────────────────────
    async function render(targetId, onSelect) {
        const container = document.getElementById(targetId);
        if (!container) return;

        _onSelectCallback = onSelect;

        container.innerHTML = _buildHTML();
        _injectStyles();

        // Show loading state
        _setDropdownLoading(true);

        // Try to fetch fresh data, fall back to cache or FALLBACK
        const fetched = await fetchFromSheet();
        _sheetContacts = fetched;

        _populateDropdown(buildList(_sheetContacts));
        _setDropdownLoading(false);
    }

    function _buildHTML() {
        return `
        <div id="dsg-picker">
            <div class="dsg-picker-row">
                <select id="dsg-customer-select" onchange="DSGCustomers._onSelect(this.value)">
                    <option value="">Loading customers…</option>
                </select>
                <button class="dsg-add-btn" title="Add new customer" onclick="DSGCustomers._openModal()">＋</button>
                <button class="dsg-refresh-btn" title="Refresh from Sheet" onclick="DSGCustomers._refresh()">↻</button>
            </div>
            <div id="dsg-customer-chip">
                <div class="dsg-chip-info">
                    <div class="dsg-chip-name" id="dsg-chip-name"></div>
                    <div class="dsg-chip-sub"  id="dsg-chip-sub"></div>
                </div>
                <button class="dsg-chip-clear" onclick="DSGCustomers._clearSelection()" title="Clear">✕</button>
            </div>
        </div>

        <!-- Add Customer Modal -->
        <div id="dsg-add-modal-overlay" onclick="DSGCustomers._closeModalOnBg(event)">
            <div id="dsg-add-modal">
                <h3>Add New Customer</h3>
                <label>Name *</label>
                <input type="text"  id="dsg-new-name"    placeholder="First Last" />
                <label>Email</label>
                <input type="email" id="dsg-new-email"   placeholder="email@example.com" />
                <label>Phone</label>
                <input type="tel"   id="dsg-new-phone"   placeholder="646-123-4567" />
                <label>Car / Vehicle</label>
                <input type="text"  id="dsg-new-car"     placeholder="e.g. M4, Urus, X5M" />
                <div id="dsg-modal-status" class="dsg-modal-status"></div>
                <div class="dsg-modal-err" id="dsg-modal-err">Name is required.</div>
                <div class="dsg-modal-actions">
                    <button class="dsg-modal-cancel" onclick="DSGCustomers._closeModal()">Cancel</button>
                    <button class="dsg-modal-save"   id="dsg-modal-save-btn" onclick="DSGCustomers._saveNew()">Save &amp; Select</button>
                </div>
            </div>
        </div>`;
    }

    function _injectStyles() {
        if (document.getElementById('dsg-picker-styles')) return;
        const s = document.createElement('style');
        s.id = 'dsg-picker-styles';
        s.textContent = `
            #dsg-picker { margin-bottom: 16px; font-family: inherit; }
            .dsg-picker-row { display: flex; gap: 8px; align-items: stretch; }
            #dsg-customer-select {
                flex: 1; padding: 13px 38px 13px 14px; font-size: 15px;
                border: 2px solid #ddd; border-radius: 5px; background: white;
                cursor: pointer; transition: border-color 0.2s;
                -webkit-appearance: none; appearance: none;
                background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
                background-repeat: no-repeat; background-position: right 14px center; color: #333;
            }
            #dsg-customer-select:focus,
            #dsg-customer-select:hover { border-color: #e74c3c; outline: none; }
            #dsg-customer-select:disabled { opacity: 0.6; cursor: wait; }

            .dsg-add-btn, .dsg-refresh-btn {
                padding: 0 14px; border: none; border-radius: 5px;
                font-size: 18px; cursor: pointer; transition: background 0.2s;
                display: flex; align-items: center; justify-content: center; min-width: 42px;
            }
            .dsg-add-btn     { background: #2c3e50; color: white; }
            .dsg-add-btn:hover { background: #e74c3c; }
            .dsg-refresh-btn { background: #f0f0f0; color: #555; font-size: 16px; }
            .dsg-refresh-btn:hover { background: #e0e0e0; }
            .dsg-refresh-btn.spinning { animation: dsg-spin 0.8s linear infinite; }
            @keyframes dsg-spin { to { transform: rotate(360deg); } }

            #dsg-customer-chip {
                display: none; margin-top: 8px; padding: 10px 14px;
                background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px;
                font-size: 0.88rem; color: #166534;
                align-items: center; justify-content: space-between; gap: 8px;
            }
            #dsg-customer-chip.active { display: flex; }
            .dsg-chip-info { line-height: 1.5; }
            .dsg-chip-name { font-weight: 700; font-size: 0.95rem; }
            .dsg-chip-sub  { color: #4d7c60; font-size: 0.8rem; }
            .dsg-chip-clear {
                cursor: pointer; color: #999; font-size: 1.1rem;
                background: none; border: none; padding: 0 2px; flex-shrink: 0;
            }
            .dsg-chip-clear:hover { color: #e74c3c; }

            #dsg-add-modal-overlay {
                display: none; position: fixed; inset: 0;
                background: rgba(0,0,0,0.45); z-index: 9999;
                align-items: center; justify-content: center;
            }
            #dsg-add-modal-overlay.open { display: flex; }
            #dsg-add-modal {
                background: white; border-radius: 10px; padding: 28px 28px 24px;
                width: 92%; max-width: 420px; box-shadow: 0 8px 40px rgba(0,0,0,0.18);
            }
            #dsg-add-modal h3 { margin: 0 0 20px; font-size: 1.1rem; color: #222; }
            #dsg-add-modal label {
                display: block; font-size: 0.82rem; font-weight: 600; color: #555;
                margin-bottom: 4px; margin-top: 14px;
                text-transform: uppercase; letter-spacing: 0.5px;
            }
            #dsg-add-modal input {
                width: 100%; box-sizing: border-box; padding: 11px 13px;
                font-size: 15px; border: 2px solid #ddd; border-radius: 5px;
                transition: border-color 0.2s;
            }
            #dsg-add-modal input:focus { outline: none; border-color: #e74c3c; }
            .dsg-modal-actions { display: flex; gap: 10px; margin-top: 20px; }
            .dsg-modal-actions button {
                flex: 1; padding: 13px; border: none; border-radius: 5px;
                font-size: 15px; font-weight: 600; cursor: pointer; transition: background 0.2s;
            }
            .dsg-modal-save   { background: #e74c3c; color: white; }
            .dsg-modal-save:hover { background: #c0392b; }
            .dsg-modal-cancel { background: #f0f0f0; color: #444; }
            .dsg-modal-cancel:hover { background: #e0e0e0; }
            .dsg-modal-err    { color: #e74c3c; font-size: 0.82rem; margin-top: 8px; display: none; }
            .dsg-modal-err.show { display: block; }
            .dsg-modal-status { font-size: 0.82rem; margin-top: 8px; color: #888; min-height: 18px; }
        `;
        document.head.appendChild(s);
    }

    function _setDropdownLoading(loading) {
        const sel = document.getElementById('dsg-customer-select');
        const ref = document.querySelector('.dsg-refresh-btn');
        if (!sel) return;
        sel.disabled = loading;
        if (ref) ref.classList.toggle('spinning', loading);
        if (loading) sel.innerHTML = '<option value="">Loading customers…</option>';
    }

    function _populateDropdown(contacts) {
        const sel = document.getElementById('dsg-customer-select');
        if (!sel) return;

        const custom = getCustom();
        sel.innerHTML = '<option value="">-- Select existing customer --</option>';

        if (custom.length) {
            const grp = document.createElement('optgroup');
            grp.label = 'Recently Added';
            custom.forEach((c, i) => {
                const opt = document.createElement('option');
                opt.value = 'custom_' + i;
                opt.textContent = c.name + (c.car ? ` (${c.car})` : '');
                grp.appendChild(opt);
            });
            sel.appendChild(grp);
        }

        const sheetContacts = _sheetContacts || getCached() || FALLBACK;
        if (sheetContacts.length) {
            const grp2 = document.createElement('optgroup');
            grp2.label = 'All Customers';
            sheetContacts.forEach((c, i) => {
                const opt = document.createElement('option');
                opt.value = 'sheet_' + i;
                opt.textContent = c.name + (c.car ? ` (${c.car})` : '');
                grp2.appendChild(opt);
            });
            sel.appendChild(grp2);
        }
    }

    // ── Public: force refresh from Sheet ──────────────────────────────────
    async function _refresh() {
        _setDropdownLoading(true);
        // Bust cache
        localStorage.removeItem(LS_CACHE_KEY);
        localStorage.removeItem(LS_CACHE_TS_KEY);
        const fetched = await fetchFromSheet();
        _sheetContacts = fetched;
        _populateDropdown(buildList(_sheetContacts));
        _setDropdownLoading(false);
    }

    // ── Select handler ────────────────────────────────────────────────────
    function _onSelect(val) {
        if (!val) { _clearSelection(); return; }

        let contact;
        if (val.startsWith('custom_')) {
            contact = getCustom()[parseInt(val.replace('custom_', ''))];
        } else {
            const list = _sheetContacts || getCached() || FALLBACK;
            contact = list[parseInt(val.replace('sheet_', ''))];
        }
        if (!contact) return;
        _selectedContact = contact;

        const chip = document.getElementById('dsg-customer-chip');
        chip.classList.add('active');
        document.getElementById('dsg-chip-name').textContent = contact.name + (contact.car ? ` — ${contact.car}` : '');
        const sub = [contact.email, contact.phone].filter(Boolean).join(' · ');
        document.getElementById('dsg-chip-sub').textContent = sub || 'No contact info';

        if (_onSelectCallback) _onSelectCallback(contact);
    }

    function _clearSelection() {
        _selectedContact = null;
        const sel = document.getElementById('dsg-customer-select');
        if (sel) sel.value = '';
        const chip = document.getElementById('dsg-customer-chip');
        if (chip) chip.classList.remove('active');
        if (_onSelectCallback) _onSelectCallback(null);
    }

    // ── Modal ─────────────────────────────────────────────────────────────
    function _openModal() {
        ['dsg-new-name','dsg-new-email','dsg-new-phone','dsg-new-car'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const err    = document.getElementById('dsg-modal-err');
        const status = document.getElementById('dsg-modal-status');
        if (err)    err.classList.remove('show');
        if (status) status.textContent = '';
        document.getElementById('dsg-add-modal-overlay').classList.add('open');
        setTimeout(() => document.getElementById('dsg-new-name')?.focus(), 100);
    }

    function _closeModal() {
        document.getElementById('dsg-add-modal-overlay').classList.remove('open');
    }

    function _closeModalOnBg(e) {
        if (e.target === document.getElementById('dsg-add-modal-overlay')) _closeModal();
    }

    async function _saveNew() {
        const name  = (document.getElementById('dsg-new-name')?.value  || '').trim();
        const email = (document.getElementById('dsg-new-email')?.value || '').trim();
        const phone = (document.getElementById('dsg-new-phone')?.value || '').trim();
        const car   = (document.getElementById('dsg-new-car')?.value   || '').trim();

        const errEl    = document.getElementById('dsg-modal-err');
        const statusEl = document.getElementById('dsg-modal-status');
        const saveBtn  = document.getElementById('dsg-modal-save-btn');

        if (!name) { errEl?.classList.add('show'); return; }
        errEl?.classList.remove('show');

        const contact = { name, email, phone: normalizePhone(phone), car, company: '' };

        // Save locally immediately so it's available even if Sheet write fails
        const custom = getCustom();
        custom.unshift(contact);
        saveCustom(custom);

        // Try to write to Sheet in background
        if (statusEl) statusEl.textContent = 'Saving to Sheet…';
        if (saveBtn)  saveBtn.disabled = true;

        const saved = await postToSheet(contact);
        if (statusEl) statusEl.textContent = saved ? '✓ Saved to Sheet' : '⚠ Saved locally (Sheet sync failed — add manually)';

        // Refresh dropdown
        _populateDropdown(buildList(_sheetContacts));

        // Auto-select the new contact
        const sel = document.getElementById('dsg-customer-select');
        if (sel) {
            sel.value = 'custom_0';
            _onSelect('custom_0');
        }

        setTimeout(() => {
            _closeModal();
            if (saveBtn) saveBtn.disabled = false;
        }, 1200);
    }

    // ── Calendly params ───────────────────────────────────────────────────
    function getCalendlyParams() {
        if (!_selectedContact) return {};
        const c = _selectedContact;
        const params = {};
        if (c.name)  params.name  = c.name;
        if (c.email) params.email = c.email;
        if (c.phone) params.a1   = normalizePhone(c.phone);
        return params;
    }

    function getSelected() { return _selectedContact; }

    return {
        render,
        getCalendlyParams,
        getSelected,
        normalizePhone,
        _onSelect,
        _clearSelection,
        _refresh,
        _openModal,
        _closeModal,
        _closeModalOnBg,
        _saveNew,
    };
})();
