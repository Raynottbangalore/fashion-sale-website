import { Minus, Plus, Trash2 } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function CartItem({ product }) {
  const { updateCartQuantity, removeFromCart } = useShop();

  return (
    <div className="flex gap-4 sm:gap-6 py-6 border-b border-stone-100 last:border-0">
      {/* Image */}
      <div className="w-24 sm:w-32 aspect-[3/4] shrink-0 bg-stone-50 rounded-2xl overflow-hidden border border-stone-100">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
      </div>

      {/* Details */}
      <div className="flex-grow flex flex-col justify-between py-1">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest mb-1 font-bold">{product.category}</p>
            <h3 className="font-playfair text-lg text-stone-900 mb-1 leading-tight">{product.name}</h3>
            <p className="text-[#8a1c31] font-bold">₹{(product.price || 0).toLocaleString('en-IN')}</p>
          </div>
          <button 
            onClick={() => removeFromCart(product.id)}
            className="text-stone-300 hover:text-red-500 transition-all p-2 hover:bg-red-50 rounded-full"
          >
            <Trash2 size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-stone-200 rounded-full bg-stone-50/50">
            <button 
              onClick={() => updateCartQuantity(product.id, product.quantity - 1)}
              className="p-2 text-stone-500 hover:text-[#8a1c31] transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="w-8 text-center text-sm font-bold text-stone-800">{product.quantity}</span>
            <button 
              onClick={() => updateCartQuantity(product.id, product.quantity + 1)}
              className="p-2 text-stone-500 hover:text-[#8a1c31] transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
          <p className="text-sm font-bold text-stone-900">
            ₹{((product.price || 0) * product.quantity).toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
}
