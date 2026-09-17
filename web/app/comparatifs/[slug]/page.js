import { notFound } from 'next/navigation';
import {
  getContent,
  comparisonContents,
  getProductsByIds
} from '../../../lib/data.js';
import Markdown from '../../../components/Markdown.js';
import Breadcrumbs from '../../../components/Breadcrumbs.js';
import JsonLd from '../../../components/JsonLd.js';
import ProductTable from '../../../components/ProductTable.js';
import { breadcrumbSchema, itemListSchema, articleSchema } from '../../../lib/schema.js';

export const dynamicParams = false;

export function generateStaticParams() {
  return comparisonContents().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const content = getContent(slug);
  if (!content) return {};
  return {
    title: content.title,
    description: content.excerpt || content.title,
    alternates: { canonical: `/comparatifs/${slug}/` }
  };
}

export default async function ComparisonPage({ params }) {
  const { slug } = await params;
  const content = getContent(slug);
  if (!content || content.kind !== 'comparison') notFound();

  const products = getProductsByIds(content.entities);
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Comparatifs', href: '/comparatifs/' },
    { name: content.title, href: `/comparatifs/${slug}/` }
  ];

  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <article className="prose">
        <h1>{content.title}</h1>
        {content.excerpt ? <p className="muted">{content.excerpt}</p> : null}
        <p className="disclosure">
          Divulgation : ce comparatif contient des liens affiliés. Nous pouvons percevoir une commission sur
          les achats éligibles, sans coût supplémentaire pour vous.
        </p>
        <Markdown>{content.body_md}</Markdown>
      </article>

      {products.length >= 2 ? (
        <section>
          <h2>Tableau récapitulatif</h2>
          <ProductTable products={products} />
        </section>
      ) : null}

      <JsonLd
        schema={[
          articleSchema({ content, url: `/comparatifs/${slug}/` }),
          breadcrumbSchema(crumbs),
          products.length
            ? itemListSchema({ name: content.title, products, urlFor: (p) => `/${p.product_id}/` })
            : null
        ]}
      />
    </div>
  );
}
