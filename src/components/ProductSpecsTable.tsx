import React from 'react';
import { Product } from '../types';
import { getProductSpecRows } from '../productSpecs';
import './ProductSpecsTable.css';

interface ProductSpecsTableProps {
  product: Product;
}

const ProductSpecsTable: React.FC<ProductSpecsTableProps> = ({ product }) => {
  const rows = getProductSpecRows(product);

  return (
    <div className="product-specs-table-wrap">
      <h3 className="product-specs-table-title">جدول مشخصات فنی</h3>
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
