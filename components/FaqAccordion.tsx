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

export default function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
      {FAQS.map((faq, i) => (
        <div key={i}>
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors"
          >
            <span>{faq.q}</span>
            <span className="shrink-0 text-slate-400">{openIndex === i ? '▲' : '▼'}</span>
          </button>
          {openIndex === i && (
            <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{faq.a}</div>
          )}
        </div>
      ))}
    </div>
  )
}
