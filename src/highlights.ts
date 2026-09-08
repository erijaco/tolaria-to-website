import type { Root } from "mdast";

/**
 * Obsidian's ==highlight== syntax: opening/closing marks must hug non-whitespace
 * content, so `== padded ==` stays plain text, and a run like `===triple===`
 * (ambiguous about which pair of `=` delimits it) is left alone rather than matching a
 * lopsided substring. `=` is otherwise allowed inside the content (e.g. `==C=64==`).
 *
 * This works at the level of a single mdast node's `children` array (a paragraph,
 * heading, emphasis, etc.) rather than on isolated text nodes, because the open and
 * close markers often land in *different* text nodes with another inline node (bold,
 * a link, ...) in between - e.g. `==**bold**==` parses as three siblings: a text node
 * holding "==", a strong node, then another text node holding "==". A plain regex over
 * one text node at a time (the previous approach here, via mdast-util-find-and-replace)
 * can never see across that gap, so it silently left both marker pairs as literal text
 * whenever a highlight wrapped any other formatting.
 */

interface MarkerOccurrence {
  childIndex: number;
  start: number;
  end: number;
  canOpen: boolean;
  canClose: boolean;
}

interface Span {
  open: MarkerOccurrence;
  close: MarkerOccurrence;
}

const NON_BOUNDARY_RE = /\s/;

/**
 * Finds every "==" run across a children array's text nodes and marks whether each
 * could plausibly open and/or close a highlight, based on the character immediately
 * next to it. A marker sitting at the very edge of its own text node (nothing left to
 * check there) is treated permissively - true - since that means it's directly
 * adjacent to a sibling node (or the start/end of the whole array), which is not
 * whitespace either way.
 */
function findMarkers(children: any[]): MarkerOccurrence[] {
  const markers: MarkerOccurrence[] = [];
  children.forEach((child, childIndex) => {
    if (child.type !== "text") return;
    const value: string = child.value;
    const re = /==/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(value))) {
      const start = m.index;
      const end = start + 2;
      const before = value[start - 1];
      const after = value[end];
      const canOpen = after === undefined ? true : !NON_BOUNDARY_RE.test(after) && after !== "=";
      const canClose = before === undefined ? true : !NON_BOUNDARY_RE.test(before) && before !== "=";
      markers.push({ childIndex, start, end, canOpen, canClose });
    }
  });
  return markers;
}

/**
 * Pairs markers left to right: the first open-capable marker pairs with the nearest
 * following close-capable one, matching the original single-text-node behavior where
 * `==a==` closes at the nearest `==` rather than the last one on the line.
 */
function pairMarkers(markers: MarkerOccurrence[]): Span[] {
  const spans: Span[] = [];
  let pendingOpen: MarkerOccurrence | null = null;
  for (const m of markers) {
    if (!pendingOpen) {
      if (m.canOpen) pendingOpen = m;
      continue;
    }
    if (m.canClose) {
      spans.push({ open: pendingOpen, close: m });
      pendingOpen = null;
    }
  }
  return spans;
}

/** Rebuilds a children array with each matched span replaced by a `mark` node. */
function rebuildChildren(children: any[], spans: Span[]): any[] {
  if (!spans.length) return children;

  const result: any[] = [];
  let ci = 0;
  let offset = 0;

  const pushChild = (index: number, fromOffset: number) => {
    const child = children[index];
    if (fromOffset > 0) {
      const rest = child.value.slice(fromOffset);
      if (rest) result.push({ type: "text", value: rest });
    } else {
      result.push(child);
    }
  };

  for (const span of spans) {
    while (ci < span.open.childIndex) {
      pushChild(ci, offset);
      ci++;
      offset = 0;
    }
    const openChild = children[ci];
    const beforeText = openChild.value.slice(offset, span.open.start);
    if (beforeText) result.push({ type: "text", value: beforeText });

    const inner: any[] = [];
    if (span.close.childIndex === span.open.childIndex) {
      const innerText = openChild.value.slice(span.open.end, span.close.start);
      if (innerText) inner.push({ type: "text", value: innerText });
    } else {
      const afterOpenText = openChild.value.slice(span.open.end);
      if (afterOpenText) inner.push({ type: "text", value: afterOpenText });
      for (let k = span.open.childIndex + 1; k < span.close.childIndex; k++) inner.push(children[k]);
      const closeChild = children[span.close.childIndex];
      const beforeCloseText = closeChild.value.slice(0, span.close.start);
      if (beforeCloseText) inner.push({ type: "text", value: beforeCloseText });
    }
    result.push({
      type: "highlight",
      children: inner,
      data: { hName: "mark", hProperties: { className: ["highlight"] } },
    });

    ci = span.close.childIndex;
    offset = span.close.end;
  }

  if (ci < children.length) {
    pushChild(ci, offset);
    ci++;
    while (ci < children.length) {
      pushChild(ci, 0);
      ci++;
    }
  }

  return result;
}

/** Resolves ==highlighted text== spans (in this node's own children) into `mark` nodes. */
function spliceHighlights(children: any[]): any[] {
  const spans = pairMarkers(findMarkers(children));
  return rebuildChildren(children, spans);
}

/**
 * Walks every node in the tree that has a `children` array, resolving ==highlight==
 * spans at each level independently. A node without text-bearing children (a
 * blockquote whose children are paragraphs, say) is a safe no-op here - the actual
 * work happens once recursion reaches the paragraph/heading/emphasis/etc. node that
 * directly holds the relevant text.
 */
function processNode(node: any): void {
  if (Array.isArray(node.children)) {
    node.children = spliceHighlights(node.children);
    for (const child of node.children) processNode(child);
  }
}

export function resolveHighlights(tree: Root): Root {
  processNode(tree);
  return tree;
}
