import test from 'node:test';
import assert from 'node:assert/strict';
import { scoreProductPage } from '../lib/quality.mjs';
import { generateProductPage } from '../lib/content-gen.mjs';
import { attachInternalLinks } from '../lib/internal-links.mjs';
import { validateProduct } from '../lib/validate.mjs';
import { verifiedProduct } from './fixtures.mjs';

const SYNTHETIC_LINKS = [
  { anchor: 'Comparatif des walking pads', targetSlug: '/comparatifs/walking-pads/' },
  { anchor: 'Guide des tapis de marche', targetSlug: '/guides/tapis-de-marche/' },
  { anchor: 'Test Walking Pad Compact', targetSlug: '/test-prod-002/' },
  { anchor: 'Catégorie fitness', targetSlug: '/fitness/' }
];

function finalPage(product) {
  const content = generateProductPage(product);
  content.body_md = attachInternalLinks(content.body_md, SYNTHETIC_LINKS, content.slug);
  return content;
}

test('page produit complète atteint le seuil de 90/100 (liens internes inclus)', () => {
  const product = verifiedProduct();
  const content = finalPage(product);
  const validation = validateProduct(product);
  const score = scoreProductPage({ product, content, validation });
  assert.ok(score.total >= 90, `score ${score.total} devrait être >= 90. Détail: ${JSON.stringify(score.parts)}`);
});

test('la page complète obtient un meilleur score que la page pauvre', () => {
  const rich = verifiedProduct();
  const poor = verifiedProduct({
    product_type: '',
    key_features: '',
    ideal_for: '',
    cons: '',
    faq_topics: '',
    secondary_keywords: ''
  });
  const richScore = scoreProductPage({ product: rich, content: finalPage(rich), validation: validateProduct(rich) });
  const poorScore = scoreProductPage({ product: poor, content: finalPage(poor), validation: validateProduct(poor) });
  assert.ok(richScore.total > poorScore.total, `rich=${richScore.total} devrait surpasser poor=${poorScore.total}`);
});

test('le score n\'est jamais négatif ni > 100', () => {
  for (const product of [
    verifiedProduct(),
    verifiedProduct({ key_features: '', ideal_for: '', pros: '' })
  ]) {
    const content = finalPage(product);
    const validation = validateProduct(product);
    const score = scoreProductPage({ product, content, validation });
    assert.ok(score.total >= 0 && score.total <= 100);
  }
});