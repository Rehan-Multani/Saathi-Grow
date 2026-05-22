import React, { useState, useEffect, useRef } from 'react';
import { Save, X, Plus, Trash2, ArrowLeft, Image as ImageIcon, Sparkles, LayoutGrid, Upload, Percent, Loader2, Calendar, Shield, Info, ArrowRight, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { createOfferDeal, updateOfferDeal, getOfferDealById } from '../../api/offerDealApi';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { toast } from 'react-toastify';
import ProductPickerModal from '../../../../common/components/forms/ProductPickerModal';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const LiveBannerPreview = ({ formData, imagePreview }) => {
    const { t } = useTranslation('admin_offers');
    
    return (
        <div className="space-y-4 pt-2">
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 flex flex-col items-center gap-3">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{t('form.live_preview')}</span>
                
                {/* Mobile-style Container Mockup */}
                <div className="w-full max-w-[340px] aspect-[21/9] rounded-2xl overflow-hidden shadow-2xl relative group border border-slate-200" style={{ backgroundColor: formData.bgColor }}>
                    <div className="absolute inset-0 flex items-center px-4 py-2">
                        {/* Text Content */}
                        <div className="z-10 w-1/2 space-y-1">
                            <h4 className="text-[14px] font-black leading-tight break-words" style={{ color: formData.textColor }}>
                                {formData.title || 'Banner Title'}
                            </h4>
                            <p className="text-[9px] font-bold opacity-80" style={{ color: formData.textColor }}>
                                {formData.subtitle || 'Add a catchy subtitle'}
                            </p>
                            {formData.discountPercentage > 0 && (
                                <div className="mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: formData.accentColor }}>
                                    {formData.discountPercentage}% OFF
                                </div>
                            )}
                        </div>
                        
                        {/* Image Side */}
                        <div className="w-1/2 h-full flex items-center justify-center p-2">
                            {imagePreview ? (
                                <img src={imagePreview} className="max-h-full max-w-full object-contain filter drop-shadow-xl" alt="" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                                    <ImageIcon size={20} className="text-white opacity-40" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full mt-2">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight mb-1">Accent Color</p>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: formData.accentColor }} />
                            <span className="text-[10px] font-bold text-slate-700 font-mono uppercase">{formData.accentColor}</span>
                        </div>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-tight mb-1">Text Readability</p>
                        <div className="flex items-center gap-2 text-[10px] font-extrabold" style={{ color: formData.textColor }}>
                            Sample Text
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
        discountPercentage: '',
        animationType: 'Default',
        backgroundEffect: 'None',
        displayOrder: ''
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
                        discountPercentage: offer.discountPercentage !== undefined ? offer.discountPercentage : '',
                        animationType: offer.animationType || 'Default',
                        backgroundEffect: offer.backgroundEffect || 'None',
                        displayOrder: offer.displayOrder !== undefined ? offer.displayOrder : ''
                    });
                    setImagePreview(offer.bannerImage);
                    setSelectedProducts(offer.products
                        .filter(p => p.productId)
                        .map(p => ({
                            productId: p.productId?._id || p.productId,
                            name: p.productId?.name,
                            image: p.productId?.image,
                            mrp: p.productId?.mrp || p.productId?.basePrice,
                            basePrice: p.basePrice || p.productId?.basePrice
                        })));
                }
            } catch (error) {
                // toast.error(t('messages.fetch_error'));
            } finally {
                setFetching(false);
            }
        };
        if (adminUser?.token) fetchData();
    }, [id, adminUser, t]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let finalValue = type === 'checkbox' ? checked : value;
        if (name === 'displayOrder') {
            finalValue = value === '' ? '' : Number(value);
        }
        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
    };

    const handleDiscountChange = (e) => {
        const value = e.target.value;
        const percent = value === '' ? '' : Number(value);
        setFormData(prev => ({ ...prev, discountPercentage: percent }));

        if (selectedProducts.length > 0) {
            const numericPercent = Number(percent) || 0;
            setSelectedProducts(prev => prev.map(p => ({
                ...p,
                basePrice: Math.round(p.mrp * (1 - numericPercent / 100))
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
            Object.keys(formData).forEach(key => {
                let value = formData[key];
                if (key === 'discountPercentage' && value === '') value = 0;
                if (key === 'displayOrder' && value === '') value = 0;
                data.append(key, value);
            });

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
        <div className="container-fluid py-2 bg-slate-50/20 min-h-screen px-4 md:px-6 max-w-7xl mx-auto font-sans text-slate-800">
            {/* Header Area */}
            <div className="mb-4">
                <button
                    onClick={() => navigate('/admin/offers/deals')}
                    className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors mb-2 group font-semibold"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] uppercase tracking-wider">{t('form.back')}</span>
                </button>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                            <ImageIcon size={20} />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold tracking-tight leading-tight">
                                {id ? t('form.edit_title') : t('form.add_title')}
                            </h1>
                            <p className="text-slate-500 text-[10px] font-medium mt-0.5 uppercase tracking-wider">{t('form.breadcrumb')}</p>
                        </div>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-24">
                {/* Left Side: Large Form Card (8 columns) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 space-y-8">
                        {/* Section 1: General Information */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100/50">
                                    <LayoutGrid size={20} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 border-b-2 border-blue-500 inline-block">1. {t('form.promo_details')}</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.offer_title')} <span className="text-rose-500">*</span></label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder={t('form.offer_title_placeholder')}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-sm"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.subtitle')}</label>
                                    <input
                                        type="text"
                                        name="subtitle"
                                        value={formData.subtitle}
                                        onChange={handleChange}
                                        placeholder={t('form.subtitle_placeholder')}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.discount')}</label>
                                    <div className="relative">
                                        <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                        <input
                                            type="number"
                                            name="discountPercentage"
                                            value={formData.discountPercentage}
                                            onChange={handleDiscountChange}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-tight ml-1">{t('form.expiry_date')}</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={14} />
                                        <input
                                            type="date"
                                            name="expiryDate"
                                            value={formData.expiryDate}
                                            onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:bg-white transition-all text-sm font-bold text-slate-700 shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Branding Settings */}
                        <div className="space-y-6 pt-4">
                            <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                                <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100/50">
                                    <Shield size={20} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 border-b-2 border-purple-500 inline-block">2. {t('form.visual_branding')}</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2 p-4 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner flex flex-col items-center justify-center gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('form.bg_color')}</label>
                                    <input type="color" name="bgColor" value={formData.bgColor} onChange={handleChange} className="w-12 h-12 rounded-2xl border-none shadow-lg cursor-pointer p-0 overflow-hidden" />
                                    <span className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase">{formData.bgColor}</span>
                                </div>
                                <div className="space-y-2 p-4 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner flex flex-col items-center justify-center gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('form.text_color')}</label>
                                    <input type="color" name="textColor" value={formData.textColor} onChange={handleChange} className="w-12 h-12 rounded-2xl border-none shadow-lg cursor-pointer p-0 overflow-hidden" />
                                    <span className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase">{formData.textColor}</span>
                                </div>
                                <div className="space-y-2 p-4 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner flex flex-col items-center justify-center gap-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t('form.accent_color')}</label>
                                    <input type="color" name="accentColor" value={formData.accentColor} onChange={handleChange} className="w-12 h-12 rounded-2xl border-none shadow-lg cursor-pointer p-0 overflow-hidden" />
                                    <span className="text-[10px] font-mono font-bold text-slate-400 mt-1 uppercase">{formData.accentColor}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 4: Collection/Products Table */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col min-h-[400px]">
                        <div className="flex items-center justify-between border-b border-slate-50 pb-6 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/50">
                                    <ImageIcon size={20} />
                                </div>
                                <h3 className="text-sm font-bold text-slate-900 border-b-2 border-emerald-500 inline-block uppercase">4. {t('form.collection_section')}</h3>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setShowPicker(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 flex items-center gap-2 transition-all active:scale-95"
                            >
                                <Plus size={14} /> {t('form.add_products')}
                            </button>
                        </div>

                        <div className="flex-grow overflow-x-auto scrollbar-thin">
                            <table className="w-full border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-left">{t('form.table_product')}</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{t('form.table_mrp')}</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">{t('form.table_selling')}</th>
                                        <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-end">{t('form.table_remove')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {paginatedProducts.length > 0 ? (
                                        paginatedProducts.map((p) => (
                                            <tr key={p.productId} className="hover:bg-slate-50/30 transition-colors group">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-14 h-14 rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex-shrink-0 bg-white p-1">
                                                            <img src={p.image} className="w-full h-full object-contain" alt="" />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="text-[11px] font-black text-slate-800 uppercase truncate max-w-[240px] tracking-tight">{p.name}</div>
                                                            <div className="text-[9px] text-slate-300 font-black mt-1">Ref ID: {p.productId?.slice?.(-10) || 'N/A'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-center">
                                                    <span className="text-slate-400 text-xs font-black line-through italic">₹{p.mrp}</span>
                                                </td>
                                                <td className="px-6 py-5 text-center" style={{ width: '160px' }}>
                                                    <div className="relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-300 text-[10px] font-black">₹</span>
                                                        <input
                                                            type="number"
                                                            value={p.basePrice}
                                                            onChange={(e) => handlePriceChange(p.productId, e.target.value)}
                                                            className="w-full pl-7 pr-3 py-2.5 bg-blue-50/40 border-none rounded-xl text-center text-[11px] font-black text-blue-600 focus:ring-2 ring-blue-500/20 shadow-inner"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-end">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProduct(p.productId)}
                                                        className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all ml-auto"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="py-24 text-center">
                                                <div className="bg-slate-50 w-20 h-20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-4 border border-slate-100 shadow-inner">
                                                    <LayoutGrid size={28} className="text-slate-200" />
                                                </div>
                                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">{t('form.no_products')}</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {totalPages > 1 && (
                            <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100">
                                    Catalog: {selectedProducts.length} Items Listed
                                </span>
                                <div className="flex items-center gap-2">
                                    <button 
                                        type="button"
                                        disabled={currentPage === 1}
                                        onClick={() => setCurrentPage(c => c - 1)}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 disabled:opacity-20 hover:bg-slate-50 transition-all shadow-sm"
                                    >
                                        <ChevronLeft size={20} className="text-slate-600" />
                                    </button>
                                    <div className="px-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">{currentPage} <span className="mx-2 text-slate-200">|</span> {totalPages}</div>
                                    <button 
                                        type="button"
                                        disabled={currentPage === totalPages}
                                        onClick={() => setCurrentPage(c => c + 1)}
                                        className="w-12 h-12 flex items-center justify-center rounded-2xl border border-slate-200 disabled:opacity-20 hover:bg-slate-50 transition-all shadow-sm"
                                    >
                                        <ChevronRight size={20} className="text-slate-600" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Side: Media & Preview (4 columns) */}
                <div className="lg:col-span-4 space-y-8 sticky top-6">
                    {/* Section 3: Image Upload */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-6">
                        <div className="flex items-center gap-3 border-b border-slate-50 pb-4">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100/50">
                                <Upload size={20} />
                            </div>
                            <h3 className="text-sm font-bold text-slate-900 border-b-2 border-amber-500 inline-block uppercase">3. {t('form.banner_image')}</h3>
                        </div>

                        <div 
                            className="relative aspect-[16/10] rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-all shadow-inner group overflow-hidden"
                            onClick={() => fileInputRef.current.click()}
                        >
                            {imagePreview ? (
                                <div className="w-full h-full relative">
                                    <img src={imagePreview} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Banner" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white">
                                            <RefreshCw size={24} className="animate-spin-slow" />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center p-8 space-y-3">
                                    <div className="w-16 h-16 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto shadow-sm border border-slate-100 text-blue-500">
                                        <Upload size={28} />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{t('form.upload_text')}</p>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase mt-1 tracking-widest">{t('form.recommended_size')}</p>
                                    </div>
                                </div>
                            )}
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
                        </div>

                        {/* Visual Quality Toggle Area */}
                        <div className="p-5 bg-slate-900 rounded-[2rem] text-white shadow-xl">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border ${formData.isActive ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                        <Sparkles size={18} />
                                    </div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest">{t('form.live_toggle')}</div>
                                        <p className="text-[9px] font-bold text-slate-500 uppercase">{formData.isActive ? 'VISIBLE IN APP' : 'HIDDEN FROM USERS'}</p>
                                    </div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={formData.isActive}
                                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                    />
                                    <div className="w-12 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-500 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>

                        {/* Display Order Box */}
                        <div className="bg-slate-50 rounded-[2rem] border border-slate-200 shadow-inner p-5 mt-4 space-y-4">
                            <div>
                                <h3 className="text-xs font-bold text-slate-900 tracking-tight uppercase">Banner Display Position</h3>
                                <p className="text-[10px] text-slate-500 font-bold tracking-tight">Set the display order (e.g., 1 for first banner)</p>
                            </div>
                            <input 
                                type="number" 
                                name="displayOrder"
                                value={formData.displayOrder}
                                onChange={handleChange}
                                placeholder="e.g., 1, 2, 3..."
                                min="0"
                                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-sm font-bold text-slate-700 shadow-sm"
                            />
                        </div>

                        {/* Live Preview Embed */}
                        <div className="pt-2">
                             <LiveBannerPreview formData={formData} imagePreview={imagePreview} />
                        </div>
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
