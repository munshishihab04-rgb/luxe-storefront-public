import { describe, expect, it } from "vitest";
import type { Product } from "../../types/product.ts";
import { canPurchaseSelection, serializeJsonLd } from "./product-utils.ts";

const product = {
  id: "p1",
  slug: "test",
  title: "Test",
  shortDescription: "Test",
  longDescription: "Test",
  brand: "LUXE",
  categories: [],
  productType: "shoe",
  gender: "unisex",
  ageGroup: "adulto",
  price: 100,
  regularPrice: 100,
  currency: "EUR",
  availability: "in stock",
  stockStatus: "in_stock",
  sku: "SKU",
  itemGroupId: "GROUP",
  variants: [{ id: "v1", sku: "V1", size: "42", stock: 1, available: true }],
  images: ["https://example.com/product.jpg"],
  tags: [],
  seoTitle: "Test",
  seoDescription: "Test",
  googleProductCategory: "Shoes",
} satisfies Product;

describe("product purchase validation", () => {
  it("blocks buy-now when a required size is missing", () => {
    expect(canPurchaseSelection(product, null)).toBe(false);
  });

  it("allows buy-now for an available selected variant", () => {
    expect(canPurchaseSelection(product, "v1")).toBe(true);
  });
});

describe("JSON-LD serialization", () => {
  it("escapes script-closing sequences from catalog content", () => {
    const serialized = serializeJsonLd({ name: "</script><img src=x onerror=alert(1)>" });
    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script\\u003e");
  });
});
