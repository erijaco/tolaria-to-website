import path from "node:path";
import fs from "node:fs";
import fse from "fs-extra";
import { scanVault } from "./scan.js";
import { parseNote } from "./parseNote.js";
import { buildVaultIndex } from "./buildIndex.js";
import { loadIgnoreMatcher, isNotePublishable } from "./filter.js";
import { parseAndResolve, renderTreeToHtml } from "./pipeline.js";
import { renderNotePage, renderIndexPage } from "./templates.js";
import { STYLE_CSS, SEARCH_JS, SIDEBAR_JS, THEME_JS } from "./staticAssets.js";
import { outputName, notesHref } from "./outputName.js";
import type { Root } from "mdast";
import type { NoteFile, VaultIndex } from "./types.js";

export interface BuildOptions {
  vaultDir: string;
  outDir: string;
  ignoreFile?: string;
  /** Slug, filename, or title of the note to render as the site's index.html, if any. */
  homeNote?: string;
}

interface SearchEntry {
  title: string;
  href: string;
  excerpt: string;
  typeName?: string;
}

/** Resolves a user-supplied note reference (slug, filename, or title) to a published slug. */
function resolveHomeSlug(homeNote: string, notes: NoteFile[], index: VaultIndex): string {
  const key = homeNote.replace(/\.md$/i, "");
  const bySlug = notes.find((n) => n.slug === key)?.slug;
  const slug = bySlug ?? index.byKey.get(key.toLowerCase());
  if (!slug || !index.published.has(slug)) {
    throw new Error(`Home note "${homeNote}" was not found among the published notes.`);
  }
  return slug;
}

function collectNotePageData(note: NoteFile, index: VaultIndex) {
  const relationships = (index.relationships.get(note.slug) ?? []).filter((e) =>
    index.published.has(e.targetSlug)
  );
  const backlinkSlugs = [...(index.backlinks.get(note.slug) ?? [])].filter((s) =>
    index.published.has(s)
  );
  return {
    typeDef: note.typeName ? index.types.get(note.typeName) : undefined,
    relationships: relationships.map((e) => ({
      field: e.field,
      target: index.notes.get(e.targetSlug)!,
    })),
    backlinks: backlinkSlugs.map((s) => index.notes.get(s)!),
  };
}

export async function buildSite(opts: BuildOptions): Promise<void> {
  const vaultDir = path.resolve(opts.vaultDir);
  const outDir = path.resolve(opts.outDir);
  const ignoreFilePath = opts.ignoreFile
    ? path.resolve(opts.ignoreFile)
    : path.join(vaultDir, ".tolariapublishignore");

  if (!fs.existsSync(vaultDir)) {
    throw new Error(`Vault directory not found: ${vaultDir}`);
  }

  const { noteAbsPaths, attachmentAbsPaths } = scanVault(vaultDir);
  const notes = noteAbsPaths.map((p) => parseNote(vaultDir, p));
  const index = buildVaultIndex(notes);

  const { isIgnored } = loadIgnoreMatcher(ignoreFilePath);
  for (const note of notes) {
    if (isNotePublishable(note, isIgnored)) index.published.add(note.slug);
  }

  console.log(
    `Vault scan: ${notes.length} note(s) found, ${index.published.size} will be published ` +
      `(${notes.length - index.published.size} excluded).`
  );

  const homeSlug = opts.homeNote ? resolveHomeSlug(opts.homeNote, notes, index) : undefined;
  // When a note is picked as the home page, index.html is that note's content and the
  // generated nav/search page moves to notes.html; otherwise index.html is the nav page.
  const navFilename = homeSlug ? "notes.html" : "index.html";

  // Resolve wikilinks + record backlinks before stringifying, so backlink
  // sections can be rendered on the very first pass over each note.
  const trees = new Map<string, Root>();
  for (const note of notes) {
    if (!index.published.has(note.slug)) continue;
    trees.set(note.slug, parseAndResolve(note, index, true));
  }

  await fse.emptyDir(outDir);
  await fse.ensureDir(path.join(outDir, "notes"));
  await fse.ensureDir(path.join(outDir, "static"));
  await fse.ensureDir(path.join(outDir, "attachments"));

  await fs.promises.writeFile(path.join(outDir, "static", "style.css"), STYLE_CSS, "utf8");
  await fs.promises.writeFile(path.join(outDir, "static", "search.js"), SEARCH_JS, "utf8");
  await fs.promises.writeFile(path.join(outDir, "static", "sidebar.js"), SIDEBAR_JS, "utf8");
  await fs.promises.writeFile(path.join(outDir, "static", "theme.js"), THEME_JS, "utf8");

  const searchEntries: SearchEntry[] = [];

  for (const note of notes) {
    if (!index.published.has(note.slug)) continue;
    const tree = trees.get(note.slug)!;
    const { html: bodyHtml, headings } = renderTreeToHtml(tree);
    const { typeDef, relationships, backlinks } = collectNotePageData(note, index);

    const html = renderNotePage({
      note,
      bodyHtml,
      headings,
      typeDef,
      relationships,
      backlinks,
      linkIndex: index,
      backHref: `../${navFilename}`,
      homeHref: homeSlug ? "../index.html" : undefined,
    });

    await fs.promises.writeFile(
      path.join(outDir, "notes", `${outputName(note.slug)}.html`),
      html,
      "utf8"
    );

    searchEntries.push({
      title: note.title,
      href: notesHref(note.slug, "notes/"),
      // Built from the already-rendered/redacted bodyHtml, not raw Markdown, so an
      // unresolved or private wikilink target never surfaces in the public search index.
      excerpt: bodyHtml
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 200),
      typeName: note.typeName,
    });
  }

  for (const abs of attachmentAbsPaths) {
    const relPath = path.relative(vaultDir, abs).split(path.sep).join("/");
    if (isIgnored(relPath)) continue;
    const dest = path.join(outDir, "attachments", relPath);
    await fse.ensureDir(path.dirname(dest));
    await fse.copyFile(abs, dest);
  }

  const publishedNotes = notes.filter((n) => index.published.has(n.slug) && !n.isTypeDoc);
  const navHtml = renderIndexPage({
    notes: publishedNotes,
    types: index.types,
    homeHref: homeSlug ? "index.html" : undefined,
  });
  await fs.promises.writeFile(path.join(outDir, navFilename), navHtml, "utf8");

  if (homeSlug) {
    const homeNote = index.notes.get(homeSlug)!;
    const homeTree = parseAndResolve(homeNote, index, true, {
      assetsPrefix: "attachments/",
      notesPrefix: "notes/",
    });
    const { typeDef, relationships, backlinks } = collectNotePageData(homeNote, index);
    const { html: homeBodyHtml, headings: homeHeadings } = renderTreeToHtml(homeTree);
    const homeHtml = renderNotePage({
      note: homeNote,
      bodyHtml: homeBodyHtml,
      headings: homeHeadings,
      typeDef,
      relationships,
      backlinks,
      linkIndex: index,
      cssHref: "static/style.css",
      backHref: navFilename,
      backLabel: "All notes",
      notesPrefix: "notes/",
    });
    await fs.promises.writeFile(path.join(outDir, "index.html"), homeHtml, "utf8");
  }

  const searchJsData = `window.__TOLARIA_SEARCH__ = ${JSON.stringify(searchEntries)};\n`;
  await fs.promises.writeFile(path.join(outDir, "static", "search-index.js"), searchJsData, "utf8");

  console.log(`Site written to ${outDir}`);
}
