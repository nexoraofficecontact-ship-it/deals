import Link from 'next/link';
import Breadcrumbs from '../../../components/Breadcrumbs.js';
import JsonLd from '../../../components/JsonLd.js';
import ProductCard from '../../../components/ProductCard.js';
import { breadcrumbSchema, articleSchema } from '../../../lib/schema.js';
import { getProductById } from '../../../lib/data.js';

export const metadata = {
  title: 'Comment choisir un tapis de marche',
  description:
    'Vitesse, inclinaison, poids maximal, bruit et format pliable : les critères qui comptent vraiment avant d’acheter un walking pad.',
  alternates: { canonical: '/guides/comment-choisir-un-tapis-de-marche/' }
};

const url = '/guides/comment-choisir-un-tapis-de-marche/';

export default function GuideTapisDeMarche() {
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Guides', href: '/guides/' },
    { name: 'Choisir un tapis de marche', href: url }
  ];
  const related = [getProductById('hevglrm-walking-pad'), getProductById('yagud-walking-pad')].filter(Boolean);

  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <article className="prose">
        <h1>Comment choisir un tapis de marche</h1>
        <p className="muted">Guide d’achat — critères vérifiables sur la fiche produit avant d’acheter.</p>

        <p>
          Un « walking pad » ou tapis de marche pliant est devenu l’équipement de bureau et de salon le plus
          demandé. Avant d’utiliser un comparatif, voici les critères à regarder systématiquement sur la fiche
          produit — et à revérifier sur Amazon.ca avant l’achat.
        </p>

        <h2>1. La vitesse maximale</h2>
        <p>
          Si vous marchez en travaillant, une vitesse de 4 à 6 km/h suffit. Les modèles qui montent plus haut
          sont surtout intéressants pour une utilisation en marche sportive. Vérifiez toujours la vitesse
          annoncée par le fabricant : elle est souvent indiquée dans les spécifications de la fiche.
        </p>

        <h2>2. L’inclinaison</h2>
        <p>
          L’inclinaison (jusqu’à quelques degrés sur la plupart des modèles) augmente l’effort sans accélérer.
          C’est un critère de confort plus que de performance : regardez si elle est réglable depuis la
          télécommande ou le bureau.
        </p>

        <h2>3. Le poids maximal supporté</h2>
        <p>
          Le poids maximal supporté est indiqué par le fabricant. Gardez une marge de sécurité confortable par
          rapport à votre propre poids : un tapis constamment à la limite surchauffera et durera moins
          longtemps.
        </p>

        <h2>4. Format plié et encombrement</h2>
        <p>
          Les modèles pliants se rangent verticalement. Mesurez l’espace de rangement réel chez vous, et
          regardez le poids de l’appareil : au-delà de 30 kg, le déplacement quotidien peut devenir pénible.
        </p>

        <h2>5. Le bruit</h2>
        <p>
          Le niveau sonore est rarement précis sur les fiches. La règle pratique : un moteur récent est
          nettement plus silencieux ; en usage bureau partagé, prévoyez de tester le retour produit ou de
          vérifier les commentaires, et gardez une marge d’incertitude — c’est une donnée difficile à
          objectiver.
        </p>

        <h2>6. Le prix observé plutôt que le prix barré</h2>
        <p>
          Nos fiches affichent le prix tel qu’observé lors de la dernière vérification, et la date de cette
          vérification. Les « promotions » éclair sont fréquentes sur ce type de produit : comparez le prix
          observé, pas seulement le pourcentage affiché.
        </p>

        <h2>Notre sélection de fiches vérifiées</h2>
        <p>
          Pour les comparer en pratique, partez de nos fiches dans la catégorie{' '}
          <Link href="/fitness/tapis-de-marche/">tapis de marche</Link>.
        </p>
      </article>

      {related.length ? (
        <section>
          <h2>Fiches liées</h2>
          <div className="grid">
            {related.map((p) => (
              <ProductCard key={p.product_id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <JsonLd
        schema={[
          articleSchema({
            content: {
              title: 'Comment choisir un tapis de marche',
              excerpt: 'Vitesse, inclinaison, poids, bruit : les critères qui comptent pour un walking pad.',
              publishedAt: '2026-09-19',
              updatedAt: '2026-09-19'
            },
            url
          }),
          breadcrumbSchema(crumbs)
        ]}
      />
    </div>
  );
}