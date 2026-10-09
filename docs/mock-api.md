# The mock API

The course lets you fire real HTTP requests at a real API and inspect what comes
back. That API is not a third-party service and, on the deployed site, it is not
a server either: it runs inside your own browser.

## Why it is not a server

The first implementation kept the mock data in a module-level variable on the
server. That works on one developer's laptop and breaks in production:

- visitors served by the same warm serverless instance share one dataset, so one
  person's `PUT` rewrites what everybody else sees;
- when a different instance answers, the data silently reverts;
- `POST /api/reset` resets whichever instance happens to receive it.

An interactive lesson cannot rest on mutable process memory, so the state moved
to where it belongs: the visitor.

## Architecture

```
browser tab ──fetch('/mock-api/...')──▶ Service Worker ──▶ IndexedDB
                                              │
                                              └── lib/mock/engine.ts
```

- **`/mock-api/**`** is owned by a Service Worker (`sw/mock-sw.ts`). Nothing on
  the server answers that path.
- Each browser seeds its own database on first visit and stores it in IndexedDB,
  so the data survives a refresh until the visitor resets it.
- `lib/mock/engine.ts` is one pure function, `handleMockRequest(store, request)`.
  It reads no ambient state, so the worker, the local dev server and the test
  suite all run the identical implementation against different stores.

Because the store is per browser, so is everything built on it: mutations,
`Idempotency-Key` records, and the rate-limit window.

The stored record carries the seed version (`SEED_VERSION` in
`lib/mock/seed.ts`). A worker that finds a record from another version seeds a
fresh one, so a deploy that changes the seed reaches every visitor, and data an
older engine allowed (such as a post whose author does not exist) does not
outlive the fix. Bump the version whenever the seed or the store's shape
changes.

## Language

Human-readable text follows the request's `Accept-Language`: problem `detail`s,
field messages, the endpoint index, GraphQL errors and hints. `zh` (and
`zh-CN`, `zh-TW`, ...) gets Chinese; anything else, or no header, gets
English. Those responses carry `Content-Language` and `Vary: Accept-Language`.
The inspector sends the interface language and shows the header in its
Request tab; the curl tab sends the same one.

Stored data is not translated. Post titles, bodies and comments are English for
every visitor, like the JSON examples in the chapters, and a problem's `title`
stays English because clients match on it.

## Readiness

A Service Worker does not control the page the instant it is registered. Until
it does, a request to `/mock-api` would reach the network and return a 404 HTML
page — a wrong answer dressed up as a lesson.

So readiness is proven, not assumed. The client first waits until the worker
controls the page. On a first visit that happens through `clients.claim()`
during activation. A hard reload (Shift+Reload) loads the page without a
controller while the worker is already active, so the client asks that worker
to claim the page. Only then does it probe `/mock-api/__ready`, so the probe
never reaches the network, and it requires the worker's own
`X-Mock-Scope: browser-local` header before enabling **Send**. Until then, and whenever the worker cannot start at all, the inspector
disables its controls and says why. It never falls back to the server.

If IndexedDB is unavailable (a private window, blocked storage), the worker
still serves requests from memory and the UI states that changes will not
survive a refresh.

## What curl can and cannot do

`curl` is a separate process. It has no access to your browser's Service Worker,
so **no terminal command can reach the interactive mock**, on any host.

What a terminal can drive is the same engine running on a *local clone*:

```bash
npm run dev                                   # http://localhost:3300
curl -i http://localhost:3300/api             # the endpoint index
curl -i http://localhost:3300/api/posts/42    # ETag, Cache-Control, rate limits
```

That server-side mock lives at `/api`, keeps one store per server process, and
is **disabled on shared hosting** (it detects `VERCEL`, or an explicit
`APIER_DISABLE_SERVER_MOCK=1`). On the deployed site `/api` returns a short
explanation pointing at `/mock-api` instead of serving shared state.

The inspector's curl tab reflects this exactly: it is labelled *Run against a
local clone*, targets `http://localhost:3300/api/...`, and says in both
languages that it cannot reach the request shown above it.

## Offline

Once the worker is installed the mock itself needs no network at all. The site's
pages and assets are not precached, so loading the site still requires a
connection — the mock is independent of the network, the site is not.

## Teaching behaviour

Everything the chapters demonstrate is implemented for real:

| Behaviour | Where |
|---|---|
| `201` + `Location` | `POST /mock-api/posts`, `POST /mock-api/posts/:id/comments` |
| `PUT` replaces the writable fields; omitted ones go back to their defaults (`body` `""`, `status` `DRAFT`) | `PUT /mock-api/posts/:id` |
| `PATCH` merges only what was sent | `PATCH /mock-api/posts/:id` |
| `id`, `createdAt` and `authorId` belong to the server; `PUT`/`PATCH` never change them | `PUT`/`PATCH /mock-api/posts/:id` |
| `204`, then `404` on a second delete; comments go with the post | `DELETE /mock-api/posts/:id` |
| RFC 9457 `problem+json`, incl. field-level `422` for wrong types and enum values | any error |
| `HEAD` answers like `GET` without a body | every readable resource |
| `OPTIONS` lists the resource's methods in `Allow`; an unsupported method gets `405` + `Allow`; an unknown method `501` | every resource |
| `ETag` / `If-None-Match` → empty `304` (weak comparison, lists of tags, `*`); the `304` repeats `ETag` and `Cache-Control` | single resources and collections |
| `Idempotency-Key` replays the first response, `Location` included; the same key with another body → `422` | `POST /mock-api/posts` |
| `401` vs `403`: `WWW-Authenticate: Bearer realm="apier"`, plus `error="invalid_token"` only for a token that was sent and rejected; `403` carries `error="insufficient_scope"` | write endpoints, by token |
| `429` + `Retry-After` + `X-RateLimit-*` on every counted response; reset is never rate limited | 60 requests per minute, per visitor |
| `page`/`per_page` or `limit`/`offset`, `status`/`authorId` filters, `sort`, `fields`; an unknown parameter → `400` naming the accepted ones | `GET /mock-api/posts`, `GET /mock-api/users` |
| GraphQL validation before execution (a request error has no `data`), `__schema`/`__type` introspection, non-null propagation, mutations need a write token, a mutation over `GET` → `405` | `POST /mock-api/graphql` |
| Deterministic reset | `POST /mock-api/reset` |

Teaching knobs: `?delay=800` slows the response so timings are visible
(`?delay=0` removes the default delay), `?dataloader=1` batches GraphQL loads
so `extensions.dbCalls` drops from 11 to 2. Tokens are `apier-demo-token` (may
write) and `apier-readonly-token` (403 on write). Cursor pagination is taught
in chapter 05 but not implemented; its parameters get a `400` that says so.

## Working on it

`sw/mock-sw.ts` is bundled to `public/mock-sw.js` by `scripts/build-sw.mjs`,
which runs automatically before `npm run dev` and `npm run build`. The generated
file is not committed. If you edit anything under `lib/mock/` or `sw/`, re-run
`npm run build:sw` (or just restart the dev server) and hard-reload the page so
the browser picks up the new worker.

```bash
npm run typecheck
npm run lint
npm run test:unit    # engine behaviour, no browser
npm run test:e2e     # real Chromium: isolation, persistence, the inspector
```
