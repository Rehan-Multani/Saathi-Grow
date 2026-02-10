import React from 'react';
import { Package, ShoppingBag, Clock, Wallet, TrendingUp, AlertCircle, ChevronRight, ArrowUpRight } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { formatCurrency } from '../utils/formatDate';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const StatCard = ({ title, value, icon: Icon, color, trend, onClick }) => (
    <div
        onClick={onClick}
        className="premium-card p-4 lg:p-4 flex flex-col justify-between h-full min-h-[120px] lg:min-h-[110px] group cursor-pointer hover:shadow-lg transition-all duration-200"
    >
        <div className="flex justify-between items-start mb-3 lg:mb-3">
            <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider group-hover:text-[#0c831f] transition-colors">{title}</p>
                <h3 className="text-2xl lg:text-2xl font-extrabold text-gray-900 mt-2">{value}</h3>
            </div>
            <div className={`p-2.5 lg:p-2.5 rounded-xl ${color} shadow-sm bg-opacity-10 group-hover:scale-110 transition-transform`}>
                <Icon size={20} className="text-white" />
            </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 w-fit px-2 py-1 rounded-md">
            <TrendingUp size={14} />
            <span>{trend} vs last week</span>
        </div>
    </div>
);

const Dashboard = () => {
    const { stats, orders, products } = useVendor();
    const navigate = useNavigate();

    // DERIVED DATA
    const recentOrders = orders.slice(0, 5);
    const lowStockProducts = products.filter(p => p.stock < 20).slice(0, 4);

    // Mock Chart Data
    const chartData = [
        { name: 'Mon', sales: 4000 },
        { name: 'Tue', sales: 3000 },
        { name: 'Wed', sales: 2000 },
        { name: 'Thu', sales: 2780 },
        { name: 'Fri', sales: 1890 },
        { name: 'Sat', sales: 2390 },
        { name: 'Sun', sales: 3490 },
    ];

    return (
        <div className="space-y-4 lg:space-y-5">
            {/* Header */}
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-2">
                <div>
                    <h1 className="text-lg lg:text-xl font-bold text-gray-900 tracking-tight">Vendor Dashboard</h1>
                    <p className="text-xs text-gray-500 font-medium">Overview of your shop's performance</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-green-100 text-[#0c831f] text-[10px] font-bold rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0c831f] animate-pulse"></span>
                        Shop Open
                    </span>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Products"
                    value={stats.totalProducts}
                    icon={Package}
                    color="bg-blue-500"
                    trend="+2"
                    onClick={() => navigate('/vendor/products')}
                />
                <StatCard
                    title="Total Orders"
                    value={stats.totalOrders}
                    icon={ShoppingBag}
                    color="bg-purple-500"
                    trend="+12%"
                    onClick={() => navigate('/vendor/orders')}
                />
                <StatCard
                    title="Pending Orders"
                    value={stats.pendingOrders}
                    icon={Clock}
                    color="bg-[#f7cb15]"
                    trend="-5"
                    onClick={() => navigate('/vendor/orders')}
                />
                <StatCard
                    title="Total Earnings"
                    value={formatCurrency(stats.earnings)}
                    icon={Wallet}
                    color="bg-[#0c831f]"
                    trend="+8%"
                    onClick={() => navigate('/vendor/earnings')}
                />
            </div>

            {/* ANALYTICS CHART SECTION */}
            <div className="premium-card p-4 lg:p-5">
                <div className="flex items-center justify-between mb-4 lg:mb-4">
                    <h2 className="text-base lg:text-lg font-bold text-gray-900 tracking-tight">Weekly Sales Analysis</h2>
                    <select className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 outline-none text-gray-600">
                        <option>This Week</option>
                        <option>Last Week</option>
                    </select>
                </div>
                <div className="h-[220px] lg:h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0c831f" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#0c831f" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(value) => `₹${value}`} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                itemStyle={{ color: '#0c831f', fontWeight: 'bold' }}
                            />
                            <Area type="monotone" dataKey="sales" stroke="#0c831f" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="flex flex-col gap-4 lg:gap-5">

                {/* RECENT ORDERS (Main Column) */}
                <div className="premium-card overflow-hidden">
                    <div className="p-4 lg:p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-base lg:text-lg font-bold text-gray-900 tracking-tight">Recent Orders</h2>
                        <button onClick={() => navigate('/vendor/orders')} className="text-xs font-bold text-[#0c831f] flex items-center gap-1 hover:underline">
                            View All <ChevronRight size={14} />
                        </button>
                    </div>
                    <div className="flex flex-col">
                        {recentOrders.map(order => (
                            <div key={order.id} className="p-3 lg:p-3 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-all flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/vendor/orders')}>
                                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#0c831f]/10 group-hover:text-[#0c831f] transition-colors flex-shrink-0">
                                    <ShoppingBag size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <p className="text-sm font-bold text-gray-900 truncate pr-2">{order.customer}</p>
                                        <p className="text-sm font-bold text-gray-900 whitespace-nowrap">{formatCurrency(order.total)}</p>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-gray-500 font-medium">
                                            {order.items} items <span className="text-gray-300 mx-1">•</span> {order.time}
                                        </p>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${order.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                            order.status === 'Dispatched' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-600 border-gray-100'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
