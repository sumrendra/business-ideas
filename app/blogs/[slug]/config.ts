export interface LandingPageConfig {
  title: string
  h1: string
  description: string
  intro: string
  filters: {
    industry?: string
    budget?: string
    saturation?: string
    difficulty?: string
    tags?: string[]
    search?: string
  }
}

export const LANDING_PAGES: Record<string, LandingPageConfig> = {
  'best-business-ideas-india': {
    title: 'Best Business Ideas in India 2026 – High Profit & Low Risk',
    h1: 'Best Business Ideas in India 2026',
    description: 'Discover the best business ideas in India for 2026 with high profit potential and low risk. Curated for Indian entrepreneurs with investment details, setup steps, and funding options.',
    intro: 'India is one of the fastest-growing economies in the world. Whether you are looking for a side hustle or a full-time venture, these are the best business ideas proven to work in the Indian market.',
    filters: { saturation: 'proven' },
  },
  'small-business-ideas-low-budget': {
    title: 'Small Business Ideas with Low Budget in India 2026',
    h1: 'Small Business Ideas with Low Budget in India',
    description: 'Start a profitable small business in India with low investment. Browse 100+ ideas under ₹5 lakh with step-by-step setup guides and profit projections.',
    intro: 'You don\'t need a large investment to start a successful business in India. These low-budget small business ideas are perfect for first-time entrepreneurs who want to minimise risk.',
    filters: { budget: 'under_1l' },
  },
  'new-business-ideas-india': {
    title: 'New Business Ideas in India 2026 – Latest Trending Opportunities',
    h1: 'New Business Ideas in India 2026',
    description: 'Explore the newest and most trending business ideas in India for 2026. Stay ahead of the competition with fresh, validated startup opportunities.',
    intro: 'The Indian market is evolving rapidly. These new business ideas tap into emerging trends in technology, sustainability, and consumer behaviour — giving early movers a significant advantage.',
    filters: { saturation: 'concept' },
  },
  'business-ideas-for-women': {
    title: 'Business Ideas for Women in India 2026 – Start from Home or Office',
    h1: 'Business Ideas for Women in India 2026',
    description: 'Empowering business ideas for women entrepreneurs in India. From home-based ventures to scalable startups — find the right fit for your skills and lifestyle.',
    intro: 'Women entrepreneurs are reshaping India\'s economy. These business ideas are especially well-suited to women — flexible, scalable, and aligned with growing demand across sectors.',
    filters: { difficulty: 'beginner' },
  },
  'business-ideas-for-beginners': {
    title: 'Business Ideas for Beginners in India 2026 – No Experience Needed',
    h1: 'Best Business Ideas for Beginners in India',
    description: 'Start your entrepreneurial journey with beginner-friendly business ideas in India. Low learning curve, low investment, and high growth potential.',
    intro: 'Starting a business for the first time can feel overwhelming. These beginner-friendly ideas have been selected for their simplicity, low startup cost, and clear path to profitability.',
    filters: { difficulty: 'beginner' },
  },
  'business-ideas-for-students': {
    title: 'Business Ideas for Students in India 2026 – Earn While You Study',
    h1: 'Business Ideas for Students in India 2026',
    description: 'Practical business ideas for Indian students to earn income while studying. Low investment, flexible hours, and high-demand opportunities.',
    intro: 'Students in India have unique advantages: time, energy, digital skills, and campus networks. These business ideas are designed to fit around your studies and grow as you do.',
    filters: { difficulty: 'beginner', budget: 'under_1l' },
  },
  'low-investment-business-ideas': {
    title: 'Low Investment Business Ideas in India 2026 – Start Under ₹1 Lakh',
    h1: 'Low Investment Business Ideas in India',
    description: 'Browse 100+ low investment business ideas in India that can be started under ₹1 lakh. Discover which ideas are profitable with minimal capital.',
    intro: 'Capital should not be a barrier to entrepreneurship. These low-investment business ideas in India prove that you can build a sustainable income with very little money upfront.',
    filters: { budget: 'under_1l' },
  },
  'low-cost-business-ideas': {
    title: 'Low Cost Business Ideas in India 2026 – Affordable Startups',
    h1: 'Low Cost Business Ideas in India 2026',
    description: 'Find affordable business ideas in India with low startup costs. Start smart, grow fast — curated opportunities for budget-conscious entrepreneurs.',
    intro: 'These low-cost business ideas are ideal for entrepreneurs who want to test the market before committing large sums. Start lean, validate fast, and scale when the time is right.',
    filters: { budget: '1l_10l' },
  },
  'zero-investment-business-ideas': {
    title: 'Zero Investment Business Ideas in India 2026 – Start with No Money',
    h1: 'Zero Investment Business Ideas in India',
    description: 'Discover business ideas you can start in India with zero investment. Skill-based, service-based, and digital businesses that need no upfront capital.',
    intro: 'These zero-investment business ideas rely on your skills, time, and creativity — not your wallet. Perfect for students, homemakers, and job-seekers looking to create an income stream from scratch.',
    filters: { budget: 'under_1l', difficulty: 'beginner' },
  },
  'online-business-ideas-india': {
    title: 'Online Business Ideas in India 2026 – Start Digitally from Home',
    h1: 'Online Business Ideas in India 2026',
    description: 'Explore profitable online business ideas in India. Work from home, reach customers across the country, and build a digital business with low overhead.',
    intro: 'India\'s internet economy is booming. These online business ideas let you tap into that growth — with low overhead, flexible hours, and the ability to scale beyond your city.',
    filters: { industry: 'E-commerce' },
  },
  'it-business-ideas': {
    title: 'IT Business Ideas in India 2026 – Tech Startup Opportunities',
    h1: 'IT & Tech Business Ideas in India 2026',
    description: 'Explore the best IT and technology business ideas in India for 2026. From SaaS to AI tools — find the right tech venture for your background.',
    intro: 'India produces millions of tech graduates every year. These IT business ideas turn technical skills into profitable ventures — from freelance services to full-scale product companies.',
    filters: { industry: 'SaaS' },
  },
  'online-business-for-beginners': {
    title: 'Online Business Ideas for Beginners in India 2026',
    h1: 'Online Business Ideas for Beginners in India',
    description: 'Start an online business in India with no prior experience. Simple, proven ideas to earn money online from home — perfect for complete beginners.',
    intro: 'You don\'t need technical skills or prior experience to start an online business. These beginner-friendly digital business ideas are simple to set up and can generate income within weeks.',
    filters: { difficulty: 'beginner', industry: 'E-commerce' },
  },
  'home-business-ideas': {
    title: 'Home Business Ideas in India 2026 – Work from Home & Earn',
    h1: 'Home Business Ideas in India 2026',
    description: 'Discover the best home-based business ideas in India for 2026. Run a profitable business from your home with low overhead and flexible hours.',
    intro: 'Running a business from home saves on overhead costs and offers unmatched flexibility. These home business ideas are well-suited to the Indian market and can be scaled with minimal investment.',
    filters: { budget: 'under_1l' },
  },
  'home-based-small-business-ideas': {
    title: 'Home-Based Small Business Ideas in India 2026',
    h1: 'Home-Based Small Business Ideas in India',
    description: 'Curated home-based small business ideas for Indian entrepreneurs. Start a profitable venture from your home with low investment and high returns.',
    intro: 'Home-based businesses eliminate commute, reduce costs, and offer work-life balance. Here are the best small business ideas you can run entirely from home in India.',
    filters: { difficulty: 'beginner', budget: 'under_1l' },
  },
  'profitable-small-business-ideas': {
    title: 'Most Profitable Small Business Ideas in India 2026',
    h1: 'Most Profitable Small Business Ideas in India 2026',
    description: 'Find the most profitable small business ideas in India with high margins and scalable potential. Data-backed ideas for serious entrepreneurs.',
    intro: 'Profitability is not just about revenue — it\'s about margins, repeatability, and growth. These small business ideas in India are selected for their proven track record of strong returns.',
    filters: { saturation: 'proven' },
  },
  'high-profit-low-cost-business-ideas': {
    title: 'High Profit Low Cost Business Ideas in India 2026',
    h1: 'High Profit, Low Cost Business Ideas in India',
    description: 'Discover business ideas in India with high profit margins and low startup costs. The best bang-for-buck opportunities for Indian entrepreneurs.',
    intro: 'The best businesses have high margins and low overhead. These high-profit, low-cost business ideas in India give you the best return on your limited investment.',
    filters: { budget: 'under_1l', saturation: 'validated' },
  },
  'tiny-business-ideas': {
    title: 'Tiny Business Ideas in India 2026 – Start Small, Think Big',
    h1: 'Tiny Business Ideas in India 2026',
    description: 'Small-scale business ideas that can be started solo in India. Start tiny, prove the concept, and grow at your own pace.',
    intro: 'Not every business needs to start big. These tiny business ideas are perfect for solo entrepreneurs in India who want to start small, test the market, and grow sustainably.',
    filters: { budget: 'under_1l', difficulty: 'beginner' },
  },
  'creative-business-ideas': {
    title: 'Creative Business Ideas in India 2026 – Turn Creativity into Income',
    h1: 'Creative Business Ideas in India 2026',
    description: 'Turn your creativity into a business. Explore innovative and unique business ideas in India for designers, artists, writers, and creative entrepreneurs.',
    intro: 'India\'s creator economy is booming. These creative business ideas help you monetise your artistic skills — whether you\'re into design, content, crafts, or storytelling.',
    filters: { industry: 'Creator Economy' },
  },
  'top-10-small-business-ideas': {
    title: 'Top 10 Small Business Ideas in India 2026 – Editor\'s Picks',
    h1: 'Top 10 Small Business Ideas in India 2026',
    description: 'Our curated top 10 small business ideas for India in 2026. Handpicked for profitability, market demand, and ease of starting.',
    intro: 'With hundreds of options, choosing the right business idea is the hardest part. Our editors have handpicked the top 10 small business ideas in India based on demand, margins, and startup simplicity.',
    filters: { saturation: 'proven', difficulty: 'beginner' },
  },
  'startup-business-ideas-india': {
    title: 'Startup Business Ideas in India 2026 – Build the Next Big Thing',
    h1: 'Startup Business Ideas in India 2026',
    description: 'Explore high-growth startup business ideas in India for 2026. Scalable, fundable ventures for ambitious entrepreneurs ready to build something big.',
    intro: 'India\'s startup ecosystem is the third largest in the world. These scalable startup ideas are designed for entrepreneurs who want to build lasting companies — not just side hustles.',
    filters: { saturation: 'validated' },
  },
}

export const ALL_SLUGS = Object.keys(LANDING_PAGES)
