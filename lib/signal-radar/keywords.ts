export interface OpportunityCategory {
  id: string
  label: string
  icon: string
  color: string
  keywords: string[]     // any match → article tagged to this category
  ideaQuery: string      // link to /business-ideas?tags=...
}

// Keywords are matched against: title + description (lowercased, HTML-stripped)
export const OPPORTUNITY_CATEGORIES: OpportunityCategory[] = [
  {
    id: 'ev-cleantech',
    label: 'EV & Clean Energy',
    icon: '⚡',
    color: 'emerald',
    keywords: [
      'electric vehicle', 'ev charging', 'ev startup', 'ola electric', 'ather energy',
      'solar panel', 'solar energy', 'rooftop solar', 'solar installation', 'renewable energy',
      'clean energy', 'green energy', 'battery storage', 'green hydrogen', 'wind energy',
      'net zero', 'carbon credit', 'emission', 'cleantech', 'energy storage', 'ev fleet',
      'electric bus', 'electric truck', 'solar farm', 'solar park', 'pm surya ghar',
    ],
    ideaQuery: '/business-ideas?tags=cleantech',
  },
  {
    id: 'fintech',
    label: 'Fintech & Payments',
    icon: '💳',
    color: 'blue',
    keywords: [
      'fintech', 'upi', 'payment gateway', 'neobank', 'digital lending', 'bnpl',
      'buy now pay later', 'credit card startup', 'insurtech', 'wealth management',
      'investment platform', 'digital rupee', 'cbdc', 'account aggregator',
      'lending startup', 'microfinance', 'nbfc', 'neo bank', 'open banking',
      'payment aggregator', 'pgda', 'razorpay', 'paytm', 'phonepe', 'gpay',
      'rupee', 'sebi regulation', 'rbi regulation', 'credit scoring',
    ],
    ideaQuery: '/business-ideas?industry=fintech',
  },
  {
    id: 'agritech-food',
    label: 'Agritech & Food',
    icon: '🌾',
    color: 'lime',
    keywords: [
      'agritech', 'farmer', 'agriculture', 'kisan', 'crop', 'mandi', 'fpo',
      'farm to table', 'food delivery', 'foodtech', 'fmcg startup', 'cloud kitchen',
      'dark store', 'quick commerce', 'zepto', 'blinkit', 'instamart',
      'food processing', 'cold chain', 'agri startup', 'precision farming',
      'drone spray', 'soil testing', 'organic farming', 'natural farming',
      'aquaculture', 'fishery', 'dairy startup', 'd2c food', 'snack brand',
    ],
    ideaQuery: '/business-ideas?industry=food',
  },
  {
    id: 'health-wellness',
    label: 'Healthcare & Wellness',
    icon: '🏥',
    color: 'rose',
    keywords: [
      'healthtech', 'telemedicine', 'health startup', 'diagnostic lab', 'medtech',
      'hospital', 'health insurance', 'mental health', 'wellness', 'ayurveda',
      'ayush', 'pharma startup', 'drug delivery', 'home healthcare', 'nursing',
      'medical device', 'wearable health', 'health monitoring', 'pathology',
      'radiology startup', 'dental startup', 'fertility', 'ivf', 'senior care',
      'elder care', 'rehabilitation', 'physiotherapy', 'nutritionist',
      'abha', 'ndhm', 'health record', 'abdm',
    ],
    ideaQuery: '/business-ideas?industry=healthcare',
  },
  {
    id: 'edtech-skills',
    label: 'EdTech & Skills',
    icon: '📚',
    color: 'violet',
    keywords: [
      'edtech', 'education startup', 'online learning', 'e-learning', 'upskilling',
      'coaching startup', 'neet', 'jee', 'upsc', 'government exam', 'skill india',
      'nsdc', 'vocational training', 'coding bootcamp', 'learn to code',
      'vernacular education', 'regional language learning', 'teacher platform',
      'tutoring', 'homework help', 'study app', 'physicswallah', 'byju',
      'classplus', 'national education policy', 'nep', 'higher education',
    ],
    ideaQuery: '/business-ideas?industry=education',
  },
  {
    id: 'logistics',
    label: 'Logistics & Supply Chain',
    icon: '🚚',
    color: 'orange',
    keywords: [
      'logistics startup', 'last mile delivery', 'supply chain', 'warehouse',
      'cold chain', 'freight startup', 'cargo', '3pl', 'fulfilment center',
      'dark store logistics', 'delivery partner', 'hyperlocal delivery',
      'cross border logistics', 'export logistics', 'shiprocket', 'delhivery',
      'porter', 'shadowfax', 'truck aggregator', 'fleet management',
      'vehicle tracking', 'ev logistics', 'drone delivery', 'intermodal',
    ],
    ideaQuery: '/business-ideas?industry=logistics',
  },
  {
    id: 'd2c-retail',
    label: 'D2C & Retail',
    icon: '🛍️',
    color: 'pink',
    keywords: [
      'd2c', 'direct to consumer', 'dtoc brand', 'ecommerce startup',
      'shopify india', 'ondc', 'open network', 'social commerce',
      'beauty brand india', 'personal care startup', 'apparel startup',
      'fashion startup', 'luxury resale', 'quick commerce brand',
      'subscription box', 'pet brand', 'home decor startup',
      'handmade', 'artisan', 'vernacular commerce', 'tier 2 ecommerce',
    ],
    ideaQuery: '/business-ideas?industry=ecommerce',
  },
  {
    id: 'saas-b2b',
    label: 'SaaS & B2B Software',
    icon: '💻',
    color: 'indigo',
    keywords: [
      'saas startup', 'b2b software', 'enterprise software', 'hrtech',
      'hr software', 'payroll software', 'accounting software', 'erp startup',
      'crm startup', 'field force', 'field service', 'inventory management',
      'pos startup', 'restaurant tech', 'hotel tech', 'proptech saas',
      'legal tech', 'legaltech', 'compliance tech', 'regtech', 'ai saas',
      'developer tool', 'api startup', 'no-code', 'low-code',
    ],
    ideaQuery: '/business-ideas?industry=saas',
  },
  {
    id: 'manufacturing-export',
    label: 'Manufacturing & Export',
    icon: '🏭',
    color: 'slate',
    keywords: [
      'make in india', 'pli scheme', 'production linked incentive', 'msme export',
      'manufacturing startup', 'contract manufacturing', 'export india',
      'china plus one', 'global supply chain', 'semiconductor india',
      'electronics manufacturing', 'defence startup', 'space startup',
      'deep tech', 'material science', 'chemical startup', 'specialty chemical',
      'textile export', 'handicraft export', 'gems jewellery export',
      'pharma export', 'api export', 'agri export', 'seafood export',
    ],
    ideaQuery: '/business-ideas?industry=manufacturing',
  },
  {
    id: 'climate-sustainability',
    label: 'Climate & Sustainability',
    icon: '🌍',
    color: 'teal',
    keywords: [
      'climate tech', 'sustainability startup', 'circular economy', 'waste management',
      'recycling startup', 'e-waste', 'plastic recycling', 'water startup',
      'water treatment', 'air quality', 'carbon market', 'esg startup',
      'sustainable packaging', 'green building', 'water atm', 'sewage treatment',
      'biofuel', 'biogas', 'biomass', 'composting startup', 'upcycling',
    ],
    ideaQuery: '/business-ideas?tags=sustainability',
  },
  {
    id: 'ai-ml',
    label: 'AI & Automation',
    icon: '🤖',
    color: 'amber',
    keywords: [
      'artificial intelligence', 'machine learning', 'generative ai', 'llm',
      'chatgpt india', 'ai startup india', 'ai tool', 'automation startup',
      'robotic process automation', 'rpa', 'computer vision startup',
      'natural language processing', 'nlp startup', 'ai in agriculture',
      'ai in healthcare', 'ai in education', 'ai for sme', 'bhashini',
      'indic ai', 'hindi ai', 'regional language ai', 'ai model india',
    ],
    ideaQuery: '/business-ideas?tags=ai',
  },
  {
    id: 'real-estate-infra',
    label: 'Real Estate & Infra',
    icon: '🏗️',
    color: 'yellow',
    keywords: [
      'proptech', 'real estate startup', 'coworking', 'co-living',
      'affordable housing', 'smart city', 'infrastructure startup',
      'construction tech', 'building material', 'interior design startup',
      'home renovation', 'facility management', 'property management',
      'commercial real estate', 'warehousing', 'industrial park',
    ],
    ideaQuery: '/business-ideas?industry=realestate',
  },
]

export const PAIN_POINT_PHRASES = [
  // Direct asks / gaps
  'is there a service', 'i wish there was', 'why is there no', 'why is there not',
  'anyone know a', 'looking for a service', 'need a startup', 'does anyone offer',
  'this needs to exist', 'why doesn\'t anyone', 'why don\'t they', 'nobody does',
  'no one has solved', 'market gap', 'underserved', 'gap in the market',
  // Frustration language
  'can\'t find', 'cannot find', 'problem with', 'frustrated with', 'frustrated by',
  'no solution', 'terrible experience', 'overpriced', 'too expensive',
  'annoying that', 'huge problem', 'big problem', 'biggest problem', 'major problem',
  'biggest challenge', 'major challenge', 'pain point', 'biggest pain',
  // Reddit India-specific patterns
  'losing money', 'losing crore', 'losing lakh', 'paying bribe', 'highway bribe',
  'cheated by', 'scammed by', 'ripped off', 'no regulation', 'unregulated',
  'difficult to find', 'hard to find', 'shortage of', 'lack of',
  'nobody is doing', 'no one is doing', 'this space needs', 'opportunity here',
  'untapped market', 'missing product', 'missing service', 'should exist',
  'startup idea', 'business idea', 'disruption needed', 'broken system',
  'worst experience', 'pathetic service', 'needs to improve',
]

export const STOPWORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with',
  'by','from','up','about','into','through','during','including','until',
  'against','among','throughout','despite','towards','upon','concerning',
  'that','this','these','those','is','are','was','were','be','been','being',
  'have','has','had','do','does','did','will','would','could','should','may',
  'might','must','shall','can','need','dare','ought','used','said','says',
  'its','it','he','she','they','we','you','i','my','your','his','her','our',
  'their','what','which','who','when','where','why','how','all','both','each',
  'few','more','most','other','some','such','no','not','only','same','so',
  'than','too','very','just','over','after','also','new','one','first','last',
  'long','great','little','own','right','big','high','low','next','early',
  'even','back','any','good','old','see','now','well','year','years','month',
  'india','indian','company','companies','business','market','report','says',
  'according','told','news','times','today','week','sector','data',
])
