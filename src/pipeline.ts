import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";
import type { Element, Root as HastRoot, Text } from "hast";
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

export interface HeadingEntry {
  id: string;
  text: string;
  depth: number;
}

function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "section"
  );
}

function headingText(node: Element): string {
  let text = "";
  visit(node, "text", (t: Text) => {
    text += t.value;
  });
  return text;
}

/** Assigns a unique slug id to each heading in place and returns them in document order. */
function addHeadingIds(hast: HastRoot): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  const seen = new Map<string, number>();
  visit(hast, "element", (node: Element) => {
    const match = /^h([1-6])$/.exec(node.tagName);
    if (!match) return;
    const text = headingText(node).trim();
    if (!text) return;
    const base = slugifyHeading(text);
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    const id = count > 0 ? `${base}-${count}` : base;
    node.properties = { ...node.properties, id };
    headings.push({ id, text, depth: Number(match[1]) });
  });
  return headings;
}

/** Converts a resolved mdast tree to a final HTML string (mdast -> hast -> HTML). */
export function renderTreeToHtml(tree: Root): { html: string; headings: HeadingEntry[] } {
  const hast = stringifier.runSync(tree) as HastRoot;
  const headings = addHeadingIds(hast);
  return { html: stringifier.stringify(hast), headings };
}
