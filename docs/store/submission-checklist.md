# Chrome Web Store submission checklist

Work top to bottom. Items marked **[you]** need the account owner (a browser, a
Google account, or payment).

## 1. One-time setup

- [ ] **[you]** Register a Chrome Web Store developer account and pay the **$5**
      one-time fee: <https://chrome.google.com/webstore/devconsole>
- [ ] **[you]** Enable GitHub Pages so the privacy policy has a public URL:
      repo **Settings → Pages → Source: Deploy from a branch → `main` / `/docs`**.
      This publishes <https://mattmorganpdx.github.io/headmaster/privacy-policy>.
      After the Pages build finishes, **open that URL to confirm it loads** (it
      is the extensionless form GitHub Pages serves for `privacy-policy.html`);
      use the exact working URL in the listing's Privacy policy field.

## 2. Build the upload package

- [ ] Run `npm run package` → produces `headmaster-v<version>.zip`
      (or download the artifact from the CI run of the version tag).
- [ ] Confirm the zip has `manifest.json` at its root.

## 3. Store listing (copy from `listing.md`)

- [ ] Name, Summary, Detailed description, Category = **Developer Tools**,
      Language = English.
- [ ] Single-purpose description.
- [ ] Privacy policy URL (from step 1).

## 4. Graphics

- [ ] Store icon **128×128** — `public/icons/128.png`.
- [ ] Small promo tile **440×280** — `docs/store/assets/promo-440x280.png`.
- [ ] (Optional) Marquee **1400×560** — `docs/store/assets/marquee-1400x560.png`.
- [ ] **[you]** 1–5 screenshots at **1280×800** (see shot list below).

## 5. Privacy practices tab (copy from `permissions-justifications.md`)

- [ ] Justify each permission: `declarativeNetRequestWithHostAccess`, `storage`,
      host permissions.
- [ ] Declare **no data collection** (check every "we do not collect …" box that
      applies — see the privacy policy for the full list).
- [ ] Certify: not sold/transferred to third parties; not used for unrelated
      purposes; not used for creditworthiness.
- [ ] Remote code: **No**.

## 6. Submit

- [ ] Upload the zip, fill the fields above, and submit for review.
- [ ] Expect review to be relatively quick: no broad host permission, no remote
      code, single narrow purpose.

---

## Screenshot shot list (1280×800) — **[you]**

Load the unpacked `dist/` (or the installed extension) and capture:

1. **The popup with three `X-Env` rules** (dev / staging / prod) — the headline
   use case: one header name, different values per environment.
2. **Adding a rule** — the editor form filled in (header name, value, URL
   filter).
3. **A site-access prompt** appearing when a rule is enabled — shows per-site
   permissions.
4. **The master enable-all / disable-all** toggle and per-rule controls.
5. **Export / import** buttons (optional).

Tip: a 1280×800 browser window with the popup open, cropped to 1280×800, works
well. Keep any real header values non-sensitive.
