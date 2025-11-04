
import React, { useState, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import { useAppContext } from '../context/AppContext';
import { CATEGORIES, COLORS } from '../constants';
import { ChevronDownIcon } from '../components/icons';

const ProductsPage: React.FC = () => {
  const { products } = useAppContext();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(5000000);

  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryName)
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleColorChange = (colorName: string) => {
    setSelectedColors(prev =>
      prev.includes(colorName)
        ? prev.filter(c => c !== colorName)
        : [...prev, colorName]
    );
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
      const colorMatch = selectedColors.length === 0 || selectedColors.some(color => Object.keys(product.images).includes(color));
      const priceMatch = product.price <= priceRange;
      return categoryMatch && colorMatch && priceMatch;
    });
  }, [products, selectedCategories, selectedColors, priceRange]);

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setPriceRange(5000000);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-1/4">
          <div className="sticky top-24 space-y-6">
            <h2 className="text-2xl font-bold text-brand-light-text">فیلترها</h2>
            
            {/* Category Filter */}
            <FilterSection title="دسته بندی">
              {CATEGORIES.map(category => (
                <div key={category.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`cat-${category.id}`}
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => handleCategoryChange(category.name)}
                    className="h-4 w-4 rounded border-brand-muted-text bg-brand-surface text-brand-neon-blue focus:ring-brand-neon-blue"
                  />
                  <label htmlFor={`cat-${category.id}`} className="mr-3 text-sm text-brand-muted-text">{category.name}</label>
                </div>
              ))}
            </FilterSection>

            {/* Color Filter */}
            <FilterSection title="رنگ">
                <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                    <button
                        key={color.id}
                        onClick={() => handleColorChange(color.name)}
                        className={`h-8 w-8 rounded-full border-2 transition-transform duration-200 ${selectedColors.includes(color.name) ? 'border-brand-neon-blue scale-110' : 'border-brand-muted-text'}`}
                        title={color.name}
                    >
                        <span className={`block h-full w-full rounded-full ${color.tailwindClass}`} />
                    </button>
                ))}
                </div>
            </FilterSection>

            {/* Price Filter */}
            <FilterSection title="محدوده قیمت">
              <label htmlFor="price" className="sr-only">قیمت</label>
              <input
                id="price"
                type="range"
                min="0"
                max="5000000"
                step="100000"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full h-2 bg-brand-surface rounded-lg appearance-none cursor-pointer accent-brand-neon-blue"
              />
              <div className="text-sm text-brand-muted-text mt-2 text-left">تا {priceRange.toLocaleString('fa-IR')} تومان</div>
            </FilterSection>

            <button
              onClick={clearFilters}
              className="w-full border border-brand-neon-blue/50 text-brand-neon-blue py-2 rounded-md hover:bg-brand-neon-blue/10 transition-colors"
            >
              پاک کردن فیلترها
            </button>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="w-full lg:w-3/4">
          <h1 className="text-3xl font-bold mb-6 text-brand-light-text text-center lg:text-right">همه محصولات ({filteredProducts.length})</h1>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
             <div className="text-center py-16">
                <p className="text-xl text-brand-muted-text">هیچ محصولی با فیلترهای شما مطابقت ندارد.</p>
                <p className="mt-2 text-brand-muted-text/80">سعی کنید انتخاب خود را تغییر دهید.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const FilterSection: React.FC<{ title: string, children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="border-b border-brand-neon-blue/20 py-4">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-right">
                <h3 className="font-semibold text-brand-light-text">{title}</h3>
                <ChevronDownIcon />
            </button>
            {isOpen && <div className="mt-4 space-y-2">{children}</div>}
        </div>
    );
};

export default ProductsPage;