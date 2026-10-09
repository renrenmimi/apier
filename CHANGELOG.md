# Changelog

## 2026-10-09 — audit fixes

An audit of the site covered bugs, UI and UX, accessibility, performance, the mock API and
the teaching content in both languages. Each fix below is its own pull request, and all are
merged into `main`.

### The mock API

- A hard reload (Shift+Reload) no longer leaves the mock unavailable: the page asks the
  already-active worker to take it over. The readiness probe waits for that, so it never
  reaches the network and a first visit no longer logs a 404 ([#8]).
- The chapter 04 PUT could leave post 7 without an existing author, which broke chapter
  10's N+1 experiment for anyone who skipped "Undo". PUT now keeps `id`, `createdAt` and
  `authorId`, and every write validates types, the status enum and the author ([#10]).
- Messages follow `Accept-Language` (English by default), so English readers no longer get
  Chinese problem details, field messages, GraphQL errors and hints. The inspector sends the
  interface language; the seed data is English for everyone, and a store written by an older
  seed is replaced ([#10]).
- HTTP details now match the specifications: HEAD, OPTIONS and 405 with `Allow`, 501 for
  unknown methods, weak and list `If-None-Match` on single resources and collections, a 304
  that keeps `Cache-Control`, an Idempotency-Key replay that keeps `Location` and a 422 for a
  reused key with another body, `WWW-Authenticate` error codes per RFC 6750, a comment
  `Location` that can be read back, `limit`/`offset` paging, and a 400 for unknown query
  parameters instead of silent filtering. Reset is no longer rate limited ([#10]).
- The GraphQL executor validates the whole document before running it, so request errors
  carry no `data`; a null in a non-null position propagates as the specification says;
  introspection follows the selection set; mutations need the write token and never run
  over GET ([#10]).

### The request inspector

- A preset whose answer differs from its note (a 429, a 404 after a deletion) says so
  instead of describing an outcome that did not happen, and notes follow a language switch
  made after the request ([#12]).
- Paths outside `/mock-api` are refused before they are sent; Enter can no longer send a
  second request while one is in flight; the curl command quotes every argument; HEAD is
  offered; the timing calls the remainder "in the browser", not "network"; the result tabs
  follow the WAI-ARIA tabs pattern ([#12]).

### Shell and settings

- Cold loads no longer fail to hydrate now and then: the two pre-paint scripts moved from
  `<head>` to the top of `<body>`, and the providers restore theme, language and sidebar
  state from storage if React renders the root again. The audit saw React error #418 on 7 of
  108 cold loads; after the change, 0 of 120 on production ([#11]).
- Two tabs no longer overwrite each other's progress ([#11]).
- Every page has its own title in the reader's language, unknown paths get a bilingual 404
  page, sections are visible without JavaScript, and the address bar follows the theme
  ([#11]).

### Interaction and accessibility

- Keyboard users can mark labs as done; the checkbox and the row's expand button are
  separate controls, and the checkbox has a 34 px target ([#13]).
- The sidebar is out of the tab order whenever it is off screen; the drawer takes focus and
  gives it back on Escape; the command palette keeps focus inside and returns it ([#13]).
- The quiz keeps focus after an answer and announces verdicts and the final score; code
  panes and animation stages that overflow can be focused and scrolled by keyboard ([#13]).
- Panels that stay dark in the light theme take the dark theme's colours, code comments and
  line numbers are readable, and axe reports no colour-contrast violations: 1,222 before
  on the twelve pages at 390 px in both themes and both languages, none after ([#14]).

### Layout

- Nothing is clipped at 360 or 390 px any more (47 elements were): grids use
  `minmax(0, 1fr)`, callouts let wide code scroll, hero titles may shrink to 30 px ([#14]).
- Sidebar titles and subtitles wrap instead of being cut off ([#11]).

### Performance

- Fonts are self-hosted, so builds no longer fail when Google Fonts returns a font URL
  without an extension; Noto Sans SC is used only for Chinese headings. English pages load
  no Chinese font (they loaded 278–485 KB of it), and Chinese pages load 231–288 KB instead
  of 1,135–1,327 KB, measured on `/`, `/http` and `/auth` ([#9]).
- The sidebar no longer prefetches every chapter after each page load: JavaScript per page
  went from 507 KB to 141–162 KB ([#9]).

### Teaching content

- Prologue and chapter 01: OAuth 2.0 and sign-in, "only text travels over the network", the
  URL anatomy, 400 versus 422, the curl note, idempotency of PATCH, 5xx advice, and the
  example domain `api.shop.example` ([#15]).
- Chapters 02–04: the same-origin policy, a Pokémon example that no longer pastes API values
  into `innerHTML`, HATEOAS and Fielding, the status-code count, and `createdAt` in sort
  parameters ([#16]).
- Chapters 05–06: GitHub's rate limits and 304s, conditional-request precedence, tolerant
  readers, and preflight only for cross-origin requests ([#17]).
- Chapters 07–09: the under-fetching waterfall (two serial round trips, not three), an
  injection example that actually parses, `@include`/`@skip` wording, response shape, a
  schema that matches across chapters, and String per the September 2025 edition ([#18]).
- Chapter 10 and the finale quote Matt Bessey's article accurately and agree with each
  other; GitHub publishes both REST and GraphQL; the examples stay inside the blog data
  ([#19]).
- Chinese copy is written in the course's register, terms have one rendering each, and the
  chapter summaries say the same thing in both languages ([#20]).
- Chinese copy no longer shows the spaces JSX made from line breaks: 627 in the rendered
  pages before, and the four left are intentional; a unit test guards the rule ([#21]).

### Not changed

- English is the default language and readers switch to Chinese by hand; a reader who chose
  Chinese briefly sees English on the first paint of a cold load.
- Cursor pagination is taught in chapter 05 but not implemented in the mock; its parameters
  get a 400 that says so.
- GraphQL errors carry no `locations`, and two validation rules (variables in allowed
  positions, overlapping fields) are not implemented.
- If JavaScript runs but the bundles fail to load, scroll-revealed sections stay hidden.
- Chapter pages stay client components; moving static copy to server components is a
  structural change for later.

[#8]: https://github.com/renrenmimi/apier/pull/8
[#9]: https://github.com/renrenmimi/apier/pull/9
[#10]: https://github.com/renrenmimi/apier/pull/10
[#11]: https://github.com/renrenmimi/apier/pull/11
[#12]: https://github.com/renrenmimi/apier/pull/12
[#13]: https://github.com/renrenmimi/apier/pull/13
[#14]: https://github.com/renrenmimi/apier/pull/14
[#15]: https://github.com/renrenmimi/apier/pull/15
[#16]: https://github.com/renrenmimi/apier/pull/16
[#17]: https://github.com/renrenmimi/apier/pull/17
[#18]: https://github.com/renrenmimi/apier/pull/18
[#19]: https://github.com/renrenmimi/apier/pull/19
[#20]: https://github.com/renrenmimi/apier/pull/20
[#21]: https://github.com/renrenmimi/apier/pull/21
