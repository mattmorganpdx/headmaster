import type { HeaderRule } from "./types";

/**
 * Resource types the header rules apply to. We list every type explicitly
 * (including `main_frame`) so injected headers reach top-level navigations,
 * sub-frames, and XHR/fetch alike.
 *
 * These are plain strings, not the `@types/chrome` `ResourceType` enum: the
 * enum is a runtime value, and depending on it here would (a) require a
 * `chrome` global at module load and (b) make this module untestable in Node.
 * Chrome's DNR runtime accepts the string values directly.
 */
const ALL_RESOURCE_TYPES = [
  "main_frame",
  "sub_frame",
  "stylesheet",
  "script",
  "image",
  "font",
  "object",
  "xmlhttprequest",
  "ping",
  "csp_report",
  "media",
  "websocket",
  "other",
] as const;

/** Structural shape of a DNR modifyHeaders rule — string literals, no enums. */
export interface DnrRule {
  id: number;
  priority: number;
  action: {
    type: "modifyHeaders";
    requestHeaders: Array<{
      header: string;
      operation: "set" | "remove";
      value?: string;
    }>;
  };
  condition: {
    urlFilter: string;
    resourceTypes: readonly string[];
  };
}

/**
 * Map one app-level {@link HeaderRule} to a DNR rule.
 *
 * Pure and deterministic — this is the core the unit tests pin down. DNR
 * requires a positive integer `id`, supplied by the caller.
 */
export function toDnrRule(rule: HeaderRule, id: number): DnrRule {
  return {
    id,
    priority: 1,
    action: {
      type: "modifyHeaders",
      requestHeaders: [
        rule.operation === "set"
          ? { header: rule.headerName, operation: "set", value: rule.headerValue }
          : { header: rule.headerName, operation: "remove" },
      ],
    },
    condition: {
      urlFilter: rule.urlFilter,
      resourceTypes: ALL_RESOURCE_TYPES,
    },
  };
}

/**
 * Build the full set of DNR rules to install: only enabled rules, numbered
 * `1..N`. Pure, so it is unit-testable without a browser.
 *
 * We rebuild the entire dynamic rule set on every change (see
 * {@link syncDynamicRules}) rather than tracking stable ids, so ids only need
 * to be unique within a single sync — sequential integers suffice.
 */
export function buildAddRules(rules: HeaderRule[]): DnrRule[] {
  return rules
    .filter((rule) => rule.enabled)
    .map((rule, index) => toDnrRule(rule, index + 1));
}

/**
 * Reconcile Chrome's dynamic DNR rules with the given app rules: drop all
 * existing dynamic rules and install a fresh set from the enabled rules.
 * Idempotent — safe to call on every storage change and on startup.
 */
export async function syncDynamicRules(rules: HeaderRule[]): Promise<void> {
  const existing = await chrome.declarativeNetRequest.getDynamicRules();
  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existing.map((rule) => rule.id),
    // Cast at the Chrome boundary only: our DnrRule uses string literals where
    // @types/chrome expects its runtime enums; the values are identical.
    addRules: buildAddRules(rules) as unknown as chrome.declarativeNetRequest.Rule[],
  });
}
