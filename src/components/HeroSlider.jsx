import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

const defaultSlides = [
  {
    id: 'default1',
    image: "/images/saree_hero.png",
    title: "The Heritage Collection",
    subtitle: "Authentic Kanchipuram Silks",
    cta: "Shop the Collection"
  },
  {
    id: 'default2',
    image: "/images/saree_red.png",
    title: "Bridal Elegance",
    subtitle: "For Your Special Day",
    cta: "Explore Bridal"
  },
  {
    id: 'default3',
    image: "/images/saree_gold.png",
    title: "Modern Classics",
    subtitle: "Designer Sarees for the Contemporary Woman",
    cta: "View Designs"
  }
];

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const q = query(collection(db, "carousel"), orderBy("order", "asc"));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSlides(data.length > 0 ? data : defaultSlides);
      } catch (err) {
        console.error("Error fetching slides:", err);
        setSlides(defaultSlides);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, []);

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(nextSlide, 7000);
    return () => clearInterval(timer);
  }, [slides]);


  if (loading) {
    return (
      <div className="h-[85vh] md:h-[95vh] w-full bg-stone-900 flex items-center justify-center">
        <Loader2 className="text-gold-500 animate-spin h-12 w-12" />
      </div>
    );
  }

  if (slides.length === 0) return null;

  return (
    <div className="relative h-[85vh] md:h-[95vh] w-full overflow-hidden bg-stone-900 group">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Image */}
          <motion.div 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 8, ease: "easeOut" }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[currentSlide]?.image})` }}
          />
          
          {/* Overlay gradient for readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/40 to-stone-900/20" />
          
          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 1, ease: "easeOut" }}
              className="flex flex-col items-center"
            >
              <p className="text-xs md:text-sm uppercase tracking-[0.4em] mb-6 text-gold-400 font-medium">
                {slides[currentSlide]?.subtitle}
              </p>
              <h1 className="font-playfair text-5xl md:text-7xl lg:text-8xl mb-10 drop-shadow-2xl font-normal tracking-wide max-w-4xl leading-tight">
                {slides[currentSlide]?.title}
              </h1>
              <Link 
                to="/collections" 
                className="group relative inline-flex items-center justify-center px-10 py-4 uppercase tracking-[0.2em] text-sm font-medium transition-all duration-500 bg-gold-500 text-white hover:bg-gold-600 shadow-lg hover:shadow-gold-500/30 hover:-translate-y-1 overflow-hidden rounded-sm"
              >
                <span className="relative z-10">{slides[currentSlide]?.cta}</span>
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/20 text-white/70 flex items-center justify-center hover:bg-white hover:text-stone-900 hover:scale-110 transition-all duration-300 backdrop-blur-md opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft size={28} strokeWidth={1.5} />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-6 md:right-12 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border border-white/20 text-white/70 flex items-center justify-center hover:bg-white hover:text-stone-900 hover:scale-110 transition-all duration-300 backdrop-blur-md opacity-0 group-hover:opacity-100"
      >
        <ChevronRight size={28} strokeWidth={1.5} />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1 transition-all duration-500 rounded-full ${
              index === currentSlide ? 'bg-gold-400 w-12' : 'bg-white/30 w-4 hover:bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );

}
