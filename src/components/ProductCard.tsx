import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import { getDefaultImage } from '../constants';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { getImage } = useAppContext();
  // استفاده از تصویر محصول یا تصویر پیش‌فرض
  const imageSrc = product.image 
    ? getImage(product.image) 
    : getDefaultImage(product.model);

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <div className="product-image-container">
          <img
            src={imageSrc}
            alt={`${product.model} ${product.type}`}
            className="product-image"
            onError={(e) => {
              // Fallback به تصویر پیش‌فرض در صورت خطا
              (e.target as HTMLImageElement).src = getDefaultImage(product.model);
            }}
          />
        </div>
        <div className="product-content">
          <h3 className="product-title">{product.model} {product.type}</h3>
          <p className="product-meta">
            <span className="product-color">رنگ: {product.color}</span>
            <span className="product-weight">وزن: {product.bodyWeight}</span>
          </p>
          <p className="product-price">{product.price?.toLocaleString('fa-IR')} تومان</p>
          <div className="product-tags">
            {product.tags.includes('جدید') && <span className="product-badge product-badge-new">جدید</span>}
            {product.tags.includes('پرفروش') && <span className="product-badge product-badge-bestseller">پرفروش</span>}
            {product.tags.includes('اقتصادی') && <span className="product-badge product-badge-economical">اقتصادی</span>}
          </div>
        </div>
      </Link>
      <div className="product-overlay">
        <Link to={`/product/${product.id}`} className="product-button">
          مشاهده جزئیات
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;