import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc,
  serverTimestamp,
  query,
  orderBy
} from "firebase/firestore";
import { X, Plus, Trash2, Edit3, Loader2, CircleDollarSign } from "lucide-react";
import { useToast } from "../context/ToastContext";

const OfferManagement = ({ isOpen, onClose, products }) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("all"); // all, create

  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discountType: "Percentage (%)",
    discountValue: ""
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchOffers();
    }
  }, [isOpen]);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "offers"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const offersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOffers(offersData);
    } catch (error) {
      console.error("Error fetching offers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await updateDoc(doc(db, "offers", editingId), {
          ...formData,
          updatedAt: serverTimestamp()
        });
        toast.success("Offer updated successfully!");
      } else {

        await addDoc(collection(db, "offers"), {
          ...formData,
          createdAt: serverTimestamp()
        });
        toast.success("Offer created successfully!");
      }

      setFormData({ name: "", description: "", discountType: "Percentage (%)", discountValue: "" });
      setEditingId(null);
      setActiveTab("all");
      fetchOffers();
    } catch (error) {
      console.error("Error saving offer:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (offer) => {
    setFormData({
      name: offer.name,
      description: offer.description,
      discountType: offer.discountType,
      discountValue: offer.discountValue
    });
    setEditingId(offer.id);
    setActiveTab("create");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        await deleteDoc(doc(db, "offers", id));
        toast.success("Offer deleted successfully");
        fetchOffers();
      } catch (error) {

        console.error("Error deleting offer:", error);
      }
    }
  };

  const getUsageCount = (offerId) => {
    return products?.filter(p => p.offerId === offerId).length || 0;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <div className="px-10 py-8 border-b border-stone-100 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#0f172a]">Manage Offers</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-300 hover:text-stone-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-10 mt-8">
          <div className="flex gap-10 border-b border-stone-100">
            <button 
              onClick={() => {
                setActiveTab("all");
                setEditingId(null);
                setFormData({ name: "", description: "", discountType: "Percentage (%)", discountValue: "" });
              }}
              className={`pb-4 text-[15px] font-bold transition-all relative ${
                activeTab === "all" ? "text-[#6B2D2D]" : "text-stone-400 hover:text-stone-500"
              }`}
            >
              All Offers
              {activeTab === "all" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#6B2D2D] rounded-full" />}
            </button>
            <button 
              onClick={() => setActiveTab("create")}
              className={`pb-4 text-[15px] font-bold transition-all relative ${
                activeTab === "create" ? "text-[#6B2D2D]" : "text-stone-400 hover:text-stone-500"
              }`}
            >
              {editingId ? "Edit Offer" : "Create New Offer"}
              {activeTab === "create" && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#6B2D2D] rounded-full" />}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-10 max-h-[65vh] overflow-y-auto">
          {activeTab === "all" ? (
            <div className="space-y-6">
              {loading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-4 text-stone-300">
                  <Loader2 className="animate-spin" size={40} />
                  <p className="font-bold text-sm tracking-wide">LOADING OFFERS</p>
                </div>
              ) : offers.length === 0 ? (
                <div className="py-16 text-center text-stone-400">
                  <p className="font-medium text-lg">No offers created yet.</p>
                  <button 
                    onClick={() => setActiveTab("create")}
                    className="mt-4 text-[#6B2D2D] font-bold hover:underline"
                  >
                    Create your first offer
                  </button>
                </div>
              ) : (
                offers.map((offer) => (
                  <div key={offer.id} className="p-8 rounded-[1.5rem] border-2 border-stone-100 hover:border-stone-200 transition-all">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-stone-800">{offer.name}</h3>
                        <p className="text-stone-500 font-medium mt-1">{offer.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(offer)}
                          className="px-6 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDelete(offer.id)}
                          className="px-6 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="text-[#6B2D2D] text-lg font-bold">
                        {offer.discountType === "Percentage (%)" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                      </p>
                      <span className="text-stone-200">|</span>
                      <p className="text-stone-400 font-medium text-sm">Used on {getUsageCount(offer.id)} products</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-stone-600">Offer Name *</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-5 py-4 rounded-xl border-2 border-stone-100 outline-none focus:border-[#6B2D2D]/30 focus:ring-4 focus:ring-[#6B2D2D]/5 transition-all font-medium text-stone-800 placeholder:text-stone-300"
                  placeholder="Enter offer name"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-stone-600">Description</label>
                <textarea 
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-5 py-4 rounded-xl border-2 border-stone-100 outline-none focus:border-[#6B2D2D]/30 focus:ring-4 focus:ring-[#6B2D2D]/5 transition-all font-medium text-stone-800 placeholder:text-stone-300 resize-none"
                  placeholder="Describe the offer..."
                />
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-stone-600">Discount Type</label>
                  <select 
                    value={formData.discountType}
                    onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl border-2 border-stone-100 outline-none focus:border-[#6B2D2D]/30 focus:ring-4 focus:ring-[#6B2D2D]/5 transition-all font-bold text-stone-700 cursor-pointer appearance-none bg-stone-50/50"
                  >
                    <option>Percentage (%)</option>
                    <option>Fixed Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-stone-600">Discount Value *</label>
                  <input 
                    required
                    type="number" 
                    value={formData.discountValue}
                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                    className="w-full px-5 py-4 rounded-xl border-2 border-stone-100 outline-none focus:border-[#6B2D2D]/30 focus:ring-4 focus:ring-[#6B2D2D]/5 transition-all font-medium text-stone-800 placeholder:text-stone-300"
                    placeholder="e.g., 20"
                  />
                </div>
              </div>

              <div className="pt-8 flex justify-end gap-5">
                <button 
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className="px-10 py-4 rounded-xl font-bold text-stone-500 hover:bg-stone-50 transition-all border-2 border-stone-100"
                >
                  Cancel
                </button>
                <button 
                  disabled={saving}
                  type="submit"
                  className="px-10 py-4 bg-[#6B2D2D] text-white rounded-xl font-bold shadow-xl shadow-[#6B2D2D]/20 hover:bg-stone-900 transition-all disabled:opacity-50 flex items-center gap-3"
                >
                  {saving && <Loader2 size={20} className="animate-spin" />}
                  <span>{editingId ? "Update Offer" : "Create Offer"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

    </div>
  );
};

export default OfferManagement;
