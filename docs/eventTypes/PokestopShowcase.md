# Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/pokestop-showcase.min.json`

## Description

This file contains all PokéStop Showcase events. These are competitive events where Trainers can enter their Pokémon at PokéStops to compete based on size or other criteria.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"pokestop-showcase"`:

```json
[
  {
    "eventID": "pokestop-showcase-example",
    "name": "PokéStop Showcase: Pokémon Name",
    "eventType": "pokestop-showcase",
    "heading": "PokéStop Showcase",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "pokestop-showcase-pikachu-2026-01",
  "name": "PokéStop Showcase: Pikachu",
  "eventType": "pokestop-showcase",
  "heading": "PokéStop Showcase",
  "image": "https://cdn.leekduck.com/assets/img/events/pokestop-showcase-default.jpg",
  "start": "2026-01-20T10:00:00.000",
  "end": "2026-01-23T20:00:00.000",
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

All PokéStop Showcase events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the showcase event
| **`name`**      | `string` | Name including featured Pokémon
| **`eventType`** | `string` | Always `"pokestop-showcase"`
| **`heading`**   | `string` | Always `"PokéStop Showcase"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start date/time (ISO 8601 format)
| **`end`**       | `string` | Event end date/time (ISO 8601 format)
| **`flags`**     | `object` | Content availability flags (see [Flags Section](../Events.md#flags-section))

## Additional Sections

PokéStop Showcase events typically have minimal additional data. When present, they may include:

- **`description`**: Competition rules and judging criteria
- **`featured`**: Featured Pokémon eligible for entry

Note: Unlike other event types, PokéStop Showcase events may not use the `details` wrapper structure consistently.



## Notes

- Showcases typically run for several days
- Trainers compete by entering their best Pokémon at participating PokéStops
- Winners are often determined by size (XS or XL)
- Rewards are given to winners and participants
