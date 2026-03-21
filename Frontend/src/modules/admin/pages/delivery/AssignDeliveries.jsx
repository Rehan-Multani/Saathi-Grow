import React, { useState, useEffect } from 'react';
import { Badge, Spinner, Modal, Form } from 'react-bootstrap';
import { 
    Clock, 
    MapPin, 
    RefreshCw, 
    Zap, 
    Calendar, 
    Truck, 
    AlertCircle, 
    X, 
    Package, 
    ChevronRight, 
    CheckCircle, 
    Layers, 
    User,
    ClipboardList,
    TrendingUp,
    Search,
    ChevronLeft
} from 'lucide-react';
import {
    getOrdersBySlot,
    createDeliveryRun,
    getAllDeliveryRuns,
    cancelDeliveryRun,
    getAvailablePartners
} from '../../api/adminDeliveryApi';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../components/common/PageInfoTooltip';
import { pageInfoData } from '../../data/pageInfoData';

const AssignDeliveries = () => {
    const { t } = useTranslation();
    // Top-Level State
    const [viewType, setViewType] = useState('slots'); // 'slots' or 'runs'
    const [loading, setLoading] = useState(true);

    // Slots View State
    const [slotData, setSlotData] = useState({ immediate: { orders: [], count: 0 }, slots: [] });
    const [selectedOrders, setSelectedOrders] = useState([]); // Array of order IDs
    const [currentSlotContext, setCurrentSlotContext] = useState(null); // Which slot are we selecting from?

    // Runs View State
    const [activeRuns, setActiveRuns] = useState([]);

    // Assignment Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [availableDrivers, setAvailableDrivers] = useState([]);
    const [loadingDrivers, setLoadingDrivers] = useState(false);
    const [assigningLoading, setAssigningLoading] = useState(false);
    const [optimizeRoute, setOptimizeRoute] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = async () => {
        try {
            setLoading(true);
            if (viewType === 'slots') {
                const data = await getOrdersBySlot();
                setSlotData(data || { immediate: { orders: [], count: 0 }, slots: [] });
                setSelectedOrders([]); // Clear selection on refresh
                setCurrentSlotContext(null);
            } else {
                const data = await getAllDeliveryRuns();
                setActiveRuns(data || []);
            }
        } catch (error) {
            toast.error(t('delivery.assign_deliveries.alerts.sync_error'));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewType]);

    // Handle Checkbox Selection
    const handleSelectOrder = (orderId, slotContextId) => {
        if (currentSlotContext && currentSlotContext !== slotContextId && selectedOrders.length > 0) {
            toast.warning(t('delivery.assign_deliveries.alerts.batch_limit'));
            return;
        }

        setCurrentSlotContext(slotContextId);
        setSelectedOrders(prev => {
            if (prev.includes(orderId)) {
                const newSelection = prev.filter(id => id !== orderId);
                if (newSelection.length === 0) setCurrentSlotContext(null);
                return newSelection;
            }
            return [...prev, orderId];
        });
    };

    const handleSelectAllInSlot = (slotGroup, slotContextId) => {
        if (currentSlotContext && currentSlotContext !== slotContextId && selectedOrders.length > 0) {
            toast.warning(t('delivery.assign_deliveries.alerts.batch_limit'));
            return;
        }

        const orderIds = slotGroup.orders.map(o => o._id);
        const allSelected = orderIds.every(id => selectedOrders.includes(id));

        if (allSelected) {
            setSelectedOrders(prev => {
                const newSelection = prev.filter(id => !orderIds.includes(id));
                if (newSelection.length === 0) setCurrentSlotContext(null);
                return newSelection;
            });
        } else {
            setCurrentSlotContext(slotContextId);
            setSelectedOrders(prev => [...new Set([...prev, ...orderIds])]);
        }
    };

    const handleOpenAssignModal = async () => {
        if (selectedOrders.length === 0) {
            toast.error(t('delivery.assign_deliveries.alerts.no_select'));
            return;
        }
        setShowAssignModal(true);
        setLoadingDrivers(true);
        try {
            const drivers = await getAvailablePartners();
            setAvailableDrivers(drivers);
        } catch (error) {
            toast.error(t('delivery.assign_deliveries.alerts.load_drivers_error'));
        } finally {
            setLoadingDrivers(false);
        }
    };

    const handleConfirmAssignment = async (driverId) => {
        try {
            setAssigningLoading(true);
            const payload = {
                partnerId: driverId,
                slotId: (currentSlotContext === 'immediate' || !currentSlotContext) ? null : currentSlotContext,
                slotDate: new Date().toISOString(),
                orderIds: selectedOrders,
                optimizeRoute: optimizeRoute
            };

            await createDeliveryRun(payload);
            toast.success(t('delivery.assign_deliveries.alerts.batch_success', { count: selectedOrders.length }));
            setShowAssignModal(false);
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || t('delivery.assign_deliveries.alerts.batch_error'));
        } finally {
            setAssigningLoading(false);
        }
    };

    const handleCancelRun = async (runId) => {
        const result = await Swal.fire({
            title: t('delivery.assign_deliveries.alerts.cancel_confirm_title'),
            text: t('delivery.assign_deliveries.alerts.cancel_confirm_text'),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#64748b',
            confirmButtonText: t('delivery.assign_deliveries.alerts.cancel_btn')
        });

        if (result.isConfirmed) {
            try {
                await cancelDeliveryRun(runId);
                toast.success(t('delivery.assign_deliveries.alerts.cancel_success'));
                fetchData();
            } catch (error) {
                toast.error(error.response?.data?.message || t('delivery.assign_deliveries.alerts.cancel_error'));
            }
        }
    };

    return (
        <div className="p-4 p-md-6 bg-slate-50/50 min-vh-100">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="d-flex align-items-center gap-2">
                        <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3 mb-0">
                            <Layers size={28} className="text-indigo-600" />
                            {t('delivery.assign_deliveries.title')}
                        </h1>
                        <PageInfoTooltip info={pageInfoData.assignDeliveries} />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">{t('delivery.assign_deliveries.subtitle')}</p>
                </div>

                <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setViewType('slots')}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            viewType === 'slots' 
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        {t('delivery.assign_deliveries.view_slots')}
                    </button>
                    <button
                        onClick={() => setViewType('runs')}
                        className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                            viewType === 'runs' 
                            ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
                            : 'text-slate-500 hover:bg-slate-50'
                        }`}
                    >
                        {t('delivery.assign_deliveries.view_runs')}
                    </button>
                    <div className="w-px h-6 bg-slate-200 mx-1"></div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-2 text-slate-500 hover:text-indigo-600 transition-colors"
                    >
                        <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                <div className="relative group flex-1 max-w-md hidden md:block">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder={t('delivery.assign_deliveries.search_placeholder')} 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 pl-12 pr-4 py-2.5 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-sm"
                    />
                </div>
            </div>

            {/* Quick Stats (Only for background context) */}
            {viewType === 'slots' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: t('delivery.assign_deliveries.stats.unassigned'), value: slotData.immediate.count + slotData.slots.reduce((acc, s) => acc + s.count, 0), icon: <Package />, color: 'amber' },
                        { label: t('delivery.assign_deliveries.stats.immediate'), value: slotData.immediate.count, icon: <Zap />, color: 'rose' },
                        { label: t('delivery.assign_deliveries.stats.scheduled'), value: slotData.slots.reduce((acc, s) => acc + s.count, 0), icon: <Calendar />, color: 'indigo' },
                        { label: t('delivery.assign_deliveries.stats.active_runs'), value: activeRuns.length || '...', icon: <Truck />, color: 'emerald' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center shadow-inner`}>
                                {stat.icon}
                            </div>
                            <div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{stat.label}</span>
                                <span className="text-2xl font-black text-slate-800 tracking-tighter">{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        <Layers size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" />
                    </div>
                    <p className="mt-6 text-sm font-bold text-slate-400 uppercase tracking-[0.2em] animate-pulse">{t('delivery.assign_deliveries.syncing')}</p>
                </div>
            ) : viewType === 'slots' ? (
                <div className="space-y-8">
                    {/* Render Groups */}
                    {[
                        { title: t('delivery.assign_deliveries.slot_groups.immediate'), data: slotData.immediate, id: 'immediate', icon: <Zap size={20} className="text-amber-500" /> },
                        ...slotData.slots.map(s => ({
                            title: `${s.slot.label} (${s.slot.startTime} - ${s.slot.endTime})`,
                            data: s,
                            id: s.slot._id,
                            icon: <Clock size={20} className="text-indigo-500" />
                        }))
                    ].map((group) => group.data.orders.length > 0 && (
                        <div key={group.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-100 flex items-center justify-center">
                                        {group.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-800 tracking-tight">{group.title}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Badge bg="indigo" className="bg-indigo-50 text-indigo-600 border border-indigo-100 fw-black uppercase tracking-tighter" style={{ fontSize: '9px' }}>
                                                {t('delivery.assign_deliveries.slot_groups.pending_orders', { count: group.data.count })}
                                            </Badge>
                                            {currentSlotContext === group.id && selectedOrders.length > 0 && (
                                                <Badge bg="emerald" className="bg-emerald-50 text-emerald-600 border border-emerald-100 fw-black uppercase tracking-tighter" style={{ fontSize: '9px' }}>
                                                    {t('delivery.assign_deliveries.slot_groups.selected_count', { count: selectedOrders.length })}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleSelectAllInSlot(group.data, group.id)}
                                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
                                    >
                                        {group.data.orders.every(o => selectedOrders.includes(o._id)) 
                                            ? t('delivery.assign_deliveries.slot_groups.deselect_all') 
                                            : t('delivery.assign_deliveries.slot_groups.select_all')}
                                    </button>
                                    {currentSlotContext === group.id && selectedOrders.length > 0 && (
                                        <button
                                            onClick={handleOpenAssignModal}
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-95 flex items-center gap-2"
                                        >
                                            <Truck size={14} />
                                            {t('delivery.assign_deliveries.slot_groups.batch_assign')}
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50/60 text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                            <th className="px-8 py-4 w-12 text-center">{t('delivery.assign_deliveries.table.ref')}</th>
                                            <th className="px-6 py-4">{t('delivery.assign_deliveries.table.order_details')}</th>
                                            <th className="px-6 py-4">{t('delivery.assign_deliveries.table.customer_info')}</th>
                                            <th className="px-6 py-4">{t('delivery.assign_deliveries.table.delivery_node')}</th>
                                            <th className="px-8 py-4 text-right">{t('delivery.assign_deliveries.table.valuation')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50/80">
                                        {group.data.orders
                                            .filter(order => {
                                                const q = searchQuery.toLowerCase();
                                                return !searchQuery || 
                                                    order.orderId?.toLowerCase().includes(q) || 
                                                    order.user?.name?.toLowerCase().includes(q) || 
                                                    order.user?.phone?.includes(q);
                                            })
                                            .map(order => {
                                                const isSelected = selectedOrders.includes(order._id);
                                                const isDisabled = currentSlotContext && currentSlotContext !== group.id && selectedOrders.length > 0;
                                                
                                                return (
                                                    <tr 
                                                        key={order._id} 
                                                        className={`hover:bg-slate-50 transition-colors group cursor-pointer ${isSelected ? 'bg-indigo-50/40' : ''} ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                                                        onClick={() => !isDisabled && handleSelectOrder(order._id, group.id)}
                                                    >
                                                        <td className="px-8 py-5 text-center">
                                                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                                                isSelected ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'border-slate-200 bg-white'
                                                            }`}>
                                                                {isSelected && <CheckCircle size={14} strokeWidth={4} />}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-black text-slate-800 tracking-tight">#{order.orderId}</span>
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    <div className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${
                                                                        order.paymentMethod === 'online' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                                                                    }`}>
                                                                        {order.paymentMethod === 'online' ? t('delivery.assign_deliveries.table.paid') : t('delivery.assign_deliveries.table.cod')}
                                                                    </div>
                                                                    <span className="text-[10px] font-bold text-slate-400 capitalize">{order.status.replace('_', ' ')}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex flex-col">
                                                                <span className="text-sm font-bold text-slate-700">{order.user?.name || 'Saathi User'}</span>
                                                                <span className="text-xs font-medium text-slate-400">{order.user?.phone}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-5">
                                                            <div className="flex items-start gap-2 max-w-[300px]">
                                                                <MapPin size={14} className="text-slate-300 mt-0.5 shrink-0" />
                                                                <span className="text-xs font-semibold text-slate-500 line-clamp-2">
                                                                    {order.shippingAddress?.street}, {order.shippingAddress?.city}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <span className="text-base font-black text-slate-800 tracking-tighter">₹{order.totalAmount}</span>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}

                    {/* All Caught Up state */}
                    {(!slotData.immediate.orders.length && slotData.slots.every(s => s.orders.length === 0)) && (
                        <div className="bg-white rounded-[3rem] p-16 text-center shadow-sm border border-slate-100">
                            <div className="w-24 h-24 rounded-[2rem] bg-emerald-50 text-emerald-500 flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <CheckCircle size={48} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">{t('delivery.assign_deliveries.empty_state.title')}</h2>
                            <p className="text-slate-500 font-medium max-w-sm mx-auto">{t('delivery.assign_deliveries.empty_state.text')}</p>
                            <button onClick={fetchData} className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:-translate-y-1 transition-all active:scale-95">
                                {t('delivery.assign_deliveries.empty_state.refresh_btn')}
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                /* --- ACTIVE RUNS VIEW --- */
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/70 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100">
                                    <th className="px-8 py-5">{t('delivery.assign_deliveries.active_runs_table.run_identity')}</th>
                                    <th className="px-8 py-5">{t('delivery.assign_deliveries.active_runs_table.rider')}</th>
                                    <th className="px-8 py-5">{t('delivery.assign_deliveries.active_runs_table.workflow')}</th>
                                    <th className="px-8 py-5">{t('delivery.assign_deliveries.active_runs_table.progress')}</th>
                                    <th className="px-8 py-5 text-right">{t('delivery.assign_deliveries.active_runs_table.action')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50/80">
                                {activeRuns.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center py-24">
                                            <div className="max-w-xs mx-auto opacity-40 grayscale">
                                                <ClipboardList size={64} className="mx-auto mb-4 text-slate-300" />
                                                <h4 className="font-black text-slate-800 uppercase tracking-widest text-sm mb-2">{t('delivery.assign_deliveries.active_runs_table.no_missions')}</h4>
                                                <p className="text-xs font-medium text-slate-500 italic">{t('delivery.assign_deliveries.active_runs_table.no_missions_text')}</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : activeRuns.map(run => {
                                    const { total, delivered, failed, pending } = run.summary;
                                    const isComplete = ['completed', 'partial_complete'].includes(run.status);
                                    const progress = total > 0 ? (delivered / total) * 100 : 0;

                                    return (
                                        <tr key={run._id} className={`hover:bg-slate-50 transition-all ${isComplete ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-indigo-700 tracking-tight uppercase">{run.runId}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                                                            run.status === 'assigned' ? 'bg-amber-500' : 'bg-emerald-500'
                                                        }`}></div>
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                                                            {run.status.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm overflow-hidden shrink-0">
                                                        {run.deliveryPartner?.profileImage ? (
                                                            <img src={run.deliveryPartner.profileImage} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-400 font-black text-xs uppercase">
                                                                {run.deliveryPartner?.name?.charAt(0)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-800 tracking-tight">{run.deliveryPartner?.name || 'Rider ID Unk'}</span>
                                                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                            <TrendingUp size={10} className="text-emerald-500" />
                                                            {t('delivery.assign_deliveries.active_runs_table.rider_specialist', { type: run.deliveryPartner?.vehicleType || 'Bike' })}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                {run.isImmediate ? (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-50 rounded-full border border-amber-100">
                                                        <Zap size={12} className="text-amber-500" />
                                                        <span className="text-[10px] font-black text-amber-700 uppercase tracking-tighter">{t('delivery.assign_deliveries.active_runs_table.priority_asap')}</span>
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 rounded-full border border-indigo-100">
                                                        <Calendar size={12} className="text-indigo-500" />
                                                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-tighter">
                                                            {run.deliverySlot?.label || 'Scheduled'}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex gap-2">
                                                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded uppercase">{delivered} OK</span>
                                                        {failed > 0 && <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded uppercase">{failed} ERR</span>}
                                                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded uppercase">{pending} GO</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-800 tracking-tighter">{Math.round(progress)}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                                                    <div className="bg-emerald-500 h-full transition-all" style={{ width: `${progress}%` }}></div>
                                                    <div className="bg-rose-500 h-full transition-all" style={{ width: `${(failed / total) * 100}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                {!isComplete && run.status !== 'cancelled' && (
                                                    <button 
                                                        onClick={() => handleCancelRun(run._id)}
                                                        className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                        title="Abort Mission"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Create Batch Modal */}
            <Modal 
                show={showAssignModal} 
                onHide={() => !assigningLoading && setShowAssignModal(false)} 
                centered 
                backdrop="static"
                contentClassName="border-0 shadow-2xl rounded-[2.5rem] overflow-hidden"
            >
                <div className="bg-white p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tight">{t('delivery.assign_deliveries.modal.title')}</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{t('delivery.assign_deliveries.modal.subtitle')}</p>
                        </div>
                        <button 
                            onClick={() => !assigningLoading && setShowAssignModal(false)}
                            className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-800 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl transition-transform duration-700 group-hover:scale-150"></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 block mb-1">{t('delivery.assign_deliveries.modal.payload_size')}</span>
                            <div className="flex items-end gap-1">
                                <h4 className="text-4xl font-black tracking-tighter m-0">{selectedOrders.length}</h4>
                                <span className="text-xs font-bold mb-1 opacity-80 uppercase tracking-tighter">{t('delivery.assign_deliveries.modal.orders_count')}</span>
                            </div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl shadow-slate-900/20">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-50 block mb-1">{t('delivery.assign_deliveries.modal.target_slot')}</span>
                            <h6 className="text-xs font-black uppercase tracking-widest m-0 flex items-center gap-2 mt-2">
                                {currentSlotContext === 'immediate' ? <Zap size={14} className="text-amber-400" /> : <Clock size={14} className="text-indigo-400" />}
                                {currentSlotContext === 'immediate' ? t('delivery.assign_deliveries.modal.priority') : t('delivery.assign_deliveries.modal.scheduled')}
                            </h6>
                        </div>
                    </div>

                    <div className="mb-8">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">{t('delivery.assign_deliveries.modal.configuration')}</label>
                        <div 
                            className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                                optimizeRoute ? 'bg-emerald-50 border-emerald-500 shadow-md shadow-emerald-500/10' : 'bg-slate-50 border-slate-100'
                            }`}
                            onClick={() => setOptimizeRoute(!optimizeRoute)}
                        >
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${
                                    optimizeRoute ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400'
                                }`}>
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <span className="text-sm font-black text-slate-800 block">{t('delivery.assign_deliveries.modal.route_optimization')}</span>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{t('delivery.assign_deliveries.modal.beta_version')}</span>
                                </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                optimizeRoute ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200'
                            }`}>
                                {optimizeRoute && <CheckCircle size={14} strokeWidth={4} />}
                            </div>
                        </div>
                    </div>

                    <h6 className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4 flex items-center gap-2">
                        <Truck size={14} /> {t('delivery.assign_deliveries.modal.availability_title')}
                    </h6>

                    {loadingDrivers ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Spinner animation="grow" variant="indigo" size="sm" />
                            <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('delivery.assign_deliveries.modal.scanning_riders')}</p>
                        </div>
                    ) : availableDrivers.length === 0 ? (
                        <div className="p-8 text-center bg-slate-50 rounded-[2rem] border border-slate-100">
                            <AlertCircle size={32} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-relaxed">{t('delivery.assign_deliveries.modal.no_riders')}</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {availableDrivers.map(driver => (
                                <div
                                    key={driver._id}
                                    className="group p-4 bg-white border border-slate-100 rounded-[1.5rem] hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-600/10 transition-all cursor-pointer flex items-center justify-between"
                                    onClick={() => handleConfirmAssignment(driver._id)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 font-black flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors uppercase shadow-inner">
                                            {driver.name.charAt(0)}
                                        </div>
                                        <div>
                                            <span className="text-sm font-black text-slate-800 block group-hover:text-indigo-600 transition-colors">{driver.name}</span>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <Badge bg="slate" className="bg-slate-100 text-slate-500 font-black tracking-widest uppercase" style={{ fontSize: '8px' }}>
                                                    {driver.vehicleType}
                                                </Badge>
                                                <span className="text-[10px] font-bold text-slate-400">{driver.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <button 
                                        className="h-10 px-5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all shadow-lg shadow-slate-900/10 translate-x-4 group-hover:translate-x-0"
                                        disabled={assigningLoading}
                                    >
                                        {assigningLoading ? t('delivery.assign_deliveries.modal.syncing') : t('delivery.assign_deliveries.modal.dispatch')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default AssignDeliveries;
