CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor' CHECK (role IN ('admin','editor')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS temples (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT,
  deity TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'Heritage Temple',
  image_url TEXT,
  description TEXT NOT NULL DEFAULT '',
  history TEXT NOT NULL DEFAULT '',
  darshan_timings TEXT NOT NULL DEFAULT 'Please verify current timings with official sources.',
  best_time TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('draft','pending','approved','rejected')),
  created_by BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_by BIGINT REFERENCES admin_users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS temples_status_idx ON temples(status);
CREATE INDEX IF NOT EXISTS temples_state_idx ON temples(state);
CREATE INDEX IF NOT EXISTS temples_city_idx ON temples(city);

CREATE TABLE IF NOT EXISTS rituals (
  id BIGSERIAL PRIMARY KEY,
  temple_id BIGINT NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  schedule TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS festivals (
  id BIGSERIAL PRIMARY KEY,
  temple_id BIGINT REFERENCES temples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date_note TEXT NOT NULL DEFAULT '',
  source_url TEXT
);
CREATE TABLE IF NOT EXISTS visitor_information (
  id BIGSERIAL PRIMARY KEY,
  temple_id BIGINT NOT NULL UNIQUE REFERENCES temples(id) ON DELETE CASCADE,
  dress_code TEXT NOT NULL DEFAULT '',
  entry_rules TEXT NOT NULL DEFAULT '',
  photography_rules TEXT NOT NULL DEFAULT '',
  accessibility_notes TEXT NOT NULL DEFAULT '',
  official_url TEXT
);
CREATE TABLE IF NOT EXISTS facilities (
  id BIGSERIAL PRIMARY KEY,
  temple_id BIGINT NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  details TEXT NOT NULL DEFAULT '',
  verified_at DATE
);
CREATE TABLE IF NOT EXISTS pilgrimage_circuits (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS circuit_stops (
  circuit_id BIGINT NOT NULL REFERENCES pilgrimage_circuits(id) ON DELETE CASCADE,
  temple_id BIGINT NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  stop_order INTEGER NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  PRIMARY KEY (circuit_id, temple_id),
  UNIQUE (circuit_id, stop_order)
);
