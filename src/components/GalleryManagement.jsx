import React, { useState, useEffect, useRef } from "react";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { 
  ImageIcon, 
  Trash2, 
  Loader2, 
  Plus, 
  X, 
  Monitor, 
  LayoutGrid, 
  Edit2, 
  Check, 
  ChevronUp,
  ChevronDown,
  Upload
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const GalleryManagement = () => {
  const [activeSubTab, setActiveSubTab] = useState("collections"); // carousel, collections
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Carousel States
  const [carouselItems, setCarouselItems] = useState([]);
  const [isEditingCarousel, setIsEditingCarousel] = useState(false);
  const [currentCarouselItem, setCurrentCarouselItem] = useState({
    image: "", title: "", subtitle: "", cta: "Shop Now", order: 1
  });

  // Collections States
  const [collectionItems, setCollectionItems] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [currentCollectionItem, setCurrentCollectionItem] = useState({
    name: "", img: "", badge: "", order: 1, status: "Active", categoryLink: ""
  });

  const fileInputRef = useRef(null);

  const fetchCarousel = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "carousel"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      setCarouselItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching carousel:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "homeCollections"), orderBy("order", "asc"));
      const querySnapshot = await getDocs(q);
      setCollectionItems(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (err) {
      console.error("Error fetching collections:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "products"));
      const categories = new Set();
      querySnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.categories && Array.isArray(data.categories)) {
          data.categories.forEach(cat => categories.add(cat));
        } else if (data.category) {
          categories.add(data.category);
        }
      });
      setAvailableCategories(Array.from(categories).sort());
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    if (activeSubTab === "carousel") fetchCarousel();
    else if (activeSubTab === "collections") {
      fetchCollections();
      fetchCategories();
    }
  }, [activeSubTab]);

  const handleImageUpload = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `gallery/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      if (type === 'carousel') {
        setCurrentCarouselItem({ ...currentCarouselItem, image: url });
      } else if (type === 'collection') {
        setCurrentCollectionItem({ ...currentCollectionItem, img: url });
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e, type) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const fakeEvent = { target: { files: [file] } };
      handleImageUpload(fakeEvent, type);
    }
  };

  // Carousel Handlers
  const handleSaveCarousel = async (e) => {
    e.preventDefault();
    if (!currentCarouselItem.image) {
      alert("Please upload an image first.");
      return;
    }
    setUploading(true);
    try {
      if (currentCarouselItem.id) {
        const docRef = doc(db, "carousel", currentCarouselItem.id);
        await updateDoc(docRef, { ...currentCarouselItem, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "carousel"), { 
          ...currentCarouselItem, 
          order: carouselItems.length + 1,
          createdAt: serverTimestamp() 
        });
      }
      setIsEditingCarousel(false);
      setCurrentCarouselItem({ image: "", title: "", subtitle: "", cta: "Shop Now", order: carouselItems.length + 1 });
      fetchCarousel();
    } catch (err) {
      console.error("Error saving carousel:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCarousel = async (id) => {
    if (!window.confirm("Delete this slide?")) return;
    try {
      await deleteDoc(doc(db, "carousel", id));
      setCarouselItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error deleting carousel item:", err);
    }
  };

  const handleCarouselMove = async (index, direction) => {
    const newItems = [...carouselItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    // Swap items
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Update local order property to keep state in sync
    const itemsWithUpdatedOrder = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));
    
    // Optimistically update local state
    setCarouselItems(itemsWithUpdatedOrder);
    
    // Update orders in Firestore
    try {
      await Promise.all(itemsWithUpdatedOrder.map((item) => {
        const docRef = doc(db, "carousel", item.id);
        return updateDoc(docRef, { order: item.order });
      }));
    } catch (err) {
      console.error("Error updating carousel order:", err);
      // Rollback on error
      fetchCarousel();
    }
  };

  // Collections Handlers
  const handleSaveCollection = async (e) => {
    e.preventDefault();
    if (!currentCollectionItem.img) {
      alert("Please upload an image first.");
      return;
    }
    setUploading(true);
    try {
      if (currentCollectionItem.id) {
        const docRef = doc(db, "homeCollections", currentCollectionItem.id);
        await updateDoc(docRef, { ...currentCollectionItem, updatedAt: serverTimestamp() });
      } else {
        await addDoc(collection(db, "homeCollections"), { 
          ...currentCollectionItem, 
          createdAt: serverTimestamp() 
        });
      }
      setShowCollectionModal(false);
      setCurrentCollectionItem({ name: "", img: "", badge: "", order: collectionItems.length + 1, status: "Active", categoryLink: "" });
      fetchCollections();
    } catch (err) {
      console.error("Error saving collection:", err);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCollection = async (id) => {
    if (!window.confirm("Are you sure you want to delete this collection item?")) return;
    try {
      await deleteDoc(doc(db, "homeCollections", id));
      setCollectionItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error("Error deleting collection item:", err);
    }
  };

  const handleMove = async (index, direction) => {
    const newItems = [...collectionItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    // Swap items
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Update local order property to keep state in sync
    const itemsWithUpdatedOrder = newItems.map((item, idx) => ({
      ...item,
      order: idx + 1
    }));
    
    // Optimistically update local state
    setCollectionItems(itemsWithUpdatedOrder);
    
    // Update orders in Firestore
    try {
      await Promise.all(itemsWithUpdatedOrder.map((item) => {
        const docRef = doc(db, "homeCollections", item.id);
        return updateDoc(docRef, { order: item.order });
      }));
    } catch (err) {
      console.error("Error updating order:", err);
      // Rollback on error
      fetchCollections();
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-playfair font-bold text-stone-800 tracking-tight">Gallery & Homepage</h2>
          <p className="text-stone-500 text-sm mt-1">Manage website visuals, carousels, and collection displays.</p>
        </div>

        {/* Sub-Tabs */}
        <div className="flex bg-stone-100 p-1 rounded-xl md:rounded-2xl border border-stone-200 overflow-x-auto no-scrollbar max-w-full">
          {[
            { id: "collections", label: "Collections", icon: LayoutGrid },
            { id: "carousel", label: "Home Carousel", icon: Monitor },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center space-x-2 px-4 md:px-5 py-2 md:py-2.5 rounded-lg md:rounded-xl text-xs md:text-sm font-bold transition-all whitespace-nowrap flex-shrink-0 ${
                activeSubTab === tab.id
                  ? "bg-white text-[#6B2D2D] shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-100 min-h-[500px]">
        {activeSubTab === "carousel" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-stone-800">Carousel Slides ({carouselItems.length})</h3>
                <p className="text-sm text-stone-500 mt-1 font-medium">Manage your homepage hero slider content</p>
              </div>
              <button 
                onClick={() => {
                  setCurrentCarouselItem({ image: "", title: "", subtitle: "", cta: "Shop Now", order: carouselItems.length + 1 });
                  setIsEditingCarousel(true);
                }}
                className="flex items-center space-x-2 bg-[#6B2D2D] text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-900 transition-all shadow-lg active:scale-95"
              >
                <Plus size={20} />
                <span>Add New Slide</span>
              </button>
            </div>

            {loading ? (
               <div className="flex justify-center py-24"><Loader2 className="animate-spin h-12 w-12 text-[#6B2D2D]" /></div>
            ) : carouselItems.length === 0 ? (
              <EmptyState icon={Monitor} title="No Slides Configured" description="Add your first hero slider image." />
            ) : (
              <div className="space-y-4">
                {carouselItems.map((item, index) => (
                  <div key={item.id} className="bg-[#f8fafc] rounded-2xl p-4 md:p-5 border border-slate-100 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 group hover:shadow-md transition-all">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <div className="w-10 h-10 bg-[#6B2D2D] text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
                        {item.order || index + 1}
                      </div>
                      
                      <div className="w-20 h-14 md:w-24 md:h-16 rounded-xl overflow-hidden border border-slate-200 bg-white flex-shrink-0">
                        <img src={item.image} alt="" className="w-full h-full object-cover" />
                      </div>

                      <div className="md:hidden flex-grow">
                        <h4 className="font-bold text-slate-800 text-base line-clamp-1">{item.title}</h4>
                      </div>
                    </div>

                    <div className="flex-grow hidden md:block">
                      <h4 className="font-bold text-slate-800 text-lg">{item.title}</h4>
                      <p className="text-slate-500 text-sm line-clamp-1">{item.subtitle}</p>
                      <span className="inline-block mt-2 px-3 py-1 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-lg border border-blue-100">
                        CTA: {item.cta}
                      </span>
                    </div>

                    <div className="w-full md:hidden">
                       <p className="text-slate-500 text-xs line-clamp-2 mb-2">{item.subtitle}</p>
                       <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded border border-blue-100">
                        CTA: {item.cta}
                      </span>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto pt-3 md:pt-0 border-t md:border-none border-slate-100 gap-2">
                      <div className="flex items-center gap-1">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCarouselMove(index, 'up'); }} 
                          disabled={index === 0}
                          className={`p-1.5 rounded-lg hover:bg-blue-50 transition-colors ${index === 0 ? 'text-slate-200' : 'text-blue-400 bg-blue-50/50'}`}
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleCarouselMove(index, 'down'); }} 
                          disabled={index === carouselItems.length - 1}
                          className={`p-1.5 rounded-lg hover:bg-blue-50 transition-colors ${index === carouselItems.length - 1 ? 'text-slate-200' : 'text-blue-400 bg-blue-50/50'}`}
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setCurrentCarouselItem(item); setIsEditingCarousel(true); }}
                          className="p-2.5 bg-amber-50 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all shadow-sm"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDeleteCarousel(item.id); }}
                          className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Carousel Modal (Add/Edit) */}
            <AnimatePresence>
              {isEditingCarousel && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl md:rounded-[2rem] shadow-2xl w-full max-w-[850px] max-h-[90vh] overflow-y-auto"
                  >
                    <div className="p-6 md:p-12">
                      <div className="flex items-center justify-between mb-6 md:mb-10">
                        <h2 className="text-xl md:text-3xl font-bold text-stone-800">{currentCarouselItem.id ? "Edit Carousel Slide" : "Add New Carousel Slide"}</h2>
                        <button onClick={() => setIsEditingCarousel(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                          <X size={24} className="text-stone-400" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveCarousel} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Left Side: Inputs */}
                        <div className="space-y-8">
                          <div>
                            <label className="block text-sm font-bold text-stone-700 mb-3 tracking-wide">Slide Title *</label>
                            <input 
                              type="text" 
                              required
                              className="w-full px-6 py-4 rounded-2xl border-2 border-stone-100 focus:border-[#6B2D2D] focus:ring-4 focus:ring-[#6B2D2D]/5 outline-none transition-all font-medium text-stone-800 placeholder:text-stone-300 shadow-sm"
                              placeholder="Enter slide title"
                              value={currentCarouselItem.title}
                              onChange={(e) => setCurrentCarouselItem({...currentCarouselItem, title: e.target.value})}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-stone-700 mb-3 tracking-wide">Subtitle *</label>
                            <textarea 
                              required
                              rows={4}
                              className="w-full px-6 py-4 rounded-2xl border-2 border-stone-100 focus:border-[#6B2D2D] focus:ring-4 focus:ring-[#6B2D2D]/5 outline-none transition-all font-medium text-stone-800 placeholder:text-stone-300 shadow-sm resize-none"
                              placeholder="Enter slide subtitle"
                              value={currentCarouselItem.subtitle}
                              onChange={(e) => setCurrentCarouselItem({...currentCarouselItem, subtitle: e.target.value})}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-stone-700 mb-3 tracking-wide">Call-to-Action Text</label>
                            <input 
                              type="text" 
                              required
                              className="w-full px-6 py-4 rounded-2xl border-2 border-stone-100 focus:border-[#6B2D2D] focus:ring-4 focus:ring-[#6B2D2D]/5 outline-none transition-all font-medium text-stone-800 shadow-sm"
                              placeholder="Shop Now"
                              value={currentCarouselItem.cta}
                              onChange={(e) => setCurrentCarouselItem({...currentCarouselItem, cta: e.target.value})}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-stone-700 mb-3 tracking-wide">Display Order</label>
                            <input 
                              type="number" 
                              className="w-full px-6 py-4 rounded-2xl border-2 border-stone-100 focus:border-[#6B2D2D] focus:ring-4 focus:ring-[#6B2D2D]/5 outline-none transition-all font-medium text-stone-800 shadow-sm"
                              placeholder="Leave empty to add to end"
                              value={currentCarouselItem.order || ""}
                              onChange={(e) => setCurrentCarouselItem({...currentCarouselItem, order: parseInt(e.target.value) || ""})}
                            />
                          </div>
                        </div>

                        {/* Right Side: Image Upload */}
                        <div className="flex flex-col h-full">
                          <label className="block text-sm font-bold text-stone-700 mb-3 tracking-wide">Upload Image *</label>
                          <div className="flex-grow flex flex-col">
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, 'carousel')}
                              className={`relative border-2 border-dashed rounded-xl md:rounded-[2rem] flex flex-col items-center justify-center p-6 md:p-8 transition-all group h-full min-h-[250px] md:min-h-[350px] cursor-pointer ${
                                isDragging ? 'border-[#6B2D2D] bg-[#6B2D2D]/5 scale-[1.02]' : 'border-stone-200 bg-stone-50 hover:bg-stone-100/50'
                              }`}
                            >
                              {currentCarouselItem.image ? (
                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                                  <img src={currentCarouselItem.image} className="w-full h-full object-cover" alt="Preview" />
                                  <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setCurrentCarouselItem({...currentCarouselItem, image: ""}); }}
                                    className="absolute top-4 right-4 bg-red-500 text-white p-2.5 rounded-full shadow-2xl hover:bg-red-600 transition-all hover:scale-110 z-10"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    {uploading ? <Loader2 className="animate-spin text-[#6B2D2D]" size={40} /> : <ImageIcon className="text-stone-300" size={40} />}
                                  </div>
                                  <h4 className="text-lg font-bold text-stone-800 mb-2">Click to upload</h4>
                                  <button 
                                    type="button"
                                    className="bg-[#6B2D2D] text-white px-10 py-3.5 rounded-2xl font-bold hover:bg-stone-900 transition-all shadow-xl active:scale-95 mt-4"
                                  >
                                    Choose Image
                                  </button>
                                </div>
                              )}
                              <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'carousel')}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="md:col-span-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-4 md:gap-6 pt-8 md:pt-10 border-t border-stone-100 mt-4">
                          <button 
                            type="button" 
                            onClick={() => setIsEditingCarousel(false)}
                            className="w-full sm:w-auto px-10 py-4 rounded-xl md:rounded-2xl font-bold text-stone-500 hover:bg-stone-100 transition-all tracking-wide"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            disabled={uploading || !currentCarouselItem.image || !currentCarouselItem.title}
                            className={`w-full sm:w-auto flex items-center justify-center space-x-3 px-12 py-4 rounded-xl md:rounded-2xl font-bold transition-all shadow-2xl tracking-wide ${
                              !currentCarouselItem.image || !currentCarouselItem.title 
                              ? 'bg-slate-300 text-white cursor-not-allowed' 
                              : 'bg-[#94a3b8] text-white hover:bg-slate-600 active:scale-95'
                            }`}
                          >
                            {uploading ? <Loader2 className="animate-spin h-5 w-5" /> : <Check size={20} />}
                            <span>{currentCarouselItem.id ? "Update Slide" : "Add Slide"}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeSubTab === "collections" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-stone-800">Saree Collections</h3>
                <p className="text-sm text-stone-500 mt-1 font-medium">Manage the <span className="text-[#6B2D2D] font-bold">"Our Saree Collections"</span> section on homepage</p>
              </div>
              <button 
                onClick={() => {
                  setCurrentCollectionItem({ name: "", img: "", badge: "", order: collectionItems.length + 1, status: "Active", categoryLink: "" });
                  setShowCollectionModal(true);
                }}
                className="flex items-center space-x-2 bg-[#6B2D2D] text-white px-6 py-3 rounded-xl font-bold hover:bg-stone-900 transition-all shadow-lg active:scale-95"
              >
                <Plus size={20} />
                <span>Add New Collection</span>
              </button>
            </div>

            {loading ? (
               <div className="flex justify-center py-24"><Loader2 className="animate-spin h-12 w-12 text-[#6B2D2D]" /></div>
            ) : collectionItems.length === 0 ? (
              <EmptyState icon={LayoutGrid} title="No Collections Found" description="Start by adding your first collection to display on the homepage." />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {collectionItems.map((item, index) => (
                  <div key={item.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-100 hover:shadow-2xl transition-all duration-500 flex flex-col">
                    <div className="relative h-48 md:h-64 overflow-hidden">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                      <div className="absolute top-3 left-3 md:top-4 md:left-4 bg-[#6B2D2D] text-white text-[10px] font-bold px-2 md:px-2.5 py-1 rounded-md shadow-lg z-10">
                        #{item.order || index + 1}
                      </div>
                      {item.status === "Inactive" && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-[2px]">
                          <span className="bg-white/20 text-white text-xs font-bold px-4 py-1.5 rounded-full border border-white/30 uppercase tracking-widest backdrop-blur-md">Inactive</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6 flex-grow flex flex-col">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-stone-800 mb-2">{item.name}</h4>
                          <span className="bg-blue-50 text-blue-600 text-[11px] font-bold px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-tight">
                            {item.badge}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-6 border-t border-stone-100 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">Category Link</span>
                          <span className="text-xs font-semibold text-stone-600 truncate max-w-[120px]">{item.categoryLink || "Not Linked"}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-1 mr-2">
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleMove(index, 'up'); }} 
                              disabled={index === 0}
                              className={`p-1 rounded hover:bg-stone-100 transition-colors ${index === 0 ? 'text-stone-200' : 'text-stone-400'}`}
                            >
                              <ChevronUp size={16} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleMove(index, 'down'); }} 
                              disabled={index === collectionItems.length - 1}
                              className={`p-1 rounded hover:bg-stone-100 transition-colors ${index === collectionItems.length - 1 ? 'text-stone-200' : 'text-stone-400'}`}
                            >
                              <ChevronDown size={16} />
                            </button>
                          </div>
                          
                          <button 
                            onClick={(e) => { e.stopPropagation(); setCurrentCollectionItem(item); setShowCollectionModal(true); }}
                            className="p-2.5 bg-amber-50 text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-sm"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteCollection(item.id); }}
                            className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Collection Modal (Add/Edit) */}
            <AnimatePresence>
              {showCollectionModal && (
                <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-2xl md:rounded-[2rem] shadow-2xl w-full max-w-[850px] max-h-[90vh] overflow-y-auto"
                  >
                    <div className="p-6 md:p-12">
                      <div className="flex items-center justify-between mb-6 md:mb-10">
                        <h2 className="text-xl md:text-3xl font-bold text-stone-800">{currentCollectionItem.id ? "Edit Collection" : "Add New Collection"}</h2>
                        <button onClick={() => setShowCollectionModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                          <X size={24} className="text-stone-400" />
                        </button>
                      </div>

                      <form onSubmit={handleSaveCollection} className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                        {/* Left Side: Inputs */}
                        <div className="space-y-8">
                          <div>
                            <label className="block text-sm font-bold text-stone-700 mb-3 tracking-wide">Collection Name *</label>
                            <input 
                              type="text" 
                              required
                              className="w-full px-6 py-4 rounded-2xl border-2 border-stone-100 focus:border-[#6B2D2D] focus:ring-4 focus:ring-[#6B2D2D]/5 outline-none transition-all font-medium text-stone-800 placeholder:text-stone-300 shadow-sm"
                              placeholder="e.g., Traditional Silk Sarees"
                              value={currentCollectionItem.name}
                              onChange={(e) => setCurrentCollectionItem({...currentCollectionItem, name: e.target.value})}
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-stone-700 mb-3 tracking-wide">Items Count</label>
                            <input 
                              type="text" 
                              required
                              className="w-full px-6 py-4 rounded-2xl border-2 border-stone-100 focus:border-[#6B2D2D] focus:ring-4 focus:ring-[#6B2D2D]/5 outline-none transition-all font-medium text-stone-800 placeholder:text-stone-300 shadow-sm"
                              placeholder="e.g., 120+ Products or Limited Edition"
                              value={currentCollectionItem.badge}
                              onChange={(e) => setCurrentCollectionItem({...currentCollectionItem, badge: e.target.value})}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-8">
                            <div>
                              <label className="block text-sm font-bold text-stone-700 mb-3 tracking-wide">Display Order</label>
                              <input 
                                type="number" 
                                required
                                className="w-full px-6 py-4 rounded-2xl border-2 border-stone-100 focus:border-[#6B2D2D] focus:ring-4 focus:ring-[#6B2D2D]/5 outline-none transition-all font-medium text-stone-800 shadow-sm"
                                placeholder="Order"
                                value={currentCollectionItem.order}
                                onChange={(e) => setCurrentCollectionItem({...currentCollectionItem, order: parseInt(e.target.value)})}
                              />
                            </div>
                            <div className="flex flex-col justify-end pb-4">
                              <label className="block text-sm font-bold text-stone-700 mb-3 tracking-wide">Status</label>
                              <label className="flex items-center gap-3 cursor-pointer group">
                                <input 
                                  type="checkbox" 
                                  className="w-5 h-5 accent-[#6B2D2D] rounded shadow-sm"
                                  checked={currentCollectionItem.status === "Active"}
                                  onChange={(e) => setCurrentCollectionItem({...currentCollectionItem, status: e.target.checked ? "Active" : "Inactive"})}
                                />
                                <span className="text-sm font-bold text-stone-600 group-hover:text-stone-800 transition-colors">Active</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-stone-700 mb-3 tracking-wide">Link to Category</label>
                            <select 
                              className="w-full px-6 py-4 rounded-2xl border-2 border-stone-100 focus:border-[#6B2D2D] focus:ring-4 focus:ring-[#6B2D2D]/5 outline-none transition-all font-medium text-stone-800 shadow-sm appearance-none bg-no-repeat bg-[right_1.5rem_center]"
                              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%23a8a29e\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundSize: '1.25rem' }}
                              value={currentCollectionItem.categoryLink}
                              onChange={(e) => setCurrentCollectionItem({...currentCollectionItem, categoryLink: e.target.value})}
                            >
                              <option value="">-- Select a category --</option>
                              {availableCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                            <p className="text-[11px] text-stone-400 mt-3 px-1 font-medium leading-relaxed">When clicked, this collection will show products from the selected category</p>
                          </div>
                        </div>

                        {/* Right Side: Image Upload */}
                        <div className="flex flex-col h-full">
                          <label className="block text-sm font-bold text-stone-700 mb-3 tracking-wide">Upload Image *</label>
                          <div className="flex-grow flex flex-col">
                            <div 
                              onClick={() => fileInputRef.current?.click()}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, 'collection')}
                              className={`relative border-2 border-dashed rounded-xl md:rounded-[2rem] flex flex-col items-center justify-center p-6 md:p-8 transition-all group h-full min-h-[250px] md:min-h-[300px] cursor-pointer ${
                                isDragging ? 'border-[#6B2D2D] bg-[#6B2D2D]/5 scale-[1.02]' : 'border-stone-200 bg-stone-50 hover:bg-stone-100/50'
                              }`}
                            >
                              {currentCollectionItem.img ? (
                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                                  <img src={currentCollectionItem.img} className="w-full h-full object-cover" alt="Preview" />
                                  <button 
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setCurrentCollectionItem({...currentCollectionItem, img: ""}); }}
                                    className="absolute top-4 right-4 bg-red-500 text-white p-2.5 rounded-full shadow-2xl hover:bg-red-600 transition-all hover:scale-110 z-10"
                                  >
                                    <X size={18} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex flex-col items-center text-center">
                                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                    {uploading ? <Loader2 className="animate-spin text-[#6B2D2D]" size={40} /> : <ImageIcon className="text-stone-300" size={40} />}
                                  </div>
                                  <h4 className="text-lg font-bold text-stone-800 mb-2">Upload collection image</h4>
                                  <p className="text-[13px] text-stone-400 font-medium mb-8">Recommended size: 400x400px or larger</p>
                                  <div className="bg-[#6B2D2D] text-white px-10 py-3.5 rounded-2xl font-bold hover:bg-stone-900 transition-all shadow-xl active:scale-95">
                                    Choose Image
                                  </div>
                                </div>
                              )}
                              <input 
                                type="file" 
                                ref={fileInputRef}
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'collection')}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="md:col-span-2 flex flex-col-reverse sm:flex-row items-center justify-end gap-4 md:gap-6 pt-8 md:pt-10 border-t border-stone-100 mt-4">
                          <button 
                            type="button" 
                            onClick={() => setShowCollectionModal(false)}
                            className="w-full sm:w-auto px-10 py-4 rounded-xl md:rounded-2xl font-bold text-stone-500 hover:bg-stone-100 transition-all tracking-wide"
                          >
                            Cancel
                          </button>
                          <button 
                            type="submit"
                            disabled={uploading || !currentCollectionItem.img || !currentCollectionItem.name}
                            className={`w-full sm:w-auto flex items-center justify-center space-x-3 px-12 py-4 rounded-xl md:rounded-2xl font-bold transition-all shadow-2xl tracking-wide ${
                              !currentCollectionItem.img || !currentCollectionItem.name 
                              ? 'bg-stone-300 text-white cursor-not-allowed' 
                              : 'bg-[#8F9BA3] text-white hover:bg-stone-600 active:scale-95'
                            }`}
                          >
                            {uploading ? <Loader2 className="animate-spin h-5 w-5" /> : <Check size={20} />}
                            <span>{currentCollectionItem.id ? "Update Collection" : "Add Collection"}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

const EmptyState = ({ icon: Icon, title, description }) => (
  <div className="text-center py-16 md:py-32 bg-stone-50/50 rounded-2xl md:rounded-3xl border-2 border-dashed border-stone-100 px-4">
    <div className="w-16 h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-sm border border-stone-100">
      <Icon className="h-8 w-8 md:h-10 md:w-10 text-stone-300" />
    </div>
    <h3 className="text-xl md:text-2xl font-playfair font-bold text-stone-800 mb-2">{title}</h3>
    <p className="text-stone-500 text-sm md:text-base max-w-sm mx-auto">{description}</p>
  </div>
);

export default GalleryManagement;

