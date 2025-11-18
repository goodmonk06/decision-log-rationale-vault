import { z } from 'zod'

export const CreateCommentSchema = z.object({
  decisionId: z.string().cuid(),
  userId: z.string().cuid().optional(),
  content: z.string().min(1).max(5000),
  parentId: z.string().cuid().optional(),
})

export const UpdateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
})

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>
export type UpdateCommentInput = z.infer<typeof UpdateCommentSchema>
