// Bulk image seeding — fetches relevant Unsplash photos for all ideas without cover images
// Uses curated per-slug overrides, falls back to per-industry defaults.
// Run: node scripts/seed-idea-images-bulk.mjs
// Optional: node scripts/seed-idea-images-bulk.mjs --dry-run   (list only, no upload)
// Optional: node scripts/seed-idea-images-bulk.mjs --industry "E-commerce"
// Optional: node scripts/seed-idea-images-bulk.mjs --force      (overwrite existing images)
// Optional: node scripts/seed-idea-images-bulk.mjs --slug pvc-traffic-cone-manufacturing

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { createReadStream } from 'fs'
import { join } from 'path'
import { tmpdir, homedir } from 'os'

const DRY_RUN = process.argv.includes('--dry-run')
const FORCE = process.argv.includes('--force')
const INDUSTRY_FILTER = (() => {
  const idx = process.argv.indexOf('--industry')
  return idx !== -1 ? process.argv[idx + 1] : null
})()
const SLUG_FILTER = (() => {
  const idx = process.argv.indexOf('--slug')
  return idx !== -1 ? process.argv[idx + 1] : null
})()

const cliConfig = JSON.parse(readFileSync(join(homedir(), '.config/sanity/config.json'), 'utf8'))
const client = createClient({
  projectId: '5p3rso81',
  dataset: 'production',
  apiVersion: '2024-01-01',
  token: cliConfig.authToken,
  useCdn: false,
})

// ─── Industry-level default images ───────────────────────────────────────────
// One strong, generic photo per industry — used when no slug-specific override exists
const INDUSTRY_DEFAULTS = {
  'AI / ML':                  { id: 'photo-1677442135703-1787eea5ce01', alt: 'Abstract AI neural network visualization with glowing nodes' },
  'Climate / Sustainability': { id: 'photo-1508614999368-9260051292e5', alt: 'Solar panels on a rooftop generating clean energy' },
  'Creator Economy':          { id: 'photo-1611162616305-c69b3fa7fbe0', alt: 'Content creator recording video with smartphone and ring light' },
  'E-commerce':               { id: 'photo-1563013544-824ae1b704d3', alt: 'Person shopping online on a laptop surrounded by shopping bags' },
  'EdTech':                   { id: 'photo-1501504905252-473c47e087f8', alt: 'Student learning online with laptop and open notebook' },
  'FinTech':                  { id: 'photo-1611974789855-9c2a0a7236a3', alt: 'Smartphone showing digital banking and financial app' },
  'Health & Wellness':        { id: 'photo-1505751172876-fa1923c5c528', alt: 'Doctor consulting patient with stethoscope in a modern clinic' },
  'Local Services':           { id: 'photo-1581578731548-c64695cc6952', alt: 'Professional home service technician working on equipment' },
  'SaaS':                     { id: 'photo-1551434678-e076c223a692', alt: 'Software developer working on a modern SaaS dashboard' },
  'agritech':                 { id: 'photo-1500937386664-56d1dfef3854', alt: 'Farmer working in lush green fields with modern equipment' },
  'b2b-services':             { id: 'photo-1450101499163-c8848c66ca85', alt: 'Business professionals reviewing documents in a modern office' },
  'export':                   { id: 'photo-1494412574643-ff11b0a5c1c3', alt: 'Cargo containers at port ready for international export' },
  'food':                     { id: 'photo-1567620905732-2d1ec7ab7445', alt: 'Freshly prepared Indian meal in containers ready for delivery' },
  'logistics':                { id: 'photo-1586528116311-ad8dd3c8310d', alt: 'Warehouse with shelves of packages and logistics workers' },
  'manufacturing':            { id: 'photo-1565043589221-1a6fd9ae45c7', alt: 'Industrial machinery on modern factory production floor' },
  'petcare':                  { id: 'photo-1587300003388-59208cc962cb', alt: 'Happy dog being groomed by a professional pet care specialist' },
  'proptech':                 { id: 'photo-1560448204-e02f11c3d0e2', alt: 'Modern residential building representing real estate investment' },
  'travel':                   { id: 'photo-1436491865332-7a61a109cc05', alt: 'Scenic landscape with mountains representing travel and adventure' },
}

// ─── Per-slug overrides (more specific/relevant image) ───────────────────────
const SLUG_OVERRIDES = {
  // AI / ML
  'ai-credit-risk-msme':                    { id: 'photo-1554224155-6726b3ff858f', alt: 'Data analytics charts for credit risk assessment' },
  'ai-customer-service-chatbot-vernacular':  { id: 'photo-1531746790731-6c087fecd65a', alt: 'AI chatbot interface on a smartphone screen' },
  'ai-symptom-checker-triage':               { id: 'photo-1576091160399-112ba8d25d1d', alt: 'Digital health AI on a tablet for medical triage' },
  'ai-tax-advisory-businesses':             { id: 'photo-1554224155-6726b3ff858f', alt: 'Accountant using digital tools for tax advisory services' },
  'computer-vision-retail-fmcg':            { id: 'photo-1472851294608-062f824d29cc', alt: 'Retail store shelf with FMCG products and barcode scanning' },
  'document-ai-legal-finance':              { id: 'photo-1589829545856-d10d557cf95f', alt: 'Lawyer reviewing legal documents with digital AI tools' },
  'predictive-maintenance-factories':       { id: 'photo-1565043589221-1a6fd9ae45c7', alt: 'Factory machinery with IoT sensors for predictive maintenance' },
  'voice-ai-rural-financial-inclusion':     { id: 'photo-1516321497487-e288fb19713f', alt: 'Rural person using voice AI on a basic smartphone' },
  'ai-inventory-forecasting-retailers':     { id: 'photo-1441986300917-64674bd600d8', alt: 'Retail store inventory management with digital dashboard' },
  'automated-video-dubbing-localisation':   { id: 'photo-1677442135703-1787eea5ce01', alt: 'Video editing studio with dubbing and localization workflow' },
  'code-review-security-scanning-saas':     { id: 'photo-1555949963-ff9fe0c870eb', alt: 'Developer reviewing code on multiple screens for security' },
  'fake-news-misinformation-detection':     { id: 'photo-1504711434969-e33886168f5c', alt: 'Journalist at laptop fact-checking news on multiple screens' },
  'emotion-ai-market-research':             { id: 'photo-1542744094-24638eff58bb', alt: 'Market research team analyzing consumer data and insights' },

  // Climate / Sustainability
  'biodegradable-packaging-manufacturing':  { id: 'photo-1542601906990-b4d3fb778b09', alt: 'Eco-friendly biodegradable packaging made from natural materials' },
  'carbon-offset-marketplace-india':        { id: 'photo-1473341304170-971dccb5ac1e', alt: 'Green forest representing carbon offset and environmental credits' },
  'e-waste-collection-recycling':           { id: 'photo-1550159930-40066082a4fc', alt: 'Electronic waste components being sorted for recycling' },
  'ev-charging-network-apartments':         { id: 'photo-1558618666-fcd25c85cd64', alt: 'Electric vehicle being charged at a modern EV charging station' },
  'green-building-materials-brand':         { id: 'photo-1486406146926-c627a92ad1ab', alt: 'Sustainable green building with modern eco-friendly architecture' },
  'organic-waste-composting-service':       { id: 'photo-1611735341450-74d61e660ad2', alt: 'Organic waste composting bins for sustainable waste management' },
  'plastic-waste-buyback-recycling':        { id: 'photo-1604187351574-c75ca79f5807', alt: 'Plastic bottles collected for recycling and waste management' },
  'rooftop-solar-installation-financing':   { id: 'photo-1509391366360-2e959784a276', alt: 'Solar panels installed on residential rooftop generating clean energy' },
  'sustainable-fashion-rental-platform':    { id: 'photo-1558618666-fcd25c85cd64', alt: 'Stylish clothing rack with sustainable and rental fashion pieces' },
  'urban-farming-kit-community':            { id: 'photo-1416879595882-3373a0480b5b', alt: 'Urban rooftop garden with vegetables growing in containers' },
  'used-cooking-oil-biodiesel':             { id: 'photo-1565043589221-1a6fd9ae45c7', alt: 'Biodiesel production facility converting waste cooking oil' },
  'rainwater-harvesting-systems':           { id: 'photo-1559825481-12a05cc00344', alt: 'Rainwater harvesting tank installation for water conservation' },
  'clean-cooking-fuel-distribution':        { id: 'photo-1576013551627-0cc20b96c2a7', alt: 'LPG cylinder delivery for clean cooking fuel distribution' },
  'community-solar-rural-india':            { id: 'photo-1509391366360-2e959784a276', alt: 'Community solar project in rural India with large panel array' },
  'climate-risk-advisory-farmers':          { id: 'photo-1625246333195-78d9c38ad449', alt: 'Farmer reviewing crop data on tablet against farm backdrop' },

  // Creator Economy
  'brand-deal-marketplace-influencers':     { id: 'photo-1611162617213-7d7a39e9b1d7', alt: 'Influencer at desk reviewing brand deals on laptop' },
  'creator-analytics-dashboard':            { id: 'photo-1551288049-bebda4e38f71', alt: 'Analytics dashboard with engagement metrics on computer screen' },
  'indian-podcast-hosting-platform':        { id: 'photo-1478737270239-2f02b77fc618', alt: 'Podcast studio with professional microphone and recording setup' },
  'influencer-management-agency-platform':  { id: 'photo-1611162617213-7d7a39e9b1d7', alt: 'Social media influencer management on digital platform' },
  'live-commerce-platform-india':           { id: 'photo-1523474253046-8cd2748b5fd2', alt: 'Live streaming commerce setup with product demonstration' },
  'micro-course-marketplace':               { id: 'photo-1432888498266-38ffec3eaf0a', alt: 'Professional recording a micro-course on camera' },
  'newsletter-monetisation-platform':       { id: 'photo-1586953208448-b95a79798f07', alt: 'Email newsletter analytics and subscriber dashboard' },
  'regional-audio-content-platform':        { id: 'photo-1478737270239-2f02b77fc618', alt: 'Audio recording studio for regional language content' },
  'short-video-creator-tools':              { id: 'photo-1611162617213-7d7a39e9b1d7', alt: 'Creator using video editing tools on smartphone' },
  'ugc-brand-marketplace':                  { id: 'photo-1557838923-2985c318be48', alt: 'User-generated content creators working for brand campaigns' },
  'virtual-events-paid-community-platform': { id: 'photo-1540575467063-178a50c2df87', alt: 'Virtual event platform with audience interaction on screen' },
  'fan-merchandise-platform-creators':      { id: 'photo-1556742049-0cfed4f6a45d', alt: 'Fan merchandise store with branded products and packaging' },
  'creator-legal-contract-tools':           { id: 'photo-1589829545856-d10d557cf95f', alt: 'Creator reviewing legal contracts on tablet' },

  // E-commerce
  'artisan-coffee-roastery-d2c':            { id: 'photo-1495474472287-4d71bcdd2085', alt: 'Freshly roasted artisan coffee beans with brewing equipment' },
  'baby-toddler-organic-care-d2c':          { id: 'photo-1515488042361-ee00e0ddd4e4', alt: 'Organic baby care products with natural ingredients' },
  'custom-corporate-gifting-platform':      { id: 'photo-1549465220-1a8b9238cd48', alt: 'Premium corporate gift boxes with branded packaging' },
  'ergonomic-home-office-furniture-d2c':    { id: 'photo-1593642632559-0c6d3fc62b89', alt: 'Ergonomic home office setup with adjustable desk and chair' },
  'ethnic-wear-fusion-fashion-d2c':         { id: 'photo-1583391733956-3750e0ff4e8b', alt: 'Beautiful Indian ethnic wear with fusion fashion styling' },
  'functional-foods-superfoods-d2c':        { id: 'photo-1490818387583-1baba5e638af', alt: 'Superfoods and functional food ingredients in bowls' },
  'handloom-handcraft-d2c':                 { id: 'photo-1558618666-fcd25c85cd64', alt: 'Handloom fabric and artisan handicraft products on display' },
  'indian-board-games-educational-toys':    { id: 'photo-1611996575749-79a3a250f948', alt: 'Indian themed board games and educational toys for children' },
  'indian-snacks-subscription-box':         { id: 'photo-1621955964441-c173e01c135b', alt: 'Assortment of Indian snacks in subscription box packaging' },
  'lab-grown-diamond-jewellery-d2c':        { id: 'photo-1515562141207-7a88fb7ce338', alt: 'Elegant diamond jewellery pieces in luxury display case' },
  'mattress-sleep-products-d2c':            { id: 'photo-1631049307264-da0ec9d70304', alt: 'Premium mattress and sleep products in a bedroom setup' },
  'mens-grooming-d2c-brand':               { id: 'photo-1586297135537-94bc9ba060aa', alt: 'Premium men\'s grooming products arranged on bathroom shelf' },
  'organic-natural-skincare-d2c':           { id: 'photo-1556228578-8c89e6adf883', alt: 'Natural organic skincare products with botanical ingredients' },
  'personalised-jewellery-d2c':             { id: 'photo-1611591437281-460bfbe1220a', alt: 'Personalised gold jewellery with custom engraving' },
  'premium-pet-food-d2c':                  { id: 'photo-1587300003388-59208cc962cb', alt: 'Premium pet food products for dogs and cats' },
  'preowned-luxury-goods-marketplace':      { id: 'photo-1548036328-c9fa89d128fa', alt: 'Pre-owned luxury handbags and watches on display' },
  'refurbished-electronics-marketplace':    { id: 'photo-1518770660439-4636190af475', alt: 'Refurbished laptops and electronic devices in clean display' },
  'reusable-menstrual-products-d2c':        { id: 'photo-1559386484-97dfc0e15539', alt: 'Eco-friendly reusable menstrual health products' },
  'senior-citizen-care-products-d2c':       { id: 'photo-1576765608535-5f04d1e3f289', alt: 'Healthcare and daily living products designed for senior citizens' },
  'smart-home-devices-indian-homes':        { id: 'photo-1558618666-fcd25c85cd64', alt: 'Smart home devices including voice assistant and automation hub' },
  'specialty-indian-condiments-export':     { id: 'photo-1596040033229-a9821ebd058d', alt: 'Traditional Indian spices and condiments in glass jars' },
  'sports-nutrition-supplements-d2c':       { id: 'photo-1434682881908-b43d0467b798', alt: 'Sports nutrition supplements and protein powders for athletes' },
  'sustainable-packaging-alternatives-d2c': { id: 'photo-1542601906990-b4d3fb778b09', alt: 'Sustainable packaging alternatives with eco-friendly materials' },
  'vernacular-content-merchandise':         { id: 'photo-1581338834647-b0fb40704e21', alt: 'Regional language branded merchandise and apparel' },
  'vintage-antique-online-marketplace':     { id: 'photo-1508193638397-1c4234db14d8', alt: 'Vintage antiques and curios displayed in an antique marketplace' },

  // EdTech
  'blue-collar-skill-upskilling-platform':  { id: 'photo-1621905251189-08b45d6a269e', alt: 'Blue-collar worker learning technical skills on tablet' },
  'ca-cma-exam-prep-platform':              { id: 'photo-1501504905252-473c47e087f8', alt: 'Student studying CA exam materials with books and laptop' },
  'cooking-culinary-skills-platform':       { id: 'photo-1414235077428-338989a2e8c0', alt: 'Professional chef teaching culinary skills in kitchen' },
  'corporate-learning-management-system':   { id: 'photo-1552664730-d307ca884978', alt: 'Corporate team using LMS on laptops in training session' },
  'early-childhood-learning-platform':      { id: 'photo-1503454537195-1dcabb73ffb9', alt: 'Young children engaged in interactive learning activities' },
  'financial-literacy-for-youth':           { id: 'photo-1579621970795-87facc2f976d', alt: 'Young student learning financial literacy on digital platform' },
  'interview-prep-mock-interview-platform': { id: 'photo-1573497491765-dccce02b29df', alt: 'Job candidate preparing for interview with mock session' },
  'k12-homework-help-ai-platform':          { id: 'photo-1488190211105-8b0e65b80b4e', alt: 'School student getting AI-powered homework help on tablet' },
  'k12-tutoring-competitive-exams':         { id: 'photo-1580582932707-520aed937b7b', alt: 'Teacher and student working through competitive exam problems' },
  'language-learning-platform':             { id: 'photo-1456513080510-7bf3a84b82f8', alt: 'Person learning a new language with headphones and laptop' },
  'legal-education-bar-exam-prep':          { id: 'photo-1589829545856-d10d557cf95f', alt: 'Law student reviewing legal books for bar exam preparation' },
  'music-education-platform-india':         { id: 'photo-1493225457124-a3eb161ffa5f', alt: 'Music student learning guitar with online platform guidance' },
  'neet-medical-entrance-preparation':      { id: 'photo-1576091160399-112ba8d25d1d', alt: 'Medical student studying NEET exam preparation materials' },
  'senior-professional-upskilling':         { id: 'photo-1507003211169-0a1dd7228f2d', alt: 'Senior professional learning digital skills on laptop' },
  'sports-coaching-academy-online':         { id: 'photo-1461896836934-ffe607ba8211', alt: 'Sports coach demonstrating technique in online coaching session' },
  'study-abroad-consulting-platform':       { id: 'photo-1541339907198-e08756dedf3f', alt: 'Students celebrating university admission for study abroad' },
  'teacher-professional-development-platform': { id: 'photo-1509062522246-3755977927d7', alt: 'Teacher in professional development workshop with other educators' },
  'vernacular-coding-bootcamp':             { id: 'photo-1517694712202-14dd9538aa97', alt: 'Students coding in regional language bootcamp workshop' },
  'digital-literacy-senior-citizens':       { id: 'photo-1464746133101-a2c3f88e0dd9', alt: 'Senior citizen learning digital literacy with tablet assistance' },
  'creative-arts-design-education-platform': { id: 'photo-1509909756405-be0199881695', alt: 'Art and design student working on creative digital project' },
  'gate-govt-exam-prep-platform':           { id: 'photo-1503676260728-1c00da094a0b', alt: 'Engineering student preparing for GATE government exam' },

  // FinTech
  'bnpl-kirana-msme-retailers':             { id: 'photo-1556742049-0cfed4f6a45d', alt: 'Kirana store owner using BNPL payment on smartphone' },
  'credit-scoring-thin-file-borrowers':     { id: 'photo-1551288049-bebda4e38f71', alt: 'Credit score dashboard showing alternative data analytics' },
  'cross-border-remittance-platform':       { id: 'photo-1526304640581-d334cdbbf45e', alt: 'International money transfer on a digital banking app' },
  'crypto-tax-filing-compliance':           { id: 'photo-1611974789855-9c2a0a7236a3', alt: 'Cryptocurrency tax filing dashboard on computer screen' },
  'gold-loan-fintech-app':                  { id: 'photo-1610375461246-83df859d849d', alt: 'Gold jewellery with digital loan app on smartphone' },
  'invoice-discounting-platform-msmes':     { id: 'photo-1450101499163-c8848c66ca85', alt: 'MSME business owner reviewing invoice discounting platform' },
  'micro-insurance-gig-workers':            { id: 'photo-1616077168079-7e09a677fb2c', alt: 'Gig worker with insurance coverage on mobile app' },
  'mutual-fund-advisory-tier2-india':       { id: 'photo-1579621970795-87facc2f976d', alt: 'Financial advisor explaining mutual fund options on tablet' },
  'revenue-based-financing-d2c-brands':     { id: 'photo-1567427018141-0584cfcbf1b8', alt: 'D2C brand founder reviewing revenue-based financing terms' },
  'salary-advance-app-blue-collar':         { id: 'photo-1616077168079-7e09a677fb2c', alt: 'Blue-collar worker using salary advance app on smartphone' },
  'savings-app-for-indian-women':           { id: 'photo-1607748862156-7c548e7e98f4', alt: 'Indian woman reviewing savings app on smartphone' },
  'trade-credit-insurance-exporters':       { id: 'photo-1494412574643-ff11b0a5c1c3', alt: 'Exporter reviewing trade credit insurance documents' },

  // Health & Wellness
  'addiction-recovery-support-platform':    { id: 'photo-1494783367193-149034c05e8f', alt: 'Supportive counseling session for recovery and wellness' },
  'allergen-free-medical-diet-delivery':    { id: 'photo-1490818387583-1baba5e638af', alt: 'Allergen-free healthy meal prepared with fresh ingredients' },
  'at-home-physiotherapy-services':         { id: 'photo-1571019614242-c5c5dee9f50b', alt: 'Physiotherapist providing at-home therapy session to patient' },
  'ayurvedic-herbal-medicine-platform':     { id: 'photo-1546069901-ba9599a7e63c', alt: 'Ayurvedic herbs and natural medicine ingredients in bowls' },
  'corporate-wellness-platform':            { id: 'photo-1552664730-d307ca884978', alt: 'Corporate employees in wellness workshop and meditation session' },
  'dental-care-subscription-plan':          { id: 'photo-1505751172876-fa1923c5c528', alt: 'Dentist examining patient with modern dental equipment' },
  'diabetes-management-platform':           { id: 'photo-1576091160399-112ba8d25d1d', alt: 'Patient using diabetes management app to track glucose levels' },
  'elder-care-home-services-platform':      { id: 'photo-1576765608535-5f04d1e3f289', alt: 'Caregiver providing professional home care for elderly person' },
  'fertility-support-ivf-companion-app':    { id: 'photo-1576765608535-5f04d1e3f289', alt: 'Couple consulting with fertility specialist via digital platform' },
  'genetic-testing-for-indian-populations': { id: 'photo-1582719471384-894fbb16e074', alt: 'DNA genetic testing laboratory with scientific equipment' },
  'home-blood-sample-collection-platform':  { id: 'photo-1559757175-0eb30cd8c063', alt: 'Healthcare worker collecting blood sample at patient\'s home' },
  'indian-fitness-app-for-indian-bodies':   { id: 'photo-1526506118085-60ce8714f8c5', alt: 'Indian person doing yoga and fitness workout' },
  'medical-second-opinion-platform':        { id: 'photo-1576091160399-112ba8d25d1d', alt: 'Doctor providing medical second opinion via telemedicine platform' },
  'mental-health-therapy-platform':         { id: 'photo-1506126613408-eca07ce68773', alt: 'Person in therapy session with mental health professional' },
  'online-nutrition-diet-consultation':     { id: 'photo-1490818387583-1baba5e638af', alt: 'Nutritionist consulting patient via video call with meal plan' },
  'online-pharmacy-prescription-management':{ id: 'photo-1585435557343-3b092031a831', alt: 'Online pharmacy app with prescription upload on smartphone' },
  'preventive-health-checkup-platform':     { id: 'photo-1576091160399-112ba8d25d1d', alt: 'Health checkup clinic with modern diagnostic equipment' },
  'sleep-disorder-clinic-telehealth':       { id: 'photo-1631049307264-da0ec9d70304', alt: 'Sleep study setup with monitoring equipment for disorder diagnosis' },
  'wellness-retreats-aggregator':           { id: 'photo-1537996194471-e657df975ab4', alt: 'Peaceful yoga retreat in nature surrounded by greenery' },
  'womens-health-pcos-thyroid-platform':    { id: 'photo-1607748862156-7c548e7e98f4', alt: 'Women\'s health consultation using digital health platform' },

  // Local Services
  'ac-appliance-servicing-platform':        { id: 'photo-1558618666-fcd25c85cd64', alt: 'Technician servicing air conditioner unit at residential home' },
  'car-wash-detailing-on-demand':           { id: 'photo-1520340356584-f9917d1eea6f', alt: 'Professional car wash and detailing service in action' },
  'catering-cloud-kitchen-platform':        { id: 'photo-1414235077428-338989a2e8c0', alt: 'Cloud kitchen catering team preparing food for events' },
  'document-pickup-govt-service-assistance':{ id: 'photo-1568992687947-868a62a9f521', alt: 'Government document processing with organized paperwork' },
  'dog-walking-pet-sitting-service':        { id: 'photo-1587300003388-59208cc962cb', alt: 'Dog walker with happy dogs on leash in a park' },
  'elder-care-companion-service':           { id: 'photo-1576765608535-5f04d1e3f289', alt: 'Compassionate caregiver accompanying elderly person on walk' },
  'event-decoration-service-platform':      { id: 'photo-1581578731548-c64695cc6952', alt: 'Beautifully decorated event hall with floral arrangements' },
  'gardening-landscaping-service':          { id: 'photo-1416879595882-3373a0480b5b', alt: 'Professional gardener maintaining lush green garden' },
  'home-cooked-tiffin-delivery':            { id: 'photo-1567620905732-2d1ec7ab7445', alt: 'Freshly cooked home-style Indian meal in tiffin boxes' },
  'home-deep-cleaning-service':             { id: 'photo-1581578731548-c64695cc6952', alt: 'Professional cleaners deep cleaning modern home interior' },
  'home-maintenance-subscription':          { id: 'photo-1607400201515-c2c41c07d307', alt: 'Handyman doing home maintenance and repair work' },
  'home-salon-beauty-service':              { id: 'photo-1560066984-138dadb4c035', alt: 'Professional beautician providing home salon service' },
  'hyperlocal-handyman-platform':           { id: 'photo-1607400201515-c2c41c07d307', alt: 'Handyman with tools arriving at customer\'s home for repairs' },
  'interior-design-consultation-platform':  { id: 'photo-1556909114-f6e7ad7d3136', alt: 'Interior designer presenting 3D room design to homeowner' },
  'laundry-dry-cleaning-pickup':            { id: 'photo-1545173168-9f1947eebb7f', alt: 'Laundry service pickup with neatly folded clean clothes' },
  'local-courier-document-pickup':          { id: 'photo-1568992687947-868a62a9f521', alt: 'Local courier delivering document package on motorcycle' },
  'moving-packing-service-platform':        { id: 'photo-1600585152220-90363fe7e115', alt: 'Professional movers packing boxes for household relocation' },
  'pest-control-service-platform':          { id: 'photo-1581578731548-c64695cc6952', alt: 'Pest control technician spraying treatment in residential home' },
  'photography-on-demand-service':          { id: 'photo-1516035069371-29a1b244cc32', alt: 'Photographer capturing professional photos on location' },
  'private-security-services-platform':     { id: 'photo-1567168544646-208fa5d408fb', alt: 'Professional security guard at building entrance' },
  'tailoring-alteration-on-demand':         { id: 'photo-1558618666-fcd25c85cd64', alt: 'Tailor measuring and stitching garment for customer' },
  'water-tank-cleaning-service':            { id: 'photo-1581578731548-c64695cc6952', alt: 'Water tank cleaning technician with equipment on rooftop' },
  'wedding-vendor-marketplace':             { id: 'photo-1519225421980-715cb0215aed', alt: 'Elegant Indian wedding decoration with floral mandap' },
  'yoga-fitness-at-home-platform':          { id: 'photo-1506126613408-eca07ce68773', alt: 'Person doing yoga at home via online fitness platform' },

  // SaaS
  'auto-repair-shop-management':            { id: 'photo-1530046339160-ce3e530c7d2f', alt: 'Auto repair shop mechanic using management software on tablet' },
  'b2b-procurement-platform-msmes':         { id: 'photo-1450101499163-c8848c66ca85', alt: 'B2B procurement team reviewing platform for MSME suppliers' },
  'ca-firm-practice-management':            { id: 'photo-1554224155-6726b3ff858f', alt: 'CA firm managing client accounts on practice software' },
  'clinic-hospital-management-system':      { id: 'photo-1576091160399-112ba8d25d1d', alt: 'Hospital reception using clinic management system on screen' },
  'construction-project-management-saas':   { id: 'photo-1504307651254-35680f356dfd', alt: 'Construction project manager reviewing site plans digitally' },
  'dental-clinic-management-software':      { id: 'photo-1505751172876-fa1923c5c528', alt: 'Dental clinic receptionist using management software' },
  'event-management-platform-planners':     { id: 'photo-1540575467063-178a50c2df87', alt: 'Event planner organizing large event using digital platform' },
  'field-sales-force-automation':           { id: 'photo-1551434678-e076c223a692', alt: 'Field sales representative using mobile sales automation app' },
  'fleet-management-saas-logistics':        { id: 'photo-1586528116311-ad8dd3c8310d', alt: 'Fleet manager monitoring trucks on GPS fleet management dashboard' },
  'freelancer-invoicing-tax-platform':      { id: 'photo-1554224155-6726b3ff858f', alt: 'Freelancer creating invoice and filing tax on platform' },
  'gym-fitness-studio-management':          { id: 'photo-1534438327276-14e5300c3a48', alt: 'Gym manager using fitness studio management software on tablet' },
  'hr-payroll-saas-smes':                   { id: 'photo-1497032628192-86f99bcd76bc', alt: 'HR manager processing payroll using cloud HR software' },
  'legal-document-automation-smbs':         { id: 'photo-1589829545856-d10d557cf95f', alt: 'Lawyer using AI-powered legal document automation tool' },
  'msme-gst-filing-automation':             { id: 'photo-1554224155-6726b3ff858f', alt: 'Business owner filing GST returns using automation software' },
  'pg-coliving-management-platform':        { id: 'photo-1555854877-bab0e564b8d5', alt: 'PG accommodation with modern co-living space management' },
  'pharmacy-management-pos':                { id: 'photo-1585435557343-3b092031a831', alt: 'Pharmacy cashier using POS management system at counter' },
  'property-management-landlords':          { id: 'photo-1560448204-e02f11c3d0e2', alt: 'Landlord using property management software on laptop' },
  'real-estate-crm-brokers':               { id: 'photo-1560448204-e02f11c3d0e2', alt: 'Real estate broker managing leads with CRM dashboard' },
  'restaurant-pos-inventory-saas':          { id: 'photo-1414235077428-338989a2e8c0', alt: 'Restaurant using POS system for order and inventory management' },
  'salon-spa-booking-crm':                  { id: 'photo-1560066984-138dadb4c035', alt: 'Salon receptionist managing bookings on CRM software' },
  'school-erp-tier2-cities':               { id: 'photo-1580582932707-520aed937b7b', alt: 'School administrator using ERP system in tier 2 city school' },
  'social-media-scheduling-indian-smbs':    { id: 'photo-1611162617213-7d7a39e9b1d7', alt: 'SMB owner scheduling social media posts on marketing platform' },
  'student-hostel-management-system':       { id: 'photo-1555854877-bab0e564b8d5', alt: 'Hostel warden using digital management system at reception' },
  'subscription-analytics-d2c-brands':      { id: 'photo-1551288049-bebda4e38f71', alt: 'D2C brand analyzing subscription metrics on analytics dashboard' },
  'temple-religious-institution-management':{ id: 'photo-1609921205586-7e8a57516512', alt: 'Temple administration using digital management system' },
  'warehouse-management-lite-d2c':          { id: 'photo-1586528116311-ad8dd3c8310d', alt: 'D2C warehouse staff using management system on tablet' },
  'agriculture-input-marketplace-saas':     { id: 'photo-1500937386664-56d1dfef3854', alt: 'Farmer browsing agricultural inputs on digital marketplace' },

  // agritech
  'agri-input-subscription-box':            { id: 'photo-1625246333195-78d9c38ad449', alt: 'Agri inputs subscription box with seeds and fertilizers' },
  'agricultural-land-leasing-platform':     { id: 'photo-1500937386664-56d1dfef3854', alt: 'Agricultural land with platform for leasing between farmers' },
  'cold-storage-as-a-service-produce':      { id: 'photo-1500937386664-56d1dfef3854', alt: 'Cold storage warehouse facility for fresh produce preservation' },
  'commodity-price-intelligence-agri-traders':{ id: 'photo-1551288049-bebda4e38f71', alt: 'Commodity price intelligence dashboard for agricultural traders' },
  'crop-insurance-aggregator-fpo':          { id: 'photo-1625246333195-78d9c38ad449', alt: 'Farmer reviewing crop insurance options via digital platform' },
  'dairy-farmer-income-optimizer':          { id: 'photo-1500937386664-56d1dfef3854', alt: 'Dairy farmer with cows using income optimization mobile app' },
  'dtc-honey-bee-products-brand':           { id: 'photo-1558642452-9d2a7deb7f62', alt: 'Natural honey products with beehive in background' },
  'farm-to-restaurant-marketplace':         { id: 'photo-1414235077428-338989a2e8c0', alt: 'Fresh vegetables from farm being delivered to restaurant kitchen' },
  'fisheries-aquaculture-management-platform':{ id: 'photo-1544551763-46a013bb70d5', alt: 'Fish farming and aquaculture pond management platform' },
  'food-safety-testing-lab-network':        { id: 'photo-1582719471384-894fbb16e074', alt: 'Food safety testing laboratory with equipment and samples' },
  'hydroponics-farm-in-a-box-urban':        { id: 'photo-1416879595882-3373a0480b5b', alt: 'Urban hydroponics farm growing vegetables in indoor setup' },
  'millets-ancient-grains-brand':           { id: 'photo-1490818387583-1baba5e638af', alt: 'Millets and ancient grain products in wooden bowls' },
  'organic-certification-saas-fpo':         { id: 'photo-1500937386664-56d1dfef3854', alt: 'FPO organic certification management using digital platform' },
  'plant-based-protein-brand-india':        { id: 'photo-1490818387583-1baba5e638af', alt: 'Plant-based protein products made from Indian ingredients' },
  'precision-irrigation-saas-small-farmers':{ id: 'photo-1625246333195-78d9c38ad449', alt: 'Drip irrigation system in field managed by smartphone app' },
  'spice-brand-farmer-traceability':        { id: 'photo-1596040033229-a9821ebd058d', alt: 'Authentic Indian spices with QR code for farmer traceability' },
  'veterinary-telehealth-livestock':        { id: 'photo-1500937386664-56d1dfef3854', alt: 'Veterinarian providing telehealth consultation for livestock farmer' },

  // b2b-services
  'b2b-procurement-financing-platform':     { id: 'photo-1450101499163-c8848c66ca85', alt: 'B2B procurement finance dashboard for business buyers' },
  'channel-partner-management-saas':        { id: 'photo-1552664730-d307ca884978', alt: 'Sales team managing channel partners on digital platform' },
  'employer-of-record-platform-india':      { id: 'photo-1497032628192-86f99bcd76bc', alt: 'HR platform for employer of record services in India' },
  'export-documentation-automation-platform':{ id: 'photo-1494412574643-ff11b0a5c1c3', alt: 'Export documents being processed on digital automation platform' },
  'fleet-management-saas-logistics-smes':   { id: 'photo-1586528116311-ad8dd3c8310d', alt: 'Logistics fleet manager using GPS tracking dashboard' },
  'fractional-cfo-network-startups':        { id: 'photo-1554224155-6726b3ff858f', alt: 'CFO presenting financial strategy to startup founding team' },
  'freelance-tech-talent-marketplace-startups':{ id: 'photo-1517694712202-14dd9538aa97', alt: 'Freelance developer working remotely on startup project' },
  'hr-tech-blue-collar-workforce':          { id: 'photo-1497032628192-86f99bcd76bc', alt: 'HR tech platform for managing blue-collar worker attendance' },
  'ip-patent-filing-platform-msme':         { id: 'photo-1589829545856-d10d557cf95f', alt: 'Entrepreneur filing patent on digital IP management platform' },
  'staffing-agency-management-saas':        { id: 'photo-1497032628192-86f99bcd76bc', alt: 'Staffing agency recruiter using SaaS to manage placements' },
  'sustainability-reporting-saas-india':    { id: 'photo-1473341304170-971dccb5ac1e', alt: 'Corporate ESG sustainability reporting dashboard on screen' },
  'vendor-compliance-audit-saas':           { id: 'photo-1450101499163-c8848c66ca85', alt: 'Compliance officer auditing vendor using digital SaaS tool' },

  // export
  'ayurvedic-herbal-products-export-brand': { id: 'photo-1546069901-ba9599a7e63c', alt: 'Ayurvedic herbal product range for global export market' },
  'india-africa-trade-finance-platform':    { id: 'photo-1494412574643-ff11b0a5c1c3', alt: 'India-Africa trade finance with shipping and port operations' },
  'indian-animation-vfx-export-studio':     { id: 'photo-1611162616305-c69b3fa7fbe0', alt: 'VFX animation studio with artists creating digital content' },
  'indian-artisan-jewellery-export-platform':{ id: 'photo-1515562141207-7a88fb7ce338', alt: 'Traditional Indian jewellery crafted for global export market' },
  'indian-chemical-raw-material-export':    { id: 'photo-1565043589221-1a6fd9ae45c7', alt: 'Chemical industrial plant producing raw materials for export' },
  'indian-engineering-goods-export-marketplace':{ id: 'photo-1565043589221-1a6fd9ae45c7', alt: 'Engineering goods machinery manufactured in India for export' },
  'indian-food-export-diaspora-commerce':   { id: 'photo-1596040033229-a9821ebd058d', alt: 'Indian food products packaged for diaspora export market' },
  'indian-handicraft-global-marketplace':   { id: 'photo-1558618666-fcd25c85cd64', alt: 'Indian handicrafts and artisan products for global marketplace' },
  'indian-organic-textiles-export-brand':   { id: 'photo-1558618666-fcd25c85cd64', alt: 'Organic Indian textiles and handloom fabrics for export' },
  'indian-renewable-energy-equipment-export':{ id: 'photo-1509391366360-2e959784a276', alt: 'Solar panels and renewable energy equipment for export' },
  'indian-startup-expansion-consulting':    { id: 'photo-1450101499163-c8848c66ca85', alt: 'Consulting team advising startup on international expansion' },
  'software-services-export-aggregator-boutique-it':{ id: 'photo-1517694712202-14dd9538aa97', alt: 'Indian IT team delivering software services to global clients' },
  'indian-legal-process-outsourcing-platform':{ id: 'photo-1589829545856-d10d557cf95f', alt: 'Legal professionals providing LPO services to global clients' },
  'indian-msme-export-aggregator':          { id: 'photo-1494412574643-ff11b0a5c1c3', alt: 'MSME goods packed at warehouse for export aggregation' },
  'india-gcc-real-estate-investment-platform':{ id: 'photo-1560448204-e02f11c3d0e2', alt: 'NRI real estate investment platform connecting India and GCC' },
  'india-japan-cultural-language-training-platform':{ id: 'photo-1456513080510-7bf3a84b82f8', alt: 'Japanese language learning platform for Indian professionals' },
  'indian-architecture-design-services-export':{ id: 'photo-1486406146926-c627a92ad1ab', alt: 'Indian architect designing for international client remotely' },

  // logistics
  'cross-border-fulfillment-platform-exporters':{ id: 'photo-1586528116311-ad8dd3c8310d', alt: 'Cross-border fulfillment center processing Indian export orders' },
  'd2c-shipping-aggregator-small-sellers':  { id: 'photo-1568992687947-868a62a9f521', alt: 'D2C small seller shipping parcels via aggregator platform' },
  'freight-brokerage-platform-sme-exporters':{ id: 'photo-1494412574643-ff11b0a5c1c3', alt: 'Freight containers at port managed by brokerage platform' },
  'hyperlocal-b2b-delivery-kirana':         { id: 'photo-1556742049-0cfed4f6a45d', alt: 'Delivery person on bike delivering to kirana store' },
  'last-mile-delivery-tier3-logistics':     { id: 'photo-1568992687947-868a62a9f521', alt: 'Last mile delivery rider on bike in tier 3 Indian town' },
  'milk-run-logistics-auto-components':     { id: 'photo-1586528116311-ad8dd3c8310d', alt: 'Auto component milk-run logistics truck between factories' },
  'pharma-cold-chain-monitoring-saas':      { id: 'photo-1585435557343-3b092031a831', alt: 'Pharmaceutical cold chain monitoring with temperature sensors' },
  'supply-chain-finance-logistics-smes':    { id: 'photo-1586528116311-ad8dd3c8310d', alt: 'Supply chain finance platform for logistics companies' },
  'warehouse-management-saas-3pl-smes':     { id: 'photo-1586528116311-ad8dd3c8310d', alt: '3PL warehouse management with digital inventory tracking' },

  // manufacturing
  'chemical-formulation-lab-industrial':    { id: 'photo-1582719471384-894fbb16e074', alt: 'Chemical laboratory formulating industrial compounds' },
  'contract-electronics-manufacturing-marketplace':{ id: 'photo-1518770660439-4636190af475', alt: 'Electronics manufacturing floor with PCB assembly process' },
  'custom-industrial-uniforms-workwear-brand':{ id: 'photo-1621905251189-08b45d6a269e', alt: 'Workers in custom industrial uniforms and safety workwear' },
  'ev-battery-pack-assembly-2wheelers':     { id: 'photo-1558618666-fcd25c85cd64', alt: 'Electric vehicle charging station for two-wheeler EVs' },
  'handloom-artisan-fabric-b2b-marketplace':{ id: 'photo-1558618666-fcd25c85cd64', alt: 'Handloom weaver creating traditional fabric for B2B market' },
  'industrial-iot-retrofitting-legacy-machines':{ id: 'photo-1565043589221-1a6fd9ae45c7', alt: 'Industrial IoT sensor attached to legacy factory machine' },
  'medical-device-manufacturing-tier2-hospitals':{ id: 'photo-1582719471384-894fbb16e074', alt: 'Medical device manufacturing facility for hospital equipment' },
  'modular-furniture-manufacturing-brand':  { id: 'photo-1556909114-f6e7ad7d3136', alt: 'Modular furniture assembled in modern home interior setting' },
  'packaging-design-procurement-platform-smes':{ id: 'photo-1542601906990-b4d3fb778b09', alt: 'SME packaging design and procurement on digital platform' },
  'quality-inspection-saas-export-manufacturers':{ id: 'photo-1565043589221-1a6fd9ae45c7', alt: 'Quality inspector checking manufactured goods at export facility' },
  'sme-factory-compliance-automation':      { id: 'photo-1621905251189-08b45d6a269e', alt: 'Factory compliance officer reviewing safety audit in facility' },
  'solar-panel-manufacturing-components':   { id: 'photo-1509391366360-2e959784a276', alt: 'Solar panel component manufacturing in production facility' },
  'steel-metal-scrap-trading-platform':     { id: 'photo-1565043589221-1a6fd9ae45c7', alt: 'Steel scrap yard with digital trading platform interface' },
  'textile-waste-upcycling-brand':          { id: 'photo-1558618666-fcd25c85cd64', alt: 'Textile waste being upcycled into new sustainable fashion pieces' },
  '3d-printing-service-bureau-for-industrial-parts':{ id: 'photo-1612349317150-e413f6a5b16d', alt: '3D printer creating industrial parts in a professional bureau' },

  // petcare
  'livestock-insurance-saas-rural':         { id: 'photo-1500937386664-56d1dfef3854', alt: 'Rural farmer with livestock covered by digital insurance platform' },
  'online-pet-training-platform':           { id: 'photo-1587300003388-59208cc962cb', alt: 'Pet owner training dog using online platform guidance' },
  'pet-cremation-memorial-services':        { id: 'photo-1587300003388-59208cc962cb', alt: 'Professional pet memorial service center' },
  'pet-grooming-franchise-network':         { id: 'photo-1587300003388-59208cc962cb', alt: 'Professional groomer bathing and grooming a dog at salon' },
  'pet-healthcare-subscription-platform':   { id: 'photo-1587300003388-59208cc962cb', alt: 'Vet consulting pet owner about healthcare subscription plan' },
  'pet-sitting-dog-walking-marketplace':    { id: 'photo-1587300003388-59208cc962cb', alt: 'Pet sitter walking multiple dogs in a park' },
  'premium-indian-pet-food-brand':          { id: 'photo-1587300003388-59208cc962cb', alt: 'Premium natural pet food ingredients for dogs and cats' },
  'raw-pet-food-subscription-barf':         { id: 'photo-1587300003388-59208cc962cb', alt: 'Raw BARF diet pet food subscription boxes for dogs' },
  'veterinary-diagnostics-saas':            { id: 'photo-1582719471384-894fbb16e074', alt: 'Veterinary diagnostic lab using AI-powered analysis software' },

  // proptech
  'affordable-student-housing-platform':    { id: 'photo-1555854877-bab0e564b8d5', alt: 'Affordable student housing with modern co-living amenities' },
  'commercial-real-estate-leasing-smes':    { id: 'photo-1486406146926-c627a92ad1ab', alt: 'Commercial office space available for SME leasing' },
  'green-building-certification-consulting-platform':{ id: 'photo-1486406146926-c627a92ad1ab', alt: 'Green building with certification for sustainable construction' },
  'nri-property-management-service':        { id: 'photo-1560448204-e02f11c3d0e2', alt: 'NRI property management dashboard showing Indian assets' },
  'office-space-fitout-financing-platform': { id: 'photo-1593642632559-0c6d3fc62b89', alt: 'Modern office fit-out with ergonomic furniture and design' },
  'property-tax-filing-optimisation-saas':  { id: 'photo-1554224155-6726b3ff858f', alt: 'Property owner filing tax optimization using SaaS platform' },
  'real-estate-legal-due-diligence-platform':{ id: 'photo-1589829545856-d10d557cf95f', alt: 'Real estate lawyer conducting due diligence on property documents' },
  'rental-agreement-tenant-management-platform':{ id: 'photo-1560448204-e02f11c3d0e2', alt: 'Landlord and tenant signing digital rental agreement online' },

  // travel
  'adventure-experiential-tourism-aggregator':{ id: 'photo-1464822759023-fed622ff2c3b', alt: 'Adventure trekkers on mountain trail in scenic Indian landscape' },
  'budget-hotel-property-management-saas':  { id: 'photo-1566073771259-6a8506099945', alt: 'Budget hotel reception using property management software' },
  'co-living-space-network-digital-nomads': { id: 'photo-1555854877-bab0e564b8d5', alt: 'Digital nomads working in modern co-living space' },
  'corporate-travel-management-saas-smes':  { id: 'photo-1436491865332-7a61a109cc05', alt: 'Business traveler using corporate travel management app' },
  'ev-charging-network-highways':           { id: 'photo-1508614999368-9260051292e5', alt: 'EV charging stations along Indian highway for long distance' },
  'luxury-train-experience-operator':       { id: 'photo-1436491865332-7a61a109cc05', alt: 'Luxury train journey through scenic Indian countryside' },
  'medical-tourism-facilitation-platform':  { id: 'photo-1576091160399-112ba8d25d1d', alt: 'International patient receiving medical care in Indian hospital' },
  'pilgrimage-trip-planning-platform':      { id: 'photo-1609921205586-7e8a57516512', alt: 'Hindu temple pilgrimage destination with devotees visiting' },
  'regional-language-travel-content-platform':{ id: 'photo-1436491865332-7a61a109cc05', alt: 'Travel content creator filming regional language travel video' },
  'rural-homestay-network':                 { id: 'photo-1537996194471-e657df975ab4', alt: 'Traditional rural homestay with host family in village setting' },
  'school-trip-educational-tour-operator':  { id: 'photo-1580582932707-520aed937b7b', alt: 'School students on educational field trip at historical site' },
  'train-travel-companion-app':             { id: 'photo-1436491865332-7a61a109cc05', alt: 'Traveler using train companion app on Indian railway journey' },
  'travel-insurance-saas-ota-corporate':    { id: 'photo-1436491865332-7a61a109cc05', alt: 'Traveler with travel insurance OTA booking on smartphone' },
  'wildlife-safari-booking-platform':       { id: 'photo-1516426122078-c23e76319801', alt: 'Wildlife safari jeep in Indian national park with animals' },

  // food
  'school-hostel-tiffin-aggregator':        { id: 'photo-1567620905732-2d1ec7ab7445', alt: 'Tiffin boxes with nutritious school meal for hostel students' },

  // manufacturing — niche batch 1
  'plastic-tile-spacer-manufacturing':      { id: 'photo-1504307651254-35680f356dfd', alt: 'Construction worker laying floor tiles with plastic spacers' },
  'rebar-cover-block-manufacturing':        { id: 'photo-1504307651254-35680f356dfd', alt: 'Concrete construction site with rebar cover blocks for spacing' },
  'chemical-anchor-capsule-manufacturing':  { id: 'photo-1504307651254-35680f356dfd', alt: 'Construction site with structural fastening and anchor installation' },
  'construction-floor-protection-film':     { id: 'photo-1504307651254-35680f356dfd', alt: 'Construction floor covered in protective film during renovation' },
  'pvc-traffic-cone-manufacturing':         { id: 'photo-1504307651254-35680f356dfd', alt: 'Road construction site with safety equipment and barriers' },
  'thermoplastic-road-marking-paint':       { id: 'photo-1504307651254-35680f356dfd', alt: 'Road construction and highway lane marking project' },
  'modular-rubber-speed-hump-manufacturing':{ id: 'photo-1504307651254-35680f356dfd', alt: 'Road safety installation with traffic calming equipment' },
  'cut-resistant-glove-manufacturing-india':{ id: 'photo-1621905251189-08b45d6a269e', alt: 'Worker wearing cut-resistant safety gloves in factory' },
  'lockout-tagout-kit-manufacturing':       { id: 'photo-1621905251189-08b45d6a269e', alt: 'Industrial safety lockout-tagout kit on electrical panel' },
  'bopp-self-adhesive-tape-manufacturing':  { id: 'photo-1586528116311-ad8dd3c8310d', alt: 'Warehouse worker sealing boxes with packing tape for dispatch' },
  'tamper-evident-security-seal-manufacturing':{ id: 'photo-1586528116311-ad8dd3c8310d', alt: 'Logistics packaging with security seals in warehouse facility' },
  'paper-edge-protector-angle-board':       { id: 'photo-1542601906990-b4d3fb778b09', alt: 'Cardboard packaging materials stacked for export shipment' },
  'pheromone-trap-insect-lure-manufacturing':{ id: 'photo-1500937386664-56d1dfef3854', alt: 'Pheromone insect trap hanging in agricultural crop field' },
  'agricultural-mulch-film-manufacturing':  { id: 'photo-1500937386664-56d1dfef3854', alt: 'Black plastic mulch film covering vegetable crop rows' },
  'plug-tray-seedling-tray-nursery':        { id: 'photo-1500937386664-56d1dfef3854', alt: 'Seedling plug trays in nursery greenhouse with young plants' },
  'ptfe-thread-seal-tape-manufacturing':    { id: 'photo-1565043589221-1a6fd9ae45c7', alt: 'Industrial pipe fitting installation with sealing materials' },
  'anaerobic-thread-locking-compound':      { id: 'photo-1582719471384-894fbb16e074', alt: 'Chemical thread locking compound applied to industrial bolt' },
  'nabl-instrument-calibration-laboratory': { id: 'photo-1582719471384-894fbb16e074', alt: 'Calibration technician measuring instruments in accredited lab' },
  'rope-access-industrial-services':        { id: 'photo-1621905251189-08b45d6a269e', alt: 'Rope access technician descending building facade for inspection' },
  'compressed-air-audit-leak-detection':    { id: 'photo-1565043589221-1a6fd9ae45c7', alt: 'Technician using ultrasonic leak detector on compressed air line' },
  'thermographic-thermal-imaging-inspection':{ id: 'photo-1565043589221-1a6fd9ae45c7', alt: 'Thermal camera image of electrical panel showing heat anomalies' },
  'black-soldier-fly-insect-farming':       { id: 'photo-1500937386664-56d1dfef3854', alt: 'Insect farming facility with black soldier fly larvae trays' },
  'cattle-ear-tag-livestock-id-manufacturing':{ id: 'photo-1500937386664-56d1dfef3854', alt: 'Cattle with colorful ear tags for livestock identification' },
  'clay-pigeon-skeet-target-manufacturing': { id: 'photo-1461896836934-ffe607ba8211', alt: 'Sports shooting range with clay pigeon targets' },
  'biodegradable-cremation-products':       { id: 'photo-1542601906990-b4d3fb778b09', alt: 'Eco-friendly biodegradable cremation products made from natural materials' },
  'polyurethane-industrial-castor-wheel':   { id: 'photo-1586528116311-ad8dd3c8310d', alt: 'Industrial warehouse with trolleys and heavy-duty castor wheels' },
}

// ─── Build a clean URL from Unsplash photo ID ─────────────────────────────────
function unsplashUrl(id) {
  return `https://images.unsplash.com/${id}?w=1200&q=80`
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function downloadImage(url, filepath) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; seed-script/1.0)' },
    redirect: 'follow',
  })
  if (!res.ok) throw new Error(`HTTP ${res.status} from ${url}`)
  writeFileSync(filepath, Buffer.from(await res.arrayBuffer()))
  return filepath
}

async function seed() {
  const tmpDir = join(tmpdir(), 'sanity-idea-images-bulk')
  mkdirSync(tmpDir, { recursive: true })

  // Fetch ideas based on --force or --slug flags
  const groqFilter = FORCE
    ? '*[_type == "businessIdea"]'
    : '*[_type == "businessIdea" && !defined(cover_image)]'

  let docs = await client.fetch(
    `${groqFilter}{ _id, "slug": slug.current, title, industry } | order(industry asc, title asc)`
  )

  if (SLUG_FILTER) {
    docs = docs.filter(d => d.slug === SLUG_FILTER)
    console.log(`Targeting slug "${SLUG_FILTER}": ${docs.length} idea(s)\n`)
  } else if (INDUSTRY_FILTER) {
    docs = docs.filter(d => d.industry === INDUSTRY_FILTER)
    console.log(`Filtered to industry "${INDUSTRY_FILTER}": ${docs.length} ideas\n`)
  } else {
    console.log(`Found ${docs.length} ideas ${FORCE ? '(all — force mode)' : 'without cover images'}\n`)
  }

  if (DRY_RUN) {
    console.log('DRY RUN — listing only, nothing will be uploaded:\n')
    for (const doc of docs) {
      const override = SLUG_OVERRIDES[doc.slug]
      const fallback = INDUSTRY_DEFAULTS[doc.industry]
      const entry = override || fallback
      if (entry) {
        console.log(`  ✓ ${doc.industry} | ${doc.slug}`)
        console.log(`    → ${entry.alt}`)
      } else {
        console.log(`  ✗ NO IMAGE: ${doc.industry} | ${doc.slug}`)
      }
    }
    return
  }

  let done = 0, skipped = 0, failed = 0

  for (const doc of docs) {
    const override = SLUG_OVERRIDES[doc.slug]
    const fallback = INDUSTRY_DEFAULTS[doc.industry]
    const entry = override || fallback

    if (!entry) {
      console.log(`  SKIP (no mapping) — ${doc.industry} | ${doc.slug}`)
      skipped++
      continue
    }

    console.log(`Processing [${done + failed + skipped + 1}/${docs.length}]: ${doc.slug}`)

    const imageUrl = unsplashUrl(entry.id)
    const tmpFile = join(tmpDir, `${doc.slug}.jpg`)
    try {
      await downloadImage(imageUrl, tmpFile)
    } catch (err) {
      console.log(`  ✗ Download failed: ${err.message}`)
      failed++
      continue
    }

    let asset
    try {
      asset = await client.assets.upload('image', createReadStream(tmpFile), {
        filename: `${doc.slug}.jpg`,
        contentType: 'image/jpeg',
      })
    } catch (err) {
      console.log(`  ✗ Upload failed: ${err.message}`)
      failed++
      continue
    }

    try {
      await client
        .patch(doc._id)
        .set({
          cover_image: {
            _type: 'image',
            asset: { _type: 'reference', _ref: asset._id },
            alt: entry.alt,
          },
        })
        .commit()
      console.log(`  ✓ Done (${override ? 'specific' : 'industry default'})`)
      done++
    } catch (err) {
      console.log(`  ✗ Patch failed: ${err.message}`)
      failed++
    }

    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 400))
  }

  console.log(`\n✓ Completed: ${done} patched, ${skipped} skipped (no mapping), ${failed} failed`)
}

seed().catch(err => { console.error(err.message); process.exit(1) })
