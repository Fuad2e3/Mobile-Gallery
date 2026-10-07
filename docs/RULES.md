# 📜 Engineering Rules & Code Guidelines — Mobile Gallery

This document establishes the mandatory engineering standards, architectural invariants, code organization rules, and operational protocols for all developers working on **Mobile Gallery**.

---

## 1. Architectural Invariants

1. **Pure Vanilla Core**: No heavyweight client frameworks (React, Vue, Angular). All UI logic must be implemented using modern Vanilla ES6+ JavaScript, native DOM APIs, and CSS Design Tokens.
2. **Edge-First Backend**: All server logic must be compatible with the Cloudflare Pages Functions edge runtime (V8 isolates without Node.js native dependencies).
3. **Dual-Layer Cache Resilience**: Storefront operations must function smoothly even during network drops by utilizing optimistic browser `localStorage` fallbacks.

---

## 2. Code Organization & Build Rules

### 2.1 Single Source of Truth (`src/js/`)
- All readable, editable source code lives strictly in `src/js/`:
  - `src/js/admin.js` — Admin dashboard and inventory controller.
  - `src/js/app.js` — Main storefront presentation controller.
  - `src/js/cart.js` — Shopping cart state and drawer controller.
  - `src/js/checkout.js` — Checkout form and address validator.
  - `src/js/data.js` — Static fallback catalog and device color palettes.
  - `src/js/optimization.js` — In-browser WebP canvas compression engine.
  - `src/js/orders.js` — Order history and status timeline viewer.
  - `src/js/sheet-endpoint.js` — Cloudflare Edge API and fallback client wrapper.
  - `src/js/ui.js` — Modal management, toasts, theme toggler, and customer auth.

### 2.2 Production Compilation (`assets/js/`)
- **NEVER** edit files in `assets/js/` or `tools/sheet-endpoint.js` directly.
- Whenever code in `src/js/` is changed, you **MUST** run:
  ```bash
  npm run build
  ```
  *(This triggers `node tools/obfuscate.js`, generating tamper-resistant, hex-escaped production builds and validating JavaScript syntax via `node -c`).*

---

## 3. Database & SQL Governance (Cloudflare D1)

1. **Prepared Statements Only**:
   - Every database query must use parameterized prepared statements:
     ```javascript
     // ✅ CORRECT:
     await env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first();

     // ❌ FORBIDDEN:
     await env.DB.prepare(`SELECT * FROM products WHERE id = '${productId}'`).first();
     ```
2. **Atomic Stock Decrementing**:
   - Order placement must execute stock decrements atomically alongside order insertion via `env.DB.batch([...])`.
3. **Schema Preservation**:
   - All schema changes must be documented in `database/schema.sql` and mirrored in `docs/ARCHITECTURE.md`.

---

## 4. Media & Photo Storage Rules (Cloudflare R2)

1. **Mandatory In-Browser Compression**:
   - Any image selected by an admin must pass through `Optimization.photo()` or `Optimization.batch()` before transmission to Cloudflare R2.
   - Resulting photos must be 720×720 WebP with an average file size under **60 KB**.
2. **Clean URL Persistence**:
   - The database must store clean edge URLs (`/api/images/products/mg_...webp`), never large raw Base64 data strings.
3. **Public Edge Caching**:
   - Images served via `/api/images/*` must retain strong caching headers:
     `Cache-Control: public, max-age=31536000, immutable`.

---

## 5. Security & Authentication Rules

1. **Fixed Administrator Account**:
   - Admin email: `admin@mobilegallery.com`
   - Admin password: `admin123`
   - Session validation uses `sessionStorage.getItem('mg.admin.auth.v1')`.
2. **Access Control Enforcement**:
   - When customer accounts are set to `Inactive` or `Suspended` by an administrator, login authentication must be immediately blocked at the `/api/users/login` endpoint.
3. **Spam Defense**:
   - Maintain honeypot fields (`website_url`, `_hp`) on all customer-facing submission forms.

---

## 6. Pre-Commit Quality Assurance

Before pushing changes to GitHub or deploying to Cloudflare, you must execute:
```bash
npm test
```
The test suite validates:
1. All HTML pages link to valid production assets and contain no duplicate IDs.
2. Storefront catalogue and cart subtotal calculation logic.
3. `SheetEndpoint` / `CloudflareEndpoint` client wrapper contracts.
4. Cloudflare Pages Functions API routes, D1 database queries, and R2 photo storage simulation.
5. Documentation integrity and architecture contracts.
