#!/usr/bin/env node
import { Command } from "commander";
import prompts from "prompts";
import { buildSite } from "./site.js";
import type { BannerMessage } from "./types.js";

const program = new Command();

/** No --banner-type flag exists yet (out of scope for now) - every CLI/prompt-configured
 * banner uses this type until that changes. */
const DEFAULT_BANNER_TYPE: BannerMessage["type"] = "danger";

program
  .name("tolaria-to-website")
  .description("Builds an offline-capable static website from a Tolaria vault.");

program
  .command("build")
  .description("Render the vault to a static site")
  // `build` takes no positional arguments - anything left over is almost always a stray
  // "--" (pnpm, unlike npm, forwards a literal "--" separator through to the script
  // instead of stripping it; commander then treats it as "end of options" and would
  // otherwise silently discard every flag after it rather than parsing them, quietly
  // falling back to defaults). Erroring here surfaces that immediately instead.
  .allowExcessArguments(false)
  .option("-v, --vault <path>", "path to the vault directory")
  .option("-o, --out <path>", "output directory for the built site")
  .option("-i, --ignore-file <path>", "path to a .gitignore-style publish-exclude file")
  .option("--home <note>", "note (slug/filename/title) to use as the site's home page")
  .option("--banner", "show a dismissible announcement banner on the home page")
  .option("--no-banner", "do not show the announcement banner")
  .option("--banner-text <text>", "text to display in the home page announcement banner")
  .action(
    async (options: {
      vault?: string;
      out?: string;
      ignoreFile?: string;
      home?: string;
      banner?: boolean;
      bannerText?: string;
    }) => {
      const resolved = await resolveOptionsInteractively(options);
      await buildSite({
        vaultDir: resolved.vault,
        outDir: resolved.out,
        ignoreFile: options.ignoreFile,
        homeNote: resolved.home,
        banners: resolved.banners,
      });
    }
  );

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
  banner?: boolean;
  bannerText?: string;
}): Promise<{ vault: string; out: string; home?: string; banners?: BannerMessage[] }> {
  const interactive = Boolean(process.stdin.isTTY && process.stdout.isTTY);

  if (!interactive) {
    return {
      vault: options.vault ?? "vault",
      out: options.out ?? "_site",
      home: options.home,
      banners: bannersFrom(options.banner, options.bannerText),
    };
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
  if (options.banner === undefined) {
    questions.push({
      type: "confirm",
      name: "banner",
      message: "Notification banner?",
      initial: false,
    });
  }
  if (options.bannerText === undefined) {
    questions.push({
      // Only ask for the text if the banner was (or is being) enabled - `prompts` skips
      // a question entirely when its `type` function returns null.
      type: (_prev, values) => ((options.banner ?? values.banner) ? "text" : null),
      name: "bannerText",
      message: "Banner text",
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
    banners: bannersFrom(
      options.banner ?? (typeof answers.banner === "boolean" ? answers.banner : undefined),
      options.bannerText ?? (answers.bannerText ? String(answers.bannerText) : undefined)
    ),
  };
}

/** Presence-implies-enabled: "enabled with empty text" and "disabled" render identically
 * (nothing), so this is the single point that collapses both into one optional array -
 * everything downstream just checks `banners?.length`, never a separate enabled flag. */
function bannersFrom(enabled: boolean | undefined, text: string | undefined): BannerMessage[] | undefined {
  const bannerEnabled = enabled ?? text !== undefined;
  const bannerText = (text ?? "").trim();
  return bannerEnabled && bannerText ? [{ type: DEFAULT_BANNER_TYPE, text: bannerText }] : undefined;
}
