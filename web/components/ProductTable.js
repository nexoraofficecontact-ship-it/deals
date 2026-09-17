import Link from 'next/link';
import { formatCad, parsePipe } from '../lib/data.js';

export default function ProductTable({ products }) {
  if (!products || !products.length) return null;
  const rows = products.map((p) => ({
    product: p,
    price: formatCad(p.price_cad),
    rating: p.rating !== null && p.rating !== undefined ? `${Number(p.rating).toFixed(1)}/5` : '—',
    feature: parsePipe(p.key_features)[0] || 'Information à vérifier',
    ideal: parsePipe(p.ideal_for)[0] || '—'
  }));
  return (
    <div className="table-wrap">
      <table className="product-table">
        <caption className="sr-only">Comparaison des produits</caption>
        <thead>
          <tr>
            <th scope="col">Produit</th>
            <th scope="col">Prix observé</th>
            <th scope="col">Note</th>
            <th scope="col">Caractéristique principale</th>
            <th scope="col">Idéal pour</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ product, price, rating, feature, ideal }) => (
            <tr key={product.product_id}>
              <th scope="row">
                <Link href={`/${product.product_id}/`}>{product.product_name}</Link>
              </th>
              <td>{price || 'Information à vérifier'}</td>
              <td>{rating}</td>
              <td>{feature}</td>
              <td>{ideal}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
