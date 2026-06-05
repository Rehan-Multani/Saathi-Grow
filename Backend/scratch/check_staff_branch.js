import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Define Schema inline to avoid path/import issues
const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  permissions: [String],
  isActive: Boolean,
  branchId: mongoose.Schema.Types.ObjectId
}, { collection: 'admins' });

const Admin = mongoose.model('Admin', adminSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  const staff = await Admin.findOne({ email: 'talesapna1@gmail.com' });
  console.log('Staff info:', staff);
  await mongoose.disconnect();
}

run().catch(console.error);
