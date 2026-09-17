// =====================================================================
// CONNECTEUR GOOGLE SHEETS API v4
// Authentification par compte de service (JWT RS256 signe localement,
// zero dependance npm : node:crypto + fetch).
// Mode strict : si les credentials sont absents/invalides, aucune
// operation n'est tentee. Pas de valeurs factices.
// =====================================================================

import { createPrivateKey, sign } from 'node:crypto';
import { SHEET_COLUMNS, SHEET_TITLE, SHEET_TAB } from './sheet-schema.mjs';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_URL = 'https://sheets.googleapis.com/v4/spreadsheets';

export class SheetsConnectionError extends Error {}

function b64url(buffer) {
  return Buffer.from(buffer).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function makeJwt(serviceAccount, ttlSeconds = 3600) {
  const { client_email: clientEmail, private_key: privateKey } = serviceAccount;
  if (!clientEmail || !privateKey) {
    throw new SheetsConnectionError('Service account incomplet (client_email / private_key manquants).');
  }
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: clientEmail,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: TOKEN_URL,
    iat: now,
    exp: now + ttlSeconds
  };
  const signingInput = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const key = createPrivateKey(privateKey);
  const signature = sign('RSA-SHA256', Buffer.from(signingInput, 'utf8'), key);
  return `${signingInput}.${b64url(signature)}`;
}

let cachedToken = null;
let cachedExpiry = 0;

async function getAccessToken(serviceAccount) {
  if (cachedToken && Date.now() < cachedExpiry - 60_000) return cachedToken;
  const assertion = makeJwt(serviceAccount);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion
  });
  const res = await fetch(TOKEN_URL, { method: 'POST', body });
  if (!res.ok) {
    throw new SheetsConnectionError(`Echec de l'echange du jeton (HTTP ${res.status}).`);
  }
  const data = await res.json();
  if (!data.access_token) {
    throw new SheetsConnectionError("Reponse de token sans access_token. Verifie les permissions du service account.");
  }
  cachedToken = data.access_token;
  cachedExpiry = Date.now() + Number(data.expires_in || 3600) * 1000;
  return cachedToken;
}

function columnLetter(index) {
  let n = index + 1;
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

export function columnLetters() {
  const letters = SHEET_COLUMNS.map((_, i) => columnLetter(i));
  const last = letters[letters.length - 1];
  return { first: letters[0], last, range: `${last}1:${last}100000` };
}

function toA1Range(startRow, startCol, numRows, numCols) {
  const r1 = startRow + 1;
  const c1 = columnLetter(startCol);
  const c2 = columnLetter(startCol + numCols - 1);
  const r2 = startRow + numRows;
  return `'${SHEET_TAB}'!${c1}${r1}:${c2}${r2}`;
}

export async function createSpreadsheet(serviceAccount) {
  const token = await getAccessToken(serviceAccount);
  const res = await fetch(SHEETS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      properties: { title: SHEET_TITLE },
      sheets: [{ properties: { title: SHEET_TAB } }]
    })
  });
  if (!res.ok) throw new SheetsConnectionError(`Creation du Spreadsheet refusee (HTTP ${res.status}).`);
  const data = await res.json();
  await updateHeaders(serviceAccount, data.spreadsheetId);
  return { spreadsheetId: data.spreadsheetId, url: data.spreadsheetUrl };
}

export async function updateHeaders(serviceAccount, sheetId) {
  const token = await getAccessToken(serviceAccount);
  const values = [SHEET_COLUMNS.map((c) => c.label)];
  const range = `'${SHEET_TAB}'!A1:${columnLetters().last}1`;
  const res = await fetch(`${SHEETS_URL}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  });
  if (!res.ok) throw new SheetsConnectionError(`Ecriture des en-tetes refusee (HTTP ${res.status}).`);
  return true;
}

// ---------------------------------------------------------------------
// Lecture de toute la feuille -> tableau d'objets
// ---------------------------------------------------------------------
export async function readAllRows(serviceAccount, sheetId, tab = SHEET_TAB) {
  const token = await getAccessToken(serviceAccount);
  const res = await fetch(`${SHEETS_URL}/${sheetId}/values/'${encodeURIComponent(tab)}'!A1:ZZ100000`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    throw new SheetsConnectionError(`Lecture du Sheet refusee (HTTP ${res.status}). Verifie que le service account a acces au document.`);
  }
  const data = await res.json();
  const rows = data.values || [];
  if (!rows.length) return [];
  const headers = rows[0].map((h) => String(h).trim());
  return rows.slice(1).map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      if (!h) return;
      obj[h] = row[i] !== undefined ? String(row[i]).trim() : '';
    });
    return obj;
  });
}

// ---------------------------------------------------------------------
// Ecriture d'une seule cellule / ligne (mise a jour du statut)
// ---------------------------------------------------------------------
export async function writeCell(serviceAccount, sheetId, columnLabel, rowIndex, value, tab = SHEET_TAB) {
  const token = await getAccessToken(serviceAccount);
  const colIndex = SHEET_COLUMNS.findIndex((c) => c.label === columnLabel);
  if (colIndex === -1) throw new Error(`Colonne inconnue: ${columnLabel}`);
  const range = `${columnLetter(colIndex)}${rowIndex + 1}`;
  const fullRange = `'${tab}'!${range}`;
  const res = await fetch(`${SHEETS_URL}/${sheetId}/values/${encodeURIComponent(fullRange)}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values: [[String(value)]] })
  });
  return res.ok;
}

export async function writeRow(serviceAccount, sheetId, dataRowIndex, record, tab = SHEET_TAB) {
  const token = await getAccessToken(serviceAccount);
  const values = [SHEET_COLUMNS.map((c) => record[c.label] ?? '')];
  const range = toA1Range(dataRowIndex, 0, 1, SHEET_COLUMNS.length);
  const res = await fetch(`${SHEETS_URL}/${sheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ values })
  });
  return res.ok;
}