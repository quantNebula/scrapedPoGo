## 2025-02-18 - Frontend DOM XSS
**Vulnerability:** DOM-based Cross-Site Scripting (XSS) in `web/app.js` and `web/metrics.js` due to unsafe use of `innerHTML` with data sourced from scraped JSON files. The application assumed scraped data was safe, but it could contain malicious scripts.
**Learning:** Even internal or scraped data must be treated as untrusted when rendering to the DOM. "Trusted" sources can be compromised or manipulated.
**Prevention:** Use `textContent` and `document.createElement` for DOM manipulation instead of `innerHTML`. When string concatenation for HTML is unavoidable, strictly use an `escapeHtml` function.
