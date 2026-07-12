import "./app.css";
import { APP_HTML } from "./template";
import {
  getLastError,
  getRules,
  onLastErrorChanged,
  onRulesChanged,
  saveRules,
} from "../lib/storage";
import {
  hasAccessFor,
  requestOriginsFor,
  targetOriginsFor,
} from "../lib/permissions";
import {
  validateHeaderName,
  validateHeaderValue,
  validateUrlFilter,
} from "../lib/validate";
import { parseRules, serializeRules } from "../lib/io";
import { matchesUrlFilter } from "../lib/match";
import type { HeaderRule } from "../lib/types";

// Element references, assigned in initApp() once the template is injected.
let listEl: HTMLElement;
let formEl: HTMLFormElement;
let titleEl: HTMLElement;
let saveBtn: HTMLButtonElement;
let cancelBtn: HTMLButtonElement;
let valueField: HTMLElement;
let errorEl: HTMLElement;
let statusEl: HTMLElement;
let exportBtn: HTMLButtonElement;
let importBtn: HTMLButtonElement;
let importFileEl: HTMLInputElement;
let rulesHeaderEl: HTMLElement;
let masterToggleEl: HTMLInputElement;
let masterLabelEl: HTMLElement;
let versionEl: HTMLElement;
let tabStatusEl: HTMLElement;
let headerNameEl: HTMLInputElement;
let operationEl: HTMLSelectElement;

let rules: HeaderRule[] = [];
let editingId: string | null = null;

// Popup-only: the active tab's URL, used to show how many rules apply here.
let activeTabUrl = "";

// Signatures of writes this view made, so we can ignore the storage.onChanged
// echoes of our own saves (which fire in the writing context too) rather than
// redundantly re-rendering or, on rapid writes, reverting to a stale value.
const selfWriteSignatures: string[] = [];

/** Persist and re-render. The service worker reconciles DNR on the change. */
async function commit(next: HeaderRule[]): Promise<void> {
  rules = next;
  selfWriteSignatures.push(JSON.stringify(next));
  await saveRules(rules);
  await render();
}

async function render(): Promise<void> {
  listEl.replaceChildren();
  renderMasterToggle();

  if (rules.length === 0) {
    listEl.append(renderEmptyState());
    return;
  }

  // Resolve host-access coverage for each rule (semantically, via
  // permissions.contains) before rendering the ⚠ affordances. Only enabled
  // rules can show the warning, so skip the check for disabled ones.
  const coverage = await Promise.all(
    rules.map((rule) =>
      rule.enabled ? hasAccessFor(rule.urlFilter) : Promise.resolve(true),
    ),
  );
  rules.forEach((rule, index) => {
    listEl.append(renderRule(rule, coverage[index]));
  });
}

/** A friendly first-run state that teaches by offering a ready-made example. */
function renderEmptyState(): HTMLElement {
  const wrap = document.createElement("div");
  wrap.className = "empty";

  const title = document.createElement("p");
  title.className = "empty__title";
  title.textContent = "No rules yet.";
  wrap.append(title);

  const hint = document.createElement("p");
  hint.className = "empty__hint";
  hint.textContent =
    "A rule sends (or removes) a header on URLs that match a pattern — for example, send X-Env: dev to ||dev.example.com.";
  wrap.append(hint);

  const example = document.createElement("button");
  example.type = "button";
  example.className = "empty__example";
  example.textContent = "Fill in this example";
  example.addEventListener("click", fillExample);
  wrap.append(example);

  return wrap;
}

/** Populate the editor with the canonical example so the user can add or tweak it. */
function fillExample(): void {
  setField("label", "Dev env header");
  setField("headerName", "X-Env");
  setField("headerValue", "dev");
  setField("urlFilter", "||dev.example.com");
  operationEl.value = "set";
  syncValueVisibility();
  hideError();
  headerNameEl.focus();
}

/** Popup-only: show how many enabled rules apply to the current tab. */
function renderTabStatus(): void {
  if (!activeTabUrl) {
    tabStatusEl.textContent = "";
    return;
  }
  const count = rules.filter(
    (r) => r.enabled && matchesUrlFilter(r.urlFilter, activeTabUrl),
  ).length;
  tabStatusEl.textContent =
    count > 0 ? `${count} active on this page` : "None active on this page";
}

/** Reflect the aggregate enabled state in the master toggle. */
function renderMasterToggle(): void {
  rulesHeaderEl.hidden = rules.length === 0;
  if (rules.length === 0) return;

  renderTabStatus();

  const total = rules.length;
  const enabledCount = rules.filter((r) => r.enabled).length;
  const allEnabled = enabledCount === total;

  // The checkbox mirrors state: checked = all on, unchecked = all off, a dash
  // (indeterminate) = some on. The label describes that state — not the action —
  // so a checked box never sits next to the word "Disable".
  masterToggleEl.checked = allEnabled;
  masterToggleEl.indeterminate = enabledCount > 0 && !allEnabled;
  masterLabelEl.textContent = allEnabled
    ? "All enabled"
    : enabledCount === 0
      ? "All disabled"
      : `${enabledCount} of ${total} enabled`;
}

function renderRule(rule: HeaderRule, covered: boolean): HTMLElement {
  const card = document.createElement("div");
  card.className = "rule" + (rule.enabled ? "" : " rule--disabled");

  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = rule.enabled;
  toggle.title = rule.enabled ? "Enabled" : "Disabled";
  // Name the control; the checkbox role already conveys the on/off state.
  toggle.setAttribute("aria-label", `Rule ${rule.label || rule.headerName}`);
  toggle.addEventListener("change", () => {
    void onToggle(rule, toggle);
  });

  const body = document.createElement("div");
  body.className = "rule__body";

  if (rule.label) {
    const label = document.createElement("div");
    label.className = "rule__label";
    label.textContent = rule.label;
    body.append(label);
  }

  const header = document.createElement("div");
  header.className = "rule__header";
  header.textContent =
    rule.operation === "remove"
      ? `remove ${rule.headerName}`
      : rule.operation === "append"
        ? `${rule.headerName} += ${rule.headerValue}`
        : `${rule.headerName}: ${rule.headerValue}`;
  header.title = header.textContent; // full value on hover when truncated
  body.append(header);

  const url = document.createElement("div");
  url.className = "rule__url";
  url.textContent = rule.urlFilter;
  url.title = rule.urlFilter;
  body.append(url);

  // An enabled rule without host access is inert — flag it so the user knows.
  if (rule.enabled && !covered) {
    const warn = document.createElement("button");
    warn.type = "button";
    warn.className = "rule__warn";
    warn.textContent = "⚠ Needs site access — click to grant";
    warn.addEventListener("click", () => {
      void grantAccess(rule.urlFilter);
    });
    body.append(warn);
  }

  const actions = document.createElement("div");
  actions.className = "rule__actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.textContent = "Edit";
  editBtn.addEventListener("click", () => startEdit(rule));

  const duplicateBtn = document.createElement("button");
  duplicateBtn.type = "button";
  duplicateBtn.textContent = "Duplicate";
  duplicateBtn.addEventListener("click", () => duplicateRule(rule));

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "danger";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    if (editingId === rule.id) resetForm();
    void commit(rules.filter((r) => r.id !== rule.id));
  });

  actions.append(editBtn, duplicateBtn, deleteBtn);
  card.append(toggle, body, actions);
  return card;
}

/** Enable/disable a rule, requesting host access first when enabling. */
async function onToggle(
  rule: HeaderRule,
  toggle: HTMLInputElement,
): Promise<void> {
  if (toggle.checked && !(await tryRequestOrigins(rule.urlFilter))) {
    toggle.checked = false;
    showError("Site access was denied — rule left disabled.");
    return;
  }
  hideError();
  await commit(
    rules.map((r) =>
      r.id === rule.id ? { ...r, enabled: toggle.checked } : r,
    ),
  );
}

/** requestOriginsFor, but never throws — a rejected request counts as denied. */
async function tryRequestOrigins(urlFilter: string): Promise<boolean> {
  try {
    return await requestOriginsFor(urlFilter);
  } catch {
    return false;
  }
}

/**
 * Insert a copy of a rule right after it. The copy inherits the original's
 * enabled state — it reuses the same URL filter, so host access is already
 * granted when the original is enabled and no new prompt is needed.
 */
function duplicateRule(rule: HeaderRule): void {
  const copy: HeaderRule = {
    ...rule,
    id: crypto.randomUUID(),
    label: rule.label ? `${rule.label} (copy)` : "",
  };
  const index = rules.findIndex((r) => r.id === rule.id);
  const next = [...rules];
  next.splice(index + 1, 0, copy);
  void commit(next);
}

/** Enable or disable every rule at once (requesting all access in one prompt). */
async function onMasterToggle(): Promise<void> {
  if (!masterToggleEl.checked) {
    await commit(rules.map((r) => ({ ...r, enabled: false })));
    return;
  }
  // Enabling all: request the union of every rule's origins in a single prompt
  // (this handler is a user gesture; request before any other await).
  const origins = new Set<string>();
  for (const rule of rules) {
    for (const origin of targetOriginsFor(rule.urlFilter)) {
      origins.add(origin);
    }
  }
  if (origins.size > 0) {
    try {
      await chrome.permissions.request({ origins: [...origins] });
    } catch {
      /* denial/failure is reflected by the per-rule coverage check below */
    }
  }
  // Enable each rule only where access is actually held now.
  const flags = await Promise.all(
    rules.map((rule) => hasAccessFor(rule.urlFilter)),
  );
  await commit(rules.map((r, i) => ({ ...r, enabled: flags[i] })));
}

/** Re-request access for an already-enabled rule (from the ⚠ affordance). */
async function grantAccess(urlFilter: string): Promise<void> {
  if (await tryRequestOrigins(urlFilter)) {
    hideError();
    await render();
  } else {
    showError("Site access was denied.");
  }
}

function startEdit(rule: HeaderRule): void {
  editingId = rule.id;
  setField("label", rule.label);
  setField("headerName", rule.headerName);
  setField("headerValue", rule.headerValue);
  setField("urlFilter", rule.urlFilter);
  operationEl.value = rule.operation;
  syncValueVisibility();
  titleEl.textContent = "Edit rule";
  saveBtn.textContent = "Save changes";
  cancelBtn.hidden = false;
  hideError();
  formEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  headerNameEl.focus();
}

function resetForm(): void {
  editingId = null;
  formEl.reset();
  syncValueVisibility();
  titleEl.textContent = "Add rule";
  saveBtn.textContent = "Add rule";
  cancelBtn.hidden = true;
  hideError();
}

function setField(name: string, value: string): void {
  (formEl.elements.namedItem(name) as HTMLInputElement).value = value;
}

function getField(name: string): string {
  return (formEl.elements.namedItem(name) as HTMLInputElement).value.trim();
}

function syncValueVisibility(): void {
  valueField.hidden = operationEl.value === "remove";
}

function showError(message: string): void {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function hideError(): void {
  errorEl.hidden = true;
}

/** Show or clear the DNR sync-failure banner reported by the service worker. */
function renderSyncStatus(message: string | null): void {
  if (message) {
    statusEl.textContent = `Couldn't apply rules: ${message}`;
    statusEl.hidden = false;
  } else {
    statusEl.hidden = true;
  }
}

/** Download all rules as a JSON backup file. */
function exportRules(): void {
  if (rules.length === 0) return showError("No rules to export.");
  hideError();
  const blob = new Blob([serializeRules(rules)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "headmaster-rules.json";
  anchor.click();
  // Defer revoke so the download has been captured — revoking in the same tick
  // can cancel it.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

/** Append rules from a backup file, validating shape and content. */
async function importRules(file: File): Promise<void> {
  let imported: HeaderRule[];
  try {
    imported = parseRules(await file.text());
  } catch (error) {
    return showError(error instanceof Error ? error.message : "Import failed.");
  }
  if (imported.length === 0) return showError("That file contained no rules.");

  hideError();
  await commit([...rules, ...imported]);
  // Enabled imports that lack host access are flagged with the ⚠ affordance,
  // where a click (a user gesture) grants it — permissions.request can't run
  // here because awaiting the file read broke the original gesture chain.
}

async function onSubmit(): Promise<void> {
  const operation = operationEl.value as HeaderRule["operation"];
  const headerName = getField("headerName");
  const headerValue = getField("headerValue");
  const urlFilter = getField("urlFilter");

  const headerNameError = validateHeaderName(headerName);
  if (headerNameError) return showError(headerNameError);
  const urlFilterError = validateUrlFilter(urlFilter);
  if (urlFilterError) return showError(urlFilterError);
  if (operation !== "remove") {
    if (!headerValue)
      return showError(`Value is required when you ${operation} a header.`);
    const headerValueError = validateHeaderValue(headerValue);
    if (headerValueError) return showError(headerValueError);
  }

  const draft: Omit<HeaderRule, "id" | "enabled"> = {
    label: getField("label"),
    headerName,
    headerValue: operation === "remove" ? "" : headerValue,
    operation,
    urlFilter,
  };

  if (editingId) {
    const id = editingId;
    const existing = rules.find((r) => r.id === id);
    // If the rule is (or will remain) active, make sure we still hold access
    // for the possibly-changed filter.
    if (existing?.enabled && !(await tryRequestOrigins(urlFilter))) {
      return showError("Site access was denied — change not saved.");
    }
    await commit(rules.map((r) => (r.id === id ? { ...r, ...draft } : r)));
    resetForm();
    return;
  }

  // New rules are enabled only if the user grants access.
  const granted = await tryRequestOrigins(urlFilter);
  const rule: HeaderRule = {
    id: crypto.randomUUID(),
    enabled: granted,
    ...draft,
  };
  await commit([...rules, rule]);
  resetForm();
  headerNameEl.focus(); // ready for rapid entry of the next rule
  // Surface the denial *after* reset, which otherwise clears the message.
  if (!granted) showError("Added as disabled — site access was denied.");
}

/**
 * Render the UI into `#app-root` and wire it up. Shared verbatim by the popup
 * and the full-page options view.
 */
export async function initApp(): Promise<void> {
  const root = document.getElementById("app-root");
  if (!root) throw new Error("Missing #app-root");
  root.innerHTML = APP_HTML;

  listEl = document.getElementById("rule-list") as HTMLElement;
  formEl = document.getElementById("rule-form") as HTMLFormElement;
  titleEl = document.getElementById("editor-title") as HTMLElement;
  saveBtn = document.getElementById("save-btn") as HTMLButtonElement;
  cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
  valueField = document.getElementById("value-field") as HTMLElement;
  errorEl = document.getElementById("form-error") as HTMLElement;
  statusEl = document.getElementById("sync-status") as HTMLElement;
  exportBtn = document.getElementById("export-btn") as HTMLButtonElement;
  importBtn = document.getElementById("import-btn") as HTMLButtonElement;
  importFileEl = document.getElementById("import-file") as HTMLInputElement;
  rulesHeaderEl = document.getElementById("rules-header") as HTMLElement;
  masterToggleEl = document.getElementById("master-toggle") as HTMLInputElement;
  masterLabelEl = document.getElementById("master-label") as HTMLElement;
  versionEl = document.getElementById("version") as HTMLElement;
  tabStatusEl = document.getElementById("tab-status") as HTMLElement;
  headerNameEl = formEl.elements.namedItem("headerName") as HTMLInputElement;
  operationEl = formEl.elements.namedItem("operation") as HTMLSelectElement;

  operationEl.addEventListener("change", syncValueVisibility);
  cancelBtn.addEventListener("click", resetForm);
  masterToggleEl.addEventListener("change", () => void onMasterToggle());
  exportBtn.addEventListener("click", exportRules);
  importBtn.addEventListener("click", () => importFileEl.click());
  importFileEl.addEventListener("change", () => {
    const file = importFileEl.files?.[0];
    if (file) void importRules(file);
    importFileEl.value = ""; // allow re-selecting the same file
  });
  formEl.addEventListener("submit", (event) => {
    event.preventDefault();
    void onSubmit();
  });

  // "Open full view" opens the options page in a tab. It's hidden by CSS on the
  // options page itself, so wiring it unconditionally is safe. Looked up like
  // every other element (a missing button is an authoring bug and should fail
  // loudly, not silently no-op).
  const openFullViewBtn = document.getElementById(
    "open-full-view",
  ) as HTMLButtonElement;
  openFullViewBtn.addEventListener("click", () =>
    chrome.runtime.openOptionsPage(),
  );

  versionEl.textContent = `v${chrome.runtime.getManifest().version}`;

  // In the popup, opening the action grants activeTab, so we can read the
  // current tab's URL to show which rules apply here. (In the options tab the
  // "current tab" is the options page itself, so we skip it.)
  if (document.body.classList.contains("app--popup")) {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      activeTabUrl = tab?.url ?? "";
    } catch {
      activeTabUrl = "";
    }
  }

  rules = await getRules();
  syncValueVisibility();
  renderSyncStatus(await getLastError());
  onLastErrorChanged(renderSyncStatus);

  // Keep this view in sync with edits made in another view (e.g. the popup and
  // the options tab open at once). Echoes of our own writes are dropped so we
  // don't re-render redundantly or revert to a stale value.
  onRulesChanged((next) => {
    const signature = JSON.stringify(next);
    const selfIndex = selfWriteSignatures.indexOf(signature);
    if (selfIndex !== -1) {
      selfWriteSignatures.splice(selfIndex, 1);
      return;
    }
    rules = next;
    void render();
  });

  await render();
}
