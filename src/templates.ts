import type { NoteFile, TypeDef, VaultIndex } from "./types.js";
import { notesHref } from "./outputName.js";
import type { HeadingEntry } from "./pipeline.js";
import { THEME_INIT_INLINE_JS, JS_ENABLED_INLINE_JS } from "./staticAssets.js";
import { escapeHtml } from "./html.js";
import { renderLocalGraph } from "./graph.js";

const THEME_TOGGLE_BUTTON = `<button type="button" class="theme-toggle" aria-label="Toggle dark mode" title="Toggle dark mode"></button>`;
const TOC_TOGGLE_BUTTON = `<button type="button" id="toc-toggle" class="toc-toggle" aria-label="Table of contents" title="Table of contents" aria-expanded="false" aria-controls="toc-sidebar"></button>`;

function graphToggleLink(href: string): string {
  return `<a class="graph-toggle" href="${href}" aria-label="Graph view" title="Graph view"></a>`;
}

/**
 * Same redaction rule as body wikilinks: a resolved-but-unpublished target never has
 * its real title surfaced in a public property table, even inside raw frontmatter text.
 * Strips a `#heading` anchor before the lookup, same as wikilinks.ts's WIKILINK_RE -
 * otherwise an anchored link's target never matches byKey and falls through to
 * rendering the raw (unredacted) text.
 *
 * When a target resolves and isn't redacted, its own title is shown rather than the raw
 * `[[link text]]` the author typed - matching wikilinks.ts, and avoiding a mismatch
 * when a note's filename and its actual title (H1/frontmatter) have drifted apart.
 */
function redactWikilinks(
  s: string,
  linkIndex: Pick<VaultIndex, "notes" | "byKey" | "published">
): string {
  return s.replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g, (_m, t: string, a?: string) => {
    const alias = a?.trim();
    const target = t.trim();
    const targetSlug = linkIndex.byKey.get(target.toLowerCase());
    if (!targetSlug) return alias ?? target;
    if (!linkIndex.published.has(targetSlug)) return alias ?? "(private)";
    return alias ?? linkIndex.notes.get(targetSlug)?.title ?? target;
  });
}

function stringifyValue(v: unknown, linkIndex: Pick<VaultIndex, "notes" | "byKey" | "published">): string {
  if (Array.isArray(v)) return v.map((x) => redactWikilinks(String(x), linkIndex)).join(", ");
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return redactWikilinks(String(v), linkIndex);
}

/** Builds a nested <ul> table of contents from a flat, document-order heading list. */
function renderTocList(headings: HeadingEntry[]): string {
  interface TocNode {
    entry?: HeadingEntry;
    children: TocNode[];
  }
  const root: TocNode = { children: [] };
  const stack: { depth: number; node: TocNode }[] = [{ depth: 0, node: root }];
  for (const entry of headings) {
    while (stack.length > 1 && stack[stack.length - 1].depth >= entry.depth) stack.pop();
    const node: TocNode = { entry, children: [] };
    stack[stack.length - 1].node.children.push(node);
    stack.push({ depth: entry.depth, node });
  }
  const render = (node: TocNode): string =>
    node.children.length
      ? `<ul>${node.children
          .map((c) => `<li><a href="#${c.entry!.id}">${escapeHtml(c.entry!.text)}</a>${render(c)}</li>`)
          .join("")}</ul>`
      : "";
  return render(root);
}

export function renderNotePage(args: {
  note: NoteFile;
  bodyHtml: string;
  headings: HeadingEntry[];
  typeDef?: TypeDef;
  relationships: { field: string; target: NoteFile }[];
  backlinks: NoteFile[];
  outboundLinks: NoteFile[];
  types: Map<string, TypeDef>;
  linkIndex: Pick<VaultIndex, "notes" | "byKey" | "published">;
  /** Path overrides for rendering this note somewhere other than its default notes/ location. */
  cssHref?: string;
  backHref?: string;
  backLabel?: string;
  notesPrefix?: string;
  /** When a note has been picked as the home page, this links directly back to it. */
  homeHref?: string;
  /** Whether the rendered body contains a ```mermaid fenced code block. */
  hasMermaid?: boolean;
  graphHref?: string;
}): string {
  const {
    note,
    bodyHtml,
    headings,
    typeDef,
    relationships,
    backlinks,
    outboundLinks,
    types,
    linkIndex,
    cssHref = "../static/style.css",
    backHref = "../index.html",
    backLabel = "All notes",
    notesPrefix = "",
    homeHref,
    hasMermaid = false,
    graphHref = "../graph.html",
  } = args;

  const propRows = Object.entries(note.frontmatter)
    .filter(([k]) => !k.startsWith("_") && k !== "type")
    .map(
      ([k, v]) => `<tr><th>${escapeHtml(k)}</th><td>${escapeHtml(stringifyValue(v, linkIndex))}</td></tr>`
    )
    .join("");

  const relByField = new Map<string, NoteFile[]>();
  for (const r of relationships) {
    const list = relByField.get(r.field) ?? [];
    list.push(r.target);
    relByField.set(r.field, list);
  }
  const relSections = [...relByField.entries()]
    .map(
      ([field, targets]) => `
      <section class="relation-group" data-field="${escapeHtml(field)}">
        <h3>${escapeHtml(field)}</h3>
        <ul>${targets
          .map((t) => `<li><a href="${notesHref(t.slug, notesPrefix)}">${escapeHtml(t.title)}</a></li>`)
          .join("")}</ul>
      </section>`
    )
    .join("");

  const backlinksHtml = backlinks.length
    ? `<section class="backlinks"><h3>Linked from</h3><ul>${backlinks
        .map((b) => `<li><a href="${notesHref(b.slug, notesPrefix)}">${escapeHtml(b.title)}</a></li>`)
        .join("")}</ul></section>`
    : "";

  const graphHtml = renderLocalGraph({
    note,
    relationships,
    backlinks,
    outboundLinks,
    types,
    notesPrefix,
    typeDef,
    graphHref,
  });

  const frontmatterHtml = propRows
    ? `<details class="frontmatter">
        <summary>Frontmatter</summary>
        <table class="properties"><tbody>${propRows}</tbody></table>
      </details>`
    : "";

  const hasToc = headings.length >= 2;
  /* Sits in its original inline spot in document order (matters for the no-JS
   * fallback in STYLE_CSS, which renders it right here rather than as a drawer) - CSS
   * alone repositions it to the right-hand drawer once JS is available. */
  const tocHtml = hasToc
    ? `<aside id="toc-sidebar" class="toc-sidebar" aria-hidden="true"><p class="toc-title">Contents</p>${renderTocList(headings)}</aside>`
    : "";

  const typeLabel = typeDef ? typeDef.sidebarLabel ?? typeDef.name : note.typeName;
  const breadcrumbSegments = typeLabel ? [typeLabel, note.title] : [note.title];
  const printBreadcrumb = breadcrumbSegments
    .map((seg, i, all) =>
      i === all.length - 1
        ? `<span class="print-breadcrumb-current">${escapeHtml(seg)}</span>`
        : `<span>${escapeHtml(seg)}</span>`
    )
    .join(' <span class="print-breadcrumb-sep">/</span> ');

  const badge = typeDef
    ? `<span class="type-badge"${
        typeDef.color ? ` style="--type-color:${escapeHtml(typeDef.color)}"` : ""
      }>${escapeHtml(typeDef.sidebarLabel ?? typeDef.name)}</span>`
    : "";

  /** Derives another static/ asset's href from cssHref's own (which already accounts
   * for how deep the current page sits relative to static/). */
  const staticHref = (filename: string) => cssHref.replace(/style\.css$/, filename);
  const themeJsHref = staticHref("theme.js");
  const tocSidebarJsHref = staticHref("toc-sidebar.js");
  const printJsHref = staticHref("print.js");
  const mermaidScripts = hasMermaid
    ? `<script src="${staticHref("mermaid.min.js")}"></script>
<script src="${staticHref("mermaid-init.js")}"></script>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>${THEME_INIT_INLINE_JS}${JS_ENABLED_INLINE_JS}</script>
<title>${escapeHtml(note.title)}</title>
<link rel="stylesheet" href="${cssHref}">
</head>
<body>
<header class="page-header">
  <nav class="header-nav">
    <span class="print-breadcrumb">${printBreadcrumb}</span>
    <a class="back-link" href="${backHref}">&larr; ${escapeHtml(backLabel)}</a>
    ${homeHref ? `<a class="home-link" href="${homeHref}">Home</a>` : ""}
  </nav>
  <div class="header-actions">
    ${badge}
    ${hasToc ? TOC_TOGGLE_BUTTON : ""}
    ${graphToggleLink(graphHref)}
    ${THEME_TOGGLE_BUTTON}
  </div>
</header>
<main>
  <h1>${escapeHtml(note.title)}</h1>
  ${tocHtml}
  <article class="note-body">${bodyHtml}</article>
  ${relSections}
  ${backlinksHtml}
  ${graphHtml}
  ${frontmatterHtml}
</main>
<script src="${themeJsHref}"></script>
${hasToc ? `<script src="${tocSidebarJsHref}"></script>` : ""}
<script src="${printJsHref}"></script>
${mermaidScripts}
</body>
</html>
`;
}

export function renderIndexPage(args: {
  notes: NoteFile[];
  types: Map<string, TypeDef>;
  /** When a note has been picked as the home page, this points back to it. */
  homeHref?: string;
}): string {
  const { notes, types, homeHref } = args;

  const groups = new Map<string, NoteFile[]>();
  for (const note of notes) {
    const key = note.typeName ?? "Untyped";
    const list = groups.get(key) ?? [];
    list.push(note);
    groups.set(key, list);
  }

  const sortedGroupKeys = [...groups.keys()].sort((a, b) => {
    const oa = types.get(a)?.order ?? 9999;
    const ob = types.get(b)?.order ?? 9999;
    if (oa !== ob) return oa - ob;
    return a.localeCompare(b);
  });

  const nav = sortedGroupKeys
    .map((key) => {
      const typeDef = types.get(key);
      const label = typeDef?.sidebarLabel ?? key;
      const items = groups
        .get(key)!
        .sort((a, b) => a.title.localeCompare(b.title))
        .map((n) => `<li><a href="${notesHref(n.slug, "notes/")}">${escapeHtml(n.title)}</a></li>`)
        .join("");
      return `<section class="nav-group" data-type="${escapeHtml(key)}"><h2>${escapeHtml(label)}</h2><ul>${items}</ul></section>`;
    })
    .join("");

  const pills = [`<button type="button" class="pill is-active" data-type="">All</button>`]
    .concat(
      sortedGroupKeys.map((key) => {
        const typeDef = types.get(key);
        const label = typeDef?.sidebarLabel ?? key;
        const colorStyle = typeDef?.color ? ` style="--pill-color:${escapeHtml(typeDef.color)}"` : "";
        return `<button type="button" class="pill" data-type="${escapeHtml(key)}"${colorStyle}>${escapeHtml(label)}</button>`;
      })
    )
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>${THEME_INIT_INLINE_JS}</script>
<title>Vault</title>
<link rel="stylesheet" href="static/style.css">
<script src="static/search-index.js"></script>
</head>
<body>
<header class="page-header page-header--wide">
  ${homeHref ? `<a class="home-link" href="${homeHref}">Home</a>` : `<h1>Vault</h1>`}
  <div class="header-actions">
    <div class="search-box">
      <input id="search-input" type="search" placeholder="Search notes..." title="Try: type:Project keyword" autocomplete="off">
      <kbd class="search-kbd">/</kbd>
    </div>
    ${graphToggleLink("graph.html")}
    ${THEME_TOGGLE_BUTTON}
  </div>
</header>
<div class="layout">
  <details class="sidebar" open>
    <summary>Filter by type</summary>
    <div class="pills">${pills}</div>
  </details>
  <main>
    <ul id="search-results" class="search-results"></ul>
    <div class="nav">${nav}</div>
  </main>
</div>
<script src="static/sidebar.js"></script>
<script src="static/search.js"></script>
<script src="static/theme.js"></script>
<script src="static/print.js"></script>
</body>
</html>
`;
}

export function renderGraphPage(args: {
  svg: string;
  noteCount: number;
  /** Path overrides for rendering this note somewhere other than its default notes/ location. */
  backHref?: string;
  backLabel?: string;
  /** When a note has been picked as the home page, this links directly back to it. */
  homeHref?: string;
}): string {
  const { svg, noteCount, backHref = "index.html", backLabel = "All notes", homeHref } = args;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<script>${THEME_INIT_INLINE_JS}${JS_ENABLED_INLINE_JS}</script>
<title>Graph</title>
<link rel="stylesheet" href="static/style.css">
</head>
<body>
<header class="page-header page-header--wide">
  <nav class="header-nav">
    <a class="back-link" href="${backHref}">&larr; ${escapeHtml(backLabel)}</a>
    ${homeHref ? `<a class="home-link" href="${homeHref}">Home</a>` : ""}
  </nav>
  <div class="header-actions">
    ${THEME_TOGGLE_BUTTON}
  </div>
</header>
<main>
  <p class="graph-count">${noteCount} note${noteCount === 1 ? "" : "s"}</p>
  <div class="site-graph-wrap">
    <div class="graph-controls">
      <button type="button" id="graph-zoom-in" aria-label="Zoom in" title="Zoom in">+</button>
      <button type="button" id="graph-zoom-out" aria-label="Zoom out" title="Zoom out">&minus;</button>
    </div>
    <div class="site-graph">${svg}</div>
  </div>
</main>
<script src="static/theme.js"></script>
<script src="static/print.js"></script>
<script src="static/site-graph.js"></script>
</body>
</html>
`;
}
