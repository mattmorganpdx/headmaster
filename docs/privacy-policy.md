---
title: Privacy Policy
---

# Headmaster — Privacy Policy

**Effective date:** 2026-07-11

Headmaster is an open-source Chrome extension that adds, overrides, or removes
HTTP **request headers** on URLs matching patterns you define.

## The short version

**Headmaster does not collect, transmit, sell, or share any user data.** It has
no servers, no analytics, and makes no network requests of its own.

## What Headmaster stores, and where

The only data Headmaster keeps is **the rules you create** — the header names,
header values, URL-filter patterns, labels, and enabled/disabled state you enter
in the popup. These are stored **locally on your device** using Chrome's
`storage.local` API. They never leave your machine and are visible only to you.

If you use **Export**, a JSON file of your rules is written to your computer by
your own action. Headmaster does not upload it anywhere.

## Data we do NOT collect

To be explicit, using Chrome Web Store's categories, Headmaster does **not**
collect or transmit any of the following:

- Personally identifiable information
- Health information
- Financial and payment information
- Authentication information
- Personal communications
- Location
- Web history
- User activity (clicks, mouse position, keystroke logging, etc.)
- Website content

## Permissions and why they exist

- **`declarativeNetRequestWithHostAccess`** — lets Chrome apply your header rules
  through its declarative rules engine. This API modifies headers **without the
  extension ever reading your requests or responses**.
- **`storage`** — saves your rules locally so they persist between sessions.
- **Host access (`optional_host_permissions`)** — requested **per site, at
  runtime**, only when you add or enable a rule for that site. Headmaster can
  only modify headers on hosts you have explicitly granted.

## Changes to this policy

If this policy changes, the effective date above will be updated and the change
recorded in the project's `CHANGELOG.md`.

## Contact

Questions or concerns: **matt.morgan@digs.com**, or open an issue at
<https://github.com/mattmorganpdx/headmaster>.
