import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// StackBlitz imports a single examples/<id> folder and installs it with npm.
// npm rejects `workspace:` with EUNSUPPORTEDPROTOCOL, so every example must
// declare plain semver ranges. Inside the monorepo, `linkWorkspacePackages`
// in pnpm-workspace.yaml keeps those ranges linked to packages/*, which only
// works while the range still matches the local version.
const root = join(import.meta.dirname, '..', '..');
const examplesDir = join(root, 'examples');
const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'));

const localVersions = Object.fromEntries(
  readdirSync(join(root, 'packages')).map((dir) => {
    const pkg = readJson(join(root, 'packages', dir, 'package.json'));
    return [pkg.name, pkg.version];
  }),
);

const examples = readdirSync(examplesDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

describe.each(examples)('examples/%s', (id) => {
  const pkg = readJson(join(examplesDir, id, 'package.json'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };

  it('has no workspace: protocol (npm on StackBlitz cannot install it)', () => {
    const offenders = Object.entries(deps).filter(([, range]) => range.startsWith('workspace:'));
    expect(offenders).toEqual([]);
  });

  it('pins @kalyx/* to a caret range that the local package satisfies', () => {
    for (const [name, range] of Object.entries(deps)) {
      if (!(name in localVersions)) continue;
      expect(range).toMatch(/^\^\d+\.\d+\.\d+$/);
      const base = range.slice(1).split('.').map(Number);
      const local = localVersions[name].split('.').map(Number);
      const sameMajor = local[0] === base[0];
      const notOlder = local[1] > base[1] || (local[1] === base[1] && local[2] >= base[2]);
      expect({ name, range, local: localVersions[name], ok: sameMajor && notOlder }).toMatchObject({ ok: true });
    }
  });
});
