import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { LOW_STOCK_THRESHOLD } from '../../constants';
import { formatProductTitle } from '../../productSpecs';
import './AdminStockAlerts.css';

const AdminStockAlerts: React.FC = () => {
  const { products } = useAppContext();

  const lowStockProducts = useMemo(
    () =>
      products.filter((p) => {
        const stock = Number(p.stock ?? 0);
        return stock >= 0 && stock <= LOW_STOCK_THRESHOLD;
      }),
    [products],
  );

  if (lowStockProducts.length === 0) return null;

  return (
    <div className="admin-stock-alerts" role="alert">
      <p className="admin-stock-alerts-title">
        هشدار موجودی ({lowStockProducts.length.toLocaleString('fa-IR')} محصول)
      </p>
      <ul className="admin-stock-alerts-list">
        {lowStockProducts.map((product) => (
          <li key={product.id}>
            <span>{formatProductTitle(product)}</span>
            {product.brand ? <span className="admin-stock-alerts-brand"> — برند: {product.brand}</span> : null}
            <strong>{Number(product.stock ?? 0).toLocaleString('fa-IR')} عدد</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminStockAlerts;
