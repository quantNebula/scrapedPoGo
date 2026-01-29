# Events Data

## Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json`

## JSON Schema

The data structure is formally defined by the [JSON Schema](../schemas/events.schema.json).

You can validate data against this schema or use it to generate types for your application.

## Description

This endpoint provides comprehensive data about all Pokemon GO events, including Community Days, raids, research events, seasons, and more.

## Event Types

Events are categorized by type. Each type has its own filtered endpoint:

- **community-day** - [Documentation](eventTypes/CommunityDay.md)
- **event** - Generic events
- **go-battle-league** - [Documentation](eventTypes/GoBattleLeague.md)
- **go-pass** - [Documentation](eventTypes/GoPass.md)
- **max-battles** - [Documentation](eventTypes/MaxBattles.md)
- **max-mondays** - [Documentation](eventTypes/MaxMondays.md)
- **pokemon-go-tour** - [Documentation](eventTypes/PokemonGoTour.md)
- **pokemon-spotlight-hour** - [Documentation](eventTypes/PokemonSpotlightHour.md)
- **pokestop-showcase** - [Documentation](eventTypes/PokestopShowcase.md)
- **raid-battles** - [Documentation](eventTypes/RaidBattles.md)
- **raid-day** - [Documentation](eventTypes/RaidDay.md)
- **raid-hour** - [Documentation](eventTypes/RaidHour.md)
- **research** - [Documentation](eventTypes/Research.md)
- **research-day** - [Documentation](eventTypes/ResearchDay.md)
- **season** - [Documentation](eventTypes/Season.md)
- **team-go-rocket** - [Documentation](eventTypes/TeamGoRocket.md)

## Core Fields

All events share these core fields:

| Field | Type | Description |
|-------|------|-------------|
| **`eventID`** | `string` | Unique identifier for the event |
| **`name`** | `string` | Name of the event |
| **`eventType`** | `string` | Type of the event (see Event Types above) |
| **`heading`** | `string` | Display heading for the event |
| **`image`** | `string` | Event header/thumbnail image URL |
| **`start`** | `string` | Event start date/time (ISO 8601 format) |
| **`end`** | `string` | Event end date/time (ISO 8601 format) |

## Optional Fields

Depending on the event type, events may include:

### Content Flags

| Field | Type | Description |
|-------|------|-------------|
| **`flags`** | `object` | Content availability indicators |
| **`flags.hasSpawns`** | `boolean` | Event has special spawns |
| **`flags.hasFieldResearchTasks`** | `boolean` | Event has field research tasks |
| **`flags.hasBonuses`** | `boolean` | Event has bonuses |
| **`flags.hasRaids`** | `boolean` | Event has special raids |
| **`flags.hasEggs`** | `boolean` | Event has special eggs |
| **`flags.hasShiny`** | `boolean` | Event has shiny availability |

### Pokemon

| Field | Type | Description |
|-------|------|-------------|
| **`pokemon`** | `array` | Featured Pokemon in the event |
| **`pokemon[].name`** | `string` | Pokemon name |
| **`pokemon[].image`** | `string` | Pokemon image URL |
| **`pokemon[].source`** | `string` | Where the Pokemon appears (spawn, raid, egg, etc.) |
| **`pokemon[].canBeShiny`** | `boolean` | Whether the Pokemon can be shiny |

### Bonuses

| Field | Type | Description |
|-------|------|-------------|
| **`bonuses`** | `array` | Event bonuses (e.g., "2× XP", "2× Stardust") |

### Raids

| Field | Type | Description |
|-------|------|-------------|
| **`raids`** | `array` | Raid bosses featured in the event |
| **`raids[].name`** | `string` | Pokemon name |
| **`raids[].image`** | `string` | Pokemon image URL |
| **`raids[].tier`** | `string` | Raid tier |

### Other Fields

Events may also include:
- **`eggs`** - Egg hatches featured in the event
- **`research`** - Research tasks for the event
- **`shinies`** - Shiny Pokemon available
- **`leagues`** - GO Battle League information (for GBL events)

## Example Event

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
      "image": "https://example.com/chinchou.png",
      "source": "spawn"
    },
    {
      "name": "Kyogre",
      "image": "https://example.com/kyogre.png",
      "source": "featured"
    }
  ],
  "bonuses": [
    "2× Catch Stardust",
    "2× Catch XP"
  ]
}
```

## Per-Event-Type Endpoints

Each event type has its own filtered endpoint containing only events of that type:

- Formatted: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/<eventType>.json`
- Minimized: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/<eventType>.min.json`

Example: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/community-day.min.json`

## Date Format

All dates follow ISO 8601 format:
- Local time: `YYYY-MM-DDTHH:mm:ss.sss` (e.g., `2026-01-27T10:00:00.000`)
- UTC time: `YYYY-MM-DDTHH:mm:ss.sssZ` (e.g., `2026-01-27T21:00:00.000Z`)

Events with a `Z` suffix indicate global/UTC timing (e.g., GO Battle League). Events without `Z` use local time.
