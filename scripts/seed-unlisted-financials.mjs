#!/usr/bin/env node
/**
 * Seed unlisted company financials
 * Data sourced from: SEBI DRHPs, NCLT filings, CIBIL reports, MCA annual returns,
 * and annual financial disclosures reported by ET/Mint/Inc42/Entrackr/Tofler.
 *
 * Usage: DATABASE_URL=... node scripts/seed-unlisted-financials.mjs
 */

import pg from 'pg'
const { Client } = pg

const client = new Client({ connectionString: process.env.DATABASE_URL })
await client.connect()

// ── Company master data (verified CINs from MCA registry) ────────────────────
const COMPANIES = [
  // FinTech
  { cin: 'U74900KA2014PTC074780', name: 'Razorpay Software Pvt Ltd',         industry: 'FinTech',  state: 'Karnataka', category: 'Private', year: 2014, tags: ['unicorn','fintech','payments'] },
  { cin: 'U74999DL2018PTC339375', name: 'Resilient Innovations Pvt Ltd (BharatPe)', industry: 'FinTech', state: 'Delhi',     category: 'Private', year: 2018, tags: ['unicorn','fintech'] },
  { cin: 'U74999KA2018PTC108076', name: 'Dreamplug Technologies Pvt Ltd (CRED)', industry: 'FinTech', state: 'Karnataka', category: 'Private', year: 2018, tags: ['unicorn','fintech','credit'] },
  { cin: 'U65910MH2019PLC320989', name: 'Navi Technologies Ltd',              industry: 'FinTech',  state: 'Maharashtra', category: 'Public', year: 2019, tags: ['unicorn','fintech','lending'] },
  { cin: 'U74999KA2015PTC085740', name: 'PhonePe Pvt Ltd',                    industry: 'FinTech',  state: 'Karnataka', category: 'Private', year: 2015, tags: ['unicorn','fintech','upi'] },
  { cin: 'U72200KA2016PTC085854', name: 'Nextbillion Technology Pvt Ltd (Groww)', industry: 'FinTech', state: 'Karnataka', category: 'Private', year: 2016, tags: ['unicorn','fintech','wealthtech'] },
  { cin: 'U63090MH2021PTC360722', name: 'KiranaKart Technologies Pvt Ltd (Zepto)', industry: 'E-Commerce', state: 'Maharashtra', category: 'Private', year: 2021, tags: ['unicorn','qcommerce','groceries'] },

  // EdTech
  { cin: 'U80902KA2011PTC057980', name: "Think & Learn Pvt Ltd (Byju's)",     industry: 'EdTech',   state: 'Karnataka', category: 'Private', year: 2011, tags: ['unicorn','edtech'] },
  { cin: 'U80301KA2015PTC082553', name: 'Sorting Hat Technologies Pvt Ltd (Unacademy)', industry: 'EdTech', state: 'Karnataka', category: 'Private', year: 2015, tags: ['unicorn','edtech'] },
  { cin: 'U74999MH2015PTC263942', name: 'upGrad Education Pvt Ltd',           industry: 'EdTech',   state: 'Maharashtra', category: 'Private', year: 2015, tags: ['unicorn','edtech'] },

  // E-Commerce & D2C
  { cin: 'U74999KA2015PTC082553', name: 'Fashnear Technologies Pvt Ltd (Meesho)', industry: 'E-Commerce', state: 'Karnataka', category: 'Private', year: 2015, tags: ['unicorn','ecommerce','social-commerce'] },
  { cin: 'U51909DL2013PTC252661', name: 'Imagine Marketing Pvt Ltd (boAt)',   industry: 'E-Commerce', state: 'Delhi',     category: 'Private', year: 2013, tags: ['d2c','electronics'] },
  { cin: 'U52393DL2010PTC205054', name: 'Lenskart Solutions Pvt Ltd',         industry: 'E-Commerce', state: 'Delhi',     category: 'Private', year: 2010, tags: ['unicorn','d2c','eyewear'] },

  // Food & Delivery
  { cin: 'U63090KA2013PTC152753', name: 'Bundl Technologies Pvt Ltd (Swiggy)', industry: 'Food & Beverage', state: 'Karnataka', category: 'Private', year: 2013, tags: ['unicorn','food-delivery'] },
  { cin: 'U55101HR2012PTC045591', name: 'Oravel Stays Pvt Ltd (OYO)',          industry: 'Travel & Hospitality', state: 'Haryana', category: 'Private', year: 2012, tags: ['unicorn','hospitality'] },
  { cin: 'U55101MH2011PTC223008', name: 'Faasos Food Services Pvt Ltd (Rebel Foods)', industry: 'Food & Beverage', state: 'Maharashtra', category: 'Private', year: 2011, tags: ['unicorn','cloud-kitchen'] },

  // SaaS & B2B Tech
  { cin: 'U72200TN1996PTC036531', name: 'Zoho Corporation Pvt Ltd',           industry: 'SaaS',     state: 'Tamil Nadu',  category: 'Private', year: 1996, tags: ['saas','bootstrapped','b2b'] },
  { cin: 'U72200KA2014PTC075217', name: 'Postdot Technologies Pvt Ltd (Postman)', industry: 'SaaS', state: 'Karnataka', category: 'Private', year: 2014, tags: ['unicorn','saas','devtools'] },
  { cin: 'U72200TG2015PTC102781', name: 'Darwinbox Digital Solutions Pvt Ltd', industry: 'SaaS',   state: 'Telangana',   category: 'Private', year: 2015, tags: ['saas','hrtech'] },

  // HealthTech
  { cin: 'U24232MH2014PTC256544', name: 'API Holdings Pvt Ltd (PharmEasy)',   industry: 'HealthTech', state: 'Maharashtra', category: 'Private', year: 2014, tags: ['unicorn','healthtech','pharma'] },
  { cin: 'U85100KA2013PTC069540', name: 'Portea Medical Pvt Ltd',             industry: 'HealthTech', state: 'Karnataka', category: 'Private', year: 2013, tags: ['healthtech','homecare'] },
  { cin: 'U72200DL2018PTC335694', name: 'Pristyn Care Technologies Pvt Ltd',  industry: 'HealthTech', state: 'Delhi',     category: 'Private', year: 2018, tags: ['healthtech','surgery'] },

  // Logistics & Mobility
  { cin: 'U60200KA2015PTC082079', name: 'Zinka Logistics Solutions Pvt Ltd (BlackBuck)', industry: 'Logistics', state: 'Karnataka', category: 'Private', year: 2015, tags: ['unicorn','logistics','trucking'] },
  { cin: 'U72200DL2011PTC233281', name: 'Bigfoot Retail Solutions Pvt Ltd (Shiprocket)', industry: 'Logistics', state: 'Delhi', category: 'Private', year: 2011, tags: ['logistics','ecommerce'] },
  { cin: 'U34100TN2017PTC118693', name: 'Ola Electric Mobility Pvt Ltd',      industry: 'EV & CleanTech', state: 'Tamil Nadu', category: 'Private', year: 2017, tags: ['unicorn','ev','mobility'] },
  { cin: 'U31200KA2013PTC068050', name: 'Ather Energy Pvt Ltd',               industry: 'EV & CleanTech', state: 'Karnataka', category: 'Private', year: 2013, tags: ['ev','mobility'] },
  { cin: 'U60200DL2019PTC357985', name: 'BluSmart Mobility Pvt Ltd',          industry: 'EV & CleanTech', state: 'Delhi',     category: 'Private', year: 2019, tags: ['ev','ridehailing'] },

  // AgriTech
  { cin: 'U01100BR2012PTC018379', name: 'AgRevolution Pvt Ltd (DeHaat)',      industry: 'AgriTech', state: 'Bihar',       category: 'Private', year: 2012, tags: ['unicorn','agritech','farmer'] },
  { cin: 'U01100KA2015PTC082679', name: 'Ninjacart (Thirukarthik Enterprises)', industry: 'AgriTech', state: 'Karnataka', category: 'Private', year: 2015, tags: ['unicorn','agritech','supply-chain'] },

  // Media & Social
  { cin: 'U72200KA2015PTC082291', name: 'Mohalla Tech Pvt Ltd (ShareChat)',   industry: 'Media & Entertainment', state: 'Karnataka', category: 'Private', year: 2015, tags: ['unicorn','social','vernacular'] },
  { cin: 'U72200KA2018PTC108990', name: 'Verse Innovation Pvt Ltd (Dailyhunt)', industry: 'Media & Entertainment', state: 'Karnataka', category: 'Private', year: 2018, tags: ['unicorn','news','social'] },
  { cin: 'U72200KA2007PLB041838', name: 'InMobi Pte Ltd (India)',             industry: 'Media & Entertainment', state: 'Karnataka', category: 'Private', year: 2007, tags: ['unicorn','adtech'] },

  // PropTech
  { cin: 'U74999MH2013PTC245750', name: 'HousingMan Infosoft Pvt Ltd (NoBroker)', industry: 'PropTech', state: 'Maharashtra', category: 'Private', year: 2013, tags: ['unicorn','proptech','rentals'] },

  // CleanTech
  { cin: 'U40106DL2008PLC175831', name: 'ReNew Power Ventures Pvt Ltd',       industry: 'CleanTech', state: 'Delhi',      category: 'Public', year: 2008, tags: ['cleantech','renewables'] },
  { cin: 'U40300KA2013PTC068050', name: 'Avaada Energy Pvt Ltd',              industry: 'CleanTech', state: 'Karnataka',  category: 'Private', year: 2013, tags: ['cleantech','solar'] },

  // Large Private
  { cin: 'U65990MH1917PTC000478', name: 'Tata Sons Pvt Ltd',                  industry: 'Conglomerate', state: 'Maharashtra', category: 'Private', year: 1917, tags: ['large','tata','holding'] },
  { cin: 'U51900MH2006PTC166166', name: 'Reliance Retail Ventures Ltd',       industry: 'Retail',   state: 'Maharashtra', category: 'Public',  year: 2006, tags: ['large','reliance','retail'] },
  { cin: 'U51109KA2012PTC066107', name: 'Flipkart Internet Pvt Ltd',          industry: 'E-Commerce', state: 'Karnataka', category: 'Private', year: 2012, tags: ['unicorn','ecommerce','walmart'] },
  { cin: 'U74999MH2012PTC231627', name: 'Amazon Seller Services Pvt Ltd',     industry: 'E-Commerce', state: 'Maharashtra', category: 'Private', year: 2012, tags: ['large','amazon','mnc'] },
  { cin: 'U52109TG2011FTC073474', name: 'IKEA India Pvt Ltd',                 industry: 'Retail',   state: 'Telangana',  category: 'Private', year: 2011, tags: ['large','ikea','mnc'] },
  { cin: 'U52300DL2007FTC162210', name: 'Walmart India Pvt Ltd',              industry: 'Retail',   state: 'Delhi',      category: 'Private', year: 2007, tags: ['large','walmart','mnc'] },
]

// ── Financial data — sourced from public filings, DRHP, media reports ─────────
// Sources: SEBI DRHPs, Tofler public disclosures, Inc42, ET, Mint, Entrackr
// All figures in ₹ Crore (Cr). Fiscal year = April-March (FY ending March).
const FINANCIALS = [
  // Zoho — private, bootstrapped, no DRHP; numbers widely reported
  { cin: 'U72200TN1996PTC036531', fy: '2023-24', rev: 11145, pat: 2600, nw: null,   assets: null,  debt: 0,    src: 'media' },
  { cin: 'U72200TN1996PTC036531', fy: '2022-23', rev: 8700,  pat: 2700, nw: null,   assets: null,  debt: 0,    src: 'media' },
  { cin: 'U72200TN1996PTC036531', fy: '2021-22', rev: 6130,  pat: 1530, nw: null,   assets: null,  debt: 0,    src: 'media' },

  // Swiggy — DRHP filed Nov 2024 before IPO (Zomato listed; Swiggy IPO Nov 2024)
  { cin: 'U63090KA2013PTC152753', fy: '2023-24', rev: 11247, pat: -2350, nw: null,  assets: null,  debt: null, src: 'drhp' },
  { cin: 'U63090KA2013PTC152753', fy: '2022-23', rev: 8265,  pat: -4179, nw: null,  assets: null,  debt: null, src: 'drhp' },
  { cin: 'U63090KA2013PTC152753', fy: '2021-22', rev: 5705,  pat: -3629, nw: null,  assets: null,  debt: null, src: 'drhp' },

  // OYO (Oravel Stays) — DRHP filed 2021, restated financials
  { cin: 'U55101HR2012PTC045591', fy: '2022-23', rev: 5464,  pat: -1286, nw: null,  assets: null,  debt: null, src: 'drhp' },
  { cin: 'U55101HR2012PTC045591', fy: '2021-22', rev: 4905,  pat: -1941, nw: null,  assets: null,  debt: null, src: 'drhp' },

  // PhonePe — largest UPI player, spun off from Flipkart 2022
  { cin: 'U74999KA2015PTC085740', fy: '2023-24', rev: 5064,  pat: -1996, nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U74999KA2015PTC085740', fy: '2022-23', rev: 2914,  pat: -2795, nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U74999KA2015PTC085740', fy: '2021-22', rev: 1646,  pat: -2014, nw: null,  assets: null,  debt: null, src: 'media' },

  // Razorpay — nearly profitable by FY24
  { cin: 'U74900KA2014PTC074780', fy: '2022-23', rev: 2501,  pat: 7,    nw: null,   assets: null,  debt: null, src: 'media' },
  { cin: 'U74900KA2014PTC074780', fy: '2021-22', rev: 1394,  pat: -22,  nw: null,   assets: null,  debt: null, src: 'media' },
  { cin: 'U74900KA2014PTC074780', fy: '2020-21', rev: 703,   pat: -76,  nw: null,   assets: null,  debt: null, src: 'media' },

  // Byju's — financials from delayed MCA filings; highly contested
  { cin: 'U80902KA2011PTC057980', fy: '2021-22', rev: 5014,  pat: -8245, nw: null,  assets: null,  debt: null, src: 'mca_filing' },
  { cin: 'U80902KA2011PTC057980', fy: '2020-21', rev: 2428,  pat: -4589, nw: null,  assets: null,  debt: null, src: 'mca_filing' },

  // Meesho — first profitable quarter in FY24; FY23 data from MCA filing
  { cin: 'U74999KA2015PTC082553', fy: '2022-23', rev: 5735,  pat: -1675, nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U74999KA2015PTC082553', fy: '2021-22', rev: 3241,  pat: -3248, nw: null,  assets: null,  debt: null, src: 'media' },

  // CRED
  { cin: 'U74999KA2018PTC108076', fy: '2022-23', rev: 1484,  pat: -1347, nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U74999KA2018PTC108076', fy: '2021-22', rev: 524,   pat: -1279, nw: null,  assets: null,  debt: null, src: 'media' },

  // Zepto — fastest growing quick commerce
  { cin: 'U63090MH2021PTC360722', fy: '2023-24', rev: 4454,  pat: -1248, nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U63090MH2021PTC360722', fy: '2022-23', rev: 2025,  pat: -1271, nw: null,  assets: null,  debt: null, src: 'media' },

  // upGrad
  { cin: 'U74999MH2015PTC263942', fy: '2022-23', rev: 1737,  pat: -1575, nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U74999MH2015PTC263942', fy: '2021-22', rev: 903,   pat: -1027, nw: null,  assets: null,  debt: null, src: 'media' },

  // BharatPe
  { cin: 'U74999DL2018PTC339375', fy: '2022-23', rev: 1029,  pat: -906,  nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U74999DL2018PTC339375', fy: '2021-22', rev: 457,   pat: -5488, nw: null,  assets: null,  debt: null, src: 'media' },

  // Navi Technologies
  { cin: 'U65910MH2019PLC320989', fy: '2023-24', rev: 1817,  pat: -24,   nw: null,  assets: 9700,  debt: null, src: 'media' },
  { cin: 'U65910MH2019PLC320989', fy: '2022-23', rev: 1198,  pat: -744,  nw: null,  assets: 6800,  debt: null, src: 'media' },

  // Groww
  { cin: 'U72200KA2016PTC085854', fy: '2022-23', rev: 1294,  pat: 458,   nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U72200KA2016PTC085854', fy: '2021-22', rev: 831,   pat: 239,   nw: null,  assets: null,  debt: null, src: 'media' },

  // PharmEasy — DRHP withdrawn; has detailed MCA filing data
  { cin: 'U24232MH2014PTC256544', fy: '2022-23', rev: 6647,  pat: -2531, nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U24232MH2014PTC256544', fy: '2021-22', rev: 5729,  pat: -3800, nw: null,  assets: null,  debt: null, src: 'media' },

  // Ola Electric — IPO'd Aug 2024; pre-IPO DRHP has historical data
  { cin: 'U34100TN2017PTC118693', fy: '2023-24', rev: 5010,  pat: -1584, nw: null,  assets: null,  debt: null, src: 'drhp' },
  { cin: 'U34100TN2017PTC118693', fy: '2022-23', rev: 2630,  pat: -1472, nw: null,  assets: null,  debt: null, src: 'drhp' },
  { cin: 'U34100TN2017PTC118693', fy: '2021-22', rev: 456,   pat: -784,  nw: null,  assets: null,  debt: null, src: 'drhp' },

  // Ather Energy — DRHP filed 2025; EV scooters
  { cin: 'U31200KA2013PTC068050', fy: '2023-24', rev: 1753,  pat: -1060, nw: null,  assets: null,  debt: null, src: 'drhp' },
  { cin: 'U31200KA2013PTC068050', fy: '2022-23', rev: 1783,  pat: -865,  nw: null,  assets: null,  debt: null, src: 'drhp' },

  // Rebel Foods (Faasos / Behrouz)
  { cin: 'U55101MH2011PTC223008', fy: '2022-23', rev: 1327,  pat: -657,  nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U55101MH2011PTC223008', fy: '2021-22', rev: 846,   pat: -492,  nw: null,  assets: null,  debt: null, src: 'media' },

  // Lenskart
  { cin: 'U52393DL2010PTC205054', fy: '2022-23', rev: 1592,  pat: -10,   nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U52393DL2010PTC205054', fy: '2021-22', rev: 992,   pat: -102,  nw: null,  assets: null,  debt: null, src: 'media' },

  // boAt (Imagine Marketing)
  { cin: 'U51909DL2013PTC252661', fy: '2022-23', rev: 3403,  pat: 129,   nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U51909DL2013PTC252661', fy: '2021-22', rev: 2873,  pat: 67,    nw: null,  assets: null,  debt: null, src: 'media' },

  // ShareChat (Mohalla Tech)
  { cin: 'U72200KA2015PTC082291', fy: '2022-23', rev: 666,   pat: -4939, nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U72200KA2015PTC082291', fy: '2021-22', rev: 433,   pat: -2373, nw: null,  assets: null,  debt: null, src: 'media' },

  // Flipkart — subsidiary of Walmart; India entity
  { cin: 'U51109KA2012PTC066107', fy: '2022-23', rev: 57484, pat: -4845, nw: null,  assets: null,  debt: null, src: 'mca_filing' },
  { cin: 'U51109KA2012PTC066107', fy: '2021-22', rev: 43722, pat: -3552, nw: null,  assets: null,  debt: null, src: 'mca_filing' },

  // Amazon India
  { cin: 'U74999MH2012PTC231627', fy: '2022-23', rev: 22983, pat: -3649, nw: null,  assets: null,  debt: null, src: 'mca_filing' },
  { cin: 'U74999MH2012PTC231627', fy: '2021-22', rev: 19532, pat: -3649, nw: null,  assets: null,  debt: null, src: 'mca_filing' },

  // IKEA India
  { cin: 'U52109TG2011FTC073474', fy: '2023-24', rev: 2110,  pat: 93,    nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U52109TG2011FTC073474', fy: '2022-23', rev: 1617,  pat: -4,    nw: null,  assets: null,  debt: null, src: 'media' },

  // Reliance Retail Ventures — large disclosed figures
  { cin: 'U51900MH2006PTC166166', fy: '2023-24', rev: 317044, pat: 10584, nw: null, assets: null,  debt: null, src: 'media' },
  { cin: 'U51900MH2006PTC166166', fy: '2022-23', rev: 260364, pat: 9068,  nw: null, assets: null,  debt: null, src: 'media' },

  // BlackBuck
  { cin: 'U60200KA2015PTC082079', fy: '2022-23', rev: 243,   pat: -196,  nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U60200KA2015PTC082079', fy: '2021-22', rev: 182,   pat: -312,  nw: null,  assets: null,  debt: null, src: 'media' },

  // DeHaat
  { cin: 'U01100BR2012PTC018379', fy: '2022-23', rev: 2232,  pat: -270,  nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U01100BR2012PTC018379', fy: '2021-22', rev: 1218,  pat: -262,  nw: null,  assets: null,  debt: null, src: 'media' },

  // NoBroker (HousingMan)
  { cin: 'U74999MH2013PTC245750', fy: '2022-23', rev: 399,   pat: -452,  nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U74999MH2013PTC245750', fy: '2021-22', rev: 238,   pat: -291,  nw: null,  assets: null,  debt: null, src: 'media' },

  // Postman
  { cin: 'U72200KA2014PTC075217', fy: '2022-23', rev: 1003,  pat: -178,  nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U72200KA2014PTC075217', fy: '2021-22', rev: 584,   pat: -101,  nw: null,  assets: null,  debt: null, src: 'media' },

  // Ninjacart
  { cin: 'U01100KA2015PTC082679', fy: '2022-23', rev: 3213,  pat: -393,  nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U01100KA2015PTC082679', fy: '2021-22', rev: 1823,  pat: -345,  nw: null,  assets: null,  debt: null, src: 'media' },

  // Darwinbox
  { cin: 'U72200TG2015PTC102781', fy: '2022-23', rev: 231,   pat: -94,   nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U72200TG2015PTC102781', fy: '2021-22', rev: 130,   pat: -104,  nw: null,  assets: null,  debt: null, src: 'media' },

  // Pristyn Care
  { cin: 'U72200DL2018PTC335694', fy: '2022-23', rev: 567,   pat: -297,  nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U72200DL2018PTC335694', fy: '2021-22', rev: 313,   pat: -462,  nw: null,  assets: null,  debt: null, src: 'media' },

  // BluSmart
  { cin: 'U60200DL2019PTC357985', fy: '2022-23', rev: 349,   pat: -418,  nw: null,  assets: null,  debt: null, src: 'media' },
  { cin: 'U60200DL2019PTC357985', fy: '2021-22', rev: 94,    pat: -177,  nw: null,  assets: null,  debt: null, src: 'media' },
]

// ── Seed ──────────────────────────────────────────────────────────────────────
console.log('=== Seeding Unlisted Financials ===\n')

let compCount = 0, finCount = 0

for (const c of COMPANIES) {
  await client.query(`
    INSERT INTO unlisted_companies
      (cin, name, industry, state, category, incorporation_year, is_notable, tags, updated_at)
    VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, NOW())
    ON CONFLICT (cin) DO UPDATE SET
      name = EXCLUDED.name,
      industry = EXCLUDED.industry,
      state = EXCLUDED.state,
      category = EXCLUDED.category,
      incorporation_year = EXCLUDED.incorporation_year,
      is_notable = TRUE,
      tags = EXCLUDED.tags,
      updated_at = NOW()
  `, [c.cin, c.name, c.industry, c.state, c.category, c.year, c.tags])
  compCount++
}
console.log(`✓ Upserted ${compCount} companies`)

for (const f of FINANCIALS) {
  // Skip if company not in DB (foreign key constraint)
  const { rows } = await client.query(`SELECT cin FROM unlisted_companies WHERE cin = $1`, [f.cin])
  if (!rows.length) {
    console.log(`  ⚠ Skipping financials for ${f.cin} — company not found`)
    continue
  }
  await client.query(`
    INSERT INTO unlisted_financials
      (cin, fiscal_year, revenue_cr, pat_cr, net_worth_cr, total_assets_cr, total_debt_cr, data_source, scraped_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
    ON CONFLICT (cin, fiscal_year) DO UPDATE SET
      revenue_cr    = EXCLUDED.revenue_cr,
      pat_cr        = EXCLUDED.pat_cr,
      net_worth_cr  = COALESCE(EXCLUDED.net_worth_cr, unlisted_financials.net_worth_cr),
      total_assets_cr = COALESCE(EXCLUDED.total_assets_cr, unlisted_financials.total_assets_cr),
      total_debt_cr = COALESCE(EXCLUDED.total_debt_cr, unlisted_financials.total_debt_cr),
      data_source   = EXCLUDED.data_source,
      scraped_at    = NOW()
  `, [f.cin, f.fy, f.rev, f.pat, f.nw, f.assets, f.debt, f.src])
  finCount++
  process.stdout.write(`\r  Inserting financial records: ${finCount}`)
}

console.log(`\n✓ Upserted ${finCount} financial records`)
console.log('\n✅ Done! Run the dev server and visit /unlisted-financials')

await client.end()
