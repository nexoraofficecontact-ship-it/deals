// Représentation visuelle honnête d'un produit : une tuile graphique avec une
// icône SVG par catégorie/sous-catégorie. Aucune image produit n'est inventée :
// tant que les fiches Amazon n'ont pas fourni une URL d'image vérifiée, on
// utilise une icône fonctionnelle.
function Icon({ kind }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    viewBox: '0 0 48 48'
  };
  switch (kind) {
    case 'tapis-de-marche':
    case 'walking-pad':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="16" cy="34" r="6" />
          <circle cx="34" cy="34" r="6" />
          <path d="M22 34h12M18 26l-2 8 2 2M20 28c2-4 6-6 10-6l4 4M18 17l-3-5" />
          <path d="M15 12h10" />
          <path d="M12 15L5 10" />
        </svg>
      );
    case 'stepper':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M6 20v14h36V20" />
          <path d="M6 20h36" />
          <path d="M12 20l8-8h10l8 8" />
          <path d="M22 12v6M26 12v6M17 34v4M31 34v4" />
        </svg>
      );
    case 've-lo':
    case 'velo':
    case 'bike':
    case 'velo-dappartement':
      return (
        <svg {...common} aria-hidden="true">
          <circle cx="14" cy="34" r="6" />
          <circle cx="34" cy="34" r="6" />
          <path d="M14 34H8m-2-6h22l8-12 6 4M18 12h8l6 16" />
        </svg>
      );
    case 'vibration-plate':
      return (
        <svg {...common} aria-hidden="true">
          <rect x="10" y="16" width="28" height="20" rx="4" />
          <path d="M16 30c2-6 4 6 6 0 2-6 4 6 6 0" />
          <path d="M15 10h10l2 4h6" />
        </svg>
      );
    case 'resistance-bands':
    case 'musculation':
    case 'home-gym':
    case 'exercise':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M9 14v6l9 9 9-9v-6" />
          <path d="M9 20H3v14h6M39 20h-6v14h6M18 29v6" />
          <path d="M9 24l-3 10M39 24l3 10" />
        </svg>
      );
    case 'mini-stepper':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M10 22v12h28V22" />
          <path d="M10 22h28" />
          <path d="M16 22l10-10h4l8 10" />
          <path d="M36 10v4M40 12v4" />
        </svg>
      );
    case 'ecouteurs-sans-fil':
    case 'ecouteurs':
    case 'audio':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M10 26v-6a14 14 0 0 1 28 0v6" />
          <rect x="7" y="24" width="6" height="12" rx="2" />
          <rect x="35" y="24" width="6" height="12" rx="2" />
          <path d="M13 30v8a2 2 0 0 0 2 2h4v-8h-6z" />
        </svg>
      );
    case 'bouteilles-isothermes':
    case 'hydratation':
    case 'gourde':
      return (
        <svg {...common} aria-hidden="true">
          <path d="M18 14h12l3 8v16a4 4 0 0 1-4 4H19a4 4 0 0 1-4-4V22z" />
          <path d="M20 14V8h8v6M22 8v-3M26 8v-3" />
          <path d="M21 26l3 3 4-4" />
        </svg>
      );
    case 'fitness':
    default:
      return (
        <svg {...common} aria-hidden="true">
          <path d="M6 22v4M42 22v4M10 16v16M38 16v16" />
          <rect x="10" y="20" width="28" height="8" rx="3" />
        </svg>
      );
  }
}

export default function ProductVisual({ category, subcategory, tone = 'auto' }) {
  const sub = String(subcategory || '').toLowerCase().replace(/\s+/g, '-');
  const cat = String(category || '').toLowerCase();
  let kind = 'fitness';
  if (['audio', 'ecouteurs-sans-fil'].includes(cat)) kind = 'audio';
  else if (['hydratation'].includes(cat)) kind = 'hydratation';
  // Sous-catégories connues
  const bySub = {
    'tapis-de-marche': 'tapis-de-marche',
    'walking-pad': 'walking-pad',
    stepper: 'stepper',
    'mini-stepper': 'mini-stepper',
    'vibration-plate': 'vibration-plate',
    velo: 'velo',
    'velo-dappartement': 'velo',
    'ecouteurs-sans-fil': 'ecouteurs-sans-fil',
    ecouteurs: 'ecouteurs',
    'bouteilles-isothermes': 'bouteilles-isothermes',
    gourde: 'gourde',
    'resistance-bands': 'resistance-bands',
    'home-gym': 'home-gym'
  };
  if (bySub[sub]) kind = bySub[sub];

  return (
    <span className={`product-visual product-visual--${cat || 'default'}`} aria-hidden="true">
      <Icon kind={kind} />
    </span>
  );
}