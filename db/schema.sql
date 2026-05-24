-- =============================================================================
-- Food Order App — PostgreSQL Schema (database: foodapp)
-- =============================================================================
-- Generated from project analysis:
--   Auth:     POST /auth/register, /auth/login, Passport sessions
--   Menu:     GET/POST/PUT/DELETE /api/products  → food_items
--   Cart:     PUT/GET/DELETE /api/cart           → carts, cart_items
--   Checkout: POST /api/checkout                → orders, order_items
--   Orders:   GET /orders, POST /order           → orders, order_items
--   Audit:    login on success                    → login_activities
--
-- Apply:  npm run db:init   (or psql -f db/schema.sql)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- USERS — accounts (register, login, passport, JWT)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL DEFAULT '',
  email VARCHAR(255) UNIQUE,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- FOOD_ITEMS — menu catalog (/api/products, menu.html seed data)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS food_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  category VARCHAR(100) NOT NULL DEFAULT 'General',
  image TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ORDERS — order header (checkout, /order, /orders)
-- One order belongs to zero or one registered user (guest checkout allowed).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_number VARCHAR(50) NOT NULL UNIQUE,
  user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
  tax DECIMAL(10, 2) NOT NULL CHECK (tax >= 0),
  delivery DECIMAL(10, 2) NOT NULL CHECK (delivery >= 0),
  total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
  customer_full_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_address TEXT NOT NULL,
  customer_notes TEXT NOT NULL DEFAULT '',
  payment_card_last4 VARCHAR(4) NOT NULL DEFAULT '',
  payment_expiry VARCHAR(20) NOT NULL DEFAULT '',
  status VARCHAR(30) NOT NULL DEFAULT 'placed'
    CHECK (status IN ('placed', 'preparing', 'out_for_delivery', 'delivered')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- ORDER_ITEMS — line items per order (snapshot of name/price at order time)
-- food_item_id is optional FK; name/price kept if menu item is later deleted.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  food_item_id INTEGER REFERENCES food_items (id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  image TEXT NOT NULL DEFAULT '',
  category VARCHAR(100) NOT NULL DEFAULT 'General'
);

-- -----------------------------------------------------------------------------
-- CARTS — one cart per user email (/api/cart)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users (id) ON DELETE SET NULL,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- CART_ITEMS — items in a cart before checkout
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER NOT NULL REFERENCES carts (id) ON DELETE CASCADE,
  food_item_id INTEGER REFERENCES food_items (id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity >= 1),
  image TEXT NOT NULL DEFAULT '',
  category VARCHAR(100) NOT NULL DEFAULT 'General'
);

-- -----------------------------------------------------------------------------
-- LOGIN_ACTIVITIES — audit trail on successful login
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS login_activities (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  user_email VARCHAR(255) NOT NULL,
  login_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip VARCHAR(100) NOT NULL DEFAULT '',
  user_agent TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================================
-- INDEXES
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items (category);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_email ON orders (user_email);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_food_item_id ON order_items (food_item_id);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_food_item_id ON cart_items (food_item_id);

CREATE INDEX IF NOT EXISTS idx_login_activities_user_id ON login_activities (user_id);
CREATE INDEX IF NOT EXISTS idx_login_activities_login_at ON login_activities (login_at DESC);
