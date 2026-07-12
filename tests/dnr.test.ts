import { describe, expect, it } from "vitest";
import { buildAddRules, toDnrRule } from "../src/lib/dnr";
import type { HeaderRule } from "../src/lib/types";

function rule(overrides: Partial<HeaderRule> = {}): HeaderRule {
  return {
    id: "id-1",
    enabled: true,
    label: "",
    headerName: "X-Env",
    headerValue: "dev",
    operation: "set",
    urlFilter: "||dev.example.com",
    ...overrides,
  };
}

describe("toDnrRule", () => {
  it("maps a 'set' rule to a modifyHeaders rule with a value", () => {
    const dnr = toDnrRule(rule(), 1);
    expect(dnr).toMatchObject({
      id: 1,
      priority: 1,
      action: {
        type: "modifyHeaders",
        requestHeaders: [{ header: "X-Env", operation: "set", value: "dev" }],
      },
      condition: { urlFilter: "||dev.example.com" },
    });
    expect(dnr.condition.resourceTypes).toContain("main_frame");
    expect(dnr.condition.resourceTypes).toContain("xmlhttprequest");
  });

  it("maps an 'append' rule with a value", () => {
    const dnr = toDnrRule(rule({ operation: "append", headerValue: "x=1" }), 3);
    expect(dnr.action.requestHeaders).toEqual([
      { header: "X-Env", operation: "append", value: "x=1" },
    ]);
  });

  it("maps a 'remove' rule with no value", () => {
    const dnr = toDnrRule(rule({ operation: "remove", headerValue: "" }), 7);
    expect(dnr.id).toBe(7);
    expect(dnr.action.requestHeaders).toEqual([
      { header: "X-Env", operation: "remove" },
    ]);
  });
});

describe("buildAddRules", () => {
  it("includes only enabled rules and numbers them 1..N", () => {
    const rules = [
      rule({ id: "a", headerValue: "dev" }),
      rule({ id: "b", enabled: false, headerValue: "staging" }),
      rule({ id: "c", headerValue: "prod" }),
    ];
    const built = buildAddRules(rules);
    expect(built.map((r) => r.id)).toEqual([1, 2]);
    expect(built.map((r) => r.action.requestHeaders?.[0].value)).toEqual([
      "dev",
      "prod",
    ]);
  });

  it("supports the same header name across multiple rules (no profiles)", () => {
    const rules = [
      rule({ id: "a", headerValue: "dev", urlFilter: "||dev.example.com" }),
      rule({ id: "b", headerValue: "stg", urlFilter: "||stg.example.com" }),
      rule({ id: "c", headerValue: "prod", urlFilter: "||example.com" }),
    ];
    const built = buildAddRules(rules);
    expect(built).toHaveLength(3);
    expect(
      built.every((r) => r.action.requestHeaders?.[0].header === "X-Env"),
    ).toBe(true);
    expect(built.map((r) => r.condition.urlFilter)).toEqual([
      "||dev.example.com",
      "||stg.example.com",
      "||example.com",
    ]);
  });

  it("returns an empty set when nothing is enabled", () => {
    expect(buildAddRules([rule({ enabled: false })])).toEqual([]);
  });
});
