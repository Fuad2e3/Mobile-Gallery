# 📄 Product Requirements Document (PRD) — Mobile Gallery

This document specifies the product requirements, user personas, functional features, and non-functional specifications for **Mobile Gallery**.

---

## 1. Executive Summary

**Mobile Gallery** is a high-speed, modern e-commerce web application engineered specifically for the smartphone and consumer electronics market in Bangladesh. It provides transparent condition grading (Brand New, Like New, Good, Fair), warranty tracking, nationwide Cash on Delivery, and live order tracking.

---

## 2. User Personas

| Persona | Description | Primary Needs |
| :--- | :--- | :--- |
| **Smart Consumer** | Shoppers looking for authentic new or certified pre-owned gadgets in Bangladesh. | Accurate device battery health, official warranty details, transparent pricing in BDT, fast mobile browsing. |
| **Store Administrator** | Business owner or inventory manager updating stock and processing orders. | Rapid product listing with automatic photo compression, real-time stock decrement, one-click order confirmation. |

---

## 3. Functional Requirements

### 3.1 Storefront (`index.html`, `categories.html`)
- **Category Navigation**: Segmented browsing for `Smartphones`, `Tablets`, `Laptops`, `Smartwatches`, `Audio`, `Gaming`, and `Accessories`.
- **Centered Navigation Pill Layout**: Centered navigation header (`Home`, `Categories`, `Orders`, `Admin`) with floating glassmorphic pill background.
- **Lenis Smooth Scroll & Floating Scroll-To-Top**: Fluid momentum smooth scroll globally, with auto-pausing on open drawers/modals and 1-tap floating scroll-to-top button (`#scrollTopBtn`).
- **Live Search & Filter**: Real-time multi-attribute query engine filtering title, brand, chip, and condition without page reload.
- **Product Details Modal**: Displays detailed device specs (Display, Chipset, Camera, Battery Health, Warranty, Official Box contents).
- **Wishlist Engine**: Persistent client-side favorites toggle with topbar badge counter.
- **Theme Switcher**: Instant light/dark mode switching with persistent user preference.

### 3.2 Recently Viewed Page (`recent.html`)
- **Dedicated Full Page View**: Accessible from header clock icon button (`#recentNavBtn`) and Profile Dropdown menu.
- **7-Day Rolling Window**: Filters and stores viewed products with timestamps, automatically purging items older than 7 days (`SEVEN_DAYS_MS`).
- **Relative Time-Ago Badges**: Displays `Just now`, `2 hours ago`, `Yesterday`, or `3 days ago` badges on device cards.
- **Clear History Option**: 1-tap option to clear recently viewed history.

### 3.2 Shopping Cart & Checkout (`cart.js`, `checkout.html`)
- **Cart Drawer**: Slide-out panel supporting quantity stepping (`+` / `-`) and item removal.
- **Free Shipping Incentive**: Real-time progress bar towards free nationwide delivery on orders over **৳30,000** (standard delivery ৳120).
- **Checkout Form**: Address collection with automated City/Division dropdowns and Bangladeshi phone number validation (`+8801...` or `01...`).
- **Payment Methods**: Cash on Delivery (COD), bKash, and Nagad payment options.
- **Order Generation**: Unique order reference generation (`MG-XXXXX`) and immediate dispatch to D1 database.

### 3.3 Customer Accounts & Order Tracking (`orders.html`)
- **Registration**: Form collecting Name, Email, Phone, and Password. Creates record in D1 `users` table.
- **Login & Access Control**: Validates credentials. Rejects authentication for accounts marked `Inactive` or `Suspended`.
- **Order Lookup**: Search by phone number or Order Reference showing live timeline status (`Pending` ➔ `Confirmed` ➔ `Delivered`).

### 3.4 Admin Portal (`admin.html`)
- **Secure Authentication**: Protected view requiring `admin@mobilegallery.com` / `admin123`.
- **Cloud Database Telemetry**: Live metric chips showing total active products, orders, users, and API latency.
- **Product Management**:
  - Add new products or edit existing catalogue items in-place with `Product Status` (`🟢 Active` / `⏸️ Paused`).
  - Low stock priority sorting (`1, 2, 3...` stock items shown first by default) with `⚠️ Low Stock` badges.
  - Separate, distinct action buttons for `🟢 Active` and `⏸️ Pause` on each product card for quick visibility control.
  - Automatic hiding of `Paused` items from customer storefront catalog browsing and search.
  - Manage Products filter toolbar with live counter chips (`All`, `⚡ Low Stock`, `🟢 Active`, `⏸️ Paused`), search bar, and sort dropdown.
  - Multi-photo drag & drop (up to 5 photos per listing).
  - Client-side WebP compression (<60 KB) and automatic R2 upload.
  - Delete product with instant cascade.
- **Order Fulfillment Pipeline**:
  - Live order queue displaying customer delivery address, contact phone, and line items.
  - One-click order confirmation (`Confirmed`), cancellation (`Cancelled`), or delivery (`Delivered`).
- **User Access Management**:
  - Real-time customer list from D1 database.
  - Instant status toggle (`Active`, `Inactive`, `Suspended`).

---

## 4. API & Data Contract Specifications

| Endpoint | Method | Action / Purpose | Request Body | Response Payload |
| :--- | :--- | :--- | :--- | :--- |
| `/api/ping` | GET | Health Check | None | `{ ok: true, databaseConnected, r2Connected }` |
| `/api/products` | GET | Fetch Products | None | `{ ok: true, products: [...] }` |
| `/api/products` | POST | Add / Update Product | Product Object | `{ ok: true, product }` |
| `/api/products/:id`| DELETE | Delete Product | None | `{ ok: true, id }` |
| `/api/orders` | GET | Fetch Orders | None | `{ ok: true, orders: [...] }` |
| `/api/orders` | POST | Place Order | Order Object | `{ ok: true, ref, order }` |
| `/api/orders/status`| POST | Update Order Status| `{ ref, status }` | `{ ok: true, status }` |
| `/api/users/register`| POST| Register Customer | `{ name, email, phone, password }` | `{ ok: true, user }` |
| `/api/users/login` | POST | Authenticate Customer | `{ email, password }` | `{ ok: true, user }` |
| `/api/upload` | POST | Upload Photo to R2 | `{ image: dataUrl, filename }` | `{ ok: true, url, key }` |
| `/api/images/*` | GET | Stream Photo from R2| None | Binary image stream with cache headers |

---

## 5. Non-Functional Requirements (NFR)

1. **Performance**: First Contentful Paint (FCP) `< 0.8s`, Time to Interactive (TTI) `< 1.2s` globally on global Edge CDN.
2. **Bandwidth Efficiency**: Product images compressed to `< 60 KB` WebP format before network transmission.
3. **Availability**: 99.99% uptime utilizing Pages and D1 serverless architecture.
4. **Security**: OWASP compliance, SQL injection elimination via D1 prepared statements, and honeypot spam protection.
