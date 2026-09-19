import Link from 'next/link';
import { formatCad } from '../lib/data.js';
import { extractFaq } from '../lib/faq.js';
import Markdown from './Markdown.js';
import Breadcrumbs from './Breadcrumbs.js';
import AffiliateButton from './AffiliateButton.js';
import ProductCard from './ProductCard.js';
import JsonLd from './JsonLd.js';
import { productSchema, breadcrumbSchema, faqSchema, articleSchema } from '../lib/schema.js';

export default function ProductView({ product, content, related = [], comparisons = [] }) {
  const url = `/${product.product_id}/`;
  const category = product.category;
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Catégories', href: '/categories/' },
    ...(category ? [{ name: category, href: `/${category}/` }] : []),
    { name: product.product_name, href: url }
  ];
  const price = formatCad(product.price_cad);
  const faq = extractFaq(content.body_md);
  const hasPrice = price !== null;

  const facts = [
    { label: 'Prix observé', value: price || 'Information à vérifier', unverified: !hasPrice },
    {
      label: 'Note',
      value:
        product.rating !== null && product.rating !== undefined ? `${Number(product.rating).toFixed(1)}/5` : '—',
      unverified: product.rating === null || product.rating === undefined
    },
    {
      label: 'Avis',
      value:
        product.review_count !== null && product.review_count !== undefined ? String(product.review_count) : '—',
      unverified: product.review_count === null || product.review_count === undefined
    },
    { label: 'Catégorie', value: category || '—' },
    { label: 'Marque', value: product.brand || '—' }
  ];

  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />

      <article className="prose">
        <h1>{product.product_name}</h1>
        {content.excerpt ? <p className="muted">{content.excerpt}</p> : null}

        {product.last_checked ? (
          <p className="small muted">Dernière vérification des données : {product.last_checked}.</p>
        ) : null}

        <div className="facts-panel">
          {facts.map((f) => (
            <div className="fact" key={f.label}>
              <span className="label">{f.label}</span>
              <span className={`value ${f.unverified ? 'unverified' : ''}`}>{f.value}</span>
            </div>
          ))}
        </div>

        <AffiliateButton product={product} />

        {comparisons.length ? (
          <ul className="list-links">
            {comparisons.map((c) => (
              <li key={c.slug}>
                Voir aussi :{' '}
                <Link href={`/comparatifs/${c.slug}/`}>{c.title}</Link>
              </li>
            ))}
          </ul>
        ) : null}

        <p className="disclosure">
          Divulgation : cette page contient un lien affilié. Si vous achetez via ce lien, nous pouvons
          percevoir une commission, sans coût supplémentaire pour vous. Cela n’influence pas notre analyse.
        </p>

        <Markdown>{content.body_md}</Markdown>
      </article>

      {related.length ? (
        <section>
          <div className="section-head">
            <h2>Produits liés dans la même catégorie</h2>
            {category ? (
              <Link className="more" href={`/${category}/`}>
                Toute la catégorie →
              </Link>
            ) : null}
          </div>
          <div className="grid">
            {related.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <JsonLd
        schema={[
          productSchema({ product, content, url }),
          articleSchema({ content, url }),
          breadcrumbSchema(crumbs),
          faq.length >= 2 ? faqSchema(faq) : null
        ]}
      />
    </div>
  );
}