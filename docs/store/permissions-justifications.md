# Permission justifications

Paste each justification into the matching field on the dashboard's **Privacy
practices** tab. Keep them short and specific — reviewers read every one.

## `declarativeNetRequestWithHostAccess`

> Headmaster's core function is modifying HTTP request headers. It uses the
> declarativeNetRequest engine so Chrome applies the user's header rules
> declaratively, **without the extension reading request or response contents**.
> The `WithHostAccess` variant is used so there is no broad host-permission
> warning at install; the extension acts only on hosts the user explicitly
> grants at runtime.

## `storage`

> Stores the user's header rules (names, values, URL patterns, enabled state)
> locally via `chrome.storage.local` so they persist between sessions. No data is
> transmitted off the device.

## Host permissions (`optional_host_permissions: *://*/*`)

> Host access is requested **at runtime, per site**, only when the user adds or
> enables a rule targeting that site. It is declared as an optional permission so
> access is granted incrementally to exactly the sites the user configures,
> rather than requesting access to all sites up front.

## Remote code

> None. All code is contained in the package; there are zero runtime
> dependencies and nothing is fetched or evaluated from the network.

## Data usage certifications (check these on the dashboard)

- We do **not** sell or transfer user data to third parties.
- We do **not** use or transfer user data for purposes unrelated to the
  extension's single purpose.
- We do **not** use or transfer user data to determine creditworthiness or for
  lending.
