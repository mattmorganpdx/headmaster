# Chrome Web Store listing copy

This is the readable reference (Markdown). **For copy-paste into the dashboard,
use [`submission-paste-sheet.md`](submission-paste-sheet.md)** — it has the same
text as plain, paste-ready blocks (no `>` / `**` / backticks).

## Name

Headmaster

## Category

Developer Tools

## Language

English (United States)

## Summary (short description — keep ≤ 132 characters)

> Add custom request headers to URLs by pattern. No profiles — every rule is independent, so one header can vary per environment.

## Detailed description

> **Headmaster adds, overrides, or removes HTTP request headers on the URLs you
> choose — with no profiles.**
>
> Other header editors force a single "active profile," so sending the same
> header with different values to different environments is awkward. Headmaster
> throws that model out. Every rule is independent and always evaluated, so you
> can send:
>
> • `X-Env: dev` to `dev.example.com`
> • `X-Env: staging` to `staging.example.com`
> • `X-Env: prod` to `example.com`
>
> …all at once, with no switching.
>
> **Features**
> • Independent rules — the same header name can have different values per URL
> • Set, append, or remove request headers
> • Simple URL matching using Chrome's declarativeNetRequest patterns
> • See at a glance how many rules apply to the current tab
> • Per-rule enable/disable, plus a master enable-all / disable-all toggle
> • Duplicate rules in one click
> • A quick popup and a full-page manager (whichever you prefer)
> • Export and import your rules as JSON for backup or sharing
>
> **Private and trustworthy**
> • Open source (MIT): https://github.com/mattmorganpdx/headmaster
> • Zero runtime dependencies — nothing is loaded from the network
> • Collects no data; your rules stay on your device
> • Uses Chrome's declarativeNetRequest, so it never reads your requests or
> responses
> • Requests access to a site only when you add a rule for it
>
> **How it works**
> Each rule compiles to one Chrome declarativeNetRequest rule with its own URL
> filter. Chrome evaluates them all per request, so matching rules apply
> together — no active-profile gate.

## Single-purpose description (required by the dashboard)

> Headmaster's single purpose is to add, override, or remove HTTP request
> headers on web requests whose URLs match user-defined patterns.

## Privacy policy URL

`https://mattmorganpdx.github.io/headmaster/privacy-policy` (enable GitHub Pages
for the `/docs` folder on `main`; see the submission checklist).
