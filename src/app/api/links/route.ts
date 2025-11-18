import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { EntityType } from '@prisma/client'

// POST /api/links - Create a new link for a decision
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { decisionId, entityType, entityIdOrRef, metaJson } = body

    if (!decisionId || !entityType || !entityIdOrRef) {
      return NextResponse.json(
        { error: 'Decision ID, entity type, and entity ID/ref are required' },
        { status: 400 }
      )
    }

    const link = await prisma.decisionLink.create({
      data: {
        decisionId,
        entityType: entityType as EntityType,
        entityIdOrRef,
        metaJson,
      },
    })

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    console.error('Error creating link:', error)
    return NextResponse.json(
      { error: 'Failed to create link' },
      { status: 500 }
    )
  }
}
