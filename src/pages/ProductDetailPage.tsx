// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { Product } from "../types";
import { getDefaultImage } from "../constants";
import ProductCard from "../components/ProductCard";
import "./ProductDetailPage.css";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, getImage, loading } = useAppContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // پیدا کردن محصول و محصولات مرتبط
  useEffect(() => {
    const found = products.find((p) => p.id === Number(id));
    if (found) {
      setProduct(found);
      const related = products
        .filter((p) => p.model === found.model && p.id !== found.id)
        .slice(0, 4);
      setRelatedProducts(related);
    }
  }, [id, products]);

  if (loading || !product) {
    return (
      <div className="loading-wrapper">
        <img src="/loading.gif" alt="در حال بارگذاری..." className="loading-gif" />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
    }
  };

  // استفاده از تصویر محصول یا تصویر پیش‌فرض
  const mainImageSrc = product.image 
    ? getImage(product.image) 
    : getDefaultImage(product.model);

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* تصویر اصلی */}
        <div className="product-image-wrapper">
          <img
            src={mainImageSrc}
            alt={`${product.model} ${product.type}`}
            className="product-main-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getDefaultImage(product.model);
            }}
          />
        </div>

        {/* اطلاعات محصول */}
        <div className="product-info">
          <h1 className="product-name">{product.model} {product.type}</h1>
          <p className="product-price">
            {product.price.toLocaleString("fa-IR")} تومان
          </p>
          <p className="product-description">{product.description}</p>

          {/* مشخصات محصول */}
          <div className="product-specs">
            <h3>مشخصات محصول</h3>
            <ul>
              <li>
                <span className="spec-key">مدل:</span>
                <span className="spec-val">{product.model}</span>
              </li>
              <li>
                <span className="spec-key">نوع:</span>
                <span className="spec-val">{product.type}</span>
              </li>
              <li>
                <span className="spec-key">رنگ:</span>
                <span className="spec-val">{product.color}</span>
              </li>
              <li>
                <span className="spec-key">وزن تنه:</span>
                <span className="spec-val">{product.bodyWeight}</span>
              </li>
              {product.hoseMaterial && (
                <li>
                  <span className="spec-key">جنس شیلنگ:</span>
                  <span className="spec-val">{product.hoseMaterial}</span>
                </li>
              )}
              {product.valveMaterial && (
                <li>
                  <span className="spec-key">جنس شیر:</span>
                  <span className="spec-val">{product.valveMaterial}</span>
                </li>
              )}
              {product.tags.length > 0 && (
                <li>
                  <span className="spec-key">تگ‌ها:</span>
                  <span className="spec-val">{product.tags.join('، ')}</span>
                </li>
              )}
            </ul>
          </div>

          {/* تعداد و افزودن به سبد */}
          <div className="product-actions">
            <div className="quantity-box">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                -
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>
            <button className="add-to-cart" onClick={handleAddToCart}>
              افزودن به سبد خرید
            </button>
          </div>
        </div>
      </div>

      {/* محصولات مرتبط */}
      {relatedProducts.length > 0 && (
        <section className="related-section">
          <h2>محصولات مرتبط</h2>
          <div className="related-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
