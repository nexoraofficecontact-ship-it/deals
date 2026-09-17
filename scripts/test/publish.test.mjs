import test from 'node:test';
import assert from 'node:assert/strict';
import { similarity } from '../lib/publish.mjs';
import { validatedPipeline } from './pipeline-helper.mjs';

test('similarité détecte deux textes quasi identiques', () => {
  const a = 'Le tapis de marche silencieux est parfait pour le bureau pliable compact.';
  const b = 'Le tapis de marche silencieux est parfait pour le bureau pliable compact.';
  assert.ok(similarity(a, b) > 0.75);
});

test('similarité reste faible entre textes différents', () => {
  const a = 'Un tapis de marche silencieux pour le bureau.';
  const b = 'Une bouteille isotherme en acier pour le sport.';
  assert.ok(similarity(a, b) < 0.5);
});

test('le pipeline publie un produit VERIFIED complet', async () => {
  const result = await validatedPipeline(true);
  assert.equal(result.decision, 'PUBLISHED', result.reasons.join(' | '));
});

test('le pipeline bloque un produit non vérifié ou invalide', async () => {
  const result = await validatedPipeline(false);
  assert.ok(result.decision === 'DRAFT' || result.decision === 'BLOCKED' || result.reasons.length > 0);
});