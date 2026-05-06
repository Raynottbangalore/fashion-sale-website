import { Link } from 'react-router-dom';
import { ShoppingCart, ArrowRight } from 'lucide-react';
import CartItem from '../components/CartItem';
import { useShop } from '../context/ShopContext';

export default function Cart() {
  const { cart } = useShop();
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 10000 ? 0 : 500; // Free shipping above 10k
  const total = subtotal + shipping;

  return (
    <div className="bg-pastel-50 min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex items-center space-x-4 mb-10">
          <ShoppingCart className="text-gold-500" size={32} />
          <h1 className="font-playfair text-4xl text-stone-900">Shopping Cart</h1>
        </div>

        {cart.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-3xl shadow-sm border border-stone-100">
              <div className="space-y-2">
                {cart.map(item => (
                  <CartItem key={item.id} product={item} />
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 sticky top-32">
                <h3 className="font-playfair text-2xl text-stone-900 mb-6 pb-4 border-b border-stone-200">Order Summary</h3>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-stone-600 font-light">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-stone-600 font-light">
                    <span>Shipping</span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span>₹{shipping.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  <div className="flex justify-between text-stone-900 font-medium pt-4 border-t border-stone-200 text-lg">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Link 
                  to="/checkout"
                  className="w-full bg-stone-900 text-white py-4 rounded-full flex items-center justify-center space-x-2 hover:bg-gold-500 transition-colors uppercase tracking-wider text-sm mb-4"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </Link>
                
                <div className="text-center">
                  <Link to="/collections" className="text-sm text-stone-500 hover:text-gold-500 transition-colors underline-offset-4 hover:underline">
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 text-center rounded-3xl shadow-sm border border-stone-100">
            <ShoppingCart className="text-stone-300 mx-auto mb-4" size={48} />
            <h2 className="font-playfair text-2xl text-stone-900 mb-2">Your cart is empty</h2>
            <p className="text-stone-500 font-light mb-8">Looks like you haven't added anything yet.</p>
            <Link to="/collections" className="inline-block bg-stone-900 text-white px-8 py-3 rounded-full hover:bg-gold-500 transition-colors uppercase tracking-wider text-sm">
              Start Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
