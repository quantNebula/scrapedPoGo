# Rocket Lineups Data

## Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/rocketLineups.min.json`

## JSON Schema

The data structure is formally defined by the [JSON Schema](../schemas/rocketLineups.schema.json).

You can validate data against this schema or use it to generate types for your application.

## Example Rocket Lineup Object

```json
{
    "name": "Cliff",
    "title": "Team GO Rocket Leader",
    "type": "",
    "firstPokemon": [
        {
            "name": "Magikarp",
            "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm129.icon.png",
            "types": [
                "water"
            ],
            "weaknesses": {
                "double": [],
                "single": [
                    "grass",
                    "electric"
                ]
            },
            "isEncounter": true,
            "canBeShiny": true
        }
    ],
    "secondPokemon": [
        {
            "name": "Cradily",
            "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm346.icon.png",
            "types": [
                "rock",
                "grass"
            ],
            "weaknesses": {
                "double": [],
                "single": [
                    "ice",
                    "fighting",
                    "bug",
                    "steel"
                ]
            },
            "isEncounter": false,
            "canBeShiny": false
        }
    ],
    "thirdPokemon": [
        {
            "name": "Tyranitar",
            "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm248.icon.png",
            "types": [
                "rock",
                "dark"
            ],
            "weaknesses": {
                "double": [
                    "fighting"
                ],
                "single": [
                    "ground",
                    "bug",
                    "steel",
                    "water",
                    "grass",
                    "fairy"
                ]
            },
            "isEncounter": false,
            "canBeShiny": false
        }
    ]
}
```

## Fields

| Field               | Type              | Description
|-------------------- |------------------ |---------------------
| **`name`**          | `string`          | The name of the Rocket member (e.g., `Giovanni`, `Cliff`, `Fire-type Female Grunt`).
| **`title`**         | `string`          | The title of the Rocket member.<br />Can be `Team GO Rocket Boss`, `Team GO Rocket Leader`, `Team GO Rocket Grunt`
| **`type`**          | `string`          | The type specialization of the grunt (empty for Leaders/Giovanni).
| **`firstPokemon`**  | `ShadowPokemon[]` | The possible Pokemon in the first slot. See [ShadowPokemon](#ShadowPokemon).
| **`secondPokemon`** | `ShadowPokemon[]` | The possible Pokemon in the second slot. See [ShadowPokemon](#ShadowPokemon).
| **`thirdPokemon`**  | `ShadowPokemon[]` | The possible Pokemon in the third slot. See [ShadowPokemon](#ShadowPokemon).

## Other Objects

### ShadowPokemon

#### Example Object

```json
{
    "name": "Magikarp",
    "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm129.icon.png",
    "types": [
        "water"
    ],
    "weaknesses": {
        "double": [],
        "single": [
            "grass",
            "electric"
        ]
    },
    "isEncounter": true,
    "canBeShiny": true
}
```

#### Fields

| Field                    | Type       | Description
|------------------------- |----------- |---------------------
| **`name`**               | `string`   | The name of the Shadow Pokemon.
| **`image`**              | `string`   | The image of the Shadow Pokemon.
| **`types`**              | `string[]` | The type(s) of the Pokemon (lowercase).
| **`weaknesses`**         | `Weaknesses` | The weaknesses of the Pokemon. See [Weaknesses](#Weaknesses).
| **`isEncounter`**        | `boolean`  | Whether this Pokemon can be caught after winning the battle.
| **`canBeShiny`**         | `boolean`  | Whether or not the Pokemon can be shiny when encountered.

### Weaknesses

#### Example Object

```json
{
    "double": [
        "fighting"
    ],
    "single": [
        "ground",
        "bug",
        "steel",
        "water",
        "grass",
        "fairy"
    ]
}
```

#### Fields

| Field        | Type       | Description
|------------- |----------- |---------------------
| **`double`** | `string[]` | Types that deal 4× (double) super-effective damage to this Pokemon.
| **`single`** | `string[]` | Types that deal 2× (single) super-effective damage to this Pokemon.
