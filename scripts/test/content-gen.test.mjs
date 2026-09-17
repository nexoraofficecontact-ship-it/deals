import test from 'node:test';
import assert from 'node:assert/strict';
import { generateProductPage, generateComparison } from '../lib/content-gen.mjs';
import { verifiedProduct } from './fixtures.mjs';

test('la page produit est originale et ne recopie pas Amazon', () => {
  const content = generateProductPage(verifiedProduct());
  assert.ok(!content.body_md.includes('nous avons testé'));
  assert.ok(!content.body_md.includes('noté à la main'));
  assert.match(content.body_md, /Voir sur Amazon\.ca/);
  assert.match(content.body_md, /## Verdict éditorial/);
  assert.match(content.body_md, /Information à vérifier|prix observé/);
});

test('donnée manquante -> "Information à vérifier", jamais inventée', () => {
  const content = generateProductPage(verifiedProduct({ price_cad: null, specifications: '' }));
  assert.match(content.body_md, /Information à vérifier/);
  assert.doesNotMatch(content.body_md, /\$[0-9]/);
});

test('le comparatif produit un tableau et des liens internes', () => {
  const a = verifiedProduct({ product_id: 'p1', asin: 'B0TEST0002', product_name: 'Modèle A' });
  const b = verifiedProduct({ product_id: 'p2', asin: 'B0TEST0003', product_name: 'Modèle B' });
  const comparison = generateComparison([a, b], { title: 'Comparatif des walking pads' });
  assert.match(comparison.body_md, /\| Produit \| Prix observé \|/);
  assert.match(comparison.body_md, /p2\//);
  assert.equal(comparison.kind, 'comparison');
});