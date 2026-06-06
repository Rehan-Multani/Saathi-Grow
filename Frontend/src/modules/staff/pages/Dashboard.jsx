import React, { useState, useEffect } from 'react';
import { useStaffAuth } from '../context/StaffAuthContext';
import { getDashboardStats } from '../../../common/api/adminApi';
import {
    ShoppingCart,
    Package,
    Clock,
    TrendingUp,
    ArrowRight,
    CheckCircle2,
    Zap,
    AlertCircle,
    Users,
    Briefcase,
    Store,
    LayoutDashboard,
    ChevronRight,
    Search,
    QrCode,
    LifeBuoy,
    MessageSquare,
    Activity,
    Inbox,
    Target
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
    const { staffUser } = useStaffAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const hasAccess = (permissionCode) => {
        if (!staffUser) return false;
        if (staffUser.role === 'Store Manager') return true;
        return Array.isArray(staffUser.permissions) && staffUser.permissions.includes(permissionCode);
    };

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats(staffUser?.token);
                if (data.success) setStats(data);
            } catch (error) {
                console.error('Stats load failed:', error);
            } finally {
                setLoading(false);
            }
        };
        if (staffUser?.token) fetchStats();
    }, [staffUser?.token]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 animate-in fade-in duration-500">
                <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center border border-blue-100">
                    <Zap size={24} className="text-blue-500 animate-pulse" />
                </div>
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] italic font-black">Syncing Hub Data...</p>
            </div>
        );
    }

    const { stats: apiStats, recentOrders: apiOrders } = stats || {};

    const summaryStats = [
        {
            label: 'Recent Sales',
            value: apiStats?.totalOrders,
            icon: ShoppingCart,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            path: '/staff/orders/active',
            show: hasAccess('VIEW_ORDERS')
        },
        {
            label: 'Order Queue',
            value: apiStats?.pendingOrders,
            icon: Clock,
            color: 'text-amber-600',
            bgColor: 'bg-amber-50',
            path: '/staff/orders/active?status=pending',
            show: hasAccess('VIEW_ORDERS')
        },
        {
            label: 'Cash Flow',
            value: apiStats?.totalRevenue !== null ? `₹${apiStats.totalRevenue?.toLocaleString()}` : null,
            icon: TrendingUp,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50',
            path: '/staff/pos-billing',
            show: hasAccess('MANAGE_POS_BILLING')
        },
        {
            label: 'Stock Units',
            value: apiStats?.totalProducts,
            icon: Package,
            color: 'text-indigo-600',
            bgColor: 'bg-indigo-50',
            path: '/staff/products',
            show: hasAccess('MANAGE_PRODUCTS')
        },
        {
            label: 'Shortage',
            value: apiStats?.lowStockCount,
            icon: AlertCircle,
            color: 'text-rose-600',
            bgColor: 'bg-rose-50',
            path: '/staff/inventory',
            show: hasAccess('MANAGE_INVENTORY')
        },
        {
            label: 'Live Users',
            value: apiStats?.totalUsers,
            icon: Users,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            path: '/staff/customers',
            show: hasAccess('VIEW_CUSTOMERS')
        },
    ].filter(stat => stat.show && stat.value !== null);

    if (summaryStats.length === 0 && !hasAccess('VIEW_ORDERS')) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center bg-white rounded-[2.5rem] border border-slate-200 shadow-sm animate-in fade-in duration-700 font-black">
                <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-[3rem] flex items-center justify-center mb-8 border border-slate-100 shadow-inner">
                    <Briefcase size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic font-black leading-none">Namaste, {staffUser?.name?.split(' ')[0]}</h2>
                <p className="text-slate-400 text-[11px] font-black uppercase mt-4 max-w-sm mx-auto tracking-widest leading-loose italic font-black font-black">
                    This unit center is awaiting role permissions from the administration.
                </p>
                <div className="mt-12">
                    <div className="px-10 py-4 bg-slate-900 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.3em] text-white italic shadow-2xl font-black">Awaiting Intake</div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-[1440px] mx-auto pb-12 overflow-x-hidden text-left">
            {/* Branch Header */}
            <div className="bg-slate-950 text-white p-8 lg:p-12 rounded-[3.5rem] shadow-3xl relative overflow-hidden group">
                <div className="absolute right-0 top-0 w-full h-full bg-blue-600/10 blur-[120px] pointer-events-none group-hover:bg-blue-600/15 transition-all duration-1000" />
                <div className="absolute top-0 left-0 w-32 h-32 bg-indigo-600/10 blur-[60px]" />
                
                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-10 text-left">
                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-emerald-500/20 italic font-black text-left">
                                <Activity size={14} className="animate-pulse" /> Unit Live
                            </div>
                        </div>
                        <h1 className="text-4xl font-black tracking-tight leading-none uppercase italic text-white text-left">
                            Branch <span className="text-blue-500">Hub</span>
                        </h1>
                        <p className="text-slate-400 text-[11px] font-bold uppercase tracking-[0.4em] italic font-black group-hover:text-slate-300 transition-colors text-left">Managed by {staffUser?.name || 'Local Lead'} at <span className="text-white border-b-2 border-blue-600/30 pb-1">{staffUser?.branchName || 'Main Center'}</span></p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        {hasAccess('MANAGE_POS_BILLING') && (
                            <button onClick={() => navigate('/staff/pos-billing')} className="px-8 py-5 bg-white text-slate-950 rounded-[1.8rem] flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-3xl shadow-white/5 hover:bg-blue-600 hover:text-white active:scale-95 group/btn italic font-black">
                                <Zap size={18} className="group-hover/btn:fill-current font-black" /> Pay Now
                            </button>
                        )}
                        {hasAccess('MANAGE_INVENTORY') && (
                            <button onClick={() => navigate('/staff/inventory')} className="px-8 py-5 bg-slate-900 text-white rounded-[1.8rem] flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all border border-white/5 hover:bg-slate-800 active:scale-95 overflow-hidden group/btn shadow-xl italic font-black">
                                <QrCode size={18} className="font-black" /> Update Stock
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {summaryStats.map((stat, idx) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={idx}
                            onClick={() => navigate(stat.path)}
                            className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:border-blue-400 hover:shadow-2xl hover:shadow-blue-900/5 transition-all cursor-pointer group animate-in zoom-in-95 duration-500 flex flex-col items-start text-left"
                            style={{ animationDelay: `${idx * 50}ms` }}
                        >
                            <div className="flex items-center justify-between w-full mb-6">
                                <div className={`w-12 h-12 flex items-center justify-center ${stat.bgColor} ${stat.color} rounded-2xl group-hover:scale-110 transition-transform duration-500 border border-transparent group-hover:border-slate-200 shadow-sm`}>
                                    <Icon size={22} className="italic font-black" />
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-200 group-hover:bg-blue-600 group-hover:text-white transition-all group-hover:translate-x-1 shrink-0 italic">
                                    <ArrowRight size={14} />
                                </div>
                            </div>
                            <div className="space-y-2 text-left">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] italic font-black leading-none text-left">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight italic font-black font-black leading-none text-left">{stat.value}</h3>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Sale Stream */}
                {hasAccess('VIEW_ORDERS') && (
                    <div className="lg:col-span-8 bg-white rounded-[2.8rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col animate-in fade-in slide-in-from-left-6 duration-700">
                        <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between bg-white group/header transition-all">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-2.5 h-8 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]" />
                                <div className="text-left">
                                    <h3 className="font-black text-lg text-slate-900 uppercase tracking-widest italic leading-none">Sale Stream</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-none italic">Live order feed tracker</p>
                                </div>
                            </div>
                            <button
                                onClick={() => navigate('/staff/orders/active')}
                                className="px-6 py-3 bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] rounded-xl hover:bg-slate-900 hover:text-white transition-all shadow-sm italic font-black"
                            >
                                History View
                            </button>
                        </div>

                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/30 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] border-b border-slate-50">
                                    <tr>
                                        <th className="px-10 py-5 font-black">User</th>
                                        <th className="px-10 py-5 text-center font-black">Amount</th>
                                        <th className="px-10 py-5 text-right font-black">Progress</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {apiOrders?.map((order, idx) => (
                                        <tr key={idx} className="hover:bg-blue-50/10 transition-all group cursor-pointer" onClick={() => navigate(`/staff/orders/detail/${order.id}`)}>
                                            <td className="px-10 py-5">
                                                <div className="flex items-center gap-5">
                                                    <div className="h-12 w-12 bg-slate-950 text-white rounded-[1.2rem] flex items-center justify-center font-black text-sm shadow-xl group-hover:scale-110 group-hover:bg-blue-600 transition-all font-black duration-500 shrink-0 italic">
                                                        {order.customer.charAt(0)}
                                                    </div>
                                                    <div className="text-left font-black">
                                                        <div className="font-black text-slate-900 text-[13px] uppercase tracking-tight italic font-black leading-none text-left">{order.customer}</div>
                                                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2.5 leading-none italic font-black text-left">Ref: #{order.orderId || order.id || order._id}</div>
                                                        <div className="text-[8px] text-slate-500 bg-slate-100 px-1 py-0.5 rounded uppercase mt-1 w-fit">
                                                            {order.paymentMethod === 'cod' ? 'COD' : 'ONLINE'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-5 text-center">
                                                <span className="font-black text-slate-900 text-[16px] italic tracking-tight font-black">₹{order.amount?.toLocaleString()}</span>
                                            </td>
                                            <td className="px-10 py-5 text-right">
                                                <span className={`inline-flex px-4 py-2 rounded-[1.1rem] text-[9px] font-black uppercase tracking-[0.2em] border shadow-sm italic font-black ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 shadow-emerald-500/5 px-5' :
                                                        order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100 shadow-amber-500/5' :
                                                            'bg-blue-50 text-blue-700 border-blue-100 shadow-blue-500/5'
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {(!apiOrders || apiOrders.length === 0) && (
                                        <tr>
                                            <td colSpan="3" className="px-10 py-24 text-center">
                                                <div className="flex flex-col items-center opacity-30 mx-auto">
                                                    <Inbox size={40} className="mb-6 text-slate-200" />
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic font-black">No Recent Sales Data</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Triage & Goals */}
                <div className={`${hasAccess('VIEW_ORDERS') ? 'lg:col-span-4' : 'lg:col-span-full'} space-y-8 animate-in fade-in slide-in-from-right-6 duration-700`}>

                    {/* Target Widget */}
                    {staffUser?.role === 'Store Manager' && (
                        <div className="bg-blue-600 text-white p-10 rounded-[3.2rem] shadow-3xl relative overflow-hidden group border border-blue-500">
                             <div className="absolute -right-16 -top-16 w-64 h-64 bg-white/10 rounded-full group-hover:scale-150 transition-all duration-1000 blur-3xl pointer-events-none" />
                             <div className="relative z-10 space-y-8 text-left font-black">
                                <div className="flex items-center justify-between">
                                    <div className="w-1.5 h-6 bg-white/30 rounded-full" />
                                    <Target size={22} className="text-white group-hover:rotate-45 transition-transform italic" />
                                </div>
                                <div className="space-y-4 text-left font-black">
                                     <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-blue-100 italic leading-none font-black text-left">Goal Metric</h4>
                                     <div className="flex items-baseline gap-2 text-left font-black">
                                        <h2 className="text-5xl font-black tracking-tighter italic leading-none font-black text-left">98.4%</h2>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-300 italic">Peak</span>
                                     </div>
                                </div>
                                <div className="h-2.5 w-full bg-blue-900/30 rounded-full overflow-hidden border border-white/5 relative shadow-inner">
                                    <div className="absolute inset-0 bg-blue-400/20 blur-sm w-[98.4%]" />
                                    <div className="h-full bg-white w-[98.4%] rounded-full shadow-[0_0_20px_white] relative z-10" />
                                </div>
                             </div>
                        </div>
                    )}

                    {/* Triage Center */}
                    <div className="bg-white p-8 lg:p-10 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col group hover:shadow-2xl transition-all duration-700 text-left relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50/50 blur-3xl pointer-events-none" />
                        
                        <div className="flex items-center justify-between mb-10 text-left">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 bg-slate-950 text-white rounded-2xl shadow-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-all duration-500 italic">
                                    <MessageSquare size={20} />
                                </div>
                                <div className="text-left">
                                    <h4 className="font-black text-slate-900 text-lg uppercase tracking-widest leading-none italic">Triage</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-none italic">Support Desk</p>
                                </div>
                            </div>
                            {(apiStats?.pendingTickets > 0) && (
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                    <span className="text-[9px] font-black text-red-600 uppercase tracking-widest italic font-black">Alerts</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 mb-10 text-left">
                            <div className="bg-slate-50/30 p-8 rounded-[2.5rem] border border-slate-100 flex items-center justify-between hover:bg-white hover:border-blue-400 transition-all group/card shadow-sm hover:shadow-xl shadow-slate-200/50">
                                <div className="text-left font-black">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 italic font-black leading-none text-left">Pending Intake</p>
                                    <h3 className="text-4xl font-black text-slate-950 tracking-tighter italic font-black leading-none text-left">{apiStats?.pendingTickets || 0}</h3>
                                </div>
                                <div className="w-14 h-14 bg-white rounded-2xl text-blue-600 border border-slate-100 shadow-sm flex items-center justify-center group-hover/card:bg-blue-600 group-hover/card:text-white transition-all shadow-blue-500/10 group-hover/card:scale-110 italic font-black">
                                    <LifeBuoy size={24} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-10 px-4 text-center">
                            <div className="bg-blue-50/20 px-6 py-4 rounded-2xl flex items-center justify-center gap-3 border border-blue-100/30">
                               <div className="w-2 h-2 bg-blue-500 rounded-full" />
                               <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] italic font-black">Assigned Status</span>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/staff/support')}
                            className="w-full py-5 rounded-[1.8rem] bg-slate-950 text-white text-[11px] font-black uppercase tracking-[0.3em] transition-all hover:bg-blue-600 shadow-3xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-4 group italic font-black"
                        >
                            Open Triage <ArrowRight size={18} className="group-hover:translate-x-3 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default StaffDashboard;
