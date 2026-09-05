/**
 * Fails fast if a lifecycle install was triggered by something other than pnpm. Run as
 * this project's "preinstall" script, which npm/yarn/pnpm all honor the same way
 * regardless of which one triggered it - so this always gets a chance to run.
 *
 * This matters for supply-chain hygiene, not just consistency: npm and yarn resolve
 * transitive dependency trees differently than pnpm and don't respect
 * pnpm-workspace.yaml's minimumReleaseAge/blockExoticSubdeps/allowBuilds settings, so an
 * `npm install` here could silently pull in a different, unvetted dependency tree and
 * run install scripts that pnpm would otherwise have blocked.
 */
const userAgent = process.env.npm_config_user_agent ?? "";

if (!userAgent.startsWith("pnpm/")) {
  console.error(
    "\nThis project only supports pnpm for installs (see pnpm-workspace.yaml for " +
      "supply-chain settings that npm/yarn won't apply).\n" +
      "Run: pnpm install   (enable it first with: corepack enable)\n"
  );
  process.exit(1);
}
