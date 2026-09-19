import { notFound } from 'next/navigation';
import {
  getContent,
  getCategory,
  getProductById,
  productsByCategory,
  comparisonsForProducts,
  productContents,
  allCategories
} from '../../lib/data.js';
import ProductView from '../../components/ProductView.js';
import CategoryView from '../../components/CategoryView.js';

export const dynamicParams = false;

export function generateStaticParams() {
  const productSlugs = productContents().map((c) => ({ slug: c.slug }));
  const categorySlugs = allCategories().map((c) => ({ slug: c.slug }));
  return [...productSlugs, ...categorySlugs];
}

export function generateMetadata({ params }) {
  return buildMetadata(params);
}

async function buildMetadata(params) {
  const { slug } = await params;
  const content = getContent(slug);
  if (content && content.kind === 'product') {
    const product = getProductById(slug);
    if (product) {
      return {
        title: product.product_name,
        description: content.excerpt || `Analyse de ${product.product_name}.`,
        alternates: { canonical: `/${slug}/` }
      };
    }
  }
  const category = getCategory(slug);
  if (category) {
    return {
      title: `${category.name} — guides et comparatifs`,
      description: `Produits, comparatifs et conseils d’achat dans la catégorie ${category.name}.`,
      alternates: { canonical: `/${slug}/` }
    };
  }
  return {};
}

export default async function SlugPage({ params }) {
  const { slug } = await params;

  const content = getContent(slug);
  if (content && content.kind === 'product') {
    const product = getProductById(slug);
    if (!product) notFound();
    const related = productsByCategory(product.category)
      .filter((p) => p.product_id !== product.product_id)
      .slice(0, 5);
    const comparisons = comparisonsForProducts(related);
    return <ProductView product={product} content={content} related={related} comparisons={comparisons} />;
  }

  const category = getCategory(slug);
  if (category) {
    const products = productsByCategory(slug);
    const comparisons = comparisonsForProducts(products);
    return <CategoryView category={category} products={products} comparisons={comparisons} />;
  }

  notFound();
}
