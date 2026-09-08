import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { NoteFile } from "./types.js";

const FENCE_RE = /^ {0,3}(`{3,}|~{3,})/;
const H1_LINE_RE = /^#\s+(.+?)\s*$/;

/**
 * Finds the first top-level `# Heading` line, skipping over any fenced code blocks so
 * a source-code comment that happens to start with "# " (Python, shell, etc.) is never
 * mistaken for the note's title.
 */
function findH1(content: string): { index: number; length: number; title: string } | undefined {
  let index = 0;
  let inFence = false;
  for (const line of content.split("\n")) {
    if (FENCE_RE.test(line)) {
      inFence = !inFence;
    } else if (!inFence) {
      const match = H1_LINE_RE.exec(line);
      if (match) return { index, length: line.length, title: match[1].trim() };
    }
    index += line.length + 1;
  }
  return undefined;
}

/** Parses one Markdown file into a NoteFile: frontmatter, title (first H1, else filename), and body. */
export function parseNote(vaultDir: string, absPath: string): NoteFile {
  const raw = fs.readFileSync(absPath, "utf8");
  const parsed = matter(raw);
  const relPath = path.relative(vaultDir, absPath).split(path.sep).join("/");
  const slug = relPath.replace(/\.md$/i, "");
  const filenameKey = path.basename(slug).toLowerCase();

  const h1 = findH1(parsed.content);
  const title = h1 ? h1.title : path.basename(slug);
  const bodyMarkdown = h1
    ? parsed.content.slice(0, h1.index) + parsed.content.slice(h1.index + h1.length)
    : parsed.content;

  const frontmatter = parsed.data ?? {};
  const typeName = typeof frontmatter.type === "string" ? frontmatter.type : undefined;

  return {
    absPath,
    relPath,
    slug,
    filenameKey,
    frontmatter,
    title,
    titleKey: title.toLowerCase(),
    bodyMarkdown,
    typeName,
    isTypeDoc: typeName === "Type",
  };
}
