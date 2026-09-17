import Link from 'next/link';
import { getSite, allCategories, productContents, comparisonContents, allProducts } from '../lib/data.js';
import ProductCard from '../components/ProductCard.js';
import EmptyState from '../components/EmptyState.js';

export const metadata = {
  alternates: { canonical: '/' },
  description:
    'Guides d’achat, comparatifs et analyses de produits au Canada. Informations vérifiées, comparaisons claires, divulgation d’affiliation transparente.'
};

export default function HomePage() {
  const site = getSite();
  const categories = allCategories();
  const products = productContents();
  const comparisons = comparisonContents();
  const hasContent = products.length > 0 || comparisons.length > 0;

  return (
    <div className="container">
      <section className="hero">
        <h1>{site.name} — choisir sans se tromper</h1>
        <p>
          Nous réunissons des guides d’achat, des comparatifs structurés et des analyses de produits
          disponibles au Canada. Chaque fiche s’appuie sur des données vérifiées, et toute information
          incertaine est signalée clairement.
        </p>
        <p className="small muted">
          Nous ne promettons pas de « meilleur produit » absolu : nous vous donnons des repères fiables pour
          décider selon votre usage et votre budget.
        </p>
      </section>

      <section>
        <h2>Explorer par catégorie</h2>
        {categories.length ? (
          <div className="grid">
            {categories.map((c) => (
              <Link key={c.slug} className="tile" href={`/${c.slug}/`}>
                <h3>{c.name}</h3>
                <p className="muted small">
                  {c.productCount} produit{c.productCount > 1 ? 's' : ''} · {c.contentCount} contenu
                  {c.contentCount > 1 ? 's' : ''}
                </p>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState
            title="Catégories en préparation"
            cta={{ href: '/a-propos/', label: 'Découvrir notre méthode' }}
          >
            Les catégories apparaîtront dès que des produits vérifiés seront publiés dans notre base.
          </EmptyState>
        )}
      </section>

      {comparisons.length ? (
        <section>
          <h2>Comparatifs récents</h2>
          <ul className="list-links">
            {comparisons.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/comparatifs/${c.slug}/`}>{c.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {products.length ? (
        <section>
          <h2>Analyses de produits</h2>
          <div className="grid">
            {products.slice(0, 6).map((c) => {
              const product = allProducts().find((p) => p.product_id === c.slug);
              if (!product) return null;
              return <ProductCard key={product.product_id} product={product} />;
            })}
          </div>
        </section>
      ) : null}

      {!hasContent ? (
        <section>
          <EmptyState title="Premiers contenus vérifiés à venir">
            Notre pipeline publie uniquement des produits enregistrés et vérifiés dans la base centrale.
            Dès que des produits vérifiés seront disponibles, ils apparaîtront ici automatiquement.
          </EmptyState>
        </section>
      ) : null}

      <section>
        <h2>Comment nous travaillons</h2>
        <div className="grid">
          <div className="tile">
            <h3>1. Données vérifiées</h3>
            <p className="muted small">
              Rien n’est publié sans avoir été enregistré et vérifié. Nous n’inventons ni prix, ni
              caractéristique, ni avis.
            </p>
          </div>
          <div className="tile">
            <h3>2. Analyses honnêtes</h3>
            <p className="muted small">
              Nous présentons les points forts, les limites et les cas d’usage, en indiquant ce qui reste à
              vérifier.
            </p>
          </div>
          <div className="tile">
            <h3>3. Transparence</h3>
            <p className="muted small">
              Certains liens sont affiliés. Cela ne change rien au prix pour vous et n’influence pas nos
              évaluations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
