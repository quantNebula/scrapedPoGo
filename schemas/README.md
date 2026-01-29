# JSON Schemas for scrapedPoGo Data

This directory contains JSON Schema definitions for all the data files produced by scrapedPoGo.

## Available Schemas

| Schema File | Data File | Description |
|-------------|-----------|-------------|
| [eggs.schema.json](eggs.schema.json) | `data/eggs.min.json` | Pokemon egg hatch data |
| [events.schema.json](events.schema.json) | `data/events.min.json` | Pokemon GO events data |
| [raids.schema.json](raids.schema.json) | `data/raids.min.json` | Raid boss data |
| [research.schema.json](research.schema.json) | `data/research.min.json` | Field research tasks and rewards |
| [rocketLineups.schema.json](rocketLineups.schema.json) | `data/rocketLineups.min.json` | Team GO Rocket lineup data |
| [shinies.schema.json](shinies.schema.json) | `data/shinies.min.json` | Shiny Pokemon availability data |

## Using the Schemas

### Validation

You can validate the data files against their schemas using a JSON Schema validator. For example, using [ajv-cli](https://github.com/ajv-validator/ajv-cli):

```bash
# Install ajv-cli
npm install -g ajv-cli

# Validate a data file
ajv validate -s schemas/eggs.schema.json -d data/eggs.min.json
```

### In Your Application

You can use these schemas to validate data in your application. Example using the [ajv](https://ajv.js.org/) library:

```javascript
const Ajv = require('ajv');
const ajv = new Ajv();

// Load schema
const schema = require('./schemas/eggs.schema.json');
const validate = ajv.compile(schema);

// Load and validate data
const data = require('./data/eggs.min.json');
const valid = validate(data);

if (!valid) {
  console.log('Validation errors:', validate.errors);
}
```

### TypeScript Type Generation

You can generate TypeScript types from these schemas using tools like [json-schema-to-typescript](https://github.com/bcherny/json-schema-to-typescript):

```bash
# Install json-schema-to-typescript
npm install -g json-schema-to-typescript

# Generate TypeScript types
json2ts -i schemas/eggs.schema.json -o types/eggs.d.ts
```

## Schema Details

All schemas follow the [JSON Schema Draft-07](https://json-schema.org/draft-07/json-schema-release-notes.html) specification.

### Common Fields

Most Pokemon-related objects in the schemas include:
- `name`: Pokemon or item name
- `image`: URL to the image
- `imageWidth`, `imageHeight`, `imageType`: Image metadata

### Validation Rules

The schemas include validation rules such as:
- Required fields
- Type constraints (string, number, boolean, etc.)
- Enums for fields with fixed values
- Pattern matching for dates and URLs
- Min/max constraints for numbers

## Contributing

When adding new fields to the scrapers:
1. Update the corresponding schema file
2. Add field descriptions
3. Include appropriate validation rules
4. Update this README if needed

## Resources

- [JSON Schema Documentation](https://json-schema.org/)
- [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/)
- [JSON Schema Validator](https://www.jsonschemavalidator.net/)
