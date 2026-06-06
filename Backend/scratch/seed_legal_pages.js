import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import LegalPage from '../src/models/LegalPage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const termsContent = `Welcome to Saathi-Grow!

These Terms & Conditions govern your use of the Saathi-Grow website, mobile application, and related delivery services. By accessing or using our platform, you agree to comply with and be bound by these terms. Please read them carefully.

1. Account Registration
- You must create an account to place orders on Saathi-Grow.
- You agree to provide accurate, current, and complete information during registration.
- You are solely responsible for maintaining the confidentiality of your account credentials.

2. Ordering and Delivery
- All orders placed on our platform are subject to product availability and acceptance by our partner stores.
- Delivery times provided are estimates and may vary due to traffic, weather, or operational issues.
- You agree to pay all charges incurred, including delivery fees and taxes.

3. Payment Terms
- We support online payment modes (UPI, Cards, Netbanking) and Cash on Delivery (COD).
- Payments are processed securely through our payment gateway partners.

4. Limitation of Liability
- Saathi-Grow acts as an intermediary linking users to local vendor partners. We are not responsible for the quality, safety, or legality of the products supplied.
- To the maximum extent permitted by law, Saathi-Grow shall not be liable for any indirect, incidental, or consequential damages.

5. Modifications
- We reserve the right to modify these terms at any time. Changes will be posted on this page and will take effect immediately.

For any queries regarding these terms, please contact us at support@saathigro.in.`;

const privacyContent = `Saathi-Grow Privacy Policy

Your privacy is important to us. This Privacy Policy describes how Saathi-Grow collects, uses, and shares your personal information when you use our website, mobile application, or delivery network.

1. Information We Collect
- Personal details: Name, phone number, email address, and delivery addresses.
- Location data: Real-time precise location data to facilitate order dispatch and delivery tracking.
- Transaction info: Purchase details, payment method choice, and order history.
- Device info: IP address, operating system, and app usage data.

2. How We Use Your Information
- To process and deliver your orders.
- To provide live order tracking updates via SMS, Push, or In-app notifications.
- To process secure payments and handle refunds.
- To improve our platform functionality and user experience.
- To communicate system updates, promo deals, and support messages.

3. Sharing Your Information
- We share necessary address and contact details with our Delivery Partners and Merchants to fulfill your orders.
- We do NOT sell or lease your personal information to third-party marketing companies.

4. Data Security
- We implement industry-standard security protocols to protect your personal data from unauthorized access or disclosure.

5. Your Rights
- You may access, correct, or update your profile information via the "Profile Settings" in the app.
- You can request deletion of your account by reaching out to our support team.

If you have any questions about this Privacy Policy, please reach out to us at privacy@saathigro.in.`;

async function seed() {
  try {
    const MONGO_URI = process.env.MONGO_URI;
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected!');

    // Upsert Terms & Conditions for User
    await LegalPage.findOneAndUpdate(
      { slug: 'terms-and-conditions' },
      {
        title: 'Terms and Conditions',
        slug: 'terms-and-conditions',
        content: termsContent,
        targetAudience: ['User'],
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('Terms and Conditions seeded successfully.');

    // Upsert Privacy Policy for User
    await LegalPage.findOneAndUpdate(
      { slug: 'privacy-policy' },
      {
        title: 'Privacy Policy',
        slug: 'privacy-policy',
        content: privacyContent,
        targetAudience: ['User'],
        isActive: true
      },
      { upsert: true, new: true }
    );
    console.log('Privacy Policy seeded successfully.');

    await mongoose.disconnect();
    console.log('Disconnected.');
  } catch (error) {
    console.error('Seeding failed:', error);
  }
}

seed();
