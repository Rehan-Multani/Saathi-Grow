# SaathiGro Frontend Documentation

## 🚀 Project Overview
**SaathiGro** is a high-end, multi-tenant E-commerce and Delivery platform designed to provide a seamless shopping experience for users while offering robust management tools for admins, vendors, and staff. The frontend is built with a focus on premium aesthetics, mobile-first responsiveness, and modern web technologies.

---

## 🛠 Technology Stack
- **Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: 
  - [Tailwind CSS v4](https://tailwindcss.com/) (Modern utility-first styling)
  - [Bootstrap 5](https://getbootstrap.com/) (Used primarily in administrative dashboards)
  - Vanilla CSS (Custom design tokens and animations)
- **Routing**: [React Router DOM v7](https://reactrouter.com/) (Role-based nested routing)
- **Icons**: [Lucide React](https://lucide.dev/) (Sleek, lightweight icons)
- **Analytics & Data Vis**: [Recharts](https://recharts.org/)
- **State Management**: React Context API (Modularized for each role)
- **Features**: 
  - Web Speech API (Voice Search)
  - Leaflet JS (Interactive Maps)
  - React Toastify (Premium notifications)

---

## 🏗 Architecture & Routing
The project follows a **Modular Role-Based Architecture**. Each user role has its own dedicated directory under `src/modules`, containing its own routes, pages, components, and contexts.

### Global Routing Structure (`App.jsx`)
The main entry point delegates routing to specific modules based on path prefixes:
- `/admin/*` -> **Admin Module**
- `/vendor/*` -> **Vendor/Partner Module**
- `/staff/*` -> **Staff Module**
- `/*` -> **User/Customer Module** (Default)

---

## 👥 Module Deep Dive

### 1. 🛒 User Module (The Customer App)
Designed for high engagement and premium feel. It handles the complete B2C journey.
- **Key Pages**:
  - **HomePage**: Dynamic carousels, category collections, and personalized offers.
  - **Category/Product Details**: Advanced filtering and rich product showcases.
  - **Cart & Checkout**: Multi-step checkout with address management and wallet integration.
  - **Order Tracking**: Real-time status updates and order history.
  - **User Profile**: Wallet (Add money, history), Saved Addresses, and Security settings.
- **Premium Features**:
  - **Voice Search**: Built-in AI-powered voice recognition for product search.
  - **Dark Mode**: System-wide theme toggling with curated color palettes.
  - **Occasion Themes**: Dynamic UI changes (colors/backgrounds) based on specific occasions or promotions.
  - **Mobile-First Navigation**: Floating cart strips, bottom navigation bar, and gesture-friendly menus.

### 2. 🛡 Admin Module (The Command Center)
A comprehensive ERP-style dashboard for platform administrators to oversee the entire ecosystem.
- **Core Functionalities**:
  - **Order Management**: Overseeing POS, Online, and Return requests.
  - **Inventory Control**: Global stock overview, branch-wise stock, and low-stock alerts.
  - **Partner Management**: Onboarding and managing Delivery Partners and Vendors.
  - **Financials**: Revenue analytics, POS analytics, vendor earnings, and tax reports.
  - **Marketing Tools**: Managing sliders, banners, offers, and promo codes.
  - **Support Desk**: Live chat integration, support ticket management, and FAQs.

### 3. 🏪 Vendor Module (The Partner Panel)
Dedicated workspace for merchants (vendors) to manage their business on SaathiGro.
- **Functionalities**:
  - **Store Management**: Profile customization and shop settings.
  - **Product Catalog**: Bulk upload tools, attributes management, and tax/pricing configuration.
  - **Order Fulfillment**: Tracking incoming orders and managing returns.
  - **Business Intelligence**: Sales analysis, earnings reports, and wallet history.

### 4. 👷 Staff Module (The Operational App)
Streamlined interface for internal staff members to handle daily operations.
- **Focus Areas**:
  - **Active Orders**: Managing pending and in-progress orders.
  - **Returns Queue**: Handling returned items and processing refunds.
  - **Inventory Tasks**: Physical stock checks and updates.
  - **Support**: Quick response to user inquiries.

---

## 🎨 Design System & UI Patterns

### Consistency & Aesthetics
- **Color Palette**: Uses `var(--saathi-green)` as the primary brand color, complemented by Slate/Gray scales for professional data-heavy views and pure black/white for the user app.
- **Micro-Animations**: Uses `animate-in`, `fade-in`, and `zoom-in` classes for smooth page transitions and element entries.
- **Glassmorphism**: Subtle backdrop blurs in the Navbar and Modals for a premium look.

### Reusable Components (`src/common`)
- **Common Layouts**: Pre-defined structures for different views.
- **Contexts**: `ReturnRequestsContext`, `ThemeContext`, etc., shared across multiple modules.

---

## 🔐 State & Data Flow
- **Authentication**: Role-specific `AuthContext` (e.g., `AdminAuthContext`, `UserAuthContext`). Currently uses a robust Mock system with `localStorage` persisted state, ready for API integration.
- **State Partitioning**: Cart state, Location state, and Search state are decoupled to improve performance and maintainability.
- **Caching**: Local search history and recently viewed items are cached in the browser's persistent storage.

---

## 📂 Directory Structure Highlights
```text
src/
├── modules/
│   ├── admin/      # Admin pages, components, and logic
│   ├── user/       # Customer-facing app logic
│   ├── vendor/     # Vendor dashboard
│   └── staff/      # Staff/Operations panel
├── common/         # Shared utilities and components
├── assets/         # Global styles and static files
├── routes/         # Central routing configuration
└── store/          # Global state management
```

## 🚀 Getting Started
1. **Installation**: `npm install`
2. **Development**: `npm run dev`
3. **Building**: `npm run build`

---
*Documentation generated for SaathiGro Frontend Development Team.*
