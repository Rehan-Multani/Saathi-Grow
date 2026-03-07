import mongoose from 'mongoose';
import Brand from './src/models/Brand.js';
import Category from './src/models/Category.js';
import dotenv from 'dotenv';
dotenv.config();

const repairBrandCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const categories = await Category.find({}, 'name slug');
    const brands = await Brand.find({});

    let updateCount = 0;

    for (const brand of brands) {
      const currentCat = (brand.category || '').trim();

      // Try 1: Exact match (case-insensitive)
      const exactMatch = categories.find(c => c.name.toLowerCase().trim() === currentCat.toLowerCase());

      // Try 2: Slug match
      const slugMatch = categories.find(c => c.slug === currentCat.toLowerCase());

      // Try 3: Special mapping for common variants
      let specialMatch = null;
      if (currentCat.toLowerCase().includes('dairy') && currentCat.toLowerCase().includes('egg')) {
        specialMatch = categories.find(c => c.name === 'Dairy, Bread & Eggs');
      }

      const targetCategory = exactMatch || slugMatch || specialMatch;

      if (targetCategory && brand.category !== targetCategory.name) {
        console.log(`Updating Brand "${brand.name}": "${brand.category}" -> "${targetCategory.name}"`);
        brand.category = targetCategory.name;
        await brand.save();
        updateCount++;
      }
    }

    console.log(`Successfully updated ${updateCount} brands.`);
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

repairBrandCategories();
