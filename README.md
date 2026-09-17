# Amazon Affiliate CA — site média, comparateur et guides d'achat

Site d'affiliation Amazon.ca professionnel, rapide et optimisé SEO, dont le contenu est piloté
par un **Google Sheet** faisant office de source de vérité. Aucun contenu n'est publié sans avoir
passé une chaîne de contrôles (données, faits, SEO, qualité, duplication, lien affilié).

```
Google Sheet ──sync──▶ SQLite ──generate──▶ Contenu (DRAFT) ──publish──▶ Contenu (PUBLISHED)
                                                                              │
                                          web/data/site-data.json ◀──export────┘
                                                     │
                                              Next.js (SSG) ──▶ Vercel
```

## Prérequis

- **Node.js >= 22.5** (utilise `node:sqlite` et `fetch` natifs).
- **npm** (sous Windows, utiliser `npm.cmd` — la policy PowerShell bloque `npm.ps1`).
- Le pipeline `scripts/` n'a **aucune dépendance npm** ; seul le site `web/` en a.

## Installation

```powershell
npm install
Copy-Item .env.example .env   # puis remplir les valeurs REELLES
```

## Configuration (`.env`)

| Variable | Rôle |
| --- | --- |
| `GOOGLE_SHEET_ID` | ID du Google Sheet (dans l'URL `/spreadsheets/d/<ID>/edit`). |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | Chemin du JSON du service account, ou le JSON inline. |
| `GOOGLE_SHEET_TAB` | Onglet des produits (`Products`). |
| `SITE_URL` | URL publique (canonical, sitemap, JSON-LD). |
| `SITE_NAME` | Nom public du site. |
| `SITE_LANG` | Langue (`fr-CA`). |
| `MIN_QUALITY_SCORE` | Seuil de publication automatique (défaut `90`). |
| `AUTO_PUBLISH` | `false` = tout passe en DRAFT/REVIEW. |
| `DB_PATH`, `CONTENT_OUT` | Chemins optionnels (tests / isolation). |

Ne jamais mettre de fausses valeurs : si Google n'est pas configuré, le pipeline reste en mode
local et **ne publie rien**.

## Commandes

```powershell
npm run sheet:create   # crée l'onglet + les 42 colonnes du schéma
npm run db:init        # initialise la base SQLite locale
npm run sync           # Google Sheet -> SQLite (+ validation)
npm run verify         # rapport de vérification des produits
npm run generate       # génère les DRAFT (pages produits + comparatifs)
npm run publish        # applique les contrôles et publie ce qui passe (-- --force pour le seuil)
npm run status         # tableau de bord (produits, contenus, blocages)
npm run export:site    # écrit web/data/site-data.json
npm run dev:web        # serveur de développement Next.js
npm run build:web      # build de production
npm test               # suite de tests (node --test)
```

## Chaîne de contrôle à la publication

1. **DATA CHECK** — champs critiques, ASIN, URL, cohérence.
2. **FACT CHECK** — `verification_status = VERIFIED` obligatoire.
3. **SEO CHECK** — longueur minimale, meta, slug.
4. **QUALITY CHECK** — score /100 >= `MIN_QUALITY_SCORE`.
5. **DUPLICATION CHECK** — similarité avec les contenus existants.
6. **AFFILIATE LINK CHECK** — lien affilié présent **et** porteur d'un tag.

Un échec bloque la publication ; le lien affilié est conservé à l'identique.

## Règles éditoriales non négociables

- Aucune donnée inventée : en cas de doute, afficher « Information à vérifier ».
- Ne jamais écrire « nous avons testé » sans test réel.
- Les prix sont présentés comme **observés** à une date, jamais comme garantis.
- Divulgation d'affiliation obligatoire (page dédiée + mention sur les pages monétisées).
- Une page catégorie vide n'est pas exposée (anti « thin content »).

## Structure du dépôt

```
scripts/               Pipeline (zéro dépendance npm)
  bin/                 Points d'entrée CLI (sync, verify, generate, publish, export…)
  lib/                 Logique : sheet, db, validation, génération, qualité, publication
  test/                Tests node:test
seed/demo-products.json Fixtures de démonstration (jamais publiables)
web/                   Site Next.js (App Router, SSG)
  app/                 Routes (produit, catégorie, comparatifs, guides, avis, faq…)
  components/          Composants d'affichage
  lib/                 Accès aux données + JSON-LD
  data/site-data.json  Export statique consommé par le site
```

## Déploiement (Vercel)

1. Régénérer les données : `npm run export:site` (commit de `web/data/site-data.json`).
2. Pousser le code sur GitHub (`git push`).
3. Sur Vercel : **Root Directory** = `web`, build `npm run build`, install `npm install`.
4. Définir `SITE_URL` et `SITE_NAME` dans les variables d'environnement Vercel.

## Connexion Google Sheet (service account)

Le pipeline écrit dans le Sheet via un service account. Pour le configurer :

1. Google Cloud Console → créer/ouvrir un projet.
2. Activer l'API **Google Sheets** et **Google Drive**.
3. **IAM & Admin → Comptes de service → Créer un compte de service** → télécharger la clé JSON.
4. Ouvrir le Sheet → **Partager** → ajouter l'**adresse email** du compte de service comme **Éditeur**.
5. Dans `.env` : `GOOGLE_SERVICE_ACCOUNT_JSON=<chemin_ou_JSON>` + `GOOGLE_SHEET_ID=<ID>`.

Le Sheet doit contenir un onglet `Products` avec les 41 colonnes du schéma (`scripts/lib/sheet-schema.mjs`). `npm run sheet:create` le crée.

## Statut actuel

- ✅ Pipeline, tests (25/25), build du site (34 pages) vérifiés avec les 10 produits.
- ✅ Lien affilié : accepte `amzn.to/...` et `amazon.ca/-/fr/...`.
- ⏳ **Google Sheet** : vide ; le service account n'est pas encore configuré (le site actuel tourne sur l'export local).
- ⏳ **GitHub / Vercel** : CLI présentes (`gh` 2.8.9, `vercel` 59.20.0) mais **pas authentifiées** (`vercel whoami` → `login_required`). Fournissez :
  - L'**URL du dépôt GitHub** + un **Personal Access Token** (ou poussez manuellement).
  - Connectez le dépôt dans le tableau de bord Vercel (pas besoin de CLI).
