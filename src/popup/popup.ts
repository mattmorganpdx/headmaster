import "./popup.css";
import { getLastError, getRules, onLastErrorChanged, saveRules } from "../lib/storage";
import {
  isCoveredBy,
  pruneUnusedOrigins,
  requestOriginsFor,
} from "../lib/permissions";
import {
  validateHeaderName,
  validateHeaderValue,
  validateUrlFilter,
} from "../lib/validate";
import type { HeaderRule } from "../lib/types";

const listEl = document.getElementById("rule-list") as HTMLElement;
const formEl = document.getElementById("rule-form") as HTMLFormElement;
const titleEl = document.getElementById("editor-title") as HTMLElement;
const saveBtn = document.getElementById("save-btn") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const valueField = document.getElementById("value-field") as HTMLElement;
const errorEl = document.getElementById("form-error") as HTMLElement;
const statusEl = document.getElementById("sync-status") as HTMLElement;
const operationEl = formEl.elements.namedItem("operation") as HTMLSelectElement;

let rules: HeaderRule[] = [];
let editingId: string | null = null;

/** Persist, prune now-unused host grants, and re-render. */
async function commit(next: HeaderRule[]): Promise<void> {
  rules = next;
  await saveRules(rules);
  await pruneUnusedOrigins(
    rules.filter((r) => r.enabled).map((r) => r.urlFilter),
  );
  await render();
}

async function render(): Promise<void> {
  const granted = await chrome.permissions.getAll();
  listEl.replaceChildren();

  if (rules.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No rules yet. Add one below.";
    listEl.append(empty);
    return;
  }

  for (const rule of rules) {
    listEl.append(renderRule(rule, granted));
  }
}

function renderRule(
  rule: HeaderRule,
  granted: chrome.permissions.Permissions,
): HTMLElement {
  const card = document.createElement("div");
  card.className = "rule" + (rule.enabled ? "" : " rule--disabled");

  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = rule.enabled;
  toggle.title = rule.enabled ? "Enabled" : "Disabled";
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
      : `${rule.headerName}: ${rule.headerValue}`;
  body.append(header);

  const url = document.createElement("div");
  url.className = "rule__url";
  url.textContent = rule.urlFilter;
  body.append(url);

  // An enabled rule without host access is inert — flag it so the user knows.
  if (rule.enabled && !isCoveredBy(rule.urlFilter, granted)) {
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

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "danger";
  deleteBtn.textContent = "Delete";
  deleteBtn.addEventListener("click", () => {
    if (editingId === rule.id) resetForm();
    void commit(rules.filter((r) => r.id !== rule.id));
  });

  actions.append(editBtn, deleteBtn);
  card.append(toggle, body, actions);
  return card;
}

/** Enable/disable a rule, requesting host access first when enabling. */
async function onToggle(rule: HeaderRule, toggle: HTMLInputElement): Promise<void> {
  if (toggle.checked && !(await requestOriginsFor(rule.urlFilter))) {
    toggle.checked = false;
    showError("Site access was denied — rule left disabled.");
    return;
  }
  hideError();
  await commit(
    rules.map((r) => (r.id === rule.id ? { ...r, enabled: toggle.checked } : r)),
  );
}

/** Re-request access for an already-enabled rule (from the ⚠ affordance). */
async function grantAccess(urlFilter: string): Promise<void> {
  if (await requestOriginsFor(urlFilter)) {
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

operationEl.addEventListener("change", syncValueVisibility);
cancelBtn.addEventListener("click", resetForm);

formEl.addEventListener("submit", (event) => {
  event.preventDefault();
  void onSubmit();
});

async function onSubmit(): Promise<void> {
  const operation = operationEl.value as HeaderRule["operation"];
  const headerName = getField("headerName");
  const headerValue = getField("headerValue");
  const urlFilter = getField("urlFilter");

  const headerNameError = validateHeaderName(headerName);
  if (headerNameError) return showError(headerNameError);
  const urlFilterError = validateUrlFilter(urlFilter);
  if (urlFilterError) return showError(urlFilterError);
  if (operation === "set") {
    if (!headerValue) return showError("Value is required when setting a header.");
    const headerValueError = validateHeaderValue(headerValue);
    if (headerValueError) return showError(headerValueError);
  }

  const draft: Omit<HeaderRule, "id" | "enabled"> = {
    label: getField("label"),
    headerName,
    headerValue: operation === "set" ? headerValue : "",
    operation,
    urlFilter,
  };

  if (editingId) {
    const id = editingId;
    const existing = rules.find((r) => r.id === id);
    // If the rule is (or will remain) active, make sure we still hold access
    // for the possibly-changed filter.
    if (existing?.enabled && !(await requestOriginsFor(urlFilter))) {
      return showError("Site access was denied — change not saved.");
    }
    await commit(rules.map((r) => (r.id === id ? { ...r, ...draft } : r)));
    resetForm();
    return;
  }

  // New rules are enabled only if the user grants access.
  const granted = await requestOriginsFor(urlFilter);
  const rule: HeaderRule = {
    id: crypto.randomUUID(),
    enabled: granted,
    ...draft,
  };
  await commit([...rules, rule]);
  resetForm();
  // Surface the denial *after* reset, which otherwise clears the message.
  if (!granted) showError("Added as disabled — site access was denied.");
}

async function init(): Promise<void> {
  rules = await getRules();
  syncValueVisibility();
  renderSyncStatus(await getLastError());
  onLastErrorChanged(renderSyncStatus);
  await render();
}

void init();
