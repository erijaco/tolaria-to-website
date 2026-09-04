#!/usr/bin/env node
import { Command } from "commander";
import { buildSite } from "./site.js";

const program = new Command();

program
  .name("tolaria-to-website")
  .description("Builds an offline-capable static website from a Tolaria vault.");

program
  .command("build")
  .description("Render the vault to a static site")
  .option("-v, --vault <path>", "path to the vault directory", "vault")
  .option("-o, --out <path>", "output directory for the built site", "_site")
  .option("-i, --ignore-file <path>", "path to a .gitignore-style publish-exclude file")
  .action(async (options: { vault: string; out: string; ignoreFile?: string }) => {
    await buildSite({
      vaultDir: options.vault,
      outDir: options.out,
      ignoreFile: options.ignoreFile,
    });
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
