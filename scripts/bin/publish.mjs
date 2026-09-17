// Publication : applique le pipeline complet aux contenus DRAFT/REVIEW.
// Refuse par défaut ; --force passe outre le seuil qualité (jamais les blocages DATA).
import { getDb, closeDb, listProducts, listContents, upsertContent, addInternalLink, setArticleFields } from '../lib/db.mjs';
import { validateProduct } from '../lib/validate.mjs';
import { publishProductPage, publishComparison } from '../lib/publish.mjs';
import { getConfig, envReport } from '../lib/config.mjs';
import { generateSitemap } from '../lib/sitemap.mjs';
import { suggestInternalLinks } from '../lib/internal-links.mjs';

const force = process.argv.includes('--force');
const cfg = getConfig();
getDb();

console.log('Env:', envReport());

const products = listProducts();
const byId = new Map(products.map((p) => [p.product_id, p]));
const published = [];
const drafts = [];

for (const content of listContents()) {
  if (content.kind === 'comparison') {
    const entities = content.entities ? content.entities.split(',').filter(Boolean) : [];
    const groupProducts = entities.map((id) => byId.get(id)).filter(Boolean);
    const result = publishComparison(content, groupProducts, { force });
    if (result.decision === 'PUBLISHED') {
      published.push(result.slug);
    } else {
      drafts.push(`${content.slug} : ${result.reasons.join(' | ')}`);
    }
    continue;
  }

  if (content.kind !== 'product') continue;

  // Étape DATA CHECK obligatoire à la publication (toujours)
  const entities = content.entities ? content.entities.split(',').filter(Boolean) : [];
  const product = entities.length ? byId.get(entities[0]) : null;
  if (!product) {
    drafts.push(`${content.slug} : produit introuvable`);
    continue;
  }
  const validation = validateProduct(product);
  if (validation.blocked) {
    drafts.push(`${content.slug} : bloqué (data check)`);
    setArticleFields(product.product_id, { article_status: 'BLOCKED' });
    continue;
  }

  // On republie le contenu fraîchement généré pour appliquer les checks complets
  const result = publishProductPage(product, { force });
  if (result.decision === 'PUBLISHED') {
    published.push(result.slug);
    setArticleFields(product.product_id, {
      article_status: 'PUBLISHED',
      article_url: `/${result.slug}/`
    });
  } else {
    drafts.push(`${result.slug} : ${result.reasons.join(' | ')}`);
    if (result.reasons.some((r) => r.startsWith('DATA') || r.startsWith('FACT'))) {
      setArticleFields(product.product_id, { article_status: 'BLOCKED' });
    }
  }
}

if (published.length) {
  generateSitemap();
}
console.log('\n— Publiés —');
console.log(published.length ? published.join('\n') : '(aucun)');
console.log('\n— Restés en draft/review —');
console.log(drafts.length ? drafts.join('\n') : '(aucun)');
closeDb();