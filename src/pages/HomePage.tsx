// src/pages/HomePage.tsx
import React from 'react';
import ProductCard from '../components/ProductCard';
import { useAppContext } from '../context/AppContext';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { products, loading, error } = useAppContext();

  const newProducts = products.filter(p => p.tags && p.tags.includes('جدید')).slice(0, 4);
  const bestSellers = products.filter(p => p.tags && p.tags.includes('پرفروش')).slice(0, 4);
  const economicalProducts = products.filter(p => p.tags && p.tags.includes('اقتصادی')).slice(0, 4);

  return (
    <div className="home-page">
      {/* بنر اصلی */}
      <section className="home-banner">
        <div className="banner-content">
          <h1 className="banner-text">ظرافت در هر قطره</h1>
        </div>
      </section>

      {loading ? (
        <div className="loading-center">
          <img src="/loading.gif" alt="در حال بارگذاری..." className="loading-gif" />
          <p>در حال بارگذاری...</p>
        </div>
      ) : error ? (
        <div className="loading-center">
          <p style={{ color: '#ef4444', marginBottom: '1rem' }}>⚠️ {error}</p>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            لطفاً مطمئن شوید که سرور backend در localhost:4020 در حال اجرا است.
          </p>
        </div>
      ) : (
        <>
          {/* محصولات جدید */}
          {newProducts.length > 0 && (
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
          )}

          {/* پرفروش‌ترین‌ها */}
          {bestSellers.length > 0 && (
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
          )}

          {/* محصولات اقتصادی */}
          {economicalProducts.length > 0 && (
            <section className="home-section">
              <div className="container">
                <h2 className="section-title">محصولات اقتصادی</h2>
                <div className="products-grid">
                  {economicalProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;
