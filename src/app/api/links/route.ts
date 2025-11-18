import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, validateRequest } from '@/lib/errors'
import { CreateLinkSchema, CreateLinkInput } from '@/lib/validation/schemas'

// POST /api/links - Create a new link for a decision
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = validateRequest(CreateLinkSchema, body) as CreateLinkInput

    const link = await prisma.decisionLink.create({
      data: {
        decisionId: validated.decisionId,
        entityType: validated.entityType,
        entityIdOrRef: validated.entityIdOrRef,
        metaJson: validated.metaJson as any,
      },
    })

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
