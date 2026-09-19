import Link from 'next/link';
import Breadcrumbs from '../../../components/Breadcrumbs.js';
import JsonLd from '../../../components/JsonLd.js';
import ProductCard from '../../../components/ProductCard.js';
import { breadcrumbSchema, articleSchema } from '../../../lib/schema.js';
import { getProductById } from '../../../lib/data.js';

export const metadata = {
  title: 'Comment choisir une bouteille isotherme',
  description:
    'Isolation, capacité, entretien et bouche de remplissage : les critères vérifiés pour choisir une gourde qui tient ses promesses.',
  alternates: { canonical: '/guides/comment-choisir-bouteilles-isothermes/' }
};

const url = '/guides/comment-choisir-bouteilles-isothermes/';

export default function GuideBouteilles() {
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Guides', href: '/guides/' },
    { name: 'Choisir une bouteille isotherme', href: url }
  ];
  const related = [getProductById('coolflask-water-bottle')].filter(Boolean);

  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <article className="prose">
        <h1>Comment choisir une bouteille isotherme</h1>
        <p className="muted">Guide d’achat — les critères à vérifier sur la fiche avant d’acheter.</p>

        <p>
          Une bouteille isotherme garde vos boissons froides ou chaudes plusieurs heures. Le piège classique :
          se concentrer sur la couleur plutôt que sur l’isolation. Voici ce qu’il faut vérifier.
        </p>

        <h2>1. Le type d’isolation (double paroi)</h2>
        <p>
          L’isolation repose sur une double paroi (souvent en acier inoxydable avec un vide intermédiaire).
          Vérifiez que la fiche mentionne la double paroi et le matériau intérieur : inox 304 ou 18/8 sont les
          mentions les plus courantes pour un usage alimentaire. À défaut de mention précise, signalez
          l’incertitude plutôt que de la supposer.
        </p>

        <h2>2. La capacité réelle</h2>
        <p>
          Les capacités courantes vont de 500 ml à 1 L ou plus. Vérifiez que la contenance annoncée correspond
          à une bouteille qui tient dans votre sac ou porte-gobelet de voiture : la hauteur et le diamètre sont
          souvent les critères qui éliminent la plupart des modèles.
        </p>

        <h2>3. La bouche de remplissage et l’ouverture</h2>
        <p>
          Une grande ouverture se nettoie facilement et accepte des glaçons ; une petite ouverture limite les
          fuites mais complique le nettoyage. Les modèles avec pailles ou becs supplémentaires ajoutent des
          pièces à laver — à bidouiller pour le quotidien.
        </p>

        <h2>4. L’entretien</h2>
        <p>
          Privilégiez une bouteille lavable au lave-vaisselle (ou au minimum compatible avec un nettoyage
          facile à la main) et dont les joints sont accessibles. L’humidité dans les joints est la première
          cause de moisissure.
        </p>

        <h2>5. Le prix observé, pas le prix barré</h2>
        <p>
          Nos fiches affichent le prix tel qu’observé à la date de vérification. Les bouteilles isothermes
          sont souvent soldées : comparez le prix observé sur Amazon.ca le jour de votre décision.
        </p>

        <p>
          Nos fiches hydratation sont dans la catégorie{' '}
          <Link href="/hydratation/">hydratation</Link>.
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
              title: 'Comment choisir une bouteille isotherme',
              excerpt: 'Isolation, capacité, ouverture et entretien : les critères pour bien choisir.',
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