/**
 * Seed: Capex & Promise Tracker — NSE-listed companies
 * Data from concalls, annual reports, investor presentations FY22–FY25
 * Run: node scripts/seed-capex-tracker.mjs
 */

import pg from 'pg'
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
try {
  const env = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8')
  for (const line of env.split('\n')) {
    const [k, ...v] = line.split('=')
    if (k && v.length) process.env[k.trim()] = v.join('=').trim()
  }
} catch { /* no .env.local */ }

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })

const CREATE = `
CREATE TABLE IF NOT EXISTS capex_promises (
  id               SERIAL PRIMARY KEY,
  ticker           TEXT NOT NULL,
  company_name     TEXT NOT NULL,
  sector           TEXT NOT NULL,
  promise_type     TEXT NOT NULL,  -- capex | capacity | margin | revenue | debt | expansion | hiring
  promise_text     TEXT NOT NULL,  -- paraphrased from concall/AR
  promised_amount_cr  NUMERIC,     -- monetary target in ₹ crores (NULL if non-monetary)
  promised_metric  TEXT,           -- e.g. '10 MTPA', '15% EBITDA', '400 stores'
  promised_by      TEXT NOT NULL,  -- target period, e.g. 'FY26', 'FY25-26'
  announced_quarter TEXT NOT NULL, -- when promise was made, e.g. 'Q2FY23'
  actual_amount_cr NUMERIC,        -- actual spend/achievement (if measurable)
  actual_metric    TEXT,           -- actual number achieved
  status           TEXT NOT NULL DEFAULT 'pending',
  -- delivered | on_track | partial | missed | pending | watch
  miss_reason      TEXT,
  source           TEXT,           -- concall | annual_report | agm | investor_day
  notes            TEXT,
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_capex_ticker  ON capex_promises(ticker);
CREATE INDEX IF NOT EXISTS idx_capex_sector  ON capex_promises(sector);
CREATE INDEX IF NOT EXISTS idx_capex_status  ON capex_promises(status);
CREATE INDEX IF NOT EXISTS idx_capex_type    ON capex_promises(promise_type);
`

// status values:
// delivered  — fully met or exceeded
// on_track   — in progress, currently meeting milestones
// partial    — done but below target
// missed     — target passed, not achieved
// pending    — target date not yet reached, limited data
// watch      — red flags appearing, risk of miss

const PROMISES = [

  // ── STEEL ──────────────────────────────────────────────────────────────────
  { ticker:'TATASTEEL',  company_name:'Tata Steel',          sector:'steel',
    promise_type:'capex', promised_by:'FY26', announced_quarter:'Q2FY23',
    promise_text:'₹12,000 Cr capex for Kalinganagar Phase 2 expansion to 8 MTPA crude steel capacity',
    promised_amount_cr:12000, promised_metric:'8 MTPA at Kalinganagar',
    actual_amount_cr:9800, actual_metric:'~6.5 MTPA commissioned; Phase 2 ongoing',
    status:'on_track', source:'concall', notes:'Phase 2 blast furnace commissioned Q3FY25' },

  { ticker:'TATASTEEL',  company_name:'Tata Steel',          sector:'steel',
    promise_type:'margin', promised_by:'FY26', announced_quarter:'Q4FY23',
    promise_text:'EBITDA/tonne of ₹12,000–13,000 in India operations once Kalinganagar ramp-up completes',
    promised_metric:'₹12,000–13,000 EBITDA/tonne', actual_metric:'₹8,800/tonne in Q4FY25',
    status:'watch', source:'concall', notes:'Europe losses and weak pricing drag blended EBITDA/t' },

  { ticker:'JSWSTEEL',   company_name:'JSW Steel',           sector:'steel',
    promise_type:'capacity', promised_by:'FY25', announced_quarter:'Q4FY22',
    promise_text:'Reach 37 MTPA installed capacity by FY25 through brownfield and greenfield expansions',
    promised_metric:'37 MTPA by FY25', actual_metric:'~28.5 MTPA actual by Q4FY25',
    status:'partial', source:'annual_report', miss_reason:'Odisha greenfield delayed due to land acquisition; capex phased to FY27',
    notes:'Target revised to 42 MTPA by FY31' },

  { ticker:'JSWSTEEL',   company_name:'JSW Steel',           sector:'steel',
    promise_type:'capex', promised_by:'FY27', announced_quarter:'Q2FY24',
    promise_text:'₹65,000 Cr capex plan for 25 MTPA incremental capacity over FY24–FY28',
    promised_amount_cr:65000, promised_metric:'25 MTPA incremental',
    status:'on_track', source:'investor_day' },

  { ticker:'SAIL',       company_name:'SAIL',                sector:'steel',
    promise_type:'capex', promised_by:'FY25', announced_quarter:'Q1FY23',
    promise_text:'₹2,500–3,000 Cr annual capex for modernisation and capacity debottlenecking in FY23–FY25',
    promised_amount_cr:8000, promised_metric:'₹2,500–3,000 Cr/year',
    actual_amount_cr:6200, actual_metric:'~₹2,000 Cr/year actual spend',
    status:'partial', source:'concall', miss_reason:'Delayed capex approvals; lower steel realisation reduced internal accruals' },

  // ── CEMENT ─────────────────────────────────────────────────────────────────
  { ticker:'ULTRACEMCO', company_name:'UltraTech Cement',    sector:'cement',
    promise_type:'capacity', promised_by:'FY27', announced_quarter:'Q1FY23',
    promise_text:'Expand capacity to 200 MTPA by FY27 through brownfield and acquisitions',
    promised_metric:'200 MTPA by FY27', actual_metric:'~160 MTPA as of Q4FY25 (incl. India Cements)',
    status:'on_track', source:'investor_day', notes:'Acquired India Cements (32 MTPA) in FY25' },

  { ticker:'SHREECEMENT', company_name:'Shree Cement',       sector:'cement',
    promise_type:'capacity', promised_by:'FY25', announced_quarter:'Q4FY23',
    promise_text:'Add 10 MTPA capacity in FY24–25, reaching 66 MTPA total',
    promised_metric:'66 MTPA total by FY25', actual_metric:'~59 MTPA by Q4FY25',
    status:'partial', source:'concall', miss_reason:'East India greenfield projects pushed to FY26' },

  { ticker:'AMBUJACEM',  company_name:'Ambuja Cements',      sector:'cement',
    promise_type:'capacity', promised_by:'FY28', announced_quarter:'Q3FY23',
    promise_text:'Double capacity to 140 MTPA by FY28 under Adani ownership with ₹20,000 Cr capex',
    promised_amount_cr:20000, promised_metric:'140 MTPA by FY28',
    actual_metric:'~90 MTPA as of Q4FY25', status:'on_track', source:'investor_day' },

  // ── RELIANCE / ENERGY ──────────────────────────────────────────────────────
  { ticker:'RELIANCE',   company_name:'Reliance Industries', sector:'energy',
    promise_type:'capex', promised_by:'FY30', announced_quarter:'Q2FY22',
    promise_text:'₹75,000 Cr green energy investment by 2030 across solar, hydrogen, fuel cell and grid batteries',
    promised_amount_cr:75000, promised_metric:'100 GW renewable equivalent',
    actual_amount_cr:8500, actual_metric:'~5 GW solar modules capacity; Giga factories under construction',
    status:'on_track', source:'agm', notes:'Giga factories at Jamnagar ramp-up ongoing' },

  { ticker:'RELIANCE',   company_name:'Reliance Industries', sector:'telecom',
    promise_type:'expansion', promised_by:'FY24', announced_quarter:'Q2FY23',
    promise_text:'Jio 5G pan-India rollout — every town and key village by Dec 2023',
    promised_metric:'Pan-India 5G by Dec 2023',
    actual_metric:'5G in 11,000+ cities/towns by Jan 2024',
    status:'delivered', source:'agm', notes:'Fastest 5G rollout globally at the time' },

  // ── TELECOM ────────────────────────────────────────────────────────────────
  { ticker:'BHARTIARTL', company_name:'Bharti Airtel',       sector:'telecom',
    promise_type:'expansion', promised_by:'FY24', announced_quarter:'Q2FY23',
    promise_text:'5G rollout in 5,000 cities/towns across India by end of FY24',
    promised_metric:'5,000 cities 5G by FY24', actual_metric:'5G in 5,000+ cities by Mar 2024',
    status:'delivered', source:'concall' },

  { ticker:'BHARTIARTL', company_name:'Bharti Airtel',       sector:'telecom',
    promise_type:'margin', promised_by:'FY26', announced_quarter:'Q1FY24',
    promise_text:'India wireless EBITDA margin to reach 55%+ on 5G monetisation and ARPU uplift',
    promised_metric:'55%+ India wireless EBITDA', actual_metric:'52.8% in Q4FY25',
    status:'on_track', source:'concall' },

  { ticker:'BHARTIARTL', company_name:'Bharti Airtel',       sector:'telecom',
    promise_type:'revenue', promised_by:'FY27', announced_quarter:'Q3FY24',
    promise_text:'ARPU target of ₹300+ by FY27 through tariff hikes and 5G premiumisation',
    promised_metric:'₹300 ARPU by FY27', actual_metric:'₹245 ARPU in Q4FY25',
    status:'on_track', source:'concall', notes:'Jul 2024 tariff hike already pushed ARPU to ₹233+' },

  // ── AUTO ───────────────────────────────────────────────────────────────────
  { ticker:'TATAMOTORS', company_name:'Tata Motors',         sector:'auto',
    promise_type:'capex', promised_by:'FY27', announced_quarter:'Q4FY23',
    promise_text:'₹15,000 Cr EV capex over 3 years for new platforms, battery packs and Sanand plant',
    promised_amount_cr:15000, promised_metric:'10 EV models, 500,000 annual EV capacity',
    actual_amount_cr:6800, status:'on_track', source:'investor_day',
    notes:'Punch EV, Nexon EV, Curvv EV launched; Sanand plant operational' },

  { ticker:'TATAMOTORS', company_name:'Tata Motors',         sector:'auto',
    promise_type:'margin', promised_by:'FY26', announced_quarter:'Q2FY24',
    promise_text:'JLR EBIT margin to sustain 8%+ with Reimagine strategy — Range Rover and Defender mix shift',
    promised_metric:'8%+ JLR EBIT margin', actual_metric:'8.5% EBIT in Q4FY25',
    status:'delivered', source:'concall' },

  { ticker:'MAHINDRA',   company_name:'Mahindra & Mahindra', sector:'auto',
    promise_type:'capex', promised_by:'FY27', announced_quarter:'Q2FY23',
    promise_text:'₹9,000 Cr capex for 5 new EV platforms (BE and XEV series) to be launched by FY27',
    promised_amount_cr:9000, promised_metric:'5 new EV platforms by FY27',
    actual_metric:'BE 6e and XEV 9e launched Q4FY25', status:'on_track', source:'investor_day' },

  { ticker:'MARUTI',     company_name:'Maruti Suzuki',       sector:'auto',
    promise_type:'capacity', promised_by:'FY26', announced_quarter:'Q2FY24',
    promise_text:'New Kharkhoda (Haryana) plant adding 250,000 units/year capacity — Phase 1 by FY26',
    promised_metric:'250,000 units/year by FY26', actual_metric:'Construction Phase 1 on schedule',
    status:'on_track', source:'annual_report', notes:'Investment ₹11,000 Cr+ for full build-out' },

  { ticker:'HEROMOTOCO', company_name:'Hero MotoCorp',       sector:'auto',
    promise_type:'capex', promised_by:'FY25', announced_quarter:'Q1FY23',
    promise_text:'₹3,000 Cr capex over 3 years for Andhra plant, EV hub in Karnataka and product refresh',
    promised_amount_cr:3000, promised_metric:'New Andhra plant + EV hub by FY25',
    actual_amount_cr:2100, actual_metric:'Andhra plant on track; VIDA EV sales modest',
    status:'partial', source:'concall', miss_reason:'EV ramp slower than expected; Andhra plant Phase 2 pushed to FY26' },

  // ── POWER / RENEWABLES ─────────────────────────────────────────────────────
  { ticker:'NTPC',       company_name:'NTPC',                sector:'power',
    promise_type:'capacity', promised_by:'FY32', announced_quarter:'Q1FY23',
    promise_text:'60 GW renewable energy capacity by 2032; RE to be 50% of total portfolio',
    promised_metric:'60 GW renewable by 2032', actual_metric:'~7.5 GW commissioned by Q4FY25',
    status:'on_track', source:'investor_day', notes:'Targeting 20 GW by FY26; NTPC Renewable Energy Ltd created' },

  { ticker:'TATAPOWER',  company_name:'Tata Power',          sector:'power',
    promise_type:'capacity', promised_by:'FY27', announced_quarter:'Q2FY23',
    promise_text:'Reach 15–20 GW clean energy capacity by FY27 across solar, wind and hydro',
    promised_metric:'15–20 GW clean by FY27', actual_metric:'~5.5 GW operational by Q4FY25',
    status:'on_track', source:'concall' },

  { ticker:'ADANIGREEN', company_name:'Adani Green Energy',  sector:'power',
    promise_type:'capacity', promised_by:'FY30', announced_quarter:'Q4FY22',
    promise_text:'45 GW renewable energy capacity by 2030; 25 GW by 2025',
    promised_metric:'45 GW by 2030; 25 GW by FY25', actual_metric:'~11.2 GW by Q4FY25',
    status:'watch', source:'investor_day', miss_reason:'25 GW by FY25 target missed; revised to 30 GW by FY28',
    notes:'US DoJ indictment of Gautam Adani in Nov 2024 disrupted US financing; targets reset' },

  { ticker:'CESC',       company_name:'CESC',                sector:'power',
    promise_type:'capacity', promised_by:'FY27', announced_quarter:'Q3FY23',
    promise_text:'Add 1,000 MW renewable capacity by FY27 at ₹5,500 Cr capex',
    promised_amount_cr:5500, promised_metric:'1,000 MW renewable by FY27',
    actual_metric:'~450 MW contracted/under construction', status:'on_track', source:'concall' },

  // ── OIL & GAS ──────────────────────────────────────────────────────────────
  { ticker:'ONGC',       company_name:'ONGC',                sector:'oil_gas',
    promise_type:'capex', promised_by:'FY28', announced_quarter:'Q4FY23',
    promise_text:'₹1 lakh Cr capex over FY24–28 for production maintenance and KG-DWN-98/2 ramp-up',
    promised_amount_cr:100000, promised_metric:'Production sustain 55 MMT oil equivalent',
    actual_amount_cr:35000, status:'on_track', source:'annual_report' },

  { ticker:'BPCL',       company_name:'BPCL',                sector:'oil_gas',
    promise_type:'capex', promised_by:'FY28', announced_quarter:'Q1FY24',
    promise_text:'₹1.7 lakh Cr 5-year investment plan — petrochem complex, EV network, renewables',
    promised_amount_cr:170000, promised_metric:'Petrochem + 7,000 EV stations by FY28',
    status:'pending', source:'investor_day', notes:'Petrochem Bina complex DFR stage; funding mix TBD' },

  // ── IT ─────────────────────────────────────────────────────────────────────
  { ticker:'TCS',        company_name:'TCS',                 sector:'it',
    promise_type:'hiring', promised_by:'FY24', announced_quarter:'Q1FY23',
    promise_text:'Hire 40,000 freshers in FY24 to meet demand and maintain fresher pyramid',
    promised_metric:'40,000 freshers FY24', actual_metric:'~35,000 freshers hired FY24',
    status:'partial', source:'concall', miss_reason:'Discretionary IT spend freeze by BFSI and retail clients; hiring moderated' },

  { ticker:'INFY',       company_name:'Infosys',             sector:'it',
    promise_type:'hiring', promised_by:'FY24', announced_quarter:'Q1FY23',
    promise_text:'On-board 50,000 freshers in FY24 to support client demand ramp-ups',
    promised_metric:'50,000 freshers FY24', actual_metric:'~14,000 freshers actually on-boarded FY24',
    status:'missed', source:'concall', miss_reason:'Demand slowdown; intake deferred for FY22 and FY23 offers already made',
    notes:'Led to attrition among waiting freshers; major reputational issue for Infosys' },

  { ticker:'WIPRO',      company_name:'Wipro',               sector:'it',
    promise_type:'revenue', promised_by:'FY25', announced_quarter:'Q2FY23',
    promise_text:'Revenue growth back to industry average 8–10% from FY25 once demand stabilises',
    promised_metric:'8–10% growth by FY25', actual_metric:'Revenue growth ~1% in FY25',
    status:'missed', source:'concall', miss_reason:'BFSI and telecom vertical headwinds persisted longer than expected' },

  { ticker:'HCLTECH',    company_name:'HCL Technologies',    sector:'it',
    promise_type:'margin', promised_by:'FY25', announced_quarter:'Q3FY23',
    promise_text:'EBIT margin guidance of 18–19% for FY25 through operational efficiency and offshore mix',
    promised_metric:'18–19% EBIT FY25', actual_metric:'18.5% EBIT in FY25',
    status:'delivered', source:'concall' },

  // ── BANKING ────────────────────────────────────────────────────────────────
  { ticker:'HDFCBANK',   company_name:'HDFC Bank',           sector:'banks',
    promise_type:'expansion', promised_by:'FY26', announced_quarter:'Q1FY23',
    promise_text:'14%+ branch network expansion annually; reach 10,000+ branches by FY26 post-HDFC merger',
    promised_metric:'10,000+ branches by FY26', actual_metric:'~9,100 branches by Q4FY25',
    status:'on_track', source:'concall' },

  { ticker:'HDFCBANK',   company_name:'HDFC Bank',           sector:'banks',
    promise_type:'margin', promised_by:'FY26', announced_quarter:'Q4FY24',
    promise_text:'NIM to recover to 3.7–4.0% by FY26 as high-cost HDFC Ltd deposits mature and are replaced',
    promised_metric:'NIM 3.7–4.0% by FY26', actual_metric:'NIM 3.46% in Q4FY25',
    status:'watch', source:'concall', notes:'Deposit cost normalisation slower than guided; NIM recovery lagging' },

  { ticker:'SBIN',       company_name:'State Bank of India', sector:'banks',
    promise_type:'margin', promised_by:'FY25', announced_quarter:'Q2FY23',
    promise_text:'Sustain ROE of 18%+ and GNPA below 3% through credit quality improvement',
    promised_metric:'ROE 18%+, GNPA <3%', actual_metric:'ROE 20.3%, GNPA 2.24% in FY25',
    status:'delivered', source:'concall' },

  { ticker:'ICICIBANK',  company_name:'ICICI Bank',          sector:'banks',
    promise_type:'margin', promised_by:'FY25', announced_quarter:'Q3FY23',
    promise_text:'Maintain core operating RoE of 18%+ through retail-led growth and NIM protection',
    promised_metric:'RoE 18%+ core', actual_metric:'RoE 18.7% FY25',
    status:'delivered', source:'concall' },

  // ── CONSUMER / FMCG ────────────────────────────────────────────────────────
  { ticker:'ITC',        company_name:'ITC',                 sector:'fmcg',
    promise_type:'revenue', promised_by:'FY30', announced_quarter:'Q4FY22',
    promise_text:'FMCG (non-cigarette) revenue to reach ₹1 lakh Cr by FY30 — aspiration stated at AGM',
    promised_amount_cr:100000, promised_metric:'₹1 lakh Cr FMCG revenue by FY30',
    actual_amount_cr:20800, actual_metric:'FMCG revenue ~₹20,800 Cr in FY25',
    status:'on_track', source:'agm' },

  { ticker:'HINDUNILVR', company_name:'HUL',                 sector:'fmcg',
    promise_type:'margin', promised_by:'FY25', announced_quarter:'Q3FY23',
    promise_text:'EBITDA margin recovery to 24%+ as input cost pressures ease and premium mix improves',
    promised_metric:'EBITDA 24%+ by FY25', actual_metric:'EBITDA margin 22.8% in FY25',
    status:'partial', source:'concall', miss_reason:'Rural volume recovery slower; competitive pricing pressure in soaps/detergents' },

  { ticker:'BRITANNIA',  company_name:'Britannia Industries', sector:'fmcg',
    promise_type:'margin', promised_by:'FY24', announced_quarter:'Q4FY22',
    promise_text:'EBITDA margin target of 15%+ by FY24 on commodity tailwinds and premiumisation',
    promised_metric:'15%+ EBITDA by FY24', actual_metric:'~13.1% EBITDA in FY24',
    status:'partial', source:'concall', miss_reason:'Wheat and sugar prices remained elevated longer than expected' },

  { ticker:'NESTLEIND',  company_name:'Nestlé India',        sector:'fmcg',
    promise_type:'capex', promised_by:'FY26', announced_quarter:'Q2FY23',
    promise_text:'₹5,000 Cr capex over 3–4 years to double manufacturing capacity — 10th factory planned',
    promised_amount_cr:5000, promised_metric:'10th factory + 2x capacity by FY27',
    actual_amount_cr:2200, status:'on_track', source:'concall', notes:'Sanand (Gujarat) factory inaugurated FY25' },

  // ── RETAIL / CONSUMER DISCRETIONARY ───────────────────────────────────────
  { ticker:'TITAN',      company_name:'Titan Company',       sector:'retail',
    promise_type:'revenue', promised_by:'FY27', announced_quarter:'Q1FY24',
    promise_text:'3x revenue growth to ₹70,000 Cr by FY27 across jewellery, watches, eyewear',
    promised_amount_cr:70000, promised_metric:'₹70,000 Cr revenue by FY27',
    actual_amount_cr:52000, actual_metric:'~₹52,000 Cr revenue FY25',
    status:'on_track', source:'investor_day' },

  { ticker:'TRENT',      company_name:'Trent (Zudio)',       sector:'retail',
    promise_type:'expansion', promised_by:'FY26', announced_quarter:'Q2FY23',
    promise_text:'Open 200+ new Zudio stores per year to reach 1,000+ stores by FY26',
    promised_metric:'1,000 Zudio stores by FY26', actual_metric:'~870 Zudio stores by Q4FY25',
    status:'on_track', source:'concall', notes:'Fastest growing apparel retailer in India' },

  { ticker:'DMART',      company_name:'DMart',               sector:'retail',
    promise_type:'expansion', promised_by:'FY26', announced_quarter:'Q3FY23',
    promise_text:'40–45 new stores per year; DMart Ready (online) to reach profitable scale',
    promised_metric:'40–45 stores/year', actual_metric:'~40 stores added FY25',
    status:'on_track', source:'concall' },

  // ── PHARMA ─────────────────────────────────────────────────────────────────
  { ticker:'SUNPHARMA',  company_name:'Sun Pharmaceutical',  sector:'pharma',
    promise_type:'revenue', promised_by:'FY25', announced_quarter:'Q2FY23',
    promise_text:'US specialty revenue (Ilumya, Cequa, Winlevi) to cross $500M by FY25',
    promised_metric:'$500M US specialty by FY25', actual_metric:'~$450M US specialty in FY25',
    status:'partial', source:'concall', miss_reason:'Ilumya market share growth slower than projected; Cequa ramp-up moderate' },

  { ticker:'DRREDDY',    company_name:"Dr Reddy's Labs",     sector:'pharma',
    promise_type:'capex', promised_by:'FY26', announced_quarter:'Q1FY24',
    promise_text:'₹3,500 Cr R&D + capex over FY24–26 for biosimilars, peptides and Sputnik V scale-up',
    promised_amount_cr:3500, promised_metric:'10 biosimilar launches by FY27',
    status:'on_track', source:'annual_report' },

  { ticker:'CIPLA',      company_name:'Cipla',               sector:'pharma',
    promise_type:'margin', promised_by:'FY25', announced_quarter:'Q2FY23',
    promise_text:'EBITDA margin to reach 25%+ by FY25 with US branded generics and India prescription mix',
    promised_metric:'25%+ EBITDA by FY25', actual_metric:'24.5% EBITDA in FY25',
    status:'partial', source:'concall', miss_reason:'Advair generic pricing competitive; US price erosion 3–5%/year' },

  { ticker:'DIVISLAB',   company_name:"Divi's Laboratories", sector:'pharma',
    promise_type:'capex', promised_by:'FY26', announced_quarter:'Q3FY23',
    promise_text:'₹3,500 Cr capex for Kakinada SEZ Phase 3 and API capacity expansion for custom synthesis',
    promised_amount_cr:3500, promised_metric:'Kakinada Phase 3 + 40% capacity addition',
    actual_amount_cr:1800, status:'on_track', source:'concall' },

  // ── INFRA / CAPITAL GOODS ──────────────────────────────────────────────────
  { ticker:'LT',         company_name:'Larsen & Toubro',     sector:'infra',
    promise_type:'revenue', promised_by:'FY25', announced_quarter:'Q4FY23',
    promise_text:'Order inflow target of ₹2.5 lakh Cr for FY25 under Lakshya 2026 strategy',
    promised_amount_cr:250000, promised_metric:'₹2.5 lakh Cr order inflow FY25',
    actual_amount_cr:296000, actual_metric:'₹2.96 lakh Cr order inflow FY25',
    status:'delivered', source:'concall', notes:'Exceeded target by 18%; Middle East infra and domestic defence drove beat' },

  { ticker:'LT',         company_name:'Larsen & Toubro',     sector:'infra',
    promise_type:'margin', promised_by:'FY26', announced_quarter:'Q2FY24',
    promise_text:'Core E&C EBITDA margin to expand to 11% by FY26 from ~8.5% baseline',
    promised_metric:'11% E&C EBITDA by FY26', actual_metric:'~9.3% in FY25',
    status:'watch', source:'concall', notes:'Legacy fixed-price projects dragging margin; new orders at better rates' },

  { ticker:'SIEMENS',    company_name:'Siemens India',       sector:'capital_goods',
    promise_type:'capex', promised_by:'FY26', announced_quarter:'Q1FY24',
    promise_text:'₹3,200 Cr capex in India for energy and transportation manufacturing scale-up by FY26',
    promised_amount_cr:3200, promised_metric:'New Goa traction motors plant + transformer expansion',
    status:'on_track', source:'annual_report' },

  // ── METALS / MINING ────────────────────────────────────────────────────────
  { ticker:'HINDALCO',   company_name:'Hindalco Industries', sector:'metals',
    promise_type:'capex', promised_by:'FY27', announced_quarter:'Q2FY23',
    promise_text:'Novelis $4.5B growth capex for FY24–FY27 — Bay Minette greenfield + recycling centres',
    promised_amount_cr:37500, promised_metric:'Bay Minette plant 600,000 MT/year by FY27',
    actual_amount_cr:14000, status:'on_track', source:'investor_day',
    notes:'Bay Minette on track for FY27 commissioning; $800M capex in FY25 alone' },

  { ticker:'VEDL',       company_name:'Vedanta',             sector:'metals',
    promise_type:'expansion', promised_by:'FY25', announced_quarter:'Q4FY23',
    promise_text:'Complete demerger into 6 separately listed entities by FY25 — Zinc, Aluminium, Power, Oil, Iron, Base Metals',
    promised_metric:'6 listed entities by FY25', actual_metric:'Demerger not complete as of Q4FY25',
    status:'missed', source:'concall', miss_reason:'Lenders and minority shareholders objected; NCLT process ongoing; massive group debt',
    notes:'Vedanta Resources debt ~$6B remains key overhang; demerger timeline slipped to FY27' },

  { ticker:'COALINDIA',  company_name:'Coal India',          sector:'mining',
    promise_type:'capacity', promised_by:'FY26', announced_quarter:'Q2FY23',
    promise_text:'Achieve 1 billion tonne annual production by FY26 — up from 703 MT in FY23',
    promised_metric:'1 billion tonne by FY26', actual_metric:'~773 MT in FY25',
    status:'missed', source:'annual_report', miss_reason:'Environmental clearance delays; state-level protests; infrastructure (rail) bottlenecks',
    notes:'Target revised to 1 BT by FY30' },

  // ── AVIATION ───────────────────────────────────────────────────────────────
  { ticker:'INTERGLOBE', company_name:'IndiGo (InterGlobe)', sector:'aviation',
    promise_type:'expansion', promised_by:'FY28', announced_quarter:'Q4FY23',
    promise_text:'Fleet expansion to 400 aircraft by FY28; international routes to grow to 30% of capacity',
    promised_metric:'400 aircraft by FY28', actual_metric:'~390 aircraft by Q4FY25',
    status:'on_track', source:'concall', notes:'Pratt & Whitney engine grounding reduced utilisation in FY24' },

  { ticker:'INTERGLOBE', company_name:'IndiGo (InterGlobe)', sector:'aviation',
    promise_type:'margin', promised_by:'FY25', announced_quarter:'Q2FY24',
    promise_text:'EBITDA margin to recover to 18–20% by FY25 post P&W engine disruption resolution',
    promised_metric:'18–20% EBITDA by FY25', actual_metric:'14.8% EBITDA FY25',
    status:'partial', source:'concall', miss_reason:'P&W engine groundings lasted longer; AOG-related costs elevated through FY25' },

  // ── SPECIALTY CHEMICALS ────────────────────────────────────────────────────
  { ticker:'PIIND',      company_name:'PI Industries',       sector:'chemicals',
    promise_type:'capex', promised_by:'FY26', announced_quarter:'Q2FY22',
    promise_text:'₹4,000 Cr capex in CSM (contract synthesis) expansion at Jambusar and new sites by FY26',
    promised_amount_cr:4000, promised_metric:'2x CSM revenue by FY26',
    actual_amount_cr:3200, status:'on_track', source:'concall' },

  { ticker:'AARTIIND',   company_name:'Aarti Industries',    sector:'chemicals',
    promise_type:'capex', promised_by:'FY27', announced_quarter:'Q2FY22',
    promise_text:'₹4,000 Cr capex over 5 years for specialty chemicals — nitro-chlorobenzene chain and new pharma intermediates',
    promised_amount_cr:4000, promised_metric:'₹10,000 Cr revenue by FY27',
    actual_amount_cr:2800, status:'on_track', source:'annual_report' },

  { ticker:'DEEPAKNITR', company_name:'Deepak Nitrite',      sector:'chemicals',
    promise_type:'capex', promised_by:'FY26', announced_quarter:'Q3FY23',
    promise_text:'₹2,000 Cr capex for phenolics complex Phase 2 and new performance products by FY26',
    promised_amount_cr:2000, promised_metric:'Phase 2 phenolics + 3 new product lines',
    status:'on_track', source:'concall' },

  // ── REAL ESTATE ────────────────────────────────────────────────────────────
  { ticker:'DLF',        company_name:'DLF',                 sector:'realestate',
    promise_type:'revenue', promised_by:'FY27', announced_quarter:'Q1FY24',
    promise_text:'New sales (pre-sales) of ₹17,000 Cr per year by FY27 — luxury and super-luxury focus',
    promised_amount_cr:17000, promised_metric:'₹17,000 Cr pre-sales/year by FY27',
    actual_amount_cr:14778, actual_metric:'₹14,778 Cr pre-sales in FY25',
    status:'on_track', source:'investor_day' },

  { ticker:'GODREJPROP', company_name:'Godrej Properties',   sector:'realestate',
    promise_type:'revenue', promised_by:'FY25', announced_quarter:'Q2FY24',
    promise_text:'Pre-sales of ₹20,000 Cr in FY25 — 10 new launches across Mumbai, Pune, Bengaluru',
    promised_amount_cr:20000, promised_metric:'₹20,000 Cr pre-sales FY25',
    actual_amount_cr:22500, actual_metric:'₹22,500 Cr pre-sales FY25',
    status:'delivered', source:'concall', notes:'Exceeded by 12.5%; strong Mumbai launches drove beat' },

]

async function seed() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(CREATE)

    let count = 0
    for (const p of PROMISES) {
      await client.query(`
        INSERT INTO capex_promises
          (ticker, company_name, sector, promise_type, promise_text, promised_amount_cr,
           promised_metric, promised_by, announced_quarter, actual_amount_cr, actual_metric,
           status, miss_reason, source, notes)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      `, [
        p.ticker, p.company_name, p.sector, p.promise_type, p.promise_text,
        p.promised_amount_cr ?? null, p.promised_metric ?? null, p.promised_by, p.announced_quarter,
        p.actual_amount_cr ?? null, p.actual_metric ?? null,
        p.status, p.miss_reason ?? null, p.source ?? null, p.notes ?? null,
      ])
      count++
    }

    await client.query('COMMIT')
    console.log(`✅ Seeded ${count} promises`)

    const { rows } = await client.query(`
      SELECT status, count(*) FROM capex_promises GROUP BY status ORDER BY status
    `)
    console.table(rows)

    const { rows: sectors } = await client.query(`
      SELECT sector, count(*) FROM capex_promises GROUP BY sector ORDER BY count DESC
    `)
    console.table(sectors)
  } catch (e) {
    await client.query('ROLLBACK')
    console.error('❌ Failed:', e.message)
    throw e
  } finally {
    client.release()
    await pool.end()
  }
}

seed()
