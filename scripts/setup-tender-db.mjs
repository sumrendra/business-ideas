import pg from 'pg'
const { Client } = pg

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

console.log('Creating tables...')

await client.query(`
  CREATE TABLE IF NOT EXISTS tenders (
    id            TEXT PRIMARY KEY,
    source        TEXT NOT NULL,
    bid_no        TEXT,
    title         TEXT NOT NULL,
    organization  TEXT,
    ministry      TEXT,
    department    TEXT,
    category      TEXT,
    state         TEXT,
    tender_value  NUMERIC,
    bid_deadline  TIMESTAMPTZ,
    published_at  TIMESTAMPTZ,
    status        TEXT DEFAULT 'active',
    document_url  TEXT,
    description   TEXT,
    item_description TEXT,
    quantity      TEXT,
    scraped_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bid_no, source)
  );

  CREATE INDEX IF NOT EXISTS idx_tenders_status     ON tenders(status);
  CREATE INDEX IF NOT EXISTS idx_tenders_state      ON tenders(state);
  CREATE INDEX IF NOT EXISTS idx_tenders_ministry   ON tenders(ministry);
  CREATE INDEX IF NOT EXISTS idx_tenders_category   ON tenders(category);
  CREATE INDEX IF NOT EXISTS idx_tenders_deadline   ON tenders(bid_deadline);
  CREATE INDEX IF NOT EXISTS idx_tenders_value      ON tenders(tender_value);
  CREATE INDEX IF NOT EXISTS idx_tenders_scraped    ON tenders(scraped_at);
  CREATE INDEX IF NOT EXISTS idx_tenders_source     ON tenders(source);
  CREATE INDEX IF NOT EXISTS idx_tenders_fts        ON tenders USING gin(to_tsvector('english', coalesce(title,'') || ' ' || coalesce(organization,'') || ' ' || coalesce(category,'') || ' ' || coalesce(ministry,'')));
`)

await client.query(`
  CREATE TABLE IF NOT EXISTS bid_results (
    id              TEXT PRIMARY KEY,
    tender_id       TEXT REFERENCES tenders(id) ON DELETE CASCADE,
    bid_no          TEXT,
    source          TEXT NOT NULL,
    category        TEXT,
    item_description TEXT,
    ministry        TEXT,
    organization    TEXT,
    state           TEXT,
    l1_price        NUMERIC,
    l1_seller_name  TEXT,
    l1_seller_gstin TEXT,
    estimated_value NUMERIC,
    total_bidders   INTEGER,
    bid_closing_date TIMESTAMPTZ,
    award_date      TIMESTAMPTZ,
    savings_percent NUMERIC,
    scraped_at      TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(bid_no, source)
  );

  CREATE INDEX IF NOT EXISTS idx_bids_category  ON bid_results(category);
  CREATE INDEX IF NOT EXISTS idx_bids_state     ON bid_results(state);
  CREATE INDEX IF NOT EXISTS idx_bids_ministry  ON bid_results(ministry);
  CREATE INDEX IF NOT EXISTS idx_bids_seller    ON bid_results(l1_seller_name);
  CREATE INDEX IF NOT EXISTS idx_bids_date      ON bid_results(bid_closing_date);
`)

await client.query(`
  CREATE TABLE IF NOT EXISTS scrape_log (
    id          SERIAL PRIMARY KEY,
    source      TEXT NOT NULL,
    started_at  TIMESTAMPTZ DEFAULT NOW(),
    finished_at TIMESTAMPTZ,
    tenders_found    INTEGER DEFAULT 0,
    tenders_upserted INTEGER DEFAULT 0,
    bids_found       INTEGER DEFAULT 0,
    bids_upserted    INTEGER DEFAULT 0,
    error       TEXT,
    status      TEXT DEFAULT 'running'
  );
`)

console.log('✅ Tables created: tenders, bid_results, scrape_log')

const check = await client.query(`
  SELECT table_name,
    (SELECT count(*) FROM information_schema.columns WHERE table_name = t.table_name) as cols
  FROM information_schema.tables t
  WHERE table_schema = 'public'
  ORDER BY table_name
`)
console.log('\nTables in database:')
check.rows.forEach(r => console.log(` - ${r.table_name} (${r.cols} columns)`))

await client.end()
