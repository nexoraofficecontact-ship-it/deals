import Link from 'next/link';
import { guideContents, STATIC_GUIDES } from '../../lib/data.js';
import Breadcrumbs from '../../components/Breadcrumbs.js';
import JsonLd from '../../components/JsonLd.js';
import { breadcrumbSchema } from '../../lib/schema.js';

export const metadata = {
  title: 'Guides d’achat',
  description: 'Guides d’achat clairs et vérifiés pour choisir le bon produit au Canada.',
  alternates: { canonical: '/guides/' }
};

export default function GuidesPage() {
  const dbGuides = guideContents();
  const guides = [...STATIC_GUIDES, ...dbGuides];
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Guides', href: '/guides/' }
  ];
  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <h1>Guides d’achat</h1>
      <p className="muted">
        Des guides qui expliquent comment choisir, quels critères comptent et quels pièges éviter.
      </p>
      <div className="grid">
        {guides.map((g) => (
          <Link key={g.slug} className="guide-card" href={`/guides/${g.slug}/`}>
            <h3>{g.title}</h3>
            {g.excerpt ? <p>{g.excerpt}</p> : null}
            <span className="guide-more">Lire le guide →</span>
          </Link>
        ))}
      </div>
      <JsonLd schema={[breadcrumbSchema(crumbs)]} />
    </div>
  );
}