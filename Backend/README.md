# SaathiGro Backend - Quick Commerce Engine

## 🚀 Vision
Built to challenge industry leaders like Blinkit and Instamart, this backend is optimized for:
- **Hyperlocal Order Routing**: Matching orders to the nearest dark stores.
- **10-Minute Delivery Latency**: Real-time stock locking and rider assignment.
- **Real-time Tracking**: Live GPS-based rider tracking via Socket.io.
- **Micro-caching**: Lightning-fast cart and inventory retrieval via Redis.

---

## 🏗 Architecture
- **Framework**: Express.js (ESM)
- **Database**: MongoDB (Geospatial Indexing for Hyperlocal stores)
- **Real-time**: Socket.io (Bi-directional communication)
- **Image handling**: Cloudinary + Multer
- **Cache Layer**: Redis

---

## 📂 Key Modules
- **Auth**: Secure JWT-based auth with role-specific access (User, Admin, Rider, Staff).
- **Inventory**: Branch-wise inventory management (Dark Stores).
- **Hyperlocal**: Geospatial search for branches within 5km of user location.
- **Order Flow**: Multi-status lifecycle (`placed` -> `packing` -> `out-for-delivery` -> `delivered`).

---

## 🛠 Getting Started
1. **Env Setup**: Rename `.env.example` to `.env` and add your keys.
2. **Install**: `npm install`
3. **Run**: `npm run dev`

---

## 🛣 API Routes (Implemented)
| Route | Method | Description |
|---|---|---|
| `/api/auth/register` | `POST` | Create a new user account |
| `/api/auth/login` | `POST` | Login to receive JWT |
| `/api/auth/profile` | `GET` | Get logged-in user details |

---
*Developed by Antigravity AI.*
