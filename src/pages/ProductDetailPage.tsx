
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Product } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductCard from '../components/ProductCard';

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, getImage } = useAppContext();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const foundProduct = products.find(p => p.id === Number(id));
    if (foundProduct) {
      setProduct(foundProduct);
      setSelectedColor(Object.keys(foundProduct.images)[0] || '');
      const related = products
        .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
        .slice(0, 4);
      setRelatedProducts(related);
    }
  }, [id, products]);

  if (!product) {
    return <div className="py-20"><LoadingSpinner /></div>;
  }

  const handleAddToCart = () => {
    if (product && selectedColor) {
      addToCart(product, selectedColor, quantity);
    }
  };
  
  const mainImageId = product.images[selectedColor] || Object.values(product.images)[0];
  const mainImageSrc = getImage(mainImageId);

  return (
    <div className="bg-brand-dark-blue">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-right">
          {/* Image Gallery */}
          <div>
            <div className="aspect-w-1 aspect-h-1 rounded-lg overflow-hidden border border-brand-neon-blue/20 bg-brand-surface">
              <img src={mainImageSrc} alt={`${product.name} در رنگ ${selectedColor}`} className="w-full h-full object-cover object-center" />
            </div>
          </div>
          
          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-brand-light-text">{product.name}</h1>
            <p className="text-3xl mt-2 text-brand-neon-blue">{product.price.toLocaleString('fa-IR')} تومان</p>
            <div className="mt-6">
              <h3 className="sr-only">توضیحات</h3>
              <p className="text-base text-brand-muted-text">{product.description}</p>
            </div>

            {/* Color Selector */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-brand-light-text">رنگ: <span className="font-semibold">{selectedColor}</span></h3>
              <div className="flex items-center space-x-3 mt-2 space-x-reverse">
                {Object.keys(product.images).map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`relative h-10 w-10 rounded-full border-2 flex items-center justify-center transition-transform duration-200 bg-brand-surface ${selectedColor === color ? 'border-brand-neon-blue scale-110' : 'border-brand-muted-text'}`}
                    style={{ backgroundImage: `url(${getImage(product.images[color])})`, backgroundSize: 'cover' }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            
            {/* Quantity and Add to Cart */}
            <div className="mt-8 flex items-center gap-4 flex-row-reverse">
               <div className="flex items-center border border-brand-neon-blue/30 rounded-md">
                   <button onClick={() => setQuantity(q => q + 1)} className="px-3 py-2 text-lg font-semibold text-brand-light-text hover:bg-brand-surface rounded-l-md">+</button>
                   <span className="px-4 py-2 text-lg">{quantity}</span>
                   <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="px-3 py-2 text-lg font-semibold text-brand-light-text hover:bg-brand-surface rounded-r-md">-</button>
               </div>
               <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-brand-neon-blue text-brand-dark-blue py-3 px-8 rounded-md font-semibold hover:bg-opacity-80 transition-colors duration-300"
                >
                  افزودن به سبد خرید
                </button>
            </div>
            
            {/* Specifications */}
            <div className="mt-10">
                <h3 className="text-lg font-semibold text-brand-light-text">مشخصات فنی</h3>
                <ul className="mt-4 space-y-2 text-sm text-brand-muted-text">
                    {Object.entries(product.specs).map(([key, value]) => (
                        <li key={key} className="grid grid-cols-2"><span className="font-medium text-brand-light-text">{key}:</span> <span>{value}</span></li>
                    ))}
                </ul>
            </div>
          </div>
        </div>
      </div>
      
       {/* Related Products */}
      {relatedProducts.length > 0 && (
          <section className="py-16 bg-brand-surface">
              <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <h2 className="text-2xl font-bold text-center mb-8 text-brand-light-text">محصولات مرتبط</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                      {relatedProducts.map(p => (
                          <ProductCard key={p.id} product={p} />
                      ))}
                  </div>
              </div>
          </section>
      )}
    </div>
  );
};

export default ProductDetailPage;