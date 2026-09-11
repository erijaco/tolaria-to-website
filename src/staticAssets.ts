import { iconMaskUrl } from "./icons.js";

/**
 * Inlined into every page's <head> (not loaded as an external file) so an explicit
 * theme choice is applied before first paint, avoiding a flash of the wrong theme.
 *
 * A `?theme=` query param carried over from the link just clicked takes priority over
 * localStorage: opened via file://, each note page is a distinct origin in Firefox (and
 * some other browsers), so localStorage set on one page isn't visible from another -
 * the query param is what actually carries the choice across page loads (see THEME_JS).
 */
export const THEME_INIT_INLINE_JS =
  `(function(){try{` +
  `var m=/[?&]theme=(light|dark)\\b/.exec(location.search);` +
  `var t=m?m[1]:localStorage.getItem("tolaria-theme");` +
  `if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t);` +
  `}catch(e){}})();`;

export const STYLE_CSS = `
:root {
  color-scheme: light dark;
  --bg: #ffffff;
  --fg: #1a1a1a;
  --muted: #666;
  --border: #e2e2e2;
  --accent: #4f8ef7;
  --code-bg: #f5f5f5;
  --highlight-bg: #fbe45c;
  --highlight-fg: #2b2200;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg: #14161a;
    --fg: #e8e8e8;
    --muted: #9a9a9a;
    --border: #2c2f36;
    --code-bg: #1c1f26;
    --highlight-bg: #7a5f00;
    --highlight-fg: #fff6e0;
    color-scheme: dark;
  }
}
:root[data-theme="light"] { color-scheme: light; }
:root[data-theme="dark"] {
  color-scheme: dark;
  --bg: #14161a;
  --fg: #e8e8e8;
  --muted: #9a9a9a;
  --border: #2c2f36;
  --code-bg: #1c1f26;
  --highlight-bg: #7a5f00;
  --highlight-fg: #fff6e0;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
  line-height: 1.55;
}
main { max-width: 760px; margin: 0 auto; padding: 1.5rem 1.25rem 4rem; }
.page-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
  max-width: 760px;
  margin: 0 auto;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}
.page-header--wide { max-width: 980px; }
.page-header h1 { margin: 0; font-size: 1.1rem; }
.layout {
  display: flex;
  align-items: flex-start;
  gap: 2rem;
  max-width: 980px;
  margin: 0 auto;
  padding: 0 1.25rem;
}
.layout main { max-width: 760px; min-width: 0; flex: 1; margin: 0; padding: 1.5rem 0 4rem; }
.sidebar { flex: 0 0 190px; padding-top: 1.5rem; }
.sidebar summary {
  cursor: pointer;
  list-style: none;
  margin-bottom: 0.75rem;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.sidebar summary::-webkit-details-marker { display: none; }
.sidebar summary::before {
  content: "\\25BE";
  display: inline-block;
  margin-right: 0.35rem;
  transition: transform 0.15s ease;
}
.sidebar:not([open]) summary::before { transform: rotate(-90deg); }
.pills { display: flex; flex-direction: column; gap: 0.4rem; }
.pill {
  appearance: none;
  font-family: inherit;
  font-size: 0.82rem;
  text-align: left;
  cursor: pointer;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
  border: 1px solid var(--pill-color, var(--border));
  background: transparent;
  color: var(--pill-color, var(--muted));
}
.pill:hover { background: var(--code-bg); }
.pill.is-active { background: var(--pill-color, var(--accent)); border-color: transparent; color: #fff; }
@media (max-width: 640px) {
  .layout { flex-direction: column; gap: 0.5rem; }
  .sidebar { flex-basis: auto; width: 100%; padding-top: 1rem; }
  .pills { flex-direction: row; flex-wrap: wrap; }
}
.header-nav { display: flex; align-items: center; gap: 0.9rem; }
.header-actions { display: flex; align-items: center; gap: 0.75rem; }
.theme-toggle {
  appearance: none;
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 6px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}
.theme-toggle:hover { color: var(--fg); background: var(--code-bg); }
.theme-toggle::before {
  content: "";
  display: block;
  width: 1.05em;
  height: 1.05em;
  background-color: currentColor;
  -webkit-mask-image: ${iconMaskUrl("sun")};
  mask-image: ${iconMaskUrl("sun")};
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) .theme-toggle::before {
    -webkit-mask-image: ${iconMaskUrl("moon")};
    mask-image: ${iconMaskUrl("moon")};
  }
}
:root[data-theme="dark"] .theme-toggle::before {
  -webkit-mask-image: ${iconMaskUrl("moon")};
  mask-image: ${iconMaskUrl("moon")};
}
.toc-toggle {
  appearance: none;
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  padding: 0.35rem;
  border-radius: 6px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}
.toc-toggle:hover, .toc-toggle[aria-expanded="true"] { color: var(--fg); background: var(--code-bg); }
.toc-toggle::before {
  content: "";
  display: block;
  width: 1.05em;
  height: 1.05em;
  background-color: currentColor;
  -webkit-mask-image: ${iconMaskUrl("list")};
  mask-image: ${iconMaskUrl("list")};
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}
.print-title { display: none; }
.back-link, .home-link { color: var(--muted); text-decoration: none; }
.back-link:hover, .home-link:hover { text-decoration: underline; }
.home-link { display: inline-flex; align-items: center; gap: 0.35rem; }
.home-link::before {
  content: "";
  display: inline-block;
  width: 0.95em;
  height: 0.95em;
  flex-shrink: 0;
  background-color: currentColor;
  -webkit-mask-image: ${iconMaskUrl("home")};
  mask-image: ${iconMaskUrl("home")};
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}
h1, h2, h3 { line-height: 1.25; }
a { color: var(--accent); }
.type-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  border: 1px solid var(--type-color, var(--border));
  color: var(--type-color, var(--muted));
}
table.properties { border-collapse: collapse; margin: 1rem 0; font-size: 0.9rem; }
table.properties th, table.properties td {
  text-align: left;
  padding: 0.25rem 0.75rem 0.25rem 0;
  vertical-align: top;
  border-bottom: 1px solid var(--border);
}
table.properties th { color: var(--muted); font-weight: 500; white-space: nowrap; }
.note-body img { max-width: 100%; }
.note-body blockquote {
  margin: 1.25rem 0;
  padding: 0.1rem 1rem;
  border-left: 3px solid var(--border);
  color: var(--muted);
}
.note-body blockquote > *:first-child { margin-top: 0; }
.note-body blockquote > *:last-child { margin-bottom: 0; }
.note-body pre {
  background: var(--code-bg);
  padding: 0.9rem;
  overflow-x: auto;
  border-radius: 6px;
}
.note-body code { background: var(--code-bg); padding: 0.1rem 0.3rem; border-radius: 4px; }
.note-body pre code { background: none; padding: 0; }
.note-body mark.highlight {
  background: var(--highlight-bg);
  color: var(--highlight-fg);
  padding: 0.05em 0.2em;
  border-radius: 3px;
}
.note-body pre.mermaid-source-rendered { display: none; }
.note-body .mermaid-diagram {
  margin: 1.25rem 0;
  overflow-x: auto;
}
.note-body .mermaid-diagram svg {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 0 auto;
}
.note-body table {
  display: block;
  width: fit-content;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  margin: 1.5rem 0;
  border-collapse: collapse;
  font-size: 0.9rem;
}
.note-body th, .note-body td {
  padding: 0.5rem 0.85rem;
  text-align: left;
  border: 1px solid var(--border);
}
.note-body thead th {
  background: var(--code-bg);
  color: var(--fg);
  font-weight: 600;
  border-bottom-width: 2px;
}
.note-body tbody tr:nth-child(even) { background: var(--code-bg); }

.note-body .callout {
  margin: 1.25rem 0;
  padding: 0.7rem 1rem 0.8rem;
  border-radius: 6px;
  border-left: 3px solid var(--callout-color, var(--accent));
  background: var(--callout-bg, var(--code-bg));
}
.note-body .callout-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--callout-color, var(--accent));
}
.note-body .callout-title::before {
  content: "";
  display: inline-block;
  width: 1.05em;
  height: 1.05em;
  flex-shrink: 0;
  background-color: currentColor;
  -webkit-mask-image: ${iconMaskUrl("generic")};
  mask-image: ${iconMaskUrl("generic")};
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}
.note-body .callout-content { margin-top: 0.4rem; font-size: 0.95rem; }
.note-body .callout-content > *:first-child { margin-top: 0; }
.note-body .callout-content > *:last-child { margin-bottom: 0; }
.note-body details.callout > summary.callout-title { cursor: pointer; list-style: none; }
.note-body details.callout > summary.callout-title::marker,
.note-body details.callout > summary.callout-title::-webkit-details-marker { display: none; }

.note-body .callout-note { --callout-color: #448aff; --callout-bg: rgba(68, 138, 255, 0.08); }
.note-body .callout-note > .callout-title::before { -webkit-mask-image: ${iconMaskUrl("note")}; mask-image: ${iconMaskUrl("note")}; }
.note-body .callout-abstract { --callout-color: #00bcd4; --callout-bg: rgba(0, 188, 212, 0.08); }
.note-body .callout-abstract > .callout-title::before { -webkit-mask-image: ${iconMaskUrl("abstract")}; mask-image: ${iconMaskUrl("abstract")}; }
.note-body .callout-info { --callout-color: #2196f3; --callout-bg: rgba(33, 150, 243, 0.08); }
.note-body .callout-info > .callout-title::before { -webkit-mask-image: ${iconMaskUrl("info")}; mask-image: ${iconMaskUrl("info")}; }
.note-body .callout-todo { --callout-color: #0091ea; --callout-bg: rgba(0, 145, 234, 0.08); }
.note-body .callout-todo > .callout-title::before { -webkit-mask-image: ${iconMaskUrl("todo")}; mask-image: ${iconMaskUrl("todo")}; }
.note-body .callout-tip { --callout-color: #00bfa5; --callout-bg: rgba(0, 191, 165, 0.08); }
.note-body .callout-tip > .callout-title::before { -webkit-mask-image: ${iconMaskUrl("tip")}; mask-image: ${iconMaskUrl("tip")}; }
.note-body .callout-success { --callout-color: #43a047; --callout-bg: rgba(67, 160, 71, 0.08); }
.note-body .callout-success > .callout-title::before { -webkit-mask-image: ${iconMaskUrl("success")}; mask-image: ${iconMaskUrl("success")}; }
.note-body .callout-question { --callout-color: #ff9800; --callout-bg: rgba(255, 152, 0, 0.08); }
.note-body .callout-question > .callout-title::before { -webkit-mask-image: ${iconMaskUrl("question")}; mask-image: ${iconMaskUrl("question")}; }
.note-body .callout-warning { --callout-color: #f4511e; --callout-bg: rgba(244, 81, 30, 0.08); }
.note-body .callout-warning > .callout-title::before { -webkit-mask-image: ${iconMaskUrl("warning")}; mask-image: ${iconMaskUrl("warning")}; }
.note-body .callout-failure { --callout-color: #ef5350; --callout-bg: rgba(239, 83, 80, 0.08); }
.note-body .callout-failure > .callout-title::before { -webkit-mask-image: ${iconMaskUrl("failure")}; mask-image: ${iconMaskUrl("failure")}; }
.note-body .callout-danger { --callout-color: #d32f2f; --callout-bg: rgba(211, 47, 47, 0.08); }
.note-body .callout-danger > .callout-title::before { -webkit-mask-image: ${iconMaskUrl("danger")}; mask-image: ${iconMaskUrl("danger")}; }
.note-body .callout-bug { --callout-color: #e91e63; --callout-bg: rgba(233, 30, 99, 0.08); }
.note-body .callout-bug > .callout-title::before { -webkit-mask-image: ${iconMaskUrl("bug")}; mask-image: ${iconMaskUrl("bug")}; }
.note-body .callout-example { --callout-color: #7c4dff; --callout-bg: rgba(124, 77, 255, 0.08); }
.note-body .callout-example > .callout-title::before { -webkit-mask-image: ${iconMaskUrl("example")}; mask-image: ${iconMaskUrl("example")}; }
.note-body .callout-quote { --callout-color: #9e9e9e; --callout-bg: rgba(158, 158, 158, 0.08); }
.note-body .callout-quote > .callout-title::before { -webkit-mask-image: ${iconMaskUrl("quote")}; mask-image: ${iconMaskUrl("quote")}; }

/* Default (no-JS) rendering: same always-visible inline box the ToC used before this
   became a drawer. A header <button> can't open a position:fixed panel without JS, so
   without the "js" class (added synchronously in <head>, same technique as the theme
   no-flash script) the ToC stays in its original inline spot and the toggle - which
   would otherwise do nothing - is hidden below. */
.toc-sidebar {
  margin: 1.25rem 0 2rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 0.9rem;
}
.toc-sidebar .toc-title {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.toc-sidebar ul { list-style: none; margin: 0; padding-left: 0; }
.toc-sidebar ul ul { padding-left: 1rem; }
.toc-sidebar li { padding: 0.15rem 0; }
.toc-sidebar a { color: var(--fg); text-decoration: none; }
.toc-sidebar a:hover { color: var(--accent); text-decoration: underline; }
.toc-sidebar a.is-active { color: var(--accent); font-weight: 600; }
.toc-toggle { display: none; }
.js .toc-toggle { display: inline-flex; }
.js .toc-sidebar {
  position: fixed;
  top: 0;
  right: 0;
  width: 280px;
  max-width: 85vw;
  height: 100vh;
  overflow-y: auto;
  background: var(--bg);
  border-left: 1px solid var(--border);
  border-radius: 0;
  margin: 0;
  padding: 1.5rem;
  font-size: 0.9rem;
  transform: translateX(100%);
  transition: transform 0.2s ease;
  z-index: 15;
}
.js .toc-sidebar.is-open { transform: translateX(0); }

section.relation-group, section.backlinks { margin-top: 2rem; }
section.relation-group h3, section.backlinks h3 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.local-graph { margin-top: 2rem; }
.local-graph h3 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}
.local-graph svg { display: block; width: 100%; height: auto; max-height: 420px; }
.graph-edge { stroke: var(--border); stroke-width: 1; }
.graph-edge--backlink-only { stroke-dasharray: 3 3; }
.graph-node { fill: var(--type-color, var(--muted)); stroke: var(--bg); stroke-width: 1.5; }
.graph-node--center { fill: var(--fg); }
.graph-label { font-size: 11px; fill: var(--muted); }
.graph-label--center { font-weight: 600; fill: var(--fg); }
.graph-node-link { cursor: pointer; }
.graph-node-link:hover .graph-label { fill: var(--fg); text-decoration: underline; }
.graph-node-link:hover .graph-edge { stroke: var(--accent); }
.graph-node-link:hover .graph-node { stroke: var(--accent); }
details.frontmatter {
  margin-top: 3rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
details.frontmatter summary {
  cursor: pointer;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
  user-select: none;
}
details.frontmatter summary:hover { color: var(--fg); }
details.frontmatter table.properties {
  margin: 0.75rem 0 0;
  font-size: 0.8rem;
  color: var(--muted);
}
.nav-group { margin-bottom: 1.5rem; }
.nav-group h2 { font-size: 0.95rem; color: var(--muted); }
.nav-group ul, section.relation-group ul, section.backlinks ul, .search-results { list-style: none; padding: 0; margin: 0; }
.nav-group li, section.relation-group li, section.backlinks li { padding: 0.15rem 0; }
.search-box { position: relative; flex: 0 1 320px; min-width: 180px; }
#search-input {
  font-size: 0.95rem;
  padding: 0.4rem 1.9rem 0.4rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--fg);
  width: 100%;
}
.search-kbd {
  position: absolute;
  right: 0.5rem;
  top: 50%;
  transform: translateY(-50%);
  font: 0.7rem/1 inherit;
  padding: 0.1rem 0.4rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  color: var(--muted);
  background: var(--code-bg);
  pointer-events: none;
}
.search-box.is-focused .search-kbd, .search-box.has-value .search-kbd { display: none; }
.search-results:not(:empty) { margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
.search-results li { padding: 0.3rem 0; }
.search-result-link { display: block; color: inherit; text-decoration: none; }
.search-result-link:hover .search-result-title { text-decoration: underline; }
.search-result-row { display: flex; align-items: center; gap: 0.5rem; }
.search-result-title { color: var(--accent); }
.search-type { font-size: 0.75rem; color: var(--muted); }
.search-snippet { margin: 0.15rem 0 0; font-size: 0.85rem; color: var(--muted); }
.search-results mark { background: none; color: var(--fg); font-weight: 700; padding: 0; }

.hljs-comment, .hljs-quote { color: #6a737d; }
.hljs-keyword, .hljs-selector-tag, .hljs-literal { color: #d73a49; }
.hljs-string, .hljs-attr { color: #032f62; }
.hljs-number, .hljs-title { color: #6f42c1; }

@media print {
  * {
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    color-adjust: exact;
  }
  :root, :root[data-theme="dark"] {
    --bg: #ffffff;
    --fg: #1a1a1a;
    --muted: #666;
    --border: #e2e2e2;
    --code-bg: #f5f5f5;
    --highlight-bg: #fbe45c;
    --highlight-fg: #2b2200;
  }
  .theme-toggle, #toc-toggle, .toc-sidebar, .search-box, .sidebar, .local-graph,
  .back-link, .home-link,
  details.frontmatter,
  section.relation-group[data-field="belongs_to"],
  section.relation-group[data-field="has"],
  section.relation-group[data-field="related_to"] {
    display: none !important;
  }
  .print-title {
    display: inline-block;
    font-weight: 600;
    color: var(--fg);
  }
  main, .layout, .layout main, .page-header, .page-header--wide {
    max-width: none;
  }
  .page-header { position: static; }
  h1, h2, h3, h4, h5, h6,
  .note-body pre,
  table.properties,
  .note-body table,
  .note-body .callout,
  .note-body blockquote {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  h1, h2, h3, h4, h5, h6 {
    break-after: avoid;
    page-break-after: avoid;
  }
}
`;

export const SEARCH_JS = `
(function () {
  var data = window.__TOLARIA_SEARCH__ || [];
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  var box = document.querySelector(".search-box");
  if (!input || !results) return;

  var activeType = "";

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // Scores a query as a fuzzy subsequence of text: every query char must appear in
  // order, with bonuses for consecutive runs and word-boundary starts. Returns null
  // when the query isn't a subsequence at all (i.e. no match).
  function fuzzyMatch(query, text) {
    if (!query) return null;
    var q = query.toLowerCase();
    var t = text.toLowerCase();
    var qi = 0;
    var consecutive = 0;
    var indices = [];
    for (var ti = 0; ti < t.length && qi < q.length; ti++) {
      if (t[ti] === q[qi]) {
        indices.push(ti);
        consecutive++;
        var boundary = ti === 0 || /[\\s\\-_/.]/.test(t[ti - 1]);
        indices.__score = (indices.__score || 0) + 1 + consecutive + (boundary ? 3 : 0);
        qi++;
      } else {
        consecutive = 0;
      }
    }
    if (qi < q.length) return null;
    var score = indices.__score || 0;
    if (t.indexOf(q) !== -1) score += 50;
    return { score: score, indices: indices };
  }

  // Wraps matched character indices in <mark>, escaping everything else.
  function highlightHtml(text, indices) {
    if (!indices || !indices.length) return escapeHtml(text);
    var marked = {};
    indices.forEach(function (i) { marked[i] = true; });
    var out = "";
    var i = 0;
    while (i < text.length) {
      if (marked[i]) {
        var run = "";
        while (i < text.length && marked[i]) {
          run += text[i];
          i++;
        }
        out += "<mark>" + escapeHtml(run) + "</mark>";
      } else {
        out += escapeHtml(text[i]);
        i++;
      }
    }
    return out;
  }

  // Picks a ~120-char window around the matched region so the snippet stays short
  // while still showing why the note matched.
  function snippetFor(text, indices) {
    if (!indices || !indices.length) {
      return { text: text.slice(0, 160), indices: [] };
    }
    var start = Math.max(0, indices[0] - 40);
    var end = Math.min(text.length, indices[indices.length - 1] + 60);
    var prefix = start > 0 ? "…" : "";
    var suffix = end < text.length ? "…" : "";
    var rel = indices
      .filter(function (i) { return i >= start && i < end; })
      .map(function (i) { return i - start + prefix.length; });
    return { text: prefix + text.slice(start, end) + suffix, indices: rel };
  }

  function parseQuery(raw) {
    var typeMatch = raw.match(/type:(\\S+)/i);
    return {
      type: typeMatch ? typeMatch[1].toLowerCase() : "",
      text: raw.replace(/type:\\S+/i, "").trim(),
    };
  }

  function render(matches) {
    results.innerHTML = "";
    matches.slice(0, 50).forEach(function (m) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.className = "search-result-link";
      a.href = m.item.href;

      var row = document.createElement("div");
      row.className = "search-result-row";
      row.innerHTML =
        '<span class="search-result-title">' + highlightHtml(m.item.title, m.titleIndices) + "</span>" +
        (m.item.typeName ? '<span class="search-type">' + escapeHtml(m.item.typeName) + "</span>" : "");
      a.appendChild(row);

      var snippet = snippetFor(m.item.excerpt, m.excerptIndices);
      if (snippet.text) {
        var p = document.createElement("p");
        p.className = "search-snippet";
        p.innerHTML = highlightHtml(snippet.text, snippet.indices);
        a.appendChild(p);
      }

      li.appendChild(a);
      results.appendChild(li);
    });
  }

  function runSearch() {
    var parsed = parseQuery(input.value.trim());
    var effectiveType = parsed.type || activeType;
    if (!parsed.text && !effectiveType) {
      results.innerHTML = "";
      return;
    }
    var matches = [];
    data.forEach(function (item) {
      if (effectiveType && (!item.typeName || item.typeName.toLowerCase().indexOf(effectiveType) === -1)) {
        return;
      }
      if (!parsed.text) {
        matches.push({ item: item, score: 1, titleIndices: [], excerptIndices: [] });
        return;
      }
      var titleMatch = fuzzyMatch(parsed.text, item.title);
      var excerptMatch = fuzzyMatch(parsed.text, item.excerpt);
      if (!titleMatch && !excerptMatch) return;
      matches.push({
        item: item,
        score: (titleMatch ? titleMatch.score * 3 : 0) + (excerptMatch ? excerptMatch.score : 0),
        titleIndices: titleMatch ? titleMatch.indices : [],
        excerptIndices: excerptMatch ? excerptMatch.indices : [],
      });
    });
    matches.sort(function (a, b) { return b.score - a.score; });
    render(matches);
  }

  input.addEventListener("input", function () {
    if (box) box.classList.toggle("has-value", Boolean(input.value));
    runSearch();
  });

  if (box) {
    input.addEventListener("focus", function () { box.classList.add("is-focused"); });
    input.addEventListener("blur", function () { box.classList.remove("is-focused"); });
  }

  window.addEventListener("tolaria:typefilter", function (e) {
    activeType = (e.detail && e.detail.type) || "";
    runSearch();
  });

  document.addEventListener("keydown", function (e) {
    var active = document.activeElement;
    var isEditable =
      active && (active.tagName === "INPUT" || active.tagName === "TEXTAREA" || active.isContentEditable);
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      input.focus();
      input.select();
    } else if (e.key === "/" && !isEditable) {
      e.preventDefault();
      input.focus();
    } else if (e.key === "Escape" && active === input) {
      if (input.value) {
        input.value = "";
        if (box) box.classList.remove("has-value");
        runSearch();
      } else {
        input.blur();
      }
    }
  });
})();
`;

/**
 * Same no-flash technique as THEME_INIT_INLINE_JS: run synchronously in <head>, before
 * first paint, so the "js" class is already present by the time STYLE_CSS's `.js`-gated
 * rules apply - otherwise a page with the class added later (e.g. at the bottom of
 * <body>) would render the no-JS fallback for a moment first. This class is what lets
 * the ToC sidebar (see TOC_SIDEBAR_JS) switch from its always-visible inline fallback to
 * a JS-driven off-canvas drawer, since a plain <button> can't open that drawer at all
 * without JS.
 */
export const JS_ENABLED_INLINE_JS = `document.documentElement.classList.add("js");`;

export const SIDEBAR_JS = `
(function () {
  var pills = document.querySelectorAll(".pill");
  var groups = document.querySelectorAll(".nav-group");
  if (!pills.length || !groups.length) return;

  function applyFilter(type) {
    groups.forEach(function (g) {
      g.hidden = Boolean(type) && g.getAttribute("data-type") !== type;
    });
    pills.forEach(function (p) {
      p.classList.toggle("is-active", p.getAttribute("data-type") === type);
    });
  }

  pills.forEach(function (p) {
    p.addEventListener("click", function () {
      var type = p.getAttribute("data-type") || "";
      applyFilter(type);
      window.dispatchEvent(new CustomEvent("tolaria:typefilter", { detail: { type: type } }));
    });
  });
})();
`;

/**
 * Drives the right-hand ToC drawer: toggling it from the header button, closing it on
 * Escape, on an outside click, or after following one of its links, and keeping it
 * docked below the sticky header rather than hardcoding that header's height (which
 * varies - e.g. a type badge or a long title can push it to two lines). Also runs a
 * scroll-spy that highlights whichever ToC entry matches the section currently under
 * the sticky header, so the drawer stays a "where am I" reference even while closed off
 * to the side (reopening it later shows the right entry already marked).
 */
export const TOC_SIDEBAR_JS = `
(function () {
  var toggle = document.getElementById("toc-toggle");
  var sidebar = document.getElementById("toc-sidebar");
  var header = document.querySelector(".page-header");
  if (!toggle || !sidebar) return;

  function syncHeaderOffset() {
    var h = header ? header.offsetHeight : 0;
    sidebar.style.top = h + "px";
    sidebar.style.height = "calc(100vh - " + h + "px)";
  }

  function setOpen(open) {
    sidebar.classList.toggle("is-open", open);
    sidebar.setAttribute("aria-hidden", open ? "false" : "true");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) syncHeaderOffset();
  }

  window.addEventListener("resize", function () {
    if (sidebar.classList.contains("is-open")) syncHeaderOffset();
  });

  toggle.addEventListener("click", function () {
    setOpen(!sidebar.classList.contains("is-open"));
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && sidebar.classList.contains("is-open")) setOpen(false);
  });

  document.addEventListener("click", function (e) {
    if (!sidebar.classList.contains("is-open")) return;
    if (sidebar.contains(e.target) || toggle.contains(e.target)) return;
    setOpen(false);
  });

  sidebar.addEventListener("click", function (e) {
    if (e.target.tagName === "A") setOpen(false);
  });

  // Scroll-spy: mark the ToC link for whichever heading the reader is currently under.
  var linkById = {};
  sidebar.querySelectorAll("a[href^='#']").forEach(function (a) {
    linkById[a.getAttribute("href").slice(1)] = a;
  });
  var headings = Array.prototype.slice
    .call(document.querySelectorAll(".note-body h1, .note-body h2, .note-body h3, .note-body h4, .note-body h5, .note-body h6"))
    .filter(function (h) {
      return linkById[h.id];
    });

  if (headings.length) {
    var activeId = null;
    function setActive(id) {
      if (id === activeId) return;
      if (activeId && linkById[activeId]) linkById[activeId].classList.remove("is-active");
      if (id && linkById[id]) linkById[id].classList.add("is-active");
      activeId = id;
    }

    function updateActive() {
      // The section "current" under the sticky header is the last heading that has
      // already scrolled up past it - headings are in document order, so once one
      // hasn't been reached yet, none after it have either.
      var offset = (header ? header.offsetHeight : 0) + 8;
      var current = null;
      for (var i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top - offset <= 0) current = headings[i].id;
        else break;
      }
      setActive(current);
    }

    var ticking = false;
    function onScrollOrResize() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        updateActive();
        ticking = false;
      });
    }
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    updateActive();
  }
})();
`;

/**
 * Wires up the theme toggle button and carries an explicit theme choice forward across
 * page loads. The initial no-flash application (before the stylesheet paints) is
 * inlined directly into each page's <head> instead - see THEME_INIT_INLINE_JS.
 *
 * localStorage alone isn't enough here: opened via file://, distinct note pages can be
 * distinct storage origins (observed in Firefox), so a value set by one page doesn't
 * reliably show up on the next. Once the user makes an explicit choice (from the query
 * param on the link just followed, or recovered from localStorage on a plain reload),
 * that choice is written onto every same-site link's href as "?theme=light|dark" so it
 * keeps propagating however the visitor navigates - including links added later by
 * search results, via a MutationObserver. Before any explicit choice is made, links are
 * left untouched and each page just follows the OS-level light/dark preference on its
 * own, matching the site's pre-toggle behavior.
 */
export const THEME_JS = `
(function () {
  var STORAGE_KEY = "tolaria-theme";
  var pinned = null;

  function storedTheme() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return v === "light" || v === "dark" ? v : null;
    } catch (e) {
      return null;
    }
  }

  function currentTheme() {
    var attr = document.documentElement.getAttribute("data-theme");
    if (attr === "light" || attr === "dark") return attr;
    var prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
  }

  function isLocalPageLink(href) {
    return Boolean(href) && href.charAt(0) !== "#" && !/^[a-z][a-z0-9+.-]*:/i.test(href);
  }

  function themeLink(a, theme) {
    var href = a.getAttribute("href");
    if (!isLocalPageLink(href)) return;
    var hashIndex = href.indexOf("#");
    var fragment = hashIndex === -1 ? "" : href.slice(hashIndex);
    // Removing an existing "?theme=x" (as opposed to "&theme=x") drops the query
    // string's only "?", so any param that follows it needs one put back, not just
    // left dangling behind a leading "&".
    var pathAndQuery = (hashIndex === -1 ? href : href.slice(0, hashIndex)).replace(
      /([?&])theme=(?:light|dark)(&)?/,
      function (_m, lead, trailingAmp) {
        if (lead === "?" && trailingAmp) return "?";
        return trailingAmp ? "&" : "";
      }
    );
    var sep = pathAndQuery.indexOf("?") === -1 ? "?" : "&";
    a.setAttribute("href", pathAndQuery + sep + "theme=" + theme + fragment);
  }

  function propagate(theme) {
    document.querySelectorAll("a[href]").forEach(function (a) {
      themeLink(a, theme);
    });
  }

  function applyTheme(theme) {
    pinned = theme;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch (e) {}
    propagate(theme);
    document.dispatchEvent(new CustomEvent("tolaria:themechange", { detail: { theme: theme } }));
  }

  var queryMatch = /[?&]theme=(light|dark)\\b/.exec(location.search);
  var initial = queryMatch ? queryMatch[1] : storedTheme();
  if (initial) applyTheme(initial);

  new MutationObserver(function (mutations) {
    if (!pinned) return;
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches("a[href]")) themeLink(node, pinned);
        if (node.querySelectorAll) {
          node.querySelectorAll("a[href]").forEach(function (a) {
            themeLink(a, pinned);
          });
        }
      });
    });
  }).observe(document.body, { childList: true, subtree: true });

  document.querySelectorAll(".theme-toggle").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyTheme(currentTheme() === "dark" ? "light" : "dark");
    });
  });
})();
`;

/**
 * Force-opens every closed <details> except the frontmatter table (foldable callouts,
 * the index page's type-filter sidebar) just before printing, and restores whichever
 * ones it opened right after - CSS alone can't reliably make a closed <details>'s
 * content actually render in print output across browsers, so this needs a JS assist.
 * The frontmatter table is skipped since STYLE_CSS's @media print block hides it
 * outright rather than expanding it. Safe to run on pages with no <details> at all.
 */
export const PRINT_JS = `
(function () {
  var reopened = [];
  window.addEventListener("beforeprint", function () {
    document.querySelectorAll("details:not([open]):not(.frontmatter)").forEach(function (d) {
      d.setAttribute("open", "");
      reopened.push(d);
    });
  });
  window.addEventListener("afterprint", function () {
    reopened.forEach(function (d) { d.removeAttribute("open"); });
    reopened = [];
  });
})();
`;

/**
 * Renders ```mermaid fenced code blocks (left as plain text by rehype-highlight, see
 * pipeline.ts) into inline SVG via the vendored mermaid.min.js. The original
 * <pre><code> is never removed, only hidden on success (`.mermaid-source-rendered` in
 * STYLE_CSS) - if rendering throws, is slow, or JS is disabled entirely, the raw
 * source stays visible, the same "degrade to plain rather than break the page"
 * behavior as a dead wikilink elsewhere in this codebase.
 *
 * Diagram colors come from the site's own CSS custom properties (mermaid's "base"
 * theme driven by `themeVariables`) rather than mermaid's stock palette, recomputed on
 * every render so they can't drift from the real theme. Because mermaid bakes resolved
 * colors into each rendered SVG, a light/dark toggle can't just be a CSS change here -
 * this listens for the `tolaria:themechange` event (dispatched by THEME_JS's
 * applyTheme) and re-renders every diagram from its saved source with a freshly minted
 * id each time (reusing an id makes mermaid/d3 treat it as a duplicate).
 */
export const MERMAID_INIT_JS = `
(function () {
  var blocks = [];
  var generation = 0;

  function themeVariablesFromCss() {
    var cs = getComputedStyle(document.documentElement);
    function v(name, fallback) {
      var val = cs.getPropertyValue(name);
      val = val ? val.trim() : "";
      return val || fallback;
    }
    var bg = v("--bg", "#ffffff");
    var fg = v("--fg", "#1a1a1a");
    var border = v("--border", "#e2e2e2");
    var accent = v("--accent", "#4f8ef7");
    var codeBg = v("--code-bg", "#f5f5f5");
    return {
      background: bg,
      edgeLabelBackground: bg,
      primaryColor: codeBg,
      mainBkg: codeBg,
      secondaryColor: codeBg,
      tertiaryColor: codeBg,
      clusterBkg: codeBg,
      primaryTextColor: fg,
      textColor: fg,
      primaryBorderColor: border,
      nodeBorder: border,
      clusterBorder: border,
      lineColor: accent,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif'
    };
  }

  function findBlocks() {
    var found = [];
    document.querySelectorAll("pre code.language-mermaid").forEach(function (code) {
      var pre = code.parentElement;
      if (!pre || pre.hasAttribute("data-mermaid-block")) return;
      pre.setAttribute("data-mermaid-block", "");
      var container = document.createElement("div");
      container.className = "mermaid-diagram";
      pre.insertAdjacentElement("afterend", container);
      found.push({ pre: pre, source: code.textContent, container: container });
    });
    return found;
  }

  function renderAll() {
    if (typeof mermaid === "undefined" || !blocks.length) return;
    generation += 1;
    var gen = generation;
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      themeVariables: themeVariablesFromCss()
    });
    // Rendered one at a time (not in parallel) since mermaid manages a shared
    // temporary DOM sandbox internally across calls.
    blocks.reduce(function (chain, block, i) {
      return chain.then(function () {
        return mermaid
          .render("mermaid-diagram-" + gen + "-" + i, block.source)
          .then(function (result) {
            if (gen !== generation) return;
            block.container.innerHTML = result.svg;
            if (result.bindFunctions) result.bindFunctions(block.container);
            block.pre.classList.add("mermaid-source-rendered");
          })
          .catch(function () {
            if (gen !== generation) return;
            block.container.innerHTML = "";
            block.pre.classList.remove("mermaid-source-rendered");
          });
      });
    }, Promise.resolve());
  }

  function init() {
    blocks = findBlocks();
    if (!blocks.length) return;
    renderAll();
    document.addEventListener("tolaria:themechange", renderAll);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
`;
