// src/pages/ProductDetailPage.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { Product } from "../types";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/ProductCard";
import "./ProductDetailPage.css";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, getImage } = useAppContext();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // پیدا کردن محصول و محصولات مرتبط
  useEffect(() => {
    const found = products.find((p) => p.id === Number(id));
    if (found) {
      setProduct(found);
      setSelectedColor(Object.keys(found.images)[0] || "");
      const related = products
        .filter((p) => p.category === found.category && p.id !== found.id)
        .slice(0, 4);
      setRelatedProducts(related);
    }
  }, [id, products]);

  if (!product)
    return (
      <div className="loading-wrapper">
        <LoadingSpinner />
      </div>
    );

  const handleAddToCart = () => {
    if (product && selectedColor) {
      addToCart(product, selectedColor, quantity);
    }
  };

  const mainImage =
    product.images[selectedColor] || Object.values(product.images)[0];
  const mainImageSrc = getImage(mainImage);

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        {/* تصویر اصلی */}
        <div className="product-image-wrapper">
          <img
            src={mainImageSrc}
            alt={product.name}
            className="product-main-image"
          />
        </div>

        {/* اطلاعات محصول */}
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">
            {product.price.toLocaleString("fa-IR")} تومان
          </p>
          <p className="product-description">{product.description}</p>

          {/* انتخاب رنگ */}
          <div className="product-colors">
            <h3>
              رنگ: <span>{selectedColor}</span>
            </h3>
            <div className="color-options">
              {Object.entries(product.images).map(([color, file]) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`color-circle ${
                    selectedColor === color ? "active" : ""
                  }`}
                  style={{
                    backgroundImage: `url(${getImage(file)})`,
                    backgroundSize: "cover",
                  }}
                  title={color}
                />
              ))}
            </div>
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

          {/* مشخصات فنی */}
          <div className="product-specs">
            <h3>مشخصات فنی</h3>
            <ul>
              {Object.entries(product.specs).map(([key, val]) => (
                <li key={key}>
                  <span className="spec-key">{key}:</span>
                  <span className="spec-val">{val}</span>
                </li>
              ))}
            </ul>
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
