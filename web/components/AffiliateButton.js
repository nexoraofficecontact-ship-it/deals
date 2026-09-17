export default function AffiliateButton({ href, label = 'Voir sur Amazon.ca', note }) {
  if (!href) return null;
  return (
    <div className="affiliate-cta">
      <a className="btn btn-primary" href={href} rel="nofollow sponsored noopener" target="_blank">
        {label}
      </a>
      <p className="muted small">
        {note || 'Lien affilié : nous pouvons percevoir une commission si vous achetez via ce lien, sans coût additionnel pour vous.'}
      </p>
    </div>
  );
}
