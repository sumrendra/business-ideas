export interface Category {
  id: string
  label: string
  icon: string
  // Google Maps Places API type(s) — typed nearbysearch
  placesTypes: string[]
  // Broad Google Places types — cast wide net, then classify by nameKeywords
  umbrellaTypes: string[]
  // Text search queries — catches businesses that skip proper type tagging
  textSearchKeywords: string[]
  // Multilingual keywords matched against business name (English + regional transliterations)
  nameKeywords: string[]
  // Search keywords for Google Trends
  trendsKeywords: string[]
  description: string
  color: string
  // OpenStreetMap Overpass API tag filters — each entry is "key=value"
  osmTags: string[]
}

export const CATEGORIES: Category[] = [
  {
    id: 'ev-charging',
    label: 'EV Charging Stations',
    icon: '⚡',
    placesTypes: ['electric_vehicle_charging_station'],
    umbrellaTypes: ['establishment'],
    textSearchKeywords: [
      'EV charging station',
      'electric vehicle charging point',
      'EV charger',
      'electric car charging',
    ],
    nameKeywords: [
      // English
      'ev charging', 'electric vehicle', 'ev station', 'charging point',
      'ev charger', 'charge point', 'ev plug', 'ev port',
      // Brand names common in India
      'tata power ev', 'ather grid', 'statiq', 'magenta', 'fortum', 'jio-bp',
      // Hindi
      'vidyut vahana', 'vahan charging',
    ],
    trendsKeywords: ['ev charging station', 'electric vehicle charging', 'ev charger near me'],
    description: 'Electric vehicle charging infrastructure',
    color: 'bg-green-50 border-green-200',
    osmTags: ['amenity=charging_station'],
  },
  {
    id: 'cloud-kitchen',
    label: 'Cloud Kitchens',
    icon: '🍳',
    placesTypes: ['meal_delivery', 'restaurant'],
    umbrellaTypes: ['restaurant', 'food'],
    textSearchKeywords: [
      'cloud kitchen',
      'ghost kitchen',
      'dark kitchen',
      'delivery kitchen',
    ],
    nameKeywords: [
      'cloud kitchen', 'ghost kitchen', 'dark kitchen', 'delivery only',
      'virtual kitchen', 'delivery kitchen', 'online kitchen',
      // Brand names
      'rebel foods', 'faasos', 'behrouz', 'oven story', 'box8',
      'freshmenu', 'kitchens of india',
    ],
    trendsKeywords: ['cloud kitchen', 'ghost kitchen', 'food delivery startup'],
    description: 'Delivery-only kitchen businesses',
    color: 'bg-orange-50 border-orange-200',
    osmTags: ['amenity=fast_food', 'amenity=restaurant'],
  },
  {
    id: 'coworking',
    label: 'Co-working Spaces',
    icon: '💼',
    placesTypes: ['coworking_space'],
    umbrellaTypes: ['establishment'],
    textSearchKeywords: [
      'coworking space',
      'co-working office',
      'shared office space',
      'flexible office space',
    ],
    nameKeywords: [
      // English
      'cowork', 'co-work', 'coworking', 'shared office', 'flex office',
      'hot desk', 'collaborative workspace', 'business centre', 'work hub',
      'innovation hub', 'startup hub', 'incubator',
      // Brand names
      'wework', 'awfis', '91springboard', 'innov8', 'gowork', 'iworks',
      'cowrks', 'bhive', 'workafella', 'smartworks',
    ],
    trendsKeywords: ['coworking space', 'shared office space', 'work from cafe'],
    description: 'Shared workspaces and flex offices',
    color: 'bg-indigo-50 border-indigo-200',
    osmTags: ['amenity=coworking_space', 'office=coworking'],
  },
  {
    id: 'pharmacy',
    label: 'Pharmacies',
    icon: '💊',
    placesTypes: ['pharmacy'],
    umbrellaTypes: ['health', 'store'],
    textSearchKeywords: [
      'medical store',
      'medical shop',
      'chemist shop',
      'medicine store',
      'dawakhana',
      'dispensary',
      'drug store',
      'pharma store',
    ],
    nameKeywords: [
      // English
      'medical', 'medicals', 'medico', 'pharma', 'pharmacy', 'chemist',
      'drugs', 'drug house', 'dispensary', 'medicine', 'medicines',
      'medistore', 'med store', 'druggist', 'apothecary',
      // Hindi / Urdu / Sanskrit
      'aushadhi', 'aushadh', 'aushadha', 'aushadhalaya', 'aushadh bhandar',
      'dawa', 'dava', 'davai', 'dawai', 'dawakhana', 'davakhana',
      'dawa khana', 'dava bhandar', 'dawa ghar', 'janaushadhi',
      'oshadi', 'vaidya', 'bhaishajya',
      // Tamil
      'marundhu', 'marundhalagam', 'maruntu', 'vaithiya',
      // Telugu
      'aushadam', 'mandu', 'mandula',
      // Kannada
      'madu', 'maddu', 'beshaja', 'aushadhi',
      // Marathi
      'aushadh', 'davakhana',
      // Bengali
      'oshudh', 'osudh',
      // Gujarati
      'davakhanu',
      // Common brand suffixes
      'health care', 'healthcare', 'arogya', 'niramay',
    ],
    trendsKeywords: ['pharmacy near me', 'medical store', 'online pharmacy delivery'],
    description: 'Retail and online pharmacies',
    color: 'bg-red-50 border-red-200',
    osmTags: ['amenity=pharmacy'],
  },
  {
    id: 'fitness',
    label: 'Gyms & Fitness',
    icon: '🏋️',
    placesTypes: ['gym'],
    umbrellaTypes: ['health'],
    textSearchKeywords: [
      'gym',
      'fitness centre',
      'yoga studio',
      'gymnasium',
      'health club',
      'crossfit',
    ],
    nameKeywords: [
      // English
      'gym', 'fitness', 'gymnasium', 'yoga', 'aerobics', 'zumba',
      'workout', 'crossfit', 'pilates', 'health club', 'body building',
      'strength training', 'martial arts', 'boot camp', 'spin class',
      // Hindi / Sanskrit
      'vyayamshala', 'vyayam shaala', 'vyayam', 'akhara', 'akhada',
      'kushti', 'talim', 'baithak', 'dand', 'judo', 'karate',
      // South Indian
      'kalari', 'kalaripayattu', 'silambam',
      // Marathi
      'kusti', 'malla',
      // Common name patterns
      'fit', 'physique', 'muscle', 'shape', 'slim', 'tone', 'flex',
      'anytime fitness', 'cult fit', 'cultfit', 'golds gym', 'gold gym',
    ],
    trendsKeywords: ['gym near me', 'fitness center', 'yoga class near me'],
    description: 'Gyms, yoga studios, and fitness centres',
    color: 'bg-purple-50 border-purple-200',
    osmTags: ['leisure=fitness_centre', 'leisure=gym'],
  },
  {
    id: 'tutoring',
    label: 'Tutoring / Ed-centres',
    icon: '📚',
    placesTypes: ['tutoring_center', 'school'],
    umbrellaTypes: ['school', 'establishment'],
    textSearchKeywords: [
      'coaching classes',
      'tuition centre',
      'coaching institute',
      'tutorial classes',
      'private tutor',
    ],
    nameKeywords: [
      // English
      'coaching', 'tuition', 'tutorial', 'academy', 'coaching classes',
      'coaching centre', 'study circle', 'learning centre', 'educare',
      'tutor', 'institute', 'prep', 'crash course',
      // Hindi / Sanskrit
      'shiksha', 'shikshani', 'vidya', 'vidyalaya', 'vidyalay',
      'pathshala', 'gurukul', 'adhyayan', 'padhna', 'siksha',
      // Brand names
      'byju', 'vedantu', 'unacademy', 'aakash', 'fiitjee', 'resonance',
      'allen', 'narayana', 'sri chaitanya', 'base',
      // Common patterns
      'classes', 'class', 'school of', 'centre for',
    ],
    trendsKeywords: ['tuition near me', 'coaching class', 'online tutoring'],
    description: 'Private tutoring and coaching institutes',
    color: 'bg-blue-50 border-blue-200',
    osmTags: ['amenity=school', 'amenity=tutoring_centre'],
  },
  {
    id: 'pet-services',
    label: 'Pet Care Services',
    icon: '🐾',
    placesTypes: ['veterinary_care', 'pet_store'],
    umbrellaTypes: ['store', 'veterinary_care'],
    textSearchKeywords: [
      'pet shop',
      'veterinary clinic',
      'dog grooming',
      'pet grooming salon',
      'animal clinic',
    ],
    nameKeywords: [
      // English
      'vet', 'veterinary', 'pet shop', 'pet care', 'pet store',
      'animal clinic', 'dog grooming', 'cat clinic', 'pet parlour',
      'animal hospital', 'paws', 'furry', 'pawsome', 'pawz', 'woof',
      'meow', 'doggy', 'puppy', 'kitty', 'bark', 'paw',
      // Hindi
      'pashu', 'pashu chikitsa', 'prani', 'janwar', 'chikitsalay',
      // Tamil
      'villangu', 'maruttuvam',
      // Telugu
      'janaprani',
      // Brands
      'heads up for tails', 'papa pawsome', 'pet station', 'pet world',
    ],
    trendsKeywords: ['pet grooming near me', 'veterinary clinic', 'dog boarding'],
    description: 'Vet clinics, grooming, and pet boarding',
    color: 'bg-amber-50 border-amber-200',
    osmTags: ['amenity=veterinary', 'shop=pet'],
  },
  {
    id: 'cold-storage',
    label: 'Cold Storage & Logistics',
    icon: '🧊',
    placesTypes: ['storage', 'moving_company'],
    umbrellaTypes: ['establishment'],
    textSearchKeywords: [
      'cold storage',
      'refrigerated warehouse',
      'cold chain storage',
      'frozen storage facility',
    ],
    nameKeywords: [
      'cold storage', 'refrigerated', 'cold chain', 'frozen warehouse',
      'cool storage', 'reefer', 'chilled storage', 'blast freezer',
      // Hindi
      'sheetgrih', 'sheet grah', 'sheetala', 'thandastorage',
    ],
    trendsKeywords: ['cold storage near me', 'cold chain logistics', 'refrigerated warehouse'],
    description: 'Cold chain and temperature-controlled storage',
    color: 'bg-cyan-50 border-cyan-200',
    osmTags: ['amenity=cold_storage', 'building=warehouse'],
  },
  {
    id: 'beauty-salon',
    label: 'Salons & Beauty',
    icon: '💇',
    placesTypes: ['beauty_salon', 'hair_care'],
    umbrellaTypes: ['beauty_salon', 'store'],
    textSearchKeywords: [
      'beauty parlour',
      'hair salon',
      'ladies parlour',
      'unisex salon',
      'beauty studio',
      'hair studio',
    ],
    nameKeywords: [
      // English
      'salon', 'saloon', 'parlour', 'parlor', 'beauty', 'hair studio',
      'unisex', 'ladies salon', 'gents salon', 'haircut', 'hair cut',
      'spa', 'makeover', 'bridal', 'nail art', 'threading', 'waxing',
      'hairstyle', 'barber', 'grooming studio',
      // Hindi / Sanskrit
      'sringaar', 'shringar', 'kesh', 'kesh nikhar', 'kesh soudha',
      'sundari', 'sundar', 'roop', 'roopalaya', 'sajawat',
      'nai', 'hajjamat', 'mehendi', 'saundarya',
      // Tamil
      'azhagu', 'azhagini', 'kesam', 'mudikattu',
      // Telugu
      'sundara', 'alankara', 'kesalu',
      // Kannada
      'soundarya', 'kesha',
      // Marathi
      'sundara', 'kesalaya',
      // Brands
      'jawed habib', 'naturals', 'lakmé', 'lakme', 'vlcc', 'enrich',
      'toni guy', 'geetanjali',
    ],
    trendsKeywords: ['salon near me', 'beauty parlour', 'unisex salon'],
    description: 'Hair salons, parlours, and beauty studios',
    color: 'bg-pink-50 border-pink-200',
    osmTags: ['shop=hairdresser', 'shop=beauty'],
  },
  {
    id: 'atm-banking',
    label: 'ATMs & Banking',
    icon: '🏧',
    placesTypes: ['atm', 'bank'],
    umbrellaTypes: ['finance', 'bank'],
    textSearchKeywords: [
      'ATM machine',
      'bank branch',
      'cash withdrawal ATM',
      'bank ATM',
    ],
    nameKeywords: [
      'atm', 'bank', 'banking', 'cash machine',
      // Major Indian banks
      'sbi', 'state bank', 'hdfc', 'icici', 'axis bank', 'kotak',
      'pnb', 'punjab national', 'union bank', 'canara', 'bob', 'bank of baroda',
      'yes bank', 'idfc', 'bandhan', 'rbl', 'federal bank', 'south indian bank',
      'indian bank', 'uco bank', 'bank of india', 'central bank',
      'andhra bank', 'allahabad bank', 'corporation bank',
      // Regional
      'gramin bank', 'nainital bank', 'karnataka bank', 'kvb',
      // Cooperative
      'cooperative bank', 'sahakari bank', 'nagrik bank',
    ],
    trendsKeywords: ['atm near me', 'bank branch', 'digital banking'],
    description: 'ATMs, bank branches, and payment kiosks',
    color: 'bg-slate-50 border-slate-200',
    osmTags: ['amenity=atm', 'amenity=bank'],
  },
  {
    id: 'diagnostic-lab',
    label: 'Diagnostic Labs',
    icon: '🔬',
    placesTypes: ['hospital', 'doctor'],
    umbrellaTypes: ['health', 'hospital'],
    textSearchKeywords: [
      'diagnostic centre',
      'pathology lab',
      'clinical laboratory',
      'blood test lab',
      'diagnostic laboratory',
      'health check centre',
    ],
    nameKeywords: [
      // English
      'diagnostic', 'diagnostics', 'pathology', 'laboratory', 'lab',
      'clinical lab', 'scan centre', 'imaging', 'blood test', 'health check',
      'x-ray', 'xray', 'ultrasound', 'mri', 'ct scan', 'ecg', 'eeg',
      // Brand names
      'dr lal', 'lal path labs', 'metropolis', 'srl', 'thyrocare',
      'apollo diagnostics', 'healthians', 'redcliffe', 'tata 1mg',
      // Hindi / Sanskrit
      'pareeksha', 'pariskha', 'nidaan', 'nidan', 'rogvichar',
      'swasthya parikshan', 'jaanch', 'janch kendra',
      // Tamil
      'mayakka', 'aaraichchi',
      // Telugu
      'pareeksha', 'vyadhi nidhanam',
      // Common patterns
      'health lab', 'test centre', 'scan center', 'radiology',
    ],
    trendsKeywords: ['diagnostic centre near me', 'blood test', 'pathology lab'],
    description: 'Pathology labs and diagnostic centres',
    color: 'bg-teal-50 border-teal-200',
    osmTags: ['amenity=doctors', 'healthcare=laboratory'],
  },
  {
    id: 'organic-store',
    label: 'Organic / Health Stores',
    icon: '🥦',
    placesTypes: ['health', 'grocery_or_supermarket'],
    umbrellaTypes: ['store', 'grocery_or_supermarket'],
    textSearchKeywords: [
      'organic store',
      'organic shop',
      'health food store',
      'natural food store',
      'organic grocery',
    ],
    nameKeywords: [
      // English
      'organic', 'natural food', 'health food', 'organic store',
      'green store', 'eco store', 'wholesome', 'farm fresh', 'pure foods',
      'clean food', 'natural store', 'bio store', 'herbal store',
      // Hindi / Sanskrit
      'prakritik', 'swadeshi', 'prakriti', 'vanaspati', 'aushadh vanaspati',
      'herbal', 'jadi buti', 'jadibuti',
      // Tamil
      'iyal', 'ilakkiya unavagam',
      // Brands
      'organic india', 'patanjali', 'farmley', 'down to earth',
      'pro nature', 'ecofresh', 'eat wholesome',
    ],
    trendsKeywords: ['organic store near me', 'natural food store', 'health food shop'],
    description: 'Organic grocery and health food retail',
    color: 'bg-lime-50 border-lime-200',
    osmTags: ['shop=organic', 'shop=health_food'],
  },
  {
    id: 'laundry',
    label: 'Laundry & Dry Cleaning',
    icon: '👕',
    placesTypes: ['laundry'],
    umbrellaTypes: ['store', 'laundry'],
    textSearchKeywords: [
      'laundry service',
      'dry cleaning',
      'dhobi ghat',
      'wash and fold',
      'laundromat',
      'clothes ironing',
    ],
    nameKeywords: [
      // English
      'laundry', 'dry clean', 'dry cleaning', 'wash and fold',
      'laundromat', 'cleaners', 'washers', 'pressing', 'ironing service',
      'steam press', 'launderette',
      // Hindi
      'dhobi', 'dhoban', 'dhulai', 'kapda dhona', 'safai',
      'press shop', 'istri', 'istri wala', 'kapre',
      // Tamil
      'vandu', 'thobbu',
      // Telugu
      'chakalee', 'vastra parisodhana',
      // Brands
      'uclean', 'fabrico', 'laundry league', 'washmart',
    ],
    trendsKeywords: ['laundry service near me', 'dry cleaning', 'laundromat'],
    description: 'Laundry pickup, wash & fold, dry cleaning',
    color: 'bg-sky-50 border-sky-200',
    osmTags: ['shop=laundry', 'shop=dry_cleaning'],
  },
  {
    id: 'solar-installer',
    label: 'Solar Panel Installers',
    icon: '☀️',
    placesTypes: ['electrician', 'general_contractor'],
    umbrellaTypes: ['establishment'],
    textSearchKeywords: [
      'solar panel installation',
      'rooftop solar',
      'solar energy company',
      'solar power installation',
    ],
    nameKeywords: [
      // English
      'solar', 'solar energy', 'solar panel', 'solar power',
      'photovoltaic', 'pv system', 'rooftop solar', 'solar solutions',
      'solar installation', 'solar tech',
      // Hindi
      'surya urja', 'surya shakti', 'saur urja', 'saur shakti',
      'saur panel', 'suryoday',
      // Tamil
      'suriyan', 'suriya urja',
      // Brands
      'tata solar', 'adani solar', 'waaree', 'luminous solar',
      'vikram solar', 'renewsys', 'loom solar',
    ],
    trendsKeywords: ['solar panel installation', 'rooftop solar', 'solar energy near me'],
    description: 'Residential and commercial solar installation',
    color: 'bg-yellow-50 border-yellow-200',
    osmTags: ['shop=solar_energy', 'craft=electrician'],
  },
  {
    id: 'delivery-dark-store',
    label: 'Quick-Commerce Dark Stores',
    icon: '📦',
    placesTypes: ['convenience_store', 'storage'],
    umbrellaTypes: ['store', 'convenience_store'],
    textSearchKeywords: [
      'dark store',
      'quick commerce warehouse',
      'instant grocery delivery',
      'micro fulfilment centre',
    ],
    nameKeywords: [
      'dark store', 'quick commerce', 'micro fulfilment', 'instant delivery',
      'blinkit', 'zepto', 'swiggy instamart', 'dunzo', 'bigbasket now',
      'quick grocery', 'express delivery', 'hyperlocal store',
    ],
    trendsKeywords: ['quick delivery grocery', '10 minute delivery', 'instant delivery'],
    description: 'Micro-fulfilment for 10-min delivery',
    color: 'bg-violet-50 border-violet-200',
    osmTags: ['shop=convenience', 'shop=supermarket'],
  },
]

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find(c => c.id === id)
}
