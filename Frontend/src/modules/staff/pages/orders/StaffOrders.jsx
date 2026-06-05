import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, Box, Truck, CheckCircle, RefreshCcw, ChevronLeft, ChevronRight, Package, Calendar, User, MoreHorizontal, XCircle, Inbox } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import OrderDetailsModal from '../../../../common/components/orders/OrderDetailsModal';
import { getAllOrdersAdmin, updateOrderStatus } from '../../../../common/api/orderApi';
import { useStaffAuth } from '../../context/StaffAuthContext';

const StaffOrders = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const initialStatus = queryParams.get('status');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState(initialStatus || 'All');
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [showStatusDropdown, setShowStatusDropdown] = useState(false);
    const [activeRow, setActiveRow] = useState(null);
    const itemsPerPage = 10;

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const data = await getAllOrdersAdmin({ limit: 1000 });
            setOrders(data.orders || []);
        } catch (error) {
            console.error('Failed to load orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrders(); }, []);
    useEffect(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await updateOrderStatus(id, newStatus);
            fetchOrders();
            setActiveRow(null);
        } catch (error) {
            Swal.fire({ title: 'Error', text: 'Update failed', icon: 'error', customClass: { popup: 'rounded-[1.5rem]' } });
        }
    };

    const handleViewOrder = (order) => {
        setSelectedOrder(order);
        setShowModal(true);
    };

    const filteredOrders = orders.filter(order => {
        const orderId = order.orderId || order._id;
        const customerName = order.user?.name || 'Guest';
        const query = searchTerm.trim().toLowerCase();
        const matchesSearch =
            orderId.toLowerCase().includes(query) ||
            customerName.toLowerCase().includes(query);
        const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
    const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'confirmed': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'preparing': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'ready_for_pickup': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'out_for_delivery': return 'bg-sky-50 text-sky-600 border-sky-100';
            case 'delivered': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-slate-50 text-slate-500 border-slate-100';
        }
    };

    const formatStatusName = (status) => {
        if (status === 'preparing') return 'Packing';
        if (status === 'ready_for_pickup') return 'Ready';
        if (status === 'out_for_delivery') return 'Transit';
        return status.replace(/_/g, ' ');
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 overflow-x-hidden text-left">
            <OrderDetailsModal show={showModal} onHide={() => setShowModal(false)} order={selectedOrder} />
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 text-left px-1">
                <div className="space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic font-black leading-none text-left">Order Feed</h1>
                    <div className="flex items-center gap-3 font-black text-left">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100 italic font-black text-left">
                            <Box size={12} className="animate-pulse" /> Live Tracking
                        </div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5 font-black text-left">{filteredOrders.length} active orders</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                   <button onClick={fetchOrders} className="w-12 h-12 bg-white border border-slate-200 text-slate-400 hover:text-blue-600 rounded-2xl flex items-center justify-center transition-all shadow-sm active:scale-95 shrink-0 font-black">
                        <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <div className="relative group/search flex-1 md:w-80 text-left">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within/search:text-blue-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find ID or user..."
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 pl-14 pr-6 text-sm font-bold text-slate-700 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 placeholder:text-slate-300 transition-all shadow-sm font-black lowercase tracking-widest text-left"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value.trimStart())}
                        />
                    </div>
                    <div className="relative">
                        <button 
                            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border shadow-sm shrink-0 font-black ${statusFilter !== 'All' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20' : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'}`}
                        >
                            <Filter size={18} />
                        </button>
                        {showStatusDropdown && (
                            <>
                                <div className="fixed inset-0 z-[60]" onClick={() => setShowStatusDropdown(false)}></div>
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-[2rem] shadow-2xl border border-slate-100 z-[70] p-4 animate-in fade-in zoom-in-95 duration-200 origin-top-right text-left">
                                    <h3 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest italic leading-none font-black text-left">Status Map</h3>
                                    <div className="grid grid-cols-1 gap-1">
                                        {['All', 'pending', 'confirmed', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'delivered', 'cancelled'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => { setStatusFilter(status); setShowStatusDropdown(false); }}
                                                className={`w-full text-left px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic leading-none font-black ${statusFilter === status ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
                                            >
                                                {formatStatusName(status)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden min-h-[600px] flex flex-col group p-4 lg:p-6 text-left">
                <div className="overflow-x-auto custom-scrollbar flex-1">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left font-black">Order Info</th>
                                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-left font-black">User</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 font-black">Amount</th>
                                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 font-black">Stage</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 font-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 border-0">
                            {loading && orders.length === 0 ? (
                                Array( 10 ).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-8 py-6"><div className="h-14 bg-slate-50 rounded-2xl w-full"></div></td>
                                    </tr>
                                ))
                            ) : paginatedOrders.length > 0 ? (
                                paginatedOrders.map((order) => (
                                    <tr key={order._id} className="group/row hover:bg-blue-50/20 transition-all duration-300">
                                        <td className="px-8 py-5 text-left border-0">
                                            <div className="flex items-center gap-4 text-left">
                                                <div className="w-12 h-12 bg-slate-950 text-white rounded-xl flex items-center justify-center font-black text-xs shadow-xl group-hover/row:scale-110 group-hover/row:bg-blue-600 transition-all duration-500 shrink-0 italic">
                                                   {order.orderId?.slice(-3).toUpperCase() || 'ORD'}
                                                </div>
                                                <div className="text-left font-black">
                                                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono italic font-black leading-none text-left">Ref: #{order.orderId || order._id}</div>
                                                   <div className="flex items-center gap-1.5 mt-2.5 font-black text-left leading-none font-black italic">
                                                      <Package size={12} className="text-blue-500 shrink-0" />
                                                      <span className="text-[9px] font-black text-slate-500 uppercase italic font-black">{order.items?.length || 0} Assets</span>
                                                      <span className="text-[8px] font-black text-slate-400 bg-slate-100 px-1 py-0.5 rounded ml-2 uppercase italic">
                                                          {order.paymentMethod === 'cod' ? 'COD' : 'ONLINE'}
                                                      </span>
                                                   </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-left border-0">
                                            <div className="flex items-center gap-4 text-left">
                                               <div className="text-left font-black">
                                                  <div className="text-[12px] font-black text-slate-900 uppercase group-hover/row:text-blue-600 transition-colors italic font-black leading-none text-left">{order.user?.name || 'Guest User'}</div>
                                                  <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-2.5 leading-none italic font-black text-left">
                                                     <Calendar size={11} className="shrink-0" /> {new Date(order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                  </div>
                                               </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-center border-0">
                                            <span className="text-sm font-black text-slate-900 italic font-black tracking-tight leading-none">₹{order.totalAmount?.toLocaleString()}</span>
                                        </td>
                                        <td className="px-8 py-5 text-center border-0">
                                            <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border transition-all shadow-sm italic font-black leading-none inline-block ${getStatusStyle(order.status)}`}>
                                                {formatStatusName(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right border-0 relative">
                                            <div className="flex justify-end gap-2 text-left">
                                                <button 
                                                    onClick={() => handleViewOrder(order)}
                                                    className="w-10 h-10 rounded-xl bg-white text-slate-400 hover:text-blue-600 border border-slate-200 flex items-center justify-center transition-all shadow-sm active:scale-95 group/btn shrink-0 font-black"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                
                                                <div className="relative shrink-0">
                                                    <button 
                                                        onClick={() => setActiveRow(activeRow === order._id ? null : order._id)}
                                                        className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all shadow-sm active:scale-95 font-black ${activeRow === order._id ? 'bg-slate-950 text-white border-slate-950 shadow-xl shadow-slate-950/20 font-black' : 'bg-white text-slate-400 border border-slate-200 hover:text-slate-950'}`}
                                                    >
                                                        <MoreHorizontal size={18} />
                                                    </button>
                                                    
                                                    {activeRow === order._id && (
                                                        <>
                                                            <div className="fixed inset-0 z-50 px-1" onClick={() => setActiveRow(null)}></div>
                                                            <div className="absolute right-0 top-full mt-3 w-48 bg-white border border-slate-100 rounded-[1.5rem] shadow-3xl p-3 z-50 animate-in fade-in zoom-in-95 duration-200 text-left">
                                                                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-left px-3 py-2 border-b border-slate-50 mb-2 italic leading-none font-black text-left">Actions</h3>
                                                                <div className="grid grid-cols-1 gap-1">
                                                                    {['pending', 'confirmed'].includes(order.status) && (
                                                                        <button onClick={() => handleStatusUpdate(order._id, 'preparing')} className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase text-blue-600 hover:bg-blue-50 transition-all flex items-center gap-3 italic font-black">
                                                                            <RefreshCcw size={14} className="animate-spin-slow" /> Pack
                                                                        </button>
                                                                    )}
                                                                    {order.status === 'preparing' && (
                                                                        <button onClick={() => handleStatusUpdate(order._id, 'ready_for_pickup')} className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase text-emerald-600 hover:bg-emerald-50 transition-all flex items-center gap-3 italic font-black">
                                                                            <CheckCircle size={14} /> Complete
                                                                        </button>
                                                                    )}
                                                                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                                                                         <button onClick={() => handleStatusUpdate(order._id, 'cancelled')} className="w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase text-red-500 hover:bg-red-50 transition-all flex items-center gap-3 italic font-black text-left">
                                                                            <XCircle size={14} /> Void
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-32 text-center border-0">
                                        <div className="flex flex-col items-center justify-center text-center mx-auto">
                                            <div className="w-24 h-24 bg-slate-50 text-slate-100 rounded-[3rem] flex items-center justify-center mb-6 border border-slate-100 shadow-inner">
                                                <Inbox size={40} strokeWidth={1.5} />
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 italic font-black">No Orders In Feed</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="px-8 py-8 border-t border-slate-50 bg-slate-50/10 flex flex-col sm:flex-row justify-between items-center gap-6">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap italic font-black text-left">
                            Showing <span className="text-slate-900 font-black">{(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, filteredOrders.length)}</span> of {filteredOrders.length} active
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-5 py-3 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-20 shadow-sm shrink-0 italic font-black"
                            >
                                Prev
                            </button>
                            <div className="flex items-center gap-1.5 mx-2 shrink-0">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                                    <button
                                        key={p}
                                        onClick={() => setCurrentPage(p)}
                                        className={`min-w-[40px] h-10 rounded-xl text-[11px] font-black transition-all shadow-sm font-black ${currentPage === p ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-200'}`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="px-5 py-3 flex items-center justify-center bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all disabled:opacity-20 shadow-sm shrink-0 italic font-black"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
                .animate-spin-slow { animation: spin 3s linear infinite; }
            `}} />
        </div>
    );
};

export default StaffOrders;
