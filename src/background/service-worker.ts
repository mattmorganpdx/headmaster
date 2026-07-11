import { syncDynamicRules } from "../lib/dnr";
import { getRules, onRulesChanged } from "../lib/storage";
import type { HeaderRule } from "../lib/types";

/** Reflect the number of enabled rules in the toolbar badge. */
async function updateBadge(rules: HeaderRule[]): Promise<void> {
  const enabled = rules.filter((rule) => rule.enabled).length;
  await chrome.action.setBadgeText({ text: enabled > 0 ? String(enabled) : "" });
  await chrome.action.setBadgeBackgroundColor({ color: "#2563eb" });
}

/** Recompute DNR rules and badge from the current stored rules. */
async function reconcile(): Promise<void> {
  const rules = await getRules();
  await syncDynamicRules(rules);
  await updateBadge(rules);
}

// Rebuild dynamic rules on install and on browser startup so the active rule
// set always matches storage (Chrome persists dynamic rules, but reconciling
// keeps storage the single source of truth).
chrome.runtime.onInstalled.addListener(() => void reconcile());
chrome.runtime.onStartup.addListener(() => void reconcile());

// The popup only writes to storage; this listener turns those writes into DNR
// updates. storage.onChanged wakes the service worker if it was dormant.
onRulesChanged((rules) => {
  void syncDynamicRules(rules).then(() => updateBadge(rules));
});
