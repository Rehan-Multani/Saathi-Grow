import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../src/models/User.js';

dotenv.config();

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('--- Connected to DB ---');

  const users = await User.find().sort({ updatedAt: -1 }).limit(10).lean();
  console.log(`Recent Users (Count: ${users.length}):`);
  users.forEach(u => {
    console.log(`ID: ${u._id}, Name: ${u.name}, Phone: ${u.phone}, Addresses:`, JSON.stringify(u.addresses));
  });

  await mongoose.disconnect();
}

run().catch(console.error);
