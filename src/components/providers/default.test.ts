import { describe, expect, it } from "vitest";
import { hasAuthConfiguration } from "./auth-config.ts";

describe("optional authentication providers", () => {
  it("requires all public auth endpoints before enabling auth", () => {
    expect(hasAuthConfiguration({})).toBe(false);
    expect(hasAuthConfiguration({ authority: "https://auth.luxe.it", clientId: "luxe-storefront", convexUrl: "https://luxe.convex.cloud" })).toBe(true);
    expect(hasAuthConfiguration({ authority: "https://example-issuer.local", clientId: "example-client-id", convexUrl: "http://localhost:3000" })).toBe(false);
  });
});
