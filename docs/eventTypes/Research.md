# Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eventTypes/research.min.json`

## Description

This file contains Research events, which typically refer to Special Research, Timed Research, or Research Breakthrough changes. These are quest-based storylines or limited-time research tasks.

## Data Structure

The file contains an array of event objects with the `eventType` field set to `"research"`:

```json
[
  {
    "eventID": "research-example",
    "name": "Special Research Name",
    "eventType": "research",
    "heading": "Research",
    ...
  }
]
```

## Example Event Object

```json
{
  "eventID": "a-mythical-discovery-2026",
  "name": "A Mythical Discovery",
  "eventType": "research",
  "heading": "Research",
  "image": "https://cdn.leekduck.com/assets/img/events/research-mew.jpg",
  "start": "2026-01-01T00:00:00.000",
  "end": null,
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

All Research events inherit the [core event fields](../Events.md#core-fields) and may include additional sections described in the main [Events documentation](../Events.md).

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | Unique identifier for the research
| **`name`**      | `string` | Name of the Special or Timed Research
| **`eventType`** | `string` | Always `"research"`
| **`heading`**   | `string` | Always `"Research"`
| **`image`**     | `string` | Event header/thumbnail image URL
| **`start`**     | `string` | Research availability start (ISO 8601 format, may be null)
| **`end`**       | `string` | Research availability end (ISO 8601 format, may be null)
| **`flags`**     | `object` | Content availability flags (see [Flags Section](../Events.md#flags-section))

## Additional Sections

Research events include a `details` object containing:

- **`research`**: Research task details, steps, and rewards
- **`pokemon`**: Array of featured Pokémon reward objects with `imageWidth`, `imageHeight`, `imageType`, and `canBeShiny` fields

For detailed field documentation, see the main [Events documentation](../Events.md).



## Notes

- Special Research has no time limit (end date is null)
- Timed Research has a specific deadline
- Research Breakthrough changes affect monthly Field Research rewards
- Some research is automatically granted, others require purchase or event participation
