# Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/event.min.json`

## Description

This file contains general event entries. These are standard in-game events that don't fit into more specific categories, such as themed events, special celebrations, or unique gameplay events.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"event"`:

```json
[
  {
    "eventID": "precious-pals-2026",
    "name": "Precious Pals",
    "eventType": "event",
    "heading": "Event",
    ...
  },
  {
    "eventID": "into-the-depths-2026",
    "name": "Into the Depths",
    "eventType": "event",
    "heading": "Event",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "precious-pals-2026",
  "name": "Precious Pals",
  "eventType": "event",
  "heading": "Event",
  "image": "https://cdn.leekduck.com/assets/img/events/article-images/2026/2026-01-20-precious-pals-2026/precious-pals.jpg",
  "start": "2026-01-20T10:00:00.000",
  "end": "2026-01-25T20:00:00.000",
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

All general events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the event
| **`name`**      | `string` | Name of the event
| **`eventType`** | `string` | Always `"event"`
| **`heading`**   | `string` | Always `"Event"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start date/time (ISO 8601 format)
| **`end`**       | `string` | Event end date/time (ISO 8601 format)
| **`flags`**     | `object` | Content availability flags (see [Flags Section](../Events.md#flags-section))

## Additional Sections

General events may include:

- **`pokemon`**: Featured Pokémon for the event
- **`spawns`**: Wild Pokémon spawn details
- **`bonuses`**: Active gameplay bonuses
- **`fieldResearch`**: Event-specific research tasks
- **`raids`**: Featured raid bosses
- **`eggs`**: Egg hatch pool changes

For complete field definitions and optional sections, see the main [Events documentation](../Events.md).

## Notes

- General events typically run for multiple days
- These events often feature themed content (holidays, special occasions, etc.)
- May include various gameplay changes and special spawns
