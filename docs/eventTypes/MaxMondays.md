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
  "eventID": "max-mondays-2026-01-26",
  "name": "Dynamax Roggenrola during Max Monday",
  "eventType": "max-mondays",
  "heading": "Max Mondays",
  "image": "https://cdn.leekduck.com/assets/img/events/max-battles-kanto.jpg",
  "start": "2026-01-26T18:00:00.000",
  "end": "2026-01-26T19:00:00.000",
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
  "bonus": "January 26, 2026"
}
```

## Fields

All Max Monday events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the Max Monday event
| **`name`**      | `string` | Name describing the featured Dynamax Pokémon
| **`eventType`** | `string` | Always `"max-mondays"`
| **`heading`**   | `string` | Always `"Max Mondays"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Monday start time (ISO 8601 format, typically 18:00 local)
| **`end`**       | `string` | Monday end time (ISO 8601 format, typically 19:00 local)
| **`flags`**     | `object` | Content availability flags (see [Flags Section](../Events.md#flags-section))
| **`bonus`**     | `string` | Bonus text or date information

## Additional Sections

Max Monday events have this additional top-level field:

- **`bonus`**: Information about the event date or special bonus



## Notes

- Max Mondays occur weekly on Mondays
- May feature increased Max Particle spawns
- Often includes special bonuses for Max Battles
