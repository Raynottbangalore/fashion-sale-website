import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  CreditCard, 
  ArrowLeft, 
  CheckCircle,
  Truck,
  QrCode
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function Checkout() {
  const { cart, clearCart } = useShop();
  const { currentUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const [formData, setFormData] = useState({
    fullName: currentUser?.displayName || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pinCode: '',
    paymentMethod: 'cod' // cod or upi
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const shipping = subtotal > 10000 ? 0 : 500;
  const total = subtotal + shipping;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        userId: currentUser?.uid,
        customerInfo: {
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pinCode: formData.pinCode,
        },
        items: cart,
        subtotal,
        shipping,
        total,
        paymentMethod: formData.paymentMethod,
        status: 'Pending',
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'orders'), orderData);
      await clearCart();
      setOrderPlaced(true);
      toast.success('Order placed successfully!');
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 5000);
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-pastel-50 flex items-center justify-center p-4">
        <div className="bg-white p-12 rounded-3xl shadow-xl max-w-md w-full text-center border border-stone-100">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} />
          </div>
          <h2 className="font-playfair text-4xl text-stone-900 mb-4">Order Confirmed!</h2>
          <p className="text-stone-600 mb-8 font-light">
            Thank you for your purchase. Your exquisite saree will be prepared for shipment shortly.
          </p>
          <div className="space-y-4">
            <Link 
              to="/" 
              className="block w-full bg-stone-900 text-white py-4 rounded-full hover:bg-gold-500 transition-colors uppercase tracking-widest text-sm font-medium"
            >
              Continue Shopping
            </Link>
            <p className="text-xs text-stone-400">Redirecting to home page in a few seconds...</p>
          </div>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-pastel-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="font-playfair text-3xl text-stone-900 mb-4">Your cart is empty</h2>
          <Link to="/collections" className="text-gold-600 hover:underline">Go to Collections</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-pastel-50 min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="font-playfair text-5xl text-[#800020] mb-2">Checkout</h1>
          <p className="text-stone-500 font-light tracking-wide">Complete your order details</p>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-8">
            {/* Shipping Section */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden">
              <div className="bg-[#800020] p-6 flex items-center space-x-4">
                <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white font-bold">2</div>
                <h2 className="text-xl font-playfair text-white">Shipping & Payment</h2>
              </div>
              
              <div className="p-8 md:p-10 space-y-10">
                {/* Personal Info */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-stone-900">
                    <User size={20} className="text-gold-600" />
                    <h3 className="font-medium">Personal Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm text-stone-500 ml-1">Full Name *</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input 
                          type="text" 
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
                          placeholder="Enter your name"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-stone-500 ml-1">Email *</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input 
                          type="email" 
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
                          placeholder="Enter your email"
                        />
                      </div>
                    </div>
                    <div className="space-y-2 md:col-span-1">
                      <label className="text-sm text-stone-500 ml-1">Phone *</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={18} />
                        <input 
                          type="tel" 
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
                          placeholder="Enter phone number"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-stone-900">
                    <MapPin size={20} className="text-gold-600" />
                    <h3 className="font-medium">Shipping Address</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-3 space-y-2">
                      <label className="text-sm text-stone-500 ml-1">Address *</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 text-stone-300" size={18} />
                        <textarea 
                          name="address"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full pl-12 pr-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all resize-none"
                          placeholder="House No, Street, Landmark"
                        ></textarea>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-stone-500 ml-1">City *</label>
                      <input 
                        type="text" 
                        name="city"
                        required
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
                        placeholder="City"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-stone-500 ml-1">State *</label>
                      <input 
                        type="text" 
                        name="state"
                        required
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
                        placeholder="State"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-stone-500 ml-1">PIN Code *</label>
                      <input 
                        type="text" 
                        name="pinCode"
                        required
                        value={formData.pinCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 transition-all"
                        placeholder="PIN Code"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-2 text-stone-900">
                    <CreditCard size={20} className="text-gold-600" />
                    <h3 className="font-medium">Payment Method</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-gold-500 bg-gold-50/30' : 'border-stone-100 hover:border-stone-200'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="cod"
                        className="sr-only"
                        checked={formData.paymentMethod === 'cod'}
                        onChange={handleInputChange}
                      />
                      <Truck className={`mr-4 ${formData.paymentMethod === 'cod' ? 'text-gold-600' : 'text-stone-400'}`} size={24} />
                      <div>
                        <p className="font-medium text-stone-900">Cash on Delivery</p>
                        <p className="text-xs text-stone-500">Pay when you receive your order</p>
                      </div>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'cod' ? 'border-gold-500' : 'border-stone-300'}`}>
                        {formData.paymentMethod === 'cod' && <div className="w-2.5 h-2.5 bg-gold-500 rounded-full"></div>}
                      </div>
                    </label>

                    <label className={`relative flex items-center p-6 border-2 rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'upi' ? 'border-gold-500 bg-gold-50/30' : 'border-stone-100 hover:border-stone-200'}`}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value="upi"
                        className="sr-only"
                        checked={formData.paymentMethod === 'upi'}
                        onChange={handleInputChange}
                      />
                      <QrCode className={`mr-4 ${formData.paymentMethod === 'upi' ? 'text-gold-600' : 'text-stone-400'}`} size={24} />
                      <div>
                        <p className="font-medium text-stone-900">UPI / QR Code</p>
                        <p className="text-xs text-stone-500">Scan QR & share screenshot</p>
                      </div>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center ${formData.paymentMethod === 'upi' ? 'border-gold-500' : 'border-stone-300'}`}>
                        {formData.paymentMethod === 'upi' && <div className="w-2.5 h-2.5 bg-gold-500 rounded-full"></div>}
                      </div>
                    </label>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex flex-col md:flex-row items-center gap-4 pt-6">
                  <Link 
                    to="/cart" 
                    className="w-full md:w-1/2 flex items-center justify-center space-x-2 py-4 border border-stone-200 rounded-full text-stone-600 hover:bg-stone-50 transition-colors uppercase tracking-widest text-xs font-medium"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Cart</span>
                  </Link>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="w-full md:w-1/2 bg-[#800020] text-white py-4 rounded-full hover:bg-stone-900 transition-colors uppercase tracking-widest text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-stone-100 sticky top-32">
              <h3 className="font-playfair text-2xl text-stone-900 mb-6 pb-4 border-b border-stone-200">Order Summary</h3>
              
              <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1 mr-4">
                      <p className="text-sm text-stone-800 font-medium line-clamp-1">{item.name}</p>
                      <p className="text-xs text-stone-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-stone-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
              
              <div className="space-y-4 pt-6 border-t border-stone-200">
                <div className="flex justify-between text-stone-600 font-light text-sm">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-stone-600 font-light text-sm">
                  <span>Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>₹{shipping.toLocaleString('en-IN')}</span>
                  )}
                </div>
                <div className="flex justify-between text-[#800020] font-semibold pt-4 text-xl">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="mt-8 p-4 bg-green-50 rounded-2xl flex items-center space-x-3 text-green-700">
                <CheckCircle size={18} />
                <span className="text-xs font-medium">Secure Checkout</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
