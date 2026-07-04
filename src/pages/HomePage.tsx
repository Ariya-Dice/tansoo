// src/pages/HomePage.tsx

import React, { useRef } from 'react';
import ProductCard from '../components/ProductCard';
import { useAppContext } from '../context/AppContext';
import { getApiErrorHint } from '../utils/apiError';
import './HomePage.css';

const HomePage: React.FC = () => {
  const { products, loading, error } = useAppContext();

  const newProducts = products.filter(
    (p) => p.tags && p.tags.includes('جدید')
  );

  const bestSellers = products.filter(
    (p) => p.tags && p.tags.includes('پرفروش')
  );

  const economicalProducts = products.filter(
    (p) => p.tags && p.tags.includes('اقتصادی')
  );

  const newProductsRef = useRef<HTMLDivElement>(null);
  const bestSellersRef = useRef<HTMLDivElement>(null);
  const economicalProductsRef = useRef<HTMLDivElement>(null);

  const scrollLeft = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;

    ref.current.scrollTo({
      left: ref.current.scrollLeft + 300,
      behavior: 'smooth',
    });
  };

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;

    ref.current.scrollTo({
      left: ref.current.scrollLeft - 300,
      behavior: 'smooth',
    });
  };

  return (
    <div className="home-page">

      {/* ==========================
            Hero Banner
      =========================== */}

      <section className="home-banner">
        <div className="banner-container">

          <div className="banner-badge">
            <span className="badge-icon">⌂</span>
            <span>بدون واسطه از تولیدکننده خرید کنید</span>
          </div>

          <h1 className="banner-title">

            <span className="banner-title-dark">
              ظاهری مدرن، کیفیتی پایدار
            </span>

            <span className="banner-title-blue">
              با شیرآلات اهرمی تانسو
            </span>

          </h1>

          <p className="banner-description">
            کارگاه کوچک ما متعهد به ساخت شیرآلات لوکس با آلیاژ برنج آنالیز شده،
            بدون سرب و آبکاری فوق‌العاده میکرونی است.
            ثبت سفارش به صورت مستقیم و بدون واسطه انجام می‌شود.
          </p>

          <div className="banner-divider" />

          <div className="banner-features">

            <div className="banner-feature">
              <span className="feature-check">✔</span>
              <span>۵ سال گارانتی تعویض کتبی</span>
            </div>

            <div className="banner-feature">
              <span className="feature-check">✔</span>
              <span>آلیاژ برنج سنگین استاندارد</span>
            </div>

            <div className="banner-feature">
              <span className="feature-check">✔</span>
              <span>ارسال سریع سراسری</span>
            </div>

          </div>

        </div>
      </section>

      {/* ==========================
            Loading
      =========================== */}

      {loading ? (
        <div className="loading-center">
          <img
            src="/loading.gif"
            alt="در حال بارگذاری..."
            className="loading-gif"
          />
          <p>در حال بارگذاری...</p>
        </div>
      ) : error ? (
        <div className="loading-center">
          <p
            style={{
              color: '#ef4444',
              marginBottom: '1rem',
            }}
          >
            ⚠️ {error}
          </p>

          <p
            style={{
              color: '#94a3b8',
              fontSize: '0.875rem',
            }}
          >
            {getApiErrorHint(error)}
          </p>
        </div>
      ) : (
        <>

          {/* ==========================
                محصولات جدید
          =========================== */}

          {newProducts.length > 0 && (
            <section className="home-section">

              <div className="container">

                <h2 className="section-title">
                  محصولات جدید
                </h2>

                <div className="products-slider-wrapper">

                  <button
                    className="slider-button slider-button-left"
                    onClick={() => scrollLeft(newProductsRef)}
                    aria-label="اسکرول به چپ"
                  >
                    ‹
                  </button>

                  <div
                    className="products-slider"
                    ref={newProductsRef}
                  >
                    {newProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>

                  <button
                    className="slider-button slider-button-right"
                    onClick={() => scrollRight(newProductsRef)}
                    aria-label="اسکرول به راست"
                  >
                    ›
                  </button>

                </div>

              </div>

            </section>
          )}

          {/* ==========================
                پرفروش‌ترین‌ها
          =========================== */}

          {bestSellers.length > 0 && (
            <section className="home-section home-section-dark">

              <div className="container">

                <h2 className="section-title">
                  پرفروش‌ترین‌ها
                </h2>

                <div className="products-slider-wrapper">

                  <button
                    className="slider-button slider-button-left"
                    onClick={() => scrollLeft(bestSellersRef)}
                    aria-label="اسکرول به چپ"
                  >
                    ‹
                  </button>

                  <div
                    className="products-slider"
                    ref={bestSellersRef}
                  >
                    {bestSellers.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>

                  <button
                    className="slider-button slider-button-right"
                    onClick={() => scrollRight(bestSellersRef)}
                    aria-label="اسکرول به راست"
                  >
                    ›
                  </button>

                </div>

              </div>

            </section>
          )}

          {/* ==========================
                محصولات اقتصادی
          =========================== */}

          {economicalProducts.length > 0 && (
            <section className="home-section">

              <div className="container">

                <h2 className="section-title">
                  محصولات اقتصادی
                </h2>

                <div className="products-slider-wrapper">

                  <button
                    className="slider-button slider-button-left"
                    onClick={() => scrollLeft(economicalProductsRef)}
                    aria-label="اسکرول به چپ"
                  >
                    ‹
                  </button>

                  <div
                    className="products-slider"
                    ref={economicalProductsRef}
                  >
                    {economicalProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                      />
                    ))}
                  </div>

                  <button
                    className="slider-button slider-button-right"
                    onClick={() => scrollRight(economicalProductsRef)}
                    aria-label="اسکرول به راست"
                  >
                    ›
                  </button>

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