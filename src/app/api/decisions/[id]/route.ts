import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, validateRequest, NotFoundError } from '@/lib/errors'
import { UpdateDecisionSchema, UpdateDecisionInput } from '@/lib/validation/schemas'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/decisions/[id] - Get a single decision
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const decision = await prisma.decision.findUnique({
      where: { id },
      include: {
        options: true,
        links: true,
      },
    })

    if (!decision) {
      throw new NotFoundError('Decision')
    }

    return NextResponse.json(decision)
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/decisions/[id] - Update a decision
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = validateRequest(UpdateDecisionSchema, body) as UpdateDecisionInput

    const updateData: any = {}
    if (validated.title !== undefined) updateData.title = validated.title
    if (validated.descriptionMarkdown !== undefined) updateData.descriptionMarkdown = validated.descriptionMarkdown
    if (validated.decidedAt !== undefined) updateData.decidedAt = new Date(validated.decidedAt)
    if (validated.status !== undefined) updateData.status = validated.status
    if (validated.metaJson !== undefined) updateData.metaJson = validated.metaJson

    const decision = await prisma.decision.update({
      where: { id },
      data: updateData,
      include: {
        options: true,
        links: true,
      },
    })

    return NextResponse.json(decision)
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/decisions/[id] - Delete a decision
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    await prisma.decision.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
