// Génération de contenu depuis les produits en base.
// Produit des DRAFT (jamais de publication directe). Calcule le score
// qualité et les liens internes suggérés.
import { getDb, closeDb, listProducts, upsertContent, addInternalLink, listContents } from '../lib/db.mjs';
import { generateProductPage, generateComparison } from '../lib/content-gen.mjs';
import { scoreProductPage } from '../lib/quality.mjs';
import { validateProduct } from '../lib/validate.mjs';
import { suggestInternalLinks } from '../lib/internal-links.mjs';

getDb();

const products = listProducts();
const existing = listContents();
const report = [];

// --- Draft de la comparaison par groupe (si >= 2 produits VERIFIED dans le groupe) ---
const groups = new Map();
for (const p of products) {
  if (p.verification_status !== 'VERIFIED') continue;
  const key = p.comparison_group || p.keyword_cluster || p.category;
  if (!groups.has(key)) groups.set(key, []);
  groups.get(key).push(p);
}
for (const [group, groupProducts] of groups) {
  if (groupProducts.length < 2) continue;
  const comparison = generateComparison(groupProducts, {});
  const existingCmp = existing.find((c) => c.kind === 'comparison' && c.slug === comparison.slug);
  upsertContent({
    slug: comparison.slug,
    kind: 'comparison',
    title: comparison.title,
    excerpt: comparison.excerpt,
    body_md: comparison.body_md,
    keyword: comparison.keyword,
    quality_score: existingCmp?.quality_score ?? null,
    status: existingCmp?.status || 'DRAFT',
    schema_type: 'ItemList',
    entities: comparison.entities
  });
  report.push(`[comparison] ${comparison.slug} (${comparison.entities.length} produits) → DRAFT`);
}

// --- Drafts de pages produits ---
let generated = 0;
let passed = 0;
for (const product of products) {
  if (product.verification_status !== 'VERIFIED') {
    report.push(`[skip] ${product.product_id} : non VERIFIED`);
    continue;
  }
  const validation = validateProduct(product);
  if (validation.blocked) {
    report.push(`[skip] ${product.product_id} : validation bloquée`);
    continue;
  }
  const content = generateProductPage(product);
  const score = scoreProductPage({ product, content, validation });

  const suggested = suggestInternalLinks(content.body_md, content.slug);
  addInternalLink(content.slug, content.entities[0], content.title, 'product');

  const prior = existing.find((c) => c.slug === content.slug);
  upsertContent({
    slug: content.slug,
    kind: 'product',
    title: content.title,
    excerpt: content.excerpt,
    body_md: content.body_md,
    keyword: content.keyword,
    quality_score: score.total,
    status: (prior && prior.status === 'PUBLISHED') ? 'REVIEW' : 'DRAFT',
    schema_type: 'Product',
    entities: content.entities,
    internalLinks: suggested
  });
  generated += 1;
  if (score.pass) passed += 1;
  report.push(`[product] ${content.slug} → ${score.total}/100 (${score.pass ? 'SEUIL OK' : 'SEUIL NON ATTEINT'}) liens suggérés: ${suggested.length}`);
}

console.log(report.join('\n'));
console.log(`\n${generated} pages produits générées (${passed} au-dessus du seuil), comparaisons incluses.`);
closeDb();