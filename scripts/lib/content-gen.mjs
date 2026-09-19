// =====================================================================
// GENERATION DE CONTENU EDITORIAL ORIGINAL
// Principes (§9, §28, §29) :
//  - N'utilise QUE les donnees du Sheet ; toute donnee manquante devient
//    « Information à vérifier » — JAMAIS inventee.
//  - Ton editorial honnete : « Notre analyse », « Selon les
//    caractéristiques disponibles ». Jamais « nous avons testé » sans test.
//  - Sortie Markdown + frontmatter, consume par le site Next.js.
// =====================================================================

import { slugify, parsePipe, parseSpecs, formatCad, todayIso } from './util.mjs';
import { getConfig } from './config.mjs';

const UNKNOWN = 'Information à vérifier';

function priceLabel(product) {
  const formatted = formatCad(product.price_cad);
  const date = product.last_checked || todayIso();
  if (!formatted) return UNKNOWN;
  return `${formatted} (prix observé au ${date})`;
}

function ratingLabel(product) {
  if (product.rating === null) return UNKNOWN;
  const count = product.review_count !== null ? ` · ${product.review_count} avis` : '';
  return `${product.rating.toFixed(1)}/5${count}`;
}

function featuresList(product) {
  const items = parsePipe(product.key_features || '');
  return items.length ? items.map((f) => f.trim()).filter(Boolean) : [UNKNOWN];
}

function specsOf(product) {
  return parseSpecs(product.specifications || '');
}

function specValue(specs, names) {
  for (const spec of specs) {
    if (names.some((n) => spec.name.toLowerCase().includes(n.toLowerCase()) && spec.value)) return spec.value;
  }
  return null;
}

function bullet(items, fallbackItems = null) {
  const list = items.length ? items : fallbackItems || [UNKNOWN];
  return list.map((s) => `- ${s}`).join('\n');
}

function safe(fn, fallback) {
  try {
    return fn();
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------
// BRIEF EDITORIAL
// ---------------------------------------------------------------------
export function buildProductBrief(product) {
  const primary = product.primary_keyword || `${product.product_name.toLowerCase()}`;
  const secondary = parsePipe(product.secondary_keywords || '');
  const semantic = parsePipe(product.semantic_keywords || '');
  return {
    product_id: product.product_id,
    kind: 'product',
    title: product.product_name,
    // L'URL publique d'une page produit est /<product_id>/ (slug court et stable).
    slug: product.product_id,
    primaryKeyword: primary,
    secondaryKeywords: secondary,
    semanticKeywords: semantic,
    intent: product.search_intent || 'commercial',
    angles: parsePipe(product.content_angles || ''),
    faqTopics: parsePipe(product.faq_topics || ''),
    cluster: product.keyword_cluster || product.category
  };
}

// ---------------------------------------------------------------------
// PAGE PRODUIT (§9)
// ---------------------------------------------------------------------
export function generateProductPage(product, resolver = null) {
  const brief = buildProductBrief(product);
  const specs = specsOf(product);
  const features = parsePipe(product.key_features || '');
  const pros = parsePipe(product.pros || '');
  const cons = parsePipe(product.cons || '');
  const idealFor = parsePipe(product.ideal_for || '');
  const notForArray = cons;
  const useCases = parsePipe(product.use_cases || '');
  const faqTopics = parsePipe(product.faq_topics || '');
  const alternatives = parsePipe(String(product.competitor_products || ''), '|,');
  const alternativesResolved = alternatives
    .map((slug) => resolver?.(slug))
    .filter((r) => r !== null && r !== undefined);

  const intro = safe(() => {
    const name = product.product_name;
    const fam = product.product_type || product.category;
    const positioning = product.positioning || `${name} est présenté ici avec les caractéristiques disponibles sur sa fiche Amazon.ca.`;
    return [
      `${name} fait partie de notre sélection de ${fam}${product.category ? `, dans la catégorie ${product.category}` : ''}${product.brand ? `, pour la marque ${product.brand}` : ''}.`,
      positioning,
      "Cette page s'appuie sur les données disponibles et vérifiées dans notre base : prix observé, caractéristiques, points forts et limites. Nous n'inventons rien : toute information incertaine est clairement signalée."
    ].join('\n\n');
  }, product.product_name);

  const quickSummary = [
    '| Élément | Détail |',
    '| --- | --- |',
    `| Prix observé | ${priceLabel(product)} |`,
    `| Note | ${ratingLabel(product)} |`,
    `| Catégorie | ${product.category}${product.subcategory ? ` / ${product.subcategory}` : ''} |`,
    `| Marque | ${product.brand || UNKNOWN} |`,
    `| Caractéristiques principales | ${features.length ? features.slice(0, 3).join(' ; ') : UNKNOWN} |`
  ].join('\n');

  const keyFeatures = features.length
    ? bullet(features)
    : `- Aucune caractéristique vérifiée pour le moment — ${UNKNOWN}.`;

  const appreciation = pros.length ? bullet(pros) : `- Aucun point positif entièrement vérifié — ${UNKNOWN}.`;
  const considerations = cons.length ? bullet(cons) : `- Aucun point négatif signalé ; les limites exactes demandent une vérification manuelle.`;

  const audienceHeading = idealFor.length ? `À qui s'adresse ce produit ?` : `À qui s'adresse ce produit ?`;
  const audienceBody = idealFor.length
    ? bullet(idealFor)
    : `- Profils théoriques : selon les caractéristiques disponibles, ce modèle semble adapté aux personnes cherchant ${product.product_type || 'ce type de produit'}. ${UNKNOWN} pour une confirmation.`;

  const useCasesBody = useCases.length
    ? bullet(useCases)
    : `- Cas d'utilisation types pour ${product.product_type || 'ce type de produit'} — ${UNKNOWN}; consultez la fiche Amazon.ca.`;

  const alternativesBody = alternativesResolved.length
    ? alternativesResolved.map(({ slug, name }) => `- [${name}](/${slug}/)`).join('\n')
    : alternatives.length
      ? `- ${UNKNOWN} — des alternatives comparables sont listées dans nos articles comparatifs quand elles sont vérifiées.`
      : `- ${UNKNOWN} — des alternatives comparables sont listées dans nos articles comparatifs quand elles sont vérifiées.`;

  const faqBody = faqTopics.length
    ? faqTopics.map((q) => `### ${q}\n\n${answerFromData(q, specs, product)}`).join('\n\n')
    : `**${product.product_name} est-il disponible sur Amazon.ca ?**\n\nOui, le produit est référencé${product.asin ? ` (ASIN ${product.asin})` : ''}. Cette page repose sur les données de notre base du ${todayIso()}.`;

  const verdict = safe(() => {
    const positives = pros.length ? pros.length : 'certains atouts';
    const caution = cons.length ? ` Ses limites signalées : ${cons.join(' ; ').slice(0, 200)}.` : ' Les limites exactes restent à confirmer au cas par cas.';
    return `En l'état des informations vérifiées, ${product.product_name} se positionne comme ${product.positioning ? `un choix ${product.product_type || 'de catégorie'} jugé pertinent pour ${product.ideal_for ? product.ideal_for.split('|')[0].trim() : 'son usage principal'}` : `une option à considérer pour ${product.product_type || 'son usage principal'}`}. Nous relevons ${positives} point(s) favorable(s).${caution} \n\n⚠️ Aucun achat n'est exigé : notre rôle est de vous donner des repères clairs avant de prendre une décision. Le prix indiqué est celui observé lors de la dernière vérification et peut varier.`;
  }, 'Verdict éditorial à compléter.');

  const bodyMd = [
    `# ${product.product_name}`,
    ``,
    intro,
    ``,
    `## Résumé rapide`,
    ``,
    quickSummary,
    ``,
    `[Voir sur Amazon.ca](${product.affiliate_url || product.amazon_url})`,
    ``,
    `## Aperçu du produit`,
    ``,
    `${product.product_type ? `${product.product_name} est un ${product.product_type}${product.brand ? ` de la marque ${product.brand}` : ''}.` : `${product.product_name} est référencé dans la catégorie ${product.category}.`} ` +
      `${product.positioning || `Il s'agit d'une fiche informative basée sur les données vérifiées disponibles.`}`,
    ``,
    `## Caractéristiques principales`,
    ``,
    keyFeatures,
    ``,
    `## Ce que nous apprécions`,
    ``,
    appreciation,
    ``,
    `## Points à considérer`,
    ``,
    considerations,
    ``,
    `## À qui s'adresse ce produit ?`,
    ``,
    audienceBody,
    ``,
    `## À qui il ne convient pas ?`,
    ``,
    `- ${notForArray.length ? notForArray.join(' ; ') : `Les limites précises ne sont pas toutes vérifiées ; consultez les points à considérer ci-dessus.`}`,
    ``,
    `## Utilisations possibles`,
    ``,
    useCasesBody,
    ``,
    `## Comparaison avec des alternatives`,
    ``,
    alternativesBody,
    ``,
    `## Questions fréquentes`,
    ``,
    faqBody,
    ``,
    `## Verdict éditorial`,
    ``,
    verdict
  ].join('\n');

  const metaTitle = `${product.product_name} : ${product.product_type || 'analyse'} (${product.category || 'produit'})`;
  const metaDescription =
    (product.positioning || `Analyse honnête de ${product.product_name}`).slice(0, 155);

  return {
    slug: brief.slug,
    kind: 'product',
    title: product.product_name,
    metaTitle,
    metaDescription,
    excerpt: metaDescription,
    body_md: bodyMd,
    keyword: brief.primaryKeyword,
    schema_type: 'Product',
    entities: [product.product_id]
  };
}

// ---------------------------------------------------------------------
// ARTICLE COMPARATIF (§10)
// ---------------------------------------------------------------------
export function generateComparison(products, opts = {}) {
  const title = opts.title || `Meilleurs ${products[0]?.product_type || products[0]?.category || 'produits'} : comparatif`;
  const comparisonGroup = products[0]?.comparison_group || products[0]?.keyword_cluster || 'produits';
  const rows = products.map((p) => {
    const price = formatCad(p.price_cad) ? `${formatCad(p.price_cad)}` : UNKNOWN;
    const rating = p.rating !== null ? `${p.rating.toFixed(1)}/5` : '—';
    const ideal = parsePipe(p.ideal_for || '')[0] || 'À préciser';
    return `| [${p.product_name}](/${p.product_id}/) | ${price} | ${rating} | ${parsePipe(p.key_features || '')[0] || UNKNOWN} | ${ideal} |`;
  });
  const table = [
    `| Produit | Prix observé | Note | Caractéristique principale | Idéal pour |`,
    `| --- | --- | --- | --- | --- |`,
    ...rows
  ].join('\n');

  const bodyMd = [
    `# ${title}`,
    ``,
    `Nous comparons ici ${products.length} produits de la catégorie **${comparisonGroup}**, uniquement à partir des données vérifiées présentes dans notre base. Les prix sont ceux observés lors de la dernière vérification de chaque fiche.`,
    ``,
    table,
    ``,
    `## En bref`,
    ``,
    products
      .map(
        (p) =>
          `- **${p.product_name}** — ${p.positioning || 'voir la fiche pour le détail des caractéristiques'} (prix observé : ${formatCad(p.price_cad) || UNKNOWN}).`
      )
      .join('\n'),
    ``,
    `## Comment choisir`,
    ``,
    `- Vérifiez votre espace disponible et l'usage principal (intérieur, bureau, petit appartement).`,
    `- Comparez le prix observé, la note et le nombre d'avis pour juger de la popularité du modèle.`,
    `- Les caractéristiques affichées proviennent des fiches vérifiées ; toute donnée manquante est signalée.`,
    ``,
    `## Points à vérifier avant d'acheter`,
    ``,
    `- **L'usage réel** : un modèle compact convient à un petit espace, un modèle plus robuste à un usage intensif.`,
    `- **Les caractéristiques clés** : comparez d'abord celles qui comptent pour vous, pas le nombre de lignes sur la fiche.`,
    `- **Le prix observé** : il peut changer ; il s'agit d'un repère daté, pas d'un prix garanti.`,
    `- **La note et le volume d'avis** : une note élevée avec peu d'avis est moins fiable qu'une note solide sur des centaines d'avis.`,
    ``,
    `## Consulter chaque fiche`,
    ``,
    products.map((p) => `- [${p.product_name}](/${p.product_id}/) : ${formatCad(p.price_cad) || UNKNOWN}`).join('\n'),
    ``,
    `## Transparence`,
    ``,
    `Ce comparatif contient des liens affiliés : si vous achetez via ces liens, nous pouvons percevoir une commission, sans coût supplémentaire pour vous. Cette rémunération n'influence pas la sélection, qui repose uniquement sur les données vérifiées.`
  ].join('\n');

  return {
    slug: slugify(title, comparisonGroup),
    kind: 'comparison',
    title,
    metaTitle: `Comparatif ${comparisonGroup} (2026)`,
    metaDescription: `Comparatif de ${products.length} ${comparisonGroup} basé sur les données vérifiées : ${products.map((p) => p.product_name).join(', ').slice(0, 140)}.`,
    excerpt: `Comparatif de ${products.length} modèles : prix, note, caractéristiques.`,
    body_md: bodyMd,
    keyword: title,
    schema_type: 'ItemList',
    entities: products.map((p) => p.product_id)
  };
}

// ---------------------------------------------------------------------
// FAQ : repondre uniquement a partir des donnees (jamais inventer)
// ---------------------------------------------------------------------
function answerFromData(question, specs, product) {
  const q = question.toLowerCase();
  const lookup = (names) => specValue(specs, names);
  const pool = [
    ['prix', () => `Le prix observé est ${priceLabel(product)}.`],
    ['note', () => `La note observée est ${ratingLabel(product)}.`],
    ['garantie', () => lookup(['garantie', 'warranty']) ? `Selon la fiche : ${lookup(['garantie', 'warranty'])}.` : `${UNKNOWN}.`],
    ['poids', () => lookup(['poids', 'weight']) ? `Selon la fiche : ${lookup(['poids', 'weight'])}.` : `${UNKNOWN}.`],
    ['dimension', () => lookup(['dimension', 'dimensions', 'largeur', 'hauteur', 'profondeur']) ? `Selon la fiche : ${lookup(['dimension', 'dimensions', 'largeur', 'hauteur', 'profondeur'])}.` : `${UNKNOWN}.`],
    ['autonomie', () => lookup(['autonomie', 'batterie', 'battery']) ? `Selon la fiche : ${lookup(['autonomie', 'batterie', 'battery'])}.` : `${UNKNOWN}.`],
    ['capacité', () => lookup(['capacité', 'capacity', 'volume']) ? `Selon la fiche : ${lookup(['capacité', 'capacity', 'volume'])}.` : `${UNKNOWN}.`],
    ['compatibilité', () => lookup(['compatible', 'compatibilité']) ? `Selon la fiche : ${lookup(['compatible', 'compatibilité'])}.` : `${UNKNOWN}.`],
    ['disponibilité', () => `${UNKNOWN}.`]
  ];
  for (const [keyword, responder] of pool) {
    if (q.includes(keyword)) return responder();
  }
  // Par defaut : pas d'invention.
  return `Réponse en cours de validation : la question porte sur un point non confirmé. ${UNKNOWN}.`;
}