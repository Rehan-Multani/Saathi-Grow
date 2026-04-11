import React, { useEffect, useState } from 'react';
import { Download, Package, User, MapPin, CreditCard, Clock, X, Truck, Zap, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getAvailablePartners, assignOrder, autoAssignOrder } from '../../api/adminDeliveryApi';
import { getOrderDetails } from '../../api/orderApi';
import { useAdminAuth } from '../../../modules/admin/context/AdminAuthContext';
import { useStoreManagerAuth } from '../../../modules/store-manager/context/StoreManagerAuthContext';
import { useStaffAuth } from '../../../modules/staff/context/StaffAuthContext';
import { toast } from 'react-toastify';

const OrderDetailsModal = ({ show, onHide, order, onOrderUpdate }) => {
    const { t } = useTranslation(['admin_orders', 'common']);
    const [availablePartners, setAvailablePartners] = useState([]);
    const [assigning, setAssigning] = useState(false);
    const [selectedPartner, setSelectedPartner] = useState('');
    const [detailedOrderState, setDetailedOrderState] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    
    const adminAuth = useAdminAuth?.();
    const managerAuth = useStoreManagerAuth?.();
    const staffAuth = useStaffAuth?.();
    const currentUser = adminAuth?.adminUser || managerAuth?.managerUser || staffAuth?.staffUser;
    const userRole = currentUser?.role;

    const displayOrder = detailedOrderState || order;

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
            fetchAvailablePartners();
            if (order?._id) fetchFullOrderDetails();
        } else {
            document.body.style.overflow = 'unset';
            setDetailedOrderState(null);
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [show, order?._id]);

    const fetchFullOrderDetails = async () => {
        try {
            setLoadingDetails(true);
            const data = await getOrderDetails(order._id);
            setDetailedOrderState(data);
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoadingDetails(false);
        }
    };

    const fetchAvailablePartners = async () => {
        try {
            const partners = await getAvailablePartners();
            setAvailablePartners(partners);
        } catch (error) {
            console.error('Error fetching partners:', error);
        }
    };

    const handleAutoAssign = async () => {
        setAssigning(true);
        try {
            await autoAssignOrder(order._id);
            toast.success(t('actions.update_success'));
            if (onOrderUpdate) onOrderUpdate();
            onHide();
        } catch (error) {
            toast.error(error.response?.data?.message || t('common:error_occurred'));
        } finally {
            setAssigning(false);
        }
    };

    const handleManualAssign = async () => {
        if (!selectedPartner) return toast.warning('Select a partner');
        setAssigning(true);
        try {
            await assignOrder(order._id, selectedPartner);
            toast.success(t('actions.update_success'));
            if (onOrderUpdate) onOrderUpdate();
            onHide();
        } catch (error) {
            toast.error(error.response?.data?.message || t('common:error_occurred'));
        } finally {
            setAssigning(false);
        }
    };

    if (!show || !order) return null;

    const displayId = displayOrder.orderId || displayOrder._id;
    const displayCustomer = displayOrder.user?.name || displayOrder.posCustomer?.name || 'Guest';
    const displayTotal = displayOrder.totalAmount?.toLocaleString() || '0';
    const displayDate = new Date(displayOrder.createdAt).toLocaleString();
    
    const getStatusColor = (status = '') => {
        const s = status.toLowerCase();
        switch (s) {
            case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            case 'confirmed':
            case 'preparing': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center p-5 border-b border-slate-100">
                    <h5 className="text-lg font-bold text-slate-900">
                        Order Details: <span className="text-blue-600">#{displayId?.slice(-8).toUpperCase()}</span>
                    </h5>
                    <button onClick={onHide} className="p-1 rounded-lg hover:bg-slate-50 transition-colors text-slate-400"><X size={20} /></button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {loadingDetails ? (
                        <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                            <Clock size={40} className="animate-spin mb-4" />
                            <p className="text-sm font-bold uppercase tracking-widest">Loading Details...</p>
                        </div>
                    ) : (
                        <>
                            <div className="flex flex-wrap gap-2 items-center mb-6">
                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold border uppercase ${getStatusColor(displayOrder.status)}`}>
                                    {displayOrder.status?.replace(/_/g, ' ')}
                                </span>
                                <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5 ml-auto">
                                    <Clock size={14} /> {displayDate}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Customer</p>
                                    <p className="font-bold text-slate-900 text-sm">{displayCustomer}</p>
                                    <p className="text-xs text-slate-500 mt-1">{displayOrder.user?.phone || displayOrder.posCustomer?.phone || 'N/A'}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Shipping Address</p>
                                    <p className="text-xs text-slate-700 leading-relaxed">
                                        {displayOrder.shippingAddress?.address || 'Direct Transaction'}
                                    </p>
                                </div>
                            </div>

                            {displayOrder.orderSource !== 'pos' && (
                                <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-100">
                                    <p className="text-[10px] font-bold text-blue-400 uppercase mb-3 flex items-center gap-2">
                                        <Truck size={14} /> Delivery Status
                                    </p>
                                    {displayOrder.deliveryPartnerId ? (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle size={16} className="text-emerald-500" />
                                                <span className="text-xs font-bold text-slate-700">Partner Assigned</span>
                                            </div>
                                            {displayOrder.deliveryOTP && <span className="text-xs font-black bg-white px-2 py-1 rounded border border-blue-200">OTP: {displayOrder.deliveryOTP}</span>}
                                        </div>
                                    ) : (
                                        userRole === 'Admin' && ['confirmed', 'preparing', 'ready_for_pickup'].includes(displayOrder.status) && (
                                            <div className="flex flex-col sm:flex-row gap-2">
                                                <select 
                                                    className="flex-1 bg-white border border-blue-200 rounded-lg px-2 py-1.5 text-xs outline-none"
                                                    value={selectedPartner}
                                                    onChange={e => setSelectedPartner(e.target.value)}
                                                >
                                                    <option value="">Select Rider</option>
                                                    {availablePartners.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                                                </select>
                                                <button 
                                                    onClick={handleManualAssign}
                                                    className="bg-blue-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold"
                                                >
                                                    Assign
                                                </button>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}

                            <p className="text-[10px] font-bold text-slate-400 uppercase mb-3">Order Items</p>
                            <div className="border border-slate-100 rounded-lg overflow-hidden mb-6">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-400 font-bold uppercase border-b border-slate-100">
                                        <tr>
                                            <th className="px-4 py-2">Item</th>
                                            <th className="px-4 py-2 text-center">Qty</th>
                                            <th className="px-4 py-2 text-right">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {displayOrder.items?.map((item, i) => (
                                            <tr key={i}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <img src={item.image || 'https://placehold.co/40'} className="w-8 h-8 rounded border border-slate-100 object-cover" />
                                                        <div>
                                                            <div className="font-bold text-slate-700 truncate max-w-[150px]">{item.name}</div>
                                                            {item.physicalLocation && (
                                                                <div className="flex items-center gap-1 mt-0.5">
                                                                    <MapPin size={10} className="text-amber-500" />
                                                                    <span className="text-[10px] font-bold text-amber-600">{item.physicalLocation}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">{item.quantity}</td>
                                                <td className="px-4 py-3 text-right font-bold">₹{item.price * item.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex justify-end">
                                <div className="w-full max-w-[240px] space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-slate-400">
                                        <span>Subtotal</span>
                                        <span>₹{displayOrder.subTotal || 0}</span>
                                    </div>
                                    <div className="flex justify-between text-xs font-medium text-slate-400">
                                        <span>Tax</span>
                                        <span>₹{displayOrder.taxAmount || 0}</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                                        <span className="text-sm font-black text-slate-900 uppercase">Total</span>
                                        <span className="text-lg font-black text-blue-600">₹{displayTotal}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                    <button onClick={onHide} className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-700 transition-all">Close</button>
                    <button 
                        onClick={() => window.print()} 
                        className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold flex items-center gap-2"
                    >
                        <Download size={14} /> Print Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal;
