// Rapport d'état (équivalent interne du dashboard).
import { getDb, closeDb, productCounts, contentCounts, listContents, listProducts, orphanPages, listValidationErrors, listCategories } from '../lib/db.mjs';
import { envReport } from '../lib/config.mjs';

getDb();
console.log('=== ENVIRONNEMENT ===');
console.log(JSON.stringify(envReport(), null, 2));

console.log('\n=== PRODUITS ===');
console.log(JSON.stringify(productCounts(), null, 2));

console.log('\n=== CONTENU ===');
console.log(JSON.stringify(contentCounts(), null, 2));

console.log('\n=== CATÉGORIES ===');
for (const c of listCategories()) console.log(`  /${c.slug}/`);

console.log('\n=== ERREURS ===');
const errors = listValidationErrors();
const bySeverity = errors.reduce((acc, e) => ((acc[e.severity] = (acc[e.severity] || 0) + 1), acc), {});
console.log(JSON.stringify(bySeverity, null, 2));

const orphans = orphanPages();
console.log(`\n=== ORPHELINS (${orphans.length}) ===`);
for (const o of orphans) console.log(`  ${o.slug}`);

closeDb();