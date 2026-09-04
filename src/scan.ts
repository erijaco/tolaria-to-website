import fs from "node:fs";
import path from "node:path";

const SKIP_DIR_NAMES = new Set([".git", "node_modules", ".obsidian", ".tolaria"]);

export interface ScanResult {
  noteAbsPaths: string[];
  attachmentAbsPaths: string[];
}

/** Recursively walks the vault, splitting files into Markdown notes and everything else. */
export function scanVault(vaultDir: string): ScanResult {
  const noteAbsPaths: string[] = [];
  const attachmentAbsPaths: string[] = [];

  const walk = (dir: string) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) continue;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (SKIP_DIR_NAMES.has(entry.name)) continue;
        walk(abs);
      } else if (entry.isFile()) {
        if (entry.name.toLowerCase().endsWith(".md")) {
          noteAbsPaths.push(abs);
        } else {
          attachmentAbsPaths.push(abs);
        }
      }
    }
  };

  walk(vaultDir);
  return { noteAbsPaths, attachmentAbsPaths };
}
