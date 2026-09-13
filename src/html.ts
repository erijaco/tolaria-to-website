export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** JSON.stringify plus escaping "</" so the result is safe to embed inside an
 * inline <script> tag without risk of prematurely closing it - JSON.stringify
 * alone escapes quotes/backslashes but not a literal `</script>` substring. */
export function jsonForInlineScript(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
