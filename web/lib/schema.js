import { getSite, formatCad } from './data.js';

export function organizationSchema() {
  const site = getSite();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    description: `${site.name} — guides d'achat, comparatifs et analyses de produits au Canada.`
  };
}

export function websiteSchema() {
  const site = getSite();
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.name,
    url: site.url,
    inLanguage: site.lang
  };
}

export function breadcrumbSchema(items) {
  const site = getSite();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${site.url}${item.href}`
    }))
  };
}

export function productSchema({ product, content, url }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.product_name,
    brand: { '@type': 'Brand', name: product.brand },
    description: content?.excerpt || product.positioning || undefined,
    category: product.category,
    url: `${getSite().url}${url}`
  };
  if (product.rating !== null && product.rating !== undefined) {
    schema.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(product.rating),
      reviewCount: product.review_count ? String(product.review_count) : undefined,
      bestRating: '5',
      worstRating: '1'
    };
  }
  if (product.asin) {
    schema.gtin = undefined;
    schema.sku = product.asin;
  }
  const offerUrl = product.affiliate_url || product.amazon_url;
  if (offerUrl) {
    schema.offers = {
      '@type': 'Offer',
      url: offerUrl,
      priceCurrency: product.currency || 'CAD',
      price: product.price_cad !== null && product.price_cad !== undefined ? String(product.price_cad) : undefined,
      availability: 'https://schema.org/InStock'
    };
  }
  return schema;
}

export function itemListSchema({ name, products, urlFor }) {
  const base = getSite().url;
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: p.product_name,
      url: `${base}${urlFor(p)}`
    }))
  };
}

export function faqSchema(faqItems) {
  if (!faqItems || faqItems.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer }
    }))
  };
}

export function articleSchema({ content, url }) {
  const site = getSite();
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: content.title,
    description: content.excerpt,
    inLanguage: site.lang,
    url: `${site.url}${url}`,
    datePublished: content.publishedAt || undefined,
    dateModified: content.updatedAt || content.publishedAt || undefined,
    author: { '@type': 'Organization', name: site.name },
    publisher: { '@type': 'Organization', name: site.name, url: site.url }
  };
}
