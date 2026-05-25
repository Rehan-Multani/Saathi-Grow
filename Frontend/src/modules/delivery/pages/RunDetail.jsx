import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDeliveryDetail } from '../services/deliveryService';
import useDeliveryStore from '../store/deliveryStore';
import { 
    ChevronLeft, Loader2, Package, MapPin, 
    CheckCircle2, AlertCircle, Phone, Truck, ArrowRight
} from 'lucide-react';

const RunDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useDeliveryStore();
    const [run, setRun] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            if (!token || !id) return;
            try {
                const data = await getDeliveryDetail(token, id);
                setRun(data);
            } catch (error) {
                console.error("Failed to load run details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetail();
    }, [id, token]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <Loader2 className="animate-spin text-[#028A0F] mb-4" size={40} />
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Loading Mission Protocol...</p>
            </div>
        );
    }

    if (!run) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <AlertCircle className="text-red-500 mb-4" size={40} />
                <p className="font-bold">Mission details not found.</p>
                <button 
                    onClick={() => navigate('/delivery/orders')}
                    className="mt-4 px-6 py-2 bg-slate-100 rounded-xl font-bold"
                >
                    Back to Orders
                </button>
            </div>
        );
    }

    const isReturn = run.runType === 'return';
    const activeStopsCount = run.orders?.filter(o => 
        isReturn ? ['pending', 'out_for_delivery'].includes(o.status) : ['pending', 'out_for_delivery'].includes(o.status)
    ).length || 0;

    return (
        <div className="space-y-4 md:space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => navigate(-1)} 
                    className="p-3 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 rounded-2xl text-slate-400 hover:text-[#028A0F] transition-all shadow-sm"
                >
                    <ChevronLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                        {isReturn ? 'Reverse Logistics' : 'Dispatch Batch'}
                    </h1>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-0.5">
                        Mission ID: {run.orders?.[0]?.order?.orderId ? `#${run.orders[0].order.orderId}` : run.runId}
                    </p>
                </div>
            </div>

            {/* General Info Card */}
            <div className="bg-white dark:bg-zinc-900 rounded-[2rem] p-6 border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Truck size={120} />
                </div>
                <div className="relative z-10 flex flex-col md:flex-row gap-6 md:items-end justify-between">
                    <div>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4
                            ${run.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              run.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                              'bg-amber-100 text-amber-700'}`
                        }>
                            {run.status.replace('_', ' ')}
                        </div>
                        <h2 className="text-3xl font-black mb-1">
                            {activeStopsCount} <span className="text-slate-400 text-xl font-bold">Task</span>
                        </h2>
                        <p className="text-sm font-medium text-slate-500 flex items-center gap-1">
                            <MapPin size={14} className="text-[#028A0F]" />
                            {isReturn ? 'Return to HQ/Vendor' : 'Delivery from Branch/Vendor'}
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => navigate(`/delivery/tracking/${run._id}`)}
                        className="w-full md:w-auto px-8 py-4 bg-[#028A0F] text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-[#028A0F]/20 flex items-center justify-center gap-2 hover:bg-[#037A0D] transition-colors active:scale-95"
                    >
                        <MapPin size={16} />
                        View Live Map
                    </button>
                </div>
            </div>

            <h3 className="font-black text-lg tracking-tight mt-8 mb-4 px-2 uppercase text-slate-400 text-[11px] tracking-[0.2em]">
                {isReturn ? 'Pickup Tasks' : 'Delivery Tasks'}
            </h3>

            {/* Stops Details */}
            <div className="space-y-4">
                {run.orders?.map((stop, i) => {
                    const order = stop.order;
                    const isDone = isReturn ? stop.status === 'picked_up' : stop.status === 'delivered';
                    const items = isReturn ? order?.returnRequest?.items : order?.items;

                    return (
                        <div key={stop._id} className="bg-white dark:bg-zinc-900 rounded-3xl border border-slate-100 dark:border-zinc-800 p-5 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-5 mb-5 border-b border-slate-50 dark:border-zinc-800/50 pb-5">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-[1rem] flex items-center justify-center
                                        ${isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`
                                    }>
                                        {isDone ? <CheckCircle2 size={24} /> : <span className="font-black text-lg">{i + 1}</span>}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg text-slate-800 dark:text-zinc-100">
                                            {order?.user?.name || 'Customer'}
                                        </h4>
                                        <a href={`tel:${order?.user?.phone}`} className="text-xs font-bold text-[#028A0F] flex items-center gap-1 mt-0.5">
                                            <Phone size={12} /> {order?.user?.phone || 'N/A'}
                                        </a>
                                    </div>
                                </div>
                                <div className="ml-0 md:ml-auto text-left md:text-right">
                                    <p className="font-black text-lg text-slate-800 dark:text-zinc-100">₹{order?.totalAmount}</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">
                                        {order?.paymentMethod} • {stop.status.replace('_', ' ')}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-start gap-2 text-slate-500 mb-5 pb-5 border-b border-slate-50 dark:border-zinc-800/50">
                                <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
                                <p className="text-sm font-medium leading-relaxed">
                                    {order?.shippingAddress?.street}, {order?.shippingAddress?.city}, {order?.shippingAddress?.state} {order?.shippingAddress?.zipCode}
                                </p>
                            </div>

                            <div className="pl-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-[#028A0F] mb-3 flex items-center gap-2">
                                    <Package size={12} />
                                    {isReturn ? 'Items to Pickup' : 'Items to Deliver'}
                                </p>
                                <div className="space-y-3">
                                    {items && items.length > 0 ? items.map((item, idx) => (
                                        <div key={idx} className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 overflow-hidden border border-slate-100">
                                                <img 
                                                    src={item.image || item.product?.images?.[0] || item.product?.image || 'https://via.placeholder.com/100'} 
                                                    alt={item.name || item.product?.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-slate-700 dark:text-zinc-300">
                                                    {item.quantity}x {item.name || item.product?.name || 'Product'}
                                                </p>
                                                {isReturn && item.returnReason && (
                                                    <p className="text-[10px] text-red-500 font-bold uppercase tracking-wider mt-0.5">
                                                        Reason: {item.returnReason}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-sm font-medium text-slate-400">Items details not available.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RunDetail;
