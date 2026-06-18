// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { Product } from "../types";
import { getDefaultImage } from "../constants";
import { getProductGoodsType } from "../productSpecs";
import ProductCard from "../components/ProductCard";
import ProductSpecsTable from "../components/ProductSpecsTable";
import "./ProductDetailPage.css";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, getImage, loading } = useAppContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

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
    if (product) addToCart(product, quantity);
  };

  const goodsType = getProductGoodsType(product);
  const mainImageSrc = product.image
    ? getImage(product.image)
    : getDefaultImage(product.model);

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <div className="product-image-wrapper">
          <img
            src={mainImageSrc}
            alt={`${product.model} ${goodsType}`}
            className="product-main-image"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getDefaultImage(product.model);
            }}
          />
        </div>

        <div className="product-info">
          <h1 className="product-name">
            {product.model} {goodsType}
          </h1>
          <p className="product-price">
            {product.price.toLocaleString("fa-IR")} تومان
          </p>
          {product.description && (
            <p className="product-description">{product.description}</p>
          )}

          {product.tags.length > 0 && (
            <div className="product-detail-tags">
              {product.tags.map((tag) => (
                <span key={tag} className="product-detail-tag">{tag}</span>
              ))}
            </div>
          )}

          <div className="product-actions">
            <div className="quantity-box">
              <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>-</button>
              <span>{quantity}</span>
              <button type="button" onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>
            <button type="button" className="add-to-cart" onClick={handleAddToCart}>
              افزودن به سبد خرید
            </button>
          </div>
        </div>
      </div>

      <div className="product-specs-section">
        <ProductSpecsTable product={product} />
      </div>

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
