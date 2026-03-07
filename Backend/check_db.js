import mongoose from 'mongoose';
import Brand from './src/models/Brand.js';
import Category from './src/models/Category.js';
import dotenv from 'dotenv';
dotenv.config();

const checkCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const categories = await Category.find({}, 'name');
    console.log('Categories in DB:', JSON.stringify(categories.map(c => c.name), null, 2));

    const brands = await Brand.find({}, 'name category');
    console.log('Brand categories in DB:');
    brands.forEach(b => {
      console.log(`Brand: "${b.name}", Category: "${b.category}"`);
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkCategories();
