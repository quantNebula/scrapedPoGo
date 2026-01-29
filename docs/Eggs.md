# Eggs Data

## Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/eggs.min.json`

## JSON Schema

The data structure is formally defined by the [JSON Schema](../schemas/eggs.schema.json).

You can validate data against this schema or use it to generate types for your application.

## Example Egg Object

```json
{
    "name": "Bulbasaur",
    "eggType": "1 km",
    "isAdventureSync": false,
    "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm1.icon.png",
    "canBeShiny": true,
    "combatPower": {
        "min": 637,
        "max": 637
    },
    "isRegional": false,
    "isGiftExchange": false,
    "rarity": 4,
    "imageWidth": 107,
    "imageHeight": 126,
    "imageType": "png"
}
```
## Fields

| Field                 | Type      | Description
|---------------------- |---------- |---------------------
| **`name`**            | `string`  | The name of the hatched Pokemon.
| **`eggType`**         | `string`  | The type of the egg.<br />Can be `1 km`, `2 km`, `5 km`, `7 km`, `10 km`, `12 km`
| **`isAdventureSync`** | `boolean` | Whether or not the egg is obtained from Adventure Sync.
| **`isRegional`**      | `boolean` | Whether or not the hatched Pokemon is a regional exclusive.
| **`isGiftExchange`**  | `boolean` | Whether or not the egg is obtained from gift exchange.
| **`rarity`**          | `int`     | The rarity tier of the hatched Pokemon (1-5 scale).
| **`image`**           | `string`  | The image URL of the hatched Pokemon.
| **`canBeShiny`**      | `boolean` | Whether or not the hatched Pokemon can be shiny.
| **`combatPower.min`** | `int`     | The minimum combat power of the hatched Pokemon.
| **`combatPower.max`** | `int`     | The maximum combat power of the hatched Pokemon.
| **`imageWidth`**      | `int`     | The width of the image in pixels.
| **`imageHeight`**     | `int`     | The height of the image in pixels.
| **`imageType`**       | `string`  | The image format (e.g., `png`).
