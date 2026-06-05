import '../src/config/env.js';
import mongoose from 'mongoose';
import Vendor from '../src/models/Vendor.js';
import { sendWelcomeEmail } from '../src/services/emailService.js';

async function test() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    // Fetch the 5 most recent vendors
    console.log('\n--- 5 Most Recent Vendors ---');
    const vendors = await Vendor.find().sort({ createdAt: -1 }).limit(5);
    if (vendors.length === 0) {
      console.log('No vendors found in the database.');
    } else {
      vendors.forEach(v => {
        console.log(`ID: ${v._id}`);
        console.log(`Store Name: ${v.storeName}`);
        console.log(`Owner: ${v.ownerName}`);
        console.log(`Email: ${v.email}`);
        console.log(`Phone: ${v.phone}`);
        console.log(`Status: ${v.status}`);
        console.log(`Created At: ${v.createdAt}`);
        console.log('-----------------------------');
      });
    }

    if (vendors.length > 0) {
      const latestVendor = vendors[0];
      console.log(`\nAttempting to send welcome email to latest vendor: ${latestVendor.email} (${latestVendor.ownerName})...`);
      
      const emailResult = await sendWelcomeEmail(
        latestVendor.email,
        latestVendor.ownerName,
        'Vendor',
        '123456'
      );
      
      console.log(`Welcome email send outcome: ${emailResult}`);
    } else {
      console.log('\nNo vendor available to test email.');
    }

    await mongoose.disconnect();
    console.log('\nDisconnected from DB.');
  } catch (error) {
    console.error('Test execution failed:', error);
  }
}

test();
