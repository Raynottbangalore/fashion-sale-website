import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import WishlistItem from '../components/WishlistItem';
import { useShop } from '../context/ShopContext';

export default function Wishlist() {
  const { wishlist } = useShop();

  return (
    <div className="bg-pastel-50 min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-4xl">
        <div className="flex items-center space-x-4 mb-10">
          <Heart className="text-gold-500" size={32} />
          <h1 className="font-playfair text-4xl text-stone-900">Your Wishlist</h1>
        </div>

        {wishlist.length > 0 ? (
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-stone-100">
            <div className="space-y-4">
              {wishlist.map(item => (
                <WishlistItem key={item.id} product={item} />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-3xl shadow-sm border border-stone-100">
            <Heart className="text-stone-300 mx-auto mb-4" size={48} />
            <h2 className="font-playfair text-2xl text-stone-900 mb-2">Your wishlist is empty</h2>
            <p className="text-stone-500 font-light mb-8">Save items you love to review them later.</p>
            <Link to="/collections" className="inline-block bg-stone-900 text-white px-8 py-3 rounded-full hover:bg-gold-500 transition-colors uppercase tracking-wider text-sm">
              Explore Collections
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
