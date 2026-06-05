import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

async function run() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected');

  // Let's find talesapna1@gmail.com
  const email = 'talesapna1@gmail.com';
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const res = await mongoose.connection.collection('admins').updateOne(
    { email },
    { $set: { password: hashedPassword } }
  );
  
  console.log('Update result:', res);
  await mongoose.disconnect();
}

run().catch(console.error);
