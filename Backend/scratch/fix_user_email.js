import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import User from '../src/models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

async function fix() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    // Find the user with name Johnn or email ending with .comv
    const user = await User.findOne({ 
      $or: [
        { email: 'testingdata475@gmail.comv' },
        { phone: '+919109599487' },
        { phone: '9109599487' }
      ]
    });

    if (user) {
      console.log('Found user:', user.name, 'with email:', user.email);
      user.email = 'testingdata475@gmail.com';
      await user.save();
      console.log('Updated email successfully to:', user.email);
    } else {
      console.log('User not found in the database.');
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error fixing user email:', error);
  }
}

fix();
