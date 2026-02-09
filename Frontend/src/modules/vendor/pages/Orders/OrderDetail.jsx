import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, Phone, Mail, Clock, CheckCircle2, Truck, User, CreditCard, Calendar, Hash } from 'lucide-react';
import { useVendor } from '../../contexts/VendorContext';
import { formatCurrency, formatDate } from '../../utils/formatDate';

const OrderDetail = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { orders, updateOrderStatus } = useVendor();

    const order = orders.find(o => o.id === orderId);

    if (!order) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Package size={48} className="text-gray-300 mb-4" />
                <h2 className="text-lg font-bold text-gray-900 mb-2">Order not found</h2>
                <p className="text-sm text-gray-500 mb-4">The order you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate('/vendor/orders')}
                    className="px-4 py-2 bg-[#0c831f] text-white text-sm font-bold rounded-lg hover:bg-[#0a6b19]"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    const statusColors = {
        'Pending': 'text-amber-600 bg-amber-50 border-amber-200',
        'Packing': 'text-blue-600 bg-blue-50 border-blue-200',
        'Dispatched': 'text-indigo-600 bg-indigo-50 border-indigo-200',
        'Delivered': 'text-green-600 bg-green-50 border-green-200'
    };

    const nextAction = (status) => {
        if (status === 'Pending') return { label: 'Start Packing', next: 'Packing', icon: Package, color: 'bg-[#0c831f]' };
        if (status === 'Packing') return { label: 'Mark as Dispatched', next: 'Dispatched', icon: Truck, color: 'bg-blue-600' };
        if (status === 'Dispatched') return { label: 'Mark as Delivered', next: 'Delivered', icon: CheckCircle2, color: 'bg-green-600' };
        return null;
    };

    const action = nextAction(order.status);

    const statusSteps = ['Pending', 'Packing', 'Dispatched', 'Delivered'];
    const currentStepIndex = statusSteps.indexOf(order.status);

    return (
        <div className="space-y-4 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate('/vendor/orders')}
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <h1 className="text-base font-bold text-gray-900">Order #{order.id}</h1>
                    <p className="text-[10px] text-gray-500 font-medium">Placed on {order.time}</p>
                </div>
                {action && (
                    <button
                        onClick={() => {
                            updateOrderStatus(order.id, action.next);
                            navigate('/vendor/orders');
                        }}
                        className={`px-4 py-2 ${action.color} text-white text-xs font-bold rounded-lg hover:opacity-90 flex items-center gap-2`}
                    >
                        <action.icon size={14} />
                        {action.label}
                    </button>
                )}
            </div>

            {/* Status Timeline */}
            <div className="premium-card p-4">
                <h2 className="text-sm font-bold text-gray-900 mb-4">Order Status</h2>
                <div className="flex items-center justify-between relative">
                    {statusSteps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;
                        return (
                            <div key={step} className="flex-1 relative">
                                <div className="flex flex-col items-center">
                                    <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${isCompleted
                                            ? 'bg-[#0c831f] border-[#0c831f] text-white'
                                            : 'bg-white border-gray-300 text-gray-400'
                                        }`}>
                                        {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                                    </div>
                                    <p className={`text-[10px] font-bold mt-2 text-center ${isCurrent ? 'text-[#0c831f]' : isCompleted ? 'text-gray-900' : 'text-gray-400'
                                        }`}>
                                        {step}
                                    </p>
                                </div>
                                {index < statusSteps.length - 1 && (
                                    <div className={`absolute top-4 left-1/2 w-full h-0.5 ${index < currentStepIndex ? 'bg-[#0c831f]' : 'bg-gray-300'
                                        }`} style={{ transform: 'translateY(-50%)' }} />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Order Items */}
                    <div className="premium-card p-4">
                        <h2 className="text-sm font-bold text-gray-900 mb-3">Order Items ({order.items})</h2>
                        <div className="space-y-3">
                            {/* Mock items - in real app, would come from order.products */}
                            {[1, 2, 3].slice(0, order.items).map((_, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                                        <Package size={20} className="text-gray-400 m-auto mt-3" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-gray-900">Product Name {idx + 1}</p>
                                        <p className="text-xs text-gray-500">Quantity: 1</p>
                                    </div>
                                    <p className="text-sm font-bold text-gray-900">₹{(order.total / order.items).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Delivery Address */}
                    <div className="premium-card p-4">
                        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <MapPin size={14} />
                            Delivery Address
                        </h2>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm font-bold text-gray-900">{order.customer}</p>
                            <p className="text-xs text-gray-600 mt-1">123 Sample Street, Near Landmark</p>
                            <p className="text-xs text-gray-600">Delhi-NCR, 110001</p>
                            <p className="text-xs text-gray-600 mt-2 flex items-center gap-2">
                                <Phone size={12} />
                                +91 98765 43210
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    {/* Order Summary */}
                    <div className="premium-card p-4">
                        <h2 className="text-sm font-bold text-gray-900 mb-3">Order Summary</h2>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Order ID</span>
                                <span className="font-bold text-gray-900">#{order.id}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Date</span>
                                <span className="font-bold text-gray-900">{order.time}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Status</span>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusColors[order.status]}`}>
                                    {order.status}
                                </span>
                            </div>
                            <div className="border-t border-gray-100 my-2" />
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="font-bold text-gray-900">{formatCurrency(order.total * 0.9)}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-600">Tax (10%)</span>
                                <span className="font-bold text-gray-900">{formatCurrency(order.total * 0.1)}</span>
                            </div>
                            <div className="border-t border-gray-100 my-2" />
                            <div className="flex justify-between text-sm">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-[#0c831f]">{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="premium-card p-4">
                        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <User size={14} />
                            Customer Details
                        </h2>
                        <div className="space-y-2">
                            <p className="text-sm font-bold text-gray-900">{order.customer}</p>
                            <p className="text-xs text-gray-600 flex items-center gap-2">
                                <Mail size={12} />
                                customer@example.com
                            </p>
                            <p className="text-xs text-gray-600 flex items-center gap-2">
                                <Phone size={12} />
                                +91 98765 43210
                            </p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="premium-card p-4">
                        <h2 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <CreditCard size={14} />
                            Payment
                        </h2>
                        <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                            <p className="text-xs font-bold text-green-700">Payment Received</p>
                            <p className="text-xs text-green-600 mt-1">Cash on Delivery</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetail;
