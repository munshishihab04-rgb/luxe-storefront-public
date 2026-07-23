import { describe, expect, it } from "vitest";
import { isPaidOrderStatus } from "./order-utils.ts";

describe("order confirmation", () => {
  it("confirms only a server-verified paid order", () => {
    expect(isPaidOrderStatus({ ok: true, order: { status: "paid" } })).toBe(true);
    expect(isPaidOrderStatus({ ok: true, order: { status: "pending" } })).toBe(false);
    expect(isPaidOrderStatus({ ok: false })).toBe(false);
    expect(isPaidOrderStatus(null)).toBe(false);
  });
});
