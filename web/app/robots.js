import { getSite } from '../lib/data.js';

export default function robots() {
  const site = getSite();
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url
  };
}
