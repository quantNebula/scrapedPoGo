# Copilot instructions for scrapedPoGo

## Architecture & data flow
- **Entry points** live in `src/scrapers/`: `scrape.js` (basic data), `detailedscrape.js` (event details), `combinedetails.js` (merge temp into events), `scrapeShinies.js` (shiny list).
- **Basic scraping** calls page modules in `src/pages/` (`events.js`, `raids.js`, `research.js`, `eggs.js`, `rocketLineups.js`, `shinies.js`) and writes JSON into `data/`.
- **Detailed scraping** loads `data/events.min.json`, fetches CDN backup, then dispatches by `eventType` to `src/pages/detailed/*` and always runs `detailed/generic.js` for shared flags.
- **Temp detail output** is written to `data/temp/*.json` via `utils/scraperUtils.writeTempFile()` and merged by `combinedetails.js`, which also deletes `data/temp`.

## Project conventions
- **Detailed scrapers** export `get(url, id, bkp)` and use `writeTempFile()` + `handleScraperError()` from `src/utils/scraperUtils.js` for fallback to CDN backup (`extraData`).
- **Event type strings** in `detailedscrape.js` and `combinedetails.js` must stay in sync when adding a new detailed scraper.
- **Outputs** write minified JSON only to `data/` (see `scrapeShinies.js`, `combinedetails.js`).
- **Shiny flags** come from `data/shinies.json` (see `src/utils/shinyData.js`); image URL parsing is used to infer dex numbers.
- **Image metadata** (width/height/type) is populated via `utils/imageDimensions` inside `extractPokemonList()`; pass `{ fetchDimensions: false }` to skip.
- **Debugging**: set `DEBUG=1` to surface scraper fallback errors in `handleScraperError()`.
- **Date handling**: Use `normalizeDate()`, `normalizeDatePair()`, and `isGlobalEvent()` from `scraperUtils.js`. Local events have no "Z" suffix; global events (GBL, city tours) have UTC "Z" suffix. LeekDuck feed dates with timezone offsets are auto-converted to UTC.

## Workflows & commands
- `npm run scrape` → basic data in `data/*.json`.
- `npm run detailedscrape` → temp detail files in `data/temp/`.
- `npm run combinedetails` → merge details into `data/events.json` and delete `data/temp/`.
- `npm run scrapeshinies` → refresh `data/shinies.json`.
- `npm run pipeline` → full end-to-end refresh.

## Docs & contracts
- Public JSON shapes are documented in `docs/*.md`; update these when changing output fields.
- Source HTML is from LeekDuck; use JSDOM-based extraction patterns in `src/utils/scraperUtils.js` for consistency.
