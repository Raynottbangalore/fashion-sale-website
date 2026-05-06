import { ShoppingCart, Trash2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigate } from 'react-router-dom';

export default function WishlistItem({ product }) {
  const { toggleWishlist, addToCart } = useShop();
  const navigate = useNavigate();

  const handleMoveToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    toggleWishlist(product); // Remove from wishlist after moving to cart
  };

  return (
    <div 
      className="flex gap-4 sm:gap-6 py-6 border-b border-stone-100 last:border-0 group cursor-pointer"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Image */}
      <div className="w-24 sm:w-32 aspect-[3/4] shrink-0 bg-stone-50 rounded-2xl overflow-hidden border border-stone-100">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
      </div>

      {/* Details */}
      <div className="flex-grow flex flex-col justify-between py-1">
        <div>
          <div className="flex justify-between items-start">
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1 font-bold">{product.category}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }}
              className="text-stone-300 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-full"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <h3 className="font-playfair text-lg text-stone-900 mb-1 leading-tight">{product.name}</h3>
          <p className="text-[#8a1c31] font-bold mb-4">₹{(product.price || 0).toLocaleString('en-IN')}</p>
        </div>

        <div>
          <button 
            onClick={handleMoveToCart}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#8a1c31] text-white px-6 py-2.5 rounded-full hover:bg-stone-900 transition-all text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#8a1c31]/10"
          >
            <ShoppingCart size={14} />
            <span>Move to Cart</span>
          </button>
        </div>
      </div>
    </div>
  );
}
