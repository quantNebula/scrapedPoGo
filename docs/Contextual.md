# Endpoints

- Formatted: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/contextual.json`
- Minified: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/contextual.min.json`

# Overview

The `contextual.json` file is a unified, player-focused aggregation of all scraped data sources. It answers "What's available now, from where, and when does it end?"

# Schema Overview

```json
{
  "metadata": { ... },
  "timeline": { ... },
  "currentAvailability": { ... },
  "pokemonIndex": [ ... ],
  "shinyOpportunities": { ... }
}
```

# Fields

The contextual file contains five main sections:

| Field | Type | Description |
|-------|------|-------------|
| `metadata` | object | Generation timestamp and source versions |
| `timeline` | object | Events categorized by urgency |
| `currentAvailability` | object | Unified availability by source type |
| `pokemonIndex` | array | Cross-reference for all Pokemon sources |
| `shinyOpportunities` | object | Shiny availability with current sources |

## Metadata

Provides generation timestamp and source file versions for cache invalidation.

```json
{
  "generatedAt": "2026-01-25T00:13:32.250Z",
  "sourceVersions": {
    "events": "2026-01-25T00:02:25.080Z",
    "raids": "2026-01-25T00:02:01.349Z",
    "eggs": "2026-01-25T00:02:01.402Z",
    "research": "2026-01-25T00:02:01.322Z",
    "rocketLineups": "2026-01-25T00:02:01.211Z",
    "shinies": "2026-01-25T00:00:58.145Z"
  }
}
```

### Fields

| Field | Type | Description |
|-------|------|-------------|
| `generatedAt` | string (ISO 8601) | Timestamp when the data was generated |
| `sourceVersions` | object | Object containing timestamps of source files (events, raids, eggs, research, rocketLineups, shinies) |

## Timeline

Events categorized by urgency with priority scoring.

### Timeline Categories

| Category | Definition |
|----------|------------|
| `endingSoon` | Active events ending within 24 hours |
| `active` | Currently running events (>24h remaining) |
| `upcoming` | Events starting within 7 days |

### Event Entry Fields

| Field | Type | Description |
|-------|------|-------------|
| `eventID` | string | Unique identifier |
| `name` | string | Display name |
| `eventType` | string | Type (raid-day, community-day, event, etc.) |
| `start` | string (ISO 8601) | Event start timestamp |
| `end` | string (ISO 8601) | Event end timestamp |
| `priority` | number | Calculated score (higher = more important) |
| `endsIn` | string | Human-readable duration until event ends |
| `startsIn` | string | Human-readable duration until event starts |
| `hasShiny` | boolean | Event has shiny opportunities |
| `hasRaids` | boolean | Event has raid-related content |
| `hasEggs` | boolean | Event has egg-related content |
| `hasBonuses` | boolean | Event has bonuses |
| `hasSpawns` | boolean | Event has special spawns |
| `hasFieldResearchTasks` | boolean | Event has field research tasks |

### Priority Scoring

Priority scores are calculated based on event type and features:
- Community Day: 100
- GO Tour/Fest: 95
- Raid Day: 90
- Raid Hour: 85
- Spotlight Hour: 80
- Team GO Rocket: 75
- Generic Event: 70
- Raid Battles: 60
- Season: 50
- +15 bonus for shiny opportunities
- +10 bonus for active bonuses
- +25 urgency bonus for events ending <24h

## Current Availability

Unified availability object organized by source type.

### Raids (`currentAvailability.raids`)

Grouped by tier:
- `mega` - Mega Raids
- `5-star` - Legendary Raids
- `3-star` - Tier 3 Raids
- `1-star` - Tier 1 Raids
- `shadow` - Shadow Raids

Each raid includes:
- `name`, `originalName`, `form`
- `image`
- `canBeShiny`
- `isShadowRaid`
- `types` - Array of type objects with name/image
- `combatPower` - Normal and boosted CP ranges
- `boostedWeather` - Weather conditions
- `activeEventIDs` - Related active events

### Eggs (`currentAvailability.eggs`)

Grouped by distance:
- `2km`, `5km`, `7km`, `10km`, `12km`
- `adventureSync5km`, `adventureSync10km`

Each egg entry includes:
- `name`, `image`
- `canBeShiny`
- `combatPower`
- `rarity` - 1-5 scale
- `isRegional`, `isGiftExchange`
- `eventOverride` - Active event IDs affecting egg pools

### Research (`currentAvailability.research`)

Contains:
- `encounters` - Deduplicated Pokemon encounters with all source tasks
- `itemRewards` - Notable item rewards (limited to 50)

Encounter format:
```json
{
  "pokemon": "Fidough",
  "image": "...",
  "canBeShiny": true,
  "combatPower": { "min": 389, "max": 422 },
  "tasks": [
    { "text": "Earn a Candy exploring with your buddy", "type": "buddy" }
  ]
}
```

### Rocket (`currentAvailability.rocket`)

Contains:
- `leaders` - Giovanni, Cliff, Arlo, Sierra
- `grunts` - Type-themed grunts

Each entry includes:
- `name`, `title`, `type`
- `catchablePokemon` - Array of encounterable Pokemon
- `lineup` - First/second/third slot Pokemon names

## Pokemon Index

Cross-reference array showing every source for each Pokemon.

```json
{
  "name": "Alolan Diglett",
  "sources": [
    { "type": "egg", "eggType": "7 km", "canBeShiny": true, "rarity": 1 },
    { "type": "research", "task": "Make 5 Nice Throws", "canBeShiny": true }
  ],
  "shinyEligible": true,
  "cpRange": { "min": 264, "max": 389 },
  "shinyData": {
    "releasedDate": "2019/06/28",
    "dexNumber": 50,
    "family": "Diglett_61"
  },
  "baseSpecies": "Diglett",
  "activeEventIDs": ["precious-pals-2026"]
}
```

### Source Types
- `raid` - Include tier, isShadow
- `egg` - Include eggType, isAdventureSync, rarity
- `research` - Include task text and taskType
- `rocket` - Include leader name, isShadow flag

### Form Handling
Pokemon with forms (Shadow, Mega, Alolan, Galarian, Hisuian, Paldean, or parenthetical forms like "Incarnate") have:
- Separate index entries
- `baseSpecies` field linking to the base Pokemon

## Shiny Opportunities

Cross-references shiny availability with current sources.

### Shiny Categories

| Category | Definition |
|----------|------------|
| `recentDebuts` | Shinies released within the last 30 days |
| `boostedRates` | Shinies with boosted rates from active events |
| `permanentlyAvailable` | Standard shiny-eligible Pokemon (limited to 100) |

```json
{
  "name": "Fidough",
  "dexNumber": 926,
  "releasedDate": "2026/01/20",
  "imageUrl": "...",
  "family": "Fidough",
  "debutType": "recent"
}
```

### Shiny Entry Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Pokemon name |
| `dexNumber` | number | National Pokedex number |
| `releasedDate` | string | Date when shiny was released (YYYY/MM/DD) |
| `imageUrl` | string | Image URL |
| `family` | string | Evolution family |
| `debutType` | string | Type of debut (recent, boosted, etc.) |
| `boostSource` | array | (Optional) Array of event IDs providing boost |

# Generation

The contextual data is regenerated on every scrape run, after `combinedetails` completes.

```bash
npm run combinecontextual
```

# Use Cases

1. **"What raids are available right now?"** → `currentAvailability.raids`
2. **"What's ending soon?"** → `timeline.endingSoon`
3. **"Where can I find Thundurus?"** → Search `pokemonIndex` by name
4. **"What new shinies were just released?"** → `shinyOpportunities.recentDebuts`
5. **"Which Pokemon have boosted shiny rates?"** → `shinyOpportunities.boostedRates`
6. **"What events are active?"** → Combine `timeline.endingSoon` + `timeline.active`
