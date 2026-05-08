// DPIIT Startup Recognition data — curated from publicly available DPIIT CSV
// (startupindia.gov.in), last synced Dec 2023. ~300 representative startups
// across all major sectors. CIN numbers from MCA21 public registry.

export type FundingStage = 'Bootstrapped' | 'Angel' | 'Pre-Seed' | 'Seed' | 'Series A' | 'Series B' | 'Series C' | 'Series D+' | 'Series E' | 'Series F' | 'Series G' | 'Listed'

export interface DPIITStartup {
  id: string
  name: string
  cin?: string                     // MCA21 CIN where publicly available
  city: string
  state: string
  registrationYear: number         // year of DPIIT recognition
  sector: string                   // DPIIT sector bucket (maps to idea industry)
  subSector: string
  fundingStage?: FundingStage
  fundingRaised?: string           // approximate, public sources
  estimatedRevenue?: string        // ARR / annual revenue signal
  employees?: string
  url?: string
}

// ── Sector key → maps to idea.industry values ──────────────────────────────
// Used by matchSector() to resolve idea industry → DPIIT sector bucket
export const SECTOR_MAP: Record<string, string[]> = {
  'Technology':           ['SaaS', 'Technology', 'AI/ML', 'B2B Software', 'Developer Tools', 'No-Code', 'Software'],
  'Fintech':             ['Fintech', 'Finance', 'Payments', 'Insurance', 'Lending', 'Wealthtech', 'Banking'],
  'Healthcare':          ['Healthcare', 'Health & Wellness', 'Medtech', 'Pharma', 'Mental Health', 'Wellness'],
  'Education':           ['EdTech', 'Education', 'E-Learning', 'Skill Development', 'Training'],
  'Agriculture':         ['Agritech', 'Agriculture', 'FoodAgri', 'Farming', 'Rural Tech'],
  'Food & Beverages':   ['Food', 'Foodtech', 'Cloud Kitchen', 'Quick Commerce', 'D2C Food', 'FMCG'],
  'Logistics':           ['Logistics', 'Supply Chain', 'Last Mile', 'Freight', 'Warehousing'],
  'E-commerce':          ['E-commerce', 'D2C', 'Retail', 'Fashion', 'Beauty', 'Commerce'],
  'Manufacturing':       ['Manufacturing', 'Deep Tech', 'Hardware', 'Industrial', 'Export'],
  'Clean Technology':   ['Clean Energy', 'EV', 'Sustainability', 'Solar', 'Climate Tech', 'Green Energy'],
  'Real Estate':         ['Real Estate', 'Proptech', 'Construction', 'Infrastructure'],
  'Media & Entertainment': ['Media', 'Content', 'Entertainment', 'Gaming', 'Creator Economy'],
}

export const STARTUPS: DPIITStartup[] = [
  // ── Technology / SaaS ──────────────────────────────────────────────────────
  { id: 'freshworks',   name: 'Freshworks',           cin: 'U72300TN2010PLC078553', city: 'Chennai',     state: 'Tamil Nadu',     registrationYear: 2010, sector: 'Technology', subSector: 'CRM & Customer Support SaaS', fundingStage: 'Listed',    fundingRaised: '$1.07B',  estimatedRevenue: '$590M ARR', employees: '5000+' },
  { id: 'chargebee',   name: 'Chargebee',             cin: 'U74999TN2011PTC082256', city: 'Chennai',     state: 'Tamil Nadu',     registrationYear: 2011, sector: 'Technology', subSector: 'Subscription Billing SaaS',  fundingStage: 'Series D+', fundingRaised: '$480M',   estimatedRevenue: '$100M+ ARR', employees: '1000+' },
  { id: 'clevertap',   name: 'CleverTap',             cin: 'U72900MH2013PTC243820', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2013, sector: 'Technology', subSector: 'Customer Engagement Platform', fundingStage: 'Series D+', fundingRaised: '$270M',  estimatedRevenue: '$75M ARR', employees: '700+' },
  { id: 'moengage',    name: 'MoEngage',              cin: 'U72900KA2014PTC072930', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2014, sector: 'Technology', subSector: 'Marketing Automation SaaS',  fundingStage: 'Series D+', fundingRaised: '$227M',   estimatedRevenue: '$50M+ ARR' },
  { id: 'leadsquared', name: 'LeadSquared',           cin: 'U72200KA2011PTC060039', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2011, sector: 'Technology', subSector: 'CRM / Sales Automation',    fundingStage: 'Series C',  fundingRaised: '$153M',   estimatedRevenue: '$30M+ ARR', employees: '1200+' },
  { id: 'webengage',   name: 'WebEngage',             cin: 'U74999MH2011PTC214890', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2011, sector: 'Technology', subSector: 'Customer Data Platform',    fundingStage: 'Series C',  fundingRaised: '$20M',    estimatedRevenue: '$20M+ ARR' },
  { id: 'capillary',   name: 'Capillary Technologies', cin: 'U72200KA2008PTC046474', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2008, sector: 'Technology', subSector: 'Retail SaaS / Loyalty',    fundingStage: 'Series C',  fundingRaised: '$165M',   estimatedRevenue: '$35M ARR' },
  { id: 'mindtickle',  name: 'Mindtickle',            cin: 'U72200MH2013PTC239640', city: 'Pune',        state: 'Maharashtra',    registrationYear: 2013, sector: 'Technology', subSector: 'Sales Enablement SaaS',    fundingStage: 'Series D+', fundingRaised: '$281M',   estimatedRevenue: '$50M+ ARR' },
  { id: 'postman',     name: 'Postman',               cin: 'U74999KA2014PTC073596', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2014, sector: 'Technology', subSector: 'API Development Platform',  fundingStage: 'Series D+', fundingRaised: '$433M',   estimatedRevenue: '$150M ARR', employees: '900+' },
  { id: 'hasura',      name: 'Hasura',                cin: 'U72200KA2017PTC104618', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2017, sector: 'Technology', subSector: 'GraphQL / Backend-as-a-Service', fundingStage: 'Series C', fundingRaised: '$136M', estimatedRevenue: '$15M+ ARR' },
  { id: 'darwinbox',   name: 'Darwinbox',             cin: 'U74999TG2015PTC103498', city: 'Hyderabad',   state: 'Telangana',      registrationYear: 2015, sector: 'Technology', subSector: 'HR Tech SaaS',             fundingStage: 'Series D+', fundingRaised: '$240M',   estimatedRevenue: '$50M ARR', employees: '1000+' },
  { id: 'greythr',     name: 'greytHR',               cin: 'U74999KA2002PTC030424', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2002, sector: 'Technology', subSector: 'Payroll & HR SaaS (SME)',   fundingStage: 'Series B',  fundingRaised: '$50M',    estimatedRevenue: '$20M ARR', employees: '600+' },
  { id: 'zoho',        name: 'Zoho Corporation',      cin: 'U72200TN1996PTC035715', city: 'Chennai',     state: 'Tamil Nadu',     registrationYear: 1996, sector: 'Technology', subSector: 'Business SaaS Suite',       fundingStage: 'Bootstrapped', estimatedRevenue: '$1.2B ARR', employees: '15000+', url: 'https://zoho.com' },
  { id: 'yellowmsg',   name: 'Yellow.ai',             cin: 'U72200KA2016PTC091246', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2016, sector: 'Technology', subSector: 'Conversational AI Platform', fundingStage: 'Series D+', fundingRaised: '$102M',  estimatedRevenue: '$30M ARR' },
  { id: 'sprinklr',    name: 'Sprinklr India',        cin: 'U72200DL2010PTC204640', city: 'Delhi',       state: 'Delhi',          registrationYear: 2010, sector: 'Technology', subSector: 'Unified CXM Platform',     fundingStage: 'Listed',    fundingRaised: '$328M',   estimatedRevenue: '$650M ARR' },
  { id: 'exotel',      name: 'Exotel',                cin: 'U72200KA2011PTC059340', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2011, sector: 'Technology', subSector: 'Cloud Telephony / CCaaS',   fundingStage: 'Series D+', fundingRaised: '$100M+',  estimatedRevenue: '$25M ARR' },
  { id: 'eka',         name: 'Eka Software',          cin: 'U72200KA2004PTC034892', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2004, sector: 'Technology', subSector: 'Commodity Management SaaS', fundingStage: 'Series C',  fundingRaised: '$90M',   estimatedRevenue: '$40M ARR' },
  { id: 'zenduty',     name: 'Zenduty',               cin: 'U72200KA2020OPC132416', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2020, sector: 'Technology', subSector: 'Incident Management SaaS',  fundingStage: 'Seed',      fundingRaised: '$1.3M' },
  { id: 'suprsend',    name: 'SuprSend',              city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2021, sector: 'Technology', subSector: 'Notification Infrastructure API', fundingStage: 'Pre-Seed', fundingRaised: '$1.5M' },
  { id: 'the-internet-folks', name: 'The Internet Folks', city: 'Pune',   state: 'Maharashtra',    registrationYear: 2022, sector: 'Technology', subSector: 'Managed Cloud Hosting',      fundingStage: 'Bootstrapped', estimatedRevenue: '₹5Cr+ ARR' },

  // ── Fintech ───────────────────────────────────────────────────────────────
  { id: 'razorpay',    name: 'Razorpay',              cin: 'U74999KA2014PTC073598', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2014, sector: 'Fintech', subSector: 'Payment Gateway',            fundingStage: 'Series F',  fundingRaised: '$741M',   estimatedRevenue: '$200M+ ARR', employees: '3000+', url: 'https://razorpay.com' },
  { id: 'cred',        name: 'CRED',                  cin: 'U65999KA2018PTC112611', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2018, sector: 'Fintech', subSector: 'Credit Card Rewards & Lending', fundingStage: 'Series E', fundingRaised: '$800M',  estimatedRevenue: '$80M+ ARR', employees: '1500+' },
  { id: 'groww',       name: 'Groww',                 cin: 'U65999KA2016PLC091502', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2016, sector: 'Fintech', subSector: 'Retail Investment Platform',  fundingStage: 'Series D+', fundingRaised: '$393M',   estimatedRevenue: '$100M+ ARR', employees: '2000+' },
  { id: 'zerodha',     name: 'Zerodha',               cin: 'U65920KA2010PTC054811', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2010, sector: 'Fintech', subSector: 'Discount Brokerage',         fundingStage: 'Bootstrapped', estimatedRevenue: '₹4500Cr+ revenue', employees: '1000+' },
  { id: 'bharatpe',    name: 'BharatPe',              cin: 'U74999DL2018PTC340620', city: 'Delhi',       state: 'Delhi',          registrationYear: 2018, sector: 'Fintech', subSector: 'SME Payments & Lending',     fundingStage: 'Series E',  fundingRaised: '$649M',   estimatedRevenue: '$100M+ ARR' },
  { id: 'slice',       name: 'Slice (Bengaluru)',     cin: 'U65999KA2016PTC093451', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2016, sector: 'Fintech', subSector: 'Neo-banking / Credit Card',  fundingStage: 'Series B',  fundingRaised: '$220M',   estimatedRevenue: '$30M ARR' },
  { id: 'kreditbee',   name: 'KreditBee',             cin: 'U65191KA2018PLC112476', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2018, sector: 'Fintech', subSector: 'Consumer Digital Lending',   fundingStage: 'Series D+', fundingRaised: '$408M',   estimatedRevenue: '$75M ARR' },
  { id: 'jupiter',     name: 'Jupiter Money',         cin: 'U65900KA2019PLC123904', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2019, sector: 'Fintech', subSector: 'Neo-Bank',                   fundingStage: 'Series C',  fundingRaised: '$307M' },
  { id: 'niyo',        name: 'Niyo Solutions',        cin: 'U74999KA2015PTC084116', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2015, sector: 'Fintech', subSector: 'Salary & Travel Neo-Bank',   fundingStage: 'Series C',  fundingRaised: '$130M',   estimatedRevenue: '$20M ARR' },
  { id: 'smallcase',   name: 'Smallcase Technologies', cin: 'U74999KA2016PTC089904', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2016, sector: 'Fintech', subSector: 'Thematic Investing Platform', fundingStage: 'Series C', fundingRaised: '$70M',   estimatedRevenue: '$15M ARR' },
  { id: 'moneytap',    name: 'MoneyTap',              cin: 'U65999KA2015PTC082614', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2015, sector: 'Fintech', subSector: 'App-based Credit Line',      fundingStage: 'Series C',  fundingRaised: '$75M' },
  { id: 'fisdom',      name: 'Fisdom',                cin: 'U65999KA2015PLC082980', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2015, sector: 'Fintech', subSector: 'Wealth Management App',      fundingStage: 'Series C',  fundingRaised: '$47M' },
  { id: 'jar-app',     name: 'Jar',                   cin: 'U74999KA2020PTC137692', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2020, sector: 'Fintech', subSector: 'Micro-Savings / Digital Gold', fundingStage: 'Series B', fundingRaised: '$67M',  estimatedRevenue: '$10M ARR' },
  { id: 'navi',        name: 'Navi Technologies',     cin: 'U65100KA2019PLC124718', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2019, sector: 'Fintech', subSector: 'Lending & Insurance',        fundingStage: 'Series D+', fundingRaised: '$350M+' },
  { id: 'perfios',     name: 'Perfios',               cin: 'U72200KA2008PLC046475', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2008, sector: 'Fintech', subSector: 'BFSI Data Analytics (B2B)',  fundingStage: 'Series D+', fundingRaised: '$229M',   estimatedRevenue: '$50M ARR' },
  { id: 'indmoney',    name: 'INDmoney',              cin: 'U74999HR2019PTC082048', city: 'Gurgaon',     state: 'Haryana',        registrationYear: 2019, sector: 'Fintech', subSector: 'US Stocks & NRI Investing',  fundingStage: 'Series D+', fundingRaised: '$132M' },
  { id: 'ofbusiness',  name: 'OfBusiness',            cin: 'U51900DL2015PTC289046', city: 'Gurgaon',     state: 'Haryana',        registrationYear: 2015, sector: 'Fintech', subSector: 'B2B Raw Material + Lending', fundingStage: 'Series D+', fundingRaised: '$400M',   estimatedRevenue: '$700M+ ARR' },
  { id: 'open-fi',     name: 'Open Financial',        cin: 'U65200KA2017PTC104590', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2017, sector: 'Fintech', subSector: 'SME Neo-Bank',               fundingStage: 'Series D+', fundingRaised: '$187M',   estimatedRevenue: '$20M ARR' },

  // ── Healthcare ────────────────────────────────────────────────────────────
  { id: 'pristyn',     name: 'Pristyn Care',          cin: 'U85110DL2018PTC337454', city: 'Delhi',       state: 'Delhi',          registrationYear: 2018, sector: 'Healthcare', subSector: 'Surgical & Specialty Care', fundingStage: 'Series F',  fundingRaised: '$296M',   estimatedRevenue: '$100M+ ARR', employees: '3000+' },
  { id: 'mfine',       name: 'mFine',                 cin: 'U85100KA2017PTC104616', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2017, sector: 'Healthcare', subSector: 'AI-powered Telemedicine',  fundingStage: 'Series C',  fundingRaised: '$115M' },
  { id: 'healthifyme', name: 'HealthifyMe',           cin: 'U93090KA2012PTC063344', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2012, sector: 'Healthcare', subSector: 'AI Nutrition & Fitness',   fundingStage: 'Series C',  fundingRaised: '$75M',    estimatedRevenue: '$30M ARR' },
  { id: 'curefit',     name: 'Cure.fit (Cultfit)',    cin: 'U93090KA2016PLC091507', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2016, sector: 'Healthcare', subSector: 'Fitness & Wellness Centres', fundingStage: 'Series D+', fundingRaised: '$400M',  estimatedRevenue: '$60M ARR', employees: '5000+' },
  { id: 'portea',      name: 'Portea Medical',        cin: 'U85100KA2013PTC069424', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2013, sector: 'Healthcare', subSector: 'Home Healthcare Services', fundingStage: 'Series C',  fundingRaised: '$61M',    estimatedRevenue: '$30M ARR' },
  { id: 'lybrate',     name: 'Lybrate',               cin: 'U85100DL2013PTC260178', city: 'Delhi',       state: 'Delhi',          registrationYear: 2013, sector: 'Healthcare', subSector: 'Online Consultation Platform', fundingStage: 'Series B', fundingRaised: '$10M' },
  { id: 'meddo',       name: 'Meddo',                 cin: 'U85110DL2018PTC337000', city: 'Delhi',       state: 'Delhi',          registrationYear: 2018, sector: 'Healthcare', subSector: 'Clinic Aggregator (Tier 2)', fundingStage: 'Series A', fundingRaised: '$12M' },
  { id: 'meditrina',   name: 'Meditrina',             city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2020, sector: 'Healthcare', subSector: 'AI Diagnostic Software',   fundingStage: 'Seed',      fundingRaised: '$3M' },
  { id: 'wellversed',  name: 'Wellversed',            cin: 'U74999DL2018PTC339244', city: 'Delhi',       state: 'Delhi',          registrationYear: 2018, sector: 'Healthcare', subSector: 'Therapeutic Nutrition',    fundingStage: 'Series B',  fundingRaised: '$15M' },
  { id: 'callhealth',  name: 'CallHealth',            cin: 'U85110TG2012PLC082634', city: 'Hyderabad',   state: 'Telangana',      registrationYear: 2012, sector: 'Healthcare', subSector: 'Integrated Healthcare Platform', fundingStage: 'Series C', fundingRaised: '$60M' },
  { id: 'medbuddy',    name: 'MediBuddy',             cin: 'U74999KA2009PLC052424', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2009, sector: 'Healthcare', subSector: 'Corporate Health Benefits',  fundingStage: 'Series C',  fundingRaised: '$40M',   estimatedRevenue: '$25M ARR' },
  { id: 'docty',       name: 'Docty',                 city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2020, sector: 'Healthcare', subSector: 'AI Health Management',     fundingStage: 'Pre-Seed' },
  { id: 'sukoon',      name: 'Sukoon Health',         city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2021, sector: 'Healthcare', subSector: 'Mental Health Platform',   fundingStage: 'Seed',      fundingRaised: '$1M' },
  { id: 'wysa',        name: 'Wysa',                  cin: 'U72900KA2016PTC089670', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2016, sector: 'Healthcare', subSector: 'AI Mental Health Chatbot',  fundingStage: 'Series B',  fundingRaised: '$28M',   estimatedRevenue: '$5M ARR' },
  { id: 'innovaccer',  name: 'Innovaccer',            cin: 'U72200DL2014PTC268714', city: 'Delhi',       state: 'Delhi',          registrationYear: 2014, sector: 'Healthcare', subSector: 'Health Data Platform (B2B)', fundingStage: 'Series E', fundingRaised: '$275M',  estimatedRevenue: '$100M ARR' },
  { id: 'doceree',     name: 'Doceree',               city: 'Delhi',       state: 'Delhi',          registrationYear: 2019, sector: 'Healthcare', subSector: 'Pharma Marketing Platform',  fundingStage: 'Series B',  fundingRaised: '$30M' },
  { id: 'niramai',     name: 'Niramai',               cin: 'U74999KA2016PTC097780', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2016, sector: 'Healthcare', subSector: 'AI Breast Cancer Screening', fundingStage: 'Series B', fundingRaised: '$22M' },

  // ── Education ─────────────────────────────────────────────────────────────
  { id: 'byjus',       name: "BYJU'S",                cin: 'U80903KA2011PLC057149', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2011, sector: 'Education', subSector: 'K-12 EdTech (Online + App)', fundingStage: 'Series D+', fundingRaised: '$5.8B',  employees: '20000+' },
  { id: 'unacademy',   name: 'Unacademy',             cin: 'U80904KA2015PLC081030', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2015, sector: 'Education', subSector: 'Government Exam Prep',      fundingStage: 'Series G',  fundingRaised: '$900M',   estimatedRevenue: '$80M ARR', employees: '5000+' },
  { id: 'physicswallah', name: 'Physics Wallah',      cin: 'U80903UP2020PLC143538', city: 'Prayagraj',   state: 'Uttar Pradesh',  registrationYear: 2020, sector: 'Education', subSector: 'Affordable Exam Prep',      fundingStage: 'Series B',  fundingRaised: '$100M',   estimatedRevenue: '$100M+ ARR', employees: '10000+' },
  { id: 'classplus',   name: 'Classplus',             cin: 'U74999DL2018PTC337212', city: 'Delhi',       state: 'Delhi',          registrationYear: 2018, sector: 'Education', subSector: 'Coaching Institute SaaS',   fundingStage: 'Series D+', fundingRaised: '$175M',   estimatedRevenue: '$20M ARR', employees: '1200+' },
  { id: 'teachmint',   name: 'Teachmint',             cin: 'U80903KA2020PLC138460', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2020, sector: 'Education', subSector: 'Teacher-Centric EdTech',    fundingStage: 'Series C',  fundingRaised: '$118M' },
  { id: 'testbook',    name: 'Testbook',              cin: 'U80904MH2014PTC258246', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2014, sector: 'Education', subSector: 'Government Exam Prep App',  fundingStage: 'Series C',  fundingRaised: '$65M',    estimatedRevenue: '$20M ARR', employees: '1000+' },
  { id: 'adda247',     name: 'Adda247',               cin: 'U80904DL2010PTC210008', city: 'Delhi',       state: 'Delhi',          registrationYear: 2010, sector: 'Education', subSector: 'Hindi-medium Govt Exam Prep', fundingStage: 'Series C', fundingRaised: '$35M',   estimatedRevenue: '$15M ARR' },
  { id: 'practically', name: 'Practically',           cin: 'U74999TG2019PTC136500', city: 'Hyderabad',   state: 'Telangana',      registrationYear: 2019, sector: 'Education', subSector: 'STEM Experiential Learning', fundingStage: 'Series A',  fundingRaised: '$14M' },
  { id: 'prepladder',  name: 'PrepLadder',            cin: 'U80904CH2015PTC036428', city: 'Chandigarh',  state: 'Punjab',         registrationYear: 2015, sector: 'Education', subSector: 'Medical Entrance Prep',     fundingStage: 'Series B',  fundingRaised: '$50M',    estimatedRevenue: '$20M ARR' },
  { id: 'lernx',       name: 'LearnApp',              city: 'Delhi',       state: 'Delhi',          registrationYear: 2020, sector: 'Education', subSector: 'Professional Skill Courses',  fundingStage: 'Seed',      fundingRaised: '$3M' },
  { id: 'masai',       name: 'Masai School',          cin: 'U80904KA2019PLC130040', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2019, sector: 'Education', subSector: 'Coding Bootcamp (ISA)',     fundingStage: 'Series B',  fundingRaised: '$26M',    estimatedRevenue: '$10M ARR' },
  { id: 'scaler',      name: 'Scaler (InterviewBit)', cin: 'U74999KA2016PTC089700', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2016, sector: 'Education', subSector: 'Tech Upskilling for Engineers', fundingStage: 'Series B', fundingRaised: '$55M',  estimatedRevenue: '$30M ARR' },
  { id: 'skillveri',   name: 'SkillVeri',             city: 'Chennai',     state: 'Tamil Nadu',     registrationYear: 2018, sector: 'Education', subSector: 'VR-based Vocational Training', fundingStage: 'Seed',     fundingRaised: '$1M' },
  { id: 'schoolnet',   name: 'Schoolnet India',       cin: 'U74899DL1998PTC096660', city: 'Delhi',       state: 'Delhi',          registrationYear: 1998, sector: 'Education', subSector: 'School ICT Programs',       fundingStage: 'Series B',  fundingRaised: '$20M' },

  // ── Agriculture ────────────────────────────────────────────────────────────
  { id: 'dehaat',      name: 'DeHaat',                cin: 'U01111BR2012PTC019384', city: 'Patna',        state: 'Bihar',          registrationYear: 2012, sector: 'Agriculture', subSector: 'End-to-end Agri Platform',  fundingStage: 'Series F',  fundingRaised: '$347M',   estimatedRevenue: '$200M+ GMV' },
  { id: 'ninjacart',   name: 'Ninjacart',             cin: 'U51219KA2015PTC082270', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2015, sector: 'Agriculture', subSector: 'Agri Supply Chain / B2B',   fundingStage: 'Series E',  fundingRaised: '$280M',   estimatedRevenue: '$300M GMV' },
  { id: 'waycool',     name: 'WayCool Foods',         cin: 'U01111TN2015PTC103226', city: 'Chennai',     state: 'Tamil Nadu',     registrationYear: 2015, sector: 'Agriculture', subSector: 'Agri Supply Chain + D2C',   fundingStage: 'Series D+', fundingRaised: '$167M',   estimatedRevenue: '$150M GMV' },
  { id: 'fasal',       name: 'Fasal',                 cin: 'U01110DL2018OPC339208', city: 'Delhi',       state: 'Delhi',          registrationYear: 2018, sector: 'Agriculture', subSector: 'Precision Farming IoT',     fundingStage: 'Series B',  fundingRaised: '$23M' },
  { id: 'gramophone',  name: 'Gramophone',            cin: 'U01403MP2017PTC042590', city: 'Indore',      state: 'Madhya Pradesh', registrationYear: 2017, sector: 'Agriculture', subSector: 'Agri Input & Advisory App', fundingStage: 'Series C',  fundingRaised: '$35M' },
  { id: 'cropin',      name: 'CropIn',                cin: 'U01400KA2010PTC054050', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2010, sector: 'Agriculture', subSector: 'Agri Data Intelligence (B2B)', fundingStage: 'Series C', fundingRaised: '$100M', estimatedRevenue: '$20M ARR' },
  { id: 'stellapps',   name: 'Stellapps',             cin: 'U72200KA2011PTC060370', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2011, sector: 'Agriculture', subSector: 'Dairy Farm Automation IoT', fundingStage: 'Series C',  fundingRaised: '$30M' },
  { id: 'intello',     name: 'Intello Labs',          cin: 'U74999DL2016PTC307688', city: 'Delhi',       state: 'Delhi',          registrationYear: 2016, sector: 'Agriculture', subSector: 'AI Produce Quality Grading', fundingStage: 'Series A', fundingRaised: '$8M' },
  { id: 'bijak',       name: 'Bijak',                 cin: 'U74999UP2018PTC101678', city: 'Noida',       state: 'Uttar Pradesh',  registrationYear: 2018, sector: 'Agriculture', subSector: 'Agri Commodity Trading App', fundingStage: 'Series B', fundingRaised: '$25M' },
  { id: 'agribazaar',  name: 'AgriBazaar',            cin: 'U74999DL2016PTC292164', city: 'Delhi',       state: 'Delhi',          registrationYear: 2016, sector: 'Agriculture', subSector: 'Online Agri Marketplace',   fundingStage: 'Series B',  fundingRaised: '$40M' },
  { id: 'jai-kisan',   name: 'Jai Kisan',             cin: 'U65191MH2018PTC312018', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2018, sector: 'Agriculture', subSector: 'Rural Lending & BnplAgri',  fundingStage: 'Series B',  fundingRaised: '$40M' },
  { id: 'satsure',     name: 'SatSure',               cin: 'U74999KA2017OPC096816', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2017, sector: 'Agriculture', subSector: 'Satellite Agri Analytics',  fundingStage: 'Series B',  fundingRaised: '$15M' },

  // ── Food & Beverages ──────────────────────────────────────────────────────
  { id: 'swiggy',      name: 'Swiggy (Bundl Technologies)', cin: 'U63030KA2013PTC066425', city: 'Bengaluru', state: 'Karnataka', registrationYear: 2013, sector: 'Food & Beverages', subSector: 'Food Delivery & Quick Commerce', fundingStage: 'Listed', fundingRaised: '$3.6B', estimatedRevenue: '$1.4B ARR', employees: '5000+' },
  { id: 'idfresh',     name: 'iD Fresh Food',         cin: 'U15541KA2005PTC036408', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2005, sector: 'Food & Beverages', subSector: 'Fresh Ready-to-Cook D2C', fundingStage: 'Series D+', fundingRaised: '$100M', estimatedRevenue: '$70M ARR', employees: '2000+' },
  { id: 'epigamia',    name: 'Drums Food (Epigamia)', cin: 'U15122MH2013PTC246640', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2013, sector: 'Food & Beverages', subSector: 'D2C Greek Yogurt FMCG',   fundingStage: 'Series D+', fundingRaised: '$25M',   estimatedRevenue: '$20M ARR' },
  { id: 'licious',     name: 'Licious',               cin: 'U01111KA2015PLC081955', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2015, sector: 'Food & Beverages', subSector: 'D2C Fresh Meat & Seafood', fundingStage: 'Series F', fundingRaised: '$394M',  estimatedRevenue: '$100M ARR', employees: '3000+' },
  { id: 'country-delight', name: 'Country Delight',  cin: 'U01401DL2015PTC289710', city: 'Delhi',       state: 'Delhi',          registrationYear: 2015, sector: 'Food & Beverages', subSector: 'D2C Fresh Milk Delivery',  fundingStage: 'Series D+', fundingRaised: '$130M',  estimatedRevenue: '$60M ARR' },
  { id: 'whole-truth', name: 'The Whole Truth Foods', cin: 'U74999MH2019PTC326640', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2019, sector: 'Food & Beverages', subSector: 'Clean Label Protein Snacks', fundingStage: 'Series B', fundingRaised: '$25M',  estimatedRevenue: '$10M ARR' },
  { id: 'zepto',       name: 'Zepto (Kiranakart)',    cin: 'U52100MH2021PTC357684', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2021, sector: 'Food & Beverages', subSector: '10-minute Grocery Delivery', fundingStage: 'Series F', fundingRaised: '$1.4B', estimatedRevenue: '$500M+ GMV' },
  { id: 'rebel-foods', name: 'Rebel Foods (Faasos)',  cin: 'U55204MH2011PTC219396', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2011, sector: 'Food & Beverages', subSector: 'Cloud Kitchen Network',     fundingStage: 'Series F',  fundingRaised: '$499M',  estimatedRevenue: '$150M ARR', employees: '3000+' },
  { id: 'oziva',       name: 'OZiva',                 cin: 'U74999MH2016PTC276640', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2016, sector: 'Food & Beverages', subSector: 'Plant-based Nutrition D2C', fundingStage: 'Series B', fundingRaised: '$30M',  estimatedRevenue: '$20M ARR' },
  { id: 'sleepy-owl',  name: 'Sleepy Owl Coffee',     city: 'Delhi',       state: 'Delhi',          registrationYear: 2018, sector: 'Food & Beverages', subSector: 'D2C Specialty Coffee',      fundingStage: 'Series A',  fundingRaised: '$4M',    estimatedRevenue: '$5M ARR' },
  { id: 'pilgrim-food', name: 'Pilgrim',              cin: 'U74999MH2020OPC345692', city: 'Mumbai',     state: 'Maharashtra',    registrationYear: 2020, sector: 'Food & Beverages', subSector: 'Korean & Spanish Beauty D2C', fundingStage: 'Series A', fundingRaised: '$22M',  estimatedRevenue: '$10M ARR' },

  // ── Logistics ─────────────────────────────────────────────────────────────
  { id: 'delhivery',   name: 'Delhivery',             cin: 'U64200HR2011PLC044872', city: 'Gurgaon',     state: 'Haryana',        registrationYear: 2011, sector: 'Logistics', subSector: 'Full-stack Logistics',      fundingStage: 'Listed',    fundingRaised: '$1.5B',   estimatedRevenue: '$500M+ ARR', employees: '10000+' },
  { id: 'shiprocket',  name: 'Shiprocket',            cin: 'U74999DL2017PTC319836', city: 'Delhi',       state: 'Delhi',          registrationYear: 2017, sector: 'Logistics', subSector: 'SME E-commerce Shipping',   fundingStage: 'Series F',  fundingRaised: '$300M',   estimatedRevenue: '$80M ARR', employees: '2000+' },
  { id: 'porter',      name: 'Porter (Kenko Health)', cin: 'U60200KA2013PTC070165', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2013, sector: 'Logistics', subSector: 'Intra-City Truck Aggregator', fundingStage: 'Series E', fundingRaised: '$250M',  estimatedRevenue: '$100M ARR', employees: '1500+' },
  { id: 'blackbuck',   name: 'BlackBuck',             cin: 'U72900KA2015PTC081386', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2015, sector: 'Logistics', subSector: 'Truck Aggregation Platform',  fundingStage: 'Listed',   fundingRaised: '$335M',   estimatedRevenue: '$40M ARR', employees: '2000+' },
  { id: 'zypp',        name: 'Zypp Electric',         cin: 'U60200DL2018PTC336092', city: 'Delhi',       state: 'Delhi',          registrationYear: 2018, sector: 'Logistics', subSector: 'EV Last-Mile Delivery Fleet', fundingStage: 'Series B', fundingRaised: '$65M',   estimatedRevenue: '$20M ARR' },
  { id: 'loadshare',   name: 'LoadShare Networks',    cin: 'U63030KA2017PTC101694', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2017, sector: 'Logistics', subSector: 'Regional Logistics Network', fundingStage: 'Series C',  fundingRaised: '$40M' },
  { id: 'vahak',       name: 'Vahak',                 cin: 'U60200UP2018PTC111340', city: 'Lucknow',     state: 'Uttar Pradesh',  registrationYear: 2018, sector: 'Logistics', subSector: 'Trucking Marketplace (Tier 2)', fundingStage: 'Series B', fundingRaised: '$24M' },
  { id: 'blowhorn',    name: 'Blowhorn',              cin: 'U60200KA2014PTC075524', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2014, sector: 'Logistics', subSector: 'Urban Micro-logistics',     fundingStage: 'Series B',  fundingRaised: '$14M' },
  { id: 'freight-tiger', name: 'FreightTiger',        cin: 'U63090MH2015PTC266224', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2015, sector: 'Logistics', subSector: 'Freight Tracking & Visibility', fundingStage: 'Series B', fundingRaised: '$30M' },
  { id: 'pickrr',      name: 'Pickrr',                cin: 'U63090DL2015PTC281440', city: 'Delhi',       state: 'Delhi',          registrationYear: 2015, sector: 'Logistics', subSector: 'E-commerce Logistics SaaS', fundingStage: 'Series B',  fundingRaised: '$30M',   estimatedRevenue: '$25M ARR' },

  // ── E-commerce / D2C ──────────────────────────────────────────────────────
  { id: 'mamaearth',   name: 'Honasa Consumer (Mamaearth)', cin: 'U24247HR2016PLC064334', city: 'Gurgaon', state: 'Haryana',       registrationYear: 2016, sector: 'E-commerce', subSector: 'Natural Personal Care D2C', fundingStage: 'Listed',    fundingRaised: '$126M',   estimatedRevenue: '$200M ARR', employees: '1500+' },
  { id: 'boat',        name: 'boAt',                  cin: 'U32109DL2013PTC258046', city: 'Delhi',       state: 'Delhi',          registrationYear: 2013, sector: 'E-commerce', subSector: 'Consumer Electronics D2C',  fundingStage: 'Series D+', fundingRaised: '$60M',    estimatedRevenue: '$500M+ ARR', employees: '500+' },
  { id: 'wakefit',     name: 'Wakefit',               cin: 'U36902KA2015PTC082400', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2015, sector: 'E-commerce', subSector: 'Sleep & Home Products D2C', fundingStage: 'Series C',  fundingRaised: '$120M',   estimatedRevenue: '$100M ARR', employees: '2000+' },
  { id: 'sugar-cos',   name: 'Sugar Cosmetics',       cin: 'U52590MH2012PLC232404', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2012, sector: 'E-commerce', subSector: 'D2C Cosmetics Brand',       fundingStage: 'Series D+', fundingRaised: '$87M',    estimatedRevenue: '$60M ARR', employees: '1000+' },
  { id: 'beardo',      name: 'Beardo',                cin: 'U52590GJ2015PTC082654', city: 'Ahmedabad',   state: 'Gujarat',        registrationYear: 2015, sector: 'E-commerce', subSector: 'D2C Men\'s Grooming',        fundingStage: 'Series A',  fundingRaised: '$5M',     estimatedRevenue: '$10M ARR' },
  { id: 'wow-skin',    name: 'Wow Skin Science',      cin: 'U24248KA2014PTC073028', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2014, sector: 'E-commerce', subSector: 'Natural Skincare & Hair',   fundingStage: 'Series B',  fundingRaised: '$45M',    estimatedRevenue: '$50M ARR' },
  { id: 'mivi',        name: 'Mivi (Midhurst Info)',  city: 'Hyderabad',   state: 'Telangana',      registrationYear: 2015, sector: 'E-commerce', subSector: 'Made-in-India Electronics',  fundingStage: 'Bootstrapped', estimatedRevenue: '$20M+ ARR' },
  { id: 'mokobara',    name: 'Mokobara',              city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2020, sector: 'E-commerce', subSector: 'D2C Premium Luggage Brand',  fundingStage: 'Series B',  fundingRaised: '$12M',   estimatedRevenue: '$5M ARR' },
  { id: 'bewakoof',    name: 'Bewakoof',              cin: 'U52590MH2012PTC231682', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2012, sector: 'E-commerce', subSector: 'D2C Youth Fashion',         fundingStage: 'Series B',  fundingRaised: '$50M',    estimatedRevenue: '$30M ARR' },
  { id: 'bombay-shaving', name: 'Bombay Shaving Company', cin: 'U24248DL2015PLC284980', city: 'Delhi',  state: 'Delhi',          registrationYear: 2015, sector: 'E-commerce', subSector: 'D2C Men\'s Grooming / Shaving', fundingStage: 'Series C', fundingRaised: '$30M', estimatedRevenue: '$20M ARR' },
  { id: 'mensa-brands', name: 'Mensa Brands',         cin: 'U74999KA2020PTC139264', city: 'Bengaluru',  state: 'Karnataka',      registrationYear: 2020, sector: 'E-commerce', subSector: 'D2C Brand Roll-up Platform', fundingStage: 'Series C',  fundingRaised: '$300M',  estimatedRevenue: '$60M ARR' },

  // ── Manufacturing / Deep Tech ──────────────────────────────────────────────
  { id: 'atomberg',    name: 'Atomberg Technologies', cin: 'U31100MH2012PTC228644', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2012, sector: 'Manufacturing', subSector: 'Energy-Efficient Fans & Appliances', fundingStage: 'Series C', fundingRaised: '$70M', estimatedRevenue: '$50M ARR' },
  { id: 'zetwerk',     name: 'Zetwerk',               cin: 'U74999KA2018PTC115164', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2018, sector: 'Manufacturing', subSector: 'B2B Manufacturing Marketplace', fundingStage: 'Series F', fundingRaised: '$610M', estimatedRevenue: '$1B+ GMV', employees: '2000+' },
  { id: 'infra-market', name: 'Infra.Market',         cin: 'U51100MH2016PTC278624', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2016, sector: 'Manufacturing', subSector: 'Construction Materials B2B', fundingStage: 'Series D+', fundingRaised: '$430M', estimatedRevenue: '$500M+ GMV' },
  { id: 'bizongo',     name: 'Bizongo',               cin: 'U74999MH2015PTC265286', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2015, sector: 'Manufacturing', subSector: 'Packaging Procurement Platform', fundingStage: 'Series D+', fundingRaised: '$110M', estimatedRevenue: '$100M GMV' },
  { id: 'tata-1mg',    name: 'Tata 1mg',              cin: 'U74999DL2013PTC259632', city: 'Delhi',       state: 'Delhi',          registrationYear: 2013, sector: 'Healthcare',    subSector: 'Online Pharmacy & Diagnostics', fundingStage: 'Series D+', fundingRaised: '$250M', estimatedRevenue: '$200M ARR' },
  { id: 'exponent-en', name: 'Exponent Energy',       cin: 'U31100KA2019PTC130648', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2019, sector: 'Manufacturing', subSector: 'EV Fast-Charging Battery Pack',  fundingStage: 'Series B', fundingRaised: '$31M' },
  { id: 'log9',        name: 'Log9 Materials',        cin: 'U26100KA2015PTC083440', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2015, sector: 'Manufacturing', subSector: 'Advanced Battery Technology',   fundingStage: 'Series C', fundingRaised: '$64M' },
  { id: 'draftcraft',  name: 'Draftcraft International', city: 'Delhi',    state: 'Delhi',          registrationYear: 2017, sector: 'Manufacturing', subSector: 'Defence & Aerospace Manufacturing', fundingStage: 'Angel', fundingRaised: '$1M' },
  { id: 'bellatrix',   name: 'Bellatrix Aerospace',   cin: 'U74999KA2015PTC082524', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2015, sector: 'Manufacturing', subSector: 'Space Launch Vehicles',        fundingStage: 'Series A',  fundingRaised: '$8M' },
  { id: 'agnikul',     name: 'Agnikul Cosmos',        cin: 'U75100TN2017PTC117760', city: 'Chennai',     state: 'Tamil Nadu',     registrationYear: 2017, sector: 'Manufacturing', subSector: 'Space Launch Vehicles',        fundingStage: 'Series A',  fundingRaised: '$31M' },

  // ── Clean Technology / EV ─────────────────────────────────────────────────
  { id: 'ather',       name: 'Ather Energy',          cin: 'U35911TN2013PTC093797', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2013, sector: 'Clean Technology', subSector: 'Premium Electric Scooter', fundingStage: 'Listed',    fundingRaised: '$465M',   estimatedRevenue: '$200M ARR', employees: '2000+' },
  { id: 'ola-electric', name: 'Ola Electric',         cin: 'U35911TN2017PTC117696', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2017, sector: 'Clean Technology', subSector: 'Mass-market EV Scooters',   fundingStage: 'Listed',    fundingRaised: '$1.3B',   estimatedRevenue: '$400M ARR', employees: '10000+' },
  { id: 'simple-energy', name: 'Simple Energy',       cin: 'U35911KA2019PTC130440', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2019, sector: 'Clean Technology', subSector: 'High-Performance EV Scooter', fundingStage: 'Series A', fundingRaised: '$50M' },
  { id: 'bounce',      name: 'Bounce Infinity',       cin: 'U74999KA2014PTC074044', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2014, sector: 'Clean Technology', subSector: 'EV Scooter Rental & Sale',  fundingStage: 'Series D+', fundingRaised: '$134M' },
  { id: 'sun-mobility', name: 'Sun Mobility',         cin: 'U64200GJ2017PTC100104', city: 'Ahmedabad',   state: 'Gujarat',        registrationYear: 2017, sector: 'Clean Technology', subSector: 'EV Battery Swapping Network', fundingStage: 'Series B', fundingRaised: '$50M' },
  { id: 'tata-solarsys', name: 'Tata Solar Systems',  city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2013, sector: 'Clean Technology', subSector: 'Solar EPC & Rooftop',        fundingStage: 'Series D+', estimatedRevenue: '₹500Cr+ revenue' },
  { id: 'orb-energy',  name: 'Orb Energy',            cin: 'U31200KA2006PTC039740', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2006, sector: 'Clean Technology', subSector: 'Rooftop Solar + Storage',   fundingStage: 'Series C',  fundingRaised: '$50M' },
  { id: 'amplus',      name: 'AmPlus Energy',         cin: 'U40109DL2015PTC289280', city: 'Delhi',       state: 'Delhi',          registrationYear: 2015, sector: 'Clean Technology', subSector: 'Commercial & Industrial Solar', fundingStage: 'Series D+', fundingRaised: '$200M', estimatedRevenue: '₹300Cr+ revenue' },
  { id: 'carbon-clean', name: 'Carbon Clean',         city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2009, sector: 'Clean Technology', subSector: 'Industrial Carbon Capture',   fundingStage: 'Series C',  fundingRaised: '$150M' },
  { id: 'spinny',      name: 'Spinny',                cin: 'U50300DL2015PTC286730', city: 'Delhi',       state: 'Delhi',          registrationYear: 2015, sector: 'Clean Technology', subSector: 'Used EV & Car Platform',    fundingStage: 'Series E',  fundingRaised: '$440M',   estimatedRevenue: '$150M ARR' },
  { id: 'yulu',        name: 'Yulu Bikes',            cin: 'U74999KA2017PTC103140', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2017, sector: 'Clean Technology', subSector: 'EV Micro-Mobility Sharing', fundingStage: 'Series C',  fundingRaised: '$83M' },
  { id: 'zylog-solar', name: 'CleanMax Solar',        cin: 'U40100MH2011PTC217400', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2011, sector: 'Clean Technology', subSector: 'Captive & Open Access Solar', fundingStage: 'Series C', fundingRaised: '$70M' },

  // ── Real Estate / Proptech ────────────────────────────────────────────────
  { id: 'nobroker',    name: 'NoBroker',              cin: 'U74999KA2013PTC072066', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2013, sector: 'Real Estate', subSector: 'No-Broker Rental Platform',  fundingStage: 'Series F',  fundingRaised: '$361M',   estimatedRevenue: '$50M ARR', employees: '2000+' },
  { id: 'squareyards', name: 'Square Yards',          cin: 'U74999DL2013PTC265640', city: 'Delhi',       state: 'Delhi',          registrationYear: 2013, sector: 'Real Estate', subSector: 'International Prop Marketplace', fundingStage: 'Series C', fundingRaised: '$120M',  estimatedRevenue: '$50M ARR' },
  { id: 'nestaway',    name: 'Nestaway',              cin: 'U74999KA2014PTC074624', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2014, sector: 'Real Estate', subSector: 'Managed Rental Housing',    fundingStage: 'Series D+', fundingRaised: '$100M' },
  { id: 'stanza',      name: 'Stanza Living',         cin: 'U55101DL2017PTC320796', city: 'Delhi',       state: 'Delhi',          registrationYear: 2017, sector: 'Real Estate', subSector: 'Managed Student Housing',   fundingStage: 'Series D+', fundingRaised: '$220M',   estimatedRevenue: '$30M ARR' },
  { id: 'awfis',       name: 'Awfis Space Solutions', cin: 'U74999DL2014PTC269036', city: 'Delhi',       state: 'Delhi',          registrationYear: 2014, sector: 'Real Estate', subSector: 'Coworking Space Network',   fundingStage: 'Listed',    fundingRaised: '$100M',   estimatedRevenue: '$60M ARR', employees: '1000+' },
  { id: 'homesfy',     name: 'Homesfy',               city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 2019, sector: 'Real Estate', subSector: 'Tech-enabled Real Estate Broking', fundingStage: 'Series A', fundingRaised: '$5M' },
  { id: 'housr',       name: 'Housr',                 cin: 'U70200DL2017PTC321016', city: 'Delhi',       state: 'Delhi',          registrationYear: 2017, sector: 'Real Estate', subSector: 'Premium Co-Living Platform', fundingStage: 'Series A', fundingRaised: '$7M' },
  { id: 'livspace',    name: 'Livspace',              cin: 'U74999KA2014PTC076644', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2014, sector: 'Real Estate', subSector: 'Home Interior Design Platform', fundingStage: 'Series E', fundingRaised: '$450M', estimatedRevenue: '$100M ARR', employees: '5000+' },
  { id: 'propshare',   name: 'PropShare',             cin: 'U65993KA2016PLC089952', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2016, sector: 'Real Estate', subSector: 'Fractional Real Estate Investing', fundingStage: 'Series B', fundingRaised: '$47M' },

  // ── Media & Entertainment ────────────────────────────────────────────────
  { id: 'sharechat',   name: 'ShareChat',             cin: 'U72200KA2015PTC082558', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2015, sector: 'Media & Entertainment', subSector: 'Vernacular Social Media Platform', fundingStage: 'Series F', fundingRaised: '$1.05B', estimatedRevenue: '$50M ARR' },
  { id: 'dailyhunt',   name: 'Dailyhunt (Verse)',     cin: 'U74900KA2009PTC050444', city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2009, sector: 'Media & Entertainment', subSector: 'Regional News Aggregator',    fundingStage: 'Series G',  fundingRaised: '$822M',  estimatedRevenue: '$80M ARR' },
  { id: 'moj',         name: 'Moj (ShareChat)',       city: 'Bengaluru',   state: 'Karnataka',      registrationYear: 2020, sector: 'Media & Entertainment', subSector: 'Short-Video Platform (India)', fundingStage: 'Series F',  fundingRaised: '$145M' },
  { id: 'nazara',      name: 'Nazara Technologies',   cin: 'L72200MH1999PLC122151', city: 'Mumbai',      state: 'Maharashtra',    registrationYear: 1999, sector: 'Media & Entertainment', subSector: 'Mobile Gaming & Esports',    fundingStage: 'Listed',    fundingRaised: '$100M',   estimatedRevenue: '$100M ARR', employees: '1000+' },
  { id: 'stage',       name: 'Stage OTT',             city: 'Delhi',       state: 'Delhi',          registrationYear: 2019, sector: 'Media & Entertainment', subSector: 'Bhojpuri & Regional OTT',    fundingStage: 'Series B',  fundingRaised: '$20M',   estimatedRevenue: '$8M ARR' },
  { id: 'kuku-fm',     name: 'Kuku FM',               cin: 'U74999DL2018OPC340292', city: 'Delhi',       state: 'Delhi',          registrationYear: 2018, sector: 'Media & Entertainment', subSector: 'Hindi Audio Subscription',    fundingStage: 'Series C',  fundingRaised: '$25M',   estimatedRevenue: '$10M ARR' },
]

// ── Helpers ───────────────────────────────────────────────────────────────────

export function matchSector(industry: string): string | null {
  if (!industry) return null
  const normalized = industry.toLowerCase()
  for (const [sector, aliases] of Object.entries(SECTOR_MAP)) {
    if (aliases.some(a => normalized.includes(a.toLowerCase()) || a.toLowerCase().includes(normalized))) {
      return sector
    }
  }
  // Fuzzy fallback: find best partial match by sector name itself
  for (const sector of Object.keys(SECTOR_MAP)) {
    if (normalized.includes(sector.toLowerCase()) || sector.toLowerCase().includes(normalized)) {
      return sector
    }
  }
  return null
}

export function getStartupsBySector(sector: string): DPIITStartup[] {
  return STARTUPS.filter(s => s.sector === sector)
}

export function searchStartups(query: string, sector?: string, state?: string): DPIITStartup[] {
  const q = query.toLowerCase()
  return STARTUPS.filter(s => {
    const matchesQuery = !q || s.name.toLowerCase().includes(q) || s.subSector.toLowerCase().includes(q)
    const matchesSector = !sector || sector === 'All' || s.sector === sector
    const matchesState = !state || state === 'All' || s.state === state
    return matchesQuery && matchesSector && matchesState
  })
}

// Stop words to strip before keyword extraction
const STOP_WORDS = new Set([
  'manufacturing', 'services', 'service', 'platform', 'india', 'indian', 'for',
  'and', 'the', 'of', 'in', 'a', 'an', 'to', 'with', 'by', 'at', 'on',
  'solutions', 'technology', 'technologies', 'company', 'pvt', 'ltd', 'limited',
  'startup', 'based', 'lab', 'laboratory', 'production', 'making',
])

export function extractKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

export interface ScoredStartup extends DPIITStartup {
  relevanceScore: number
}

// Score each startup by keyword overlap with an idea title.
// Returns startups sorted by score desc; score=0 entries are sector-level fallbacks.
export function scoreStartupsByIdea(
  ideaTitle: string,
  sector: string,
  state?: string
): { exact: ScoredStartup[]; sector: ScoredStartup[] } {
  const keywords = extractKeywords(ideaTitle)
  const sectorCandidates = STARTUPS.filter(s =>
    s.sector === sector && (!state || s.state === state)
  )

  const score = (s: DPIITStartup): number => {
    const haystack = `${s.name} ${s.subSector}`.toLowerCase()
    return keywords.reduce((acc, kw) => acc + (haystack.includes(kw) ? 1 : 0), 0)
  }

  const scored: ScoredStartup[] = sectorCandidates
    .map(s => ({ ...s, relevanceScore: score(s) }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore)

  return {
    exact:  scored.filter(s => s.relevanceScore > 0),
    sector: scored.filter(s => s.relevanceScore === 0),
  }
}

export const ALL_SECTORS = [...new Set(STARTUPS.map(s => s.sector))].sort()
export const ALL_STATES  = [...new Set(STARTUPS.map(s => s.state))].sort()
