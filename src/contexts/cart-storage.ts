import type { CartItem } from "../types/product.ts";

export function parseStoredCart(raw: string | null): CartItem[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is CartItem => {
      if (!item || typeof item !== "object") return false;
      const candidate = item as Partial<CartItem>;
      return typeof candidate.productId === "string"
        && Number.isSafeInteger(candidate.quantity)
        && Number(candidate.quantity) > 0
        && Number(candidate.quantity) <= 10
        && !!candidate.product
        && typeof candidate.product === "object"
        && candidate.product.id === candidate.productId;
    });
  } catch {
    return [];
  }
}
