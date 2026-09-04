import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import type { Root } from "mdast";
import type { Root as HastRoot } from "hast";
import { resolveWikilinks } from "./wikilinks.js";
import { rewriteLocalAssetUrls } from "./rewriteAssets.js";
import { transformCallouts } from "./callouts.js";
import type { VaultIndex, NoteFile } from "./types.js";

const parser = unified().use(remarkParse).use(remarkGfm);

export interface RenderPathOptions {
  /** Prefix to reach attachments/ from the rendered page's own location. */
  assetsPrefix?: string;
  /** Prefix to reach other note pages from the rendered page's own location. */
  notesPrefix?: string;
}

/** Parses a note's Markdown body and resolves wikilinks/asset URLs at the AST level. */
export function parseAndResolve(
  note: NoteFile,
  index: VaultIndex,
  publishedOnly: boolean,
  pathOptions: RenderPathOptions = {}
): Root {
  const tree = parser.parse(note.bodyMarkdown) as Root;
  transformCallouts(tree);
  rewriteLocalAssetUrls(tree, note.relPath, pathOptions.assetsPrefix);
  resolveWikilinks(tree, index, note.slug, publishedOnly, pathOptions.notesPrefix);
  return tree;
}

const stringifier = unified()
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeHighlight)
  .use(rehypeStringify);

/** Converts a resolved mdast tree to a final HTML string (mdast -> hast -> HTML). */
export function renderTreeToHtml(tree: Root): string {
  const hast = stringifier.runSync(tree) as HastRoot;
  return stringifier.stringify(hast);
}
