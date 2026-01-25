# scrapedPoGo API - Consolidated Documentation

> **Purpose**: This document provides complete API documentation for all scrapedPoGo endpoints in a single file, suitable for LLM context or offline reference. No external file traversal required.
 
**Last Documentation Update**: January 2025


## Overview

scrapedPoGo provides scraped Pokémon GO event data from LeekDuck.com as JSON endpoints. All data is available in two formats:
- **Formatted** (`.json`) - Human-readable with indentation
- **Minified** (`.min.json`) - Compressed for production use

### Base URL
```
https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/
```

---

## Quick Reference - All Endpoints

| Endpoint | Formatted URL | Minified URL |
|----------|---------------|--------------|
| Events | `data/events.json` | `data/events.min.json` |
| Raids | `data/raids.json` | `data/raids.min.json` |
| Research | `data/research.json` | `data/research.min.json` |
| Eggs | `data/eggs.json` | `data/eggs.min.json` |
| Rocket Lineups | `data/rocketLineups.json` | `data/rocketLineups.min.json` |
| Shinies | `data/shinies.json` | `data/shinies.min.json` |

**Note**: The Shinies endpoint is updated less frequently as it sources data from game asset files. It's used internally by other endpoints to augment shiny availability data.

---

## Events Endpoint

### Endpoints
- **Formatted**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.json`
- **Minimized**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.min.json`

### Example Event Object

```json
{
    "eventID": "legendaryraidhour20220601",
    "name": "Kyogre Raid Hour",
    "eventType": "raid-hour",
    "heading": "Raid Hour",
    "image": "https://www.leekduck.com/assets/img/events/raidhour.jpg",
    "start": "2022-06-01T18:00:00.000",
    "end": "2022-06-01T19:00:00.000",
    "flags": {
        "hasSpawns": false,
        "hasFieldResearchTasks": false,
        "hasBonuses": false,
        "hasRaids": true,
        "hasEggs": false,
        "hasShiny": false
    }
}
```

### Base Event Fields

| Field | Type | Description |
|-------|------|-------------|
| `eventID` | `string` | The ID of the event. Also the last part of the event page's URL. |
| `name` | `string` | The name of the event. |
| `eventType` | `string` | The type of the event. See [List of Event Types](#list-of-event-types). |
| `heading` | `string` | The heading for the event. Based on the event's type. |
| `image` | `string` | The header/thumbnail image for the event. |
| `start` | `string\|null` | The start date of the event. See [Date Format Notes](#date-format-notes). |
| `end` | `string\|null` | The end date of the event. See [Date Format Notes](#date-format-notes). |
| `flags` | `object` | Object containing boolean flags for event features. See [Flags Object](#flags-object). |

#### Flags Object

| Field | Type | Description |
|-------|------|-------------|
| `hasSpawns` | `boolean` | Whether the event has special spawns. |
| `hasFieldResearchTasks` | `boolean` | Whether the event has field research tasks. |
| `hasBonuses` | `boolean` | Whether the event has bonuses (e.g., bonus XP, candy, etc.). |
| `hasRaids` | `boolean` | Whether the event has raid content. |
| `hasEggs` | `boolean` | Whether the event has special egg hatches. |
| `hasShiny` | `boolean` | Whether the event introduces new shiny releases. |

**Note**: Events may contain additional fields specific to their type. See [Event Type Specific Fields](#event-type-specific-fields).

### List of Event Types

#### Events/Misc
- `community-day`
- `event`
- `live-event`
- `pokemon-go-fest`
- `global-challenge`
- `safari-zone`
- `ticketed-event`
- `location-specific`
- `bonus-hour`
- `pokemon-spotlight-hour`
- `potential-ultra-unlock`
- `update`
- `season`
- `pokemon-go-tour`
- `go-pass`
- `ticketed`
- `pokestop-showcase`
- `wild-area`
- `city-safari`

#### Research
- `research`
- `timed-research`
- `limited-research`
- `research-breakthrough`
- `special-research`
- `research-day`

#### Raids/Battle
- `raid-day`
- `raid-battles`
- `raid-hour`
- `raid-weekend`
- `go-battle-league`
- `elite-raids`
- `max-battles`
- `max-mondays`

#### GO Rocket
- `go-rocket-takeover`
- `team-go-rocket`
- `giovanni-special-research`

### Date Format Notes

The `start` and `end` fields are DateTime objects encoded in [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601).

- **Local time events**: DateTime string WITHOUT "Z" suffix (e.g., `2022-06-01T18:00:00.000`) - interpreted in user's local timezone
- **Global events**: DateTime string WITH "Z" suffix (e.g., `2022-06-01T18:00:00.000Z`) - UTC time, same moment worldwide

Most parsers (e.g., JavaScript's `Date.parse()`) handle this automatically.

### Event Type Specific Fields

#### Pokémon Spotlight Hours (`pokemon-spotlight-hour`)

```json
{
    "name": "Mantine",
    "canBeShiny": true,
    "image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_226_00.png",
    "bonus": "2× Transfer Candy"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Featured Pokémon name |
| `canBeShiny` | `boolean` | Whether the featured Pokémon can be shiny |
| `image` | `string` | URL to Pokémon image |
| `bonus` | `string` | The bonus active during the event |

#### Research Breakthroughs (`research-breakthrough`)

```json
{
    "name": "Klink",
    "canBeShiny": true,
    "image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_599_00.png"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Breakthrough reward Pokémon name |
| `canBeShiny` | `boolean` | Whether the reward Pokémon can be shiny |
| `image` | `string` | URL to Pokémon image |

#### Raid Battles (`raid-battles`)

```json
{
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
    ],
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
}
```

| Field | Type | Description |
|-------|------|-------------|
| `bosses` | `array` | Array of raid boss objects with name, image, canBeShiny |
| `shinies` | `array` | Array of shiny Pokémon available |
| `tiers` | `object` | Bosses organized by tier (mega, fiveStar, threeStar, oneStar) |
| `alternationPattern` | `string` | Description of boss rotation pattern |
| `featuredAttacks` | `array` | Special moves available during the event |

#### Community Days (`community-day`)

```json
{
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
        "* Disclaimer string, if it exists."
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
}
```

| Field | Type | Description |
|-------|------|-------------|
| `spawns` | `array` | Featured spawning Pokémon |
| `bonuses` | `array` | Active bonuses with text and icon |
| `bonusDisclaimers` | `array` | Disclaimer text for bonuses |
| `featuredAttack` | `object` | Special move info with description and stats |
| `photobomb` | `object` | Photobomb details with pokemon array |
| `pokestopShowcases` | `array` | Pokémon eligible for showcases |
| `fieldResearchTasks` | `array` | Event research tasks |
| `lureModuleBonus` | `string` | Lure module duration bonus |
| `ticketedResearch` | `object` | Paid research details (price, description) |
| `shinies` | `array` | Available shiny Pokémon |
| `specialresearch` | `array` | Step-by-step research with tasks and rewards |

#### Raid Day (`raid-day`)

```json
{
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
}
```

#### Raid Hour (`raid-hour`)

```json
{
    "featured": {
        "name": "Kyogre",
        "image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_382_00.png",
        "canBeShiny": true
    },
    "canBeShiny": true
}
```

#### Team GO Rocket Events (`team-go-rocket`, `go-rocket-takeover`)

```json
{
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
}
```

#### GO Battle League (`go-battle-league`)

```json
{
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
}
```

#### Season Events (`season`)

```json
{
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
}
```

#### GO Tour Events (`pokemon-go-tour`)

```json
{
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
}
```

#### Research Events (`research`, `special-research`)

```json
{
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
}
```

#### Timed Research (`timed-research`)

```json
{
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
}
```

#### Max Battles (`max-battles`)

```json
{
    "featured": [...],
    "bonuses": ["2× Max Particles from battles"],
    "gigantamax": [...],
    "dynamax": [...]
}
```

#### Max Mondays (`max-mondays`)

```json
{
    "featured": {
        "name": "Gigantamax Pikachu",
        "image": "...",
        "canBeShiny": true
    },
    "bonus": "2× Max Particles"
}
```

#### GO Pass (`go-pass`)

```json
{
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
}
```

#### PokéStop Showcases (`pokestop-showcase`)

```json
{
    "featured": [...],
    "description": "Enter your best Pokémon in PokéStop Showcases"
}
```

---

## Raids Endpoint

### Endpoints
- **Formatted**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/raids.json`
- **Minimized**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/raids.min.json`

### Example Raid Object

```json
{
    "name": "Thundurus",
    "originalName": "Thundurus (Incarnate)",
    "form": "Incarnate",
    "gender": null,
    "tier": "5-Star Raids",
    "isShadowRaid": false,
    "eventStatus": "ongoing",
    "canBeShiny": true,
    "types": [
        {
            "name": "electric",
            "image": "https://leekduck.com/assets/img/types/electric.png"
        },
        {
            "name": "flying",
            "image": "https://leekduck.com/assets/img/types/flying.png"
        }
    ],
    "combatPower": {
        "normal": {
            "min": 1828,
            "max": 1911
        },
        "boosted": {
            "min": 2285,
            "max": 2389
        }
    },
    "boostedWeather": [
        {
            "name": "rainy",
            "image": "https://leekduck.com/assets/img/weather/rainy.png"
        },
        {
            "name": "windy",
            "image": "https://leekduck.com/assets/img/weather/windy.png"
        }
    ],
    "image": "https://cdn.leekduck.com/assets/img/pokemon_icons/pm642.fINCARNATE.icon.png"
}
```

### Raid Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | The cleaned name of the Pokémon (form and gender removed). |
| `originalName` | `string` | The original name as displayed on the site (includes form/gender). |
| `form` | `string\|null` | The form of the Pokémon (e.g., `Incarnate`, `Origin`, `Alola`), or `null` if none. |
| `gender` | `string\|null` | The gender of the Pokémon (`male`, `female`), or `null` if not specified. |
| `tier` | `string` | The raid tier. Can be `1-Star Raids`, `3-Star Raids`, `5-Star Raids`, `Mega Raids`. |
| `isShadowRaid` | `boolean` | Whether this is a Shadow Raid boss. |
| `eventStatus` | `string` | The status. Can be `ongoing`, `upcoming`, `inactive`, `unknown`. |
| `canBeShiny` | `boolean` | Whether the Pokémon can be shiny. |
| `types` | `Type[]` | The type(s) of the Pokémon. |
| `combatPower` | `CombatPower` | The combat power range for catching. |
| `boostedWeather` | `Weather[]` | Weather types that boost CP. |
| `image` | `string` | The image URL of the Pokémon. |
| `imageWidth` | `number` | The width of the Pokémon image in pixels. |
| `imageHeight` | `number` | The height of the Pokémon image in pixels. |
| `imageType` | `string` | The image file type (e.g., `PNG`, `JPG`). |

### Type Object

```json
{
    "name": "fire",
    "image": "https://www.leekduck.com/assets/img/types/fire.png"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | The name of the type (lowercase). |
| `image` | `string` | The image URL of the type icon. |

### CombatPower Object

```json
{
    "normal": {
        "min": 988,
        "max": 1048
    },
    "boosted": {
        "min": 1235,
        "max": 1311
    }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `normal.min` | `int` | The minimum normal combat power. |
| `normal.max` | `int` | The maximum normal combat power. |
| `boosted.min` | `int` | The minimum weather-boosted combat power. |
| `boosted.max` | `int` | The maximum weather-boosted combat power. |

### Weather Object

```json
{
    "name": "foggy",
    "image": "https://www.leekduck.com/assets/img/weather/foggy.png"
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | The weather type. Can be `sunnyclear`, `rainy`, `partly`, `cloudy`, `windy`, `snow`, `fog`. |
| `image` | `string` | The image URL of the weather icon. |

---

## Research Endpoint

### Endpoints
- **Formatted**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/research.json`
- **Minimized**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/research.min.json`

### Example Research Object (Item Reward)

```json
{
    "text": "Purify 3 Shadow Pokémon",
    "type": "rocket",
    "rewards": [
        {
            "type": "item",
            "name": "Fast TM",
            "quantity": 1,
            "image": "https://cdn.leekduck.com/assets/img/items/Fast%20TM.png"
        },
        {
            "type": "item",
            "name": "Charged TM",
            "quantity": 1,
            "image": "https://cdn.leekduck.com/assets/img/items/Charged%20TM.png"
        }
    ]
}
```

### Example Research Object (Encounter Reward)

```json
{
    "text": "Catch 5 Pokémon",
    "type": "catch",
    "rewards": [
        {
            "type": "encounter",
            "name": "Misdreavus",
            "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm200.icon.png",
            "canBeShiny": true,
            "combatPower": {
                "min": 779,
                "max": 825
            }
        }
    ]
}
```

### Research Fields

| Field | Type | Description |
|-------|------|-------------|
| `text` | `string` | The research task text. |
| `type` | `string` | The type of research. Can be `event`, `catch`, `throw`, `battle`, `explore`, `training`, `rocket`, `buddy`, `ar`, `sponsored`. |
| `rewards` | `Reward[]` | The rewards for completing the research task. |

### Reward Object

Rewards can be one of three types: `encounter`, `item`, or `resource`.

#### Common Fields (All Reward Types)

| Field | Type | Description |
|-------|------|-------------|
| `type` | `string` | The type of reward. Can be `encounter`, `item`, `resource`. |
| `name` | `string` | The name of the reward (Pokémon name or item name). |
| `image` | `string` | The image URL of the reward. |
| `imageWidth` | `number` | The width of the reward image in pixels. |
| `imageHeight` | `number` | The height of the reward image in pixels. |
| `imageType` | `string` | The image file type (e.g., `PNG`, `JPG`). |

#### Encounter-Only Fields

| Field | Type | Description |
|-------|------|-------------|
| `canBeShiny` | `boolean` | Whether the reward Pokémon can be shiny. |
| `combatPower.min` | `int` | The minimum combat power. |
| `combatPower.max` | `int` | The maximum combat power. |

#### Item/Resource-Only Fields

| Field | Type | Description |
|-------|------|-------------|
| `quantity` | `int` | The quantity of the item/resource rewarded. |

---

## Eggs Endpoint

### Endpoints
- **Formatted**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eggs.json`
- **Minimized**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eggs.min.json`

### Example Egg Object

```json
{
    "name": "Wailmer",
    "eggType": "2 km",
    "isAdventureSync": false,
    "image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_320_00.png",
    "canBeShiny": true,
    "combatPower": {
        "min": 779,
        "max": 838
    }
}
```

### Egg Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | The name of the hatched Pokémon. |
| `eggType` | `string` | The type of the egg. Can be `2 km`, `5 km`, `7 km`, `10 km`, `12 km`. |
| `isAdventureSync` | `boolean` | Whether the egg is obtained from Adventure Sync. |
| `isRegional` | `boolean` | Whether the Pokémon is regional. |
| `isGiftExchange` | `boolean` | Whether the egg is obtained from gift exchanges (7 km eggs). |
| `rarity` | `string` | The rarity tier of the Pokémon in the egg pool (e.g., `Common`, `Rare`, `Ultra Rare`). |
| `image` | `string` | The image URL of the hatched Pokémon. |
| `imageWidth` | `number` | The width of the Pokémon image in pixels. |
| `imageHeight` | `number` | The height of the Pokémon image in pixels. |
| `imageType` | `string` | The image file type (e.g., `PNG`, `JPG`). |
| `canBeShiny` | `boolean` | Whether the hatched Pokémon can be shiny. |
| `combatPower.min` | `int` | The minimum combat power of the hatched Pokémon. |
| `combatPower.max` | `int` | The maximum combat power of the hatched Pokémon. |

---

## Rocket Lineups Endpoint

### Endpoints
- **Formatted**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/rocketLineups.json`
- **Minimized**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/rocketLineups.min.json`

### Example Rocket Lineup Object

```json
{
    "name": "Cliff",
    "title": "Team GO Rocket Leader",
    "type": "",
    "firstPokemon": [
        {
            "name": "Magikarp",
            "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm129.icon.png",
            "types": ["water"],
            "weaknesses": {
                "double": [],
                "single": ["grass", "electric"]
            },
            "isEncounter": true,
            "canBeShiny": true
        }
    ],
    "secondPokemon": [
        {
            "name": "Cradily",
            "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm346.icon.png",
            "types": ["rock", "grass"],
            "weaknesses": {
                "double": [],
                "single": ["ice", "fighting", "bug", "steel"]
            },
            "isEncounter": false,
            "canBeShiny": false
        }
    ],
    "thirdPokemon": [
        {
            "name": "Tyranitar",
            "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm248.icon.png",
            "types": ["rock", "dark"],
            "weaknesses": {
                "double": ["fighting"],
                "single": ["ground", "bug", "steel", "water", "grass", "fairy"]
            },
            "isEncounter": false,
            "canBeShiny": false
        }
    ]
}
```

### Rocket Lineup Fields

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | The name of the Rocket member (e.g., `Giovanni`, `Cliff`, `Fire-type Female Grunt`). |
| `title` | `string` | The title. Can be `Team GO Rocket Boss`, `Team GO Rocket Leader`, `Team GO Rocket Grunt`. |
| `type` | `string` | The type specialization of the grunt (empty for Leaders/Giovanni). |
| `firstPokemon` | `ShadowPokemon[]` | The possible Pokémon in the first slot. |
| `secondPokemon` | `ShadowPokemon[]` | The possible Pokémon in the second slot. |
| `thirdPokemon` | `ShadowPokemon[]` | The possible Pokémon in the third slot. |

### ShadowPokemon Object

```json
{
    "name": "Magikarp",
    "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm129.icon.png",
    "types": ["water"],
    "weaknesses": {
        "double": [],
        "single": ["grass", "electric"]
    },
    "isEncounter": true,
    "canBeShiny": true
}
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | The name of the Shadow Pokémon. |
| `image` | `string` | The image URL of the Pokémon. |
| `imageWidth` | `number` | The width of the Pokémon image in pixels. |
| `imageHeight` | `number` | The height of the Pokémon image in pixels. |
| `imageType` | `string` | The image file type (e.g., `PNG`, `JPG`). |
| `types` | `string[]` | The type(s) of the Pokémon (lowercase). |
| `weaknesses` | `Weaknesses` | The weaknesses of the Pokémon. |
| `isEncounter` | `boolean` | Whether this Pokémon can be caught after winning. |
| `canBeShiny` | `boolean` | Whether the Pokémon can be shiny when encountered. |

### Weaknesses Object

```json
{
    "double": ["fighting"],
    "single": ["ground", "bug", "steel", "water", "grass", "fairy"]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `double` | `string[]` | Types that deal 4× (double) super-effective damage. |
| `single` | `string[]` | Types that deal 2× (single) super-effective damage. |

---

## Shinies Endpoint

### Endpoints
- **Formatted**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/shinies.json`
- **Minimized**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/shinies.min.json`

**Data Source**: [LeekDuck Shiny Database](https://leekduck.com/shiny/)

### Overview

The Shinies endpoint provides comprehensive data about which Pokémon have shiny variants available in Pokémon GO, including Pokémon names, release dates, regional variants, and form information.

This data is used internally by other endpoints (Raids, Eggs, Research) to augment their `canBeShiny` fields with authoritative information.

### Response Structure

```json
{
    "lastUpdated": "2026-01-24T20:15:45.514Z",
    "source": "LeekDuck",
    "sourceUrl": "https://leekduck.com/shiny/",
    "totalShinies": 272,
    "shinies": [...]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `lastUpdated` | `string` (ISO 8601) | Timestamp of when the data was last scraped. |
| `source` | `string` | Name of the source. |
| `sourceUrl` | `string` | URL to the source page. |
| `totalShinies` | `number` | Total count of unique Pokémon entries with shiny variants. |
| `shinies` | `array` | Array of Pokémon with shiny data. |

### Shiny Entry Structure

```json
{
    "dexNumber": 1,
    "name": "Bulbasaur",
    "releasedDate": "2018/03/25",
    "family": "Bulbasaur",
    "typeCode": null,
    "forms": [
        {
            "name": "f19",
            "imageUrl": "https://cdn.jsdelivr.net/gh/PokeMiners/pogo_assets/Images/Pokemon%20-%20256x256/pm0001_00_pgo_fall2019_shiny.png",
            "width": 256,
            "height": 256
        },
        {
            "name": "11",
            "imageUrl": "https://cdn.jsdelivr.net/gh/PokeMiners/pogo_assets/Images/Pokemon%20-%20256x256/pokemon_icon_001_00_shiny.png",
            "width": 256,
            "height": 256
        }
    ],
    "imageUrl": "https://cdn.jsdelivr.net/gh/PokeMiners/pogo_assets/Images/Pokemon%20-%20256x256/pokemon_icon_001_00_shiny.png",
    "width": 256,
    "height": 256
}
```

### Shiny Entry Fields

| Field | Type | Description |
|-------|------|-------------|
| `dexNumber` | `number` | National Pokédex number. |
| `name` | `string` | English name (includes regional prefix if applicable). |
| `releasedDate` | `string\|null` | Date when the shiny was first released (YYYY/MM/DD format). |
| `family` | `string\|null` | Evolution family identifier. |
| `typeCode` | `string\|null` | Regional variant code (see below). |
| `forms` | `array` | Array of alternative forms/costumes. |
| `imageUrl` | `string` | URL to the base shiny sprite image. |
| `width` | `number` | Image width in pixels (always 256). |
| `height` | `number` | Image height in pixels (always 256). |

### Regional Variant Type Codes

| Code | Region |
|------|--------|
| `_61` | Alolan |
| `_31` | Galarian |
| `_51` | Hisuian |
| `_52` | Paldean |

### Form Entry Structure

| Field | Type | Description |
|-------|------|-------------|
| `name` | `string` | Form identifier (e.g., "f19" for Fall 2019, "11" for costume variant). |
| `imageUrl` | `string` | URL to the form's shiny sprite image. |
| `width` | `number` | Image width in pixels (always 256). |
| `height` | `number` | Image height in pixels (always 256). |

### Regional Variant Example

```json
{
    "dexNumber": 37,
    "name": "Alolan Vulpix",
    "releasedDate": "2019/06/04",
    "family": "Vulpix_61",
    "typeCode": "_61",
    "imageUrl": "https://cdn.jsdelivr.net/gh/PokeMiners/pogo_assets/Images/Pokemon%20-%20256x256/pokemon_icon_037_61_shiny.png",
    "width": 256,
    "height": 256
}
```

### Integration with Other Endpoints

The shiny data is automatically integrated into these endpoints:
- **Raids** (`/raids.json`) - Each boss has `canBeShiny` cross-referenced
- **Eggs** (`/eggs.json`) - Each Pokémon has `canBeShiny` cross-referenced
- **Research** (`/research.json`) - Each encounter reward has `canBeShiny` cross-referenced

The `canBeShiny` field in these endpoints uses **both**:
1. The shiny icon indicator from LeekDuck's website
2. The authoritative shiny data from this endpoint

This dual-check ensures maximum accuracy.

---

## Common Data Types

### Pokémon Object (Generic)

Used across multiple endpoints for listing Pokémon:

```json
{
    "name": "Pikachu",
    "image": "https://www.leekduck.com/assets/img/pokemon_icons/pokemon_icon_025_00.png",
    "canBeShiny": true
}
```

### Bonus Object

Used in event bonuses:

```json
{
    "text": "2× Catch XP",
    "image": "https://www.leekduck.com/assets/img/events/bonuses/catchxp.png"
}
```

### Task Object

Used in research tasks:

```json
{
    "text": "Catch 5 Pokémon",
    "reward": {
        "text": "Poké Ball ×10",
        "image": "https://www.leekduck.com/assets/img/items/Pok%C3%A9%20Ball.png"
    }
}
```

### Price Object

Used for ticketed events:

```json
{
    "price": 5.00,
    "description": "Event ticket"
}
```

---

## Usage Examples

### JavaScript - Fetch Events

```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/events.json')
    .then(r => r.json())
    .then(events => {
        // Filter for ongoing Community Days
        const communityDays = events.filter(e => 
            e.eventType === 'community-day' && 
            new Date(e.end) > new Date()
        );
        console.log(communityDays);
    });
```

### JavaScript - Check Shiny Availability

```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/shinies.json')
    .then(r => r.json())
    .then(data => {
        const bulbasaur = data.shinies.find(p => 
            p.dexNumber === 1 && !p.typeCode
        );
        console.log(`Bulbasaur shiny released: ${bulbasaur?.releasedDate}`);
    });
```

### JavaScript - Get Raid Bosses by Tier

```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/raids.json')
    .then(r => r.json())
    .then(raids => {
        const fiveStarRaids = raids.filter(r => 
            r.tier === '5-Star Raids' && 
            r.eventStatus === 'ongoing'
        );
        console.log(fiveStarRaids);
    });
```

### JavaScript - Find Research Encounters

```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/research.json')
    .then(r => r.json())
    .then(research => {
        const encounters = research.filter(r => 
            r.rewards.some(reward => reward.type === 'encounter')
        );
        console.log(encounters);
    });
```

### JavaScript - Get All Alolan Shinies

```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/shinies.json')
    .then(r => r.json())
    .then(data => {
        const alolan = data.shinies.filter(p => p.typeCode === '_61');
        console.log(`${alolan.length} Alolan Pokémon have shinies`);
        alolan.forEach(p => console.log(p.name));
    });
```

### JavaScript - Get Rocket Leader Counters

```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/rocketLineups.json')
    .then(r => r.json())
    .then(lineups => {
        const cliff = lineups.find(l => l.name === 'Cliff');
        console.log('Cliff first slot weaknesses:');
        cliff.firstPokemon.forEach(p => {
            console.log(`${p.name}: ${[...p.weaknesses.double, ...p.weaknesses.single].join(', ')}`);
        });
    });
```

---

## Appendix: Full Event Types Reference

| Category | Event Type | Description |
|----------|------------|-------------|
| Events | `community-day` | Monthly Community Day events |
| Events | `event` | Generic in-game events |
| Events | `live-event` | In-person live events |
| Events | `pokemon-go-fest` | Annual GO Fest events |
| Events | `global-challenge` | Global community challenges |
| Events | `safari-zone` | Safari Zone events |
| Events | `ticketed-event` | Paid ticket events |
| Events | `location-specific` | Location-based events |
| Events | `bonus-hour` | Miscellaneous bonus hours |
| Events | `pokemon-spotlight-hour` | Weekly Spotlight Hours |
| Events | `potential-ultra-unlock` | Ultra Unlock potential rewards |
| Events | `update` | Game updates |
| Events | `season` | Seasonal content |
| Events | `pokemon-go-tour` | Annual GO Tour events |
| Events | `go-pass` | GO Pass seasons |
| Events | `ticketed` | Generic ticketed content |
| Events | `pokestop-showcase` | PokéStop Showcase events |
| Events | `wild-area` | Wild Area events |
| Events | `city-safari` | City Safari events |
| Research | `research` | Generic research |
| Research | `timed-research` | Time-limited research |
| Research | `limited-research` | Limited availability research |
| Research | `research-breakthrough` | Weekly research breakthrough |
| Research | `special-research` | Special research storylines |
| Research | `research-day` | Research Day events |
| Raids | `raid-day` | Raid Day events |
| Raids | `raid-battles` | Raid boss rotations |
| Raids | `raid-hour` | Weekly Raid Hours |
| Raids | `raid-weekend` | Raid Weekend events |
| Raids | `go-battle-league` | GBL seasons and cups |
| Raids | `elite-raids` | Elite Raid events |
| Raids | `max-battles` | Dynamax/Gigantamax battles |
| Raids | `max-mondays` | Weekly Max Monday events |
| Rocket | `go-rocket-takeover` | Rocket Takeover events |
| Rocket | `team-go-rocket` | Team GO Rocket rotations |
| Rocket | `giovanni-special-research` | Giovanni research events |

---

*This consolidated documentation was generated from the individual endpoint documentation files in the scrapedPoGo repository.*
