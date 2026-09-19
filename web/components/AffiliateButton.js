import { affiliateUrl } from '../lib/data.js';

export default function AffiliateButton({ product, label = 'Voir l’offre sur Amazon.ca', note }) {
  const href = affiliateUrl(product);
  if (!href) return null;
  return (
    <div className="affiliate-cta">
      <a className="btn btn-primary" href={href} rel="nofollow sponsored noopener" target="_blank">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
        {label}
      </a>
      <p className="cta-sub">
        {note ||
          'Lien affilié : nous pouvons percevoir une commission si vous achetez via ce lien, sans coût additionnel pour vous.'}
      </p>
    </div>
  );
}