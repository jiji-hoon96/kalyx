import { describe, expect, it } from 'vitest';
import { evaluate, MAX_BYTES, MAX_AGE_DAYS } from '../check-hero-freshness.mjs';

describe('check-hero-freshness', () => {
  it('passes for a recent, small file', () => {
    const result = evaluate({
      exists: true,
      sizeBytes: 100_000,
      mtimeMs: Date.now() - 5 * 86_400_000,
    });
    expect(result.ok).toBe(true);
  });

  it('fails when file is missing', () => {
    const result = evaluate({ exists: false, sizeBytes: 0, mtimeMs: 0 });
    expect(result.ok).toBe(false);
    expect(result.reasons).toContain('file does not exist');
  });

  it('fails when size exceeds 250 KB', () => {
    const result = evaluate({
      exists: true,
      sizeBytes: MAX_BYTES + 1,
      mtimeMs: Date.now(),
    });
    expect(result.ok).toBe(false);
    expect(result.reasons.some(r => r.includes('exceeds 250 KB'))).toBe(true);
  });

  it('warns (but does not fail) when older than MAX_AGE_DAYS', () => {
    const result = evaluate({
      exists: true,
      sizeBytes: 100_000,
      mtimeMs: Date.now() - (MAX_AGE_DAYS + 1) * 86_400_000,
    });
    expect(result.ok).toBe(true);
    expect(result.warnings.some(w => w.includes('older than'))).toBe(true);
  });

  it('reports MAX_BYTES = 250 * 1024', () => {
    expect(MAX_BYTES).toBe(250 * 1024);
  });

  it('checks the og-hero.png alongside the WebPs', async () => {
    const mod = await import('../check-hero-freshness.mjs');
    expect(mod.FILES).toContain('apps/docs-site/static/img/og-hero.png');
  });
});
