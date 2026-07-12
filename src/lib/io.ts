import type { HeaderRule } from "./types";
import {
  validateHeaderName,
  validateHeaderValue,
  validateUrlFilter,
} from "./validate";

/** Bump when the on-disk shape changes incompatibly. */
export const SCHEMA_VERSION = 1;

/** Guard against pathological/corrupt files bloating storage and DNR limits. */
export const MAX_IMPORT_RULES = 1000;

interface ExportFile {
  version: number;
  rules: HeaderRule[];
}

/** Serialize rules to the pretty-printed JSON backup format. */
export function serializeRules(rules: HeaderRule[]): string {
  const file: ExportFile = { version: SCHEMA_VERSION, rules };
  return JSON.stringify(file, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Parse and validate a backup file into rules.
 *
 * Throws `Error` with a human-readable message on any malformed input. Each
 * imported rule is given a **fresh id** so importing never collides with
 * existing rules (ids are matched on for edit/toggle/delete). Rules are
 * validated with the same rules as the editor; `enabled` is preserved so the
 * caller can re-establish host access (an enabled rule lacking access is flagged
 * in the popup).
 */
export function parseRules(text: string): HeaderRule[] {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("File is not valid JSON.");
  }

  if (!isRecord(data) || !Array.isArray(data.rules)) {
    throw new Error("Unrecognized file format (missing a rules array).");
  }
  if (data.version !== SCHEMA_VERSION) {
    throw new Error(`Unsupported file version: ${String(data.version)}.`);
  }
  if (data.rules.length > MAX_IMPORT_RULES) {
    throw new Error(
      `Too many rules (${data.rules.length}); the limit is ${MAX_IMPORT_RULES}.`,
    );
  }

  return data.rules.map(normalizeRule);
}

function normalizeRule(raw: unknown, index: number): HeaderRule {
  const where = `Rule ${index + 1}`;
  if (!isRecord(raw)) throw new Error(`${where} is not an object.`);

  const operation =
    raw.operation === "set" ||
    raw.operation === "append" ||
    raw.operation === "remove"
      ? raw.operation
      : null;
  if (!operation) throw new Error(`${where} has an invalid operation.`);

  const headerName = typeof raw.headerName === "string" ? raw.headerName : "";
  const nameError = validateHeaderName(headerName);
  if (nameError) throw new Error(`${where}: ${nameError}`);

  const urlFilter = typeof raw.urlFilter === "string" ? raw.urlFilter : "";
  const filterError = validateUrlFilter(urlFilter);
  if (filterError) throw new Error(`${where}: ${filterError}`);

  let headerValue = "";
  if (operation !== "remove") {
    headerValue = typeof raw.headerValue === "string" ? raw.headerValue : "";
    if (!headerValue) throw new Error(`${where} is missing a value.`);
    const valueError = validateHeaderValue(headerValue);
    if (valueError) throw new Error(`${where}: ${valueError}`);
  }

  return {
    id: crypto.randomUUID(),
    enabled: raw.enabled === true,
    label: typeof raw.label === "string" ? raw.label : "",
    headerName,
    headerValue,
    operation,
    urlFilter,
  };
}
