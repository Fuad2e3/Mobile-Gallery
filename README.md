# Mobile Gallery

A modern, high-performance, and responsive e-commerce platform for smartphones, tablets, and gadgets.

Built for global edge speed with **Pages**, **Pages Functions**, **D1 SQL Database**, and **R2 Object Storage**.

---

## 🚀 Features

- **Storefront**: Browse products, real-time live search, category filtering, dark/light theme, and shopping cart.
- **Admin Dashboard**: Real-time product creation & editing, stock decrement, customer account management, and order fulfillment.
- **Checkout & Tracking**: Instant checkout flow with address validation and live order status tracking.
- **Ultra-low Photo Storage (R2)**: In-browser automatic compression from raw 5–15 MB photos to crisp `<60 KB` WebP, stored directly in R2.
- **Cloud Database (D1)**: Native serverless SQLite tables for `users`, `products`, and `orders` with zero cold-starts.

---

## 🛠️ Tech Stack

- **Frontend**: HTML5, Modern CSS (Design Tokens, Responsive CSS Grid/Flexbox), Vanilla JavaScript (ES6+ Modules)
- **Edge Backend**: Edge Pages Functions (in `functions/api/`)
- **Database**: D1 Database (Tables: `users`, `products`, `orders`)
- **Media Storage**: R2 Bucket (`mobile-gallery-photos`) with immutable edge caching
- **Fallback / Local Cache**: Browser `localStorage` for instant offline and slow-network resilience

---

## 📁 Project Structure

```
├── assets/                  # Production-compiled assets
│   ├── css/style.css        # Design tokens & core stylesheet
│   └── js/                  # Obfuscated production scripts
├── database/                # D1 Database Schemas & Seeds
│   ├── schema.sql           # Database tables schema (users, products, orders)
│   └── seed.sql             # Built-in catalogue & admin seed data
├── docs/                    # Complete Project Documentation
│   ├── ARCHITECTURE.md      # System topology & dataflow
│   ├── DESIGN.md            # Design system, palettes & 3D tokens
│   ├── EDGE_DEPLOYMENT.md   # Step-by-step deployment manual
│   ├── MEMORY.md            # Institutional knowledge & ADRs
│   ├── PRD.md               # Product Requirements Document & API contracts
│   ├── RULES.md             # Code standards & engineering invariants
│   └── TASKS.md             # Development milestones & roadmap
├── functions/               # Pages Functions (Edge Backend)
│   └── api/
│       ├── [[path]].js      # Catch-all Edge API handler for Pages
│       └── _api.js          # REST & Action router for D1 and R2
├── src/                     # Source Code (Single source of truth)
│   └── js/                  # Modular Vanilla ES6+ modules
├── tests/                   # Automated Test Suite
│   ├── check-project.mjs    # HTML & static asset integrity validator
│   ├── verify-suite.mjs     # Storefront catalogue, cart & UI logic suite
│   ├── test-docs-integrity.mjs # Documentation & contract auto-verifier
│   └── test-edge-api.mjs    # Pages Functions, D1 & R2 integration test
├── tools/                   # Build & Automation Tooling
│   ├── obfuscate.js         # Production compiler
│   └── generate-seed.js     # D1 seed generator
├── wrangler.toml            # Edge deployment & bindings configuration
├── package.json             # Project scripts & dev dependencies
├── index.html               # Main Storefront Landing Page
└── assets/                  # Production-compiled assets & secondary HTML pages
    ├── 404.html             # 404 Not Found Page
    ├── admin.html           # Admin Portal & Inventory Dashboard
    ├── categories.html      # Categories & Full Catalogue Page
    ├── checkout.html        # Checkout & Payment Pipeline
    ├── orders.html          # Order Tracking & Status Page
    ├── recent.html          # Dedicated Recently Viewed Devices Page (7-day window)
    ├── css/style.css        # Core stylesheet & design tokens
    └── js/                  # Obfuscated production scripts
```

---

## ⚡ Quick Start & Deployment

### 1. Install & Test
```bash
npm install
npm test
```

### 2. Setup D1 & R2
```bash
# Create D1 database & copy database_id to wrangler.toml
npx wrangler d1 create mobile-gallery-db

# Initialize tables and seed products
npx wrangler d1 execute mobile-gallery-db --remote --file=./database/schema.sql
npx wrangler d1 execute mobile-gallery-db --remote --file=./database/seed.sql

# Create R2 bucket for optimized photos
npx wrangler r2 bucket create mobile-gallery-photos
```

### 3. Deploy to Pages
```bash
# Deploy to Pages
npx wrangler pages deploy . --project-name=mobile-gallery
```

Detailed guide: see [EDGE_DEPLOYMENT.md](docs/EDGE_DEPLOYMENT.md).

---

## 🔐 Admin Credentials

- **Email**: `admin@mobilegallery.com`
- **Password**: `admin123`
