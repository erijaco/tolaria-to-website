import { findAndReplace } from "mdast-util-find-and-replace";
import type { Root } from "mdast";

/**
 * Obsidian's ==highlight== syntax: opening/closing marks must hug non-whitespace,
 * non-`=` content, so `== padded ==` stays plain text and a run like `===triple===`
 * (ambiguous about which pair of `=` delimits it) is left alone rather than matching
 * a lopsided substring.
 */
const HIGHLIGHT_RE = /(?<!=)==(?!=)([^\s=](?:[^\n=]*[^\s=])?)(?<!=)==(?!=)/g;

/** Resolves ==highlighted text== spans into <mark class="highlight"> elements. */
export function resolveHighlights(tree: Root): Root {
  findAndReplace(tree, [
    [
      HIGHLIGHT_RE,
      (_match: string, content: string) =>
        ({
          type: "highlight",
          children: [{ type: "text", value: content }],
          data: { hName: "mark", hProperties: { className: ["highlight"] } },
        }) as any,
    ],
  ]);

  return tree;
}
