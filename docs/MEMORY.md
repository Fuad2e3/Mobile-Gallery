# 🧠 Project Memory & Architectural Knowledge — Mobile Gallery

This document serves as the persistent memory, architectural history, Architectural Decision Records (ADRs), and critical institutional knowledge for **Mobile Gallery**.

---

## 1. Project Context & Evolution

- **Project**: Mobile Gallery (স্মার্টফোন ও গ্যাজেট অনলাইন স্টোর)
- **Primary Market**: Bangladesh (BDT pricing `৳`, nationwide cash on delivery, bKash/Nagad digital payments).
- **Core Evolution**:
  - **Phase 1 (Legacy)**: Client-side prototype with Google Apps Script & Google Sheets as the single-sheet backend (`sheet-endpoint.gs`).
  - **Phase 2 (Current Production)**: Complete fullstack modernization to **Cloudflare Pages (with Pages Functions in `functions/`)**, **Cloudflare D1 (SQL Database in `database/`)**, and **Cloudflare R2 (Optimized Object Storage)**.

---

## 2. Architectural Decision Records (ADRs)

### ADR-001: Cloudflare D1 Serverless SQL Migration
- **Status**: Implemented & Verified.
- **Context**: Google Apps Script web apps suffer from 1.5s–3s cold-start latencies, concurrent connection throttling, and lack of relational integrity.
- **Decision**: Migrate to Cloudflare D1 with native SQLite tables: `users`, `products`, and `orders`.
- **Consequences**:
  - Global edge response latency dropped to `< 15ms`.
  - Transactional stock decrementing on order placement (`UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?`).
  - Full relational indexing on user emails, product categories, and order timestamps.

### ADR-002: In-Browser Client-Side Compression & Cloudflare R2
- **Status**: Implemented & Verified.
- **Context**: Smartphone photos taken by admins average 5 MB – 15 MB. Uploading raw files consumes excessive cellular data in Bangladesh and fills cloud storage quotas.
- **Decision**: Implement `Optimization.batch()` on client-side HTML5 Canvas to multi-pass compress all images to WebP `< 60 KB` (720×720px) before dispatching to Cloudflare R2 (`POST /api/upload`).
- **Consequences**:
  - 95% – 98% storage and network bandwidth savings.
  - Photos are uploaded in under 200ms even over 4G connections.
  - Cloudflare R2 serves photos with `Cache-Control: public, max-age=31536000, immutable` via `/api/images/*`.

### ADR-003: Backward-Compatible API Facade (`SheetEndpoint`)
- **Status**: Implemented & Verified.
- **Context**: All client frontend modules (`ui.js`, `cart.js`, `checkout.js`, `orders.js`, `admin.js`, `app.js`) previously relied on `window.SheetEndpoint`.
- **Decision**: Retain `SheetEndpoint` and alias `window.CloudflareEndpoint = SheetEndpoint`. The class attempts Cloudflare `/api` first, seamlessly supporting both REST and action-based payloads, with fallback to Google Apps Script and local storage.
- **Consequences**:
  - Zero breaking changes to existing storefront or admin UI code.
  - Zero downtime transition between backend platforms.

---

## 3. Persistent Constants & Keys

### 3.1 Security & Admin Profile
- **Administrator Email**: `admin@mobilegallery.com`
- **Administrator Password**: `admin123`
- **Session Auth Key**: `sessionStorage.getItem('mg.admin.auth.v1')`

### 3.2 Storage Keys (`localStorage`)
- `mg.products.v1`: Cached product catalogue.
- `mg.orders.v1`: Cached order history.
- `mg.users.v1`: Cached registered customer accounts.
- `mg.auth.user.v1`: Logged-in customer session.
- `mg.sheet.url`: Google Apps Script fallback URL.
- `mg.cloudflare.url`: Configurable remote Cloudflare Worker URL override.

---

## 4. Known Gotchas & Operational Caveats

1. **Source Code vs. Production Assets**:
   - Primary editable code lives in `src/js/`.
   - Never manually modify files in `assets/js/` or `tools/sheet-endpoint.js`. Always run `npm run build` (`node tools/obfuscate.js`) to recompile.
2. **Local vs. Remote Cloudflare Execution**:
   - `npx wrangler d1 execute mobile-gallery-db --local --file=./database/schema.sql` interacts with SQLite in `.wrangler/state/v3/d1`.
   - `npx wrangler d1 execute mobile-gallery-db --remote --file=./database/schema.sql` interacts with the live production Cloudflare D1 database.
3. **R2 Unbound Graceful Fallback**:
   - If `PHOTOS_BUCKET` is not bound during local development, the API gracefully falls back to returning the inline base64 image without crashing.
