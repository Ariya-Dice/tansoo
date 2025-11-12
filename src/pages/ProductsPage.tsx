import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';
import { MODELS, TYPES, COLORS, TAGS } from '../constants';
import './ProductsPage.css';

const ProductsPage: React.FC = () => {
  const { products, fetchProducts, loading } = useAppContext();
  
  // State برای فیلترها
  const [selectedModel, setSelectedModel] = useState<string>('همه');
  const [selectedType, setSelectedType] = useState<string>('همه');
  const [selectedColor, setSelectedColor] = useState<string>('همه');
  const [selectedTag, setSelectedTag] = useState<string>('همه');
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'none'>('none');
  const [customModel, setCustomModel] = useState<string>('');
  const [customType, setCustomType] = useState<string>('');
  const [customColor, setCustomColor] = useState<string>('');

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // فیلتر و مرتب‌سازی محصولات
  const filteredAndSortedProducts = React.useMemo(() => {
    let filtered = [...products];

    // فیلتر بر اساس مدل
    if (selectedModel !== 'همه') {
      if (selectedModel === 'سایر...') {
        filtered = filtered.filter(p => !MODELS.slice(0, -1).includes(p.model));
        if (customModel) {
          filtered = filtered.filter(p => p.model.toLowerCase().includes(customModel.toLowerCase()));
        }
      } else {
        filtered = filtered.filter(p => p.model === selectedModel);
      }
    }

    // فیلتر بر اساس نوع
    if (selectedType !== 'همه') {
      if (selectedType === 'سایر...') {
        filtered = filtered.filter(p => !TYPES.slice(0, -1).includes(p.type));
        if (customType) {
          filtered = filtered.filter(p => p.type.toLowerCase().includes(customType.toLowerCase()));
        }
      } else {
        filtered = filtered.filter(p => p.type === selectedType);
      }
    }

    // فیلتر بر اساس رنگ
    if (selectedColor !== 'همه') {
      if (selectedColor === 'سایر...') {
        filtered = filtered.filter(p => !COLORS.slice(0, -1).includes(p.color));
        if (customColor) {
          filtered = filtered.filter(p => p.color.toLowerCase().includes(customColor.toLowerCase()));
        }
      } else {
        filtered = filtered.filter(p => p.color === selectedColor);
      }
    }

    // فیلتر بر اساس تگ
    if (selectedTag !== 'همه') {
      filtered = filtered.filter(p => p.tags.includes(selectedTag));
    }

    // مرتب‌سازی
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    return filtered;
  }, [products, selectedModel, selectedType, selectedColor, selectedTag, sortBy, customModel, customType, customColor]);

  const { error } = useAppContext();

  if (loading) {
    return (
      <div className="loading-center">
        <img src="/loading.gif" alt="در حال بارگذاری..." className="loading-gif" />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="products-page">
        <div className="container">
          <div className="products-empty">
            <h2 className="products-empty-title">⚠️ خطا در اتصال به سرور</h2>
            <p className="products-empty-text">{error}</p>
            <p className="products-empty-text" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
              لطفاً مطمئن شوید که سرور backend در localhost:4020 در حال اجرا است.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="container">
        <h1 className="products-title">لیست محصولات</h1>
        
        {/* فیلترها */}
        <div className="products-filters">
          <div className="filter-group">
            <label>مدل:</label>
            <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
              <option value="همه">همه</option>
              {MODELS.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            {selectedModel === 'سایر...' && (
              <input
                type="text"
                placeholder="نام مدل را وارد کنید"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                className="custom-input"
              />
            )}
          </div>

          <div className="filter-group">
            <label>نوع:</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="همه">همه</option>
              {TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            {selectedType === 'سایر...' && (
              <input
                type="text"
                placeholder="نام نوع را وارد کنید"
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                className="custom-input"
              />
            )}
          </div>

          <div className="filter-group">
            <label>رنگ:</label>
            <select value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
              <option value="همه">همه</option>
              {COLORS.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
            {selectedColor === 'سایر...' && (
              <input
                type="text"
                placeholder="نام رنگ را وارد کنید"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="custom-input"
              />
            )}
          </div>

          <div className="filter-group">
            <label>تگ:</label>
            <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
              <option value="همه">همه</option>
              {TAGS.map(tag => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>مرتب‌سازی:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
              <option value="none">بدون مرتب‌سازی</option>
              <option value="price-asc">قیمت: کم به زیاد</option>
              <option value="price-desc">قیمت: زیاد به کم</option>
            </select>
          </div>
        </div>

        {/* لیست محصولات */}
        {filteredAndSortedProducts.length === 0 ? (
          <div className="products-empty">
            <h2 className="products-empty-title">محصولی یافت نشد</h2>
            <p className="products-empty-text">با فیلترهای انتخابی شما محصولی موجود نیست.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredAndSortedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
