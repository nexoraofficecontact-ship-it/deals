import Breadcrumbs from '../../components/Breadcrumbs.js';
import { getSite } from '../../lib/data.js';

export const metadata = {
  title: 'Divulgation d’affiliation',
  description:
    'Transparence sur notre participation au Programme Partenaires d’Amazon et notre rémunération éventuelle.',
  alternates: { canonical: '/divulgation-affiliation/' }
};

export default function DisclosurePage() {
  const site = getSite();
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Divulgation d’affiliation', href: '/divulgation-affiliation/' }
  ];
  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <article className="prose">
        <h1>Divulgation d’affiliation</h1>
        <p>
          {site.name} participe au Programme Partenaires d’Amazon (Amazon Associates). En tant que participant,
          nous pouvons percevoir une commission sur les achats éligibles effectués via certains liens présents
          sur ce site.
        </p>
        <h2>Ce que cela signifie pour vous</h2>
        <ul>
          <li>Le prix que vous payez reste identique, que vous passiez par nos liens ou non.</li>
          <li>La commission ne modifie pas le prix affiché par Amazon.ca.</li>
          <li>Nos analyses ne sont pas vendues, sponsorisées ni dictées par nos partenaires.</li>
        </ul>
        <h2>Notre indépendance éditoriale</h2>
        <p>
          Les produits que nous présentons sont sélectionnés pour leur pertinence par rapport à la recherche
          de l’utilisateur. Nous ne présentons pas un produit comme « recommandé par Amazon », et nous
          n’affirmons pas avoir testé un produit lorsque ce n’est pas le cas.
        </p>
        <h2>Prix et disponibilité</h2>
        <p>
          Prix et disponibilité peuvent changer. Les prix indiqués sont ceux observés lors de la dernière
          vérification et sont présentés comme tels. Pour le prix exact au moment de l’achat, consultez la page
          Amazon.ca correspondante.
        </p>
      </article>
    </div>
  );
}
