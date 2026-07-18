import Category from '../models/Category.js';
import Product from '../models/Product.js';
import SubCategory from '../models/SubCategory.js';
import Brand from '../models/Brand.js';
import CategoryPage from '../models/CategoryPage.js';
import XLSX from 'xlsx';

// @desc    Create new category
// @route   POST /api/admin/categories
// @access  Private (Admin/Staff)
export const createCategory = async (req, res) => {
  try {
    const { name, slug, description, status, bgColor, tags } = req.body;

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ message: 'Category with this name already exists' });
    }

    let image = '';
    if (req.file) {
      image = req.file.path;
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : String(tags || '')
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

    const category = await Category.create({
      name,
      slug: slug || name.toLowerCase().split(' ').join('-'),
      description,
      tags: [...new Set(parsedTags)],
      status: status || 'Active',
      bgColor: bgColor || '#f8f9fa',
      image,
      createdBy: req.admin._id
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all categories
// @route   GET /api/admin/categories
// @access  Private (Admin/Staff)
export const getCategories = async (req, res) => {
  try {
    const { hasProducts, status, search, page, limit } = req.query;
    const hasPagination = page !== undefined || limit !== undefined;
    let query = {};
    if (status) query.status = { $regex: new RegExp('^' + status + '$', 'i') };
    if (search && String(search).trim()) {
      query.name = { $regex: String(search).trim(), $options: 'i' };
    }

    const categorySelect = 'name slug image bgColor status description tags';
    const categorySort = { createdAt: -1 };

    if (hasPagination && hasProducts !== 'true') {
      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
      const total = await Category.countDocuments(query);
      const categories = await Category.find(query)
        .select(categorySelect)
        .sort(categorySort)
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber);
      return res.json({
        categories,
        pagination: {
          total,
          page: pageNumber,
          limit: limitNumber,
          totalPages: Math.ceil(total / limitNumber) || 1
        }
      });
    }

    let categories = await Category.find(query)
      .select(categorySelect)
      .sort(categorySort);

    if (hasProducts === 'true') {
      // Find distinct category names that have available products efficiently using native distinct
      const activeCategoryNames = await Product.distinct('category', {
        status: { $in: ['Active', 'Low Stock', 'Out of Stock'] }
      });

      const activeCategoryNamesLower = activeCategoryNames.map(name => name.toLowerCase());

      // Filter categories to only include those in the active distinct list
      categories = categories.filter(category =>
        activeCategoryNamesLower.includes(category.name.toLowerCase())
      );
    }

    if (hasPagination) {
      const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
      const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
      const total = categories.length;
      const totalPages = Math.ceil(total / limitNumber) || 1;
      const start = (pageNumber - 1) * limitNumber;
      const paginated = categories.slice(start, start + limitNumber);
      return res.json({
        categories: paginated,
        pagination: { total, page: pageNumber, limit: limitNumber, totalPages }
      });
    }

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get category by ID
// @route   GET /api/admin/categories/:id
// @access  Private (Admin/Staff)
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (category) {
      res.json(category);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update category
// @route   PUT /api/admin/categories/:id
// @access  Private (Admin/Staff)
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (category) {
      category.name = req.body.name || category.name;
      category.slug = req.body.slug || category.slug;
      category.description = req.body.description || category.description;
      category.status = req.body.status || category.status;
      category.bgColor = req.body.bgColor || category.bgColor;

      if (req.body.tags !== undefined) {
        const parsedTags = Array.isArray(req.body.tags)
          ? req.body.tags
          : String(req.body.tags || '')
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean);
        category.tags = [...new Set(parsedTags)];
      }

      if (req.file) {
        category.image = req.file.path;
      }

      const updatedCategory = await category.save();
      res.json(updatedCategory);
    } else {
      res.status(404).json({ message: 'Category not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete category (cascades to subcategories, brands, products, category page)
// @route   DELETE /api/admin/categories/:id
// @access  Private (Admin)
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    const categoryName = category.name;
    const categoryNameRegex = new RegExp(
      `^${String(categoryName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
      'i'
    );

    // 1) Products linked to this category (stored as category name string)
    const productResult = await Product.deleteMany({ category: categoryNameRegex });

    // 2) Subcategories under this category
    const subResult = await SubCategory.deleteMany({ category: category._id });

    // 3) Brands linked to this category name
    //    - if brand only had this category → delete brand
    //    - if brand has other categories → just remove this category
    const linkedBrands = await Brand.find({ category: categoryNameRegex }).select('_id category');
    let deletedBrands = 0;
    let updatedBrands = 0;

    for (const brand of linkedBrands) {
      const remaining = (brand.category || []).filter(
        (c) => String(c).toLowerCase() !== String(categoryName).toLowerCase()
      );
      if (remaining.length === 0) {
        await Brand.deleteOne({ _id: brand._id });
        deletedBrands += 1;
      } else {
        brand.category = remaining;
        await brand.save();
        updatedBrands += 1;
      }
    }

    // 4) Category landing page (if any)
    const pageResult = await CategoryPage.deleteMany({ category: category._id });

    await category.deleteOne();

    res.json({
      message: 'Category and associated data removed',
      deletedSubCategories: subResult.deletedCount || 0,
      deletedProducts: productResult.deletedCount || 0,
      deletedBrands,
      updatedBrands,
      deletedCategoryPages: pageResult.deletedCount || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ─── Bulk upload helpers ─────────────────────────────────────────────────────
const CATEGORY_BULK_ALIASES = {
  name: ['name', 'category', 'categoryname', 'category_name', 'title'],
  slug: ['slug', 'handle', 'url'],
  description: ['description', 'desc', 'details', 'summary'],
  tags: ['tags', 'tag', 'keywords'],
  status: ['status', 'availability', 'visibility'],
  bgcolor: ['bgcolor', 'bg_color', 'background', 'backgroundcolor', 'color'],
  image: ['image', 'imageurl', 'image_url', 'img', 'photo', 'icon'],
};

const normalizeCategoryHeaderKey = (key) =>
  String(key || '').trim().toLowerCase().replace(/[\s_\-./]+/g, '');

const canonicalCategoryBulkKey = (rawKey) => {
  const normalized = normalizeCategoryHeaderKey(rawKey);
  for (const [canonical, aliases] of Object.entries(CATEGORY_BULK_ALIASES)) {
    if (aliases.includes(normalized) || canonical === normalized) {
      return canonical === 'bgcolor' ? 'bgColor' : canonical;
    }
  }
  return null;
};

const normalizeCategoryBulkRow = (rawRow) => {
  const row = {};
  for (const [key, value] of Object.entries(rawRow || {})) {
    const canonical = canonicalCategoryBulkKey(key);
    if (!canonical) continue;
    if (row[canonical] === undefined || row[canonical] === null || row[canonical] === '') {
      row[canonical] = typeof value === 'string' ? value.trim() : value;
    }
  }
  return row;
};

const isBlankCategoryRow = (row) =>
  ['name', 'slug', 'description', 'tags', 'image'].every(
    (k) => row[k] === undefined || row[k] === null || row[k] === ''
  );

const hasCategoryValue = (v) => v !== undefined && v !== null && String(v).trim() !== '';

const parseCategoryExcelBuffer = (buffer) => {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    return rawRows.map(normalizeCategoryBulkRow);
  } catch (err) {
    console.error('Category Excel parse error:', err);
    return [];
  }
};

const slugifyCategory = (name) =>
  String(name || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const resolveUniqueCategorySlug = async (baseSlug, excludeId = null) => {
  const normalizedBase = slugifyCategory(baseSlug) || 'category';
  let candidate = normalizedBase;
  let counter = 2;

  while (true) {
    const existing = await Category.findOne({ slug: candidate }).select('_id');
    if (!existing || (excludeId && String(existing._id) === String(excludeId))) return candidate;
    candidate = `${normalizedBase}-${counter}`;
    counter++;
  }
};

// @desc   Bulk upload categories from Excel
// @route  POST /api/admin/categories/bulk-upload
// @access Private (Admin)
export const bulkUploadCategories = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No Excel file uploaded' });
    }

    const rows = parseCategoryExcelBuffer(req.file.buffer);
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Excel is empty or has no valid rows' });
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;
    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      try {
        if (isBlankCategoryRow(row)) continue;

        if (!hasCategoryValue(row.name)) {
          // Soft-skip nameless rows (often trailing/accidental rows in Excel)
          skipped++;
          continue;
        }

        const name = String(row.name).trim();
        const slugInput = hasCategoryValue(row.slug) ? String(row.slug).trim().toLowerCase() : '';
        const slug = slugInput || slugifyCategory(name);

        const tags = row.tags
          ? String(row.tags).split(/[|,]/).map((t) => t.trim()).filter(Boolean)
          : [];

        const statusRaw = (row.status || 'Active').toString().toLowerCase().trim();
        const statusMap = { active: 'Active', inactive: 'Inactive', draft: 'Inactive' };
        const status = statusMap[statusRaw] || 'Active';

        const bgColor = hasCategoryValue(row.bgColor) ? String(row.bgColor).trim() : '#f8f9fa';
        const clientBase = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
        const defaultCategoryImage = process.env.DEFAULT_PRODUCT_IMAGE_URL || `${clientBase}/assets/logo_fav.png`;
        const rowImage = hasCategoryValue(row.image) ? String(row.image).trim() : '';
        const description = row.description ? String(row.description).trim() : '';

        const existing = await Category.findOne({
          name: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
        });

        if (existing) {
          const nextSlug = await resolveUniqueCategorySlug(slug, existing._id);
          await Category.findByIdAndUpdate(existing._id, {
            $set: {
              name,
              slug: nextSlug,
              description,
              tags: [...new Set(tags)],
              status,
              bgColor,
              ...(rowImage
                ? { image: rowImage }
                : !existing.image
                  ? { image: defaultCategoryImage }
                  : {}),
            },
          });
          updated++;
        } else {
          const nextSlug = await resolveUniqueCategorySlug(slug);
          await Category.create({
            name,
            slug: nextSlug,
            description,
            tags: [...new Set(tags)],
            status,
            bgColor,
            image: rowImage || defaultCategoryImage,
            createdBy: req.admin._id,
          });
          created++;
        }
      } catch (rowErr) {
        let msg = rowErr.message;
        if (rowErr.code === 11000) msg = 'Duplicate category name or slug';
        errors.push(`Row ${rowNum}: ${msg}`);
        skipped++;
      }
    }

    res.json({
      message: 'Bulk upload completed',
      created,
      updated,
      skipped,
      total: rows.length,
      errors: errors.slice(0, 20),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
