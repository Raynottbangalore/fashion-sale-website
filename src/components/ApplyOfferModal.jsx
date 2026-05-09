import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { X, Loader2 } from "lucide-react";
import { useToast } from "../context/ToastContext";


const ApplyOfferModal = ({ isOpen, onClose, product, onOfferApplied, onManageOffers }) => {
  const toast = useToast();
  const [offers, setOffers] = useState([]);

  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [selectedOfferId, setSelectedOfferId] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchOffers();
      if (product?.offerId) {
        setSelectedOfferId(product.offerId);
      } else {
        setSelectedOfferId("");
      }
    }
  }, [isOpen, product]);

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

  const handleApply = async () => {
    if (!selectedOfferId) {
      alert("Please select an offer");
      return;
    }

    setApplying(true);
    try {
      const selectedOffer = offers.find(o => o.id === selectedOfferId);
      await updateDoc(doc(db, "products", product.id), {
        isOffer: true,
        offerId: selectedOfferId,
        offerDetails: {
          name: selectedOffer.name,
          discountType: selectedOffer.discountType,
          discountValue: selectedOffer.discountValue
        }
      });
      toast.success("Offer applied successfully!");
      onOfferApplied();

      onClose();
    } catch (error) {
      console.error("Error applying offer:", error);
    } finally {
      setApplying(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-[22px] font-bold text-[#1e293b]">Apply Offer to Product</h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-300"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <label className="text-[13px] font-bold text-stone-500">Select Offer</label>
              <button 
                onClick={onManageOffers}
                className="text-[#9333ea] text-[13px] font-bold hover:underline"
              >
                + Manage Offers
              </button>
            </div>

            <div className="relative">
              <select 
                value={selectedOfferId}
                onChange={(e) => setSelectedOfferId(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border-2 border-[#5D2626] outline-none transition-all font-medium text-stone-700 appearance-none bg-white"
              >
                <option value="">-- Select an offer --</option>
                {offers.map((offer) => (
                  <option key={offer.id} value={offer.id}>
                    {offer.name} ({offer.discountType === "Percentage (%)" ? `${offer.discountValue}% off` : `₹${offer.discountValue} off`})
                  </option>
                ))}
              </select>
              <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeJoin="round"/>
                </svg>
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <button 
                onClick={onClose}
                className="flex-1 py-3.5 rounded-xl font-bold text-stone-600 border-2 border-stone-100 hover:bg-stone-50 transition-all text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleApply}
                disabled={applying || !selectedOfferId}
                className="flex-1 py-3.5 bg-[#6B2D2D]/60 text-white rounded-xl font-bold hover:bg-[#6B2D2D] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {applying && <Loader2 size={16} className="animate-spin" />}
                <span>Apply Offer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ApplyOfferModal;
