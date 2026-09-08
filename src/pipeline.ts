import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeHighlight from "rehype-highlight";
import rehypeStringify from "rehype-stringify";
import { visit } from "unist-util-visit";
import type { Code, Root } from "mdast";
import type { Element, Root as HastRoot, Text } from "hast";
import { resolveWikilinks } from "./wikilinks.js";
import { rewriteLocalAssetUrls } from "./rewriteAssets.js";
import { transformCallouts } from "./callouts.js";
import { resolveHighlights } from "./highlights.js";
import type { VaultIndex, NoteFile } from "./types.js";

const parser = unified().use(remarkParse).use(remarkGfm);

export interface RenderPathOptions {
  /** Prefix to reach attachments/ from the rendered page's own location. */
  assetsPrefix?: string;
  /** Prefix to reach other note pages from the rendered page's own location. */
  notesPrefix?: string;
}

/**
 * Normalizes a ```Mermaid / ```MERMAID fence's language tag to lowercase so it's
 * treated identically to ```mermaid downstream (rehype-highlight's plainText check,
 * our own hasMermaid detection, and the client-side CSS selector are all exact-string
 * matches against "mermaid").
 */
function normalizeMermaidFences(tree: Root): void {
  visit(tree, "code", (node: Code) => {
    if (node.lang && node.lang.toLowerCase() === "mermaid") node.lang = "mermaid";
  });
}

/**
 * Parses a note's Markdown body into an mdast tree, applying every transform that
 * doesn't depend on where the page ends up living (callouts, highlights, mermaid fence
 * normalization). The result is plain-JSON-safe and has no wikilinks/asset URLs
 * resolved yet, so it's safe to `structuredClone` and resolve more than once with
 * different `RenderPathOptions` - see `resolveTreePaths` - without re-running parsing.
 */
export function parseNoteBody(note: NoteFile): Root {
  const tree = parser.parse(note.bodyMarkdown) as Root;
  normalizeMermaidFences(tree);
  transformCallouts(tree);
  resolveHighlights(tree);
  return tree;
}

/**
 * Resolves wikilinks and local asset URLs on an already-parsed tree (mutates and
 * returns it), the two transforms whose output depends on the rendered page's own
 * location via `pathOptions`.
 */
export function resolveTreePaths(
  tree: Root,
  note: NoteFile,
  index: VaultIndex,
  publishedOnly: boolean,
  pathOptions: RenderPathOptions = {}
): Root {
  rewriteLocalAssetUrls(tree, note.relPath, pathOptions.assetsPrefix);
  resolveWikilinks(tree, index, note.slug, publishedOnly, pathOptions.notesPrefix);
  return tree;
}

const stringifier = unified()
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypeHighlight, { plainText: ["mermaid"] })
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

/**
 * Assigns a unique slug id to each heading in place (returned in document order) and
 * reports whether the tree contains a ```mermaid fenced code block, in one combined
 * walk over the hast tree.
 */
function scanHast(hast: HastRoot): { headings: HeadingEntry[]; hasMermaid: boolean } {
  const headings: HeadingEntry[] = [];
  const seen = new Map<string, number>();
  let hasMermaid = false;
  visit(hast, "element", (node: Element) => {
    if (node.tagName === "code") {
      const className = node.properties?.className;
      if (Array.isArray(className) && className.includes("language-mermaid")) {
        hasMermaid = true;
      }
      return;
    }
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
  return { headings, hasMermaid };
}

/** Converts a resolved mdast tree to a final HTML string (mdast -> hast -> HTML). */
export function renderTreeToHtml(
  tree: Root
): { html: string; headings: HeadingEntry[]; hasMermaid: boolean } {
  const hast = stringifier.runSync(tree) as HastRoot;
  const { headings, hasMermaid } = scanHast(hast);
  return { html: stringifier.stringify(hast), headings, hasMermaid };
}
