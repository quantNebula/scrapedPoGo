# Research Data

## Endpoint

`https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/research.min.json`

## JSON Schema

The data structure is formally defined by the [JSON Schema](../schemas/research.schema.json).

You can validate data against this schema or use it to generate types for your application.

## Example Research Object

```json
{
    "text": "Defeat a Team GO Rocket Grunt",
    "type": "rocket",
    "rewards": [
        {
            "type": "item",
            "name": "Mysterious Component",
            "quantity": 1,
            "image": "https://cdn.leekduck.com/assets/img/items/Mysterious%20Component.png",
            "imageWidth": 512,
            "imageHeight": 512,
            "imageType": "png"
        }
    ]
}
```

## Example Research Object with Encounter Reward

```json
{
    "text": "Earn a Candy exploring with your buddy",
    "type": "buddy",
    "rewards": [
        {
            "type": "encounter",
            "name": "Fidough",
            "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm926.icon.png",
            "canBeShiny": true,
            "combatPower": {
                "min": 389,
                "max": 422
            },
            "imageWidth": 91,
            "imageHeight": 79,
            "imageType": "png"
        }
    ]
}
```
## Fields

| Field         | Type            | Description
|-------------- |---------------- |---------------------
| **`text`**    | `string`        | The research task text.
| **`type`**    | `string\|null`  | The type of research (optional).<br />Can be `event`, `catch`, `throw`, `battle`, `explore`, `training`, `rocket`, `buddy`, `ar`, `sponsored`, or `null` if not specified
| **`rewards`** | `Reward[]`      | The rewards for completing the research task. See [Reward](#Reward)

## Other Objects

### Reward

Rewards can be one of three types: `encounter`, `item`, or `resource`. The fields available depend on the reward type.

#### Encounter Reward Example

```json
{
    "type": "encounter",
    "name": "Fidough",
    "image": "https://cdn.leekduck.com/assets/img/pokemon_icons_crop/pm926.icon.png",
    "canBeShiny": true,
    "combatPower": {
        "min": 389,
        "max": 422
    },
    "imageWidth": 91,
    "imageHeight": 79,
    "imageType": "png"
}
```

#### Item/Resource Reward Example

```json
{
    "type": "item",
    "name": "Mysterious Component",
    "quantity": 1,
    "image": "https://cdn.leekduck.com/assets/img/items/Mysterious%20Component.png",
    "imageWidth": 512,
    "imageHeight": 512,
    "imageType": "png"
}
```

#### Common Fields (All Reward Types)

| Field            | Type     | Description
|----------------- |--------- |---------------------
| **`type`**       | `string` | The type of reward.<br />Can be `encounter`, `item`, `resource`
| **`name`**       | `string` | The name of the reward (Pokemon name or item name).
| **`image`**      | `string` | The image URL of the reward.
| **`imageWidth`** | `int`    | The width of the image in pixels.
| **`imageHeight`**| `int`    | The height of the image in pixels.
| **`imageType`**  | `string` | The image format (e.g., `png`).

### Encounter-Only Fields

| Field                 | Type      | Description
|---------------------- |---------- |---------------------
| **`canBeShiny`**      | `boolean` | Whether or not the reward Pokemon can be shiny.
| **`combatPower.min`** | `int`     | The minimum combat power of the reward Pokemon.
| **`combatPower.max`** | `int`     | The maximum combat power of the reward Pokemon.

#### Item/Resource-Only Fields

| Field          | Type  | Description
|--------------- |------ |---------------------
| **`quantity`** | `int` | The quantity of the item/resource rewarded.
