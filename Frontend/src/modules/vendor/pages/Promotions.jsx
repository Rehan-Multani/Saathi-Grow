import React, { useState } from 'react';
import { Tag, Plus, X, Calendar, TrendingUp, Eye, Edit2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../utils/formatDate';

const Promotions = () => {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [activeTab, setActiveTab] = useState('active');

    // Mock promotion data
    const promotions = [
        { id: 1, name: 'Summer Sale', type: 'percentage', value: 20, code: 'SUMMER20', startDate: '2024-02-01', endDate: '2024-02-29', used: 45, limit: 100, status: 'active', revenue: 12500 },
        { id: 2, name: 'Flat ₹100 Off', type: 'flat', value: 100, code: 'FLAT100', startDate: '2024-02-05', endDate: '2024-02-15', used: 28, limit: 50, status: 'active', revenue: 8900 },
        { id: 3, name: 'Buy 2 Get 1', type: 'bogo', value: 1, code: 'BOGO1', startDate: '2024-01-15', endDate: '2024-01-31', used: 62, limit: 100, status: 'expired', revenue: 15200 },
        { id: 4, name: 'New User Offer', type: 'percentage', value: 15, code: 'NEW15', startDate: '2024-02-01', endDate: '2024-03-31', used: 18, limit: 200, status: 'active', revenue: 5400 },
    ];

    const activePromotions = promotions.filter(p => p.status === 'active');
    const expiredPromotions = promotions.filter(p => p.status === 'expired');
    const displayPromotions = activeTab === 'active' ? activePromotions : expiredPromotions;

    const totalRevenue = promotions.reduce((sum, p) => sum + p.revenue, 0);
    const totalUsage = promotions.reduce((sum, p) => sum + p.used, 0);

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Promotions</h1>
                    <p className="text-sm text-gray-500">Create and manage promotional campaigns</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-[#0c831f] text-white rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#0a6b19] transition-colors"
                >
                    <Plus size={16} />
                    Create Promotion
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
                            <Tag size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Active Promos</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{activePromotions.length}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Usage</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{totalUsage}</h3>
                        </div>
                    </div>
                </div>
                <div className="premium-card p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Revenue Impact</p>
                            <h3 className="text-2xl font-extrabold text-gray-900">{formatCurrency(totalRevenue)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="premium-card overflow-hidden">
                <div className="border-b border-gray-100 px-6">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('active')}
                            className={`relative py-4 text-sm font-bold uppercase transition-all ${activeTab === 'active' ? 'text-[#0c831f]' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Active ({activePromotions.length})
                            {activeTab === 'active' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0c831f] rounded-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('expired')}
                            className={`relative py-4 text-sm font-bold uppercase transition-all ${activeTab === 'expired' ? 'text-[#0c831f]' : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            Expired ({expiredPromotions.length})
                            {activeTab === 'expired' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#0c831f] rounded-full" />}
                        </button>
                    </div>
                </div>

                {/* Promotions Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {displayPromotions.map(promo => (
                        <div key={promo.id} className="border border-gray-100 rounded-xl p-5 bg-gradient-to-br from-white to-gray-50 hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-base font-bold text-gray-900">{promo.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {promo.type === 'percentage' ? `${promo.value}% Off` :
                                            promo.type === 'flat' ? `₹${promo.value} Off` :
                                                `Buy ${promo.value} Get 1 Free`}
                                    </p>
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${promo.status === 'active'
                                        ? 'bg-green-50 text-green-700 border border-green-100'
                                        : 'bg-gray-50 text-gray-600 border border-gray-100'
                                    }`}>
                                    {promo.status}
                                </span>
                            </div>

                            <div className="bg-white border border-gray-100 rounded-lg p-3 mb-4">
                                <p className="text-xs text-gray-500 mb-1">Promo Code</p>
                                <p className="text-lg font-mono font-bold text-[#0c831f]">{promo.code}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500">Valid Period</p>
                                    <p className="text-xs font-bold text-gray-900">{promo.startDate} to {promo.endDate}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Usage</p>
                                    <p className="text-sm font-bold text-gray-900">{promo.used} / {promo.limit}</p>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                                        <div
                                            className="bg-[#0c831f] h-1.5 rounded-full"
                                            style={{ width: `${(promo.used / promo.limit) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500">Revenue Generated</p>
                                    <p className="text-sm font-bold text-gray-900">{formatCurrency(promo.revenue)}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-white rounded-lg transition-all">
                                        <Eye size={16} />
                                    </button>
                                    {promo.status === 'active' && (
                                        <>
                                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                                                <Edit2 size={16} />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                                                <Trash2 size={16} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Create Promotion Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md relative z-10 animate-in zoom-in-95 duration-200">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-gray-900">Create New Promotion</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1.5">Promotion Name</label>
                                <input type="text" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm" placeholder="e.g., Valentine's Day Special" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1.5">Promotion Type</label>
                                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm">
                                    <option>Percentage Discount</option>
                                    <option>Flat Discount</option>
                                    <option>Buy X Get Y</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-1.5">Start Date</label>
                                    <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 block mb-1.5">End Date</label>
                                    <input type="date" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-[#0c831f] focus:outline-none text-sm" />
                                </div>
                            </div>
                            <button className="w-full py-3 bg-[#0c831f] text-white font-bold rounded-lg hover:bg-[#0a6b19] transition-colors">
                                Create Promotion
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Promotions;
