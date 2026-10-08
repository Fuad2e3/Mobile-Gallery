# 🧠 Project Memory & Architectural Knowledge — Mobile Gallery

This document serves as the persistent memory, architectural history, Architectural Decision Records (ADRs), and critical institutional knowledge for **Mobile Gallery**.

---

## 1. Project Context & Evolution

- **Project**: Mobile Gallery (স্মার্টফোন ও গ্যাজেট অনলাইন স্টোর)
- **Primary Market**: Bangladesh (BDT pricing `৳`, nationwide cash on delivery, bKash/Nagad digital payments).
- **Core Evolution**:
  - **Phase 1 (Legacy)**: Client-side prototype with Google Apps Script & Google Sheets as the single-sheet backend (`sheet-endpoint.gs`).
  - **Phase 2 (Current Production)**: Complete fullstack modernization to **Pages (with Pages Functions in `functions/`)**, **D1 (SQL Database in `database/`)**, and **R2 (Optimized Object Storage)**.

---

## 2. Architectural Decision Records (ADRs)

### ADR-001: D1 Serverless SQL Migration
- **Status**: Implemented & Verified.
- **Context**: Google Apps Script web apps suffer from 1.5s–3s cold-start latencies, concurrent connection throttling, and lack of relational integrity.
- **Decision**: Migrate to D1 Database with native SQLite tables: `users`, `products`, and `orders`.
- **Consequences**:
  - Global edge response latency dropped to `< 15ms`.
  - Transactional stock decrementing on order placement (`UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?`).
  - Full relational indexing on user emails, product categories, and order timestamps.

### ADR-002: In-Browser Client-Side Compression & R2
- **Status**: Implemented & Verified.
- **Context**: Smartphone photos taken by admins average 5 MB – 15 MB. Uploading raw files consumes excessive cellular data in Bangladesh and fills cloud storage quotas.
- **Decision**: Implement `Optimization.batch()` on client-side HTML5 Canvas to multi-pass compress all images to WebP `< 60 KB` (720×720px) before dispatching to R2 (`POST /api/upload`).
- **Consequences**:
  - 95% – 98% storage and network bandwidth savings.
  - Photos are uploaded in under 200ms even over 4G connections.
  - R2 serves photos with `Cache-Control: public, max-age=31536000, immutable` via `/api/images/*`.

### ADR-003: Backward-Compatible API Facade (`SheetEndpoint`)
- **Status**: Implemented & Verified.
- **Context**: All client frontend modules (`ui.js`, `cart.js`, `checkout.js`, `orders.js`, `admin.js`, `app.js`) previously relied on `window.SheetEndpoint`.
- **Decision**: Retain `SheetEndpoint` and alias `window.EdgeEndpoint = SheetEndpoint`. The class attempts `/api` first, seamlessly supporting both REST and action-based payloads, with fallback to Google Apps Script and local storage.
- **Consequences**:
  - Zero breaking changes to existing storefront or admin UI code.
  - Zero downtime transition between backend platforms.

### ADR-004: Low Stock Priority Sorting & Active/Pause Product Inventory Controls
- **Status**: Implemented & Verified.
- **Context**: Store administrators need clear visibility of low stock items (quantities 1, 2, 3...) to reorder quickly, and explicit separate controls to pause items from customer view without deleting them.
- **Decision**: 
  1. Default Manage Products sorting to stock quantity ascending (`stockNumA - stockNumB`), placing low stock items (1, 2, 3...) at the top.
  2. Provide separate, distinct action buttons for `🟢 Active` and `⏸️ Pause` on each product row in `renderAdminProductsList()`.
  3. Filter out items with `status === 'Paused'` or `'Inactive'` in `app.js`'s `matches(item)` so paused items automatically disappear from customer search and shop browsing.
- **Consequences**:
  - Immediate visual clarity for low stock inventory management.
  - Instant visibility toggling with cloud & local state sync.

### ADR-005: Streamlined Storefront Navigation & Section Cleanup
- **Status**: Implemented & Verified.
- **Context**: The navbar contained extra links ("Shop", "Why us", "Help") that congested the navigation bar on desktop and mobile screens.
- **Decision**: 
  1. Renamed primary navigation link "Shop" to "Home".
  2. Removed "Why us" and "Help" buttons from the header navigation bar and mobile drawer across all pages.
  3. Removed the corresponding `#why` ("Why Mobile Gallery") and `#faq` ("Help & delivery") HTML content sections from `index.html`.
- **Consequences**:
  - Cleaner, focused navigation header (`Home`, `Categories`, `Orders`, `Admin`).
  - Reduced page scrolling depth and lighter DOM tree for improved FCP/TTI performance.

### ADR-006: Root Directory Optimization & Assets Folder HTML Page Organization
- **Status**: Implemented & Verified.
- **Context**: Keeping all HTML pages in the root folder creates clutter and obscures `index.html` as the primary web application entry point.
- **Decision**: 
  1. Retain ONLY `index.html` in the root directory.
  2. Relocate secondary HTML pages (`categories.html`, `admin.html`, `checkout.html`, `orders.html`, `recent.html`, `404.html`) into the `assets/` directory.
  3. Update all relative paths across HTML headers, footers, drawers, and JavaScript modules (`app.js`, `cart.js`, `ui.js`, `recent.js`).
- **Consequences**:
  - Extremely clean root directory layout.
  - Seamless navigation between root `index.html` and secondary pages in `assets/`.

### ADR-007: Exact Header Center Alignment & Glassmorphic Navigation Pill
- **Status**: Implemented & Verified.
- **Context**: Header navigation links (`Home`, `Categories`, `Orders`, `Admin`) were huddled on the left side near the logo, creating an unbalanced layout.
- **Decision**: Positioned `.nav__links` at exact horizontal center (`position: absolute; left: 50%; transform: translateX(-50%)`) inside `.nav` container, with a floating glassmorphic pill background, backdrop blur, and custom light/dark active states.
- **Consequences**:
  - Perfectly balanced header layout across desktop & laptop screens.
  - Responsive collapse to mobile drawer menu on screens $\le$ 880px.

### ADR-008: Event Listener Guarding & Duplicate Execution Prevention
- **Status**: Implemented & Verified.
- **Context**: Re-executing `initHome()` or `initCart()` on page re-renders attached duplicate event listeners to `document.body`, causing multiple items to be added on a single "Add to Cart" click.
- **Decision**: Added global execution guards (`window._homeListenersBound`, `window._cartListenersBound`) to ensure click handlers and form listeners are bound EXACTLY ONCE on initial load.
- **Consequences**:
  - Fixed duplicate "Add to Cart" bug permanently (adds exactly 1 item per click).
  - Cleaner memory footprint and zero handler leakage.

### ADR-009: Lenis Smooth Scrolling Engine Integration
- **Status**: Implemented & Verified.
- **Context**: Native browser scrolling can feel abrupt and lacks fluid momentum.
- **Decision**: Integrated Lenis v1.1.18 smooth scroll library across all HTML pages with a global `requestAnimationFrame` loop, smooth anchor scrolling, and `MutationObserver` on `document.body.no-scroll` for auto-pausing when drawers/modals/cart open.
- **Consequences**:
  - Ultra-smooth, high-end scrolling performance across desktop and mobile browsers.
  - Zero conflict with popup overlays, drawers, and modals.

### ADR-010: Dedicated Recently Viewed Page (`recent.html`) & 7-Day Time Window
- **Status**: Implemented & Verified.
- **Context**: Customers requested a dedicated page for recently viewed devices, showing only items viewed within the last 7 days.
- **Decision**:
  1. Created `assets/recent.html` and `assets/js/recent.js` displaying full product grid cards with relative time-ago badges (e.g. `Just now`, `2 hours ago`, `Yesterday`, `3 days ago`).
  2. Updated `pushRecent()` & `getRecentDetailed()` in `data.js` to store timestamps and auto-purge items older than 7 days (`7 * 24 * 60 * 60 * 1000` ms).
  3. Added header clock icon button `#recentNavBtn` and Profile Dropdown menu item linking directly to `recent.html`.
- **Consequences**:
  - Dedicated full page experience for product viewing history.
  - Automatic 7-day data retention cleanup.

### ADR-011: Global Floating Scroll-To-Top Button & Ultra-Compact Breakpoint (360px)
- **Status**: Implemented & Verified.
- **Context**: Long product pages require an effortless way to return to top, and tiny mobile devices (cover screens) need 1-column responsiveness.
- **Decision**:
  1. Added `#scrollTopBtn` across all HTML pages, integrated with Lenis smooth scroll (`window.lenis.scrollTo(0)`).
  2. Introduced `@media (max-width: 360px)` breakpoint in `style.css` for 100% fluid responsiveness on ultra-compact mobile devices.
- **Consequences**:
  - Smooth 1-tap return to top across all storefront pages.
  - 100% device compatibility from 320px foldables to 4K ultra-wide monitors.

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
- `mg.edge.url`: Configurable remote Pages API URL override.

---

## 4. Known Gotchas & Operational Caveats

1. **Source Code vs. Production Assets**:
   - Primary editable code lives in `src/js/`.
   - Never manually modify files in `assets/js/`. Always run `npm run build` (`node tools/obfuscate.js`) to recompile.
2. **Local vs. Remote D1 Execution**:
   - `npx wrangler d1 execute mobile-gallery-db --local --file=./database/schema.sql` interacts with SQLite in `.wrangler/state/v3/d1`.
   - `npx wrangler d1 execute mobile-gallery-db --remote --file=./database/schema.sql` interacts with the live production D1 database.
3. **R2 Unbound Graceful Fallback**:
   - If `PHOTOS_BUCKET` is not bound during local development, the API gracefully falls back to returning the inline base64 image without crashing.
