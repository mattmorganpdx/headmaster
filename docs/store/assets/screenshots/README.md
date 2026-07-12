# Store screenshots

Drop the captures here, named exactly as below (the number is the display order;
#1 is the hero shot the store shows first).

Target size is **1280×800** (Web Store requirement). Capture clean and don't
worry about exact pixels — raw captures can be normalized to 1280×800
afterward (padded, not stretched).

| File                         | What it shows                                                                                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `01-three-env-rules.png`     | **Hero.** Full-page manager with three `X-Env` rules — `dev` → `\|\|dev.example.com`, `staging` → `\|\|staging.example.com`, `prod` → `\|\|example.com`. The "one header, three envs, no profiles" story. |
| `02-add-rule.png`            | The editor form filled in: header name `X-Env`, value, Operation = Set, URL filter `\|\|dev.example.com`. Shows how you create a rule.                                                                    |
| `03-popup-active-on-tab.png` | The **popup** open on a page a rule matches, showing "N active on this page" plus the rule list with toggles. Quick access + proof it's working.                                                          |
| `04-site-access-prompt.png`  | The Chrome per-site permission prompt appearing when you enable a rule (the privacy / per-site story). If it's hard to catch, replace with the in-app **URL filter help** page.                           |
| `05-export-import.png`       | The Export / Import buttons and the master enable-all / disable-all toggle — the management surface.                                                                                                      |

## Capture tips

- Use the **full-page view** for 01, 02, 05 (open it from the popup's "Open full
  view" link); use the **popup** for 03.
- Keep header values non-sensitive (the `X-Env` / `dev` example is perfect).
- PNG preferred. Light or dark theme is fine — pick whichever looks cleaner and
  keep all five consistent.
