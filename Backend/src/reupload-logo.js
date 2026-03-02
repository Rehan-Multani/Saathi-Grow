import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const logoPath = path.resolve(__dirname, '../../Frontend/public/assets/logo.png');

async function reupload() {
  try {
    console.log('Re-uploading logo.png to Cloudinary...');
    const result = await cloudinary.uploader.upload(logoPath, {
      public_id: 'saathigro/assets/logo',
      use_filename: true,
      unique_filename: false,
      resource_type: 'raw',
      overwrite: true,
    });
    console.log('Successfully re-uploaded logo.png');
    console.log('Secure URL:', result.secure_url);
    process.exit(0);
  } catch (error) {
    console.error('Error re-uploading logo.png:', error);
    process.exit(1);
  }
}

reupload();
