import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST /api/options - Create a new option for a decision
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { decisionId, title, prosMarkdown, consMarkdown, chosen } = body

    if (!decisionId || !title) {
      return NextResponse.json(
        { error: 'Decision ID and title are required' },
        { status: 400 }
      )
    }

    const option = await prisma.decisionOption.create({
      data: {
        decisionId,
        title,
        prosMarkdown,
        consMarkdown,
        chosen: chosen || false,
      },
    })

    return NextResponse.json(option, { status: 201 })
  } catch (error) {
    console.error('Error creating option:', error)
    return NextResponse.json(
      { error: 'Failed to create option' },
      { status: 500 }
    )
  }
}
