import test from 'node:test';
import assert from 'node:assert/strict';
import { validateProduct, normalizeRecord, SEVERITY } from '../lib/validate.mjs';
import { verifiedProduct, asSheetRaw } from './fixtures.mjs';

test('produit vérifié complet passe', () => {
  const { errors, blocked } = validateProduct(verifiedProduct());
  assert.equal(blocked, false);
});

test('normalise un enregistrement brut du Sheet', () => {
  const raw = asSheetRaw(verifiedProduct());
  const p = normalizeRecord(raw);
  assert.equal(p.asin, 'B0TEST0001');
  assert.equal(p.price_cad, 499.99);
  assert.equal(p.category, 'fitness');
});

test('ASIN manquant bloque', () => {
  const { blocked } = validateProduct(verifiedProduct({ asin: '' }));
  assert.equal(blocked, true);
});

test('ASIN au mauvais format bloque', () => {
  const { errors, blocked } = validateProduct(verifiedProduct({ asin: 'abc' }));
  assert.equal(blocked, true);
  assert.ok(errors.some((e) => e.rule === 'asin_format'));
});

test('URL affiliée absente bloque', () => {
  const { blocked } = validateProduct(verifiedProduct({ affiliate_url: '' }));
  assert.equal(blocked, true);
});

test('URL affiliée hors amazon.ca bloque', () => {
  const { blocked } = validateProduct(verifiedProduct({ affiliate_url: 'https://www.amazon.fr/dp/X?tag=t-20' }));
  assert.equal(blocked, true);
});

test('URL affiliée sans tag = erreur non bloquante', () => {
  const { errors, blocked } = validateProduct(
    verifiedProduct({ affiliate_url: 'https://www.amazon.ca/dp/B0TEST0001' })
  );
  assert.equal(blocked, false);
  assert.ok(errors.some((e) => e.rule === 'affiliate_tag' && e.severity === SEVERITY.ERROR));
});

test('produit non VERIFIED bloque', () => {
  const { blocked } = validateProduct(verifiedProduct({ verification_status: 'NEEDS_REVIEW' }));
  assert.equal(blocked, true);
});

test('produit marqué VERIFIED sans données = alerte', () => {
  const { errors } = validateProduct(verifiedProduct({ price_cad: null, key_features: '', product_type: '' }));
  assert.ok(errors.some((e) => e.rule === 'verified_without_data'));
});

test('note hors bornes signalée', () => {
  const { errors } = validateProduct(verifiedProduct({ rating: 6.2 }));
  assert.ok(errors.some((e) => e.rule === 'rating_range'));
});

test('données manquantes signalées en INFO (jamais inventer)', () => {
  const { errors } = validateProduct(verifiedProduct({ price_cad: null }));
  assert.ok(errors.some((e) => e.rule === 'price_cad_missing' && e.severity === SEVERITY.INFO));
});