/**
 * The shared UI markup, injected into `#app-root` by {@link initApp}. Both the
 * popup and the full-page options view render this exact markup; layout
 * differences are handled purely in CSS via the `app--popup` / `app--options`
 * body classes.
 */
export const APP_HTML = `
  <header class="app-header">
    <h1>Headmaster</h1>
    <p class="tagline">Independent header rules — every match applies.</p>
  </header>

  <main>
    <p
      id="sync-status"
      class="sync-status"
      role="status"
      aria-live="polite"
      hidden
    ></p>

    <div class="toolbar">
      <button type="button" id="export-btn">Export</button>
      <button type="button" id="import-btn">Import</button>
      <input type="file" id="import-file" accept="application/json,.json" hidden />
    </div>

    <div id="rules-header" class="rules-header" hidden>
      <span id="tab-status" class="tab-status"></span>
      <label class="master-toggle" title="Enable or disable all rules">
        <input type="checkbox" id="master-toggle" />
        <span id="master-label">All enabled</span>
      </label>
    </div>

    <section id="rule-list" class="rule-list" aria-label="Header rules"></section>

    <section class="editor">
      <h2 id="editor-title">Add rule</h2>
      <form id="rule-form" autocomplete="off">
        <label>
          <span>Label <em>(optional)</em></span>
          <input type="text" name="label" placeholder="Dev env header" />
        </label>

        <label>
          <span>Header name</span>
          <input type="text" name="headerName" placeholder="X-Env" required />
        </label>

        <label>
          <span>Operation</span>
          <select name="operation">
            <option value="set">Set</option>
            <option value="append">Append</option>
            <option value="remove">Remove</option>
          </select>
        </label>

        <label id="value-field">
          <span>Value</span>
          <input type="text" name="headerValue" placeholder="dev" />
        </label>

        <label>
          <span>URL filter</span>
          <input
            type="text"
            name="urlFilter"
            placeholder="||dev.example.com"
            required
          />
          <small class="hint">
            Match pattern. e.g. <code>||dev.example.com</code> (a host and its
            subdomains), <code>*/api/*</code> (path contains),
            <code>|https://</code> (URL start). See "URL filter help" below.
          </small>
        </label>

        <p id="form-error" class="error" role="alert" hidden></p>

        <div class="form-actions">
          <button type="submit" id="save-btn">Add rule</button>
          <button type="button" id="cancel-btn" hidden>Cancel</button>
        </div>
      </form>
    </section>
  </main>

  <footer class="app-footer">
    <span id="version"></span>
    <span class="app-footer__links">
      <button type="button" id="open-full-view" class="linklike open-full-view">
        Open full view ⤢
      </button>
      <a href="/help/help.html" target="_blank" rel="noopener"
        >URL filter help</a
      >
    </span>
  </footer>
`;
