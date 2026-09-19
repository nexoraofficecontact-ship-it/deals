import Link from 'next/link';
import { getSite } from '../lib/data.js';
import MobileNav from './MobileNav.js';

const NAV = [
  { href: '/categories/', label: 'Catégories' },
  { href: '/comparatifs/', label: 'Comparatifs' },
  { href: '/guides/', label: 'Guides' },
  { href: '/faq/', label: 'FAQ' },
  { href: '/a-propos/', label: 'À propos' }
];

export default function SiteHeader() {
  const site = getSite();
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label={`Accueil — ${site.name}`}>
          <span className="brand-mark" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 12V6l4 3 4-3v6" />
            </svg>
          </span>
          <span>{site.name}</span>
        </Link>
        <MobileNav items={NAV} cta={{ href: '/categories/', label: 'Voir les offres' }} />
      </div>
    </header>
  );
}