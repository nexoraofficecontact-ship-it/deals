// =====================================================================
// PIPELINE DE PUBLICATION (§21, §22, §24)
// Etapes : DATA CHECK -> FACT CHECK -> SEO CHECK -> QUALITY CHECK ->
//          DUPLICATION CHECK -> AFFILIATE LINK CHECK -> PUBLISH
// Blocages stricts. Write-back dans le Google Sheet si connecte.
// =====================================================================

import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateProduct, SEVERITY } from './validate.mjs';
import { scoreProductPage, scoreComparison } from './quality.mjs';
import { upsertContent, listContents, addInternalLink } from './db.mjs';
import { generateSitemap } from './sitemap.mjs';
import { getConfig } from './config.mjs';
import { todayIso, countWords } from './util.mjs';
import { generateProductPage } from './content-gen.mjs';
import { suggestInternalLinks, attachInternalLinks } from './internal-links.mjs';

const MIN_WORDS = 300;

/**
 * Similarite textuelle simple pour detecter les doublons (duplication check).
 */
export function similarity(a, b) {
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9àâäéèêëîïôöùûüçœæ\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const wa = new Set(norm(a).split(' '));
  const wb = new Set(norm(b).split(' '));
  if (!wa.size || !wb.size) return 0;
  let inter = 0;
  for (const w of wa) if (wb.has(w)) inter += 1;
  return inter / Math.min(wa.size, wb.size);
}

export function duplicationCheck(proposed, existingContents) {
  const flagged = [];
  for (const existing of existingContents) {
    const sim = similarity(proposed, existing.body_md || '');
    if (sim > 0.75) {
      flagged.push({ slug: existing.slug, similarity: Math.round(sim * 100) });
    }
  }
  return flagged;
}

/**
 * Tente de publier le contenu d'un produit.
 * Retourne { decision, reason, filePath, score }.
 */
export function publishProductPage(product, opts = { force: false }) {
  const reasons = [];
  const settings = { force: opts.force, writeFile: opts.writeFile !== false };

  // 1) DATA CHECK
  const validation = validateProduct(product);
  const criticalErrors = validation.errors.filter((e) => e.severity === SEVERITY.CRITICAL);
  if (validation.blocked) {
    reasons.push(`DATA CHECK échoué : ${criticalErrors.map((e) => e.message).join(' ; ')}`);
  }

  // 2) FACT CHECK
  if (product.verification_status !== 'VERIFIED') {
    reasons.push('FACT CHECK échoué : produit non VERIFIED.');
  }

  // 3) génération du contenu, maillage interne puis SEO CHECK
  const content = generateProductPage(product);
  const links = suggestInternalLinks(content.body_md, null)
    .filter((l) => l.targetSlug !== `/${product.product_id}/`);
  content.body_md = attachInternalLinks(content.body_md, links, content.slug);
  content.internalLinks = links;
  const words = countWords(content.body_md);
  if (words < MIN_WORDS) reasons.push(`SEO CHECK : contenu trop court (${words} mots < ${MIN_WORDS}).`);
  if (!content.metaTitle) reasons.push('SEO CHECK : meta title manquant.');
  if (!content.slug) reasons.push('SEO CHECK : slug manquant.');

  // 4) QUALITY CHECK
  const score = scoreProductPage({ product, content, validation });
  if (score.total < getConfig().publish.minQualityScore && !opts.force) {
    reasons.push(`QUALITY CHECK : score ${score.total}/100 < seuil ${getConfig().publish.minQualityScore}.`);
  }

  // 5) DUPLICATION CHECK
  const existing = listContents();
  const duplicates = duplicationCheck(content.body_md, existing);
  if (duplicates.length && !opts.force) {
    reasons.push(`DUPLICATION CHECK : contenu similaire à ${duplicates.map((d) => d.slug).join(', ')}.`);
  }

  // 6) AFFILIATE LINK CHECK
  if (!product.affiliate_url || !/tag=[^&]+|\/ref=/.test(product.affiliate_url)) {
    reasons.push('AFFILIATE LINK CHECK : lien affilié absent ou sans tag.');
  }

  if (reasons.length && !opts.force) {
    return { decision: 'DRAFT', reasons, score: score.total };
  }

  // PUBLISH
  const outDir = resolve(getConfig().paths.contentDir, 'articles', content.slug);
  if (settings.writeFile) {
    mkdirSync(outDir, { recursive: true });
  }
  const filePath = resolve(outDir, 'index.md');
  const frontmatter = [
    '---',
    `slug: ${content.slug}`,
    `title: "${escapeTitle(content.title)}"`,
    `metaTitle: "${escapeTitle(content.metaTitle)}"`,
    `metaDescription: "${escapeTitle(content.metaDescription)}"`,
    `kind: ${content.kind}`,
    `keyword: "${escapeTitle(content.keyword || '')}"`,
    `qualityScore: ${score.total}`,
    `schema: ${content.schema_type}`,
    `entities: [${(content.entities || []).map((e) => `"${e}"`).join(', ')}]`,
    `publishedAt: "${todayIso()}"`,
    '---',
    ''
  ].join('\n');
  if (settings.writeFile) {
    writeFileSync(filePath, frontmatter + content.body_md, 'utf8');
  }

  upsertContent({
    slug: content.slug,
    kind: content.kind,
    title: content.title,
    excerpt: content.excerpt,
    body_md: content.body_md,
    keyword: content.keyword,
    quality_score: score.total,
    status: 'PUBLISHED',
    schema_type: content.schema_type,
    entities: content.entities,
    published_at: todayIso(),
    updated_at: todayIso()
  });

  registerInternalLinks(content.slug, content.internalLinks || []);

  generateSitemap();

  return { decision: 'PUBLISHED', reasons, score: score.total, filePath, slug: content.slug };
}

/**
 * Tente de publier un article comparatif.
 * Un comparatif n'est publiable que si TOUS ses produits sont VERIFIED et
 * non bloqués. Retourne { decision, reasons, filePath, score }.
 */
export function publishComparison(content, products, opts = { force: false }) {
  const reasons = [];
  const settings = { force: opts.force, writeFile: opts.writeFile !== false };

  if (!content || content.kind !== 'comparison') {
    return { decision: 'DRAFT', reasons: ['CONTENT CHECK : contenu comparatif invalide.'], score: 0 };
  }
  if (!Array.isArray(products) || products.length < 2) {
    reasons.push('DATA CHECK échoué : un comparatif exige au moins 2 produits.');
  }
  for (const product of products) {
    if (product.verification_status !== 'VERIFIED') {
      reasons.push(`FACT CHECK échoué : ${product.product_id} non VERIFIED.`);
      continue;
    }
    const validation = validateProduct(product);
    if (validation.blocked) {
      reasons.push(`DATA CHECK échoué : ${product.product_id} bloqué.`);
    }
  }

  const score = scoreComparison({ products, content });
  if (score.total < getConfig().publish.minQualityScore && !opts.force) {
    reasons.push(`QUALITY CHECK : score ${score.total}/100 < seuil ${getConfig().publish.minQualityScore}.`);
  }

  const duplicates = duplicationCheck(content.body_md, listContents());
  if (duplicates.length && !opts.force) {
    reasons.push(`DUPLICATION CHECK : contenu similaire à ${duplicates.map((d) => d.slug).join(', ')}.`);
  }

  if (reasons.length && !opts.force) {
    return { decision: 'DRAFT', reasons, score: score.total };
  }

  const outDir = resolve(getConfig().paths.contentDir, 'articles', content.slug);
  if (settings.writeFile) {
    mkdirSync(outDir, { recursive: true });
  }
  const filePath = resolve(outDir, 'index.md');
  const entities = products.map((p) => p.product_id);
  const frontmatter = [
    '---',
    `slug: ${content.slug}`,
    `title: "${escapeTitle(content.title)}"`,
    `metaTitle: "${escapeTitle(content.metaTitle || content.title)}"`,
    `metaDescription: "${escapeTitle(content.metaDescription || content.excerpt || '')}"`,
    `kind: comparison`,
    `keyword: "${escapeTitle(content.keyword || '')}"`,
    `qualityScore: ${score.total}`,
    `schema: ItemList`,
    `entities: [${entities.map((e) => `"${e}"`).join(', ')}]`,
    `publishedAt: "${todayIso()}"`,
    '---',
    ''
  ].join('\n');
  if (settings.writeFile) {
    writeFileSync(filePath, frontmatter + content.body_md, 'utf8');
  }

  upsertContent({
    slug: content.slug,
    kind: 'comparison',
    title: content.title,
    excerpt: content.excerpt,
    body_md: content.body_md,
    keyword: content.keyword,
    quality_score: score.total,
    status: 'PUBLISHED',
    schema_type: 'ItemList',
    entities,
    published_at: todayIso(),
    updated_at: todayIso()
  });

  registerInternalLinks(
    content.slug,
    products.map((p) => ({ targetSlug: `/${p.product_id}/`, anchor: p.product_name }))
  );
  generateSitemap();

  return { decision: 'PUBLISHED', reasons, score: score.total, filePath, slug: content.slug };
}

function escapeTitle(s) {
  return String(s || '').replace(/"/g, '\\"').replace(/\n/g, ' ').trim();
}

function registerInternalLinks(slug, links) {
  for (const l of links) {
    addInternalLink(slug, l.targetSlug, l.anchor, 'article');
  }
}

/** Raccourci pour publication depuis la ligne de commande. */
export async function publishAndWriteBack(product) {
  const result = publishProductPage(product);
  const cfg = getConfig();
  if (cfg.google.connected && result.decision === 'PUBLISHED') {
    const { writeCell } = await import('./sheets.mjs');
    const { getProduct, closeDb } = await import('./db.mjs');
    const stored = getProduct(product.product_id);
    const rowIndex = stored?.row_index;
    if (rowIndex) {
      const ok1 = await writeCell(cfg.google.serviceAccount, cfg.google.sheetId, 'article_status', rowIndex, 'PUBLISHED');
      const ok2 = await writeCell(cfg.google.serviceAccount, cfg.google.sheetId, 'article_url', rowIndex, `/${result.slug}/`);
      const ok3 = await writeCell(cfg.google.serviceAccount, cfg.google.sheetId, 'last_content_update', rowIndex, todayIso());
      closeDb();
      return { ...result, sheetWriteBack: { ok1, ok2, ok3 } };
    }
  }
  return result;
}