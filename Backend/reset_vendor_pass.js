import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const hash = await bcrypt.hash('vendor@123', 10);
  const result = await mongoose.connection.db.collection('vendors').updateOne(
    { email: 'jnvi.mehra.17@gmail.com' },
    { $set: { password: hash } }
  );
  console.log('Matched:', result.matchedCount, '| Updated:', result.modifiedCount);
  process.exit();
});
