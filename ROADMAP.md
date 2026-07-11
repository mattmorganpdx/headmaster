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

## M2 — Validation & error surfacing · **[1.0, blocker]**

No rule should ever fail silently.

- [ ] New `src/lib/validate.ts` — `validateHeaderName` (RFC 7230 token chars) and
      `validateUrlFilter` (structural checks); wire into the `popup.ts` submit
      handler using the existing `showError`.
- [ ] `src/background/service-worker.ts`: wrap `syncDynamicRules` in try/catch
      and write a `lastError` status to `chrome.storage.local`; the popup
      subscribes and displays it via an `aria-live` region.
- [ ] Unit tests for both validators.

## M3 — Config export / import · **[1.0]**

- [ ] New `src/lib/io.ts` — versioned `serializeRules` / `parseRules` with shape
      validation.
- [ ] Export a `.json` via `Blob` download; import via file input, then
      re-request host permissions (M1) for imported rules.
- [ ] Export / Import buttons in `popup.html` + `popup.ts`.
- [ ] Round-trip and bad-input-rejection tests.

## M4 — UX polish & branding · **[1.0]**

- [ ] Real branded icons at 16 / 48 / 128 (+128 store), replacing the placeholder
      "H" glyphs in `public/icons/`.
- [ ] Master enable-all / disable-all switch; duplicate-rule action.
- [ ] Accessibility: `label`/`for` associations, focus management, full keyboard
      operation, `aria-live` errors; scroll overflow for long rule lists; a
      footer with version + urlFilter help link.
- [ ] README: CI + license badges and a screenshot/GIF; add `SECURITY.md`.

## M5 — Engineering quality & release tooling · **[1.0]**

- [ ] Add ESLint + Prettier (dev-only) and a `lint` step to
      `.github/workflows/ci.yml`.
- [ ] Expand Vitest coverage: validators, io round-trip, origin derivation,
      storage.
- [ ] `scripts/package.mjs` — build + zip `dist/` to `headmaster-vX.Y.Z.zip`;
      upload as a CI artifact on tag.
- [ ] `CHANGELOG.md` (Keep a Changelog); adopt semver; keep `manifest.json`
      version in sync.

## M6 — Web Store submission · **[1.0, blocker to publish]**

- [ ] `docs/privacy-policy.md` served via **GitHub Pages** (public URL):
      declares no data collected or transmitted, rules stored locally only, and a
      contact email.
- [ ] Complete the **Privacy Practices** tab so disclosures match the policy
      wording _(you)_.
- [ ] `docs/store/listing.md` — name, short summary, detailed description,
      category **Developer Tools**, explicit single-purpose statement.
- [ ] `docs/store/permissions-justifications.md` — justifications for
      `declarativeNetRequestWithHostAccess`, `storage`, and optional host perms.
- [ ] Produce the 440×280 promo tile (+ optional 1400×560 marquee) and 128 icon.
- [ ] Capture up to five **1280×800** screenshots from a shot list _(you)_.
- [ ] Complete **$5** developer registration and submit _(you)_.
- [ ] `docs/store/submission-checklist.md` tying it all together.

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
