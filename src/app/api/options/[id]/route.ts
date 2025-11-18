import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, validateRequest } from '@/lib/errors'
import { UpdateOptionSchema } from '@/lib/validation/schemas'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT /api/options/[id] - Update an option
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = validateRequest(UpdateOptionSchema, body)

    const option = await prisma.decisionOption.update({
      where: { id },
      data: validated as any,
    })

    return NextResponse.json(option)
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/options/[id] - Delete an option
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    await prisma.decisionOption.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
