import { iconMaskUrl } from "./icons.js";
import { jsonForInlineScript } from "./html.js";

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
.home-banners {
  max-width: 760px;
  margin: 1rem auto 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.home-banner {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.7rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--banner-color, var(--accent));
  background: var(--banner-bg, var(--code-bg));
}
.home-banner-body { flex: 1 1 auto; min-width: 0; }
.home-banner-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin: 0;
  font-weight: 600;
  font-size: 0.92rem;
  color: var(--banner-color, var(--accent));
}
.home-banner-title::before {
  content: "";
  display: inline-block;
  width: 1.05em;
  height: 1.05em;
  flex-shrink: 0;
  background-color: currentColor;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}
.home-banner-text { margin: 0.25rem 0 0; font-size: 0.92rem; overflow-wrap: break-word; }
.home-banner-dismiss {
  appearance: none;
  font-family: inherit;
  flex-shrink: 0;
  width: 1.8rem;
  height: 1.8rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  font-size: 1.1rem;
  line-height: 1;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.home-banner-dismiss:hover { color: var(--fg); background: var(--code-bg); }
/* Per-type coloring, same pattern as the .callout-<type> blocks below - copy this
 * shape (color/bg pair + icon-mask override) to add more banner types later. */
.home-banner-danger { --banner-color: #d32f2f; --banner-bg: rgba(211, 47, 47, 0.08); }
.home-banner-danger .home-banner-title::before {
  -webkit-mask-image: ${iconMaskUrl("danger")};
  mask-image: ${iconMaskUrl("danger")};
}
.home-banner-info { --banner-color: #2196f3; --banner-bg: rgba(33, 150, 243, 0.08); }
.home-banner-info .home-banner-title::before {
  -webkit-mask-image: ${iconMaskUrl("info")};
  mask-image: ${iconMaskUrl("info")};
}
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
  font-family: inherit;
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  padding: 0.35rem;
  width: 2.1rem;
  height: 2.1rem;
  flex-shrink: 0;
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
  font-family: inherit;
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  padding: 0.35rem;
  width: 2.1rem;
  height: 2.1rem;
  flex-shrink: 0;
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
.print-breadcrumb, .print-timestamp { display: none; }
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
.organized-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  padding: 0.15rem 0.55rem 0.15rem 0.45rem;
  border-radius: 999px;
  border: 1px solid #43a047;
  color: #43a047;
}
.organized-badge::before {
  content: "";
  display: inline-block;
  width: 0.9em;
  height: 0.9em;
  flex-shrink: 0;
  background-color: currentColor;
  -webkit-mask-image: ${iconMaskUrl("success")};
  mask-image: ${iconMaskUrl("success")};
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
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
.local-graph-link {
  display: inline-block;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: var(--accent);
  text-decoration: none;
}
.local-graph-link:hover { text-decoration: underline; }
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
.graph-node-link.is-dimmed { opacity: 0.25; }
.graph-edge.is-dimmed { opacity: 0.15; }
.js .graph-node-link:hover .graph-node { cursor: grab; }
.graph-node-link.is-dragging .graph-node { cursor: grabbing; stroke: var(--accent); stroke-width: 2.5; }
.graph-node-link.is-dragging .graph-label { fill: var(--fg); font-weight: 600; }
.graph-toggle {
  appearance: none;
  font-family: inherit;
  border: 1px solid var(--border);
  background: transparent;
  cursor: pointer;
  padding: 0.35rem;
  width: 2.1rem;
  height: 2.1rem;
  flex-shrink: 0;
  border-radius: 6px;
  color: var(--muted);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  text-decoration: none;
}
.graph-toggle:hover { color: var(--fg); background: var(--code-bg); }
.graph-toggle::before {
  content: "";
  display: block;
  width: 1.05em;
  height: 1.05em;
  background-color: currentColor;
  -webkit-mask-image: ${iconMaskUrl("radar")};
  mask-image: ${iconMaskUrl("radar")};
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  -webkit-mask-position: center;
  mask-position: center;
  -webkit-mask-size: contain;
  mask-size: contain;
}
.site-graph {
  margin: 1.5rem auto;
  max-width: 980px;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  cursor: grab;
  touch-action: none;
}
.site-graph:active { cursor: grabbing; }
.site-graph svg { display: block; width: 100%; height: 75vh; }
#site-graph-viewport { transform-origin: 0 0; }
.graph-controls {
  display: none;
  position: absolute;
  margin: 0.75rem;
  gap: 0.35rem;
}
.js .graph-controls { display: flex; }
.graph-controls button {
  appearance: none;
  width: 1.8rem;
  height: 1.8rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--bg);
  color: var(--fg);
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
}
.graph-controls button:hover { background: var(--code-bg); }
.site-graph-wrap { position: relative; }
.graph-count { color: var(--muted); font-size: 0.85rem; margin: 0 0 0.5rem; }
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
  font-family: inherit;
  font-size: 0.95rem;
  padding: 0.4rem 1.9rem 0.4rem 0.6rem;
  height: 2.1rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--fg);
  width: 100%;
}
#search-input::placeholder { color: var(--muted); opacity: 1; }
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
  .graph-toggle, .site-graph, .graph-controls,
  .back-link, .home-link, .type-badge, .organized-badge,
  details.frontmatter,
  section.relation-group[data-field="belongs_to"],
  section.relation-group[data-field="has"],
  section.relation-group[data-field="related_to"] {
    display: none !important;
  }
  .print-breadcrumb {
    display: inline-block;
    color: var(--muted);
  }
  .print-breadcrumb-current {
    color: var(--fg);
    font-weight: 600;
  }
  .print-breadcrumb-sep {
    margin: 0 0.35em;
  }
  .print-timestamp {
    display: inline-block;
    color: var(--muted);
  }
  .print-timestamp::before {
    content: "Printed on:";
    font-weight: 600;
    color: var(--fg);
    margin-right: 0.35em;
  }
  main, .layout, .layout main, .page-header, .page-header--wide {
    max-width: none;
  }
  .page-header { position: static; }
  .home-banners { display: none; }
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
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var now = new Date();
    var date = pad(now.getDate()) + "." + pad(now.getMonth() + 1) + "." + now.getFullYear();
    var time = pad(now.getHours()) + "." + pad(now.getMinutes()) + "." + pad(now.getSeconds());
    document.querySelectorAll(".print-timestamp").forEach(function (el) {
      el.textContent = date + " " + time;
    });
  });
  window.addEventListener("afterprint", function () {
    reopened.forEach(function (d) { d.removeAttribute("open"); });
    reopened = [];
  });
})();
`;

/**
 * Runs synchronously in <head>, before <body> (and so before any .home-banner element)
 * exists, so it can't hide a dismissed banner directly - instead it injects a <style>
 * element suppressing whichever banners (by index) are already dismissed, avoiding a
 * flash of an already-dismissed banner before BANNER_JS's own external script runs.
 * Genuinely N-safe (no fixed upper bound on how many banners exist).
 */
export function bannerInitInlineJs(texts: string[]): string {
  return (
    `(function(){try{` +
    `var texts=${jsonForInlineScript(texts)};` +
    `var dismissed=JSON.parse(localStorage.getItem("tolaria-banners-dismissed")||"[]");` +
    `var css="";` +
    `for(var i=0;i<texts.length;i++){if(dismissed.indexOf(texts[i])!==-1)css+='.home-banner[data-banner-index="'+i+'"]{display:none}';}` +
    `if(css){var s=document.createElement("style");s.textContent=css;document.head.appendChild(s);}` +
    `}catch(e){}})();`
  );
}

/**
 * Dismiss handling for the home page's announcement banner(s) (see templates.ts,
 * siteGraph.ts's counterpart doesn't apply here - this is unrelated to the graph).
 * Dismissal is keyed by each banner's own text (not an index or a flat yes/no flag) in
 * a single shared localStorage array, so editing a banner's text later makes it
 * reappear for everyone who dismissed the old wording, and dismissing one banner never
 * hides an unrelated one. Also re-checks on load as a fallback for bannerInitInlineJs's
 * <style>-injection approach, in case that ever has a gap (e.g. localStorage briefly
 * unavailable when the inline script ran).
 */
export const BANNER_JS = `
(function () {
  var STORAGE_KEY = "tolaria-banners-dismissed";
  function readDismissed() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch (e) { return []; }
  }
  function writeDismissed(list) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) {}
  }
  var dismissed = readDismissed();
  document.querySelectorAll(".home-banner").forEach(function (el) {
    var text = el.getAttribute("data-banner-text") || "";
    if (dismissed.indexOf(text) !== -1) { el.style.display = "none"; return; }
    var btn = el.querySelector(".home-banner-dismiss");
    if (btn) btn.addEventListener("click", function () {
      var list = readDismissed();
      if (list.indexOf(text) === -1) list.push(text);
      writeDismissed(list);
      el.style.display = "none";
    });
  });
})();
`;

/**
 * Progressive-enhancement pan/zoom/hover-highlight for the site-wide graph page
 * (graph.html). The build-time SVG (see siteGraph.ts) is already fully laid out and
 * clickable without this - pan/zoom only translate/scale a wrapping <g> (the SVG's own
 * viewBox never changes), so there's no client-side layout engine here, just transform
 * math and classList toggling. Click-to-navigate needs no JS at all since every node is
 * a real <a href>.
 */
export const SITE_GRAPH_JS = `
(function () {
  var wrap = document.querySelector(".site-graph");
  var viewport = document.getElementById("site-graph-viewport");
  if (!wrap || !viewport) return;

  var scale = 1;
  var tx = 0;
  var ty = 0;
  var MIN_SCALE = 0.25;
  var MAX_SCALE = 3;

  function apply() {
    viewport.setAttribute("transform", "translate(" + tx + " " + ty + ") scale(" + scale + ")");
  }

  function zoomBy(factor, cx, cy) {
    var next = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale * factor));
    var ratio = next / scale;
    tx = cx - (cx - tx) * ratio;
    ty = cy - (cy - ty) * ratio;
    scale = next;
    apply();
  }

  wrap.addEventListener("wheel", function (e) {
    e.preventDefault();
    var rect = wrap.getBoundingClientRect();
    zoomBy(e.deltaY < 0 ? 1.1 : 0.9, e.clientX - rect.left, e.clientY - rect.top);
  }, { passive: false });

  var zoomIn = document.getElementById("graph-zoom-in");
  var zoomOut = document.getElementById("graph-zoom-out");
  if (zoomIn) zoomIn.addEventListener("click", function () {
    var rect = wrap.getBoundingClientRect();
    zoomBy(1.2, rect.width / 2, rect.height / 2);
  });
  if (zoomOut) zoomOut.addEventListener("click", function () {
    var rect = wrap.getBoundingClientRect();
    zoomBy(0.8, rect.width / 2, rect.height / 2);
  });

  var dragging = false;
  var lastX = 0;
  var lastY = 0;

  function pointerDown(x, y) {
    dragging = true;
    lastX = x;
    lastY = y;
  }
  function pointerMove(x, y) {
    if (!dragging) return;
    tx += x - lastX;
    ty += y - lastY;
    lastX = x;
    lastY = y;
    apply();
  }
  function pointerUp() {
    dragging = false;
  }

  wrap.addEventListener("mousedown", function (e) {
    if (e.target.closest(".graph-node-link")) return;
    pointerDown(e.clientX, e.clientY);
  });
  window.addEventListener("mousemove", function (e) { pointerMove(e.clientX, e.clientY); });
  window.addEventListener("mouseup", pointerUp);

  wrap.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1 || e.target.closest(".graph-node-link")) return;
    pointerDown(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  wrap.addEventListener("touchmove", function (e) {
    if (e.touches.length !== 1) return;
    pointerMove(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener("touchend", pointerUp);

  var links = wrap.querySelectorAll(".graph-node-link");
  var edges = wrap.querySelectorAll(".graph-edge");

  function applyHighlight(slug) {
    var target = null;
    links.forEach(function (l) {
      var match = l.getAttribute("data-slug") === slug;
      l.classList.toggle("is-dimmed", !match);
      if (match) target = l;
    });
    edges.forEach(function (edge) {
      var touches = edge.getAttribute("data-a") === slug || edge.getAttribute("data-b") === slug;
      edge.classList.toggle("is-dimmed", !touches);
    });
    return target;
  }

  function clearHighlight() {
    links.forEach(function (l) { l.classList.remove("is-dimmed"); });
    edges.forEach(function (e) { e.classList.remove("is-dimmed"); });
  }

  links.forEach(function (link) {
    link.addEventListener("mouseenter", function () {
      applyHighlight(link.getAttribute("data-slug"));
    });
    link.addEventListener("mouseleave", clearHighlight);
  });

  // Deep-linked from a note's local graph ("<Type> neighbourhood" link, see graph.ts) as
  // graph.html?focus=<slug> - highlights that note the same way hovering it would, and
  // centers/zooms on it using the node's build-time-baked cx/cy (already exact SVG
  // user-space coordinates, unlike the pixel-driven pan/zoom above).
  var focusSlug = new URLSearchParams(location.search).get("focus");
  if (focusSlug) {
    var focused = applyHighlight(focusSlug);
    var circle = focused && focused.querySelector("circle");
    if (circle) {
      var svg = document.getElementById("site-graph-svg");
      var vb = svg.viewBox.baseVal;
      var nx = parseFloat(circle.getAttribute("cx"));
      var ny = parseFloat(circle.getAttribute("cy"));
      scale = Math.max(scale, 1.5);
      tx = vb.width / 2 - nx * scale;
      ty = vb.height / 2 - ny * scale;
      apply();
    }
  }
})();
`;

/**
 * Obsidian-style drag physics for the site-wide graph, layered on top of the static,
 * build-time-laid-out SVG from siteGraph.ts. Kept as its own script (rather than folded
 * into SITE_GRAPH_JS) so it can be omitted entirely - via renderGraphPage's `hasPhysics`
 * flag - when the vendored graph-physics.min.js bundle wasn't written (empty graph).
 *
 * Seeds a live d3-force simulation from the DOM's already-baked cx/cy/data-r attributes
 * so there is zero visual jump on load, then keeps it fully idle (alpha 0) until a node
 * is actually dragged past a small movement threshold, at which point it reheats
 * (alphaTarget) so linked neighbors react, and cools back down on release. A dropped
 * node stays pinned (fx/fy are never cleared) rather than springing back - d3-force's
 * own alpha decay naturally stops the simulation's timer once things settle, so no
 * manual "stop ticking" bookkeeping is needed. Degrades to a complete no-op (page stays
 * fully static/navigable) if the physics bundle didn't load, mirroring how a dead
 * wikilink or a mermaid render failure degrade elsewhere in this codebase.
 */
export const GRAPH_DRAG_JS = `
(function () {
  if (typeof d3 === "undefined") return;
  var wrap = document.querySelector(".site-graph");
  var svg = document.getElementById("site-graph-svg");
  var viewport = document.getElementById("site-graph-viewport");
  if (!wrap || !svg || !viewport) return;

  var DRAG_THRESHOLD = 4;
  var DRAG_ALPHA_TARGET = 0.3;

  var circleBySlug = {};
  var textBySlug = {};
  var simNodesById = {};
  var simNodes = [];
  var simLinks = [];
  var edgeEls = [];

  wrap.querySelectorAll(".graph-node-link").forEach(function (link) {
    var slug = link.getAttribute("data-slug");
    var circle = link.querySelector("circle");
    var text = link.querySelector("text");
    if (!slug || !circle) return;
    circleBySlug[slug] = circle;
    textBySlug[slug] = text;
    var node = {
      id: slug,
      r: parseFloat(circle.getAttribute("data-r")) || 6,
      x: parseFloat(circle.getAttribute("cx")),
      y: parseFloat(circle.getAttribute("cy"))
    };
    simNodesById[slug] = node;
    simNodes.push(node);
  });

  if (!simNodes.length) return;

  wrap.querySelectorAll(".graph-edge").forEach(function (line) {
    var a = line.getAttribute("data-a");
    var b = line.getAttribute("data-b");
    if (!a || !b) return;
    simLinks.push({ source: a, target: b });
    edgeEls.push({ el: line, a: a, b: b });
  });

  var sim = d3.forceSimulation(simNodes)
    .force("charge", d3.forceManyBody().strength(-140))
    .force("link", d3.forceLink(simLinks).id(function (d) { return d.id; }).distance(80))
    .force("collide", d3.forceCollide(function (d) { return d.r + 18; }))
    .alpha(0)
    .stop();

  sim.on("tick", function () {
    simNodes.forEach(function (n) {
      var circle = circleBySlug[n.id];
      var text = textBySlug[n.id];
      if (circle) { circle.setAttribute("cx", n.x); circle.setAttribute("cy", n.y); }
      if (text) { text.setAttribute("x", n.x); text.setAttribute("y", n.y + n.r + 12); }
    });
    edgeEls.forEach(function (e) {
      var na = simNodesById[e.a];
      var nb = simNodesById[e.b];
      if (!na || !nb) return;
      e.el.setAttribute("x1", na.x);
      e.el.setAttribute("y1", na.y);
      e.el.setAttribute("x2", nb.x);
      e.el.setAttribute("y2", nb.y);
    });
  });

  // Composes both the SVG's viewBox scaling and site-graph.js's own manual pan/zoom
  // transform on #site-graph-viewport in one step, so this script never needs to know
  // about that script's private tx/ty/scale state.
  function toSvgPoint(clientX, clientY) {
    var pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(viewport.getScreenCTM().inverse());
  }

  var candidate = null;
  var justDraggedSlug = null;

  function startCandidate(link, clientX, clientY) {
    var node = simNodesById[link.getAttribute("data-slug")];
    if (!node) return;
    candidate = { node: node, link: link, startX: clientX, startY: clientY, moved: false };
  }

  function moveCandidate(clientX, clientY) {
    if (!candidate) return;
    if (!candidate.moved) {
      if (Math.hypot(clientX - candidate.startX, clientY - candidate.startY) < DRAG_THRESHOLD) return;
      candidate.moved = true;
      sim.alphaTarget(DRAG_ALPHA_TARGET).restart();
      candidate.link.classList.add("is-dragging");
    }
    var p = toSvgPoint(clientX, clientY);
    candidate.node.fx = p.x;
    candidate.node.fy = p.y;
  }

  function endCandidate() {
    if (!candidate) return;
    if (candidate.moved) {
      sim.alphaTarget(0);
      candidate.link.classList.remove("is-dragging");
      // Dropped nodes stay pinned (fx/fy intentionally left set) - only the upcoming
      // click on this same link is suppressed, so the drag doesn't also navigate.
      justDraggedSlug = candidate.node.id;
      setTimeout(function () { justDraggedSlug = null; }, 0);
    }
    candidate = null;
  }

  wrap.addEventListener("mousedown", function (e) {
    var link = e.target.closest(".graph-node-link");
    if (!link) return;
    e.preventDefault();
    startCandidate(link, e.clientX, e.clientY);
  });
  window.addEventListener("mousemove", function (e) { moveCandidate(e.clientX, e.clientY); });
  window.addEventListener("mouseup", endCandidate);

  wrap.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) return;
    var link = e.target.closest(".graph-node-link");
    if (!link) return;
    startCandidate(link, e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  wrap.addEventListener("touchmove", function (e) {
    if (e.touches.length !== 1) return;
    moveCandidate(e.touches[0].clientX, e.touches[0].clientY);
  }, { passive: true });
  window.addEventListener("touchend", endCandidate);

  wrap.addEventListener("click", function (e) {
    var link = e.target.closest(".graph-node-link");
    if (link && justDraggedSlug && link.getAttribute("data-slug") === justDraggedSlug) {
      e.preventDefault();
      e.stopPropagation();
    }
    justDraggedSlug = null;
  }, true);
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
