import { describe, expect, it } from "vitest";
import { originsFromUrlFilter } from "../src/lib/permissions";

describe("originsFromUrlFilter", () => {
  it("expands a domain-anchored filter to apex + subdomain patterns", () => {
    expect(originsFromUrlFilter("||dev.example.com")).toEqual([
      "*://dev.example.com/*",
      "*://*.dev.example.com/*",
    ]);
  });

  it("treats a leading *. as a domain anchor", () => {
    expect(originsFromUrlFilter("*://*.example.com/*")).toEqual([
      "*://example.com/*",
      "*://*.example.com/*",
    ]);
  });

  it("handles an explicit scheme + host with a path", () => {
    expect(originsFromUrlFilter("*://api.example.com/*")).toEqual([
      "*://api.example.com/*",
    ]);
  });

  it("strips a start-of-URL anchor, scheme, and port", () => {
    expect(originsFromUrlFilter("|https://localhost:3000/")).toEqual([
      "*://localhost/*",
    ]);
  });

  it("derives a host from a bare substring filter", () => {
    expect(originsFromUrlFilter("dev.example.com")).toEqual([
      "*://dev.example.com/*",
    ]);
  });

  it("stops the host at the first path segment", () => {
    expect(originsFromUrlFilter("example.com/api")).toEqual([
      "*://example.com/*",
    ]);
  });

  it("returns null for path-only or wildcard-led filters", () => {
    expect(originsFromUrlFilter("*/api/*")).toBeNull();
    expect(originsFromUrlFilter("/api/")).toBeNull();
    expect(originsFromUrlFilter("*foo")).toBeNull();
  });

  it("returns null for a single-label host (too broad to anchor)", () => {
    expect(originsFromUrlFilter("||localhostapi")).toBeNull();
  });

  it("returns null for empty/whitespace input", () => {
    expect(originsFromUrlFilter("")).toBeNull();
    expect(originsFromUrlFilter("   ")).toBeNull();
  });

  it("allows bare localhost", () => {
    expect(originsFromUrlFilter("||localhost")).toEqual([
      "*://localhost/*",
      "*://*.localhost/*",
    ]);
  });
});
