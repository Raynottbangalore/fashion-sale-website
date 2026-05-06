import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';

const Facebook = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
const Instagram = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
const Twitter = ({ size }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>;

export default function Footer() {
  return (
    <footer className="bg-[#121212] text-stone-300 pt-20 pb-10 border-t border-gold-500/10">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Brand */}
          <div className="space-y-6 lg:pr-8">
            <Link to="/" className="text-3xl font-playfair font-bold text-white tracking-wide inline-flex items-center">
              Fashion <span className="text-gold-500 font-light italic ml-2">Sale</span>
            </Link>
            <p className="text-sm leading-loose text-stone-400 font-light tracking-wide">
              Crafting elegance and preserving tradition. Discover our premium collection of authentic silk sarees for every special occasion.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="w-10 h-10 rounded-full border border-stone-800 text-stone-400 flex items-center justify-center hover:bg-gold-500 hover:border-gold-500 hover:text-white transition-all duration-300 hover:-translate-y-1">
                <Facebook size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-stone-800 text-stone-400 flex items-center justify-center hover:bg-gold-500 hover:border-gold-500 hover:text-white transition-all duration-300 hover:-translate-y-1">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-stone-800 text-stone-400 flex items-center justify-center hover:bg-gold-500 hover:border-gold-500 hover:text-white transition-all duration-300 hover:-translate-y-1">
                <Twitter size={18} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:pl-8">
            <h4 className="text-white font-playfair text-xl mb-8 tracking-wider font-medium">Quick Links</h4>
            <ul className="space-y-4 font-light text-sm tracking-wide">
              <li><Link to="/about" className="text-stone-400 hover:text-gold-500 hover:translate-x-1 inline-block transition-all duration-300">Our Story</Link></li>
              <li><Link to="/collections" className="text-stone-400 hover:text-gold-500 hover:translate-x-1 inline-block transition-all duration-300">Collections</Link></li>
              <li><Link to="/contact" className="text-stone-400 hover:text-gold-500 hover:translate-x-1 inline-block transition-all duration-300">Contact Us</Link></li>
              <li><Link to="/faq" className="text-stone-400 hover:text-gold-500 hover:translate-x-1 inline-block transition-all duration-300">FAQ & Support</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-white font-playfair text-xl mb-8 tracking-wider font-medium">Categories</h4>
            <ul className="space-y-4 font-light text-sm tracking-wide">
              <li><Link to="/collections?category=silk" className="text-stone-400 hover:text-gold-500 hover:translate-x-1 inline-block transition-all duration-300">Kanchipuram Silk</Link></li>
              <li><Link to="/collections?category=bridal" className="text-stone-400 hover:text-gold-500 hover:translate-x-1 inline-block transition-all duration-300">Bridal Collection</Link></li>
              <li><Link to="/collections?category=designer" className="text-stone-400 hover:text-gold-500 hover:translate-x-1 inline-block transition-all duration-300">Designer Sarees</Link></li>
              <li><Link to="/collections?category=cotton" className="text-stone-400 hover:text-gold-500 hover:translate-x-1 inline-block transition-all duration-300">Cotton & Linen</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-playfair text-xl mb-8 tracking-wider font-medium">Get in Touch</h4>
            <ul className="space-y-5 font-light text-sm tracking-wide">
              <li className="flex items-start space-x-4 text-stone-400 group">
                <MapPin size={20} strokeWidth={1.5} className="text-gold-500 shrink-0 mt-0.5 group-hover:-translate-y-1 transition-transform duration-300" />
                <span className="leading-relaxed">123 Silk Board Avenue, Luxury District, Bangalore 560001</span>
              </li>
              <li className="flex items-center space-x-4 text-stone-400 group">
                <Phone size={20} strokeWidth={1.5} className="text-gold-500 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-4 text-stone-400 group">
                <Mail size={20} strokeWidth={1.5} className="text-gold-500 shrink-0 group-hover:scale-110 transition-transform duration-300" />
                <a href="mailto:hello@fashionsale.com" className="hover:text-gold-500 transition-colors">hello@fashionsale.com</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-stone-800 flex flex-col md:flex-row items-center justify-between text-[13px] font-light text-stone-500 tracking-wide">
          <p>&copy; {new Date().getFullYear()} Fashion Sale. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-gold-500 transition-colors duration-300">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-gold-500 transition-colors duration-300">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
