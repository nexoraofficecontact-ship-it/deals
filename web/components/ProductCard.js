import Link from 'next/link';
import { formatCad } from '../lib/data.js';

export default function ProductCard({ product, href, meta }) {
  const price = formatCad(product.price_cad);
  const url = href || `/${product.product_id}/`;
  return (
    <article className="product-card">
      <h3>
        <Link href={url}>{product.product_name}</Link>
      </h3>
      {product.brand ? <p className="muted small">{product.brand}</p> : null}
      <ul className="card-facts">
        <li>
          <span className="label">Prix observé</span>
          <span>{price || 'Information à vérifier'}</span>
        </li>
        <li>
          <span className="label">Note</span>
          <span>{product.rating !== null && product.rating !== undefined ? `${Number(product.rating).toFixed(1)}/5` : '—'}</span>
        </li>
        {product.product_type ? (
          <li>
            <span className="label">Type</span>
            <span>{product.product_type}</span>
          </li>
        ) : null}
      </ul>
      <Link className="card-link" href={url}>
        {meta || 'Voir l’analyse'} →
      </Link>
    </article>
  );
}
