CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE venues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(60) UNIQUE NOT NULL,
  logo_url TEXT,
  address TEXT,
  owner_email VARCHAR(150) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  plan VARCHAR(20) DEFAULT 'free',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  table_number INTEGER NOT NULL,
  qr_code_url TEXT,
  active BOOLEAN DEFAULT true,
  UNIQUE(venue_id, table_number)
);

CREATE TABLE menu_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  name VARCHAR(80) NOT NULL,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true
);

CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  category_id UUID REFERENCES menu_categories(id) ON DELETE CASCADE,
  name VARCHAR(120) NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  image_url TEXT,
  available BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  table_id UUID REFERENCES tables(id),
  table_number INTEGER,
  status VARCHAR(30) DEFAULT 'pending',
  total INTEGER NOT NULL,
  flow_order_id VARCHAR(100),
  flow_token VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  item_name VARCHAR(120) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  subtotal INTEGER NOT NULL,
  notes TEXT
);
