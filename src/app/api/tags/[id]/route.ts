import { NextRequest, NextResponse } from 'next/server'
import { handleError, NotFoundError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/tags/[id] - Get a tag
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const tag = await prisma.tag.findUnique({
      where: { id },
      include: {
        decisions: {
          include: {
            decision: {
              include: {
                options: true,
                links: true,
              },
            },
          },
        },
      },
    })

    if (!tag) {
      throw new NotFoundError('Tag')
    }

    return NextResponse.json(tag)
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/tags/[id] - Delete a tag
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    await prisma.tag.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
