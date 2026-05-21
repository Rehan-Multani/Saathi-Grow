import React, { useState, useEffect } from 'react';
import { Clock, MapPin, UserCheck, RefreshCw, Search, UserX, Zap, Truck, Loader2, ChevronDown, Package, ShieldCheck, User2, MapPinned } from 'lucide-react';
import {
    getUnassignedOrders,
    getAvailablePartners,
    assignOrder,
    unassignOrder,
    autoAssignOrder,
    getActiveTracking
} from '../../common/api/adminDeliveryApi';
import { useStoreManagerAuth } from './context/StoreManagerAuthContext';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const ManagerAssignDeliveries = () => {
    const { managerUser } = useStoreManagerAuth();
    const [orders, setOrders] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [assigningId, setAssigningId] = useState(null);
    const [viewType, setViewType] = useState('unassigned'); // 'unassigned' or 'assigned'
    const [searchTerm, setSearchTerm] = useState('');
    const [activeDropdown, setActiveDropdown] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordersData, driversData] = await Promise.all([
                getUnassignedOrders(),
                getAvailablePartners()
            ]);

            if (viewType === 'assigned') {
                const activeTrackingData = await getActiveTracking();
                setOrders(activeTrackingData);
            } else {
                setOrders(ordersData);
            }

            setDrivers(driversData);
            setActiveDropdown(null);
        } catch (error) {
            toast.error('Failed to sync dispatch data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [viewType]);

    const handleManualAssign = async (orderId, driverId) => {
        try {
            setAssigningId(orderId);
            setActiveDropdown(null);
            await assignOrder(orderId, driverId);
            toast.success('Rider assigned successfully');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Assignment failed');
        } finally {
            setAssigningId(null);
        }
    };

    const handleAutoAssign = async (orderId) => {
        try {
            setAssigningId(orderId);
            await autoAssignOrder(orderId);
            toast.success('Auto-assigned to nearest rider');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Auto-assign failed');
        } finally {
            setAssigningId(null);
        }
    };

    const handleUnassign = async (orderId) => {
        const result = await Swal.fire({
            title: 'Unassign Rider?',
            text: "This order will be returned to the pending dispatch pool.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Yes, Unassign'
        });

        if (result.isConfirmed) {
            try {
                setAssigningId(orderId);
                await unassignOrder(orderId);
                toast.success('Rider removed from order');
                fetchData();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to unassign');
            } finally {
                setAssigningId(null);
            }
        }
    };

    const toggleDropdown = (id) => {
        if (activeDropdown === id) setActiveDropdown(null);
        else setActiveDropdown(id);
    };

    const trimmedSearchTerm = searchTerm.trim().toLowerCase();

    const filtered = orders.filter(o =>
        (o.orderId || '').toLowerCase().includes(trimmedSearchTerm) ||
        (o.user?.name || '').toLowerCase().includes(trimmedSearchTerm)
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Assign Deliveries</h1>
                    <p className="text-sm text-slate-500 font-medium mt-1">Manage and assign orders to delivery partners.</p>
                </div>
                
                <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white border border-slate-200 p-1 rounded-xl flex items-center shadow-sm">
                        <button
                            onClick={() => setViewType('unassigned')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewType === 'unassigned' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            Pending {viewType === 'unassigned' && <span className="ml-1 bg-white/20 px-1.5 py-0.5 rounded text-[10px]">{filtered.length}</span>}
                        </button>
                        <button
                            onClick={() => setViewType('assigned')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${viewType === 'assigned' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            In-Transit
                        </button>
                    </div>
                    <button 
                        onClick={fetchData} 
                        disabled={loading}
                        className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                        title="Sync Data"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between bg-slate-50/50">
                    <div className="relative w-full md:max-w-md group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find by Order ID or customer..."
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100/50 font-medium shadow-sm transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.trimStart())}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto min-h-[450px]">
                    <table className="w-full text-left">
                        <thead className="bg-white border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Order</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Customer</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Address</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Assign Agent</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <Loader2 size={32} className="animate-spin text-blue-600 mx-auto" />
                                        <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest">Loading deliveries...</p>
                                    </td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-24 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                            <Package size={24} className="text-slate-200" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No Pending Deliveries</p>
                                    </td>
                                </tr>
                            ) : filtered.map((item) => (
                                <tr key={item._id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="font-black text-slate-900 text-sm group-hover:text-blue-600 transition-colors uppercase">#{item.orderId?.slice(-8)}</div>
                                        <div className="mt-1 flex items-center gap-2">
                                            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-md text-[10px] font-black uppercase tracking-widest">VAL: ₹{item.totalAmount.toLocaleString()}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center shrink-0 border border-slate-200 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <User2 size={16} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm truncate max-w-[120px] uppercase">{item.user?.name || 'Guest Type'}</p>
                                                <p className="text-[10px] text-slate-400 font-bold tracking-wider">{item.user?.phone || 'NO SECURE LINK'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-start gap-2.5 text-xs font-bold text-slate-600 max-w-[200px]">
                                            <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                            <span className="line-clamp-2 uppercase">
                                                {item.shippingAddress?.street || 'UNSPECIFIED'}, {item.shippingAddress?.city}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-1.5 text-amber-600 font-black text-[10px] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 uppercase tracking-widest">
                                                <Clock size={12} /> {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border ${item.status === 'out_for_delivery' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                                {item.status.replace(/_/g, ' ')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2.5 items-center">
                                            {viewType === 'unassigned' ? (
                                                <>
                                                    <button
                                                        onClick={() => handleAutoAssign(item._id)}
                                                        disabled={assigningId === item._id}
                                                        className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                                                    >
                                                        <Zap size={14} className="text-amber-400" /> Auto Assign
                                                    </button>
                                                    
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => toggleDropdown(item._id)}
                                                            disabled={assigningId === item._id}
                                                            className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 disabled:opacity-50 ${activeDropdown === item._id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400'}`}
                                                        >
                                                            {assigningId === item._id ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />} Manual
                                                        </button>
 
                                                        {activeDropdown === item._id && (
                                                            <>
                                                                <div className="fixed inset-0 z-10" onClick={() => setActiveDropdown(null)}></div>
                                                                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-[2rem] shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-2">
                                                                    <div className="px-4 py-2 bg-slate-50/50 rounded-t-[1.5rem] border-b border-slate-100 mb-2 flex justify-between items-center">
                                                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Available Drivers</span>
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                                    </div>
                                                                    <div className="max-h-60 overflow-y-auto custom-scrollbar p-1 space-y-1">
                                                                        {drivers.length > 0 ? drivers.map((d) => (
                                                                            <button
                                                                                key={d._id}
                                                                                onClick={() => handleManualAssign(item._id, d._id)}
                                                                                className="w-full text-left p-3 hover:bg-blue-50 rounded-2xl transition-all flex items-center gap-3 group/rider"
                                                                            >
                                                                                <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover/rider:text-blue-600 transition-colors shrink-0 shadow-sm">
                                                                                    <Truck size={16} />
                                                                                </div>
                                                                                <div className="min-w-0">
                                                                                    <p className="font-black text-slate-800 text-[11px] uppercase truncate">{d.name}</p>
                                                                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5 truncate shrink-0">
                                                                                        {d.vehicleType} • {d.phone?.slice(-5)}...
                                                                                    </p>
                                                                                </div>
                                                                            </button>
                                                                        )) : (
                                                                            <div className="py-8 text-center px-4">
                                                                                <UserX size={24} className="mx-auto text-slate-200 mb-2" />
                                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">No Ground Units Online</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={() => handleUnassign(item._id)}
                                                    disabled={assigningId === item._id}
                                                    className="flex items-center gap-2 px-4 py-2 border border-red-100 text-red-500 bg-red-50/50 hover:bg-red-50 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm disabled:opacity-50"
                                                >
                                                    {assigningId === item._id ? <Loader2 size={14} className="animate-spin" /> : <UserX size={14} />} Remove Driver
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default ManagerAssignDeliveries;
