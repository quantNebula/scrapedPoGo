# Raids Data

## Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/raids.min.json`

## JSON Schema

The data structure is formally defined by the [JSON Schema](../schemas/raids.schema.json).

You can validate data against this schema or use it to generate types for your application.

## Example Raid Object

```json
{
    "name": "Ekans",
    "originalName": "Ekans",
    "form": null,
    "gender": null,
    "tier": "1-Star Raids",
    "isShadowRaid": false,
    "eventStatus": "unknown",
    "canBeShiny": true,
    "types": [
        {
            "name": "poison",
            "image": "https://leekduck.com/assets/img/types/poison.png"
        }
    ],
    "combatPower": {
        "normal": {
            "min": 487,
            "max": 529
        },
        "boosted": {
            "min": 609,
            "max": 662
        }
    },
    "boostedWeather": [
        {
            "name": "cloudy",
            "image": "https://leekduck.com/assets/img/weather/cloudy.png"
        }
    ],
    "image": "https://cdn.leekduck.com/assets/img/pokemon_icons/pm23.icon.png",
    "imageWidth": 256,
    "imageHeight": 256,
    "imageType": "png"
}
```
## Fields

| Field                | Type          | Description
|--------------------- |-------------- |---------------------
| **`name`**           | `string`      | The cleaned name of the Pokemon (form and gender removed).
| **`originalName`**   | `string`      | The original name as displayed on the site (includes form/gender).
| **`form`**           | `string\|null` | The form of the Pokemon (e.g., `Incarnate`, `Origin`, `Alola`), or `null` if none.
| **`gender`**         | `string\|null` | The gender of the Pokemon (`male`, `female`), or `null` if not specified.
| **`tier`**           | `string`      | The raid tier of the Pokemon.<br />Can be `1-Star Raids`, `3-Star Raids`, `5-Star Raids`, `Mega Raids`
| **`isShadowRaid`**   | `boolean`     | Whether this is a Shadow Raid boss.
| **`eventStatus`**    | `string`      | The status of the raid event.<br />Can be `ongoing`, `upcoming`, `inactive`, `unknown`
| **`canBeShiny`**     | `boolean`     | Whether or not the Pokemon can be shiny.
| **`types`**          | `Type[]`      | The type(s) of the Pokemon. See [Type](#Type).
| **`combatPower`**    | `CombatPower` | The combat power range the Pokemon can be caught with. See [CombatPower](#CombatPower).
| **`boostedWeather`** | `Weather[]`   | The type(s) of weather that boost the Pokemon's combat power. See [Weather](#Weather).
| **`image`**          | `string`      | The image URL of the Pokemon.
| **`imageWidth`**     | `int`         | The width of the image in pixels.
| **`imageHeight`**    | `int`         | The height of the image in pixels.
| **`imageType`**      | `string`      | The image format (e.g., `png`).

## Other Objects

### Type

#### Example Object

```json
{
    "name": "fire",
    "image": "https://www.leekduck.com/assets/img/types/fire.png"
}
```

#### Fields

| Field       | Type     | Description
|------------ |--------- |---------------------
| **`name`**  | `string` | The name of the type
| **`image`** | `string` | The image of the type. 

### CombatPower

#### Example Object

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

#### Fields

| Field             | Type  | Description
|------------------ |------ |---------------------
| **`normal.min`**  | `int` | The minimum normal combat power of the Pokemon.
| **`normal.max`**  | `int` | The maximum normal combat power of the Pokemon.
| **`boosted.min`** | `int` | The minimum boosted combat power of the Pokemon.
| **`boosted.max`** | `int` | The maximum boosted combat power of the Pokemon.

### Weather

#### Example Object

```json
{
    "name": "foggy",
    "image": "https://www.leekduck.com/assets/img/weather/foggy.png"
}
```

#### Fields

| Field       | Type     | Description
|------------ |--------- |---------------------
| **`name`**  | `string` | The name of the weather type.<br />Can be `sunny`, `rainy`, `partly cloudy`, `cloudy`, `windy`, `snow`, `fog`
| **`image`** | `string` | The image of the weather type.
