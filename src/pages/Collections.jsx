import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import ProductGrid from '../components/ProductGrid';
import FilterSidebar from '../components/FilterSidebar';
import { useShop } from '../context/ShopContext';

export default function Collections() {
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState('recommended');
  const [filters, setFilters] = useState({ category: 'All', price: 'All' });
  const { products, loading } = useShop();

  const filteredProducts = useMemo(() => {
    let result = [...products];
    
    // Category Filter
    if (filters.category !== 'All') {
      result = result.filter(p => p.category === filters.category);
    }
    
    // Price Filter
    if (filters.price !== 'All') {
      if (filters.price === 'Under ₹10,000') {
        result = result.filter(p => p.price < 10000);
      } else if (filters.price === '₹10,000 - ₹20,000') {
        result = result.filter(p => p.price >= 10000 && p.price <= 20000);
      } else if (filters.price === 'Over ₹20,000') {
        result = result.filter(p => p.price > 20000);
      }
    }

    // Sort
    if (sortBy === 'new') {
      const newArrivals = result.filter(p => p.isNew);
      if (newArrivals.length > 0) {
        result = newArrivals;
      } else {
        // Fallback to sorting by creation date if no "isNew" flag is found
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    }
    if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
    
    return result;
  }, [products, sortBy, filters]);

  return (
    <div className="bg-pastel-50 min-h-screen pt-8 pb-24">
      <div className="container mx-auto px-4 md:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end border-b border-stone-200 pb-8 mb-8">
          <div>
            <h1 className="font-playfair text-4xl md:text-5xl text-stone-900 mb-2">Our Collections</h1>
            <p className="text-stone-500 font-light">Explore our exquisite range of handcrafted sarees.</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end">
            <button 
              className="md:hidden flex items-center space-x-2 border border-stone-300 px-4 py-2 rounded-full text-sm font-medium text-stone-700"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            >
              <SlidersHorizontal size={16} />
              <span>Filters</span>
            </button>
            
            <div className="flex items-center space-x-3">
              <span className="text-sm text-stone-500 hidden sm:block">Sort by:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-stone-300 rounded-full px-4 py-2 text-sm font-medium text-stone-700 bg-white focus:outline-none focus:border-gold-500"
              >
                <option value="recommended">Recommended</option>
                <option value="new">New Arrivals</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Desktop */}
          <div className="hidden lg:block">
            <FilterSidebar onFilterChange={setFilters} />
          </div>

          {/* Sidebar - Mobile */}
          {isMobileFilterOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-white p-6 rounded-2xl shadow-sm border border-stone-100 mb-8"
            >
              <FilterSidebar onFilterChange={setFilters} />
            </motion.div>
          )}

          {/* Grid */}
          <div className="flex-grow">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#8a1c31] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <ProductGrid products={filteredProducts} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
