import { visit } from "unist-util-visit";
import type { Root } from "mdast";

const CALLOUT_RE = /^\[!([a-zA-Z]+)\]([+-]?)[ \t]*/;

/** Obsidian's callout type aliases, grouped by the canonical family that drives styling. */
const CALLOUT_ALIASES: Record<string, string> = {
  note: "note",
  abstract: "abstract",
  summary: "abstract",
  tldr: "abstract",
  info: "info",
  todo: "todo",
  tip: "tip",
  hint: "tip",
  important: "tip",
  success: "success",
  check: "success",
  done: "success",
  question: "question",
  help: "question",
  faq: "question",
  warning: "warning",
  caution: "warning",
  attention: "warning",
  failure: "failure",
  fail: "failure",
  missing: "failure",
  danger: "danger",
  error: "danger",
  bug: "bug",
  example: "example",
  quote: "quote",
  cite: "quote",
};

/**
 * Splits a callout's first-line content off the rest: everything up to (and not
 * including) the first line break becomes the title, the remainder becomes the body's
 * lead-in. A hard break (two-space/backslash newline) also ends the title line.
 */
function splitFirstLine(children: any[]): { titleChildren: any[]; restChildren: any[] } {
  const titleChildren: any[] = [];
  const restChildren: any[] = [];
  let splitDone = false;

  for (const child of children) {
    if (splitDone) {
      restChildren.push(child);
      continue;
    }
    if (child.type === "text" && child.value.includes("\n")) {
      const idx = child.value.indexOf("\n");
      const before = child.value.slice(0, idx);
      const after = child.value.slice(idx + 1);
      if (before) titleChildren.push({ type: "text", value: before });
      if (after) restChildren.push({ type: "text", value: after });
      splitDone = true;
      continue;
    }
    if (child.type === "break") {
      splitDone = true;
      continue;
    }
    titleChildren.push(child);
  }

  return { titleChildren, restChildren };
}

/**
 * Rewrites Obsidian-style callout blockquotes (`> [!note] Title` / `> [!tip]+` /
 * `> [!tip]-`) into a titled box: a plain <div> normally, or a native <details>/
 * <summary> when the `+`/`-` fold marker is present (open/collapsed by default). A
 * blockquote that isn't a callout (no `[!type]` marker on its first line) is untouched.
 */
export function transformCallouts(tree: Root): Root {
  visit(tree, "blockquote", (node: any) => {
    const first = node.children[0];
    if (!first || first.type !== "paragraph") return;
    const firstText = first.children[0];
    if (!firstText || firstText.type !== "text") return;

    const match = CALLOUT_RE.exec(firstText.value);
    if (!match) return;

    const rawType = match[1].toLowerCase();
    const canonicalType = CALLOUT_ALIASES[rawType] ?? rawType;
    const fold = match[2];
    const isFoldable = fold === "+" || fold === "-";

    const strippedValue = firstText.value.slice(match[0].length);
    const restOfFirstLineChildren = [
      ...(strippedValue ? [{ type: "text", value: strippedValue }] : []),
      ...first.children.slice(1),
    ];
    const { titleChildren, restChildren } = splitFirstLine(restOfFirstLineChildren);

    const finalTitleChildren = titleChildren.length
      ? titleChildren
      : [{ type: "text", value: rawType.charAt(0).toUpperCase() + rawType.slice(1) }];

    const bodyChildren = [
      ...(restChildren.length ? [{ type: "paragraph", children: restChildren }] : []),
      ...node.children.slice(1),
    ];

    const titleNode = {
      type: "paragraph",
      children: finalTitleChildren,
      data: {
        hName: isFoldable ? "summary" : "div",
        hProperties: { className: ["callout-title"] },
      },
    };
    const contentNode = {
      type: "paragraph",
      children: bodyChildren,
      data: { hName: "div", hProperties: { className: ["callout-content"] } },
    };

    node.children = [titleNode, ...(bodyChildren.length ? [contentNode] : [])];
    node.data = {
      hName: isFoldable ? "details" : "div",
      hProperties: {
        className: ["callout", `callout-${canonicalType}`],
        "data-callout": rawType,
        ...(isFoldable && fold === "+" ? { open: true } : {}),
      },
    };
  });

  return tree;
}
