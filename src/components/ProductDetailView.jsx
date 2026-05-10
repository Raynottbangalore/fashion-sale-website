import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Edit3, CheckCircle2, Package, 
  Calendar, Hash, ChevronRight, Info
} from "lucide-react";

const ProductDetailView = ({ product, onBack, onEdit }) => {
  const [activeImg, setActiveImg] = useState(product.image);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  // Calculate savings
  const originalPrice = product.originalPrice || product.price;
  const currentPrice = product.price;
  const savingsAmount = originalPrice - currentPrice;
  const savingsPercent = Math.round((savingsAmount / originalPrice) * 100);

  const specifications = [
    { label: "Material", value: product.specifications?.material || product.material },
    { label: "Work", value: product.specifications?.work || product.work },
    { label: "Body Color", value: product.specifications?.bodyColor || product.bodyColor },
    { label: "Blouse Color", value: product.specifications?.blouseColor || product.blouseColor },
    { label: "Type", value: product.specifications?.type || product.type },
    { label: "Length", value: product.specifications?.length || product.length },
    { label: "Care Instructions", value: product.specifications?.careInstructions || product.careInstructions },
  ];

  return (
    <div className="max-w-[1400px] mx-auto animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Product Details</h1>
          <p className="text-stone-400 text-sm font-medium">View complete product information</p>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 bg-[#475569] text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-stone-800 transition-all text-xs"
        >
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </button>
      </div>

      <div className="space-y-8">
        {/* Main Info Card */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-stone-100 p-8">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left: Image Gallery */}
            <div className="w-full lg:w-1/2 space-y-6">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-stone-100 bg-stone-50 group">
                <img 
                  src={activeImg} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                  <span className="bg-[#4D2C2C] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">New</span>
                  {savingsPercent > 0 && (
                    <span className="bg-[#E11D48] text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">{savingsPercent}% OFF</span>
                  )}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                {(product.images || [product.image]).map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveImg(img)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImg === img ? 'border-[#6B2D2D] shadow-md scale-95' : 'border-stone-100 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="pt-2">
                <span className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-[12px] font-bold">
                  <CheckCircle2 size={14} />
                  In Stock
                </span>
              </div>
            </div>

            {/* Right: Info */}
            <div className="w-full lg:w-1/2 flex flex-col">
              <h2 className="text-4xl font-bold text-stone-800 mb-6">{product.name}</h2>
              
              <div className="flex items-baseline gap-4 mb-2">
                <span className="text-4xl font-bold text-stone-900">₹{product.price?.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-2xl text-stone-300 line-through font-medium">₹{product.originalPrice?.toLocaleString()}</span>
                )}
              </div>
              
              {savingsAmount > 0 && (
                <p className="text-emerald-600 font-bold text-sm mb-10">
                  You save ₹{savingsAmount.toLocaleString()} ({savingsPercent}% off)
                </p>
              )}

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-800 uppercase tracking-widest flex items-center gap-2">
                  Perfect For
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(product.suitableFor || product.tags || []).map((tag, i) => (
                    <span key={i} className="px-5 py-2 bg-purple-50 text-purple-600 text-xs font-bold rounded-full border border-purple-100">
                      {tag}
                    </span>
                  ))}
                  {(!product.suitableFor && !product.tags) && (
                    <span className="text-stone-400 text-xs italic">No tags specified</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Specifications Card */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-stone-100 p-8">
          <h3 className="text-xl font-bold text-stone-800 mb-8">Product Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8">
            {specifications.map((spec, i) => (
              <div key={i} className="space-y-1.5">
                <p className="text-[11px] font-bold text-stone-400 uppercase tracking-widest">{i + 1}. {spec.label}</p>
                <p className="text-[15px] font-bold text-stone-800">{spec.value || "Not specified"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Status Card */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-stone-100 p-8">
          <h3 className="text-xl font-bold text-stone-800 mb-8">Inventory Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-stone-50/50 rounded-2xl p-6 text-center border border-stone-100/50">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                <Package size={12} /> Stock Status
              </p>
              <p className="text-xl font-black text-emerald-600 mb-1">Available</p>
              <p className="text-xs font-bold text-stone-500">{product.stock || 0} units left</p>
            </div>
            
            <div className="bg-stone-50/50 rounded-2xl p-6 text-center border border-stone-100/50">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                <Hash size={12} /> Product ID/Code
              </p>
              <p className="text-xl font-bold text-stone-800">{product.sku || "N/A"}</p>
            </div>

            <div className="bg-stone-50/50 rounded-2xl p-6 text-center border border-stone-100/50">
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
                <Calendar size={12} /> Last Updated
              </p>
              <p className="text-xl font-bold text-stone-800">
                {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            onClick={onBack}
            className="px-10 py-3.5 bg-[#475569] text-white rounded-xl font-bold shadow-lg hover:bg-stone-800 transition-all text-sm flex items-center gap-2"
          >
            <ArrowLeft size={18} />
            <span>Back to List</span>
          </button>
          <button
            onClick={() => onEdit(product)}
            className="px-10 py-3.5 bg-[#6B2D2D] text-white rounded-xl font-bold shadow-lg hover:bg-stone-900 transition-all text-sm flex items-center gap-2"
          >
            <Edit3 size={18} />
            <span>Edit Product</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailView;
