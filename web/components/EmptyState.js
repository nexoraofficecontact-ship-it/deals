import Link from 'next/link';

export default function EmptyState({ title, children, cta }) {
  return (
    <div className="empty-state">
      <h2>{title || 'Contenus vérifiés à venir'}</h2>
      <p className="muted">
        {children ||
          'Aucun contenu vérifié n’est encore publié. Conformément à notre méthode, nous ne publions rien tant que les données ne sont pas vérifiées.'}
      </p>
      {cta ? (
        <Link className="btn btn-secondary" href={cta.href}>
          {cta.label}
        </Link>
      ) : null}
    </div>
  );
}
