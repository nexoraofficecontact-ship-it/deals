// =====================================================================
// MAILLAGE INTERNE AUTOMATIQUE (§18)
// Chaque contenu recherche les contenus deja presents et cree des liens
// pertinents (salary uniquement si le lien apporte de la valeur).
// =====================================================================

import { listProducts, getContent } from './db.mjs';
import { slugify } from './util.mjs';

const STOPWORDS = new Set(
  'le la les de des du un une et ou mais donc car pour avec dans sur selon entre ce cette ces ses leur leurs son sa plus moins très bien meilleur meilleurs guide complet que qui quoi au aux en là à afin afin de c est ont sont était avaient avoir été ont eu'.split(' ')
);

function tokens(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-zàâäéèêëîïôöùûüçœæ\s-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

function scoreRelevance(text, target) {
  const textTokens = new Set(tokens(text));
  const targetTokens = tokens(`${target.product_name} ${target.product_type || ''} ${target.category} ${target.subcategory || ''} ${target.keyword_cluster || ''}`);
  let hits = 0;
  for (const t of targetTokens) if (textTokens.has(t)) hits += 1;
  return hits;
}

/**
 * Retourne les produits pertinents a lier depuis un contenu donne.
 * @param {string} bodyMd contenu du page courante
 * @param {string} [sourceSlug] slug de la page courante
 */
export function suggestInternalLinks(bodyMd, sourceSlug) {
  const candidates = [];
  const normalizedBody = bodyMd.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
  for (const p of listProducts()) {
    if (!p.product_name) continue;
    const targetSlug = `/${p.product_id}/`;
    const productSlug = `/${p.product_id}/`;
    if (sourceSlug && slugify(sourceSlug) === productSlug) continue;
    const relevance = scoreRelevance(normalizedBody, p);
    if (relevance >= 1) {
      candidates.push({ targetSlug, anchor: p.product_name, relevance });
    }
  }
  candidates.sort((a, b) => b.relevance - a.relevance);
  return candidates.slice(0, 5);
}

/** Ajoute une section "En savoir plus" avec les liens internes pertinents. */
export function attachInternalLinks(bodyMd, links, sourceSlug, maxLinks = 4) {
  if (!links || !links.length) return bodyMd;
  const chosen = links
    .filter((l) => l.targetSlug !== `/${sourceSlug}/`)
    .slice(0, maxLinks);
  if (!chosen.length) return bodyMd;
  const section = [
    '',
    '## En savoir plus',
    '',
    ...chosen.map((l) => `- [${l.anchor}](${l.targetSlug})`)
  ].join('\n');
  return `${bodyMd.replace(/\s+$/g, '')}\n${section}\n`;
}

/** Verifie qu'un lien interne n'a pas deja ete insere. */
export function buildInternalLinksContent(bodyMd, links, sourceSlug) {
  let md = bodyMd;
  for (const link of links) {
    if (md.includes(link.targetSlug)) continue;
    const pattern = new RegExp(`(^|[^\\w\\[\\]()\\/-])(${escapeRegExp(link.anchor)})(?![^\\[]*\\][^(]*\\))`, 'g');
    const replacement = `$1[$2](${link.targetSlug})`;
    md = md.replace(pattern, replacement);
    if (md.includes(link.targetSlug)) break;
  }
  return md;
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}