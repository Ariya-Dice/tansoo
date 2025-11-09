import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import './ProductsPage.css';

const ProductsPage: React.FC = () => {
  const { products, fetchProducts } = useAppContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      await fetchProducts(); // داده‌ها را از API می‌گیرد و در context ذخیره می‌کند
      setLoading(false);
    };
    loadProducts();
  }, []);

  if (loading) return <div className="loading-center">در حال بارگذاری...</div>;

  return (
    <div className="products-page">
      <div className="container">
        <h1 className="products-title">لیست محصولات</h1>
        {products.length === 0 ? (
          <div className="products-empty">
            <h2 className="products-empty-title">محصولی یافت نشد</h2>
            <p className="products-empty-text">در حال حاضر هیچ محصولی موجود نیست.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
