import '../src/config/env.js';
import mongoose from 'mongoose';
import connectDB from '../src/config/db.js';
import Category from '../src/models/Category.js';
import SubCategory from '../src/models/SubCategory.js';
import Brand from '../src/models/Brand.js';
import Product from '../src/models/Product.js';
import CategoryPage from '../src/models/CategoryPage.js';

const getArgValue = (flag) => {
  const match = process.argv.find((arg) => arg.startsWith(`${flag}=`));
  return match ? match.split('=').slice(1).join('=') : '';
};
const escapeRegExp = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const categoryQuery = getArgValue('--category');
const statusArg = getArgValue('--status');
const publishStatus = statusArg === 'draft' ? 'draft' : 'published';

const getCategory = async () => {
  if (categoryQuery) {
    return Category.findOne({
      $or: [
        { slug: categoryQuery.toLowerCase() },
        { name: new RegExp(`^${escapeRegExp(categoryQuery)}$`, 'i') }
      ],
      status: 'Active'
    });
  }

  return Category.findOne({ status: 'Active' }).sort({ createdAt: 1 });
};

const buildSections = ({ category, subCategories, brands, products }) => {
  const sections = [];
  let order = 0;

  if (subCategories.length > 0) {
    sections.push({
      key: 'top-subcategories',
      type: 'subcategory_grid',
      title: `Top picks in ${category.name}`,
      subtitle: `Browse the most relevant subcategories for ${category.name}.`,
      order: order++,
      isActive: true,
      maxItems: Math.min(subCategories.length, 8),
      subCategoryIds: subCategories.slice(0, 8).map((item) => item._id)
    });
  }

  if (brands.length > 0) {
    sections.push({
      key: 'featured-brands',
      type: 'brand_strip',
      title: `Brands in ${category.name}`,
      subtitle: 'Highlight the strongest brands for this category.',
      order: order++,
      isActive: true,
      maxItems: Math.min(brands.length, 8),
      brandIds: brands.slice(0, 8).map((item) => item._id)
    });
  }

  sections.push({
    key: 'promo-banner',
    type: 'promo_banner',
    title: `${category.name} specials`,
    subtitle: 'Fast-moving picks, trending shelves, and curated recommendations.',
    order: order++,
    isActive: true,
    imageUrl: category.image || '',
    ctaLabel: 'Shop now',
    ctaLink: `/category/${category.slug}/products`
  });

  sections.push({
    key: 'seasonal-picks',
    type: 'product_rail',
    title: `Trending in ${category.name}`,
    subtitle: 'A ready-to-preview product rail for the user landing page.',
    order: order++,
    isActive: true,
    maxProducts: 10,
    productIds: products.slice(0, 10).map((item) => item._id)
  });

  sections.push({
    key: 'view-more-products',
    type: 'view_more_cta',
    title: '',
    subtitle: '',
    order: order++,
    isActive: true,
    ctaLabel: 'View more products',
    ctaLink: `/category/${category.slug}/products`
  });

  return sections;
};

const seedCategoryPage = async () => {
  console.log('[SEED] Connecting to database...');
  await connectDB();

  const category = await getCategory();
  if (!category) {
    throw new Error('No active category found. Please create at least one active category first.');
  }

  const [subCategories, brands, products] = await Promise.all([
    SubCategory.find({ category: category._id, status: 'Active' })
      .select('_id name slug image bgColor')
      .sort({ createdAt: 1 })
      .lean(),
    Brand.find({ category: new RegExp(`^${escapeRegExp(category.name)}$`, 'i'), status: 'Active' })
      .select('_id name logo description')
      .sort({ createdAt: 1 })
      .lean(),
    Product.find({
      category: new RegExp(`^${escapeRegExp(category.name)}$`, 'i'),
      status: { $in: ['Active', 'Low Stock', 'Out of Stock'] }
    })
      .select('_id name image basePrice mrp brandName subCategory')
      .sort({ isSaathigro: -1, createdAt: -1 })
      .lean()
  ]);

  const sponsorBrand = brands[0]?._id || null;
  const heroImage = category.image || products[0]?.image || '';
  const pagePayload = {
    category: category._id,
    status: publishStatus,
    theme: {
      pageBg: '#f6fbf7',
      heroBg: '#eef8f0',
      cardBg: '#ffffff',
      accent: '#0c831f',
      text: '#111827'
    },
    hero: {
      title: category.name,
      subtitle: `Preview-ready landing page for ${category.name}. You can refine it later from the admin builder.`,
      bannerImage: heroImage,
      mobileBannerImage: heroImage,
      sponsorLabel: sponsorBrand ? 'Powered by' : '',
      sponsorBrand
    },
    seo: {
      title: `${category.name} | SaathiGro`,
      description: `Explore curated ${category.name} sections, featured brands, and product rails on SaathiGro.`,
      image: heroImage
    },
    sections: buildSections({
      category,
      subCategories,
      brands,
      products
    }),
    publishedAt: publishStatus === 'published' ? new Date() : null
  };

  const page = await CategoryPage.findOneAndUpdate(
    { category: category._id },
    { $set: pagePayload },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true
    }
  );

  console.log('[SEED] Category landing page ready.');
  console.log(`  Category: ${category.name}`);
  console.log(`  Status: ${page.status}`);
  console.log(`  Sections: ${page.sections.length}`);
  console.log(`  Preview path: /category/${category.slug}`);
  console.log('');
  console.log('Run with a specific category if needed:');
  console.log('  npm run seed:category-page -- --category=electronics --status=published');
};

seedCategoryPage()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('[SEED] Failed to seed category landing page:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  });
