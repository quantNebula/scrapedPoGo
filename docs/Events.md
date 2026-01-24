# Endpoints

- Formatted: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.json`
- Minimized: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json`

# Example Event Object

```json
{
    "eventID": "legendaryraidhour20220601",
    "name": "Kyogre Raid Hour",
    "eventType": "raid-hour",
    "heading": "Raid Hour",
    "image": "https://www.leekduck.com/assets/img/events/raidhour.jpg",
    "start": "2022-06-01T18:00:00.000",
    "end": "2022-06-01T19:00:00.000",
    "hasSpawns": false,
    "hasFieldResearchTasks": false
}
```
# Fields

| Field           | Type     | Description
|---------------- |--------- |---------------------
| **`eventID`**   | `string` | The ID of the event. Also the last part of the event page's URL.
| **`name`**      | `string` | The name of the event.
| **`eventType`** | `string` | The type of the event. See [List of Event Types](#list-of-event-types)
| **`heading`**   | `string` | The heading for the event. Based on the event's type.
| **`image`**                    | `string`  | The header/thumbnail image for the event.
| **`start`**                    | `string`  | The start date of the event (Can be null). See [Note for Start/End dates](#note-for-startend-dates)
| **`end`**                      | `string`  | The end date of the event (Can be null). See [Note for Start/End dates](#note-for-startend-dates)
| **`hasSpawns`**                | `boolean` | Whether the event has special spawns (added to all events)
| **`hasFieldResearchTasks`**    | `boolean` | Whether the event has field research tasks (added to all events)

**Note:** Events may contain additional fields specific to their type. See [Event Type Specific Fields](#event-type-specific-fields) below.

## List of Event Types

| Events/Misc.               | Research                  | Raids/Battle         | GO Rocket
|--------------------------- |-------------------------- |--------------------- |------------------------------
| `community-day`            | `research`                | `raid-day`           | `go-rocket-takeover`
| `event`                    | `timed-research`          | `raid-battles`       | `team-go-rocket`
| `live-event`               | `limited-research`        | `raid-hour`          | `giovanni-special-research`
| `pokemon-go-fest`          | `research-breakthrough`   | `raid-weekend`
| `global-challenge`         | `special-research`        | `go-battle-league`
| `safari-zone`              | `research-day`            | `elite-raids`
| `ticketed-event`           |                           | `max-battles`
| `location-specific`        |                           | `max-mondays`
| `bonus-hour`               |
| `pokemon-spotlight-hour`
| `potential-ultra-unlock`
| `update`
| `season`
| `pokemon-go-tour`
| `go-pass`
| `ticketed`
| `pokestop-showcase`
| `wild-area`
| `city-safari`

If you want to figure out what type of event a specific event on [LeekDuck.com/events](https://www.leekduck.com/events/) is, use your browser's dev tools to determine what class is setting the background color of that event. The class name is the same as the event type (except for `pokemon-go-fest` and `pokemon-spotlight-hour`, where the accented "é" is replaced with "e").

## Note for Start/End dates

The `start` and `end` fields are DateTime objects encoded in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601).

Most events in Pokemon GO occur based around a user's local timezone. However, there are also some events that happen at the same time globally.

If an event starts/ends at the same time globally, the `start` and `end` fields will have strings ending with "Z", signifying the DateTime is in UTC. Otherwise, the DateTime displayed is based on the user's local timezone.

Depending on the use case, many parsers (ex: Javascript's `Date.parse()`) will handle this automatically.

## Event Type Specific Fields

All events include `hasSpawns` and `hasFieldResearchTasks` boolean fields (added in [#18](https://github.com/quantNebula/scrapedPoGo/pull/18)).

For certain event types, additional fields are included directly in the event object to provide more detailed information. These fields are specific to each event type and appear at the top level of the event object.

The following event types have additional fields:

### Pokémon Spotlight Hours

Additional fields for `pokemon-spotlight-hour` events:

```json
"name": "Mantine",
"canBeShiny": true,
"image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_226_00.png",
"bonus": "2× Transfer Candy"
```

### Research Breakthroughs

Additional fields for `research-breakthrough` events:

```json
"name": "Klink",
"canBeShiny": true,
"image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_599_00.png"
```

### Raid Battles

Additional fields for `raid-battles` events:

```json
"bosses": [
    {
        "name": "Mega Charizard Y",
        "image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_006_52.png",
        "canBeShiny": true
    }
],
"shinies": [
    {
        "name": "Charizard",
        "image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_006_00_shiny.png"
    }
]
```

### Community Days

Additional fields for `community-day` events:

```json
"spawns": [
    {
        "name": "Deino",
        "image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_633_00.png",
        "canBeShiny": true
    }
],
"bonuses": [
    {
        "text": "Increased Spawns",
        "image": "https://www.leekduck.com/assets/img/events/bonuses/wildgrass.png"
    },
    {
        "text": "1/4 Egg Hatch Distance",
        "image": "https://www.leekduck.com/assets/img/events/bonuses/eggdistance.png"
    }
],
"bonusDisclaimers": [
    "* Disclaimer string, if it exists.",
    "* A second disclaimer string, if it exists."
],
"featuredAttack": {
    "description": "Evolve Deino during the event to get Hydreigon with Brutal Swing",
    "stats": [
        "Trainer Battles: 65 power",
        "Gym and Raid Battles: 65 power"
    ]
},
"photobomb": {
    "description": "Take snapshots during the event for a surprise!",
    "pokemon": [
        {
            "name": "Deino",
            "image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_633_00.png"
        }
    ]
},
"pokestopShowcases": [
    {
        "name": "Deino",
        "image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_633_00.png"
    }
],
"fieldResearchTasks": [
    { "type": "info", "text": "Spin PokéStops for event-themed tasks" },
    { "type": "task", "text": "Catch 3 Deino" },
    { "type": "encounters", "pokemon": [...] }
],
"lureModuleBonus": "Lure Modules last 3 hours",
"ticketedResearch": {
    "price": 1.00,
    "description": "Community Day Classic Special Research"
},
        "shinies": [
    {
        "name": "Deino",
        "image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_633_00_shiny.png"
    },
    {
        "name": "Zweilous",
        "image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_634_00_shiny.png"
    }
],
"specialresearch": [
    {
        "name": "Field Notes: Deino (1/4)",
        "step": 1,
        "tasks": [
            {
                "text": "Earn 3 hearts with your buddy",
                "reward": {
                    "text": "Poké Ball ×15",
                    "image": "https://www.leekduck.com/assets/img/items/Pok%C3%A9%20Ball.png"
                }
            }
        ],
        "rewards": [
            {
                "text": "×2000",
                "image": "https://www.leekduck.com/assets/img/items/Stardust.png"
            }
        ]
    }
]
```

### Raid Battles (Enhanced)

Additional fields for `raid-battles` events:

```json
"bosses": [...],
"shinies": [...],
"tiers": {
    "mega": [...],
    "fiveStar": [...],
    "threeStar": [...],
    "oneStar": [...]
},
"alternationPattern": "Raid bosses will alternate every half hour",
"featuredAttacks": [
    "Evolved Pokémon will know the Charged Attack Sacred Fire"
]
```

### Raid Day

Additional fields for `raid-day` events:

```json
"featured": [...],
"featuredAttacks": ["Lugia caught during the event will know Aeroblast"],
"raids": {
    "fiveStar": [...],
    "mega": [...],
    "other": [...]
},
"shinies": [...],
"bonuses": [...],
"ticketBonuses": ["5 additional Raid Passes", "2× Catch XP"],
"ticketPrice": 5.00,
"alternationPattern": "Featured Pokémon will alternate every half hour",
"specialMechanics": ["Fusion available during event"]
```

### Raid Hour

Additional fields for `raid-hour` events:

```json
"featured": {
    "name": "Kyogre",
    "image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_382_00.png",
    "canBeShiny": true
},
"canBeShiny": true
```

### Team GO Rocket Events

Additional fields for `team-go-rocket` and `go-rocket-takeover` events:

```json
"shadowPokemon": [...],
"leaders": {
    "arlo": [...],
    "cliff": [...],
    "sierra": [...]
},
"giovanni": [
    { "name": "Shadow Mewtwo", "image": "..." },
    { "info": "Giovanni can be encountered after completing Special Research" }
],
"grunts": [...],
"bonuses": ["2× Stardust from Rocket battles"],
"specialResearch": ["Complete the Special Research to encounter Giovanni"]
```

### GO Battle League

Additional fields for `go-battle-league` events:

```json
"leagues": [
    {
        "name": "Great League",
        "cpCap": 1500,
        "typeRestrictions": [],
        "rules": ["Only Pokémon with 1,500 CP or less"]
    },
    {
        "name": "Little Cup",
        "cpCap": 500,
        "typeRestrictions": [],
        "rules": ["Only Pokémon that have not evolved"]
    }
]
```

### Season Events

Additional fields for `season` events:

```json
"name": "Season of Adventures Abound",
"bonuses": ["Increased spawn variety", "Special Field Research"],
"spawns": [...],
"eggs": {
    "2km": [...],
    "5km": [...],
    "7km": [...],
    "10km": [...],
    "12km": [...],
    "route": [...],
    "adventure": [...]
},
"researchBreakthrough": [...],
"specialResearch": [...],
"masterworkResearch": [...],
"communityDays": ["January 6 - Stufful", "January 20 - TBA"],
"features": [...],
"goBattleLeague": "Great League and Ultra League available",
"goPass": [...],
"pokemonDebuts": [...],
"maxPokemonDebuts": [...]
```

### GO Tour Events

Additional fields for `pokemon-go-tour` events:

```json
"eventInfo": {
    "name": "Pokémon GO Tour: Hoenn",
    "location": "Las Vegas, NV",
    "dates": "February 18-19, 2023",
    "time": "10:00 a.m. to 6:00 p.m.",
    "ticketPrice": 30.00,
    "ticketUrl": ""
},
"exclusiveBonuses": [...],
"ticketAddOns": [...],
"whatsNew": [...],
"habitats": {
    "Central Village": { "spawns": [...], "rareSpawns": [...] },
    "Coastal Laboratory": { "spawns": [...], "rareSpawns": [...] }
},
"incenseEncounters": [...],
"eggs": { "2km": [...], "5km": [...], "7km": [...], "10km": [...] },
"raids": {
    "oneStar": [...],
    "threeStar": [...],
    "fiveStar": [...],
    "mega": [...]
},
"research": {
    "field": [...],
    "special": [...],
    "timed": [...],
    "masterwork": [...]
},
"shinyDebuts": [...],
"shinies": [...],
"sales": [...],
"costumedPokemon": [...]
```

### Research Events (Special/Masterwork)

Additional fields for `research`, `special-research` events:

```json
"name": "A Cosmic Companion",
"researchType": "masterwork",
"isPaid": false,
"price": null,
"description": "Complete tasks to encounter Cosmog",
"tasks": [...],
"rewards": [...],
"encounters": [...],
"promoCodes": ["POKEMONGOPROMO123"],
"expires": false,
"webStoreInfo": "Available in the Pokémon GO Web Store"
```

### Timed Research

Additional fields for `timed-research` events:

```json
"name": "Timed Research: Adventure Week",
"description": "Complete tasks before time runs out!",
"isPaid": false,
"price": null,
"tasks": [...],
"rewards": [...],
"encounters": [...],
"availability": {
    "start": "Tuesday, June 4 at 10:00 a.m.",
    "end": "Sunday, June 9 at 8:00 p.m. local time"
}
```

### Max Battles (Dynamax Events)

Additional fields for `max-battles` events:

```json
"featured": [...],
"bonuses": ["2× Max Particles from battles"],
"gigantamax": [...],
"dynamax": [...]
```

### Max Mondays

Additional fields for `max-mondays` events:

```json
"featured": {
    "name": "Gigantamax Pikachu",
    "image": "...",
    "canBeShiny": true
},
"bonus": "2× Max Particles"
```

### GO Pass

Additional fields for `go-pass` events:

```json
"description": "Complete tasks to earn points and rewards",
"pricing": {
    "deluxe": 4.99,
    "deluxePlus": 9.99
},
"tiers": [...],
"pointTasks": [
    { "task": "Catch a Pokémon", "points": 10 },
    { "task": "Win a Raid Battle", "points": 50 }
],
"rewards": {
    "free": [...],
    "deluxe": [...]
},
"milestoneBonuses": [
    { "tier": "Tier 1 - Rank 5", "bonus": "Premium Battle Pass" }
]
```

### PokéStop Showcases

Additional fields for `pokestop-showcase` events:

```json
"featured": [...],
"description": "Enter your best Pokémon in PokéStop Showcases"
```
