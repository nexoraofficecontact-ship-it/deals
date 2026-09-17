import { productContents, allProducts } from '../../lib/data.js';
import ProductCard from '../../components/ProductCard.js';
import Breadcrumbs from '../../components/Breadcrumbs.js';
import EmptyState from '../../components/EmptyState.js';
import JsonLd from '../../components/JsonLd.js';
import { breadcrumbSchema, itemListSchema } from '../../lib/schema.js';

export const metadata = {
  title: 'Avis et analyses de produits',
  description: 'Analyses de produits basées sur des données vérifiées : caractéristiques, points forts et limites.',
  alternates: { canonical: '/avis/' }
};

export default function ReviewsPage() {
  const contents = productContents();
  const products = contents
    .map((c) => allProducts().find((p) => p.product_id === c.slug))
    .filter(Boolean);
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Avis', href: '/avis/' }
  ];
  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <h1>Avis et analyses de produits</h1>
      <p className="muted">
        Chaque analyse s’appuie sur les données vérifiées de notre base. Nous signalons explicitement ce qui
        reste à confirmer.
      </p>
      {products.length ? (
        <>
          <div className="grid">
            {products.map((p) => (
              <ProductCard key={p.product_id} product={p} meta="Lire l’analyse" />
            ))}
          </div>
          <JsonLd
            schema={[
              breadcrumbSchema(crumbs),
              itemListSchema({ name: 'Avis et analyses', products, urlFor: (p) => `/${p.product_id}/` })
            ]}
          />
        </>
      ) : (
        <>
          <EmptyState title="Aucune analyse publiée">
            Les analyses apparaîtront dès que des produits vérifiés seront disponibles.
          </EmptyState>
          <JsonLd schema={[breadcrumbSchema(crumbs)]} />
        </>
      )}
    </div>
  );
}
