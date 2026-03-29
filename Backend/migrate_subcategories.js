
import mongoose from 'mongoose';
import dotEnv from 'dotenv';
import Category from './src/models/Category.js';
import Product from './src/models/Product.js';
import SubCategory from './src/models/SubCategory.js';

dotEnv.config({ path: './.env' });

const subCategoryMapping = {
  "Fruit and Vegetables": ["Fresh Fruits", "Fresh Vegetables", "Exotic Fruits & Veggies", "Herbs & Seasoning"],
  "Grocery & Essentials": ["Dal & Pulses", "Ghee & Oils", "Atta & Flours", "Rice & Rice Products", "Spices & Masalas", "Salt & Sugar", "Dry Fruits"],
  "Baby Care": ["Diapers & Wipes", "Baby Food", "Baby Skin Care", "Baby Bath & Hygiene", "Moms & Maternity"],
  "Food & Beverage": ["Soft Drinks", "Fruit Juices", "Tea & Coffee", "Mineral Water", "Dairy Drinks", "Snacks & Namkeen"],
  "Chocolate": ["Milk Chocolate", "Dark Chocolate", "Chocolate Bars", "Gift Packs"],
  "Personal Care": ["Bath & Body", "Hair Care", "Skin Care", "Oral Care", "Fragrances"],
  "Home Care": ["Detergents & Laundry", "Surface Cleaners", "Dishwashers", "Air Refreshers", "Pooja Needs"],
  "Men's Fashion": ["T-Shirts", "Shirts", "Jeans", "Footwear"],
  "Beauty": ["Makeup", "Face Care", "Lipstick & Lip Care", "Nail Polish"]
};

// Simple auto-assign rules based on product name keywords
const productAutoAssign = [
  { keywords: ["diaper", "wipes", "pampers", "mamy", "huggies"], subCategory: "Diapers & Wipes" },
  { keywords: ["fruit", "apple", "mango", "banana", "grape", "orange"], subCategory: "Fresh Fruits" },
  { keywords: ["vegetable", "onion", "potato", "tomato", "chilli", "garlic", "ginger"], subCategory: "Fresh Vegetables" },
  { keywords: ["oil", "ghee", "fortune", "dhara", "saffola"], subCategory: "Ghee & Oils" },
  { keywords: ["atta", "ashirvaad", "wheat", "maida"], subCategory: "Atta & Flours" },
  { keywords: ["shampoo", "conditioner", "dove", "pantene", "tresemme"], subCategory: "Hair Care" },
  { keywords: ["soap", "lux", "dettol", "pears", "body wash"], subCategory: "Bath & Body" },
  { keywords: ["coke", "pepsi", "sprite", "fanta", "thums up"], subCategory: "Soft Drinks" },
  { keywords: ["juice", "real", "b-natural", "tropicana"], subCategory: "Fruit Juices" },
  { keywords: ["dairymilk", "cadbury", "kitkat", "snickers", "munch"], subCategory: "Chocolate Bars" },
  { keywords: ["toothpaste", "colgate", "sensodyne", "pepsodent", "oral-b"], subCategory: "Oral Care" }
];

async function runMigration() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected.');

    const categories = await Category.find({});
    console.log(`Found ${categories.length} categories.`);

    const subCategoryRegistry = {}; // Map of "categoryName-subCategoryName" -> ID

    // Step 1: Create Subcategories
    for (const cat of categories) {
      console.log(`Processing category: ${cat.name}`);
      let subs = subCategoryMapping[cat.name] || ["General"];
      
      for (const subName of subs) {
        const slug = `${cat.name}-${subName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let existing = await SubCategory.findOne({ slug });
        if (!existing) {
          existing = await SubCategory.create({
            name: subName,
            slug: slug,
            category: cat._id,
            categoryName: cat.name,
            description: `${subName} under ${cat.name}`,
            status: 'Active'
          });
          console.log(`Created SubCategory: ${subName} (${slug}) in ${cat.name}`);
        } else {
          console.log(`SubCategory already exists: ${subName} (${slug}) in ${cat.name}`);
        }
        subCategoryRegistry[`${cat.name}-${subName}`] = existing.name;
      }
      
      // Always ensure a "General" subcategory exists for fallback
      if (!subs.includes("General")) {
        const genSlug = `${cat.name}-general`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        let generalSub = await SubCategory.findOne({ slug: genSlug });
        if (!generalSub) {
          generalSub = await SubCategory.create({
            name: "General",
            slug: genSlug,
            category: cat._id,
            categoryName: cat.name,
            description: `General products under ${cat.name}`,
            status: 'Active'
          });
        }
        subCategoryRegistry[`${cat.name}-General`] = generalSub.name;
      }
    }

    // Step 2: Update Products
    const products = await Product.find({});
    console.log(`Found ${products.length} products. Starting assignment...`);

    let updatedCount = 0;
    for (const product of products) {
      if (product.subCategory) continue; // Skip if already assigned

      let assignedSub = "General";
      
      // Try keyword matching
      const nameLower = product.name.toLowerCase();
      const match = productAutoAssign.find(rule => 
        rule.keywords.some(k => nameLower.includes(k))
      );

      if (match) {
        // Verify if this subcategory belongs to the product's category
        const key = `${product.category}-${match.subCategory}`;
        if (subCategoryRegistry[key]) {
          assignedSub = match.subCategory;
        }
      }

      product.subCategory = assignedSub;
      await product.save();
      updatedCount++;
    }

    console.log(`Migration completed successfully! Updated ${updatedCount} products.`);
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

runMigration();
