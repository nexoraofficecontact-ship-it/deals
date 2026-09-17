import Link from 'next/link';
import { guideContents } from '../../lib/data.js';
import Breadcrumbs from '../../components/Breadcrumbs.js';
import EmptyState from '../../components/EmptyState.js';
import JsonLd from '../../components/JsonLd.js';
import { breadcrumbSchema } from '../../lib/schema.js';

export const metadata = {
  title: 'Guides d’achat',
  description: 'Guides d’achat clairs et vérifiés pour choisir le bon produit au Canada.',
  alternates: { canonical: '/guides/' }
};

export default function GuidesPage() {
  const guides = guideContents();
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
      {guides.length ? (
        <ul className="list-links">
          {guides.map((g) => (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}/`}>{g.title}</Link>
              {g.excerpt ? <p className="muted small">{g.excerpt}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Guides à venir">
          Nos premiers guides d’achat seront publiés dès que les catégories prioritaires disposeront de
          suffisamment de données vérifiées.
        </EmptyState>
      )}
      <JsonLd schema={[breadcrumbSchema(crumbs)]} />
    </div>
  );
}
