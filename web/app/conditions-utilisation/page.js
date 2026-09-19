import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs.js';
import JsonLd from '../../components/JsonLd.js';
import { breadcrumbSchema } from '../../lib/schema.js';

export const metadata = {
  title: 'Conditions d’utilisation',
  description: 'Les conditions d’utilisation de ce site de guides et comparatifs.',
  alternates: { canonical: '/conditions-utilisation/' }
};

export default function TermsPage() {
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Conditions d’utilisation', href: '/conditions-utilisation/' }
  ];
  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <div className="prose">
        <h1>Conditions d’utilisation</h1>
        <p className="muted">Dernière mise à jour : 2026-09-19.</p>

        <h2>Nature des contenus</h2>
        <p>
          Les guides, fiches produits et comparatifs publiés sur ce site ont un caractère strictement
          informatif et éditorial. Ils ne constituent ni un conseil financier, médical ou juridique, ni une
          garantie sur la disponibilité, le prix ou la qualité d’un produit.
        </p>

        <h2>Données produits</h2>
        <p>
          Les prix et caractéristiques affichés sont ceux observés lors de la dernière vérification et peuvent
          évoluer à tout moment. En cas d’écart entre notre fiche et la page Amazon.ca, la page Amazon.ca fait
          foi. Nous signalons explicitement les informations incertaines.
        </p>

        <h2>Liens affiliés</h2>
        <p>
          Ce site participe au Programme Partenaires d’Amazon.ca. Quand vous achetez via un lien affilié, nous
          pouvons percevoir une commission, sans coût supplémentaire pour vous. Cette rémunération n’influence
          pas nos évaluations. Voir la{' '}
          <Link href="/divulgation-affiliation/">divulgation d’affiliation</Link>.
        </p>

        <h2>Propriété intellectuelle</h2>
        <p>
          Les textes éditoriaux de ce site sont notre propriété (ou celle de nos auteurs) et ne peuvent être
          repris sans autorisation écrite. Les marques et dénominations de produits appartiennent à leurs
          propriétaires respectifs.
        </p>

        <h2>Responsabilité</h2>
        <p>
          L’utilisation du site se fait à vos propres risques. Nous ne pouvons être tenus responsables de
          décisions d’achat prises sur la seule base de nos contenus, ni des conséquences de l’utilisation de
          tout lien externe.
        </p>
      </div>
      <JsonLd schema={[breadcrumbSchema(crumbs)]} />
    </div>
  );
}