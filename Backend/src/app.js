import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

// Connect to Database
connectDB();

const app = express();
const httpServer = createServer(app);

// CORS configuration based on environment
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://saathi-grow-frontend.vercel.app',
  'https://saathi-grow.vercel.app',
  'https://saathi-grow-admin.vercel.app',
  'https://saathi-grow-vendor.vercel.app',
  'https://saathi-grow-8oyg.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean).map(o => o.trim().replace(/\/$/, ''));

const isAllowed = (origin) => {
  if (!origin || origin === 'null') return true;

  const sanitizedOrigin = origin.trim().replace(/\/$/, '');
  if (allowedOrigins.includes(sanitizedOrigin)) return true;

  try {
    const url = new URL(origin);
    const hostname = url.hostname;

    // Allow all localhost variants
    if (hostname === 'localhost' || hostname === '127.0.0.1') return true;

    // Allow any vercel.app subdomain
    if (hostname.endsWith('.vercel.app')) return true;

    // Allow the domain without subdomain if hit directly
    if (hostname === 'vercel.app') return true;

  } catch (err) {
    console.error('CORS Origin Parsing Error:', origin);
  }

  console.warn('CORS Blocked Origin:', origin);
  return false;
};

// Socket.io initialization for real-time tracking
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowed(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowed(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));
app.use(morgan('dev')); // Logging
app.use(express.json()); // Body parser
app.use(express.urlencoded({ extended: true }));

// Root Route
app.get('/', (req, res) => {
  res.json({
    message: "Welcome to SaathiGro API - Quick Commerce Backend",
    status: "Running",
    version: "1.0.0"
  });
});

// Import Routes
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import productRoutes from './routes/productRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import vendorPortalRoutes from './routes/vendorPortalRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import offerRoutes from './routes/offerRoutes.js';
import userRoutes from './routes/userRoutes.js';
import deliveryRoutes from './routes/deliveryRoutes.js';
import userAddressRoutes from './routes/userAddressRoutes.js';
import userWishlistRoutes from './routes/userWishlistRoutes.js';
import userCartRoutes from './routes/userCartRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import settingRoutes from './routes/settingRoutes.js';
import adminDeliveryRoutes from './routes/adminDeliveryRoutes.js';
import deliveryAuthRoutes from './routes/deliveryAuthRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import walletRoutes from './routes/walletRoutes.js';

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/users', userRoutes);
app.use('/api/admin/branches', branchRoutes);
app.use('/api/admin/vendors', vendorRoutes);
app.use('/api/vendors', vendorPortalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/brands', brandRoutes);
app.use('/api/admin/categories', categoryRoutes);
app.use('/api/admin/products', productRoutes);
app.use('/api/admin/campaigns', campaignRoutes);
app.use('/api/admin/offer-deals', offerRoutes);
app.use('/api/admin/delivery', adminDeliveryRoutes);
app.use('/api/delivery/auth', deliveryAuthRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/dashboard', dashboardRoutes);

// User Profile/Front-End Routes
app.use('/api/user/addresses', userAddressRoutes);
app.use('/api/user/wishlist', userWishlistRoutes);
app.use('/api/user/cart', userCartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/settings', settingRoutes);
app.use('/api/wallet', walletRoutes);

// Socket logic placeholder
io.on('connection', (socket) => {
  console.log('⚡ User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('🔥 User disconnected');
  });
});

// Error handling middleware placeholder (we will refine this)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server
const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`📡 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export { app, io };
