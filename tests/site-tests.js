#!/usr/bin/env node
/**
 * Driver Spec Garage - Automated Site Tests
 * Run: node tests/site-tests.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
let passed = 0, failed = 0, warnings = 0;

const log = {
  pass: (msg) => { console.log(`\x1b[32m✓ ${msg}\x1b[0m`); passed++; },
  fail: (msg) => { console.log(`\x1b[31m✗ ${msg}\x1b[0m`); failed++; },
  warn: (msg) => { console.log(`\x1b[33m⚠ ${msg}\x1b[0m`); warnings++; },
  info: (msg) => console.log(`\x1b[36m${msg}\x1b[0m`)
};

// Core pages
const PAGES = [
  'index.html', 'contact.html', 'booking.html', 'gallery.html',
  'packages.html', 'shop.html', 'paint-correction.html',
  'ceramic-coating.html', 'interior-steaming.html'
];

const NAV_LINKS = ['gallery.html', 'shop.html', 'contact.html', 'packages.html'];
const SERVICE_LINKS = ['paint-correction.html', 'ceramic-coating.html', 'interior-steaming.html', 'packages.html'];

function readFile(file) {
  try { return fs.readFileSync(path.join(ROOT, file), 'utf8'); }
  catch { return null; }
}

// TEST: File existence
log.info('\n📁 FILE EXISTENCE');
PAGES.forEach(p => {
  fs.existsSync(path.join(ROOT, p)) ? log.pass(p) : log.fail(`Missing: ${p}`);
});
fs.existsSync(path.join(ROOT, 'styles.css')) ? log.pass('styles.css') : log.fail('Missing: styles.css');

// TEST: Navigation consistency
log.info('\n🔗 NAVIGATION CONSISTENCY');
PAGES.forEach(page => {
  const content = readFile(page);
  if (!content) return;
  
  NAV_LINKS.forEach(link => {
    content.includes(`href="${link}"`) ? log.pass(`${page} → ${link}`) : log.fail(`${page} missing nav link: ${link}`);
  });
});

// TEST: Services dropdown
log.info('\n📋 SERVICES DROPDOWN');
PAGES.forEach(page => {
  const content = readFile(page);
  if (!content) return;
  
  const hasDropdown = content.includes('class="dropdown"') || content.includes("class='dropdown'");
  hasDropdown ? log.pass(`${page} has dropdown`) : log.warn(`${page} missing dropdown`);
  
  SERVICE_LINKS.forEach(link => {
    if (content.includes(`href="${link}"`)) log.pass(`${page} → ${link}`);
  });
});

// TEST: Mobile viewport
log.info('\n📱 MOBILE VIEWPORT');
PAGES.forEach(page => {
  const content = readFile(page);
  if (!content) return;
  
  content.includes('viewport') && content.includes('width=device-width')
    ? log.pass(`${page} viewport meta`)
    : log.fail(`${page} missing viewport meta`);
});

// TEST: No YouTube references
log.info('\n🚫 YOUTUBE REMOVAL CHECK');
PAGES.forEach(page => {
  const content = readFile(page);
  if (!content) return;
  
  const hasYT = /youtube|youtu\.be/i.test(content);
  hasYT ? log.fail(`${page} has YouTube reference`) : log.pass(`${page} clean`);
});

// TEST: Contact info consistency
log.info('\n📞 CONTACT INFO');
const phone = '646-484-8689';
const email = 'driverspecgarage@gmail.com';
PAGES.forEach(page => {
  const content = readFile(page);
  if (!content) return;
  
  if (content.includes('<footer')) {
    content.includes(phone) ? log.pass(`${page} has phone`) : log.warn(`${page} missing phone in footer`);
    content.includes(email) || content.includes('mailto:') ? log.pass(`${page} has email`) : log.warn(`${page} missing email`);
  }
});

// TEST: Booking page services data
log.info('\n💰 BOOKING SERVICES');
const booking = readFile('booking.html');
if (booking) {
  const services = ['wash-wax', 'maintenance', 'full-detail', 'winter-resurrection', 'interior-detail', 'engine-bay', 'paint-correction', 'ceramic-coating'];
  services.forEach(s => {
    booking.includes(s) ? log.pass(`Service: ${s}`) : log.fail(`Missing service: ${s}`);
  });
}

// TEST: Accessibility basics
log.info('\n♿ ACCESSIBILITY');
PAGES.forEach(page => {
  const content = readFile(page);
  if (!content) return;
  
  content.includes('lang="en"') ? log.pass(`${page} lang attr`) : log.warn(`${page} missing lang`);
  /<title>.+<\/title>/.test(content) ? log.pass(`${page} has title`) : log.fail(`${page} missing title`);
});

// TEST: CTA buttons on key pages
log.info('\n🔘 CTA BUTTONS');
['index.html', 'packages.html', 'gallery.html'].forEach(page => {
  const content = readFile(page);
  if (!content) return;
  
  content.includes('booking.html') ? log.pass(`${page} has booking CTA`) : log.warn(`${page} missing booking CTA`);
});

// TEST: Image references exist
log.info('\n🖼️ IMAGE REFERENCES');
const index = readFile('index.html');
if (index) {
  const imgs = index.match(/src="([^"]+\.(jpg|jpeg|png|gif|JPG|PNG))"/g) || [];
  imgs.slice(0, 5).forEach(img => {
    const file = img.match(/src="([^"]+)"/)[1];
    fs.existsSync(path.join(ROOT, file)) ? log.pass(file) : log.warn(`Missing image: ${file}`);
  });
}

// SUMMARY
console.log('\n' + '='.repeat(40));
console.log(`\x1b[32mPassed: ${passed}\x1b[0m | \x1b[31mFailed: ${failed}\x1b[0m | \x1b[33mWarnings: ${warnings}\x1b[0m`);
process.exit(failed > 0 ? 1 : 0);
