import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function FilterSidebar({ onFilterChange }) {
  const [openSection, setOpenSection] = useState({
    categories: true,
    price: true,
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPrice, setSelectedPrice] = useState('All');

  const toggleSection = (section) => {
    setOpenSection(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    onFilterChange({ category: cat, price: selectedPrice });
  };

  const handlePriceChange = (price) => {
    setSelectedPrice(price);
    onFilterChange({ category: selectedCategory, price: price });
  };

  const categories = ['All', 'Silk', 'Bridal', 'Designer', 'Cotton'];
  const prices = ['All', 'Under ₹10,000', '₹10,000 - ₹20,000', 'Over ₹20,000'];

  return (
    <div className="w-full lg:w-64 shrink-0 pr-0 lg:pr-8 space-y-8">
      {/* Categories */}
      <div className="border-b border-stone-200/60 pb-6">
        <button 
          onClick={() => toggleSection('categories')}
          className="w-full flex justify-between items-center text-stone-900 font-playfair text-xl tracking-wide mb-6 group"
        >
          Categories
          <span className="text-stone-400 group-hover:text-gold-500 transition-colors">
            {openSection.categories ? <ChevronUp size={20} strokeWidth={1.5} /> : <ChevronDown size={20} strokeWidth={1.5} />}
          </span>
        </button>
        {openSection.categories && (
          <div className="space-y-4">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="category" 
                  value={cat} 
                  checked={selectedCategory === cat}
                  onChange={() => handleCategoryChange(cat)}
                  className="w-4 h-4 text-gold-500 border-stone-300 focus:ring-gold-500 accent-gold-500 cursor-pointer" 
                />
                <span className={`font-light text-sm tracking-wide transition-colors ${selectedCategory === cat ? 'text-gold-600 font-medium' : 'text-stone-600 group-hover:text-gold-500'}`}>{cat}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="border-b border-stone-200/60 pb-6">
        <button 
          onClick={() => toggleSection('price')}
          className="w-full flex justify-between items-center text-stone-900 font-playfair text-xl tracking-wide mb-6 group"
        >
          Price
          <span className="text-stone-400 group-hover:text-gold-500 transition-colors">
            {openSection.price ? <ChevronUp size={20} strokeWidth={1.5} /> : <ChevronDown size={20} strokeWidth={1.5} />}
          </span>
        </button>
        {openSection.price && (
          <div className="space-y-4">
            {prices.map((price) => (
              <label key={price} className="flex items-center space-x-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="price" 
                  value={price} 
                  checked={selectedPrice === price}
                  onChange={() => handlePriceChange(price)}
                  className="w-4 h-4 text-gold-500 border-stone-300 focus:ring-gold-500 accent-gold-500 cursor-pointer" 
                />
                <span className={`font-light text-sm tracking-wide transition-colors ${selectedPrice === price ? 'text-gold-600 font-medium' : 'text-stone-600 group-hover:text-gold-500'}`}>{price}</span>
              </label>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
