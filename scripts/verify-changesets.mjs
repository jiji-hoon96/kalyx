#!/usr/bin/env node
// scripts/verify-changesets.mjs
//
// Pre-release guard against a specific changesets failure mode: a single
// changeset that bumps BOTH an `ignore`d package and a publishable one.
//
// Per the changesets docs, when a package listed in `.changeset/config.json`
// `ignore` is mentioned in a changeset that ALSO includes a non-ignored
// package, `changeset publish` FAILS ("If the package is mentioned in a
// changeset that also includes a package that is not ignored, publishing will
// fail."). In this repo the ignore list covers docs + the `@kalyx-example/*`
// demo apps, so a stray changeset touching, say, `@kalyx/react` and
// `@kalyx-example/datepicker-basic` together would block the whole release.
//
// This script parses every `.changeset/*.md` frontmatter, resolves each named
// package against the ignore globs, and fails early with a clear message if any
// changeset mixes the two — turning an opaque mid-publish failure into an
// actionable local/CI error. Runs in release.yml before the changesets action.
//
// Run locally: `node scripts/verify-changesets.mjs`

import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const changesetDir = resolve(repoRoot, ".changeset");

/** Minimal picomatch-style matcher for the `foo/*` and exact-name patterns
 *  changesets `ignore` supports. We only need `*` (any run of non-empty chars,
 *  including `/` — changesets uses picomatch defaults where `*` does not cross
 *  `/`, but package names use `/` as a scope separator and the practical
 *  patterns here are `@scope/*`, so we treat `*` greedily after the scope). */
export function globToRegExp(glob) {
  const escaped = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&");
  const pattern = "^" + escaped.replace(/\*/g, "[^/]+") + "$";
  return new RegExp(pattern);
}

function loadIgnorePatterns() {
  const configPath = resolve(changesetDir, "config.json");
  const config = JSON.parse(readFileSync(configPath, "utf8"));
  const ignore = Array.isArray(config.ignore) ? config.ignore : [];
  return ignore.map((g) => ({ glob: g, re: globToRegExp(g) }));
}

export function isIgnored(pkg, patterns) {
  return patterns.some(({ re }) => re.test(pkg));
}

/** Parse the `---`-delimited YAML frontmatter of a changeset into a list of
 *  `"pkg": bump` package names. Changeset frontmatter is a flat map of quoted
 *  package name → semver bump, so a line-based parse is sufficient and avoids a
 *  YAML dependency. */
export function parseChangesetPackages(contents) {
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return [];
  const body = match[1];
  const packages = [];
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    // e.g.  '@kalyx/react': minor   or   "@kalyx/react": patch
    const m = trimmed.match(/^['"]?([^'":]+)['"]?\s*:\s*(major|minor|patch)\s*$/);
    if (m) packages.push(m[1]);
  }
  return packages;
}

/** Pure core: given a list of `{ file, packages }` and ignore patterns, return
 *  the changesets that illegally mix an ignored package with a publishable one. */
export function findMixedChangesets(changesets, patterns) {
  const problems = [];
  for (const { file, packages } of changesets) {
    if (!packages || packages.length === 0) continue;
    const ignored = packages.filter((p) => isIgnored(p, patterns));
    const publishable = packages.filter((p) => !isIgnored(p, patterns));
    if (ignored.length > 0 && publishable.length > 0) {
      problems.push({ file, ignored, publishable });
    }
  }
  return problems;
}

function main() {
  if (!existsSync(changesetDir)) {
    console.log("No .changeset directory — nothing to verify.");
    return;
  }

  const patterns = loadIgnorePatterns();
  const files = readdirSync(changesetDir).filter(
    (f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md",
  );

  const changesets = files.map((file) => ({
    file,
    packages: parseChangesetPackages(readFileSync(resolve(changesetDir, file), "utf8")),
  }));

  const problems = findMixedChangesets(changesets, patterns);

  if (problems.length > 0) {
    console.error("\n❌ Changeset validation failed.\n");
    console.error(
      "A changeset must not mix an ignored package with a publishable one —\n" +
        "`changeset publish` would fail mid-release. Split these into separate\n" +
        "changesets (or drop the ignored package from the changeset):\n",
    );
    for (const { file, ignored, publishable } of problems) {
      console.error(`  .changeset/${file}`);
      console.error(`    ignored:     ${ignored.join(", ")}`);
      console.error(`    publishable: ${publishable.join(", ")}\n`);
    }
    process.exit(1);
  }

  console.log(
    `✅ Changeset validation passed (${files.length} changeset file(s), no ignored/publishable mix).`,
  );
}

// Only run the file-scanning entrypoint when invoked directly, so tests can
// import the pure helpers without side effects.
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
