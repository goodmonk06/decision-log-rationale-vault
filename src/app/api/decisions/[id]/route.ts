import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      return NextResponse.json(
        { error: 'Decision not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(decision)
  } catch (error) {
    console.error('Error fetching decision:', error)
    return NextResponse.json(
      { error: 'Failed to fetch decision' },
      { status: 500 }
    )
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
    const { title, descriptionMarkdown, decidedAt, status, metaJson } = body

    const decision = await prisma.decision.update({
      where: { id },
      data: {
        title,
        descriptionMarkdown,
        decidedAt: decidedAt ? new Date(decidedAt) : undefined,
        status,
        metaJson,
      },
      include: {
        options: true,
        links: true,
      },
    })

    return NextResponse.json(decision)
  } catch (error) {
    console.error('Error updating decision:', error)
    return NextResponse.json(
      { error: 'Failed to update decision' },
      { status: 500 }
    )
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
    console.error('Error deleting decision:', error)
    return NextResponse.json(
      { error: 'Failed to delete decision' },
      { status: 500 }
    )
  }
}
