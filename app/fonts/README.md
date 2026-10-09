# Fonts

The site's four typefaces are self-hosted from this directory, so `next build`
never downloads fonts. Fetching them from Google Fonts at build time made
builds fail at random: `next/font/google` crashes (`loader.js`, "Cannot read
properties of null (reading '1')") whenever Google's CSS names a font file
without an extension (`fonts.gstatic.com/l/font?kit=...`), which it does for
roughly one request in ten.

| File | Family | Coverage | Used for |
|---|---|---|---|
| `syne-latin.woff2` | Syne, weights 600–800 | Google Fonts latin subset | Display headings |
| `space-grotesk-latin.woff2` | Space Grotesk, weights 400–700 | Google Fonts latin subset | Interface text |
| `jetbrains-mono-latin.woff2` | JetBrains Mono, weights 400–700 | Google Fonts latin subset | Code and numbers |
| `noto-sans-sc/*.woff2`, `noto-sans-sc.css` | Noto Sans SC, weights 400–900 | Google Fonts' 101 unicode-range slices | Chinese headings only |

The files are the variable fonts as Google Fonts serves them (the same files
DataData and AlgoAlgo self-host). The three Latin families are loaded with
`next/font/local` in `app/layout.tsx`; Noto Sans SC through the plain
`@font-face` rules in `noto-sans-sc.css`, one rule per slice covering every
weight.

Only the Chinese heading stack in `app/globals.css` names Noto Sans SC: it gives
headings a real 900 weight where system PingFang stops at 600. Chinese body
text uses the system fonts, so a Chinese page downloads only the slices that
hold its headings' characters, and an English page downloads none.

All four families are licensed under the SIL Open Font License 1.1, which
permits redistributing them with this site. Each file carries its copyright
notice and license in its metadata; the license is published at
https://openfontlicense.org.
