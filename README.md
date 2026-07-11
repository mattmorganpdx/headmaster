# Headmaster

A Chrome extension that sends extra **request headers** to matching URLs —
with **no profiles**. Every rule is independent and applies whenever its URL
pattern matches.

## Why

[ModHeader](https://modheader.com/) and [Headerly](https://headerly.dev/) both
force a **single active profile**: headers only fire when their profile is
active *and* the URL matches. That makes a common case awkward — sending the
**same header name with different values to different environments**
simultaneously:

| Header  | Value     | Applies to                 |
| ------- | --------- | -------------------------- |
| `X-Env` | `dev`     | `\|\|dev.example.com`      |
| `X-Env` | `staging` | `\|\|staging.example.com`  |
| `X-Env` | `prod`    | `\|\|example.com`          |

In Headmaster these are just three enabled rules. Chrome evaluates all of them
per request, so each fires on its own host — no profile switching.

## How it works

Headmaster is built on Manifest V3
[`declarativeNetRequest`](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest)
(DNR). Each enabled rule compiles to one DNR `modifyHeaders` rule with its own
`urlFilter`. Because DNR applies rules declaratively, **the extension never
reads your requests or responses** — a deliberate choice given the header-editor
supply-chain incidents. There are **zero runtime dependencies**.

## Install (unpacked)

```sh
npm install
npm run build          # outputs dist/
```

Then in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select the `dist/` folder

## URL filter syntax

The URL filter uses DNR's
[`urlFilter`](https://developer.chrome.com/docs/extensions/reference/api/declarativeNetRequest#property-RuleCondition-urlFilter)
patterns (not content-script match patterns):

| Pattern                | Matches                                    |
| ---------------------- | ------------------------------------------ |
| `\|\|dev.example.com`  | requests to that host (domain-anchored)    |
| `\|https://`           | anchored to the start of the URL           |
| `*/api/*`              | any URL whose path contains `/api/`        |
| `example.com`          | substring match anywhere in the URL        |

`*` is a wildcard; `\|` anchors the start/end; `\|\|` anchors a domain.

## Development

```sh
npm run dev        # vite build --watch
npm run test       # unit tests (vitest) for the rule engine
npm run typecheck  # tsc --noEmit
```

The testable core is `src/lib/dnr.ts` (app-rule → DNR-rule mapping).

## License

MIT
