import { describe, expect, it } from "vitest";
import {
  validateHeaderName,
  validateHeaderValue,
  validateUrlFilter,
} from "../src/lib/validate";

describe("validateHeaderName", () => {
  it("accepts normal and token-punctuated header names", () => {
    expect(validateHeaderName("X-Env")).toBeNull();
    expect(validateHeaderName("Authorization")).toBeNull();
    expect(validateHeaderName("X-Custom_Header.v2")).toBeNull();
  });

  it("rejects an empty name", () => {
    expect(validateHeaderName("")).toMatch(/required/i);
  });

  it("rejects names with spaces or illegal characters", () => {
    expect(validateHeaderName("X Env")).toMatch(/only contain/i);
    expect(validateHeaderName("X:Env")).toMatch(/only contain/i);
    expect(validateHeaderName("X@Env")).toMatch(/only contain/i);
  });
});

describe("validateHeaderValue", () => {
  it("accepts ordinary values", () => {
    expect(validateHeaderValue("dev")).toBeNull();
    expect(validateHeaderValue("Bearer abc.def-123")).toBeNull();
    expect(validateHeaderValue("")).toBeNull();
  });

  it("rejects newlines and control characters (header injection)", () => {
    expect(validateHeaderValue("dev\r\nX-Evil: 1")).toMatch(/control/i);
    expect(validateHeaderValue("dev\x00")).toMatch(/control/i);
  });
});

describe("validateUrlFilter", () => {
  it("accepts typical DNR filters", () => {
    expect(validateUrlFilter("||dev.example.com")).toBeNull();
    expect(validateUrlFilter("*://api.example.com/*")).toBeNull();
    expect(validateUrlFilter("|https://localhost:3000/")).toBeNull();
  });

  it("rejects an empty filter", () => {
    expect(validateUrlFilter("")).toMatch(/required/i);
  });

  it("rejects whitespace", () => {
    expect(validateUrlFilter("dev example.com")).toMatch(/spaces/i);
  });

  it("rejects non-ASCII (IDN) input", () => {
    expect(validateUrlFilter("||café.example.com")).toMatch(/ASCII/i);
  });
});
