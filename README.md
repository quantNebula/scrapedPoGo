# ScrapedDuck

A comprehensive web scraper for Pokémon GO event data from [LeekDuck.com](https://leekduck.com).

## Table of Contents

- [Quick Start](#quick-start)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Scrapers](#scrapers)
- [Development](#development)
- [License](#license)

---

## Quick Start

### Installation

```bash
npm install
```

### Running Scrapers

```bash
# Scrape all basic data (events, raids, research, eggs, rocket lineups)
npm run scrape

# Scrape shiny Pokemon data
npm run scrapeshinies

# Scrape detailed event information
npm run detailedscrape

# Combine detailed data with basic events
npm run combinedetails
```

### Complete Workflow

For the most comprehensive event data:

```bash
npm run scrape              # Get basic event data
npm run detailedscrape      # Get detailed event info
npm run combinedetails      # Merge detailed info into events
```

### Output

All scraped data is saved to the `data/` directory as JSON files:
- `.json` - Formatted for readability
- `.min.json` - Minified for production use

---

## API Endpoints

### Events
- Formatted: [`GET /data/events.json`](https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/events.json)
- Minimized: [`GET /data/events.min.json`](https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/events.min.json)
- [Documentation](docs/Events.md)

### Raids
- Formatted: [`GET /data/raids.json`](https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/raids.json)
- Minimized: [`GET /data/raids.min.json`](https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/raids.min.json)
- [Documentation](docs/Raids.md)

### Research
- Formatted: [`GET /data/research.json`](https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/research.json)
- Minimized: [`GET /data/research.min.json`](https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/research.min.json)
- [Documentation](docs/Research.md)

### Eggs
- Formatted: [`GET /data/eggs.json`](https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/eggs.json)
- Minimized: [`GET /data/eggs.min.json`](https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/eggs.min.json)
- [Documentation](docs/Eggs.md)

### Rocket Lineups
- Formatted: [`GET /data/rocketLineups.json`](https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/rocketLineups.json)
- Minimized: [`GET /data/rocketLineups.min.json`](https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/rocketLineups.min.json)
- [Documentation](docs/RocketLineups.md)

### Shinies
- Formatted: [`GET /data/shinies.json`](https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/shinies.json)
- Minimized: [`GET /data/shinies.min.json`](https://raw.githubusercontent.com/bigfoott/ScrapedDuck/data/shinies.min.json)
- [Documentation](docs/Shinies.md)

---

## Project Structure

```
ScrapedDuck/
├── src/                    # Source code
│   ├── scrapers/           # Main scraper scripts
│   ├── pages/              # Page-specific scraper modules
│   │   └── detailed/       # Detailed event scrapers
│   └── utils/              # Utility functions
├── data/                   # Output data files (JSON)
├── docs/                   # API and data structure documentation
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

### Source Code (`src/`)

#### Main Scrapers (`src/scrapers/`)

| File | Description |
|------|-------------|
| `scrape.js` | Primary scraper for basic data (events, raids, research, eggs, rocket lineups) |
| `detailedscrape.js` | Scraper for detailed event information |
| `combinedetails.js` | Combines detailed data with basic event data |
| `scrapeShinies.js` | Scrapes shiny Pokemon availability data |
| `explore.js` | Utility for exploring page structure (development/debugging) |

#### Page Scrapers (`src/pages/`)

| File | Description |
|------|-------------|
| `events.js` | Scrapes event information from LeekDuck |
| `raids.js` | Scrapes raid boss data |
| `research.js` | Scrapes field research tasks and rewards |
| `eggs.js` | Scrapes egg hatch pool data |
| `rocketLineups.js` | Scrapes Team GO Rocket lineup data |
| `shinies.js` | Scrapes shiny Pokemon availability |

#### Detailed Event Scrapers (`src/pages/detailed/`)

All detailed scrapers use shared utilities from `scraperUtils.js` for consistent extraction and error handling.

**Core Event Types:**

| File | Event Type | Data Extracted |
|------|------------|----------------|
| `generic.js` | All events | Available sections detection |
| `event.js` | Generic events | Bonuses, spawns, custom sections |
| `communityday.js` | Community Day | Spawns, bonuses, featured attacks, photobombs, showcases, research |
| `spotlight.js` | Spotlight Hour | Featured Pokemon, bonus |
| `breakthrough.js` | Research Breakthrough | Reward Pokemon |

**Raid Event Types:**

| File | Event Type | Data Extracted |
|------|------------|----------------|
| `raidbattles.js` | Raid Battles | Bosses by tier, alternation patterns, featured attacks |
| `raidday.js` | Raid Day | Alternating bosses, ticket bonuses, special mechanics |
| `raidhour.js` | Raid Hour | Single featured boss |

**Research Event Types:**

| File | Event Type | Data Extracted |
|------|------------|----------------|
| `research.js` | Special/Masterwork Research | Tasks, promo codes, pricing, expiration |
| `timedresearch.js` | Timed Research | Tasks, rewards, availability window |

**Seasonal & Large Events:**

| File | Event Type | Data Extracted |
|------|------------|----------------|
| `season.js` | Seasons | Bonuses, eggs by tier, debuts, GO Pass |
| `gotour.js` | GO Tour | Habitats, raids, eggs, research, shiny debuts |

**Battle & Competitive:**

| File | Event Type | Data Extracted |
|------|------------|----------------|
| `gobattleleague.js` | GO Battle League | Leagues, CP caps, type restrictions |
| `teamgorocket.js` | Team GO Rocket | Leaders, Giovanni, shadow Pokemon |

**Max/Dynamax Events:**

| File | Event Type | Data Extracted |
|------|------------|----------------|
| `maxbattles.js` | Max Battles | Dynamax/Gigantamax Pokemon |
| `maxmondays.js` | Max Mondays | Weekly featured Dynamax |

**Other Event Types:**

| File | Event Type | Data Extracted |
|------|------------|----------------|
| `gopass.js` | GO Pass | Point tasks, rewards, milestone bonuses |
| `pokestopshowcase.js` | PokéStop Showcases | Featured Pokemon |

#### Utilities (`src/utils/`)

| File | Description |
|------|-------------|
| `shinyData.js` | Helper functions for shiny Pokemon data processing |
| `scraperUtils.js` | Shared scraper utilities (see below) |

**`scraperUtils.js` Functions:**

| Function | Description |
|----------|-------------|
| `writeTempFile()` | Write temporary JSON files for scraped data |
| `handleScraperError()` | Centralized error handling with backup fallback |
| `extractPokemonList()` | Extract Pokemon from `.pkmn-list-flex` elements |
| `getSectionHeaders()` | Discover all section headers on a page |
| `extractSection()` | Extract content (paragraphs, lists, pokemon) from a section |
| `extractBonuses()` | Extract bonus items and disclaimers |
| `extractRaidInfo()` | Extract raid boss information by tier |
| `extractResearchTasks()` | Extract special/timed/field research tasks |
| `extractEggPools()` | Extract egg hatches organized by distance tier |
| `extractPrice()` | Extract price information from text |
| `extractPromoCodes()` | Extract promo codes from page links |

---

## Scrapers

### Basic Scraping

```bash
npm run scrape
```

Generates basic data for all endpoints (events, raids, research, eggs, rocket lineups).

### Detailed Event Scraping

```bash
npm run detailedscrape
npm run combinedetails
```

Scrapes additional event-specific data and merges it into the events data. This includes:
- Featured attacks and move stats
- Photobomb Pokemon
- PokéStop Showcases
- Ticket pricing
- Promo codes
- Research task details
- Habitat spawns (GO Tour)
- And much more...

### Shiny Pokemon Data

```bash
npm run scrapeshinies
```

Generates shiny availability data used to augment `canBeShiny` fields in other endpoints.

---

## Development

### Technical Notes

- All scrapers use [JSDOM](https://github.com/jsdom/jsdom) for HTML parsing
- Data is fetched from LeekDuck.com with permission
- Temporary files during detailed scraping are stored in `data/temp/` and cleaned up automatically
- The project uses [moment.js](https://momentjs.com/) for date/time handling

### Adding a New Event Type Scraper

1. Create a new file in `src/pages/detailed/`
2. Import utilities from `../../utils/scraperUtils`
3. Export an async `get(url, id, bkp)` function
4. Use `writeTempFile()` to save data and `handleScraperError()` for error handling

Example:

```javascript
const { JSDOM } = require('jsdom');
const { writeTempFile, handleScraperError, extractPokemonList } = require('../../utils/scraperUtils');

async function get(url, id, bkp) {
    try {
        const dom = await JSDOM.fromURL(url, {});
        const doc = dom.window.document;
        
        const data = {
            featured: await extractPokemonList(doc.querySelector('.pkmn-list-flex'))
        };
        
        if (data.featured.length > 0) {
            writeTempFile(id, 'my-event-type', data);
        }
    } catch (err) {
        handleScraperError(err, id, 'my-event-type', bkp, 'myeventtype');
    }
}

module.exports = { get };
```

### NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run scrape` | Run basic scraper (all data types) |
| `npm run scrapeshinies` | Run shiny Pokemon scraper |
| `npm run detailedscrape` | Scrape detailed event information |
| `npm run combinedetails` | Combine detailed data with basic events |

---

## Documentation

Detailed API documentation for each endpoint:

- [Events](docs/Events.md) - Event data with type-specific fields
- [Raids](docs/Raids.md) - Raid boss data with CP ranges
- [Research](docs/Research.md) - Field research tasks and rewards
- [Eggs](docs/Eggs.md) - Egg hatch pools by distance
- [Rocket Lineups](docs/RocketLineups.md) - Team GO Rocket lineups
- [Shinies](docs/Shinies.md) - Shiny Pokemon availability

---

## License

MIT
