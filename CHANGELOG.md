# Changelog

All notable changes to this project are documented here. The format is based on
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

When releasing, keep `package.json` and `public/manifest.json` versions in sync
(the packaging script reads the manifest).

## [Unreleased]

### Added

- Per-site host permissions requested at runtime
  (`declarativeNetRequestWithHostAccess` + `optional_host_permissions`), instead
  of a broad `<all_urls>` grant.
- Input validation for header name, header value, and URL filter; a sync-status
  banner surfacing any `declarativeNetRequest` failure.
- JSON export / import of rules, with shape validation and a size cap.
- Master enable-all / disable-all toggle and per-rule duplicate action.
- Full-page options view (opens in a tab) that shares the popup's UI in a roomy
  layout; the popup gains an "Open full view" link. The full page also makes the
  site-access grant flow more reliable (a tab isn't dismissed by the permission
  prompt the way a popup can be).
- Open views (e.g. the popup and the options tab at once) now stay in sync via a
  storage change listener, so an edit in one is reflected in the other instead
  of a stale view overwriting it.
- In the popup, long header values and URL filters truncate to a single line
  with an ellipsis (full text on hover) instead of wrapping into a messy block;
  the full-page view still shows them in full.
- "URL filter help" now opens an in-extension help page (with the match-pattern
  grammar and matches/doesn't-match examples) instead of leaving for GitHub; the
  form hint wording was de-jargoned ("Match pattern" instead of "DNR pattern").
- `append` operation for multi-value request headers, alongside set/remove.
- Friendlier first-run state with a one-click "Fill in this example" button.
- The popup shows how many rules apply to the current tab (uses `activeTab`; the
  URL is read only to compute the count and is never stored or transmitted).
- Branded icons, accessibility improvements, and a popup footer.
- ESLint + Prettier, a release packaging script (`npm run package`), and this
  changelog.

### Fixed

- Deleting a rule now updates the popup immediately (it previously only updated
  after reopening, because host-permission cleanup could throw and abort the
  re-render).
- The "⚠ Needs site access" affordance now reflects real coverage and works when
  clicked. Access checks use `chrome.permissions.contains` instead of matching
  origin strings, which Chrome normalizes; permissions are no longer
  auto-revoked on rule changes (which could drop a just-granted origin).
- Duplicating a rule now inherits the original's enabled state (it reuses the
  same URL filter, so access is already granted) instead of creating a
  disabled/greyed-out copy.
- The master toggle's label now describes state ("All enabled" / "All disabled" /
  "N of M enabled") instead of the action, so a checked box no longer sits next
  to the word "Disable".
- URL filters using a DNR separator (`^`) or end anchor (`|`) now request access
  to the specific host instead of falling back to broad all-sites access.

## [0.1.0] - 2026-07-10

### Added

- Initial release: independent header-injection rules with no profiles, built on
  Manifest V3 `declarativeNetRequest`. Flat rule list with per-rule enable
  toggle; zero runtime dependencies.
