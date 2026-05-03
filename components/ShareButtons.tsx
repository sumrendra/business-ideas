'use client'

import { useState } from 'react'

interface ShareButtonsProps {
  title: string
  url: string
}

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)

  const links = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  }

  function handleCopy() {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="flex items-center gap-2 mt-4">
      {/* Copy link */}
      <button
        onClick={handleCopy}
        title="Copy link"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
      >
        {copied ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth={2}/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        )}
      </button>

      {/* Facebook */}
      <a
        href={links.facebook}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on Facebook"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      </a>

      {/* X / Twitter */}
      <a
        href={links.twitter}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on X"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-slate-700 hover:text-slate-900 transition-colors"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </a>

      {/* LinkedIn */}
      <a
        href={links.linkedin}
        target="_blank"
        rel="noopener noreferrer"
        title="Share on LinkedIn"
        className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:border-blue-700 hover:text-blue-700 transition-colors"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      </a>
    </div>
  )
}
