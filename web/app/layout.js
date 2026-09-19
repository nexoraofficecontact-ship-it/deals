import './globals.css';
import SiteHeader from '../components/SiteHeader.js';
import SiteFooter from '../components/SiteFooter.js';
import JsonLd from '../components/JsonLd.js';
import { organizationSchema, websiteSchema } from '../lib/schema.js';
import { getSite } from '../lib/data.js';

const site = getSite();

export const metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — guides d'achat et comparatifs au Canada`,
    template: `%s | ${site.name}`
  },
  description:
    'Guides d’achat, comparatifs et analyses de produits au Canada. Des informations vérifiées, des comparaisons structurées et une divulgation d’affiliation claire.',
  icons: {
    icon: '/icon.svg'
  },
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    siteName: site.name,
    url: site.url
  },
  alternates: { canonical: '/' }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f5c4f'
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr-CA">
      <body>
        <a className="skip-link" href="#contenu">
          Aller au contenu
        </a>
        <SiteHeader />
        <main id="contenu">{children}</main>
        <SiteFooter />
        <JsonLd schema={[organizationSchema(), websiteSchema()]} />
      </body>
    </html>
  );
}