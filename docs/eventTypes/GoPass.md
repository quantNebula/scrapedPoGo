# Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/go-pass.min.json`

## Description

This file contains all GO Pass events, which are special paid events requiring tickets for participation. These typically include GO Fest, Safari Zone, and other premium events.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"go-pass"`:

```json
[
  {
    "eventID": "go-fest-example",
    "name": "Pokémon GO Fest Example",
    "eventType": "go-pass",
    "heading": "GO Pass Event",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "pokemon-go-fest-2026",
  "name": "Pokémon GO Fest 2026",
  "eventType": "go-pass",
  "heading": "GO Pass Event",
  "image": "https://cdn.leekduck.com/assets/img/events/go-fest-2026.jpg",
  "start": "2026-05-30T10:00:00.000",
  "end": "2026-05-31T18:00:00.000",
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

All GO Pass events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the GO Pass event
| **`name`**      | `string` | Name of the ticketed event
| **`eventType`** | `string` | Always `"go-pass"`
| **`heading`**   | `string` | Always `"GO Pass Event"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start date/time (ISO 8601 format)
| **`end`**       | `string` | Event end date/time (ISO 8601 format)
| **`flags`**     | `object` | Content availability flags (see [Flags Section](../Events.md#flags-section))

## Additional Sections

GO Pass events may include:

- **`pokemon`**: Exclusive Pokémon available only to ticket holders
- **`spawns`**: Special spawn pools for ticket holders
- **`bonuses`**: Exclusive bonuses for participants
- **`fieldResearch`**: Special Research available with ticket
- **`raids`**: Featured raid bosses during the event

For complete field definitions and optional sections, see the main [Events documentation](../Events.md).

## Notes

- GO Pass events require a purchased ticket to access exclusive features
- These are typically the largest events in Pokémon GO
- May include both in-person and global variants
- Often feature exclusive Special Research storylines
