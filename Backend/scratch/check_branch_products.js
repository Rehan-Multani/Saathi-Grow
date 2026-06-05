import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Define Product Schema inline
const productSchema = new mongoose.Schema({
  name: String,
  basePrice: Number,
  image: String,
  category: String,
  sku: String,
  status: String,
  branchStocks: [{
    branchId: mongoose.Schema.Types.ObjectId,
    stock: Number
  }]
}, { collection: 'products' });

const Product = mongoose.model('Product', productSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected');

  const branchId = new mongoose.Types.ObjectId('6992d2e61f274bc67e4117ea');
  
  // Look for products where branchStocks.branchId is branchId
  const products = await Product.find({
    'branchStocks.branchId': branchId
  }).limit(15);
  
  console.log('Found:', products.length);
  products.forEach((p, idx) => {
    const bs = p.branchStocks.find(b => b.branchId.toString() === branchId.toString());
    console.log(`${idx + 1}. Name: "${p.name}", Price: ${p.basePrice}, Category: "${p.category}", Stock: ${bs ? bs.stock : 'N/A'}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
