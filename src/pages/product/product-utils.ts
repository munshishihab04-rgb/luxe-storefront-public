import type { Product } from "../../types/product.ts";

export function canPurchaseSelection(product: Product, selectedVariant: string | null): boolean {
  const sizeVariants = product.variants.filter((variant) => variant.size);
  if (sizeVariants.length === 0) return product.stockStatus !== "out_of_stock";
  return sizeVariants.some((variant) => variant.id === selectedVariant && variant.available && variant.stock > 0);
}

export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}
