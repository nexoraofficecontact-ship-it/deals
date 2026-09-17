import { notFound } from 'next/navigation';
import {
  allProducts,
  getCategory,
  productsBySubcategory
} from '../../../lib/data.js';
import ProductTable from '../../../components/ProductTable.js';
import ProductCard from '../../../components/ProductCard.js';
import Breadcrumbs from '../../../components/Breadcrumbs.js';
import JsonLd from '../../../components/JsonLd.js';
import EmptyState from '../../../components/EmptyState.js';
import { breadcrumbSchema, itemListSchema } from '../../../lib/schema.js';

export const dynamicParams = false;

export function generateStaticParams() {
  const pairs = new Map();
  for (const p of allProducts()) {
    if (!p.category || !p.subcategory) continue;
    pairs.set(`${p.category}/${p.subcategory}`, { slug: p.category, subslug: p.subcategory });
  }
  return [...pairs.values()];
}

export async function generateMetadata({ params }) {
  const { slug, subslug } = await params;
  const category = getCategory(slug);
  const label = subslug.replaceAll('-', ' ');
  return {
    title: `${label}${category ? ` — ${category.name}` : ''}`,
    description: `Comparatif et guide d’achat pour ${label}. Données vérifiées, prix observés et caractéristiques.`,
    alternates: { canonical: `/${slug}/${subslug}/` }
  };
}

export default async function SubcategoryPage({ params }) {
  const { slug, subslug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();
  const products = productsBySubcategory(slug, subslug);
  const label = subslug.replaceAll('-', ' ');
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Catégories', href: '/categories/' },
    { name: category.name, href: `/${slug}/` },
    { name: label, href: `/${slug}/${subslug}/` }
  ];

  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <h1>{label.charAt(0).toUpperCase() + label.slice(1)}</h1>
      <p className="muted">
        Sélection de produits vérifiés pour {label}. Les prix sont ceux observés lors de la dernière
        vérification.
      </p>
      {products.length ? (
        <>
          <section>
            <ProductTable products={products} />
          </section>
          <section>
            <div className="grid">
              {products.map((p) => (
                <ProductCard key={p.product_id} product={p} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <EmptyState title="Aucun produit vérifié pour cette sous-catégorie" />
      )}
      <JsonLd
        schema={[
          breadcrumbSchema(crumbs),
          products.length
            ? itemListSchema({ name: label, products, urlFor: (p) => `/${p.product_id}/` })
            : null
        ]}
      />
    </div>
  );
}
