import Link from 'next/link';
import { comparisonContents } from '../../lib/data.js';
import Breadcrumbs from '../../components/Breadcrumbs.js';
import EmptyState from '../../components/EmptyState.js';
import JsonLd from '../../components/JsonLd.js';
import { breadcrumbSchema } from '../../lib/schema.js';

export const metadata = {
  title: 'Comparatifs',
  description: 'Comparatifs de produits au Canada : prix observés, notes et caractéristiques vérifiées.',
  alternates: { canonical: '/comparatifs/' }
};

export default function ComparisonsPage() {
  const comparisons = comparisonContents();
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Comparatifs', href: '/comparatifs/' }
  ];
  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <h1>Comparatifs</h1>
      <p className="muted">
        Nos comparatifs s’appuient uniquement sur des produits vérifiés. Les données manquantes sont
        signalées plutôt que devinées.
      </p>
      {comparisons.length ? (
        <ul className="list-links">
          {comparisons.map((c) => (
            <li key={c.slug}>
              <Link href={`/comparatifs/${c.slug}/`}>{c.title}</Link>
              {c.excerpt ? <p className="muted small">{c.excerpt}</p> : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title="Aucun comparatif publié">
          Les comparatifs apparaîtront dès qu’au moins deux produits vérifiés partageront un même groupe.
        </EmptyState>
      )}
      <JsonLd schema={[breadcrumbSchema(crumbs)]} />
    </div>
  );
}
