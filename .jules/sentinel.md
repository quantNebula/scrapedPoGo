## 2025-02-18 - [Secure Network Requests]
**Vulnerability:** Unbounded HTTP requests (no timeouts) in scrapers causing potential availability issues (hanging processes).
**Learning:** Default Node.js `https.get` and `JSDOM.fromURL` do not have timeouts by default, making the scraper vulnerable to tarpits or unresponsive servers.
**Prevention:** Implemented `fetchUrl`, `fetchJson`, and `getJSDOM` utilities in `src/utils/scraperUtils.js` that enforce a default 30s timeout via `AbortController` and set a consistent User-Agent. New and updated scrapers should use these utilities instead of raw network calls; legacy scrapers will be migrated over time.
