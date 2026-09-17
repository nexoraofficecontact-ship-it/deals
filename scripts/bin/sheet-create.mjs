// Crée le Google Sheet "Amazon Affiliate Product Database" (structure + onglet)
// SEULEMENT si les credentials service account sont présents (pas de valeur factice).
import { getConfig, envReport } from '../lib/config.mjs';

const cfg = getConfig();
const report = envReport();

if (!cfg.google.connected) {
  console.error('Impossible de créer le Sheet : Google Sheets non configuré.');
  console.error('Manquant:', report.reasonsDisconnected.join(' ; '));
  console.error('Action requise :');
  console.error('  1. Créer un compte de service Google (IAM) avec accès à la Sheets API,');
  console.error('  2. Générer une clé JSON, la placer dans le repo (hors git),');
  console.error('  3. Renseigner GOOGLE_SERVICE_ACCOUNT_JSON et GOOGLE_SHEET_ID dans .env.');
  process.exit(1);
}

const { createSpreadsheet, updateHeaders } = await import('../lib/sheets.mjs');
const { SHEET_COLUMNS, SHEET_TITLE } = await import('../lib/sheet-schema.mjs');

let sheetId = cfg.google.sheetId;
if (!sheetId) {
  const created = await createSpreadsheet(cfg.google.serviceAccount);
  sheetId = created.spreadsheetId;
  console.log(`Spreadsheet créé: ${created.url}`);
} else {
  await updateHeaders(cfg.google.serviceAccount, sheetId);
  console.log(`En-têtes écrits sur le Sheet existant (${sheetId}).`);
}

console.log(`Structure appliquée (${SHEET_COLUMNS.length} colonnes).`);
console.log('Pensez à ajouter le client_email du service account en éditeur sur le Sheet.');