export interface RSSSource {
  id: string
  name: string
  url: string
  category: 'indian-startup' | 'indian-business' | 'global-tech' | 'government' | 'community'
  weight: number   // 1.0 = highest relevance to Indian entrepreneurs
}

export const RSS_SOURCES: RSSSource[] = [
  // ── Indian Startup Ecosystem ──────────────────────────────────────────────
  { id: 'yourstory',      name: 'YourStory',              url: 'https://yourstory.com/feed',                                                         category: 'indian-startup',  weight: 1.0 },
  { id: 'inc42',          name: 'Inc42',                  url: 'https://inc42.com/feed/',                                                            category: 'indian-startup',  weight: 1.0 },
  { id: 'entrackr',       name: 'Entrackr',               url: 'https://entrackr.com/feed/',                                                         category: 'indian-startup',  weight: 1.0 },
  { id: 'medianama',      name: 'Medianama',              url: 'https://www.medianama.com/feed/',                                                    category: 'indian-startup',  weight: 0.9 },
  { id: 'vccircle',       name: 'VCCircle',               url: 'https://www.vccircle.com/feed/',                                                     category: 'indian-startup',  weight: 0.9 },
  { id: 'trak',           name: 'Trak.in',                url: 'https://trak.in/feed/',                                                              category: 'indian-startup',  weight: 0.8 },
  { id: 'fortune-india',  name: 'Fortune India',          url: 'https://www.fortuneindia.com/feed',                                                  category: 'indian-startup',  weight: 0.8 },
  // ── Indian Business / Finance ─────────────────────────────────────────────
  { id: 'et-tech',        name: 'ET Tech',                url: 'https://economictimes.indiatimes.com/tech/rssfeeds/13357270.cms',                    category: 'indian-business', weight: 0.9 },
  { id: 'et-sme',         name: 'ET SME',                 url: 'https://economictimes.indiatimes.com/small-biz/rssfeeds/1068143.cms',                category: 'indian-business', weight: 1.0 },
  { id: 'et-startups',    name: 'ET Startups',            url: 'https://economictimes.indiatimes.com/industry/rssfeeds/13352306.cms',                category: 'indian-business', weight: 1.0 },
  { id: 'et-startups2',   name: 'ET Startups (Funding)',  url: 'https://economictimes.indiatimes.com/startups/rssfeeds/78570075.cms',                category: 'indian-business', weight: 1.0 },
  { id: 'livemint',       name: 'Livemint',               url: 'https://www.livemint.com/rss/news',                                                  category: 'indian-business', weight: 0.8 },
  { id: 'livemint-co',    name: 'Livemint Companies',     url: 'https://www.livemint.com/rss/companies',                                             category: 'indian-business', weight: 0.8 },
  { id: 'business-std',   name: 'Business Standard',      url: 'https://www.business-standard.com/rss/home_page_top_stories.rss',                   category: 'indian-business', weight: 0.8 },
  { id: 'fin-express',    name: 'Financial Express',      url: 'https://www.financialexpress.com/feed/',                                             category: 'indian-business', weight: 0.8 },
  { id: 'hindu-biz',      name: 'The Hindu Business',     url: 'https://www.thehindu.com/business/feeder/default.rss',                               category: 'indian-business', weight: 0.7 },
  { id: 'moneycontrol',   name: 'Moneycontrol',           url: 'https://www.moneycontrol.com/rss/business.xml',                                      category: 'indian-business', weight: 0.7 },
  { id: 'ndtv-profit',    name: 'NDTV Profit',            url: 'https://feeds.feedburner.com/ndtvprofit-latest',                                     category: 'indian-business', weight: 0.8 },
  { id: 'ndtv-top',       name: 'NDTV Top Stories',       url: 'https://feeds.feedburner.com/ndtvnews-latest',                                       category: 'indian-business', weight: 0.7 },
  { id: 'toi-top',        name: 'Times of India',         url: 'https://timesofindia.indiatimes.com/rssfeedstopstories.cms',                         category: 'indian-business', weight: 0.7 },
  { id: 'deccan-herald',  name: 'Deccan Herald',          url: 'https://www.deccanherald.com/feed',                                                  category: 'indian-business', weight: 0.7 },
  // ── Government / Policy ───────────────────────────────────────────────────
  { id: 'pib',            name: 'PIB India',              url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3',                            category: 'government',      weight: 0.9 },
  { id: 'et-govt',        name: 'ET Government',          url: 'https://government.economictimes.indiatimes.com/rss/topstories',                    category: 'government',      weight: 0.9 },
  // ── Global Tech / Startup ─────────────────────────────────────────────────
  { id: 'techcrunch',     name: 'TechCrunch',             url: 'https://techcrunch.com/feed/',                                                       category: 'global-tech',     weight: 0.7 },
  { id: 'the-verge',      name: 'The Verge',              url: 'https://www.theverge.com/rss/index.xml',                                             category: 'global-tech',     weight: 0.6 },
  { id: 'rest-of-world',  name: 'Rest of World',          url: 'https://restofworld.org/feed/',                                                      category: 'global-tech',     weight: 0.8 },
]

// Non-RSS sources fetched via dedicated APIs
export const API_SOURCES = {
  hackerNews: {
    id: 'hackernews',
    name: 'Hacker News',
    searchUrl: 'https://hn.algolia.com/api/v1/search?tags=story&hitsPerPage=60&numericFilters=created_at_i>',
    category: 'community' as const,
    weight: 0.7,
  },
  reddit: [
    { id: 'reddit-india-biz',   name: 'r/IndiaBusiness',     subreddit: 'IndiaBusiness',     weight: 1.0 },
    { id: 'reddit-india-inv',   name: 'r/IndiaInvestments',  subreddit: 'IndiaInvestments',  weight: 1.0 },
    { id: 'reddit-startups',    name: 'r/startups',          subreddit: 'startups',          weight: 0.8 },
    { id: 'reddit-india',       name: 'r/india',             subreddit: 'india',             weight: 0.7 },
    { id: 'reddit-entrepreneur', name: 'r/entrepreneur',     subreddit: 'Entrepreneur',      weight: 0.8 },
    { id: 'reddit-lbif',        name: 'r/learnbusiness',     subreddit: 'learnbusinessindia', weight: 1.0 },
    { id: 'reddit-finance-in',  name: 'r/IndiaFinance',      subreddit: 'IndiaFinance',      weight: 0.9 },
    { id: 'reddit-smallbiz',    name: 'r/smallbusiness',     subreddit: 'smallbusiness',     weight: 0.8 },
    { id: 'reddit-sideproject', name: 'r/SideProject',       subreddit: 'SideProject',       weight: 0.7 },
  ],
}
