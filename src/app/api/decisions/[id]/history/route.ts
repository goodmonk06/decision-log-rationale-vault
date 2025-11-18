import { NextRequest, NextResponse } from 'next/server'
import { handleError } from '@/lib/errors'
import * as historyService from '@/lib/services/history'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET /api/decisions/[id]/history - Get decision history
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const history = await historyService.getDecisionHistory(id)
    return NextResponse.json(history)
  } catch (error) {
    return handleError(error)
  }
}
