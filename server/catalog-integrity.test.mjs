import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";

const catalog = JSON.parse(fs.readFileSync("data/catalog.json", "utf8"));

function duplicates(values) {
  const seen = new Set();
  const duplicateValues = new Set();
  for (const value of values) {
    if (seen.has(value)) duplicateValues.add(value);
    seen.add(value);
  }
  return [...duplicateValues];
}

test("catalog has unique product identifiers", () => {
  assert.deepEqual(duplicates(catalog.products.map((product) => product.id)), []);
  assert.deepEqual(duplicates(catalog.products.map((product) => product.slug)), []);
  assert.deepEqual(duplicates(catalog.products.map((product) => product.sku)), []);
});

test("every product category references an existing category", () => {
  const categorySlugs = new Set(catalog.categories.map((category) => category.slug));
  const unknown = [...new Set(catalog.products.flatMap((product) => product.categories).filter((slug) => !categorySlugs.has(slug)))];
  assert.deepEqual(unknown, []);
});

test("variant identifiers are unique within each product", () => {
  const invalidProducts = catalog.products
    .filter((product) => duplicates(product.variants.map((variant) => variant.id)).length > 0)
    .map((product) => product.id);
  assert.deepEqual(invalidProducts, []);
});
