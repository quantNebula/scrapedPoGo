# scrapedPoGo

Web scraper for Pokémon GO event data from LeekDuck.com. Node.js project using JSDOM for HTML parsing, outputting validated JSON data files.

## Tech Stack

- **Runtime**: Node.js 18+ (see `.github/workflows/scraper.yaml`)
- **HTML Parsing**: JSDOM 27.4.0 for DOM extraction
- **Date Handling**: moment.js (latest)
- **Image Metadata**: image-size 2.0.2
- **Validation**: AJV 8.17.1 with ajv-formats for JSON Schema validation
- **CI/CD**: GitHub Actions (runs every 8 hours, see `.github/workflows/scraper.yaml`)

## Project Structure

- `src/scrapers/` - Main entry points for scraping workflows
  - `scrape.js` - Basic scraper (events, raids, research, eggs, rocket lineups)
  - `detailedscrape.js` - Detailed event scraper with type-specific dispatching
  - `combinedetails.js` - Merges temp details into events.json, generates per-eventType files
  - `scrapeShinies.js` - Shiny Pokemon availability scraper
  - `explore.js` - Development utility for page structure exploration
- `src/pages/` - Page-specific scrapers for basic data extraction
- `src/pages/detailed/` - Event-type-specific detailed scrapers (18 types: `communityday.js`, `raidbattles.js`, `season.js`, etc.)
- `src/utils/` - Shared utilities
  - `scraperUtils.js` - Core extraction functions, error handling, file operations
  - `shinyData.js` - Shiny Pokemon data processing helpers
  - `imageDimensions.js` - Image metadata fetching with caching
  - `logger.js` - Colorized CLI logging with emoji prefixes
- `data/` - Output directory for JSON files (both `.json` and `.min.json`)
- `data/temp/` - Temporary storage for detailed scraping (auto-cleaned)
- `docs/` - API documentation for each endpoint
- `schemas/` - JSON Schema definitions for validation

## Development Workflows

**Setup**: `npm install`

**Run Scrapers**:
- `npm run scrape` - Basic data (events, raids, research, eggs, rocket lineups) → `data/*.json`
- `npm run scrapeshinies` - Shiny Pokemon data → `data/shinies.json`
- `npm run detailedscrape` - Detailed event info → `data/temp/*.json`
- `npm run combinedetails` - Merge details into `data/events.json` + generate per-eventType files → `data/eventTypes/*.json`, deletes `data/temp/`
- `npm run pipeline` - Full workflow: `scrapeshinies` → `scrape` → `detailedscrape` → `combinedetails`

**Validation**: `npm run validate` - Validates all `data/*.min.json` files against `schemas/*.schema.json`

**Direct Execution**:
- `node src/scrapers/scrape.js` - Run basic scraper directly
- `node src/scrapers/detailedscrape.js` - Run detailed scraper directly
- `DEBUG=1 node src/scrapers/detailedscrape.js` - Show scraper fallback errors

## Architecture & Data Flow

### Basic Scraping Flow
1. `scrape.js` orchestrates parallel execution of page scrapers
2. Page scrapers (`src/pages/*.js`) fetch from LeekDuck.com using JSDOM
3. Each outputs both `.json` (formatted) and `.min.json` (minified) to `data/`

### Detailed Scraping Flow
1. `detailedscrape.js` loads `data/events.min.json` and CDN backup
2. For each event, dispatches by `eventType` to `src/pages/detailed/*` scrapers
3. Always runs `detailed/generic.js` for shared metadata extraction
4. Each scraper writes to `data/temp/{eventID}.json` via `writeTempFile()`
5. On error, falls back to CDN backup data via `handleScraperError()`

### Combining Flow
1. `combinedetails.js` reads `data/events.min.json` and all `data/temp/*.json` files
2. Merges detailed data into event objects (flattens structure, no nested `details` wrapper)
3. Generates per-eventType files in `data/eventTypes/` (e.g., `community-day.json`)
4. Outputs minified JSON only
5. Deletes `data/temp/` directory

## Coding Conventions

### Module System
- **CommonJS**: `const x = require('...')` and `module.exports = { ... }`
- Group imports at top: external deps first, then local utilities
- See `src/scrapers/scrape.js` (lines 8-14) for standard import pattern

### Code Style
- **Indentation**: 4 spaces (consistent across all files)
- **Braces**: Allman style in older files (opening brace on next line) - match existing file style
- **Semicolons**: Used in most files - follow file convention
- **Naming**: lowerCamelCase for functions/variables, kebab-case for event type identifiers
- **JSDoc**: Extensive documentation on modules, functions, typedefs - see `src/utils/scraperUtils.js` (lines 1-50)

### Error Handling
- Use `try/catch` around all network/DOM parsing operations
- **Detailed scrapers**: Use `handleScraperError(err, id, type, bkp, scraperKey)` for CDN fallback
  - Example: `src/pages/detailed/communityday.js` uses `handleScraperError(err, id, 'community-day', bkp, 'communityday')`
- **Logging**: Use `src/utils/logger.js` methods: `logger.start()`, `logger.info()`, `logger.success()`, `logger.warn()`, `logger.error()`
- **Debug mode**: Set `DEBUG=1` to surface scraper fallback errors in `handleScraperError()`

### Date Handling
- **Always use** `normalizeDate()`, `normalizeDatePair()`, `isGlobalEvent()` from `src/utils/scraperUtils.js`
- **Local events** (Community Day, Spotlight Hour): No "Z" suffix in ISO 8601
- **Global events** (GO Battle League, city tours): UTC "Z" suffix
- LeekDuck feed dates with timezone offsets are auto-converted to UTC

### Shiny Pokemon Data
- Shiny flags populate from `data/shinies.json` via `src/utils/shinyData.js`
- Image URL parsing extracts Pokedex numbers for shiny matching
- `canBeShiny` field added during Pokemon extraction

### Image Metadata
- Populated via `src/utils/imageDimensions.js` inside `extractPokemonList()`
- Pass `{ fetchDimensions: false }` to skip for performance
- Adds `imageWidth`, `imageHeight`, `imageType` to Pokemon objects

### Output Patterns
- Scrapers write both `.json` (pretty) and `.min.json` (minified)
- `combinedetails.js` and `scrapeShinies.js` write **minified only**
- Use `JSON.stringify()` with 2-space indent for formatted output
- See `src/scrapers/combinedetails.js` for output patterns

## Adding a New Event Type Scraper

1. **Create scraper file** in `src/pages/detailed/` (e.g., `neweventtype.js`)
2. **Export `get(url, id, bkp)` function** - see `src/pages/detailed/communityday.js` (lines 52-60) for signature
3. **Import utilities**: `const { writeTempFile, handleScraperError, extractPokemonList, ... } = require('../../utils/scraperUtils')`
4. **Extract data** using JSDOM: `const dom = await JSDOM.fromURL(url, {}); const doc = dom.window.document;`
5. **Use shared utilities** from `scraperUtils.js`: `extractPokemonList()`, `extractBonuses()`, `extractSection()`, etc.
6. **Write temp file**: `writeTempFile(id, 'new-event-type', data)`
7. **Handle errors**: `catch (err) { handleScraperError(err, id, 'new-event-type', bkp, 'neweventtype'); }`
8. **Update dispatcher** in `src/scrapers/detailedscrape.js`: Import scraper, add case to switch statement
9. **Update combiner** in `src/scrapers/combinedetails.js`: Add `'new-event-type'` to type mapping
10. **Update docs**: Add/modify `docs/Events.md` with new fields
11. **Update schema**: Modify `schemas/events.schema.json` if adding new fields
12. **Validate**: Run `npm run validate` to ensure schema compliance

## Key Patterns & Gotcas

✅ **Do**:
- Use `scraperUtils.js` functions for consistency - see `src/utils/scraperUtils.js` (lines 37-247)
- Keep `eventType` strings in sync between `detailedscrape.js` and `combinedetails.js`
- Update `docs/*.md` and `schemas/*.schema.json` when changing output fields
- Use `writeTempFile()` for detailed scrapers - auto-namespaces by event ID
- Pass full backup array to `handleScraperError()` - searches by `eventID` and `extraData`
- Use `logger` methods instead of raw `console.log()` - see `src/utils/logger.js`

❌ **Don't**:
- Write directly to `data/events.json` from detailed scrapers (use temp files)
- Forget to run `npm run validate` after changing schemas or output structure
- Introduce nested `details` objects in `combinedetails.js` (flatten all fields to top level)
- Use `var` in new code (prefer `const`/`let`)
- Throw unhandled errors in scraper loops (log and continue when possible)

💡 **Note**:
- CI runs `npm run pipeline` every 8 hours automatically
- CDN backup from jsdelivr provides fallback when scraping fails
- Temp files in `data/temp/` are auto-deleted by `combinedetails.js`
- `generic.js` runs for ALL events to extract shared metadata

⚠️ **Caution**:
- Image dimension fetching can be slow - use `{ fetchDimensions: false }` when not needed
- Event type dispatch in `detailedscrape.js` is case-sensitive
- Date handling differs for local vs global events - use helper functions

## Validation

**Schema validation**: `npm run validate` runs `scripts/validate-schemas.js`
- Uses AJV with formats support
- Validates `data/*.min.json` against `schemas/*.schema.json`
- Shows detailed error messages for schema violations
- See `scripts/validate-schemas.js` (lines 1-50) for validation logic

## Documentation

API contracts for each endpoint in `docs/`:
- `Events.md` - Event data with type-specific fields
- `Raids.md` - Raid boss data with CP ranges
- `Research.md` - Field research tasks and rewards
- `Eggs.md` - Egg hatch pools by distance
- `RocketLineups.md` - Team GO Rocket lineups
- `Shinies.md` - Shiny Pokemon availability
- `architecture-diagrams.md` - Mermaid system/flow diagrams

Schema definitions in `schemas/*.schema.json` for validation and type generation.

## Resources

### Shared Utilities (`src/utils/scraperUtils.js`)
- `writeTempFile(id, type, data, suffix)` - Write temp JSON for event details
- `handleScraperError(err, id, type, bkp, scraperKey)` - Error handling with CDN fallback
- `extractPokemonList(elem, options)` - Extract Pokemon from `.pkmn-list-flex` elements
- `getSectionHeaders(doc)` - Discover section headers on page
- `extractSection(elem)` - Extract paragraphs, lists, Pokemon, tables from section
- `extractBonuses(elem)` - Extract bonus items with icons and disclaimers
- `extractRaidInfo(doc)` - Extract raid bosses by tier
- `extractResearchTasks(elem)` - Extract research tasks and rewards
- `extractEggPools(doc)` - Extract egg hatches by distance tier
- `normalizeDate(dateStr)` - Normalize dates to ISO 8601
- `normalizeDatePair(start, end)` - Normalize date ranges
- `isGlobalEvent(start, end)` - Determine if event is global (UTC) or local
