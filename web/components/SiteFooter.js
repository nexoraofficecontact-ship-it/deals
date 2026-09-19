import Link from 'next/link';
import { getSite, allCategories } from '../lib/data.js';

export default function SiteFooter() {
  const site = getSite();
  const categories = allCategories();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <p className="footer-brand">{site.name}</p>
          <p className="muted small">
            Guides d&apos;achat, comparatifs et analyses. Nous présentons des informations vérifiées et
            signalons clairement les données incertaines.
          </p>
        </div>
        <div>
          <p className="footer-title">Explorer</p>
          <ul className="footer-list">
            {categories.slice(0, 6).map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}/`}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/categories/">Toutes les catégories</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="footer-title">Informations</p>
          <ul className="footer-list">
            <li>
              <Link href="/a-propos/">À propos</Link>
            </li>
            <li>
              <Link href="/divulgation-affiliation/">Divulgation d&apos;affiliation</Link>
            </li>
            <li>
              <Link href="/faq/">Questions fréquentes</Link>
            </li>
            <li>
              <Link href="/contact/">Contact</Link>
            </li>
            <li>
              <Link href="/politique-de-confidentialite/">Politique de confidentialité</Link>
            </li>
            <li>
              <Link href="/conditions-utilisation/">Conditions d&apos;utilisation</Link>
            </li>
          </ul>
        </div>
        <div className="footer-disclosure">
          <strong>Divulgation d&apos;affiliation :</strong> {site.name} participe au Programme Partenaires
          d&apos;Amazon.ca. Certains liens de ce site sont des liens affiliés : si vous cliquez puis achetez,
          nous pouvons percevoir une commission, sans coût additionnel pour vous. Cela ne change jamais nos
          évaluations.
        </div>
      </div>
      <div className="container footer-bottom">
        <p className="muted small">
          © {year} {site.name}. Les prix affichés sont ceux observés lors de la dernière vérification et
          peuvent changer à tout moment.
        </p>
      </div>
    </footer>
  );
}