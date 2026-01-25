## Plan: Contextual Pokemon GO Data Aggregation File

Create a new `contextual.json` that cross-references all scraped data sources into player-focused contextual groupings, answering "What's available now, from where, and when does it end?"

### Steps

1. **Create new scraper module** at [src/scrapers/combineContextual.js](src/scrapers/combineContextual.js) that reads all 6 existing JSON files from [data/](data/) and generates the unified output.

2. **Implement timeline grouping** - Parse `events.json` start/end dates to categorize events into `endingSoon` (<24h), `active`, and `upcoming` (7 days) arrays with priority scoring.

3. **Build `currentAvailability` aggregator** - Merge `raids.json` by tier, `eggs.json` by distance (with event pool overrides from `events.json`), `research.json` encounters, and `rocketLineups.json` into a unified availability object.

4. **Generate `pokemonIndex` cross-reference** - Scan all sources to create a per-Pokemon lookup showing every source (raid tier, egg type, research task, rocket encounter), shiny eligibility per source, CP ranges, and event context.

5. **Add `shinyOpportunities` section** - Cross-reference `shinies.json` release dates with current availability sources to highlight new debuts, boosted rates (from event bonuses), and permanent shiny-eligible encounters.

6. **Output `contextual.json` + `contextual.min.json`** to [data/](data/) with metadata including generation timestamp and source file versions.

### Further Considerations

1. **Regeneration frequency?** Should this run on every scrape, or as a separate post-processing step via `npm run combinecontextual`? *Recommend: separate command, called after `combinedetails`*

2. **Event overlap handling?** When multiple events are active (e.g., "Precious Pals" + "Taken Over"), should Pokemon show all event contexts or just the most relevant? *Recommend: array of all active event IDs*

3. **Form normalization?** Pokemon like "Thundurus (Incarnate)" vs "Shadow Thundurus" - should these be separate index entries or merged with a `forms` array? *Recommend: separate entries with a `baseSpecies` field for grouping*
