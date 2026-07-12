# Security Policy

## Reporting a vulnerability

Please report security issues **privately** rather than opening a public issue.

- Preferred: open a [GitHub security advisory](https://github.com/mattmorganpdx/headmaster/security/advisories/new).
- Or email: mattmorganpdx@gmail.com

Please include steps to reproduce and the extension version (shown in the popup
footer). We aim to acknowledge reports within a few days.

## Scope & design notes

Headmaster is built to minimize its own attack surface:

- **No remote code.** Everything ships in the package; there are zero runtime
  dependencies.
- **No data collection.** Rules are stored only in `chrome.storage.local`; the
  extension makes no network requests of its own.
- **Least privilege.** It uses `declarativeNetRequestWithHostAccess` and
  requests host access **per site at runtime**, so it can only modify headers on
  hosts you have explicitly granted.

## Supported versions

The latest released version receives security fixes.
