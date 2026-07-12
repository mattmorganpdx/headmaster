import { syncDynamicRules } from "../lib/dnr";
import { getRules, onRulesChanged, setLastError } from "../lib/storage";
import type { HeaderRule } from "../lib/types";

/** Reflect the number of enabled rules in the toolbar badge. */
async function updateBadge(rules: HeaderRule[]): Promise<void> {
  const enabled = rules.filter((rule) => rule.enabled).length;
  await chrome.action.setBadgeText({ text: enabled > 0 ? String(enabled) : "" });
  await chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
}

/**
 * Recompute DNR rules and badge from the current stored rules, recording any
 * sync failure so the popup can surface it (and clearing it on success).
 */
async function reconcile(rules?: HeaderRule[]): Promise<void> {
  const list = rules ?? (await getRules());

  let message: string | null = null;
  try {
    await syncDynamicRules(list);
  } catch (error) {
    // Always keep a non-empty message so the popup never mistakes a failure
    // for a healthy state.
    message =
      error instanceof Error && error.message
        ? error.message
        : "Failed to apply rules.";
  }

  // Persisting the status and updating the badge are best-effort; a failure
  // here isn't recoverable and must not become an unhandled rejection.
  try {
    await setLastError(message);
    await updateBadge(list);
  } catch {
    /* ignore */
  }
}

// Rebuild dynamic rules on install and on browser startup so the active rule
// set always matches storage (Chrome persists dynamic rules, but reconciling
// keeps storage the single source of truth).
chrome.runtime.onInstalled.addListener(() => void reconcile());
chrome.runtime.onStartup.addListener(() => void reconcile());

// The popup only writes to storage; this listener turns those writes into DNR
// updates. storage.onChanged wakes the service worker if it was dormant.
onRulesChanged((rules) => void reconcile(rules));
