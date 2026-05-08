'use client'

import { useState } from 'react'

interface Props {
  ideaSlug: string
  ideaTitle: string
}

const TYPES = [
  { value: 'wrong_data',   label: 'Wrong / outdated data',  icon: '⚠️' },
  { value: 'missing_info', label: 'Missing information',    icon: '➕' },
  { value: 'suggestion',   label: 'Suggest improvement',    icon: '💡' },
  { value: 'other',        label: 'Other',                  icon: '✉️' },
] as const

type FeedbackType = typeof TYPES[number]['value']

export default function FeedbackForm({ ideaSlug, ideaTitle }: Props) {
  const [type, setType]       = useState<FeedbackType>('suggestion')
  const [message, setMessage] = useState('')
  const [email, setEmail]     = useState('')
  const [status, setStatus]   = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const submit = async () => {
    if (!message.trim() || message.trim().length < 2) return
    setStatus('sending')
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ideaSlug, ideaTitle, feedbackType: type, message, email }),
      })
      setStatus(res.ok ? 'sent' : 'error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <div className="mt-12 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/20 px-6 py-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
          <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-base font-semibold text-slate-900 dark:text-slate-100">Thanks for your feedback!</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">We review every submission and update the page within 48 hours.</p>
      </div>
    )
  }

  return (
    <div className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 overflow-hidden">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
            <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-slate-100">Help us improve this page</p>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              Spotted wrong data, a missing detail, or have a suggestion? We read every message.
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {/* Type selector */}
        <div>
          <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">What's your feedback about?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TYPES.map(t => (
              <button
                key={t.value}
                onClick={() => setType(t.value)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-center text-xs font-medium transition-colors ${
                  type === t.value
                    ? 'border-indigo-400 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <span className="text-base">{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Your message
          </label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={4}
            placeholder={
              type === 'wrong_data'   ? 'e.g. The setup cost shown is outdated — current market rate is ₹X…' :
              type === 'missing_info' ? 'e.g. Would be helpful to add information about MNRE vendor registration process…' :
              type === 'suggestion'   ? 'e.g. Adding a comparison table between residential and commercial solar would help…' :
                                       'Tell us what\'s on your mind…'
            }
            className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 transition"
          />
          <div className="mt-1 flex items-center justify-between">
            {message.trim().length > 0 && message.trim().length < 2 ? (
              <p className="text-[11px] text-amber-500">Please write a bit more</p>
            ) : <span />}
            <p className={`text-[11px] ${message.length > 500 ? 'text-amber-500' : 'text-slate-400'}`}>
              {message.length} / 500
            </p>
          </div>
        </div>

        {/* Email (optional) */}
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Email <span className="normal-case font-normal tracking-normal">(optional — we'll reply if you leave it)</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 transition"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between gap-4">
          {status === 'error' && (
            <p className="text-xs text-red-500">Something went wrong — please try again.</p>
          )}
          <button
            onClick={submit}
            disabled={status === 'sending' || message.trim().length < 2}
            className="ml-auto inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed px-5 py-2.5 text-sm font-semibold text-white transition-colors"
          >
            {status === 'sending' ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending…
              </>
            ) : (
              <>
                Send Feedback
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
