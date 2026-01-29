#!/usr/bin/env node

/**
 * Validate data files against their JSON schemas
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const fs = require('fs');
const path = require('path');

// Initialize AJV with formats support
const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

// Schema to data file mappings
const validations = [
  { schema: 'schemas/eggs.schema.json', data: 'data/eggs.min.json' },
  { schema: 'schemas/events.schema.json', data: 'data/events.min.json' },
  { schema: 'schemas/raids.schema.json', data: 'data/raids.min.json' },
  { schema: 'schemas/research.schema.json', data: 'data/research.min.json' },
  { schema: 'schemas/rocketLineups.schema.json', data: 'data/rocketLineups.min.json' },
  { schema: 'schemas/shinies.schema.json', data: 'data/shinies.min.json' }
];

let allValid = true;
let totalValidations = 0;
let successfulValidations = 0;

console.log('🔍 Validating data files against schemas...\n');

for (const { schema, data } of validations) {
  const schemaPath = path.join(__dirname, '..', schema);
  const dataPath = path.join(__dirname, '..', data);
  
  // Check if files exist
  if (!fs.existsSync(schemaPath)) {
    console.log(`❌ ${data}: Schema file not found (${schema})`);
    totalValidations++;
    allValid = false;
    continue;
  }
  
  if (!fs.existsSync(dataPath)) {
    console.log(`⚠️  ${data}: Data file not found, skipping validation`);
    continue;
  }
  
  totalValidations++;
  
  try {
    // Load schema and data
    const schemaContent = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
    const dataContent = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    // Compile and validate
    const validate = ajv.compile(schemaContent);
    const valid = validate(dataContent);
    
    if (valid) {
      console.log(`✅ ${data}: Valid (${Array.isArray(dataContent) ? dataContent.length : 1} items)`);
      successfulValidations++;
    } else {
      console.log(`❌ ${data}: Invalid`);
      console.log('   Errors:');
      validate.errors.forEach((error, idx) => {
        const instancePath = error.instancePath || '/';
        console.log(`   ${idx + 1}. ${instancePath}: ${error.message}`);
        if (error.params) {
          console.log(`      Params: ${JSON.stringify(error.params)}`);
        }
      });
      allValid = false;
    }
  } catch (error) {
    console.log(`❌ ${data}: Error during validation`);
    console.log(`   ${error.message}`);
    allValid = false;
  }
  
  console.log('');
}

// Summary
console.log('━'.repeat(60));
console.log(`Summary: ${successfulValidations}/${totalValidations} validations successful`);

if (allValid) {
  console.log('✅ All data files are valid!');
  process.exit(0);
} else {
  console.log('❌ Some data files failed validation');
  process.exit(1);
}
