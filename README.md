# Degoog extensions

Add `https://github.com/Timpan4/degoog-extensions.git` in Degoog's Store.
Install and update individual extensions there. Requires Degoog 0.26.0 or newer.

## SearXNG engines

These extensions query an existing SearXNG service with JSON search enabled.
Set `SEARXNG_URL` in Degoog's environment to that service's base URL. Enable
the corresponding providers in SearXNG. The feed covers web, images, videos,
news, music, IT, science, maps, files and social searches.

Provider failures are reported to Degoog. Availability depends on the provider
and the server's outbound address. There is no browser fallback.

## Cloudflare Access plugin

This plugin implements Degoog's settings-login hook. Configure:

- `CF_ACCESS_ISSUER`: the HTTPS Cloudflare Access team origin.
- `CF_ACCESS_AUDIENCE`: the Access application's audience.
- `DEGOOG_ADMIN_EMAILS`: comma-separated administrator emails.

Select the plugin as Degoog's settings login middleware. Keep native settings
authentication enabled. The plugin validates Cloudflare user JWTs and creates
native administrator sessions for the allowlist.

The plugin does not protect the entire site. The deployment must require
Cloudflare Access on every request and prevent search-only users from presenting
another user's native `settings-token` cookie or `x-settings-token` header.
Native Degoog sessions are process-local and are not bound to Access identities.

## Publishing

This repository contains generated, self-contained extension bundles. Source and
tests are maintained in the private wall-e infrastructure repository. Publishing
a feed update does not install it into existing Degoog instances; use the Store
to refresh the feed and select updates. The Cloudflare plugin includes jose's
license alongside its bundle.
