import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleError, validateRequest } from '@/lib/errors'
import { CreateDecisionSchema, DecisionQuerySchema, CreateDecisionInput, DecisionQuery } from '@/lib/validation/schemas'

// GET /api/decisions - List all decisions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const queryParams = Object.fromEntries(searchParams.entries())

    const { search, status, limit, offset } = validateRequest(
      DecisionQuerySchema,
      queryParams
    ) as DecisionQuery

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
      take: limit || 50,
      skip: offset || 0,
    })

    return NextResponse.json(decisions)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/decisions - Create a new decision
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = validateRequest(CreateDecisionSchema, body) as CreateDecisionInput

    const decision = await prisma.decision.create({
      data: {
        title: validated.title,
        descriptionMarkdown: validated.descriptionMarkdown,
        decidedAt: validated.decidedAt ? new Date(validated.decidedAt) : undefined,
        status: validated.status || 'PROPOSED',
        metaJson: validated.metaJson as any,
        options: validated.options ? {
          create: validated.options.map((opt) => ({
            title: opt.title,
            prosMarkdown: opt.prosMarkdown,
            consMarkdown: opt.consMarkdown,
            chosen: opt.chosen || false,
          }))
        } : undefined,
        links: validated.links ? {
          create: validated.links.map((link) => ({
            entityType: link.entityType,
            entityIdOrRef: link.entityIdOrRef,
            metaJson: link.metaJson as any,
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
    return handleError(error)
  }
}
