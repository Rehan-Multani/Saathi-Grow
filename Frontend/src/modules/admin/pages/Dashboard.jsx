import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Package, Users, IndianRupee, TrendingUp, TrendingDown, Activity, CreditCard, Eye } from 'lucide-react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import OrderDetailsModal from '../components/orders/OrderDetailsModal';

// Mock Data for Charts
const revenueData = [
    { name: 'Jan', revenue: 4000, orders: 240 },
    { name: 'Feb', revenue: 3000, orders: 139 },
    { name: 'Mar', revenue: 2000, orders: 980 },
    { name: 'Apr', revenue: 2780, orders: 390 },
    { name: 'May', revenue: 1890, orders: 480 },
    { name: 'Jun', revenue: 2390, orders: 380 },
    { name: 'Jul', revenue: 3490, orders: 430 },
];

const categoryData = [
    { name: 'Electronics', value: 400 },
    { name: 'Groceries', value: 300 },
    { name: 'Clothing', value: 300 },
    { name: 'Home', value: 200 },
];

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const StatCard = ({ title, value, icon: Icon, color, trend, trendValue, gradient }) => (
    <div className="border-0 shadow-sm h-full overflow-hidden text-white rounded-xl p-6 relative" style={{ background: gradient || color }}>
        <div className="flex justify-between items-start mb-4">
            <div className="bg-white/25 rounded-full p-2 flex items-center justify-center">
                <Icon size={24} className="text-white" />
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center ${trend === 'up' ? 'bg-green-500/25 text-white' : 'bg-red-500/25 text-white'}`}>
                {trend === 'up' ? <TrendingUp size={12} className="mr-1" /> : <TrendingDown size={12} className="mr-1" />}
                {trendValue}
            </span>
        </div>
        <div>
            <h2 className="font-bold text-3xl mb-1">{value}</h2>
            <p className="mb-0 opacity-75 text-xs uppercase font-semibold tracking-wider">{title}</p>
        </div>
    </div>
);

const recentOrders = [
    { id: '#ORD-001', customer: 'Alex Johnson', product: 'Wireless Headset', amount: '₹120.00', status: 'Delivered' },
    { id: '#ORD-002', customer: 'Sam Smith', product: 'Smart Watch', amount: '₹250.00', status: 'Pending' },
    { id: '#ORD-003', customer: 'Maria Garcia', product: 'Organic Bananas', amount: '₹15.50', status: 'Processing' },
    { id: '#ORD-004', customer: 'John Doe', product: 'Gaming Mouse', amount: '₹45.00', status: 'Cancelled' },
];

const Dashboard = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [dateFilterType, setDateFilterType] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleViewOrder = (order) => {
        // Adapt dashboard data to modal expected format
        const modalOrder = {
            id: order.id,
            customer: order.customer,
            status: order.status,
            total: order.amount,
            date: 'Today', // Mock date for dashboard items
            items: 1,
            payment: 'Paid', // Mock status
            ...order
        };
        setSelectedOrder(modalOrder);
        setShowModal(true);
    };

    const handleGenerateReport = () => {
        alert(`Generating ${dateFilterType} report for ${selectedDate}... (This is a demo feature)`);
    };

    return (
        <div className="p-4 md:p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h3 className="font-bold text-dark text-2xl mb-1 text-gray-800">Dashboard Overview</h3>
                    <p className="text-gray-500 text-sm mb-0">Live analytics and performance metrics.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    {/* Date Type Selector */}
                    <select
                        value={dateFilterType}
                        onChange={(e) => setDateFilterType(e.target.value)}
                        className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 outline-none"
                    >
                        <option value="daily">Daily</option>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                    </select>

                    {/* Dynamic Date Input */}
                    <div className="relative">
                        <input
                            type={dateFilterType === 'daily' ? 'date' : dateFilterType === 'monthly' ? 'month' : 'number'}
                            min={dateFilterType === 'yearly' ? "2000" : undefined}
                            max={dateFilterType === 'yearly' ? "2100" : undefined}
                            placeholder={dateFilterType === 'yearly' ? "YYYY" : undefined}
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="bg-white border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 outline-none"
                        />
                    </div>

                    <button
                        onClick={handleGenerateReport}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors font-medium whitespace-nowrap">
                        <Activity size={18} />
                        <span>Generate Report</span>
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <StatCard
                    title="Total Revenue"
                    value="₹54,230"
                    icon={IndianRupee}
                    color="#3B82F6"
                    gradient="linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)"
                    trend="up"
                    trendValue="+12.5%"
                />
                <StatCard
                    title="Total Orders"
                    value="1,890"
                    icon={ShoppingCart}
                    color="#10B981"
                    gradient="linear-gradient(135deg, #10B981 0%, #059669 100%)"
                    trend="up"
                    trendValue="+8.2%"
                />
                <StatCard
                    title="Total Products"
                    value="452"
                    icon={Package}
                    color="#F59E0B"
                    gradient="linear-gradient(135deg, #F59E0B 0%, #D97706 100%)"
                    trend="down"
                    trendValue="-2.4%"
                />
                <StatCard
                    title="New Users"
                    value="340"
                    icon={Users}
                    color="#8B5CF6"
                    gradient="linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)"
                    trend="up"
                    trendValue="+18%"
                />
            </div>

            {/* Main Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h5 className="font-bold text-gray-800 text-lg">Revenue Analytics</h5>
                        <select className="form-select text-sm border-gray-200 rounded-lg text-gray-600 focus:ring-blue-500 focus:border-blue-500">
                            <option>This Year</option>
                            <option>Last Year</option>
                        </select>
                    </div>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₹${val}`} tick={{ fontSize: 12, fill: '#9CA3AF' }} dx={-10} />
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="mb-6">
                        <h5 className="font-bold text-gray-800 text-lg">Sales by Category</h5>
                    </div>
                    <div className="h-[350px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={categoryData}
                                layout={isMobile ? "horizontal" : "vertical"}
                                margin={isMobile ? { top: 20, right: 20, left: 0, bottom: 5 } : { top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={isMobile} vertical={!isMobile} stroke="#f1f5f9" />
                                <XAxis
                                    type={isMobile ? "category" : "number"}
                                    dataKey={isMobile ? "name" : undefined}
                                    hide={!isMobile}
                                    tick={{ fontSize: 10, fill: '#9CA3AF' }}
                                    interval={0}
                                />
                                <YAxis
                                    type={isMobile ? "number" : "category"}
                                    dataKey={isMobile ? undefined : "name"}
                                    width={isMobile ? 40 : 80}
                                    tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }}
                                    hide={false}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Bar dataKey="value" radius={isMobile ? [4, 4, 0, 0] : [0, 4, 4, 0]} barSize={isMobile ? 40 : 24}>
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                    <h5 className="font-bold text-gray-800 text-lg">Recent Transactions</h5>
                    <Link to="/admin/orders" className="text-blue-600 hover:text-blue-700 font-semibold text-sm hover:underline">View All</Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Product</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {recentOrders.map((order, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{order.id}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold flex items-center justify-center mr-3 text-xs">
                                                {order.customer.charAt(0)}
                                            </div>
                                            <span className="text-gray-700 font-medium">{order.customer}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{order.product}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">{order.amount}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium 
                                            ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                                order.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                    order.status === 'Processing' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleViewOrder(order)}
                                            className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                                            title="View Details"
                                        >
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
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
