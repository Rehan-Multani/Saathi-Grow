import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Admin from '../src/models/Admin.js';

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  
  // Find benjohns1805@gmail.com
  let staff = await Admin.findOne({ email: 'benjohns1805@gmail.com' });
  if (staff) {
    staff.password = 'adminPassword123';
    staff.permissions = [
      'VIEW_CUSTOMERS',
      'MANAGE_INVENTORY',
      'MANAGE_POS_BILLING',
      'VIEW_ORDERS',
      'MANAGE_ORDERS',
      'MANAGE_REFUNDS_RETURNS',
      'MANAGE_PRODUCTS',
      'MANAGE_STAFF',
      'VIEW_REPORTS'
    ];
    await staff.save();
    console.log("Updated staff credentials for benjohns1805@gmail.com");
  } else {
    console.log("Staff not found");
  }
  
  await mongoose.disconnect();
}

run().catch(console.error);
