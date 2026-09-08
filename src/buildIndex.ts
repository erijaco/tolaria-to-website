import type { NoteFile, VaultIndex, RelationshipEdge } from "./types.js";

const WIKILINK_RE = /\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g;

/** Default relationship fields have automatically computed inverses. */
const DEFAULT_INVERSES: Record<string, string> = {
  belongs_to: "has",
  has: "belongs_to",
  related_to: "related_to",
};

function extractWikilinkTargets(value: unknown): string[] {
  const targets: string[] = [];
  const scan = (v: unknown) => {
    if (typeof v === "string") {
      let m: RegExpExecArray | null;
      WIKILINK_RE.lastIndex = 0;
      while ((m = WIKILINK_RE.exec(v))) targets.push(m[1].trim());
    } else if (Array.isArray(v)) {
      v.forEach(scan);
    }
  };
  scan(value);
  return targets;
}

/** Builds the vault-wide index: link resolution keys, type registry, and the relationship graph. */
export function buildVaultIndex(notes: NoteFile[]): VaultIndex {
  const index: VaultIndex = {
    notes: new Map(),
    byKey: new Map(),
    types: new Map(),
    relationships: new Map(),
    backlinks: new Map(),
    bodyLinks: new Map(),
    published: new Set(),
  };

  for (const note of notes) {
    index.notes.set(note.slug, note);
    index.backlinks.set(note.slug, new Set());
    index.bodyLinks.set(note.slug, new Set());
  }

  // Populated in a deterministic (slug-sorted) order rather than however scanVault's
  // filesystem walk happened to return notes, so which note wins a filename/title
  // collision doesn't depend on OS-specific readdir ordering.
  const byKeyOrder = [...notes].sort((a, b) => a.slug.localeCompare(b.slug));
  for (const note of byKeyOrder) {
    for (const key of [note.filenameKey, note.titleKey]) {
      const existingSlug = index.byKey.get(key);
      if (!existingSlug) {
        index.byKey.set(key, note.slug);
      } else if (existingSlug !== note.slug) {
        console.warn(
          `Ambiguous wikilink target "${key}": both "${existingSlug}" and "${note.slug}" ` +
            `match it; [[wikilinks]] to it resolve to "${existingSlug}" (first alphabetically by path).`
        );
      }
    }
  }

  for (const note of notes) {
    if (!note.isTypeDoc) continue;
    const fm = note.frontmatter;
    index.types.set(note.title, {
      name: note.title,
      icon: typeof fm._icon === "string" ? fm._icon : undefined,
      color: typeof fm._color === "string" ? fm._color : undefined,
      sidebarLabel: typeof fm._sidebar_label === "string" ? fm._sidebar_label : undefined,
      order: typeof fm._order === "number" ? fm._order : 0,
    });
  }

  for (const note of notes) {
    const edges: RelationshipEdge[] = [];
    for (const [field, value] of Object.entries(note.frontmatter)) {
      if (field.startsWith("_")) continue;
      const targets = extractWikilinkTargets(value);
      for (const target of targets) {
        const targetSlug = index.byKey.get(target.toLowerCase());
        if (!targetSlug) continue;
        edges.push({ field, targetSlug });

        const inverseField = DEFAULT_INVERSES[field];
        if (inverseField) {
          const inverseEdges = index.relationships.get(targetSlug) ?? [];
          inverseEdges.push({ field: inverseField, targetSlug: note.slug });
          index.relationships.set(targetSlug, inverseEdges);
        }
      }
    }
    const existing = index.relationships.get(note.slug) ?? [];
    index.relationships.set(note.slug, [...existing, ...edges]);
  }

  // A note's own explicit edge and another note's automatically-computed inverse edge
  // can land on the same (field, targetSlug) pair - e.g. two notes both declaring
  // `related_to` on each other - so dedupe once everything above has been collected.
  for (const [slug, edges] of index.relationships) {
    const seen = new Set<string>();
    const deduped = edges.filter((edge) => {
      const key = `${edge.field} ${edge.targetSlug}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    index.relationships.set(slug, deduped);
  }

  return index;
}
