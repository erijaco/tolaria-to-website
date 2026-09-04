import { iconMaskUrl } from "./icons.js";

export const STYLE_CSS = `
:root {
  color-scheme: light dark;
  --bg: #ffffff;
  --fg: #1a1a1a;
  --muted: #666;
  --border: #e2e2e2;
  --accent: #4f8ef7;
  --code-bg: #f5f5f5;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #14161a;
    --fg: #e8e8e8;
    --muted: #9a9a9a;
    --border: #2c2f36;
    --code-bg: #1c1f26;
  }
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

section.relation-group, section.backlinks { margin-top: 2rem; }
section.relation-group h3, section.backlinks h3 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--muted);
}
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
#search-input {
  font-size: 0.95rem;
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--fg);
  width: 40%;
  min-width: 180px;
}
.search-results:not(:empty) { margin-bottom: 1.5rem; border-bottom: 1px solid var(--border); padding-bottom: 1rem; }
.search-results li { display: flex; align-items: center; gap: 0.5rem; }
.search-type { font-size: 0.75rem; color: var(--muted); }

.hljs-comment, .hljs-quote { color: #6a737d; }
.hljs-keyword, .hljs-selector-tag, .hljs-literal { color: #d73a49; }
.hljs-string, .hljs-attr { color: #032f62; }
.hljs-number, .hljs-title { color: #6f42c1; }
`;

export const SEARCH_JS = `
(function () {
  var data = window.__TOLARIA_SEARCH__ || [];
  var input = document.getElementById("search-input");
  var results = document.getElementById("search-results");
  if (!input || !results) return;

  function render(items) {
    results.innerHTML = "";
    items.slice(0, 50).forEach(function (item) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = item.href;
      a.textContent = item.title;
      li.appendChild(a);
      if (item.typeName) {
        var span = document.createElement("span");
        span.className = "search-type";
        span.textContent = item.typeName;
        li.appendChild(span);
      }
      results.appendChild(li);
    });
  }

  input.addEventListener("input", function () {
    var q = input.value.trim().toLowerCase();
    if (!q) {
      results.innerHTML = "";
      return;
    }
    var matches = data.filter(function (item) {
      return item.title.toLowerCase().indexOf(q) !== -1 || item.excerpt.toLowerCase().indexOf(q) !== -1;
    });
    render(matches);
  });
})();
`;

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
      applyFilter(p.getAttribute("data-type") || "");
    });
  });
})();
`;
