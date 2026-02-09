import React, { useState } from 'react';
import { Users, Search, ShoppingBag, TrendingUp, DollarSign, Eye, Calendar, Filter } from 'lucide-react';
import { formatCurrency } from '../utils/formatDate';

const Customers = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('recent');

    // Mock customer data
    const customers = [
        { id: 1, name: 'Rahul Sharma', email: 'rahul@example.com', phone: '+91 98765 43210', totalOrders: 15, totalSpent: 12500, lastOrder: '2024-02-09', joinDate: '2023-11-15', status: 'active' },
        { id: 2, name: 'Priya Singh', email: 'priya@example.com', phone: '+91 98765 43211', totalOrders: 8, totalSpent: 6800, lastOrder: '2024-02-08', joinDate: '2024-01-10', status: 'active' },
        { id: 3, name: 'Amit Kumar', email: 'amit@example.com', phone: '+91 98765 43212', totalOrders: 22, totalSpent: 18900, lastOrder: '2024-02-07', joinDate: '2023-08-22', status: 'active' },
        { id: 4, name: 'Neha Patel', email: 'neha@example.com', phone: '+91 98765 43213', totalOrders: 5, totalSpent: 3200, lastOrder: '2024-01-28', joinDate: '2024-01-05', status: 'inactive' },
        { id: 5, name: 'Sanjay Verma', email: 'sanjay@example.com', phone: '+91 98765 43214', totalOrders: 12, totalSpent: 9500, lastOrder: '2024-02-06', joinDate: '2023-10-12', status: 'active' },
        { id: 6, name: 'Anjali Mehta', email: 'anjali@example.com', phone: '+91 98765 43215', totalOrders: 18, totalSpent: 15200, lastOrder: '2024-02-05', joinDate: '2023-09-18', status: 'active' },
    ];

    const filteredCustomers = customers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
    );

    const totalCustomers = customers.length;
    const newThisMonth = customers.filter(c => new Date(c.joinDate) > new Date('2024-02-01')).length;
    const activeCustomers = customers.filter(c => c.status === 'active').length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Customer Management</h1>
                    <p className="text-sm text-gray-500">View and manage your customer database</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <Users size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Customers</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{totalCustomers}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">New This Month</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{newThisMonth}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                            <ShoppingBag size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Active</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{activeCustomers}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-yellow-50 text-yellow-600 rounded-lg">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Revenue</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{formatCurrency(totalRevenue)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="premium-card p-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, email, or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm"
                        />
                    </div>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm font-medium"
                    >
                        <option value="recent">Recent Orders</option>
                        <option value="mostSpent">Highest Spending</option>
                        <option value="mostOrders">Most Orders</option>
                        <option value="newest">Newest First</option>
                    </select>
                </div>
            </div>

            {/* Customer Table - Desktop */}
            <div className="hidden md:block premium-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Customer</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Contact</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Orders</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Total Spent</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Last Order</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-xs font-bold text-gray-500 uppercase text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredCustomers.map(customer => (
                                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-[#0c831f] to-[#0a6b19] rounded-full flex items-center justify-center text-white font-bold text-sm">
                                                {customer.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{customer.name}</p>
                                                <p className="text-xs text-gray-500">Joined {customer.joinDate}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600">{customer.email}</p>
                                        <p className="text-xs text-gray-500">{customer.phone}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-gray-900">{customer.totalOrders}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">{customer.lastOrder}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${customer.status === 'active'
                                                ? 'bg-green-50 text-green-700 border border-green-100'
                                                : 'bg-gray-50 text-gray-600 border border-gray-100'
                                            }`}>
                                            {customer.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="px-3 py-1.5 text-xs font-bold text-[#0c831f] hover:bg-green-50 rounded-lg transition-colors flex items-center gap-1 ml-auto">
                                            <Eye size={14} />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Customer Cards - Mobile */}
            <div className="md:hidden space-y-4">
                {filteredCustomers.map(customer => (
                    <div key={customer.id} className="premium-card p-5">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-[#0c831f] to-[#0a6b19] rounded-full flex items-center justify-center text-white font-bold">
                                {customer.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-gray-900">{customer.name}</h3>
                                <p className="text-xs text-gray-500">{customer.email}</p>
                                <p className="text-xs text-gray-500">{customer.phone}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${customer.status === 'active'
                                    ? 'bg-green-50 text-green-700 border border-green-100'
                                    : 'bg-gray-50 text-gray-600 border border-gray-100'
                                }`}>
                                {customer.status}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div>
                                <p className="text-xs text-gray-500">Orders</p>
                                <p className="text-sm font-bold text-gray-900">{customer.totalOrders}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Spent</p>
                                <p className="text-sm font-bold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Last Order</p>
                                <p className="text-sm font-bold text-gray-900">{customer.lastOrder}</p>
                            </div>
                        </div>
                        <button className="w-full py-2 text-xs font-bold text-[#0c831f] bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                            View Details
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Customers;
