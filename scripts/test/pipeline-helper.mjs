// Helper : lance le pipeline publication avec une base temporaire isolée.
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export async function validatedPipeline(verified = true) {
  const tmpDir = mkdtempSync(join(tmpdir(), 'affiliate-test-'));
  process.env.DB_PATH = join(tmpDir, 'test.db');
  process.env.CONTENT_OUT = join(tmpDir, 'content');
  process.env.AUTO_PUBLISH = 'true';

  const { resetDb, closeDb, upsertProduct } = await import('../lib/db.mjs');
  resetDb();
  const { publishProductPage } = await import('../lib/publish.mjs');
  const { verifiedProduct } = await import('./fixtures.mjs');
  const product = verified ? verifiedProduct() : verifiedProduct({ asin: '', verification_status: 'NEEDS_REVIEW' });

  if (verified) {
    // Catalogue minimal : un 2e produit voisin rend le maillage interne possible.
    upsertProduct(
      verifiedProduct({
        product_id: 'test-prod-002',
        product_name: 'Test Walking Pad Compact',
        asin: 'B0TEST0009',
        amazon_url: 'https://www.amazon.ca/dp/B0TEST0009',
        affiliate_url: 'https://www.amazon.ca/dp/B0TEST0009?tag=testtag-20'
      })
    );
  }

  try {
    const result = await publishProductPage(product, { force: false });
    return result;
  } finally {
    closeDb();
    rmSync(tmpDir, { recursive: true, force: true });
  }
}