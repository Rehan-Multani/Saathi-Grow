import '../src/config/env.js';
import mongoose from 'mongoose';
import { admin as firebaseAdmin } from '../src/config/firebase.js';
import DeliveryPartner from '../src/models/DeliveryPartner.js';

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find Sarthak Namdevv
    const partner = await DeliveryPartner.findOne({ phone: '9685974247' });
    if (!partner) {
      console.log('Partner not found!');
      return;
    }

    const token = partner.fcmToken?.web;
    if (!token) {
      console.log('No token found');
      return;
    }

    const message = {
      token,
      notification: {
        title: "Direct Test Notification 📢",
        body: "If you see this, push notification service is working perfectly!"
      },
      data: {
        type: "test",
        click_action: "FLUTTER_NOTIFICATION_CLICK"
      }
    };

    const response = await firebaseAdmin.messaging().sendEach([message]);
    console.log('Firebase raw response:', JSON.stringify(response, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
