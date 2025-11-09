// src/pages/HomePage.tsx
import React from 'react';
import ProductCard from '../components/ProductCard';
import { useAppContext } from '../context/AppContext';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { products, loading } = useAppContext();

  const newProducts = products.filter(p => p.isNew).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);

  return (
    <div className="home-page">
      {/* بنر اصلی */}
      <section className="home-banner">
        <div className="banner-content">
          <h1 className="banner-text">ظرافت در هر قطره</h1>
        </div>
      </section>

      {loading ? (
        <div className="loading-center">در حال بارگذاری...</div>
      ) : (
        <>
          {/* محصولات جدید */}
          <section className="home-section">
            <div className="container">
              <h2 className="section-title">محصولات جدید</h2>
              <div className="products-grid">
                {newProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>

          {/* پرفروش‌ترین‌ها */}
          <section className="home-section home-section-dark">
            <div className="container">
              <h2 className="section-title">پرفروش‌ترین‌ها</h2>
              <div className="products-grid">
                {bestSellers.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default HomePage;
