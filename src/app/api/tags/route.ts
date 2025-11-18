import { NextRequest, NextResponse } from 'next/server'
import { handleError, validateRequest } from '@/lib/errors'
import { CreateTagSchema, CreateTagInput, AssignTagSchema, AssignTagInput } from '@/lib/validation/tag-schemas'
import * as tagService from '@/lib/services/tags'

// GET /api/tags - List all tags
export async function GET() {
  try {
    const tags = await tagService.getAllTags()
    return NextResponse.json(tags)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/tags - Create a new tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = validateRequest(CreateTagSchema, body) as CreateTagInput
    
    const tag = await tagService.createTag(validated)
    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}
