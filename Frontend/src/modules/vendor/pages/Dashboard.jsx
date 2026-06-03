import React, { useEffect, useState, useMemo } from 'react';
import { 
    Package, 
    ShoppingBag, 
    Clock, 
    Wallet, 
    Activity,
    ShieldCheck,
    Store,
    Plus,
    ArrowUpRight,
    DollarSign,
    Zap,
    Monitor,
    AlertTriangle
} from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { formatCurrency } from '../../../common/utils/formatUtils';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const Dashboard = () => {
    const { 
        vendor, 
        dashboardData, 
        fetchDashboardStats
    } = useVendor();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initDashboard = async () => {
            setLoading(true);
            await fetchDashboardStats();
            setLoading(false);
        };
        initDashboard();
    }, []);

    const { stats, analytics, recentOrders, inventoryAlerts } = dashboardData || {};

    const authorizedStats = useMemo(() => {
        if (!stats) return [];
        return [
            { label: 'Total Earnings', value: formatCurrency(stats.totalEarnings), icon: Wallet, color: '#3b82f6', desc: 'All time revenue', route: '/vendor/earnings' },
            { label: 'Available Balance', value: formatCurrency(stats.balance), icon: DollarSign, color: '#10b981', desc: 'Ready for withdrawal', route: '/vendor/earnings' },
            { label: 'Total Orders', value: stats.totalOrders?.toLocaleString() || '0', icon: ShoppingBag, color: '#8b5cf6', desc: 'Successfully delivered', route: '/vendor/orders' },
            { label: 'Total Products', value: stats.totalProducts?.toLocaleString() || '0', icon: Package, color: '#f59e0b', desc: 'Active in store', route: '/vendor/products' },
            { label: 'Pending Orders', value: stats.pendingOrders?.toLocaleString() || '0', icon: Clock, color: '#f43f5e', desc: 'Needs action', route: '/vendor/orders' }
        ];
    }, [stats]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] bg-white">
                <div className="w-16 h-16 border-4 border-gray-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Loading Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
                <div>


                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                            {vendor?.shopName || 'Vendor Dashboard'}
                        </h1>
                        <p className="text-gray-500 font-medium text-sm mt-1">Welcome back, {vendor?.ownerName || 'Vendor'}</p>
                    </div>
                </div>

                <button 
                    onClick={() => navigate('/vendor/products/add')}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[#0c831f] text-white rounded-xl text-sm font-bold shadow-sm hover:bg-[#0a6b19] transition-colors"
                >
                    <Plus size={18} /> Add New Product
                </button>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
                {authorizedStats.map((stat, i) => (
                    <div
                        key={i}
                        onClick={() => navigate(stat.route)}
                        className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all cursor-pointer group"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                <stat.icon size={22} strokeWidth={2.5} />
                            </div>
                            <ArrowUpRight size={16} className="text-gray-300 group-hover:text-gray-500 transition-colors" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                        <p className="text-[10px] text-gray-400 mt-2 font-medium">{stat.desc}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                {/* Chart Area */}
                <div className="xl:col-span-2 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h4 className="text-lg font-bold text-gray-900">Revenue Overview</h4>
                            <p className="text-xs font-medium text-gray-500 mt-1">Earnings over time</p>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-600">
                            <Activity size={14} className="text-green-600" /> Live
                        </div>
                    </div>

                    <div className="h-[300px] w-full min-w-0" style={{ minHeight: 300, minWidth: 0 }}>
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={300}>
                            <AreaChart data={analytics || []}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0c831f" stopOpacity={0.1}/>
                                        <stop offset="95%" stopColor="#0c831f" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12, fontWeight: 500, fill: '#64748b'}}
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{fontSize: 12, fontWeight: 500, fill: '#64748b'}}
                                    tickFormatter={(v) => `₹${v/1000}k`}
                                />
                                <Tooltip 
                                    contentStyle={{borderRadius: '1rem', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', padding: '12px'}}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#0c831f" 
                                    strokeWidth={3} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="bg-gray-900 p-6 rounded-2xl shadow-sm text-white">
                        <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Quick Actions</h4>
                        <div className="space-y-3">
                            <button onClick={() => navigate('/vendor/products/add')} className="w-full flex items-center justify-between px-4 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-bold transition-colors">
                                <span>Add Product</span>
                                <Plus size={16} />
                            </button>
                            <button onClick={() => navigate('/vendor/pos-billing')} className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-sm font-bold transition-colors shadow-sm">
                                <span>POS Billing</span>
                                <Monitor size={16} />
                            </button>
                            <button onClick={() => navigate('/vendor/earnings')} className="w-full flex items-center justify-between px-4 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-bold transition-colors shadow-sm">
                                <span>View Earnings</span>
                                <Wallet size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-center mb-4">
                             <h4 className="text-sm font-bold text-gray-900">Low Stock Alerts</h4>
                             <AlertTriangle size={16} className="text-red-500" />
                        </div>
                        <div className="space-y-3">
                            {(inventoryAlerts || []).map((prod, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors" onClick={() => navigate(`/vendor/products/edit/${prod.id}`)}>
                                    <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                        {prod.image ? <img src={prod.image} alt="" className="w-full h-full object-cover" /> : <Package size={16} className="text-gray-400 m-auto mt-3" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-900 truncate">{prod.name}</p>
                                        <p className="text-xs font-semibold text-red-600">{prod.stock} left in stock</p>
                                    </div>
                                </div>
                            ))}
                            {(!inventoryAlerts || inventoryAlerts.length === 0) && (
                                <div className="text-center py-6">
                                    <ShieldCheck size={24} className="mx-auto text-green-200 mb-2" />
                                    <p className="text-xs text-gray-400 font-medium">All products have sufficient stock</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <div>
                        <h4 className="text-lg font-bold text-gray-900">Recent Orders</h4>
                        <p className="text-xs font-medium text-gray-500 mt-1">Latest customer purchases</p>
                    </div>
                    <button onClick={() => navigate('/vendor/orders')} className="text-sm font-bold text-[#0c831f] hover:underline flex items-center gap-1">
                        View All <ArrowUpRight size={16} />
                    </button>
                </div>
                
                <div className="p-2">
                    {(recentOrders || []).map((order, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="hidden sm:flex w-12 h-12 bg-gray-50 border border-gray-100 rounded-xl items-center justify-center font-bold text-gray-500 text-xs">
                                    #{order.orderId || order.id || order._id}
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{order.customer || 'Customer Details'}</p>
                                    <p className="text-xs font-medium text-gray-500 mt-0.5">{order.itemsCount} Items ordered</p>
                                    <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                        PAYMENT: {order.paymentMethod === 'cod' ? 'COD' : 'ONLINE'}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-900">{formatCurrency(order.amount)}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                                    ${order.status === 'delivered' ? 'bg-green-50 text-green-700' : 
                                      order.status === 'confirmed' ? 'bg-blue-50 text-blue-700' : 
                                      'bg-yellow-50 text-yellow-700'}`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {(!recentOrders || recentOrders.length === 0) && (
                        <div className="text-center py-10 text-gray-500 text-sm font-medium">No recent orders found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
