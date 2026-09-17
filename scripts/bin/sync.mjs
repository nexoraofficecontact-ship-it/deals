// Synchronisation : Google Sheet -> Validation -> Base locale.
// Sans Google Sheets configure, importe les fixtures de dev (NEEDS_REVIEW).
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { getConfig } from '../lib/config.mjs';
import {
  getDb, closeDb, upsertProduct, clearValidationErrors, addValidationError,
  setArticleFields, upsertCategoriesFromProducts
} from '../lib/db.mjs';
import { normalizeRecord, validateProduct, SEVERITY } from '../lib/validate.mjs';
import { slugify } from '../lib/util.mjs';

const cfg = getConfig();
getDb();
clearValidationErrors();

if (cfg.google.connected) {
  const { readAllRows, writeCell } = await import('../lib/sheets.mjs');
  const rawRows = await readAllRows(cfg.google.serviceAccount, cfg.google.sheetId, cfg.google.tab);
  console.log(`Source: Google Sheet (${cfg.google.sheetId}) — ${rawRows.length} lignes lues.`);

  let inserted = 0;
  for (let i = 0; i < rawRows.length; i += 1) {
    const raw = rawRows[i];
    const rowIndex = i + 1; // ligne 1 = en-têtes
    if (!raw.product_name && !raw.ASIN) continue;
    const product = normalizeRecord(raw);
    if (!product.product_id) product.product_id = slugify(product.product_name, `prod-${rowIndex}`);
    product.row_index = rowIndex;

    // Statut de vérification : VERIFIED exige last_checked récent (<= 90 jours) sinon NEEDS_REVIEW
    enforceFreshness(product);

    const { errors, blocked } = validateProduct(product);
    for (const e of errors) addValidationError(product.product_id, e.rule, e.severity, e.message);
    if (product.verification_status === 'VERIFIED' && blocked) {
      // Ne jamais publier : on force NEEDS_REVIEW et on signale dans le Sheet.
      product.verification_status = 'NEEDS_REVIEW';
      setArticleFields(product.product_id, { verification_status: 'NEEDS_REVIEW' });
      if (typeof writeCell === 'function' && product.row_index) {
        await writeCell(cfg.google.serviceAccount, cfg.google.sheetId, 'verification_status', product.row_index, 'NEEDS_REVIEW');
      }
    }
    upsertProduct(product);
    if (errors.some((e) => e.severity === SEVERITY.ERROR || e.severity === SEVERITY.CRITICAL)) {
      setArticleFields(product.product_id, { article_status: 'BLOCKED' });
    }
    inserted += 1;
  }

  upsertCategoriesFromProducts();
  console.log(`${inserted} produits synchronisés et validés.`);
} else {
  const demoFile = resolve(cfg.paths.seedDir, 'demo-products.json');
  if (!existsSync(demoFile)) {
    console.error('Ni Google Sheet configuré, ni fichiers de dev dans seed/. Rien à synchroniser.');
    process.exit(1);
  }
  const demos = JSON.parse(readFileSync(demoFile, 'utf8'));
  console.log(`Source: Aucun Google Sheet — fixtures de démonstration (${demos.length}).`);

  for (const [i, raw] of demos.entries()) {
    const product = normalizeRecord(raw);
    if (!product.product_id) product.product_id = slugify(product.product_name, `prod-${i + 1}`);
    product.row_index = i + 1;
    product.notes = `${product.notes || ''} DÉMO — données fictives, à remplacer par la vraie base.`.trim();
    product.verification_status = 'NEEDS_REVIEW';
    product.article_status = 'BLOCKED';
    product.data_status = 'DISABLED';

    const { errors } = validateProduct(product);
    for (const e of errors) addValidationError(product.product_id, e.rule, e.severity, e.message);
    upsertProduct(product);
  }
  upsertCategoriesFromProducts();
  console.log(`${demos.length} fixtures de dev importées (NEEDS_REVIEW / BLOCKED — jamais publiables).`);
}

function enforceFreshness(product) {
  if (product.verification_status === 'VERIFIED' && product.last_checked) {
    const checked = Date.parse(product.last_checked + 'T00:00:00Z');
    const days = Math.floor((Date.now() - checked) / 86400000);
    if (days > 90) {
      product.verification_status = 'NEEDS_REVIEW';
    }
  }
}

closeDb();