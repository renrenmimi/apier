# APIer — an interactive course on HTTP, REST and GraphQL

**▶ [Open the course](https://apier-eta.vercel.app)** — runs in your browser, nothing to install.

An interactive course covering HTTP, REST, and GraphQL, from introductory concepts to
practical API design trade-offs.

Sister sites: [DataData](https://data-data.vercel.app) (data structures) and
[AlgoAlgo](https://algo-algo.vercel.app) (algorithms) — same design language.

![The course home — 12 chapters across REST and GraphQL](docs/home.jpg)

*The course home — 12 chapters across REST and GraphQL*

![HTTP: status codes, methods and headers, explored interactively](docs/http.jpg)

*HTTP: status codes, methods and headers, explored interactively*

![The request inspector: a real round trip to the in-browser mock API, with status, timing, headers and body](docs/inspector.jpg)

*The request inspector — the mock API runs in your own browser through a Service Worker, so the round trip is real: status, the server and in-browser timing, twelve response headers, the body, and the curl you would type instead.*

## Chapters

| # | Chapter | What it covers |
|---|---|---|
| 00 | Prologue — what an API is | The restaurant analogy · client/server · JSON · your first real request |
| 01 | HTTP, the native tongue | URL anatomy · methods and idempotency · status codes · headers · the message |
| 02 | Your first call | fetch · async/await · the `res.ok` trap · POST · DevTools |
| 03 | The ideas behind REST | The six constraints · resources and representations · the maturity model · HATEOAS |
| 04 | Designing RESTful APIs | URL naming · CRUD mapping · choosing status codes · RFC 9457 error format |
| 05 | REST in production | Pagination · filtering · versioning · ETag caching · idempotency keys · rate limits · OpenAPI |
| 06 | Auth and security | API keys · Basic · JWT · OAuth 2.0 · CORS · HTTPS |
| 07 | Meeting GraphQL | Over- and under-fetching · your first query · one endpoint · GraphiQL |
| 08 | Schema and type system | SDL · scalars and modifiers · the type graph · interface/union/input · introspection |
| 09 | Queries, mutations, subscriptions | Variables, aliases, fragments, directives · mutations · subscriptions · errors and pagination |
| 10 | GraphQL servers and performance | Resolvers · the N+1 problem · DataLoader · caching · security limits |
| ✦ | Finale — the comparison | Side by side on every axis · a decision tree · GitHub and Shopify case studies · final quiz |

Each chapter follows the same rhythm: an intuition first, then an interactive
visualization, then runnable code, then the common mistakes, then a hands-on
task, then a quiz. Some of those tasks do call a live public API — chapter 02
fetches PokéAPI and chapter 06 JSONPlaceholder — but the five chapters with a
request inspector use the mock API below instead, which runs in your own
browser. Progress is stored locally in the browser.

## Running locally

Requires Node 22:

```bash
nvm use
npm install
npm run dev        # http://localhost:3300
```

Checks:

```bash
npm run typecheck
npm run lint
npm run test       # engine unit tests + Chromium end-to-end tests
npm run build
```

## Structure

Next.js 15 (App Router) + TypeScript + React 19, plain CSS. Every chapter prerenders to a
static page.

Each chapter is one folder under `app/` holding its page, a small server layout that gives
the page its title, its visualizations (`viz.tsx`) and its own stylesheet, paired with a
data file under `lib/` for quizzes and exercises. The fonts are self-hosted from
`app/fonts`, so a build needs no network.

## The mock API

Chapters 01, 04, 05, 06 and 10 embed a request inspector that sends real HTTP requests and
shows the status, headers, timing breakdown, body size and payload. The mock's messages
follow the interface language (it reads `Accept-Language`); its data is the same in both.

Those requests go to `/mock-api`, which is served by a **Service Worker inside your own
browser**, backed by IndexedDB. Your data is yours: nobody else can see or change it, it
survives a refresh, and `POST /mock-api/reset` restores the original dataset exactly. No
third-party API, no shared server state, no CORS.

A Service Worker cannot be reached by `curl`. To drive the same engine from a terminal,
clone the repository and run `npm run dev`, which exposes the server-side equivalent at
`http://localhost:3300/api`. That endpoint is disabled on shared hosting so visitors never
share mutable state.

See [docs/mock-api.md](docs/mock-api.md) for the full picture, and
[CHANGELOG.md](CHANGELOG.md) for the fixes that followed the October 2026 audit.

---

© 2026 Weiren Feng. All rights reserved. Published for reading and portfolio purposes; not
licensed for reuse, modification, or redistribution.
