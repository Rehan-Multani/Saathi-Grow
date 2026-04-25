import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const db = mongoose.connection.db;

  const pages = [
    {
      title: 'Terms & Conditions',
      slug: 'delivery-terms-conditions',
      targetAudience: ['Delivery Partner'],
      isActive: true,
      content: `TERMS & CONDITIONS — DELIVERY PARTNER AGREEMENT

Last Updated: April 2026

1. ACCEPTANCE OF TERMS
By registering as a Delivery Partner on the SaathiGro platform, you agree to be bound by these Terms & Conditions. Please read them carefully before accepting any delivery missions.

2. ELIGIBILITY
- You must be at least 18 years of age.
- You must possess a valid driving license applicable to your vehicle type.
- Your vehicle must be registered, insured, and roadworthy.
- You must have a valid Aadhaar card and PAN card for KYC verification.

3. DELIVERY OBLIGATIONS
- Accept and complete assigned delivery missions in a timely manner.
- Handle all packages with care and ensure safe delivery to the customer.
- Maintain professional conduct with customers at all times.
- Report any delivery failures, accidents, or incidents immediately to dispatch.

4. EARNINGS & PAYMENTS
- Earnings are calculated per completed delivery mission.
- Payments are processed weekly to your registered bank account.
- Cash-on-delivery amounts must be deposited at the nearest branch within 24 hours of collection.
- SaathiGro reserves the right to deduct amounts for unresolved cash liabilities.

5. CODE OF CONDUCT
- Do not misuse customer data or contact information.
- Do not accept tips or additional payments outside the platform.
- Maintain hygiene and presentable appearance during deliveries.
- Do not operate the vehicle under the influence of alcohol or drugs.

6. TERMINATION
SaathiGro reserves the right to terminate your partnership without notice in case of:
- Fraud or misrepresentation
- Repeated delivery failures
- Misconduct with customers or staff
- Violation of any terms herein

7. LIABILITY
SaathiGro is not liable for accidents, injuries, or damages occurring during delivery operations. Partners are advised to maintain personal accident insurance.

8. AMENDMENTS
These terms may be updated periodically. Continued use of the platform constitutes acceptance of the revised terms.

For queries, contact: support@Saathigro.com`
    },
    {
      title: 'Privacy Policy',
      slug: 'delivery-privacy-policy',
      targetAudience: ['Delivery Partner'],
      isActive: true,
      content: `PRIVACY POLICY — DELIVERY PARTNER

Last Updated: April 2026

1. INFORMATION WE COLLECT
We collect the following information when you register and operate as a Delivery Partner:
- Personal details: Name, phone number, email address, date of birth
- Identity documents: Aadhaar, PAN, driving license
- Vehicle information: Registration number, vehicle type, insurance details
- Location data: Real-time GPS location during active delivery missions
- Financial details: Bank account number for payout processing

2. HOW WE USE YOUR INFORMATION
- To assign and manage delivery missions
- To process earnings and payouts
- To verify your identity and eligibility
- To communicate important updates and notifications
- To improve platform performance and safety

3. LOCATION TRACKING
Your location is tracked only during active duty hours. Location data is used solely for mission assignment and route optimization. We do not share your location with third parties.

4. DATA SHARING
We do not sell your personal data. We may share data with:
- Payment processors for payout settlement
- Government authorities if required by law
- Insurance providers for claim processing

5. DATA SECURITY
We implement industry-standard encryption and security measures to protect your data. Access to your data is restricted to authorized personnel only.

6. YOUR RIGHTS
You have the right to:
- Access your personal data
- Request correction of inaccurate data
- Request deletion of your account and data
- Opt out of non-essential communications

7. CONTACT US
For privacy-related queries: privacy@Saathigro.com
SaathiGro Operations, Indore, Madhya Pradesh, India`
    }
  ];

  for (const page of pages) {
    const exists = await db.collection('legalpages').findOne({ slug: page.slug });
    if (!exists) {
      await db.collection('legalpages').insertOne({ ...page, createdAt: new Date(), updatedAt: new Date() });
      console.log(`✓ Seeded: ${page.title}`);
    } else {
      console.log(`- Already exists: ${page.title}`);
    }
  }

  console.log('Done!');
  process.exit();
});
