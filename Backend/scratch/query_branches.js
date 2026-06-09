import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Branch from '../src/models/Branch.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- Connected to DB ---');

  const branches = await Branch.find().lean();
  for (const b of branches) {
    console.log(`Branch ID: ${b._id}`);
    console.log(`  Name: ${b.name}`);
    console.log(`  IsActive: ${b.isActive}`);
    console.log(`  Location: ${JSON.stringify(b.address?.location)}`);
  }

  await mongoose.disconnect();
}

run().catch(console.error);
