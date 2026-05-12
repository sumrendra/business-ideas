#!/usr/bin/env node
/**
 * Setup Neon DB tables for Unlisted Company Financials
 * Usage: DATABASE_URL=... node scripts/setup-unlisted-db.mjs
 */

import pg from 'pg'
const { Client } = pg

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

console.log('Creating unlisted financials tables...')

await client.query(`
  CREATE TABLE IF NOT EXISTS unlisted_companies (
    cin                   TEXT PRIMARY KEY,
    name                  TEXT NOT NULL,
    state                 TEXT,
    industry              TEXT,
    sub_sector            TEXT,
    category              TEXT,
    incorporation_year    INTEGER,
    authorized_capital_cr NUMERIC,
    paid_up_capital_cr    NUMERIC,
    is_notable            BOOLEAN DEFAULT FALSE,
    tags                  TEXT[],
    updated_at            TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS unlisted_financials (
    id            SERIAL PRIMARY KEY,
    cin           TEXT NOT NULL REFERENCES unlisted_companies(cin) ON DELETE CASCADE,
    fiscal_year   TEXT NOT NULL,
    revenue_cr    NUMERIC,
    expenses_cr   NUMERIC,
    pat_cr        NUMERIC,
    net_worth_cr  NUMERIC,
    total_assets_cr NUMERIC,
    total_debt_cr NUMERIC,
    data_source   TEXT NOT NULL DEFAULT 'zauba',
    scraped_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cin, fiscal_year)
  );

  CREATE INDEX IF NOT EXISTS idx_uf_cin         ON unlisted_financials(cin);
  CREATE INDEX IF NOT EXISTS idx_uf_year        ON unlisted_financials(fiscal_year);
  CREATE INDEX IF NOT EXISTS idx_uc_industry    ON unlisted_companies(industry);
  CREATE INDEX IF NOT EXISTS idx_uc_state       ON unlisted_companies(state);
  CREATE INDEX IF NOT EXISTS idx_uc_notable     ON unlisted_companies(is_notable);
  CREATE INDEX IF NOT EXISTS idx_uc_fts         ON unlisted_companies
    USING gin(to_tsvector('english', name || ' ' || coalesce(industry,'') || ' ' || coalesce(state,'')));
`)

console.log('✅ Tables created: unlisted_companies, unlisted_financials')
await client.end()
