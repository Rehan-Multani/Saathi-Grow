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
  console.log('Connected to DB');

  const products = await Product.find({}).limit(15);
  console.log('Products count:', products.length);
  products.forEach((p, idx) => {
    console.log(`${idx + 1}. Name: "${p.name}", Price: ${p.basePrice}, Category: "${p.category}", Stocks: ${JSON.stringify(p.branchStocks)}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);
