import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs.js';
import { getSite } from '../../lib/data.js';

export const metadata = {
  title: 'À propos',
  description: 'Notre méthode : des contenus vérifiés, honnêtes et utiles, au service des acheteurs canadiens.',
  alternates: { canonical: '/a-propos/' }
};

export default function AboutPage() {
  const site = getSite();
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'À propos', href: '/a-propos/' }
  ];
  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <article className="prose">
        <h1>À propos de {site.name}</h1>
        <p>
          {site.name} est un site média spécialisé qui aide les acheteurs canadiens à comprendre un besoin,
          comparer des produits et choisir en connaissance de cause.
        </p>
        <h2>Notre méthode</h2>
        <ul>
          <li>
            <strong>Source unique de vérité.</strong> Chaque produit est d’abord enregistré et vérifié dans
            notre base centrale. Rien n’est publié avant.
          </li>
          <li>
            <strong>Aucune invention.</strong> Prix, notes, caractéristiques et disponibilité proviennent de
            sources vérifiées. En cas de doute, nous affichons « Information à vérifier ».
          </li>
          <li>
            <strong>Des analyses honnêtes.</strong> Nous présentons les points forts comme les limites, et les
            cas où un produit n’est pas adapté.
          </li>
          <li>
            <strong>Des prix datés.</strong> Un prix est toujours présenté comme « observé » à une date donnée,
            car il peut changer.
          </li>
        </ul>
        <h2>Ce que nous ne faisons pas</h2>
        <ul>
          <li>Nous ne promettons pas de classement ni de « meilleur produit » absolu.</li>
          <li>Nous ne recopions ni les fiches Amazon ni le contenu d’autres sites.</li>
          <li>Nous n’écrivons pas « nous avons testé » lorsque aucun test n’a été réalisé.</li>
        </ul>
        <h2>Comment nous gagnons notre vie</h2>
        <p>
          Certains liens pointent vers Amazon.ca et sont affiliés : si vous achetez via ces liens, nous pouvons
          percevoir une commission, sans coût supplémentaire pour vous. Cette rémunération n’influence pas nos
          évaluations. Consultez notre{' '}
          <Link href="/divulgation-affiliation/">page de divulgation d’affiliation</Link>.
        </p>
      </article>
    </div>
  );
}
