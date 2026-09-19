import Link from 'next/link';
import Breadcrumbs from '../../../components/Breadcrumbs.js';
import JsonLd from '../../../components/JsonLd.js';
import ProductCard from '../../../components/ProductCard.js';
import { breadcrumbSchema, articleSchema } from '../../../lib/schema.js';
import { getProductById } from '../../../lib/data.js';

export const metadata = {
  title: 'Comment choisir des écouteurs sans fil',
  description:
    'Autonomie, confort, réduction de bruit et codecs audio : un repère clair pour choisir des écouteurs au Canada sans se tromper.',
  alternates: { canonical: '/guides/comment-choisir-ecouteurs-sans-fil/' }
};

const url = '/guides/comment-choisir-ecouteurs-sans-fil/';

export default function GuideEcouteurs() {
  const crumbs = [
    { name: 'Accueil', href: '/' },
    { name: 'Guides', href: '/guides/' },
    { name: 'Choisir des écouteurs sans fil', href: url }
  ];
  const related = [getProductById('jbl-vibe-beam')].filter(Boolean);

  return (
    <div className="container">
      <Breadcrumbs items={crumbs} />
      <article className="prose">
        <h1>Comment choisir des écouteurs sans fil</h1>
        <p className="muted">Guide d’achat — les critères à comparer sur les fiches produits.</p>

        <p>
          Écouteurs intra-auriculaires ou casques, le premier réflexe n’est pas le prix : c’est l’usage.
          Voici les critères que nous regardons systématiquement dans nos fiches.
        </p>

        <h2>1. L’autonomie annoncée</h2>
        <p>
          L’autonomie est annoncée par le fabricant en heures d’écoute (avec ou sans réduction de bruit).
          Comparez toujours deux valeurs : l’autonomie des écouteurs seuls et l’autonomie totale avec le
          boîtier de charge. Sur une utilisation de bureau, visez au moins 5 à 6 heures par charge, plus
          plusieurs charges via l’étui.
        </p>

        <h2>2. La réduction de bruit : active ou pas ?</h2>
        <p>
          La réduction de bruit active (ANC) atténue le bruit ambiant constant. Elle est utile en transport
          ou en open-space, moins décisive à la maison. Toutes les paires ne l’ont pas : vérifiez la mention
          explicite « réduction de bruit active » dans les caractéristiques — sinon elle est absente.
        </p>

        <h2>3. Le confort et le format</h2>
        <p>
          Le format intra-auriculaire tient dans l’oreille ; le maintien dépend des embouts fournis. Le
          confort est subjectif et ne s’évalue pas sur une fiche : si le modèle est disponible en essai en
          magasin, c’est le meilleur test. Notez aussi l’indice d’étanchéité (IPX) si vous comptez les
          utiliser au sport.
        </p>

        <h2>4. Bluetooth et codecs</h2>
        <p>
          La version Bluetooth (5.0 minimum de nos jours) influence la stabilité de la liaison. Les codecs
          (AAC, aptX…) importent surtout pour les amateurs de son haute définition ; pour une écoute classique,
          AAC est largement suffisant. Vérifiez la compatibilité avec votre téléphone (iOS ou Android).
        </p>

        <h2>5. Les commandes et l’application</h2>
        <p>
          Boutons physiques, touches tactiles ou contrôle via application : préférez ce qui vous paraît
          naturel. Une application de réglage d’égaliseur est un plus, pas une obligation.
        </p>

        <h2>6. Vérifiez le prix observé</h2>
        <p>
          Nos fiches affichent le prix observé à la date de dernière vérification. Le secteur des écouteurs
          varie souvent : consultez Amazon.ca pour le prix du jour avant décision.
        </p>

        <p>
          Toutes nos fiches audio sont regroupées dans la catégorie{' '}
          <Link href="/audio/">audio</Link>.
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
              title: 'Comment choisir des écouteurs sans fil',
              excerpt: 'Autonomie, ANC, codecs et confort : les critères pour bien choisir ses écouteurs.',
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