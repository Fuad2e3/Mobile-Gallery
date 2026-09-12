# Mobile Gallery

An online **store** for phones, tablets, laptops and gadgets — built as a fast,
dependency-free static site.

The admin stocks the catalogue; customers browse, add to cart and order.

**Pages:** `index.html` (storefront) · `checkout.html` (cart &amp; order) ·
`orders.html` (order history) · `admin.html` (add products) · `404.html`

---

## What it does

**Storefront — `index.html`**
- 24 products across phones, tablets, laptops, watches, audio, gaming and accessories
- Multi-word search across name, brand, category, chipset and description
- Filter by category, brand, condition, max budget, in-stock and on-sale — counts come from the data
- Sort by recommended, new arrivals, price, biggest discount or popularity
- Grid / list layouts, removable filter chips, and "show more" paging
- Star ratings and a live stock pill on every card (`In stock` / `Only 2 left` / `Out of stock`)
- Wishlist saved in `localStorage`, with a wishlist-only view
- Product detail modal with full specs, warranty, delivery terms and Buy now
- Quantity stepper in the modal, and four related products from the same category
- A "recently viewed" strip that appears once you have opened a couple of products

**Cart &amp; checkout — `checkout.html`**
- Slide-in cart on every page: quantity steppers, remove, live subtotal
- **Quantity is capped at available stock** — the `+` button disables at the limit
- Free delivery over ৳30,000, otherwise a flat ৳120, calculated live
- Delivery form with inline validation, including Bangladeshi mobile number format
- Four payment methods: cash on delivery, bKash, Nagad and card
- Order confirmation with a reference number; orders are saved to `localStorage`

**Order history — `orders.html`**
- Every order placed, newest first, with a three-stage delivery
  tracker (Pending → Confirmed → Delivered) synced live with Google Sheet
- Order totals, delivery address and payment method on each
- **Order again** rebuilds the cart, skipping anything no longer stocked
- Prints cleanly: a dedicated print stylesheet strips the chrome down to the receipt

**Admin — `admin.html`**
- Fixed admin credentials authentication (`admin@mobilegallery.com` / `admin123`)
- **Multi-Photo Product Upload**: Drag & drop or select 1 to 5 photos, automatically compressed in the browser via HTML5 canvas (zero server load)
- **Edit & Delete Any Product**: Live editing mode and deletion with direct synchronization to Google Sheet
- **Customer Management Tab**: View all registered customers from Google Sheet and toggle user status (`Active`, `Inactive`, `Suspended`)
- **Orders & Confirmation**: View customer orders, confirm orders with 1-click, and update delivery stages
- **Single Google Sheet Synchronization**: Seamlessly syncs Users (Cols A-G), Products (Cols I-Y), and Orders (Cols AA-AM) in one master spreadsheet

**User Accounts & Auth**
- Top-right profile icon and dropdown menu on every page
- Guest browsing allowed across all catalogue items
- Mandatory account creation/login before purchasing
- Real-time session synchronization across cart and checkout

**Everything else**
- Light and dark themes, remembered between visits, defaulting to the OS preference
- Responsive from 360px, with a mobile nav drawer and slide-in filter panel
- Prices in Taka using the lakh grouping (৳1,52,000)
- Scroll reveals and animated counters, with `prefers-reduced-motion` respected
- Overlays trap Tab and return focus to whatever opened them when closed

## Security note

Anything typed into the admin form is stored and later re-rendered in the shop, the
cart and the checkout summary. All of it is escaped through `esc()` before being
interpolated into HTML, so markup entered into a product name is displayed as text and
never becomes live DOM. This is verified by a test that submits an `<img onerror=...>`
payload and asserts nothing executes at any stage.

## Device artwork

There are **no image files**. Every phone, tablet, laptop, watch, headphone, console and
charger illustration is inline SVG generated at runtime by `deviceArt()` in
`assets/js/data.js`, coloured from a named palette on each product. That keeps the site
tiny, instant to load and fully working offline.

## Running it

No build step and no dependencies — open `index.html` in a browser.

To serve it locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

To publish on GitHub Pages: **Settings → Pages → Deploy from branch → `main` / root**.

## Project layout

```
index.html             storefront: hero, categories, catalogue, FAQ, footer
checkout.html          order summary, delivery details, payment, confirmation
orders.html            order history with delivery tracking and reorder
404.html               not-found page (GitHub Pages serves this automatically)
admin.html             add products, with live preview and price hint

assets/css/style.css   design tokens, components, light + dark themes, responsive rules
assets/js/data.js      catalogue, formatting, escaping, SVG artwork, storage helpers
assets/js/ui.js        icons, theme, header, wishlist, toasts, ratings, stock pills
assets/js/cart.js      cart state, stock caps, delivery maths, cart panel
assets/js/app.js       search, filtering, sorting, product grid, detail modal
assets/js/checkout.js  order summary, validation, order placement
assets/js/orders.js    order history, delivery tracker, reorder
assets/js/admin.js     product form, live preview, price hint, product list
tools/sheet-endpoint.gs Google Apps Script 1-sheet database backend
tools/sheet-endpoint.js Central client API wrapper with local fallback
tools/rules.md         Master rules, architecture, and tracking log
```

## Backend & Database Architecture

Mobile Gallery uses a **Google Sheet** as its backend database via **Google Apps Script** (`tools/sheet-endpoint.gs`):
- **Single-Sheet Layout**: `Users` (Cols A–G), `Products` (Cols I–Y), and `Orders` (Cols AA–AM) live in one sheet with independent row insertions.
- **Fixed Admin Portal**: Secure login at `admin.html` with fixed credentials (`admin@mobilegallery.com` / `admin123`).
- **Live Inventory & Auto-Stock Decrement**: Purchasing decrements available stock directly in Column W of the Google Sheet.
- **3-Stage Order Lifecycle**: Orders progress through `Pending` → `Confirmed` → `Delivered`.
- **Source Protection**: Production scripts in `assets/js/` are compiled and obfuscated via `tools/obfuscate.js`.
