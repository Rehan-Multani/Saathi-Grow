import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Product from './models/Product.js';
import Category from './models/Category.js';
import Branch from './models/Branch.js';
import Admin from './models/Admin.js';
import InventoryLog from './models/InventoryLog.js';
import QRCode from 'qrcode';
import connectDB from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '../.env') });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

process.on('SIGINT', () => {
    console.log("Caught SIGINT, ignoring...");
});
process.on('SIGTERM', () => {
    console.log("Caught SIGTERM, ignoring...");
});


const BASE_PATH = 'c:\\Users\\palak\\OneDrive\\Desktop\\Saathigro\\product';

function stripRTF(rtf) {
    if (!rtf) return "";
    const descMatch = rtf.match(/Description\\par([\s\S]*?)(?=\\par|$|\})/);
    let text = descMatch ? descMatch[1] : rtf;

    return text
        .replace(/\\par/g, ' ')
        .replace(/\\tab/g, ' ')
        .replace(/\\u\d+\?\s*/g, ' ')
        .replace(/\\.*?\s/g, ' ')
        .replace(/[{}]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

const CATEGORY_IMAGES = {
    'Fruits & Vegetables': 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=200&q=80',
    'Dairy, Bread & Eggs': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=200&q=80',
    'Snacks & Munchies': 'https://cdn.pixabay.com/photo/2016/11/29/11/32/cookies-1869216_1280.jpg',
    'Cold Drinks & Juices': 'https://cdn.pixabay.com/photo/2017/01/11/11/33/cake-1971556_1280.jpg',
    'Atta, Rice & Dal': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=200&q=80',
    'Masala, Oil & More': 'https://images.unsplash.com/photo-1596797038530-2c39fa81b487?auto=format&fit=crop&w=200&q=80',
    'Cleaning Essentials': 'https://images.unsplash.com/photo-1584622728568-ad4426548981?auto=format&fit=crop&w=200&q=80',
    'Pet Care': 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=200&q=80',
    'Baby Care': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=200&q=80'
};

const processedProducts = new Set();
let adminId = null;
let branchId = null;

async function processFolder(currentPath, categoryName, subCategoryName = '') {
    const items = fs.readdirSync(currentPath, { withFileTypes: true });

    const hasImage = items.some(item => !item.isDirectory() && (item.name.endsWith('.jpg') || item.name.endsWith('.png')));

    if (hasImage) {
        const productName = path.basename(currentPath);
        if (processedProducts.has(productName)) return;
        processedProducts.add(productName);

        console.log(`Processing Product: ${productName} in ${categoryName} -> ${subCategoryName}`);

        try {
            const exists = await Product.findOne({ name: productName });
            if (exists) {
                console.log(`Already exists in DB: ${productName}`);
                return;
            }

            const rtfFile = items.find(i => i.name.endsWith('.rtf'));
            let description = `${productName}. High quality product in ${categoryName}.`;
            if (rtfFile) {
                const rtfContent = fs.readFileSync(path.join(currentPath, rtfFile.name), 'utf-8');
                const stripped = stripRTF(rtfContent);
                if (stripped.length > 20) description = stripped;
            }

            const imageFile = items.find(i => i.name.endsWith('.jpg') || i.name.endsWith('.png'));
            const sanitizedCategory = categoryName.replace(/[^a-zA-Z0-9\/\-_]/g, '_');
            const uploadResult = await cloudinary.uploader.upload(path.join(currentPath, imageFile.name), {
                folder: `saathigro/products/${sanitizedCategory}`
            });
            const imageUrl = uploadResult.secure_url;

            const basePrice = Math.floor(Math.random() * (450 - 20) + 20);
            const mrp = Math.floor(basePrice * 1.25);
            const sku = `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const qrCodeDataUrl = await QRCode.toDataURL(sku);
            const brandName = productName.split(' ')[0] || 'Local';

            const product = await Product.create({
                name: productName,
                description: description,
                basePrice: basePrice,
                mrp: mrp,
                category: categoryName,
                brandName: brandName,
                sku: sku,
                image: imageUrl,
                qrCode: qrCodeDataUrl,
                status: 'Active',
                createdBy: adminId,
                isAllBranches: true,
                branchStocks: [{
                    branchId: branchId,
                    stock: 50,
                    lowStockThreshold: 10
                }],
                tags: [categoryName, subCategoryName].filter(Boolean)
            });

            await InventoryLog.create({
                product: product._id,
                admin: adminId,
                branchId: branchId,
                changeAmount: 50,
                previousStock: 0,
                newStock: 50,
                type: 'Addition',
                reason: 'Folder Import'
            });

            console.log(`Successfully seeded: ${productName}`);
        } catch (err) {
            console.error(`Failed to process ${productName}:`, err.message);
        }
        return;
    }

    // Process subdirectories sequentially
    for (const item of items) {
        if (item.isDirectory()) {
            await processFolder(
                path.join(currentPath, item.name),
                categoryName || item.name,
                categoryName ? item.name : ''
            );
        }
    }
}

async function startImport() {
    try {
        console.log('Connecting to DB...');
        await connectDB();
        console.log('Connected to DB. Starting import...');

        const admin = await Admin.findOne({ email: 'admin@gmail.com' });
        const branch = await Branch.findOne({ code: 'MAIN' });

        if (!admin || !branch) {
            console.error('Admin or Branch not found. Please run initial seeder first.');
            process.exit(1);
        }

        adminId = admin._id;
        branchId = branch._id;

        const rootDirs = fs.readdirSync(BASE_PATH, { withFileTypes: true })
            .filter(d => d.isDirectory());

        for (const dir of rootDirs) {
            console.log(`\n--- Category Folder: ${dir.name} ---`);

            let category = await Category.findOne({ name: dir.name });
            if (!category) {
                await Category.create({
                    name: dir.name,
                    slug: dir.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                    image: CATEGORY_IMAGES[dir.name] || 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=200&q=80',
                    description: `Products in ${dir.name}`,
                    createdBy: admin._id
                });
            }

            const countBefore = processedProducts.size;
            await processFolder(path.join(BASE_PATH, dir.name), dir.name);
            console.log(`Added ${processedProducts.size - countBefore} products from ${dir.name}`);
        }

        console.log('\n--- ALL DONE ---');
        console.log(`Total Products added in this session: ${processedProducts.size}`);
        process.exit(0);
    } catch (err) {
        console.error('Import failed:', err);
        process.exit(1);
    }
}

startImport();
