# Submission paste sheet

Plain-text values ready to paste straight into the Chrome Web Store dashboard.
The dashboard's text fields are **plain text** (no Markdown), so each value below
is in a code block — copy the block contents verbatim. Order follows the
dashboard tabs.

---

## Store listing tab

**Product name**

```
Headmaster
```

**Summary** (short description, max 132 chars)

```
Add custom request headers to URLs by pattern. No profiles — every rule is independent, so one header can vary per environment.
```

**Description**

```
Headmaster adds, overrides, or removes HTTP request headers on the URLs you choose — with no profiles.

Other header editors force a single "active profile," so sending the same header with different values to different environments is awkward. Headmaster throws that model out. Every rule is independent and always evaluated, so you can send:

• X-Env: dev to dev.example.com
• X-Env: staging to staging.example.com
• X-Env: prod to example.com

…all at once, with no switching.

Features
• Independent rules — the same header name can have different values per URL
• Set, append, or remove request headers
• Simple URL matching using Chrome's declarativeNetRequest patterns
• See at a glance how many rules apply to the current tab
• Per-rule enable/disable, plus a master enable-all / disable-all toggle
• Duplicate rules in one click
• A quick popup and a full-page manager (whichever you prefer)
• Export and import your rules as JSON for backup or sharing

Private and trustworthy
• Open source (MIT): https://github.com/mattmorganpdx/headmaster
• Zero runtime dependencies — nothing is loaded from the network
• Collects no data; your rules stay on your device
• Uses Chrome's declarativeNetRequest, so it never reads your requests or responses
• Requests access to a site only when you add a rule for it

How it works
Each rule compiles to one Chrome declarativeNetRequest rule with its own URL filter. Chrome evaluates them all per request, so matching rules apply together — no active-profile gate.
```

**Category:** Developer Tools
**Language:** English (United States)

**Additional fields (optional but recommended)**

Homepage URL:

```
https://github.com/mattmorganpdx/headmaster
```

Support URL:

```
https://github.com/mattmorganpdx/headmaster/issues
```

(Leave any "Official URL" / verified-domain option blank — that needs Search
Console domain verification, which isn't available for a shared github.io host.)

**Graphics to upload**

- Store icon 128×128 — `public/icons/128.png`
- Screenshots (in order) — `docs/store/assets/screenshots/01…05`
- Small promo tile 440×280 — `docs/store/assets/promo-440x280.png`
- (Optional) Marquee 1400×560 — `docs/store/assets/marquee-1400x560.png`

---

## Privacy tab

**Single purpose**

```
Headmaster's single purpose is to add, override, or remove HTTP request headers on web requests whose URLs match user-defined patterns.
```

**Permission justification — declarativeNetRequestWithHostAccess**

```
Headmaster's core function is modifying HTTP request headers. It uses the declarativeNetRequest engine so Chrome applies the user's header rules declaratively, without the extension reading request or response contents. The WithHostAccess variant is used so there is no broad host-permission warning at install; the extension acts only on hosts the user explicitly grants at runtime.
```

**Permission justification — storage**

```
Stores the user's header rules (names, values, URL patterns, enabled state) locally via chrome.storage.local so they persist between sessions. No data is transmitted off the device.
```

**Permission justification — activeTab**

```
When the user opens the popup, Headmaster reads the current tab's URL to show how many of their rules apply to that page. The URL is used only to compute that count in the popup; it is never stored or transmitted.
```

**Permission justification — host permissions**

```
Host access is requested at runtime, per site, only when the user adds or enables a rule targeting that site. It is declared as an optional permission so access is granted incrementally to exactly the sites the user configures, rather than requesting access to all sites up front.
```

**Remote code:** No — all code ships in the package; nothing is fetched or evaluated from the network.

**Privacy policy URL**

```
https://mattmorganpdx.github.io/headmaster/privacy-policy
```

**Data usage — declare / certify**

- Data collected: **none** (leave all data-type boxes unchecked).
- ☑ I do not sell or transfer user data to third parties.
- ☑ I do not use or transfer user data for purposes unrelated to the single purpose.
- ☑ I do not use or transfer user data to determine creditworthiness or for lending.

---

## Package to upload

`headmaster-v1.0.1.zip` (repo root, or the asset on the
[v1.0.1 release](https://github.com/mattmorganpdx/headmaster/releases/tag/v1.0.1)).
