import { STORAGE_KEY, type HeaderRule } from "./types";

/**
 * Read all rules from `chrome.storage.local`. Returns an empty list when none
 * are stored yet.
 */
export async function getRules(): Promise<HeaderRule[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const rules = result[STORAGE_KEY];
  return Array.isArray(rules) ? (rules as HeaderRule[]) : [];
}

/** Persist the full rule list. The service worker reconciles DNR on change. */
export async function saveRules(rules: HeaderRule[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: rules });
}

/**
 * Subscribe to rule-list changes. Fires whenever the `rules` key changes in
 * `chrome.storage.local`, giving the latest list. Returns an unsubscribe fn.
 */
export function onRulesChanged(
  callback: (rules: HeaderRule[]) => void,
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string,
  ): void => {
    if (areaName !== "local" || !(STORAGE_KEY in changes)) return;
    const next = changes[STORAGE_KEY].newValue;
    callback(Array.isArray(next) ? (next as HeaderRule[]) : []);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
