# Shinies Data

**URL**: `https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/shinies.min.json`  

## JSON Schema

The data structure is formally defined by the [JSON Schema](../schemas/shinies.schema.json).

You can validate data against this schema or use it to generate types for your application.

## Overview

The Shinies endpoint provides comprehensive data about which Pokémon have shiny variants available in Pokémon GO, including Pokemon names, release dates, regional variants, and form information.

This data is used internally by other endpoints (Raids, Eggs, Research) to augment their `canBeShiny` fields with authoritative information.

## Update Frequency

This endpoint is updated with the same frequency as other endpoints, as it sources data directly from LeekDuck's shiny database.

To update manually, run:
```bash
npm run scrapeshinies
```

## Response Structure

The endpoint returns a JSON array of shiny Pokémon entries:

```json
[
  {
    "dexNumber": 1,
    "name": "Bulbasaur",
    "releasedDate": "2018/03/25",
    "family": "Bulbasaur",
    "typeCode": null,
    "forms": [...],
    "imageUrl": "...",
    "width": 256,
    "height": 256
  },
  ...
]
```

## Shiny Entry Structure

Each entry in the `shinies` array represents a Pokémon (or regional variant) with shiny availability:

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

### Shiny Fields

| Field | Type | Description |
|-------|------|-------------|
| `dexNumber` | number | National Pokédex number |
| `name` | string | English name of the Pokémon (includes regional prefix if applicable) |
| `releasedDate` | string\|null | Date when the shiny was first released (YYYY/MM/DD format) |
| `family` | string\|null | Evolution family identifier |
| `typeCode` | string\|null | Regional variant code (`_61` = Alolan, `_31` = Galarian, `_51` = Hisuian, `_52` = Paldean) |
| `forms` | array | Array of alternative forms/costumes for this Pokémon |
| `imageUrl` | string | URL to the base shiny sprite image |
| `width` | number | Image width in pixels (always 256) |
| `height` | number | Image height in pixels (always 256) |

## Form Entry Structure

Each form in the `forms` array represents a costume or variant:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Form identifier (e.g., "f19" for Fall 2019, "11" for costume variant) |
| `imageUrl` | string | URL to the form's shiny sprite image |
| `width` | number | Image width in pixels (always 256) |
| `height` | number | Image height in pixels (always 256) |

## Regional Variants

Regional variants are represented as separate entries with their own `dexNumber` and `typeCode`:

**Example - Alolan Vulpix**:
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

**Type Codes**:
- `_61`: Alolan form
- `_31`: Galarian form  
- `_51`: Hisuian form
- `_52`: Paldean form

## Integration with Other Endpoints

The shiny data is automatically integrated into these endpoints:

- **Raids** (`/raids.json`) - Each boss has `canBeShiny` cross-referenced
- **Eggs** (`/eggs.json`) - Each Pokémon has `canBeShiny` cross-referenced  
- **Research** (`/research.json`) - Each encounter reward has `canBeShiny` cross-referenced

The `canBeShiny` field in these endpoints uses **both**:
1. The shiny icon indicator from LeekDuck's website
2. The authoritative shiny data from this endpoint

This dual-check ensures maximum accuracy.

## Example Usage

### Check if a specific Pokémon has shiny
```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/shinies.min.json')
  .then(r => r.json())
  .then(data => {
    const bulbasaur = data.find(p => 
      p.dexNumber === 1 && !p.typeCode
    );
    console.log(`Bulbasaur shiny released: ${bulbasaur?.releasedDate}`);
  });
```

### Get all Pokémon with costume variants
```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/shinies.min.json')
  .then(r => r.json())
  .then(data => {
    const withCostumes = data.filter(p => 
      p.forms && p.forms.length > 0
    );
    console.log(`${withCostumes.length} Pokémon have costume shiny variants`);
  });
```

### Find all Alolan shinies
```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/shinies.min.json')
  .then(r => r.json())
  .then(data => {
    const alolan = data.filter(p => p.typeCode === '_61');
    console.log(`${alolan.length} Alolan Pokémon have shinies`);
    alolan.forEach(p => console.log(p.name));
  });
```

### Get shinies released in a specific year
```javascript
fetch('https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/shinies.min.json')
  .then(r => r.json())
  .then(data => {
    const year2018 = data.filter(p => 
      p.releasedDate?.startsWith('2018/')
    );
    console.log(`${year2018.length} shinies released in 2018`);
  });
```
