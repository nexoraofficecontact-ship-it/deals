import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs.js';
import JsonLd from '../../components/JsonLd.js';
import { breadcrumbSchema } from '../../lib/schema.js';

export const metadata = {
  title: 'Politique de confidentialité',
  description: 'Comment nous collectons, utilisons et protégeons vos données.',
  alternates: { canonical: '/politique-de-confidentialite/' }
};

export default function PrivacyPage() {
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Politique de confidentialité', href: '/politique-de-confidentialite/' }
  ];
  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <div className="prose">
        <h1>Politique de confidentialité</h1>
        <p className="muted">Dernière mise à jour : 2026-09-19.</p>

        <h2>Ce site collecte-t-il des données ?</h2>
        <p>
          Ce site est statique et ne comporte ni compte, ni formulaire d’inscription, ni traceur publicitaire
          de première partie. Nous ne collectons ni ne stockons vos données personnelles nous-mêmes.
        </p>

        <h2>Hébergement et accès</h2>
        <p>
          Le site est hébergé par Vercel Inc., qui peut traiter certaines informations techniques (adresse IP,
          navigateur, pages visitées) à des fins de sécurité et de fonctionnement, conformément à la politique
          de confidentialité de cet hébergeur.
        </p>

        <h2>Liens vers Amazon.ca</h2>
        <p>
          Certains liens renvoient vers Amazon.ca via le Programme Partenaires. Amazon est susceptible de
          collecter des informations sur votre visite dans le cadre de son propre usage, selon sa politique de
          confidentialité. Ces liens sont identifiés comme liens affiliés.
        </p>

        <h2>Cookies</h2>
        <p>
          Ce site n’installe pas de cookies de première partie. Les services tiers auxquels nous renvoyons
          (Amazon.ca notamment) peuvent utiliser leurs propres cookies.
        </p>

        <h2>Vos droits</h2>
        <p>
          Pour toute question relative à vos données, écrivez-nous via la page{' '}
          <Link href="/contact/">Contact</Link>.
        </p>
      </div>
      <JsonLd schema={[breadcrumbSchema(crumbs)]} />
    </div>
  );
}