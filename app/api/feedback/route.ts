import { NextRequest, NextResponse } from 'next/server'
import { appendFileSync } from 'fs'
import { join } from 'path'

const FEEDBACK_FILE = join(process.cwd(), 'feedback.jsonl')

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { ideaSlug, ideaTitle, feedbackType, message, email } = body

    if (!message?.trim() || message.trim().length < 2) {
      return NextResponse.json({ error: 'Message too short' }, { status: 400 })
    }

    const entry = {
      ideaSlug:     ideaSlug ?? '',
      ideaTitle:    ideaTitle ?? '',
      feedbackType: feedbackType ?? 'other',
      message:      message.trim(),
      email:        email?.trim() || null,
      submittedAt:  new Date().toISOString(),
    }

    // Try Sanity first if a write token is configured
    const writeToken = process.env.SANITY_WRITE_TOKEN
    if (writeToken) {
      try {
        const { writeClient } = await import('@/lib/sanity/client')
        await writeClient.create({ _type: 'feedback', ...entry })
        return NextResponse.json({ ok: true })
      } catch (sanityErr) {
        console.warn('Sanity write failed, falling back to file:', sanityErr)
      }
    }

    // Fallback: append to local JSONL file
    appendFileSync(FEEDBACK_FILE, JSON.stringify(entry) + '\n', 'utf8')
    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('Feedback submission error:', err)
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 })
  }
}
