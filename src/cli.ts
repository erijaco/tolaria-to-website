#!/usr/bin/env node
import { Command } from "commander";
import prompts from "prompts";
import { buildSite } from "./site.js";

const program = new Command();

program
  .name("tolaria-to-website")
  .description("Builds an offline-capable static website from a Tolaria vault.");

program
  .command("build")
  .description("Render the vault to a static site")
  .option("-v, --vault <path>", "path to the vault directory")
  .option("-o, --out <path>", "output directory for the built site")
  .option("-i, --ignore-file <path>", "path to a .gitignore-style publish-exclude file")
  .option("--home <note>", "note (slug/filename/title) to use as the site's home page")
  .action(async (options: { vault?: string; out?: string; ignoreFile?: string; home?: string }) => {
    const resolved = await resolveOptionsInteractively(options);
    await buildSite({
      vaultDir: resolved.vault,
      outDir: resolved.out,
      ignoreFile: options.ignoreFile,
      homeNote: resolved.home,
    });
  });

program.parseAsync(process.argv).catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});

/**
 * Fills in any of vault/out/home not passed as flags. In an interactive terminal this
 * asks for them with `prompts`; otherwise (CI, piped input, etc.) it falls back to
 * plain defaults so non-interactive/CI use keeps working unchanged.
 */
async function resolveOptionsInteractively(options: {
  vault?: string;
  out?: string;
  home?: string;
}): Promise<{ vault: string; out: string; home?: string }> {
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);

  if (!interactive) {
    return { vault: options.vault ?? "vault", out: options.out ?? "_site", home: options.home };
  }

  const questions: prompts.PromptObject[] = [];
  if (!options.vault) {
    questions.push({
      type: "text",
      name: "vault",
      message: "Source vault folder",
      initial: "vault",
    });
  }
  if (!options.out) {
    questions.push({
      type: "text",
      name: "out",
      message: "Destination folder for the built site",
      initial: "_site",
    });
  }
  if (options.home === undefined) {
    questions.push({
      type: "text",
      name: "home",
      message: "Note to use as the home page (leave blank for an auto-generated index)",
      initial: "",
    });
  }

  const answers =
    questions.length > 0
      ? await prompts(questions, {
          onCancel: () => {
            console.error("Aborted.");
            process.exitCode = 1;
            process.exit(1);
          },
        })
      : {};

  return {
    vault: options.vault ?? answers.vault ?? "vault",
    out: options.out ?? answers.out ?? "_site",
    home: options.home ?? (answers.home ? String(answers.home) : undefined),
  };
}
