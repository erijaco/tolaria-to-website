# Tolaria to Website

Builds an offline-capable static website from a [Tolaria](https://tolaria.md) vault of
Markdown notes: resolves `[[wikilinks]]`, computes relationships/backlinks, groups notes
by `type:` (using each type's `_icon`/`_color`/`_order`/`_sidebar_label`), copies
attachments, and generates a client-side search index — no server or network required to
browse the output.

## Vault conventions supported

- Notes are Markdown files with YAML frontmatter; the first `# H1` is the title.
- `[[Note Name]]` and `[[Note Name|Alias]]` wikilinks, resolved by filename or title.
- Type documents (`type: Type` in frontmatter) register `_icon`, `_color`, `_order`,
  `_sidebar_label` for notes referencing that type.
- Frontmatter fields containing wikilinks become relationships. `belongs_to`/`has` and
  `related_to` get automatically computed inverses, same as in Tolaria.
- Attachments (images, PDFs, etc.) referenced by relative Markdown links are copied into
  the output and rewritten to the site's flattened `attachments/` directory.

## What gets published

Publishing is **opt-out**: every note is published unless it is excluded by one of:

- `private: true`, `draft: true`, or `publish: false` in its frontmatter
- a pattern in `vault/.tolariapublishignore` (`.gitignore` syntax)

Excluded notes are never written to the output, and any link or relationship pointing
*at* an excluded note is silently degraded to plain text on the public pages that
reference it — a published note never reveals the title or existence of a private one.

## Local usage

```sh
pnpm install
pnpm run site:build           # vault/ -> _site/
open _site/index.html         # or just double-click it; no server needed
```

Run `pnpm run site:build` with no flags in an interactive terminal and it will prompt
for the source vault folder, the destination folder, and (optionally) a note to use as
the home page — nothing to memorize for a one-off run.

Options (skip the prompts by passing flags, e.g. in scripts or CI):
`pnpm run site:build -- --vault path/to/vault --out path/to/dist --ignore-file path/to/ignorefile --home "Note Name"`.

- `--home <note>`: slug, filename, or title of a note to render as the site's
  `index.html`, in place of the auto-generated nav/search page (which then moves to
  `notes.html`, linked from the home page's header).

## CI/CD: publishing to a separate public repo (optional)

The workflow below is one way to publish the built site — entirely optional, and
independent of the local `site:build` command, which works standalone with no CI setup.

`.github/workflows/publish.yml` builds the site on every push to `main` and pushes the
contents of `_site/` to a **different, public** repository — the vault source (which may
contain excluded/private notes) never leaves this repo.

Setup:

1. Create the destination public repo (e.g. `your-org/your-public-site`), empty is fine.
2. In *this* repo's settings: **Settings > Secrets and variables > Actions**
   - Add secret `PUBLIC_REPO_TOKEN`: a fine-grained GitHub PAT scoped to **only** that
     public repo, with `Contents: Read and write` permission.
   - Add variable `PUBLIC_REPO`: `owner/repo-name` of the destination repo.
3. In the public repo, enable **GitHub Pages** from the `main` branch (root) if you want
   it hosted, not just mirrored.
4. Push to `main` here (or run the workflow manually) to publish.

The workflow force-pushes `main` in the public repo each run, since it's a generated
artifact, not something meant to be hand-edited or carry history.

## Credits

Built on [commander](https://github.com/tj/commander.js), [gray-matter](https://github.com/jonschlinkert/gray-matter),
[ignore](https://github.com/kaelzhang/node-ignore), [prompts](https://github.com/terkelg/prompts),
[fs-extra](https://github.com/jprichardson/node-fs-extra), and the [unified](https://unifiedjs.com)/remark/rehype
ecosystem for Markdown processing — see `package.json` for the full list; each carries
its own (permissive: MIT/ISC/BSD/Apache-2.0) license via npm.

Callout and header icons are from [Lucide](https://lucide.dev), inlined as CSS mask
images — no font/CDN dependency in the built site. Their SVG data is copied into
`src/icons.ts` rather than depended on via npm, so full license text (Lucide's ISC
license, plus the underlying MIT license for icons derived from Feather Icons) is
reproduced in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Limitations / not yet implemented

- `_display: sheet` spreadsheet notes render as plain Markdown, not as tables.
- No graph/neighborhood view.
- Custom (non-`belongs_to`/`has`/`related_to`) relationship fields are shown but have no
  computed inverse, matching notes only get an edge if they explicitly declare it.
- No incremental/watch build — every run rebuilds the whole site.
