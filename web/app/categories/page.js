import Link from 'next/link';
import { allCategories, categoryMeta } from '../../lib/data.js';
import Breadcrumbs from '../../components/Breadcrumbs.js';
import EmptyState from '../../components/EmptyState.js';
import JsonLd from '../../components/JsonLd.js';
import { breadcrumbSchema } from '../../lib/schema.js';

export const metadata = {
  title: 'Catégories',
  description: 'Parcourez toutes les catégories de produits couvertes : guides, comparatifs et analyses.',
  alternates: { canonical: '/categories/' }
};

export default function CategoriesPage() {
  const categories = allCategories();
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Catégories', href: '/categories/' }
  ];
  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <h1>Catégories</h1>
      <p className="muted">
        Chaque catégorie regroupe des produits vérifiés, des comparatifs et des guides d’achat.
      </p>
      {categories.length ? (
        <div className="grid">
          {categories.map((c) => {
            const meta = categoryMeta(c.slug);
            return (
              <Link key={c.slug} className="tile" href={`/${c.slug}/`}>
                <h3 className="tile-title">{c.name}</h3>
                {meta?.tagline ? <p className="tile-tagline">{meta.tagline}</p> : null}
                <p className="tile-meta">
                  {c.productCount} produit{c.productCount > 1 ? 's' : ''} · {c.subcategories.length}{' '}
                  sous-catégorie{c.subcategories.length > 1 ? 's' : ''}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState title="Aucune catégorie publiée">
          Les catégories seront publiées dès qu’au moins un produit vérifié sera disponible.
        </EmptyState>
      )}
      <JsonLd schema={[breadcrumbSchema(crumbs)]} />
    </div>
  );
}
