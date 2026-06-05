import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Admin from '../src/models/Admin.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const admins = await Admin.find({});
  console.log("=== ADMIN/STAFF USERS ===");
  admins.forEach(a => {
    console.log(`Email: ${a.email}, Role: ${a.role}, Permissions: ${JSON.stringify(a.permissions)}, Active: ${a.isActive}`);
  });
  await mongoose.disconnect();
}

run().catch(console.error);
