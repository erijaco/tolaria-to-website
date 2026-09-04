import path from "node:path";
import { visit } from "unist-util-visit";
import type { Root } from "mdast";

function isExternalOrAnchor(url: string): boolean {
  return /^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("#");
}

function isMarkdownLink(url: string): boolean {
  return /\.md($|#)/i.test(url);
}

/**
 * Rewrites relative image/file URLs (resolved against the note's own folder in the
 * vault) to point at the flattened attachments/ directory in the output site.
 * `assetsPrefix` accounts for the output page's own depth (default: one level down,
 * inside notes/; pass "attachments/" when rendering a note at the site root instead).
 */
export function rewriteLocalAssetUrls(
  tree: Root,
  noteRelPath: string,
  assetsPrefix = "../attachments/"
): void {
  const noteDir = path.posix.dirname(noteRelPath);

  visit(tree, ["image", "link"], (node: any) => {
    const url: string | undefined = node.url;
    if (!url || isExternalOrAnchor(url)) return;
    if (node.type === "link" && isMarkdownLink(url)) return; // leave note-to-note links to wikilinks

    const vaultRelPath = path.posix.normalize(path.posix.join(noteDir, decodeURI(url)));
    node.url = `${assetsPrefix}${encodeURI(vaultRelPath)}`;
  });
}
