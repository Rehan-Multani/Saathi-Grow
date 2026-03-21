import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { 
    ShoppingCart, Package, Users, IndianRupee, TrendingUp, TrendingDown, 
    Activity, Eye, Truck, AlertTriangle, MessageSquare, ArrowUpRight, 
    ChevronRight, Zap, Target, PieChart as PieChartIcon
} from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';
import { useAdminAuth } from '../context/AdminAuthContext';
import { getDashboardStats } from '../api/adminApi';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';
import PageInfoTooltip from '../components/common/PageInfoTooltip';
import { pageInfoData } from '../data/pageInfoData';

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, gradient, subtitle }) => (
    <div className="relative group overflow-hidden bg-white rounded-3xl p-6 border border-gray-100 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full opacity-10 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:opacity-20`} style={{ background: color }}></div>
        
        <div className="flex justify-between items-start mb-6">
            <div className="p-3 rounded-2xl transition-colors duration-300" style={{ background: `${color}15`, color: color }}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
            {trendValue !== undefined && (
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {trend === 'up' ? <ArrowUpRight size={12} /> : <TrendingDown size={12} />}
                    {trendValue}%
                </div>
            )}
        </div>
        
        <div className="relative z-10">
            <h3 className="text-3xl font-black text-gray-900 tracking-tight mb-1">{value}</h3>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{title}</p>
            {subtitle && <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1"><Zap size={10} className="text-amber-400" /> {subtitle}</p>}
        </div>
    </div>
);

const SectionHeader = ({ title, subtitle, icon: Icon }) => (
    <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-2xl bg-gray-900 text-white flex items-center justify-center shadow-lg shadow-gray-200">
            <Icon size={20} />
        </div>
        <div>
            <h4 className="text-lg font-black text-gray-900 tracking-tight">{title}</h4>
            <p className="text-xs text-gray-400 font-medium">{subtitle}</p>
        </div>
    </div>
);

const Dashboard = () => {
    const { t } = useTranslation();
    const { adminUser } = useAdminAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats(adminUser.token);
                if (data.success) {
                    setStats(data);
                }
            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        if (adminUser?.token) fetchStats();
    }, [adminUser.token]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <Activity size={24} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 animate-pulse" />
                </div>
                <p className="mt-6 text-xs font-black text-gray-400 uppercase tracking-[0.2em]">{t('dashboard.booting_intelligence')}</p>
            </div>
        );
    }

    const { stats: apiStats, recentOrders: apiOrders, revenueData: apiRevenueData, channels } = stats || {};

    const pieData = [
        { name: t('dashboard.channels.pos'), value: channels?.pos || 0, color: '#3B82F6' },
        { name: t('dashboard.channels.online'), value: channels?.online || 0, color: '#8B5CF6' }
    ];

    const handleViewOrder = (order) => {
        setSelectedOrder({
            _id: order.id, // Modal expects _id for API fetch
            ...order
        });
        setShowModal(true);
    };

    return (
        <div className="p-6 md:p-8 space-y-8 bg-[#FDFDFF] min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="relative">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-3 animate-fade-in">
                        <Activity size={12} className="animate-pulse" /> 
                        {t('dashboard.operational_command_center')}
                    </div>
                    <div className="flex justify-between items-center w-full">
                        <div className="flex items-center gap-3">
                            <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">
                                {t('common.welcome_back')}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{adminUser?.name?.split(' ')[0]}</span>
                            </h1>
                            <PageInfoTooltip data={pageInfoData.dashboard} />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm mt-2 font-medium">
                        {adminUser?.role === 'Admin' 
                            ? t('dashboard.monitoring_global_operations') 
                            : `${t('dashboard.assigned_branch')}: ${adminUser?.branchId || t('dashboard.assigned_branch')}`}
                    </p>
                </div>
            </div>

            {/* Main KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard 
                    title={t('dashboard.revenue_30d')} 
                    value={`₹${apiStats?.totalRevenue?.toLocaleString() || 0}`} 
                    icon={IndianRupee} 
                    color="#3B82F6" 
                    trend={apiStats?.revenueGrowth >= 0 ? 'up' : 'down'}
                    trendValue={Math.abs(apiStats?.revenueGrowth)}
                    subtitle={t('dashboard.gross_volume_after_discounts')}
                />
                <StatCard 
                    title={t('dashboard.order_flow')} 
                    value={apiStats?.totalOrders || 0} 
                    icon={ShoppingCart} 
                    color="#10B981" 
                    trend={apiStats?.orderGrowth >= 0 ? 'up' : 'down'}
                    trendValue={Math.abs(apiStats?.orderGrowth)}
                    subtitle={t('dashboard.live_transaction_throughput')}
                />
                <StatCard 
                    title={t('dashboard.processing')} 
                    value={apiStats?.pendingOrders || 0} 
                    icon={Package} 
                    color="#F59E0B"
                    subtitle={apiStats?.pendingOrders > 5 ? t('dashboard.high_workload') : t('dashboard.normal_volume')}
                />
                <StatCard 
                    title={t('dashboard.active_market')} 
                    value={adminUser?.role === 'Admin' ? apiStats?.totalUsers : apiStats?.totalProducts} 
                    icon={adminUser?.role === 'Admin' ? Users : Target} 
                    color="#8B5CF6"
                    subtitle={adminUser?.role === 'Admin' ? t('dashboard.registered_customers') : t('dashboard.available_inventory')}
                />
            </div>

            {/* Critical Operations Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                {/* Visual Intelligence Section */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                        <SectionHeader title={t('dashboard.performance_trajectory')} subtitle={t('dashboard.revenue_and_transaction_volume')} icon={TrendingUp} />
                        
                        <div className="h-[400px] w-full mt-8">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={apiRevenueData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }} 
                                        dy={15}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tickFormatter={(val) => `₹${val/1000}k`}
                                        tick={{ fontSize: 11, fontWeight: 700, fill: '#94A3B8' }} 
                                    />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '15px' }}
                                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#3B82F6" 
                                        strokeWidth={4} 
                                        fillOpacity={1} 
                                        fill="url(#colorRevenue)" 
                                        animationDuration={2000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Channel Split & Market Share */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                            <SectionHeader title={t('dashboard.channel_split')} subtitle={t('dashboard.source_of_orders')} icon={PieChartIcon} />
                            <div className="h-[200px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="space-y-3 ml-4">
                                    {pieData.map((item, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ background: item.color }}></div>
                                            <span className="text-xs font-black text-gray-700">{item.name}</span>
                                            <span className="text-[10px] text-gray-400 font-bold">{item.value} items</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4">
                                <AlertTriangle className="text-rose-100" size={80} strokeWidth={1} />
                            </div>
                            <SectionHeader title={t('dashboard.inventory_health')} subtitle={t('dashboard.actionable_stock_intelligence')} icon={Zap} />
                            <div className="mt-4">
                                <div className="text-4xl font-black text-gray-900 mb-2">{apiStats?.lowStockCount || 0}</div>
                                <p className="text-xs font-bold text-rose-500 uppercase tracking-widest mb-6">{t('dashboard.skus_below_threshold')}</p>
                                <Link to="/admin/stock" className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:gap-3 transition-all">
                                    {t('dashboard.manage_procurement')} <ChevronRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Active Monitoring */}
                <div className="space-y-8">
                    {/* Live Support/Escalations */}
                    <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute -bottom-10 -right-10 opacity-20 transform rotate-12">
                            <MessageSquare size={160} strokeWidth={1} />
                        </div>
                        <h4 className="text-lg font-black tracking-tight mb-2">{t('dashboard.support_pulse')}</h4>
                        <p className="text-slate-400 text-xs mb-8">{t('dashboard.pending_store_escalations')}</p>
                        
                        <div className="flex items-end gap-3 mb-8">
                            <span className="text-5xl font-black">{apiStats?.pendingTickets || 0}</span>
                            <span className="bg-rose-500/20 text-rose-400 text-[10px] font-black px-2 py-1 rounded-full uppercase mb-2">{t('dashboard.urgent')}</span>
                        </div>
                        
                        <Link to="/admin/support" className="flex items-center justify-between w-full p-4 bg-white/10 rounded-2xl hover:bg-white/15 transition-all text-xs font-bold group">
                            {t('dashboard.resolve_tickets')} <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    {/* Delivery Partner Widget */}
                    <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <Truck size={20} />
                                </div>
                                <span className="font-bold text-gray-900">{t('dashboard.rider_hub')}</span>
                            </div>
                            <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-black animate-pulse uppercase">{t('dashboard.live')}</span>
                        </div>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="text-3xl font-black text-gray-900">{apiStats?.activeRiders || 0}</div>
                            <div className="text-xs text-gray-400 font-medium">{t('dashboard.partners_ready')} <br/> {t('dashboard.radius_msg')}</div>
                        </div>
                        <Link to="/admin/delivery" className="block text-center py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-all">
                            {t('dashboard.manage_fleet')}
                        </Link>
                    </div>

                    {/* Quick Access Menu */}
                    <div className="bg-indigo-50/50 rounded-[2rem] p-8 border border-indigo-100/50">
                        <h5 className="text-sm font-black text-indigo-900 tracking-tight mb-4 uppercase tracking-[0.1em]">{t('dashboard.instant_actions')}</h5>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: t('dashboard.campaigns'), icon: Target, path: '/admin/campaigns' },
                                { label: t('common.customers'), icon: Users, path: '/admin/customers' },
                                { label: t('common.vendors'), icon: Truck, path: '/admin/vendors' },
                                { label: t('common.settings'), icon: Activity, path: '/admin/settings/app' },
                            ].map((item, i) => (
                                <Link to={item.path} key={i} className="p-4 bg-white rounded-2xl border border-indigo-100 shadow-sm hover:shadow-md cursor-pointer group transition-all">
                                    <item.icon size={20} className="text-indigo-600 mb-2 group-hover:scale-110 transition-transform" />
                                    <div className="text-[10px] font-black text-gray-800 uppercase tracking-widest">{item.label}</div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden mb-10">
                <div className="p-8 border-b border-gray-50 flex justify-between items-center">
                    <div>
                        <h5 className="text-xl font-black text-gray-900 tracking-tight">{t('dashboard.recent_transactions')}</h5>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">{t('dashboard.live_order_stream')}</p>
                    </div>
                    <Link to="/admin/orders" className="flex items-center gap-2 text-xs font-black text-blue-600 hover:gap-3 transition-all">
                        {t('dashboard.view_all_history')} <ArrowUpRight size={14} />
                    </Link>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 text-[10px] uppercase font-black tracking-widest text-gray-400">
                            <tr>
                                <th className="px-8 py-4">{t('dashboard.transaction_id')}</th>
                                <th className="px-8 py-4">{t('dashboard.customer_entity')}</th>
                                <th className="px-8 py-4">{t('dashboard.invoice_value')}</th>
                                <th className="px-8 py-4">{t('dashboard.status')}</th>
                                <th className="px-8 py-4 text-center">{t('dashboard.protocol')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {apiOrders?.map((order, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-8 py-5 font-black text-gray-900 text-sm tracking-tighter">#{order.id}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600 font-black flex items-center justify-center text-sm shadow-inner uppercase">
                                                {order.customer?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-sm font-bold text-gray-900 whitespace-nowrap">{order.customer}</div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(order.date).toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-black text-gray-900">₹{order.amount?.toLocaleString()}</div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border
                                            ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                                              order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                              order.status === 'cancelled' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                                              'bg-blue-50 text-blue-700 border-blue-100'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-center">
                                        <button 
                                            onClick={() => handleViewOrder(order)}
                                            className="w-10 h-10 rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-900 hover:text-white transition-all duration-300 flex items-center justify-center group-hover:scale-110"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {(!apiOrders || apiOrders.length === 0) && (
                                <tr>
                                    <td colSpan="5" className="text-center py-20">
                                        <div className="flex flex-col items-center">
                                            <div className="p-4 bg-gray-50 rounded-full mb-4">
                                                <Activity className="text-gray-300" size={40} />
                                            </div>
                                            <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No Active Transactions</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <OrderDetailsModal
                show={showModal}
                onHide={() => setShowModal(false)}
                order={selectedOrder}
            />
        </div>
    );
};

export default Dashboard;
