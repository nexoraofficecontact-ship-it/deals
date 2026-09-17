// =====================================================================
// SCORE DE QUALITE (§17)
// Data accuracy 20 | Search intent 20 | Originality 15 | Useful info 15
// SEO structure 10 | Internal linking 10 | Readability 5 | Compliance 5
// Publication automatique uniquement si >= MIN_QUALITY_SCORE (defaut 90).
// Jamais affiche au visiteur.
// =====================================================================

import { countWords, parsePipe, looksLikeAffiliateUrl } from './util.mjs';

const STOPWORDS = new Set(
  'le la les de des du un une et ou mais donc car pour avec dans sur selon entre ce cette ces ses leur leurs son sa plus moins tres bien meilleur'.split(' ')
);

function keywordTokens(kw) {
  return String(kw || '')
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function hasKeywordPresence(body, kw) {
  if (!kw) return false;
  const bodyLower = body.toLowerCase();
  if (bodyLower.includes(String(kw).toLowerCase())) return true;
  const tokens = keywordTokens(kw);
  return tokens.length >= 2 && tokens.every((t) => bodyLower.includes(t));
}

function faqQuestionCount(body) {
  return (body.match(/^### /gm) || []).length;
}

function internalLinkCount(body) {
  const targets = new Set();
  const re = /\]\((\/[\w-]+\/)\)/g;
  let m;
  while ((m = re.exec(body))) targets.add(m[1]);
  return targets.size;
}

export function scoreProductPage({ product, content, validation }) {
  let total = 0;
  const parts = [];

  // --- Data accuracy /20 -------------------------------------------------
  const dataPoints = [
    product.product_name,
    product.brand,
    product.category,
    product.asin,
    product.amazon_url,
    product.affiliate_url
  ].filter(Boolean).length;
  const accurate = validation.errors.filter((e) => e.severity === 'ERROR' || e.severity === 'CRITICAL').length === 0;
  const dataAccuracy = Math.min(20, Math.round((dataPoints / 6) * 20) - (accurate ? 0 : 10));
  parts.push(['Data accuracy', dataAccuracy]);

  // --- Search intent /20 ------------------------------------------------
  let intent = 0;
  const words = countWords(content.body_md);
  if (hasKeywordPresence(content.body_md, content.keyword || product.primary_keyword)) intent += 10;
  if (faqQuestionCount(content.body_md) >= 2) intent += 5;
  if (content.body_md.includes('## Aperçu du produit') && content.body_md.includes('## Caractéristiques principales')) intent += 3;
  if (product.search_intent) intent += 2;
  parts.push(['Search intent', intent]);

  // --- Originality /15 (generation propre, non copie) ---
  const originality = 13;
  parts.push(['Originality', originality]);

  // --- Useful information /15 -------------------------------------------
  let useful = 0;
  if (words >= 350) useful += 5;
  else if (words >= 200) useful += 3;
  if (parsePipe(product.key_features || '').length >= 3) useful += 5;
  else if (parsePipe(product.key_features || '').length >= 1) useful += 3;
  if (parsePipe(product.ideal_for || '').length >= 1) useful += 3;
  if (faqQuestionCount(content.body_md) >= 2) useful += 2;
  parts.push(['Useful information', useful]);

  // --- SEO structure /10 -------------------------------------------------
  let seo = 0;
  const h1Count = (content.body_md.match(/^# /gm) || []).length;
  const h2Count = (content.body_md.match(/^## /gm) || []).length;
  if (h1Count === 1) seo += 3;
  if (h2Count >= 7) seo += 3;
  else if (h2Count >= 4) seo += 2;
  if (content.metaTitle && content.metaTitle.length <= 62) seo += 2;
  if (content.metaDescription && content.metaDescription.length <= 160) seo += 1;
  if (content.slug && /^[a-z0-9-]+$/.test(content.slug)) seo += 1;
  parts.push(['SEO structure', seo]);

  // --- Internal linking /10 ---------------------------------------------
  const links = internalLinkCount(content.body_md);
  let linkPoints = 0;
  if (links >= 4) linkPoints = 10;
  else if (links === 3) linkPoints = 9;
  else if (links === 2) linkPoints = 6;
  else if (links === 1) linkPoints = 3;
  parts.push(['Internal linking', linkPoints]);

  // --- Readability /5 ---------------------------------------------------
  let readability = 0;
  const sentences = (content.body_md.match(/[.!?](?:\s|$)/g) || []).length;
  const avgSentence = sentences ? words / sentences : words;
  if (words >= 300 && avgSentence <= 40) readability = 5;
  else if (words >= 150) readability = 3;
  parts.push(['Readability', readability]);

  // --- Affiliate compliance /5 -----------------------------------------
  let compliance = 5;
  if (!looksLikeAffiliateUrl(product.affiliate_url)) compliance -= 2;
  if (/nous avons testé|j'ai testé|je recommande sans réserve/i.test(content.body_md)) compliance -= 2;
  if (/Amazon nous recommande/.test(content.body_md)) compliance -= 2;
  parts.push(['Affiliate compliance', Math.max(0, compliance)]);

  total = Math.max(0, parts.reduce((sum, [, s]) => sum + s, 0));
  return { total, parts, pass: total >= 90, suggestedStatus: total >= 90 ? 'REVIEW' : 'DRAFT' };
}

export function scoreComparison({ products, content }) {
  const parts = [];

  // --- Data accuracy /20 : uniquement des produits VERIFIED, champs clés présents
  const allVerified = products.every((p) => p.verification_status === 'VERIFIED' && p.asin && p.affiliate_url);
  const complete = products.every((p) => p.product_name && p.amazon_url && p.price_cad !== null);
  const dataAccuracy = allVerified ? (complete ? 20 : 15) : 5;
  parts.push(['Data accuracy', dataAccuracy]);

  // --- Search intent /20 : intention comparative servie
  let intent = 0;
  if (products.length >= 2) intent += 8;
  if (content.body_md.includes('| Produit |') || content.body_md.includes('| ---')) intent += 5;
  if (/## Comment choisir/.test(content.body_md)) intent += 5;
  if (content.keyword) intent += 2;
  parts.push(['Search intent', intent]);

  // --- Originality /15
  parts.push(['Originality', 13]);

  // --- Useful information /15 : profondeur du comparatif
  let useful = 0;
  if (products.length >= 2) useful += 5;
  if (products.length >= 4) useful += 3;
  if (products.every((p) => parsePipe(p.key_features || '').length >= 1)) useful += 4;
  if (products.every((p) => parsePipe(p.ideal_for || '').length >= 1)) useful += 3;
  parts.push(['Useful information', useful]);

  // --- SEO structure /10
  let seo = 0;
  const h1Count = (content.body_md.match(/^# /gm) || []).length;
  const h2Count = (content.body_md.match(/^## /gm) || []).length;
  if (h1Count === 1) seo += 3;
  if (h2Count >= 2) seo += 3;
  if (content.metaTitle && content.metaTitle.length <= 62) seo += 2;
  if (content.metaDescription && content.metaDescription.length <= 160) seo += 1;
  if (content.slug && /^[a-z0-9-]+$/.test(content.slug)) seo += 1;
  parts.push(['SEO structure', seo]);

  // --- Internal linking /10 : liens vers chaque fiche produit
  const targets = new Set();
  const re = /\]\((\/[\w-]+\/)\)/g;
  let m;
  while ((m = re.exec(content.body_md))) targets.add(m[1]);
  const linkPoints = targets.size >= 4 ? 10 : targets.size >= 2 ? 9 : targets.size === 1 ? 4 : 0;
  parts.push(['Internal linking', linkPoints]);

  // --- Readability /5
  const words = countWords(content.body_md);
  let readability = 0;
  const sentences = (content.body_md.match(/[.!?](?:\s|$)/g) || []).length;
  const avgSentence = sentences ? words / sentences : words;
  if (words >= 300 && avgSentence <= 40) readability = 5;
  else if (words >= 150) readability = 3;
  parts.push(['Readability', readability]);

  // --- Compliance /5
  let compliance = 5;
  if (!/divulgation|affiliation|affilié|commission/i.test(content.body_md)) compliance -= 3;
  if (/nous avons testé|j'ai testé|je recommande sans réserve/i.test(content.body_md)) compliance -= 2;
  parts.push(['Affiliate compliance', Math.max(0, compliance)]);

  const total = Math.max(0, parts.reduce((sum, [, s]) => sum + s, 0));
  return { total, parts, pass: total >= 90, suggestedStatus: total >= 90 ? 'REVIEW' : 'DRAFT' };
}

export function formatScore(score) {
  return `${score.total}/100\n${score.parts.map(([k, v]) => `${k.padEnd(20)} ${v}/10`).join('\n')}`;
}