import { useState } from 'react';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

export default function ProductCard({ product }) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist } = useShop();

  const isWishlisted = wishlist.some(item => item.id === product.id);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleWishlist = (e) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="group flex flex-col cursor-pointer bg-white rounded-2xl p-3 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-stone-100/50 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Top right heart icon */}
      <button 
        onClick={handleWishlist}
        className={`absolute top-6 right-6 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
          isWishlisted ? 'bg-red-50 text-red-500' : 'bg-white/80 backdrop-blur-md text-stone-500 hover:text-red-500 hover:bg-white'
        }`}
      >
        <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
      </button>

      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-stone-50 mb-5">
        <img 
          src={isHovered && product.hoverImage ? product.hoverImage : product.image} 
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
        />
        
        {/* Badges */}
        {product.discount ? (
          <div className="absolute top-0 left-0 bg-[#8a1c31] text-white text-[10px] font-bold tracking-wider px-3 py-1 z-10 rounded-br-lg">
            {product.discount} OFF
          </div>
        ) : product.isNew && (
          <div className="absolute top-3 left-3 bg-[#8a1c31] text-white text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full z-10 font-medium shadow-sm">
            New Arrival
          </div>
        )}

        {/* Hover Actions */}
        <div 
          className={`absolute bottom-4 left-0 w-full px-4 flex justify-center gap-3 transition-all duration-500 ease-out ${
            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <button 
            onClick={handleWishlist}
            className={`p-3 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 group/btn ${
              isWishlisted ? 'bg-[#8a1c31] text-white' : 'bg-white/95 backdrop-blur-md text-stone-700 hover:bg-[#8a1c31] hover:text-white'
            }`}
          >
            <Heart size={18} strokeWidth={1.5} fill={isWishlisted ? "currentColor" : "none"} className="transition-colors" />
          </button>
          <button 
            onClick={handleAddToCart}
            className="bg-white/95 backdrop-blur-md text-stone-700 p-3 rounded-full hover:bg-[#8a1c31] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
          >
            <ShoppingCart size={18} strokeWidth={1.5} />
          </button>
          <button 
            onClick={handleCardClick}
            className="bg-white/95 backdrop-blur-md text-stone-700 p-3 rounded-full hover:bg-[#8a1c31] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1"
          >
            <Eye size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="text-center px-4 pb-4">
        <p className="text-[11px] text-stone-400 uppercase tracking-[0.2em] mb-2 font-medium">{product.category}</p>
        <h3 className="font-playfair text-lg text-stone-800 mb-2 line-clamp-1 group-hover:text-[#8a1c31] transition-colors duration-300">{product.name}</h3>
        <p className="text-[#8a1c31] font-medium text-lg">
          ₹{(product.price || 0).toLocaleString('en-IN')}
        </p>
      </div>
    </motion.div>
  );
}
