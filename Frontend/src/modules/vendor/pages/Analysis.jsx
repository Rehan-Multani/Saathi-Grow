import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts';

const Analysis = () => {
    // Mock Data
    const salesData = [
        { name: 'Mon', sales: 4000, orders: 24 },
        { name: 'Tue', sales: 3000, orders: 18 },
        { name: 'Wed', sales: 2000, orders: 12 },
        { name: 'Thu', sales: 2780, orders: 20 },
        { name: 'Fri', sales: 1890, orders: 15 },
        { name: 'Sat', sales: 2390, orders: 19 },
        { name: 'Sun', sales: 3490, orders: 28 },
    ];

    const categoryData = [
        { name: 'Veg', value: 400 },
        { name: 'Dairy', value: 300 },
        { name: 'Snacks', value: 300 },
        { name: 'Drinks', value: 200 },
    ];

    return (
        <div className="space-y-6 lg:space-y-5">
            <div className="mb-6 lg:mb-4">
                <h1 className="text-2xl lg:text-2xl font-bold text-gray-900 tracking-tight">Business Analysis</h1>
                <p className="text-sm text-gray-500">Detailed insights into your store's performance.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-5">
                {/* Sales Chart */}
                <div className="bg-white p-6 lg:p-5 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg lg:text-lg font-bold text-gray-900 tracking-tight mb-4 lg:mb-3">Revenue Trend</h2>
                    <div className="h-[300px] lg:h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0c831f" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0c831f" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={(value) => `₹${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6' }}
                                    itemStyle={{ color: '#0c831f', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="sales" stroke="#0c831f" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Orders Bar Chart */}
                <div className="bg-white p-6 lg:p-5 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-lg lg:text-lg font-bold text-gray-900 tracking-tight mb-4 lg:mb-3">Orders Volume</h2>
                    <div className="h-[300px] lg:h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                                <Tooltip
                                    cursor={{ fill: '#f3f4f6' }}
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6' }}
                                />
                                <Bar dataKey="orders" fill="#fef08a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analysis;
