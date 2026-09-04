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
.page-header h1 { margin: 0; font-size: 1.1rem; }
.back-link { color: var(--muted); text-decoration: none; }
.back-link:hover { text-decoration: underline; }
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
.note-body pre {
  background: var(--code-bg);
  padding: 0.9rem;
  overflow-x: auto;
  border-radius: 6px;
}
.note-body code { background: var(--code-bg); padding: 0.1rem 0.3rem; border-radius: 4px; }
.note-body pre code { background: none; padding: 0; }
section.relation-group, section.backlinks { margin-top: 2rem; }
section.relation-group h3, section.backlinks h3 {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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
