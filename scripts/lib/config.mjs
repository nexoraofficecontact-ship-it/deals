// =====================================================================
// CONFIGURATION DU PIPELINE
// Charge .env a la racine du repo. Ne suppose JAMAIS qu'une connexion
// existe : expose un etat `connected` detecte objectivement.
// =====================================================================

import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const SCRIPTS_DIR = resolve(__dirname, '..');
export const REPO_ROOT = resolve(SCRIPTS_DIR, '..');
export const DB_DIR = resolve(REPO_ROOT, 'db');
export const CONTENT_DIR = resolve(REPO_ROOT, 'content');
export const SEED_DIR = resolve(REPO_ROOT, 'seed');
export const WEB_DIR = resolve(REPO_ROOT, 'web');

function loadDotEnv() {
  const envFile = resolve(REPO_ROOT, '.env');
  if (!existsSync(envFile)) return;
  const raw = readFileSync(envFile, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

loadDotEnv();

function readServiceAccount() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!raw) return null;
  const candidate = resolve(REPO_ROOT, raw);
  if (existsSync(candidate)) {
    try {
      return JSON.parse(readFileSync(candidate, 'utf8'));
    } catch {
      return null;
    }
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function getConfig() {
  const serviceAccount = readServiceAccount();
  const sheetId = process.env.GOOGLE_SHEET_ID?.trim() || '';
  const tab = process.env.GOOGLE_SHEET_TAB?.trim() || 'Products';

  return {
    // Connexions
    google: {
      sheetId,
      tab,
      serviceAccount,
      connected: Boolean(sheetId && serviceAccount?.client_email && serviceAccount?.private_key)
    },
    site: {
      url: (process.env.SITE_URL || '').replace(/\/+$/, ''),
      lang: process.env.SITE_LANG?.trim() || 'fr-CA'
    },
    publish: {
      minQualityScore: Number(process.env.MIN_QUALITY_SCORE || 90),
      autoPublish: process.env.AUTO_PUBLISH === 'true'
    },
    paths: {
      dbDir: DB_DIR,
      dbFile: process.env.DB_PATH || resolve(DB_DIR, 'affiliate.db'),
      contentDir: process.env.CONTENT_OUT || CONTENT_DIR,
      seedDir: SEED_DIR,
      webDir: WEB_DIR
    }
  };
}

export function envReport() {
  const cfg = getConfig();
  return {
    googleSheetConfigured: cfg.google.connected,
    reasonsDisconnected: [
      !cfg.google.sheetId && 'GOOGLE_SHEET_ID manquant',
      !cfg.google.serviceAccount && 'GOOGLE_SERVICE_ACCOUNT_JSON manquant'
    ].filter(Boolean),
    siteUrlConfigured: Boolean(cfg.site.url),
    autoPublish: cfg.publish.autoPublish,
    minQualityScore: cfg.publish.minQualityScore
  };
}