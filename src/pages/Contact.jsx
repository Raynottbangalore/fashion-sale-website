import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <div className="bg-pastel-50 min-h-screen pt-12 pb-24">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        
        <div className="text-center mb-16">
          <h1 className="font-playfair text-4xl md:text-5xl text-stone-900 mb-4">Get in Touch</h1>
          <p className="text-stone-500 font-light max-w-2xl mx-auto">
            We would love to hear from you. Whether you have a question about our collections, need assistance with an order, or simply want to say hello.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100">
          
          {/* Contact Info */}
          <div className="lg:col-span-2 bg-stone-900 text-white p-10 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            
            <h2 className="font-playfair text-3xl mb-8 relative z-10">Contact Information</h2>
            
            <div className="space-y-8 relative z-10">
              <div className="flex items-start space-x-4">
                <MapPin className="text-gold-500 shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="font-medium text-lg mb-1">Our Boutique</h4>
                  <p className="text-stone-300 font-light leading-relaxed">
                    123 Silk Board Avenue,<br />
                    Luxury District,<br />
                    Bangalore 560001, India
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="text-gold-500 shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="font-medium text-lg mb-1">Phone</h4>
                  <p className="text-stone-300 font-light">+91 98765 43210</p>
                  <p className="text-stone-400 text-sm font-light mt-1">Mon-Sat, 10am to 8pm</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Mail className="text-gold-500 shrink-0 mt-1" size={24} />
                <div>
                  <h4 className="font-medium text-lg mb-1">Email</h4>
                  <p className="text-stone-300 font-light">hello@fashionsale.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-3 p-10 md:p-12">
            <h2 className="font-playfair text-3xl text-stone-900 mb-8">Send a Message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">First Name</label>
                  <input 
                    type="text" 
                    className="w-full border-b border-stone-300 py-2 bg-transparent focus:outline-none focus:border-gold-500 transition-colors font-light text-stone-900"
                    placeholder="Jane"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">Last Name</label>
                  <input 
                    type="text" 
                    className="w-full border-b border-stone-300 py-2 bg-transparent focus:outline-none focus:border-gold-500 transition-colors font-light text-stone-900"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  className="w-full border-b border-stone-300 py-2 bg-transparent focus:outline-none focus:border-gold-500 transition-colors font-light text-stone-900"
                  placeholder="jane@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Message</label>
                <textarea 
                  rows="4"
                  className="w-full border-b border-stone-300 py-2 bg-transparent focus:outline-none focus:border-gold-500 transition-colors font-light text-stone-900 resize-none"
                  placeholder="How can we help you?"
                ></textarea>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full md:w-auto bg-stone-900 text-white px-10 py-4 rounded-full flex items-center justify-center space-x-2 hover:bg-gold-500 transition-colors text-sm uppercase tracking-wider"
              >
                <span>Send Message</span>
                <Send size={16} />
              </motion.button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
