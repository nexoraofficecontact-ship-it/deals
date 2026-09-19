import Link from 'next/link';
import { getSite, getProductById, allCategories, productContents, comparisonContents, categoryMeta, STATIC_GUIDES } from '../lib/data.js';
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
  const verifiedWithPrice = products.filter((c) => {
    const product = getProductById(c.slug);
    return product && product.price_cad !== null;
  }).length;

  return (
    <div className="container">
      <section className="hero-home" aria-label="Présentation">
        <h1>Acheter mieux au Canada, sans se tromper.</h1>
        <p className="lead">
          Des guides d’achat, des comparatifs structurés et des analyses de produits disponibles au Canada.
          Chaque fiche repose sur des données vérifiées ; toute information incertaine est clairement signalée.
        </p>
        <div className="hero-actions">
          <Link href="#offres" className="btn btn-primary">
            Voir les offres analysées
          </Link>
          <Link href="/comparatifs/" className="btn btn-secondary">
            Explorer les comparatifs
          </Link>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <b>{products.length}</b>
            <span>produit(s) analysés</span>
          </div>
          <div className="hero-stat">
            <b>{comparisons.length}</b>
            <span>comparatif(s)</span>
          </div>
          <div className="hero-stat">
            <b>100%</b>
            <span>données vérifiées, rien inventé</span>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Explorer par catégorie</h2>
          <Link className="more" href="/categories/">
            Toutes les catégories →
          </Link>
        </div>
        {categories.length ? (
          <div className="grid">
            {categories.map((c) => {
              const meta = categoryMeta(c.slug);
              return (
                <Link key={c.slug} className="tile" href={`/${c.slug}/`}>
                  <h3 className="tile-title">{c.name}</h3>
                  {meta?.tagline ? <p className="tile-tagline">{meta.tagline}</p> : null}
                  <p className="tile-meta">
                    {c.productCount} produit{c.productCount > 1 ? 's' : ''} · {c.contentCount} contenu
                    {c.contentCount > 1 ? 's' : ''}
                  </p>
                </Link>
              );
            })}
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

      {products.length ? (
        <section id="offres">
          <div className="section-head">
            <h2>Analyses de produits</h2>
            <Link className="more" href="/categories/">
              Tous les produits →
            </Link>
          </div>
          <div className="grid">
            {products.slice(0, 6).map((c) => {
              const product = c;
              return <ProductCard key={product.product_id} product={product} />;
            })}
          </div>
        </section>
      ) : null}

      {comparisons.length ? (
        <section>
          <div className="section-head">
            <h2>Comparatifs récents</h2>
            <Link className="more" href="/comparatifs/">
              Tous les comparatifs →
            </Link>
          </div>
          <ul className="list-links">
            {comparisons.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/comparatifs/${c.slug}/`}>{c.title}</Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2>Comment nous travaillons</h2>
        <div className="grid">
          <div className="value-prop">
            <h3>1. Données vérifiées</h3>
            <p>
              Rien n’est publié sans avoir été enregistré et vérifié. Nous n’inventons ni prix, ni
              caractéristique, ni avis : les données incertaines restent marquées « Information à vérifier ».
            </p>
          </div>
          <div className="value-prop">
            <h3>2. Analyses honnêtes</h3>
            <p>
              Nous présentons les points forts, les limites et les cas d’usage, en indiquant ce qui reste à
              confirmer.
            </p>
          </div>
          <div className="value-prop">
            <h3>3. Transparence totale</h3>
            <p>
              Certains liens sont affiliés : cela ne change rien au prix pour vous et n’influence jamais nos
              évaluations — voir la divulgation en bas de page.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="section-head">
          <h2>Guides d’achat</h2>
          <Link className="more" href="/guides/">
            Tous les guides →
          </Link>
        </div>
        <div className="grid">
          {STATIC_GUIDES.slice(0, 3).map((g) => (
            <Link key={g.slug} className="guide-card" href={`/guides/${g.slug}/`}>
              <h3>{g.title}</h3>
              <p>{g.excerpt}</p>
              <span className="guide-more">Lire le guide →</span>
            </Link>
          ))}
        </div>
      </section>

      {!hasContent ? (
        <section>
          <EmptyState title="Premiers contenus vérifiés à venir">
            Notre pipeline publie uniquement des produits enregistrés et vérifiés dans la base centrale.
            Dès que des produits vérifiés seront disponibles, ils apparaîtront ici automatiquement.
          </EmptyState>
        </section>
      ) : null}

      <p className="disclosure">
        <strong>Divulgation :</strong> {site.name} participe au Programme Partenaires d’Amazon.ca. Les liens
        vers Amazon.ca de ce site sont des liens affiliés ; nous pouvons percevoir une commission sur les
        achats éligibles, sans coût additionnel pour vous. Nous n’inventons aucune donnée : {verifiedWithPrice}{' '}
        de nos fiches affichent un prix observé vérifié, les autres le signalent explicitement.
      </p>
    </div>
  );
}