import Link from 'next/link';
import { formatCad } from '../lib/data.js';
import ProductVisual from './ProductVisual.js';

export default function ProductCard({ product, href, meta }) {
  const price = formatCad(product.price_cad);
  const rating = product.rating !== null && product.rating !== undefined ? Number(product.rating) : null;
  const url = href || `/${product.product_id}/`;
  return (
    <article className="product-card">
      <ProductVisual category={product.category} subcategory={product.subcategory} />
      <div className="product-card-body">
        <h3>
          <Link href={url}>{product.product_name}</Link>
        </h3>
        {product.brand ? <p className="brand-line">{product.brand}</p> : null}
        <ul className="card-facts">
          <li>
            <span className="label">Prix observé</span>
            {price ? <span>{price}</span> : <span className="unverified">Information à vérifier</span>}
          </li>
          <li>
            <span className="label">Note</span>
            <span>{rating !== null ? `${rating.toFixed(1)}/5` : '—'}</span>
          </li>
          {product.product_type ? (
            <li>
              <span className="label">Type</span>
              <span>{product.product_type}</span>
            </li>
          ) : null}
        </ul>
      </div>
      <div className="card-foot">
        <Link className="card-cta" href={url}>
          {meta || 'Lire l’analyse'} →
        </Link>
        <Link className="btn btn-secondary" href={url}>
          Voir l’offre
        </Link>
      </div>
    </article>
  );
}