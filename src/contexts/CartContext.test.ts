import { describe, expect, it } from "vitest";
import { parseStoredCart } from "./cart-storage.ts";

describe("persisted cart parsing", () => {
  it("rejects malformed or structurally invalid storage", () => {
    expect(parseStoredCart("not-json")).toEqual([]);
    expect(parseStoredCart(JSON.stringify({ items: [] }))).toEqual([]);
  });

  it("accepts a valid cart item array", () => {
    const value = [{ productId: "p1", quantity: 1, product: { id: "p1" } }];
    expect(parseStoredCart(JSON.stringify(value))).toEqual(value);
  });
});
