import type { NoteFile, TypeDef } from "./types.js";
import { notesHref } from "./outputName.js";
import { escapeHtml } from "./html.js";

const SATELLITE_R = 5;
const CENTER_R = 8;
const MAX_TITLE_LEN = 26;
/** Rough pixel budget for a truncated label, used only to size the viewBox (SVG can't measure text at build time). */
const HORIZONTAL_LABEL_ALLOWANCE = 190;
const VERTICAL_LABEL_ALLOWANCE = 60;

interface Neighbor {
  note: NoteFile;
  /** Specific relationship field names (e.g. "belongs_to"), plus "link" and/or "backlink". */
  labels: Set<string>;
}

function truncateTitle(title: string): string {
  return title.length > MAX_TITLE_LEN ? `${title.slice(0, MAX_TITLE_LEN - 1)}…` : title;
}

/** Merges relationships/backlinks/outbound-links into one deduped neighbor list, keyed by slug. */
function collectNeighbors(
  relationships: { field: string; target: NoteFile }[],
  backlinks: NoteFile[],
  outboundLinks: NoteFile[]
): Neighbor[] {
  const bySlug = new Map<string, Neighbor>();
  const touch = (note: NoteFile, label: string) => {
    const existing = bySlug.get(note.slug);
    if (existing) existing.labels.add(label);
    else bySlug.set(note.slug, { note, labels: new Set([label]) });
  };
  for (const r of relationships) touch(r.target, r.field);
  for (const b of backlinks) touch(b, "backlink");
  for (const l of outboundLinks) touch(l, "link");
  return [...bySlug.values()].sort((a, b) => a.note.title.localeCompare(b.note.title));
}

/** Renders a note's 1-hop "local graph": itself at the center, direct relationships,
 * backlinks, and outbound body links arranged evenly around it. Pure build-time SVG -
 * no client-side layout or dependencies. Returns "" when the note has no neighbors. */
export function renderLocalGraph(args: {
  note: NoteFile;
  relationships: { field: string; target: NoteFile }[];
  backlinks: NoteFile[];
  outboundLinks: NoteFile[];
  types: Map<string, TypeDef>;
  notesPrefix?: string;
}): string {
  const { note, relationships, backlinks, outboundLinks, types, notesPrefix = "" } = args;
  const neighbors = collectNeighbors(relationships, backlinks, outboundLinks);
  if (!neighbors.length) return "";

  const radius = Math.min(180, 80 + Math.max(0, neighbors.length - 4) * 8);
  const width = 2 * (radius + HORIZONTAL_LABEL_ALLOWANCE);
  const height = 2 * (radius + VERTICAL_LABEL_ALLOWANCE);
  const cx = width / 2;
  const cy = height / 2;

  const nodesSvg = neighbors
    .map((n, i) => {
      const angle = -Math.PI / 2 + (i * 2 * Math.PI) / neighbors.length;
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);

      let anchor: "start" | "end" | "middle";
      let tx = x;
      let ty = y;
      if (x > cx + 4) {
        anchor = "start";
        tx = x + SATELLITE_R + 6;
      } else if (x < cx - 4) {
        anchor = "end";
        tx = x - SATELLITE_R - 6;
      } else {
        anchor = "middle";
        ty = y < cy ? y - SATELLITE_R - 8 : y + SATELLITE_R + 14;
      }

      const dashed = n.labels.size === 1 && n.labels.has("backlink");
      const typeDef = n.note.typeName ? types.get(n.note.typeName) : undefined;
      const colorStyle = typeDef?.color ? ` style="--type-color:${escapeHtml(typeDef.color)}"` : "";
      const tooltip = `${n.note.title} (${[...n.labels].join(", ")})`;

      return `<a class="graph-node-link" href="${notesHref(n.note.slug, notesPrefix)}">
        <title>${escapeHtml(tooltip)}</title>
        <line class="graph-edge${dashed ? " graph-edge--backlink-only" : ""}" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}"/>
        <circle class="graph-node" cx="${x}" cy="${y}" r="${SATELLITE_R}"${colorStyle}/>
        <text class="graph-label" x="${tx}" y="${ty}" text-anchor="${anchor}" dominant-baseline="middle">${escapeHtml(truncateTitle(n.note.title))}</text>
      </a>`;
    })
    .join("");

  return `<section class="local-graph">
    <h3>Graph</h3>
    <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Local graph of notes linked to ${escapeHtml(note.title)}">
      <circle class="graph-node graph-node--center" cx="${cx}" cy="${cy}" r="${CENTER_R}"/>
      <text class="graph-label graph-label--center" x="${cx}" y="${cy + CENTER_R + 14}" text-anchor="middle">${escapeHtml(truncateTitle(note.title))}</text>
      ${nodesSvg}
    </svg>
  </section>`;
}
