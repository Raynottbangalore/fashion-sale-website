import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingCart, User, Menu, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useShop } from '../context/ShopContext';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { cart, wishlist } = useShop();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;
  
  // Close menu when user changes (e.g. after login)
  useEffect(() => {
    setIsUserMenuOpen(false);
  }, [currentUser]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Collections', path: '/collections' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm py-4' : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-stone-800 hover:text-gold-500 transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu size={24} />
        </button>

        {/* Logo */}
        <Link to="/" className="text-2xl md:text-3xl font-playfair font-bold text-stone-900 tracking-wide flex items-center">
          Fashion <span className="text-gold-500 font-light italic ml-1">Sale</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              className={`relative text-sm uppercase tracking-widest font-medium transition-colors hover:text-gold-500 group ${
                location.pathname === link.path ? 'text-gold-500' : 'text-stone-600'
              }`}
            >
              {link.name}
              <span className={`absolute -bottom-1 left-0 w-full h-[1px] bg-gold-500 origin-left transform transition-transform duration-300 ease-out ${
                location.pathname === link.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`} />
            </Link>
          ))}
        </nav>

        {/* Icons */}
        <div className="flex items-center space-x-5 md:space-x-7">
          <Link to="/wishlist" className="text-stone-600 hover:text-gold-500 transition-all hover:scale-110 relative group">
            <Heart size={22} strokeWidth={1.5} className="group-hover:fill-gold-50/20" />
            {wishlistCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-[#8a1c31] text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-medium shadow-sm"
              >
                {wishlistCount}
              </motion.span>
            )}
          </Link>
          <Link to="/cart" className="text-stone-600 hover:text-gold-500 transition-all hover:scale-110 relative group">
            <ShoppingCart size={22} strokeWidth={1.5} />
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-[#8a1c31] text-white text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-medium shadow-sm"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>
          
          <div className="relative">
            {currentUser ? (
              <div className="relative flex items-center">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-stone-600 hover:text-gold-500 transition-all focus:outline-none"
                >
                  <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-bold text-xs border border-gold-200">
                    {(currentUser.email || currentUser.phoneNumber || "U").charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden lg:block text-xs font-semibold tracking-tight max-w-[120px] truncate">
                    {currentUser.email || currentUser.phoneNumber}
                  </span>
                </button>
                
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <>
                      {/* Invisible backdrop to close menu when clicking outside */}
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-[0_15px_50px_-12px_rgba(0,0,0,0.25)] border border-stone-100 py-3 z-50 overflow-hidden"
                        style={{ transformOrigin: 'top right' }}
                      >
                        {/* Top Accent Decoration */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold-400 to-gold-600"></div>

                        <div className="px-5 py-3 border-b border-stone-50 bg-stone-50/50 mb-2">
                          <p className="text-[10px] text-stone-400 uppercase tracking-[0.15em] font-bold mb-1">Signed In As</p>
                          <p className="text-sm font-semibold text-stone-800 truncate">
                            {currentUser.email || currentUser.phoneNumber}
                          </p>
                        </div>
                        
                        <div className="px-2">
                          <button 
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-3 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-all group"
                          >
                            <div className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors text-red-500">
                              <LogOut size={16} />
                            </div>
                            <span className="font-semibold uppercase tracking-wider text-xs">Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="text-stone-600 hover:text-gold-500 transition-all hover:scale-110 flex items-center space-x-1">
                <User size={22} strokeWidth={1.5} />
                <span className="hidden md:block text-xs uppercase tracking-widest font-semibold">Login</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white/95 backdrop-blur-lg border-t border-stone-100 absolute w-full left-0 top-full shadow-lg"
          >
            <div className="flex flex-col py-6 px-6 space-y-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-sm uppercase tracking-widest font-medium transition-colors ${
                    location.pathname === link.path ? 'text-gold-500' : 'text-stone-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {currentUser ? (
                <div className="pt-4 border-t border-stone-100 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {(currentUser.email || currentUser.phoneNumber || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs text-stone-400 uppercase tracking-wider">Account</p>
                      <p className="text-sm font-semibold text-stone-800">{currentUser.email || currentUser.phoneNumber}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 text-red-600 rounded-lg text-sm font-bold uppercase tracking-widest transition-colors hover:bg-red-100"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="text-sm uppercase tracking-widest font-medium text-stone-600 transition-colors hover:text-gold-500 pt-4 border-t border-stone-100"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

