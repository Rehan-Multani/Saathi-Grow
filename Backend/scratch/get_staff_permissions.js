import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in env');
  process.exit(1);
}

// Define Schema inline to avoid path/import issues
const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
  permissions: [String],
  isActive: Boolean
}, { collection: 'admins' });

const Admin = mongoose.model('Admin', adminSchema);

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to DB');
  
  const staffs = await Admin.find({ role: 'Staff' });
  console.log('Staff members:');
  staffs.forEach(s => {
    console.log(`- Name: ${s.name}, Email: ${s.email}, Role: ${s.role}, Permissions: ${JSON.stringify(s.permissions)}, IsActive: ${s.isActive}`);
  });
  
  await mongoose.disconnect();
}

run().catch(console.error);
