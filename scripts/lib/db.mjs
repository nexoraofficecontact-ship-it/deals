// =====================================================================
// COUCHE BASE DE DONNEES LOCALE (SQLite via node:sqlite, zero dep)
// Le Google Sheet reste la SOURCE EDITORIALE ; la base locale sert aux
// performances du site et a l'outillage (dashboard, reports).
// =====================================================================

import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { getConfig } from './config.mjs';

let db = null;

export function getDb() {
  if (db) return db;
  const { dbDir, dbFile } = getConfig().paths;
  if (!existsSync(dbDir)) mkdirSync(dbDir, { recursive: true });
  db = new DatabaseSync(dbFile);
  db.exec('PRAGMA journal_mode = WAL;');
  db.exec('PRAGMA foreign_keys = ON;');
  migrate(db);
  return db;
}

export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

export function resetDb() {
  closeDb();
}

// ---------------------------------------------------------------------
// MIGRATIONS (idempotentes)
// ---------------------------------------------------------------------
function migrate(database) {
  database.exec(`
    CREATE TABLE IF NOT EXISTS products (
      product_id        TEXT PRIMARY KEY,
      product_name      TEXT NOT NULL,
      brand             TEXT,
      category          TEXT,
      subcategory       TEXT,
      asin              TEXT UNIQUE,
      amazon_url        TEXT,
      affiliate_url     TEXT,
      price_cad         REAL,
      currency          TEXT DEFAULT 'CAD',
      rating            REAL,
      review_count      INTEGER,
      product_type      TEXT,
      key_features      TEXT,
      specifications    TEXT,
      pros              TEXT,
      cons              TEXT,
      ideal_for         TEXT,
      use_cases         TEXT,
      positioning       TEXT,
      keyword_cluster   TEXT,
      search_intent     TEXT,
      content_angles    TEXT,
      faq_topics        TEXT,
      source            TEXT,
      data_status       TEXT DEFAULT 'NEW',
      verification_status TEXT DEFAULT 'UNVERIFIED',
      last_checked      TEXT,
      date_added        TEXT,
      article_status    TEXT DEFAULT 'NOT_STARTED',
      article_url       TEXT,
      last_content_update TEXT,
      notes             TEXT,
      price_history     TEXT,
      competitor_products TEXT,
      comparison_group  TEXT,
      primary_keyword   TEXT,
      secondary_keywords TEXT,
      semantic_keywords TEXT,
      internal_links    TEXT,
      schema_type       TEXT,
      row_index         INTEGER,
      synced_at         TEXT
    );

    CREATE TABLE IF NOT EXISTS contents (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      slug          TEXT UNIQUE NOT NULL,
      kind          TEXT NOT NULL,
      title         TEXT NOT NULL,
      excerpt       TEXT,
      body_md       TEXT,
      keyword       TEXT,
      quality_score INTEGER,
      status        TEXT DEFAULT 'DRAFT',
      schema_type   TEXT,
      entities      TEXT,
      internal_links_json TEXT,
      published_at  TEXT,
      updated_at    TEXT
    );

    CREATE TABLE IF NOT EXISTS categories (
      slug TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      parent TEXT,
      updated_at TEXT
    );

    CREATE TABLE IF NOT EXISTS internal_links (
      from_slug TEXT NOT NULL,
      to_slug   TEXT NOT NULL,
      anchor    TEXT,
      kind      TEXT,
      PRIMARY KEY (from_slug, to_slug)
    );

    CREATE TABLE IF NOT EXISTS validation_errors (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id    TEXT NOT NULL,
      rule          TEXT NOT NULL,
      severity      TEXT NOT NULL,
      message       TEXT NOT NULL,
      created_at    TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_verification ON products(verification_status);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_products_article ON products(article_status);
    CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
  `);
}

// ---------------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------------
const PRODUCT_FIELDS = [
  'product_id', 'product_name', 'brand', 'category', 'subcategory', 'asin',
  'amazon_url', 'affiliate_url', 'price_cad', 'currency', 'rating', 'review_count',
  'product_type', 'key_features', 'specifications', 'pros', 'cons', 'ideal_for',
  'use_cases', 'positioning', 'keyword_cluster', 'search_intent', 'content_angles',
  'faq_topics', 'source', 'data_status', 'verification_status', 'last_checked',
  'date_added', 'article_status', 'article_url', 'last_content_update', 'notes',
  'price_history', 'competitor_products', 'comparison_group', 'primary_keyword',
  'secondary_keywords', 'semantic_keywords', 'internal_links', 'schema_type',
  'row_index', 'synced_at'
];

export function upsertProduct(record) {
  const database = getDb();
  const syncedAt = new Date().toISOString();
  const fields = [...PRODUCT_FIELDS];
  const placeholders = fields.map(() => '?').join(', ');
  const values = fields.map((f) => {
    const v = record[f] ?? record[f.replaceAll('_', '_')] ?? '';
    if (f === 'price_cad' || f === 'rating') return v === '' ? null : Number(v);
    if (f === 'review_count' || f === 'row_index') return v === '' || v == null ? null : Number(v);
    if (v === null || v === undefined) return '';
    return typeof v === 'object' ? JSON.stringify(v) : String(v);
  });
  const setClause = fields.map((f) => `${f} = excluded.${f}`).join(', ');
  database
    .prepare(
      `INSERT INTO products (${fields.join(', ')}) VALUES (${placeholders})
       ON CONFLICT(product_id) DO UPDATE SET ${setClause}`
    )
    .run(...values);
  return record.product_id;
}

export function getProduct(productId) {
  return getDb().prepare('SELECT * FROM products WHERE product_id = ?').get(productId);
}

export function getProductByAsin(asin) {
  return getDb().prepare('SELECT * FROM products WHERE asin = ?').get(asin);
}

export function listProducts(opts = {}) {
  const clauses = [];
  const params = [];
  if (opts.verification) {
    clauses.push('verification_status = ?');
    params.push(opts.verification);
  }
  if (opts.category) {
    clauses.push('category = ?');
    params.push(opts.category);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return getDb().prepare(`SELECT * FROM products ${where} ORDER BY category, product_name`).all(...params);
}

export function setArticleFields(productId, fields) {
  const database = getDb();
  const entries = Object.entries(fields).filter(([k]) => PRODUCT_FIELDS.includes(k));
  for (const [k, v] of entries) {
    database.prepare(`UPDATE products SET ${k} = ? WHERE product_id = ?`).run(String(v ?? ''), productId);
  }
}

export function productsByCategory() {
  return getDb()
    .prepare('SELECT category, COUNT(*) AS n FROM products GROUP BY category ORDER BY n DESC')
    .all();
}

export function productCounts() {
  const total = getDb().prepare('SELECT COUNT(*) AS n FROM products').get().n;
  const verified = getDb().prepare("SELECT COUNT(*) AS n FROM products WHERE verification_status = 'VERIFIED'").get().n;
  const needsReview = getDb().prepare("SELECT COUNT(*) AS n FROM products WHERE verification_status = 'NEEDS_REVIEW'").get().n;
  const unverified = getDb().prepare("SELECT COUNT(*) AS n FROM products WHERE verification_status IN ('UNVERIFIED','NEEDS_REVIEW')").get().n;
  const published = getDb().prepare("SELECT COUNT(*) AS n FROM products WHERE article_status = 'PUBLISHED'").get().n;
  return { total, verified, needsReview, unverified, published };
}

export function clearValidationErrors() {
  getDb().exec('DELETE FROM validation_errors');
}

export function addValidationError(productId, rule, severity, message) {
  const database = getDb();
  database
    .prepare('INSERT INTO validation_errors (product_id, rule, severity, message, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(productId, rule, severity, message, new Date().toISOString());
}

export function listValidationErrors() {
  return getDb().prepare('SELECT * FROM validation_errors ORDER BY severity DESC, created_at DESC').all();
}

// ---------------------------------------------------------------------
// CONTENTS
// ---------------------------------------------------------------------
export function upsertContent(content) {
  const database = getDb();
  const now = new Date().toISOString();
  database
    .prepare(
      `INSERT INTO contents (slug, kind, title, excerpt, body_md, keyword, quality_score, status, schema_type, entities, internal_links_json, published_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET
         title = excluded.title,
         excerpt = excluded.excerpt,
         body_md = excluded.body_md,
         keyword = excluded.keyword,
         quality_score = excluded.quality_score,
         status = excluded.status,
         schema_type = excluded.schema_type,
         entities = excluded.entities,
         internal_links_json = excluded.internal_links_json,
         updated_at = excluded.updated_at`
    )
    .run(
      content.slug, content.kind, content.title, content.excerpt ?? '', content.body_md ?? '',
      content.keyword ?? '', content.quality_score ?? null, content.status || 'DRAFT',
      content.schema_type ?? '',
      Array.isArray(content.entities) ? content.entities.join(',') : content.entities ?? '',
      JSON.stringify(content.internalLinks ?? []),
      content.published_at ?? null, content.updated_at ?? now
    );
  return content.slug;
}

export function getContent(slug) {
  return getDb().prepare('SELECT * FROM contents WHERE slug = ?').get(slug);
}

export function listContents(opts = {}) {
  const clauses = [];
  const params = [];
  if (opts.status) {
    clauses.push('status = ?');
    params.push(opts.status);
  }
  if (opts.kind) {
    clauses.push('kind = ?');
    params.push(opts.kind);
  }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  return getDb().prepare(`SELECT * FROM contents ${where} ORDER BY updated_at DESC`).all(...params);
}

export function contentCounts() {
  const draft = getDb().prepare("SELECT COUNT(*) AS n FROM contents WHERE status = 'DRAFT'").get().n;
  const review = getDb().prepare("SELECT COUNT(*) AS n FROM contents WHERE status = 'REVIEW'").get().n;
  const published = getDb().prepare("SELECT COUNT(*) AS n FROM contents WHERE status = 'PUBLISHED'").get().n;
  const updateRequired = getDb().prepare("SELECT COUNT(*) AS n FROM contents WHERE status = 'UPDATE_REQUIRED'").get().n;
  return { draft, review, published, updateRequired };
}

// ---------------------------------------------------------------------
// INTERNAL LINKS
// ---------------------------------------------------------------------
export function addInternalLink(fromSlug, toSlug, anchor, kind) {
  const database = getDb();
  database
    .prepare('INSERT OR IGNORE INTO internal_links (from_slug, to_slug, anchor, kind) VALUES (?, ?, ?, ?)')
    .run(fromSlug, toSlug, anchor, kind);
}

export function listInternalLinks() {
  return getDb().prepare('SELECT * FROM internal_links ORDER BY from_slug').all();
}

export function orphanPages() {
  const published = listContents({ status: 'PUBLISHED' });
  const withInbound = new Set(getDb().prepare('SELECT DISTINCT to_slug FROM internal_links').all().map((r) => r.to_slug));
  return published.filter((c) => !withInbound.has(c.slug));
}

export function linksFor(slug) {
  return getDb().prepare('SELECT * FROM internal_links WHERE to_slug = ? OR from_slug = ?').all(slug, slug);
}

// ---------------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------------
export function upsertCategory(category) {
  const database = getDb();
  database
    .prepare(
      `INSERT INTO categories (slug, name, description, parent, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(slug) DO UPDATE SET name=excluded.name, description=excluded.description, parent=excluded.parent, updated_at=excluded.updated_at`
    )
    .run(category.slug, category.name, category.description ?? '', category.parent ?? '', new Date().toISOString());
}

export function listCategories() {
  return getDb().prepare('SELECT * FROM categories ORDER BY slug').all();
}

export function getCategory(slug) {
  return getDb().prepare('SELECT * FROM categories WHERE slug = ?').get(slug);
}

export function upsertCategoriesFromProducts() {
  const byCategory = productsByCategory();
  const labels = {
    fitness: 'Fitness',
    audio: 'Audio',
    hydratation: 'Hydratation'
  };
  for (const { category } of byCategory) {
    const name = labels[category] || category;
    upsertCategory({ slug: category, name });
  }
}