import { afterEach, describe, expect, it } from "vitest";
import {
  getLastError,
  getRules,
  saveRules,
  setLastError,
} from "../src/lib/storage";
import type { HeaderRule } from "../src/lib/types";

/** Install a minimal in-memory chrome.storage.local for the wrappers to hit. */
function installChromeMock(initial: Record<string, unknown> = {}): void {
  const store: Record<string, unknown> = { ...initial };
  const local = {
    get: async (key: string) => (key in store ? { [key]: store[key] } : {}),
    set: async (obj: Record<string, unknown>) => {
      Object.assign(store, obj);
    },
  };
  globalThis.chrome = {
    storage: {
      local,
      onChanged: { addListener() {}, removeListener() {} },
    },
  } as unknown as typeof chrome;
}

const sampleRule: HeaderRule = {
  id: "a",
  enabled: true,
  label: "Dev",
  headerName: "X-Env",
  headerValue: "dev",
  operation: "set",
  urlFilter: "||dev.example.com",
};

afterEach(() => {
  delete (globalThis as { chrome?: unknown }).chrome;
});

describe("getRules", () => {
  it("returns [] when nothing is stored", async () => {
    installChromeMock();
    expect(await getRules()).toEqual([]);
  });

  it("returns [] when the stored value isn't an array", async () => {
    installChromeMock({ rules: "corrupt" });
    expect(await getRules()).toEqual([]);
  });

  it("returns the stored rules", async () => {
    installChromeMock({ rules: [sampleRule] });
    expect(await getRules()).toEqual([sampleRule]);
  });
});

describe("saveRules", () => {
  it("round-trips through storage", async () => {
    installChromeMock();
    await saveRules([sampleRule]);
    expect(await getRules()).toEqual([sampleRule]);
  });
});

describe("last error", () => {
  it("is null when missing or non-string", async () => {
    installChromeMock();
    expect(await getLastError()).toBeNull();
    installChromeMock({ lastError: 123 });
    expect(await getLastError()).toBeNull();
  });

  it("round-trips a message", async () => {
    installChromeMock();
    await setLastError("boom");
    expect(await getLastError()).toBe("boom");
  });
});
