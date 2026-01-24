# Endpoints

- Formatted: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/research.json`
- Minimized: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/research.min.json`

# Example Research Object

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

## Example Research Object with Encounter Reward

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

## Example Research Object without Type

```json
{
    "text": "Defeat a Team GO Rocket Grunt",
    "rewards": [
        {
            "type": "item",
            "name": "Mysterious Component",
            "quantity": 1,
            "image": "https://cdn.leekduck.com/assets/img/items/Mysterious%20Component.png"
        }
    ]
}
```
# Fields

| Field         | Type     | Description
|-------------- |--------- |---------------------
| **`text`**    | `string` | The research task text.
| **`type`**    | `string` (optional) | The type of research.<br />Can be `event`, `catch`, `throw`, `battle`, `explore`, `training`, `rocket`, `buddy`, `ar`, `sponsored`<br />Note: This field is optional and may not be present in all research objects.
| **`rewards`** | `Reward` | The rewards for completing the research Task. See [Reward](#Reward)

# Other Objects

## Reward

Rewards can be one of three types: `encounter`, `item`, or `resource`. The fields available depend on the reward type.

### Encounter Reward Example

```json
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
```

### Item/Resource Reward Example

```json
{
    "type": "item",
    "name": "Rare Candy",
    "quantity": 3,
    "image": "https://cdn.leekduck.com/assets/img/items/Rare%20Candy.png"
}
```

### Common Fields (All Reward Types)

| Field       | Type     | Description
|------------ |--------- |---------------------
| **`type`**  | `string` | The type of reward.<br />Can be `encounter`, `item`, `resource`
| **`name`**  | `string` | The name of the reward (Pokemon name or item name).
| **`image`** | `string` | The image of the reward.

### Encounter-Only Fields

| Field                 | Type      | Description
|---------------------- |---------- |---------------------
| **`canBeShiny`**      | `boolean` | Whether or not the reward Pokemon can be shiny.
| **`combatPower.min`** | `int`     | The minimum combat power of the reward Pokemon.
| **`combatPower.max`** | `int`     | The maximum combat power of the reward Pokemon.

### Item/Resource-Only Fields

| Field          | Type  | Description
|--------------- |------ |---------------------
| **`quantity`** | `int` | The quantity of the item/resource rewarded.
