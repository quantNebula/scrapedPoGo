# Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/max-battles.min.json`

## Description

This file contains all Max Battle events. Max Battles feature specific Dynamax Pokémon available for a limited time in Max Battle encounters.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"max-battles"`:

```json
[
  {
    "eventID": "max-battles-example",
    "name": "Dynamax Pokémon in Max Battles",
    "eventType": "max-battles",
    "heading": "Max Battles",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "dynamax-venusaur-max-battles-january-2026",
  "name": "Dynamax Venusaur in Max Battles",
  "eventType": "max-battles",
  "heading": "Max Battles",
  "image": "https://cdn.leekduck.com/assets/img/events/max-battles-default.jpg",
  "start": "2026-01-15T10:00:00.000",
  "end": "2026-01-22T10:00:00.000",
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

All Max Battle events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the Max Battle rotation
| **`name`**      | `string` | Name indicating featured Dynamax Pokémon
| **`eventType`** | `string` | Always `"max-battles"`
| **`heading`**   | `string` | Always `"Max Battles"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Rotation start date/time (ISO 8601 format)
| **`end`**       | `string` | Rotation end date/time (ISO 8601 format)
| **`flags`**     | `object` | Content availability flags (see [Flags Section](../Events.md#flags-section))

## Additional Sections

Max Battle events may include:

- **`pokemon`**: Featured Dynamax Pokémon details
- **`bonuses`**: Any active bonuses during the rotation

For complete field definitions and optional sections, see the main [Events documentation](../Events.md).

## Notes

- Max Battles rotate featured Dynamax Pokémon weekly or bi-weekly
- Different difficulty tiers may be available
- Requires Max Particles to participate
