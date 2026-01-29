import { NextResponse } from 'next/server'
import { generateIntelligenceReport } from '@/lib/extraction-engine'
import type { Message } from '@/lib/types'

export async function POST(req: Request) {
  try {
    const { sessionId, messages }: { sessionId: string; messages: Message[] } = await req.json()

    if (!sessionId || !messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Missing sessionId or messages' },
        { status: 400 }
      )
    }

    // Generate intelligence report
    const report = generateIntelligenceReport(sessionId, messages)

    return NextResponse.json(report)
  } catch (error) {
    console.error('Extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract intelligence' },
      { status: 500 }
    )
  }
}
