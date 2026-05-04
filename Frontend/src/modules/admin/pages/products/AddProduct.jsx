import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Save, Upload, X, Sparkles, Plus, Camera, Search, ArrowLeft, Package, Trash2, Check, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import ImageCropperModal from '../../../../common/components/ImageCropperModal';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getCategories } from '../../api/categoryApi';
import { getSubCategories } from '../../api/subcategoryApi';
import { getBrands } from '../../api/brandApi';
import { getBranches } from '../../api/branchApi';
import { getVendors } from '../../api/vendorApi';
import { createProduct, getAISuggestions } from '../../api/productApi';
import { getAvailableAdminLocations, createAdminLocation } from '../../api/physicalLocationApi';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

// Custom dropdown that always opens downward
const DownDropdown = ({ value, onChange, options, placeholder, disabled }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    const selected = options.find(o => o.value === value);
    return (
        <div ref={ref} className="relative">
            <button type="button" disabled={disabled}
                onClick={() => !disabled && setOpen(p => !p)}
                className={`form-input-simple w-full flex items-center justify-between text-left ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${!selected ? 'text-slate-400' : 'text-slate-800'}`}>
                <span className="truncate">{selected ? selected.label : placeholder}</span>
                <ChevronDown size={16} className={`shrink-0 ml-2 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <ul className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    <li onClick={() => { onChange(''); setOpen(false); }}
                        className="px-4 py-2.5 text-sm text-slate-400 hover:bg-slate-50 cursor-pointer">
                        {placeholder}
                    </li>
                    {options.map(o => (
                        <li key={o.value} onClick={() => { onChange(o.value); setOpen(false); }}
                            className={`px-4 py-2.5 text-sm cursor-pointer hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between ${value === o.value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700'}`}>
                            {o.label}
                            {value === o.value && <Check size={14} />}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

const MultiBranchDropdown = ({ branches, selectedIds, onToggle, placeholder }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const handler = (e) => { 
            if (ref.current && !ref.current.contains(e.target)) setOpen(false); 
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);
    return (
        <div ref={ref} className="relative">
            <button type="button" onClick={() => setOpen(p => !p)} className="form-input-simple w-full flex items-center justify-between text-left cursor-pointer text-sm bg-white">
                <span className="truncate text-slate-800 font-semibold" style={{ fontSize: '13px' }}>
                    {selectedIds.length > 0 ? `${selectedIds.length} branches selected` : placeholder}
                </span>
                <ChevronDown size={16} className={`shrink-0 ml-2 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <ul className="absolute z-[60] top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto pt-1 pb-1 outline-none scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {branches.length === 0 && <li className="px-4 py-3 text-sm text-slate-400 text-center">No branches available</li>}
                    {branches.map(b => {
                        const isSelected = selectedIds.includes(b._id);
                        return (
                            <li key={b._id} onClick={(e) => { e.stopPropagation(); onToggle(b); }} className="px-4 py-3 text-sm cursor-pointer hover:bg-slate-50 flex items-center gap-3">
                                <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'border-slate-300 bg-white'}`}>
                                    {isSelected && <Check size={12} strokeWidth={4} />}
                                </div>
                                <span className={isSelected ? 'font-semibold text-slate-800' : 'text-slate-600'}>{b.name}</span>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
};

const AddProduct = () => {
    const { t } = useTranslation('admin_products');
    const navigate = useNavigate();
    const { adminUser } = useAdminAuth();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [aiLoading, setAiLoading] = useState({ description: false, tags: false });

    // Master Data
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState([]);
    const [filteredSubCategories, setFilteredSubCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [filteredBrands, setFilteredBrands] = useState([]);
    const [branches, setBranches] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [availableLocations, setAvailableLocations] = useState([]);
    const [showNewShelf, setShowNewShelf] = useState(false);
    const [newShelf, setNewShelf] = useState({ label: '', description: '' });
    const [shelfCreating, setShelfCreating] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '', category: '', subCategory: '', brandName: '', basePrice: '', mrp: '', purchasePrice: '', hsnCode: '',
        isVeg: true, unitType: 'pcs', unitValue: 1, physicalLocation: '', description: '',
        isAllBranches: true, specificBranches: [], sku: '', tags: [], status: 'Active',
        vendor: '', isSaathigro: false, stock: '', lowStockThreshold: 10,
        // --- Added fields ---
        reorderThreshold: 10, maxCapacityPerSku: 0, isStockAutoSync: false,
        weightCategory: 'Light', isFragile: false, temperatureType: 'Normal',
        pickPriority: 0, pickingZone: 'Other',
        variantGroupId: '', pickSequence: 0
    });

    const [branchStocks, setBranchStocks] = useState([]);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [galleryPreviews, setGalleryPreviews] = useState([]);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [showCropper, setShowCropper] = useState(false);
    const [tempImage, setTempImage] = useState(null);
    const [tagInput, setTagInput] = useState('');
    const isVendorProduct = Boolean(formData.vendor);

    // Fetch available locations whenever the first selected branch changes
    useEffect(() => {
        if (!adminUser?.token || formData.specificBranches.length === 0) {
            setAvailableLocations([]);
            return;
        }
        const firstBranchId = formData.specificBranches[0];
        getAvailableAdminLocations(adminUser.token, firstBranchId)
            .then(data => setAvailableLocations(Array.isArray(data) ? data : []))
            .catch(() => setAvailableLocations([]));
    }, [adminUser?.token, formData.specificBranches]);

    // Initialization
    useEffect(() => {
        const fetchData = async () => {
            if (!adminUser?.token) return;
            try {
                const [categoriesData, subCategoriesData, brandsData, branchesData, vendorsData] = await Promise.all([
                    getCategories(adminUser.token), 
                    getSubCategories(adminUser.token),
                    getBrands(adminUser.token), 
                    getBranches(adminUser.token),
                    getVendors(adminUser.token)
                ]);

                // Robust extraction logic to handle various response structures
                const extractData = (payload, key) => {
                    if (Array.isArray(payload)) return payload;
                    if (payload && typeof payload === 'object') {
                        if (Array.isArray(payload[key])) return payload[key];
                        if (Array.isArray(payload.data)) return payload.data;
                        if (payload.data && Array.isArray(payload.data[key])) return payload.data[key];
                    }
                    return [];
                };

                const cats = extractData(categoriesData, 'categories');
                const subCats = extractData(subCategoriesData, 'subcategories');
                const brs = extractData(brandsData, 'brands');
                const locs = extractData(branchesData, 'branches');
                const vends = extractData(vendorsData, 'vendors');

                setCategories(cats.filter(c => c.status === 'Active' || !c.status));
                setSubCategories(subCats.filter(sc => sc.status === 'Active' || !sc.status));
                setBrands(brs.filter(b => b.status === 'Active' || !b.status));
                setBranches(locs.filter(b => b.isActive || b.status === 'Active' || b.isActive === undefined));
                setVendors(vends.filter(v => v.status === 'Active' || v.isActive));
            } catch (error) {
                console.error('Failed to fetch master data:', error);
                toast.error(t('messages.load_failed') || 'Failed to load master data');
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, [adminUser?.token, t]);

    // Filtering Logic
    useEffect(() => {
        if (formData.category) {
            setFilteredBrands(brands.filter(b => b.category === formData.category));
            setFilteredSubCategories(subCategories.filter(sc => sc.categoryName === formData.category || sc.category?.name === formData.category));
        } else {
            setFilteredBrands([]);
            setFilteredSubCategories([]);
        }
    }, [formData.category, brands, subCategories]);

    // SKU Helpers
    const generateSKU = useCallback(() => {
        const prefix = formData.category ? formData.category.substring(0, 3).toUpperCase() : 'PROD';
        const namePart = formData.name ? formData.name.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, 'X') : 'XXX';
        const uid = Math.random().toString(36).substring(2, 7).toUpperCase();
        return `${prefix}-${namePart}-${uid}`;
    }, [formData.category, formData.name]);

    const handleRefreshSKU = useCallback(() => {
        setFormData(prev => ({ ...prev, sku: generateSKU() }));
    }, [generateSKU]);

    useEffect(() => {
        if (formData.name && formData.category && !formData.sku) {
            handleRefreshSKU();
        }
    }, [formData.name, formData.category, formData.sku, handleRefreshSKU]);

    // Handlers
    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : (['basePrice', 'mrp', 'purchasePrice', 'unitValue', 'stock', 'lowStockThreshold'].includes(name) ? (value === '' ? '' : Number(value)) : value)
        }));
    }, []);

    const handleBranchToggle = useCallback((branch) => {
        setBranchStocks(prev => {
            const isSelected = prev.some(bs => bs.branchId === branch._id);
            if (isSelected) return prev.filter(bs => bs.branchId !== branch._id);
            return [...prev, { branchId: branch._id, name: branch.name, stock: 0, lowStockThreshold: 10 }];
        });
        setFormData(prev => {
             const isSelected = prev.specificBranches.includes(branch._id);
             if (isSelected) return { ...prev, specificBranches: prev.specificBranches.filter(id => id !== branch._id) };
             return { ...prev, specificBranches: [...prev.specificBranches, branch._id] };
        });
    }, []);

    const handleBranchStockChange = useCallback((branchId, field, value) => {
        setBranchStocks(prev => prev.map(bs => bs.branchId === branchId ? { ...bs, [field]: value === '' ? '' : Number(value) } : bs));
    }, []);

    const handleCreateShelf = async () => {
        if (!newShelf.label.trim()) return toast.warning('Shelf label is required');
        const branchId = formData.specificBranches[0];
        setShelfCreating(true);
        try {
            const created = await createAdminLocation(adminUser.token, {
                label: newShelf.label.trim(),
                description: newShelf.description.trim(),
                branchId
            });
            setAvailableLocations(prev => [...prev, created]);
            setFormData(p => ({ ...p, physicalLocation: created.label }));
            setNewShelf({ label: '', description: '' });
            setShowNewShelf(false);
            toast.success(`Shelf "${created.label}" created`);
        } catch (err) {
            toast.error(err.message || 'Failed to create shelf');
        } finally {
            setShelfCreating(false);
        }
    };

    const handleImageChange = useCallback((e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { setTempImage(reader.result); setShowCropper(true); };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleCropComplete = useCallback(async (croppedImage) => {
        setImagePreview(croppedImage);
        setShowCropper(false);
        setTempImage(null);
        const res = await fetch(croppedImage);
        const blob = await res.blob();
        setImageFile(new File([blob], 'product.jpg', { type: 'image/jpeg' }));
    }, []);

    const handleGalleryChange = useCallback((e) => {
        const files = Array.from(e.target.files);
        setGalleryFiles(prev => {
            if (prev.length + files.length > 10) {
                toast.warning('Max 10 images');
                return prev;
            }
            setGalleryPreviews(old => [...old, ...files.map(f => URL.createObjectURL(f))]);
            return [...prev, ...files];
        });
    }, []);

    const removeGalleryImage = useCallback((index) => {
        setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
        setGalleryFiles(prev => prev.filter((_, i) => i !== index));
    }, []);

    const addTag = useCallback(() => {
        const tag = tagInput.trim();
        if (tag && !formData.tags.includes(tag)) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
            setTagInput('');
        }
    }, [tagInput, formData.tags]);

    const handleAISuggestion = useCallback(async (type) => {
        if (!formData.name) return toast.warning('Name required');
        setAiLoading(prev => ({ ...prev, [type]: true }));
        try {
            const data = await getAISuggestions(adminUser.token, formData.name, type);
            if (type === 'description') setFormData(prev => ({ ...prev, description: data.suggestion }));
            else {
                const newTags = data.suggestion.split(',').map(t => t.trim()).filter(t => t);
                setFormData(prev => ({ ...prev, tags: [...new Set([...prev.tags, ...newTags])] }));
            }
        } catch (error) { toast.error('AI Error'); }
        finally { setAiLoading(prev => ({ ...prev, [type]: false })); }
    }, [adminUser.token, formData.name]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            const isAll = !isVendorProduct && formData.specificBranches.length === branches.length;
            
            Object.keys(formData).forEach(key => {
                if (key === 'tags') data.append(key, formData.tags.join(','));
                else if (key === 'specificBranches') data.append(key, formData.specificBranches.join(','));
                else if (key === 'isAllBranches') data.append(key, isAll);
                else data.append(key, formData[key]);
            });

            if (!isVendorProduct) data.append('branchStocks', JSON.stringify(branchStocks));
            else { 
                data.append('branchStocks', JSON.stringify([])); 
                data.append('specificBranches', ''); 
                data.append('isAllBranches', false); 
            }
            
            if (imageFile) data.append('image', imageFile);
            galleryFiles.forEach(f => data.append('gallery', f));
            
            await createProduct(adminUser.token, data);
            toast.success(t('messages.save_success'));
            navigate('/admin/products');
        } catch (error) { toast.error(error.message); }
        finally { setLoading(false); }
    };

    if (initialLoading) return <div className="flex h-screen items-center justify-center bg-white"><div className="saathi-spinner"></div></div>;

    return (
        <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/admin/products')} className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-black">{t('add_product')}</h1>
                                <PageInfoTooltip data={pageInfoData.addProduct} />
                            </div>
                            <p className="text-slate-700 text-sm mt-1">{t('subtitle')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/admin/products')} className="px-6 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
                            {t('form.cancel')}
                        </button>
                        <button onClick={handleSubmit} disabled={loading} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2">
                            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
                            {t('form.save')}
                        </button>
                    </div>
                </header>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Section 1: Core Information */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
                            <h3 className="text-lg font-bold text-black flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                {t('form.basic_info')}
                            </h3>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-black">{t('fields.name')}<span className="text-red-500 ml-1">*</span></label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder={t('fields.name_placeholder')} className="form-input-simple" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-black">{t('fields.category')}<span className="text-red-500 ml-1">*</span></label>
                                    <DownDropdown
                                        value={formData.category}
                                        onChange={val => handleChange({ target: { name: 'category', value: val } })}
                                        options={categories.map(c => ({ value: c.name, label: c.name }))}
                                        placeholder="Select Category"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">{t('fields.sub_category')}</label>
                                    <DownDropdown
                                        value={formData.subCategory}
                                        onChange={val => handleChange({ target: { name: 'subCategory', value: val } })}
                                        options={filteredSubCategories.map(sc => ({ value: sc.name, label: sc.name }))}
                                        placeholder={`Select ${t('fields.sub_category')}`}
                                        disabled={!formData.category}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">{t('fields.brand')}<span className="text-red-500 ml-1">*</span></label>
                                    <DownDropdown
                                        value={formData.brandName}
                                        onChange={val => handleChange({ target: { name: 'brandName', value: val } })}
                                        options={filteredBrands.map(b => ({ value: b.name, label: b.name }))}
                                        placeholder="Select Brand"
                                        disabled={!formData.category}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Vendor (Optional)</label>
                                    <DownDropdown
                                        value={formData.vendor}
                                        onChange={val => handleChange({ target: { name: 'vendor', value: val } })}
                                        options={vendors.map(v => ({ value: v._id, label: v.storeName || v.name }))}
                                        placeholder="Select Vendor"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-slate-700">{t('fields.description')}<span className="text-red-500 ml-1">*</span></label>
                                    <button type="button" onClick={() => handleAISuggestion('description')} disabled={aiLoading.description} className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                                        {aiLoading.description ? '...' : <><Sparkles size={14} /> {t('form.ai_write')}</>}
                                    </button>
                                </div>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="form-input-simple" required />
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-slate-700">{t('fields.tags')}</label>
                                    <button type="button" onClick={() => handleAISuggestion('tags')} disabled={aiLoading.tags} className="text-xs font-bold text-blue-600 flex items-center gap-1.5">
                                        <Sparkles size={14} /> AI Suggested
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl min-h-[46px]">
                                    {formData.tags.map(tag => (
                                        <span key={tag} className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-medium text-slate-600">
                                            {tag} <X size={14} className="cursor-pointer text-slate-400 hover:text-red-500" onClick={() => setFormData(p => ({...p, tags: p.tags.filter(t => t !== tag)}))} />
                                        </span>
                                    ))}
                                    <input 
                                        type="text" 
                                        placeholder="Add custom tag..." 
                                        value={tagInput} 
                                        onChange={e => setTagInput(e.target.value)} 
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} 
                                        className="!bg-transparent !border-none !outline-none !shadow-none !ring-0 focus:!ring-0 text-xs flex-1 min-w-[150px] py-1" 
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Pricing & Measurements */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
                            <h3 className="text-lg font-bold text-black flex items-center gap-2">
                                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                                {t('form.pricing_stock')}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">{t('fields.base_price')}<span className="text-red-500 ml-1">*</span></label>
                                    <input type="number" onWheel={(e) => e.target.blur()} name="basePrice" value={formData.basePrice} onChange={handleChange} required className="form-input-simple font-bold text-lg" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">{t('fields.mrp')}<span className="text-red-500 ml-1">*</span></label>
                                    <input type="number" onWheel={(e) => e.target.blur()} name="mrp" value={formData.mrp} onChange={handleChange} required className="form-input-simple font-bold text-slate-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Purchase Price</label>
                                    <input type="number" onWheel={(e) => e.target.blur()} name="purchasePrice" value={formData.purchasePrice} onChange={handleChange} className="form-input-simple font-bold text-slate-500" placeholder="Optional" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">HSN Code</label>
                                    <input type="text" name="hsnCode" value={formData.hsnCode} onChange={handleChange} className="form-input-simple font-bold text-slate-500" placeholder="Optional" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">{t('fields.unit_type')}</label>
                                    <select name="unitType" value={formData.unitType} onChange={handleChange} className="form-input-simple">
                                        <option value="pcs">Pieces (pcs)</option>
                                        <option value="kg">Kilograms (kg)</option>
                                        <option value="g">Grams (g)</option>
                                        <option value="ltr">Liters (ltr)</option>
                                        <option value="ml">Milliliters (ml)</option>
                                        <option value="pkt">Packets (pkt)</option>
                                        <option value="box">Box</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">{t('fields.unit_value')}</label>
                                    <input type="number" onWheel={(e) => e.target.blur()} name="unitValue" value={formData.unitValue} onChange={handleChange} step="0.01" className="form-input-simple" />
                                </div>
                            </div>
                        </div>

                        {/* Section 3: Distribution Allocation */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
                            <h3 className="text-lg font-bold text-black flex items-center gap-2">
                                <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                                Branch Access
                            </h3>

                            <div className="space-y-4">
                                <div className="space-y-4 pt-4">
                                    <div className="space-y-4 pt-4 border-t border-slate-50">
                                        <label className="text-sm font-semibold text-slate-700 block">{t('fields.allocate_branches')}</label>
                                        <MultiBranchDropdown 
                                            branches={branches} 
                                            selectedIds={branchStocks.map(bs => bs.branchId)}
                                            onToggle={handleBranchToggle}
                                            placeholder="Click to select branches"
                                        />

                                        {branchStocks.length > 0 && (
                                            <div className="space-y-3 mt-6">
                                                {branchStocks.map(bs => (
                                                    <div key={bs.branchId} className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 items-center">
                                                        <div className="flex-1 font-bold text-xs text-slate-700 uppercase tracking-tight">{bs.name}</div>
                                                        <div className="flex gap-4">
                                                            <div className="space-y-1">
                                                                 <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Stock</span>
                                                                 <input type="number" onWheel={(e) => e.target.blur()} value={bs.stock} onChange={e => handleBranchStockChange(bs.branchId, 'stock', e.target.value)} className="w-24 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-sm outline-none" />
                                                            </div>
                                                            <div className="space-y-1">
                                                                 <span className="text-[9px] font-bold text-slate-400 uppercase ml-1">Alert Limit</span>
                                                                 <input type="number" onWheel={(e) => e.target.blur()} value={bs.lowStockThreshold} onChange={e => handleBranchStockChange(bs.branchId, 'lowStockThreshold', e.target.value)} className="w-24 bg-white border border-slate-200 rounded-lg py-1.5 px-3 text-sm outline-none text-rose-500" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shelf Location Section */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-black flex items-center gap-2">
                                    <span className="w-1 h-6 bg-teal-500 rounded-full"></span>
                                    Shelf Location
                                </h3>
                                {formData.specificBranches.length > 0 && !showNewShelf && (
                                    <button type="button" onClick={() => setShowNewShelf(true)}
                                        className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg transition-all">
                                        <Plus size={14} /> New Shelf
                                    </button>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-700">{t('fields.physical_location')}</label>
                                {formData.specificBranches.length === 0 ? (
                                    <div className="form-input-simple text-slate-400 cursor-not-allowed select-none">
                                        Select a branch first
                                    </div>
                                ) : availableLocations.length > 0 ? (
                                    <DownDropdown
                                        value={formData.physicalLocation}
                                        onChange={val => setFormData(p => ({ ...p, physicalLocation: val }))}
                                        options={availableLocations.map(loc => ({
                                            value: loc.label,
                                            label: loc.label + (loc.description ? ` — ${loc.description}` : '')
                                        }))}
                                        placeholder="— Select Shelf —"
                                    />
                                ) : (
                                    <input
                                        type="text"
                                        name="physicalLocation"
                                        value={formData.physicalLocation}
                                        onChange={handleChange}
                                        placeholder="No shelves set up — type manually"
                                        className="form-input-simple"
                                    />
                                )}
                                {formData.specificBranches.length === 0 ? (
                                    <p className="text-[11px] text-slate-400">Allocate at least one branch to see location options.</p>
                                ) : availableLocations.length > 0 ? (
                                    <p className="text-[11px] text-teal-600 font-medium">{availableLocations.length} shelf location{availableLocations.length !== 1 ? 's' : ''} available</p>
                                ) : (
                                    <p className="text-[11px] text-slate-400">No shelves found for selected branch — you can type a custom location.</p>
                                )}
                            </div>

                            {/* Inline New Shelf Form */}
                            {showNewShelf && (
                                <div className="border border-teal-200 bg-teal-50/50 rounded-2xl p-4 space-y-3">
                                    <p className="text-xs font-bold text-teal-700 uppercase tracking-wide">Create New Shelf</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-600">Label <span className="text-rose-400">*</span></label>
                                            <input
                                                type="text"
                                                value={newShelf.label}
                                                onChange={e => setNewShelf(p => ({ ...p, label: e.target.value }))}
                                                placeholder="e.g. A1, Row-3, Cold-Zone"
                                                className="form-input-simple"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-semibold text-slate-600">Description (optional)</label>
                                            <input
                                                type="text"
                                                value={newShelf.description}
                                                onChange={e => setNewShelf(p => ({ ...p, description: e.target.value }))}
                                                placeholder="e.g. Top shelf near entrance"
                                                className="form-input-simple"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-2 justify-end">
                                        <button type="button" onClick={() => { setShowNewShelf(false); setNewShelf({ label: '', description: '' }); }}
                                            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-all">
                                            Cancel
                                        </button>
                                        <button type="button" onClick={handleCreateShelf} disabled={shelfCreating}
                                            className="px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-60">
                                            {shelfCreating ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                                            Save Shelf
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Section 4: Inventory Intelligence */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
                            <h3 className="text-lg font-bold text-black flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                                Inventory Intelligence
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Reorder Threshold</label>
                                    <input type="number" onWheel={(e) => e.target.blur()} name="reorderThreshold" value={formData.reorderThreshold} onChange={handleChange} className="form-input-simple" placeholder="E.g. 10" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Max Capacity per SKU</label>
                                    <input type="number" onWheel={(e) => e.target.blur()} name="maxCapacityPerSku" value={formData.maxCapacityPerSku} onChange={handleChange} className="form-input-simple" placeholder="E.g. 100" />
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <input type="checkbox" id="stockAutoSync" checked={formData.isStockAutoSync} onChange={(e) => setFormData(p => ({...p, isStockAutoSync: e.target.checked}))} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="stockAutoSync" className="text-sm font-medium text-slate-700 cursor-pointer">Auto-sync current stock per shelf</label>
                            </div>
                        </div>

                        {/* Section 5: Physical Handling */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
                            <h3 className="text-lg font-bold text-black flex items-center gap-2">
                                <span className="w-1 h-6 bg-orange-400 rounded-full"></span>
                                Physical Handling
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Weight Category</label>
                                    <select name="weightCategory" value={formData.weightCategory} onChange={handleChange} className="form-input-simple">
                                        <option value="Light">Light</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Heavy">Heavy</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Temperature Type</label>
                                    <select name="temperatureType" value={formData.temperatureType} onChange={handleChange} className="form-input-simple">
                                        <option value="Normal">Normal</option>
                                        <option value="Cold">Cold</option>
                                        <option value="Frozen">Frozen</option>
                                    </select>
                                </div>
                                <div className="space-y-2 flex flex-col justify-center">
                                    <label className="text-sm font-semibold text-slate-700 mb-2">Is Fragile?</label>
                                    <div className="flex gap-2">
                                        <button type="button" onClick={() => setFormData(p => ({...p, isFragile: true}))} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${formData.isFragile ? 'bg-orange-50 border-orange-500 text-orange-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>Yes</button>
                                        <button type="button" onClick={() => setFormData(p => ({...p, isFragile: false}))} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${!formData.isFragile ? 'bg-slate-100 border-slate-300 text-slate-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>No</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section 6: Picking Optimization */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
                            <h3 className="text-lg font-bold text-black flex items-center gap-2">
                                <span className="w-1 h-6 bg-indigo-500 rounded-full"></span>
                                Picking Optimization
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Pick Priority</label>
                                    <select name="pickPriority" value={formData.pickPriority} onChange={handleChange} className="form-input-simple">
                                        <option value={0}>Normal (Default)</option>
                                        <option value={1}>High (Fast-moving)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Storage Zone</label>
                                    <select name="pickingZone" value={formData.pickingZone} onChange={handleChange} className="form-input-simple">
                                        <option value="Other">Other / Default</option>
                                        <option value="Food">Food Zone</option>
                                        <option value="Non-food">Non-food Zone</option>
                                        <option value="Mixed Restricted">Mixed Restricted</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Section 7: Variant Handling */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 space-y-6 shadow-sm">
                            <h3 className="text-lg font-bold text-black flex items-center gap-2">
                                <span className="w-1 h-6 bg-rose-400 rounded-full"></span>
                                Variant Handling
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Variant Group ID</label>
                                    <input type="text" name="variantGroupId" value={formData.variantGroupId} onChange={handleChange} className="form-input-simple" placeholder="E.g. COCO-OIL-01" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">Pick Sequence (Order)</label>
                                    <input type="number" onWheel={(e) => e.target.blur()} name="pickSequence" value={formData.pickSequence} onChange={handleChange} className="form-input-simple" placeholder="E.g. 1 (First), 2, 3..." />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Featured Image */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm text-center space-y-4">
                            <label className="text-sm font-semibold text-slate-700 block text-left">Featured Image</label>
                            <div className="relative group w-full aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all">
                                {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <Camera size={40} className="text-slate-300" />}
                                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageChange} accept="image/*" />
                                {imagePreview && <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold">Replace Main Photo</div>}
                            </div>
                        </div>

                        {/* Gallery Section */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
                            <label className="text-sm font-semibold text-slate-700 block">Product Gallery (Max 10)</label>
                            <div className="grid grid-cols-4 gap-2">
                                {galleryPreviews.map((src, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 group">
                                        <img src={src} className="w-full h-full object-cover" />
                                        <button onClick={() => removeGalleryImage(i)} className="absolute top-1 right-1 p-1 bg-white/80 rounded-md text-red-500 opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                                {galleryFiles.length < 10 && (
                                    <button type="button" onClick={() => document.getElementById('gallery-input').click()} className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-300 hover:text-blue-500 hover:border-blue-400">
                                        <Plus size={20} />
                                        <input id="gallery-input" type="file" multiple className="hidden" onChange={handleGalleryChange} accept="image/*" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Registry Info */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-slate-700">{t('fields.registry_sku')}</label>
                                <button type="button" onClick={handleRefreshSKU} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><RefreshCw size={16} /></button>
                            </div>
                            <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl font-mono text-xs text-slate-600 text-center uppercase font-bold tracking-wider">{formData.sku || '-----------'}</div>
                            <div className="flex justify-center p-4 bg-slate-50 rounded-2xl shadow-inner border border-slate-100">
                                <QRCodeSVG value={formData.sku || 'PENDING'} size={140} />
                            </div>
                        </div>

                        {/* More Configurations */}
                        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-slate-700">{t('fields.attributes')}</label>
                                <div className="flex gap-2">
                                    <button type="button" onClick={() => setFormData(p => ({...p, isVeg: true}))} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${formData.isVeg ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>Veg</button>
                                    <button type="button" onClick={() => setFormData(p => ({...p, isVeg: false}))} className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all border ${!formData.isVeg ? 'bg-rose-50 border-rose-500 text-rose-700' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>Non-Veg</button>
                                </div>
                            </div>

                            <div 
                                className={`p-4 rounded-2xl border flex items-center gap-4 cursor-pointer transition-all ${formData.isSaathigro ? 'bg-blue-50 border-blue-500 shadow-sm' : 'bg-slate-50 border-slate-100 grayscale opacity-60'}`}
                                onClick={() => setFormData(p => ({...p, isSaathigro: !p.isSaathigro}))}
                            >
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${formData.isSaathigro ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                                    <Sparkles size={20} />
                                </div>
                                <div className="flex-1">
                                    <span className="text-sm font-bold text-slate-900 block">Premium Listing</span>
                                    <span className="text-[10px] text-slate-500 font-medium">Extra marketing visibility</span>
                                </div>
                                {formData.isSaathigro && <Check size={18} className="text-blue-600" />}
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <ImageCropperModal show={showCropper} imageSrc={tempImage} onCancel={() => { setShowCropper(false); setTempImage(null); }} onCropComplete={handleCropComplete} aspect={1} />
            
            <style dangerouslySetInnerHTML={{ __html: `
                .form-input-simple { 
                    width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; 
                    padding: 0.75rem 1rem; outline: none; transition: all 0.2s; font-size: 14px;
                    color-scheme: light;
                }
                .form-input-simple:focus { border-color: #3b82f6; background-color: white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05); }
                .saathi-spinner { width: 40px; height: 40px; border: 4px solid #f8fafc; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
                
                /* Spin buttons fix */
                input[type="number"]::-webkit-inner-spin-button, 
                input[type="number"]::-webkit-outer-spin-button {
                    opacity: 1;
                    background: transparent;
                }
                
                @keyframes spin { to { transform: rotate(360deg); } }
            `}} />
        </div>
    );
};

export default AddProduct;


