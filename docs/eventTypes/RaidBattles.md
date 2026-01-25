# Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/raid-battles.min.json`

## Description

This file contains all Raid Battle rotation events. These events announce changes to the raid boss lineup, including 5-star Legendary raids, Mega raids, and Shadow raids.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"raid-battles"`:

```json
[
  {
    "eventID": "mega-sceptile-in-mega-raids-january-2026",
    "name": "Mega Sceptile in Mega Raids",
    "eventType": "raid-battles",
    "heading": "Raid Battles",
    ...
  },
  {
    "eventID": "thundurus-incarnate-forme-in-5-star-raid-battles-january-2026",
    "name": "Thundurus (Incarnate Forme) in 5-star Raid Battles",
    "eventType": "raid-battles",
    "heading": "Raid Battles",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "mega-sceptile-in-mega-raids-january-2026",
  "name": "Mega Sceptile in Mega Raids",
  "eventType": "raid-battles",
  "heading": "Raid Battles",
  "image": "https://cdn.leekduck.com/assets/img/events/mega-default.jpg",
  "start": "2026-01-16T10:00:00.000",
  "end": "2026-01-25T10:00:00.000",
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

All Raid Battle events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the raid rotation
| **`name`**      | `string` | Name indicating featured raid boss and tier
| **`eventType`** | `string` | Always `"raid-battles"`
| **`heading`**   | `string` | Always `"Raid Battles"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Rotation start date/time (ISO 8601 format)
| **`end`**       | `string` | Rotation end date/time (ISO 8601 format)
| **`flags`**     | `object` | Content availability flags (see [Flags Section](../Events.md#flags-section))

## Additional Sections

Raid Battle events include a `details` object containing:

- **`raids`**: Featured raid boss details organized by tier
- **`pokemon`**: Array of featured Pokémon objects with `imageWidth`, `imageHeight`, `imageType`, and `canBeShiny` fields

For detailed field documentation, see the main [Events documentation](../Events.md).



## Notes

- Raid rotations typically change weekly or bi-weekly
- May feature Legendary, Mega, or Shadow raid bosses
- Different raid tiers (1-star, 3-star, 5-star, Mega, Shadow) have separate rotations
- Overlapping raid rotations are common (e.g., both a 5-star and Mega rotation active)
