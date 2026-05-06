import React from "react";
import { db } from "../firebase";
import { doc, deleteDoc } from "firebase/firestore";
import { Trash2, Package, IndianRupee, Tag, Edit3, Loader2 } from "lucide-react";

const ProductList = ({ products, loading, onProductDeleted, onEdit }) => {
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this premium saree? This action cannot be undone.")) {
      try {
        await deleteDoc(doc(db, "products", id));
        if (onProductDeleted) onProductDeleted();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Failed to delete product.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-gold-500" />
        <p className="text-stone-400 font-medium animate-pulse">Syncing Inventory...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20 bg-stone-50/50 rounded-3xl border border-dashed border-stone-200">
        <div className="bg-stone-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <Package className="h-8 w-8 text-stone-300" />
        </div>
        <h3 className="text-xl font-playfair font-bold text-stone-800 mb-2">No Products Yet</h3>
        <p className="text-stone-500 max-w-xs mx-auto">Your inventory is currently empty. Start by adding your exquisite saree collections.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-2">
      <table className="min-w-full">
        <thead>
          <tr className="border-b border-stone-100">
            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Product Detail</th>
            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Category</th>
            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Investment</th>
            <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Availability</th>
            <th className="px-6 py-4 text-right text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-50">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-stone-50/50 transition-all group">
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-16 w-16 flex-shrink-0 relative">
                    <img className="h-16 w-16 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform duration-300" src={product.image} alt={product.name} />
                    {product.stock <= 5 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg">LOW</span>
                    )}
                    {product.isNew && (
                      <span className="absolute -bottom-2 -left-2 bg-[#8a1c31] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full shadow-lg border border-white">NEW</span>
                    )}
                  </div>
                  <div className="ml-5">
                    <div className="text-sm font-bold text-stone-800 group-hover:text-gold-600 transition-colors">{product.name}</div>
                    <div className="text-[10px] text-stone-400 font-medium mt-0.5">ID: {product.id.slice(0, 8).toUpperCase()}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-[10px] font-bold uppercase tracking-wider group-hover:bg-gold-50 group-hover:text-gold-700 transition-colors">
                  {product.category}
                </span>
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-sm text-stone-900 font-bold">
                <span className="text-stone-400 mr-0.5 text-xs">₹</span>{product.price.toLocaleString()}
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                <div className="flex items-center">
                  <div className={`h-1.5 w-1.5 rounded-full mr-2 ${product.stock > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-red-500'}`}></div>
                  <span className={`text-xs font-bold ${product.stock > 0 ? 'text-stone-700' : 'text-red-500'}`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                  </span>
                </div>
              </td>
              <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => onEdit(product)}
                    className="text-stone-400 hover:text-amber-600 p-2 hover:bg-amber-50 rounded-xl transition-all"
                    title="Edit Product"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-stone-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-all"
                    title="Delete Product"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductList;
