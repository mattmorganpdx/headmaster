/**
 * Runtime host-permission handling.
 *
 * Headmaster requests host access **per site, at runtime** rather than shipping
 * a broad `<all_urls>` grant. `modifyHeaders` only takes effect on hosts the
 * user has granted, so when a rule is added or enabled we derive the origin(s)
 * its `urlFilter` targets and request exactly those.
 */

/** Broad fallback when a filter doesn't map to a single host. */
export const BROAD_ORIGIN = "*://*/*";

const HOSTNAME_RE = /^[a-z0-9.-]+$/i;

function isLikelyHost(host: string): boolean {
  if (!host) return false;
  if (host === "localhost") return true;
  // A real host: hostname characters, contains a dot (a domain), not a
  // leading/trailing dot. This rejects bare path fragments like "api".
  return (
    HOSTNAME_RE.test(host) &&
    host.includes(".") &&
    !host.startsWith(".") &&
    !host.endsWith(".")
  );
}

/**
 * Derive the host-permission match pattern(s) a rule's `urlFilter` needs.
 *
 * Returns `null` when the filter doesn't clearly encode a single host (path- or
 * substring-only filters, or a leading wildcard) — callers should then fall
 * back to {@link BROAD_ORIGIN}.
 *
 * Domain-anchored filters (`||host`, `*.host`) return both the apex and a
 * subdomain wildcard so coverage matches DNR's own subdomain semantics.
 *
 * Examples:
 * - `||dev.example.com` → apex + subdomain patterns for dev.example.com
 * - `*://api.example.com/*` → single pattern for api.example.com
 * - `|https://localhost:3000/` → `*://localhost/*` (port dropped)
 * - a path-only filter such as `/api/` → `null`
 */
export function originsFromUrlFilter(urlFilter: string): string[] | null {
  let s = urlFilter.trim();
  if (!s) return null;

  // Strip DNR anchors: `||` = domain-anchored, `|` = start-of-URL.
  let domainAnchored = false;
  if (s.startsWith("||")) {
    domainAnchored = true;
    s = s.slice(2);
  } else if (s.startsWith("|")) {
    s = s.slice(1);
  }

  // Strip an explicit scheme (`http://`, `https://`, `*://`, `ws://`, ...).
  s = s.replace(/^(\*|https?|wss?):\/\//i, "");

  // A leading `*.` is a subdomain wildcard — treat like a domain anchor.
  if (s.startsWith("*.")) {
    domainAnchored = true;
    s = s.slice(2);
  } else if (s.startsWith("*")) {
    // Any other leading wildcard: no anchorable host.
    return null;
  }

  // The host runs until the first path/query/fragment/port/wildcard delimiter,
  // or a DNR separator (`^`) / end anchor (`|`).
  const host = s.split(/[/*?#:^|]/, 1)[0] ?? "";
  if (!isLikelyHost(host)) return null;

  return domainAnchored
    ? [`*://${host}/*`, `*://*.${host}/*`]
    : [`*://${host}/*`];
}

/** The origins to request/check for a filter (falls back to broad access). */
export function targetOriginsFor(urlFilter: string): string[] {
  return originsFromUrlFilter(urlFilter) ?? [BROAD_ORIGIN];
}

/**
 * Request host access for a rule's filter. Must be called from a user gesture
 * (e.g. a click/submit handler). Resolves to whether access was granted.
 */
export function requestOriginsFor(urlFilter: string): Promise<boolean> {
  return chrome.permissions.request({ origins: targetOriginsFor(urlFilter) });
}

/**
 * Whether host access for a filter is currently granted.
 *
 * Uses `chrome.permissions.contains`, which checks coverage *semantically* — a
 * broad grant covers a specific origin, and it is immune to how Chrome
 * normalizes stored origin strings (an exact string match against
 * `getAll().origins` is not reliable). Resolves `false` on any error.
 */
export async function hasAccessFor(urlFilter: string): Promise<boolean> {
  try {
    return await chrome.permissions.contains({
      origins: targetOriginsFor(urlFilter),
    });
  } catch {
    return false;
  }
}
