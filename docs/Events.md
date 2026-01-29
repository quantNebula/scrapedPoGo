# Events Data

**URL**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json`

## JSON Schema

The data structure is formally defined by the [JSON Schema](../schemas/events.schema.json).

You can validate data against this schema or use it to generate types for your application.

## Overview

The Events endpoint provides comprehensive data about all Pokemon GO events, including Community Days, raid rotations, research events, GO Battle League seasons, Pokemon GO Tours, seasonal events, and more. Each event includes timing, featured Pokemon, bonuses, and type-specific content.

This data is sourced from LeekDuck's event calendar and includes both current and upcoming events sorted chronologically by start date.

## Update Frequency

This endpoint is updated as new events are announced on LeekDuck. The scraper runs through a multi-stage pipeline:

1. **Basic scrape** - Extracts event metadata (name, dates, image)
2. **Detailed scrape** - Extracts event-specific content (Pokemon, raids, bonuses, etc.)
3. **Combine details** - Merges detailed data with basic events and generates per-type files

To update manually, run:
```bash
npm run pipeline
```

Or run individual stages:
```bash
npm run scrape           # Stage 1: Basic event metadata
npm run detailedscrape   # Stage 2: Event details
npm run combinedetails   # Stage 3: Merge and generate per-type files
```

## Response Structure

The endpoint returns a JSON array of event objects sorted chronologically by start date:

```json
[
  {
    "eventID": "into-the-depths-2026",
    "name": "Into the Depths",
    "eventType": "event",
    "heading": "Event",
    "image": "https://cdn.leekduck.com/...",
    "start": "2026-01-27T10:00:00.000",
    "end": "2026-02-01T20:00:00.000",
    "pokemon": [...],
    "bonuses": [...],
    "raids": [...]
  },
  ...
]
```

## Core Fields

All events share these required core fields:

| Field | Type | Description |
|-------|------|-------------|
| **`eventID`** | `string` | Unique identifier for the event (URL slug from LeekDuck) |
| **`name`** | `string` | Display name of the event |
| **`eventType`** | `string` | Type of the event (see [Event Types](#event-types) below) |
| **`heading`** | `string` | Display heading/category for the event |
| **`image`** | `string` | Event header/banner image URL from LeekDuck CDN |
| **`start`** | `string` | Event start date/time in ISO 8601 format (see [Date Format](#date-format)) |
| **`end`** | `string` | Event end date/time in ISO 8601 format (see [Date Format](#date-format)) |

## Optional Fields

Depending on the event type and content, events may include any of the following optional fields:

### Pokemon

| Field | Type | Description |
|-------|------|-------------|
| **`pokemon`** | `array` | Featured Pokemon in the event (spawns, debuts, featured encounters) |
| **`pokemon[].name`** | `string` | Pokemon name |
| **`pokemon[].image`** | `string` | Pokemon image URL |
| **`pokemon[].source`** | `string` | Where the Pokemon appears.<br />Can be `spawn`, `featured`, `incense`, `costumed`, `debut`, `maxDebut` |
| **`pokemon[].canBeShiny`** | `boolean` | Whether the Pokemon can be encountered as shiny |
| **`pokemon[].imageWidth`** | `int` | Image width in pixels |
| **`pokemon[].imageHeight`** | `int` | Image height in pixels |
| **`pokemon[].imageType`** | `string` | Image format (e.g., `png`) |

### Bonuses

| Field | Type | Description |
|-------|------|-------------|
| **`bonuses`** | `array` | Event bonuses (string descriptions) |
| **`bonusDisclaimers`** | `array` | Disclaimers/restrictions for bonuses (e.g., regional, ticket-only) |
| **`lureModuleBonus`** | `string` | Lure module bonus description |
| **`exclusiveBonuses`** | `array` | Bonuses exclusive to ticketed players |

### Raids

| Field | Type | Description |
|-------|------|-------------|
| **`raids`** | `array` | Raid bosses featured in the event |
| **`raids[].name`** | `string` | Pokemon name |
| **`raids[].image`** | `string` | Pokemon image URL |
| **`raids[].tier`** | `string` | Raid tier.<br />Can be `1-Star`, `3-Star`, `5-Star`, `Mega` |
| **`raids[].imageWidth`** | `int` | Image width in pixels |
| **`raids[].imageHeight`** | `int` | Image height in pixels |
| **`raids[].imageType`** | `string` | Image format (e.g., `png`) |
| **`raidAlternation`** | `string` | Alternation pattern for rotating raid bosses |
| **`raidFeaturedAttacks`** | `array` | Featured moves available during the event |

### Research

| Field | Type | Description |
|-------|------|-------------|
| **`research`** | `object` | Research tasks available during the event |
| **`research.field`** | `array` | Field research tasks |
| **`research.special`** | `array` | Special research quest steps |
| **`research.timed`** | `array` | Timed research quest steps |
| **`research.masterwork`** | `array` | Masterwork research quest steps |
| **`research.breakthrough`** | `object` | Research Breakthrough encounter reward |

### Battle (GO Battle League)

| Field | Type | Description |
|-------|------|-------------|
| **`battle`** | `object` | GO Battle League information |
| **`battle.leagues`** | `array` | Active league configurations (see [Battle.League](#battleleague)) |
| **`battle.featuredAttack`** | `string` | Featured attack/move for the season |

### Rocket (Team GO Rocket)

| Field | Type | Description |
|-------|------|-------------|
| **`rocket`** | `object` | Team GO Rocket information |
| **`rocket.shadows`** | `array` | Shadow Pokemon available |
| **`rocket.leaders`** | `array` | Leader lineup information |
| **`rocket.giovanni`** | `object` | Giovanni encounter details |
| **`rocket.grunts`** | `array` | Grunt lineup information |

### Eggs

| Field | Type | Description |
|-------|------|-------------|
| **`eggs`** | `array\|object` | Egg pool changes.<br />For events: Array of Pokemon.<br />For seasons: Object with distance keys (`2km`, `5km`, `7km`, `10km`, `12km`) |

### Shinies

| Field | Type | Description |
|-------|------|-------------|
| **`shinies`** | `array` | Shiny Pokemon available during the event |
| **`shinyDebuts`** | `array` | Pokemon with shiny debuts during the event |

### Rewards & Tickets

| Field | Type | Description |
|-------|------|-------------|
| **`rewards`** | `object` | Ticketed content and rewards |
| **`rewards.ticketedResearch`** | `object` | Paid research ticket details |
| **`rewards.ticketBonuses`** | `array` | Bonuses for ticket holders |
| **`rewards.ticketPrice`** | `int` | Ticket price in USD |
| **`rewards.ticketAddOns`** | `array` | Additional purchasable content |

### Showcases

| Field | Type | Description |
|-------|------|-------------|
| **`showcases`** | `array` | PokéStop Showcase Pokemon |

### Photobomb

| Field | Type | Description |
|-------|------|-------------|
| **`photobomb`** | `object` | Photobomb feature details |
| **`photobomb.description`** | `string` | Description of photobomb mechanic |
| **`photobomb.pokemon`** | `array` | Pokemon that can photobomb |

### Season-Specific

| Field | Type | Description |
|-------|------|-------------|
| **`communityDays`** | `array` | Community Days scheduled during the season |
| **`features`** | `array` | Season feature descriptions |
| **`goBattleLeague`** | `object` | Seasonal GO Battle League information |

### GO Pass Specific

| Field | Type | Description |
|-------|------|-------------|
| **`goPass`** | `object` | GO Pass details |
| **`pricing`** | `object` | Pricing information |
| **`pointTasks`** | `array` | Tasks that award points |
| **`ranks`** | `array` | Rank tiers and rewards |
| **`featuredPokemon`** | `array` | Featured Pokemon for GO Pass |
| **`milestoneBonuses`** | `object` | Milestone reward information |

### GO Tour Specific

| Field | Type | Description |
|-------|------|-------------|
| **`eventInfo`** | `object` | Event venue and timing details |
| **`habitats`** | `array` | Rotating habitat information |
| **`whatsNew`** | `array` | New features for the tour |
| **`sales`** | `array` | In-game sales and offers |

### Max Battles

| Field | Type | Description |
|-------|------|-------------|
| **`maxBattles`** | `object` | Max Battle event details |
| **`maxMondays`** | `object` | Max Monday event details |

### Other

| Field | Type | Description |
|-------|------|-------------|
| **`description`** | `string` | Event description text |
| **`customSections`** | `object` | Additional scraped sections not matching standard fields |

## Other Objects

### Pokemon

Each Pokemon object in the `pokemon` array has the following structure:

```json
{
  "name": "Chinchou",
  "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm170.icon.png",
  "source": "spawn",
  "canBeShiny": true,
  "imageWidth": 78,
  "imageHeight": 87,
  "imageType": "png"
}
```

| Field | Type | Description |
|-------|------|-------------|
| **`name`** | `string` | Pokemon name |
| **`image`** | `string` | Pokemon image URL |
| **`source`** | `string` | Source type: `spawn`, `featured`, `incense`, `costumed`, `debut`, `maxDebut` |
| **`canBeShiny`** | `boolean` | Whether the Pokemon can be shiny |
| **`imageWidth`** | `int` | Image width in pixels |
| **`imageHeight`** | `int` | Image height in pixels |
| **`imageType`** | `string` | Image format (e.g., `png`) |

### Raid

Each raid object in the `raids` array has the following structure:

```json
{
  "name": "Tornadus",
  "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm641.icon.png",
  "tier": "5-Star",
  "imageWidth": 256,
  "imageHeight": 256,
  "imageType": "png"
}
```

| Field | Type | Description |
|-------|------|-------------|
| **`name`** | `string` | Pokemon name |
| **`image`** | `string` | Pokemon image URL |
| **`tier`** | `string` | Raid tier: `1-Star`, `3-Star`, `5-Star`, `Mega` |
| **`imageWidth`** | `int` | Image width in pixels |
| **`imageHeight`** | `int` | Image height in pixels |
| **`imageType`** | `string` | Image format (e.g., `png`) |

### Battle.League

Each league object in the `battle.leagues` array has the following structure:

```json
{
  "name": "Great League",
  "cpCap": 1500,
  "typeRestrictions": [],
  "rules": [
    "Only Pokémon with 1500 CP or less are eligible",
    "Battles are 3v3 format"
  ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| **`name`** | `string` | League name (e.g., "Great League", "Ultra League", "Love Cup") |
| **`cpCap`** | `int\|null` | Maximum CP allowed (1500, 2500, null for unlimited) |
| **`typeRestrictions`** | `array` | Required Pokemon types (empty for unrestricted) |
| **`rules`** | `array` | League-specific rules and restrictions |

## Event Types

Events are categorized by type. Each type has its own filtered endpoint and optional documentation:

| Event Type | Description | Documentation |
|------------|-------------|---------------|
| **`community-day`** | Monthly Community Day events | [Documentation](eventTypes/CommunityDay.md) |
| **`event`** | General/generic events | - |
| **`go-battle-league`** | GO Battle League seasons and rotations | [Documentation](eventTypes/GoBattleLeague.md) |
| **`go-pass`** | GO Pass subscription events | [Documentation](eventTypes/GoPass.md) |
| **`max-battles`** | Max Battle events (Dynamax battles) | [Documentation](eventTypes/MaxBattles.md) |
| **`max-mondays`** | Max Monday events | [Documentation](eventTypes/MaxMondays.md) |
| **`pokemon-go-tour`** | Pokemon GO Tour events | [Documentation](eventTypes/PokemonGoTour.md) |
| **`pokemon-spotlight-hour`** | Weekly Spotlight Hour events | [Documentation](eventTypes/PokemonSpotlightHour.md) |
| **`pokestop-showcase`** | PokéStop Showcase events | [Documentation](eventTypes/PokestopShowcase.md) |
| **`raid-battles`** | Raid rotation announcements | [Documentation](eventTypes/RaidBattles.md) |
| **`raid-day`** | Special Raid Day events | [Documentation](eventTypes/RaidDay.md) |
| **`raid-hour`** | Weekly Raid Hour events | [Documentation](eventTypes/RaidHour.md) |
| **`research`** | Research events and quests | [Documentation](eventTypes/Research.md) |
| **`research-day`** | Research Day events | [Documentation](eventTypes/ResearchDay.md) |
| **`season`** | Seasonal events (3-month periods) | [Documentation](eventTypes/Season.md) |
| **`team-go-rocket`** | Team GO Rocket takeover events | [Documentation](eventTypes/TeamGoRocket.md) |

## Per-Event-Type Endpoints

Each event type has its own filtered endpoint containing only events of that type:

- Minimized: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/<eventType>.min.json`

**Example**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/community-day.min.json`

**Available event type endpoints**:
- `community-day.min.json`
- `event.min.json`
- `go-battle-league.min.json`
- `go-pass.min.json`
- `max-battles.min.json`
- `max-mondays.min.json`
- `pokemon-go-tour.min.json`
- `pokemon-spotlight-hour.min.json`
- `pokestop-showcase.min.json`
- `raid-battles.min.json`
- `raid-day.min.json`
- `raid-hour.min.json`
- `research.min.json`
- `research-day.min.json`
- `season.min.json`
- `team-go-rocket.min.json`

## Date Format

All dates follow ISO 8601 format with millisecond precision:

- **Local time**: `YYYY-MM-DDTHH:mm:ss.sss` (e.g., `2026-01-27T10:00:00.000`)
- **UTC time**: `YYYY-MM-DDTHH:mm:ss.sssZ` (e.g., `2026-01-27T21:00:00.000Z`)

**Local time** (no `Z` suffix): Used for most events. These times apply in the player's local timezone (e.g., Community Day starts at 14:00 local time everywhere).

**UTC time** (with `Z` suffix): Used for globally synchronized events like GO Battle League seasons, which start at the same moment worldwide.

## Example Events

### Generic Event

```json
{
  "eventID": "into-the-depths-2026",
  "name": "Into the Depths",
  "eventType": "event",
  "heading": "Event",
  "image": "https://cdn.leekduck.com/assets/img/events/article-images/2026/2026-01-27-into-the-depths-2026/into-the-depths-2026.jpg",
  "start": "2026-01-27T10:00:00.000",
  "end": "2026-02-01T20:00:00.000",
  "pokemon": [
    {
      "name": "Chinchou",
      "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm170.icon.png",
      "source": "spawn",
      "canBeShiny": true,
      "imageWidth": 78,
      "imageHeight": 87,
      "imageType": "png"
    },
    {
      "name": "Lanturn",
      "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm171.icon.png",
      "source": "spawn",
      "canBeShiny": true,
      "imageWidth": 91,
      "imageHeight": 87,
      "imageType": "png"
    },
    {
      "name": "Kyogre",
      "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm382.icon.png",
      "source": "featured",
      "canBeShiny": true,
      "imageWidth": 150,
      "imageHeight": 112,
      "imageType": "png"
    }
  ],
  "bonuses": [
    "2× Catch Stardust",
    "2× Catch XP"
  ]
}
```

### Raid Battles Event

```json
{
  "eventID": "tornadus-incarnate-forme-in-5-star-raid-battles-january-2026",
  "name": "Tornadus (Incarnate Forme) in 5-star Raid Battles",
  "eventType": "raid-battles",
  "heading": "Raid Battles",
  "image": "https://cdn.leekduck.com/assets/img/events/events-default-img.jpg",
  "start": "2026-01-25T10:00:00.000",
  "end": "2026-02-04T10:00:00.000",
  "raids": [
    {
      "name": "Tornadus",
      "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm641.icon.png",
      "tier": "5-Star",
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png"
    },
    {
      "name": "Ampharos",
      "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm181.icon.png",
      "tier": "Mega",
      "imageWidth": 256,
      "imageHeight": 256,
      "imageType": "png"
    }
  ]
}
```

### GO Battle League Event

```json
{
  "eventID": "gbl-precious-paths_great-league_ultra-league_master-league-split-3",
  "name": "Great League, Ultra League, and Master League | Precious Paths",
  "eventType": "go-battle-league",
  "heading": "Go Battle League",
  "image": "https://cdn.leekduck.com/assets/img/events/go-battle-league-season-25-precious-paths.jpg",
  "start": "2026-01-27T21:00:00.000Z",
  "end": "2026-02-03T21:00:00.000Z",
  "battle": {
    "leagues": [
      {
        "name": "Great League",
        "cpCap": 1500,
        "typeRestrictions": [],
        "rules": [
          "Only Pokémon with 1500 CP or less are eligible"
        ]
      },
      {
        "name": "Ultra League",
        "cpCap": 2500,
        "typeRestrictions": [],
        "rules": [
          "Only Pokémon with 2500 CP or less are eligible"
        ]
      },
      {
        "name": "Master League",
        "cpCap": null,
        "typeRestrictions": [],
        "rules": [
          "No CP limit"
        ]
      }
    ]
  }
}
```

### Community Day Event

```json
{
  "eventID": "february-communityday2026",
  "name": "Vulpix Community Day",
  "eventType": "community-day",
  "heading": "Community Day",
  "image": "https://cdn.leekduck.com/assets/img/events/article-images/2026/2026-02-01-february-communityday2026/vulpix-community-day.jpg",
  "start": "2026-02-01T14:00:00.000",
  "end": "2026-02-01T17:00:00.000",
  "pokemon": [
    {
      "name": "Vulpix",
      "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm37.icon.png",
      "source": "spawn",
      "canBeShiny": true,
      "imageWidth": 76,
      "imageHeight": 85,
      "imageType": "png"
    }
  ],
  "bonuses": [
    "3× Catch XP",
    "2× Catch Candy",
    "2× chance for Candy XL from catching"
  ],
  "shinies": [
    {
      "name": "Vulpix",
      "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm37.icon.png",
      "canBeShiny": true
    }
  ]
}
```

## Example Usage

### Get all current and upcoming events

```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const now = new Date();
    const current = events.filter(e => 
      new Date(e.start) <= now && new Date(e.end) >= now
    );
    const upcoming = events.filter(e => 
      new Date(e.start) > now
    );
    
    console.log(`${current.length} current events`);
    console.log(`${upcoming.length} upcoming events`);
  });
```

### Find events by type

```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const communityDays = events.filter(e => 
      e.eventType === 'community-day'
    );
    
    communityDays.forEach(cd => {
      console.log(`${cd.name} - ${cd.start}`);
    });
  });
```

### Get events with specific Pokemon

```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const eventsWithPikachu = events.filter(e => 
      e.pokemon?.some(p => p.name === 'Pikachu')
    );
    
    console.log(`Found ${eventsWithPikachu.length} events featuring Pikachu`);
  });
```

### Get events with raids

```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const raidEvents = events.filter(e => 
      e.raids && e.raids.length > 0
    );
    
    raidEvents.forEach(event => {
      console.log(`${event.name}:`);
      event.raids.forEach(raid => {
        console.log(`  - ${raid.name} (${raid.tier})`);
      });
    });
  });
```

### Get events with bonuses

```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const bonusEvents = events.filter(e => 
      e.bonuses && e.bonuses.length > 0
    );
    
    bonusEvents.forEach(event => {
      console.log(`${event.name}:`);
      event.bonuses.forEach(bonus => {
        console.log(`  - ${bonus}`);
      });
    });
  });
```

### Filter by date range

```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json')
  .then(r => r.json())
  .then(events => {
    const startDate = new Date('2026-02-01');
    const endDate = new Date('2026-02-28');
    
    const februaryEvents = events.filter(e => {
      const eventStart = new Date(e.start);
      const eventEnd = new Date(e.end);
      return eventStart <= endDate && eventEnd >= startDate;
    });
    
    console.log(`${februaryEvents.length} events in February 2026`);
  });
```

### Use event type-specific endpoint

```javascript
// Get only Community Day events
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/community-day.min.json')
  .then(r => r.json())
  .then(communityDays => {
    const nextCD = communityDays.find(cd => 
      new Date(cd.start) > new Date()
    );
    
    if (nextCD) {
      console.log(`Next Community Day: ${nextCD.name}`);
      console.log(`Date: ${nextCD.start}`);
    }
  });
```

## Data Source

Events data is scraped from:
- **Primary source**: [LeekDuck Events Calendar](https://leekduck.com/events/)
- **Date/time feed**: [LeekDuck Events JSON Feed](https://leekduck.com/feeds/events.json)

The scraper extracts:
1. **Basic metadata** from the events page (name, image, type)
2. **Accurate dates** from the JSON feed (start/end times)
3. **Detailed content** from individual event pages (Pokemon, raids, bonuses, etc.)

## Integration with Other Endpoints

Event data is self-contained but can be cross-referenced with other endpoints:

- **[Raids](Raids.md)** - Full raid boss details including CP, types, weather boosts
- **[Eggs](Eggs.md)** - Complete egg pool with rarity and regional info
- **[Research](Research.md)** - Full field research task catalog
- **[Shinies](Shinies.md)** - Authoritative shiny availability data

Events provide context (when something is available), while other endpoints provide details (stats, mechanics, etc.).
