const mongoose = require('mongoose');
const Product = require('./src/models/Product.js');
const Branch = require('./src/models/Branch.js');

async function debug() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saathi-grow');
    
    const products = await Product.find({ status: { $ne: 'Draft' } }).lean();
    console.log(`Total non-draft products: ${products.length}`);
    
    const results = [];
    for (const p of products) {
        if (!p.vendor) {
            for (const bs of p.branchStocks) {
                const threshold = bs.lowStockThreshold || 10;
                if (bs.stock <= threshold) {
                    const branch = await Branch.findById(bs.branchId);
                    results.push({
                        name: p.name,
                        sku: p.sku,
                        stock: bs.stock,
                        threshold,
                        branchFound: !!branch,
                        branchName: branch ? branch.name : 'MISSING'
                    });
                }
            }
        } else {
            const threshold = p.lowStockThreshold || 10;
            if (p.stock <= threshold) {
                results.push({
                    name: p.name,
                    sku: p.sku,
                    stock: p.stock,
                    threshold,
                    isVendor: true
                });
            }
        }
    }
    
    console.log("Items that SHOULD be in alerts:");
    console.table(results);
    
    mongoose.connection.close();
}

debug();
