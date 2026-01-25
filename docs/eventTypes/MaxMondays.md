# Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/max-mondays.min.json`

## Description

This file contains all Max Monday events. Max Mondays are weekly events featuring special Dynamax Pokémon encounters or bonuses specifically on Mondays.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"max-mondays"`:

```json
[
  {
    "eventID": "max-monday-example",
    "name": "Max Monday",
    "eventType": "max-mondays",
    "heading": "Max Mondays",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "max-monday-2026-01-20",
  "name": "Max Monday",
  "eventType": "max-mondays",
  "heading": "Max Mondays",
  "image": "https://cdn.leekduck.com/assets/img/events/max-monday-default.jpg",
  "start": "2026-01-20T00:00:00.000",
  "end": "2026-01-20T23:59:59.000",
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

All Max Monday events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the Max Monday event
| **`name`**      | `string` | Always `"Max Monday"` or variant
| **`eventType`** | `string` | Always `"max-mondays"`
| **`heading`**   | `string` | Always `"Max Mondays"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Monday start date/time (ISO 8601 format)
| **`end`**       | `string` | Monday end date/time (ISO 8601 format)
| **`flags`**     | `object` | Content availability flags (see [Flags Section](../Events.md#flags-section))

## Additional Sections

Max Monday events may include:

- **`bonuses`**: Special Max Battle bonuses active on Mondays
- **`pokemon`**: Featured Dynamax Pokémon for the day

For complete field definitions and optional sections, see the main [Events documentation](../Events.md).

## Notes

- Max Mondays occur weekly on Mondays
- May feature increased Max Particle spawns
- Often includes special bonuses for Max Battles
