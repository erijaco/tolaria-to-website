import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { NoteFile } from "./types.js";

const H1_RE = /^#\s+(.+?)\s*$/m;

/** Parses one Markdown file into a NoteFile: frontmatter, title (first H1, else filename), and body. */
export function parseNote(vaultDir: string, absPath: string): NoteFile {
  const raw = fs.readFileSync(absPath, "utf8");
  const parsed = matter(raw);
  const relPath = path.relative(vaultDir, absPath).split(path.sep).join("/");
  const slug = relPath.replace(/\.md$/i, "");
  const filenameKey = path.basename(slug).toLowerCase();

  const h1Match = H1_RE.exec(parsed.content);
  const title = h1Match ? h1Match[1].trim() : path.basename(slug);
  const bodyMarkdown = h1Match
    ? parsed.content.slice(0, h1Match.index) + parsed.content.slice(h1Match.index + h1Match[0].length)
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
