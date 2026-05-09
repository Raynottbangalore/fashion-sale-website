import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import ProductDetailView from "../components/ProductDetailView";
import OrderList from "../components/OrderList";
import GalleryManagement from "../components/GalleryManagement";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, LogOut, Package, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("products"); // products, orders, gallery
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsData);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      if (!silent) setLoading(false);
    }
  };


  useEffect(() => {
    fetchProducts();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setShowForm(false);
  };

  // Stats for dashboard
  const stats = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.stock <= 5).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    categories: [...new Set(products.map(p => p.category))].length
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col md:flex-row font-poppins">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-[#5D2626] text-white flex flex-col shadow-2xl z-10">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center font-bold text-xs">FS</div>
            <h1 className="text-xl font-bold tracking-tight text-white">Fashion Sale</h1>
          </div>
        </div>
        
        <nav className="flex-grow p-6 space-y-2">
          <button 
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all group ${
              activeTab === "products" 
                ? "bg-white text-stone-800 shadow-lg" 
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Package size={20} className={activeTab === "products" ? "text-stone-800" : "group-hover:scale-110 transition-transform"} />
            <span className="font-semibold text-sm">Products</span>
          </button>
          
          <button 
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all group ${
              activeTab === "orders" 
                ? "bg-white text-stone-800 shadow-lg" 
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Tag size={20} className={activeTab === "orders" ? "text-stone-800" : "group-hover:scale-110 transition-transform"} />
            <span className="font-semibold text-sm">Orders</span>
          </button>

          <button 
            onClick={() => setActiveTab("gallery")}
            className={`w-full flex items-center space-x-4 p-4 rounded-xl transition-all group ${
              activeTab === "gallery" 
                ? "bg-white text-stone-800 shadow-lg" 
                : "text-white/70 hover:bg-white/5 hover:text-white"
            }`}
          >
            <LayoutDashboard size={20} className={activeTab === "gallery" ? "text-stone-800" : "group-hover:scale-110 transition-transform"} />
            <span className="font-semibold text-sm">Gallery</span>
          </button>
        </nav>

        <div className="p-6 border-t border-white/10 bg-black/10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-white text-lg">
              {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-white">{currentUser?.email}</p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold">Administrator</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 p-3 bg-white/10 text-white hover:bg-white/20 rounded-xl transition-all text-xs font-bold"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-10 overflow-y-auto">
        {activeTab === "products" ? (
          <div>

            {showForm ? (
              <div className="max-w-7xl mx-auto animate-in slide-in-from-bottom duration-500">
                <ProductForm 
                  products={products}
                  onProductAdded={() => {
                    fetchProducts();
                    setShowForm(false);
                  }} 
                  editingProduct={editingProduct}
                  onCancelEdit={() => {
                    handleCancelEdit();
                  }}
                />
              </div>
            ) : viewingProduct ? (
              <ProductDetailView 
                product={viewingProduct} 
                onBack={() => setViewingProduct(null)}
                onEdit={(p) => {
                  setViewingProduct(null);
                  handleEdit(p);
                }}
              />
            ) : (
              <ProductList 
                products={products} 
                loading={loading} 
                onProductDeleted={() => fetchProducts(true)} 
                onEdit={handleEdit}
                onView={(p) => setViewingProduct(p)}
                onAddClick={() => setShowForm(true)}
              />

            )}
          </div>
        ) : activeTab === "orders" ? (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-playfair font-bold text-stone-800">Orders Management</h2>
              <p className="text-sm text-stone-500">Track and manage customer orders.</p>
            </div>
            <OrderList />
          </div>
        ) : (
          <div>
            <GalleryManagement />
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
