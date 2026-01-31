const { JSDOM } = require('jsdom');
const assert = require('assert');

console.log('Running XSS reproduction test...');

const dom = new JSDOM(`
  <div id="detailTitle"></div>
  <div id="detailBody"></div>
`);
const document = dom.window.document;
const elements = {
    detailTitle: document.getElementById('detailTitle'),
    detailBody: document.getElementById('detailBody')
};

function formatValue(value) {
  if (Array.isArray(value)) return `${value.length} items`;
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return "Object";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return String(value);
}

// Vulnerable function logic from web/app.js (simulated)
function renderDetailsVulnerable(record) {
    elements.detailBody.innerHTML = "";
    const entries = Object.entries(record || {});
    entries.forEach(([key, value]) => {
        const row = document.createElement("div");
        row.className = "detail__row";
        // VULNERABLE
        row.innerHTML = `<span>${key}</span><div>${formatValue(value)}</div>`;
        elements.detailBody.appendChild(row);
    });
}

// Fixed function logic
function renderDetailsFixed(record) {
    elements.detailBody.innerHTML = "";
    const entries = Object.entries(record || {});
    entries.forEach(([key, value]) => {
        const row = document.createElement("div");
        row.className = "detail__row";

        const label = document.createElement('span');
        label.textContent = key;

        const content = document.createElement('div');
        content.textContent = formatValue(value);

        row.appendChild(label);
        row.appendChild(content);
        elements.detailBody.appendChild(row);
    });
}

// Test Payload
const maliciousRecord = {
    description: '<img src=x onerror=alert(1)>'
};

try {
    // 1. Verify Vulnerability
    console.log('Testing vulnerable implementation...');
    renderDetailsVulnerable(maliciousRecord);
    const injectedImg = elements.detailBody.querySelector('img');
    assert.ok(injectedImg, 'Vulnerability verification failed: Image tag should be injected');
    assert.strictEqual(injectedImg.getAttribute('onerror'), 'alert(1)', 'Vulnerability verification failed: Onerror attribute should be present');
    console.log('✓ Vulnerability confirmed: HTML injection possible');

    // 2. Verify Fix
    console.log('Testing fixed implementation...');
    renderDetailsFixed(maliciousRecord);
    const fixedImg = elements.detailBody.querySelector('img');
    assert.strictEqual(fixedImg, null, 'Fix failed: Image tag should NOT be injected');
    const textContent = elements.detailBody.textContent;
    assert.ok(textContent.includes('<img'), 'Fix verification: Should render as text');
    console.log('✓ Fix confirmed: HTML injection prevented');

} catch (err) {
    console.error('Test Failed:', err.message);
    process.exit(1);
}
