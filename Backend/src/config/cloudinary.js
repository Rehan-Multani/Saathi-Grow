import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'saathigro/admin-profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

const upload = multer({ storage: storage });
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);

const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.has(file.mimetype)) {
      cb(new Error('Only JPG, PNG, WEBP, and AVIF images are allowed'));
      return;
    }
    cb(null, true);
  }
});

const uploadBufferToCloudinary = ({
  buffer,
  folder = 'saathigro/uploads',
  publicId,
  transformation = [{ quality: 'auto', fetch_format: 'auto' }]
}) => new Promise((resolve, reject) => {
  const stream = cloudinary.uploader.upload_stream(
    {
      folder,
      public_id: publicId,
      resource_type: 'image',
      transformation
    },
    (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    }
  );

  stream.end(buffer);
});

export { cloudinary, upload, memoryUpload, uploadBufferToCloudinary };
