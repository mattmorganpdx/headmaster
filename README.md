<img src="public/icons/128.png" alt="Headmaster icon" width="72" align="left" />

# Headmaster

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Install-blue?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/headmaster/onammnmlgadchflpaadmjbaeobgnalge)
[![CI](https://github.com/mattmorganpdx/headmaster/actions/workflows/ci.yml/badge.svg)](https://github.com/mattmorganpdx/headmaster/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Chrome extension that sends extra **request headers** to matching URLs —
with **no profiles**. Every rule is independent and applies whenever its URL
pattern matches.

**[Install from the Chrome Web Store →](https://chromewebstore.google.com/detail/headmaster/onammnmlgadchflpaadmjbaeobgnalge)**

<br clear="left" />

## Why

[ModHeader](https://modheader.com/) and [Headerly](https://headerly.dev/) both
force a **single active profile**: headers only fire when their profile is
active _and_ the URL matches. That makes a common case awkward — sending the
**same header name with different values to different environments**
simultaneously:

| Header  | Value     | Applies to                |
| ------- | --------- | ------------------------- |
| `X-Env` | `dev`     | `\|\|dev.example.com`     |
| `X-Env` | `staging` | `\|\|staging.example.com` |
| `X-Env` | `prod`    | `\|\|example.com`         |

In Headmaster these are just three enabled rules. Chrome evaluates all of them
per request, so each fires on its own host — no profile switching.

## How it works

Headmaster is built on Manifest V3
[`declarativeNetRequest`](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)
(DNR). Each enabled rule compiles to one DNR `modifyHeaders` rule with its own
`urlFilter`. Because DNR applies rules declaratively, **the extension never
reads your requests or responses** — a deliberate choice given the header-editor
supply-chain incidents. There are **zero runtime dependencies**.

Headmaster requests site access **per site, at runtime** rather than asking for
all-sites access up front. When you add or enable a rule, Chrome prompts to
grant access to just the host(s) that rule targets — so the extension only ever
touches sites you have explicitly configured. A rule that can't be scoped to a
single host (a path-only or substring filter) will ask for broader access, and
an enabled rule that lacks access is flagged in the popup with a one-click grant.

## Install

**[Chrome Web Store](https://chromewebstore.google.com/detail/headmaster/onammnmlgadchflpaadmjbaeobgnalge)** — the easiest way.

### From source (unpacked)

```sh
npm install
npm run build          # outputs dist/
```

Then in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the `dist/` folder

## URL filters

Each rule matches requests by URL using Chrome's
[`declarativeNetRequest` `urlFilter`](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#property-RuleCondition-urlFilter)
syntax — e.g. `||dev.example.com` matches that host and its subdomains.

The extension ships a full reference: click **URL filter help** in the popup or
options footer (source: [`public/help/help.html`](public/help/help.html)).

## Development

```sh
npm run dev        # vite build --watch
npm run test       # unit tests (vitest) for the rule engine
npm run typecheck  # tsc --noEmit
```

The testable core is `src/lib/dnr.ts` (app-rule → DNR-rule mapping).

## License

MIT
