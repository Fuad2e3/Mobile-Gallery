# Mobile Gallery — Modern Smartphone & Gadget Online Store

A high-performance, responsive e-commerce web application for smartphones, gadgets, and accessories. Built with pure Vanilla JavaScript (ES6+), semantic HTML5, modern design tokens CSS, and a real-time Google Sheets backend API powered by Google Apps Script.

---

## 🌟 Key Features

### 🛍️ Storefront & Customer Experience
- **Interactive Catalogue**: Instant product search, multi-facet filtering (Brand, Category, Condition, Price, In-stock, On-sale), and sorting.
- **Product Details & High-Res Gallery**: Detailed specifications, multi-image carousel thumbnail viewer, and stock status indicators.
- **Cart & Checkout**: Slide-out cart panel, local storage persistence, free delivery calculator, order review, and seamless checkout.
- **User Authentication**: Built-in customer account registration and login modal, auto-filling customer delivery details.
- **Real-time Order Tracking**: Live 3-stage delivery progress tracker (`Pending` ➔ `Confirmed` ➔ `Delivered`) on `orders.html` synced automatically from the database.
- **Dark / Light Theme**: Dynamic theme switcher with persistent user preference in `localStorage`.

### 🛡️ Admin Portal (`admin.html`)
- **Direct 1-Click Access**: Instant access to management dashboard without cumbersome setup.
- **Product Management**: Add, edit, and delete products with live preview and stock status tracking.
- **Ultra-Compact Photo Optimizer**: In-browser multi-pass canvas compression (WebP/JPEG <60 KB) saving 95–98% cloud storage when uploading to Google Drive.
- **Order Processing**: Live customer orders table with instant 1-click status actions (`Confirm Order`, `Cancel`, `Deliver`).
- **Customer Access Control**: View registered customers and manage account status (`Active`, `Inactive`, `Suspended`).
- **Live Database API Monitor**: Real-time connection health pill, latency checker (`ms`), and 1-click full database sync.

---

## 📐 Architecture & Single-Sheet Database Layout

Mobile Gallery features an innovative **Single Google Sheet Architecture** where Users, Products, and Orders are organized into independent column partitions within a single spreadsheet:

```
┌───────────────────────────────────────┬──────┬─────────────────────────────────────────────────────────┬──────┬────────────────────────────────────────────────────────┐
│ COLUMNS A - G: USERS (Navy Blue)      │ COL H│ COLUMNS I - Z: PRODUCTS (Forest Green)                  │COL AA│ COLUMNS AB - AN: ORDERS (Royal Purple)                 │
├───────────────────────────────────────┼──────┼─────────────────────────────────────────────────────────┼──────┼────────────────────────────────────────────────────────┤
│ User ID, Registered At, Name, Email,  │  |   │ Product ID, Created At, Title, Brand, Category, Price,  │  |   │ Order Ref, Placed At, Name, Email, Phone, Address,     │
│ Phone, Password, User Status          │  ➔   │ OldPrice, Condition, Storage, RAM, Battery, Chip, Color,│  ➔   │ Area, City, Payment, Items, Total, Details, Status     │
│                                       │      │ Warranty, Stock, Description, Product Status, PhotosLink│      │                                                        │
└───────────────────────────────────────┴──────┴─────────────────────────────────────────────────────────┴──────┴────────────────────────────────────────────────────────┘
```

- **Columns A – G**: Users (ID, timestamp, credentials, status).
- **Column H**: Partition separator (`── PRODUCTS ➔ ──`).
- **Columns I – Z**: Products (catalog data, pricing, specs, stock count, description, and Drive photo links).
- **Column AA**: Partition separator (`── ORDERS ➔ ──`).
- **Columns AB – AN**: Orders (reference code, delivery info, item lines, total amount, and 3-stage status).

---

## 📁 Project Structure

```
Mobile-Gallery/
├── index.html              # Main storefront catalogue & browsing page
├── admin.html              # Admin dashboard & database management portal
├── checkout.html           # Customer delivery details & order placement
├── orders.html             # Order history & live delivery tracker
├── 404.html                # Custom branded 404 error page
├── assets/
│   ├── css/
│   │   └── style.css       # Master stylesheet (design tokens, layout, themes)
│   └── js/                 # Production compiled & protected scripts
│       ├── admin.js
│       ├── app.js
│       ├── cart.js
│       ├── checkout.js
│       ├── data.js
│       ├── optimization.js
│       ├── orders.js
│       ├── sheet-endpoint.js
│       └── ui.js
├── src/
│   └── js/                 # Clean, readable source code modules
├── tools/
│   ├── obfuscate.js        # Production compiler & code protection tool
│   ├── check-project.js    # Link, script & DOM ID integrity validator
│   ├── inject-endpoint.py  # Automated CI/CD deployment URL injector
│   ├── rules.md            # Master development rules & changelog
│   └── sheet-endpoint.gs   # Google Apps Script single-sheet backend code
└── README.md
```

---

## 🚀 Getting Started

### Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/Fuad2e3/Mobile-Gallery.git
   cd Mobile-Gallery
   ```
2. Open `index.html` in your favorite browser (or use VS Code Live Server / `npx serve`).

### Building Production Scripts
Whenever changes are made to `src/js/`, recompile production assets with:
```bash
node tools/obfuscate.js
```

---

## 📄 License
Copyright © 2026 Mobile Gallery. All rights reserved.
