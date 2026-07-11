import "./popup.css";
import { getRules, saveRules } from "../lib/storage";
import type { HeaderRule } from "../lib/types";

const listEl = document.getElementById("rule-list") as HTMLElement;
const formEl = document.getElementById("rule-form") as HTMLFormElement;
const titleEl = document.getElementById("editor-title") as HTMLElement;
const saveBtn = document.getElementById("save-btn") as HTMLButtonElement;
const cancelBtn = document.getElementById("cancel-btn") as HTMLButtonElement;
const valueField = document.getElementById("value-field") as HTMLElement;
const errorEl = document.getElementById("form-error") as HTMLElement;
const operationEl = formEl.elements.namedItem("operation") as HTMLSelectElement;

let rules: HeaderRule[] = [];
let editingId: string | null = null;

/** Persist and re-render. The service worker reconciles DNR on save. */
async function commit(next: HeaderRule[]): Promise<void> {
  rules = next;
  await saveRules(rules);
  render();
}

function render(): void {
  listEl.replaceChildren();

  if (rules.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "No rules yet. Add one below.";
    listEl.append(empty);
    return;
  }

  for (const rule of rules) {
    listEl.append(renderRule(rule));
  }
}

function renderRule(rule: HeaderRule): HTMLElement {
  const card = document.createElement("div");
  card.className = "rule" + (rule.enabled ? "" : " rule--disabled");

  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = rule.enabled;
  toggle.title = rule.enabled ? "Enabled" : "Disabled";
  toggle.addEventListener("change", () => {
    void commit(
      rules.map((r) =>
        r.id === rule.id ? { ...r, enabled: toggle.checked } : r,
      ),
    );
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

operationEl.addEventListener("change", syncValueVisibility);
cancelBtn.addEventListener("click", resetForm);

formEl.addEventListener("submit", (event) => {
  event.preventDefault();

  const operation = operationEl.value as HeaderRule["operation"];
  const headerName = getField("headerName");
  const headerValue = getField("headerValue");
  const urlFilter = getField("urlFilter");

  if (!headerName) return showError("Header name is required.");
  if (!urlFilter) return showError("URL filter is required.");
  if (operation === "set" && !headerValue) {
    return showError("Value is required when setting a header.");
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
    void commit(rules.map((r) => (r.id === id ? { ...r, ...draft } : r)));
  } else {
    const rule: HeaderRule = {
      id: crypto.randomUUID(),
      enabled: true,
      ...draft,
    };
    void commit([...rules, rule]);
  }

  resetForm();
});

async function init(): Promise<void> {
  rules = await getRules();
  syncValueVisibility();
  render();
}

void init();
