<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>Book Now - Driver Spec Garage</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="icon" href="favicon.png" type="image/png">
    <link rel="shortcut icon" href="favicon.ico" type="image/x-icon">
    <style>
        .booking-container {
            max-width: 800px;
            margin: 50px auto;
            padding: 40px;
            padding-left: max(40px, env(safe-area-inset-left));
            padding-right: max(40px, env(safe-area-inset-right));
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .booking-container h1 { text-align: center; color: #333; margin-bottom: 10px; }
        .booking-container > p  { text-align: center; color: #666; margin-bottom: 30px; }

        /* Steps */
        .steps { display: flex; justify-content: center; gap: 8px; margin-bottom: 30px; }
        .step  { display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: #ccc; }
        .step.active { color: #e74c3c; font-weight: 600; }
        .step.done   { color: #27ae60; }
        .step-num {
            width: 24px; height: 24px; border-radius: 50%;
            display: flex; align-items: center; justify-content: center;
            font-size: 0.75rem; font-weight: 700; background: #eee; color: #999;
        }
        .step.active .step-num { background: #e74c3c; color: white; }
        .step.done   .step-num { background: #27ae60; color: white; }
        .step-arrow { color: #ddd; font-size: 0.7rem; }

        /* Customer area */
        .customer-area {
            margin-bottom: 28px;
        }
        .customer-area-label {
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.2px;
            color: #bbb;
            margin-bottom: 8px;
        }

        /* Operator picker (DSGCustomers) */
        /* Styles are injected by customers.js itself */

        /* "New customer" collapsible */
        .new-customer-toggle {
            margin-top: 10px;
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.82rem;
            color: #aaa;
            cursor: pointer;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            width: fit-content;
        }
        .new-customer-toggle:hover { color: #e74c3c; }
        .new-customer-toggle .nct-arrow { font-size: 0.6rem; transition: transform 0.2s; }
        .new-customer-toggle .nct-arrow.open { transform: rotate(90deg); }
        .new-customer-panel {
            display: none;
            margin-top: 10px;
            padding: 2px 0 0;
        }
        .new-customer-panel.open { display: block; }

        /* Divider */
        .section-divider { border: none; border-top: 1px solid #eee; margin: 0 0 24px; }

        /* Service selector */
        .selector-group { margin-bottom: 24px; }
        .selector-group label {
            display: block; font-size: 16px; font-weight: 600;
            margin-bottom: 10px; color: #333;
        }
        .selector-group select {
            width: 100%; padding: 15px; font-size: 16px;
            border: 2px solid #ddd; border-radius: 5px;
            background: white; cursor: pointer; transition: border-color 0.3s;
            -webkit-appearance: none; appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
            background-repeat: no-repeat; background-position: right 15px center;
        }
        .selector-group select:hover { border-color: #e74c3c; }
        .selector-group select:focus { outline: none; border-color: #e74c3c; }

        /* Toggle buttons */
        .toggle-options { display: flex; gap: 12px; }
        .toggle-option {
            flex: 1; padding: 14px; border: 2px solid #ddd; border-radius: 5px;
            cursor: pointer; text-align: center; transition: all 0.2s;
            font-size: 0.95rem; user-select: none; -webkit-tap-highlight-color: transparent;
        }
        .toggle-option:hover:not(.disabled) { border-color: #e74c3c; }
        .toggle-option.selected  { border-color: #e74c3c; background: #fef2f2; }
        .toggle-option.disabled  { opacity: 0.4; cursor: not-allowed; background: #f5f5f5; }
        .toggle-option strong    { display: block; font-size: 0.95rem; color: #333; }
        .toggle-option .toggle-sub { font-size: 0.8rem; color: #999; margin-top: 2px; }

        .location-notice {
            background: #fff8f0; border: 1px solid #f5c48a; border-radius: 6px;
            padding: 10px 14px; margin-top: 10px; font-size: 0.85rem;
            color: #b45309; display: none;
        }
        .location-notice.active { display: block; }

        /* Summary card */
        .summary-card {
            background: #f8f9fa; padding: 20px 24px; border-radius: 8px;
            margin-bottom: 24px; border-left: 4px solid #e74c3c; display: none;
        }
        .summary-card.active { display: block; }
        .summary-card h3 { margin: 0 0 12px 0; color: #333; font-size: 1.1rem; }
        .summary-row { display: flex; justify-content: space-between; padding: 4px 0; font-size: 0.9rem; }
        .summary-row .label { color: #777; }
        .summary-row .value { color: #333; font-weight: 500; }
        .summary-row .value.price { color: #e74c3c; font-weight: 700; font-size: 1.1rem; }
        .summary-row .value.profile-car { color: #555; font-style: italic; }
        .summary-desc {
            margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;
            font-size: 0.85rem; color: #777; line-height: 1.6;
        }

        /* Book button */
        .book-button {
            width: 100%; padding: 18px; font-size: 18px; font-weight: 600;
            background: #e74c3c; color: white; border: none; border-radius: 5px;
            cursor: pointer; transition: background 0.2s; text-transform: uppercase;
            letter-spacing: 1px; min-height: 56px;
        }
        .book-button:hover    { background: #c0392b; }
        .book-button:disabled { background: #ccc; cursor: not-allowed; }

        @media (max-width: 600px) {
            .booking-container { margin: 20px auto; padding: 24px 16px; border-radius: 0; box-shadow: none; }
            .toggle-options { gap: 8px; }
            .toggle-option { padding: 12px 8px; font-size: 0.85rem; }
            .toggle-option strong { font-size: 0.85rem; }
            .steps { gap: 4px; font-size: 0.75rem; }
            .book-button { font-size: 16px; min-height: 52px; }
        }
        @media (hover: none) and (pointer: coarse) {
            .toggle-option, .book-button { min-height: 48px; }
        }
    </style>
</head>
<body>
    <header>
        <div class="logo">
            <a href="index.html"><img src="driverspecgarage_new_logo.JPG" alt="Driver Spec Garage Logo"></a>
        </div>
        <nav>
            <ul>
                <li class="non-clickable">
                    <a href="#" onclick="toggleDropdown(event)">Services</a>
                    <ul class="dropdown" id="servicesDropdown">
                        <li><a href="paint-correction.html">Paint Correction</a></li>
                        <li><a href="ceramic-coating.html">Ceramic Coating</a></li>
                        <li><a href="interior-steaming.html">Interior Steaming</a></li>
                        <li><a href="packages.html">Packages</a></li>
                    </ul>
                </li>
                <li><a href="gallery.html">Gallery</a></li>
                <li><a href="shop.html">Shop</a></li>
                <li><a href="booking.html">Book Now</a></li>
                <li><a href="contact.html">Contact</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <div class="booking-container">
            <h1>Book Your Detail</h1>
            <p>Select your service, vehicle, and location.</p>

            <!-- Steps -->
            <div class="steps">
                <div class="step active" id="step1"><span class="step-num">1</span> Service</div>
                <span class="step-arrow">&#9654;</span>
                <div class="step" id="step2"><span class="step-num">2</span> Vehicle</div>
                <span class="step-arrow">&#9654;</span>
                <div class="step" id="step3"><span class="step-num">3</span> Location</div>
                <span class="step-arrow">&#9654;</span>
                <div class="step" id="step4"><span class="step-num">4</span> Book</div>
            </div>

            <!-- ─────────────────────────────────────────────────────────────
                 CUSTOMER AREA
                 Top section: operator quick-select (DSGCustomers dropdown)
                 Bottom section: collapsible self-serve profile (CustomerProfile)
            ──────────────────────────────────────────────────────────────── -->
            <div class="customer-area">
                <!-- Double-click "Customer" label to reveal operator picker -->
                <div class="customer-area-label" id="customer-area-label" ondblclick="revealOperatorPicker()" style="cursor:default; user-select:none;">Customer</div>

                <!-- Operator dropdown — hidden until double-click -->
                <div id="customer-picker-widget" style="display:none;"></div>

                <!-- "New customer?" toggle — reveals the CustomerProfile widget -->
                <div class="new-customer-toggle" id="nct-toggle" onclick="toggleNewCustomer()">
                    <span class="nct-arrow" id="nct-arrow">&#9654;</span>
                    New customer? Save your info for next time
                </div>
                <div class="new-customer-panel" id="nct-panel">
                    <div id="profile-widget"></div>
                </div>
            </div>

            <hr class="section-divider">

            <!-- 1. Service -->
            <div class="selector-group">
                <label for="service-select">1. What do you need?</label>
                <select id="service-select" onchange="onServiceChange()">
                    <option value="">-- Select a Service --</option>
                    <optgroup label="Detailing Packages">
                        <option value="wash-wax">Wash &amp; Wax (Flushing only)</option>
                        <option value="maintenance">Maintenance Detail</option>
                        <option value="full-detail">Full Detail</option>
                    </optgroup>
                    <optgroup label="Seasonal">
                        <option value="winter-resurrection">Winter Resurrection &#9733;</option>
                    </optgroup>
                    <optgroup label="Standalone Services">
                        <option value="interior-detail">Interior Detail with Steaming</option>
                        <option value="engine-bay">Engine Bay Detail</option>
                    </optgroup>
                    <optgroup label="Premium Services">
                        <option value="paint-correction-1step">Paint Correction (1-Step)</option>
                        <option value="paint-correction-2step">Paint Correction (2-Step)</option>
                        <option value="ceramic-coating">Ceramic Coating</option>
                    </optgroup>
                </select>
            </div>

            <!-- 2. Vehicle Size -->
            <div class="selector-group">
                <label>2. Vehicle size</label>
                <div class="toggle-options">
                    <div class="toggle-option selected" onclick="selectVehicle('car')" id="btn-car">
                        <strong>Car / Sedan / Coupe</strong>
                    </div>
                    <div class="toggle-option" onclick="selectVehicle('suv')" id="btn-suv">
                        <strong>SUV / Van / Truck</strong>
                    </div>
                </div>
            </div>

            <!-- 3. Location -->
            <div class="selector-group">
                <label>3. Where?</label>
                <div class="toggle-options">
                    <div class="toggle-option selected" onclick="selectLocation('mobile')" id="btn-mobile">
                        <strong>Mobile</strong>
                        <div class="toggle-sub">We come to you</div>
                    </div>
                    <div class="toggle-option" onclick="selectLocation('flushing')" id="btn-flushing">
                        <strong>Flushing</strong>
                        <div class="toggle-sub">Drop off</div>
                    </div>
                </div>
                <div class="location-notice" id="location-notice">
                    📍 This service is only available at our Flushing location.
                </div>
            </div>

            <!-- Summary -->
            <div class="summary-card" id="summary">
                <h3 id="summary-title"></h3>
                <div class="summary-row" id="summary-customer-row" style="display:none;">
                    <span class="label">Customer</span>
                    <span class="value" id="summary-customer"></span>
                </div>
                <div class="summary-row" id="summary-car-row" style="display:none;">
                    <span class="label">Vehicle (on file)</span>
                    <span class="value profile-car" id="summary-car"></span>
                </div>
                <div class="summary-row">
                    <span class="label">Vehicle size</span>
                    <span class="value" id="summary-vehicle"></span>
                </div>
                <div class="summary-row">
                    <span class="label">Location</span>
                    <span class="value" id="summary-location"></span>
                </div>
                <div class="summary-row">
                    <span class="label">Duration</span>
                    <span class="value" id="summary-duration"></span>
                </div>
                <div class="summary-row">
                    <span class="label">Price</span>
                    <span class="value price" id="summary-price"></span>
                </div>
                <div class="summary-desc" id="summary-desc"></div>
            </div>

            <!-- Book -->
            <button class="book-button" id="book-button" onclick="openCalendly()" disabled>
                Select a Service to Continue
            </button>
        </div>
    </main>

    <footer>
        <div class="footer-content">
            <p>&copy; 2025 Driver Spec Garage &nbsp;|&nbsp; 646-484-8689 &nbsp;|&nbsp; <a href="mailto:driverspecgarage@gmail.com">driverspecgarage@gmail.com</a></p>
        </div>
    </footer>

    <!--
        Load order matters:
        1. customers.js   — DSGCustomers operator picker
        2. customer-profile.js — CustomerProfile self-serve widget
        3. inline booking script
    -->
    <script src="customers.js"></script>
    <script src="customer-profile.js"></script>

    <script>
        // ========== SERVICE DATA ==========
        const services = {
            'wash-wax': {
                name: 'Wash & Wax',
                prices: { 'flushing-car': 60, 'flushing-suv': 70 },
                duration: 'About 45 minutes',
                desc: 'Quick exterior refresh. Pre-foam hand wash, protector wax, wheels and tires dressed, door jambs, gas cap, exhaust tips, windows inside and out.',
                flushingOnly: true
            },
            'maintenance': {
                name: 'Maintenance Detail',
                prices: { 'mobile-car': 140, 'mobile-suv': 160, 'flushing-car': 110, 'flushing-suv': 130 },
                duration: '1.5 to 2 hours',
                desc: 'Complete refresh. Ceramic sealant (~1 month), undercarriage wash, exhaust tips polished, engine bay detailed, full interior vacuum and wipe down.'
            },
            'full-detail': {
                name: 'Full Detail',
                prices: { 'mobile-car': 300, 'mobile-suv': 350, 'flushing-car': 250, 'flushing-suv': 300 },
                duration: '3 to 4 hours',
                desc: 'The complete reset. Iron, tar and clay bar decon, undercarriage wash, graphene ceramic sealant (3-4 months), deep interior with shampooing, leather conditioning, and steam sanitization.'
            },
            'winter-resurrection': {
                name: 'Winter Resurrection',
                prices: { 'mobile-car': 200, 'mobile-suv': 230, 'flushing-car': 160, 'flushing-suv': 190 },
                duration: '3 to 3.5 hours',
                desc: 'Acid wash to dissolve water spots and mineral deposits, iron decon, undercarriage acid foam and rinse, machine wax application, wheels and tires, door jambs and windows, basic interior.',
                addon: '+$100 full interior with steaming, shampoo and leather conditioning'
            },
            'interior-detail': {
                name: 'Interior Detail with Steaming',
                prices: { 'mobile-car': 200, 'mobile-suv': 230, 'flushing-car': 200, 'flushing-suv': 230 },
                duration: '2 to 2.5 hours',
                desc: 'Deep interior clean. High-temperature steam cleaning, deep vacuum, carpet and mat shampooing, leather deep clean and conditioning, stain and odor removal.',
                samePrice: true
            },
            'engine-bay': {
                name: 'Engine Bay Detail',
                prices: { 'mobile-car': 60, 'mobile-suv': 60, 'flushing-car': 60, 'flushing-suv': 60 },
                duration: '30 to 45 minutes',
                desc: 'Engine degreasing, component detailing, plastic and rubber dressing. Add to any service for $40.',
                samePrice: true
            },
            'paint-correction-1step': {
                name: 'Paint Correction (1-Step)',
                prices: { 'mobile-car': 400, 'mobile-suv': 400, 'flushing-car': 400, 'flushing-suv': 400 },
                duration: '4 to 5 hours',
                desc: 'Single-step machine polish. Removes ~70-80% of swirls, light scratches and paint defects.',
                samePrice: true
            },
            'paint-correction-2step': {
                name: 'Paint Correction (2-Step)',
                prices: { 'mobile-car': 600, 'mobile-suv': 600, 'flushing-car': 600, 'flushing-suv': 600 },
                duration: '6 to 8 hours',
                desc: 'Two-step correction. Compound stage for defect removal, then fine polish. Removes ~90% of defects.',
                samePrice: true
            },
            'ceramic-coating': {
                name: 'Ceramic Coating',
                prices: { 'mobile-car': 900, 'mobile-suv': 900, 'flushing-car': 900, 'flushing-suv': 900 },
                duration: '1 to 2 days',
                desc: 'Professional ceramic coating with paint correction included. Long-term protection (2-3+ years).',
                samePrice: true
            }
        };

        let selectedService  = '';
        let selectedVehicle  = 'car';
        let selectedLocation = 'mobile';
        let _pickedCustomer  = null; // set by DSGCustomers dropdown

        // ========== NEW CUSTOMER PANEL TOGGLE ==========
        function toggleNewCustomer() {
            const panel  = document.getElementById('nct-panel');
            const arrow  = document.getElementById('nct-arrow');
            const isOpen = panel.classList.contains('open');
            panel.classList.toggle('open', !isOpen);
            arrow.classList.toggle('open', !isOpen);
        }

        // ========== VEHICLE / LOCATION ==========
        function selectVehicle(size) {
            selectedVehicle = size;
            document.getElementById('btn-car').classList.toggle('selected', size === 'car');
            document.getElementById('btn-suv').classList.toggle('selected', size === 'suv');
            updateSummary();
        }

        function selectLocation(loc) {
            if (selectedService && services[selectedService].flushingOnly && loc === 'mobile') return;
            selectedLocation = loc;
            document.getElementById('btn-mobile').classList.toggle('selected', loc === 'mobile');
            document.getElementById('btn-flushing').classList.toggle('selected', loc === 'flushing');
            updateSummary();
        }

        function onServiceChange() {
            selectedService = document.getElementById('service-select').value;
            const svc            = services[selectedService];
            const mobileBtn      = document.getElementById('btn-mobile');
            const locationNotice = document.getElementById('location-notice');

            if (svc && svc.flushingOnly) {
                selectedLocation = 'flushing';
                mobileBtn.classList.remove('selected');
                mobileBtn.classList.add('disabled');
                document.getElementById('btn-flushing').classList.add('selected');
                locationNotice.classList.add('active');
            } else {
                mobileBtn.classList.remove('disabled');
                locationNotice.classList.remove('active');
            }
            updateSummary();
        }

        // ========== SUMMARY ==========
        function updateSummary() {
            const summary    = document.getElementById('summary');
            const btn        = document.getElementById('book-button');
            const hasService = selectedService !== '';

            document.getElementById('step1').className = hasService ? 'step done'   : 'step active';
            document.getElementById('step2').className = hasService ? 'step done'   : 'step';
            document.getElementById('step3').className = hasService ? 'step done'   : 'step';
            document.getElementById('step4').className = hasService ? 'step active' : 'step';

            if (!hasService) {
                summary.classList.remove('active');
                btn.disabled    = true;
                btn.textContent = 'Select a Service to Continue';
                return;
            }

            const svc      = services[selectedService];
            const priceKey = selectedLocation + '-' + selectedVehicle;
            const price    = svc.prices[priceKey];

            document.getElementById('summary-title').textContent    = svc.name;
            document.getElementById('summary-vehicle').textContent  = selectedVehicle === 'car' ? 'Car / Sedan / Coupe' : 'SUV / Van / Truck';
            document.getElementById('summary-location').textContent = selectedLocation === 'mobile' ? 'Mobile (we come to you)' : 'Flushing drop-off';
            document.getElementById('summary-duration').textContent = svc.duration;
            document.getElementById('summary-price').textContent    = '$' + price;

            // Priority: DSGCustomers picker > CustomerProfile saved info
            const custRow = document.getElementById('summary-customer-row');
            const carRow  = document.getElementById('summary-car-row');
            const custEl  = document.getElementById('summary-customer');
            const carEl   = document.getElementById('summary-car');

            if (_pickedCustomer && _pickedCustomer.name) {
                custEl.textContent    = _pickedCustomer.name;
                custRow.style.display = '';
                carEl.textContent     = _pickedCustomer.car || '';
                carRow.style.display  = _pickedCustomer.car ? '' : 'none';
            } else {
                const profile = (typeof CustomerProfile !== 'undefined') ? CustomerProfile.get() : null;
                if (profile && profile.firstName) {
                    custEl.textContent    = [profile.firstName, profile.lastName].filter(Boolean).join(' ');
                    custRow.style.display = '';
                } else {
                    custRow.style.display = 'none';
                }
                carEl.textContent    = (profile && profile.car) ? profile.car : '';
                carRow.style.display = (profile && profile.car) ? '' : 'none';
            }

            let descText = svc.desc;
            if (svc.addon) descText += '\n\nAdd-on: ' + svc.addon;
            document.getElementById('summary-desc').textContent = descText;

            summary.classList.add('active');
            btn.disabled    = false;
            btn.textContent = 'Book Now — $' + price;
        }

        // ========== CALENDLY ==========
        function openCalendly() {
            if (!selectedService) { alert('Please select a service first'); return; }

            const svc           = services[selectedService];
            const priceKey      = selectedLocation + '-' + selectedVehicle;
            const price         = svc.prices[priceKey];
            const vehicleType   = selectedVehicle === 'car' ? 'Car/Sedan/Coupe' : 'Van/SUV/Truck';
            const locationLabel = selectedLocation === 'mobile' ? 'Mobile' : 'Flushing';

            // Car suffix — picker first, then saved profile
            let carSuffix = '';
            if (_pickedCustomer && _pickedCustomer.car) {
                carSuffix = ` — ${_pickedCustomer.car}`;
            } else if (typeof CustomerProfile !== 'undefined') {
                const p = CustomerProfile.get();
                if (p && p.car) carSuffix = ` — ${p.car}`;
            }

            const fullServiceStr = `${svc.name} (${locationLabel}) — $${price} (${vehicleType})${carSuffix}`;
            const serviceCode    = `${selectedService}-${selectedLocation}-${selectedVehicle}`;

            const params = { a2: fullServiceStr, a3: vehicleType, a4: serviceCode };

            // Customer params — picker overrides saved profile
            if (_pickedCustomer) {
                Object.assign(params, DSGCustomers.getCalendlyParams());
            } else if (typeof CustomerProfile !== 'undefined') {
                Object.assign(params, CustomerProfile.getCalendlyParams());
            }

            // Always ensure +1 prefix
            if (!params.a1) {
                params.a1 = '+1';
            } else if (!params.a1.startsWith('+1')) {
                params.a1 = '+1' + params.a1.replace(/^\+?1?/, '');
            }

            window.open('https://calendly.com/andrekef?' + new URLSearchParams(params).toString(), '_blank');
        }

        // ========== URL AUTO-FILL ==========
        function autoFillFromURL() {
            const params = new URLSearchParams(window.location.search);

            const svc = params.get('service');
            if (svc && services[svc]) {
                document.getElementById('service-select').value = svc;
                selectedService = svc;
                if (services[svc].flushingOnly) {
                    selectedLocation = 'flushing';
                    document.getElementById('btn-mobile').classList.add('disabled');
                    document.getElementById('btn-mobile').classList.remove('selected');
                    document.getElementById('btn-flushing').classList.add('selected');
                    document.getElementById('location-notice').classList.add('active');
                }
            }

            const veh = params.get('vehicle');
            if (veh === 'car' || veh === 'suv') selectVehicle(veh);

            const loc = params.get('location');
            if (loc === 'mobile' || loc === 'flushing') {
                if (!selectedService || !services[selectedService]?.flushingOnly || loc === 'flushing') {
                    selectLocation(loc);
                }
            }

            if (svc) {
                updateSummary();
                setTimeout(() => {
                    const el = document.getElementById('summary');
                    if (el && window.innerWidth < 700) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 300);
            }
        }

        // ========== NAV ==========
        function toggleDropdown(event) {
            event.preventDefault();
            event.stopPropagation();
            var dd = document.getElementById('servicesDropdown');
            dd.style.display = (dd.style.display === 'block') ? 'none' : 'block';
        }
        document.addEventListener('click', function(e) {
            var nc = document.querySelector('.non-clickable');
            if (!nc || !nc.contains(e.target)) {
                document.getElementById('servicesDropdown').style.display = 'none';
            }
        });

        // ========== OPERATOR PICKER REVEAL ==========
        let _operatorPickerRevealed = false;
        function revealOperatorPicker() {
            if (_operatorPickerRevealed) return;
            _operatorPickerRevealed = true;
            const widget = document.getElementById('customer-picker-widget');
            widget.style.display = '';
            // Now render it — lazy load so public users never trigger the fetch
            DSGCustomers.render('customer-picker-widget', function(contact) {
                _pickedCustomer = contact;
                updateSummary();
            });
            // Hide the label after reveal so it looks clean
            document.getElementById('customer-area-label').style.opacity = '0.3';
        }

        // ========== INIT ==========
        window.addEventListener('DOMContentLoaded', () => {
            // Operator customer picker is lazy — only renders on double-click of label
            // Self-serve saved profile (hidden by default under "New customer?" toggle)
            if (typeof CustomerProfile !== 'undefined') {
                CustomerProfile.render('profile-widget');
            }

            autoFillFromURL();
        });
    </script>
</body>
</html>
