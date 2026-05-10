import React, { useState, useEffect, useRef } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, doc, updateDoc, getDocs, deleteDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { 
  Plus, Loader2, Image as ImageIcon, X, ArrowLeft, 
  Trash2, Edit3, Save, Info, CheckCircle2, ChevronDown, Box
} from "lucide-react";

const ProductForm = ({ products = [], onProductAdded, editingProduct, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    originalPrice: "",
    shippingCharges: "0",
    stock: "50",
    description: "",
    material: "",
    work: "",
    bodyColor: "",
    blouseColor: "",
    type: "",
    length: "",
    careInstructions: "",
    categories: [],
    suitableFor: [],
    homepageLatest: false,
    visible: true,
  });
  
  const [imageFiles, setImageFiles] = useState([null, null, null, null, null]);
  const [imagePreviews, setImagePreviews] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // Dynamic lists (Mocking the database management for now)
  const [availableCategories, setAvailableCategories] = useState(() => {
    const saved = localStorage.getItem('availableCategories');
    return saved ? JSON.parse(saved) : [
      "Applique/emb", "Banarasi Silk", "cotton", "Cotton", "Cotton/Jamdhani", "Crepe", "Daily Wear", "Dola Bandhej"
    ];
  });
  
  const [deletedCategories, setDeletedCategories] = useState(() => {
    const saved = localStorage.getItem('deletedCategories');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [newCat, setNewCat] = useState("");
  const [showCatInput, setShowCatInput] = useState(false);
  const [editingCatIdx, setEditingCatIdx] = useState(-1);
  const [editCatValue, setEditCatValue] = useState("");

  // Persist changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('availableCategories', JSON.stringify(availableCategories));
  }, [availableCategories]);

  useEffect(() => {
    localStorage.setItem('deletedCategories', JSON.stringify(Array.from(deletedCategories)));
  }, [deletedCategories]);

  useEffect(() => {
    const baseCategories = [
      "Applique/emb", "Banarasi Silk", "cotton", "Cotton", "Cotton/Jamdhani", "Crepe", "Daily Wear", "Dola Bandhej"
    ];
    const productCategories = (products || []).flatMap(p => {
      if (p.categories && Array.isArray(p.categories)) return p.categories;
      if (p.category) return [p.category];
      return [];
    });
    
    setAvailableCategories(prev => {
      // Merge previous (which includes local edits) with new categories from products
      // filtering out anything the user explicitly deleted
      const uniqueCats = Array.from(new Set([...prev, ...baseCategories, ...productCategories]))
        .filter(cat => cat && !deletedCategories.has(cat));
      
      uniqueCats.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      
      // Only update if there's an actual change in content
      if (uniqueCats.length !== prev.length || !uniqueCats.every((val, index) => val === prev[index])) {
        return uniqueCats;
      }
      return prev;
    });
  }, [products, deletedCategories]);

  const handleAddCategory = () => {
    if (newCat && !availableCategories.includes(newCat)) {
      setAvailableCategories(prev => [...prev, newCat].sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())));
      // Remove from deleted set if it was there before
      if (deletedCategories.has(newCat)) {
        const newDeleted = new Set(deletedCategories);
        newDeleted.delete(newCat);
        setDeletedCategories(newDeleted);
      }
      setNewCat("");
      setShowCatInput(false);
    }
  };

  const handleSaveEditCategory = (index) => {
    const oldValue = availableCategories[index];
    const newValue = editCatValue.trim();
    
    if (newValue && newValue !== oldValue) {
      // 1. Update the available categories list (deduplicated)
      setAvailableCategories(prev => {
        const filtered = prev.filter(c => c !== oldValue);
        return Array.from(new Set([...filtered, newValue])).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
      });

      // 2. Update the current form selection (deduplicated)
      setFormData(prev => ({
        ...prev,
        categories: Array.from(new Set(prev.categories.map(c => c === oldValue ? newValue : c)))
      }));

      // 3. Track old value as deleted to prevent it from coming back via useEffect
      setDeletedCategories(prev => new Set([...prev, oldValue]));

      setEditingCatIdx(-1);
    } else if (newValue === oldValue) {
      setEditingCatIdx(-1);
    }
  };

  const handleDeleteCategory = (cat) => {
    if (window.confirm(`Are you sure you want to remove "${cat}" from the selection list? This will only remove it from this page and won't affect other products.`)) {
      // 1. Remove from available list
      setAvailableCategories(prev => prev.filter(c => c !== cat));
      
      // 2. Remove from current form selection
      setFormData(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c !== cat)
      }));

      // 3. Track as deleted to prevent it from coming back
      setDeletedCategories(prev => new Set([...prev, cat]));
    }
  };
  
  const suitableForOptions = ["Wedding", "Festival", "Party", "Casual", "Office", "Traditional"];

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        sku: editingProduct.sku || "",
        price: editingProduct.price || "",
        originalPrice: (editingProduct.originalPrice !== undefined && editingProduct.originalPrice !== null) ? editingProduct.originalPrice : "",
        shippingCharges: editingProduct.shippingCharges || "0",

        stock: editingProduct.stock || "50",
        description: editingProduct.description || "",
        material: editingProduct.specifications?.material || "",
        work: editingProduct.specifications?.work || "",
        bodyColor: editingProduct.specifications?.bodyColor || "",
        blouseColor: editingProduct.specifications?.blouseColor || "",
        type: editingProduct.specifications?.type || "",
        length: editingProduct.specifications?.length || "",
        careInstructions: editingProduct.specifications?.careInstructions || "",
        categories: editingProduct.categories || (editingProduct.category ? [editingProduct.category] : []),
        suitableFor: editingProduct.suitableFor || (editingProduct.tags || []),
        homepageLatest: editingProduct.homepageLatest || false,
        visible: editingProduct.visible !== false,
      });
      
      const previews = ["", "", "", "", ""];
      if (editingProduct.images && editingProduct.images.length > 0) {
        editingProduct.images.forEach((img, i) => {
          if (i < 5) previews[i] = img;
        });
      } else if (editingProduct.image) {
        previews[0] = editingProduct.image;
      }
      setImagePreviews(previews);
    }
  }, [editingProduct]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field, value) => {
    setFormData(prev => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [field]: updated };
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newFiles = [...imageFiles];
    const newPreviews = [...imagePreviews];

    let fileIdx = 0;
    for (let j = 0; j < 5; j++) {
      if (!newFiles[j] && !newPreviews[j] && fileIdx < files.length) {
        const file = files[fileIdx];
        newFiles[j] = file;
        
        ((index) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreviews(prev => {
              const updated = [...prev];
              updated[index] = reader.result;
              return updated;
            });
          };
          reader.readAsDataURL(file);
        })(j);
        
        fileIdx++;
      }
    }
    setImageFiles(newFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length) {
      const event = { target: { files } };
      handleFileChange(event);
    }
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `products/${Date.now()}_${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const imageUrls = [...imagePreviews];
      
      for (let i = 0; i < 5; i++) {
        if (imageFiles[i]) {
          imageUrls[i] = await uploadImage(imageFiles[i]);
        }
      }

      const finalImages = imageUrls.filter(url => url !== "");
      if (finalImages.length === 0) {
        throw new Error("Please upload at least one image");
      }

      const productData = {
        name: formData.name,
        sku: formData.sku,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        shippingCharges: Number(formData.shippingCharges),
        stock: Number(formData.stock),
        description: formData.description,
        categories: formData.categories,
        category: formData.categories[0] || "", // Fallback for existing components
        suitableFor: formData.suitableFor,
        homepageLatest: formData.homepageLatest,
        visible: formData.visible,
        image: finalImages[0],
        images: finalImages,
        specifications: {
          material: formData.material,
          work: formData.work,
          bodyColor: formData.bodyColor,
          blouseColor: formData.blouseColor,
          type: formData.type,
          length: formData.length,
          careInstructions: formData.careInstructions,
        },
        tags: formData.suitableFor, // Fallback
        updatedAt: new Date().toISOString(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        setSuccess("Product updated successfully!");
        setTimeout(() => onCancelEdit(), 1500);
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date().toISOString(),
        });
        setSuccess("Product added successfully!");
        setFormData({
          name: "", sku: "", price: "", originalPrice: "", shippingCharges: "0", stock: "50",
          description: "", material: "", work: "", bodyColor: "", blouseColor: "", type: "",
          length: "", careInstructions: "", categories: [], suitableFor: [], homepageLatest: false, visible: true
        });
        setImageFiles([null, null, null, null, null]);
        setImagePreviews(["", "", "", "", ""]);
      }

      if (onProductAdded) onProductAdded();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">
            {editingProduct ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-stone-400 text-sm font-medium">
            {editingProduct ? "Update product details and collections" : "Add a new product to your collection"}
          </p>
        </div>
        <button 
          onClick={onCancelEdit}
          className="flex items-center gap-2 bg-[#475569] text-white px-5 py-2.5 rounded-lg font-bold shadow-md hover:bg-stone-800 transition-all text-xs"
        >
          <ArrowLeft size={16} />
          <span>Back to Products</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-bold border border-red-100 flex items-center">
          <span className="mr-3 text-lg">⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl text-sm font-bold border border-green-100 flex items-center">
          <CheckCircle2 className="mr-3 text-green-600" size={20} /> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Card 1: Product Information */}
        <div className="bg-white rounded-2xl shadow-sm border-2 border-stone-200 p-5 sm:p-10">
          <h3 className="text-xl font-bold text-stone-800 mb-6">Product Information</h3>
          
          <div className="flex flex-col lg:flex-row gap-x-12 gap-y-8">
            
            {/* Left Column: Form Fields */}
            <div className="flex-grow space-y-6">
              
              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-stone-700">Product Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter product name"
                  className="w-full px-4 py-2.5 bg-white border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-[#6B2D2D]/10 outline-none transition-all text-[14px] text-stone-800 placeholder:text-stone-300 shadow-sm"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-stone-700">Product ID/Code</label>
                <input
                  type="text"
                  name="sku"
                  placeholder="e.g., SKU-001, SAR-2024-001"
                  className="w-full px-4 py-2.5 bg-white border-2 border-stone-200 rounded-lg focus:ring-2 focus:ring-[#6B2D2D]/10 outline-none transition-all text-[14px] text-stone-800 placeholder:text-stone-300 shadow-sm"
                  value={formData.sku}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-3">
                <label className="text-[13px] font-bold text-stone-800">Pricing Details (₹)</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-stone-500 font-medium">Current Price</label>
                    <input type="number" name="price" required placeholder="0" className="w-full px-3 py-2 bg-white border-2 border-stone-200 rounded-lg outline-none text-[14px] text-stone-800 shadow-sm" value={formData.price} onChange={handleChange} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-stone-500 font-medium">Original Price</label>
                    <input type="number" name="originalPrice" placeholder="0" className="w-full px-3 py-2 bg-white border-2 border-stone-200 rounded-lg outline-none text-[14px] text-stone-800 shadow-sm" value={formData.originalPrice} onChange={handleChange} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-stone-500 font-medium">Shipping Charges</label>
                    <input type="number" name="shippingCharges" placeholder="0" className="w-full px-3 py-2 bg-white border-2 border-stone-200 rounded-lg outline-none text-[14px] text-stone-800 shadow-sm" value={formData.shippingCharges} onChange={handleChange} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-stone-500 font-medium">Stock</label>
                    <input type="number" name="stock" placeholder="0" className="w-full px-3 py-2 bg-white border-2 border-stone-200 rounded-lg outline-none text-[14px] text-stone-800 shadow-sm" value={formData.stock} onChange={handleChange} />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <label className="text-[13px] font-medium text-stone-700">Categories (Select multiple)</label>
                  <button 
                    type="button" 
                    onClick={() => setShowCatInput(!showCatInput)}
                    className="text-[11px] font-bold bg-[#6B2D2D] text-white px-3 py-1.5 rounded flex items-center justify-center gap-1 shadow-sm hover:bg-[#522121] transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    <Plus size={12} /> Manage Categories
                  </button>
                </div>
                
                {showCatInput && (
                  <div className="flex flex-col sm:flex-row gap-2 animate-in slide-in-from-top duration-300">
                    <input 
                      type="text" 
                      value={newCat} 
                      onChange={(e) => setNewCat(e.target.value)}
                      placeholder="Category name"
                      className="flex-grow px-3 py-2 bg-white border-2 border-stone-200 rounded-lg text-sm"
                    />
                    <button type="button" onClick={handleAddCategory} className="bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap">Add</button>
                  </div>
                )}

                <div className="bg-white border-2 border-stone-200 rounded-lg p-3 sm:p-5 max-h-[220px] overflow-y-auto flex flex-col gap-y-4 shadow-inner custom-scrollbar">
                  {availableCategories.map((cat, idx) => (
                    <div 
                      key={cat} 
                      className="flex flex-row items-center justify-between group gap-2"
                    >
                      <div className="flex items-center gap-3 flex-grow overflow-hidden">
                        <input 
                          type="checkbox" 
                          id={`cat-${cat}`}
                          checked={formData.categories.includes(cat)}
                          onChange={() => handleCheckboxChange('categories', cat)}
                          className="w-4 h-4 flex-shrink-0 rounded border-stone-300 text-[#6B2D2D] focus:ring-[#6B2D2D]"
                        />
                        <label htmlFor={`cat-${cat}`} className="text-[12px] text-stone-600 cursor-pointer uppercase font-medium truncate w-full">{cat}</label>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button 
                          type="button" 
                          onClick={() => { setEditingCatIdx(idx); setEditCatValue(cat); }}
                          className="text-[10px] font-medium text-blue-500 border border-blue-100 rounded px-2 py-0.5 hover:bg-blue-50 transition-colors whitespace-nowrap"
                        >
                          Edit
                        </button>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteCategory(cat)}
                          className="text-[10px] font-medium text-red-500 border border-red-100 rounded px-2 py-0.5 hover:bg-red-50 transition-colors whitespace-nowrap"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-stone-400">Select multiple categories that apply to this product</p>
              </div>

              <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 bg-emerald-50 rounded-2xl border-2 border-emerald-100 shadow-sm transition-all hover:shadow-md">
                  <div className="relative flex items-center">
                    <input 
                      type="checkbox" 
                      id="homepageLatest"
                      checked={formData.homepageLatest}
                      onChange={(e) => setFormData(prev => ({ ...prev, homepageLatest: e.target.checked }))}
                      className="w-6 h-6 accent-emerald-600 cursor-pointer rounded-lg"
                    />
                  </div>
                  <div>
                    <label htmlFor="homepageLatest" className="text-[14px] font-bold text-emerald-900 cursor-pointer flex items-center gap-2">
                      Mark as New Arrival
                      <span className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-widest">Featured</span>
                    </label>
                    <p className="text-[11px] text-emerald-600 font-medium leading-relaxed mt-0.5">
                      Shows this product in the <span className="font-bold">Latest Collection</span> on home page and <span className="font-bold">New Arrivals</span> in shop.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 sm:p-5 bg-blue-50 rounded-2xl border-2 border-blue-100 shadow-sm transition-all hover:shadow-md">
                  <input 
                    type="checkbox" 
                    id="visible"
                    checked={formData.visible}
                    onChange={(e) => setFormData(prev => ({ ...prev, visible: e.target.checked }))}
                    className="w-6 h-6 accent-blue-600 cursor-pointer rounded-lg"
                  />
                  <div>
                    <label htmlFor="visible" className="text-[14px] font-bold text-blue-900 cursor-pointer">Product Visibility</label>
                    <p className="text-[11px] text-blue-600 font-medium leading-relaxed mt-0.5">
                      Toggle to show or hide this product from your online store.
                    </p>
                  </div>
                </div>
              </div>

            </div>


            {/* Right Column: Image Upload (Horizontal Pixel Perfect) */}
            <div className="w-full lg:w-[48%] xl:w-[600px] space-y-3 flex-shrink-0">
              <label className="text-[13px] font-medium text-stone-700 block">Product Images (up to 5)</label>
              
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="relative border-2 border-dashed border-[#d8b4b4] rounded-2xl bg-white flex flex-col items-center justify-center py-10 px-8 transition-all hover:bg-red-50/10 min-h-[280px]"
              >
                <div className="flex flex-col items-center justify-center text-center w-full">
                  <div className="mb-4">
                    <ImageIcon className="text-[#d8b4b4]" size={42} strokeWidth={1.5} />
                  </div>
                  <p className="text-[14px] mb-1 text-stone-600">
                    <span className="font-bold text-stone-700">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-stone-400 text-[12px] font-medium mb-6">PNG, JPG, GIF up to 10MB</p>
                  
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-[#6B2D2D] text-white px-8 py-2.5 rounded-lg font-medium text-[14px] hover:bg-stone-900 transition-all shadow-sm"
                  >
                    Choose Images
                  </button>
                </div>

                <input 
                  type="file" 
                  multiple 
                  className="hidden" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                />

                {/* Thumbnails Row Inside the Box */}
                {imagePreviews.some(img => img !== "") && (
                  <div className="flex justify-center gap-3 w-full mt-6">
                    {[0, 1, 2, 3, 4].map(idx => (
                      imagePreviews[idx] && (
                        <div key={idx} className="relative w-[70px] h-[70px] flex-shrink-0">
                          <img src={imagePreviews[idx]} className="w-full h-full object-cover rounded-xl shadow-sm" alt="" />
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newPreviews = [...imagePreviews];
                              newPreviews[idx] = "";
                              setImagePreviews(newPreviews);
                              const newFiles = [...imageFiles];
                              newFiles[idx] = null;
                              setImageFiles(newFiles);
                            }}
                            className="absolute -top-1.5 -right-1.5 bg-[#ef4444] text-white w-5 h-5 rounded-full flex items-center justify-center shadow-md border-[2px] border-white z-10"
                          >
                            <X size={10} strokeWidth={4} />
                          </button>
                        </div>
                      )
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Product Details */}
        <div className="bg-white rounded-3xl shadow-sm border-2 border-stone-200 p-5 sm:p-10 space-y-8 sm:space-y-10">
          <h3 className="text-lg font-bold text-stone-800">Product Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-700">1. Material</label>
              <input type="text" name="material" placeholder="e.g., Pure Kanjivaram Silk" className="w-full px-5 py-3.5 bg-stone-50 border-2 border-stone-200 rounded-xl outline-none text-stone-800 font-medium placeholder:text-stone-300" value={formData.material} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-700">2. Work</label>
              <input type="text" name="work" placeholder="e.g., Zari Work, Embroidery, Hand Painted" className="w-full px-5 py-3.5 bg-stone-50 border-2 border-stone-200 rounded-xl outline-none text-stone-800 font-medium placeholder:text-stone-300" value={formData.work} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-700">3. Body Color</label>
              <input type="text" name="bodyColor" placeholder="e.g., Red, Blue, Green" className="w-full px-5 py-3.5 bg-stone-50 border-2 border-stone-200 rounded-xl outline-none text-stone-800 font-medium placeholder:text-stone-300" value={formData.bodyColor} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-700">4. Blouse Color</label>
              <input type="text" name="blouseColor" placeholder="e.g., Contrast Red, Golden" className="w-full px-5 py-3.5 bg-stone-50 border-2 border-stone-200 rounded-xl outline-none text-stone-800 font-medium placeholder:text-stone-300" value={formData.blouseColor} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-700">5. Type</label>
              <input type="text" name="type" placeholder="e.g., Kanjivaram, Banarasi, Patola" className="w-full px-5 py-3.5 bg-stone-50 border-2 border-stone-200 rounded-xl outline-none text-stone-800 font-medium placeholder:text-stone-300" value={formData.type} onChange={handleChange} />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-stone-700">6. Length</label>
              <input type="text" name="length" placeholder="e.g., 6.5 meters (with blouse piece)" className="w-full px-5 py-3.5 bg-stone-50 border-2 border-stone-200 rounded-xl outline-none text-stone-800 font-medium placeholder:text-stone-300" value={formData.length} onChange={handleChange} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-bold text-stone-700">7. Care Instructions</label>
              <input type="text" name="careInstructions" placeholder="e.g., Dry Clean Only" className="w-full px-5 py-3.5 bg-stone-50 border-2 border-stone-200 rounded-xl outline-none text-stone-800 font-medium placeholder:text-stone-300" value={formData.careInstructions} onChange={handleChange} />
            </div>
          </div>
          
          <div className="space-y-2 pt-4">
            <label className="text-[11px] font-bold text-stone-700 uppercase tracking-widest">Full Description</label>
            <textarea
              name="description"
              rows="6"
              required
              className="w-full px-5 py-4 bg-stone-50 border-2 border-stone-200 rounded-2xl outline-none text-stone-800 font-medium resize-none placeholder:text-stone-300"
              placeholder="Describe the weave, fabric history, and detailed styling tips..."
              value={formData.description}
              onChange={handleChange}
            ></textarea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={onCancelEdit}
            className="w-full sm:w-auto px-10 py-3.5 bg-[#475569] text-white rounded-xl font-bold shadow-lg hover:bg-stone-800 transition-all text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-10 py-3.5 bg-[#6B2D2D] text-white rounded-xl font-bold shadow-lg hover:bg-stone-900 transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Box size={18} />}
            <span>{editingProduct ? "Update Product" : "Add Product"}</span>
          </button>
        </div>
      </form>

      {/* Edit Modal for Category */}
      {editingCatIdx !== -1 && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-[450px] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h2 className="text-xl font-bold text-stone-800 mb-6">Edit Category</h2>
              
              <div className="space-y-2 mb-8">
                <label className="text-[13px] font-bold text-stone-700">Category Name *</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white border-2 border-stone-800 rounded-xl outline-none font-medium text-stone-800 focus:ring-4 focus:ring-stone-100 transition-all"
                  value={editCatValue}
                  onChange={(e) => setEditCatValue(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setEditingCatIdx(-1)}
                  className="px-6 py-2.5 rounded-xl border border-stone-200 font-bold text-stone-600 hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="button"
                  onClick={() => handleSaveEditCategory(editingCatIdx)}
                  className="px-6 py-2.5 rounded-xl bg-[#6B2D2D] text-white font-bold hover:bg-[#522121] transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductForm;
