import { describe, expect, it } from "vitest";
import {
  MAX_IMPORT_RULES,
  SCHEMA_VERSION,
  parseRules,
  serializeRules,
} from "../src/lib/io";
import type { HeaderRule } from "../src/lib/types";

function rule(overrides: Partial<HeaderRule> = {}): HeaderRule {
  return {
    id: "orig-id",
    enabled: true,
    label: "Dev",
    headerName: "X-Env",
    headerValue: "dev",
    operation: "set",
    urlFilter: "||dev.example.com",
    ...overrides,
  };
}

describe("serialize/parse round-trip", () => {
  it("preserves every field except id (which is regenerated)", () => {
    const original = [
      rule(),
      rule({ id: "b", operation: "remove", headerValue: "x", enabled: false }),
    ];
    const parsed = parseRules(serializeRules(original));

    expect(parsed).toHaveLength(2);
    parsed.forEach((r, i) => {
      const { id: _id, ...rest } = r;
      const { id: _origId, ...origRest } = original[i];
      // "remove" rules drop their value on normalization.
      if (rest.operation === "remove") origRest.headerValue = "";
      expect(rest).toEqual(origRest);
    });
  });

  it("assigns fresh, unique ids to imported rules", () => {
    const parsed = parseRules(
      serializeRules([rule({ id: "x" }), rule({ id: "x" })]),
    );
    expect(parsed[0].id).not.toBe("x");
    expect(parsed[0].id).not.toBe(parsed[1].id);
  });

  it("writes the current schema version", () => {
    expect(JSON.parse(serializeRules([])).version).toBe(SCHEMA_VERSION);
  });
});

describe("parseRules rejects malformed input", () => {
  it("non-JSON", () => {
    expect(() => parseRules("{not json")).toThrow(/valid JSON/i);
  });

  it("missing rules array", () => {
    expect(() => parseRules('{"version":1}')).toThrow(/format/i);
  });

  it("wrong version", () => {
    expect(() => parseRules('{"version":99,"rules":[]}')).toThrow(/version/i);
  });

  it("invalid header name", () => {
    const bad = JSON.stringify({
      version: 1,
      rules: [
        {
          operation: "set",
          headerName: "X Env",
          headerValue: "v",
          urlFilter: "||a.com",
        },
      ],
    });
    expect(() => parseRules(bad)).toThrow(/Rule 1/);
  });

  it("missing url filter", () => {
    const bad = JSON.stringify({
      version: 1,
      rules: [{ operation: "set", headerName: "X-Env", headerValue: "v" }],
    });
    expect(() => parseRules(bad)).toThrow(/Rule 1/);
  });

  it("set operation without a value", () => {
    const bad = JSON.stringify({
      version: 1,
      rules: [{ operation: "set", headerName: "X-Env", urlFilter: "||a.com" }],
    });
    expect(() => parseRules(bad)).toThrow(/missing a value/i);
  });

  it("too many rules", () => {
    const many = {
      version: 1,
      rules: Array.from({ length: MAX_IMPORT_RULES + 1 }, () => ({
        operation: "set",
        headerName: "X-Env",
        headerValue: "v",
        urlFilter: "||a.com",
      })),
    };
    expect(() => parseRules(JSON.stringify(many))).toThrow(/too many/i);
  });

  it("invalid operation", () => {
    const bad = JSON.stringify({
      version: 1,
      rules: [{ operation: "nope", headerName: "X-Env", urlFilter: "||a.com" }],
    });
    expect(() => parseRules(bad)).toThrow(/operation/i);
  });

  it("append without a value", () => {
    const bad = JSON.stringify({
      version: 1,
      rules: [
        { operation: "append", headerName: "X-Env", urlFilter: "||a.com" },
      ],
    });
    expect(() => parseRules(bad)).toThrow(/missing a value/i);
  });
});

describe("parseRules accepts append", () => {
  it("round-trips an append rule with its value", () => {
    const bad = JSON.stringify({
      version: 1,
      rules: [
        {
          operation: "append",
          headerName: "X-Env",
          headerValue: "a=1",
          urlFilter: "||a.com",
        },
      ],
    });
    const [rule] = parseRules(bad);
    expect(rule.operation).toBe("append");
    expect(rule.headerValue).toBe("a=1");
  });
});
