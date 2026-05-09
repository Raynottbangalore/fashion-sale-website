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
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const toast = useToast();

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
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

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'cod': return 'COD';
      case 'upi': return 'UPI / QR';
      default: return method?.toUpperCase() || 'N/A';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Processing': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Shipped': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'Delivered': return 'bg-green-100 text-green-700 border-green-200';
      case 'Cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  // Calculate stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    revenue: orders.reduce((acc, curr) => acc + (curr.status !== 'Cancelled' ? curr.total : 0), 0)
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B2D2D] mb-4"></div>
        <p className="text-stone-500 font-medium">Fetching orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-stone-50 rounded-3xl border border-dashed border-stone-200">
        <ShoppingBag className="mx-auto text-stone-300 mb-4" size={48} />
        <h3 className="text-xl font-playfair text-stone-800 font-bold mb-1">No orders yet</h3>
        <p className="text-stone-400 text-sm">Once customers place orders, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Total Orders</p>
          <p className="text-2xl font-playfair font-bold text-stone-800">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Pending Orders</p>
          <p className="text-2xl font-playfair font-bold text-amber-600">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Shipped Orders</p>
          <p className="text-2xl font-playfair font-bold text-blue-600">{stats.shipped}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mb-1">Total Revenue</p>
          <p className="text-2xl font-playfair font-bold text-green-600">₹{stats.revenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-stone-200 shadow-sm bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 text-stone-500 text-[10px] uppercase tracking-[0.2em] font-bold">
              <th className="px-6 py-4">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Payment Method</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50 bg-white">
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className={`hover:bg-stone-50 transition-colors ${expandedOrder === order.id ? 'bg-stone-50/50' : ''}`}>
                  <td className="px-6 py-4 text-xs font-mono text-stone-400">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-stone-900">{order.customerInfo.fullName}</div>
                    <div className="text-xs text-stone-500">{order.customerInfo.email}</div>
                  </td>
                  <td className="px-6 py-4 font-semibold text-stone-900">
                    ₹{order.total.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-stone-200 bg-stone-50 text-stone-600">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-stone-500">
                    {order.createdAt?.toDate().toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="p-2 text-stone-400 hover:text-gold-600 transition-colors"
                        title="View Details"
                      >
                        {expandedOrder === order.id ? <ChevronUp size={18} /> : <Eye size={18} />}
                      </button>
                      <button 
                        onClick={() => deleteOrder(order.id)}
                        className="p-2 text-stone-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
                {expandedOrder === order.id && (
                  <tr>
                    <td colSpan="6" className="px-8 py-8 bg-stone-50/50">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Order Items */}
                        <div className="md:col-span-2">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-4 flex items-center">
                            <ShoppingBag size={16} className="mr-2 text-gold-600" />
                            Order Items
                          </h4>
                          <div className="bg-white rounded-2xl p-4 shadow-sm border border-stone-100 space-y-4">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center space-x-4">
                                <div className="w-16 h-16 bg-stone-100 rounded-lg overflow-hidden flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                  <p className="text-sm font-medium text-stone-900">{item.name}</p>
                                  <p className="text-xs text-stone-500">₹{item.price.toLocaleString('en-IN')} x {item.quantity}</p>
                                </div>
                                <div className="text-sm font-bold text-stone-900">
                                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                </div>
                              </div>
                            ))}
                            <div className="pt-4 border-t border-stone-50 space-y-2 text-sm">
                              <div className="flex justify-between text-stone-500">
                                <span>Subtotal</span>
                                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between text-stone-500">
                                <span>Shipping</span>
                                <span>₹{order.shipping.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-100">
                                <span>Total</span>
                                <span className="text-gold-600">₹{order.total.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Customer & Shipping Details */}
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-4 flex items-center">
                              <Clock size={16} className="mr-2 text-gold-600" />
                              Update Status
                            </h4>
                            <div className="grid grid-cols-2 gap-2">
                              {['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updateOrderStatus(order.id, status)}
                                  className={`px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all border ${
                                    order.status === status 
                                      ? getStatusColor(status) 
                                      : 'bg-white border-stone-100 text-stone-400 hover:border-stone-200'
                                  }`}
                                >
                                  {status}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold uppercase tracking-widest text-stone-900 mb-4">Shipping Info</h4>
                            <div className="text-xs text-stone-600 leading-relaxed bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
                              <p className="font-bold text-stone-900 mb-1">{order.customerInfo.phone}</p>
                              <p>{order.shippingAddress.address}</p>
                              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pinCode}</p>
                              <p className="mt-2 pt-2 border-t border-stone-50">
                                <span className="font-bold">Payment:</span> {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'UPI / QR'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
