import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Branch from './models/Branch.js';
import Admin from './models/Admin.js';
import InventoryLog from './models/InventoryLog.js';
import QRCode from 'qrcode';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '../.env') });

const categoriesData = [
    { name: 'Fruit and vegetables', slug: 'fruit-and-vegetables', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=200&q=80' },
    { name: 'Dairy Egg , Frozen', slug: 'dairy-egg-frozen', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=200&q=80' },
    { name: 'Snacks & Bakery', slug: 'snacks-bakery', image: 'https://cdn.pixabay.com/photo/2016/11/29/11/32/cookies-1869216_1280.jpg' },
    { name: 'Food & Beverage', slug: 'food-beverage', image: 'https://cdn.pixabay.com/photo/2017/01/11/11/33/cake-1971556_1280.jpg' },
    { name: 'Staples and grains', slug: 'staples-and-grains', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80' },
    { name: 'Masala and spices', slug: 'masala-and-spices', image: 'https://images.unsplash.com/photo-1596797038530-2c39fa81b487?auto=format&fit=crop&w=200&q=80' },
    { name: 'Oil and Ghee', slug: 'oil-and-ghee', image: 'https://images.unsplash.com/photo-1474979266404-7eaacabc88c5?auto=format&fit=crop&w=200&q=80' },
    { name: 'Personal care', slug: 'personal-care', image: 'https://images.unsplash.com/photo-1556228720-1957be982260?auto=format&fit=crop&w=200&q=80' },
    { name: 'Chocolate & Sweet', slug: 'chocolate-sweet', image: 'https://images.unsplash.com/photo-1581798459219-318e76aecc7b?auto=format&fit=crop&w=200&q=80' },
    { name: 'Dry Fruit', slug: 'dry-fruit', image: 'https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?auto=format&fit=crop&w=200&q=80' },
    { name: 'Cleaning Essentials', slug: 'cleaning-essentials', image: 'https://images.unsplash.com/photo-1584622728568-ad4426548981?auto=format&fit=crop&w=200&q=80' },
    { name: 'Home & Office', slug: 'home-office', image: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=200&q=80' },
    { name: 'Pet Care', slug: 'pet-care', image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=200&q=80' },
    { name: 'Beauty & Grooming', slug: 'beauty-grooming', image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&q=80' }
];

const productsData = [
    { name: 'Fresho Tomato - Hybrid', price: 38, originalPrice: 50, weight: '1 kg', image: 'https://pngimg.com/uploads/tomato/tomato_PNG12581.png', category: 'fruit-and-vegetables', description: 'Fresh, juicy, and hybrid tomatoes sourced directly from farms.' },
    { name: 'Fresho Onion', price: 25, originalPrice: 40, weight: '1 kg', image: 'https://pngimg.com/uploads/onion/onion_PNG3821.png', category: 'fruit-and-vegetables', description: 'Top quality onions that add flavor to your dishes.' },
    { name: 'Fresho Potato', price: 30, originalPrice: 45, weight: '1 kg', image: 'https://pngimg.com/uploads/potato/potato_PNG7078.png', category: 'fruit-and-vegetables', description: 'Starchy and fresh potatoes suitable for frying and boiling.' },
    { name: 'Fresho Banana - Robusta', price: 45, originalPrice: 60, weight: '1 kg', image: 'https://pngimg.com/uploads/banana/banana_PNG827.png', category: 'fruit-and-vegetables', description: 'Sweet and nutritious Robusta bananas.' },
    { name: 'Fresho Apple - Royal Gala', price: 180, originalPrice: 220, weight: '1 kg', image: 'https://pngimg.com/uploads/apple/apple_PNG12405.png', category: 'fruit-and-vegetables', description: 'Crisp and sweet Royal Gala apples.' },
    { name: 'Amul Taaza Milk', price: 54, originalPrice: 56, weight: '1 L', image: 'https://pngimg.com/uploads/milk/milk_PNG12760.png', category: 'dairy-egg-frozen', description: 'Pasteurized toned milk, rich in calcium.' },
    { name: 'Amul Butter', price: 56, originalPrice: 58, weight: '100 g', image: 'https://pngimg.com/uploads/butter/butter_PNG9141.png', category: 'dairy-egg-frozen', description: 'The taste of India. Salty and creamy.' },
    { name: 'Farm Fresh Eggs', price: 45, originalPrice: 55, weight: '6 units', image: 'https://pngimg.com/uploads/egg/egg_PNG40772.png', category: 'dairy-egg-frozen', description: 'High quality nutritious eggs.' },
    { name: 'Lay\'s Magic Masala Chips', price: 20, originalPrice: 20, weight: '50 g', image: 'https://pngimg.com/uploads/potato_chips/potato_chips_PNG45.png', category: 'snacks-bakery', description: 'Spicy Indian masala flavor potato chips.' },
    { name: 'Coca-Cola Soft Drink', price: 40, originalPrice: 40, weight: '750 ml', image: 'https://pngimg.com/uploads/coca_cola/coca_cola_PNG8913.png', category: 'food-beverage', description: 'Refreshing original taste Coca-Cola.' },
    { name: 'Fortune Chakki Atta', price: 450, originalPrice: 520, weight: '10 kg', image: 'https://pngimg.com/uploads/flour/flour_PNG10.png', category: 'staples-and-grains', description: '100% whole wheat flour for soft rotis.' },
    { name: 'India Gate Basmati Rice', price: 800, originalPrice: 950, weight: '5 kg', image: 'https://pngimg.com/uploads/rice/rice_PNG1.png', category: 'staples-and-grains', description: 'Aromatic long grain basmati rice.' },
    { name: 'Tata Salt', price: 25, originalPrice: 28, weight: '1 kg', image: 'https://pngimg.com/uploads/sugar/sugar_PNG10.png', category: 'masala-and-spices', description: 'Desh ka Namak. Pure and iodized.' },
    { name: 'Amul Pure Cow Ghee', price: 560, originalPrice: 600, weight: '1 L', image: 'https://pngimg.com/uploads/butter/butter_PNG9141.png', category: 'oil-and-ghee', description: 'Pure and traditional cow ghee.' },
    { name: 'Dettol Original Soap', price: 45, originalPrice: 50, weight: '125 g', image: 'https://pngimg.com/uploads/soap/soap_PNG3968.png', category: 'personal-care', description: 'Antibacterial soap for germ protection.' },
    { name: 'Cadbury Dairy Milk', price: 40, originalPrice: 40, weight: '50 g', image: 'https://pngimg.com/uploads/chocolate/chocolate_PNG13.png', category: 'chocolate-sweet', description: 'Classic chocolate bar.' },
    { name: 'Happilo Almonds', price: 150, originalPrice: 180, weight: '200 g', image: 'https://pngimg.com/uploads/hazelnut/hazelnut_PNG35.png', category: 'dry-fruit', description: 'Premium California almonds.' },
    { name: 'Surf Excel Liquid', price: 220, originalPrice: 250, weight: '1 L', image: 'https://pngimg.com/uploads/detergent/detergent_PNG40.png', category: 'cleaning-essentials', description: 'Tough stain removal liquid detergent.' },
    { name: 'Pedigree Dog Food', price: 450, originalPrice: 500, weight: '3 kg', image: 'https://pngimg.com/uploads/dog_food/dog_food_PNG43.png', category: 'pet-care', description: 'Complete and balanced meal for dogs.' }
];

const parseWeight = (weightStr) => {
    if (!weightStr) return { value: 1, type: 'pcs' };
    const match = weightStr.match(/([\d.]+)\s*(\w+)/);
    if (match) {
        let value = parseFloat(match[1]);
        let type = match[2].toLowerCase();

        // Map common units to model enum
        if (type === 'l' || type === 'liter') type = 'ltr';
        if (type === 'g') type = 'gm';
        if (type === 'units' || type === 'unit') type = 'pcs';
        if (type === 'sheets') type = 'pcs';

        return { value, type };
    }
    return { value: 1, type: 'pcs' };
};

const seedData = async () => {
    console.log('Starting seeding process...');
    try {
        await connectDB();
        console.log('Connected to Database...');

        // 1. Seed Admin
        let admin = await Admin.findOne({ email: 'admin@gmail.com' });
        if (!admin) {
            console.log('Seeding Admin...');
            admin = await Admin.create({
                name: 'Super Admin',
                email: 'admin@gmail.com',
                phone: '9999999999',
                password: 'admin@123',
                role: 'Admin',
                isActive: true,
                permissions: ['VIEW_ORDERS', 'MANAGE_ORDERS', 'VIEW_PRODUCTS', 'MANAGE_INVENTORY', 'MANAGE_POS_BILLING']
            });
            console.log('Admin seeded.');
        } else {
            console.log('Admin already exists.');
        }

        // 2. Seed Branch
        let branch = await Branch.findOne({ code: 'MAIN' });
        if (!branch) {
            console.log('Seeding Main Branch...');
            branch = await Branch.create({
                name: 'Main Branch',
                code: 'MAIN',
                address: {
                    street: '123 Main St',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    zipCode: '400001',
                    location: { type: 'Point', coordinates: [72.8777, 19.0760] }
                },
                phone: '9876543210',
                email: 'main@saathigro.com'
            });
            console.log('Main Branch seeded.');
        } else {
            console.log('Main Branch already exists.');
        }

        // 3. Seed Categories
        console.log('Seeding Categories...');
        const createdCategories = [];
        for (const cat of categoriesData) {
            console.log(`Checking category: ${cat.slug}`);
            let category = await Category.findOne({ slug: cat.slug });
            if (!category) {
                console.log(`Creating category: ${cat.name}`);
                category = await Category.create({
                    name: cat.name,
                    slug: cat.slug,
                    image: cat.image,
                    description: `${cat.name} category`,
                    createdBy: admin._id
                });
            }
            createdCategories.push(category);
        }
        console.log(`${createdCategories.length} Categories synced.`);

        // 4. Seed Products
        console.log('Seeding Products...');
        const productsToInsert = [];
        const logsToInsert = [];

        for (const p of productsData) {
            const existingProduct = await Product.findOne({ name: p.name });
            if (existingProduct) {
                console.log(`Skipping existing product: ${p.name}`);
                continue;
            }

            const { value, type } = parseWeight(p.weight);
            const sku = `SKU-${Math.floor(100000 + Math.random() * 900000)}`;

            // Generate QR Code
            const qrCodeDataUrl = await QRCode.toDataURL(sku);

            // Extract brand name (first word of product name)
            const brandName = p.name.split(' ')[0];

            productsToInsert.push({
                name: p.name,
                description: p.description,
                basePrice: p.price,
                mrp: p.originalPrice || p.price,
                unitType: type,
                unitValue: value,
                category: p.category,
                brandName: brandName,
                sku: sku,
                image: p.image,
                qrCode: qrCodeDataUrl,
                status: 'Active',
                createdBy: admin._id,
                isAllBranches: true,
                branchStocks: [{
                    branchId: branch._id,
                    stock: 100,
                    lowStockThreshold: 10
                }]
            });
        }

        if (productsToInsert.length > 0) {
            const result = await Product.insertMany(productsToInsert);
            console.log(`${result.length} New Products seeded.`);

            // Create Inventory Logs for all inserted products
            for (const prod of result) {
                logsToInsert.push({
                    product: prod._id,
                    admin: admin._id,
                    branchId: branch._id,
                    changeAmount: 100,
                    previousStock: 0,
                    newStock: 100,
                    type: 'Addition',
                    reason: 'Initial Seeding'
                });
            }
            await InventoryLog.insertMany(logsToInsert);
            console.log('Inventory logs created.');
        } else {
            console.log('No new products to seed.');
        }

        console.log('Seeding completed successfully!');
    } catch (error) {
        console.error('Error during seeding:', error);
        throw error;
    } finally {
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }
        process.exit(0);
    }
};

seedData();
