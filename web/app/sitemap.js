import { getSite, allContents, comparisonContents, allProducts, allCategories, STATIC_GUIDES } from '../lib/data.js';

export default function sitemap() {
  const site = getSite();
  const base = site.url.replace(/\/+$/, '');
  const entries = [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/categories/`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/comparatifs/`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/guides/`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/avis/`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${base}/faq/`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/a-propos/`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/divulgation-affiliation/`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/contact/`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/politique-de-confidentialite/`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/conditions-utilisation/`, changeFrequency: 'yearly', priority: 0.2 }
  ];

  const seen = new Set(entries.map((e) => e.url));

  for (const c of allCategories()) {
    const catUrl = `${base}/${c.slug}/`;
    if (!seen.has(catUrl)) {
      seen.add(catUrl);
      entries.push({ url: catUrl, changeFrequency: 'weekly', priority: 0.7 });
    }
    for (const sub of c.subcategories || []) {
      const subUrl = `${base}/${c.slug}/${sub}/`;
      if (seen.has(subUrl)) continue;
      seen.add(subUrl);
      entries.push({ url: subUrl, changeFrequency: 'weekly', priority: 0.6 });
    }
  }

  for (const g of STATIC_GUIDES) {
    const url = `${base}/guides/${g.slug}/`;
    if (seen.has(url)) continue;
    seen.add(url);
    entries.push({ url, changeFrequency: 'monthly', priority: 0.6, lastModified: '2026-09-19' });
  }

  for (const p of allProducts()) {
    const url = `${base}/${p.product_id}/`;
    if (seen.has(url)) continue;
    seen.add(url);
    entries.push({ url, changeFrequency: 'weekly', priority: 0.7 });
  }

  for (const c of comparisonContents()) {
    const url = `${base}/comparatifs/${c.slug}/`;
    if (seen.has(url)) continue;
    seen.add(url);
    entries.push({ url, changeFrequency: 'weekly', priority: 0.7, lastModified: c.updatedAt || undefined });
  }

  for (const c of allContents().filter((x) => x.kind === 'guide')) {
    const url = `${base}/guides/${c.slug}/`;
    if (seen.has(url)) continue;
    seen.add(url);
    entries.push({ url, changeFrequency: 'monthly', priority: 0.6, lastModified: c.updatedAt || undefined });
  }

  return entries;
}