// Exporte la base vers des fichiers JSON statiques consumes par le site.
// Le site reste ainsi entierement statique (rapide, gratuit, SEO-friendly).
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { getDb, closeDb, listProducts, listContents, listCategories, listInternalLinks } from '../lib/db.mjs';
import { getConfig } from '../lib/config.mjs';

const cfg = getConfig();
getDb();

const outDir = resolve(cfg.paths.webDir, 'data');
mkdirSync(outDir, { recursive: true });

const products = listProducts().filter((p) => p.verification_status === 'VERIFIED');
const contents = listContents({ status: 'PUBLISHED' }).map((c) => ({
  slug: c.slug,
  kind: c.kind,
  title: c.title,
  excerpt: c.excerpt,
  body_md: c.body_md,
  keyword: c.keyword,
  qualityScore: c.quality_score,
  schemaType: c.schema_type,
  entities: c.entities ? c.entities.split(',').filter(Boolean) : [],
  publishedAt: c.published_at,
  updatedAt: c.updated_at,
  internalLinks: safeParse(c.internal_links_json)
}));

const categories = listCategories()
  .map((cat) => {
    const catProducts = products.filter((p) => p.category === cat.slug);
    const catContents = contents.filter((c) => (c.entities || []).some((e) => catProducts.some((p) => p.product_id === e)));
    return {
      slug: cat.slug,
      name: cat.name,
      description: cat.description || '',
      productCount: catProducts.length,
      contentCount: catContents.length,
      subcategories: [...new Set(catProducts.map((p) => p.subcategory).filter(Boolean))]
    };
  })
  // On n'expose jamais une catégorie vide (page mince / thin content).
  .filter((c) => c.productCount > 0);

const links = listInternalLinks().map((l) => ({ from: l.from_slug, to: l.to_slug, anchor: l.anchor }));

const payload = {
  generatedAt: new Date().toISOString(),
  site: { url: cfg.site.url, lang: cfg.site.lang },
  products,
  contents,
  categories,
  internalLinks: links
};

writeFileSync(resolve(outDir, 'site-data.json'), JSON.stringify(payload, null, 2), 'utf8');

console.log(`Export site -> ${outDir}`);
console.log(`  produits VERIFIED : ${products.length}`);
console.log(`  contenus PUBLISHED : ${contents.length}`);
console.log(`  catégories : ${categories.length}`);
closeDb();

function safeParse(s) {
  try {
    return JSON.parse(s || '[]');
  } catch {
    return [];
  }
}