import axios from 'axios';
import mongoose from 'mongoose';
import Admin from './src/models/Admin.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const staff = await Admin.findOne({ role: 'Staff' });
  const token = jwt.sign({ id: staff._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  
  try {
    const res = await axios.get('http://localhost:5000/api/notifications/my?limit=3', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('API Response:', res.data);
  } catch (err) {
    console.error('API Error:', err.response?.data || err.message);
  }
  process.exit();
}).catch(console.error);
