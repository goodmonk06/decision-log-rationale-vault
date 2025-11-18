import { NextRequest, NextResponse } from 'next/server'
import { handleError, validateRequest } from '@/lib/errors'
import { CreateCommentSchema, CreateCommentInput } from '@/lib/validation/comment-schemas'
import * as commentService from '@/lib/services/comments'

// POST /api/comments - Create a comment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = validateRequest(CreateCommentSchema, body) as CreateCommentInput
    
    const comment = await commentService.createComment(validated)
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
