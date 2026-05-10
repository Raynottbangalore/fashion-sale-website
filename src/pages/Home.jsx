import HeroSlider from '../components/HeroSlider';
import ProductGrid from '../components/ProductGrid';
import { motion } from 'framer-motion';
import { ShieldCheck, CreditCard, Lock, PackageCheck, Headset, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function Home() {
  const { products, loading, seedProducts } = useShop();
  const [activeBudget, setActiveBudget] = useState('Under ₹2,000');
  
  // Filter products for different sections
  // Prefer products marked for homepage latest collection
  const latestProducts = products.some(p => p.homepageLatest) 
    ? products.filter(p => p.homepageLatest)
    : [...products].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);
  const budgetProducts = products.filter(p => {
    if (activeBudget === 'Under ₹2,000') return p.price < 2000;
    if (activeBudget === '₹2,000 - ₹5,000') return p.price >= 2000 && p.price < 5000;
    if (activeBudget === '₹5,000 - ₹10,000') return p.price >= 5000 && p.price < 10000;
    return p.price >= 10000;
  }).slice(0, 4);

  // Collections State
  const [sareeCollections, setSareeCollections] = useState([]);
  const [collectionsLoading, setCollectionsLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const q = query(collection(db, "homeCollections"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Filter for active items only on frontend
        data = data.filter(item => item.status === "Active" || !item.status);

        setSareeCollections(data.length > 0 ? data : [
          { name: 'Kanjivaram', img: '/images/saree_hero.png', badge: '60+ products', order: 1 },
          { name: 'Mysore Silk', img: '/images/saree_gold.png', badge: '40+ Designs', order: 2 },
          { name: 'Daily Wear', img: '/images/saree_pastel.png', badge: '80+ Options', order: 3 }
        ]);
      } catch (err) {
        console.error("Error fetching collections:", err);
        setSareeCollections([
          { name: 'Kanjivaram', img: '/images/saree_hero.png', badge: '60+ products', order: 1 },
          { name: 'Mysore Silk', img: '/images/saree_gold.png', badge: '40+ Designs', order: 2 },
          { name: 'Daily Wear', img: '/images/saree_pastel.png', badge: '80+ Options', order: 3 }
        ]);
      } finally {
        setCollectionsLoading(false);
      }
    };
    fetchCollections();
  }, []);

  return (
    <div className="bg-[#fdfbf7]">
      <HeroSlider />

      {/* Seed Data Button (Visible only if no products exist) */}
      {products.length === 0 && !loading && (
        <div className="flex justify-center py-10 bg-white">
          <button 
            onClick={seedProducts}
            className="flex items-center gap-2 bg-stone-900 text-white px-6 py-3 rounded-full hover:bg-gold-600 transition-all shadow-xl"
          >
            <Database size={18} />
            Seed Initial Backend Data
          </button>
        </div>
      )}

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#8a1c31] border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Our Saree Collections */}
      <section className="py-24 px-4 md:px-8 container mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-playfair text-4xl text-stone-900 mb-5 font-bold inline-block relative tracking-wide">
            Our Saree Collections
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#8a1c31]"></span>
          </h2>
          <p className="text-stone-600 font-light mt-8 tracking-wide text-sm md:text-base">
            Discover the perfect blend of tradition and contemporary design
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-12 md:gap-20">
          {collectionsLoading ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-[#8a1c31] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : sareeCollections.map((cat, idx) => (
            <Link 
              key={cat.id || idx} 
              to={cat.categoryLink ? `/collections?category=${encodeURIComponent(cat.categoryLink)}` : '/collections'}
              className="flex flex-col items-center group cursor-pointer"
            >
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="flex flex-col items-center relative"
              >
                <div className="relative w-56 h-56 md:w-64 md:h-64 rounded-full overflow-hidden shadow-2xl mb-6 bg-stone-100">
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                </div>
                {/* Floating Badge - Outside overflow-hidden to prevent clipping */}
                <div className="absolute top-4 right-0 md:right-2 bg-[#8a1c31] text-white text-[10px] md:text-[11px] font-bold px-4 py-1.5 rounded-full z-20 shadow-xl border border-white/20 tracking-wider">
                  {cat.badge}
                </div>
                <h3 className="font-playfair text-xl font-bold text-[#8a1c31] group-hover:text-stone-900 transition-colors">
                  {cat.name}
                </h3>
              </motion.div>
            </Link>
          ))}
        </div>
      </section>


      {/* Shop with Complete Peace of Mind */}
      <section className="py-24 px-4 relative overflow-hidden bg-gradient-to-br from-[#4a0814] via-[#6b0f1f] to-[#36050e]">
        {/* Subtle grid pattern / dots */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="container mx-auto max-w-5xl relative z-10 text-center">
          
          <div className="inline-flex items-center space-x-2 border border-white/20 rounded-full px-4 py-1 mb-8 bg-black/20 backdrop-blur-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00d084]"></div>
            <span className="text-white/90 text-[10px] uppercase tracking-widest font-medium">Exclusive Customer Benefits</span>
          </div>

          <h2 className="font-playfair text-4xl md:text-5xl text-white mb-12 font-bold tracking-wide">
            Shop with <span className="text-[#ffb800]">Complete Peace of Mind</span>
          </h2>

          <div className="max-w-3xl mx-auto border border-white/30 rounded-2xl p-8 mb-16 bg-white/5 backdrop-blur-md shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/5 to-transparent"></div>
            <p className="text-white/90 leading-relaxed text-lg font-light relative z-10">
              Experience the joy of shopping with <span className="text-[#ffb800] font-medium">FREE shipping</span> on orders above 
              ₹10,000 and flexible <span className="text-[#ffb800] font-medium">EMI options</span>. Every sarees comes with our 
              promise of quality, authenticity, and 100% secure delivery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: <PackageCheck size={28} strokeWidth={1.5} className="text-[#4a0814]" />, title: 'Free Shipping', subtitle: 'Eligible orders', extra: 'Pan India Delivery' },
              { icon: <CreditCard size={28} strokeWidth={1.5} className="text-[#4a0814]" />, title: 'Easy EMI', subtitle: 'Starting at', extra: 'Zero Down Payment' },
              { icon: <Lock size={28} strokeWidth={1.5} className="text-[#4a0814]" />, title: 'Secure Checkout', subtitle: 'Protected', extra: 'SSL Encrypted' }
            ].map((feature, idx) => (
              <div key={idx} className="border border-white/20 rounded-3xl p-10 bg-gradient-to-b from-white/10 to-transparent hover:from-white/15 transition-colors group relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-[#ffb800] opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity"></div>
                
                <div className="w-16 h-16 mx-auto bg-[#ffb800] rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,184,0,0.4)] group-hover:scale-110 transition-transform relative z-10">
                  {feature.icon}
                </div>
                <h3 className="text-white text-xl font-bold mb-3 relative z-10 tracking-wide">{feature.title}</h3>
                <p className="text-white/70 text-sm mb-6 font-light relative z-10">{feature.subtitle}</p>
                <div className="flex items-center justify-center space-x-2 text-white/50 text-[11px] relative z-10">
                  <div className="w-1 h-1 rounded-full bg-[#00d084]"></div>
                  <span className="tracking-wide uppercase">{feature.extra}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <div className="flex items-center space-x-2 border border-white/30 rounded-full px-6 py-2 bg-black/20 backdrop-blur-sm shadow-inner">
              <ShieldCheck size={16} className="text-[#ffb800]" />
              <span className="text-white/90 text-[13px] font-light tracking-wide">Trusted by 10,000+ customers</span>
            </div>
            <div className="flex items-center space-x-2 border border-white/30 rounded-full px-6 py-2 bg-black/20 backdrop-blur-sm shadow-inner">
              <Headset size={16} className="text-[#ffb800]" />
              <span className="text-white/90 text-[13px] font-light tracking-wide">24/7 Customer Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Budget */}
      <section className="py-24 px-4 md:px-8 container mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl text-stone-900 mb-5 font-bold inline-block relative tracking-wide">
            Shop by Budget
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#8a1c31]"></span>
          </h2>
          <p className="text-stone-600 font-light mt-8 tracking-wide text-sm md:text-base">
            Find the perfect saree that fits your budget
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {['Under ₹2,000', '₹2,000 - ₹5,000', '₹5,000 - ₹10,000', 'Premium Collection'].map(budget => (
            <button
              key={budget}
              onClick={() => setActiveBudget(budget)}
              className={`px-6 py-2.5 rounded text-[13px] tracking-wide transition-all duration-300 border-[1.5px] ${
                activeBudget === budget 
                  ? 'bg-[#8a1c31] border-[#8a1c31] text-white font-medium shadow-md' 
                  : 'bg-transparent border-[#8a1c31] text-[#8a1c31] hover:bg-[#8a1c31]/5 font-medium'
              }`}
            >
              {budget}
            </button>
          ))}
        </div>

        <ProductGrid products={budgetProducts} />
      </section>

      {/* Latest Collection */}
      <section className="py-24 px-4 md:px-8 container mx-auto bg-pastel-50">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-4xl text-stone-900 mb-5 font-bold inline-block relative tracking-wide">
            Latest Collection
            <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-14 h-1 bg-[#8a1c31]"></span>
          </h2>
          <p className="text-stone-600 font-light mt-8 tracking-wide text-sm md:text-base">
            Discover our newest arrivals, crafted with passion and precision
          </p>
        </div>

        <ProductGrid products={latestProducts} />
      </section>
    </div>
  );
}
