import { createClient } from '@sanity/client'
import { randomBytes } from 'crypto'
import { readFileSync } from 'fs'
import { homedir } from 'os'

const cfg = JSON.parse(readFileSync(`${homedir()}/.config/sanity/config.json`, 'utf8'))
const client = createClient({ projectId: '5p3rso81', dataset: 'production', apiVersion: '2024-01-01', token: cfg.authToken, useCdn: false })

const k = () => randomBytes(6).toString('hex')

const DATA = {
  // ── Creator Economy ─────────────────────────────────────────────────────────
  'brand-deal-marketplace-influencers': {
    google_trends_keyword: 'influencer marketing platform India',
    unit_economics: { cac: 5000, ltv: 40000, ltv_cac_ratio: 8.0, avg_order_value: 15000, churn_rate: 25, payback_period: 8, context: 'Commission 10–15% on brand deals; average deal ₹10,000–₹50,000; creator stickiness high once first deal closes.' },
    competitors: [
      { name: 'Qoruz', type: 'Indian Startup', description: 'Influencer analytics + marketplace; well-funded, 300+ brands.' },
      { name: 'Winkl', type: 'Indian Startup', description: 'Creator-brand collaboration platform; strong Instagram focus.' },
      { name: 'Pulpkey', type: 'Indian Startup', description: 'Micro-influencer marketplace; niche brand deals.' },
    ],
  },
  'creator-analytics-dashboard': {
    google_trends_keyword: 'YouTube analytics tool India',
    unit_economics: { cac: 800, ltv: 6000, ltv_cac_ratio: 7.5, avg_order_value: 500, churn_rate: 30, payback_period: 5, context: 'SaaS subscription ₹299–₹999/month; freemium converts 8% to paid; agency plans ₹5,000+ are high-value.' },
    competitors: [
      { name: 'Vidooly', type: 'Indian Startup', description: 'Video analytics for OTT and creators; enterprise focus.' },
      { name: 'Tubics', type: 'Global SaaS', description: 'YouTube SEO tool; not India-specific.' },
      { name: 'Social Blade', type: 'Global Platform', description: 'Free analytics; no actionable insights for Indian creators.' },
    ],
  },
  'creator-legal-contract-tools': {
    google_trends_keyword: 'influencer contract template India',
    unit_economics: { cac: 600, ltv: 4500, ltv_cac_ratio: 7.5, avg_order_value: 1500, churn_rate: 35, payback_period: 5, context: 'Annual plan ₹1,200–₹2,999; contract template bundles popular for new creators entering brand deals.' },
    competitors: [
      { name: 'LegaDesk', type: 'Indian Startup', description: 'Legal automation SaaS; not creator-specific.' },
      { name: 'Razorpay Invoices', type: 'Indian Fintech', description: 'Invoice tool; no contract or NDA templates.' },
      { name: 'Clerky', type: 'Global', description: 'Startup legal docs; not India/creator context.' },
    ],
  },
  'fan-merchandise-platform-creators': {
    google_trends_keyword: 'creator merch store India',
    unit_economics: { cac: 2000, ltv: 20000, ltv_cac_ratio: 10.0, avg_order_value: 5000, churn_rate: 25, payback_period: 6, context: 'Platform fee 15–20% on merch sales; top creators do ₹50,000+ monthly drops; print-on-demand keeps inventory risk low.' },
    competitors: [
      { name: 'Teespring (Spring)', type: 'Global', description: 'POD platform; no India payment/delivery integration.' },
      { name: 'Represent', type: 'Global', description: 'Creator merch; USD-first, no regional shipping.' },
      { name: 'Blinkstore', type: 'Indian Startup', description: 'India-first POD for creators; growing rapidly.' },
    ],
  },
  'indian-podcast-hosting-platform': {
    google_trends_keyword: 'podcast hosting platform India',
    unit_economics: { cac: 500, ltv: 4000, ltv_cac_ratio: 8.0, avg_order_value: 800, churn_rate: 28, payback_period: 5, context: 'Monthly hosting ₹299–₹799; IAP (in-app purchase) ad marketplace adds revenue; Hindi podcasts fastest growing segment.' },
    competitors: [
      { name: 'Buzzsprout', type: 'Global', description: 'Global podcast host; no India-specific monetisation.' },
      { name: 'Hubhopper', type: 'Indian Startup', description: 'India podcast platform + monetisation; Series A.' },
      { name: 'Podbean', type: 'Global', description: 'Podcast hosting + ads; USD pricing, no INR billing.' },
    ],
  },
  'influencer-management-agency-platform': {
    google_trends_keyword: 'influencer management agency India',
    unit_economics: { cac: 8000, ltv: 60000, ltv_cac_ratio: 7.5, avg_order_value: 20000, churn_rate: 20, payback_period: 9, context: 'Agency retainer ₹15,000–₹50,000/month per brand; creator roster of 50–200 earns 20% commission on all deals.' },
    competitors: [
      { name: 'Chtrbox', type: 'Indian Startup', description: 'Influencer marketing platform + agency; 50,000+ creators.' },
      { name: 'Confluencr', type: 'Indian Agency', description: 'Tech-enabled influencer agency; mid-market brands.' },
      { name: 'SilverPush', type: 'Indian Startup', description: 'AI video ad targeting; not pure influencer management.' },
    ],
  },
  'live-commerce-platform-india': {
    google_trends_keyword: 'live shopping India',
    unit_economics: { cac: 3000, ltv: 30000, ltv_cac_ratio: 10.0, avg_order_value: 2500, churn_rate: 25, payback_period: 7, context: 'Commission 5–10% on live sales; avg session sells ₹20,000–₹1L; category leaders in jewellery and fashion.' },
    competitors: [
      { name: 'BulBul', type: 'Indian Startup', description: 'Live commerce for regional India; Series A.' },
      { name: 'Simsim', type: 'Indian Startup', description: 'Acquired by YouTube; video shopping for Tier 2/3.' },
      { name: 'Meesho Live', type: 'Indian Unicorn', description: 'Social commerce giant adding live selling.' },
    ],
  },
  'micro-course-marketplace': {
    google_trends_keyword: 'sell online courses India',
    unit_economics: { cac: 800, ltv: 6000, ltv_cac_ratio: 7.5, avg_order_value: 1200, churn_rate: 30, payback_period: 5, context: 'Creator takes 70–80% of revenue; platform earns 20–30%; avg course price ₹499–₹2,499.' },
    competitors: [
      { name: 'Graphy', type: 'Indian Startup', description: 'Course + community platform; backed by Unacademy.' },
      { name: 'Teachable', type: 'Global', description: 'Global course marketplace; USD payments, high fees.' },
      { name: 'Instamojo', type: 'Indian Startup', description: 'Payments + digital products; popular for simple courses.' },
    ],
  },
  'newsletter-monetisation-platform': {
    google_trends_keyword: 'newsletter platform India',
    unit_economics: { cac: 400, ltv: 3600, ltv_cac_ratio: 9.0, avg_order_value: 600, churn_rate: 32, payback_period: 5, context: 'Creator earns subscription revenue; platform takes 8–12%; top newsletters charge ₹499–₹999/month.' },
    competitors: [
      { name: 'Substack', type: 'Global', description: 'Newsletter giant; USD-first, no INR payments natively.' },
      { name: 'Beehiiv', type: 'Global', description: 'Creator newsletter + monetisation; no India-specific tools.' },
      { name: 'Mailmodo', type: 'Indian Startup', description: 'AMP email SaaS; not creator monetisation.' },
    ],
  },
  'regional-audio-content-platform': {
    google_trends_keyword: 'regional language audio app India',
    unit_economics: { cac: 300, ltv: 2400, ltv_cac_ratio: 8.0, avg_order_value: 200, churn_rate: 35, payback_period: 4, context: 'Freemium; premium ₹99–₹199/month; Hindi, Tamil, Telugu content has highest paying conversion.' },
    competitors: [
      { name: 'Kuku FM', type: 'Indian Startup', description: 'Regional audio content platform; Series C, 10M+ users.' },
      { name: 'Pocket FM', type: 'Indian Startup', description: 'Audio series platform; Series C, strong in fiction.' },
      { name: 'Audible India', type: 'Global', description: 'Audiobooks; limited regional language catalogue.' },
    ],
  },
  'short-video-creator-tools': {
    google_trends_keyword: 'video editing app for Reels India',
    unit_economics: { cac: 300, ltv: 2500, ltv_cac_ratio: 8.3, avg_order_value: 300, churn_rate: 40, payback_period: 4, context: 'Freemium; premium ₹199–₹499/month; viral referral loops from creator sharing.' },
    competitors: [
      { name: 'CapCut', type: 'Global (ByteDance)', description: 'Dominant free video editor; strong in India.' },
      { name: 'InShot', type: 'Global App', description: 'Popular mobile video editor; freemium.' },
      { name: 'Moj (ShareChat)', type: 'Indian Startup', description: 'Short video platform with in-app creation tools.' },
    ],
  },
  'ugc-brand-marketplace': {
    google_trends_keyword: 'UGC creator platform India',
    unit_economics: { cac: 1500, ltv: 12000, ltv_cac_ratio: 8.0, avg_order_value: 4000, churn_rate: 25, payback_period: 6, context: 'Platform fee 15% on UGC project value; avg UGC project ₹2,000–₹8,000; subscription plans for heavy brand users.' },
    competitors: [
      { name: 'Billo', type: 'Global', description: 'US-first UGC marketplace; no India footprint.' },
      { name: 'Peppercontent', type: 'Indian Startup', description: 'Content marketplace; writers + designers, not UGC video.' },
      { name: 'Tagbox', type: 'Indian Startup', description: 'UGC aggregator for brands; no creator sourcing.' },
    ],
  },
  'virtual-events-paid-community-platform': {
    google_trends_keyword: 'paid community platform India',
    unit_economics: { cac: 2000, ltv: 18000, ltv_cac_ratio: 9.0, avg_order_value: 3000, churn_rate: 22, payback_period: 7, context: 'Platform takes 10% of community subscription; avg community membership ₹499–₹2,999/month.' },
    competitors: [
      { name: 'Circle.so', type: 'Global', description: 'Community platform; USD pricing, no INR.' },
      { name: 'Mighty Networks', type: 'Global', description: 'Community + courses; US-centric.' },
      { name: 'Nas.io', type: 'Startup', description: 'Creator community monetisation; India expansion underway.' },
    ],
  },
  'youtube-automation-faceless-content-channel': {
    google_trends_keyword: 'faceless YouTube channel India',
    unit_economics: { cac: 500, ltv: 8000, ltv_cac_ratio: 16.0, avg_order_value: 2500, churn_rate: 35, payback_period: 4, context: 'Course + mentorship model ₹1,999–₹5,999; niche tool subscriptions ₹299–₹999/month; very low CAC via YouTube organic.' },
    competitors: [
      { name: 'YouTube itself', type: 'Platform', description: 'No competing platform; competition is other faceless channels.' },
      { name: 'Canva for video', type: 'Global Tool', description: 'Design tool; not workflow automation for faceless channels.' },
      { name: 'Individual coaches', type: 'Unorganised', description: 'High-ticket 1:1 mentorship; unscalable.' },
    ],
  },
  // ── Local Services ──────────────────────────────────────────────────────────
  'ac-appliance-servicing-platform': {
    google_trends_keyword: 'AC service at home India',
    unit_economics: { cac: 500, ltv: 6000, ltv_cac_ratio: 12.0, avg_order_value: 1200, churn_rate: 20, payback_period: 4, context: 'Summer peak demand; AMC (annual maintenance contract) ₹1,500–₹3,000 drives LTV; repeat 2–3 times per year.' },
    competitors: [
      { name: 'Urban Company', type: 'Indian Unicorn', description: 'Dominant home services; strong AC servicing vertical.' },
      { name: 'Homejoy India', type: 'Local Startup', description: 'Home services aggregator; limited to metros.' },
      { name: 'Godrej Appliances Service', type: 'Brand', description: 'OEM service; only for Godrej products.' },
    ],
  },
  'car-wash-detailing-on-demand': {
    google_trends_keyword: 'car wash at home India',
    unit_economics: { cac: 400, ltv: 4800, ltv_cac_ratio: 12.0, avg_order_value: 600, churn_rate: 25, payback_period: 4, context: 'Monthly wash subscription ₹599–₹1,499; waterless wash differentiates in water-scarce cities.' },
    competitors: [
      { name: 'GoMechanic', type: 'Indian Startup', description: 'Car repair + wash; primarily workshop-based.' },
      { name: 'Mach1 Car Wash', type: 'Franchise', description: 'Express car wash chain; fixed location.' },
      { name: 'Freshwrap', type: 'Local Startup', description: 'Doorstep car detailing; city-specific.' },
    ],
  },
  'catering-cloud-kitchen-platform': {
    google_trends_keyword: 'catering service for events India',
    unit_economics: { cac: 2000, ltv: 20000, ltv_cac_ratio: 10.0, avg_order_value: 15000, churn_rate: 20, payback_period: 7, context: 'Per-event margin 25–35%; corporate catering contracts ₹50,000+/month are high-LTV anchors.' },
    competitors: [
      { name: 'EazyDiner Corporate', type: 'Indian Startup', description: 'Restaurant + catering aggregator; enterprise focus.' },
      { name: 'Zomato Catering', type: 'Indian Unicorn', description: 'Corporate food + catering arm of Zomato.' },
      { name: 'Local caterers', type: 'Unorganised', description: 'Dominant; no digital, no quality standard.' },
    ],
  },
  'document-pickup-govt-service-assistance': {
    google_trends_keyword: 'government document service doorstep India',
    unit_economics: { cac: 300, ltv: 3000, ltv_cac_ratio: 10.0, avg_order_value: 500, churn_rate: 30, payback_period: 4, context: 'Per-service ₹200–₹800; WhatsApp-driven referral cuts CAC to near zero in housing societies.' },
    competitors: [
      { name: 'NoBroker DocAssist', type: 'Indian Startup', description: 'Real estate + doc services; limited to property docs.' },
      { name: 'Common Service Centers', type: 'Government', description: 'Govt kiosks for digital India; fixed location, no pickup.' },
      { name: 'Local agents', type: 'Unorganised', description: 'Informal touts; unreliable and costly.' },
    ],
  },
  'dog-walking-pet-sitting-service': {
    google_trends_keyword: 'dog walking service India',
    unit_economics: { cac: 600, ltv: 7200, ltv_cac_ratio: 12.0, avg_order_value: 1200, churn_rate: 18, payback_period: 5, context: 'Monthly dog-walking package ₹1,500–₹3,000; boarding add-on ₹500–₹800/night boosts LTV significantly.' },
    competitors: [
      { name: 'PetBacker', type: 'Regional Platform', description: 'Southeast Asia pet services; India presence limited.' },
      { name: 'Supertails', type: 'Indian Startup', description: 'Pet commerce + services; grooming and walking.' },
      { name: 'Dogstays', type: 'Indian Startup', description: 'Home boarding for dogs; no daily walking.' },
    ],
  },
  'elder-care-companion-service': {
    google_trends_keyword: 'companion for elderly India',
    unit_economics: { cac: 2000, ltv: 24000, ltv_cac_ratio: 12.0, avg_order_value: 4000, churn_rate: 15, payback_period: 7, context: 'Monthly companion visits ₹3,000–₹8,000; NRI families are highest LTV segment, paying premium for peace of mind.' },
    competitors: [
      { name: 'Emoha Elder Care', type: 'Indian Startup', description: 'App + companion service; Series A funded.' },
      { name: 'Silver Innings', type: 'Indian Startup', description: 'Senior care platform; Bengaluru focus.' },
      { name: 'iGeriCare', type: 'Indian Startup', description: 'Geriatric care management; medical focus.' },
    ],
  },
  'event-decoration-service-platform': {
    google_trends_keyword: 'event decoration service near me India',
    unit_economics: { cac: 1500, ltv: 12000, ltv_cac_ratio: 8.0, avg_order_value: 8000, churn_rate: 30, payback_period: 6, context: 'Per-event margin 35–45%; birthday + anniversary packages most frequent repeat orders.' },
    competitors: [
      { name: 'WedMeGood', type: 'Indian Startup', description: 'Wedding vendor marketplace; includes decorators.' },
      { name: 'BookEventz', type: 'Indian Startup', description: 'Event venue + decorator booking.' },
      { name: 'Local decorators', type: 'Unorganised', description: 'Price-competitive but unreliable quality.' },
    ],
  },
  'gardening-landscaping-service': {
    google_trends_keyword: 'garden maintenance service India',
    unit_economics: { cac: 800, ltv: 9600, ltv_cac_ratio: 12.0, avg_order_value: 2000, churn_rate: 18, payback_period: 5, context: 'Monthly subscription ₹1,500–₹3,000 for regular maintenance; villa communities drive bulk contracts.' },
    competitors: [
      { name: 'Urban Company (plants)', type: 'Indian Unicorn', description: 'Plant care launched; not landscaping design.' },
      { name: 'Ugaoo', type: 'Indian D2C', description: 'Plant e-commerce + basic care; not full landscaping.' },
      { name: 'NatureEscape', type: 'Local Startup', description: 'Landscaping for residential societies; limited scale.' },
    ],
  },
  'home-cooked-tiffin-delivery': {
    google_trends_keyword: 'home tiffin service near me',
    unit_economics: { cac: 300, ltv: 4800, ltv_cac_ratio: 16.0, avg_order_value: 200, churn_rate: 20, payback_period: 3, context: 'Monthly tiffin plan ₹3,000–₹6,000; office-goers and students are high-LTV segments; WhatsApp orders dominate.' },
    competitors: [
      { name: 'NOON (tiffin app)', type: 'Indian Startup', description: 'Home cook aggregator; Series A.' },
      { name: 'Swiggy Daily', type: 'Indian Unicorn', description: 'Daily meal subscription; price competitive.' },
      { name: 'Local tiffin aunties', type: 'Unorganised', description: 'Extremely price competitive; no app, WhatsApp-only.' },
    ],
  },
  'home-deep-cleaning-service': {
    google_trends_keyword: 'deep cleaning service at home India',
    unit_economics: { cac: 600, ltv: 5400, ltv_cac_ratio: 9.0, avg_order_value: 2500, churn_rate: 25, payback_period: 5, context: 'Per-session ₹1,500–₹4,000 depending on home size; quarterly repeat cycle is common; society bulk deals cut CAC.' },
    competitors: [
      { name: 'Urban Company', type: 'Indian Unicorn', description: 'Dominant in professional home cleaning.' },
      { name: 'Housejoy', type: 'Indian Startup', description: 'Home services; cleaning + repair.' },
      { name: 'Maid Easy', type: 'Indian Startup', description: 'Recurring maid service; separate from deep cleaning.' },
    ],
  },
  'home-maintenance-subscription': {
    google_trends_keyword: 'home maintenance annual contract India',
    unit_economics: { cac: 1000, ltv: 12000, ltv_cac_ratio: 12.0, avg_order_value: 4000, churn_rate: 18, payback_period: 5, context: 'Annual AMC ₹3,000–₹8,000 covers plumbing + electrical + carpentry; society tie-ups generate bulk acquisitions.' },
    competitors: [
      { name: 'Urban Company (AMC)', type: 'Indian Unicorn', description: 'Home care subscription launched; expanding.' },
      { name: 'NoBroker HomeCare', type: 'Indian Unicorn', description: 'Annual home maintenance plan; strong in Bengaluru.' },
      { name: 'Local contractors', type: 'Unorganised', description: 'Cheap but unreliable for subscription model.' },
    ],
  },
  'home-salon-beauty-service': {
    google_trends_keyword: 'home salon service India',
    unit_economics: { cac: 400, ltv: 5600, ltv_cac_ratio: 14.0, avg_order_value: 700, churn_rate: 22, payback_period: 4, context: 'Per-session ₹400–₹1,500; bridal packages ₹15,000–₹50,000 are high-margin one-time opportunities.' },
    competitors: [
      { name: 'Urban Company Beauty', type: 'Indian Unicorn', description: 'Market leader in home beauty; 10,000+ beauticians.' },
      { name: 'Flatchat (salon)', type: 'Local', description: 'Salon-on-demand in housing societies.' },
      { name: 'YeLo', type: 'Indian Startup', description: 'At-home beauty; raised seed round.' },
    ],
  },
  'hyperlocal-handyman-platform': {
    google_trends_keyword: 'handyman services near me India',
    unit_economics: { cac: 500, ltv: 4500, ltv_cac_ratio: 9.0, avg_order_value: 800, churn_rate: 25, payback_period: 5, context: 'Per-job ₹300–₹2,000; annual AMC customers have 3x LTV; housing society contracts create volume baseline.' },
    competitors: [
      { name: 'Urban Company', type: 'Indian Unicorn', description: 'Full home services including handyman; dominant.' },
      { name: 'Sulekha', type: 'Indian Startup', description: 'Lead marketplace for local services; not quality-controlled.' },
      { name: 'Taskbob', type: 'Indian Startup', description: 'Home services in Mumbai; backed by Godrej.' },
    ],
  },
  'interior-design-consultation-platform': {
    google_trends_keyword: 'interior design consultation online India',
    unit_economics: { cac: 5000, ltv: 60000, ltv_cac_ratio: 12.0, avg_order_value: 25000, churn_rate: 15, payback_period: 8, context: 'Design fee 8–12% of project value; avg residential project ₹5L–₹20L; referrals from completed homes drive 60% new leads.' },
    competitors: [
      { name: 'Livspace', type: 'Indian Unicorn', description: 'Interior design + execution; 50 cities, tech-enabled.' },
      { name: 'HomeLane', type: 'Indian Startup', description: 'Interior design e-commerce; modular furniture focus.' },
      { name: 'Pepperfry Studio', type: 'Indian Startup', description: 'Furniture + design consultation; retail-led.' },
    ],
  },
  'laundry-dry-cleaning-pickup': {
    google_trends_keyword: 'laundry pickup service India',
    unit_economics: { cac: 400, ltv: 6000, ltv_cac_ratio: 15.0, avg_order_value: 600, churn_rate: 18, payback_period: 4, context: 'Monthly subscription ₹1,500–₹3,000; working professional urban households are high-frequency, low-churn segment.' },
    competitors: [
      { name: 'Washio India', type: 'Indian Startup', description: 'Laundry pickup; city-specific, limited scale.' },
      { name: 'UClean', type: 'Indian Franchise', description: 'Laundry franchise chain + app; 400+ stores.' },
      { name: 'Dhobikar', type: 'Local Startup', description: 'Doorstep laundry; Mumbai/Pune focus.' },
    ],
  },
  'local-courier-document-pickup': {
    google_trends_keyword: 'same day courier service India',
    unit_economics: { cac: 300, ltv: 3600, ltv_cac_ratio: 12.0, avg_order_value: 150, churn_rate: 25, payback_period: 3, context: 'Per-delivery ₹80–₹300; B2B corporate contracts ₹20,000–₹50,000/month dominate revenue.' },
    competitors: [
      { name: 'Dunzo', type: 'Indian Startup', description: 'Hyperlocal delivery pioneer; pivoting to B2B.' },
      { name: 'Borzo (WeFast)', type: 'Indian Startup', description: 'Two-wheeler courier; Series C, B2B focus.' },
      { name: 'Porter', type: 'Indian Startup', description: 'Micro-logistics platform; intracity freight.' },
    ],
  },
  'moving-packing-service-platform': {
    google_trends_keyword: 'packers and movers India',
    unit_economics: { cac: 2000, ltv: 10000, ltv_cac_ratio: 5.0, avg_order_value: 8000, churn_rate: 50, payback_period: 6, context: 'Commission 10–15% on move value; avg local move ₹5,000–₹20,000; low repeat but high referral from satisfied customers.' },
    competitors: [
      { name: 'Agarwal Packers', type: 'Large Player', description: 'Dominant traditional mover; franchise model.' },
      { name: 'Citiesmovers', type: 'Indian Startup', description: 'Online aggregator for verified packers.' },
      { name: 'ThePorter Move', type: 'Indian Startup', description: 'App-based moving; tech-enabled transparency.' },
    ],
  },
  'pest-control-service-platform': {
    google_trends_keyword: 'pest control service at home India',
    unit_economics: { cac: 600, ltv: 5400, ltv_cac_ratio: 9.0, avg_order_value: 1500, churn_rate: 22, payback_period: 5, context: 'Annual contract ₹3,000–₹8,000; monsoon season drives 60% of annual demand; AMC retention rate 70%+.' },
    competitors: [
      { name: 'Urban Company Pest', type: 'Indian Unicorn', description: 'Launched pest control; rapidly growing category.' },
      { name: 'HiCare', type: 'Indian Startup', description: 'Pest management franchise; 200+ cities.' },
      { name: 'Rentokil India', type: 'Global MNC', description: 'Enterprise pest control; premium pricing.' },
    ],
  },
  'photography-on-demand-service': {
    google_trends_keyword: 'professional photographer on demand India',
    unit_economics: { cac: 1500, ltv: 12000, ltv_cac_ratio: 8.0, avg_order_value: 4000, churn_rate: 25, payback_period: 6, context: 'Per-session ₹2,000–₹8,000; corporate events and product photography are high-repeat B2B segments.' },
    competitors: [
      { name: 'Canvera', type: 'Indian Startup', description: 'Wedding photography marketplace; dominant in weddings.' },
      { name: 'ClickASnap India', type: 'Local Startup', description: 'Photographer marketplace; limited marketing.' },
      { name: 'Picsaura', type: 'Local Startup', description: 'On-demand photographers for events and products.' },
    ],
  },
  'private-security-services-platform': {
    google_trends_keyword: 'security guard service India',
    unit_economics: { cac: 10000, ltv: 120000, ltv_cac_ratio: 12.0, avg_order_value: 40000, churn_rate: 12, payback_period: 9, context: 'Monthly contract ₹30,000–₹80,000 for residential complex; housing societies are anchor B2B clients with 3–5 year tenure.' },
    competitors: [
      { name: 'G4S India', type: 'Global MNC', description: 'Global security company; enterprise focus, not hyperlocal.' },
      { name: 'Securitas India', type: 'Global MNC', description: 'Large corporate security; not SME-friendly.' },
      { name: 'Checkpost Security', type: 'Indian Startup', description: 'Tech-enabled security for housing; App-first.' },
    ],
  },
  'tailoring-alteration-on-demand': {
    google_trends_keyword: 'tailor at home service India',
    unit_economics: { cac: 300, ltv: 3600, ltv_cac_ratio: 12.0, avg_order_value: 400, churn_rate: 25, payback_period: 4, context: 'Per-visit alteration ₹100–₹500; custom stitching ₹500–₹2,000; festive season repeat drives 40% of annual revenue.' },
    competitors: [
      { name: 'MakeMyCloth', type: 'Indian Startup', description: 'Online custom clothing; fabric + tailoring bundled.' },
      { name: 'Coats4You', type: 'Local Startup', description: 'Doorstep tailoring; metro cities.' },
      { name: 'Local tailors', type: 'Unorganised', description: 'Dominant; WhatsApp booking, no quality guarantee.' },
    ],
  },
  'water-tank-cleaning-service': {
    google_trends_keyword: 'water tank cleaning service India',
    unit_economics: { cac: 400, ltv: 3200, ltv_cac_ratio: 8.0, avg_order_value: 1500, churn_rate: 25, payback_period: 4, context: 'Annual cleaning ₹800–₹3,000 depending on tank capacity; housing society bulk deals cut per-unit cost 40%.' },
    competitors: [
      { name: 'Urban Company Water', type: 'Indian Unicorn', description: 'Water tank cleaning launched; growing.' },
      { name: 'JustDial listings', type: 'Platform', description: 'Lead gen; not quality-controlled.' },
      { name: 'Local operators', type: 'Unorganised', description: 'Price-competitive; no certifications or quality.' },
    ],
  },
  'wedding-vendor-marketplace': {
    google_trends_keyword: 'wedding vendors online India',
    unit_economics: { cac: 5000, ltv: 50000, ltv_cac_ratio: 10.0, avg_order_value: 20000, churn_rate: 15, payback_period: 8, context: 'Commission 5–10% on vendor booking; avg wedding budget ₹5L–₹25L; premium vendor listings ₹10,000–₹50,000/year.' },
    competitors: [
      { name: 'WedMeGood', type: 'Indian Startup', description: 'Leading wedding marketplace; Series B funded.' },
      { name: 'Shaadi.com (vendors)', type: 'Indian Platform', description: 'Wedding services arm; less curated than WedMeGood.' },
      { name: 'WeddingWire India', type: 'Global', description: 'International platform; limited India-specific focus.' },
    ],
  },
  'yoga-fitness-at-home-platform': {
    google_trends_keyword: 'online yoga classes at home India',
    unit_economics: { cac: 500, ltv: 6000, ltv_cac_ratio: 12.0, avg_order_value: 1000, churn_rate: 25, payback_period: 5, context: 'Monthly subscription ₹499–₹1,499; live class retention 2x higher than recorded; corporate wellness bulk plans.' },
    competitors: [
      { name: 'Cult.fit (online)', type: 'Indian Startup', description: 'Online fitness + yoga; dominant post-pandemic.' },
      { name: 'Alo Moves', type: 'Global', description: 'Premium yoga content; USD pricing, no live India classes.' },
      { name: 'Local yoga teachers', type: 'Unorganised', description: 'Zoom-based; personal trust, no product.' },
    ],
  },
  'home-tiffin-meal-subscription-service': {
    google_trends_keyword: 'tiffin subscription service India',
    unit_economics: { cac: 350, ltv: 5400, ltv_cac_ratio: 15.4, avg_order_value: 250, churn_rate: 18, payback_period: 3, context: 'Monthly subscription ₹2,500–₹4,500; office-delivery route optimization cuts delivery cost 30%.' },
    competitors: [
      { name: 'Swiggy Daily', type: 'Indian Unicorn', description: 'Meal subscription; brand recognition advantage.' },
      { name: 'NOON', type: 'Indian Startup', description: 'Home-cook marketplace; seed funded.' },
      { name: 'Zomato Everyday', type: 'Indian Unicorn', description: 'Daily meal plan; bundled with Zomato app.' },
    ],
  },
  // ── AI / ML ─────────────────────────────────────────────────────────────────
  'ai-powered-social-media-content-agency': {
    google_trends_keyword: 'AI social media content India',
    unit_economics: { cac: 8000, ltv: 72000, ltv_cac_ratio: 9.0, avg_order_value: 24000, churn_rate: 20, payback_period: 8, context: 'Monthly retainer ₹15,000–₹40,000; AI cuts content production cost 60%, keeping gross margin >60%.' },
    competitors: [
      { name: 'Canva Magic', type: 'Global Tool', description: 'AI content generation; DIY, not managed service.' },
      { name: 'Peppercontent', type: 'Indian Startup', description: 'Content marketplace; human writers, not AI-first.' },
      { name: 'Writesonic', type: 'Global SaaS', description: 'AI writing tool; self-serve, not agency model.' },
    ],
  },
  'ai-credit-risk-msme': {
    google_trends_keyword: 'AI credit scoring India',
    unit_economics: { cac: 30000, ltv: 300000, ltv_cac_ratio: 10.0, avg_order_value: 100000, churn_rate: 10, payback_period: 10, context: 'Annual SaaS ₹5L–₹20L per lender; per-query pricing ₹50–₹200 for smaller NBFCs.' },
    competitors: [
      { name: 'Perfios', type: 'Indian Fintech', description: 'Financial data analysis for lenders; unicorn status.' },
      { name: 'Signzy', type: 'Indian Startup', description: 'AI-powered KYC + credit; Series B.' },
      { name: 'M2P Fintech', type: 'Indian Startup', description: 'Banking-as-a-service with credit modules.' },
    ],
  },
  'ai-customer-service-chatbot-vernacular': {
    google_trends_keyword: 'AI chatbot in Hindi India',
    unit_economics: { cac: 15000, ltv: 150000, ltv_cac_ratio: 10.0, avg_order_value: 50000, churn_rate: 15, payback_period: 9, context: 'Monthly SaaS ₹20,000–₹80,000; vernacular capability commands 2x premium over English-only bots.' },
    competitors: [
      { name: 'Haptik (Jio)', type: 'Indian Startup', description: 'Conversational AI; acquired by Reliance Jio.' },
      { name: 'Yellow.ai', type: 'Indian Startup', description: 'Enterprise chatbot; Series D, global ambition.' },
      { name: 'Verloop', type: 'Indian Startup', description: 'Customer support automation; Series A.' },
    ],
  },
  'ai-form-data-extraction-platform': {
    google_trends_keyword: 'document OCR extraction India',
    unit_economics: { cac: 20000, ltv: 180000, ltv_cac_ratio: 9.0, avg_order_value: 60000, churn_rate: 12, payback_period: 10, context: 'Per-document pricing ₹1–₹10 or annual SaaS ₹5L–₹15L; insurance and banking are high-volume verticals.' },
    competitors: [
      { name: 'Nanonets', type: 'Indian Startup', description: 'AI document processing; global customers, Series B.' },
      { name: 'Docsumo', type: 'Indian Startup', description: 'Smart document extraction for BFSI; Series A.' },
      { name: 'AWS Textract', type: 'Global Cloud', description: 'OCR API; needs custom ML layer for Indian docs.' },
    ],
  },
  'ai-inventory-forecasting-retailers': {
    google_trends_keyword: 'inventory management AI India',
    unit_economics: { cac: 25000, ltv: 200000, ltv_cac_ratio: 8.0, avg_order_value: 60000, churn_rate: 15, payback_period: 10, context: 'Annual SaaS ₹5L–₹15L per retail chain; typical customer saves 15–20% on working capital = strong ROI argument.' },
    competitors: [
      { name: 'Unicommerce', type: 'Indian Startup', description: 'Multi-channel inventory SaaS; listed on NSE SME.' },
      { name: 'Increff', type: 'Indian Startup', description: 'AI merchandising + inventory for fashion retail.' },
      { name: 'Netcore AI', type: 'Indian Startup', description: 'Customer engagement AI; inventory is adjacent.' },
    ],
  },
  'ai-personalisation-d2c-ecommerce': {
    google_trends_keyword: 'personalization engine for ecommerce India',
    unit_economics: { cac: 20000, ltv: 180000, ltv_cac_ratio: 9.0, avg_order_value: 60000, churn_rate: 15, payback_period: 10, context: 'Annual SaaS ₹4L–₹12L; typically priced as % of GMV uplift (1–3%); D2C brands >₹2Cr monthly GMV are ideal.' },
    competitors: [
      { name: 'WebEngage', type: 'Indian Startup', description: 'Customer data + personalisation; Series C.' },
      { name: 'MoEngage', type: 'Indian Startup', description: 'Engagement automation; global expansion, Series E.' },
      { name: 'Insider', type: 'Turkish/Global', description: 'Cross-channel personalisation; strong India presence.' },
    ],
  },
  'ai-powered-b2b-lead-generation': {
    google_trends_keyword: 'B2B lead generation tool India',
    unit_economics: { cac: 10000, ltv: 90000, ltv_cac_ratio: 9.0, avg_order_value: 30000, churn_rate: 18, payback_period: 8, context: 'Monthly SaaS ₹15,000–₹40,000; agencies pay ₹8,000–₹20,000/month; quality of leads is key retention driver.' },
    competitors: [
      { name: 'Bombora India', type: 'Global', description: 'B2B intent data; US-focused datasets.' },
      { name: 'Slintel (acquired)', type: 'Indian Startup', description: 'Acquired by 6sense; tech buyer intent data.' },
      { name: 'Kaspr / Apollo', type: 'Global', description: 'Contact database tools; limited Indian company coverage.' },
    ],
  },
  'ai-powered-recruitment-platform': {
    google_trends_keyword: 'AI recruitment platform India',
    unit_economics: { cac: 20000, ltv: 160000, ltv_cac_ratio: 8.0, avg_order_value: 40000, churn_rate: 20, payback_period: 9, context: 'Annual SaaS ₹3L–₹12L per company; pay-per-hire models ₹5,000–₹30,000 per successful placement.' },
    competitors: [
      { name: 'iimjobs / Hirist', type: 'Indian Platform', description: 'Niche job boards + AI matching; Infoedge owned.' },
      { name: 'Naukri.com AI', type: 'Indian Platform', description: 'Dominant job platform adding AI screening.' },
      { name: 'Karat', type: 'Global', description: 'Technical interview service; USD pricing.' },
    ],
  },
  'ai-symptom-checker-triage': {
    google_trends_keyword: 'AI symptom checker India',
    unit_economics: { cac: 3000, ltv: 24000, ltv_cac_ratio: 8.0, avg_order_value: 2000, churn_rate: 25, payback_period: 8, context: 'B2C freemium; B2B hospital/clinic SaaS ₹2L–₹8L/year; telemedicine referral revenue adds 30% to B2C ARPU.' },
    competitors: [
      { name: 'Ada Health', type: 'Global', description: 'AI symptom checker; English-first, limited Hindi support.' },
      { name: 'Practo Symptoms', type: 'Indian Platform', description: 'Basic symptom guidance; not AI-driven triage.' },
      { name: 'Wysa (mental health)', type: 'Indian Startup', description: 'Mental health AI; not physical symptom checking.' },
    ],
  },
  'ai-tax-advisory-businesses': {
    google_trends_keyword: 'AI tax filing for business India',
    unit_economics: { cac: 5000, ltv: 45000, ltv_cac_ratio: 9.0, avg_order_value: 15000, churn_rate: 18, payback_period: 7, context: 'Annual SaaS ₹12,000–₹30,000 for SMEs; CA-assisted plan ₹40,000–₹1L; sticky post first filing due to data migration cost.' },
    competitors: [
      { name: 'ClearTax Business', type: 'Indian Startup', description: 'Dominant GST + income tax; Series C, $140M raised.' },
      { name: 'EZTax', type: 'Indian Startup', description: 'Self-service tax filing; bootstrapped, profitable.' },
      { name: 'Tally GST', type: 'Indian Platform', description: 'Accounting + GST; most SMEs default to Tally.' },
    ],
  },
  'automated-video-dubbing-localisation': {
    google_trends_keyword: 'AI video dubbing India',
    unit_economics: { cac: 15000, ltv: 120000, ltv_cac_ratio: 8.0, avg_order_value: 30000, churn_rate: 20, payback_period: 9, context: 'Per-minute pricing ₹100–₹500 or annual SaaS ₹5L–₹20L; OTT platforms and e-learning are primary B2B verticals.' },
    competitors: [
      { name: 'Dubverse', type: 'Indian Startup', description: 'AI dubbing for Indian languages; Series A.' },
      { name: 'Papercup', type: 'Global', description: 'AI dubbing for global media; premium pricing.' },
      { name: 'Murf.ai', type: 'Indian Startup', description: 'AI voice + dubbing; global customers.' },
    ],
  },
  'code-review-security-scanning-saas': {
    google_trends_keyword: 'automated code review tool India',
    unit_economics: { cac: 15000, ltv: 150000, ltv_cac_ratio: 10.0, avg_order_value: 50000, churn_rate: 12, payback_period: 9, context: 'Per-seat SaaS ₹1,500–₹3,000/developer/month; enterprise security-mandated adoption creates budget-certain demand.' },
    competitors: [
      { name: 'Snyk', type: 'Global', description: 'Developer security platform; global market leader.' },
      { name: 'Codacy', type: 'Global', description: 'Automated code review; used by Indian IT services firms.' },
      { name: 'SonarQube', type: 'Global', description: 'Static code analysis; on-premise heavy; OSS version popular.' },
    ],
  },
  'computer-vision-retail-fmcg': {
    google_trends_keyword: 'computer vision for retail India',
    unit_economics: { cac: 50000, ltv: 500000, ltv_cac_ratio: 10.0, avg_order_value: 150000, churn_rate: 10, payback_period: 12, context: 'Annual SaaS ₹10L–₹50L per enterprise; shelf analytics ROI measurable in 90 days — strong upsell story.' },
    competitors: [
      { name: 'Trax Retail', type: 'Global', description: 'Computer vision for FMCG shelf intelligence; global leader.' },
      { name: 'Infilect', type: 'Indian Startup', description: 'Visual AI for FMCG retail execution; Series A.' },
      { name: 'Mad Street Den (Vue.ai)', type: 'Indian Startup', description: 'AI for retail + fashion; Series B.' },
    ],
  },
  'document-ai-legal-finance': {
    google_trends_keyword: 'legal document AI India',
    unit_economics: { cac: 25000, ltv: 250000, ltv_cac_ratio: 10.0, avg_order_value: 80000, churn_rate: 12, payback_period: 10, context: 'Annual SaaS ₹5L–₹25L per law firm or bank; per-document pricing ₹50–₹500 for NBFCs and insurance companies.' },
    competitors: [
      { name: 'Kira Systems', type: 'Global', description: 'Contract AI; acquired by Litera; enterprise pricing.' },
      { name: 'SpotDraft', type: 'Indian Startup', description: 'Contract lifecycle management; Series A, India + US.' },
      { name: 'LegaDesk', type: 'Indian Startup', description: 'Legal practice SaaS; not AI-first.' },
    ],
  },
  'emotion-ai-market-research': {
    google_trends_keyword: 'emotion AI market research India',
    unit_economics: { cac: 30000, ltv: 240000, ltv_cac_ratio: 8.0, avg_order_value: 60000, churn_rate: 20, payback_period: 10, context: 'Per-study ₹30,000–₹1,50,000; FMCG and media companies biggest buyers; India has limited competition.' },
    competitors: [
      { name: 'Affectiva', type: 'Global', description: 'Emotion AI pioneer; acquired by SmartEye.' },
      { name: 'iMotions', type: 'Global', description: 'Biometrics + emotion research platform; enterprise pricing.' },
      { name: 'Entropik Tech', type: 'Indian Startup', description: 'Emotion AI for market research; Series B.' },
    ],
  },
  'fake-news-misinformation-detection': {
    google_trends_keyword: 'fake news detection India',
    unit_economics: { cac: 20000, ltv: 160000, ltv_cac_ratio: 8.0, avg_order_value: 40000, churn_rate: 18, payback_period: 9, context: 'B2B SaaS ₹15,000–₹60,000/month for media cos; government grant funding supplements ARR in early stage.' },
    competitors: [
      { name: 'Logically AI', type: 'Global', description: 'Fact-checking AI; India operations via Logically India.' },
      { name: 'AltNews (manual)', type: 'Indian NGO', description: 'Fact-checking publication; not a commercial SaaS.' },
      { name: 'Factly', type: 'Indian NGO', description: 'Fact-checking for India; grant-funded, not commercial.' },
    ],
  },
  'predictive-maintenance-factories': {
    google_trends_keyword: 'predictive maintenance IoT India',
    unit_economics: { cac: 80000, ltv: 800000, ltv_cac_ratio: 10.0, avg_order_value: 200000, churn_rate: 8, payback_period: 12, context: 'Annual SaaS + hardware ₹15L–₹50L per factory; ROI from preventing 1 major breakdown pays for 3 years of subscription.' },
    competitors: [
      { name: 'Axonics India', type: 'Indian Startup', description: 'Industrial IoT for predictive maintenance; Series A.' },
      { name: 'Altizon', type: 'Indian Startup', description: 'Industrial IoT platform; manufacturing focus, Series B.' },
      { name: 'Siemens MindSphere', type: 'Global MNC', description: 'IoT platform for industrial; expensive, complex integration.' },
    ],
  },
  'voice-ai-rural-financial-inclusion': {
    google_trends_keyword: 'voice AI banking India vernacular',
    unit_economics: { cac: 5000, ltv: 40000, ltv_cac_ratio: 8.0, avg_order_value: 10000, churn_rate: 20, payback_period: 8, context: 'B2B SaaS to banks/NBFCs ₹8,000–₹25,000/month; B2G grants from NABARD/RBI supplement revenue in early stage.' },
    competitors: [
      { name: 'Sarvam AI', type: 'Indian Startup', description: 'Indic language AI models; strong government partnerships.' },
      { name: 'AI4Bharat', type: 'Research', description: 'Open-source Indic NLP; not commercial.' },
      { name: 'CoRover.ai', type: 'Indian Startup', description: 'Conversational AI bot for banks; IRCTC partnership.' },
    ],
  },
  'ai-powered-resume-linkedin-profile-writing-service': {
    google_trends_keyword: 'AI resume writing service India',
    unit_economics: { cac: 400, ltv: 3000, ltv_cac_ratio: 7.5, avg_order_value: 1500, churn_rate: 40, payback_period: 4, context: 'One-time service ₹800–₹3,000 per resume; subscription for ongoing profile updates ₹299/month; LinkedIn profile audits upsell.' },
    competitors: [
      { name: 'Resumeworded', type: 'Global', description: 'AI resume feedback; no India-specific job market context.' },
      { name: 'Naukri Resume', type: 'Indian Platform', description: 'Resume writing service bundled in Naukri subscription.' },
      { name: 'TopResume India', type: 'Global+India', description: 'Professional resume writing; human writers, higher cost.' },
    ],
  },
}

const slugs = Object.keys(DATA)

async function run() {
  console.log(`Seeding depth data for ${slugs.length} ideas...`)
  const docs = await client.fetch(
    `*[_type=="businessIdea" && slug.current in $slugs]{_id,"slug":slug.current,"hasTrends":google_trends_keyword}`,
    { slugs }
  )
  const idMap = {}
  const hasData = new Set()
  for (const d of docs) {
    idMap[d.slug] = d._id
    if (d.hasTrends) hasData.add(d.slug)
  }

  let ok = 0, skip = 0, missing = 0
  for (let i = 0; i < slugs.length; i += 10) {
    const batch = slugs.slice(i, i + 10)
    const tx = client.transaction()
    let anyInBatch = false
    for (const slug of batch) {
      if (hasData.has(slug)) { skip++; continue }
      const docId = idMap[slug]
      if (!docId) { console.warn(`\n  Missing doc for slug: ${slug}`); missing++; continue }
      const d = DATA[slug]
      const competitors = (d.competitors || []).map(c => ({ ...c, _type: 'object', _key: k() }))
      tx.patch(docId, p => p.setIfMissing({
        google_trends_keyword: d.google_trends_keyword,
        unit_economics: d.unit_economics,
        competitors,
      }))
      ok++
      anyInBatch = true
    }
    if (anyInBatch) await tx.commit()
    process.stdout.write(`  ${Math.min(i + 10, slugs.length)} / ${slugs.length}`)
  }
  console.log(`\nDone. Updated: ${ok}, Skipped (already had data): ${skip}, Missing: ${missing}`)
}

run().catch(err => { console.error(err); process.exit(1) })
