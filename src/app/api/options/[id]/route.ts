import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const { title, prosMarkdown, consMarkdown, chosen } = body

    const option = await prisma.decisionOption.update({
      where: { id },
      data: {
        title,
        prosMarkdown,
        consMarkdown,
        chosen,
      },
    })

    return NextResponse.json(option)
  } catch (error) {
    console.error('Error updating option:', error)
    return NextResponse.json(
      { error: 'Failed to update option' },
      { status: 500 }
    )
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
    console.error('Error deleting option:', error)
    return NextResponse.json(
      { error: 'Failed to delete option' },
      { status: 500 }
    )
  }
}
