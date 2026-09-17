// Initialise la base de données locale + règle les catégories.
import { getDb, closeDb, upsertCategoriesFromProducts, productCounts } from '../lib/db.mjs';
import { envReport } from '../lib/config.mjs';

getDb();
upsertCategoriesFromProducts();
console.log('Base de données initialisée.');
console.log('Produits:', productCounts());
console.log('Env:', envReport());
closeDb();