import React, { useEffect } from 'react';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard, 
  User, 
  MapPin, 
  Receipt,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function OrderDetailView({ order, onBack }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  if (!order) return null;

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

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-stone-100 text-stone-700 border-stone-200';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 px-2 md:px-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-playfair font-bold text-stone-800">Order Details</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-stone-500">
              ID: <span className="font-bold text-[#5D2626]">#{order.id.toUpperCase()}</span>
            </p>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-stone-800 text-white rounded-xl hover:bg-stone-700 transition-all shadow-lg shadow-stone-200 w-full sm:w-fit"
        >
          <ArrowLeft size={18} />
          <span className="font-semibold text-sm">Back to List</span>
        </button>
      </div>

      <div className="space-y-6 md:space-y-8 max-w-6xl">
        {/* Top Info Cards */}
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-stone-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {/* Order Status */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-stone-800">Order Status</h4>
              <div className="flex flex-wrap gap-2">
                <span className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold border ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <span className={`px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold border ${getPaymentStatusColor(order.paymentStatus || (order.paymentMethod === 'cod' ? 'Pending' : 'Paid'))}`}>
                  {order.paymentStatus || (order.paymentMethod === 'cod' ? 'Pending' : 'Paid')}
                </span>
              </div>
              <p className="text-[10px] md:text-xs text-stone-400 mt-2">
                Ordered: {order.createdAt?.toDate().toLocaleDateString('en-IN')}
              </p>
            </div>

            {/* Payment Details */}
            <div className="bg-stone-50/50 p-5 md:p-6 rounded-2xl border border-stone-100">
              <h4 className="text-sm font-bold text-stone-800 mb-4">Payment Details</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-stone-500">Method</span>
                  <span className="text-[11px] text-stone-800 font-bold">{order.paymentMethod === 'cod' ? 'COD' : 'Online'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[11px] text-stone-500">Status</span>
                  <span className="text-[11px] text-stone-800 font-bold uppercase tracking-wider">{order.paymentStatus || (order.paymentMethod === 'cod' ? 'Pending' : 'Paid')}</span>
                </div>
              </div>
            </div>

            {/* Customer */}
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-stone-800 mb-3">Customer</h4>
              <p className="text-sm font-bold text-stone-800">{order.customerInfo.fullName}</p>
              <p className="text-xs text-stone-500">{order.customerInfo.email}</p>
              <p className="text-xs text-stone-500">{order.customerInfo.phone}</p>
            </div>
          </div>
        </div>

        {/* Total Amount Card */}
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-stone-100">
          <h4 className="text-sm font-bold text-stone-800 mb-2">Total Amount</h4>
          <p className="text-3xl md:text-4xl font-bold text-[#5D2626]">₹{order.total.toLocaleString('en-IN')}</p>
          <p className="text-xs text-stone-400 mt-1">{order.items.length} item{order.items.length > 1 ? 's' : ''}</p>
        </div>

        {/* Address and Price Breakdown Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-stone-100">
            <h4 className="text-sm font-bold text-stone-800 mb-6">Shipping Address</h4>
            <div className="space-y-1">
              <p className="text-sm font-bold text-stone-800 mb-2">{order.customerInfo.fullName}</p>
              <p className="text-xs text-stone-600 leading-relaxed">
                {order.shippingAddress.address}
              </p>
              <p className="text-xs text-stone-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pinCode}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-stone-100">
            <h4 className="text-sm font-bold text-stone-800 mb-6">Price Breakdown</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-[11px] md:text-xs">
                <span className="text-stone-500">Product Subtotal</span>
                <span className="text-stone-800 font-bold">₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] md:text-xs">
                <span className="text-stone-500">Shipping Charges</span>
                <span className="text-stone-800 font-bold">₹{order.shipping.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-4 border-t border-stone-50 flex justify-between items-center">
                <span className="text-sm font-bold text-stone-800">Total Amount</span>
                <span className="text-lg md:text-xl font-bold text-[#5D2626]">₹{order.total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-sm border border-stone-100">
          <h4 className="text-sm font-bold text-stone-800 mb-6 md:mb-8">Order Items</h4>
          <div className="space-y-4 md:space-y-6">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6 p-4 rounded-2xl bg-stone-50/50 border border-stone-100 transition-all hover:bg-stone-50">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-white border border-stone-100 flex-shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h5 className="text-sm font-bold text-stone-800 line-clamp-1">{item.name}</h5>
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-[11px] text-stone-500">Qty: <span className="font-bold text-stone-700">{item.quantity}</span></p>
                    <p className="text-[11px] text-stone-500">₹{item.price.toLocaleString('en-IN')} each</p>
                  </div>
                </div>
                <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-100">
                  <p className="text-sm font-bold text-stone-800">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
