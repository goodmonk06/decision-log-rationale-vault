import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, validateRequest } from '@/lib/errors'
import { CreateOptionSchema, CreateOptionInput } from '@/lib/validation/schemas'

// POST /api/options - Create a new option for a decision
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = validateRequest(CreateOptionSchema, body) as CreateOptionInput

    const option = await prisma.decisionOption.create({
      data: {
        decisionId: validated.decisionId,
        title: validated.title,
        prosMarkdown: validated.prosMarkdown,
        consMarkdown: validated.consMarkdown,
        chosen: validated.chosen || false,
      },
    })

    return NextResponse.json(option, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
