import { describe, expect, it } from 'vitest';
import {
  globToRegExp,
  isIgnored,
  parseChangesetPackages,
  findMixedChangesets,
} from '../verify-changesets.mjs';

const patterns = ['@kalyx/docs', 'docs-site', '@kalyx-example/*'].map((glob) => ({
  glob,
  re: globToRegExp(glob),
}));

describe('globToRegExp', () => {
  it('matches an exact package name', () => {
    expect(globToRegExp('@kalyx/docs').test('@kalyx/docs')).toBe(true);
    expect(globToRegExp('@kalyx/docs').test('@kalyx/core')).toBe(false);
  });

  it('matches a scoped wildcard but not across the scope slash', () => {
    const re = globToRegExp('@kalyx-example/*');
    expect(re.test('@kalyx-example/datepicker-basic')).toBe(true);
    expect(re.test('@kalyx-example/timepicker-12h')).toBe(true);
    // The wildcard must not swallow the scope separator into a different scope.
    expect(re.test('@kalyx/react')).toBe(false);
  });
});

describe('isIgnored', () => {
  it('flags docs + example packages, not publishable ones', () => {
    expect(isIgnored('@kalyx/docs', patterns)).toBe(true);
    expect(isIgnored('docs-site', patterns)).toBe(true);
    expect(isIgnored('@kalyx-example/rangepicker-presets', patterns)).toBe(true);
    expect(isIgnored('@kalyx/react', patterns)).toBe(false);
    expect(isIgnored('@kalyx/adapter-luxon', patterns)).toBe(false);
  });
});

describe('parseChangesetPackages', () => {
  it('parses single-quoted frontmatter entries', () => {
    const md = `---\n'@kalyx/react': minor\n---\n\nSome summary.`;
    expect(parseChangesetPackages(md)).toEqual(['@kalyx/react']);
  });

  it('parses multiple packages and mixed quoting', () => {
    const md = `---\n"@kalyx/core": patch\n'@kalyx/react': patch\n---\nbody`;
    expect(parseChangesetPackages(md)).toEqual(['@kalyx/core', '@kalyx/react']);
  });

  it('returns empty for a changeset with no frontmatter', () => {
    expect(parseChangesetPackages('just a body, no frontmatter')).toEqual([]);
  });
});

describe('findMixedChangesets', () => {
  it('passes when only publishable packages are bumped', () => {
    const problems = findMixedChangesets(
      [{ file: 'a.md', packages: ['@kalyx/react', '@kalyx/core'] }],
      patterns,
    );
    expect(problems).toEqual([]);
  });

  it('passes when only ignored packages are bumped', () => {
    const problems = findMixedChangesets(
      [{ file: 'a.md', packages: ['@kalyx-example/datepicker-basic'] }],
      patterns,
    );
    expect(problems).toEqual([]);
  });

  it('flags a changeset mixing ignored + publishable', () => {
    const problems = findMixedChangesets(
      [{ file: 'bad.md', packages: ['@kalyx/react', '@kalyx-example/datepicker-basic'] }],
      patterns,
    );
    expect(problems).toHaveLength(1);
    expect(problems[0].file).toBe('bad.md');
    expect(problems[0].ignored).toEqual(['@kalyx-example/datepicker-basic']);
    expect(problems[0].publishable).toEqual(['@kalyx/react']);
  });

  it('ignores empty changesets', () => {
    expect(findMixedChangesets([{ file: 'empty.md', packages: [] }], patterns)).toEqual([]);
  });
});
