import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import ProductForm from "../components/ProductForm";
import ProductList from "../components/ProductList";
import OrderList from "../components/OrderList";
import { useAuth } from "../context/AuthContext";
import { LayoutDashboard, LogOut, Package, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Admin = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard or products
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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
    setActiveTab("dashboard"); // Switch to dashboard where the form is
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  // Stats for dashboard
  const stats = {
    totalProducts: products.length,
    lowStock: products.filter(p => p.stock <= 5).length,
    outOfStock: products.filter(p => p.stock === 0).length,
    categories: [...new Set(products.map(p => p.category))].length
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col md:flex-row font-poppins">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-stone-900 text-stone-100 flex flex-col shadow-2xl z-10">
        <div className="p-8 border-b border-stone-800">
          <h1 className="text-2xl font-playfair font-bold tracking-tight text-gold-400">Admin Portal</h1>
          <p className="text-stone-400 text-xs mt-1 uppercase tracking-widest font-medium">Luxury Saree Management</p>
        </div>
        
        <nav className="flex-grow p-6 space-y-4">
          <button 
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center space-x-4 p-4 rounded-xl border transition-all shadow-lg group ${
              activeTab === "dashboard" 
                ? "bg-stone-800/50 text-gold-400 border-stone-700/50" 
                : "text-stone-400 border-transparent hover:bg-stone-800/30 hover:text-gold-400"
            }`}
          >
            <LayoutDashboard size={22} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Dashboard</span>
          </button>
          
          <div className="pt-6 pb-2">
            <p className="text-[10px] text-stone-500 uppercase tracking-[0.2em] px-4 font-bold">Inventory</p>
          </div>
          
          <button 
            onClick={() => setActiveTab("products")}
            className={`w-full flex items-center space-x-4 p-4 rounded-xl border transition-all group ${
              activeTab === "products" 
                ? "bg-stone-800/50 text-gold-400 border-stone-700/50 shadow-lg" 
                : "text-stone-400 border-transparent hover:bg-stone-800/30 hover:text-gold-400"
            }`}
          >
            <Package size={22} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Products</span>
          </button>

          <button 
            onClick={() => setActiveTab("orders")}
            className={`w-full flex items-center space-x-4 p-4 rounded-xl border transition-all group ${
              activeTab === "orders" 
                ? "bg-stone-800/50 text-gold-400 border-stone-700/50 shadow-lg" 
                : "text-stone-400 border-transparent hover:bg-stone-800/30 hover:text-gold-400"
            }`}
          >
            <Tag size={22} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">Orders</span>
          </button>
        </nav>

        <div className="p-6 border-t border-stone-800 bg-stone-950/40">
          <div className="flex items-center space-x-4 mb-6 p-2 rounded-lg bg-stone-800/20">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center font-bold text-stone-900 text-lg shadow-inner">
              {currentUser?.email?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate text-stone-100">{currentUser?.email?.split('@')[0]}</p>
              <p className="text-[10px] text-gold-500/80 uppercase tracking-widest font-bold">Chief Admin</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-3 p-3 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all text-sm font-bold border border-red-500/20"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-6 md:p-12 overflow-y-auto">
        {activeTab === "dashboard" ? (
          <div className="max-w-4xl">
            <header className="mb-12">
              <h2 className="text-4xl font-playfair font-bold text-stone-900 mb-2">
                {editingProduct ? "Edit Masterpiece" : "Publish New Saree"}
              </h2>
              <div className="h-1 w-20 bg-gold-500 rounded-full mb-4"></div>
              <p className="text-stone-500 font-medium">Add new additions to your exquisite collections.</p>
            </header>

            <div className="grid grid-cols-1 gap-12">
              {/* Product Form is now the main focus of Dashboard */}
              <ProductForm 
                onProductAdded={fetchProducts} 
                editingProduct={editingProduct}
                onCancelEdit={handleCancelEdit}
              />
              
              {/* Optional: Small stats overview at bottom of dashboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-100">
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Total Items</p>
                  <p className="text-2xl font-playfair font-bold text-stone-800">{stats.totalProducts}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-100">
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Low Stock</p>
                  <p className="text-2xl font-playfair font-bold text-amber-600">{stats.lowStock}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-stone-100">
                  <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Out of Stock</p>
                  <p className="text-2xl font-playfair font-bold text-red-600">{stats.outOfStock}</p>
                </div>
              </div>
            </div>
          </div>
        ) : activeTab === "products" ? (
          <div>
            <header className="mb-12">
              <h2 className="text-4xl font-playfair font-bold text-stone-900 mb-2">Live Inventory</h2>
              <div className="h-1 w-20 bg-gold-500 rounded-full mb-4"></div>
              <p className="text-stone-500 font-medium">Track and manage your current stock levels and details.</p>
            </header>

            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 mb-8 overflow-hidden relative">
               <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gold-50 rounded-2xl text-gold-600">
                    <Package size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-stone-800">Inventory List</h2>
                    <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Status Overview</p>
                  </div>
                </div>
                <div className="px-4 py-2 bg-stone-50 rounded-full text-sm font-bold text-stone-600 border border-stone-100">
                  {products.length} Products Found
                </div>
               </div>
               <ProductList 
                products={products} 
                loading={loading} 
                onProductDeleted={fetchProducts} 
                onEdit={handleEdit}
               />
            </div>
          </div>
        ) : (
          <div>
            <header className="mb-12">
              <h2 className="text-4xl font-playfair font-bold text-stone-900 mb-2">Customer Orders</h2>
              <div className="h-1 w-20 bg-gold-500 rounded-full mb-4"></div>
              <p className="text-stone-500 font-medium">Manage incoming orders and track delivery status.</p>
            </header>

            <div className="bg-white p-8 rounded-3xl shadow-xl shadow-stone-200/50 border border-stone-100 mb-8 overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gold-50 rounded-2xl text-gold-600">
                    <Tag size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-playfair font-bold text-stone-800">Order Management</h2>
                    <p className="text-xs text-stone-400 font-medium uppercase tracking-wider">Customer Requests</p>
                  </div>
                </div>
               </div>
               <OrderList />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
