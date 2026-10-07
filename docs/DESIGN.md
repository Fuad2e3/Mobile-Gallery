# 🎨 Design System & UI Specifications — Mobile Gallery

This document outlines the visual language, design token architecture, typography hierarchy, 3D interactive physics, and component specifications of **Mobile Gallery**.

---

## 1. Design Philosophy

Mobile Gallery is designed around four core visual principles:
1. **Premium Tactility**: 3D interactive tilt physics, subtle layered shadows, and physical spring animations that make every device feel tangible.
2. **Dynamic Brand Personas**: Products feature bespoke color palettes (`PALETTES`) rendering unique gradient backdrops for each phone or gadget.
3. **Seamless Dual Theme**: Natural switching between radiant light mode and sleek deep-slate dark mode.
4. **Information Density with Clarity**: High-speed scannability for Bangladeshi shoppers with prominent Taka (`৳`) pricing, condition grading, and official warranty indicators.

---

## 2. Design Token System

### 2.1 Color Tokens
The interface utilizes structured CSS custom properties defined in `assets/css/style.css`:

```css
:root {
  /* Brand Primary */
  --brand-50:  #eef2ff;
  --brand-100: #e0e7ff;
  --brand-500: #6366f1;
  --brand-600: #4f46e5;
  --brand-700: #4338ca;

  /* Neutrals (Light Mode) */
  --bg:        #f8fafc;
  --surface:   #ffffff;
  --surface-2: #f1f5f9;
  --border:    #e2e8f0;
  --ink:       #0f172a;
  --muted:     #64748b;

  /* Semantics */
  --emerald:   #10b981; /* Success / Brand New / In Stock */
  --rose:      #ef4444; /* Badges / Deals / Deletion */
  --amber:     #f59e0b; /* Warnings / Fair condition */
  --sky:       #0284c7; /* Official warranty */
}

[data-theme="dark"] {
  --bg:        #0b0f17;
  --surface:   #131b26;
  --surface-2: #1b2432;
  --border:    #243042;
  --ink:       #f8fafc;
  --muted:     #94a3b8;
}
```

### 2.2 Device Palettes (`PALETTES`)
Every product card dynamically generates artwork driven by the device's finish:
- `midnight`: `#1e293b` ➔ `#0f172a`
- `titanium`: `#8d8d92` ➔ `#5b5b60`
- `ocean`: `#0ea5e9` ➔ `#1e40af`
- `violet`: `#8b5cf6` ➔ `#4c1d95`
- `sunset`: `#fb7185` ➔ `#c026d3`
- `emerald`: `#34d399` ➔ `#047857`
- `gold`: `#fbbf24` ➔ `#b45309`
- `graphite`: `#4b5563` ➔ `#1f2937`
- `cream`: `#f5e6d3` ➔ `#c8a882`
- `cherry`: `#f43f5e` ➔ `#881337`
- `mint`: `#5eead4` ➔ `#0f766e`
- `cobalt`: `#6366f1` ➔ `#312e81`

### 2.3 3D Physics & Motion Tokens
```css
:root {
  --perspective-3d: 1200px;
  --shadow-3d: 0 20px 35px -10px rgba(15, 23, 42, 0.12),
               0 1px 3px 0 rgba(15, 23, 42, 0.05);
  --ease-spring: cubic-bezier(0.175, 0.885, 0.32, 1.275);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --r-sm: 8px;
  --r-md: 14px;
  --r-lg: 20px;
  --r-xl: 28px;
  --r-full: 9999px;
}
```

---

## 3. Typography Hierarchy

The typography uses **Plus Jakarta Sans** with clean proportional scaling:

| Element | Size | Weight | Line Height | Usage |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | 2.5rem – 3.25rem | 800 (ExtraBold) | 1.15 | Main storefront landing hook |
| **Section Heading** | 1.75rem – 2.0rem | 700 (Bold) | 1.25 | Catalogue & category dividers |
| **Card Title** | 1.05rem – 1.15rem | 600 (SemiBold) | 1.35 | Product titles |
| **Body Text** | 0.95rem | 400 (Regular) | 1.55 | Descriptions, reviews |
| **Price Tag** | 1.25rem | 800 (ExtraBold) | 1.0 | Product pricing (`৳152,000`) |
| **Micro Badge** | 0.72rem | 700 (Bold) | 1.0 | Condition pills, stock tags |

---

## 4. Key Component Specifications

### 4.1 Product Card (`.product-card`)
- **3D Interactive Behavior**: Hovering triggers an affine 3D transformation (`transform: translateY(-6px) scale(1.01)` with `--shadow-3d`).
- **Device Mockup**: SVG-rendered device with camera cutouts, speaker grills, and dynamic dual-gradient backgrounds.
- **Metadata Ribbons**:
  - Condition Grade: "Brand New" (Emerald), "Like New" (Brand Indigo), "Good" (Sky), "Fair" (Amber).
  - Official Warranty Badge: Highlighted with shield icon.
  - Quick Add to Cart: Micro-animated button with count badge feedback.

### 4.2 Shopping Cart Drawer (`.cart`)
- Slide-in glassmorphic panel with spring easing.
- Progress bar for free nationwide shipping threshold (`৳30,000`).
- Line item quantity stepper (`+` / `-`) with instant subtotal recalculation.

### 4.3 Image Upload Preview Strip (`#adminImagePreviewStrip`)
- Responsive thumbnail grid for up to 5 photos per product.
- Close buttons (`✕`) allowing individual photo removal from the upload draft.
- Real-time compression telemetry showing percentage savings and resulting WebP byte size.

---

## 5. Responsive Breakpoint Matrix

| Viewport | Range | Layout Strategy |
| :--- | :--- | :--- |
| **Mobile** | `< 640px` | 1-column product stack, sticky bottom cart bar, drawer navigation. |
| **Tablet** | `640px – 1024px` | 2-column product grid, topbar filter segmentation. |
| **Desktop** | `1024px – 1440px` | 3 to 4-column product grid, full side-by-side admin panels. |
| **Wide** | `> 1440px` | Max container wrap at `1280px` with centered alignment. |
