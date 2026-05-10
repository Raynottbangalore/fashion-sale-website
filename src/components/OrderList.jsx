import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc
} from 'firebase/firestore';
import { 
  ShoppingBag, 
  Clock, 
  Package, 
  DollarSign,
  Search,
  Eye,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import OrderDetailView from './OrderDetailView';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingOrder, setViewingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [paymentFilter, setPaymentFilter] = useState('All');
  const toast = useToast();

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let result = orders;

    if (searchTerm) {
      result = result.filter(o => 
        o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customerInfo.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(o => o.status === statusFilter);
    }

    if (paymentFilter !== 'All') {
      result = result.filter(o => {
        const pStatus = o.paymentStatus || (o.paymentMethod === 'cod' ? 'Pending' : 'Paid');
        return pStatus === paymentFilter;
      });
    }

    setFilteredOrders(result);
  }, [searchTerm, statusFilter, paymentFilter, orders]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const updatePaymentStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { paymentStatus: newStatus });
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update payment status');
    }
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order record?')) {
      try {
        await deleteDoc(doc(db, 'orders', orderId));
        toast.success('Order deleted');
      } catch (error) {
        toast.error('Failed to delete order');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Processing': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Shipped': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'Delivered': return 'bg-green-50 text-green-600 border-green-100';
      case 'Cancelled': return 'bg-red-50 text-red-600 border-red-100';
      default: return 'bg-stone-50 text-stone-500 border-stone-100';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-stone-50 text-stone-700 border-stone-100';
      default: return 'bg-stone-50 text-stone-700 border-stone-100';
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    revenue: orders.reduce((acc, curr) => acc + (curr.status !== 'Cancelled' ? curr.total : 0), 0)
  };

  if (viewingOrder) {
    return <OrderDetailView order={viewingOrder} onBack={() => setViewingOrder(null)} />;
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5D2626] mb-4"></div>
        <p className="text-stone-500 font-medium">Fetching orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 px-2">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard 
          label="Total Orders" 
          value={stats.total} 
          icon={<ShoppingBag className="text-blue-500" size={24} />} 
          bgColor="bg-blue-100/50"
        />
        <StatCard 
          label="Pending" 
          value={stats.pending} 
          icon={<Clock className="text-orange-500" size={24} />} 
          bgColor="bg-orange-100/50"
          valueColor="text-orange-600"
        />
        <StatCard 
          label="Shipped" 
          value={stats.shipped} 
          icon={<Package className="text-blue-500" size={24} />} 
          bgColor="bg-blue-100/50"
          valueColor="text-blue-600"
        />
        <StatCard 
          label="Revenue" 
          value={`₹${stats.revenue.toLocaleString('en-IN')}`} 
          icon={<DollarSign className="text-green-500" size={24} />} 
          bgColor="bg-green-100/50"
          valueColor="text-green-600"
        />
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 md:p-8 rounded-2xl shadow-sm border border-stone-100">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
            <div className="space-y-2 w-full sm:w-auto">
              <label className="text-sm font-semibold text-stone-800">Order Status</label>
              <div className="relative">
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full sm:w-48 bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>Processing</option>
                  <option>Shipped</option>
                  <option>Delivered</option>
                  <option>Cancelled</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
              </div>
            </div>

            <div className="space-y-2 w-full sm:w-auto">
              <label className="text-sm font-semibold text-stone-800">Payment Status</label>
              <div className="relative">
                <select 
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="appearance-none w-full sm:w-48 bg-white border border-stone-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                >
                  <option>All</option>
                  <option>Pending</option>
                  <option>Paid</option>
                  <option>Failed</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" size={16} />
              </div>
            </div>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">
              <Search size={18} />
            </div>
            <input 
              type="text"
              placeholder="Search order ID, name, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-stone-400"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white text-stone-400 text-[10px] md:text-[11px] uppercase tracking-wider font-bold border-b border-stone-50">
                <th className="px-4 md:px-8 py-5">Order Info</th>
                <th className="px-4 md:px-8 py-5">Customer</th>
                <th className="px-4 md:px-8 py-5">Amount</th>
                <th className="px-4 md:px-8 py-5">Status</th>
                <th className="px-4 md:px-8 py-5 whitespace-nowrap">Payment Method</th>
                <th className="px-4 md:px-8 py-5">Payment</th>
                <th className="px-4 md:px-8 py-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-4 md:px-8 py-6">
                    <div className="flex flex-col min-w-[120px]">
                      <span className="text-[10px] text-blue-600 font-bold mb-1">#{order.id.slice(-6).toUpperCase()}</span>
                      <span className="text-sm font-bold text-stone-800">
                        {order.createdAt?.toDate().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </span>
                      <span className="text-[10px] text-stone-400 mt-1 uppercase tracking-tighter">
                        {order.items.length} {order.items.length === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <div className="flex flex-col min-w-[150px]">
                      <span className="text-sm font-bold text-stone-800 line-clamp-1">{order.customerInfo.fullName}</span>
                      <span className="text-[11px] text-stone-400 mt-0.5 line-clamp-1">{order.customerInfo.email}</span>
                      <span className="text-[11px] text-stone-400">{order.customerInfo.phone}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <span className="text-sm font-bold text-stone-800">₹{order.total.toLocaleString('en-IN')}</span>
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <div className="relative inline-block min-w-[110px]">
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className={`appearance-none w-full px-3 md:px-4 py-1.5 pr-8 rounded-full text-[11px] font-bold focus:outline-none cursor-pointer transition-all border ${getStatusColor(order.status)}`}
                      >
                        <option>Pending</option>
                        <option>Processing</option>
                        <option>Shipped</option>
                        <option>Delivered</option>
                        <option>Cancelled</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60" size={12} />
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <span className="px-3 md:px-4 py-1.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-100 whitespace-nowrap">
                      {order.paymentMethod === 'cod' ? 'COD' : 'Online'}
                    </span>
                  </td>
                  <td className="px-4 md:px-8 py-6">
                    <div className="relative inline-block min-w-[90px]">
                      <select 
                        value={order.paymentStatus || (order.paymentMethod === 'cod' ? 'Pending' : 'Paid')}
                        onChange={(e) => updatePaymentStatus(order.id, e.target.value)}
                        className={`appearance-none w-full px-3 md:px-4 py-1.5 pr-8 rounded-full text-[11px] font-bold focus:outline-none cursor-pointer transition-all border ${getPaymentStatusColor(order.paymentStatus || (order.paymentMethod === 'cod' ? 'Pending' : 'Paid'))}`}
                      >
                        <option>Pending</option>
                        <option>Paid</option>
                        <option>Failed</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60" size={12} />
                    </div>
                  </td>
                  <td className="px-4 md:px-8 py-6 text-right">
                    <div className="flex items-center justify-end gap-3 md:gap-4">
                      <button 
                        onClick={() => setViewingOrder(order)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => deleteOrder(order.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Order"
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
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, bgColor, valueColor = "text-stone-800" }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
      <div className="space-y-3">
        <p className="text-sm text-stone-500 font-medium">{label}</p>
        <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
      </div>
      <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center`}>
        {icon}
      </div>
    </div>
  );
}
