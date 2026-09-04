import type { NoteFile, TypeDef, VaultIndex } from "./types.js";
import { notesHref } from "./outputName.js";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Same redaction rule as body wikilinks: a resolved-but-unpublished target never has
 * its real title surfaced in a public property table, even inside raw frontmatter text.
 */
function redactWikilinks(s: string, linkIndex: Pick<VaultIndex, "byKey" | "published">): string {
  return s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, t: string, a?: string) => {
    const alias = a?.trim();
    const targetSlug = linkIndex.byKey.get(t.trim().toLowerCase());
    if (targetSlug && !linkIndex.published.has(targetSlug)) return alias ?? "(private)";
    return alias ?? t.trim();
  });
}

function stringifyValue(v: unknown, linkIndex: Pick<VaultIndex, "byKey" | "published">): string {
  if (Array.isArray(v)) return v.map((x) => redactWikilinks(String(x), linkIndex)).join(", ");
  if (v === null || v === undefined) return "";
  if (typeof v === "object") return JSON.stringify(v);
  return redactWikilinks(String(v), linkIndex);
}

export function renderNotePage(args: {
  note: NoteFile;
  bodyHtml: string;
  typeDef?: TypeDef;
  relationships: { field: string; target: NoteFile }[];
  backlinks: NoteFile[];
  linkIndex: Pick<VaultIndex, "byKey" | "published">;
}): string {
  const { note, bodyHtml, typeDef, relationships, backlinks, linkIndex } = args;

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
      <section class="relation-group">
        <h3>${escapeHtml(field)}</h3>
        <ul>${targets
          .map((t) => `<li><a href="${notesHref(t.slug)}">${escapeHtml(t.title)}</a></li>`)
          .join("")}</ul>
      </section>`
    )
    .join("");

  const backlinksHtml = backlinks.length
    ? `<section class="backlinks"><h3>Linked from</h3><ul>${backlinks
        .map((b) => `<li><a href="${notesHref(b.slug)}">${escapeHtml(b.title)}</a></li>`)
        .join("")}</ul></section>`
    : "";

  const badge = typeDef
    ? `<span class="type-badge"${
        typeDef.color ? ` style="--type-color:${escapeHtml(typeDef.color)}"` : ""
      }>${escapeHtml(typeDef.sidebarLabel ?? typeDef.name)}</span>`
    : "";

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(note.title)}</title>
<link rel="stylesheet" href="../static/style.css">
</head>
<body>
<header class="page-header">
  <a class="back-link" href="../index.html">&larr; All notes</a>
  ${badge}
</header>
<main>
  <h1>${escapeHtml(note.title)}</h1>
  ${propRows ? `<table class="properties"><tbody>${propRows}</tbody></table>` : ""}
  <article class="note-body">${bodyHtml}</article>
  ${relSections}
  ${backlinksHtml}
</main>
</body>
</html>
`;
}

export function renderIndexPage(args: {
  notes: NoteFile[];
  types: Map<string, TypeDef>;
}): string {
  const { notes, types } = args;

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
        .map((n) => `<li><a href="notes/${notesHref(n.slug)}">${escapeHtml(n.title)}</a></li>`)
        .join("");
      return `<section class="nav-group"><h2>${escapeHtml(label)}</h2><ul>${items}</ul></section>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vault</title>
<link rel="stylesheet" href="static/style.css">
<script src="static/search-index.js"></script>
</head>
<body>
<header class="page-header">
  <h1>Vault</h1>
  <input id="search-input" type="search" placeholder="Search notes...">
</header>
<main>
  <ul id="search-results" class="search-results"></ul>
  <div class="nav">${nav}</div>
</main>
<script src="static/search.js"></script>
</body>
</html>
`;
}
