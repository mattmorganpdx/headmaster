/**
 * Input validation for rule fields. Each validator returns an error message
 * string, or `null` when the value is valid.
 */

// RFC 7230 token characters — the legal set for an HTTP header field name.
const HEADER_NAME_RE = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

/** Validate an HTTP request header name. */
export function validateHeaderName(name: string): string | null {
  if (!name) return "Header name is required.";
  if (!HEADER_NAME_RE.test(name)) {
    return "Header name may only contain letters, digits, and ! # $ % & ' * + - . ^ _ ` | ~";
  }
  return null;
}

/** Validate an HTTP header value (only relevant for the "set" operation). */
export function validateHeaderValue(value: string): string | null {
  // CR/LF would allow header injection; NUL and other controls are invalid.
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F\x7F]/.test(value)) {
    return "Header value cannot contain control characters (e.g. newlines).";
  }
  return null;
}

/**
 * Validate a declarativeNetRequest `urlFilter`. This catches the structural
 * mistakes the DNR engine rejects (non-printable-ASCII, whitespace) before they
 * reach the service worker; it intentionally does not try to fully parse the
 * pattern grammar.
 */
export function validateUrlFilter(filter: string): string | null {
  if (!filter) return "URL filter is required.";
  if (/\s/.test(filter)) return "URL filter cannot contain spaces.";
  // Printable ASCII only: rejects control chars and non-ASCII in one check.
  if (/[^\x20-\x7E]/.test(filter)) {
    return "URL filter must be printable ASCII — use punycode for international domains.";
  }
  return null;
}
