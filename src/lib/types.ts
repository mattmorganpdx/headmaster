/**
 * A single header-injection rule.
 *
 * Rules are fully independent: each carries its own URL pattern and its own
 * header modification, and every enabled rule that matches a request applies.
 * There is deliberately no "profile" concept — the same `headerName` can appear
 * in many rules with different `headerValue`s scoped to different `urlFilter`s,
 * all active at once.
 */
export interface HeaderRule {
  /** Stable identity for the rule (crypto.randomUUID()). */
  id: string;
  /** When false, the rule is not compiled into an active DNR rule. */
  enabled: boolean;
  /** Optional human-friendly name, e.g. "Dev env header". */
  label: string;
  /** Request header name, e.g. "X-Env". */
  headerName: string;
  /** Value to set. Ignored when `operation === "remove"`. */
  headerValue: string;
  /** Whether to set the header to `headerValue` or strip it from the request. */
  operation: "set" | "remove";
  /**
   * Chrome declarativeNetRequest `urlFilter` pattern.
   * See README for syntax; e.g. "||dev.example.com" matches that host.
   */
  urlFilter: string;
}

export const STORAGE_KEY = "rules" as const;

/** Storage key holding the most recent DNR sync error (or null when healthy). */
export const LAST_ERROR_KEY = "lastError" as const;
