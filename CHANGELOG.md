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

## [0.1.0] - 2026-07-10

### Added

- Initial release: independent header-injection rules with no profiles, built on
  Manifest V3 `declarativeNetRequest`. Flat rule list with per-rule enable
  toggle; zero runtime dependencies.
