import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Edit, Trash2, QrCode, Upload, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

const PRODUCTS_MOCK = [
    { id: '1', name: 'Premium Wireless Headset', brand: 'Sony', category: 'Electronics', price: 120.00, stock: 45, location: 'L1-F1', sku: 'ELEC-HEAD-001', status: 'Active' },
    { id: '2', name: 'Organic Bananas (1kg)', brand: 'FreshFarm', category: 'Groceries', price: 4.50, stock: 120, location: 'L2-F1', sku: 'GROC-BAN-002', status: 'Active' },
    { id: '3', name: 'Cotton T-Shirt', brand: 'H&M', category: 'Clothing', price: 25.00, stock: 15, location: 'L1-F2', sku: 'CLOTH-TSHIRT-003', status: 'Low Stock' },
    { id: '4', name: 'Gaming Laptop', brand: 'Dell', category: 'Electronics', price: 1250.00, stock: 0, location: 'Secure-1', sku: 'ELEC-LAP-004', status: 'Out of Stock' },
];

const ProductStatusBadge = ({ status }) => {
    const variants = {
        Active: 'bg-green-100 text-green-700',
        'Low Stock': 'bg-amber-100 text-amber-700',
        'Out of Stock': 'bg-red-100 text-red-700',
        Draft: 'bg-gray-100 text-gray-700'
    };
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[status] || 'bg-gray-100 text-gray-600'}`}>
            {status}
        </span>
    );
};

const AllProducts = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showQR, setShowQR] = useState(null);

    const filteredProducts = PRODUCTS_MOCK.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 p-4">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div className="w-full md:max-w-xs">
                        <h5 className="mb-3 font-bold text-gray-800 text-lg md:mb-0 md:hidden">Product Inventory</h5>
                        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden w-full focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                            <div className="pl-3 text-gray-400">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search Name, SKU..."
                                className="w-full px-3 py-2 bg-transparent border-none outline-none text-sm text-gray-700"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto">
                        <h5 className="hidden md:block mb-0 font-bold text-gray-800 text-lg">Product Inventory</h5>

                        <div className="grid grid-cols-3 gap-3 w-full md:w-auto">
                            <button className="flex items-center justify-center gap-2 px-3 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium shadow-sm">
                                <Upload size={20} />
                                <span className="hidden sm:inline">Import</span>
                            </button>
                            <button className="flex items-center justify-center gap-2 px-3 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium shadow-sm">
                                <Download size={20} />
                                <span className="hidden sm:inline">Export</span>
                            </button>
                            <Link
                                to="/admin/products/add"
                                className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors whitespace-nowrap shadow-sm"
                            >
                                <Plus size={20} />
                                <span className="hidden sm:inline">Add Product</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                            <tr>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Brand</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">SKU</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map((p, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-500 font-bold">
                                                {p.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800">{p.name}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{p.brand}</td>
                                    <td className="px-6 py-4 text-gray-500">{p.category}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm font-mono">{p.sku}</td>
                                    <td className="px-6 py-4 font-bold text-gray-800">₹{p.price.toFixed(2)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`font-medium ${p.stock === 0 ? 'text-red-600' : 'text-gray-700'}`}>
                                            {p.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{p.location || 'N/A'}</td>
                                    <td className="px-6 py-4"><ProductStatusBadge status={p.status} /></td>
                                    <td className="px-6 py-4 text-right relative">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                className={`p-1.5 rounded bg-gray-50 hover:bg-gray-200 transition-colors ${showQR === p.id ? 'text-blue-600 bg-blue-50' : 'text-gray-500'}`}
                                                title="View QR"
                                                onClick={() => setShowQR(showQR === p.id ? null : p.id)}
                                            >
                                                <QrCode size={16} />
                                            </button>
                                            <button className="p-1.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Edit">
                                                <Edit size={16} />
                                            </button>
                                            <button className="p-1.5 rounded bg-red-50 text-red-600 hover:bg-red-100 transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                        {showQR === p.id && (
                                            <div className="absolute right-10 top-12 bg-white shadow-xl p-3 rounded-xl border border-gray-100 z-10 text-center animate-in fade-in zoom-in-95 duration-200">
                                                <QRCodeSVG value={p.sku} size={100} />
                                                <div className="text-xs mt-2 text-gray-500">{p.sku}</div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AllProducts;
