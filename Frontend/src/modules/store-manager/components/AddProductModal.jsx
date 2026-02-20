import React, { useState, useEffect } from 'react';
import { X, Save, PlusCircle, Package, Fingerprint, Layers, IndianRupee, Database } from 'lucide-react';

const AddProductModal = ({ isOpen, onClose, onSave, editingProduct = null }) => {
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        price: '',
        stock: ''
    });

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                name: editingProduct.name,
                sku: editingProduct.sku,
                category: editingProduct.category,
                price: editingProduct.price,
                stock: editingProduct.stock
            });
        } else {
            setFormData({
                name: '',
                sku: '',
                category: '',
                price: '',
                stock: ''
            });
        }
    }, [editingProduct, isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'stock' ? (value === '' ? '' : Number(value)) : value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1060] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300" onClick={onClose}></div>

            <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-100">
                {/* Header Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600"></div>

                <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                                {editingProduct ? <Save size={20} /> : <PlusCircle size={20} />}
                            </div>
                            {editingProduct ? 'Update Asset' : 'Register New Asset'}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1 ml-11">Inventory Protocol v1.0</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-rose-500 active:scale-90">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-1.5">
                        <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            <Package size={12} className="text-blue-500" /> Asset Designation
                        </label>
                        <input
                            type="text"
                            name="name"
                            required
                            className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition-all duration-300 outline-none"
                            placeholder="Identify the product..."
                            value={formData.name}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <Fingerprint size={12} className="text-blue-500" /> SKU Signature
                            </label>
                            <input
                                type="text"
                                name="sku"
                                required
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition-all duration-300 outline-none"
                                placeholder="SKU-XXX-000"
                                value={formData.sku}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <Layers size={12} className="text-blue-500" /> Classification
                            </label>
                            <div className="relative">
                                <select
                                    name="category"
                                    required
                                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 appearance-none focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition-all duration-300 outline-none cursor-pointer"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Select Category</option>
                                    <option value="Vegetables">Vegetables</option>
                                    <option value="Fruits">Fruits</option>
                                    <option value="Dairy">Dairy</option>
                                    <option value="Bakery">Bakery</option>
                                    <option value="Snacks">Snacks</option>
                                </select>
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                    <Layers size={14} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <IndianRupee size={12} className="text-blue-500" /> Unit Valuation
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    name="price"
                                    required
                                    min="0"
                                    className="w-full pl-10 pr-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition-all duration-300 outline-none"
                                    placeholder="0.00"
                                    value={formData.price}
                                    onChange={handleChange}
                                />
                                <IndianRupee size={14} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                <Database size={12} className="text-blue-500" /> Initial Volume
                            </label>
                            <input
                                type="number"
                                name="stock"
                                required
                                min="0"
                                className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:ring-4 focus:ring-blue-100 focus:bg-white focus:border-blue-400 transition-all duration-300 outline-none"
                                placeholder="0"
                                value={formData.stock}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-4 px-6 border border-slate-100 text-slate-400 text-xs font-black rounded-2xl hover:bg-slate-50 hover:text-slate-600 transition-all uppercase tracking-widest"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-[1.5] py-4 px-6 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest active:scale-95"
                        >
                            {editingProduct ? <Save size={18} /> : <PlusCircle size={18} />}
                            {editingProduct ? 'Finalize Changes' : 'Execute Registration'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddProductModal;
