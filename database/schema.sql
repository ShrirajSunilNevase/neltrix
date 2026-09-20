CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assets (
  id BIGSERIAL PRIMARY KEY,
  symbol TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS watchlists (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Default'
);

CREATE TABLE IF NOT EXISTS watchlist_items (
  id BIGSERIAL PRIMARY KEY,
  watchlist_id BIGINT REFERENCES watchlists(id) ON DELETE CASCADE,
  asset_id BIGINT REFERENCES assets(id) ON DELETE CASCADE,
  UNIQUE(watchlist_id, asset_id)
);

CREATE TABLE IF NOT EXISTS analyses (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  asset_symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  ai_summary TEXT,
  user_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS analysis_patterns (
  id BIGSERIAL PRIMARY KEY,
  analysis_id BIGINT REFERENCES analyses(id) ON DELETE CASCADE,
  pattern_name TEXT NOT NULL,
  confidence NUMERIC
);

CREATE TABLE IF NOT EXISTS analysis_notes (
  id BIGSERIAL PRIMARY KEY,
  analysis_id BIGINT REFERENCES analyses(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id BIGSERIAL PRIMARY KEY,
  conversation_id BIGINT REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS market_snapshots (
  id BIGSERIAL PRIMARY KEY,
  asset_symbol TEXT NOT NULL,
  price NUMERIC NOT NULL,
  volume NUMERIC,
  volatility NUMERIC,
  captured_at TIMESTAMPTZ DEFAULT now()
);
