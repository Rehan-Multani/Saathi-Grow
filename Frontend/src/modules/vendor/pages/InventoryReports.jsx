import React, { useState } from 'react';
import { BarChart3, Package, TrendingDown, AlertTriangle, Download, Calendar, Filter } from 'lucide-react';
import { useVendor } from '../contexts/VendorContext';
import { formatCurrency } from '../utils/formatDate';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';

const InventoryReports = () => {
    const { products } = useVendor();
    const [dateRange, setDateRange] = useState('thisMonth');

    // Calculate Statistics
    const totalItems = products.length;
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const lowStockItems = products.filter(p => p.stock < 20 && p.stock > 0).length;
    const outOfStockItems = products.filter(p => p.stock === 0).length;

    // Category-wise distribution
    const categoryData = products.reduce((acc, product) => {
        const category = product.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = { name: category, value: 0, items: 0 };
        }
        acc[category].value += product.price * product.stock;
        acc[category].items += 1;
        return acc;
    }, {});

    const pieData = Object.values(categoryData);
    const COLORS = ['#0c831f', '#f7cb15', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316'];

    // Top products by value
    const topProducts = [...products]
        .map(p => ({ ...p, totalValue: p.price * p.stock }))
        .sort((a, b) => b.totalValue - a.totalValue)
        .slice(0, 10);

    // Stock level distribution
    const stockDistribution = [
        { range: '0', count: products.filter(p => p.stock === 0).length },
        { range: '1-10', count: products.filter(p => p.stock >= 1 && p.stock <= 10).length },
        { range: '11-20', count: products.filter(p => p.stock >= 11 && p.stock <= 20).length },
        { range: '21-50', count: products.filter(p => p.stock >= 21 && p.stock <= 50).length },
        { range: '50+', count: products.filter(p => p.stock > 50).length },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Inventory Reports</h1>
                    <p className="text-sm text-gray-500">Comprehensive analytics and insights</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:border-[#0c831f] focus:outline-none"
                    >
                        <option value="today">Today</option>
                        <option value="thisWeek">This Week</option>
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                    </select>
                    <button className="flex-1 sm:flex-none px-4 py-2 bg-[#0c831f] text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#0a6b19] transition-colors">
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Package size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Items</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{totalItems}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                            <BarChart3 size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Value</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{formatCurrency(totalValue)}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-lg">
                            <AlertTriangle size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Low Stock</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{lowStockItems}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded-lg">
                            <TrendingDown size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Out of Stock</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{outOfStockItems}</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Stock Distribution Chart */}
                <div className="premium-card p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Stock Level Distribution</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={stockDistribution}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #f3f4f6' }}
                                itemStyle={{ color: '#0c831f', fontWeight: 'bold' }}
                            />
                            <Bar dataKey="count" fill="#0c831f" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Category Distribution */}
                <div className="premium-card p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-4">Category-wise Value</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value) => formatCurrency(value)}
                                contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Top Products Table */}
            <div className="premium-card overflow-hidden">
                <div className="p-5 border-b border-gray-100">
                    <h3 className="text-base font-bold text-gray-900">Top Products by Value</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[600px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Product</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Category</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Stock</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Unit Price</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Total Value</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {topProducts.map((product, index) => (
                                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                                <img src={product.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{product.category}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-bold ${product.stock === 0 ? 'text-red-600' : product.stock < 20 ? 'text-yellow-600' : 'text-green-600'}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatCurrency(product.price)}</td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">{formatCurrency(product.totalValue)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InventoryReports;
