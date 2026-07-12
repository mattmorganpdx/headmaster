import { describe, expect, it } from "vitest";
import { matchesUrlFilter } from "../src/lib/match";

describe("matchesUrlFilter", () => {
  it("domain anchor matches the host and its subdomains, any scheme", () => {
    const f = "||dev.example.com";
    expect(matchesUrlFilter(f, "https://dev.example.com/x")).toBe(true);
    expect(matchesUrlFilter(f, "http://dev.example.com")).toBe(true);
    expect(matchesUrlFilter(f, "https://api.dev.example.com/y")).toBe(true);
  });

  it("domain anchor rejects the parent and lookalike hosts", () => {
    const f = "||dev.example.com";
    expect(matchesUrlFilter(f, "https://example.com/")).toBe(false);
    expect(matchesUrlFilter(f, "https://notdev.example.com/")).toBe(false);
  });

  it("start anchor pins to the beginning of the URL", () => {
    expect(matchesUrlFilter("|https://", "https://x.com")).toBe(true);
    expect(matchesUrlFilter("|https://", "http://x.com")).toBe(false);
  });

  it("wildcard matches a path fragment", () => {
    expect(matchesUrlFilter("*/api/*", "https://x.com/api/v1")).toBe(true);
    expect(matchesUrlFilter("*/api/*", "https://x.com/v2")).toBe(false);
  });

  it("a plain filter is a loose substring match", () => {
    expect(matchesUrlFilter("example.com", "https://example.com/")).toBe(true);
    expect(matchesUrlFilter("example.com", "https://sub.example.com/")).toBe(
      true,
    );
    expect(matchesUrlFilter("example.com", "https://other.org/")).toBe(false);
  });

  it("separator (^) matches a path boundary or end, not a dot", () => {
    expect(matchesUrlFilter("||example.com^", "https://example.com/")).toBe(
      true,
    );
    expect(matchesUrlFilter("||example.com^", "https://example.com")).toBe(
      true,
    );
    expect(
      matchesUrlFilter("||example.com^", "https://example.com.evil.com/"),
    ).toBe(false);
  });

  it("returns false for empty inputs", () => {
    expect(matchesUrlFilter("", "https://x.com")).toBe(false);
    expect(matchesUrlFilter("||x.com", "")).toBe(false);
  });
});
