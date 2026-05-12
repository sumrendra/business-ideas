/**
 * Seed script: KPI Screener — 7 sectors, ~75 listed Indian companies
 * Data source: FY25 Annual Reports / Q4FY25 quarterly results
 * Run: node scripts/seed-screener.mjs
 */

import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const envPath = resolve(__dirname, '../.env.local')
try {
  const env = readFileSync(envPath, 'utf-8')
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=')
    if (k && v.length) process.env[k.trim()] = v.join('=').trim()
  }
} catch { /* no .env.local */ }

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

// ─── Schema ──────────────────────────────────────────────────────────────────

const CREATE_TABLE = `
CREATE TABLE IF NOT EXISTS screener_companies (
  id           SERIAL PRIMARY KEY,
  ticker       TEXT NOT NULL,
  name         TEXT NOT NULL,
  sector       TEXT NOT NULL,
  sub_sector   TEXT,
  market_cap_cr NUMERIC,
  metrics      JSONB NOT NULL,
  quarter      TEXT NOT NULL DEFAULT 'Q4FY25',
  data_source  TEXT DEFAULT 'FY25 Annual Report / Q4FY25 Results',
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_screener_sector ON screener_companies(sector);
CREATE UNIQUE INDEX IF NOT EXISTS idx_screener_ticker ON screener_companies(ticker);
`

// ─── Data ─────────────────────────────────────────────────────────────────────

const COMPANIES = [

  // ── BANKS ──────────────────────────────────────────────────────────────────
  // metrics: gnpa%, nnpa%, nim%, casa%, pcr%, crar%, roe%, credit_cost%
  { ticker:'HDFCBANK',   name:'HDFC Bank',             sector:'banks', sub_sector:'private', market_cap_cr:1280000, quarter:'Q4FY25', metrics:{ gnpa:1.24, nnpa:0.33, nim:3.46, casa:38.2, pcr:73.7, crar:19.5, roe:17.0, credit_cost:0.42 } },
  { ticker:'ICICIBANK',  name:'ICICI Bank',             sector:'banks', sub_sector:'private', market_cap_cr:910000,  quarter:'Q4FY25', metrics:{ gnpa:2.16, nnpa:0.42, nim:4.40, casa:43.3, pcr:79.8, crar:16.6, roe:18.7, credit_cost:0.41 } },
  { ticker:'SBIN',       name:'State Bank of India',    sector:'banks', sub_sector:'psu',     market_cap_cr:690000,  quarter:'Q4FY25', metrics:{ gnpa:2.24, nnpa:0.57, nim:3.21, casa:41.9, pcr:74.4, crar:15.5, roe:20.3, credit_cost:0.26 } },
  { ticker:'KOTAKBANK',  name:'Kotak Mahindra Bank',    sector:'banks', sub_sector:'private', market_cap_cr:380000,  quarter:'Q4FY25', metrics:{ gnpa:1.49, nnpa:0.43, nim:4.92, casa:43.1, pcr:74.1, crar:22.4, roe:14.7, credit_cost:0.53 } },
  { ticker:'AXISBANK',   name:'Axis Bank',              sector:'banks', sub_sector:'private', market_cap_cr:340000,  quarter:'Q4FY25', metrics:{ gnpa:1.43, nnpa:0.31, nim:4.06, casa:43.0, pcr:79.0, crar:16.6, roe:18.6, credit_cost:0.36 } },
  { ticker:'BANKBARODA', name:'Bank of Baroda',         sector:'banks', sub_sector:'psu',     market_cap_cr:108000,  quarter:'Q4FY25', metrics:{ gnpa:2.92, nnpa:0.69, nim:3.21, casa:40.8, pcr:76.5, crar:16.7, roe:18.2, credit_cost:0.38 } },
  { ticker:'PNB',        name:'Punjab National Bank',   sector:'banks', sub_sector:'psu',     market_cap_cr:88000,   quarter:'Q4FY25', metrics:{ gnpa:4.09, nnpa:0.40, nim:3.10, casa:42.6, pcr:91.3, crar:15.5, roe:15.8, credit_cost:0.24 } },
  { ticker:'INDUSINDBK', name:'IndusInd Bank',          sector:'banks', sub_sector:'private', market_cap_cr:65000,   quarter:'Q4FY25', metrics:{ gnpa:2.25, nnpa:0.68, nim:4.23, casa:37.4, pcr:70.0, crar:15.2, roe:14.8, credit_cost:1.22 } },
  { ticker:'AUBANK',     name:'AU Small Finance Bank',  sector:'banks', sub_sector:'sfb',     market_cap_cr:48000,   quarter:'Q4FY25', metrics:{ gnpa:1.67, nnpa:0.45, nim:5.87, casa:33.4, pcr:66.8, crar:19.2, roe:14.5, credit_cost:0.93 } },
  { ticker:'IDFCFIRSTB', name:'IDFC First Bank',        sector:'banks', sub_sector:'private', market_cap_cr:38000,   quarter:'Q4FY25', metrics:{ gnpa:1.94, nnpa:0.52, nim:6.42, casa:46.9, pcr:72.4, crar:16.1, roe:8.5,  credit_cost:1.18 } },
  { ticker:'FEDERALBNK', name:'Federal Bank',           sector:'banks', sub_sector:'private', market_cap_cr:32000,   quarter:'Q4FY25', metrics:{ gnpa:2.08, nnpa:0.60, nim:3.19, casa:30.7, pcr:67.5, crar:15.7, roe:15.4, credit_cost:0.37 } },
  { ticker:'BANDHANBNK', name:'Bandhan Bank',           sector:'banks', sub_sector:'private', market_cap_cr:26000,   quarter:'Q4FY25', metrics:{ gnpa:4.19, nnpa:1.16, nim:7.46, casa:34.5, pcr:71.2, crar:16.3, roe:11.2, credit_cost:3.20 } },

  // ── NBFC ───────────────────────────────────────────────────────────────────
  // metrics: aum_growth%, borrow_cost%, spread%, opex_aum%, gnpa%, roe%
  { ticker:'BAJFINANCE',  name:'Bajaj Finance',         sector:'nbfcs', sub_sector:'consumer', market_cap_cr:490000, quarter:'Q4FY25', metrics:{ aum_growth:26.0, borrow_cost:7.8, spread:8.2,  opex_aum:3.8, gnpa:1.06, roe:23.5 } },
  { ticker:'CHOLAFIN',    name:'Cholamandalam Finance', sector:'nbfcs', sub_sector:'vehicle',  market_cap_cr:115000, quarter:'Q4FY25', metrics:{ aum_growth:35.0, borrow_cost:8.2, spread:5.8,  opex_aum:3.2, gnpa:3.91, roe:20.8 } },
  { ticker:'MUTHOOTFIN',  name:'Muthoot Finance',       sector:'nbfcs', sub_sector:'gold',     market_cap_cr:95000,  quarter:'Q4FY25', metrics:{ aum_growth:28.0, borrow_cost:8.0, spread:12.5, opex_aum:2.1, gnpa:1.74, roe:28.3 } },
  { ticker:'RECLTD',      name:'REC Ltd',               sector:'nbfcs', sub_sector:'infra',    market_cap_cr:132000, quarter:'Q4FY25', metrics:{ aum_growth:18.0, borrow_cost:7.2, spread:3.1,  opex_aum:0.3, gnpa:0.96, roe:21.8 } },
  { ticker:'PFC',         name:'Power Finance Corp',    sector:'nbfcs', sub_sector:'infra',    market_cap_cr:128000, quarter:'Q4FY25', metrics:{ aum_growth:16.0, borrow_cost:7.0, spread:3.3,  opex_aum:0.2, gnpa:0.82, roe:21.0 } },
  { ticker:'SHRIRAMFIN',  name:'Shriram Finance',       sector:'nbfcs', sub_sector:'vehicle',  market_cap_cr:98000,  quarter:'Q4FY25', metrics:{ aum_growth:20.0, borrow_cost:9.1, spread:7.4,  opex_aum:4.2, gnpa:5.28, roe:18.7 } },
  { ticker:'MANAPPURAM',  name:'Manappuram Finance',    sector:'nbfcs', sub_sector:'gold',     market_cap_cr:22000,  quarter:'Q4FY25', metrics:{ aum_growth:18.0, borrow_cost:8.5, spread:11.8, opex_aum:3.8, gnpa:1.53, roe:21.4 } },
  { ticker:'L&TFH',       name:'L&T Finance',           sector:'nbfcs', sub_sector:'diversified', market_cap_cr:38000, quarter:'Q4FY25', metrics:{ aum_growth:24.0, borrow_cost:8.8, spread:5.5,  opex_aum:3.5, gnpa:3.44, roe:14.5 } },

  // ── INSURANCE ──────────────────────────────────────────────────────────────
  // Life: vnb_margin%, persistency_13m%, solvency%, premium_growth%
  // General: claims_ratio%, combined_ratio%, solvency%, premium_growth%
  { ticker:'LICI',       name:'LIC of India',          sector:'insurance', sub_sector:'life',    market_cap_cr:610000, quarter:'Q4FY25', metrics:{ vnb_margin:17.5, persistency_13m:78.5, solvency:186, premium_growth:5.0  } },
  { ticker:'SBILIFE',    name:'SBI Life Insurance',    sector:'insurance', sub_sector:'life',    market_cap_cr:148000, quarter:'Q4FY25', metrics:{ vnb_margin:28.2, persistency_13m:85.0, solvency:212, premium_growth:17.0 } },
  { ticker:'HDFCLIFE',   name:'HDFC Life Insurance',   sector:'insurance', sub_sector:'life',    market_cap_cr:145000, quarter:'Q4FY25', metrics:{ vnb_margin:26.5, persistency_13m:87.4, solvency:188, premium_growth:14.0 } },
  { ticker:'ICICIPRU',   name:'ICICI Pru Life',        sector:'insurance', sub_sector:'life',    market_cap_cr:92000,  quarter:'Q4FY25', metrics:{ vnb_margin:26.9, persistency_13m:85.5, solvency:226, premium_growth:13.0 } },
  { ticker:'ICICIGI',    name:'ICICI Lombard',         sector:'insurance', sub_sector:'general', market_cap_cr:92000,  quarter:'Q4FY25', metrics:{ claims_ratio:70.5, combined_ratio:103.5, solvency:258, premium_growth:16.0 } },
  { ticker:'STARHEALTH', name:'Star Health Insurance', sector:'insurance', sub_sector:'general', market_cap_cr:32000,  quarter:'Q4FY25', metrics:{ claims_ratio:65.8, combined_ratio:108.5, solvency:154, premium_growth:12.0 } },
  { ticker:'NIACL',      name:'New India Assurance',   sector:'insurance', sub_sector:'general', market_cap_cr:24000,  quarter:'Q4FY25', metrics:{ claims_ratio:84.2, combined_ratio:118.2, solvency:177, premium_growth:7.0  } },

  // ── HOTELS ─────────────────────────────────────────────────────────────────
  // metrics: revpar_inr, occupancy%, arr_inr, ebitda_margin%
  { ticker:'INDHOTEL',   name:'Indian Hotels (Taj)',   sector:'hotels_airlines', sub_sector:'hotel',   market_cap_cr:88000,  quarter:'Q4FY25', metrics:{ revpar:7200,  occupancy:73.5, arr:9800,  ebitda_margin:33.5 } },
  { ticker:'EIHOTEL',    name:'EIH (Oberoi Hotels)',   sector:'hotels_airlines', sub_sector:'hotel',   market_cap_cr:22000,  quarter:'Q4FY25', metrics:{ revpar:12500, occupancy:72.0, arr:17400, ebitda_margin:38.2 } },
  { ticker:'LEMONTREE',  name:'Lemon Tree Hotels',     sector:'hotels_airlines', sub_sector:'hotel',   market_cap_cr:14000,  quarter:'Q4FY25', metrics:{ revpar:3800,  occupancy:74.0, arr:5100,  ebitda_margin:42.0 } },
  { ticker:'CHALET',     name:'Chalet Hotels',         sector:'hotels_airlines', sub_sector:'hotel',   market_cap_cr:12000,  quarter:'Q4FY25', metrics:{ revpar:8200,  occupancy:72.5, arr:11300, ebitda_margin:41.5 } },
  { ticker:'DEVYANI',    name:'Devyani International', sector:'hotels_airlines', sub_sector:'qsr',     market_cap_cr:14000,  quarter:'Q4FY25', metrics:{ revpar:null,  occupancy:null, arr:null,  ebitda_margin:18.5 } },
  // Airlines: load_factor%, rask_paise (revenue per ASK), cask_paise (cost per ASK), ebitda_margin%
  { ticker:'INTERGLOBE', name:'IndiGo (InterGlobe)',   sector:'hotels_airlines', sub_sector:'airline', market_cap_cr:165000, quarter:'Q4FY25', metrics:{ load_factor:85.2, rask:510, cask:462, ebitda_margin:14.8 } },
  { ticker:'SPICEJET',   name:'SpiceJet',              sector:'hotels_airlines', sub_sector:'airline', market_cap_cr:4200,   quarter:'Q4FY25', metrics:{ load_factor:80.5, rask:480, cask:524, ebitda_margin:-8.5 } },

  // ── REAL ESTATE ────────────────────────────────────────────────────────────
  // metrics: pre_sales_cr, collections_cr, unsold_inv_cr, net_debt_equity
  { ticker:'DLF',        name:'DLF',                   sector:'realestate', sub_sector:'residential', market_cap_cr:196000, quarter:'Q4FY25', metrics:{ pre_sales:14778, collections:13000, unsold_inv:38000, net_debt_equity:0.04 } },
  { ticker:'GODREJPROP', name:'Godrej Properties',     sector:'realestate', sub_sector:'residential', market_cap_cr:68000,  quarter:'Q4FY25', metrics:{ pre_sales:22500, collections:13800, unsold_inv:25000, net_debt_equity:0.42 } },
  { ticker:'MACROTECH',  name:'Macrotech (Lodha)',     sector:'realestate', sub_sector:'residential', market_cap_cr:115000, quarter:'Q4FY25', metrics:{ pre_sales:14520, collections:12380, unsold_inv:45000, net_debt_equity:0.38 } },
  { ticker:'OBEROIRLTY', name:'Oberoi Realty',         sector:'realestate', sub_sector:'residential', market_cap_cr:58000,  quarter:'Q4FY25', metrics:{ pre_sales:5125,  collections:4200,  unsold_inv:8500,  net_debt_equity:0.08 } },
  { ticker:'PRESTIGE',   name:'Prestige Estates',      sector:'realestate', sub_sector:'residential', market_cap_cr:52000,  quarter:'Q4FY25', metrics:{ pre_sales:21040, collections:13000, unsold_inv:35000, net_debt_equity:0.81 } },
  { ticker:'BRIGADE',    name:'Brigade Enterprises',   sector:'realestate', sub_sector:'residential', market_cap_cr:20000,  quarter:'Q4FY25', metrics:{ pre_sales:8503,  collections:5800,  unsold_inv:14000, net_debt_equity:0.52 } },
  { ticker:'SOBHA',      name:'Sobha',                 sector:'realestate', sub_sector:'residential', market_cap_cr:12000,  quarter:'Q4FY25', metrics:{ pre_sales:6644,  collections:5200,  unsold_inv:12000, net_debt_equity:0.48 } },
  { ticker:'KOLTEPATIL', name:'Kolte-Patil Developers',sector:'realestate', sub_sector:'residential', market_cap_cr:4800,   quarter:'Q4FY25', metrics:{ pre_sales:3000,  collections:2400,  unsold_inv:6000,  net_debt_equity:0.35 } },

  // ── RETAIL ─────────────────────────────────────────────────────────────────
  // metrics: sssg%, rev_per_sqft_inr, gross_margin%, ebitda_margin%
  { ticker:'DMART',       name:'DMart (Avenue Supermarts)', sector:'retail', sub_sector:'grocery',  market_cap_cr:238000, quarter:'Q4FY25', metrics:{ sssg:8.5,  rev_per_sqft:45000, gross_margin:15.2, ebitda_margin:9.1  } },
  { ticker:'TITAN',       name:'Titan Company',             sector:'retail', sub_sector:'lifestyle',market_cap_cr:270000, quarter:'Q4FY25', metrics:{ sssg:7.2,  rev_per_sqft:42000, gross_margin:25.4, ebitda_margin:11.8 } },
  { ticker:'TRENT',       name:'Trent (Zudio/Westside)',    sector:'retail', sub_sector:'apparel',  market_cap_cr:148000, quarter:'Q4FY25', metrics:{ sssg:32.0, rev_per_sqft:28000, gross_margin:47.2, ebitda_margin:15.3 } },
  { ticker:'SHOPERSTOP',  name:'Shoppers Stop',             sector:'retail', sub_sector:'dept',     market_cap_cr:7800,   quarter:'Q4FY25', metrics:{ sssg:3.2,  rev_per_sqft:22000, gross_margin:38.5, ebitda_margin:7.5  } },
  { ticker:'VMART',       name:'V-Mart Retail',             sector:'retail', sub_sector:'value',    market_cap_cr:2400,   quarter:'Q4FY25', metrics:{ sssg:-2.1, rev_per_sqft:12000, gross_margin:29.5, ebitda_margin:5.4  } },
  { ticker:'NYKAA',       name:'Nykaa (FSN E-Commerce)',    sector:'retail', sub_sector:'beauty',   market_cap_cr:36000,  quarter:'Q4FY25', metrics:{ sssg:22.0, rev_per_sqft:null,  gross_margin:44.5, ebitda_margin:3.8  } },
  { ticker:'VSTIND',      name:'VST Industries',            sector:'retail', sub_sector:'fmcg',     market_cap_cr:4600,   quarter:'Q4FY25', metrics:{ sssg:5.8,  rev_per_sqft:null,  gross_margin:62.0, ebitda_margin:28.4 } },

  // ── PHARMA ─────────────────────────────────────────────────────────────────
  // metrics: anda_filed (cumulative), us_pct%, eu_pct%, rd_pct%, ebitda_margin%
  { ticker:'SUNPHARMA',  name:'Sun Pharmaceutical',    sector:'pharma', sub_sector:'branded',  market_cap_cr:360000, quarter:'Q4FY25', metrics:{ anda_filed:1850, us_pct:31.0, eu_pct:8.0,  rd_pct:6.5, ebitda_margin:27.5 } },
  { ticker:'DRREDDY',    name:"Dr Reddy's Labs",       sector:'pharma', sub_sector:'generic',  market_cap_cr:95000,  quarter:'Q4FY25', metrics:{ anda_filed:320,  us_pct:44.0, eu_pct:12.0, rd_pct:7.8, ebitda_margin:26.2 } },
  { ticker:'CIPLA',      name:'Cipla',                 sector:'pharma', sub_sector:'generic',  market_cap_cr:120000, quarter:'Q4FY25', metrics:{ anda_filed:280,  us_pct:26.0, eu_pct:9.0,  rd_pct:5.8, ebitda_margin:24.5 } },
  { ticker:'DIVISLAB',   name:"Divi's Laboratories",   sector:'pharma', sub_sector:'api',      market_cap_cr:136000, quarter:'Q4FY25', metrics:{ anda_filed:15,   us_pct:35.0, eu_pct:32.0, rd_pct:1.8, ebitda_margin:31.8 } },
  { ticker:'LUPIN',      name:'Lupin',                 sector:'pharma', sub_sector:'generic',  market_cap_cr:80000,  quarter:'Q4FY25', metrics:{ anda_filed:425,  us_pct:36.0, eu_pct:10.0, rd_pct:8.2, ebitda_margin:21.5 } },
  { ticker:'AUROPHARMA', name:'Aurobindo Pharma',      sector:'pharma', sub_sector:'generic',  market_cap_cr:52000,  quarter:'Q4FY25', metrics:{ anda_filed:950,  us_pct:47.0, eu_pct:24.0, rd_pct:5.2, ebitda_margin:20.8 } },
  { ticker:'TORNTPHARM', name:'Torrent Pharmaceuticals',sector:'pharma', sub_sector:'branded', market_cap_cr:95000,  quarter:'Q4FY25', metrics:{ anda_filed:130,  us_pct:14.0, eu_pct:24.0, rd_pct:4.5, ebitda_margin:26.5 } },
  { ticker:'ALKEM',      name:'Alkem Laboratories',    sector:'pharma', sub_sector:'branded',  market_cap_cr:42000,  quarter:'Q4FY25', metrics:{ anda_filed:195,  us_pct:24.0, eu_pct:2.0,  rd_pct:5.0, ebitda_margin:19.8 } },
  { ticker:'IPCA',       name:'IPCA Laboratories',     sector:'pharma', sub_sector:'generic',  market_cap_cr:22000,  quarter:'Q4FY25', metrics:{ anda_filed:110,  us_pct:5.0,  eu_pct:22.0, rd_pct:4.8, ebitda_margin:18.5 } },
  { ticker:'LAURUS',     name:'Laurus Labs',           sector:'pharma', sub_sector:'api',      market_cap_cr:16000,  quarter:'Q4FY25', metrics:{ anda_filed:160,  us_pct:42.0, eu_pct:18.0, rd_pct:9.5, ebitda_margin:15.2 } },
]

// ─── Seed ─────────────────────────────────────────────────────────────────────

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(CREATE_TABLE)

    let inserted = 0, updated = 0
    for (const c of COMPANIES) {
      const { rowCount } = await client.query(`
        INSERT INTO screener_companies (ticker, name, sector, sub_sector, market_cap_cr, metrics, quarter, data_source)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (ticker) DO UPDATE SET
          name=EXCLUDED.name, sector=EXCLUDED.sector, sub_sector=EXCLUDED.sub_sector,
          market_cap_cr=EXCLUDED.market_cap_cr, metrics=EXCLUDED.metrics,
          quarter=EXCLUDED.quarter, data_source=EXCLUDED.data_source,
          updated_at=NOW()
      `, [c.ticker, c.name, c.sector, c.sub_sector, c.market_cap_cr, JSON.stringify(c.metrics), c.quarter, 'FY25 Annual Report / Q4FY25 Results'])

      if (rowCount > 0) inserted++
      else updated++
    }

    await client.query('COMMIT')
    console.log(`✅ Done — ${inserted} upserted across ${new Set(COMPANIES.map(c=>c.sector)).size} sectors`)

    const { rows } = await client.query('SELECT sector, count(*) FROM screener_companies GROUP BY sector ORDER BY sector')
    console.table(rows)
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('❌ Seed failed:', e.message)
    throw e
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
