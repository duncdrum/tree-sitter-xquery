#!/usr/bin/env node
// Validates tree-sitter.json against the JSON Schema its own "$schema"
// field points to. Usage: node scripts/validate-config.js <schema.json> <tree-sitter.json>

const fs = require("fs");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const [schemaPath, dataPath] = process.argv.slice(2);
if (!schemaPath || !dataPath) {
  console.error("usage: validate-config.js <schema.json> <data.json>");
  process.exit(2);
}

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);

const validate = ajv.compile(schema);
if (!validate(data)) {
  console.error(`${dataPath} is invalid:`);
  console.error(JSON.stringify(validate.errors, null, 2));
  process.exit(1);
}

console.log(`${dataPath} valid`);
