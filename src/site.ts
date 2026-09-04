import path from "node:path";
import fs from "node:fs";
import fse from "fs-extra";
import { scanVault } from "./scan.js";
import { parseNote } from "./parseNote.js";
import { buildVaultIndex } from "./buildIndex.js";
import { loadIgnoreMatcher, isNotePublishable } from "./filter.js";
import { parseAndResolve, renderTreeToHtml } from "./pipeline.js";
import { renderNotePage, renderIndexPage } from "./templates.js";
import { STYLE_CSS, SEARCH_JS } from "./staticAssets.js";
import { outputName, notesHref } from "./outputName.js";
import type { Root } from "mdast";

export interface BuildOptions {
  vaultDir: string;
  outDir: string;
  ignoreFile?: string;
}

interface SearchEntry {
  title: string;
  href: string;
  excerpt: string;
  typeName?: string;
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

  const searchEntries: SearchEntry[] = [];

  for (const note of notes) {
    if (!index.published.has(note.slug)) continue;
    const tree = trees.get(note.slug)!;
    const bodyHtml = renderTreeToHtml(tree);

    const relationships = (index.relationships.get(note.slug) ?? []).filter((e) =>
      index.published.has(e.targetSlug)
    );
    const backlinkSlugs = [...(index.backlinks.get(note.slug) ?? [])].filter((s) =>
      index.published.has(s)
    );

    const typeDef = note.typeName ? index.types.get(note.typeName) : undefined;

    const html = renderNotePage({
      note,
      bodyHtml,
      typeDef,
      relationships: relationships.map((e) => ({
        field: e.field,
        target: index.notes.get(e.targetSlug)!,
      })),
      backlinks: backlinkSlugs.map((s) => index.notes.get(s)!),
      linkIndex: index,
    });

    await fs.promises.writeFile(
      path.join(outDir, "notes", `${outputName(note.slug)}.html`),
      html,
      "utf8"
    );

    searchEntries.push({
      title: note.title,
      href: `notes/${notesHref(note.slug)}`,
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
  const indexHtml = renderIndexPage({ notes: publishedNotes, types: index.types });
  await fs.promises.writeFile(path.join(outDir, "index.html"), indexHtml, "utf8");

  const searchJsData = `window.__TOLARIA_SEARCH__ = ${JSON.stringify(searchEntries)};\n`;
  await fs.promises.writeFile(path.join(outDir, "static", "search-index.js"), searchJsData, "utf8");

  console.log(`Site written to ${outDir}`);
}
