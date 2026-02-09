import React, { useState } from 'react';
import { Plus, Trash2, Settings, Info, Box, Layers, Hash, ArrowRight, X, Search, Filter, CheckCircle2 } from 'lucide-react';

const ProductAttributes = () => {
    const [attributes, setAttributes] = useState([
        { id: 1, name: 'Color', group: 'Display', type: 'Dropdown', values: 'Red, Green, Blue', active: true },
        { id: 2, name: 'Weight', group: 'Logistics', type: 'Number', values: '0.5kg, 1kg, 2kg', active: true },
        { id: 3, name: 'Size', group: 'Physical', type: 'Text', values: 'S, M, L, XL', active: false },
        { id: 4, name: 'Material', group: 'Display', type: 'Dropdown', values: 'Cotton, Polyester, Silk', active: true },
        { id: 5, name: 'Brand', group: 'Brand Specific', type: 'Text', values: 'Nike, Adidas, Puma', active: true },
    ]);

    const [showModal, setShowModal] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [groupFilter, setGroupFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const [formData, setFormData] = useState({
        name: '',
        group: 'Display',
        type: 'Dropdown',
        values: '',
        active: true
    });

    const groups = ['Display', 'Logistics', 'Physical', 'Brand Specific'];

    // Filter attributes
    const filteredAttributes = attributes.filter(attr => {
        const matchesSearch = attr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attr.values.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGroup = groupFilter === 'all' || attr.group === groupFilter;
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && attr.active) ||
            (statusFilter === 'inactive' && !attr.active);
        return matchesSearch && matchesGroup && matchesStatus;
    });

    // Calculate stats
    const activeCount = attributes.filter(a => a.active).length;
    const totalGroups = [...new Set(attributes.map(a => a.group))].length;
    const usageRate = Math.round((activeCount / attributes.length) * 100);

    const handleOpenModal = (attribute = null) => {
        if (attribute) {
            setEditingAttribute(attribute);
            setFormData(attribute);
        } else {
            setEditingAttribute(null);
            setFormData({
                name: '',
                group: 'Display',
                type: 'Dropdown',
                values: '',
                active: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingAttribute(null);
        setFormData({
            name: '',
            group: 'Display',
            type: 'Dropdown',
            values: '',
            active: true
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name.trim() || !formData.values.trim()) return;

        if (editingAttribute) {
            setAttributes(attributes.map(attr =>
                attr.id === editingAttribute.id ? { ...formData, id: attr.id } : attr
            ));
        } else {
            setAttributes([...attributes, { ...formData, id: Date.now() }]);
        }
        handleCloseModal();
    };

    const handleDelete = (id) => {
        setDeletingId(id);
    };

    const confirmDelete = (id) => {
        setAttributes(attributes.filter(attr => attr.id !== id));
        setDeletingId(null);
    };

    const cancelDelete = () => {
        setDeletingId(null);
    };

    const getGroupColor = (group) => {
        const colors = {
            'Display': 'bg-blue-50 text-blue-700 border-blue-200',
            'Logistics': 'bg-purple-50 text-purple-700 border-purple-200',
            'Physical': 'bg-green-50 text-green-700 border-green-200',
            'Brand Specific': 'bg-orange-50 text-orange-700 border-orange-200'
        };
        return colors[group] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    return (
        <div className="space-y-4 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                    <h1 className="text-base font-bold text-gray-900">Product Attributes</h1>
                    <p className="text-[10px] text-gray-500 font-medium">Define custom product specifications</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="px-4 py-1.5 bg-[#0c831f] text-white rounded-lg text-xs font-bold hover:bg-[#0a6b19] transition-colors flex items-center gap-1.5"
                >
                    <Plus size={14} />
                    New Attribute
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: 'Active', val: activeCount, icon: Layers, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Groups', val: totalGroups, icon: Box, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Usage', val: `${usageRate}%`, icon: Hash, color: 'text-orange-600', bg: 'bg-orange-50' }
                ].map((s, i) => (
                    <div key={i} className="premium-card p-3 flex items-center gap-3">
                        <div className={`w-8 h-8 ${s.bg} ${s.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <s.icon size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase">{s.label}</p>
                            <p className="text-lg font-bold text-gray-900 leading-none mt-0.5">{s.val}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Filters */}
            <div className="premium-card p-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search attributes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-[#0c831f] focus:outline-none text-xs"
                        />
                    </div>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            <select
                                value={groupFilter}
                                onChange={(e) => setGroupFilter(e.target.value)}
                                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg pl-8 pr-8 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#0c831f] cursor-pointer"
                            >
                                <option value="all">All Groups</option>
                                {groups.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none bg-gray-50 border border-gray-200 rounded-lg px-3 pr-8 py-1.5 text-xs font-bold text-gray-700 focus:outline-none focus:border-[#0c831f] cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Attributes List */}
            <div className="premium-card overflow-hidden">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Name</th>
                                <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Group</th>
                                <th className="px-4 py-2 text-left text-[10px] font-bold text-gray-500 uppercase">Values</th>
                                <th className="px-4 py-2 text-center text-[10px] font-bold text-gray-500 uppercase">Status</th>
                                <th className="px-4 py-2 text-right text-[10px] font-bold text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredAttributes.map((attr) => (
                                <tr key={attr.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3">
                                        <p className="text-sm font-bold text-gray-900">{attr.name}</p>
                                        <p className="text-[10px] text-gray-500 mt-0.5">{attr.type}</p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${getGroupColor(attr.group)}`}>
                                            {attr.group}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p className="text-xs text-gray-600 truncate max-w-xs">{attr.values}</p>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        {attr.active ? (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                                <CheckCircle2 size={10} />
                                                Active
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                                                Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        {deletingId === attr.id ? (
                                            <div className="flex justify-end">
                                                <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-400/40 rounded-lg p-2 animate-in slide-in-from-top-2 duration-200">
                                                    <p className="text-xs font-bold text-gray-900 mb-2">Delete?</p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={cancelDelete}
                                                            className="px-2 py-1 bg-white text-gray-700 text-xs font-bold rounded hover:bg-gray-100"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => confirmDelete(attr.id)}
                                                            className="px-2 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleOpenModal(attr)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded transition-all"
                                                >
                                                    <Settings size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(attr.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">
                    {filteredAttributes.map((attr) => (
                        <div key={attr.id} className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{attr.name}</p>
                                    <p className="text-[10px] text-gray-500">{attr.type}</p>
                                </div>
                                {attr.active ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-200">
                                        <CheckCircle2 size={10} />
                                        Active
                                    </span>
                                ) : (
                                    <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-full border border-gray-200">
                                        Inactive
                                    </span>
                                )}
                            </div>
                            <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-full border ${getGroupColor(attr.group)}`}>
                                {attr.group}
                            </span>
                            <p className="text-xs text-gray-600">{attr.values}</p>
                            {deletingId === attr.id ? (
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-400/40 rounded-lg p-3">
                                    <p className="text-xs font-bold text-gray-900 mb-2">Delete this attribute?</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={cancelDelete}
                                            className="flex-1 px-3 py-1.5 bg-white text-gray-700 text-xs font-bold rounded hover:bg-gray-100"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => confirmDelete(attr.id)}
                                            className="flex-1 px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex gap-2 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => handleOpenModal(attr)}
                                        className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded hover:bg-gray-200 flex items-center justify-center gap-1"
                                    >
                                        <Settings size={12} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(attr.id)}
                                        className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-bold rounded hover:bg-red-100 flex items-center justify-center gap-1"
                                    >
                                        <Trash2 size={12} />
                                        Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {filteredAttributes.length === 0 && (
                    <div className="p-12 text-center">
                        <Search size={32} className="text-gray-300 mx-auto mb-3" />
                        <h3 className="text-sm font-bold text-gray-900">No attributes found</h3>
                        <p className="text-xs text-gray-500 mt-1">Try adjusting your search or filters</p>
                    </div>
                )}
            </div>

            {/* Pro Tip */}
            <div className="premium-card p-4 bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Info size={16} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-xs font-bold text-purple-900 mb-1">Pro Tip</h3>
                        <p className="text-xs text-purple-700 leading-relaxed">
                            Defining detailed attributes like 'Weight' or 'Color' helps customers find your products faster using filters.
                        </p>
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={handleCloseModal}>
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between p-4 border-b border-gray-100">
                            <h2 className="text-base font-bold text-gray-900">
                                {editingAttribute ? 'Edit Attribute' : 'New Attribute'}
                            </h2>
                            <button onClick={handleCloseModal} className="p-1 hover:bg-gray-100 rounded transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Attribute Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g., Color, Size, Weight"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Group</label>
                                    <select
                                        value={formData.group}
                                        onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none cursor-pointer"
                                    >
                                        {groups.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none cursor-pointer"
                                    >
                                        <option value="Dropdown">Dropdown</option>
                                        <option value="Number">Number</option>
                                        <option value="Text">Text</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Values (comma separated)</label>
                                <textarea
                                    value={formData.values}
                                    onChange={(e) => setFormData({ ...formData, values: e.target.value })}
                                    placeholder="e.g., Red, Green, Blue"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:border-[#0c831f] focus:outline-none resize-none"
                                    rows="3"
                                    required
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    className="w-4 h-4 text-[#0c831f] border-gray-300 rounded focus:ring-[#0c831f]"
                                />
                                <label htmlFor="active" className="text-sm font-bold text-gray-700 cursor-pointer">
                                    Active attribute
                                </label>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-[#0c831f] text-white text-sm font-bold rounded-lg hover:bg-[#0a6b19] flex items-center justify-center gap-2"
                                >
                                    <CheckCircle2 size={14} />
                                    {editingAttribute ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductAttributes;
