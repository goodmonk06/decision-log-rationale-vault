import { NextRequest, NextResponse } from 'next/server'
import { handleError, validateRequest } from '@/lib/errors'
import { AssignTagSchema, AssignTagInput } from '@/lib/validation/tag-schemas'
import * as tagService from '@/lib/services/tags'

// POST /api/tags/assign - Assign a tag to a decision
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { decisionId, tagId } = validateRequest(AssignTagSchema, body) as AssignTagInput
    
    const assignment = await tagService.assignTagToDecision(decisionId, tagId)
    return NextResponse.json(assignment, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/tags/assign - Remove a tag from a decision
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { decisionId, tagId } = validateRequest(AssignTagSchema, body) as AssignTagInput
    
    await tagService.removeTagFromDecision(decisionId, tagId)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
