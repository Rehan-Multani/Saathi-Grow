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
    },
    {
      title: 'Privacy Policy',
      slug: 'user-privacy-policy',
      targetAudience: ['User'],
      isActive: true,
      content: `PRIVACY POLICY — SAATHIGRO USER

Last Updated: April 2026

1. INTRODUCTION
Welcome to SaathiGro. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us at support@Saathigro.com.

2. INFORMATION WE COLLECT
We collect personal information that you voluntarily provide to us when you:
- Register on the platform (Name, phone number, email, address)
- Place an order (Delivery address, items purchased, payment preference)
- Contact our customer service or write complaints.

3. HOW WE USE YOUR INFORMATION
We use personal information collected via our Services for a variety of business purposes:
- To facilitate account creation and logon process.
- To deliver services and orders to you.
- To send you marketing, promotional, and updates messages.
- To respond to user inquiries and offer support.
- For business purposes such as data analysis, identifying usage trends, and evaluating our promotional campaigns.

4. SHARING YOUR INFORMATION
We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations. This includes:
- Sharing details with our Delivery Partners so they can locate your delivery address.
- Third-party payment processors to verify and complete transactions.

5. SECURITY OF YOUR INFORMATION
We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.

6. YOUR PRIVACY RIGHTS
You may review, change, or terminate your account at any time by contacting us. If you request to delete your account, we will deactivate or delete your account and information from our active databases, subject to regulatory storage rules.

7. CONTACT US
If you have questions or comments about this policy, you may email us at privacy@Saathigro.com.`
    },
    {
      title: 'Terms & Conditions',
      slug: 'user-terms-conditions',
      targetAudience: ['User'],
      isActive: true,
      content: `TERMS & CONDITIONS — SAATHIGRO USER AGREEMENT

Last Updated: April 2026

1. ACCEPTANCE OF TERMS
By downloading, installing, or using the SaathiGro application or website, you agree to comply with and be bound by these Terms & Conditions. If you do not agree to these terms, please do not use our services.

2. USER ACCOUNTS
To use certain features, you must register for an account. You agree to:
- Provide accurate and current info during registration.
- Maintain the security of your password and credentials.
- Promptly update account info if there are changes.
- Accept all risks of unauthorized access to your account if credentials are leaked.

3. ORDERING & CANCELLATIONS
- Order placement: All orders are subject to availability.
- Pricing: Prices are subject to change. Delivery fees and taxes are detailed at checkout.
- Cancellation: Orders can only be cancelled before they are dispatched or processed. Please refer to our Refund & Return Policy for details.

4. DELIVERIES
- Delivery times are estimates and not guarantees. We work to deliver in minutes, but extreme weather, traffic, or system loads may cause delays.
- You must be available to receive the delivery at the designated address. If you are unavailable, the order may be cancelled with no refund.

5. REFUNDS AND RETURNS
- Perishable goods, once delivered, cannot be returned unless they are damaged or incorrect at the time of delivery.
- If you receive damaged or incorrect items, you must raise a complaint within the app or contact support within 24 hours of delivery.

6. CODE OF CONDUCT
You agree not to misuse our platform, engage in fraudulent activities, or harass our delivery partners or staff.

7. LIMITATION OF LIABILITY
SaathiGro shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our services.

8. CONTACT US
For any legal queries, contact support@Saathigro.com.`
    }
  ];

  for (const page of pages) {
    const exists = await db.collection('legalpages').findOne({ slug: page.slug });
    if (!exists) {
      await db.collection('legalpages').insertOne({ ...page, createdAt: new Date(), updatedAt: new Date() });
      console.log(`✓ Seeded: ${page.title}`);
    } else {
      await db.collection('legalpages').updateOne({ slug: page.slug }, { $set: { ...page, updatedAt: new Date() } });
      console.log(`✓ Updated: ${page.title}`);
    }
  }

  console.log('Done!');
  process.exit();
});
