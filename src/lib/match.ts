/**
 * Test whether a declarativeNetRequest `urlFilter` matches a URL.
 *
 * This mirrors DNR's matching closely enough to drive the popup's "active on
 * this tab" indicator — it is not a byte-for-byte reimplementation of Chrome's
 * matcher. Matching is case-insensitive (DNR's default). Special tokens:
 *
 * - `*` — wildcard (any run of characters)
 * - `^` — separator: a character that is not `[A-Za-z0-9_.%-]`, or end of URL
 * - leading `|` — anchor to the start of the URL; trailing `|` — anchor to end
 * - leading `||` — domain anchor: the host, or any of its subdomains
 * - no special characters — a plain substring match anywhere in the URL
 */
export function matchesUrlFilter(urlFilter: string, url: string): boolean {
  let pattern = urlFilter;
  if (!pattern || !url) return false;

  let domainAnchor = false;
  let startAnchor = false;
  let endAnchor = false;

  if (pattern.startsWith("||")) {
    domainAnchor = true;
    pattern = pattern.slice(2);
  } else if (pattern.startsWith("|")) {
    startAnchor = true;
    pattern = pattern.slice(1);
  }
  if (pattern.endsWith("|")) {
    endAnchor = true;
    pattern = pattern.slice(0, -1);
  }

  let body = "";
  for (const ch of pattern) {
    if (ch === "*") body += ".*";
    else if (ch === "^") body += "(?:[^A-Za-z0-9_.%-]|$)";
    else body += escapeRegExp(ch);
  }

  // Domain anchor: scheme://, then optional subdomain labels, before the host.
  const prefix = domainAnchor
    ? "^[a-z][a-z0-9+.\\-]*://(?:[^/?#]*\\.)?"
    : startAnchor
      ? "^"
      : "";
  const suffix = endAnchor ? "$" : "";

  try {
    return new RegExp(prefix + body + suffix, "i").test(url);
  } catch {
    return false;
  }
}

function escapeRegExp(ch: string): string {
  return ch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
