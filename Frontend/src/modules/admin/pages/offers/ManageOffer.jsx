import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Plus, Trash2, ArrowLeft, Image as ImageIcon, Sparkles, LayoutGrid, Upload, Percent, Loader2, Calendar, Shield, Info, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createOfferDeal, updateOfferDeal, getOfferDealById } from '../../api/offerDealApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import ProductPickerModal from '../../../../common/components/forms/ProductPickerModal';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const ManageOffer = () => {
    const { t } = useTranslation('admin_offers');
    const { id } = useParams();
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(id ? true : false);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [showPicker, setShowPicker] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        description: '',
        bgColor: '#f8fafc',
        textColor: '#1e293b',
        accentColor: '#3b82f6',
        isActive: true,
        displayLocation: 'Home Slider',
        expiryDate: '',
        discountPercentage: 0,
        animationType: 'Default',
        backgroundEffect: 'None'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (id) {
                    const offer = await getOfferDealById(adminUser.token, id);
                    setFormData({
                        title: offer.title || '',
                        subtitle: offer.subtitle || '',
                        description: offer.description || '',
                        bgColor: offer.bgColor || '#f8fafc',
                        textColor: offer.textColor || '#1e293b',
                        accentColor: offer.accentColor || '#3b82f6',
                        isActive: offer.isActive !== undefined ? offer.isActive : true,
                        displayLocation: offer.displayLocation || 'Home Slider',
                        expiryDate: offer.expiryDate ? new Date(offer.expiryDate).toISOString().split('T')[0] : '',
                        discountPercentage: offer.discountPercentage || 0,
                        animationType: offer.animationType || 'Default',
                        backgroundEffect: offer.backgroundEffect || 'None'
                    });
                    setImagePreview(offer.bannerImage);
                    setSelectedProducts(offer.products.map(p => ({
                        productId: p.productId?._id || p.productId,
                        name: p.productId?.name,
                        image: p.productId?.image,
                        mrp: p.productId?.mrp || p.productId?.basePrice,
                        basePrice: p.basePrice || p.productId?.basePrice
                    })));
                }
            } catch (error) {
                toast.error(t('messages.fetch_error'));
            } finally {
                setFetching(false);
            }
        };
        if (adminUser?.token) fetchData();
    }, [id, adminUser, t]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDiscountChange = (e) => {
        const percent = Number(e.target.value);
        setFormData(prev => ({ ...prev, discountPercentage: percent }));

        if (selectedProducts.length > 0) {
            setSelectedProducts(prev => prev.map(p => ({
                ...p,
                basePrice: Math.round(p.mrp * (1 - percent / 100))
            })));
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handlePickerSelect = (newProducts) => {
        const formatted = newProducts.map(product => {
            const mrp = product.mrp || product.basePrice;
            const initialBasePrice = formData.discountPercentage > 0
                ? Math.round(mrp * (1 - formData.discountPercentage / 100))
                : (product.currentPrice || product.basePrice);

            return {
                productId: product._id,
                name: product.name,
                image: product.image,
                mrp: mrp,
                basePrice: initialBasePrice
            };
        });

        setSelectedProducts([...selectedProducts, ...formatted]);
    };

    const removeProduct = (productId) => {
        setSelectedProducts(selectedProducts.filter(p => p.productId !== productId));
    };

    const handlePriceChange = (productId, price) => {
        setSelectedProducts(selectedProducts.map(p =>
            p.productId === productId ? { ...p, basePrice: price === '' ? '' : Number(price) } : p
        ));
    };

    const paginatedProducts = selectedProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(selectedProducts.length / itemsPerPage);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!id && !fileInputRef.current?.files[0]) {
            return toast.error(t('messages.image_required'));
        }

        if (formData.expiryDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (new Date(formData.expiryDate) <= today) {
                return toast.error(t('messages.date_error'));
            }
        }

        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));

            if (fileInputRef.current?.files[0]) {
                data.append('bannerImage', fileInputRef.current.files[0]);
            }

            const productsPayload = selectedProducts.map(p => ({
                productId: p.productId,
                basePrice: p.basePrice
            }));
            data.append('products', JSON.stringify(productsPayload));

            if (id) {
                await updateOfferDeal(adminUser.token, id, data);
                toast.success(t('messages.update_success'));
            } else {
                await createOfferDeal(adminUser.token, data);
                toast.success(t('messages.create_success'));
            }
            navigate('/admin/offers/deals');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex justify-center items-center py-24 min-h-[400px]">
                <Loader2 size={40} className="text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container-fluid py-6 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="mb-8">
                <button
                    onClick={() => navigate('/admin/offers/deals')}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-4 group font-semibold"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-wider">{t('form.cancel')}</span>
                </button>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                            <ImageIcon size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">
                                {id ? t('form.edit_title') : t('form.add_title')}
                            </h1>
                            <p className="text-slate-500 text-xs font-medium mt-0.5">{t('form.breadcrumb')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start mb-24">
                {/* Visuals & Form */}
                <div className="xl:col-span-5 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{t('form.visuals_section')}</h3>
                        </div>

                        {/* Image Upload */}
                        <div 
                            className="relative aspect-[21/9] rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 group overflow-hidden transition-all shadow-inner"
                            onClick={() => fileInputRef.current.click()}
                        >
                            {imagePreview ? (
                                <img src={imagePreview} className="w-full h-full object-cover" alt="Banner" />
                            ) : (
                                <div className="text-center p-6 space-y-2">
                                    <div className="text-blue-600 bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <Upload size={20} />
                                    </div>
                                    <div className="text-xs font-bold text-slate-700 uppercase tracking-tight">{t('form.upload_text')}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">{t('form.recommended_size')}</div>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>

                        {/* Fields */}
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.offer_title')}</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder={t('form.offer_title_placeholder')}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.subtitle')}</label>
                                <input
                                    type="text"
                                    name="subtitle"
                                    value={formData.subtitle}
                                    onChange={handleChange}
                                    placeholder={t('form.subtitle_placeholder')}
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.discount')}</label>
                                    <div className="relative">
                                        <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                        <input
                                            type="number"
                                            name="discountPercentage"
                                            value={formData.discountPercentage}
                                            onChange={handleDiscountChange}
                                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.expiry_date')}</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                        <input
                                            type="date"
                                            name="expiryDate"
                                            value={formData.expiryDate}
                                            onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-all text-sm font-bold text-slate-700"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-50 space-y-4">
                                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.visual_branding')}</label>
                                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{t('form.bg_color')}</span>
                                        <input type="color" name="bgColor" value={formData.bgColor} onChange={handleChange} className="w-8 h-8 rounded-lg border-none shadow-sm cursor-pointer p-0" />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{t('form.text_color')}</span>
                                        <input type="color" name="textColor" value={formData.textColor} onChange={handleChange} className="w-8 h-8 rounded-lg border-none shadow-sm cursor-pointer p-0" />
                                    </div>
                                    <div className="flex items-center justify-between md:col-span-2">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase">{t('form.accent_color')}</span>
                                        <input type="color" name="accentColor" value={formData.accentColor} onChange={handleChange} className="w-8 h-8 rounded-lg border-none shadow-sm cursor-pointer p-0" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl text-white shadow-lg">
                                <div className="flex items-center gap-3">
                                    <Shield size={18} className="text-blue-400" />
                                    <div>
                                        <div className="text-[11px] font-bold uppercase tracking-tight">{t('form.live_toggle')}</div>
                                        <p className="text-[9px] text-slate-500 font-medium uppercase">{formData.isActive ? 'Visible' : 'Hidden'}</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    />
                                    <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Products Section */}
                <div className="xl:col-span-7 space-y-6">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 flex flex-col min-h-[600px]">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-4 mb-6">
                            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-tight">{t('form.collection_section')}</h3>
                            <button 
                                type="button"
                                onClick={() => setShowPicker(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[10px] font-bold uppercase shadow-lg shadow-blue-100 flex items-center gap-2 transition-all active:scale-95"
                            >
                                <Plus size={14} /> {t('form.add_products')}
                            </button>
                        </div>

                        <div className="flex-grow overflow-x-auto scrollbar-thin">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase text-left">{t('form.table_product')}</th>
                                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">{t('form.table_mrp')}</th>
                                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase text-center">{t('form.table_selling')}</th>
                                        <th className="px-4 py-4 text-[10px] font-bold text-slate-400 uppercase text-end">{t('form.table_remove')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedProducts.length > 0 ? (
                                        paginatedProducts.map((p) => (
                                            <tr key={p.productId} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-4 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-lg border border-slate-100 overflow-hidden shadow-sm flex-shrink-0">
                                                            <img src={p.image} className="w-full h-full object-cover" alt="" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-[11px] font-bold text-slate-800 uppercase truncate max-w-[140px]">{p.name}</div>
                                                            <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">ID: {p.productId.slice(-6)}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className="text-slate-400 text-xs font-bold line-through">₹{p.mrp}</span>
                                                </td>
                                                <td className="px-4 py-4 text-center" style={{ width: '120px' }}>
                                                    <input
                                                        type="number"
                                                        value={p.basePrice}
                                                        onChange={(e) => handlePriceChange(p.productId, e.target.value)}
                                                        className="w-full px-2 py-1.5 bg-blue-50/50 border-none rounded-lg text-center text-xs font-bold text-blue-600 focus:ring-1 ring-blue-500/20"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProduct(p.productId)}
                                                        className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-24 text-center opacity-30">
                                                <LayoutGrid size={48} className="mx-auto text-slate-300 mb-2" />
                                                <p className="text-xs font-bold uppercase tracking-widest">{t('form.no_products')}</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    Total Items: {selectedProducts.length}
                                </span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(c => c - 1)}
                                        className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <span className="text-[10px] font-bold text-slate-600 px-2">{currentPage} / {totalPages}</span>
                                    <button 
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(c => c + 1)}
                                        className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-30"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </form>

            <div className="bg-white/95 border-t border-slate-200 fixed bottom-0 left-0 right-0 z-[60] ml-0 lg:ml-[260px] p-4 px-8 flex items-center justify-between shadow-lg backdrop-blur-sm">
                <div className="hidden md:flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${formData.isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{formData.isActive ? 'Ready to Publish' : 'Draft Mode'}</span>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <button 
                        onClick={() => navigate('/admin/offers/deals')}
                        className="px-8 py-3 text-slate-400 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 rounded-xl"
                    >
                        {t('form.cancel')}
                    </button>
                    <button 
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 md:flex-none px-12 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        {id ? t('form.update') : t('form.publish')}
                    </button>
                </div>
            </div>

            <ProductPickerModal
                show={showPicker}
                onHide={() => setShowPicker(false)}
                onSelect={handlePickerSelect}
                existingProductIds={selectedProducts.map(p => p.productId)}
                token={adminUser?.token}
            />
        </div>
    );
};

export default ManageOffer;
