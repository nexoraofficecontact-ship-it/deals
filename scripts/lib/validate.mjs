// =====================================================================
// MOTEUR DE VALIDATION
// Regles issues du §22 (ne JAMAIS publier si...) et §28 (ne pas inventer).
// Un produit ayant une erreur CRITIQUE est bloque ; anything uncertain
// passe en NEEDS_REVIEW.
// =====================================================================

import {
  isValidAsin,
  isValidUrl,
  looksLikeAffiliateUrl,
  amazonCaUrl,
  ratingInRange,
  parsePipe
} from './util.mjs';

export const SEVERITY = { CRITICAL: 'CRITICAL', ERROR: 'ERROR', WARNING: 'WARNING', INFO: 'INFO' };

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ASIN_RE = /^[B0-9][A-Z0-9]{9}$/;

/** Normalise un enregistrement brut du Sheet en produit interne. */
export function normalizeRecord(raw) {
  const get = (k) => (raw[k] === undefined || raw[k] === null ? '' : String(raw[k]).trim());
  const num = (k) => {
    const v = get(k);
    return v === '' ? null : Number(v.replace(/[$CA\s]/g, ''));
  };
  const product = {
    product_id: get('product_id'),
    product_name: get('product_name'),
    brand: get('brand'),
    category: slugFrom(get('category')),
    subcategory: slugFrom(get('subcategory')),
    asin: get('ASIN').toUpperCase(),
    amazon_url: get('Amazon_URL'),
    affiliate_url: get('affiliate_URL'),
    price_cad: num('price_CAD'),
    currency: get('currency') || 'CAD',
    rating: num('rating'),
    review_count: num('review_count'),
    product_type: get('product_type'),
    key_features: get('key_features'),
    specifications: get('specifications'),
    pros: get('pros'),
    cons: get('cons'),
    ideal_for: get('ideal_for'),
    use_cases: get('use_cases'),
    positioning: get('positioning'),
    keyword_cluster: slugFrom(get('keyword_cluster')),
    search_intent: get('search_intent'),
    content_angles: get('content_angles'),
    faq_topics: get('faq_topics'),
    source: get('source'),
    data_status: get('data_status') || 'NEW',
    verification_status: get('verification_status') || 'UNVERIFIED',
    last_checked: get('last_checked'),
    date_added: get('date_added'),
    article_status: get('article_status') || 'NOT_STARTED',
    article_url: get('article_url'),
    last_content_update: get('last_content_update'),
    notes: get('notes'),
    price_history: get('price_history'),
    competitor_products: get('competitor_products'),
    comparison_group: get('comparison_group'),
    primary_keyword: get('primary_keyword'),
    secondary_keywords: get('secondary_keywords'),
    semantic_keywords: get('semantic_keywords'),
    internal_links: get('internal_links'),
    schema_type: get('schema_type')
  };
  return product;
}

function slugFrom(value) {
  if (!value) return '';
  return String(value).toLowerCase().trim().replace(/\s+/g, '-');
}

/**
 * Analyse un produit et retourne { errors:[...], blocked:boolean }.
 * blocked = au moins une erreur CRITICAL (publication interdiscute).
 */
export function validateProduct(product) {
  const errors = [];
  const add = (rule, severity, message) => errors.push({ rule, severity, message });

  const req = (cond, rule, msg) => {
    if (!cond) add(rule, SEVERITY.CRITICAL, msg);
  };

  req(product.product_id, 'product_id', 'product_id manquant.');
  req(product.product_name, 'product_name', 'Nom du produit manquant.');
  req(product.brand, 'brand', 'Marque manquante.');
  req(product.category, 'category', 'Catégorie manquante.');
  req(product.asin, 'asin', 'ASIN manquant.');
  req(product.amazon_url, 'amazon_url', 'URL Amazon manquante.');
  req(product.affiliate_url, 'affiliate_url', 'URL affiliée manquante.');
  req(product.verification_status === 'VERIFIED', 'verification', 'Produit non VERIFIED — publication bloquée.');

  // Formats
  if (product.asin && !ASIN_RE.test(product.asin)) {
    add('asin_format', SEVERITY.CRITICAL, `ASIN invalide (format attendu: 10 caractères alphanumériques): ${product.asin}`);
  }
  if (product.amazon_url && !isValidUrl(product.amazon_url)) {
    add('amazon_url_format', SEVERITY.ERROR, 'URL Amazon invalide.');
  }
  if (product.amazon_url && isValidUrl(product.amazon_url) && !amazonCaUrl(product.amazon_url)) {
    add('amazon_domain', SEVERITY.ERROR, 'L\'URL Amazon ne pointe pas sur amazon.ca.');
  }
  if (product.affiliate_url && !isValidUrl(product.affiliate_url)) {
    add('affiliate_url_format', SEVERITY.CRITICAL, 'URL affiliée invalide.');
  }
  if (product.affiliate_url && isValidUrl(product.affiliate_url) && !amazonCaUrl(product.affiliate_url)) {
    add('affiliate_domain', SEVERITY.CRITICAL, 'L\'URL affiliée ne pointe pas sur amazon.ca.');
  }
  if (product.affiliate_url && isValidUrl(product.affiliate_url) && !looksLikeAffiliateUrl(product.affiliate_url)) {
    add('affiliate_tag', SEVERITY.ERROR, 'L\'URL affiliée semble dépourvue de tag d\'affiliation (tag= ou /ref= introuvable).');
  }
  if (product.rating !== null && !ratingInRange(product.rating)) {
    add('rating_range', SEVERITY.ERROR, `Note invalide (doit être entre 0 et 5): ${product.rating}`);
  }
  if (product.review_count !== null && (product.review_count < 0 || !Number.isInteger(product.review_count))) {
    add('review_count', SEVERITY.ERROR, 'Nombre d\'avis invalide.');
  }
  if (product.price_cad !== null && (product.price_cad < 0 || !Number.isFinite(product.price_cad))) {
    add('price', SEVERITY.ERROR, 'Prix invalide.');
  }
  for (const d of ['last_checked', 'date_added', 'last_content_update']) {
    const v = product[d];
    if (v && !DATE_RE.test(v)) add(`${d}_format`, SEVERITY.WARNING, `Date "${d}" au mauvais format (attendu AAAA-MM-JJ): ${v}`);
  }
  if (product.data_status === 'ARCHIVED' || product.data_status === 'DISABLED') {
    add('archived', SEVERITY.ERROR, `Produit ${product.data_status} — non publiable.`);
  }
  if (product.verification_status === 'NEEDS_REVIEW') {
    add('needs_review', SEVERITY.WARNING, 'verification_status = NEEDS_REVIEW : à réviser avant publication.');
  }

  // Detection d'information probablement pas encore vérifiée
  const criticalInfo = ['price_cad', 'key_features', 'specifications'];
  for (const field of criticalInfo) {
    if (product[field] === '' || product[field] === null) {
      add(`${field}_missing`, SEVERITY.INFO, `Donnée "${field}" absente du Sheet — ne jamais l'inventer; afficher « Information à vérifier ».`);
    }
  }

  // Si des données essentielles manquent alors que le produit est marqué VERIFIED -> descendre.
  const hasCriticalData = product.price_cad !== null || product.key_features || product.product_type;
  if (product.verification_status === 'VERIFIED' && !hasCriticalData) {
    errors.push({
      rule: 'verified_without_data',
      severity: SEVERITY.ERROR,
      message: 'Produit marqué VERIFIED mais sans prix ni caractéristiques vérifiés. Doit rester VERIFIED ? Contrôle manuel requis.'
    });
  }

  const blocked = errors.some((e) => e.severity === SEVERITY.CRITICAL);
  return { errors, blocked };
}

/** Verifie que le lien affilie est intact et jamais invente. */
export function affiliatePolicy(product) {
  const issues = [];
  if (product.affiliate_url && product.amazon_url) {
    // Le lien affilie doit etre distinct d'un lien nu invente : on exige
    // une preuve que le tag est present.
    if (!looksLikeAffiliateUrl(product.affiliate_url)) {
      issues.push('Le lien affilié exact doit être conservé (tag d\'affiliation présent).');
    }
  }
  return issues;
}

export function miniReport(product) {
  const report = validateProduct(product);
  const features = parsePipe(product.key_features || '');
  return {
    product_id: product.product_id,
    product_name: product.product_name,
    status: product.article_status,
    verification: product.verification_status,
    errors: report.errors.length,
    blocked: report.blocked,
    features_count: features.length,
    price_cad: product.price_cad
  };
}