# Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/raid-day.min.json`

## Description

This file contains all Raid Day events. These are special events featuring a specific Pokémon in raids throughout the day, often with increased rewards and shiny chances.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"raid-day"`:

```json
[
  {
    "eventID": "raid-day-example",
    "name": "Pokémon Raid Day",
    "eventType": "raid-day",
    "heading": "Raid Day",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "giratina-raid-day-2026",
  "name": "Giratina Raid Day",
  "eventType": "raid-day",
  "heading": "Raid Day",
  "image": "https://cdn.leekduck.com/assets/img/events/raid-day-giratina.jpg",
  "start": "2026-03-14T11:00:00.000",
  "end": "2026-03-14T17:00:00.000",
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

All Raid Day events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the Raid Day
| **`name`**      | `string` | Name including featured Pokémon
| **`eventType`** | `string` | Always `"raid-day"`
| **`heading`**   | `string` | Always `"Raid Day"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start time (ISO 8601 format)
| **`end`**       | `string` | Event end time (ISO 8601 format)
| **`flags`**     | `object` | Content availability flags (see [Flags Section](../Events.md#flags-section))

## Additional Sections

Raid Day events may include:

- **`raids`**: Featured raid boss with difficulty tier
- **`pokemon`**: Featured Pokémon with shiny availability
- **`bonuses`**: Active bonuses (extra Rare Candy, XP, etc.)

For complete field definitions and optional sections, see the main [Events documentation](../Events.md).

## Notes

- Raid Days typically run for 3-6 hours
- Features one specific Pokémon in most or all raids
- Often includes increased shiny rates
- May offer additional rewards like Rare Candy XL
- Usually includes free Raid Passes from spinning Gyms
