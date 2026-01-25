# Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/team-go-rocket.min.json`

## Description

This file contains all Team GO Rocket events. These events feature increased Team GO Rocket activity, special Shadow Pokémon, Rocket Leader rotations, and Giovanni encounters.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"team-go-rocket"`:

```json
[
  {
    "eventID": "team-go-rocket-event-example",
    "name": "Team GO Rocket Event",
    "eventType": "team-go-rocket",
    "heading": "Team GO Rocket",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "team-go-rocket-takeover-2026-01",
  "name": "Team GO Rocket Takeover",
  "eventType": "team-go-rocket",
  "heading": "Team GO Rocket",
  "image": "https://cdn.leekduck.com/assets/img/events/team-go-rocket-default.jpg",
  "start": "2026-01-25T00:00:00.000",
  "end": "2026-01-28T23:59:59.000",
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

All Team GO Rocket events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the Team GO Rocket event
| **`name`**      | `string` | Name of the Rocket event
| **`eventType`** | `string` | Always `"team-go-rocket"`
| **`heading`**   | `string` | Always `"Team GO Rocket"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Event start date/time (ISO 8601 format)
| **`end`**       | `string` | Event end date/time (ISO 8601 format)
| **`flags`**     | `object` | Content availability flags (see [Flags Section](../Events.md#flags-section))

## Additional Sections

Team GO Rocket events may include:

- **`pokemon`**: New Shadow Pokémon or featured Shadow Pokémon
- **`bonuses`**: Bonuses related to Team GO Rocket battles
- **`fieldResearch`**: Rocket-themed research tasks



## Notes

- Team GO Rocket events often feature increased balloon and PokéStop invasions
- May introduce new Shadow Pokémon or rotate available Shadow species
- Giovanni encounters may be available during special events
- Rocket Leader lineups (Cliff, Sierra, Arlo) change periodically
- Shadow Raids featuring Shadow Legendary Pokémon may be included
