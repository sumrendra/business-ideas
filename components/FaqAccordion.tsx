'use client'

import { useState } from 'react'

const FAQS = [
  {
    q: 'What are the best business ideas in India right now?',
    a: 'The best business ideas in India depend on your budget, skills, and goals. From small business ideas and tiny business ideas to scalable online ventures, there are multiple options available for beginners and experienced entrepreneurs.',
  },
  {
    q: 'What are some small business ideas I can start easily?',
    a: 'There are many small business ideas and little business ideas that are easy to start, such as home-based services, reselling, freelancing, and tutoring. These small biz ideas require low investment and basic skills.',
  },
  {
    q: 'What are the latest and new business ideas in India?',
    a: 'New business ideas and latest business ideas in India are often driven by digital trends, AI, and changing consumer behavior. These include online businesses, tech services, and innovative startup models.',
  },
  {
    q: 'Which are the best business ideas for women?',
    a: 'There are several business ideas for women that offer flexibility and profitability, including home-based businesses, online selling, and freelance services. These small business suggestions are ideal for balancing work and personal life.',
  },
  {
    q: 'What are some small entrepreneur ideas with low investment?',
    a: 'Small entrepreneur ideas like freelancing, digital marketing services, tutoring, and dropshipping are great starting points. These small company ideas require minimal capital and can scale over time.',
  },
  {
    q: 'Are there any small IT business ideas in India?',
    a: 'Yes, small IT business ideas such as web development, app development, digital marketing, and SaaS tools are among the best IT business ideas due to high demand and scalability.',
  },
  {
    q: 'What are some online business ideas I can start from home?',
    a: 'Popular online business ideas include e-commerce, affiliate marketing, content creation, and freelancing. These online biz ideas are flexible, scalable, and ideal for beginners.',
  },
  {
    q: 'What are some low investment and high profit business ideas?',
    a: 'Low investment business ideas such as home-based services, consulting, and online businesses can generate high profits with the right strategy and execution.',
  },
  {
    q: 'What are some tiny business ideas that can grow big?',
    a: 'Tiny business ideas like handmade products, local services, and niche online stores can grow into large businesses with consistent effort and market demand.',
  },
  {
    q: 'How do I choose the right business idea for a small business?',
    a: 'To choose the right business ideas for small business, consider your budget, skills, and demand in the market. Focus on ideas that are easy to start and have growth potential.',
  },
  {
    q: 'What are some great and excellent business ideas to start today?',
    a: 'Great business ideas and excellent business ideas are those that solve real problems, have demand, and can be scaled. Digital services and niche product-based businesses are strong options.',
  },
  {
    q: 'What is the world best business opportunity right now?',
    a: 'There is no single world best business opportunity, but businesses in digital services, e-commerce, and technology are currently among the most promising globally.',
  },
  {
    q: 'Where can I find reliable business suggestions and ideas?',
    a: 'You can explore curated business ideas, business suggestions, and execution guides on this platform, categorized by investment, complexity, and scalability.',
  },
  {
    q: 'What are some small business suggestions for beginners?',
    a: 'Small business suggestions for beginners include freelancing, reselling, home-based services, and online businesses that require minimal setup and investment.',
  },
  {
    q: 'What are some creative and unique business ideas in India?',
    a: 'Creative and unique business ideas include niche e-commerce, personalized services, digital products, and innovative tech-based solutions tailored to specific audiences.',
  },
]

const VISIBLE_COUNT = 5

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [showAll, setShowAll] = useState(false)

  const visibleFaqs = showAll ? FAQS : FAQS.slice(0, VISIBLE_COUNT)
  const remaining = FAQS.length - VISIBLE_COUNT

  return (
    <div className="space-y-3">
      {visibleFaqs.map((faq, i) => {
        const isOpen = openIndex === i
        return (
          <div
            key={i}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 backdrop-blur-md overflow-hidden transition-colors"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm sm:text-base font-medium text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <span>{faq.q}</span>
              <svg
                className={`shrink-0 h-5 w-5 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-4">
                {faq.a}
              </div>
            )}
          </div>
        )
      })}

      {remaining > 0 && (
        <div className="pt-2">
          <button
            onClick={() => setShowAll(v => !v)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
          >
            {showAll ? `Show less` : `Show ${remaining} more questions`}
            <svg className={`h-4 w-4 transition-transform ${showAll ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
