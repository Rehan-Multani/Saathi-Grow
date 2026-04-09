import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { ArrowLeft, ExternalLink, LayoutTemplate, Plus, Save, Trash2 } from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { getCategories } from '../../api/categoryApi';
import { getBrands } from '../../api/brandApi';
import { getSubCategories } from '../../api/subcategoryApi';
import { createCategoryPage, getCategoryPageById, updateCategoryPage } from '../../api/categoryPageApi';
import { useTranslation } from 'react-i18next';
import ProductPickerModal from '../../components/common/ProductPickerModal';
import MediaUploadField from '../../components/common/MediaUploadField';

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
  const { t } = useTranslation();
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
          
          // Migrate legacy hero image to banners array if empty
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
        toast.error(error.message || t('manage_category_page.loading_failed', { defaultValue: 'Failed to load category page data' }));
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [adminUser.token, id, searchParams]);

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
        toast.error(error.message || t('subcategories.loading_failed', { defaultValue: 'Failed to load subcategories' }));
      }
    };

    loadSubCategories();
  }, [adminUser.token, formData.category]);

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
        // If we want to autofill banners too
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
      toast.error('Select a category first to generate a demo landing page layout.');
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
        subtitle: `Popular aisles from ${selectedCategory.name} for your landing page.`,
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
        subtitle: 'A featured brand strip to mirror the discovery experience.',
        order: order++,
        maxItems: brandIds.length,
        brandIds
      });
    }

    demoSections.push({
      ...createSection('promo_banner'),
      key: 'demo-promo-banner',
      title: `${selectedCategory.name} specials`,
      subtitle: 'A banner section to help you judge the hero-to-content flow.',
      order: order++,
      imageUrl: heroImage,
      imagePreviewUrl: heroImage,
      mobileImageUrl: heroImage,
      mobileImagePreviewUrl: heroImage,
      ctaLabel: 'Shop now',
      ctaLink: productsPath
    });

    demoSections.push({
      ...createSection('product_rail'),
      key: 'demo-product-rail',
      title: `Trending in ${selectedCategory.name}`,
      subtitle: 'This rail will auto-fill from category products after save.',
      order: order++,
      ctaLabel: 'View more',
      ctaLink: productsPath,
      maxProducts: 10
    });

    demoSections.push({
      ...createSection('view_more_cta'),
      key: 'demo-view-more',
      order: order++,
      ctaLabel: 'View more products',
      ctaLink: productsPath
    });

    setFormData((prev) => ({
      ...prev,
      hero: {
        ...prev.hero,
        title: prev.hero.title || selectedCategory.name,
        subtitle: prev.hero.subtitle || `Discover curated ${selectedCategory.name.toLowerCase()} picks on SaathiGro.`,
        bannerImage: prev.hero.bannerImage || heroImage,
        bannerImagePreviewUrl: prev.hero.bannerImagePreviewUrl || prev.hero.bannerImage || heroImage,
        mobileBannerImage: prev.hero.mobileBannerImage || heroImage,
        mobileBannerImagePreviewUrl: prev.hero.mobileBannerImagePreviewUrl || prev.hero.mobileBannerImage || heroImage,
        sponsorLabel: sponsorBrandId ? (prev.hero.sponsorLabel || 'Powered by') : '',
        sponsorBrand: sponsorBrandId
      },
      seo: {
        ...prev.seo,
        title: prev.seo.title || `${selectedCategory.name} | SaathiGro`,
        description: prev.seo.description || `Explore ${selectedCategory.name} with curated sections, featured brands, and fast-moving products on SaathiGro.`,
        image: prev.seo.image || heroImage,
        imagePreviewUrl: prev.seo.imagePreviewUrl || prev.seo.image || heroImage
      },
      sections: demoSections
    }));

    toast.success('Demo layout applied. Save and use Preview to check the landing page on the user frontend.');
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
      toast.error(error.message || 'Failed to load selected image');
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
            mobileImageUrl: '',
            mobileImagePublicId: '',
            mobileImageFile: null,
            mobileImagePreviewUrl: '',
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
      toast.error(error.message || 'Failed to load selected image');
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
      toast.error(error.message || 'Failed to load selected image');
    }
  };

  const handleSectionMediaChange = async (index, field, file) => {
    const previewField = field === 'imageUrl' ? 'imagePreviewUrl' : 'mobileImagePreviewUrl';
    const fileField = field === 'imageUrl' ? 'imageFile' : 'mobileImageFile';
    const fileNameField = field === 'imageUrl' ? 'imageFileName' : 'mobileImageFileName';
    const publicIdField = field === 'imageUrl' ? 'imagePublicId' : 'mobileImagePublicId';

    if (!file) {
      updateSection(index, {
        imageUrl: '',
        imagePublicId: '',
        imagePreviewUrl: '',
        imageFile: null,
        imageFileName: ''
      });
      return;
    }

    try {
      const previewUrl = await readFileAsDataUrl(file);
      updateSection(index, {
        imagePreviewUrl: previewUrl,
        imageFile: file,
        imageFileName: file.name
      });
    } catch (error) {
      toast.error(error.message || 'Failed to load selected image');
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

  const addSectionBanner = (sectionIndex) => {
    const productsPath = selectedCategory?.slug ? `/category/${selectedCategory.slug}/products` : '';
    const currentBanners = formData.sections[sectionIndex].banners || [];
    updateSection(sectionIndex, {
      banners: [...currentBanners, { title: '', subtitle: '', ctaLink: productsPath, imageUrl: '' }]
    });
  };

  const removeSectionBanner = (sectionIndex, bannerIndex) => {
    const banners = [...(formData.sections[sectionIndex].banners || [])];
    banners.splice(bannerIndex, 1);
    updateSection(sectionIndex, { banners });
  };

  const updateSectionBanner = (sectionIndex, bannerIndex, updates) => {
    const banners = [...(formData.sections[sectionIndex].banners || [])];
    banners[bannerIndex] = { ...banners[bannerIndex], ...updates };
    updateSection(sectionIndex, { banners });
  };

  const handleSectionBannerMediaChange = (sectionIndex, bannerIndex, file) => {
    const banners = [...(formData.sections[sectionIndex].banners || [])];
    const banner = { ...banners[bannerIndex] };
    if (file) {
      banner.imageFile = file;
      banner.imagePreviewUrl = URL.createObjectURL(file);
      banner.imageFileName = file.name;
    } else {
      banner.imageFile = null;
      banner.imagePreviewUrl = '';
      banner.imageFileName = '';
    }
    banners[bannerIndex] = banner;
    updateSection(sectionIndex, { banners });
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

    if (!formData.category) {
      toast.error('Please select a category first.');
      return;
    }

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
          mobileBannerImage: formData.hero.mobileBannerImage,
          mobileBannerImagePublicId: formData.hero.mobileBannerImagePublicId,
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
          banners: (section.banners || []).map(b => ({
            imageUrl: b.imageUrl,
            imagePublicId: b.imagePublicId,
            ctaLink: b.ctaLink,
            title: b.title,
            subtitle: b.subtitle
          })),
          maxItems: Number(section.maxItems) || 8,
          maxProducts: Number(section.maxProducts) || 10,
          brandIds: section.brandIds || [],
          subCategoryIds: section.subCategoryIds || [],
          productIds: section.productIds || []
        }))
      };

      const requestData = new FormData();
      requestData.append('payload', JSON.stringify(payload));

      if (formData.hero.bannerImageFile) {
        requestData.append('hero.bannerImage', formData.hero.bannerImageFile);
      }
      formData.hero.banners.forEach((banner, index) => {
        if (banner.imageFile) {
          requestData.append(`hero.banners[${index}].imageUrl`, banner.imageFile);
        }
      });
      if (formData.seo.imageFile) {
        requestData.append('seo.image', formData.seo.imageFile);
      }
      formData.sections.forEach((section, sIdx) => {
        if (section.imageFile) {
          requestData.append(`sections[${sIdx}].imageUrl`, section.imageFile);
        }
        if (section.mobileImageFile) {
          requestData.append(`sections[${sIdx}].mobileImageUrl`, section.mobileImageFile);
        }

        (section.banners || []).forEach((banner, bIdx) => {
          if (banner.imageFile) {
            requestData.append(`sections[${sIdx}].banners[${bIdx}].imageUrl`, banner.imageFile);
          }
        });
      });

      if (id) {
        await updateCategoryPage(adminUser.token, id, requestData);
        toast.success(t('manage_category_page.update_success', { defaultValue: 'Category landing page updated successfully.' }));
      } else {
        await createCategoryPage(adminUser.token, requestData);
        toast.success(t('manage_category_page.create_success', { defaultValue: 'Category landing page created successfully.' }));
      }

      navigate('/admin/category-pages');
    } catch (error) {
      toast.error(error.message || t('manage_category_page.save_failed', { defaultValue: 'Failed to save category page' }));
    } finally {
      setSaving(false);
    }
  };

  const currentPickerProductIds = pickerIndex !== null
    ? (formData.sections[pickerIndex]?.productIds || [])
    : [];

  return (
    <div className="p-3 p-md-4">
      <div className="mb-4 d-flex flex-column flex-md-row justify-content-between gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h4 className="mb-1 fw-bold text-dark">{id ? t('manage_category_page.edit_title', { defaultValue: 'Edit Category Landing Page' }) : t('manage_category_page.create_title', { defaultValue: 'Create Category Landing Page' })}</h4>
            <Badge bg={formData.status === 'published' ? 'success' : 'secondary'} className="text-uppercase px-3 py-2 rounded-pill">
              {formData.status === 'published' ? t('manage_category_page.sections.published', { defaultValue: 'published' }) : t('manage_category_page.sections.draft', { defaultValue: 'draft' })}
            </Badge>
          </div>
          <p className="mb-0 small text-muted font-weight-medium">{t('manage_category_page.header_subtitle', { defaultValue: 'Configure the category hero, promo banners, brands, tiles, and product rails for the user app.' })}</p>
        </div>

        <div className="d-flex gap-2">
          <Button type="button" variant="outline-primary" className="d-flex align-items-center gap-2 shadow-sm py-2 px-3" onClick={handleLoadDemoLayout} disabled={!selectedCategory}>
            <LayoutTemplate size={16} />
            <span className="fw-bold">{t('manage_category_page.load_demo', { defaultValue: 'Load Demo Setup' })}</span>
          </Button>
          {selectedCategory?.slug && (
            <Button as={Link} to={`/category/${selectedCategory.slug}`} target="_blank" variant="light" className="d-flex align-items-center gap-2 border shadow-sm py-2 px-3">
              <ExternalLink size={16} />
              <span className="fw-bold">{t('manage_category_page.view_live', { defaultValue: 'Preview' })}</span>
            </Button>
          )}
          <Button as={Link} to="/admin/category-pages" variant="light" className="d-flex align-items-center gap-2 border shadow-sm py-2 px-3">
            <ArrowLeft size={16} />
            <span className="fw-bold">{t('common.cancel', { defaultValue: 'Back' })}</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-5 text-center">
          <Spinner animation="border" variant="primary" />
        </div>
      ) : (
        <Form onSubmit={handleSubmit}>
          <Row className="g-4">
            <Col xl={4}>
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-4">
                  <h6 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <LayoutTemplate size={18} className="text-primary" />
                    {t('manage_category_page.sections.page_setup', { defaultValue: 'Page Setup' })}
                  </h6>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">{t('manage_category_page.sections.category', { defaultValue: 'Category' })}</Form.Label>
                    <Form.Select value={formData.category} onChange={(e) => handleCategoryChange(e.target.value)} disabled={loading}>
                      <option value="">{t('manage_category_page.sections.select_category', { defaultValue: 'Select category' })}</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">{t('manage_category_page.sections.publishing_status', { defaultValue: 'Publishing Status' })}</Form.Label>
                    <Form.Select value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}>
                      <option value="draft">{t('manage_category_page.sections.draft', { defaultValue: 'Draft' })}</option>
                      <option value="published">{t('manage_category_page.sections.published', { defaultValue: 'Published' })}</option>
                    </Form.Select>
                  </Form.Group>

                  <hr />

                  <hr />

                  <h6 className="fw-bold mb-3">{t('manage_category_page.hero.title', { defaultValue: 'Hero Section' })}</h6>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">{t('manage_category_page.hero.main_title', { defaultValue: 'Hero Title' })}</Form.Label>
                    <Form.Control value={formData.hero.title} onChange={(e) => handleHeroChange('title', e.target.value)} placeholder="Electronics" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">{t('manage_category_page.hero.subtitle', { defaultValue: 'Hero Subtitle' })}</Form.Label>
                    <Form.Control value={formData.hero.subtitle} onChange={(e) => handleHeroChange('subtitle', e.target.value)} placeholder="Best tech picks for every day" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">{t('manage_category_page.hero.sponsor_label', { defaultValue: 'Sponsor Label' })}</Form.Label>
                    <Form.Control value={formData.hero.sponsorLabel} onChange={(e) => handleHeroChange('sponsorLabel', e.target.value)} placeholder="Powered by" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">{t('manage_category_page.hero.sponsor_brand', { defaultValue: 'Sponsor Brand' })}</Form.Label>
                    <Form.Select value={formData.hero.sponsorBrand} onChange={(e) => handleHeroChange('sponsorBrand', e.target.value)}>
                      <option value="">{t('manage_category_page.hero.no_sponsor', { defaultValue: 'No sponsor brand' })}</option>
                      {filteredBrands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <hr />

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0">{t('manage_category_page.hero.banners_title', { defaultValue: 'Hero Banners (Slider)' })}</h6>
                    <Button variant="outline-primary" size="sm" onClick={addHeroBanner}>
                      <Plus size={14} /> {t('manage_category_page.hero.add_slide', { defaultValue: 'Add Banner' })}
                    </Button>
                  </div>

                  {formData.hero.banners.length === 0 ? (
                    <div className="small text-muted mb-3 p-2 border border-dashed rounded text-center">
                      {t('manage_category_page.hero.no_banners', { defaultValue: 'No banners added yet. Added images will appear here.' })}
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3 mb-3">
                      {formData.hero.banners.map((banner, index) => (
                        <Card key={index} className="border bg-light bg-opacity-10 shadow-none">
                          <Card.Body className="p-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="small fw-bold">Banner #{index + 1}</span>
                              <Button variant="link" className="text-danger p-0" onClick={() => removeHeroBanner(index)}>
                                <Trash2 size={14} />
                              </Button>
                            </div>
                            <Form.Group className="mb-2">
                              <Form.Control
                                size="sm"
                                placeholder="Banner Title (Optional)"
                                value={banner.title}
                                onChange={(e) => updateHeroBanner(index, { title: e.target.value })}
                              />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <Form.Control
                                size="sm"
                                placeholder="Banner Subtitle (Optional)"
                                value={banner.subtitle}
                                onChange={(e) => updateHeroBanner(index, { subtitle: e.target.value })}
                              />
                            </Form.Group>
                            <Form.Group className="mb-2">
                              <Form.Control
                                size="sm"
                                placeholder="CTA Link (e.g. /category/slug/products)"
                                value={banner.ctaLink}
                                onChange={(e) => updateHeroBanner(index, { ctaLink: e.target.value })}
                              />
                            </Form.Group>
                            <div className="mt-2">
                              <MediaUploadField
                                label="Banner Image"
                                size="sm"
                                previewUrl={banner.imagePreviewUrl || banner.imageUrl}
                                pending={Boolean(banner.imageFile)}
                                onFileChange={(file) => handleHeroBannerMediaChange(index, file)}
                                onRemove={() => handleHeroBannerMediaChange(index, null)}
                              />
                            </div>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}

                  <hr />

                  <h6 className="fw-bold mb-3">{t('manage_category_page.theme.title', { defaultValue: 'Theme' })}</h6>
                  {Object.entries(formData.theme).map(([key, value]) => (
                    <Form.Group className="mb-3" key={key}>
                      <Form.Label className="small fw-bold text-muted text-capitalize">{t(`manage_category_page.theme.${key}`, { defaultValue: key })}</Form.Label>
                      <div className="d-flex gap-2 align-items-center">
                        <Form.Control type="color" value={value} onChange={(e) => handleThemeChange(key, e.target.value)} style={{ width: 54, height: 42 }} />
                        <Form.Control value={value} onChange={(e) => handleThemeChange(key, e.target.value)} />
                      </div>
                    </Form.Group>
                  ))}

                  <hr />

                  <h6 className="fw-bold mb-3">{t('manage_category_page.seo.title', { defaultValue: 'SEO' })}</h6>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">{t('manage_category_page.seo.meta_title', { defaultValue: 'SEO Title' })}</Form.Label>
                    <Form.Control value={formData.seo.title} onChange={(e) => handleSeoChange('title', e.target.value)} placeholder="Category page title" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">SEO Description</Form.Label>
                    <Form.Control as="textarea" rows={3} value={formData.seo.description} onChange={(e) => handleSeoChange('description', e.target.value)} />
                  </Form.Group>
                  <div className="mb-0">
                    <MediaUploadField
                      label="SEO Image"
                      previewUrl={formData.seo.imagePreviewUrl || formData.seo.image}
                      fileName={formData.seo.imageFileName}
                      pending={Boolean(formData.seo.imageFile)}
                      recommendation="Used when this category page is shared in social previews."
                      helperText="A clean branded image works best for SEO and link previews."
                      onFileChange={handleSeoMediaChange}
                      onRemove={() => handleSeoMediaChange(null)}
                    />
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col xl={8}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body className="p-4">
                  <div className="d-flex flex-column flex-md-row justify-content-between gap-3 mb-4">
                    <div>
                      <h6 className="fw-bold mb-1">Landing Page Sections</h6>
                      <p className="mb-0 small text-muted">Stack these sections in the same order you want them rendered in the user app.</p>
                    </div>
                    <div className="d-flex flex-wrap gap-2">
                      <Button type="button" variant="outline-primary" size="sm" onClick={() => addSection('subcategory_grid')}>Add Subcategory Grid</Button>
                      <Button type="button" variant="outline-primary" size="sm" onClick={() => addSection('brand_strip')}>Add Brand Strip</Button>
                      <Button type="button" variant="outline-primary" size="sm" onClick={() => addSection('promo_banner')}>Add Promo Banners</Button>
                      <Button type="button" variant="outline-primary" size="sm" onClick={() => addSection('product_rail')}>Add Product Rail</Button>
                      <Button type="button" variant="outline-primary" size="sm" onClick={() => addSection('view_more_cta')}>Add CTA</Button>
                    </div>
                  </div>

                  {formData.sections.length === 0 ? (
                    <div className="rounded-4 border border-dashed bg-light p-5 text-center text-muted">
                      Add your first section to start building the category landing page.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3">
                      {formData.sections.map((section, index) => (
                        <Card key={`${section.key}-${index}`} className="border">
                          <Card.Body>
                            <div className="d-flex flex-column flex-lg-row justify-content-between gap-3 mb-3">
                              <div className="d-flex align-items-center gap-2">
                                <Badge bg="dark" className="text-uppercase">{section.type.replace(/_/g, ' ')}</Badge>
                                <span className="small text-muted">Section {index + 1}</span>
                              </div>
                              <div className="d-flex gap-2">
                                <Form.Check
                                  type="switch"
                                  id={`active-${index}`}
                                  label="Active"
                                  checked={section.isActive !== false}
                                  onChange={(e) => updateSection(index, { isActive: e.target.checked })}
                                />
                                <Button type="button" variant="light" size="sm" className="border text-danger" onClick={() => removeSection(index)}>
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </div>

                            <Row className="g-3">
                              <Col md={4}>
                                <Form.Group>
                                  <Form.Label className="small fw-bold text-muted">Key</Form.Label>
                                  <Form.Control value={section.key} onChange={(e) => updateSection(index, { key: e.target.value })} />
                                </Form.Group>
                              </Col>
                              <Col md={4}>
                                <Form.Group>
                                  <Form.Label className="small fw-bold text-muted">Title</Form.Label>
                                  <Form.Control value={section.title} onChange={(e) => updateSection(index, { title: e.target.value })} />
                                </Form.Group>
                              </Col>
                              <Col md={4}>
                                <Form.Group>
                                  <Form.Label className="small fw-bold text-muted">Order</Form.Label>
                                  <Form.Control
                                    type="number"
                                    value={section.order}
                                    onFocus={(e) => { if (section.order === 0 || section.order === "0") updateSection(index, { order: "" }) }}
                                    onBlur={(e) => { if (section.order === "" || section.order === null) updateSection(index, { order: 0 }) }}
                                    onChange={(e) => updateSection(index, { order: e.target.value })}
                                  />
                                </Form.Group>
                              </Col>
                              <Col md={12}>
                                <Form.Group>
                                  <Form.Label className="small fw-bold text-muted">Subtitle</Form.Label>
                                  <Form.Control value={section.subtitle} onChange={(e) => updateSection(index, { subtitle: e.target.value })} />
                                </Form.Group>
                              </Col>

                              {(section.type === 'promo_banner' || section.type === 'product_rail' || section.type === 'view_more_cta') && (
                                <>
                                  <Col md={6}>
                                    <Form.Group>
                                      <Form.Label className="small fw-bold text-muted">CTA Label</Form.Label>
                                      <Form.Control value={section.ctaLabel} onChange={(e) => updateSection(index, { ctaLabel: e.target.value })} />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <Form.Group>
                                      <Form.Label className="small fw-bold text-muted">CTA Link</Form.Label>
                                      <Form.Control value={section.ctaLink} onChange={(e) => updateSection(index, { ctaLink: e.target.value })} placeholder="/category/example/products" />
                                    </Form.Group>
                                  </Col>
                                </>
                              )}

                              {(section.type === 'banner_slider' || section.type === 'promo_banner') && (
                                <Col md={12}>
                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                    <Form.Label className="small fw-bold text-muted mb-0">Banners Slider / Carousel</Form.Label>
                                    <Button variant="outline-success" size="sm" onClick={() => addSectionBanner(index)}>
                                      <Plus size={14} /> Add Slide
                                    </Button>
                                  </div>

                                  {(section.banners && section.banners.length > 0) ? (
                                    <div className="row g-3">
                                      {section.banners.map((banner, bIdx) => (
                                        <Col key={bIdx} md={6}>
                                          <Card className="border shadow-none bg-white">
                                            <Card.Body className="p-3">
                                              <div className="d-flex justify-content-between align-items-center mb-2">
                                                <span className="small fw-bold text-primary">Slide #{bIdx + 1}</span>
                                                <Button 
                                                  variant="link" 
                                                  className="text-danger p-0" 
                                                  onClick={() => removeSectionBanner(index, bIdx)}
                                                >
                                                  <Trash2 size={14} />
                                                </Button>
                                              </div>
                                              <Form.Group className="mb-2">
                                                <Form.Control 
                                                  size="sm" 
                                                  placeholder="Slide Title" 
                                                  value={banner.title} 
                                                  onChange={(e) => updateSectionBanner(index, bIdx, { title: e.target.value })}
                                                />
                                              </Form.Group>
                                              <Form.Group className="mb-2">
                                                <Form.Control 
                                                  size="sm" 
                                                  placeholder="CTA Link" 
                                                  value={banner.ctaLink} 
                                                  onChange={(e) => updateSectionBanner(index, bIdx, { ctaLink: e.target.value })}
                                                />
                                              </Form.Group>
                                              <div className="row g-2">
                                                <div className="col-12">
                                                  <MediaUploadField
                                                    label="Banner Image"
                                                    size="sm"
                                                    previewUrl={banner.imagePreviewUrl || banner.imageUrl}
                                                    pending={Boolean(banner.imageFile)}
                                                    onFileChange={(file) => handleSectionBannerMediaChange(index, bIdx, file)}
                                                    onRemove={() => handleSectionBannerMediaChange(index, bIdx, null)}
                                                  />
                                                </div>
                                              </div>
                                            </Card.Body>
                                          </Card>
                                        </Col>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="p-3 border border-dashed rounded text-center small text-muted">
                                      Add slides to create a banner carousel for this section.
                                    </div>
                                  )}
                                </Col>
                              )}

                              {(section.type === 'subcategory_grid') && (
                                <Col md={12}>
                                  <Form.Label className="small fw-bold text-muted">Subcategories</Form.Label>
                                  <div className="d-flex flex-wrap gap-2 rounded-4 bg-light p-3">
                                    {subCategories.length > 0 ? subCategories.map((subCategory) => (
                                      <Form.Check
                                        key={subCategory._id}
                                        inline
                                        type="checkbox"
                                        id={`sub-${index}-${subCategory._id}`}
                                        label={subCategory.name}
                                        checked={section.subCategoryIds.includes(subCategory._id)}
                                        onChange={() => toggleSectionId(index, 'subCategoryIds', subCategory._id)}
                                      />
                                    )) : (
                                      <span className="small text-muted">Select a category to load subcategories. Leave empty to auto-use active items.</span>
                                    )}
                                  </div>
                                </Col>
                              )}

                              {(section.type === 'brand_strip') && (
                                <Col md={12}>
                                  <Form.Label className="small fw-bold text-muted">Brands</Form.Label>
                                  <div className="d-flex flex-wrap gap-2 rounded-4 bg-light p-3">
                                    {filteredBrands.length > 0 ? filteredBrands.map((brand) => (
                                      <Form.Check
                                        key={brand._id}
                                        inline
                                        type="checkbox"
                                        id={`brand-${index}-${brand._id}`}
                                        label={brand.name}
                                        checked={section.brandIds.includes(brand._id)}
                                        onChange={() => toggleSectionId(index, 'brandIds', brand._id)}
                                      />
                                    )) : (
                                      <span className="small text-muted">No active brands matched for this category yet. Leave empty to auto-pull by category.</span>
                                    )}
                                  </div>
                                </Col>
                              )}

                              {(section.type === 'product_rail') && (
                                <>
                                  <Col md={6}>
                                    <Form.Group>
                                      <Form.Label className="small fw-bold text-muted">Max Products</Form.Label>
                                      <Form.Control
                                        type="number"
                                        value={section.maxProducts}
                                        onFocus={(e) => { if (section.maxProducts === 0 || section.maxProducts === "0") updateSection(index, { maxProducts: "" }) }}
                                        onBlur={(e) => { if (section.maxProducts === "" || section.maxProducts === null) updateSection(index, { maxProducts: 0 }) }}
                                        onChange={(e) => updateSection(index, { maxProducts: e.target.value })}
                                      />
                                    </Form.Group>
                                  </Col>
                                  <Col md={6}>
                                    <div className="small fw-bold text-muted mb-2">Products</div>
                                    <div className="d-flex align-items-center gap-2">
                                      <Button type="button" variant="outline-primary" onClick={() => setPickerIndex(index)}>
                                        Choose Products
                                      </Button>
                                      <span className="small text-muted">
                                        {section.productIds.length > 0 ? `${section.productIds.length} selected` : 'Leave empty to auto-fill from the category'}
                                      </span>
                                    </div>
                                  </Col>
                                  {section.productPreviews?.length > 0 && (
                                    <Col md={12}>
                                      <div className="d-flex flex-wrap gap-2 rounded-4 bg-light p-3">
                                        {section.productPreviews.map((product) => (
                                          <Badge bg="light" text="dark" key={product._id} className="border px-3 py-2">
                                            {product.name}
                                          </Badge>
                                        ))}
                                      </div>
                                    </Col>
                                  )}
                                </>
                              )}

                              {(section.type === 'subcategory_grid' || section.type === 'brand_strip') && (
                                <Col md={6}>
                                  <Form.Group>
                                    <Form.Label className="small fw-bold text-muted">Max Items</Form.Label>
                                    <Form.Control
                                      type="number"
                                      value={section.maxItems}
                                      onFocus={(e) => { if (section.maxItems === 0 || section.maxItems === "0") updateSection(index, { maxItems: "" }) }}
                                      onBlur={(e) => { if (section.maxItems === "" || section.maxItems === null) updateSection(index, { maxItems: 0 }) }}
                                      onChange={(e) => updateSection(index, { maxItems: e.target.value })}
                                    />
                                  </Form.Group>
                                </Col>
                              )}
                            </Row>
                          </Card.Body>
                        </Card>
                      ))}
                    </div>
                  )}
                </Card.Body>
              </Card>

              <div className="d-flex justify-content-end">
                <Button type="submit" variant="primary" className="d-flex align-items-center gap-2 px-4 py-2 shadow-sm" disabled={saving}>
                  {saving ? <Spinner animation="border" size="sm" /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Category Page'}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      )}

      <ProductPickerModal
        show={pickerIndex !== null}
        onHide={() => setPickerIndex(null)}
        onSelect={handleProductSelection}
        existingProductIds={currentPickerProductIds}
        token={adminUser.token}
      />
    </div>
  );
};

export default ManageCategoryPage;
