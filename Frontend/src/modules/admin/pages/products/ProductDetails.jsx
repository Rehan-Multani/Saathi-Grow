import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Package, ArrowLeft, Edit, Trash2, History,
    TrendingUp, ShoppingBag, IndianRupee, Layers, Info, 
    Thermometer, Weight, ShieldAlert, MapPin, Tag,
    ChevronLeft, ChevronRight, Camera, Sparkles, Check
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { getProductById, deleteProduct, updateProduct } from '../../api/productApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import ProductEditModal from '../../../../common/components/products/ProductEditModal';
import { showDeleteConfirmation } from '../../../../common/utils/alertUtils';

const ProductDetails = () => {
    const { id } = useParams();
    const { t } = useTranslation('admin_products');
    const { adminUser } = useAdminAuth();
    const navigate = useNavigate();
    
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeImage, setActiveImage] = useState(null);

    const fetchProduct = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getProductById(adminUser.token, id);
            setProduct(data);
            setActiveImage(data.image);
        } catch (error) {
            toast.error('Failed to load product details');
            navigate('/admin/products');
        } finally {
            setLoading(false);
        }
    }, [adminUser?.token, id, navigate]);

    useEffect(() => {
        if (adminUser?.token && id) fetchProduct();
    }, [adminUser?.token, id, fetchProduct]);

    const handleDelete = async () => {
        const result = await showDeleteConfirmation(
            'Delete product?',
            'Are you sure you want to permanently delete this product?'
        );
        if (result.isConfirmed) {
            try {
                await deleteProduct(adminUser.token, id);
                toast.success('Product deleted successfully');
                navigate('/admin/products');
            } catch (error) {
                toast.error(error.message);
            }
        }
    };

    const handleSaveEdit = async (formData) => {
        try {
            await updateProduct(adminUser.token, id, formData);
            toast.success('Product updated successfully');
            setShowEditModal(false);
            fetchProduct();
        } catch (error) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen gap-4">
                <div className="saathi-spinner"></div>
                <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-none">Loading Details...</p>
            </div>
        );
    }

    if (!product) return <div className="p-8 text-center font-bold text-slate-400 uppercase tracking-widest italic">Product Not Found</div>;

    const totalStock = product.vendor 
        ? (product.stock || 0) 
        : (product.branchStocks?.reduce((acc, curr) => acc + (curr.stock || 0), 0) || 0);

    return (
        <div className="min-h-screen bg-slate-50/30 p-4 md:p-8 font-sans text-slate-800">
            <div className="max-w-7xl mx-auto">
                {/* Breadcrumbs & Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/products')} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                                <Link to="/admin/products" className="hover:text-blue-600">Products</Link>
                                <span>/</span>
                                <span className="text-slate-600">Details</span>
                            </div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                                {product.name}
                                {product.isVeg ? (
                                    <div className="w-4 h-4 border border-emerald-500 flex items-center justify-center p-0.5 rounded-[2px] bg-white">
                                        <div className="w-full h-full bg-emerald-500 rounded-full" />
                                    </div>
                                ) : (
                                    <div className="w-4 h-4 border border-rose-500 flex items-center justify-center p-0.5 rounded-[2px] bg-white">
                                        <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[7px] border-b-rose-500" />
                                    </div>
                                )}
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button onClick={handleDelete} className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-rose-100 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2">
                            <Trash2 size={16} /> Delete
                        </button>
                        <button onClick={() => setShowEditModal(true)} className="flex-1 md:flex-none px-8 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold tracking-wider hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2">
                            <Edit size={16} /> Edit Product
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Visuals & Core Info */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 overflow-hidden">
                            <div className="flex-1 space-y-4">
                                <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 flex items-center justify-center relative group">
                                    {activeImage ? (
                                        <img src={activeImage} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500" />
                                    ) : (
                                        <Package size={64} className="text-slate-200" />
                                    )}
                                    <div className="absolute top-4 left-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${product.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border-rose-500/20'}`}>
                                            {product.status}
                                        </span>
                                    </div>
                                </div>
                                {/* Gallery Thumbnails */}
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                                    {[product.image, ...(product.gallery || [])].filter(Boolean).map((img, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => setActiveImage(img)}
                                            className={`w-16 h-16 rounded-xl border-2 transition-all shrink-0 overflow-hidden ${activeImage === img ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                        >
                                            <img src={img} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 space-y-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand</span>
                                    <h3 className="text-lg font-bold text-slate-900">{product.brandName || 'Unbranded'}</h3>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</span>
                                        <p className="text-sm font-semibold text-slate-700">{product.category}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sub-Category</span>
                                        <p className="text-sm font-semibold text-slate-700">{product.subCategory || '—'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Unit</span>
                                        <p className="text-sm font-semibold text-slate-700">{product.unitValue} {product.unitType}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SKU</span>
                                        <p className="text-sm font-mono font-bold text-blue-600 truncate">{product.sku}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-slate-50">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</span>
                                    <p className="text-xs text-slate-500 leading-relaxed max-h-32 overflow-y-auto scrollbar-thin">
                                        {product.description || 'No description provided for this product.'}
                                    </p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-4">
                                    {(product.tags || []).map((tag, i) => (
                                        <span key={i} className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-bold rounded-lg border border-slate-100 flex items-center gap-1.5 uppercase tracking-tighter">
                                            <Tag size={10} /> {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Inventory per Branch */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center px-8">
                                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <Layers size={18} className="text-blue-500" />
                                    Inventory Distribution
                                </h3>
                                <Link to={`/admin/products/${id}/inventory-logs`} className="text-[10px] font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 uppercase tracking-widest transition-all flex items-center gap-2">
                                    <History size={14} /> Full Log History
                                </Link>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/50 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-8 py-4">Branch / Location</th>
                                            <th className="px-6 py-4 text-center">Shelf</th>
                                            <th className="px-6 py-4 text-center">Current Stock</th>
                                            <th className="px-6 py-4 text-center">Threshold</th>
                                            <th className="px-8 py-4 text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {product.vendor ? (
                                            <tr className="hover:bg-slate-50/20 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center"><IndianRupee size={14} /></div>
                                                        <div>
                                                            <div className="text-xs font-bold text-slate-800">Vendor Stock</div>
                                                            <div className="text-[9px] text-slate-400 font-bold uppercase">{product.vendor.storeName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center text-xs font-bold text-slate-400">—</td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="text-sm font-black text-slate-900">{product.stock}</span>
                                                </td>
                                                <td className="px-6 py-5 text-center text-xs font-bold text-rose-500">{product.lowStockThreshold}</td>
                                                <td className="px-8 py-5 text-right">
                                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${product.stock > product.lowStockThreshold ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                                                        {product.stock > product.lowStockThreshold ? 'Healthy' : 'Low Stock'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ) : (
                                            (product.branchStocks || []).map((bs, i) => (
                                                <tr key={i} className="hover:bg-slate-50/20 transition-colors">
                                                    <td className="px-8 py-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"><MapPin size={14} /></div>
                                                            <div className="text-xs font-bold text-slate-800">{bs.branchId?.name || 'Branch'}</div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="px-2 py-1 bg-slate-50 text-[10px] font-bold text-slate-500 rounded-lg border border-slate-100 uppercase tracking-tight">
                                                            {product.physicalLocation || 'Not Set'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5 text-center">
                                                        <span className="text-sm font-black text-slate-900">{bs.stock}</span>
                                                    </td>
                                                    <td className="px-6 py-5 text-center text-xs font-bold text-rose-500">{bs.lowStockThreshold}</td>
                                                    <td className="px-8 py-5 text-right">
                                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${bs.stock > bs.lowStockThreshold ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-500 border-rose-100'}`}>
                                                            {bs.stock > bs.lowStockThreshold ? 'Healthy' : 'Low Stock'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Pricing & Quick Stats */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Pricing Card */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-8">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <IndianRupee size={18} className="text-emerald-500" />
                                Pricing Details
                            </h3>
                            
                            <div className="space-y-6">
                                <div className="flex justify-between items-center p-4 bg-emerald-50/30 rounded-2xl border border-emerald-100/50">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Selling Price</span>
                                        <div className="text-2xl font-black text-slate-900 tracking-tighter italic">₹{product.basePrice?.toLocaleString()}</div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">MRP</span>
                                        <div className="text-lg font-bold text-slate-400 line-through tracking-tighter">₹{product.mrp?.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Margin</span>
                                        <div className="text-sm font-black text-emerald-600">
                                            {product.mrp && product.basePrice ? `${(((product.mrp - product.basePrice) / product.mrp) * 100).toFixed(1)}%` : '0%'}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Savings</span>
                                        <div className="text-sm font-black text-blue-600">
                                            ₹{(product.mrp - product.basePrice) || 0}
                                        </div>
                                    </div>
                                </div>
                                
                                {product.purchasePrice && (
                                    <div className="flex justify-between items-center px-4 py-3 border-t border-slate-50">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Purchase Price</span>
                                        <span className="text-xs font-bold text-slate-700 italic">₹{product.purchasePrice.toLocaleString()}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Handling & Logistics */}
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-tight flex items-center gap-2">
                                <Info size={18} className="text-amber-500" />
                                Logistics & Handling
                            </h3>
                            
                            <div className="space-y-4">
                                {[
                                    { icon: <Thermometer size={16} />, label: 'Temperature', value: product.temperatureType || 'Normal', color: 'blue' },
                                    { icon: <Weight size={16} />, label: 'Weight Category', value: product.weightCategory || 'Light', color: 'orange' },
                                    { icon: <ShieldAlert size={16} />, label: 'Is Fragile?', value: product.isFragile ? 'Yes' : 'No', color: product.isFragile ? 'rose' : 'slate' },
                                    { icon: <Tag size={16} />, label: 'HSN Code', value: product.hsnCode || '—', color: 'slate' }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-lg bg-${item.color}-50 text-${item.color}-500 flex items-center justify-center shrink-0`}>
                                                {item.icon}
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">{item.label}</span>
                                        </div>
                                        <span className={`text-xs font-bold text-slate-900 ${item.value === 'Yes' ? 'text-rose-600' : ''}`}>{item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* QR Code Quick Look */}
                        <div className="bg-slate-900 rounded-[2.5rem] shadow-xl p-8 flex flex-col items-center text-center space-y-6">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-2">Registry QR Code</div>
                            <div className="p-4 bg-white rounded-3xl shadow-inner group transition-transform hover:scale-105 duration-300">
                                <QRCodeSVG value={product.sku} size={160} />
                            </div>
                            <div className="space-y-1">
                                <div className="text-xs font-mono font-bold text-white uppercase tracking-widest">{product.sku}</div>
                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Scan to track in warehouse</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <ProductEditModal 
                show={showEditModal} 
                onHide={() => setShowEditModal(false)} 
                product={product} 
                onSave={handleSaveEdit} 
            />

            <style dangerouslySetInnerHTML={{ __html: `
                .saathi-spinner { width: 32px; height: 32px; border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .scrollbar-none::-webkit-scrollbar { display: none; }
                .scrollbar-thin::-webkit-scrollbar { width: 4px; }
                .scrollbar-thin::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}} />
        </div>
    );
};

export default ProductDetails;
