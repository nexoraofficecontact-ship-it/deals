import { notFound } from 'next/navigation';
import { getContent, guideContents } from '../../../lib/data.js';
import Markdown from '../../../components/Markdown.js';
import Breadcrumbs from '../../../components/Breadcrumbs.js';
import JsonLd from '../../../components/JsonLd.js';
import { breadcrumbSchema, articleSchema, faqSchema } from '../../../lib/schema.js';
import { extractFaq } from '../../../lib/faq.js';

export const dynamicParams = false;

export function generateStaticParams() {
  return guideContents().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const content = getContent(slug);
  if (!content) return {};
  return {
    title: content.title,
    description: content.excerpt || content.title,
    alternates: { canonical: `/guides/${slug}/` }
  };
}

export default async function GuidePage({ params }) {
  const { slug } = await params;
  const content = getContent(slug);
  if (!content || content.kind !== 'guide') notFound();

  const faq = extractFaq(content.body_md);
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Guides', href: '/guides/' },
    { name: content.title, href: `/guides/${slug}/` }
  ];

  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <article className="prose">
        <h1>{content.title}</h1>
        {content.excerpt ? <p className="muted">{content.excerpt}</p> : null}
        <Markdown>{content.body_md}</Markdown>
      </article>
      <JsonLd
        schema={[
          articleSchema({ content, url: `/guides/${slug}/` }),
          breadcrumbSchema(crumbs),
          faq.length >= 2 ? faqSchema(faq) : null
        ]}
      />
    </div>
  );
}
