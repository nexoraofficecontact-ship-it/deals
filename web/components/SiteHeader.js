import Link from 'next/link';
import { getSite } from '../lib/data.js';

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
          <span className="brand-mark" aria-hidden="true">◆</span>
          <span>{site.name}</span>
        </Link>
        <nav className="main-nav" aria-label="Navigation principale">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
