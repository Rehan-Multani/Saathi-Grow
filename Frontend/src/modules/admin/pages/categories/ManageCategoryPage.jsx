import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ExternalLink, LayoutTemplate, Plus, Save, Trash2, X, Sparkles, Image as ImageIcon, Layout, Settings, Layers, Eye, RefreshCw, Palette, Globe } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getCategories } from '../../api/categoryApi';
import { getBrands } from '../../api/brandApi';
import { getSubCategories } from '../../api/subcategoryApi';
import { createCategoryPage, getCategoryPageById, updateCategoryPage } from '../../api/categoryPageApi';
import { useTranslation } from 'react-i18next';
import ProductPickerModal from '../../../../common/components/forms/ProductPickerModal';
import MediaUploadField from '../../../../common/components/forms/MediaUploadField';
import PageInfoTooltip from '../../../../common/components/modals/PageInfoTooltip';
import { pageInfoData } from '../../../../common/data/pageInfoData';

const defaultTheme = {
  pageBg: '#f6fbf7',
  heroBg: '#eef8f0',
  cardBg: '#ffffff',
  accent: '#0c831f',
  text: '#111827'
};

const createSection = (type = 'subcategory_grid') => ({
  key: `${type}-${Date.now()}`,
  type,
  title: '',
  subtitle: '',
  order: 0,
  isActive: true,
  imageUrl: '',
  imagePublicId: '',
  imageFile: null,
  imagePreviewUrl: '',
  imageFileName: '',
  ctaLabel: type === 'view_more_cta' ? 'View more products' : '',
  ctaLink: '',
  banners: (type === 'banner_slider' || type === 'promo_banner') ? [{ title: '', subtitle: '', ctaLink: '', imageUrl: '' }] : [],
  maxItems: 8,
  maxProducts: 10,
  brandIds: [],
  subCategoryIds: [],
  productIds: [],
  productPreviews: []
});

const normalizeEntityIds = (items = []) => (Array.isArray(items) ? items.map((item) => item?._id || item).filter(Boolean) : []);
const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Failed to read image file'));
  reader.readAsDataURL(file);
});

const ManageCategoryPage = () => {
  const { t } = useTranslation('admin_categories');
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();

  const [loading, setLoading] = useState(Boolean(id));
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [pickerIndex, setPickerIndex] = useState(null);

  const [formData, setFormData] = useState({
    category: searchParams.get('categoryId') || '',
    status: 'draft',
    theme: { ...defaultTheme },
    hero: {
      title: '',
      subtitle: '',
      bannerImage: '',
      bannerImagePublicId: '',
      bannerImageFile: null,
      bannerImagePreviewUrl: '',
      bannerImageFileName: '',
      banners: [],
      sponsorLabel: 'Powered by',
      sponsorBrand: ''
    },
    seo: {
      title: '',
      description: '',
      image: '',
      imagePublicId: '',
      imageFile: null,
      imagePreviewUrl: '',
      imageFileName: ''
    },
    sections: []
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [categoryData, brandData] = await Promise.all([
          getCategories(adminUser.token),
          getBrands(adminUser.token)
        ]);

        setCategories(Array.isArray(categoryData) ? categoryData : []);
        setBrands(Array.isArray(brandData) ? brandData : []);

        if (id) {
          const page = await getCategoryPageById(adminUser.token, id);
          
          let heroBanners = (page.hero?.banners || []).map(b => ({
            imageUrl: b.imageUrl || '',
            imagePublicId: b.imagePublicId || '',
            imageFile: null,
            imagePreviewUrl: b.imageUrl || '',
            ctaLink: b.ctaLink || '',
            title: b.title || '',
            subtitle: b.subtitle || ''
          }));

          if (heroBanners.length === 0 && page.hero?.bannerImage) {
            heroBanners.push({
              imageUrl: page.hero.bannerImage,
              imagePublicId: page.hero.bannerImagePublicId || '',
              imageFile: null,
              imagePreviewUrl: page.hero.bannerImage,
              ctaLink: '',
              title: page.hero.title || '',
              subtitle: page.hero.subtitle || ''
            });
          }

          setFormData({
            category: page.category?._id || '',
            status: page.status || 'draft',
            theme: { ...defaultTheme, ...(page.theme || {}) },
            hero: {
              title: page.hero?.title || '',
              subtitle: page.hero?.subtitle || '',
              bannerImage: page.hero?.bannerImage || '',
              bannerImagePublicId: page.hero?.bannerImagePublicId || '',
              bannerImageFile: null,
              bannerImagePreviewUrl: page.hero?.bannerImage || '',
              bannerImageFileName: '',
              sponsorLabel: page.hero?.sponsorLabel || 'Powered by',
              sponsorBrand: page.hero?.sponsorBrand?._id || page.hero?.sponsorBrand || '',
              banners: heroBanners
            },
            seo: {
              title: page.seo?.title || '',
              description: page.seo?.description || '',
              image: page.seo?.image || '',
              imagePublicId: page.seo?.imagePublicId || '',
              imageFile: null,
              imagePreviewUrl: page.seo?.image || '',
              imageFileName: ''
            },
            sections: (page.sections || []).map((section, index) => {
              let sectionBanners = (section.banners || []).map(b => ({
                imageUrl: b.imageUrl || '',
                imagePublicId: b.imagePublicId || '',
                imageFile: null,
                imagePreviewUrl: b.imageUrl || '',
                ctaLink: b.ctaLink || '',
                title: b.title || '',
                subtitle: b.subtitle || ''
              }));

              if (sectionBanners.length === 0 && section.imageUrl && section.type === 'promo_banner') {
                sectionBanners.push({
                  imageUrl: section.imageUrl,
                  imagePublicId: section.imagePublicId || '',
                  imageFile: null,
                  imagePreviewUrl: section.imageUrl,
                  ctaLink: section.ctaLink || '',
                  title: section.title || '',
                  subtitle: section.subtitle || ''
                });
              }

              return {
                key: section.key || `${section.type}-${index + 1}`,
                type: section.type,
                title: section.title || '',
                subtitle: section.subtitle || '',
                order: Number.isFinite(Number(section.order)) ? Number(section.order) : index,
                isActive: section.isActive !== false,
                imageUrl: section.imageUrl || '',
                imagePublicId: section.imagePublicId || '',
                imageFile: null,
                imagePreviewUrl: section.imageUrl || '',
                imageFileName: '',
                ctaLabel: section.ctaLabel || '',
                ctaLink: section.ctaLink || '',
                banners: sectionBanners,
                maxItems: section.maxItems || 8,
                maxProducts: section.maxProducts || 10,
                brandIds: normalizeEntityIds(section.brandIds),
                subCategoryIds: normalizeEntityIds(section.subCategoryIds),
                productIds: normalizeEntityIds(section.productIds),
                productPreviews: Array.isArray(section.productIds)
                  ? section.productIds.filter((item) => item && typeof item === 'object' && item._id)
                  : []
              };
            })
          });
        }
      } catch (error) {
        toast.error(error.message || t('messages.load_failed'));
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [adminUser.token, id, searchParams, t]);

  useEffect(() => {
    const loadSubCategories = async () => {
      if (!formData.category) {
        setSubCategories([]);
        return;
      }

      try {
        const data = await getSubCategories(adminUser.token, {
          categoryId: formData.category,
          status: 'Active'
        });
        setSubCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        toast.error(t('loading_failed'));
      }
    };

    loadSubCategories();
  }, [adminUser.token, formData.category, t]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category._id === formData.category),
    [categories, formData.category]
  );

  const filteredBrands = useMemo(() => {
    if (!selectedCategory) return [];
    return brands.filter((brand) => String(brand.category || '').toLowerCase() === String(selectedCategory.name || '').toLowerCase());
  }, [brands, selectedCategory]);

  const handleCategoryChange = (categoryId) => {
    const category = categories.find((c) => c._id === categoryId);
    const productsPath = category?.slug ? `/category/${category.slug}/products` : '';

    setFormData((prev) => ({
      ...prev,
      category: categoryId,
      hero: {
        ...prev.hero,
        title: prev.hero.title || category?.name || '',
        banners: prev.hero.banners.map((b) => ({
          ...b,
          ctaLink: b.ctaLink || productsPath
        }))
      },
      sections: prev.sections.map((s) => ({
        ...s,
        ctaLink: s.ctaLink || productsPath,
        banners: (s.banners || []).map((b) => ({
          ...b,
          ctaLink: b.ctaLink || productsPath
        }))
      }))
    }));
  };

  const handleLoadDemoLayout = () => {
    if (!selectedCategory) {
      toast.error('Select a category first.');
      return;
    }

    const heroImage = selectedCategory.image || '';
    const sponsorBrandId = formData.hero.sponsorBrand || filteredBrands[0]?._id || '';
    const subCategoryIds = subCategories.slice(0, 8).map((item) => item._id);
    const brandIds = filteredBrands.slice(0, 8).map((item) => item._id);
    const productsPath = selectedCategory.slug
      ? `/category/${selectedCategory.slug}/products`
      : '/category';

    let order = 0;
    const demoSections = [];

    if (subCategoryIds.length > 0) {
      demoSections.push({
        ...createSection('subcategory_grid'),
        key: 'demo-subcategories',
        title: `Top picks in ${selectedCategory.name}`,
        subtitle: `Popular aisles from ${selectedCategory.name}`,
        order: order++,
        maxItems: subCategoryIds.length,
        subCategoryIds
      });
    }

    if (brandIds.length > 0) {
      demoSections.push({
        ...createSection('brand_strip'),
        key: 'demo-brands',
        title: `Brands in ${selectedCategory.name}`,
        subtitle: 'Shop by your favorite brands',
        order: order++,
        maxItems: brandIds.length,
        brandIds
      });
    }

    demoSections.push({
      ...createSection('promo_banner'),
      key: 'demo-promo-banner',
      title: `${selectedCategory.name} specials`,
      subtitle: 'Exclusive deals just for you',
      order: order++,
      imageUrl: heroImage,
      imagePreviewUrl: heroImage,
      ctaLabel: 'Shop now',
      ctaLink: productsPath
    });

    demoSections.push({
      ...createSection('product_rail'),
      key: 'demo-product-rail',
      title: `Trending in ${selectedCategory.name}`,
      subtitle: 'Most loved products right now',
      order: order++,
      ctaLabel: 'View more',
      ctaLink: productsPath,
      maxProducts: 10
    });

    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        title: prev.hero.title || selectedCategory.name,
        subtitle: prev.hero.subtitle || `Discover curated ${selectedCategory.name.toLowerCase()} picks on SaathiGro.`,
        bannerImage: prev.hero.bannerImage || heroImage,
        bannerImagePreviewUrl: prev.hero.bannerImagePreviewUrl || prev.hero.bannerImage || heroImage,
        sponsorLabel: sponsorBrandId ? (prev.hero.sponsorLabel || 'Powered by') : '',
        sponsorBrand: sponsorBrandId
      },
      seo: {
        ...prev.seo,
        title: prev.seo.title || `${selectedCategory.name} | SaathiGro`,
        description: prev.seo.description || `Explore ${selectedCategory.name} on SaathiGro.`,
        image: prev.seo.image || heroImage,
        imagePreviewUrl: prev.seo.imagePreviewUrl || prev.seo.image || heroImage
      },
      sections: demoSections
    }));

    toast.success('Demo layout applied.');
  };

  const handleThemeChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        [field]: value
      }
    }));
  };

  const handleHeroChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        [field]: value
      }
    }));
  };

  const handleSeoChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: value
      }
    }));
  };

  const handleHeroMediaChange = async (field, file) => {
    const previewField = `${field}PreviewUrl`;
    const fileField = `${field}File`;
    const fileNameField = `${field}FileName`;

    if (!file) {
      setFormData((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          [field]: '',
          [`${field}PublicId`]: '',
          [previewField]: '',
          [fileField]: null,
          [fileNameField]: ''
        }
      }));
      return;
    }

    try {
      const previewUrl = await readFileAsDataUrl(file);
      setFormData((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          [previewField]: previewUrl,
          [fileField]: file,
          [fileNameField]: file.name
        }
      }));
    } catch (error) {
      toast.error('Failed to load image');
    }
  };

  const addHeroBanner = () => {
    const productsPath = selectedCategory?.slug ? `/category/${selectedCategory.slug}/products` : '';
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        banners: [
          ...prev.hero.banners,
          {
            imageUrl: '',
            imagePublicId: '',
            imageFile: null,
            imagePreviewUrl: '',
            ctaLink: productsPath,
            title: '',
            subtitle: ''
          }
        ]
      }
    }));
  };

  const removeHeroBanner = (index) => {
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        banners: prev.hero.banners.filter((_, i) => i !== index)
      }
    }));
  };

  const updateHeroBanner = (index, patch) => {
    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        banners: prev.hero.banners.map((banner, i) => (i === index ? { ...banner, ...patch } : banner))
      }
    }));
  };

  const handleHeroBannerMediaChange = async (index, file) => {
    if (!file) {
      updateHeroBanner(index, {
        imageUrl: '',
        imagePublicId: '',
        imagePreviewUrl: '',
        imageFile: null
      });
      return;
    }

    try {
      const previewUrl = await readFileAsDataUrl(file);
      updateHeroBanner(index, {
        imagePreviewUrl: previewUrl,
        imageFile: file
      });
    } catch (error) {
      toast.error('Failed to load image');
    }
  };

  const handleSeoMediaChange = async (file) => {
    if (!file) {
      setFormData((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          image: '',
          imagePublicId: '',
          imagePreviewUrl: '',
          imageFile: null,
          imageFileName: ''
        }
      }));
      return;
    }

    try {
      const previewUrl = await readFileAsDataUrl(file);
      setFormData((prev) => ({
        ...prev,
        seo: {
          ...prev.seo,
          imagePreviewUrl: previewUrl,
          imageFile: file,
          imageFileName: file.name
        }
      }));
    } catch (error) {
      toast.error('Failed to load image');
    }
  };

  const handleSectionMediaChange = async (index, field, file) => {
    const previewField = field === 'imageUrl' ? 'imagePreviewUrl' : 'mobileImagePreviewUrl';
    const fileField = field === 'imageUrl' ? 'imageFile' : 'mobileImageFile';
    const fileNameField = field === 'imageUrl' ? 'imageFileName' : 'mobileImageFileName';

    if (!file) {
      updateSection(index, {
        [field]: '',
        [previewField]: '',
        [fileField]: null,
        [fileNameField]: ''
      });
      return;
    }

    try {
      const previewUrl = await readFileAsDataUrl(file);
      updateSection(index, {
        [previewField]: previewUrl,
        [fileField]: file,
        [fileNameField]: file.name
      });
    } catch (error) {
      toast.error('Failed to load image');
    }
  };

  const updateSection = (index, patch) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sectionIndex) => (
        sectionIndex === index ? { ...section, ...patch } : section
      ))
    }));
  };

  const removeSection = (index) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, sectionIndex) => sectionIndex !== index)
    }));
  };

  const addSection = (type) => {
    const productsPath = selectedCategory?.slug ? `/category/${selectedCategory.slug}/products` : '';
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          ...createSection(type),
          order: prev.sections.length,
          ctaLink: (type === 'promo_banner' || type === 'product_rail' || type === 'view_more_cta') ? productsPath : ''
        }
      ]
    }));
  };

  const toggleSectionId = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((section, sectionIndex) => {
        if (sectionIndex !== index) return section;
        const current = Array.isArray(section[field]) ? section[field] : [];
        const next = current.includes(value)
          ? current.filter((item) => item !== value)
          : [...current, value];
        return { ...section, [field]: next };
      })
    }));
  };

  const handleProductSelection = (products) => {
    if (pickerIndex === null) return;
    updateSection(pickerIndex, {
      productIds: products.map((product) => product._id),
      productPreviews: products
    });
    setPickerIndex(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.category) return toast.error('Please select a category.');

    setSaving(true);
    try {
      const payload = {
        category: formData.category,
        status: formData.status,
        theme: formData.theme,
        hero: {
          title: formData.hero.title,
          subtitle: formData.hero.subtitle,
          bannerImage: formData.hero.bannerImage,
          bannerImagePublicId: formData.hero.bannerImagePublicId,
          sponsorLabel: formData.hero.sponsorLabel,
          sponsorBrand: formData.hero.sponsorBrand || null,
          banners: formData.hero.banners.map((banner) => ({
            imageUrl: banner.imageUrl,
            imagePublicId: banner.imagePublicId,
            ctaLink: banner.ctaLink,
            title: banner.title,
            subtitle: banner.subtitle
          }))
        },
        seo: {
          title: formData.seo.title,
          description: formData.seo.description,
          image: formData.seo.image,
          imagePublicId: formData.seo.imagePublicId
        },
        sections: formData.sections.map((section) => ({
          key: section.key,
          type: section.type,
          title: section.title,
          subtitle: section.subtitle,
          order: Number(section.order) || 0,
          isActive: section.isActive !== false,
          imageUrl: section.imageUrl,
          imagePublicId: section.imagePublicId,
          ctaLabel: section.ctaLabel,
          ctaLink: section.ctaLink,
          maxItems: Number(section.maxItems) || 8,
          maxProducts: Number(section.maxProducts) || 10,
          brandIds: section.brandIds || [],
          subCategoryIds: section.subCategoryIds || [],
          productIds: section.productIds || []
        }))
      };

      const requestData = new FormData();
      requestData.append('payload', JSON.stringify(payload));

      if (formData.hero.bannerImageFile) requestData.append('hero.bannerImage', formData.hero.bannerImageFile);
      formData.hero.banners.forEach((banner, index) => {
        if (banner.imageFile) requestData.append(`hero.banners[${index}].imageUrl`, banner.imageFile);
      });
      if (formData.seo.imageFile) requestData.append('seo.image', formData.seo.imageFile);
      formData.sections.forEach((section, sIdx) => {
        if (section.imageFile) requestData.append(`sections[${sIdx}].imageUrl`, section.imageFile);
      });

      if (id) {
        await updateCategoryPage(adminUser.token, id, requestData);
        toast.success(t('landing_pages.messages.update_success'));
      } else {
        await createCategoryPage(adminUser.token, requestData);
        toast.success(t('landing_pages.messages.create_success'));
      }
      navigate('/admin/category-pages');
    } catch (error) {
      toast.error(error.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/30">
        <div className="flex flex-col items-center gap-4">
            <div className="saathi-spinner"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{t('landing_pages.loading')}</p>
        </div>
    </div>
  );

  return (
    <div className="container-fluid py-8 bg-slate-50/30 min-h-screen px-4 md:px-8 max-w-7xl mx-auto font-sans">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-slate-900">
            <div className="flex items-center gap-4">
              <button 
                type="button" 
                onClick={() => navigate('/admin/category-pages')}
                className="p-3 bg-white border border-slate-200 rounded-2xl text-slate-500 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm active:scale-95"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <div className="flex items-center gap-3 font-slate-900">
                  <h1 className="text-2xl font-black tracking-tight">{id ? t('landing_pages.edit_title') : t('landing_pages.create_title')}</h1>
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${formData.status === 'published' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
                    {t(`status.${formData.status}`)}
                  </span>
                  <PageInfoTooltip data={pageInfoData.manageCategoryPage} />
                </div>
                <p className="text-slate-500 text-sm mt-1 font-medium">{t('landing_pages.subtitle')}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleLoadDemoLayout}
                disabled={!selectedCategory}
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-black tracking-widest uppercase text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <LayoutTemplate size={18} /> {t('landing_pages.load_demo')}
              </button>
              {selectedCategory?.slug && (
                 <a 
                    href={`/category/${selectedCategory.slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl text-[13px] font-black tracking-widest uppercase text-slate-600 hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                 >
                    <Eye size={18} /> {t('landing_pages.preview_live')}
                 </a>
              )}
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-3 px-10 py-3 bg-blue-600 text-white rounded-2xl text-[13px] font-black tracking-widest uppercase shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                {saving ? t('form.saving') : t('form.save_publish')}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Sidebar - Configuration */}
          <div className="lg:col-span-4 space-y-8 h-fit lg:sticky lg:top-8">
            {/* Category selection */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8">
              <div className="flex items-center gap-4 border-b border-slate-50 pb-6 text-slate-900 border-slate-100">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Layout size={22} /></div>
                <h2 className="text-lg font-bold">{t('landing_pages.form.select_category')}</h2>
              </div>
              <div className="space-y-6 text-slate-900">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{t('form.select_category')}</label>
                    <select 
                        value={formData.category} 
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="form-input-simple"
                        disabled={loading || id}
                    >
                        <option value="">{t('landing_pages.form.select_category')}</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="space-y-2 text-slate-900">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">{t('form.visibility')}</label>
                    <div className="flex gap-2">
                        {['draft', 'published'].map(stat => (
                            <button
                                key={stat}
                                type="button"
                                onClick={() => setFormData(p => ({ ...p, status: stat }))}
                                className={`flex-1 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${formData.status === stat ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}`}
                            >
                                {t(`status.${stat}`)}
                            </button>
                        ))}
                    </div>
                </div>
              </div>
            </div>

            {/* Theme Config */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8 text-slate-900">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl"><Palette size={22} /></div>
                <h2 className="text-lg font-bold">{t('landing_pages.form.theme_config')}</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(formData.theme).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                         <label className="text-[10px] font-bold text-slate-400 uppercase tracking-tight block ml-1 truncate">{key.replace(/Bg$/, ' Color')}</label>
                         <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 group">
                             <input 
                                type="color" 
                                value={value} 
                                onChange={(e) => handleThemeChange(key, e.target.value)} 
                                className="w-8 h-8 rounded-lg border-0 p-0 overflow-hidden cursor-pointer"
                             />
                             <input 
                                type="text"
                                value={value}
                                onChange={(e) => handleThemeChange(key, e.target.value)}
                                className="bg-transparent border-0 outline-none w-full text-[11px] font-bold text-slate-600 font-mono"
                             />
                         </div>
                    </div>
                ))}
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8 text-slate-900">
              <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><Globe size={22} /></div>
                <h2 className="text-lg font-bold">{t('landing_pages.form.seo_settings')}</h2>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Meta Title</label>
                    <input 
                        type="text" 
                        value={formData.seo.title} 
                        onChange={(e) => handleSeoChange('title', e.target.value)} 
                        className="form-input-simple"
                        placeholder="Page title for search results"
                    />
                </div>
                <div className="space-y-2 text-slate-900">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Meta Description</label>
                    <textarea 
                        rows={3}
                        value={formData.seo.description}
                        onChange={(e) => handleSeoChange('description', e.target.value)}
                        className="form-input-simple resize-none"
                        placeholder="Brief summary for indexing"
                    />
                </div>
                <MediaUploadField
                    label="Global Share Image"
                    previewUrl={formData.seo.imagePreviewUrl || formData.seo.image}
                    onFileChange={handleSeoMediaChange}
                    onRemove={() => handleSeoMediaChange(null)}
                />
              </div>
            </div>
          </div>

          {/* Main Content Area - Hero & Sections */}
          <div className="lg:col-span-8 space-y-8 text-slate-900">
             {/* Hero Section */}
             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8 text-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><Sparkles size={22} /></div>
                        <h2 className="text-lg font-bold">{t('landing_pages.form.hero_section')}</h2>
                    </div>
                    <button type="button" onClick={addHeroBanner} className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all active:scale-95 border border-slate-200">
                        <Plus size={14} strokeWidth={3} /> Add Slide
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-900">
                    <div className="space-y-6">
                        <div className="space-y-2 text-slate-900">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Headline</label>
                            <input type="text" value={formData.hero.title} onChange={(e) => handleHeroChange('title', e.target.value)} className="form-input-simple" placeholder="E.g. Electronics Superstore" />
                        </div>
                        <div className="space-y-2 text-slate-900">
                            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Sub-headline</label>
                            <input type="text" value={formData.hero.subtitle} onChange={(e) => handleHeroChange('subtitle', e.target.value)} className="form-input-simple" placeholder="E.g. Deals that matter to you" />
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-slate-900">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Sponsor Label</label>
                                <input type="text" value={formData.hero.sponsorLabel} onChange={(e) => handleHeroChange('sponsorLabel', e.target.value)} className="form-input-simple" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Sponsor Brand</label>
                                <select value={formData.hero.sponsorBrand} onChange={(e) => handleHeroChange('sponsorBrand', e.target.value)} className="form-input-simple">
                                    <option value="">None</option>
                                    {filteredBrands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4 text-slate-900">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block ml-1">Header Carousel Banners</label>
                        {formData.hero.banners.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-100 rounded-3xl p-10 text-center bg-slate-50/50">
                                <ImageIcon size={24} className="text-slate-200 mx-auto mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Click 'Add Slide' to start</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4 text-slate-900">
                                {formData.hero.banners.map((banner, idx) => (
                                    <div key={idx} className="bg-slate-50/80 border border-slate-100 rounded-3xl p-5 group transition-all hover:bg-white hover:shadow-xl hover:shadow-slate-200/50">
                                        <div className="flex justify-between items-center mb-4">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">Slide {idx+1}</span>
                                            <button type="button" onClick={() => removeHeroBanner(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            <input 
                                                className="form-input-simple bg-white !py-2.5 !text-[13px]" 
                                                placeholder="Slide Title" 
                                                value={banner.title} 
                                                onChange={(e) => updateHeroBanner(idx, { title: e.target.value })} 
                                            />
                                            <MediaUploadField 
                                                previewUrl={banner.imagePreviewUrl || banner.imageUrl}
                                                size="sm"
                                                onFileChange={(f) => handleHeroBannerMediaChange(idx, f)}
                                                onRemove={() => handleHeroBannerMediaChange(idx, null)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
             </div>

             {/* Page Sections */}
             <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm space-y-8 text-slate-900">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Layers size={22} /></div>
                        <h2 className="text-lg font-bold">{t('landing_pages.form.page_sections')}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 text-slate-900">
                        {['subcategory_grid', 'brand_strip', 'promo_banner', 'product_rail', 'view_more_cta'].map(type => (
                             <button
                                key={type}
                                type="button"
                                onClick={() => addSection(type)}
                                className="px-4 py-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 rounded-xl border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 transition-all flex items-center gap-1.5 active:scale-95 shadow-sm"
                             >
                                <Plus size={12} strokeWidth={4} /> {t(`landing_pages.form.section_types.${type}`)}
                             </button>
                        ))}
                    </div>
                </div>

                {formData.sections.length === 0 ? (
                    <div className="py-20 text-center bg-slate-50/50 rounded-[2.5rem] border-2 border-dashed border-slate-100">
                        <Settings size={32} className="text-slate-200 mx-auto mb-4 animate-spin-slow" />
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{t('landing_pages.no_pages')}</p>
                    </div>
                ) : (
                    <div className="space-y-6 text-slate-900">
                        {formData.sections.map((section, idx) => (
                             <div key={`${section.key}-${idx}`} className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow group/card text-slate-900">
                                <div className="bg-slate-50/80 px-8 py-4 flex justify-between items-center border-b border-slate-100 group-hover/card:bg-slate-100/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[11px] font-black border border-slate-200">{idx+1}</span>
                                        <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg">{t(`landing_pages.form.section_types.${section.type}`)}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                         <label className="flex items-center gap-2 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="hidden peer"
                                                checked={section.isActive}
                                                onChange={(e) => updateSection(idx, { isActive: e.target.checked })} 
                                            />
                                            <div className="w-10 h-5 bg-slate-200 peer-checked:bg-emerald-500 rounded-full relative transition-colors">
                                                <div className="absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-all peer-checked:left-6"></div>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{section.isActive ? 'Active' : 'Disabled'}</span>
                                         </label>
                                         <button type="button" onClick={() => removeSection(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                                    </div>
                                </div>
                                <div className="p-8 text-slate-900">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase block ml-1">Section Key</label>
                                            <input value={section.key} onChange={(e) => updateSection(idx, { key: e.target.value })} className="form-input-simple !bg-slate-50 hover:bg-white focus:bg-white" />
                                        </div>
                                        <div className="md:col-span-1 space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase block ml-1">Main Heading</label>
                                            <input value={section.title} onChange={(e) => updateSection(idx, { title: e.target.value })} className="form-input-simple font-bold" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase block ml-1">Display Order</label>
                                            <input type="number" value={section.order} onChange={(e) => updateSection(idx, { order: e.target.value })} className="form-input-simple" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-1.5 mb-6 text-slate-900">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase block ml-1">Description / Subtitle</label>
                                        <textarea value={section.subtitle} onChange={(e) => updateSection(idx, { subtitle: e.target.value })} rows={2} className="form-input-simple resize-none" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-900 border-t border-slate-50 pt-8 mt-2">
                                         {/* Conditional Controls based on type */}
                                         {(section.type === 'subcategory_grid' || section.type === 'brand_strip') && (
                                             <div className="space-y-4">
                                                 <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                                                     Selection List <span className="text-[10px] text-slate-400 lowercase font-medium italic">(Leave empty for auto)</span>
                                                 </label>
                                                 <div className="max-h-48 overflow-y-auto pr-2 custom-scrollbar grid grid-cols-1 gap-1.5">
                                                     {(section.type === 'subcategory_grid' ? subCategories : filteredBrands).map(item => (
                                                         <label key={item._id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${section[section.type === 'subcategory_grid' ? 'subCategoryIds' : 'brandIds'].includes(item._id) ? 'bg-blue-50 border-blue-100 text-blue-700' : 'bg-slate-50 border-transparent text-slate-500 hover:border-slate-200'}`}>
                                                             <input 
                                                                type="checkbox" 
                                                                className="hidden"
                                                                checked={section[section.type === 'subcategory_grid' ? 'subCategoryIds' : 'brandIds'].includes(item._id)}
                                                                onChange={() => toggleSectionId(idx, section.type === 'subcategory_grid' ? 'subCategoryIds' : 'brandIds', item._id)}
                                                             />
                                                             <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${section[section.type === 'subcategory_grid' ? 'subCategoryIds' : 'brandIds'].includes(item._id) ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-200'}`}>
                                                                 {section[section.type === 'subcategory_grid' ? 'subCategoryIds' : 'brandIds'].includes(item._id) && <Plus size={10} strokeWidth={6} />}
                                                             </div>
                                                             <span className="text-xs font-bold">{item.name}</span>
                                                         </label>
                                                     ))}
                                                 </div>
                                             </div>
                                         )}

                                         {section.type === 'product_rail' && (
                                             <div className="space-y-4 text-slate-900">
                                                 <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Product Catalog Selection</label>
                                                 <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                                                     <div className="flex items-center justify-between gap-4">
                                                         <button type="button" onClick={() => setPickerIndex(idx)} className="flex-1 py-3 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-600 hover:bg-slate-900 hover:text-white transition-all active:scale-95 shadow-sm">Choose Specific Marks</button>
                                                         <div className="bg-white border border-slate-200 rounded-2xl p-2 px-4 shadow-sm">
                                                             <span className="text-[10px] font-black text-slate-300 block leading-none mb-1">Items</span>
                                                             <span className="text-sm font-black text-blue-600">{section.productIds.length}</span>
                                                         </div>
                                                     </div>
                                                     {section.productPreviews?.length > 0 && (
                                                         <div className="flex flex-wrap gap-2 pt-2">
                                                             {section.productPreviews.map(p => (
                                                                 <div key={p._id} className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 shadow-sm">{p.name}</div>
                                                             ))}
                                                         </div>
                                                     )}
                                                 </div>
                                             </div>
                                         )}

                                         {(section.type === 'promo_banner' || section.type === 'product_rail' || section.type === 'view_more_cta') && (
                                            <div className="space-y-6 text-slate-900">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase block ml-1">Action Button Title</label>
                                                    <input value={section.ctaLabel} onChange={(e) => updateSection(idx, { ctaLabel: e.target.value })} className="form-input-simple" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase block ml-1">Redirect Web-route</label>
                                                    <input value={section.ctaLink} onChange={(e) => updateSection(idx, { ctaLink: e.target.value })} className="form-input-simple font-mono !text-[12px] opacity-70" />
                                                </div>
                                            </div>
                                         )}

                                         {section.type === 'promo_banner' && (
                                             <div className="space-y-4 text-slate-900">
                                                 <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest">Promotion Creative</label>
                                                 <MediaUploadField 
                                                    previewUrl={section.imagePreviewUrl || section.imageUrl}
                                                    onFileChange={(f) => handleSectionMediaChange(idx, 'imageUrl', f)}
                                                    onRemove={() => handleSectionMediaChange(idx, 'imageUrl', null)}
                                                 />
                                             </div>
                                         )}

                                         {(section.type !== 'promo_banner' && section.type !== 'view_more_cta') && (
                                             <div className="space-y-2 text-slate-900">
                                                 <label className="text-[10px] font-bold text-slate-400 uppercase block ml-1">Grid Limiter (Max Units)</label>
                                                 <input type="number" value={section.maxItems || section.maxProducts} onChange={(e) => updateSection(idx, { [section.type === 'product_rail' ? 'maxProducts' : 'maxItems']: e.target.value })} className="form-input-simple" />
                                             </div>
                                         )}
                                    </div>
                                </div>
                             </div>
                        ))}
                    </div>
                )}
             </div>
          </div>
        </div>
      </form>

      <ProductPickerModal
        show={pickerIndex !== null}
        onHide={() => setPickerIndex(null)}
        onSelect={handleProductSelection}
        existingProductIds={pickerIndex !== null ? (formData.sections[pickerIndex]?.productIds || []) : []}
        token={adminUser.token}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        .form-input-simple { 
            width: 100%; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 1.15rem; 
            padding: 0.85rem 1.25rem; outline: none; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); 
            font-size: 14px; font-weight: 500; font-family: inherit; color: #1e293b;
        }
        .form-input-simple:focus { border-color: #3b82f6; background: white; box-shadow: 0 0 0 5px rgba(59, 130, 246, 0.08); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
        .saathi-spinner { width: 32px; height: 32px; border: 3px solid #f8fafc; border-top-color: #3b82f6; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin 3s linear infinite; }
      `}} />
    </div>
  );
};

export default ManageCategoryPage;
