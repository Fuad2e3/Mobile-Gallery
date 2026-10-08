-- ============================================================================
-- Mobile Gallery — Edge D1 Database Schema
-- ============================================================================

-- 1. Users Table (Customer Accounts & Admin)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  registered_at TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  password TEXT NOT NULL,
  status TEXT DEFAULT 'Active' -- 'Active' | 'Inactive' | 'Suspended'
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- 2. Products Table (Smartphones, Tablets, Laptops, Gadgets)
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL,
  title TEXT NOT NULL,
  brand TEXT,
  category TEXT,
  price REAL NOT NULL,
  old_price REAL DEFAULT 0,
  condition TEXT,
  storage TEXT,
  ram TEXT,
  battery TEXT,
  display TEXT,
  chip TEXT,
  camera TEXT,
  color TEXT,
  warranty TEXT,
  stock INTEGER DEFAULT 0,
  description TEXT,
  status TEXT DEFAULT 'Active',
  images TEXT DEFAULT '[]',   -- JSON array of Edge R2 / public photo URLs
  rating REAL DEFAULT 5.0,
  reviews INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  tags TEXT DEFAULT '[]'       -- JSON array of tags: ["hot", "deal", "new", "official"]
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- 3. Orders Table (Customer Orders & Fulfillment)
CREATE TABLE IF NOT EXISTS orders (
  ref TEXT PRIMARY KEY,
  placed_at TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  address TEXT NOT NULL,
  area TEXT,
  city TEXT,
  payment_method TEXT,
  items_count INTEGER DEFAULT 1,
  total_amount REAL NOT NULL,
  items_details TEXT DEFAULT '[]', -- JSON array of line items [{ id, title, price, qty, ... }]
  order_status TEXT DEFAULT 'Pending' -- 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled'
);

CREATE INDEX IF NOT EXISTS idx_orders_placed_at ON orders(placed_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(customer_phone);
