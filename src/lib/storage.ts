import { LAST_ERROR_KEY, STORAGE_KEY, type HeaderRule } from "./types";

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
 * Subscribe to a single `chrome.storage.local` key. `parse` maps the raw new
 * value (possibly `undefined` when the key is removed/cleared) to the shape the
 * callback wants. Returns an unsubscribe fn.
 */
function onKeyChanged<T>(
  key: string,
  parse: (rawNewValue: unknown) => T,
  callback: (value: T) => void,
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string,
  ): void => {
    if (areaName !== "local" || !(key in changes)) return;
    callback(parse(changes[key].newValue));
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}

/**
 * Subscribe to rule-list changes. Fires whenever the `rules` key changes in
 * `chrome.storage.local`, giving the latest list. Returns an unsubscribe fn.
 */
export function onRulesChanged(
  callback: (rules: HeaderRule[]) => void,
): () => void {
  return onKeyChanged(
    STORAGE_KEY,
    (raw) => (Array.isArray(raw) ? (raw as HeaderRule[]) : []),
    callback,
  );
}

/** Read the last DNR sync error, or null when the last sync succeeded. */
export async function getLastError(): Promise<string | null> {
  const result = await chrome.storage.local.get(LAST_ERROR_KEY);
  const value = result[LAST_ERROR_KEY];
  return typeof value === "string" ? value : null;
}

/** Record (or clear, with null) the last DNR sync error. */
export async function setLastError(message: string | null): Promise<void> {
  await chrome.storage.local.set({ [LAST_ERROR_KEY]: message });
}

/** Subscribe to sync-error changes. Returns an unsubscribe fn. */
export function onLastErrorChanged(
  callback: (message: string | null) => void,
): () => void {
  return onKeyChanged(
    LAST_ERROR_KEY,
    (raw) => (typeof raw === "string" ? raw : null),
    callback,
  );
}
