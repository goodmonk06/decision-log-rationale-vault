import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DecisionStatus } from '@prisma/client'

// GET /api/decisions - List all decisions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get('search')
    const status = searchParams.get('status') as DecisionStatus | null

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { descriptionMarkdown: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    const decisions = await prisma.decision.findMany({
      where,
      include: {
        options: true,
        links: true,
      },
      orderBy: {
        decidedAt: 'desc',
      },
    })

    return NextResponse.json(decisions)
  } catch (error) {
    console.error('Error fetching decisions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch decisions' },
      { status: 500 }
    )
  }
}

// POST /api/decisions - Create a new decision
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, descriptionMarkdown, decidedAt, status, metaJson, options, links } = body

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }

    const decision = await prisma.decision.create({
      data: {
        title,
        descriptionMarkdown,
        decidedAt: decidedAt ? new Date(decidedAt) : undefined,
        status: status || 'PROPOSED',
        metaJson,
        options: options ? {
          create: options.map((opt: any) => ({
            title: opt.title,
            prosMarkdown: opt.prosMarkdown,
            consMarkdown: opt.consMarkdown,
            chosen: opt.chosen || false,
          }))
        } : undefined,
        links: links ? {
          create: links.map((link: any) => ({
            entityType: link.entityType,
            entityIdOrRef: link.entityIdOrRef,
            metaJson: link.metaJson,
          }))
        } : undefined,
      },
      include: {
        options: true,
        links: true,
      },
    })

    return NextResponse.json(decision, { status: 201 })
  } catch (error) {
    console.error('Error creating decision:', error)
    return NextResponse.json(
      { error: 'Failed to create decision' },
      { status: 500 }
    )
  }
}
