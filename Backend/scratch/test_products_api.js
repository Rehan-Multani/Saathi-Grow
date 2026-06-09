import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../src/models/Product.js';
import { getProducts } from '../src/controllers/productController.js';

dotenv.config();

// We will mock req, res
const req = {
  query: {
    page: '1',
    limit: '20',
    status: 'Active',
    activeStoreId: '69e732a2e7e9bc830e36ac16', // Pratapnagar branch ID
    activeStoreType: 'branch'
  }
};

const res = {
  json: function(data) {
    console.log(`Returned ${data.products?.length} products`);
    const sample = data.products?.[0];
    if (sample) {
      console.log('Sample product properties:');
      console.log(`  Name: ${sample.name}`);
      console.log(`  vendor: ${sample.vendor}`);
      console.log(`  branchStocks: ${JSON.stringify(sample.branchStocks)}`);
      console.log(`  isDeliverable: ${sample.isDeliverable}`);
      console.log(`  availableStock: ${sample.availableStock}`);
      console.log(`  lowStockThreshold: ${sample.lowStockThreshold}`);
      console.log(`  inStore: ${sample.inStore}`);
    }
  }
};

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  // Call getProducts controller directly
  await getProducts(req, res);

  await mongoose.disconnect();
}

run().catch(console.error);
