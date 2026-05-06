import React, { useState, useEffect, useRef } from "react";
import { db, storage } from "../firebase";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { PlusCircle, Loader2, Image as ImageIcon, Tag, Hash, FileText, IndianRupee, X, UploadCloud, Edit3, Settings, Info } from "lucide-react";

const ProductForm = ({ onProductAdded, editingProduct, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    stock: "",
    description: "",
    material: "",
    work: "",
    bodyColor: "",
    blouseColor: "",
    type: "",
    length: "",
    careInstructions: "",
    tags: "", // Comma separated tags for "Perfect For"
    isNew: false,
  });
  
  const [imageFiles, setImageFiles] = useState([null, null, null, null, null]);
  const [imagePreviews, setImagePreviews] = useState(["", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRefs = useRef([]);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name || "",
        price: editingProduct.price || "",
        category: editingProduct.category || "",
        stock: editingProduct.stock || "",
        description: editingProduct.description || "",
        material: editingProduct.specifications?.material || "",
        work: editingProduct.specifications?.work || "",
        bodyColor: editingProduct.specifications?.bodyColor || "",
        blouseColor: editingProduct.specifications?.blouseColor || "",
        type: editingProduct.specifications?.type || "",
        length: editingProduct.specifications?.length || "",
        careInstructions: editingProduct.specifications?.careInstructions || "",
        tags: editingProduct.tags?.join(", ") || "",
        isNew: editingProduct.isNew || false,
      });
      
      const previews = [...imagePreviews];
      if (editingProduct.images && editingProduct.images.length > 0) {
        editingProduct.images.forEach((img, i) => {
          if (i < 5) previews[i] = img;
        });
      } else if (editingProduct.image) {
        previews[0] = editingProduct.image;
      }
      setImagePreviews(previews);
      
      setError("");
      setSuccess("");
    } else {
      resetForm();
    }
  }, [editingProduct]);

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      category: "",
      stock: "",
      description: "",
      material: "",
      work: "",
      bodyColor: "",
      blouseColor: "",
      type: "",
      length: "",
      careInstructions: "",
      tags: "",
      isNew: false,
    });
    setImageFiles([null, null, null, null, null]);
    setImagePreviews(["", "", "", "", ""]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size should be less than 5MB");
        return;
      }
      
      const newFiles = [...imageFiles];
      newFiles[index] = file;
      setImageFiles(newFiles);

      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...imagePreviews];
        newPreviews[index] = reader.result;
        setImagePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
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
      
      // Upload new files
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
        price: Number(formData.price),
        stock: Number(formData.stock),
        category: formData.category,
        description: formData.description,
        image: finalImages[0], // Main image
        images: finalImages, // All images
        specifications: {
          material: formData.material,
          work: formData.work,
          bodyColor: formData.bodyColor,
          blouseColor: formData.blouseColor,
          type: formData.type,
          length: formData.length,
          careInstructions: formData.careInstructions,
        },
        tags: formData.tags.split(",").map(t => t.trim()).filter(t => t !== ""),
        isNew: formData.isNew,
        updatedAt: new Date().toISOString(),
      };

      if (editingProduct) {
        await updateDoc(doc(db, "products", editingProduct.id), productData);
        setSuccess("Product updated successfully!");
        setTimeout(() => {
          onCancelEdit();
        }, 1500);
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: new Date().toISOString(),
        });
        setSuccess("Product added successfully!");
        resetForm();
      }

      if (onProductAdded) onProductAdded();
    } catch (err) {
      setError(err.message || "Failed to process product. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 transition-all">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-2xl ${editingProduct ? 'bg-amber-50 text-amber-600' : 'bg-[#8a1c31]/10 text-[#8a1c31]'}`}>
            {editingProduct ? <Edit3 size={24} /> : <PlusCircle size={24} />}
          </div>
          <h2 className="text-2xl font-playfair font-bold text-stone-800">
            {editingProduct ? "Edit Product" : "Add New Saree"}
          </h2>
        </div>
        {editingProduct && (
          <button 
            onClick={onCancelEdit}
            className="p-2 hover:bg-stone-100 rounded-full text-stone-400 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-2xl text-sm font-medium border border-red-100 flex items-center">
          <span className="mr-3 text-lg">⚠️</span> {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-2xl text-sm font-medium border border-green-100 flex items-center">
          <span className="mr-3 text-lg">✨</span> {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Image Uploads */}
        <div className="space-y-4">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center">
            <ImageIcon className="h-4 w-4 mr-2" /> Product Gallery (Max 5 Images)
          </label>
          <div className="grid grid-cols-5 gap-3">
            {[0, 1, 2, 3, 4].map((idx) => (
              <div 
                key={idx}
                onClick={() => fileInputRefs.current[idx]?.click()}
                className={`relative aspect-[3/4] border-2 border-dashed rounded-xl overflow-hidden cursor-pointer transition-all flex flex-col items-center justify-center bg-stone-50/50 ${
                  imagePreviews[idx] ? 'border-stone-200' : 'border-stone-200 hover:border-[#8a1c31] hover:bg-stone-50'
                }`}
              >
                {imagePreviews[idx] ? (
                  <img src={imagePreviews[idx]} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-2">
                    <UploadCloud className="h-6 w-6 text-stone-300 mx-auto" />
                    <p className="text-[10px] text-stone-400 font-bold mt-1 uppercase">Img {idx + 1}</p>
                  </div>
                )}
                <input
                  type="file"
                  ref={el => fileInputRefs.current[idx] = el}
                  onChange={(e) => handleFileChange(e, idx)}
                  className="hidden"
                  accept="image/*"
                />
              </div>
            ))}
          </div>
          <p className="text-[10px] text-stone-400 italic">First image will be the main display image.</p>
          <div className="mt-2 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start space-x-3">
            <Info size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-[10px] text-amber-700 leading-normal">
              <strong>Premium Tip:</strong> Ensure all 5 images are high-quality and matching (Main shot, Pallu detail, Border close-up, Model view, and Folded view) for a luxury shopping experience.
            </p>
          </div>
        </div>

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center">
              <Tag className="h-4 w-4 mr-2" /> Saree Name
            </label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#8a1c31]/20 focus:bg-white focus:border-[#8a1c31] outline-none transition-all font-medium text-stone-800"
              placeholder="e.g. Deep Pink Mysore Crepe Silk"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center">
              <IndianRupee className="h-4 w-4 mr-2" /> Price
            </label>
            <input
              type="number"
              name="price"
              required
              className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#8a1c31]/20 focus:bg-white focus:border-[#8a1c31] outline-none transition-all font-medium text-stone-800"
              placeholder="0"
              value={formData.price}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center">
              <Hash className="h-4 w-4 mr-2" /> Stock
            </label>
            <input
              type="number"
              name="stock"
              required
              className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#8a1c31]/20 focus:bg-white focus:border-[#8a1c31] outline-none transition-all font-medium text-stone-800"
              placeholder="0"
              value={formData.stock}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center">
              <Tag className="h-4 w-4 mr-2" /> Category
            </label>
            <select
              name="category"
              required
              className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#8a1c31]/20 focus:bg-white focus:border-[#8a1c31] outline-none transition-all font-medium text-stone-800 appearance-none"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="">Select Category</option>
              <option value="Silk">Silk</option>
              <option value="Bridal">Bridal</option>
              <option value="Designer">Designer</option>
              <option value="Cotton">Cotton</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center">
              <Info className="h-4 w-4 mr-2" /> Perfect For (Tags)
            </label>
            <input
              type="text"
              name="tags"
              className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#8a1c31]/20 focus:bg-white focus:border-[#8a1c31] outline-none transition-all font-medium text-stone-800"
              placeholder="Wedding, Festival, Party (comma separated)"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center space-x-3 p-4 bg-stone-50 border border-stone-200 rounded-xl">
            <input
              type="checkbox"
              id="isNew"
              name="isNew"
              className="w-5 h-5 accent-[#8a1c31] cursor-pointer"
              checked={formData.isNew}
              onChange={(e) => setFormData(prev => ({ ...prev, isNew: e.target.checked }))}
            />
            <label htmlFor="isNew" className="text-sm font-bold text-stone-700 cursor-pointer select-none">
              Mark as New Arrival (Latest Collection)
            </label>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 space-y-6">
          <div className="flex items-center space-x-2 text-stone-800 border-b border-stone-200 pb-3">
            <Settings size={18} className="text-[#8a1c31]" />
            <h3 className="font-playfair font-bold text-lg">Product Specifications</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Material</label>
              <input type="text" name="material" className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg outline-none text-sm" value={formData.material} onChange={handleChange} placeholder="e.g. Mysore Crepe Silk" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Work</label>
              <input type="text" name="work" className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg outline-none text-sm" value={formData.work} onChange={handleChange} placeholder="e.g. Zari Border" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Body Color</label>
              <input type="text" name="bodyColor" className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg outline-none text-sm" value={formData.bodyColor} onChange={handleChange} placeholder="e.g. Dark Pink" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Blouse Color</label>
              <input type="text" name="blouseColor" className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg outline-none text-sm" value={formData.blouseColor} onChange={handleChange} placeholder="e.g. Dark Pink" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Type</label>
              <input type="text" name="type" className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg outline-none text-sm" value={formData.type} onChange={handleChange} placeholder="e.g. Mysore Silk" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Length</label>
              <input type="text" name="length" className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg outline-none text-sm" value={formData.length} onChange={handleChange} placeholder="e.g. 6.5 meter" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Care Instructions</label>
              <input type="text" name="careInstructions" className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-lg outline-none text-sm" value={formData.careInstructions} onChange={handleChange} placeholder="e.g. Dry Clean Only" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-500 uppercase tracking-widest flex items-center">
            <FileText className="h-4 w-4 mr-2" /> Description
          </label>
          <textarea
            name="description"
            rows="4"
            required
            className="w-full px-5 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-[#8a1c31]/20 focus:bg-white focus:border-[#8a1c31] outline-none transition-all font-medium text-stone-800 resize-none"
            placeholder="Describe the weave, fabric, and details..."
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="pt-2 flex space-x-3">
          {editingProduct && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="flex-1 px-6 py-4 border border-stone-200 text-stone-600 rounded-xl font-bold hover:bg-stone-50 transition-all"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className={`flex-[2] py-4 rounded-xl font-bold transition-all flex items-center justify-center disabled:opacity-50 shadow-lg ${
              editingProduct 
                ? 'bg-stone-900 text-gold-400 hover:bg-stone-800' 
                : 'bg-[#8a1c31] text-white hover:bg-stone-900'
            }`}
          >
            {loading ? (
              <Loader2 className="animate-spin h-6 w-6" />
            ) : (
              <>
                {editingProduct ? <Edit3 size={20} className="mr-2" /> : <PlusCircle size={20} className="mr-2" />}
                {editingProduct ? "Update Masterpiece" : "Publish Saree"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
