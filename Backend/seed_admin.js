/**
 * Seed or Update an Admin in the database
 * Run: 
 *   node seed_admin.js
 * Or with custom credentials:
 *   node seed_admin.js <email> <password> <name> <phone> <role>
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Admin from './src/models/Admin.js';

const MONGO_URI = process.env.MONGO_URI;

// Extract command line arguments or use defaults
const args = process.argv.slice(2);
const email = (args[0] || 'admin@saathigro.com').toLowerCase().trim();
const password = args[1] || 'adminPassword123';
const name = args[2] || 'Master Admin';
const phone = args[3] || '9990001112';
const role = args[4] || 'Admin';

// Validation
if (!MONGO_URI) {
  console.error('❌ Error: MONGO_URI is not defined in your .env file.');
  process.exit(1);
}

if (password.length < 8) {
  console.error('❌ Error: Password must be at least 8 characters long.');
  process.exit(1);
}

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Check if an admin with the same email already exists
  let admin = await Admin.findOne({ email });

  if (admin) {
    console.log(`\n⚠️  Admin with email "${email}" already exists. Updating details...`);
    admin.name = name;
    admin.phone = phone;
    admin.password = password; // Pre-save hook will hash this automatically
    admin.role = role;
    admin.isActive = true;
    
    // Set typical permissions
    admin.permissions = [
      'MANAGE_PRODUCTS',
      'VIEW_REPORTS',
      'MANAGE_USERS',
      'MANAGE_DELIVERY',
      'MANAGE_VENDORS',
      'MANAGE_ORDERS'
    ];
    
    await admin.save();
    console.log('✅ Admin updated successfully.');
  } else {
    console.log(`\nCreating new Admin with email "${email}"...`);
    
    // Check if phone number is unique to avoid validation errors
    const existingPhone = await Admin.findOne({ phone });
    if (existingPhone) {
      console.error(`❌ Error: Phone number "${phone}" is already in use by another admin (${existingPhone.email}).`);
      console.log('Please provide a unique phone number as the 4th argument:');
      console.log('  node seed_admin.js <email> <password> <name> <unique_phone> <role>');
      await mongoose.disconnect();
      process.exit(1);
    }

    admin = new Admin({
      name,
      email,
      phone,
      password, // Pre-save hook will hash this automatically
      role,
      isActive: true,
      permissions: [
        'MANAGE_PRODUCTS',
        'VIEW_REPORTS',
        'MANAGE_USERS',
        'MANAGE_DELIVERY',
        'MANAGE_VENDORS',
        'MANAGE_ORDERS'
      ]
    });

    await admin.save();
    console.log('✅ Admin created successfully.');
  }

  printCreds(admin, password);
  await mongoose.disconnect();
}

function printCreds(admin, plainPassword) {
  console.log('\n──────────────────────────────────────────────────');
  console.log('               ADMIN CREDENTIALS                 ');
  console.log('──────────────────────────────────────────────────');
  console.log(`  Name     : ${admin.name}`);
  console.log(`  Email    : ${admin.email}`);
  console.log(`  Password : ${plainPassword}`);
  console.log(`  Phone    : ${admin.phone}`);
  console.log(`  Role     : ${admin.role}`);
  console.log(`  Status   : ${admin.isActive ? 'Active' : 'Inactive'}`);
  console.log(`  ID       : ${admin._id}`);
  console.log('──────────────────────────────────────────────────\n');
}

seed().catch(async (err) => {
  console.error('❌ An error occurred during seeding:', err);
  try {
    await mongoose.disconnect();
  } catch (disconnectErr) {
    // Ignore disconnect errors
  }
  process.exit(1);
});
