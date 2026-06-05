import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const productSchema = new mongoose.Schema({
  name: String,
  image: String,
}, { collection: 'products' });

const Product = mongoose.model('Product', productSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  const products = await Product.find({
    name: { $in: ["applee", "fries", "juice", "oral", "epigamia Mishti Doi", "Bisleri Packaged Water"] }
  });
  products.forEach(p => {
    console.log(`Name: "${p.name}", Image: "${p.image}"`);
  });
  await mongoose.disconnect();
}

run().catch(console.error);
