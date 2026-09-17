import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

async function comparisonPipeline({ verifySecond = true } = {}) {
  const tmpDir = mkdtempSync(join(tmpdir(), 'affiliate-cmp-test-'));
  process.env.DB_PATH = join(tmpDir, 'test.db');
  process.env.CONTENT_OUT = join(tmpDir, 'content');

  const { getDb, upsertProduct, closeDb } = await import('../lib/db.mjs');
  const { publishComparison } = await import('../lib/publish.mjs');
  const { generateComparison } = await import('../lib/content-gen.mjs');
  const { verifiedProduct } = await import('./fixtures.mjs');

  getDb();
  const a = verifiedProduct({
    product_id: 'cmp-prod-001',
    product_name: 'Comparatif Test A',
    asin: 'B0CMP00001',
    amazon_url: 'https://www.amazon.ca/dp/B0CMP00001',
    affiliate_url: 'https://www.amazon.ca/dp/B0CMP00001?tag=testtag-20'
  });
  const b = verifiedProduct({
    product_id: 'cmp-prod-002',
    product_name: 'Comparatif Test B',
    asin: 'B0CMP00002',
    amazon_url: 'https://www.amazon.ca/dp/B0CMP00002',
    affiliate_url: 'https://www.amazon.ca/dp/B0CMP00002?tag=testtag-20',
    verification_status: verifySecond ? 'VERIFIED' : 'NEEDS_REVIEW'
  });
  upsertProduct(a);
  upsertProduct(b);

  const content = generateComparison([a, b], {});
  try {
    const result = publishComparison(content, [a, b], { force: false });
    return result;
  } finally {
    closeDb();
    rmSync(tmpDir, { recursive: true, force: true });
  }
}

test('un comparatif de 2 produits VERIFIED atteint le seuil et est publié', async () => {
  const result = await comparisonPipeline({ verifySecond: true });
  assert.equal(result.decision, 'PUBLISHED', result.reasons.join(' | '));
  assert.ok(result.score >= 90, `score ${result.score} < 90`);
  assert.ok(result.slug.includes('comparatif') || result.slug.length > 0);
});

test('un comparatif contenant un produit non VERIFIED est refusé', async () => {
  const result = await comparisonPipeline({ verifySecond: false });
  assert.equal(result.decision, 'DRAFT');
  assert.ok(result.reasons.some((r) => r.startsWith('FACT')));
});
