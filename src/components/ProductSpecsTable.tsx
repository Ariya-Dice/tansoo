import React from 'react';
import { Product } from '../types';
import { getProductSpecRows } from '../productSpecs';
import { getAvailabilityLabel } from '../utils/availability';
import './ProductSpecsTable.css';

interface ProductSpecsTableProps {
  product: Product;
}

const ProductSpecsTable: React.FC<ProductSpecsTableProps> = ({ product }) => {
  const extraRows: { label: string; value: string }[] = [];
  if (product.brand?.trim()) {
    extraRows.push({ label: 'برند', value: product.brand.trim() });
  }
  extraRows.push({ label: 'وضعیت', value: getAvailabilityLabel(product) });

  const rows = [...extraRows, ...getProductSpecRows(product)].filter(({ value }) => {
    if (value === null || value === undefined) {
      return false;
    }

    const text = String(value).trim();

    return (
      text !== '' &&
      text !== '-' &&
      text !== '—' &&
      text.toLowerCase() !== 'null' &&
      text.toLowerCase() !== 'undefined'
    );
  });

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className="product-specs-table-wrap">
      <h3 className="product-specs-table-title">
        جدول مشخصات فنی
      </h3>

      <div className="product-specs-table-scroll">
        <table className="product-specs-table">
          <thead>
            <tr>
              <th scope="col">مشخصه</th>
              <th scope="col">مقدار</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(({ label, value }) => (
              <tr key={label}>
                <td className="spec-label">{label}</td>
                <td className="spec-value">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductSpecsTable;
