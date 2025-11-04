
import React from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useAppContext } from '../context/AppContext';

const HomePage: React.FC = () => {
  const { products } = useAppContext();
  
  const newProducts = products.filter(p => p.isNew).slice(0, 4);
  const bestSellers = products.filter(p => p.isBestSeller).slice(0, 4);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] bg-cover bg-center" style={{ backgroundImage: `url('https://picsum.photos/id/10/1800/800')` }}>
        <div className="absolute inset-0 bg-brand-dark-blue bg-opacity-60"></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-brand-light-text text-center">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">ظرافت در هر قطره</h1>
          <p className="mt-4 text-lg md:text-xl max-w-xl">مجموعه انحصاری شیرآلات بهداشتی ما را که برای زندگی مدرن ساخته شده‌اند، کشف کنید.</p>
          <Link to="/products" className="mt-8 inline-block border border-brand-neon-blue text-brand-neon-blue font-semibold py-3 px-8 rounded-md hover:bg-brand-neon-blue hover:text-brand-dark-blue transition-all duration-300">
            مشاهده مجموعه
          </Link>
        </div>
      </section>

      {/* New Products Section */}
      <section className="py-16 bg-brand-surface">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-brand-light-text">محصولات جدید</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Best Sellers Section */}
      <section className="py-16 bg-brand-dark-blue">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-brand-light-text">پرفروش‌ترین‌ها</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {bestSellers.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;