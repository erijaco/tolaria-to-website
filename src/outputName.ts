/**
 * All note pages are written flat into a single "notes/" directory, so that any link
 * between two notes is always same-directory (no relative-path depth math) and the
 * site works when opened straight from disk via file:// with no server involved.
 */
export function outputName(slug: string): string {
  return slug.split("/").join("__");
}

/**
 * Percent-encoded href for a note page, consistent with what rehype-stringify emits for
 * body links. `prefix` lets the same note be linked to from a different directory depth
 * (e.g. "notes/" when linking from a root-level page instead of another notes/ page).
 */
export function notesHref(slug: string, prefix = ""): string {
  return encodeURI(`${prefix}${outputName(slug)}.html`);
}
