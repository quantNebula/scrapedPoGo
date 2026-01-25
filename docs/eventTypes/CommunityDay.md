# Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/community-day.min.json`

## Description

This file contains all Community Day events. Community Days are monthly events featuring specific Pokémon with increased spawns, exclusive moves, and special bonuses.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"community-day"`:

```json
[
  {
    "eventID": "february-communityday2026",
    "name": "Vulpix Community Day",
    "eventType": "community-day",
    "heading": "Community Day",
    ...
  },
  {
    "eventID": "march-communityday2026",
    "name": "March Community Day",
    "eventType": "community-day",
    "heading": "Community Day",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "february-communityday2026",
  "name": "Vulpix Community Day",
  "eventType": "community-day",
  "heading": "Community Day",
  "image": "https://cdn.leekduck.com/assets/img/events/article-images/2026/2026-02-01-february-communityday2026/vulpix-community-day-temp.jpg",
  "start": "2026-02-01T14:00:00.000",
  "end": "2026-02-01T17:00:00.000",
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

All Community Day events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the Community Day event
| **`name`**      | `string` | Name of the Community Day (typically includes featured Pokémon)
| **`eventType`** | `string` | Always `"community-day"`
| **`heading`**   | `string` | Always `"Community Day"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start date/time (ISO 8601 format)
| **`end`**       | `string` | Event end date/time (ISO 8601 format)
| **`flags`**     | `object` | Content availability flags (see [Flags Section](../Events.md#flags-section))

## Additional Sections

Community Day events include a `details` object containing:

- **`pokemon`**: Array of featured Pokémon objects with `imageWidth`, `imageHeight`, `imageType`, `source`, and `canBeShiny` fields
- **`bonuses`**: Array of XP, Stardust, or other gameplay bonuses
- **`research`**: Special research tasks available during the event
- **`shinies`**: Array of shiny Pokémon available
- **`rewards`**: Event rewards and ticket information

For detailed field documentation, see the main [Events documentation](../Events.md).

## Notes

- Community Days typically run for 3 hours (14:00-17:00 local time)
- Events often feature exclusive moves for evolved Pokémon
- Community Day Classic events may also appear with this eventType
