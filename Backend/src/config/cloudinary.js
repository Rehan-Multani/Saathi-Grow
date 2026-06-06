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

/**
 * Helper: Detect the best web-safe OUTPUT format from a file object.
 * HEIC/HEIF are input-only formats from iPhone cameras — always convert to jpg.
 * Falls back to 'jpg' for camera blobs with no extension.
 */
const detectFormat = (file) => {
  const allowedOutput = ['jpg', 'png', 'webp', 'avif'];
  if (file.originalname && file.originalname.includes('.')) {
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (allowedOutput.includes(ext)) return ext;
    if (ext === 'jpeg') return 'jpg';
  }
  if (file.mimetype) {
    const mimeExt = file.mimetype.split('/')[1];
    if (allowedOutput.includes(mimeExt)) return mimeExt;
    if (mimeExt === 'jpeg') return 'jpg';
  }
  return 'jpg'; // safe default for camera captures
};

/**
 * Factory: Create a multer-storage-cloudinary storage for a given folder.
 */
const makeCloudinaryStorage = (folder) => new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => ({
    folder: folder,
    format: detectFormat(file),
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  }),
});

// ── Per-entity Cloudinary storages ──────────────────────────────────────────
const adminStorage     = makeCloudinaryStorage('saathigro/admin-profiles');
const userStorage      = makeCloudinaryStorage('saathigro/user-profiles');
const deliveryStorage  = makeCloudinaryStorage('saathigro/delivery-profiles');
const productStorage   = makeCloudinaryStorage('saathigro/products');
const complaintStorage = makeCloudinaryStorage('saathigro/complaint-attachments');
const returnStorage    = makeCloudinaryStorage('saathigro/return-proof');

// ── Default "general" upload (kept for backward compat) ─────────────────────
const generalStorage = makeCloudinaryStorage('saathigro/uploads');

const allowedMimeTypes = new Set([
  'image/jpeg', 'image/jpg', 'image/png', 'image/webp',
  'image/avif', 'image/heic', 'image/heif'
]);

const makeFileFilter = () => (req, file, cb) => {
  // Accept anything that looks like an image:
  // - standard image/* mimetypes
  // - application/octet-stream: camera blobs from some Android WebViews
  // - image/heic / image/heif: iPhone camera photos
  const mimetype = (file.mimetype || '').toLowerCase();
  const filename = (file.originalname || '').toLowerCase();
  const ext = filename.split('.').pop();
  
  const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'avif', 'heic', 'heif'];

  const isImage =
    mimetype.startsWith('image/') ||
    mimetype === 'application/octet-stream' ||
    mimetype === 'blob' ||
    allowedExtensions.includes(ext);

  if (!isImage) {
    return cb(new Error(`File type not allowed: ${file.mimetype || 'unknown'}`));
  }
  cb(null, true);
};

const uploadOpts = { fileFilter: makeFileFilter(), limits: { fileSize: 10 * 1024 * 1024 } };

// Named exports — routes import whichever they need
const upload          = multer({ storage: adminStorage,    ...uploadOpts });
const userUpload      = multer({ storage: userStorage,     ...uploadOpts });
const deliveryUpload  = multer({ storage: deliveryStorage, ...uploadOpts });
const productUpload   = multer({ storage: productStorage,  ...uploadOpts });
const complaintUpload = multer({ storage: complaintStorage,...uploadOpts });
const returnUpload    = multer({ storage: returnStorage,   ...uploadOpts });

// Memory-based upload (used for programmatic Cloudinary streaming)
const memoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: makeFileFilter(),
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
      if (error) { reject(error); return; }
      resolve(result);
    }
  );
  stream.end(buffer);
});

export {
  cloudinary,
  upload,
  userUpload,
  deliveryUpload,
  productUpload,
  complaintUpload,
  returnUpload,
  memoryUpload,
  uploadBufferToCloudinary,
};
