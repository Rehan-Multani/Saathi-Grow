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
  mobileImageUrl: '',
  mobileImagePublicId: '',
  mobileImageFile: null,
  mobileImagePreviewUrl: '',
  mobileImageFileName: '',
  ctaLabel: type === 'view_more_cta' ? 'View more products' : '',
  ctaLink: '',
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
      mobileBannerImage: '',
      mobileBannerImagePublicId: '',
      mobileBannerImageFile: null,
      mobileBannerImagePreviewUrl: '',
      mobileBannerImageFileName: '',
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
              mobileBannerImage: page.hero?.mobileBannerImage || '',
              mobileBannerImagePublicId: page.hero?.mobileBannerImagePublicId || '',
              mobileBannerImageFile: null,
              mobileBannerImagePreviewUrl: page.hero?.mobileBannerImage || '',
              mobileBannerImageFileName: '',
              sponsorLabel: page.hero?.sponsorLabel || 'Powered by',
              sponsorBrand: page.hero?.sponsorBrand?._id || page.hero?.sponsorBrand || ''
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
            sections: (page.sections || []).map((section, index) => ({
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
              mobileImageUrl: section.mobileImageUrl || '',
              mobileImagePublicId: section.mobileImagePublicId || '',
              mobileImageFile: null,
              mobileImagePreviewUrl: section.mobileImageUrl || '',
              mobileImageFileName: '',
              ctaLabel: section.ctaLabel || '',
              ctaLink: section.ctaLink || '',
              maxItems: section.maxItems || 8,
              maxProducts: section.maxProducts || 10,
              brandIds: normalizeEntityIds(section.brandIds),
              subCategoryIds: normalizeEntityIds(section.subCategoryIds),
              productIds: normalizeEntityIds(section.productIds),
              productPreviews: Array.isArray(section.productIds)
                ? section.productIds.filter((item) => item && typeof item === 'object' && item._id)
                : []
            }))
          });
        }
      } catch (error) {
        toast.error(error.message || 'Failed to load category page data');
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
        toast.error(error.message || 'Failed to load subcategories');
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
        [field]: '',
        [publicIdField]: '',
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

  const addSection = (type) => {
    setFormData((prev) => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          ...createSection(type),
          order: prev.sections.length
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
          sponsorBrand: formData.hero.sponsorBrand || null
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
          mobileImageUrl: section.mobileImageUrl,
          mobileImagePublicId: section.mobileImagePublicId,
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

      if (formData.hero.bannerImageFile) {
        requestData.append('hero.bannerImage', formData.hero.bannerImageFile);
      }
      if (formData.hero.mobileBannerImageFile) {
        requestData.append('hero.mobileBannerImage', formData.hero.mobileBannerImageFile);
      }
      if (formData.seo.imageFile) {
        requestData.append('seo.image', formData.seo.imageFile);
      }
      formData.sections.forEach((section, index) => {
        if (section.imageFile) {
          requestData.append(`sections[${index}].imageUrl`, section.imageFile);
        }
        if (section.mobileImageFile) {
          requestData.append(`sections[${index}].mobileImageUrl`, section.mobileImageFile);
        }
      });

      if (id) {
        await updateCategoryPage(adminUser.token, id, requestData);
        toast.success('Category landing page updated successfully.');
      } else {
        await createCategoryPage(adminUser.token, requestData);
        toast.success('Category landing page created successfully.');
      }

      navigate('/admin/category-pages');
    } catch (error) {
      toast.error(error.message || 'Failed to save category page');
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
            <h4 className="mb-1 fw-bold text-dark">{id ? 'Edit Category Landing Page' : 'Create Category Landing Page'}</h4>
            <Badge bg={formData.status === 'published' ? 'success' : 'secondary'} className="text-uppercase px-3 py-2 rounded-pill">
              {formData.status}
            </Badge>
          </div>
          <p className="mb-0 small text-muted">Configure the category hero, promo banners, brands, tiles, and product rails for the user app.</p>
        </div>

        <div className="d-flex gap-2">
          <Button type="button" variant="outline-primary" className="d-flex align-items-center gap-2 shadow-sm" onClick={handleLoadDemoLayout} disabled={!selectedCategory}>
            <LayoutTemplate size={16} />
            Load Demo Setup
          </Button>
          {selectedCategory?.slug && (
            <Button as={Link} to={`/category/${selectedCategory.slug}`} target="_blank" variant="light" className="d-flex align-items-center gap-2 border shadow-sm">
              <ExternalLink size={16} />
              Preview
            </Button>
          )}
          <Button as={Link} to="/admin/category-pages" variant="light" className="d-flex align-items-center gap-2 border shadow-sm">
            <ArrowLeft size={16} />
            Back
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
                    Page Setup
                  </h6>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Category</Form.Label>
                    <Form.Select value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value, hero: { ...prev.hero, title: prev.hero.title || categories.find((item) => item._id === e.target.value)?.name || '' } }))}>
                      <option value="">Select category</option>
                      {categories.map((category) => (
                        <option key={category._id} value={category._id}>
                          {category.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Publishing Status</Form.Label>
                    <Form.Select value={formData.status} onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </Form.Select>
                  </Form.Group>

                  <hr />

                  <h6 className="fw-bold mb-3">Hero</h6>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Hero Title</Form.Label>
                    <Form.Control value={formData.hero.title} onChange={(e) => handleHeroChange('title', e.target.value)} placeholder="Electronics" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Hero Subtitle</Form.Label>
                    <Form.Control value={formData.hero.subtitle} onChange={(e) => handleHeroChange('subtitle', e.target.value)} placeholder="Best tech picks for every day" />
                  </Form.Group>
                  <div className="mb-3">
                    <MediaUploadField
                      label="Hero Banner"
                      previewUrl={formData.hero.bannerImagePreviewUrl || formData.hero.bannerImage}
                      fileName={formData.hero.bannerImageFileName}
                      pending={Boolean(formData.hero.bannerImageFile)}
                      recommendation="Recommended: landscape banner for desktop/tablet."
                      helperText="The image will upload to Cloudinary when you save this category page."
                      onFileChange={(file) => handleHeroMediaChange('bannerImage', file)}
                      onRemove={() => handleHeroMediaChange('bannerImage', null)}
                    />
                  </div>
                  <div className="mb-3">
                    <MediaUploadField
                      label="Mobile Banner"
                      previewUrl={formData.hero.mobileBannerImagePreviewUrl || formData.hero.mobileBannerImage}
                      fileName={formData.hero.mobileBannerImageFileName}
                      pending={Boolean(formData.hero.mobileBannerImageFile)}
                      recommendation="Recommended: mobile-friendly crop for compact screens."
                      helperText="If left empty, the main hero banner will still be used as fallback."
                      onFileChange={(file) => handleHeroMediaChange('mobileBannerImage', file)}
                      onRemove={() => handleHeroMediaChange('mobileBannerImage', null)}
                    />
                  </div>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Sponsor Label</Form.Label>
                    <Form.Control value={formData.hero.sponsorLabel} onChange={(e) => handleHeroChange('sponsorLabel', e.target.value)} placeholder="Powered by" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">Sponsor Brand</Form.Label>
                    <Form.Select value={formData.hero.sponsorBrand} onChange={(e) => handleHeroChange('sponsorBrand', e.target.value)}>
                      <option value="">No sponsor brand</option>
                      {filteredBrands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>

                  <hr />

                  <h6 className="fw-bold mb-3">Theme</h6>
                  {Object.entries(formData.theme).map(([key, value]) => (
                    <Form.Group className="mb-3" key={key}>
                      <Form.Label className="small fw-bold text-muted text-capitalize">{key}</Form.Label>
                      <div className="d-flex gap-2 align-items-center">
                        <Form.Control type="color" value={value} onChange={(e) => handleThemeChange(key, e.target.value)} style={{ width: 54, height: 42 }} />
                        <Form.Control value={value} onChange={(e) => handleThemeChange(key, e.target.value)} />
                      </div>
                    </Form.Group>
                  ))}

                  <hr />

                  <h6 className="fw-bold mb-3">SEO</h6>
                  <Form.Group className="mb-3">
                    <Form.Label className="small fw-bold text-muted">SEO Title</Form.Label>
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
                      <Button type="button" variant="outline-primary" size="sm" onClick={() => addSection('promo_banner')}>Add Promo Banner</Button>
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
                                  <Form.Control type="number" value={section.order} onChange={(e) => updateSection(index, { order: e.target.value })} />
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

                              {(section.type === 'promo_banner') && (
                                <>
                                  <Col md={6}>
                                    <MediaUploadField
                                      label="Banner Image"
                                      previewUrl={section.imagePreviewUrl || section.imageUrl}
                                      fileName={section.imageFileName}
                                      pending={Boolean(section.imageFile)}
                                      recommendation="Primary promo banner for this section."
                                      helperText="This image uploads to Cloudinary on save."
                                      onFileChange={(file) => handleSectionMediaChange(index, 'imageUrl', file)}
                                      onRemove={() => handleSectionMediaChange(index, 'imageUrl', null)}
                                    />
                                  </Col>
                                  <Col md={6}>
                                    <MediaUploadField
                                      label="Mobile Banner"
                                      previewUrl={section.mobileImagePreviewUrl || section.mobileImageUrl}
                                      fileName={section.mobileImageFileName}
                                      pending={Boolean(section.mobileImageFile)}
                                      recommendation="Optional mobile-specific crop."
                                      helperText="If skipped, the primary banner will be reused on mobile."
                                      onFileChange={(file) => handleSectionMediaChange(index, 'mobileImageUrl', file)}
                                      onRemove={() => handleSectionMediaChange(index, 'mobileImageUrl', null)}
                                    />
                                  </Col>
                                </>
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
                                      <Form.Control type="number" value={section.maxProducts} onChange={(e) => updateSection(index, { maxProducts: e.target.value })} />
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
                                    <Form.Control type="number" value={section.maxItems} onChange={(e) => updateSection(index, { maxItems: e.target.value })} />
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
