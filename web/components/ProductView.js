import Link from 'next/link';
import { formatCad } from '../lib/data.js';
import { extractFaq } from '../lib/faq.js';
import Markdown from './Markdown.js';
import Breadcrumbs from './Breadcrumbs.js';
import AffiliateButton from './AffiliateButton.js';
import JsonLd from './JsonLd.js';
import { productSchema, breadcrumbSchema, faqSchema, articleSchema } from '../lib/schema.js';

export default function ProductView({ product, content, related = [] }) {
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

  const facts = [
    { label: 'Prix observé', value: price || 'Information à vérifier' },
    {
      label: 'Note',
      value: product.rating !== null && product.rating !== undefined ? `${Number(product.rating).toFixed(1)}/5` : '—'
    },
    {
      label: 'Avis',
      value: product.review_count !== null && product.review_count !== undefined ? String(product.review_count) : '—'
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
          <p className="small muted">
            Dernière vérification des données : {product.last_checked}.
          </p>
        ) : null}

        <div className="facts-panel">
          {facts.map((f) => (
            <div className="fact" key={f.label}>
              <span className="label">{f.label}</span>
              <span className="value">{f.value}</span>
            </div>
          ))}
        </div>

        <AffiliateButton href={product.affiliate_url || product.amazon_url} />

        <p className="disclosure">
          Divulgation : cette page contient un lien affilié. Si vous achetez via ce lien, nous pouvons
          percevoir une commission, sans coût supplémentaire pour vous. Cela n’influence pas notre analyse.
        </p>

        <Markdown>{content.body_md}</Markdown>
      </article>

      {related.length ? (
        <section>
          <h2>Produits liés dans la même catégorie</h2>
          <ul className="list-links">
            {related.map((p) => (
              <li key={p.product_id}>
                <Link href={`/${p.product_id}/`}>{p.product_name}</Link>
              </li>
            ))}
          </ul>
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
