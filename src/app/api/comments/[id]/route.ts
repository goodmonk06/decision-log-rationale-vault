import { NextRequest, NextResponse } from 'next/server'
import { handleError, validateRequest } from '@/lib/errors'
import { UpdateCommentSchema, UpdateCommentInput } from '@/lib/validation/comment-schemas'
import * as commentService from '@/lib/services/comments'

interface RouteParams {
  params: Promise<{ id: string }>
}

// PUT /api/comments/[id] - Update a comment
export async function PUT(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = validateRequest(UpdateCommentSchema, body) as UpdateCommentInput

    const comment = await commentService.updateComment(id, validated.content)
    return NextResponse.json(comment)
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/comments/[id] - Delete a comment
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params
    await commentService.deleteComment(id)
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}
