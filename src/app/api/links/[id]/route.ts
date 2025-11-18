import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EntityType } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT /api/links/[id] - Update a link
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { entityType, entityIdOrRef, metaJson } = body

    const link = await prisma.decisionLink.update({
      where: { id },
      data: {
        entityType: entityType as EntityType,
        entityIdOrRef,
        metaJson,
      },
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error('Error updating link:', error)
    return NextResponse.json(
      { error: 'Failed to update link' },
      { status: 500 }
    )
  }
}

// DELETE /api/links/[id] - Delete a link
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    await prisma.decisionLink.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting link:', error)
    return NextResponse.json(
      { error: 'Failed to delete link' },
      { status: 500 }
    )
  }
}
