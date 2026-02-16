import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';
import connectDB from './config/db.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env vars
dotenv.config({ path: join(__dirname, '../.env') });

const seedAdmin = async () => {
  try {
    await connectDB();

    const adminEmail = 'admin@gmail.com';
    const existingAdmin = await Admin.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit();
    }

    const adminData = {
      name: 'Super Admin',
      email: adminEmail,
      phone: '9999999999',
      password: 'admin@123',
      role: 'Admin',
      isActive: true,
      permissions: [
        'dashboard_view',
        'orders_manage',
        'products_manage',
        'customers_view',
        'staff_manage',
        'settings_edit',
        'returns_approve'
      ]
    };

    await Admin.create(adminData);
    console.log('Admin seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
