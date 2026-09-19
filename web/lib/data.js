// Couche de données du site : lit l'export statique produit par le pipeline.
// Aucune donnée n'est inventée ici : le site ne montre que l'export.
import siteData from '../data/site-data.json';

const data = siteData;

// Descriptions éditoriales courtes par catégorie/sous-catégorie (texte du site,
// pas des données produits — elles restent génériques et honnêtes).
export const CATEGORY_META = {
  fitness: {
    tagline: 'Tapis de marche, steppers, vélos et accessoires pour bouger à la maison.',
    description:
      'Tapis de marche, steppers, vélos d’appartement et accessoires d’entraînement adaptés au quotidien. Nous comparons les modèles disponibles au Canada à partir de leurs caractéristiques vérifiées.'
  },
  audio: {
    tagline: 'Écouteurs et audio sans fil, sélectionnés selon leurs fiches vérifiées.',
    description:
      'Écouteurs sans fil et équipement audio : autonomie, confort et rapport qualité-prix comparés à partir des données vérifiées sur les fiches Amazon.ca.'
  },
  hydratation: {
    tagline: 'Bouteilles isothermes et contenants pour boire mieux toute la journée.',
    description:
      'Bouteilles isothermes et accessoires d’hydratation : capacité, isolation et formats pratiques, à partir des caractéristiques vérifiées.'
  }
};

export function getSite() {
  // L'URL réelle du site prime sur l'export (config Vercel / build), pour que
  // canoniques, sitemap et robots restent cohérents à chaque déploiement.
  const configuredUrl = (process.env.SITE_URL || '').replace(/\/+$/, '');
  return {
    url: configuredUrl || data.site?.url || 'http://localhost:3000',
    lang: data.site?.lang || 'fr-CA',
    name: process.env.SITE_NAME || 'Guide d\'achat',
    generatedAt: data.generatedAt
  };
}

export function isConfigured() {
  return Boolean(data.generatedAt);
}

export function allProducts() {
  return data.products || [];
}

export function allContents() {
  return data.contents || [];
}

export function contentsByKind(kind) {
  return allContents().filter((c) => c.kind === kind);
}

export function productContents() {
  return contentsByKind('product');
}

export function comparisonContents() {
  return contentsByKind('comparison');
}

export function guideContents() {
  return contentsByKind('guide');
}

export function getProductById(id) {
  return allProducts().find((p) => p.product_id === id) || null;
}

export function getContent(slug) {
  return allContents().find((c) => c.slug === slug) || null;
}

export function getProductsByIds(ids = []) {
  return ids.map((id) => getProductById(id)).filter(Boolean);
}

export function allCategories() {
  return data.categories || [];
}

export function getCategory(slug) {
  return allCategories().find((c) => c.slug === slug) || null;
}

export function categoryMeta(slug) {
  return CATEGORY_META[slug] || null;
}

export function productsByCategory(category) {
  return allProducts().filter((p) => p.category === category);
}

export function productsBySubcategory(category, subcategory) {
  return allProducts().filter((p) => p.category === category && p.subcategory === subcategory);
}

export function contentsForProducts(products) {
  const ids = new Set(products.map((p) => p.product_id));
  return allContents().filter((c) => (c.entities || []).some((e) => ids.has(e)));
}

export function comparisonsForProducts(products) {
  const ids = new Set(products.map((p) => p.product_id));
  return comparisonContents().filter((c) => (c.entities || []).some((e) => ids.has(e)));
}

/**
 * URL d'affiliation effective d'un produit.
 * Le Sheet stocke l'URL de base ; si un tag Amazon Associates est configuré
 * (NEXT_PUBLIC_AMAZON_TAG), il y est ajouté au moment du rendu. Sans tag
 * configuré, l'URL de base est utilisée telle quelle — jamais inventée.
 */
export function affiliateUrl(product) {
  const url = product.affiliate_url || product.amazon_url;
  if (!url) return null;
  const tag = (process.env.NEXT_PUBLIC_AMAZON_TAG || '').trim();
  if (!tag || /\btag=/.test(url)) return url;
  if (/^https?:\/\/amzn\.to\//.test(url)) return `${url}?tag=${encodeURIComponent(tag)}`;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}tag=${encodeURIComponent(tag)}`;
}

/** Guides éditoriaux statiques du site (liste affichée sur /guides/). */
export const STATIC_GUIDES = [
  {
    slug: 'comment-choisir-un-tapis-de-marche',
    title: 'Comment choisir un tapis de marche',
    excerpt:
      'Vitesse, inclinaison, poids maximal, bruit et format pliable : les critères qui comptent vraiment avant d’acheter un walking pad.'
  },
  {
    slug: 'comment-choisir-ecouteurs-sans-fil',
    title: 'Comment choisir des écouteurs sans fil',
    excerpt:
      'Autonomie, confort, réduction de bruit et codecs audio : un repère clair pour choisir des écouteurs au Canada sans se tromper.'
  },
  {
    slug: 'comment-choisir-bouteilles-isothermes',
    title: 'Comment choisir une bouteille isotherme',
    excerpt:
      'Isolation, capacité, entretien et bouche de remplissage : les critères vérifiés pour choisir une gourde qui tient ses promesses.'
  }
];

export function slugify(input) {
  return String(input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatCad(value) {
  if (value === null || value === undefined || value === '') return null;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(n);
}

export function parsePipe(value) {
  if (!value) return [];
  return String(value)
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean);
}