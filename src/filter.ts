import fs from "node:fs";
import ignoreLib from "ignore";
import type { NoteFile } from "./types.js";

/**
 * Opt-out publish model: everything is published unless explicitly excluded via
 * frontmatter (`private: true`, `draft: true`, `publish: false`) or a
 * .gitignore-style pattern in the vault's ignore file.
 */
export function loadIgnoreMatcher(ignoreFilePath: string): {
  isIgnored: (relPath: string) => boolean;
} {
  const ig = ignoreLib();
  if (fs.existsSync(ignoreFilePath)) {
    ig.add(fs.readFileSync(ignoreFilePath, "utf8"));
  }
  return {
    isIgnored(relPath: string): boolean {
      return ig.ignores(relPath);
    },
  };
}

export function isNotePublishable(
  note: NoteFile,
  isPathIgnored: (relPath: string) => boolean
): boolean {
  if (isPathIgnored(note.relPath)) return false;
  const fm = note.frontmatter;
  if (fm.private === true) return false;
  if (fm.draft === true) return false;
  if (fm.publish === false) return false;
  return true;
}
