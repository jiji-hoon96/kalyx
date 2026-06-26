import fs from 'node:fs/promises';
import path from 'node:path';
import type {LoadContext, Plugin} from '@docusaurus/types';

/**
 * Emits LLM-friendly artifacts after the build:
 *   - `/<route>.md`  — the raw Markdown source of every English doc page
 *   - `/llms.txt`    — an index (per the llmstxt.org convention) linking to them
 *
 * Pure DX / agent affordance — no marketing surface. English docs only
 * (the canonical source); the `/ko` locale is a translation layer.
 */
export default function llmsTxtPlugin(context: LoadContext): Plugin {
  const {siteConfig} = context;
  const siteUrl = siteConfig.url + siteConfig.baseUrl.replace(/\/$/, '');
  const docsDir = path.join(context.siteDir, 'docs');

  return {
    name: 'kalyx-llms-txt',

    async postBuild({outDir, routesPaths}) {
      // Map of doc source files → their built route.
      const mdFiles: {route: string; abs: string}[] = [];

      async function walk(dir: string): Promise<void> {
        const entries = await fs.readdir(dir, {withFileTypes: true});
        for (const entry of entries) {
          const abs = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(abs);
          } else if (/\.mdx?$/.test(entry.name)) {
            const rel = path.relative(docsDir, abs).replace(/\.mdx?$/, '');
            // intro.md has slug `/intro`; everything else lives under /docs/.
            const slug = rel === 'intro' ? 'intro' : rel;
            const route = `/docs/${slug}`.replace(/\/intro$/, '/intro');
            mdFiles.push({route, abs});
          }
        }
      }
      await walk(docsDir);

      const indexLines: string[] = [
        `# ${siteConfig.title}`,
        '',
        `> ${siteConfig.tagline}`,
        '',
        'This file follows the llmstxt.org convention. Each link points to the raw Markdown source of a documentation page.',
        '',
        '## Docs',
        '',
      ];

      for (const {route, abs} of mdFiles.sort((a, b) => a.route.localeCompare(b.route))) {
        const raw = await fs.readFile(abs, 'utf8');
        // Strip the front-matter for the title; fall back to the first heading.
        const titleMatch =
          raw.match(/^title:\s*(.+)$/m) ?? raw.match(/^#\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim().replace(/^['"]|['"]$/g, '') : route;

        // Write the raw markdown copy alongside the HTML route.
        const mdOut = path.join(outDir, `${route}.md`.replace(/^\//, ''));
        await fs.mkdir(path.dirname(mdOut), {recursive: true});
        await fs.writeFile(mdOut, raw, 'utf8');

        indexLines.push(`- [${title}](${siteUrl}${route}.md)`);
      }

      indexLines.push('');
      await fs.writeFile(path.join(outDir, 'llms.txt'), indexLines.join('\n'), 'utf8');
    },
  };
}
