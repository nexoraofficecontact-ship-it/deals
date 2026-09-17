import Link from 'next/link';
import ProductTable from './ProductTable.js';
import ProductCard from './ProductCard.js';
import Breadcrumbs from './Breadcrumbs.js';
import JsonLd from './JsonLd.js';
import EmptyState from './EmptyState.js';
import { breadcrumbSchema, itemListSchema } from '../lib/schema.js';

export default function CategoryView({ category, products, comparisons = [] }) {
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Catégories', href: '/categories/' },
    { name: category.name, href: `/${category.slug}/` }
  ];

  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <h1>{category.name}</h1>
      <p className="muted">
        Produits vérifiés, comparatifs et repères d’achat pour la catégorie {category.name.toLowerCase()}. Les
        prix indiqués sont ceux observés lors de la dernière vérification.
      </p>

      {category.subcategories.length ? (
        <section>
          <h2>Sous-catégories</h2>
          <ul className="list-links">
            {category.subcategories.map((sub) => (
              <li key={sub}>
                <Link href={`/${category.slug}/${sub}/`}>{sub.replaceAll('-', ' ')}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {products.length ? (
        <section>
          <h2>Comparer les produits</h2>
          <ProductTable products={products} />
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState title="Aucun produit vérifié dans cette catégorie">
          Les produits apparaîtront ici après vérification de leurs données.
        </EmptyState>
      )}

      {comparisons.length ? (
        <section>
          <h2>Comparatifs liés</h2>
          <ul className="list-links">
            {comparisons.map((c) => (
              <li key={c.slug}>
                <Link href={`/comparatifs/${c.slug}/`}>{c.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <JsonLd
        schema={[
          breadcrumbSchema(crumbs),
          products.length
            ? itemListSchema({
                name: category.name,
                products,
                urlFor: (p) => `/${p.product_id}/`
              })
            : null
        ]}
      />
    </div>
  );
}
