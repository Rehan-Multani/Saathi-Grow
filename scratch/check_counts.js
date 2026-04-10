
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../Backend/.env') });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Product = mongoose.model('Product', new mongoose.Schema({ 
            name: String, 
            vendor: mongoose.Schema.Types.Mixed,
            status: String,
            branchStocks: [{ branchId: mongoose.Schema.Types.ObjectId, stock: Number }]
        }, { collection: 'products' }));
        
        const Branch = mongoose.model('Branch', new mongoose.Schema({ name: String, code: String }, { collection: 'branches' }));
        
        const mainStore = await Branch.findOne({ name: /Main Store/i });
        if (!mainStore) {
            console.log("Main Store branch not found");
            return;
        }
        
        const branchId = mainStore._id;
        console.log(`Checking products for Branch: ${mainStore.name} (${branchId})`);
        
        const allWithBranchStock = await Product.find({ "branchStocks.branchId": branchId });
        console.log(`Total products with branchStock for this branch: ${allWithBranchStock.length}`);
        
        const statuses = await Product.aggregate([
            { $match: { "branchStocks.branchId": branchId } },
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);
        console.log("Status distribution:", statuses);
        
        const vendors = await Product.aggregate([
            { $match: { "branchStocks.branchId": branchId } },
            { $group: { _id: { exists: { $cond: [{ $gt: ["$vendor", null] }, true, false] }, val: "$vendor" }, count: { $sum: 1 } } }
        ]);
        console.log("Vendor presence:", JSON.stringify(vendors, null, 2));

        const activeNonVendor = await Product.countDocuments({ 
            "branchStocks.branchId": branchId,
            status: { $ne: 'Draft' },
            vendor: { $exists: false }
        });
        console.log(`Active Non-Vendor (exists false): ${activeNonVendor}`);

        const activeNonVendorWithNull = await Product.countDocuments({ 
            "branchStocks.branchId": branchId,
            status: { $ne: 'Draft' },
            vendor: null
        });
        console.log(`Active Non-Vendor (vendor: null): ${activeNonVendorWithNull}`);

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

check();
