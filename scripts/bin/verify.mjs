// Vérification de l'état des données en base.
import { getDb, closeDb, listProducts, productCounts, listValidationErrors } from '../lib/db.mjs';
import { validateProduct, SEVERITY, miniReport } from '../lib/validate.mjs';

getDb();
const counts = productCounts();
console.log(JSON.stringify(counts, null, 2));

const products = listProducts();
for (const p of products) {
  const { errors, blocked } = validateProduct(p);
  const criticals = errors.filter((e) => e.severity === SEVERITY.CRITICAL);
  const others = errors.filter((e) => e.severity !== SEVERITY.CRITICAL);
  console.log(`\n[${p.product_id}] ${p.product_name}`);
  console.log(`  verification=${p.verification_status} article=${p.article_status} blocked=${blocked}`);
  for (const e of criticals) console.log(`  ⛔ ${e.message}`);
  for (const e of others) console.log(`  ⚠️  ${e.message}`);
}

const errs = listValidationErrors();
const bySeverity = errs.reduce((acc, e) => ((acc[e.severity] = (acc[e.severity] || 0) + 1), acc), {});
console.log('\nErreurs de validation par sévérité:', bySeverity);

closeDb();