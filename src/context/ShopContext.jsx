import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove,
  onSnapshot
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const ShopContext = createContext();

export const useShop = () => useContext(ShopContext);

export const ShopProvider = ({ children }) => {
  const { currentUser } = useAuth();
  // Fallback to Firebase auth directly if context is lagging
  const activeUser = currentUser || auth.currentUser;
  
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'products'), (snapshot) => {
      const productsData = snapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        .filter(product => product.name && product.price > 0 && product.visible !== false); // Only show valid and visible products
      setProducts(productsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch User's Cart and Wishlist
  useEffect(() => {
    if (!activeUser) {
      setCart([]);
      setWishlist([]);
      return;
    }

    const userRef = doc(db, 'users', activeUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCart(data.cart || []);
        setWishlist(data.wishlist || []);
      } else {
        // Initialize user document if it doesn't exist
        setDoc(userRef, { cart: [], wishlist: [] }, { merge: true });
      }
    });

    return () => unsubscribe();
  }, [activeUser]);

  const addToCart = async (product, quantity = 1) => {
    const userToUse = activeUser || auth.currentUser;
    if (!userToUse) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const userRef = doc(db, 'users', userToUse.uid);
      let finalPrice = product.price || 0;
      if (product.isOffer && product.offerDetails) {
        if (product.offerDetails.discountType === "Percentage (%)") {
          finalPrice = Math.round(finalPrice * (1 - product.offerDetails.discountValue / 100));
        } else {
          finalPrice = Math.max(0, finalPrice - product.offerDetails.discountValue);
        }
      }

      const cartItem = {
        id: product.id,
        name: product.name,
        price: finalPrice,
        image: product.image,
        quantity: quantity,
        addedAt: new Date().toISOString()
      };


      // Check if already in cart
      const existingItem = cart.find(item => item.id === product.id);
      if (existingItem) {
        // Update quantity
        const updatedCart = cart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
        await updateDoc(userRef, { cart: updatedCart });
      } else {
        await updateDoc(userRef, {
          cart: arrayUnion(cartItem)
        });
      }
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error('Failed to add to cart');
    }
  };

  const removeFromCart = async (productId) => {
    const userToUse = activeUser || auth.currentUser;
    if (!userToUse) return;
    try {
      const userRef = doc(db, 'users', userToUse.uid);
      const updatedCart = cart.filter(item => item.id !== productId);
      await updateDoc(userRef, { cart: updatedCart });
      toast.success('Removed from cart');
    } catch (error) {
      toast.error('Failed to remove from cart');
    }
  };

  const updateCartQuantity = async (productId, newQuantity) => {
    const userToUse = activeUser || auth.currentUser;
    if (!userToUse || newQuantity < 1) return;
    try {
      const userRef = doc(db, 'users', userToUse.uid);
      const updatedCart = cart.map(item => 
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
      await updateDoc(userRef, { cart: updatedCart });
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  const clearCart = async () => {
    const userToUse = activeUser || auth.currentUser;
    if (!userToUse) return;
    try {
      const userRef = doc(db, 'users', userToUse.uid);
      await updateDoc(userRef, { cart: [] });
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const toggleWishlist = async (product) => {
    const userToUse = activeUser || auth.currentUser;
    if (!userToUse) {
      toast.error('Please login to add items to wishlist');
      return;
    }

    try {
      const userRef = doc(db, 'users', userToUse.uid);
      const isWishlisted = wishlist.some(item => item.id === product.id);

      if (isWishlisted) {
        const updatedWishlist = wishlist.filter(item => item.id !== product.id);
        await updateDoc(userRef, { wishlist: updatedWishlist });
        toast.success('Removed from wishlist');
      } else {
        const wishlistItem = {
          id: product.id,
          name: product.name,
          price: product.price || 0,
          image: product.image,
          category: product.category
        };
        await updateDoc(userRef, {
          wishlist: arrayUnion(wishlistItem)
        });
        toast.success('Added to wishlist');
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      toast.error('Failed to update wishlist');
    }
  };

  const getProductById = (id) => {
    return products.find(p => p.id === id);
  };

  // Seed Data Function (Run once or manually)
  const seedProducts = async () => {
    const initialProducts = [
      {
        name: "Royal Purple Kanjivaram Masterpiece",
        category: "Bridal",
        price: 24500,
        image: "/images/kanjivaram_1.png",
        description: "Breathtaking royal purple Kanjivaram silk with pure gold zari.",
        isNew: true,
        stock: 5
      },
      {
        name: "Sunset Gold Banarasi Weave",
        category: "Silk",
        price: 18900,
        image: "/images/saree_gold.png",
        description: "Vibrant sunset gold Banarasi silk with silver floral jaal.",
        isNew: true,
        stock: 3
      },
      {
        name: "Midnight Silk Elegance",
        category: "Silk",
        price: 12900,
        image: "/images/kanjivaram_2.png",
        description: "Classic midnight blue silk with silver borders.",
        isNew: true,
        stock: 4
      },
      {
        name: "Emerald Forest Designer Saree",
        category: "Designer",
        price: 15600,
        image: "/images/saree_hero.png",
        description: "Hand-painted emerald green organza with sequin borders.",
        isNew: true,
        stock: 8
      }
    ];

    try {
      // Clear existing products first to avoid duplicates if seeding again
      // const querySnapshot = await getDocs(collection(db, 'products'));
      // querySnapshot.forEach(async (doc) => {
      //   await deleteDoc(doc.ref);
      // });

      for (const prod of initialProducts) {
        const prodRef = doc(collection(db, 'products'));
        await setDoc(prodRef, prod);
      }
      toast.success('Products seeded successfully!');
    } catch (error) {
      console.error("Error seeding products:", error);
    }
  };

  const value = {
    products,
    cart,
    wishlist,
    loading,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    toggleWishlist,
    getProductById,
    seedProducts,
    clearCart
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
};
