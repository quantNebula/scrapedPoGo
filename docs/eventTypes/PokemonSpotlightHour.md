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
  "name": "Foongus",
  "eventType": "pokemon-spotlight-hour",
  "heading": "Pokemon Spotlight Hour",
  "image": "https://cdn.leekduck.com/assets/img/pokemon_icons/pokemon_icon_590_00.png",
  "start": "2026-01-27T18:00:00.000",
  "end": "2026-01-27T19:00:00.000",
  "flags": {
    "hasSpawns": false,
    "hasFieldResearchTasks": false,
    "hasBonuses": false,
    "hasRaids": false,
    "hasEggs": false,
    "hasShiny": false,
    "hasShowcases": false,
    "hasRocket": false,
    "hasBattle": false,
    "hasResearch": false,
    "hasRewards": false
  },
  "canBeShiny": true,
  "bonus": "2× Catch Stardust"
}
```

## Fields

All Spotlight Hour events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type      | Description
|---------------- |---------- |---------------------
| **`eventID`**   | `string`  | Unique identifier (typically includes date: YYYY-MM-DD)
| **`name`**      | `string`  | Name of the featured Pokémon (e.g., "Foongus")
| **`eventType`** | `string`  | Always `"pokemon-spotlight-hour"`
| **`heading`**   | `string`  | Always `"Pokemon Spotlight Hour"`
| **`image`**     | `string`  | Image URL of the featured Pokémon
| **`start`**     | `string`  | Event start time (ISO 8601 format, typically 18:00 local time)
| **`end`**       | `string`  | Event end time (ISO 8601 format, typically 19:00 local time)
| **`flags`**     | `object`  | Content availability flags (see [Flags Section](../Events.md#flags-section))
| **`canBeShiny`**| `boolean` | Whether the featured Pokémon can be shiny
| **`bonus`**     | `string`  | Active gameplay bonus for the hour (e.g., "2× Catch Stardust")

## Additional Sections

Spotlight Hour events have these additional top-level fields:

- **`canBeShiny`**: Whether the featured Pokémon can be encountered as shiny
- **`bonus`**: The gameplay bonus active during the event (e.g., "2× Catch Stardust", "2× Catch XP", "2× Catch Candy")



## Notes

- Spotlight Hour occurs weekly on Tuesdays at 6:00 PM local time
- Each event features one Pokémon with massively increased spawns
- Always includes one gameplay bonus (varies by week)
- Duration is always exactly 1 hour
