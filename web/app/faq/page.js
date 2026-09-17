import { productContents, guideContents } from '../../lib/data.js';
import { extractFaq } from '../../lib/faq.js';
import Breadcrumbs from '../../components/Breadcrumbs.js';
import EmptyState from '../../components/EmptyState.js';
import JsonLd from '../../components/JsonLd.js';
import { breadcrumbSchema, faqSchema } from '../../lib/schema.js';

export const metadata = {
  title: 'Questions fréquentes',
  description: 'Réponses courtes et vérifiées aux questions fréquentes sur les produits et notre méthode.',
  alternates: { canonical: '/faq/' }
};

export default function FaqPage() {
  const seen = new Set();
  const items = [];
  for (const content of [...productContents(), ...guideContents()]) {
    for (const item of extractFaq(content.body_md)) {
      const key = item.question.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({ ...item, source: content });
    }
    if (items.length >= 40) break;
  }
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'FAQ', href: '/faq/' }
  ];
  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <h1>Questions fréquentes</h1>
      <p className="muted">
        Ces réponses proviennent de nos analyses vérifiées. Lorsqu’une donnée n’est pas confirmée, elle est
        indiquée comme « Information à vérifier » plutôt que devinée.
      </p>
      {items.length ? (
        <div>
          {items.map((item) => (
            <details className="faq-item" key={item.question}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      ) : (
        <EmptyState title="Aucune question publiée">
          Les questions fréquentes seront alimentées par nos analyses et guides une fois publiés.
        </EmptyState>
      )}
      <JsonLd schema={[breadcrumbSchema(crumbs), faqSchema(items.slice(0, 20))]} />
    </div>
  );
}
