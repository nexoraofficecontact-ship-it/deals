import Link from 'next/link';

export const metadata = {
  title: 'Page introuvable'
};

export default function NotFound() {
  return (
    <div className="container">
      <div className="empty-state">
        <h1>Page introuvable</h1>
        <p className="muted">La page demandée n’existe pas ou a été déplacée.</p>
        <Link className="btn btn-secondary" href="/">
          Retour à l’accueil
        </Link>
      </div>
    </div>
  );
}
