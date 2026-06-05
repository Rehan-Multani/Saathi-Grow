import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

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
  const products = await Product.find({}).limit(5);
  products.forEach((p, idx) => {
    console.log(`${idx + 1}. Name: "${p.name}", Price: ${p.basePrice}, Category: "${p.category}"`);
  });
  await mongoose.disconnect();
}

run().catch(console.error);
