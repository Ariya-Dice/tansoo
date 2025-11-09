import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import './ProductCard.css';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { getImage } = useAppContext();
  const firstImageId = Object.values(product.images)[0];
  const imageSrc = firstImageId ? getImage(firstImageId) : '/placeholder.png';

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`}>
        <div className="product-image-container">
          <img
            src={imageSrc}
            alt={product.name}
            className="product-image"
          />
        </div>
        <div className="product-content">
          <h3 className="product-title">{product.name}</h3>
          <p className="product-category">{product.category}</p>
          <p className="product-price">{product.price?.toLocaleString('fa-IR')} تومان</p>
          {product.isNew && <span className="product-badge product-badge-new">جدید</span>}
          {product.isBestSeller && <span className="product-badge product-badge-bestseller">پرفروش</span>}
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