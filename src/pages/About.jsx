import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="bg-pastel-50">
      {/* Banner */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/saree_hero.png" 
            alt="About Banner" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-stone-900/40" />
        </div>
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-playfair text-5xl md:text-6xl mb-4"
          >
            Our Heritage
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl font-light tracking-wide text-stone-200"
          >
            Woven with tradition, crafted for eternity.
          </motion.p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 px-4 md:px-8 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <p className="text-gold-500 uppercase tracking-widest text-sm mb-2">The Beginning</p>
              <h2 className="font-playfair text-4xl text-stone-900 leading-tight">A Legacy of Silk Since 1985</h2>
            </div>
            <div className="space-y-4 text-stone-600 font-light leading-relaxed">
              <p>
                Fashion Sale began as a small boutique with a singular vision: to preserve the ancient art of handloom silk weaving while bringing unparalleled elegance to the modern woman.
              </p>
              <p>
                For generations, our master weavers in Kanchipuram and Banaras have passed down their intricate techniques. Every saree we create is not just a garment, but a canvas where silk threads and pure zari dance together to tell stories of our rich cultural tapestry.
              </p>
            </div>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
              <img src="/images/saree_gold.png" alt="Weaving process" className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-2xl shadow-xl max-w-xs hidden md:block">
              <p className="font-playfair text-2xl text-stone-900 mb-2">"True luxury is found in the details of handcraft."</p>
              <p className="text-sm text-gold-500 uppercase tracking-wider">- Founder</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="font-playfair text-3xl md:text-4xl text-stone-900 mb-4">Our Core Values</h2>
            <p className="text-stone-500 font-light max-w-2xl mx-auto">The principles that guide every thread we weave and every interaction we have.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: "Authenticity", desc: "We source only the purest silks and authentic zari directly from traditional weaving clusters." },
              { title: "Craftsmanship", desc: "Each piece is meticulously handcrafted by skilled artisans, ensuring unparalleled quality." },
              { title: "Sustainability", desc: "We support fair trade practices and sustainable methods to protect both weavers and the environment." }
            ].map((value, idx) => (
              <div key={idx} className="text-center group">
                <div className="w-16 h-16 mx-auto bg-pastel-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-gold-500 transition-colors duration-300">
                  <div className="w-2 h-2 bg-gold-500 rounded-full group-hover:bg-white transition-colors" />
                </div>
                <h3 className="font-playfair text-xl text-stone-900 mb-3">{value.title}</h3>
                <p className="text-stone-500 font-light leading-relaxed">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
