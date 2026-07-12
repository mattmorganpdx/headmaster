# Headmaster Roadmap → 1.0 (Chrome Web Store)

Headmaster already does its one job: inject request headers by URL match, with
no profiles and every rule independent. This roadmap tracks the work to ship a
**public 1.0 on the Chrome Web Store** — feature-complete for that single
purpose, polished, and compliant with current store policy.

Tasks are tagged **[1.0]** (required to release) or **[post-1.0]** (backlog).
Items marked _(you)_ require the account owner (browser screenshots, signup).

## Scope decisions

- **Host permissions:** per-site, requested at runtime — **not** broad
  `<all_urls>`.
- **Feature scope:** **request headers only (set / remove)**. Response headers
  and `append` are deliberately post-1.0 to keep the single-purpose story tight.
- **Backup:** JSON export / import. No `storage.sync` in 1.0.

## Why these matter (verified store facts)

- A **privacy policy is mandatory** for every extension — including ones that
  collect nothing — under the policy update effective **Aug 1, 2026**. Privacy
  Practices disclosures must match the policy's wording.
  ([policy update](https://developer.chrome.com/blog/cws-policy-updates-2026) ·
  [privacy policy](https://developer.chrome.com/docs/webstore/program-policies/privacy))
- **`<all_urls>` is the top rejection / in-depth-review risk** for header and
  network tools. `modifyHeaders` needs host access, but
  [`declarativeNetRequestWithHostAccess`](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)
  shows no install-time warning and lets us request host access **per site at
  runtime** — faster review and a stronger privacy story.
  ([review process](https://developer.chrome.com/docs/webstore/review-process))
- **Listing assets:** 128×128 icon, ≥1 screenshot at 1280×800 (640×400 also
  accepted; up to 5), a 440×280 small promo tile, optional 1400×560 marquee.
  Every permission needs a written justification.

---

## M1 — Per-site host permissions · **[1.0, blocker]** ✅ done

Move off broad host access so review is smooth and the extension only ever
touches sites the user explicitly configured.

- [x] `public/manifest.json`: `declarativeNetRequest` →
      `declarativeNetRequestWithHostAccess`; dropped `host_permissions:
["<all_urls>"]`; added `optional_host_permissions: ["*://*/*"]`.
      (`chrome.permissions` needs no manifest permission entry.)
- [x] New `src/lib/permissions.ts` — `originsFromUrlFilter(urlFilter)` derives
      origin match pattern(s), expanding domain-anchored filters to apex +
      subdomain and returning `null` for path/substring filters.
- [x] Popup add/enable flow: `requestOriginsFor` calls
      `chrome.permissions.request` before enabling; when no single host can be
      derived it requests broad `*://*/*`; on denial the rule is left disabled.
- [x] On delete/disable: `pruneUnusedOrigins` revokes origins no remaining rule
      needs. A ⚠ affordance flags an enabled rule that lacks access, with
      one-click grant.
- [x] Unit tests for `originsFromUrlFilter` (10 cases).

## M2 — Validation & error surfacing · **[1.0, blocker]** ✅ done

No rule should ever fail silently.

- [x] New `src/lib/validate.ts` — `validateHeaderName` (RFC 7230 token chars),
      `validateHeaderValue` (rejects control chars / header injection), and
      `validateUrlFilter` (printable-ASCII, no whitespace); wired into the
      `popup.ts` submit handler via the existing `showError`.
- [x] `src/background/service-worker.ts`: `reconcile` captures sync failures and
      writes a `lastError` status to `chrome.storage.local` (best-effort, no
      unhandled rejections); the popup subscribes via `onLastErrorChanged` and
      shows it in an `aria-live` banner.
- [x] Unit tests for all three validators (9 cases).

## M3 — Config export / import · **[1.0]** ✅ done

- [x] New `src/lib/io.ts` — versioned `serializeRules` / `parseRules` with shape
      validation (reuses the M2 validators), fresh ids on import, and a
      `MAX_IMPORT_RULES` cap.
- [x] Export a `.json` via `Blob` download (deferred `revokeObjectURL`); import
      via file input, appending validated rules.
- [x] Export / Import buttons in `popup.html` + `popup.ts`. Imported enabled
      rules that lack host access surface the M1 ⚠ one-click grant (avoids the
      user-gesture pitfall of requesting during an async file read).
- [x] Round-trip, bad-input, and rule-cap tests (11 io cases).

## M4 — UX polish & branding · **[1.0]** ✅ done

- [x] Real branded icons at 16 / 48 / 128 (gradient rounded square), generated
      reproducibly by `scripts/make-icons.sh`, replacing the placeholder glyphs.
- [x] Master enable-all / disable-all toggle (one permission prompt for the
      union of origins); per-rule duplicate action.
- [x] Accessibility: implicit label associations, focus management (header field
      after add/edit), `role="alert"` errors + `aria-live` sync banner, named
      rule toggles; `max-height` scroll for long lists; footer with version
      (`chrome.runtime.getManifest`) + URL-filter help link.
- [x] README: CI + license badges and icon; added `SECURITY.md`.
      (Store screenshots are captured in M6 — they need a running browser.)

## M5 — Engineering quality & release tooling · **[1.0]** ✅ done

- [x] ESLint (flat config) + Prettier (dev-only), with `lint` and
      `format:check` steps added to `.github/workflows/ci.yml`.
- [x] Expanded Vitest coverage to 41 tests: validators, io round-trip, origin
      derivation, and storage wrappers (via an in-memory chrome mock).
- [x] `scripts/package.mjs` — build + zip `dist/` to `headmaster-v<version>.zip`
      (version read from the manifest); uploaded as a CI artifact on `v*` tags.
- [x] `CHANGELOG.md` (Keep a Changelog); semver; packaging reads the manifest
      version to keep the shipped zip in sync.

## M6 — Web Store submission · **[1.0, blocker to publish]** ✅ assets done

Assets and copy are produced; the remaining `_(you)_` items need a browser or a
Google account.

- [x] `docs/privacy-policy.md` (+ `docs/index.md`) with Jekyll front matter,
      served via **GitHub Pages** from `/docs`: declares no data collected or
      transmitted, rules stored locally only, and a contact email.
- [ ] Complete the **Privacy Practices** tab so disclosures match the policy
      wording _(you)_.
- [x] `docs/store/listing.md` — name, short summary, detailed description,
      category **Developer Tools**, explicit single-purpose statement.
- [x] `docs/store/permissions-justifications.md` — justifications for
      `declarativeNetRequestWithHostAccess`, `storage`, and optional host perms.
- [x] Produced the 440×280 promo tile + 1400×560 marquee
      (`scripts/make-promo.sh`); 128 icon ships in `public/icons/`.
- [ ] Capture up to five **1280×800** screenshots from the shot list _(you)_.
- [ ] Complete **$5** developer registration and submit _(you)_.
- [x] `docs/store/submission-checklist.md` tying it all together.

---

## Post-1.0 backlog

- Response headers + `append` operation
- `storage.sync` across the user's Chrome instances
- Rule priority / drag-reorder UI
- Per-tab "matches here" indicator
- `regexFilter` advanced matching mode
- Internationalization (i18n)
- Firefox / Edge port

## Reuse map

Every milestone builds on the existing engine — don't reinvent it:

- Rule → DNR mapping: `toDnrRule`, `buildAddRules`, `syncDynamicRules`
  (`src/lib/dnr.ts`)
- Persistence: `getRules`, `saveRules`, `onRulesChanged` (`src/lib/storage.ts`)
- Model: `HeaderRule` (`src/lib/types.ts`)
