# Chrome Web Store submission checklist

Work top to bottom. Items marked **[you]** need the account owner (a browser, a
Google account, or payment). Items marked **[done]** are already handled.

## 1. One-time setup

- [ ] **[you]** Register a Chrome Web Store developer account and pay the **$5**
      one-time fee, verify your contact email, and enable 2-Step Verification:
      <https://chrome.google.com/webstore/devconsole>
- [x] **[done]** GitHub Pages is enabled (`main` / `/docs`) and the privacy
      policy is live and rendering at
      <https://mattmorganpdx.github.io/headmaster/privacy-policy> (verified 200).
      Use that exact URL in the listing's Privacy policy field.

## 2. Build the upload package

- [x] **[done]** `headmaster-v1.0.0.zip` is built (also attached as the
      `headmaster-extension` artifact on the `v1.0.0` CI run).
- [x] **[done]** Verified `manifest.json` is at the zip root (version 1.0.0).

## 3. Store listing (all copy is ready in `listing.md` — paste it in)

- [ ] Name, Summary, Detailed description, Category = **Developer Tools**,
      Language = English.
- [ ] Single-purpose description.
- [ ] Privacy policy URL — confirmed live in step 1; paste it in.

## 4. Graphics (files are produced; the boxes are the upload step)

- [ ] Store icon **128×128** — ready: `public/icons/128.png`.
- [ ] Small promo tile **440×280** — ready: `docs/store/assets/promo-440x280.png`.
- [ ] (Optional) Marquee **1400×560** — ready:
      `docs/store/assets/marquee-1400x560.png`.
- [ ] **[you]** 1–5 screenshots at **1280×800** — the one graphic not yet made
      (see shot list below).

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

Use the **full-page view** for screenshots — it fills the 1280×800 frame far
better than the narrow popup. Open it from the popup's "Open full view" link, or
right-click the toolbar icon → Options. Then capture:

1. **The manager with three `X-Env` rules** (dev / staging / prod) — the headline
   use case: one header name, different values per environment.
2. **Adding a rule** — the editor form filled in (header name, value, URL
   filter).
3. **A site-access prompt** appearing when a rule is enabled — shows per-site
   permissions.
4. **The master enable-all / disable-all** toggle and per-rule controls.
5. **Export / import** buttons (optional).

Tip: maximize the tab, capture at 1280×800, and keep any real header values
non-sensitive. The compact popup is also worth one shot to show quick access.
