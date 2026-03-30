import mongoose from 'mongoose';
import CategoryPage from '../models/CategoryPage.js';
import Category from '../models/Category.js';
import SubCategory from '../models/SubCategory.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import { cloudinary, uploadBufferToCloudinary } from '../config/cloudinary.js';

const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getExactNameRegex = (value) => new RegExp(`^${escapeRegExp(String(value || '').trim())}$`, 'i');

const normalizeObjectId = (value) => {
  const raw = value?._id || value?.id || value;
  return mongoose.Types.ObjectId.isValid(raw) ? raw : null;
};

const normalizeRefArray = (items = []) => {
  if (!Array.isArray(items)) return [];
  return items
    .map(normalizeObjectId)
    .filter(Boolean)
    .map(String);
};

const sanitizeTheme = (theme = {}) => ({
  pageBg: theme.pageBg || '#f6fbf7',
  heroBg: theme.heroBg || '#eef8f0',
  cardBg: theme.cardBg || '#ffffff',
  accent: theme.accent || '#0c831f',
  text: theme.text || '#111827'
});

const sanitizeHero = (hero = {}) => ({
  title: hero.title || '',
  subtitle: hero.subtitle || '',
  bannerImage: hero.bannerImage || '',
  bannerImagePublicId: hero.bannerImagePublicId || '',
  banners: (Array.isArray(hero.banners) ? hero.banners : []).map((banner) => ({
    imageUrl: banner.imageUrl || '',
    imagePublicId: banner.imagePublicId || '',
    ctaLink: banner.ctaLink || '',
    title: banner.title || '',
    subtitle: banner.subtitle || ''
  })),
  sponsorLabel: hero.sponsorLabel || '',
  sponsorBrand: normalizeObjectId(hero.sponsorBrand)
});

const sanitizeSeo = (seo = {}) => ({
  title: seo.title || '',
  description: seo.description || '',
  image: seo.image || '',
  imagePublicId: seo.imagePublicId || ''
});

const sanitizeSections = (sections = []) => {
  if (!Array.isArray(sections)) return [];

  return sections
    .filter((section) => section && section.type)
    .map((section, index) => ({
      key: (section.key || `${section.type}-${index + 1}`).trim(),
      type: section.type,
      title: section.title || '',
      subtitle: section.subtitle || '',
      order: Number.isFinite(Number(section.order)) ? Number(section.order) : index,
      isActive: section.isActive !== false,
      imageUrl: section.imageUrl || '',
      imagePublicId: section.imagePublicId || '',
      ctaLabel: section.ctaLabel || '',
      ctaLink: section.ctaLink || '',
      banners: (Array.isArray(section.banners) ? section.banners : []).map((banner) => ({
        imageUrl: banner.imageUrl || '',
        imagePublicId: banner.imagePublicId || '',
        ctaLink: banner.ctaLink || '',
        title: banner.title || '',
        subtitle: banner.subtitle || ''
      })),
      maxItems: Number.isFinite(Number(section.maxItems)) ? Math.max(1, Number(section.maxItems)) : 8,
      maxProducts: Number.isFinite(Number(section.maxProducts)) ? Math.max(1, Number(section.maxProducts)) : 10,
      brandIds: normalizeRefArray(section.brandIds),
      subCategoryIds: normalizeRefArray(section.subCategoryIds),
      productIds: normalizeRefArray(section.productIds)
    }))
    .sort((a, b) => a.order - b.order);
};

const parseCategoryPagePayload = (req) => {
  if (req.body?.payload) {
    if (typeof req.body.payload === 'string') {
      return JSON.parse(req.body.payload);
    }
    return req.body.payload;
  }

  return req.body || {};
};

const collectCategoryPagePublicIds = (page = {}) => {
  const ids = [
    page.hero?.bannerImagePublicId,
    page.hero?.mobileBannerImagePublicId,
    page.seo?.imagePublicId
  ];

  for (const banner of page.hero?.banners || []) {
    ids.push(banner.imagePublicId);
  }
  for (const section of page.sections || []) {
    ids.push(section.imagePublicId);
    for (const banner of section.banners || []) {
      ids.push(banner.imagePublicId);
    }
  }

  return [...new Set(ids.filter(Boolean))];
};

const deleteCloudinaryAssets = async (publicIds = []) => {
  const uniquePublicIds = [...new Set(publicIds.filter(Boolean))];
  if (uniquePublicIds.length === 0) return;

  await Promise.all(
    uniquePublicIds.map(async (publicId) => {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error(`Failed to delete Cloudinary asset ${publicId}:`, error.message);
      }
    })
  );
};

const getUploadFolderForField = (fieldName = '') => {
  if (fieldName.startsWith('hero.')) {
    return 'saathigro/category-pages/hero';
  }

  if (fieldName.startsWith('seo.')) {
    return 'saathigro/category-pages/seo';
  }

  return 'saathigro/category-pages/sections';
};

const applyUploadedFilesToPayload = async (payload = {}, files = []) => {
  const nextPayload = {
    ...payload,
    hero: { ...(payload.hero || {}) },
    seo: { ...(payload.seo || {}) },
    sections: Array.isArray(payload.sections)
      ? payload.sections.map((section) => ({ ...section }))
      : []
  };

  const uploadedPublicIds = [];

  for (const file of files || []) {
    if (!file?.buffer || !file.fieldname) continue;

    const uploadResult = await uploadBufferToCloudinary({
      buffer: file.buffer,
      folder: getUploadFolderForField(file.fieldname)
    });

    uploadedPublicIds.push(uploadResult.public_id);

    if (file.fieldname === 'hero.bannerImage') {
      nextPayload.hero.bannerImage = uploadResult.secure_url;
      nextPayload.hero.bannerImagePublicId = uploadResult.public_id;
      continue;
    }


    if (file.fieldname === 'seo.image') {
      nextPayload.seo.image = uploadResult.secure_url;
      nextPayload.seo.imagePublicId = uploadResult.public_id;
      continue;
    }

    const bannerMatch = file.fieldname.match(/^hero\.banners\[(\d+)\]\.imageUrl$/);
    if (bannerMatch) {
      const bannerIndex = Number(bannerMatch[1]);
      const banner = nextPayload.hero.banners[bannerIndex];
      if (banner) {
        banner.imageUrl = uploadResult.secure_url;
        banner.imagePublicId = uploadResult.public_id;
      }
      continue;
    }

    const sectionBannerMatch = file.fieldname.match(/^sections\[(\d+)\]\.banners\[(\d+)\]\.imageUrl$/);
    if (sectionBannerMatch) {
      const sectionIndex = Number(sectionBannerMatch[1]);
      const bannerIndex = Number(sectionBannerMatch[2]);
      const section = nextPayload.sections[sectionIndex];
      if (section && section.banners && section.banners[bannerIndex]) {
        section.banners[bannerIndex].imageUrl = uploadResult.secure_url;
        section.banners[bannerIndex].imagePublicId = uploadResult.public_id;
      }
      continue;
    }

    const sectionMatch = file.fieldname.match(/^sections\[(\d+)\]\.imageUrl$/);
    if (!sectionMatch) continue;

    const sectionIndex = Number(sectionMatch[1]);
    const section = nextPayload.sections[sectionIndex];

    if (!section) continue;

    section.imageUrl = uploadResult.secure_url;
    section.imagePublicId = uploadResult.public_id;
  }

  return {
    payload: nextPayload,
    uploadedPublicIds
  };
};

const buildCategoryPageProductQuery = ({ categoryName, brandNames = [], subCategoryNames = [], productIds = [] }) => {
  const query = {
    status: { $in: ['Active', 'Low Stock', 'Out of Stock'] }
  };

  if (categoryName) {
    query.category = getExactNameRegex(categoryName);
  }

  if (brandNames.length > 0) {
    query.brandName = { $in: brandNames.map((name) => getExactNameRegex(name)) };
  }

  if (subCategoryNames.length > 0) {
    query.subCategory = { $in: subCategoryNames.map((name) => getExactNameRegex(name)) };
  }

  if (productIds.length > 0) {
    query._id = { $in: productIds.map((id) => new mongoose.Types.ObjectId(id)) };
  }

  return query;
};

const enrichProductsForStore = (products = [], storeId, storeType) => {
  if (!storeId || !storeType) return products;

  return products.map((product) => {
    const productObj = product.toObject ? product.toObject() : { ...product };
    let isDeliverable = false;
    let availableStock = 0;
    let lowStockThreshold = productObj.lowStockThreshold || 10;
    let inStore = false;

    if (storeType === 'branch') {
      const branchStock = (productObj.branchStocks || []).find((item) => {
        const branchId = item.branchId?._id || item.branchId;
        return branchId && String(branchId) === String(storeId);
      });

      if (branchStock) {
        inStore = true;
        availableStock = branchStock.stock || 0;
        lowStockThreshold = branchStock.lowStockThreshold || 10;
        isDeliverable = availableStock > 0;
      }
    } else if (storeType === 'vendor') {
      const vendorId = productObj.vendor?._id || productObj.vendor;
      if (vendorId && String(vendorId) === String(storeId)) {
        inStore = true;
        availableStock = productObj.stock || 0;
        lowStockThreshold = productObj.lowStockThreshold || 10;
        isDeliverable = availableStock > 0;
      }
    }

    return {
      ...productObj,
      isDeliverable,
      availableStock,
      lowStockThreshold,
      inStore
    };
  });
};

const orderByIds = (items = [], ids = []) => {
  if (!Array.isArray(ids) || ids.length === 0) return items;
  const rank = new Map(ids.map((id, index) => [String(id), index]));
  return [...items].sort((a, b) => {
    const aRank = rank.get(String(a._id ?? a.id));
    const bRank = rank.get(String(b._id ?? b.id));
    return (aRank ?? Number.MAX_SAFE_INTEGER) - (bRank ?? Number.MAX_SAFE_INTEGER);
  });
};

const fetchSectionProducts = async (section, categoryName, storeContext) => {
  const { storeId, storeType } = storeContext;
  let query = null;
  let products = [];

  if (section.productIds?.length > 0) {
    query = buildCategoryPageProductQuery({
      categoryName,
      productIds: section.productIds
    });

    products = await Product.find(query)
      .select('name image basePrice mrp category subCategory brandName unitType unitValue status isVeg sku branchStocks vendor stock lowStockThreshold averageRating ratingCount')
      .sort({ isSaathiGrow: -1, createdAt: -1 })
      .lean();

    products = orderByIds(products, section.productIds);
  } else {
    const brandDocs = section.brandIds?.length
      ? await Brand.find({ _id: { $in: section.brandIds } }).select('name').lean()
      : [];
    const subCategoryDocs = section.subCategoryIds?.length
      ? await SubCategory.find({ _id: { $in: section.subCategoryIds } }).select('name').lean()
      : [];

    query = buildCategoryPageProductQuery({
      categoryName,
      brandNames: brandDocs.map((item) => item.name).filter(Boolean),
      subCategoryNames: subCategoryDocs.map((item) => item.name).filter(Boolean)
    });

    products = await Product.find(query)
      .select('name image basePrice mrp category subCategory brandName unitType unitValue status isVeg sku branchStocks vendor stock lowStockThreshold averageRating ratingCount')
      .sort({ isSaathiGrow: -1, createdAt: -1 })
      .limit(section.maxProducts || 10)
      .lean();
  }

  const limitedProducts = products.slice(0, section.maxProducts || 10);
  return enrichProductsForStore(limitedProducts, storeId, storeType);
};

const fetchSectionSubCategories = async (section, categoryName) => {
  if (section.subCategoryIds?.length > 0) {
    const subCategories = await SubCategory.find({
      _id: { $in: section.subCategoryIds },
      status: 'Active'
    })
      .select('name slug image bgColor categoryName')
      .lean();

    return orderByIds(subCategories, section.subCategoryIds).slice(0, section.maxItems || 8);
  }

  const categoryPageQuery = buildCategoryPageProductQuery({
    categoryName
  });

  const activeSubCategoryNames = await Product.distinct('subCategory', {
    ...categoryPageQuery,
    subCategory: { $nin: ['', null] }
  });
  const activeSubCategorySet = new Set(activeSubCategoryNames.map((name) => String(name).toLowerCase()));

  const subCategories = await SubCategory.find({
    categoryName: getExactNameRegex(categoryName),
    status: 'Active'
  })
    .select('name slug image bgColor categoryName')
    .sort('name')
    .lean();

  return subCategories
    .filter((item) => activeSubCategorySet.has(String(item.name || '').toLowerCase()))
    .slice(0, section.maxItems || 8);
};

const fetchSectionBrands = async (section, categoryName) => {
  if (section.brandIds?.length > 0) {
    const brands = await Brand.find({
      _id: { $in: section.brandIds },
      status: 'Active'
    })
      .select('name logo description category')
      .lean();

    return orderByIds(brands, section.brandIds).slice(0, section.maxItems || 8);
  }

  const categoryPageQuery = buildCategoryPageProductQuery({
    categoryName
  });

  const activeBrandNames = await Product.distinct('brandName', {
    ...categoryPageQuery,
    brandName: { $nin: ['', null] }
  });
  const activeBrandSet = new Set(activeBrandNames.map((name) => String(name).toLowerCase()));

  const brands = await Brand.find({
    category: getExactNameRegex(categoryName),
    status: 'Active'
  })
    .select('name logo description category')
    .sort('name')
    .lean();

  return brands
    .filter((item) => activeBrandSet.has(String(item.name || '').toLowerCase()))
    .slice(0, section.maxItems || 8);
};

const serializePublicSection = async (section, category, storeContext) => {
  const base = {
    _id: section._id,
    key: section.key,
    type: section.type,
    title: section.title,
    subtitle: section.subtitle,
    order: section.order,
    imageUrl: section.imageUrl,
    mobileImageUrl: section.mobileImageUrl,
    ctaLabel: section.ctaLabel,
    ctaLink: section.ctaLink,
    banners: section.banners || [],
    maxItems: section.maxItems,
    maxProducts: section.maxProducts
  };

  if (section.type === 'subcategory_grid') {
    return {
      ...base,
      items: await fetchSectionSubCategories(section, category.name)
    };
  }

  if (section.type === 'brand_strip') {
    return {
      ...base,
      items: await fetchSectionBrands(section, category.name)
    };
  }

  if (section.type === 'product_rail') {
    return {
      ...base,
      products: await fetchSectionProducts(section, category.name, storeContext)
    };
  }

  return base;
};

const getStoreContext = (query = {}) => ({
  storeId: query.storeId || query.activeStoreId || null,
  storeType: query.storeType || query.activeStoreType || null
});

const generateVirtualCategoryPage = async (category, storeContext) => {
  const { name, image, description, bgColor } = category;

  const virtualHero = {
    title: name,
    subtitle: description || `Top trending items in ${name}. Explore more below.`,
    bannerImage: image,
    banners: [{
      imageUrl: image,
      title: name,
      subtitle: description || `Browse our latest selection of ${name}.`
    }],
    sponsorBrand: null
  };

  const virtualSectionsRaw = [
    { type: 'subcategory_grid', title: `Browse ${name}`, order: 0, isActive: true, key: 'v-sc-grid', maxItems: 12 },
    { type: 'brand_strip', title: 'Top Brands', order: 1, isActive: true, key: 'v-brand-strip', maxItems: 10 },
    { type: 'product_rail', title: 'Featured Products', order: 2, isActive: true, key: 'v-prod-rail', maxItems: 12 }
  ];

  const hydratedSections = [];
  for (const section of virtualSectionsRaw) {
    const serialized = await serializePublicSection(section, category, storeContext);

    if (serialized.type === 'subcategory_grid' && (!serialized.items || serialized.items.length === 0)) continue;
    if (serialized.type === 'brand_strip' && (!serialized.items || serialized.items.length === 0)) continue;
    if (serialized.type === 'product_rail' && (!serialized.products || serialized.products.length === 0)) continue;

    hydratedSections.push(serialized);
  }

  return {
    _id: `v-page-${category._id}`,
    status: 'published',
    isVirtual: true,
    theme: sanitizeTheme({ 
      pageBg: '#f6fbf7', 
      heroBg: bgColor || '#eef8f0', 
      cardBg: '#ffffff',
      accent: '#0c831f'
    }),
    hero: virtualHero,
    seo: sanitizeSeo({ title: name, description }),
    sections: hydratedSections
  };
};

export const getPublicCategoryPage = async (req, res) => {
  try {
    const slug = decodeURIComponent(req.params.slug || '').trim();
    const category = await Category.findOne({
      $or: [
        { slug: slug.toLowerCase() },
        { name: getExactNameRegex(slug) }
      ],
      status: 'Active'
    })
      .select('name slug image bgColor description')
      .lean();

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const page = await CategoryPage.findOne({
      category: category._id,
      status: 'published'
    })
      .populate('hero.sponsorBrand', 'name logo description')
      .lean();

    const storeContext = getStoreContext(req.query);

    if (!page) {
      // If category exists but page is not configured, generate a high-quality virtual page
      const virtualPage = await generateVirtualCategoryPage(category, storeContext);
      return res.json({
        category,
        page: virtualPage,
        isAutoGenerated: true
      });
    }

    const activeSections = (page.sections || [])
      .filter((section) => section.isActive !== false)
      .sort((a, b) => a.order - b.order);

    const hydratedSections = [];
    for (const section of activeSections) {
      const serialized = await serializePublicSection(section, category, storeContext);

      if (serialized.type === 'subcategory_grid' && (!serialized.items || serialized.items.length === 0)) {
        continue;
      }
      if (serialized.type === 'brand_strip' && (!serialized.items || serialized.items.length === 0)) {
        continue;
      }
      if (serialized.type === 'product_rail' && (!serialized.products || serialized.products.length === 0)) {
        continue;
      }

      hydratedSections.push(serialized);
    }

    res.json({
      category,
      page: {
        _id: page._id,
        status: page.status,
        theme: sanitizeTheme(page.theme),
        hero: {
          ...sanitizeHero(page.hero),
          sponsorBrand: page.hero?.sponsorBrand || null
        },
        seo: sanitizeSeo(page.seo),
        sections: hydratedSections,
        updatedAt: page.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryPages = async (req, res) => {
  try {
    const pages = await CategoryPage.find()
      .populate('category', 'name slug image status')
      .sort('-updatedAt')
      .lean();

    res.json(pages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryPageById = async (req, res) => {
  try {
    const page = await CategoryPage.findById(req.params.id)
      .populate('category', 'name slug image status bgColor')
      .populate('hero.sponsorBrand', 'name logo description category')
      .populate('sections.brandIds', 'name logo description category')
      .populate('sections.subCategoryIds', 'name slug image bgColor categoryName')
      .populate('sections.productIds', 'name image basePrice mrp category subCategory brandName sku')
      .lean();

    if (!page) {
      return res.status(404).json({ message: 'Category page not found' });
    }

    res.json(page);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCategoryPage = async (req, res) => {
  let uploadedPublicIds = [];

  try {
    const body = parseCategoryPagePayload(req);
    const categoryId = normalizeObjectId(body.category);
    if (!categoryId) {
      return res.status(400).json({ message: 'Valid category is required' });
    }

    const category = await Category.findById(categoryId).select('name slug');
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const existingPage = await CategoryPage.findOne({ category: categoryId });
    if (existingPage) {
      return res.status(400).json({ message: 'A category page already exists for this category' });
    }

    const { payload, uploadedPublicIds: nextUploadedPublicIds } = await applyUploadedFilesToPayload(body, req.files);
    uploadedPublicIds = nextUploadedPublicIds;
    const status = payload.status === 'published' ? 'published' : 'draft';

    const page = await CategoryPage.create({
      category: categoryId,
      status,
      theme: sanitizeTheme(payload.theme),
      hero: sanitizeHero(payload.hero),
      seo: sanitizeSeo(payload.seo),
      sections: sanitizeSections(payload.sections),
      publishedAt: status === 'published' ? new Date() : null,
      createdBy: req.admin?._id || null,
      updatedBy: req.admin?._id || null
    });

    const createdPage = await CategoryPage.findById(page._id)
      .populate('category', 'name slug image status bgColor')
      .populate('hero.sponsorBrand', 'name logo description category')
      .populate('sections.brandIds', 'name logo description category')
      .populate('sections.subCategoryIds', 'name slug image bgColor categoryName')
      .populate('sections.productIds', 'name image basePrice mrp category subCategory brandName sku')
      .lean();

    res.status(201).json(createdPage);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A category page already exists for this category' });
    }
    await deleteCloudinaryAssets(uploadedPublicIds);
    res.status(500).json({ message: error.message });
  }
};

export const updateCategoryPage = async (req, res) => {
  let uploadedPublicIds = [];

  try {
    const page = await CategoryPage.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Category page not found' });
    }

    const body = parseCategoryPagePayload(req);
    const nextCategoryId = normalizeObjectId(body.category) || String(page.category);
    if (!mongoose.Types.ObjectId.isValid(nextCategoryId)) {
      return res.status(400).json({ message: 'Valid category is required' });
    }

    const category = await Category.findById(nextCategoryId).select('name slug');
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const duplicatePage = await CategoryPage.findOne({
      category: nextCategoryId,
      _id: { $ne: page._id }
    });
    if (duplicatePage) {
      return res.status(400).json({ message: 'Another category page already exists for this category' });
    }

    const previousPublicIds = collectCategoryPagePublicIds(page.toObject());
    const { payload, uploadedPublicIds: nextUploadedPublicIds } = await applyUploadedFilesToPayload(body, req.files);
    uploadedPublicIds = nextUploadedPublicIds;
    const status = payload.status === 'published' ? 'published' : 'draft';
    const nextHero = sanitizeHero(payload.hero);
    const nextSeo = sanitizeSeo(payload.seo);
    const nextSections = sanitizeSections(payload.sections);

    page.category = nextCategoryId;
    page.status = status;
    page.theme = sanitizeTheme(payload.theme);
    page.hero = nextHero;
    page.seo = nextSeo;
    page.sections = nextSections;
    page.updatedBy = req.admin?._id || page.updatedBy;
    page.publishedAt = status === 'published' ? (page.publishedAt || new Date()) : null;

    await page.save();

    const nextPublicIds = collectCategoryPagePublicIds({
      hero: nextHero,
      seo: nextSeo,
      sections: nextSections
    });
    const removedPublicIds = previousPublicIds.filter((publicId) => !nextPublicIds.includes(publicId));
    await deleteCloudinaryAssets(removedPublicIds);

    const updatedPage = await CategoryPage.findById(page._id)
      .populate('category', 'name slug image status bgColor')
      .populate('hero.sponsorBrand', 'name logo description category')
      .populate('sections.brandIds', 'name logo description category')
      .populate('sections.subCategoryIds', 'name slug image bgColor categoryName')
      .populate('sections.productIds', 'name image basePrice mrp category subCategory brandName sku')
      .lean();

    res.json(updatedPage);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A category page already exists for this category' });
    }
    await deleteCloudinaryAssets(uploadedPublicIds);
    res.status(500).json({ message: error.message });
  }
};

export const deleteCategoryPage = async (req, res) => {
  try {
    const page = await CategoryPage.findById(req.params.id);
    if (!page) {
      return res.status(404).json({ message: 'Category page not found' });
    }

    const publicIds = collectCategoryPagePublicIds(page.toObject());
    await page.deleteOne();
    await deleteCloudinaryAssets(publicIds);
    res.json({ message: 'Category page removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
