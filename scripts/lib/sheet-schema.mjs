// =====================================================================
// SCHÉMA OFFICIEL DU GOOGLE SHEET "Amazon Affiliate Product Database"
// Colonnes de la feuille (onglet) "Products".
// C'est la SOURCE DE VÉRITÉ : rien n'est publié sans passer ici.
// =====================================================================

export const SHEET_TITLE = 'Amazon Affiliate Product Database';

export const SHEET_TAB = 'Products';

/** @type {Array<{key:string, label:string, kind:'text'|'number'|'boolean'|'date'|'select', options?:string[], required:boolean, important:boolean, description:string}>} */
export const SHEET_COLUMNS = [
  {
    key: 'product_id',
    label: 'product_id',
    kind: 'text',
    required: true,
    important: true,
    description: 'Identifiant interne unique (slug court, ex: walking-pad-xplus). Généré si vide.'
  },
  {
    key: 'product_name',
    label: 'product_name',
    kind: 'text',
    required: true,
    important: true,
    description: 'Nom éditorial du produit (remplace le titre Amazon, ne pas recopier).'
  },
  {
    key: 'brand',
    label: 'brand',
    kind: 'text',
    required: true,
    important: true,
    description: 'Marque.'
  },
  {
    key: 'category',
    label: 'category',
    kind: 'text',
    required: true,
    important: true,
    description: 'Catégorie principale, ex: fitness, audio, hydratation.'
  },
  {
    key: 'subcategory',
    label: 'subcategory',
    kind: 'text',
    required: false,
    important: false,
    description: 'Sous-catégorie, ex: tapis-de-marche.'
  },
  {
    key: 'ASIN',
    label: 'ASIN',
    kind: 'text',
    required: true,
    important: true,
    description: 'Amazon Standard Identification Number (10 caractères).'
  },
  {
    key: 'Amazon_URL',
    label: 'Amazon_URL',
    kind: 'text',
    required: true,
    important: true,
    description: 'URL Amazon.ca propre (sans tag d’affiliation).'
  },
  {
    key: 'affiliate_URL',
    label: 'affiliate_URL',
    kind: 'text',
    required: true,
    important: true,
    description: 'URL avec TAG d’affiliation exact. JAMAIS inventé ni modifié.'
  },
  {
    key: 'price_CAD',
    label: 'price_CAD',
    kind: 'number',
    required: false,
    important: true,
    description: 'Prix observé en dollars canadiens (CAD).'
  },
  {
    key: 'currency',
    label: 'currency',
    kind: 'text',
    required: false,
    important: false,
    description: 'Devise (CAD par défaut).'
  },
  {
    key: 'rating',
    label: 'rating',
    kind: 'number',
    required: false,
    important: false,
    description: 'Note moyenne observée sur l’échelle de 5 (vérifiée sur Amazon.ca).'
  },
  {
    key: 'review_count',
    label: 'review_count',
    kind: 'number',
    required: false,
    important: false,
    description: 'Nombre d’avis observé.'
  },
  {
    key: 'product_type',
    label: 'product_type',
    kind: 'text',
    required: false,
    important: false,
    description: 'Type précis, ex: walking pad, bouteille isotherme 750 ml.'
  },
  {
    key: 'key_features',
    label: 'key_features',
    kind: 'text',
    required: false,
    important: false,
    description: 'Caractéristiques clés — SÉPARATEUR : « | » entre chaque feature.'
  },
  {
    key: 'specifications',
    label: 'specifications',
    kind: 'text',
    required: false,
    important: false,
    description: 'Spécifications vérifiées — format « nom: valeur | nom: valeur ».'
  },
  {
    key: 'pros',
    label: 'pros',
    kind: 'text',
    required: false,
    important: false,
    description: 'Points positifs vérifiés — séparateur « | ».'
  },
  {
    key: 'cons',
    label: 'cons',
    kind: 'text',
    required: false,
    important: false,
    description: 'Points à considérer — séparateur « | ».'
  },
  {
    key: 'ideal_for',
    label: 'ideal_for',
    kind: 'text',
    required: false,
    important: false,
    description: 'Profils pour lesquels le produit semble adapté — séparateur « | ».'
  },
  {
    key: 'use_cases',
    label: 'use_cases',
    kind: 'text',
    required: false,
    important: false,
    description: 'Cas d’usage — séparateur « | ».'
  },
  {
    key: 'positioning',
    label: 'positioning',
    kind: 'text',
    required: false,
    important: false,
    description: 'Positionnement éditorial (1-2 phrases).'
  },
  {
    key: 'keyword_cluster',
    label: 'keyword_cluster',
    kind: 'text',
    required: false,
    important: false,
    description: 'Cluster de contenu, ex: tapis-de-marche.'
  },
  {
    key: 'search_intent',
    label: 'search_intent',
    kind: 'select',
    options: ['informational', 'commercial', 'transactional', 'navigational'],
    required: false,
    important: false,
    description: 'Intention de recherche dominante.'
  },
  {
    key: 'content_angles',
    label: 'content_angles',
    kind: 'text',
    required: false,
    important: false,
    description: 'Angles de contenu possibles — séparateur « | ».'
  },
  {
    key: 'faq_topics',
    label: 'faq_topics',
    kind: 'text',
    required: false,
    important: false,
    description: 'Questions fréquentes à traiter — séparateur « | ».'
  },
  {
    key: 'source',
    label: 'source',
    kind: 'text',
    required: false,
    important: false,
    description: 'Origine des données (ex: page Amazon.ca vérifiée le <date>).'
  },
  {
    key: 'data_status',
    label: 'data_status',
    kind: 'select',
    options: ['NEW', 'ENRICHED', 'VALIDATED', 'ARCHIVED', 'DISABLED'],
    required: false,
    important: false,
    description: 'État du dossier produit.'
  },
  {
    key: 'verification_status',
    label: 'verification_status',
    kind: 'select',
    options: ['UNVERIFIED', 'VERIFIED', 'NEEDS_REVIEW', 'REJECTED'],
    required: true,
    important: true,
    description: 'Niveau de vérification. Seul VERIFIED permet la publication.'
  },
  {
    key: 'last_checked',
    label: 'last_checked',
    kind: 'date',
    required: false,
    important: false,
    description: 'Date de dernière vérification (AAAA-MM-JJ).'
  },
  {
    key: 'date_added',
    label: 'date_added',
    kind: 'date',
    required: false,
    important: false,
    description: 'Date d’ajout au Sheet (AAAA-MM-JJ).'
  },
  {
    key: 'article_status',
    label: 'article_status',
    kind: 'select',
    options: ['NOT_STARTED', 'DRAFT', 'REVIEW', 'PUBLISHED', 'UPDATE_REQUIRED', 'BLOCKED'],
    required: false,
    important: false,
    description: 'État de la page associée (écrit par le pipeline).'
  },
  {
    key: 'article_url',
    label: 'article_url',
    kind: 'text',
    required: false,
    important: false,
    description: 'URL de la page publiée (écrit par le pipeline).'
  },
  {
    key: 'last_content_update',
    label: 'last_content_update',
    kind: 'date',
    required: false,
    important: false,
    description: 'Dernière mise à jour du contenu (écrit par le pipeline).'
  },
  {
    key: 'notes',
    label: 'notes',
    kind: 'text',
    required: false,
    important: false,
    description: 'Notes éditoriales internes.'
  },
  // --- Options supplémentaires (§4) --------------------------------
  {
    key: 'price_history',
    label: 'price_history',
    kind: 'text',
    required: false,
    important: false,
    description: 'Historique des prix observés — « AAAA-MM-JJ:CAD | … ».'
  },
  {
    key: 'competitor_products',
    label: 'competitor_products',
    kind: 'text',
    required: false,
    important: false,
    description: 'ASIN ou product_id d’alternatives dans le même groupe.'
  },
  {
    key: 'comparison_group',
    label: 'comparison_group',
    kind: 'text',
    required: false,
    important: false,
    description: 'Groupe de comparaison utilisé par les articles comparatifs.'
  },
  {
    key: 'primary_keyword',
    label: 'primary_keyword',
    kind: 'text',
    required: false,
    important: false,
    description: 'Mot-clé principal de la page produit.'
  },
  {
    key: 'secondary_keywords',
    label: 'secondary_keywords',
    kind: 'text',
    required: false,
    important: false,
    description: 'Mots-clés secondaires — séparateur « | ».'
  },
  {
    key: 'semantic_keywords',
    label: 'semantic_keywords',
    kind: 'text',
    required: false,
    important: false,
    description: 'Termes sémantiques / entités associées — séparateur « | ».'
  },
  {
    key: 'internal_links',
    label: 'internal_links',
    kind: 'text',
    required: false,
    important: false,
    description: 'Liens internes pertinents prévus — séparateur « | ».'
  },
  {
    key: 'schema_type',
    label: 'schema_type',
    kind: 'select',
    options: ['Product', 'Article', 'FAQPage', 'ItemList', 'None'],
    required: false,
    important: false,
    description: 'Type de données structurées prévu pour la page.'
  }
];

export const REQUIRED_COLUMNS = SHEET_COLUMNS
  .filter((c) => c.required)
  .map((c) => c.label);

export const IMPORTANT_COLUMNS = SHEET_COLUMNS
  .filter((c) => c.important)
  .map((c) => c.label);

export const VERIFICATION_STATUSES = ['UNVERIFIED', 'VERIFIED', 'NEEDS_REVIEW', 'REJECTED'];
export const ARTICLE_STATUSES = ['NOT_STARTED', 'DRAFT', 'REVIEW', 'PUBLISHED', 'UPDATE_REQUIRED', 'BLOCKED'];
export const DATA_STATUSES = ['NEW', 'ENRICHED', 'VALIDATED', 'ARCHIVED', 'DISABLED'];
export const SEARCH_INTENTS = ['informational', 'commercial', 'transactional', 'navigational'];

export function isAllowed(value, options) {
  return options.includes(value);
}