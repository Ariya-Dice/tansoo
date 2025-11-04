
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { useAppContext } from '../context/AppContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { getImage } = useAppContext();
  const firstImageId = Object.values(product.images)[0] || 'default-placeholder';
  const imageUrl = getImage(firstImageId);

  return (
    <div className="group relative border border-brand-neon-blue/20 rounded-lg overflow-hidden transition-shadow duration-300 hover:shadow-lg hover:shadow-brand-neon-blue/10">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-brand-surface">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          />
        </div>
        <div className="p-4 bg-brand-surface text-right">
          <h3 className="text-sm font-medium text-brand-light-text">{product.name}</h3>
          <p className="mt-2 text-lg font-semibold text-brand-neon-blue">{product.price.toLocaleString('fa-IR')} تومان</p>
        </div>
        <div className="absolute top-0 left-0 m-2 flex flex-col gap-2">
            {product.isNew && <span className="bg-brand-neon-blue/80 text-brand-dark-blue text-xs font-bold px-2 py-1 rounded">جدید</span>}
            {product.isBestSeller && <span className="bg-brand-neon-blue text-brand-dark-blue text-xs font-bold px-2 py-1 rounded">پرفروش</span>}
        </div>
      </Link>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-brand-surface/90 backdrop-blur-sm transform translate-y-full transition-transform duration-300 group-hover:translate-y-0">
        <Link to={`/product/${product.id}`} className="block w-full text-center bg-brand-neon-blue text-brand-dark-blue py-2 rounded-md font-semibold hover:bg-opacity-80 transition-colors">
          مشاهده جزئیات
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;