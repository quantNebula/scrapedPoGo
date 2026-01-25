# Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/pokemon-spotlight-hour.min.json`

## Description

This file contains all Pokémon Spotlight Hour events. These are weekly one-hour events featuring increased spawns of a specific Pokémon along with a gameplay bonus.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"pokemon-spotlight-hour"`:

```json
[
  {
    "eventID": "pokemonspotlighthour2026-01-27",
    "name": "Foongus Spotlight Hour",
    "eventType": "pokemon-spotlight-hour",
    "heading": "Pokemon Spotlight Hour",
    ...
  },
  {
    "eventID": "pokemonspotlighthour2026-02-03",
    "name": "Whismur Spotlight Hour",
    "eventType": "pokemon-spotlight-hour",
    "heading": "Pokemon Spotlight Hour",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "pokemonspotlighthour2026-01-27",
  "name": "Foongus Spotlight Hour",
  "eventType": "pokemon-spotlight-hour",
  "heading": "Pokemon Spotlight Hour",
  "image": "https://cdn.leekduck.com/assets/img/events/pokemonspotlighthour.jpg",
  "start": "2026-01-27T18:00:00.000",
  "end": "2026-01-27T19:00:00.000",
  "flags": {
    "hasSpawns": false,
    "hasFieldResearchTasks": false,
    "hasBonuses": false,
    "hasRaids": false,
    "hasEggs": false,
    "hasShiny": false
  }
}
```

## Fields

All Spotlight Hour events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier (typically includes date: YYYY-MM-DD)
| **`name`**      | `string` | Name including featured Pokémon (e.g., "Foongus Spotlight Hour")
| **`eventType`** | `string` | Always `"pokemon-spotlight-hour"`
| **`heading`**   | `string` | Always `"Pokemon Spotlight Hour"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start time (ISO 8601 format, typically 18:00 local time)
| **`end`**       | `string` | Event end time (ISO 8601 format, typically 19:00 local time)
| **`flags`**     | `object` | Content availability flags (see [Flags Section](../Events.md#flags-section))

## Additional Sections

Spotlight Hour events may include:

- **`pokemon`**: Featured Pokémon with shiny availability
- **`bonuses`**: Active bonus (2x Catch XP, 2x Stardust, etc.)



## Notes

- Spotlight Hour occurs weekly on Tuesdays at 6:00 PM local time
- Each event features one Pokémon with massively increased spawns
- Always includes one gameplay bonus (varies by week)
- Duration is always exactly 1 hour
