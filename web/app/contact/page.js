import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs.js';
import JsonLd from '../../components/JsonLd.js';
import { breadcrumbSchema } from '../../lib/schema.js';

export const metadata = {
  title: 'Contact',
  description: 'Une question sur nos guides, comparatifs ou la divulgation d’affiliation ? Contactez-nous.',
  alternates: { canonical: '/contact/' }
};

export default function ContactPage() {
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Contact', href: '/contact/' }
  ];
  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <div className="prose">
        <h1>Contact</h1>
        <p>
          Une question sur une fiche produit, un comparatif, une suggestion de catégorie ou sur la
          divulgation d’affiliation ? Nous lisons vos messages et répondons lorsque c’est possible.
        </p>
        <ul className="list-links">
          <li>
            <strong>En attendant un canal direct :</strong> la plupart des réponses se trouvent dans nos{' '}
            <Link href="/faq/">questions fréquentes</Link> et notre{' '}
            <Link href="/divulgation-affiliation/">divulgation d’affiliation</Link>.
          </li>
          <li>
            <strong>Concernant un produit précis :</strong> la fiche produit mentionne la date de dernière
            vérification des données et signale toute information incertaine.
          </li>
        </ul>
        <p className="muted small">
          Caractère éditorial : ce site ne fournit ni conseil financier, médical ou juridique, et n’accepte
          pas de demandes de « placement » de produits non vérifiés dans nos classements.
        </p>
      </div>
      <JsonLd schema={[breadcrumbSchema(crumbs)]} />
    </div>
  );
}