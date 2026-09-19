// Utilitaires partages (slug, pipes, dates) — aucune dependance.

const ACCENTS = { à: 'a', â: 'a', ä: 'a', é: 'e', è: 'e', ê: 'e', ë: 'e', ï: 'i', î: 'i', ô: 'o', ö: 'o', ù: 'u', û: 'u', ü: 'u', ç: 'c', œ: 'oe', æ: 'ae', ñ: 'n' };

export function slugify(input, fallback = 'page') {
  let s = String(input == null ? '' : input).toLowerCase();
  s = s.replace(/[àâäá]/g, 'a').replace(/[éèêë]/g, 'e').replace(/[ïî]/g, 'i').replace(/[ôö]/g, 'o').replace(/[ùûü]/g, 'u').replace(/[ç]/g, 'c').replace(/[œ]/g, 'oe').replace(/[æ]/g, 'ae').replace(/ñ/g, 'n');
  s = s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return s || fallback;
}

/** Decoupe une valeur pipe-separee en tableau propre. */
export function parsePipe(value, separators = '|') {
  if (value == null) return [];
  const escaped = String(separators).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return String(value)
    .split(new RegExp(`[${escaped}]`))
    .map((s) => s.trim())
    .filter(Boolean);
}

export function splitLines(value) {
  if (value == null) return [];
  return String(value)
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseSpecs(value) {
  return parsePipe(value).map((item) => {
    const i = item.indexOf(':');
    if (i === -1) return { name: item, value: '' };
    return { name: item.slice(0, i).trim(), value: item.slice(i + 1).trim() };
  });
}

export function parseSemi(value) {
  if (value == null) return '';
  return String(value).replace(/[“”"']/g, '"').trim();
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function formatCad(value) {
  if (value == null || value === '' || Number.isNaN(Number(value))) return null;
  return new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(Number(value));
}

export function isValidAsin(value) {
  return /^[B0-9][A-Z0-9]{9}$/.test(String(value || ''));
}

export function isValidUrl(value) {
  try {
    const u = new URL(value);
    return (u.protocol === 'http:' || u.protocol === 'https:') && u.hostname.includes('.');
  } catch {
    return false;
  }
}

export function looksLikeAffiliateUrl(value) {
  if (!value) return false;
  if (/^https?:\/\/(www\.)?amzn\.to\//.test(value)) return true;
  if (/^https?:\/\/(www\.)?amazon\.ca\/-\/fr\//.test(value)) return true;
  return /tag=[^&]+/.test(value) || /\/ref=/.test(value);
}

export function amazonCaUrl(value) {
  if (!value) return false;
  try {
    const u = new URL(value);
    return (
      u.hostname === 'www.amazon.ca' ||
      u.hostname === 'amazon.ca' ||
      /^((www\.)?amzn\.to)$/.test(u.hostname)
    );
  } catch {
    return false;
  }
}

export function ratingInRange(value) {
  if (value === '' || value == null) return true;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 && n <= 5;
}

export function countWords(text) {
  const s = String(text || '').trim();
  if (!s) return 0;
  return s.split(/\s+/).length;
}