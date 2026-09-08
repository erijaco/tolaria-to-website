# Third-party notices

This project's npm dependencies (see `package.json`) are used as-is via npm/pnpm and
carry their own licenses (all permissive: MIT, ISC, BSD-2-Clause, BSD-3-Clause, or
Apache-2.0 — verified with `pnpm licenses list`), which travel with each package and
aren't reproduced here.

The one exception — code copied directly into this repository rather than depended on
— is the icon shape data in `src/icons.ts`, sourced from the Lucide project.

A related but distinct case: when a note contains a ```mermaid diagram, the build
copies mermaid's own official browser bundle (`node_modules/mermaid/dist/mermaid.min.js`)
into that site's `static/` output so it can render client-side (see `src/site.ts`).
Unlike every other dependency, this one is redistributed to a generated site's
visitors, not just used by this repo's own build tooling — so its license travels
alongside it in the output too: `mermaid.LICENSE.txt` is copied into the same
`static/` directory whenever `mermaid.min.js` is. Mermaid is MIT-licensed
(Copyright (c) 2014 - 2022 Knut Sveidqvist); see
https://github.com/mermaid-js/mermaid/blob/master/LICENSE.

## Lucide

`src/icons.ts` contains SVG path data for icons from [Lucide](https://lucide.dev).

```
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
```

Lucide is itself a fork of [Feather Icons](https://feathericons.com), and a number of
Lucide icons (including some used in this project, given Lucide's history of renaming
icons since the fork) are derived from Feather and carry Feather's original license:

```
The MIT License (MIT)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Source: https://github.com/lucide-icons/lucide/blob/main/LICENSE
