import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

console.log('EMAIL_SERVICE:', process.env.EMAIL_SERVICE);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0);

async function verifyTransporter() {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('Transporter is ready to send emails!');

    // Let's send a test mail to EMAIL_USER itself
    const info = await transporter.sendMail({
      from: `"SaathiGro Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'SaathiGro Nodemailer Test Connection',
      text: 'If you receive this, email service connection is working!'
    });
    console.log('Test email sent successfully! MessageId:', info.messageId);
  } catch (error) {
    console.error('Transporter verification/send failed:', error);
  }
}

verifyTransporter();
