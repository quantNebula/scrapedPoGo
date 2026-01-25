# Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/pokemon-go-tour.min.json`

## Description

This file contains all Pokémon GO Tour events. These are major annual events featuring a specific region or theme, typically requiring tickets for full access.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"pokemon-go-tour"`:

```json
[
  {
    "eventID": "pokemon-go-tour-example",
    "name": "Pokémon GO Tour: Region",
    "eventType": "pokemon-go-tour",
    "heading": "Pokémon GO Tour",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "pokemon-go-tour-johto-2026",
  "name": "Pokémon GO Tour: Johto",
  "eventType": "pokemon-go-tour",
  "heading": "Pokémon GO Tour",
  "image": "https://cdn.leekduck.com/assets/img/events/go-tour-johto-2026.jpg",
  "start": "2026-02-21T09:00:00.000",
  "end": "2026-02-21T21:00:00.000",
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

All Pokémon GO Tour events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the GO Tour event
| **`name`**      | `string` | Name of the GO Tour (typically includes region/theme)
| **`eventType`** | `string` | Always `"pokemon-go-tour"`
| **`heading`**   | `string` | Always `"Pokémon GO Tour"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start date/time (ISO 8601 format)
| **`end`**       | `string` | Event end date/time (ISO 8601 format)
| **`flags`**     | `object` | Content availability flags (see [Flags Section](../Events.md#flags-section))

## Additional Sections

Pokémon GO Tour events may include:

- **`pokemon`**: Featured regional Pokémon and exclusive spawns
- **`spawns`**: Extensive spawn pool for the featured region
- **`bonuses`**: Special bonuses for ticket holders
- **`fieldResearch`**: Exclusive Special Research
- **`raids`**: Featured raid bosses throughout the event



## Notes

- GO Tour events typically feature Pokémon from a specific generation or region
- Usually requires a ticket for full access to features
- May have both in-person and global components
- Often includes version-exclusive spawns (Gold vs. Silver tickets, etc.)
