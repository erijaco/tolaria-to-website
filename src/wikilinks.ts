import { findAndReplace } from "mdast-util-find-and-replace";
import type { Root } from "mdast";
import type { VaultIndex } from "./types.js";
import { notesHref } from "./outputName.js";

const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/g;

/**
 * Resolves [[wikilinks]] in a note body to hrefs and records backlinks as it goes.
 * A link to an unresolved target just degrades to plain text (a dead reference, no
 * privacy concern). A link to a target that exists but isn't published is redacted to
 * a generic marker instead — an explicit alias (`[[Note|alias]]`) is the author's own
 * words and is kept, but the real title is never surfaced, so a public page can't leak
 * that a specific private note exists.
 *
 * Without an alias, the link's visible text is the target note's actual title rather
 * than the raw `[[link text]]` the author typed (usually the filename) — those can
 * drift apart (renames, casing), and the title is what the destination page itself
 * displays as its heading.
 */
export function resolveWikilinks(
  tree: Root,
  index: VaultIndex,
  currentSlug: string,
  publishedOnly: boolean,
  notesPrefix = ""
): Root {
  findAndReplace(tree, [
    [
      WIKILINK_RE,
      (_match: string, targetRaw: string, aliasRaw?: string) => {
        const target = targetRaw.trim();
        const alias = aliasRaw?.trim();
        const targetSlug = index.byKey.get(target.toLowerCase());

        if (!targetSlug) {
          return { type: "text", value: alias ?? target };
        }

        const targetPublished = index.published.has(targetSlug);
        if (publishedOnly && !targetPublished) {
          return { type: "text", value: alias ?? "(private)" };
        }

        index.backlinks.get(targetSlug)?.add(currentSlug);
        index.bodyLinks.get(currentSlug)?.add(targetSlug);

        const targetTitle = index.notes.get(targetSlug)?.title ?? target;
        return {
          type: "link",
          url: notesHref(targetSlug, notesPrefix),
          children: [{ type: "text", value: alias ?? targetTitle }],
        };
      },
    ],
  ]);

  return tree;
}
