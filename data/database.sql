-- TokenMarket DApp Database Schema
-- PostgreSQL

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  wallet_address VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) UNIQUE,
  email VARCHAR(255),
  user_type VARCHAR(20) CHECK(user_type IN ('seller', 'buyer', 'both')),
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS listings (
  id SERIAL PRIMARY KEY,
  token_id INTEGER UNIQUE,
  seller_wallet VARCHAR(255) NOT NULL,
  seller_id INTEGER,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price_eth VARCHAR(50) NOT NULL,
  image_url TEXT,
  category VARCHAR(100),
  condition VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (seller_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  token_id INTEGER NOT NULL,
  seller_wallet VARCHAR(255) NOT NULL,
  buyer_wallet VARCHAR(255) NOT NULL,
  listing_id INTEGER,
  price_eth VARCHAR(50) NOT NULL,
  tx_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  FOREIGN KEY (listing_id) REFERENCES listings(id)
);

-- Create indexes for better query performance
CREATE INDEX idx_listings_seller ON listings(seller_wallet);
CREATE INDEX idx_listings_active ON listings(is_active);
CREATE INDEX idx_transactions_token ON transactions(token_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_wallet);
CREATE INDEX idx_transactions_seller ON transactions(seller_wallet);
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_listings_created ON listings(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listings_updated_at BEFORE UPDATE ON listings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
