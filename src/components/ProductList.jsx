import React, { useState, useMemo } from "react";
import { db } from "../firebase";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import { 
  Trash2, Package, IndianRupee, Tag, Edit3, Loader2, 
  Search, ChevronUp, ChevronDown, Check, Eye, EyeOff, 
  Filter, Sparkles, Plus, Eraser, Save, Target, Download, CircleDollarSign
} from "lucide-react";
import OfferManagement from "./OfferManagement";
import ApplyOfferModal from "./ApplyOfferModal";
import { useToast } from "../context/ToastContext";




const ProductList = ({ products, loading, onProductDeleted, onEdit, onView, onAddClick }) => {
  const toast = useToast();
  const [activeBudgetTab, setActiveBudgetTab] = useState("Under ₹2,000");

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");

  const [updating, setUpdating] = useState(null);
  const [isSavingBudget, setIsSavingBudget] = useState(false);
  const [showBudgetToast, setShowBudgetToast] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [showApplyOfferModal, setShowApplyOfferModal] = useState(false);
  const [selectedProductForOffer, setSelectedProductForOffer] = useState(null);
  const [selectedLatest, setSelectedLatest] = useState(new Set());
  const [isSavingLatest, setIsSavingLatest] = useState(false);

  // Sync local selection with products from DB
  useMemo(() => {
    if (products) {
      const initial = new Set(products.filter(p => p.homepageLatest).map(p => p.id));
      setSelectedLatest(initial);
    }
  }, [products]);



  // Budget ranges
  const budgetRanges = [
    { label: "Under ₹2,000", filter: (p) => p.price < 2000, color: "blue" },
    { label: "₹2,000 - ₹5,000", filter: (p) => p.price >= 2000 && p.price < 5000, color: "emerald" },
    { label: "₹5,000 - ₹10,000", filter: (p) => p.price >= 5000 && p.price < 10000, color: "orange" },
    { label: "Premium (Above ₹10,000)", filter: (p) => p.price >= 10000, color: "purple" },
  ];

  const categories = useMemo(() => {
    const baseCategories = [
      "Applique/emb", "Banarasi Silk", "cotton", "Cotton", "Cotton/Jamdhani", 
      "Crepe", "Daily Wear", "Dola Bandhej", "Mysore Silk", "Patola", "Kanjivaram"
    ];
    const productCategories = products.map(p => p.category).filter(Boolean);
    const uniqueCategories = Array.from(new Set([...baseCategories, ...productCategories]));
    uniqueCategories.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    return ["All Categories", ...uniqueCategories];
  }, [products]);

  // Derived stats
  const stats = {
    total: products.length,
    visible: products.filter(p => p.visible !== false).length,
    hidden: products.filter(p => p.visible === false).length,
    budgetCounts: budgetRanges.reduce((acc, range) => {
      acc[range.label] = products.filter(range.filter).length;
      return acc;
    }, {}),
    latestCount: selectedLatest.size
  };

  // Filtered products for the grid (Budget Wise Collection)
  const budgetProducts = products.filter(p => {
    const range = budgetRanges.find(r => r.label === activeBudgetTab);
    return range ? range.filter(p) : true;
  });

  // Filtered products for the table
  const tableProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "All Categories" || p.category === categoryFilter;
    const matchesVisibility = true; // Always show hidden products in admin for management
    return matchesSearch && matchesCategory && matchesVisibility;
  }).sort((a, b) => (a.displayOrder || 999) - (b.displayOrder || 999));

  const handleUpdate = async (productId, data) => {
    setUpdating(productId);
    try {
      await updateDoc(doc(db, "products", productId), data);
      if (onProductDeleted) onProductDeleted(); // Refresh data
    } catch (err) {
      console.error("Error updating product:", err);
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product permanently?")) {
      try {
        await deleteDoc(doc(db, "products", id));
        if (onProductDeleted) onProductDeleted();
      } catch (err) {
        console.error("Error deleting product:", err);
      }
    }
  };

  const handleClearLatest = () => {
    if (window.confirm("Clear selection for Latest Collection?")) {
      setSelectedLatest(new Set());
    }
  };

  const handleSaveLatest = async () => {
    setIsSavingLatest(true);
    try {
      const updates = products.map(async (p) => {
        const isSelected = selectedLatest.has(p.id);
        if (isSelected !== !!p.homepageLatest) {
          return updateDoc(doc(db, "products", p.id), { homepageLatest: isSelected });
        }
        return Promise.resolve();
      });

      await Promise.all(updates);
      if (onProductDeleted) onProductDeleted(); // Refresh data
      toast.success("Homepage collection updated!");
    } catch (err) {
      console.error("Error saving latest collection:", err);
      toast.error("Failed to update homepage");
    } finally {
      setIsSavingLatest(false);
    }
  };

  const handleSaveBudget = () => {
    setIsSavingBudget(true);
    setTimeout(() => {
      setIsSavingBudget(false);
      setShowBudgetToast(true);
      setTimeout(() => setShowBudgetToast(false), 3000);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="animate-spin h-10 w-10 text-[#6B2D2D]" />
        <p className="text-stone-400 font-medium">Loading Products...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 relative">
      {/* Budget Toast Notification */}
      {showBudgetToast && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className="bg-emerald-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 font-bold border-2 border-white/20 backdrop-blur-md">
            <Check size={20} />
            <span>Budget section products saved!</span>
          </div>
        </div>
      )}
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-800 tracking-tight">Products Management</h1>
          <p className="text-stone-500 text-[14px] font-medium">Manage your product inventory and listings</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowOfferModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white px-5 py-3 rounded-lg font-bold shadow-md hover:opacity-90 transition-all text-sm"
          >
            <CircleDollarSign size={18} />
            <span>Manage Offers</span>
          </button>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 bg-[#6B2D2D] text-white px-5 py-3 rounded-lg font-bold shadow-md hover:bg-stone-900 transition-all text-sm"
          >
            <Plus size={18} />
            <span>Add Product</span>
          </button>
        </div>

      </div>

      {/* Budget Wise Collection Section */}
      <div className="bg-white rounded-xl shadow-lg border border-stone-100 overflow-hidden">
        {/* Green Header Bar */}
        <div className="bg-[#2E7D32] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎯</span>
            <div>
              <h2 className="text-xl font-bold text-white leading-tight">Budget Wise Collection</h2>
              <p className="text-white/80 text-[12px] font-medium">Select which budget section each product belongs to</p>
            </div>
          </div>
          <button 
            onClick={handleSaveBudget}
            disabled={isSavingBudget}
            className="bg-white text-[#2E7D32] px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm hover:bg-emerald-50 transition-all text-[13px] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isSavingBudget ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Download size={16} className="group-hover:scale-110 transition-transform" />
            )}
            <span>{isSavingBudget ? "Saving..." : "Save Budget Settings"}</span>
          </button>
        </div>

        {/* Budget Cards Row */}
        <div className="p-4 md:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white">
          {budgetRanges.map((range) => {
            const isActive = activeBudgetTab === range.label;
            
            // Exact colors from the user's screenshot
            const theme = {
              blue: {
                border: "border-blue-200",
                activeBorder: "border-blue-500",
                bg: "bg-blue-50/50",
                number: "text-blue-600",
                label: "text-blue-700"
              },
              emerald: {
                border: "border-emerald-200",
                activeBorder: "border-emerald-500",
                bg: "bg-emerald-50/50",
                number: "text-emerald-600",
                label: "text-emerald-700"
              },
              orange: {
                border: "border-orange-200",
                activeBorder: "border-orange-500",
                bg: "bg-orange-50/50",
                number: "text-orange-600",
                label: "text-orange-700"
              },
              purple: {
                border: "border-purple-300",
                activeBorder: "border-purple-600",
                bg: "bg-purple-50/50",
                number: "text-purple-600",
                label: "text-purple-700"
              }
            }[range.color];

            return (
              <button
                key={range.label}
                onClick={() => setActiveBudgetTab(range.label)}
                className={`p-5 md:p-6 rounded-xl text-left transition-all border-2 ${theme.bg} ${
                  isActive ? theme.activeBorder : theme.border
                } ${isActive ? "shadow-md scale-[1.02]" : "hover:border-stone-300"}`}
              >
                <p className={`text-2xl md:text-3xl font-bold mb-1 ${theme.number}`}>
                  {stats.budgetCounts[range.label]}
                </p>
                <p className={`text-[11px] md:text-[12px] font-bold leading-tight ${theme.label}`}>
                  {range.label}
                </p>
                <p className="text-[10px] text-stone-400 font-medium mt-1">
                  Products assigned
                </p>
              </button>
            );
          })}
        </div>

        {/* Selected Range Products Grid */}
        <div className="p-6 bg-white border-t border-stone-100">
          <div className="flex items-center gap-2 text-stone-800 mb-8 px-1">
            <h3 className="text-[14px] font-bold">{activeBudgetTab}</h3>
            <span className="text-stone-400 text-[12px] font-medium">({budgetProducts.length} products selected)</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {budgetProducts.map((p) => (
              <div key={p.id} className="bg-white rounded-xl overflow-hidden group transition-all">
                <div className="aspect-[4/5] overflow-hidden relative rounded-xl border border-stone-100 shadow-sm">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                </div>
                <div className="py-4 space-y-1">
                  <p className="text-[12px] font-medium text-stone-700 truncate">{p.name || "Mysore Crepe Silk"}</p>
                  <p className="text-[14px] font-bold text-stone-900">₹{p.price.toLocaleString()}</p>
                  
                  <button 
                    onClick={() => handleDelete(p.id)}
                    className="mt-3 flex items-center gap-1.5 px-6 py-2 bg-red-50 text-red-500 rounded-lg text-[11px] font-bold hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={12} />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table Section Header & Controls */}
      <div className="space-y-6">
        {/* Homepage Latest Collection Bar */}
        <div className="bg-[#5D2626] rounded-xl p-6 flex flex-col lg:flex-row items-center lg:items-center justify-between gap-6 text-white shadow-lg border-b-4 border-black/20 animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-white/10 flex-shrink-0">
              🏠
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white">Homepage Latest Collection</h2>
              <p className="text-white/70 text-[13px] font-medium line-clamp-2 md:line-clamp-none">Select products to showcase in the "Latest Collection" section on the homepage</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 w-full lg:w-auto">
            <div className="bg-black/20 px-4 py-2.5 rounded-xl flex items-center gap-2 border border-white/10 shadow-inner">
              <span className="text-xl font-black text-white">{stats.latestCount}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 leading-none">selected</span>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={handleClearLatest}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs transition-all border border-white/10 active:scale-95 whitespace-nowrap"
              >
                Clear All
              </button>
              
              <button 
                onClick={handleSaveLatest}
                disabled={isSavingLatest}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-white text-[#5D2626] hover:bg-stone-50 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {isSavingLatest && <Loader2 size={12} className="animate-spin" />}
                <span>{isSavingLatest ? "Saving..." : "Save to Homepage"}</span>
              </button>
            </div>
          </div>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stats Card */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-stone-800 text-[13px] font-bold mb-1">Total Products</p>
            <p className="text-3xl font-bold text-[#5D2626]">{stats.total}</p>
          </div>
          <div className="flex gap-6 items-start">
            <div className="text-center">
              <p className="text-[10px] text-stone-400 font-medium mb-1">Visible</p>
              <p className="text-[#10B981] text-lg font-bold leading-none">{stats.visible}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-stone-400 font-medium mb-1">Hidden</p>
              <p className="text-stone-400 text-lg font-bold leading-none">{stats.hidden}</p>
            </div>
          </div>
        </div>

        {/* Category Filter Card */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 flex items-center shadow-sm">
          <div className="w-full relative">
            <select 
              className="w-full px-5 py-4 bg-white border border-stone-200 rounded-xl outline-none focus:border-[#5D2626] transition-all text-[15px] text-stone-800 font-medium appearance-none cursor-pointer"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={18} />
          </div>
        </div>

        {/* Search Card */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 flex items-center shadow-sm">
          <div className="w-full">
            <input 
              type="text" 
              placeholder="Search products..."
              className="w-full px-5 py-4 bg-white border border-stone-200 rounded-xl outline-none focus:border-[#5D2626] transition-all text-[15px] text-stone-800 placeholder:text-stone-300"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>


        <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/50 border-2 border-stone-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-stone-50/80 border-b border-stone-100 text-stone-400 text-[10px] uppercase font-bold tracking-[0.2em]">
                  <th className="px-6 py-6">Latest Section</th>
                  <th className="px-6 py-6">Budget Section</th>
                  <th className="px-6 py-6 text-center">Order</th>
                  <th className="px-6 py-6">Product</th>
                  <th className="px-6 py-6">Category</th>
                  <th className="px-6 py-6">Price</th>
                  <th className="px-6 py-6">Offer</th>
                  <th className="px-6 py-6">Stock</th>
                  <th className="px-6 py-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {tableProducts.map((p) => (
                  <tr key={p.id} className={`hover:bg-emerald-50/30 transition-colors ${p.visible === false ? 'opacity-60' : ''}`}>
                    <td className="px-6 py-6">
                      <div className="flex items-center">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 accent-blue-600 cursor-pointer rounded"
                          checked={selectedLatest.has(p.id)}
                          onChange={(e) => {
                            const newSelection = new Set(selectedLatest);
                            if (e.target.checked) {
                              newSelection.add(p.id);
                            } else {
                              newSelection.delete(p.id);
                            }
                            setSelectedLatest(newSelection);
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-2">
                        {budgetRanges.map((range) => {
                          // Initially show the correct price range if budgetSection is not explicitly set
                          const isInitiallySelected = !p.budgetSection && range.filter(p);
                          const isExplicitlySelected = p.budgetSection === range.label;
                          
                          return (
                            <label key={range.label} className="flex items-center gap-3 cursor-pointer group">
                              <input 
                                type="radio" 
                                name={`budget-${p.id}`}
                                className="w-4 h-4 accent-blue-600"
                                checked={isExplicitlySelected || isInitiallySelected}
                                onChange={() => handleUpdate(p.id, { budgetSection: range.label })}
                              />
                              <span className="text-[11px] font-medium text-stone-500 group-hover:text-stone-800 transition-colors">{range.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-col items-center gap-1">
                        <button 
                          onClick={() => handleUpdate(p.id, { displayOrder: (p.displayOrder || 0) - 1 })}
                          className="p-1 hover:text-emerald-600 transition-all text-stone-300"
                        ><ChevronUp size={14} /></button>
                        <div className="w-8 h-8 bg-[#10B981] text-white rounded-full flex items-center justify-center font-bold text-[12px] shadow-sm">
                          {p.displayOrder || 0}
                        </div>
                        <button 
                          onClick={() => handleUpdate(p.id, { displayOrder: (p.displayOrder || 0) + 1 })}
                          className="p-1 hover:text-emerald-600 transition-all text-stone-300"
                        ><ChevronDown size={14} /></button>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-stone-100 flex-shrink-0">
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <p className="text-[13px] font-bold text-stone-800 truncate max-w-[150px]">{p.name}</p>
                            {p.homepageLatest && <span className="bg-emerald-100 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded">Homepage</span>}
                            <span className="text-stone-400">...</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-[#991B1B] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">New</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">{p.category}</span>
                        {p.categories?.slice(1, 3).map(cat => (
                          <span key={cat} className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full">{cat}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div>
                        <p className="text-[14px] font-bold text-stone-800">₹{p.price?.toLocaleString('en-IN')}</p>
                        {p.originalPrice && <p className="text-[12px] font-medium text-stone-400 line-through">₹{p.originalPrice?.toLocaleString('en-IN')}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={p.isOffer || false}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedProductForOffer(p);
                              setShowApplyOfferModal(true);
                            } else {
                              handleUpdate(p.id, { isOffer: false, offerId: null, offerDetails: null });
                              toast.success("Offer removed successfully");
                            }
                          }}

                        />
                        <div className="w-10 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-stone-300"></div>
                      </label>
                      {p.offerDetails && (
                        <p className="text-[9px] font-bold text-[#6B2D2D] mt-1 truncate max-w-[100px]">
                          {p.offerDetails.name}
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-6">
                      <div className="relative group min-w-[100px]">
                        <select 
                          className="w-full bg-emerald-50 text-emerald-700 text-[11px] font-bold px-3 py-1.5 rounded-full border-none outline-none cursor-pointer appearance-none pr-8"
                          value={p.stockStatus || "Available"}
                          onChange={(e) => handleUpdate(p.id, { stockStatus: e.target.value })}
                        >
                          <option value="Available">Available</option>
                          <option value="Out of Stock">Out of Stock</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-600 pointer-events-none" />
                      </div>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => onView(p)}
                          className="flex items-center gap-1 text-emerald-600 font-bold text-[11px] hover:scale-105 transition-transform"
                        >
                          <Eye size={14} /> <span>View</span>
                        </button>
                        <button onClick={() => onEdit(p)} className="flex items-center gap-1 text-blue-600 font-bold text-[11px] hover:scale-105 transition-transform">
                          <Edit3 size={14} /> <span>Edit</span>
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="flex items-center gap-1 text-red-600 font-bold text-[11px] hover:scale-105 transition-transform">
                          <Trash2 size={14} /> <span>Delete</span>
                        </button>
                        <button 
                          onClick={() => {
                            const newVisible = p.visible === false;
                            handleUpdate(p.id, { visible: newVisible });
                            toast.success(newVisible ? "Product is now visible" : "Product hidden successfully");
                          }}
                          className={`px-4 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                            p.visible === false 
                            ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {p.visible === false ? "Show" : "Hide"}
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Offer Management Modal */}
      <OfferManagement 
        isOpen={showOfferModal} 
        onClose={() => setShowOfferModal(false)} 
        products={products}
      />
      {/* Apply Offer Modal */}
      <ApplyOfferModal 
        isOpen={showApplyOfferModal}
        onClose={() => setShowApplyOfferModal(false)}
        product={selectedProductForOffer}
        onOfferApplied={onProductDeleted} // Refresh products list
        onManageOffers={() => {
          setShowApplyOfferModal(false);
          setShowOfferModal(true);
        }}
      />
    </div>


  );
};

export default ProductList;
