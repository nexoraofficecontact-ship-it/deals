// =====================================================================
// SITEMAP (§19) — genere depuis les contenus publies dans la base.
// =====================================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { listContents } from './db.mjs';
import { getConfig } from './config.mjs';

function xmlEscape(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function generateSitemap({ outDir } = {}) {
  const { site, paths } = getConfig();
  const published = listContents({ status: 'PUBLISHED' });
  const baseUrl = (site.url || 'https://localhost').replace(/\/+$/, '');
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${baseUrl}/`, changefreq: 'daily', priority: 1.0 },
    { loc: `${baseUrl}/categories/`, changefreq: 'daily', priority: 0.8 },
    { loc: `${baseUrl}/guides/`, changefreq: 'daily', priority: 0.7 },
    ...published.map((c) => ({
      loc: `${baseUrl}/${c.slug}/`,
      changefreq: 'weekly',
      priority: c.kind === 'product' ? 0.6 : 0.7,
      lastmod: (c.published_at || new Date().toISOString()).slice(0, 10)
    }))
  ];

  const doc = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${xmlEscape(u.loc)}</loc>
    <lastmod>${u.lastmod || today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  const target = outDir
    ? resolve(outDir, 'sitemap.xml')
    : resolve(paths.webDir, 'public', 'sitemap.xml');
  mkdirSync(resolve(target, '..'), { recursive: true });
  writeFileSync(target, doc, 'utf8');
  return { target, count: urls.length };
}