import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  ShoppingCart, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  RefreshCcw,
  Star,
  Minus,
  Plus,
  Share2,
  Settings,
  Info
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, addToCart, toggleWishlist, wishlist } = useShop();
  const toast = useToast();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImg, setActiveImg] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundProduct = getProductById(id);
    if (foundProduct) {
      setProduct(foundProduct);
      setActiveImg(foundProduct.image);
      setLoading(false);
    } else {
      // If products are still loading or not found, we wait a bit
      const timer = setTimeout(() => {
        setLoading(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [id, getProductById]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4">
        <h2 className="font-playfair text-3xl text-stone-800 mb-4">Product Not Found</h2>
        <p className="text-stone-500 mb-8 text-center">The product you're looking for might have been moved or deleted.</p>
        <button 
          onClick={() => navigate('/collections')}
          className="bg-[#8a1c31] text-white px-8 py-3 rounded-full hover:bg-stone-900 transition-colors"
        >
          Return to Collection
        </button>
      </div>
    );
  }

  const isWishlisted = wishlist.some(item => item.id === product.id);
  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];

  return (
    <div className="bg-stone-50 pt-20 pb-24">
      {/* Breadcrumbs */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-stone-400 text-sm">
          <span className="cursor-pointer hover:text-gold-600" onClick={() => navigate('/')}>Home</span>
          <ChevronRight size={14} />
          <span className="cursor-pointer hover:text-gold-600" onClick={() => navigate('/collections')}>Collections</span>
          <ChevronRight size={14} />
          <span className="text-stone-600 font-medium">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          
          {/* Left: Image Gallery */}
          <div className="space-y-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-white shadow-2xl group"
            >
              <img 
                src={activeImg} 
                alt={product.name} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {product.discount && (
                <div className="absolute top-6 left-6 bg-[#8a1c31] text-white px-4 py-1.5 rounded-full text-xs font-bold tracking-widest shadow-lg">
                  {product.discount} OFF
                </div>
              )}
              
              {/* Image Index Indicator */}
              <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest">
                {allImages.indexOf(activeImg) + 1} / {allImages.length}
              </div>
            </motion.div>
            
            <div className="grid grid-cols-5 gap-3">
              {allImages.map((img, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveImg(img)}
                  className={`aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
                    activeImg === img ? 'border-[#8a1c31] scale-95 shadow-md' : 'border-transparent hover:border-stone-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="flex flex-col">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-gold-100 text-gold-700 text-[10px] uppercase font-bold tracking-[0.2em] rounded-full">
                  {product.category}
                </span>
                <div className="flex items-center gap-1 text-gold-500 ml-auto">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < 4 ? "currentColor" : "none"} />)}
                  <span className="text-stone-400 text-xs ml-1">(48 Reviews)</span>
                </div>
              </div>

              <h1 className="font-playfair text-4xl md:text-5xl text-stone-900 mb-4 leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4 mb-6">
                <p className="text-3xl font-medium text-[#8a1c31]">
                  ₹{(product.price || 0).toLocaleString('en-IN')}
                </p>
                {product.discount && (
                  <p className="text-xl text-stone-400 line-through">
                    ₹{((product.price || 0) / 0.9).toLocaleString('en-IN')}
                  </p>
                )}
              </div>

              <p className="text-stone-600 leading-relaxed mb-8 text-lg font-light">
                {product.description}
              </p>

              {/* Product Specifications Section */}
              {product.specifications && (
                <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="flex items-center gap-2 mb-4 text-[#8a1c31]">
                    <Settings size={18} />
                    <h3 className="font-playfair text-xl font-bold">Product Specifications</h3>
                  </div>
                  <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm">
                    {[
                      { label: 'Material', value: product.specifications.material },
                      { label: 'Work', value: product.specifications.work },
                      { label: 'Body Color', value: product.specifications.bodyColor },
                      { label: 'Blouse Color', value: product.specifications.blouseColor },
                      { label: 'Type', value: product.specifications.type },
                      { label: 'Length', value: product.specifications.length },
                      { label: 'Care Instructions', value: product.specifications.careInstructions },
                    ].map((spec, i) => spec.value && (
                      <div key={i} className={`flex items-center justify-between p-4 ${i % 2 === 0 ? 'bg-stone-50/50' : 'bg-white'} border-b border-stone-50 last:border-0`}>
                        <span className="text-sm font-bold text-stone-500 uppercase tracking-widest">{spec.label}:</span>
                        <span className="text-sm font-medium text-stone-700 text-right">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Perfect For / Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4 text-[#8a1c31]">
                    <Info size={18} />
                    <h3 className="font-playfair text-xl font-bold">Perfect For</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, i) => (
                      <span key={i} className="px-5 py-2 bg-[#8a1c31]/5 text-[#8a1c31] text-xs font-bold rounded-full border border-[#8a1c31]/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-6 mt-auto bg-white p-6 rounded-3xl border border-stone-100 shadow-xl">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-stone-100 rounded-full px-4 py-2 bg-stone-50">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 text-stone-500 hover:text-[#8a1c31] transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="w-12 text-center font-bold text-stone-800">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 text-stone-500 hover:text-[#8a1c31] transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>

                <div className="flex gap-2 ml-auto">
                  <button 
                    onClick={() => toggleWishlist(product)}
                    className={`p-4 rounded-full border transition-all ${
                      isWishlisted 
                        ? 'bg-red-50 border-red-100 text-red-500 shadow-inner' 
                        : 'bg-stone-50 border-stone-100 text-stone-400 hover:text-red-500 hover:bg-white'
                    }`}
                  >
                    <Heart size={22} fill={isWishlisted ? "currentColor" : "none"} />
                  </button>

                  <button className="p-4 rounded-full bg-stone-50 border border-stone-100 text-stone-400 hover:text-blue-500 hover:bg-white transition-all">
                    <Share2 size={22} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => addToCart(product, quantity)}
                  className="flex-1 bg-[#8a1c31] text-white py-4 rounded-2xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs hover:bg-stone-900 transition-all duration-500 shadow-xl shadow-[#8a1c31]/20"
                >
                  <ShoppingCart size={18} />
                  Add to Cart
                </button>
                <button 
                  onClick={() => navigate('/collections')}
                  className="flex-1 border-2 border-[#8a1c31] text-[#8a1c31] py-4 rounded-2xl font-bold uppercase tracking-widest text-xs hover:bg-[#8a1c31] hover:text-white transition-all duration-500"
                >
                  Browse More
                </button>
              </div>
            </div>

            {/* Features/Trust */}
            <div className="grid grid-cols-3 gap-4 mt-12 pt-12 border-t border-stone-200">
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-white border border-stone-100 rounded-full flex items-center justify-center text-[#8a1c31] shadow-sm">
                  <Truck size={20} />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Free Shipping</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-white border border-stone-100 rounded-full flex items-center justify-center text-[#8a1c31] shadow-sm">
                  <RefreshCcw size={20} />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500">7 Day Return</span>
              </div>
              <div className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 bg-white border border-stone-100 rounded-full flex items-center justify-center text-[#8a1c31] shadow-sm">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-stone-500">Secure Payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
