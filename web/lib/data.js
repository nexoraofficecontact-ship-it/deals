// Couche de données du site : lit l'export statique produit par le pipeline.
// Aucune donnée n'est inventée ici : le site ne montre que l'export.
import siteData from '../data/site-data.json';

const data = siteData;

export function getSite() {
  return {
    url: data.site?.url || process.env.SITE_URL || 'http://localhost:3000',
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
