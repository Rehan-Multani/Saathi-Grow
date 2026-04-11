import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './src/models/Product.js';
import PhysicalLocation from './src/models/PhysicalLocation.js';

dotenv.config();

const migrateLocations = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        const products = await Product.find({ physicalLocation: { $type: 'string', $ne: '' } });
        console.log(`Found ${products.length} products with legacy physicalLocation string`);

        let count = 0;
        for (const product of products) {
            const locName = product.physicalLocation;

            // Determine scope
            let branchId = null;
            let vendorId = null;

            if (product.vendor) {
                vendorId = product.vendor;
            } else if (product.branchStocks && product.branchStocks.length > 0) {
                // Approximate: assign to the first branch it exists in
                branchId = product.branchStocks[0].branchId;
            }

            if (branchId || vendorId) {
                let existingLoc = await PhysicalLocation.findOne({
                    label: locName,
                    branchId: branchId || undefined,
                    vendorId: vendorId || undefined
                });

                if (!existingLoc) {
                    existingLoc = await PhysicalLocation.create({
                        label: locName,
                        branchId,
                        vendorId,
                        isOccupied: true,
                        assignedProduct: product._id
                    });
                } else if (!existingLoc.assignedProduct) {
                    existingLoc.isOccupied = true;
                    existingLoc.assignedProduct = product._id;
                    await existingLoc.save();
                }

                // Update product (Though current Product schema removed it, wait, let's verify if product model changed,
                // the summary said "Product model has not been modified but needed refactor". But I see that the UI reads available locations).
                // But legacy physicalLocation is just a string. No schema change strictly required if we don't drop string support instantly, but good to ensure uniqueness.
                
                count++;
            }
        }
        console.log(`Migration complete. Processed ${count} products.`);
    } catch (e) {
        console.error(e);
    } finally {
        mongoose.disconnect();
    }
};

migrateLocations();
